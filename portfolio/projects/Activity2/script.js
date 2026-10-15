/* ===== Split hero name into letters ===== */
document.querySelectorAll('[data-split]').forEach(el => {
  const text = el.textContent;
  el.textContent = '';
  [...text].forEach((ch, i) => {
    const s = document.createElement('span');
    s.className = 'char';
    s.style.setProperty('--i', i);
    s.textContent = ch === ' ' ? '\u00A0' : ch;
    el.appendChild(s);
  });
});

/* ===== Start the page after loader ===== */
let started = false;
function start() {
  if (started) return;
  started = true;
  document.getElementById('loader').classList.add('hide');
  document.body.classList.remove('loading');
  setTimeout(typeLoop, 1700);
  setTimeout(() => {
    const name = document.getElementById('heroName');
    name.classList.add('ready');
    name.querySelectorAll('.char').forEach(c => {
      c.addEventListener('mouseenter', () => c.classList.add('jelly'));
      c.addEventListener('animationend', () => c.classList.remove('jelly'));
    });
  }, 2000);
}

/* ===== Loader (1% → 100%) ===== */
const loadNum = document.getElementById('loadNum');
const loadBar = document.getElementById('loadBar');
const loadStatus = document.getElementById('loadStatus');

// Track real progress: every image + the fonts
const images = [...document.images];
const totalAssets = images.length + 1;
let loadedAssets = 0;
const assetDone = () => loadedAssets++;

images.forEach(img => {
  if (img.complete) assetDone();
  else {
    img.addEventListener('load', assetDone, { once: true });
    img.addEventListener('error', assetDone, { once: true }); // broken image won't block
  }
});
(document.fonts ? document.fonts.ready : Promise.resolve()).then(assetDone);

const MIN_TIME = 1200; // always count for at least 1.2s (looks smooth)
const MAX_TIME = 2500; // never wait more than 2.5s (even on slow internet)
const t0 = performance.now();
let shown = 1;

function loaderTick(now) {
  const elapsed = now - t0;
  const real = (loadedAssets / totalAssets) * 100;
  const timeFloor = Math.min(elapsed / MAX_TIME, 1) * 100; // forces finish by MAX_TIME
  const speedCap = Math.min(elapsed / MIN_TIME, 1) * 100;  // prevents jumping instantly
  const target = Math.min(speedCap, Math.max(real, timeFloor));

  shown += (target - shown) * 0.15;
  if (target - shown < 0.5) shown = target;

  const value = Math.max(1, Math.min(100, Math.round(shown)));
  loadNum.textContent = value;
  loadBar.style.width = value + '%';
  loadStatus.textContent =
    value < 35 ? 'Loading assets...' :
    value < 70 ? 'Preparing animations...' :
    value < 100 ? 'Almost there...' : 'Ready! 🚀';

  if (value >= 100) setTimeout(start, 300);
  else requestAnimationFrame(loaderTick);
}
requestAnimationFrame(loaderTick);

/* ===== Typing effect ===== */
const roles = ['Front-End Web Developer', 'Laravel Developer', 'UI/UX Enthusiast', 'Creative Problem Solver'];
const typed = document.getElementById('typed');
let r = 0, c = 0, deleting = false;
function typeLoop() {
  const word = roles[r];
  typed.textContent = word.slice(0, c);
  if (!deleting && c < word.length) { c++; setTimeout(typeLoop, 80); }
  else if (deleting && c > 0) { c--; setTimeout(typeLoop, 40); }
  else {
    deleting = !deleting;
    if (!deleting) r = (r + 1) % roles.length;
    setTimeout(typeLoop, deleting ? 1800 : 300);
  }
}

/* ===== Constellation background + shooting stars ===== */
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
let w, h, stars = [], meteors = [];
const mouse = { x: null, y: null };

function resize() {
  w = canvas.width = innerWidth;
  h = canvas.height = innerHeight;
  const count = Math.min(130, Math.floor((w * h) / 11000));
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * w, y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
    r: Math.random() * 1.6 + 0.3, tw: Math.random() * Math.PI * 2
  }));
}
resize();
addEventListener('resize', resize);

setInterval(() => {
  if (meteors.length < 2 && !document.hidden) {
    meteors.push({ x: w * (0.4 + Math.random() * 0.6), y: Math.random() * h * 0.3, len: 80 + Math.random() * 80, speed: 7 + Math.random() * 6, life: 1 });
  }
}, 3000);

function draw() {
  ctx.clearRect(0, 0, w, h);
  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    s.x += s.vx; s.y += s.vy; s.tw += 0.03;
    if (s.x < 0 || s.x > w) s.vx *= -1;
    if (s.y < 0 || s.y > h) s.vy *= -1;

    ctx.globalAlpha = 0.5 + Math.sin(s.tw) * 0.4;
    ctx.fillStyle = '#c7d2fe';
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();

    for (let j = i + 1; j < stars.length; j++) {
      const o = stars[j], dx = s.x - o.x, dy = s.y - o.y, d = dx * dx + dy * dy;
      if (d < 12000) {
        ctx.globalAlpha = (1 - d / 12000) * 0.25;
        ctx.strokeStyle = '#818cf8'; ctx.lineWidth = 0.6;
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(o.x, o.y); ctx.stroke();
      }
    }
    if (mouse.x !== null) {
      const dx = s.x - mouse.x, dy = s.y - mouse.y, d = dx * dx + dy * dy;
      if (d < 30000) {
        ctx.globalAlpha = (1 - d / 30000) * 0.6;
        ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        s.x -= dx * 0.004; s.y -= dy * 0.004; // gentle pull
      }
    }
  }
  meteors.forEach(m => {
    m.x -= m.speed; m.y += m.speed * 0.5; m.life -= 0.012;
    const g = ctx.createLinearGradient(m.x, m.y, m.x + m.len, m.y - m.len * 0.5);
    g.addColorStop(0, `rgba(255,255,255,${Math.max(m.life, 0)})`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.globalAlpha = 1; ctx.strokeStyle = g; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x + m.len, m.y - m.len * 0.5); ctx.stroke();
  });
  meteors = meteors.filter(m => m.life > 0);
  ctx.globalAlpha = 1;
  requestAnimationFrame(draw);
}
draw();

/* ===== Mouse: glow + avatar parallax ===== */
const glow = document.getElementById('glow');
const parallax = document.getElementById('parallax');
addEventListener('mousemove', e => {
  mouse.x = e.clientX; mouse.y = e.clientY;
  glow.style.left = e.clientX + 'px';
  glow.style.top = e.clientY + 'px';
  const px = (e.clientX / innerWidth - 0.5) * -20;
  const py = (e.clientY / innerHeight - 0.5) * -20;
  parallax.style.transform = `translate(${px}px, ${py}px)`;
});
document.addEventListener('mouseleave', () => { mouse.x = mouse.y = null; });

/* ===== Click spark burst ===== */
const colors = ['#22d3ee', '#8b5cf6', '#10b981', '#ec4899', '#3b82f6'];
addEventListener('click', e => {
  for (let i = 0; i < 10; i++) {
    const s = document.createElement('span');
    const angle = (Math.PI * 2 * i) / 10, dist = 30 + Math.random() * 40;
    s.className = 'spark';
    s.style.left = e.clientX + 'px';
    s.style.top = e.clientY + 'px';
    s.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
    s.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
    s.style.setProperty('--c', colors[i % colors.length]);
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 700);
  }
});

/* ===== Card spotlight + 3D tilt ===== */
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    card.style.setProperty('--mx', x + 'px');
    card.style.setProperty('--my', y + 'px');
    if (card.classList.contains('tilt')) {
      const rx = (y / rect.height - 0.5) * -10;
      const ry = (x / rect.width - 0.5) * 10;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    }
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

/* ===== Magnetic buttons ===== */
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.3}px, ${y * 0.4}px)`;
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

/* ===== Scroll reveal + counters ===== */
function animateCounter(el) {
  const target = +el.dataset.target, duration = 1800, startTime = performance.now();
  function tick(now) {
    const p = Math.min((now - startTime) / duration, 1);
    el.textContent = Math.floor(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('show');
    entry.target.querySelectorAll('.counter').forEach(animateCounter);
    revealObs.unobserve(entry.target);
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ===== Nav: active link, sliding indicator, scroll state ===== */
const nav = document.getElementById('nav');
const links = document.querySelectorAll('.nav-links a');
const indicator = document.querySelector('.nav-indicator');
function setActive(id) {
  links.forEach(l => {
    const on = l.getAttribute('href') === '#' + id;
    l.classList.toggle('active', on);
    if (on) { indicator.style.left = l.offsetLeft + 'px'; indicator.style.width = l.offsetWidth + 'px'; }
  });
}
setTimeout(() => setActive('home'), 300);
addEventListener('resize', () => {
  const active = document.querySelector('.nav-links a.active');
  if (active) setActive(active.getAttribute('href').slice(1));
});

const spy = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('section[id]').forEach(s => spy.observe(s));

const progress = document.getElementById('progress');
const toTop = document.getElementById('toTop');
addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = (scrollY / max) * 100 + '%';
  nav.classList.toggle('scrolled', scrollY > 40);
  toTop.classList.toggle('visible', scrollY > 500);
});

/* ===== Mobile menu ===== */
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');
menuBtn.addEventListener('click', () => {
  menuBtn.classList.toggle('open');
  navLinks.classList.toggle('open');
});
links.forEach(l => l.addEventListener('click', () => {
  menuBtn.classList.remove('open');
  navLinks.classList.remove('open');
}));

/* ===== Copy email + toast ===== */
const toast = document.getElementById('toast');
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}
document.getElementById('copyBtn').addEventListener('click', () => {
  const email = document.getElementById('emailText').textContent;
  navigator.clipboard.writeText(email)
    .then(() => showToast('✅ Email copied to clipboard!'))
    .catch(() => showToast(email));
});
