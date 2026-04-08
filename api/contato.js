const nodemailer = require("nodemailer");

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const MAX_NAME_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 4000;
const MIN_MESSAGE_LENGTH = 10;
const RATE_LIMIT_STORE = new Map();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
}

function rateLimitExceeded(ip, now = Date.now()) {
  for (const [key, entry] of RATE_LIMIT_STORE.entries()) {
    if (now - entry.windowStart > WINDOW_MS) {
      RATE_LIMIT_STORE.delete(key);
    }
  }

  const record = RATE_LIMIT_STORE.get(ip);
  if (!record || now - record.windowStart > WINDOW_MS) {
    RATE_LIMIT_STORE.set(ip, { count: 1, windowStart: now });
    return false;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  record.count += 1;
  return false;
}

function normalizeField(value) {
  return typeof value === "string" ? value.trim() : "";
}

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.error("Configuração ausente: EMAIL_USER/EMAIL_PASS");
    return res.status(500).json({ erro: "Serviço temporariamente indisponível" });
  }

  const clientIp = getClientIp(req);
  if (rateLimitExceeded(clientIp)) {
    return res.status(429).json({ erro: "Muitas tentativas. Tente novamente em alguns minutos." });
  }

  const payload = req.body && typeof req.body === "object" ? req.body : {};
  const nome = normalizeField(payload.nome);
  const email = normalizeField(payload.email).toLowerCase();
  const mensagem = normalizeField(payload.mensagem);
  const website = normalizeField(payload.website);

  if (website) {
    return res.status(200).json({ sucesso: true });
  }

  if (!nome || !email || !mensagem) {
    return res.status(400).json({ erro: "Preencha todos os campos obrigatórios" });
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ erro: "E-mail inválido" });
  }

  if (nome.length > MAX_NAME_LENGTH) {
    return res.status(400).json({ erro: "Nome muito longo" });
  }

  if (mensagem.length < MIN_MESSAGE_LENGTH || mensagem.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ erro: "Mensagem fora do tamanho permitido" });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  try {
    await transporter.sendMail({
      from: emailUser,
      to: emailUser,
      replyTo: email,
      subject: `Contato do portfólio - ${nome}`,
      text: `Nome: ${nome}\nE-mail: ${email}\nIP: ${clientIp}\n\n${mensagem}`,
    });

    return res.status(200).json({ sucesso: true });
  } catch (err) {
    console.error("Falha ao enviar e-mail:", err);
    return res.status(500).json({ erro: "Erro ao enviar e-mail" });
  }
}

module.exports = handler;
