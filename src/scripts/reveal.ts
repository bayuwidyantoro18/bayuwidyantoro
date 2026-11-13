// Animated entrance is optional: without JS all sections remain visible.
const elements = document.querySelectorAll<HTMLElement>('[data-reveal]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reducedMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries, instance) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const element = entry.target as HTMLElement;
      const delay = Math.max(0, Number.parseInt(element.dataset.revealDelay || '0', 10) || 0);
      element.style.setProperty('--reveal-delay', `${delay}ms`);
      element.classList.remove('is-pending');
      element.classList.add('is-revealed');
      instance.unobserve(element);
    });
  }, { threshold: .08, rootMargin: '0px 0px -35px 0px' });
  elements.forEach(element => {
    // Above-the-fold content should never start invisible.
    if (element.getBoundingClientRect().top > window.innerHeight * .85) element.classList.add('is-pending');
    observer.observe(element);
  });
}
