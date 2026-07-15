// Smooth-scroll is handled by CSS (scroll-behavior), this just adds
// a tiny "active nav link" highlight as the user scrolls.

document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('.navlinks a');
  const sections = Array.from(links).map(l => document.querySelector(l.getAttribute('href')));

  function onScroll(){
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

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
});
