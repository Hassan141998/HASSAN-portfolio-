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

  /* ---------- Mascots: follow the cursor + show random speech bubbles ---------- */
  const mascotRow = document.getElementById('mascotRow');
  if (mascotRow) {
    const wraps = Array.from(mascotRow.querySelectorAll('.mascot-wrap'));
    const MAX_PULL = 16;      // px, how far a mascot can be tugged toward the cursor
    const INFLUENCE = 170;    // px, radius around each mascot where the cursor has effect

    function onMove(clientX, clientY){
      wraps.forEach(wrap => {
        if (wrap.classList.contains('being-dragged')) return;
        const rect = wrap.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = clientX - cx;
        const dy = clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < INFLUENCE) {
          const strength = (1 - dist / INFLUENCE) * MAX_PULL;
          const nx = (dx / (dist || 1)) * strength;
          const ny = (dy / (dist || 1)) * strength;
          wrap.style.transform = `translate(${nx}px, ${ny}px)`;
        } else {
          wrap.style.transform = 'translate(0, 0)';
        }
      });
    }

    window.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY), { passive: true });
    window.addEventListener('mouseleave', () => {
      wraps.forEach(wrap => { wrap.style.transform = 'translate(0, 0)'; });
    });

    // Pick a random message different from whichever was shown last time.
    function showBubble(wrap){
      const bubble = wrap.querySelector('.mascot-bubble span');
      const msgs = (wrap.getAttribute('data-msgs') || '').split('|').filter(Boolean);
      if (!msgs.length) return;
      let next = msgs[Math.floor(Math.random() * msgs.length)];
      if (msgs.length > 1 && next === wrap.dataset.lastMsg) {
        next = msgs[(msgs.indexOf(next) + 1) % msgs.length];
      }
      wrap.dataset.lastMsg = next;
      bubble.textContent = next;
      wrap.classList.add('bubble-show');
    }
    function hideBubble(wrap){
      wrap.classList.remove('bubble-show');
    }

    wraps.forEach(wrap => {
      wrap.addEventListener('mouseenter', () => showBubble(wrap));
      wrap.addEventListener('mouseleave', () => hideBubble(wrap));
      // Touch devices: tap to show a message, tap elsewhere to hide.
      wrap.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        showBubble(wrap);
      }, { passive: true });
    });
    document.addEventListener('touchstart', () => {
      wraps.forEach(hideBubble);
    }, { passive: true });
  }
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

  /* ---------- 6. Draggable + evolving mascots ---------- */
  const mascotRow = document.getElementById('mascotRow');
  if (mascotRow) {
    const wraps = Array.from(mascotRow.querySelectorAll('.mascot-wrap'));
    const clickCounts = {};
    const EVOLVE_THRESHOLD = 5;

    try {
      const saved = JSON.parse(localStorage.getItem('hassan-portfolio-evolved') || '{}');
      wraps.forEach((wrap, i) => {
        if (saved[i]) {
          wrap.querySelector('.achievement-badge').classList.add('unlocked');
        }
      });
    } catch (e) {}

    wraps.forEach((wrap, i) => {
      let isDragging = false;
      let startX = 0, startY = 0;
      let dragX = 0, dragY = 0;
      const mascot = wrap.querySelector('.mascot');

      function onPointerDown(e){
        isDragging = true;
        wrap.classList.add('being-dragged');
        wrap.style.transition = 'none';
        mascot.classList.add('dragging');
        const point = e.touches ? e.touches[0] : e;
        startX = point.clientX;
        startY = point.clientY;
      }
      function onPointerMove(e){
        if (!isDragging) return;
        const point = e.touches ? e.touches[0] : e;
        dragX = point.clientX - startX;
        dragY = point.clientY - startY;
        wrap.style.transform = `translate(${dragX}px, ${dragY}px)`;
      }
      function onPointerUp(){
        if (!isDragging) return;
        isDragging = false;
        mascot.classList.remove('dragging');
        wrap.style.transition = 'transform .55s cubic-bezier(.34,1.56,.64,1)';
        wrap.style.transform = 'translate(0px, 0px)';
        setTimeout(() => wrap.classList.remove('being-dragged'), 560);

        clickCounts[i] = (clickCounts[i] || 0) + 1;
        if (clickCounts[i] === EVOLVE_THRESHOLD) {
          wrap.querySelector('.achievement-badge').classList.add('unlocked');
          const bubble = wrap.querySelector('.mascot-bubble span');
          bubble.textContent = "🏆 You found my secret!";
          wrap.classList.add('bubble-show');
          setTimeout(() => wrap.classList.remove('bubble-show'), 2200);
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
      wrap.addEventListener('touchstart', onPointerDown, { passive: true });
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
