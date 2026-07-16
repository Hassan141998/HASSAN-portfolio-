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
