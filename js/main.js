/* ------------------------------------------------------------------
   Algorithm as Sovereignty — main.js
   - Act 3 ownership toggle (swap labels, stats, threat meter)
   - Act 5 expandable concept definitions
   - Scroll reveals (GSAP ScrollTrigger if loaded, IntersectionObserver fallback)
   ------------------------------------------------------------------ */

(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ------------------------------------------------------------------
  // Act 3 — ownership toggle
  // ------------------------------------------------------------------
  const toggleBtns = document.querySelectorAll('.toggle-btn');
  const swapEls = document.querySelectorAll('[data-west], [data-east]');
  const threatFills = document.querySelectorAll('.threat-meter-fill');

  function applySide(side) {
    // body class drives color-state styling
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
      // for flag emoji + text, just replace textContent
      el.textContent = next;
    });

    threatFills.forEach(el => {
      const pct = parseInt(el.dataset[side], 10);
      if (!isNaN(pct)) el.style.width = pct + '%';
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

  // start in west
  applySide('west');

  // ------------------------------------------------------------------
  // Act 5 — expandable concept definitions
  // ------------------------------------------------------------------
  document.querySelectorAll('.concept-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('aria-controls');
      const body = document.getElementById(id);
      if (!body) return;
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      body.hidden = isOpen;
    });
  });

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
            start: 'top 85%',
            toggleActions: 'play none none none',
            once: true,
            onEnter: () => el.classList.add('is-in')
          }
        }
      );
    });

    // animate threat meter bars when Act 3 enters view
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
    // IntersectionObserver fallback if CDN blocked
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
