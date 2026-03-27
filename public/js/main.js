// ============================
// NAV — menu mobile
// ============================
const navToggle = document.getElementById('nav-toggle');
const mobileMenu = document.getElementById('mobile-menu');

if (navToggle && mobileMenu) {
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
}

// ============================
// FORMULÁRIO DE CONTATO (index + consult)
// ============================
const form = document.getElementById('contato-form');

if (form) {
  const formBtn  = document.getElementById('form-btn');
  const formStatus = document.getElementById('form-status');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome     = (form.nome?.value     || '').trim();
    const email    = (form.email?.value    || '').trim();
    const assunto  = (form.assunto?.value  || '').trim();
    const mensagem = (form.mensagem?.value || '').trim();

    if (!nome || !email || !mensagem) {
      setStatus('Preencha todos os campos obrigatórios.', '#ff6e84');
      return;
    }

    if (formBtn) { formBtn.disabled = true; formBtn.textContent = 'Enviando...'; }
    setStatus('', '');

    const corpo = assunto ? `[${assunto}]\n\n${mensagem}` : mensagem;

    try {
      const res = await fetch('/api/contato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, mensagem: corpo }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('Mensagem enviada com sucesso!', '#a7a5ff');
        form.reset();
      } else {
        setStatus(data.erro || 'Erro ao enviar. Tente novamente.', '#ff6e84');
      }
    } catch {
      setStatus('Erro de conexão. Tente novamente.', '#ff6e84');
    } finally {
      if (formBtn) { formBtn.disabled = false; formBtn.textContent = 'Enviar Mensagem'; }
    }
  });

  function setStatus(msg, color) {
    if (formStatus) { formStatus.textContent = msg; formStatus.style.color = color; }
  }
}

// ============================
// FILTRO DE PROJETOS (projects.html)
// ============================
const filterBtns = document.querySelectorAll('[data-filter]');
const projectCards = document.querySelectorAll('[data-category]');

if (filterBtns.length && projectCards.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      filterBtns.forEach(b => {
        b.classList.remove('text-primary');
        b.classList.add('text-on-surface/40');
      });
      btn.classList.add('text-primary');
      btn.classList.remove('text-on-surface/40');

      projectCards.forEach(card => {
        const match = filter === 'todos' || card.dataset.category === filter;
        card.style.opacity    = match ? '1' : '0.2';
        card.style.transform  = match ? 'scale(1)' : 'scale(0.97)';
        card.style.transition = 'opacity 0.3s, transform 0.3s';
      });
    });
  });
}

// ============================
// CURSOR ANIMADO
// ============================
const dot  = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
const glow = document.getElementById('cursor-glow');

if (dot && ring && glow) {
  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;
  let glowX  = 0, glowY  = 0;
  let idleTimer = null;

  const showCursor = () => document.body.classList.add('cursor-active');
  const hideCursor = () => document.body.classList.remove('cursor-active');

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
    showCursor();
    clearTimeout(idleTimer);
    idleTimer = setTimeout(hideCursor, 1200);
  });

  (function animateCursor() {
    ringX += (mouseX - ringX) * 0.1;
    ringY += (mouseY - ringY) * 0.1;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    glowX += (mouseX - glowX) * 0.05;
    glowY += (mouseY - glowY) * 0.05;
    glow.style.left = glowX + 'px';
    glow.style.top  = glowY + 'px';
    requestAnimationFrame(animateCursor);
  })();

  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  document.addEventListener('mouseleave', hideCursor);
}
