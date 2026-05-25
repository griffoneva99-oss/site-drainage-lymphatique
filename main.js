/* main.js — SOMA
   Interactions : curseur, navbar, carousel, scroll reveal
   ========================================================= */

(function () {
  'use strict';

  // ─── Curseur personnalisé ───────────────────────────────────
  const cursor      = document.getElementById('cursor');
  const cursorTrail = document.getElementById('cursorTrail');

  if (cursor && cursorTrail && window.innerWidth > 768) {
    let mouseX = 0, mouseY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = mouseX + 'px';
      cursor.style.top  = mouseY + 'px';
      // Trail avec léger délai via CSS transition
      cursorTrail.style.left = mouseX + 'px';
      cursorTrail.style.top  = mouseY + 'px';
    });

    // Agrandir au hover des éléments interactifs
    const hoverTargets = document.querySelectorAll('a, button, .soin-card, .avis-card');
    hoverTargets.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursor.style.width  = '20px';
        cursor.style.height = '20px';
        cursorTrail.style.width  = '56px';
        cursorTrail.style.height = '56px';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.width  = '10px';
        cursor.style.height = '10px';
        cursorTrail.style.width  = '36px';
        cursorTrail.style.height = '36px';
      });
    });
  }

  // ─── Navbar scroll ─────────────────────────────────────────
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => {
      if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ─── Menu mobile ───────────────────────────────────────────
  const burger     = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (burger && mobileMenu) {
    let menuOpen = false;

    const toggleMenu = () => {
      menuOpen = !menuOpen;
      mobileMenu.classList.toggle('open', menuOpen);
      document.body.style.overflow = menuOpen ? 'hidden' : '';

      // Animer les barres du burger
      const spans = burger.querySelectorAll('span');
      if (menuOpen) {
        spans[0].style.transform = 'translateY(6px) rotate(45deg)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'translateY(-6px) rotate(-45deg)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      }
    };

    burger.addEventListener('click', toggleMenu);

    // Fermer au clic sur un lien mobile
    const mobileLinks = document.querySelectorAll('.mobile-link');
    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (menuOpen) toggleMenu();
      });
    });
  }

  // ─── Scroll reveal (Intersection Observer) ─────────────────
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    revealEls.forEach((el) => observer.observe(el));
  } else {
    // Fallback : tout afficher directement
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  // ─── Carousel avis ─────────────────────────────────────────
  const track    = document.getElementById('avisTrack');
  const prevBtn  = document.getElementById('prevBtn');
  const nextBtn  = document.getElementById('nextBtn');
  const dotsWrap = document.getElementById('carouselDots');

  if (track && prevBtn && nextBtn) {
    const cards = track.querySelectorAll('.avis-card');
    let current = 0;

    // Calculer le nombre de cartes visibles selon la largeur
    const getVisible = () => (window.innerWidth <= 768 ? 1 : 3);

    const totalSlides = () => Math.ceil(cards.length / getVisible());

    // Créer les dots
    const buildDots = () => {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      for (let i = 0; i < totalSlides(); i++) {
        const dot = document.createElement('div');
        dot.className = 'dot' + (i === current ? ' active' : '');
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
      }
    };

    const updateDots = () => {
      if (!dotsWrap) return;
      dotsWrap.querySelectorAll('.dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    };

    const goTo = (index) => {
      const total = totalSlides();
      current = (index + total) % total;
      const cardWidth = cards[0].getBoundingClientRect().width;
      const gap = 24; // 1.5rem en pixels
      const visible = getVisible();
      const offset = current * visible * (cardWidth + gap);
      track.style.transform = `translateX(-${offset}px)`;
      updateDots();
    };

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    // Auto-play
    let autoPlay = setInterval(() => goTo(current + 1), 5000);

    const pauseAutoPlay = () => clearInterval(autoPlay);
    const resumeAutoPlay = () => {
      autoPlay = setInterval(() => goTo(current + 1), 5000);
    };

    track.addEventListener('mouseenter', pauseAutoPlay);
    track.addEventListener('mouseleave', resumeAutoPlay);

    // Touch swipe
    let touchStartX = 0;
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      pauseAutoPlay();
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        goTo(diff > 0 ? current + 1 : current - 1);
      }
      resumeAutoPlay();
    }, { passive: true });

    // Init
    buildDots();
    goTo(0);

    // Rebuild on resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        buildDots();
        goTo(0);
      }, 200);
    });
  }

  // ─── Carousel cabinet section Alice ───────────────────────
  const aliceCabinetTrack = document.getElementById('aliceCabinetTrack');
  if (aliceCabinetTrack) {
    const aSlides = aliceCabinetTrack.querySelectorAll('.alice-cabinet-slide');
    let aCurrent = 0;
    setInterval(() => {
      aCurrent = (aCurrent + 1) % aSlides.length;
      aliceCabinetTrack.style.transform = `translateX(-${aCurrent * 100}%)`;
    }, 3000);
  }

  // ─── Carousel galerie photos ───────────────────────────────
  const galerieTrack = document.getElementById('galerieTrack');
  const galeriePrev  = document.getElementById('galeriePrev');
  const galerieNext  = document.getElementById('galerieNext');
  const galerieDots  = document.getElementById('galerieDots');

  if (galerieTrack) {
    const slides = Array.from(galerieTrack.querySelectorAll('.galerie-slide'));
    const total  = slides.length;
    let current  = 0;
    let autoTimer;

    const goTo = (index) => {
      current = ((index % total) + total) % total;
      galerieTrack.style.transform = `translateX(-${current * 100}%)`;
      if (galerieDots) {
        galerieDots.querySelectorAll('.dot').forEach((d, i) => {
          d.classList.toggle('active', i === current);
        });
      }
    };

    const startAuto = () => {
      clearInterval(autoTimer);
      autoTimer = setInterval(() => goTo(current + 1), 3500);
    };

    // Dots
    if (galerieDots) {
      for (let i = 0; i < total; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => { goTo(i); startAuto(); });
        galerieDots.appendChild(dot);
      }
    }

    if (galeriePrev) galeriePrev.addEventListener('click', () => { goTo(current - 1); startAuto(); });
    if (galerieNext) galerieNext.addEventListener('click', () => { goTo(current + 1); startAuto(); });

    // Swipe touch
    let touchStart = 0;
    galerieTrack.addEventListener('touchstart', (e) => { touchStart = e.touches[0].clientX; }, { passive: true });
    galerieTrack.addEventListener('touchend', (e) => {
      const diff = touchStart - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) { goTo(diff > 0 ? current + 1 : current - 1); startAuto(); }
    }, { passive: true });

    // Pause au survol
    galerieTrack.addEventListener('mouseenter', () => clearInterval(autoTimer));
    galerieTrack.addEventListener('mouseleave', startAuto);

    goTo(0);
    startAuto();
  }

  // ─── Smooth scroll pour les ancres nav ─────────────────────
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80; // hauteur navbar
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ─── Parallax léger sur le hero ────────────────────────────
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrolled * 0.25}px)`;
        heroContent.style.opacity = 1 - scrolled / (window.innerHeight * 0.8);
      }
    }, { passive: true });
  }

  // ─── Hover magnétique sur les boutons CTA ──────────────────
  const magnetBtns = document.querySelectorAll('.btn-primary, .nav-cta');
  magnetBtns.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 8;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

})();
