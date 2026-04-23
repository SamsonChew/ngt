/* ------------------------------------------------------------------
   Algorithm as Sovereignty — v2 main.js
   - Act 3 ownership toggle (label/flag/stat/threat/evidence swap)
   - Inline concept glosses (expand/collapse)
   - Steelman cards use native <details>, no JS needed
   - Scroll reveals (GSAP if loaded, IntersectionObserver fallback)
   - Scroll progress bar
   ------------------------------------------------------------------ */

(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ------------------------------------------------------------------
  // Act 3 — ownership toggle
  // ------------------------------------------------------------------
  const toggleBtns = document.querySelectorAll('.toggle-btn');
  const swapEls = document.querySelectorAll('[data-west], [data-east]');
  const threatFills = document.querySelectorAll('.threat-meter-fill');
  const flagImages = document.querySelectorAll('.compare-flag img');
  const flagHosts = document.querySelectorAll('.compare-flag[data-flag-west]');

  function applySide(side) {
    document.body.classList.toggle('is-east', side === 'east');
    document.body.classList.toggle('is-west', side === 'west');

    toggleBtns.forEach(btn => {
      const active = btn.dataset.side === side;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-checked', active ? 'true' : 'false');
    });

    swapEls.forEach(el => {
      const next = el.dataset[side];
      if (next == null) return;
      el.textContent = next;
    });

    threatFills.forEach(el => {
      const pct = parseInt(el.dataset[side], 10);
      if (!isNaN(pct)) el.style.width = pct + '%';
    });

    // swap flag SVGs
    flagHosts.forEach(host => {
      const code = side === 'east' ? host.dataset.flagEast : host.dataset.flagWest;
      if (!code) return;
      const img = host.querySelector('img');
      if (img) img.src = `assets/flags/${code}.svg`;
    });

    // re-home the citation sup-link to the right source
    document.querySelectorAll('sup a[data-west-href]').forEach(a => {
      const href = side === 'east' ? a.dataset.eastHref : a.dataset.westHref;
      if (href) a.setAttribute('href', href);
    });
  }

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => applySide(btn.dataset.side));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const next = btn.dataset.side === 'west' ? 'east' : 'west';
        applySide(next);
        const target = document.querySelector(`.toggle-btn[data-side="${next}"]`);
        if (target) target.focus();
      }
    });
  });

  applySide('west');

  // ------------------------------------------------------------------
  // Inline concept glosses
  // ------------------------------------------------------------------
  document.querySelectorAll('.gloss-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const term = btn.dataset.gloss;
      const body = document.querySelector(`.gloss-popover[data-for="${term}"]`);
      if (!body) return;
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      body.hidden = isOpen;
    });
  });

  // ------------------------------------------------------------------
  // Scroll progress bar
  // ------------------------------------------------------------------
  const progressFill = document.querySelector('.scroll-progress-fill');
  if (progressFill) {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(100, (scrolled / max) * 100) : 0;
      progressFill.style.width = pct + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  // ------------------------------------------------------------------
  // Scroll reveals
  // ------------------------------------------------------------------
  const revealEls = document.querySelectorAll('.reveal');

  if (prefersReducedMotion) {
    revealEls.forEach(el => el.classList.add('is-in'));
    return;
  }

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    revealEls.forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
            once: true,
            onEnter: () => el.classList.add('is-in')
          }
        }
      );
    });

    ScrollTrigger.create({
      trigger: '#act-3',
      start: 'top 70%',
      once: true,
      onEnter: () => {
        threatFills.forEach(el => {
          const current = document.body.classList.contains('is-east') ? 'east' : 'west';
          const pct = parseInt(el.dataset[current], 10);
          if (!isNaN(pct)) {
            el.style.width = '0%';
            requestAnimationFrame(() => { el.style.width = pct + '%'; });
          }
        });
      }
    });
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  }
})();
