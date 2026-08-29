   /* =============================================
       JAVASCRIPT — Birthday Gift Page
       Pure Vanilla JS, well-commented, hardware-accelerated
    ============================================= */

    // ── 1. DOM references ────────────────────────────────────────
    const unlockScreen  = document.getElementById('unlock-screen');
    const btnOpen       = document.getElementById('btn-open');
    const giftBox       = document.getElementById('gift-box');
    const mainContent   = document.getElementById('main-content');
    const btnMusic      = document.getElementById('btn-music');
    const btnWish       = document.getElementById('btn-wish');
    const wishText      = document.getElementById('wish-text');
    const wishEmoji     = document.getElementById('wish-emoji');
    const wishAuthor    = document.getElementById('wish-author');
    const particleCanvas = document.getElementById('particle-canvas');
    const pageAudio     = document.getElementById('birthday-audio');

    // ── 2. Generate starfield on unlock screen ───────────────────
    (function generateStars() {
      const container = document.getElementById('unlock-stars');
      for (let i = 0; i < 80; i++) {
        const star = document.createElement('span');
        star.style.cssText = `
          left: ${Math.random() * 100}%;
          top:  ${Math.random() * 100}%;
          animation-delay: ${(Math.random() * 4).toFixed(2)}s;
          animation-duration: ${(2 + Math.random() * 3).toFixed(2)}s;
          width:  ${Math.random() > 0.7 ? 4 : 2}px;
          height: ${Math.random() > 0.7 ? 4 : 2}px;
          opacity: ${(Math.random() * 0.6 + 0.2).toFixed(2)};
        `;
        container.appendChild(star);
      }
    })();

    // ── 3. Confetti explosion ────────────────────────────────────
    const CONFETTI_COLORS = [
      '#ff6b9d', '#c9a96e', '#f7d794', '#a78bfa',
      '#fb7185', '#34d399', '#fff0f5', '#f0abfc', '#60a5fa'
    ];

    function launchConfetti(count = 130) {
      for (let i = 0; i < count; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';

        const color  = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
        const left   = Math.random() * 100;          // vw
        const delay  = Math.random() * 0.9;          // seconds
        const dur    = 2.5 + Math.random() * 2.5;    // seconds
        const size   = 7 + Math.random() * 10;       // px
        const isCircle = Math.random() > 0.5;

        piece.style.cssText = `
          left: ${left}vw;
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          border-radius: ${isCircle ? '50%' : '2px'};
          animation-duration: ${dur}s;
          animation-delay: ${delay}s;
        `;

        document.body.appendChild(piece);

        // Remove after animation ends to keep DOM clean
        piece.addEventListener('animationend', () => piece.remove());
      }
    }

    // ── 4. Unlock / open gift flow ───────────────────────────────
    function openGift() {
      // 4a. Animate lid hover
      giftBox.classList.add('opened');

      // 4b. After short pause: confetti + hide overlay
      setTimeout(() => {
        launchConfetti(140);
        unlockScreen.classList.add('hidden');
      }, 320);

      // 4c. After overlay fades: show main content
      setTimeout(() => {
        mainContent.classList.add('visible');
        initParticles();   // start background particles now
        initCounters();    // start number animation
        initReveal();      // scroll-reveal observer

        // Start the birthday song after the gift is opened.
        pageAudio.play().catch(() => {
          // if it fails, the user can still click the music button manually
        });
      }, 1100);
    }

    btnOpen.addEventListener('click', openGift);
    // Also allow clicking the gift box itself
    giftBox.addEventListener('click', openGift);

    // ── 5. Background Particle System (Canvas) ───────────────────
    function initParticles() {
      const ctx    = particleCanvas.getContext('2d');
      let   W, H;
      const PARTICLES = [];
      const COUNT     = 55;

      function resize() {
        W = particleCanvas.width  = window.innerWidth;
        H = particleCanvas.height = window.innerHeight;
      }
      resize();
      window.addEventListener('resize', resize);

      // Particle factory
      function makeParticle() {
        return {
          x:    Math.random() * W,
          y:    Math.random() * H,
          r:    1.5 + Math.random() * 3,
          vx:   (Math.random() - 0.5) * 0.35,
          vy:   -0.15 - Math.random() * 0.35,  // slowly drift up
          alpha: 0.1 + Math.random() * 0.35,
          // Pick a warm palette color per particle
          hue:  [320, 340, 35, 50][Math.floor(Math.random() * 4)],
          sat:  70 + Math.random() * 30,
          light: 65 + Math.random() * 20,
        };
      }

      for (let i = 0; i < COUNT; i++) PARTICLES.push(makeParticle());

      function draw() {
        // Clear with full transparent — keeps canvas see-through
        ctx.clearRect(0, 0, W, H);

        for (const p of PARTICLES) {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `hsl(${p.hue},${p.sat}%,${p.light}%)`;
          ctx.fill();
          ctx.restore();

          // Move — hardware-accelerated via rAF
          p.x += p.vx;
          p.y += p.vy;

          // Wrap around edges
          if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
          if (p.x < -10)  p.x = W + 10;
          if (p.x > W+10) p.x = -10;
        }

        requestAnimationFrame(draw);
      }
      requestAnimationFrame(draw);
    }

    // ── 6. Birthday Counters animation ──────────────────────────
    function initCounters() {
      // We'll use a fixed birthday for demonstration; adjust as needed.
      // Birthday set to June 11 (today). Years = 25 as a lovely placeholder.
      const BIRTHDAY_YEAR = 2008;
      const todayYear     = new Date().getFullYear();
      const years         = todayYear - BIRTHDAY_YEAR;
      const daysLived     = Math.floor(years * 365.25);

      animateCount('cnt-years', 0, years, 1800);
      animateCount('cnt-days',  0, daysLived, 2200);
    }

    /**
     * Smoothly counts a number from `from` to `to` over `duration` ms
     * using requestAnimationFrame for hardware-accelerated updates.
     */
    function animateCount(id, from, to, duration) {
      const el    = document.getElementById(id);
      const start = performance.now();

      function step(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased    = 1 - Math.pow(1 - progress, 3);
        const value    = Math.floor(from + (to - from) * eased);

        el.textContent = value.toLocaleString();
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    // ── 7. Birthday Blessing Generator ──────────────────────────
    const BLESSINGS = [
      {
        emoji: '🌸',
        text:  'May every dream you\'ve ever held close bloom into reality this year, Balkisu. You deserve a life as beautiful as your soul.',
        author: '— A heart full of love for you'
      },
      {
        emoji: '✨',
        text:  'The world is richer because you are in it. May this birthday mark the beginning of your most extraordinary chapter yet.',
        author: '— Your biggest admirer'
      },
      {
        emoji: '🌹',
        text:  'Like a rose, you bring beauty to every place you grace. May your days overflow with joy, laughter, and every good thing your heart desires.',
        author: '— With endless love'
      },
      {
        emoji: '💫',
        text:  'May God crown this new year of your life with abundant blessings, open doors, and the sweetest surprises. You are truly exceptional, Balkisu.',
        author: '— From the depths of my heart'
      },
      {
        emoji: '🦋',
        text:  'Just like a butterfly, you make the world more colourful and wondrous. May this year see you soar to heights you\'ve only dreamed of.',
        author: '— Always cheering for you'
      },
      {
        emoji: '🌙',
        text:  'You are the kind of soul that doesn\'t just light up a room — you light up lives. Happy Birthday to the most radiant person I know.',
        author: '— Yours, always and forever'
      },
      {
        emoji: '💎',
        text:  'You are priceless, Balkisu — a rare treasure that this world is lucky to have. May your birthday be the start of a season of breakthroughs and abundance.',
        author: '— Celebrating you today and always'
      },
      {
        emoji: '🌊',
        text:  'May peace flow through your life like a gentle river, carrying away every worry and bringing you nothing but calm, love, and joy.',
        author: '— Wishing you the world'
      },
      {
        emoji: '⭐',
        text:  'Stars shine brightest in the dark, and you, my love, are the brightest star in every sky I\'ve ever looked up at. Happy Birthday, beautiful.',
        author: '— Your star-gazer'
      },
      {
        emoji: '🎀',
        text:  'May this birthday wrap you in warmth, fill you with gratitude, and remind you that you are so profoundly, genuinely, completely loved.',
        author: '— Now and always, yours'
      },
    ];

    let lastWishIndex = -1;

    btnWish.addEventListener('click', function () {
      // Pick a different blessing each time
      let idx;
      do { idx = Math.floor(Math.random() * BLESSINGS.length); }
      while (idx === lastWishIndex);
      lastWishIndex = idx;

      const blessing = BLESSINGS[idx];

      // Fade out
      wishText.classList.add('fade-out');
      wishAuthor.classList.add('fade-out');

      setTimeout(() => {
        wishEmoji.textContent  = blessing.emoji;
        wishText.textContent   = blessing.text;
        wishAuthor.textContent = blessing.author;

        wishText.classList.remove('fade-out');
        wishAuthor.classList.remove('fade-out');
        wishText.classList.add('fade-in');
      }, 350);

      // Brief scale pop on the card
      const card = document.querySelector('.wish-card');
      card.style.transform = 'scale(0.97)';
      setTimeout(() => { card.style.transform = ''; }, 180);
    });

    pageAudio.loop = true;
    pageAudio.volume = 0.8;
    pageAudio.preload = 'auto';

    function updateMusicButton() {
      if (pageAudio.paused) {
        btnMusic.textContent = '🎵 Play Song';
        btnMusic.classList.remove('playing');
      } else {
        btnMusic.textContent = '🔊 Pause Song';
        btnMusic.classList.add('playing');
      }
    }

    pageAudio.addEventListener('play', updateMusicButton);
    pageAudio.addEventListener('pause', updateMusicButton);
    pageAudio.addEventListener('ended', updateMusicButton);

    // Keep the button text in sync with audio state.
    function updateMusicButton() {
      if (pageAudio.paused) {
        btnMusic.textContent = '🎵 Play Song';
        btnMusic.classList.remove('playing');
      } else {
        btnMusic.textContent = '🔊 Pause Song';
        btnMusic.classList.add('playing');
      }
    }

    pageAudio.addEventListener('play', updateMusicButton);
    pageAudio.addEventListener('pause', updateMusicButton);
    pageAudio.addEventListener('ended', updateMusicButton);

    btnMusic.addEventListener('click', () => {
      if (pageAudio.paused) {
        pageAudio.play().catch(() => {
          btnMusic.textContent = '🎵 Play Song';
          btnMusic.classList.remove('playing');
        });
      } else {
        pageAudio.pause();
      }
    });

    // ── 8. Scroll-reveal with IntersectionObserver ──────────────
    function initReveal() {
      const targets = document.querySelectorAll('.reveal');

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            // Unobserve once revealed — performance optimisation
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      });

      targets.forEach(el => observer.observe(el));
    }

    // ── 9. Polaroid keyboard accessibility ──────────────────────
    document.querySelectorAll('.polaroid').forEach(card => {
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          card.style.transform = 'scale(1.07) rotate(0deg)';
          setTimeout(() => { card.style.transform = ''; }, 600);
        }
      });
    });

    // ── 10. Gift box hover for desktop ──────────────────────────
    giftBox.addEventListener('mouseenter', () => {
      giftBox.style.filter = 'drop-shadow(0 0 40px rgba(201,169,110,0.65))';
    });
    giftBox.addEventListener('mouseleave', () => {
      giftBox.style.filter = 'drop-shadow(0 0 30px rgba(201,169,110,0.4))';
    });