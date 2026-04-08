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

    if (formBtn) { formBtn.dataset.originalText = formBtn.innerHTML; formBtn.disabled = true; formBtn.textContent = 'Enviando...'; }
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
      if (formBtn) { formBtn.disabled = false; formBtn.innerHTML = formBtn.dataset.originalText || 'Enviar Mensagem'; }
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
  let prevMouseX = 0, prevMouseY = 0;
  let ringX = 0, ringY = 0;
  let ringVX = 0, ringVY = 0;
  let glowX = 0, glowY = 0;
  let idleTimer = null;
  let isHovering = false;
  let magnetTarget = null;

  const showCursor = () => document.body.classList.add('cursor-active');
  const hideCursor = () => document.body.classList.remove('cursor-active');

  document.addEventListener('mousemove', e => {
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    mouseX = e.clientX;
    mouseY = e.clientY;
    showCursor();
    clearTimeout(idleTimer);
    idleTimer = setTimeout(hideCursor, 1200);
  });

  // Click animation
  document.addEventListener('mousedown', () => {
    dot.style.transform = 'translate(-50%, -50%) scale(0.5)';
    ring.style.transition = 'width 0.15s, height 0.15s, border-color 0.15s';
    ring.style.width = '30px';
    ring.style.height = '30px';
  });
  document.addEventListener('mouseup', () => {
    dot.style.transform = 'translate(-50%, -50%) scale(1)';
    ring.style.transition = 'width 0.4s cubic-bezier(.23,1,.32,1), height 0.4s cubic-bezier(.23,1,.32,1), border-color 0.3s';
    ring.style.width = isHovering ? '64px' : '40px';
    ring.style.height = isHovering ? '64px' : '40px';
  });

  (function animateCursor() {
    // Velocity for dot stretch
    const vx = mouseX - prevMouseX;
    const vy = mouseY - prevMouseY;
    const speed = Math.sqrt(vx * vx + vy * vy);
    const angle = Math.atan2(vy, vx) * (180 / Math.PI);
    const stretch = Math.min(1 + speed * 0.04, 2.2);

    // Dot position + velocity stretch
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
    if (speed > 1.5) {
      dot.style.transform = `translate(-50%, -50%) rotate(${angle}deg) scaleX(${stretch}) scaleY(${1 / Math.sqrt(stretch)})`;
    } else {
      dot.style.transform = 'translate(-50%, -50%) scale(1)';
    }

    // Ring: spring physics
    const stiffness = 0.08;
    const damping = 0.72;
    let targetX = mouseX;
    let targetY = mouseY;

    // Magnetic snap
    if (magnetTarget) {
      const rect = magnetTarget.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.sqrt((mouseX - cx) ** 2 + (mouseY - cy) ** 2);
      if (dist < 80) {
        const pull = 0.35;
        targetX = mouseX + (cx - mouseX) * pull;
        targetY = mouseY + (cy - mouseY) * pull;
      }
    }

    ringVX += (targetX - ringX) * stiffness;
    ringVY += (targetY - ringY) * stiffness;
    ringVX *= damping;
    ringVY *= damping;
    ringX += ringVX;
    ringY += ringVY;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';

    // Glow
    glowX += (mouseX - glowX) * 0.04;
    glowY += (mouseY - glowY) * 0.04;
    glow.style.left = glowX + 'px';
    glow.style.top = glowY + 'px';

    prevMouseX += (mouseX - prevMouseX) * 0.6;
    prevMouseY += (mouseY - prevMouseY) * 0.6;

    requestAnimationFrame(animateCursor);
  })();

  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => {
      isHovering = true;
      magnetTarget = el;
      document.body.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
      isHovering = false;
      magnetTarget = null;
      document.body.classList.remove('cursor-hover');
    });
  });

  document.addEventListener('mouseleave', hideCursor);
}
