document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Active nav-link highlight on scroll ---------- */
  const links = document.querySelectorAll('.navlinks a');
  const sections = Array.from(links).map(l => document.querySelector(l.getAttribute('href')));

  function highlightNav(){
    const y = window.scrollY + 120;
    let current = sections[0];
    sections.forEach(sec => {
      if(sec && sec.offsetTop <= y) current = sec;
    });
    links.forEach(l => {
      l.style.borderBottomColor = (current && l.getAttribute('href') === '#' + current.id)
        ? '#14171A' : 'transparent';
    });
  }

  /* ---------- Mobile hamburger menu ---------- */
  const hamburger = document.getElementById('hamburgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  function closeMobileMenu(){
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', closeMobileMenu);
    });
  }

  /* ---------- Scroll reveal (fade + slide in) ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------- Animated stat counters ---------- */
  const statNums = document.querySelectorAll('.stat-num');
  function animateCount(el){
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1200;
    const start = performance.now();
    function tick(now){
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  statNums.forEach(el => statObserver.observe(el));

  /* ---------- Animated skill proficiency bars ---------- */
  const barFills = document.querySelectorAll('.bar-fill');
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const pct = entry.target.getAttribute('data-pct');
        entry.target.style.width = pct + '%';
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  barFills.forEach(el => barObserver.observe(el));

  /* ---------- Contact form -> opens mail client with prefilled message ---------- */
  const form = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('cf-name').value.trim();
      const email = document.getElementById('cf-email').value.trim();
      const message = document.getElementById('cf-message').value.trim();

      const subject = encodeURIComponent(`Portfolio contact from ${name}`);
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
      window.location.href = `mailto:hani141998@gmail.com?subject=${subject}&body=${body}`;

      formNote.textContent = 'Your email app should open now with the message ready to send.';
    });
  }

  /* ---------- Back to top button ---------- */
  const backToTop = document.getElementById('backToTop');
  function toggleBackToTop(){
    if (window.scrollY > 480) backToTop.classList.add('visible');
    else backToTop.classList.remove('visible');
  }
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Scroll listener (throttled via rAF) ---------- */
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        highlightNav();
        toggleBackToTop();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  highlightNav();
  toggleBackToTop();
});

/* =========================================================
   NEW FEATURES: theme toggle, scroll progress, marquee (CSS-only),
   confetti, GitHub live stats, filterable projects + modals,
   draggable/evolving mascots, fake terminal, command palette
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1. Dark mode toggle ---------- */
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const themeToggleMobile = document.getElementById('themeToggleMobile');
  const themeIcon = document.getElementById('themeIcon');

  function applyTheme(theme){
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      if (themeIcon) themeIcon.textContent = '☀️';
    } else {
      root.removeAttribute('data-theme');
      if (themeIcon) themeIcon.textContent = '🌙';
    }
    try { localStorage.setItem('hassan-portfolio-theme', theme); } catch (e) {}
  }

  function toggleTheme(){
    const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  try {
    const saved = localStorage.getItem('hassan-portfolio-theme');
    if (saved) applyTheme(saved);
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) applyTheme('dark');
  } catch (e) {}

  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
  if (themeToggleMobile) themeToggleMobile.addEventListener('click', toggleTheme);

  /* ---------- 2. Scroll progress bar ---------- */
  const scrollProgress = document.getElementById('scrollProgress');
  function updateScrollProgress(){
    if (!scrollProgress) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = pct + '%';
  }

  /* ---------- 3. Confetti burst ---------- */
  function burstConfetti(originX, originY){
    const canvas = document.createElement('canvas');
    canvas.className = 'confetti-canvas';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const colors = ['#FFC736', '#3556FF', '#FF4338', '#17B978'];
    const particles = Array.from({ length: 90 }, () => ({
      x: originX, y: originY,
      vx: (Math.random() - 0.5) * 12,
      vy: Math.random() * -12 - 4,
      size: Math.random() * 7 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 12,
      gravity: 0.35 + Math.random() * 0.15,
    }));
    let frame = 0;
    function tick(){
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach(p => {
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        if (p.y < canvas.height + 30) alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });
      if (alive && frame < 160) {
        requestAnimationFrame(tick);
      } else {
        canvas.remove();
      }
    }
    tick();
  }

  document.querySelectorAll('.confetti-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      burstConfetti(e.clientX, e.clientY);
    });
  });

  /* ---------- 4. Live GitHub stats + heatmap ---------- */
  const ghRepos = document.getElementById('ghRepos');
  const ghFollowers = document.getElementById('ghFollowers');
  const ghStars = document.getElementById('ghStars');
  const ghNote = document.getElementById('githubLiveNote');

  async function loadGithubStats(){
    if (!ghRepos) return;
    try {
      const userRes = await fetch('https://api.github.com/users/Hassan141998');
      if (!userRes.ok) throw new Error('rate limited');
      const user = await userRes.json();
      ghRepos.textContent = user.public_repos ?? '—';
      ghFollowers.textContent = user.followers ?? '—';

      const reposRes = await fetch('https://api.github.com/users/Hassan141998/repos?per_page=100');
      if (!reposRes.ok) throw new Error('rate limited');
      const repos = await reposRes.json();
      const totalStars = Array.isArray(repos)
        ? repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0)
        : 0;
      ghStars.textContent = totalStars;
      ghNote.textContent = 'live';
    } catch (err) {
      ghNote.textContent = 'unavailable right now';
      [ghRepos, ghFollowers, ghStars].forEach(el => { if (el) el.textContent = '—'; });
    }
  }
  loadGithubStats();

  /* ---------- 5. Filterable projects + case-study modals ---------- */
  const PROJECTS = [
    {
      id: 'insurecalc', tags: ['ml', 'web'], bar: 'bar-yellow',
      domain: 'FINTECH · INSURANCE', metric: 'R² 99.3%',
      title: 'InsureCalc', short: 'Medical insurance cost predictor — 4 ML models, animated regional cost maps, savings estimator.',
      long: 'InsureCalc predicts medical insurance costs using four different regression models trained on demographic and lifestyle data, picking the best performer by R². The front-end visualizes cost drivers across US regions on an animated map, and includes a "what if" savings estimator that shows how quitting smoking, losing weight, or switching regions would change a premium estimate in real time.',
      techs: ['Next.js', 'FastAPI', 'Python', 'scikit-learn'],
      live: 'https://insurecalc-app.vercel.app',
      code: 'https://github.com/Hassan141998/InsureCalc-Medical-Insurance-Cost-Predictor'
    },
    {
      id: 'cardioscan', tags: ['ml', 'web'], bar: 'bar-red',
      domain: 'HEALTHCARE · CARDIOLOGY', metric: 'AUC ~94%',
      title: 'CardioScan', short: 'Heart attack risk prediction — XGBoost + RF + KNN ensemble, live ECG hero, what-if simulator.',
      long: "CardioScan combines an XGBoost, Random Forest, and KNN ensemble to estimate heart attack risk from clinical inputs (age, cholesterol, blood pressure, ECG results, etc.). The landing page features a live animated ECG waveform, and a risk simulator lets users adjust individual factors to see how their predicted risk shifts, aimed at making the model's reasoning legible rather than a black box.",
      techs: ['Next.js', 'XGBoost', 'Random Forest', 'KNN'],
      live: 'https://cardio-heart.vercel.app',
      code: 'https://github.com/Hassan141998/CardioScan-Heart-Attack-Risk-Prediction'
    },
    {
      id: 'glucoseguard', tags: ['ml', 'web'], bar: 'bar-blue',
      domain: 'HEALTHCARE · DIABETES', metric: 'AUC ~83%',
      title: 'GlucoseGuard', short: 'Diabetes risk classification — 3-model ensemble, SHAP-style explainability, PDF reports.',
      long: 'GlucoseGuard classifies diabetes risk using a three-model ensemble (Random Forest, Logistic Regression, SVM) trained on the Pima Indians Diabetes dataset. It surfaces SHAP-style feature explanations so users can see which inputs pushed their risk up or down, and can generate a downloadable PDF summary report of the assessment.',
      techs: ['Next.js', 'scikit-learn', 'SHAP'],
      live: 'https://glucose-guard.vercel.app',
      code: 'https://github.com/Hassan141998/GlucoseGuard-Diabetes-Risk-Classification'
    },
    {
      id: 'chinook', tags: ['data'], bar: 'bar-green',
      domain: 'DATA ANALYTICS · SQL', metric: '7 dashboards',
      title: 'Chinook Analytics', short: 'End-to-end SQL BI dashboard: revenue, markets, RFM segments, forecasting.',
      long: 'A business-intelligence project built entirely on SQL over the Chinook sample music-store database. Covers seven dashboard views: revenue trends, top markets, customer RFM (recency/frequency/monetary) segmentation, genre performance, and a simple forecasting layer — the kind of analysis a small e-commerce or media business would actually want from its own sales data.',
      techs: ['SQL', 'Python', 'Pandas'],
      live: null,
      code: 'https://github.com/Hassan141998'
    },
    {
      id: 'sems', tags: ['iot', 'web'], bar: 'bar-yellow',
      domain: 'IOT · ENERGY', metric: 'MAPE 7.4%',
      title: 'SEMS — Smart Energy Management', short: 'Final-year project: ESP32 + MQTT TLS 1.3, ARIMA forecasting, anomaly detection, LoRaWAN.',
      long: "My final-year project: a smart energy management system built around ESP32 hardware reporting over MQTT with TLS 1.3 encryption. An ARIMA model forecasts household energy usage seven days out, flags anomalous consumption spikes, and the whole system is designed to fail gracefully over LoRaWAN for rural, off-grid deployments where connectivity isn't guaranteed.",
      techs: ['Flask', 'AWS IoT', 'ARIMA', 'MQTT', 'LoRaWAN'],
      live: 'https://io-t-based-smart-energy-management.vercel.app',
      code: 'https://github.com/Hassan141998/IoT-Based-Smart-Energy-Management-System-SEMS-'
    },
    {
      id: 'facerecog', tags: ['vision', 'web'], bar: 'bar-red',
      domain: 'COMPUTER VISION', metric: 'Real-time',
      title: 'Face Recognition Attendance', short: 'Real-time detection & recognition via Face-API.js — student profiles, analytics, CSV export.',
      long: 'A real-time attendance system using Face-API.js for in-browser face detection and recognition — no server-side GPU needed. Includes student profile management, attendance analytics dashboards, and CSV export for integration with existing school record-keeping.',
      techs: ['Flask', 'PostgreSQL', 'Face-API.js', 'JavaScript'],
      live: 'https://student-attendance-face-recognition.vercel.app',
      code: 'https://github.com/Hassan141998/student-attendance-face-recognition-system-antigra'
    },
  ];

  const projectGrid = document.getElementById('projectGrid');
  const filterRow = document.getElementById('filterRow');
  const modalOverlay = document.getElementById('projectModalOverlay');
  const modalContent = document.getElementById('modalContent');
  const modalCloseBtn = document.getElementById('modalCloseBtn');

  function renderProjects(){
    if (!projectGrid) return;
    projectGrid.innerHTML = PROJECTS.map(p => `
      <article class="proj-card" data-id="${p.id}" data-tags="${p.tags.join(' ')}">
        <div class="proj-top ${p.bar}"><span class="mono">${p.domain}</span><span class="mono metric">${p.metric}</span></div>
        <div class="proj-body">
          <h3>${p.title}</h3>
          <p>${p.short}</p>
          <div class="proj-tags mono">${p.techs.slice(0, 3).map(t => `<span>${t}</span>`).join('')}</div>
          <div class="proj-links">
            ${p.live ? `<a href="${p.live}" target="_blank" class="btn btn-xs btn-outline" onclick="event.stopPropagation()">Live ↗</a>` : ''}
            <a href="${p.code}" target="_blank" class="btn btn-xs btn-outline" onclick="event.stopPropagation()">Code ↗</a>
          </div>
        </div>
      </article>
    `).join('');

    projectGrid.querySelectorAll('.proj-card').forEach(card => {
      card.addEventListener('click', () => openModal(card.getAttribute('data-id')));
      card.style.cursor = 'pointer';
    });
  }
  renderProjects();

  if (filterRow) {
    filterRow.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      filterRow.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      projectGrid.querySelectorAll('.proj-card').forEach(card => {
        const tags = (card.getAttribute('data-tags') || '').split(' ');
        const show = filter === 'all' || tags.includes(filter);
        card.classList.toggle('hidden', !show);
      });
    });
  }

  function openModal(id){
    const p = PROJECTS.find(proj => proj.id === id);
    if (!p || !modalContent) return;
    modalContent.innerHTML = `
      <span class="modal-tag mono">${p.domain}</span>
      <h2>${p.title}</h2>
      <span class="modal-metric mono">${p.metric}</span>
      <p class="modal-desc">${p.long}</p>
      <div class="modal-tags">${p.techs.map(t => `<span>${t}</span>`).join('')}</div>
      <div class="modal-links">
        ${p.live ? `<a href="${p.live}" target="_blank" class="btn btn-lg btn-yellow">Live demo ↗</a>` : ''}
        <a href="${p.code}" target="_blank" class="btn btn-lg btn-outline">View code ↗</a>
      </div>
    `;
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  /* ---------- 6. Mascots: full-screen autonomous wandering + cursor pull + drag + evolve ---------- */
  const mascotLayer = document.getElementById('mascotLayer');
  if (mascotLayer) {
    const wraps = Array.from(mascotLayer.querySelectorAll('.mascot-wrap'));
    const clickCounts = {};
    const EVOLVE_THRESHOLD = 5;
    const MASCOT_SIZE = 64;
    const CURSOR_INFLUENCE = 220;   // px radius where cursor affects wandering
    const CURSOR_PULL = 0.06;       // how strongly cursor bends the wander path
    const WANDER_SPEED = 0.55;      // px/frame max cruise speed
    const EDGE_MARGIN = 40;

    let mouseX = -9999, mouseY = -9999;
    let mouseActive = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX; mouseY = e.clientY; mouseActive = true;
    }, { passive: true });
    window.addEventListener('mouseleave', () => { mouseActive = false; });

    // Restore evolved (crown-unlocked) mascots from previous visits.
    try {
      const saved = JSON.parse(localStorage.getItem('hassan-portfolio-evolved') || '{}');
      wraps.forEach((wrap, i) => {
        if (saved[i]) wrap.querySelector('.achievement-badge').classList.add('unlocked');
      });
    } catch (e) {}

    const mascots = wraps.map((wrap, i) => {
      const startX = (window.innerWidth || 800) * (0.15 + 0.22 * i) + Math.random() * 40;
      const startY = 140 + Math.random() * 160;
      return {
        wrap,
        el: wrap.querySelector('.mascot'),
        x: startX, y: startY,
        vx: (Math.random() - 0.5) * WANDER_SPEED,
        vy: (Math.random() - 0.5) * WANDER_SPEED,
        targetX: startX, targetY: startY,
        isDragging: false,
        dragOffsetX: 0, dragOffsetY: 0,
        nextTargetAt: 0,
      };
    });

    function pickNewTarget(m){
      const w = window.innerWidth || 1200;
      const h = window.innerHeight || 800;
      m.targetX = EDGE_MARGIN + Math.random() * Math.max(1, w - EDGE_MARGIN * 2 - MASCOT_SIZE);
      m.targetY = EDGE_MARGIN + Math.random() * Math.max(1, h - EDGE_MARGIN * 2 - MASCOT_SIZE);
      m.nextTargetAt = performance.now() + 3500 + Math.random() * 4500;
    }
    mascots.forEach(pickNewTarget);

    function tick(now){
      mascots.forEach(m => {
        if (m.isDragging) return;

        if (now > m.nextTargetAt) pickNewTarget(m);

        // Steer gently toward the current wander target.
        const dtx = m.targetX - m.x;
        const dty = m.targetY - m.y;
        const dTarget = Math.sqrt(dtx * dtx + dty * dty) || 1;
        m.vx += (dtx / dTarget) * 0.025;
        m.vy += (dty / dTarget) * 0.025;

        // Cursor influence: gently bend the path toward the cursor when nearby.
        if (mouseActive) {
          const cx = m.x + MASCOT_SIZE / 2;
          const cy = m.y + MASCOT_SIZE / 2;
          const dx = mouseX - cx;
          const dy = mouseY - cy;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < CURSOR_INFLUENCE) {
            const pull = (1 - dist / CURSOR_INFLUENCE) * CURSOR_PULL;
            m.vx += (dx / dist) * pull * 10;
            m.vy += (dy / dist) * pull * 10;
          }
        }

        // Clamp speed for a calm, floaty cruise.
        const speed = Math.sqrt(m.vx * m.vx + m.vy * m.vy);
        const maxSpeed = WANDER_SPEED * 1.8;
        if (speed > maxSpeed) {
          m.vx = (m.vx / speed) * maxSpeed;
          m.vy = (m.vy / speed) * maxSpeed;
        }
        m.vx *= 0.98;
        m.vy *= 0.98;

        m.x += m.vx;
        m.y += m.vy;

        // Bounce softly off viewport edges.
        const w = window.innerWidth || 1200;
        const h = window.innerHeight || 800;
        if (m.x < EDGE_MARGIN) { m.x = EDGE_MARGIN; m.vx *= -0.6; }
        if (m.x > w - EDGE_MARGIN - MASCOT_SIZE) { m.x = w - EDGE_MARGIN - MASCOT_SIZE; m.vx *= -0.6; }
        if (m.y < EDGE_MARGIN) { m.y = EDGE_MARGIN; m.vy *= -0.6; }
        if (m.y > h - EDGE_MARGIN - MASCOT_SIZE) { m.y = h - EDGE_MARGIN - MASCOT_SIZE; m.vy *= -0.6; }

        m.wrap.style.transform = `translate(${m.x}px, ${m.y}px)`;
      });
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    // Pick a random bubble message, avoiding an immediate repeat.
    function showBubble(wrap, overrideText){
      const bubbleSpan = wrap.querySelector('.mascot-bubble span');
      let next = overrideText;
      if (!next) {
        const msgs = (wrap.getAttribute('data-msgs') || '').split('|').filter(Boolean);
        if (!msgs.length) return;
        next = msgs[Math.floor(Math.random() * msgs.length)];
        if (msgs.length > 1 && next === wrap.dataset.lastMsg) {
          next = msgs[(msgs.indexOf(next) + 1) % msgs.length];
        }
        wrap.dataset.lastMsg = next;
      }
      bubbleSpan.textContent = next;
      wrap.classList.add('bubble-show');
    }
    function hideBubble(wrap){ wrap.classList.remove('bubble-show'); }

    mascots.forEach((m, i) => {
      const { wrap, el } = m;

      wrap.addEventListener('mouseenter', () => showBubble(wrap));
      wrap.addEventListener('mouseleave', () => hideBubble(wrap));

      function onPointerDown(e){
        m.isDragging = true;
        wrap.classList.add('being-dragged');
        el.classList.add('dragging');
        const point = e.touches ? e.touches[0] : e;
        m.dragOffsetX = point.clientX - m.x;
        m.dragOffsetY = point.clientY - m.y;
      }
      function onPointerMove(e){
        if (!m.isDragging) return;
        const point = e.touches ? e.touches[0] : e;
        m.x = point.clientX - m.dragOffsetX;
        m.y = point.clientY - m.dragOffsetY;
        wrap.style.transform = `translate(${m.x}px, ${m.y}px)`;
      }
      function onPointerUp(){
        if (!m.isDragging) return;
        m.isDragging = false;
        el.classList.remove('dragging');
        wrap.classList.remove('being-dragged');
        m.vx = (Math.random() - 0.5) * WANDER_SPEED;
        m.vy = (Math.random() - 0.5) * WANDER_SPEED;
        pickNewTarget(m);

        clickCounts[i] = (clickCounts[i] || 0) + 1;
        if (clickCounts[i] === EVOLVE_THRESHOLD) {
          wrap.querySelector('.achievement-badge').classList.add('unlocked');
          showBubble(wrap, '🏆 You found my secret!');
          setTimeout(() => hideBubble(wrap), 2200);
          try {
            const saved = JSON.parse(localStorage.getItem('hassan-portfolio-evolved') || '{}');
            saved[i] = true;
            localStorage.setItem('hassan-portfolio-evolved', JSON.stringify(saved));
          } catch (err) {}
        }
      }

      wrap.addEventListener('mousedown', onPointerDown);
      window.addEventListener('mousemove', onPointerMove);
      window.addEventListener('mouseup', onPointerUp);
      wrap.addEventListener('touchstart', (e) => { onPointerDown(e); showBubble(wrap); }, { passive: true });
      window.addEventListener('touchmove', onPointerMove, { passive: true });
      window.addEventListener('touchend', onPointerUp);
    });
  }

  /* ---------- 7. Fake interactive terminal ---------- */
  const terminalForm = document.getElementById('terminalForm');
  const terminalInput = document.getElementById('terminalInput');
  const terminalBody = document.getElementById('terminalBody');

  const TERMINAL_COMMANDS = {
    help: "available: help, whoami, skills, projects, contact, resume, sudo hire-me, clear",
    whoami: "hassan_ahmed — Full Stack Developer & AI/ML Engineer",
    skills: "Python · TypeScript · Next.js · React · FastAPI · Flask · scikit-learn · XGBoost · PostgreSQL",
    projects: "InsureCalc, CardioScan, GlucoseGuard, SEMS, Chinook Analytics, Face Recognition Attendance — scroll down ↓",
    contact: "hani141998@gmail.com — or scroll to the Contact section",
    resume: "opening resume.pdf...",
    'sudo hire-me': "Permission granted. 🚀 Redirecting to contact form...",
    clear: "__CLEAR__",
  };

  function appendTerminalLine(command, output){
    const cmdP = document.createElement('p');
    cmdP.className = 'cmd-echo';
    cmdP.innerHTML = `<span class="prompt">$</span> ${command}`;
    terminalBody.appendChild(cmdP);

    if (output) {
      const outP = document.createElement('p');
      outP.className = 'out';
      outP.textContent = output;
      terminalBody.appendChild(outP);
    }
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  if (terminalForm) {
    terminalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const raw = terminalInput.value.trim();
      if (!raw) return;
      const key = raw.toLowerCase();

      if (key === 'clear') {
        terminalBody.innerHTML = '';
      } else if (TERMINAL_COMMANDS[key]) {
        appendTerminalLine(raw, TERMINAL_COMMANDS[key]);
        if (key === 'resume') {
          setTimeout(() => { window.location.href = 'resume.pdf'; }, 400);
        }
        if (key === 'sudo hire-me') {
          setTimeout(() => {
            document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
          }, 500);
        }
      } else {
        appendTerminalLine(raw, `command not found: ${raw} (try 'help')`);
      }
      terminalInput.value = '';
    });
  }

  /* ---------- 8. Command palette (Ctrl/Cmd + K) ---------- */
  const cmdkOverlay = document.getElementById('cmdkOverlay');
  const cmdkInput = document.getElementById('cmdkInput');
  const cmdkList = document.getElementById('cmdkList');
  const cmdkTrigger = document.getElementById('cmdkTrigger');

  const COMMANDS = [
    { label: 'Go to About', hint: 'section', action: () => scrollToSection('about') },
    { label: 'Go to Skills', hint: 'section', action: () => scrollToSection('skills') },
    { label: 'Go to Experience', hint: 'section', action: () => scrollToSection('experience') },
    { label: 'Go to Projects', hint: 'section', action: () => scrollToSection('projects') },
    { label: 'Go to Education', hint: 'section', action: () => scrollToSection('education') },
    { label: 'Go to Certifications', hint: 'section', action: () => scrollToSection('certifications') },
    { label: 'Go to Contact', hint: 'section', action: () => scrollToSection('contact') },
    { label: 'Toggle dark mode', hint: 'theme', action: () => toggleTheme() },
    { label: 'Copy email address', hint: 'hani141998@gmail.com', action: () => {
        navigator.clipboard?.writeText('hani141998@gmail.com').catch(() => {});
      } },
    { label: 'Open GitHub', hint: '↗', action: () => window.open('https://github.com/Hassan141998', '_blank') },
    { label: 'Open LinkedIn', hint: '↗', action: () => window.open('https://www.linkedin.com/in/hassan-ahmed-98304030a/', '_blank') },
    { label: 'Download resume', hint: 'PDF', action: () => { window.location.href = 'resume.pdf'; } },
    { label: 'Back to top', hint: '↑', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
  ];

  function scrollToSection(id){
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  let activeIndex = 0;
  function renderCmdkList(filter){
    const q = (filter || '').toLowerCase();
    const filtered = COMMANDS.filter(c => c.label.toLowerCase().includes(q));
    activeIndex = 0;
    if (!filtered.length) {
      cmdkList.innerHTML = '<div class="cmdk-empty">No matching commands.</div>';
      return;
    }
    cmdkList.innerHTML = filtered.map((c, i) => `
      <div class="cmdk-item${i === 0 ? ' active' : ''}" data-index="${i}">
        <span>${c.label}</span><span class="cmdk-item-hint mono">${c.hint}</span>
      </div>
    `).join('');
    cmdkList.querySelectorAll('.cmdk-item').forEach(item => {
      item.addEventListener('click', () => {
        filtered[parseInt(item.getAttribute('data-index'), 10)].action();
        closeCmdk();
      });
    });
    cmdkList.dataset.currentFiltered = JSON.stringify(filtered.map(c => c.label));
  }

  function openCmdk(){
    cmdkOverlay.classList.add('open');
    cmdkInput.value = '';
    renderCmdkList('');
    setTimeout(() => cmdkInput.focus(), 30);
  }
  function closeCmdk(){
    cmdkOverlay.classList.remove('open');
  }

  if (cmdkTrigger) cmdkTrigger.addEventListener('click', openCmdk);
  if (cmdkInput) cmdkInput.addEventListener('input', () => renderCmdkList(cmdkInput.value));
  if (cmdkOverlay) {
    cmdkOverlay.addEventListener('click', (e) => {
      if (e.target === cmdkOverlay) closeCmdk();
    });
  }

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      cmdkOverlay.classList.contains('open') ? closeCmdk() : openCmdk();
    }
    if (e.key === 'Escape') {
      if (cmdkOverlay.classList.contains('open')) closeCmdk();
      if (modalOverlay && modalOverlay.classList.contains('open')) closeModal();
    }
    if (cmdkOverlay.classList.contains('open') && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      const items = Array.from(cmdkList.querySelectorAll('.cmdk-item'));
      if (!items.length) return;
      items[activeIndex]?.classList.remove('active');
      activeIndex = e.key === 'ArrowDown'
        ? (activeIndex + 1) % items.length
        : (activeIndex - 1 + items.length) % items.length;
      items[activeIndex]?.classList.add('active');
      items[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }
    if (cmdkOverlay.classList.contains('open') && e.key === 'Enter') {
      const active = cmdkList.querySelector('.cmdk-item.active');
      if (active) active.click();
    }
  });

  /* ---------- Combined scroll listener ---------- */
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();
});

/* =========================================================
   LANGUAGE SWITCHER (English / French / Turkish)
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {

  const GH_LINK = '<a href="https://github.com/Hassan141998" target="_blank" class="inline-link">github.com/Hassan141998</a>';

  const TRANSLATIONS = {
    en: {
      'nav.about': 'about', 'nav.skills': 'skills', 'nav.experience': 'experience',
      'nav.projects': 'projects', 'nav.education': 'education', 'nav.certifications': 'certifications',
      'nav.contact': 'contact', 'nav.cv': 'CV ↓', 'nav.hire': 'Hire me →',
      'mobile.theme': 'Toggle dark mode 🌙', 'mobile.cv': 'Download CV ↓',
      'hero.status': 'STATUS: ONLINE', 'hero.cursorhint': 'MASCOTS ARE ROAMING — TRY DRAGGING ONE ↑',
      'hero.kicker': '// FULL STACK & AI/ML ENGINEER',
      'hero.role1': 'FULL STACK DEVELOPER', 'hero.role2': 'AI / ML ENGINEER', 'hero.role3': 'BACKEND & DATA SYSTEMS',
      'hero.ctaProjects': 'View Projects →', 'hero.ctaContact': 'Get in Touch', 'hero.ctaCv': 'Download CV ↓',
      'hero.scroll': 'SCROLL ↓',
      'stats.projects': 'PROJECTS SHIPPED', 'stats.tech': 'TECHNOLOGIES USED',
      'stats.models': 'ML MODELS DEPLOYED', 'stats.opensource': 'OPEN SOURCE',
      'about.eyebrow': '01 // ABOUT', 'about.heading': 'Who I am.',
      'about.terminalHint': "type 'help' and hit enter ↓", 'about.terminalPh': 'type a command...',
      'about.p1': "I'm a Full Stack Developer & AI/ML Engineer finishing my BSCS at the Islamia University of Bahawalpur. Most of what I build starts as a dataset and ends as a deployed app — turning a model out of a notebook into something a real person can actually use.",
      'about.p2': 'Comfortable end to end: FastAPI and Flask on the backend, Next.js and React on the front, scikit-learn and XGBoost in between.',
      'gh.live': '🔴 LIVE FROM GITHUB', 'gh.repos': 'PUBLIC REPOS', 'gh.followers': 'FOLLOWERS', 'gh.stars': 'TOTAL STARS',
      'skills.eyebrow': '02 // SKILLS', 'skills.heading': 'What I build with.',
      'skills.cat1': 'Languages', 'skills.cat2': 'Frontend', 'skills.cat3': 'Backend & ML/AI', 'skills.cat4': 'Database & Cloud',
      'skills.proficiency': 'Proficiency',
      'exp.eyebrow': '03 // JOURNEY', 'exp.heading': 'How I got here.',
      'exp.item1.title': 'Started BSCS',
      'exp.item1.desc': 'Began Computer Science at the Islamia University of Bahawalpur — first lines of Python, first "Hello World."',
      'exp.item2.title': 'Went full stack',
      'exp.item2.desc': 'Picked up Next.js, React, and FastAPI — started shipping real projects instead of just coursework: attendance systems, management dashboards, and early ML experiments.',
      'exp.item3.title': 'Focused on applied ML',
      'exp.item3.desc': 'Built and deployed InsureCalc, CardioScan, and GlucoseGuard — turning trained models into real, usable products with full front-ends.',
      'exp.item4.title': 'SEMS — final year project',
      'exp.item4.desc': 'Designed and built a smart energy management system: IoT hardware, MQTT, ARIMA forecasting, and cloud dashboards, end to end.',
      'exp.item5.title': 'Open to work',
      'exp.item5.desc': 'Finishing my degree and taking on freelance & full-time roles in full stack development and applied ML.',
      'proj.eyebrow': '04 // PROJECTS', 'proj.heading': 'Featured work.',
      'proj.sub': `Pulled straight from ${GH_LINK} — click a card for details.`,
      'filter.all': 'All', 'filter.ml': 'ML / AI', 'filter.web': 'Web', 'filter.iot': 'IoT',
      'filter.vision': 'Computer Vision', 'filter.data': 'Data', 'proj.more': 'More on GitHub',
      'edu.eyebrow': '05 // EDUCATION', 'edu.heading': 'Background.',
      'edu.degree': 'BSCS — Bachelor of Science in Computer Science', 'edu.institution': 'Islamia University of Bahawalpur',
      'cert.eyebrow': '06 // CERTIFICATIONS', 'cert.heading': 'Verified credentials.',
      'cert1.title': 'Introduction to Data Science',
      'cert1.skill1': 'Explained the promises and challenges of data analytics',
      'cert1.skill2': 'Explained the role of data in AI and Machine Learning',
      'cert1.skill3': 'Explored career paths in data analytics',
      'cert1.link': 'View certificate ↗',
      'cert2.title': 'Diploma in SQL: Beginner to Advanced',
      'cert2.skill1': 'Database fundamentals & query optimization',
      'cert2.skill2': 'Joins, subqueries, stored procedures & triggers',
      'cert2.skill3': 'Database design & performance tuning',
      'contact.eyebrow': '07 // CONTACT', 'contact.heading': "Let's build something.",
      'contact.sub': 'Open to freelance work and full-time roles in full stack or applied ML.',
      'form.name': 'Name', 'form.namePh': 'Your name',
      'form.email': 'Email', 'form.emailPh': 'you@example.com',
      'form.message': 'Message', 'form.messagePh': 'What are you building?',
      'form.send': 'Send Message →', 'form.note': 'Opens your email app with this message pre-filled.',
      'contact.location': '📍 Sadiqabad, Pakistan',
      'footer.copy': '© 2026 Hassan Ahmed', 'footer.built': 'Built with HTML, CSS & JS',
    },
    fr: {
      'nav.about': 'à propos', 'nav.skills': 'compétences', 'nav.experience': 'expérience',
      'nav.projects': 'projets', 'nav.education': 'formation', 'nav.certifications': 'certifications',
      'nav.contact': 'contact', 'nav.cv': 'CV ↓', 'nav.hire': 'Engagez-moi →',
      'mobile.theme': 'Basculer le mode sombre 🌙', 'mobile.cv': 'Télécharger le CV ↓',
      'hero.status': 'STATUT : EN LIGNE', 'hero.cursorhint': 'LES MASCOTTES SE PROMÈNENT — ESSAYEZ D\'EN GLISSER UNE ↑',
      'hero.kicker': '// DÉVELOPPEUR FULL STACK & INGÉNIEUR IA/ML',
      'hero.role1': 'DÉVELOPPEUR FULL STACK', 'hero.role2': 'INGÉNIEUR IA / ML', 'hero.role3': 'BACKEND & SYSTÈMES DE DONNÉES',
      'hero.ctaProjects': 'Voir les projets →', 'hero.ctaContact': 'Me contacter', 'hero.ctaCv': 'Télécharger le CV ↓',
      'hero.scroll': 'DÉFILER ↓',
      'stats.projects': 'PROJETS LIVRÉS', 'stats.tech': 'TECHNOLOGIES UTILISÉES',
      'stats.models': 'MODÈLES IA DÉPLOYÉS', 'stats.opensource': 'OPEN SOURCE',
      'about.eyebrow': '01 // À PROPOS', 'about.heading': 'Qui je suis.',
      'about.terminalHint': "tapez 'help' et appuyez sur entrée ↓", 'about.terminalPh': 'tapez une commande...',
      'about.p1': "Je suis développeur Full Stack et ingénieur IA/ML, en fin de licence BSCS à l'Islamia University of Bahawalpur. La plupart de mes projets partent d'un jeu de données et aboutissent à une application déployée — transformer un modèle sorti d'un notebook en quelque chose qu'une vraie personne peut utiliser.",
      'about.p2': "À l'aise sur toute la chaîne : FastAPI et Flask côté backend, Next.js et React côté frontend, scikit-learn et XGBoost entre les deux.",
      'gh.live': '🔴 EN DIRECT DE GITHUB', 'gh.repos': 'DÉPÔTS PUBLICS', 'gh.followers': 'ABONNÉS', 'gh.stars': 'ÉTOILES TOTALES',
      'skills.eyebrow': '02 // COMPÉTENCES', 'skills.heading': 'Avec quoi je construis.',
      'skills.cat1': 'Langages', 'skills.cat2': 'Frontend', 'skills.cat3': 'Backend & IA/ML', 'skills.cat4': 'Base de données & Cloud',
      'skills.proficiency': 'Niveau de maîtrise',
      'exp.eyebrow': '03 // PARCOURS', 'exp.heading': "Comment j'en suis arrivé là.",
      'exp.item1.title': 'Début du BSCS',
      'exp.item1.desc': "Débuts en informatique à l'Islamia University of Bahawalpur — premières lignes de Python, premier « Hello World ».",
      'exp.item2.title': 'Passage au full stack',
      'exp.item2.desc': "Adoption de Next.js, React et FastAPI — début de la livraison de vrais projets au-delà des cours : systèmes de présence, tableaux de bord de gestion, premières expériences en ML.",
      'exp.item3.title': 'Focus sur le ML appliqué',
      'exp.item3.desc': "Conception et déploiement d'InsureCalc, CardioScan et GlucoseGuard — transformer des modèles entraînés en produits réels et utilisables, avec une interface complète.",
      'exp.item4.title': "SEMS — projet de fin d'études",
      'exp.item4.desc': "Conception et réalisation d'un système intelligent de gestion de l'énergie : matériel IoT, MQTT, prévisions ARIMA et tableaux de bord cloud, de bout en bout.",
      'exp.item5.title': 'Ouvert aux opportunités',
      'exp.item5.desc': "Fin de mes études tout en acceptant des missions freelance et des postes à temps plein en développement full stack et en ML appliqué.",
      'proj.eyebrow': '04 // PROJETS', 'proj.heading': 'Travaux phares.',
      'proj.sub': `Directement tirés de ${GH_LINK} — cliquez sur une carte pour voir les détails.`,
      'filter.all': 'Tous', 'filter.ml': 'ML / IA', 'filter.web': 'Web', 'filter.iot': 'IoT',
      'filter.vision': 'Vision par ordinateur', 'filter.data': 'Données', 'proj.more': 'Plus sur GitHub',
      'edu.eyebrow': '05 // FORMATION', 'edu.heading': 'Parcours académique.',
      'edu.degree': 'BSCS — Licence en informatique', 'edu.institution': 'Islamia University of Bahawalpur',
      'cert.eyebrow': '06 // CERTIFICATIONS', 'cert.heading': 'Certifications vérifiées.',
      'cert1.title': 'Introduction à la Data Science',
      'cert1.skill1': "Explication des promesses et défis de l'analyse de données",
      'cert1.skill2': 'Explication du rôle des données en IA et Machine Learning',
      'cert1.skill3': 'Exploration des parcours de carrière en analyse de données',
      'cert1.link': 'Voir le certificat ↗',
      'cert2.title': 'Diplôme en SQL : du niveau débutant à avancé',
      'cert2.skill1': "Fondamentaux des bases de données & optimisation des requêtes",
      'cert2.skill2': 'Jointures, sous-requêtes, procédures stockées & déclencheurs',
      'cert2.skill3': 'Conception de bases de données & optimisation des performances',
      'contact.eyebrow': '07 // CONTACT', 'contact.heading': 'Construisons quelque chose.',
      'contact.sub': 'Ouvert aux missions freelance et aux postes à temps plein, en full stack ou en ML appliqué.',
      'form.name': 'Nom', 'form.namePh': 'Votre nom',
      'form.email': 'E-mail', 'form.emailPh': 'vous@exemple.com',
      'form.message': 'Message', 'form.messagePh': 'Que construisez-vous ?',
      'form.send': 'Envoyer le message →', 'form.note': 'Ouvre votre messagerie avec ce message pré-rempli.',
      'contact.location': '📍 Sadiqabad, Pakistan',
      'footer.copy': '© 2026 Hassan Ahmed', 'footer.built': 'Créé avec HTML, CSS & JS',
    },
    tr: {
      'nav.about': 'hakkımda', 'nav.skills': 'yetenekler', 'nav.experience': 'deneyim',
      'nav.projects': 'projeler', 'nav.education': 'eğitim', 'nav.certifications': 'sertifikalar',
      'nav.contact': 'i̇letişim', 'nav.cv': 'CV ↓', 'nav.hire': 'Beni işe al →',
      'mobile.theme': 'Karanlık modu aç/kapat 🌙', 'mobile.cv': 'CV İndir ↓',
      'hero.status': 'DURUM: ÇEVRİMİÇİ', 'hero.cursorhint': 'MASKOTLAR DOLAŞIYOR — BİRİNİ SÜRÜKLEMEYİ DENE ↑',
      'hero.kicker': '// FULL STACK & YAPAY ZEKA/ML MÜHENDİSİ',
      'hero.role1': 'FULL STACK GELİŞTİRİCİ', 'hero.role2': 'YAPAY ZEKA / ML MÜHENDİSİ', 'hero.role3': 'BACKEND & VERİ SİSTEMLERİ',
      'hero.ctaProjects': 'Projeleri Gör →', 'hero.ctaContact': 'İletişime Geç', 'hero.ctaCv': 'CV İndir ↓',
      'hero.scroll': 'KAYDIR ↓',
      'stats.projects': 'TAMAMLANAN PROJELER', 'stats.tech': 'KULLANILAN TEKNOLOJİLER',
      'stats.models': 'DAĞITILAN ML MODELLERİ', 'stats.opensource': 'AÇIK KAYNAK',
      'about.eyebrow': '01 // HAKKIMDA', 'about.heading': 'Ben kimim.',
      'about.terminalHint': "'help' yazıp enter'a basın ↓", 'about.terminalPh': 'bir komut yazın...',
      'about.p1': "Islamia University of Bahawalpur'da Bilgisayar Bilimi lisansımı tamamlamak üzere olan bir Full Stack Geliştirici ve Yapay Zeka/ML Mühendisiyim. Genellikle bir veri setiyle başlayıp dağıtılmış bir uygulamayla biten işler yapıyorum — bir modeli not defterinden çıkarıp gerçek birinin kullanabileceği bir şeye dönüştürmek.",
      'about.p2': "Uçtan uca rahatım: backend'de FastAPI ve Flask, frontend'de Next.js ve React, aralarında da scikit-learn ve XGBoost.",
      'gh.live': "🔴 GITHUB'DAN CANLI", 'gh.repos': 'HERKESE AÇIK DEPOLAR', 'gh.followers': 'TAKİPÇİLER', 'gh.stars': 'TOPLAM YILDIZ',
      'skills.eyebrow': '02 // YETENEKLER', 'skills.heading': 'Neyle inşa ediyorum.',
      'skills.cat1': 'Diller', 'skills.cat2': 'Frontend', 'skills.cat3': 'Backend & YZ/ML', 'skills.cat4': 'Veritabanı & Bulut',
      'skills.proficiency': 'Yeterlilik',
      'exp.eyebrow': '03 // YOLCULUK', 'exp.heading': 'Buraya nasıl geldim.',
      'exp.item1.title': "BSCS'ye başladım",
      'exp.item1.desc': 'Islamia University of Bahawalpur\'da Bilgisayar Bilimine başladım — ilk Python satırları, ilk "Hello World."',
      'exp.item2.title': "Full stack'e geçtim",
      'exp.item2.desc': "Next.js, React ve FastAPI öğrendim — sadece ders ödevleri değil, gerçek projeler geliştirmeye başladım: yoklama sistemleri, yönetim panelleri ve ilk ML denemeleri.",
      'exp.item3.title': "Uygulamalı ML'ye odaklandım",
      'exp.item3.desc': "InsureCalc, CardioScan ve GlucoseGuard'ı geliştirip yayına aldım — eğitilmiş modelleri tam arayüzlü, gerçek ve kullanılabilir ürünlere dönüştürdüm.",
      'exp.item4.title': 'SEMS — bitirme projesi',
      'exp.item4.desc': 'Uçtan uca akıllı bir enerji yönetim sistemi tasarladım ve geliştirdim: IoT donanımı, MQTT, ARIMA tahminleme ve bulut panelleri.',
      'exp.item5.title': 'İş fırsatlarına açığım',
      'exp.item5.desc': 'Eğitimimi tamamlarken full stack geliştirme ve uygulamalı ML alanlarında serbest ve tam zamanlı işler alıyorum.',
      'proj.eyebrow': '04 // PROJELER', 'proj.heading': 'Öne çıkan çalışmalar.',
      'proj.sub': `Doğrudan ${GH_LINK} adresinden — detaylar için bir karta tıklayın.`,
      'filter.all': 'Tümü', 'filter.ml': 'ML / YZ', 'filter.web': 'Web', 'filter.iot': 'IoT',
      'filter.vision': 'Bilgisayarlı Görü', 'filter.data': 'Veri', 'proj.more': "GitHub'da Daha Fazlası",
      'edu.eyebrow': '05 // EĞİTİM', 'edu.heading': 'Geçmiş.',
      'edu.degree': 'BSCS — Bilgisayar Bilimleri Lisans', 'edu.institution': 'Islamia University of Bahawalpur',
      'cert.eyebrow': '06 // SERTİFİKALAR', 'cert.heading': 'Doğrulanmış yetkinlikler.',
      'cert1.title': 'Veri Bilimine Giriş',
      'cert1.skill1': 'Veri analitiğinin vaatlerini ve zorluklarını açıkladı',
      'cert1.skill2': 'Yapay zeka ve Makine Öğreniminde verinin rolünü açıkladı',
      'cert1.skill3': 'Veri analitiğinde kariyer seçeneklerini araştırdı',
      'cert1.link': 'Sertifikayı görüntüle ↗',
      'cert2.title': 'SQL Diploması: Başlangıçtan İleri Seviyeye',
      'cert2.skill1': 'Veritabanı temelleri & sorgu optimizasyonu',
      'cert2.skill2': "Join'ler, alt sorgular, saklı yordamlar & tetikleyiciler",
      'cert2.skill3': 'Veritabanı tasarımı & performans ayarı',
      'contact.eyebrow': '07 // İLETİŞİM', 'contact.heading': 'Birlikte bir şeyler inşa edelim.',
      'contact.sub': 'Full stack veya uygulamalı ML alanında serbest ve tam zamanlı işlere açığım.',
      'form.name': 'İsim', 'form.namePh': 'Adınız',
      'form.email': 'E-posta', 'form.emailPh': 'siz@ornek.com',
      'form.message': 'Mesaj', 'form.messagePh': 'Ne inşa ediyorsunuz?',
      'form.send': 'Mesaj Gönder →', 'form.note': 'Bu mesaj hazır şekilde e-posta uygulamanızı açar.',
      'contact.location': '📍 Sadiqabad, Pakistan',
      'footer.copy': '© 2026 Hassan Ahmed', 'footer.built': 'HTML, CSS & JS ile yapıldı',
    },
  };

  const HTML_KEYS = new Set(['proj.sub']); // keys that contain markup and need innerHTML

  function applyLanguage(lang){
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = dict[key];
      if (text === undefined) return;
      if (HTML_KEYS.has(key)) el.innerHTML = text;
      else el.textContent = text;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const text = dict[key];
      if (text !== undefined) el.setAttribute('placeholder', text);
    });

    document.documentElement.setAttribute('lang', lang);
    document.querySelectorAll('.lang-switch button, .lang-switch-mobile button').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    try { localStorage.setItem('hassan-portfolio-lang', lang); } catch (e) {}
  }

  document.querySelectorAll('#langSwitch button, #langSwitchMobile button').forEach(btn => {
    btn.addEventListener('click', () => applyLanguage(btn.getAttribute('data-lang')));
  });

  let initialLang = 'en';
  try {
    const saved = localStorage.getItem('hassan-portfolio-lang');
    if (saved && TRANSLATIONS[saved]) initialLang = saved;
  } catch (e) {}
  applyLanguage(initialLang);
});

/* =========================================================
   INTERACTIVE WARPED GRID BACKGROUND
   Graph-paper grid that bends away from the cursor, like a
   rubber sheet being poked. Settles back smoothly when the
   cursor moves away or leaves the window.
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gridCanvas');
  const fallback = document.getElementById('gridBgFallback');
  if (!canvas || !canvas.getContext) return;

  const prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return; // keep the static CSS fallback grid

  const ctx = canvas.getContext('2d');
  const CELL = 56;             // matches the CSS fallback's 56px grid
  const INFLUENCE = 200;       // px radius of cursor effect
  const MAX_DISPLACE = 20;     // px max a grid point can be pushed
  const EASE = 0.14;           // how quickly points settle toward their target

  let width = 0, height = 0, cols = 0, rows = 0;
  let points = [];             // {baseX, baseY, x, y}
  let mouseX = -9999, mouseY = -9999;
  let hasMouse = false;

  function isDark(){
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  function buildGrid(){
    const dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    cols = Math.ceil(width / CELL) + 1;
    rows = Math.ceil(height / CELL) + 1;
    points = [];
    for (let r = 0; r <= rows; r++) {
      const row = [];
      for (let c = 0; c <= cols; c++) {
        const bx = c * CELL;
        const by = r * CELL;
        row.push({ baseX: bx, baseY: by, x: bx, y: by });
      }
      points.push(row);
    }
  }
  buildGrid();

  window.addEventListener('resize', buildGrid, { passive: true });
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY; hasMouse = true;
  }, { passive: true });
  window.addEventListener('mouseleave', () => { hasMouse = false; });
  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      mouseX = e.touches[0].clientX; mouseY = e.touches[0].clientY; hasMouse = true;
    }
  }, { passive: true });
  window.addEventListener('touchend', () => { hasMouse = false; });

  const lineColorLight = 'rgba(20, 23, 26, 0.18)';
  const lineColorDark = 'rgba(236, 233, 224, 0.14)';
  const dotColorLight = 'rgba(53, 86, 255, 0.55)';
  const dotColorDark = 'rgba(23, 185, 120, 0.6)';

  function draw(){
    ctx.clearRect(0, 0, width, height);

    // Update each point's position: pull toward cursor-repelled target, ease smoothly.
    for (let r = 0; r < points.length; r++) {
      for (let c = 0; c < points[r].length; c++) {
        const p = points[r][c];
        let targetX = p.baseX;
        let targetY = p.baseY;

        if (hasMouse) {
          const dx = p.baseX - mouseX;
          const dy = p.baseY - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < INFLUENCE) {
            const falloff = 1 - dist / INFLUENCE;
            const push = falloff * falloff * MAX_DISPLACE;
            const nx = dx / (dist || 1);
            const ny = dy / (dist || 1);
            targetX = p.baseX + nx * push;
            targetY = p.baseY + ny * push;
          }
        }

        p.x += (targetX - p.x) * EASE;
        p.y += (targetY - p.y) * EASE;
      }
    }

    const lineColor = isDark() ? lineColorDark : lineColorLight;
    const dotColor = isDark() ? dotColorDark : dotColorLight;

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1.4;

    // Horizontal lines
    for (let r = 0; r < points.length; r++) {
      ctx.beginPath();
      for (let c = 0; c < points[r].length; c++) {
        const p = points[r][c];
        if (c === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
    // Vertical lines
    for (let c = 0; c < points[0].length; c++) {
      ctx.beginPath();
      for (let r = 0; r < points.length; r++) {
        const p = points[r][c];
        if (r === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }

    // Dots at intersections near the cursor, for a subtle "shatter" sparkle.
    if (hasMouse) {
      for (let r = 0; r < points.length; r++) {
        for (let c = 0; c < points[r].length; c++) {
          const p = points[r][c];
          const dx = p.baseX - mouseX;
          const dy = p.baseY - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < INFLUENCE * 0.6) {
            const alpha = 1 - dist / (INFLUENCE * 0.6);
            ctx.beginPath();
            ctx.fillStyle = dotColor;
            ctx.globalAlpha = alpha;
            ctx.arc(p.x, p.y, 2.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
          }
        }
      }
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
  canvas.classList.add('active');
  if (fallback) fallback.classList.add('hidden');
});
