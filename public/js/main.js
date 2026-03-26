// ============================
// NAV — menu mobile
// ============================
const navToggle = document.getElementById('nav-toggle');
const mobileMenu = document.getElementById('mobile-menu');

navToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('hidden');
  mobileMenu.classList.toggle('flex');
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.add('hidden');
    mobileMenu.classList.remove('flex');
  });
});

// ============================
// FORMULÁRIO DE CONTATO
// ============================
const form = document.getElementById('contato-form');
const formBtn = document.getElementById('form-btn');
const formStatus = document.getElementById('form-status');

if (form) {
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = form.nome.value.trim();
  const email = form.email.value.trim();
  const mensagem = form.mensagem.value.trim();

  if (!nome || !email || !mensagem) {
    setStatus('Preencha todos os campos.', '#ff6e84');
    return;
  }

  formBtn.disabled = true;
  formBtn.textContent = 'Enviando...';
  setStatus('', '');

  try {
    const res = await fetch('/api/contato', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, mensagem }),
    });

    const data = await res.json();

    if (res.ok) {
      setStatus('Mensagem enviada com sucesso!', '#a3a6ff');
      form.reset();
    } else {
      setStatus(data.erro || 'Erro ao enviar. Tente novamente.', '#ff6e84');
    }
  } catch {
    setStatus('Erro de conexão. Tente novamente.', '#ff6e84');
  } finally {
    formBtn.disabled = false;
    formBtn.textContent = 'Enviar Mensagem';
  }
});
}

function setStatus(msg, color) {
  formStatus.textContent = msg;
  formStatus.style.color = color;
}
