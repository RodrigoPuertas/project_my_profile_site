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
    const website  = (form.website?.value  || '').trim();

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
        body: JSON.stringify({ nome, email, mensagem: corpo, website }),
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
// FILTRO DE CARDS (projects + artigos)
// ============================
const filterBtns = document.querySelectorAll('[data-filter]');
const filterCards = document.querySelectorAll('[data-category]');
const isArtigosPage = window.location.pathname.endsWith('/artigos') || window.location.pathname.endsWith('/artigos.html');

if (filterBtns.length && filterCards.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      filterBtns.forEach(b => {
        b.classList.remove('text-primary');
        b.classList.add('text-on-surface/40');
      });
      btn.classList.add('text-primary');
      btn.classList.remove('text-on-surface/40');

      filterCards.forEach(card => {
        const match = filter === 'todos' || card.dataset.category === filter;
        const fullOpacity = card.classList.contains('card-em-breve') ? '0.45' : '1';
        const lowOpacity = isArtigosPage ? '0.1' : '0.2';
        card.style.opacity    = match ? fullOpacity : lowOpacity;
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
  document.body.classList.add('cursor-enhanced');
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

// ============================
// RASTRO BINARIO NO CURSOR
// ============================
(() => {
  const canUsePointer = window.matchMedia('(pointer: fine)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!canUsePointer || reduceMotion) return;

  const userConfig = window.BINARY_TRAIL_CONFIG || {};
  const config = {
    throttleMs: 16,
    minDistance: 12,
    offsetJitter: 14,
    driftX: 22,
    driftYMin: -56,
    driftYMax: -24,
    minDuration: 700,
    maxDuration: 1300,
    maxNodes: 180,
    ...userConfig,
  };

  const layer = document.createElement('div');
  layer.id = 'binary-trail-layer';
  document.body.appendChild(layer);
  const zone = document.getElementById('hero-binary-zone');

  const activeNodes = [];
  let latestPoint = null;
  let rafScheduled = false;
  let lastSpawnTime = 0;
  let lastSpawnX = null;
  let lastSpawnY = null;
  let zoneRect = null;

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function removeNode(node) {
    const idx = activeNodes.indexOf(node);
    if (idx >= 0) activeNodes.splice(idx, 1);
    if (node.parentNode) node.parentNode.removeChild(node);
  }

  function spawnBinaryChar(x, y) {
    if (activeNodes.length >= config.maxNodes) {
      removeNode(activeNodes[0]);
    }

    const el = document.createElement('span');
    const offsetX = rand(-config.offsetJitter, config.offsetJitter);
    const offsetY = rand(-config.offsetJitter, config.offsetJitter);
    const driftX = rand(-config.driftX, config.driftX);
    const driftY = rand(config.driftYMin, config.driftYMax);
    const duration = rand(config.minDuration, config.maxDuration);

    el.className = 'binary-trail-char';
    el.textContent = Math.random() < 0.5 ? '0' : '1';
    el.style.setProperty('--bt-x', `${x + offsetX}px`);
    el.style.setProperty('--bt-y', `${y + offsetY}px`);
    el.style.setProperty('--bt-dx', `${driftX}px`);
    el.style.setProperty('--bt-dy', `${driftY}px`);
    el.style.fontSize = `${rand(14, 24)}px`;
    el.style.animationDuration = `${duration.toFixed(0)}ms`;

    layer.appendChild(el);
    activeNodes.push(el);
    el.addEventListener('animationend', () => removeNode(el), { once: true });
  }

  function processPointer(now) {
    rafScheduled = false;
    if (!latestPoint || !zoneRect) return;

    const x = latestPoint.x;
    const y = latestPoint.y;
    const insideZone =
      x >= zoneRect.left &&
      x <= zoneRect.right &&
      y >= zoneRect.top &&
      y <= zoneRect.bottom;

    if (!insideZone) {
      lastSpawnX = null;
      lastSpawnY = null;
      return;
    }

    const dt = now - lastSpawnTime;
    const dx = x - (lastSpawnX ?? x);
    const dy = y - (lastSpawnY ?? y);
    const distance = Math.hypot(dx, dy);

    if (dt < config.throttleMs && distance < config.minDistance) {
      return;
    }

    const spawnCount = clamp(Math.round(distance / 24), 1, 3);

    for (let i = 1; i <= spawnCount; i += 1) {
      const t = i / spawnCount;
      const ix = (lastSpawnX ?? x) + dx * t;
      const iy = (lastSpawnY ?? y) + dy * t;
      spawnBinaryChar(ix, iy);
    }

    lastSpawnTime = now;
    lastSpawnX = x;
    lastSpawnY = y;
  }

  document.addEventListener('mousemove', (event) => {
    latestPoint = { x: event.clientX, y: event.clientY };
    if (!rafScheduled) {
      rafScheduled = true;
      requestAnimationFrame(processPointer);
    }
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    latestPoint = null;
    lastSpawnX = null;
    lastSpawnY = null;
  });

  function updateZoneRect() {
    if (!zone) {
      zoneRect = null;
      layer.style.clipPath = '';
      return;
    }

    zoneRect = zone.getBoundingClientRect();
    const top = Math.max(0, zoneRect.top);
    const right = Math.max(0, window.innerWidth - zoneRect.right);
    const bottom = Math.max(0, window.innerHeight - zoneRect.bottom);
    const left = Math.max(0, zoneRect.left);
    layer.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px)`;
  }

  updateZoneRect();
  window.addEventListener('resize', updateZoneRect, { passive: true });
  window.addEventListener('scroll', updateZoneRect, { passive: true });

  // Hook opcional para ajuste rapido da densidade sem editar a logica inteira.
  window.setBinaryTrailDensity = (mode = 'normal') => {
    if (mode === 'low') {
      config.throttleMs = 24;
      config.minDistance = 20;
      return;
    }
    if (mode === 'high') {
      config.throttleMs = 10;
      config.minDistance = 8;
      return;
    }
    config.throttleMs = 16;
    config.minDistance = 12;
  };
})();
