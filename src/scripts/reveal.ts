const revealElements =
  document.querySelectorAll<HTMLElement>('[data-reveal]');

const prefersReducedMotion =
  window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;


/* =========================================
   NO ANIMATION
========================================= */

if (
  prefersReducedMotion ||
  !('IntersectionObserver' in window)
) {

  revealElements.forEach((element) => {
    element.classList.add('is-revealed');
  });

} else {

  /* =========================================
     OBSERVER
  ========================================= */

  const observer = new IntersectionObserver(
    (entries, observerInstance) => {

      entries.forEach((entry) => {

        if (!entry.isIntersecting) {
          return;
        }

        const element =
          entry.target as HTMLElement;

        const delay =
          element.dataset.revealDelay || '0';

        element.style.setProperty(
          '--reveal-delay',
          `${delay}ms`
        );

        element.classList.add(
          'is-revealed'
        );

        observerInstance.unobserve(
          element
        );

      });

    },
    {
      threshold: 0.12,

      rootMargin:
        '0px 0px -60px 0px',
    }
  );


  revealElements.forEach((element) => {
    observer.observe(element);
  });

}