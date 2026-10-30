(() => {
  'use strict';

  try {
    if (window.sessionStorage.getItem('foreverLoveUnlocked') !== 'true') {
      window.location.replace('index.html');
      return;
    }
  } catch (error) {
    window.location.replace('index.html');
    return;
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;
  const intro = document.querySelector('#cinematic-intro');
  const introCanvas = document.querySelector('#intro-canvas');
  const heartCanvas = document.querySelector('#heart-canvas');
  const rainCanvas = document.querySelector('#rain-canvas');
  const finaleCanvas = document.querySelector('#finale-canvas');
  const petalLayer = document.querySelector('#petal-layer');
  const audio = document.querySelector('#anniversary-audio');
  const musicToggle = document.querySelector('#music-toggle');
  const musicLabel = document.querySelector('#music-label');
  const letterToggle = document.querySelector('#letter-toggle');
  const letter = document.querySelector('#love-letter');
  const letterPrompt = document.querySelector('#letter-prompt');
  const giftButton = document.querySelector('#gift-button');
  const giftMessage = document.querySelector('#gift-message');
  const celebrationLayer = document.querySelector('#celebration-layer');
  const heartRain = document.querySelector('#heart-rain-overlay');
  const finale = document.querySelector('#finale-overlay');
  let introTimer;
  let rainActive = false;
  let finaleActive = false;
  let rainStopTimer;
  let finaleBurstTimer;
  let lastFocusedElement;

  function completedYears(start, now) {
    let years = now.getFullYear() - start.getFullYear();
    const anniversaryThisYear = new Date(start);
    anniversaryThisYear.setFullYear(start.getFullYear() + years);
    if (now < anniversaryThisYear) years -= 1;
    return Math.max(0, years);
  }

  function updateCounter() {
    const start = new Date(2022, 9, 31, 0, 0, 0);
    const now = new Date();
    if (now < start) return;

    const years = completedYears(start, now);
    const lastAnniversary = new Date(start);
    lastAnniversary.setFullYear(start.getFullYear() + years);
    let remainder = Math.floor((now.getTime() - lastAnniversary.getTime()) / 1000);
    const days = Math.floor(remainder / 86400);
    remainder %= 86400;
    const hours = Math.floor(remainder / 3600);
    remainder %= 3600;
    const minutes = Math.floor(remainder / 60);
    const seconds = remainder % 60;
    const values = { years, days, hours, minutes, seconds };
    Object.entries(values).forEach(([unit, value]) => {
      const target = document.querySelector(`[data-time="${unit}"]`);
      if (target) target.textContent = String(value).padStart(2, '0');
    });
  }
  updateCounter();
  window.setInterval(updateCounter, 1000);

  // Draw soft hearts rather than adding hundreds of DOM nodes; canvas pauses when hidden.
  function makeHeartScene(canvas, { count, falling = false, rain = false, fireworks = false }) {
    const context = canvas.getContext('2d');
    if (!context) return { start() {}, stop() {} };
    let width = 0;
    let height = 0;
    let frame = 0;
    let active = false;
    let hearts = [];
    let bursts = [];
    const palette = ['#ffc2d0', '#ed7fa1', '#d8a4df', '#f1d29a', '#f8e6ec'];
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.7);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      hearts = Array.from({ length: Math.min(count, Math.ceil(width * height / 8500)) }, () => newHeart(true));
    };
    function newHeart(initial = false) {
      const size = 5 + Math.random() * (rain ? 17 : 12);
      return {
        x: Math.random() * Math.max(width, 1),
        y: initial ? Math.random() * Math.max(height, 1) : (rain ? -size : height + size),
        size,
        speed: (falling ? 0.3 : 0.12) + Math.random() * (rain ? 2 : 0.7),
        drift: (Math.random() - 0.5) * (rain ? 1.8 : 0.5),
        phase: Math.random() * Math.PI * 2,
        alpha: 0.16 + Math.random() * 0.48,
        color: palette[Math.floor(Math.random() * palette.length)],
        rotation: (Math.random() - 0.5) * 0.25
      };
    }
    function drawHeart(heart, yOverride) {
      const y = yOverride ?? heart.y;
      const size = heart.size;
      context.save();
      context.translate(heart.x, y);
      context.rotate(heart.rotation);
      context.globalAlpha = heart.alpha;
      context.shadowColor = heart.color;
      context.shadowBlur = size * 1.5;
      context.fillStyle = heart.color;
      context.beginPath();
      context.moveTo(0, size * 0.34);
      context.bezierCurveTo(-size * 1.05, -size * 0.35, -size * 0.5, -size * 1.12, 0, -size * 0.5);
      context.bezierCurveTo(size * 0.5, -size * 1.12, size * 1.05, -size * 0.35, 0, size * 0.34);
      context.fill();
      context.restore();
    }
    function loop() {
      if (!active) return;
      context.clearRect(0, 0, width, height);
      for (let i = 0; i < Math.min(42, Math.ceil(width * height / 30000)); i += 1) {
        const twinkle = (Date.now() / 750 + i * 1.7) % (Math.PI * 2);
        const alpha = (Math.sin(twinkle) + 1) * 0.28;
        context.globalAlpha = alpha;
        context.fillStyle = '#f4d28f';
        context.shadowColor = '#f4d28f';
        context.shadowBlur = 12;
        const x = (i * 137.5 + 31) % Math.max(width, 1);
        const y = (i * 83.3 + 17) % Math.max(height, 1);
        context.fillRect(x, y, 2, 2);
      }
      context.globalAlpha = 1;
      context.shadowBlur = 0;
      for (const heart of hearts) {
        heart.phase += 0.015;
        heart.y += rain ? heart.speed : -heart.speed;
        heart.x += heart.drift + Math.sin(heart.phase) * 0.28;
        drawHeart(heart);
        if ((rain ? heart.y > height + heart.size * 2 : heart.y < -heart.size * 2) || heart.x < -40 || heart.x > width + 40) Object.assign(heart, newHeart());
      }
      if (fireworks && Math.random() < 0.025) {
        bursts.push({ x: Math.random() * width, y: height * (0.18 + Math.random() * 0.55), age: 0, color: palette[Math.floor(Math.random() * palette.length)] });
      }
      bursts = bursts.filter((burst) => burst.age < 42);
      bursts.forEach((burst) => {
        burst.age += 1;
        const radius = burst.age * 2.15;
        context.save();
        context.globalAlpha = Math.max(0, 1 - burst.age / 42);
        context.strokeStyle = burst.color;
        context.shadowColor = burst.color;
        context.shadowBlur = 14;
        context.lineWidth = 2;
        context.beginPath();
        context.arc(burst.x, burst.y, radius, 0, Math.PI * 2);
        context.stroke();
        context.font = '12px Georgia, serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        for (let i = 0; i < 20; i += 1) {
          const angle = (Math.PI * 2 * i) / 20;
          const heartX = 16 * Math.pow(Math.sin(angle), 3);
          const heartY = 13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle);
          const px = burst.x + (heartX / 16) * radius;
          const py = burst.y - (heartY / 17) * radius;
          context.fillStyle = burst.color;
          context.fillText('♥', px, py);
        }
        context.restore();
      });
      frame = window.requestAnimationFrame(loop);
    }
    const scene = {
      start() {
        if (active) return;
        active = true;
        resize();
        if (reducedMotion) {
          hearts.slice(0, 26).forEach((heart) => drawHeart(heart));
          return;
        }
        frame = window.requestAnimationFrame(loop);
      },
      stop() {
        active = false;
        window.cancelAnimationFrame(frame);
        context.clearRect(0, 0, width, height);
      }
    };
    window.addEventListener('resize', resize, { passive: true });
    return scene;
  }

  const introScene = makeHeartScene(introCanvas, { count: 210, falling: true });
  const ambientScene = makeHeartScene(heartCanvas, { count: 95 });
  const rainScene = makeHeartScene(rainCanvas, { count: 170, falling: true, rain: true });
  const finaleScene = makeHeartScene(finaleCanvas, { count: 95, fireworks: true });
  introScene.start();
  ambientScene.start();

  if (!reducedMotion) {
    window.setInterval(() => {
      if (document.hidden || intro.classList.contains('is-done')) return;
      const petal = document.createElement('span');
      petal.className = 'intro-petal';
      petal.style.left = `${Math.random() * 100}%`;
      petal.style.setProperty('--fall', `${8 + Math.random() * 8}s`);
      petal.style.setProperty('--sway', `${Math.round(Math.random() * 180 - 90)}px`);
      intro.append(petal);
      petal.addEventListener('animationend', () => petal.remove(), { once: true });
    }, 420);
    window.setInterval(() => {
      if (document.hidden) return;
      const petal = document.createElement('span');
      petal.className = 'petal';
      petal.style.left = `${Math.random() * 100}%`;
      petal.style.setProperty('--fall', `${8 + Math.random() * 8}s`);
      petal.style.setProperty('--sway', `${Math.round(Math.random() * 180 - 90)}px`);
      petalLayer.append(petal);
      petal.addEventListener('animationend', () => petal.remove(), { once: true });
    }, 1300);
  }

  function finishIntro() {
    if (intro.classList.contains('is-done')) return;
    window.clearTimeout(introTimer);
    intro.classList.add('is-done');
    intro.setAttribute('aria-hidden', 'true');
    introScene.stop();
    if (!reducedMotion) {
      document.querySelector('.hero')?.classList.add('intro-arrival');
      heartExplosion();
    }
    window.setTimeout(() => { intro.remove(); }, reducedMotion ? 80 : 1050);
  }
  document.querySelector('#skip-intro').addEventListener('click', finishIntro);
  document.querySelector('#intro-continue').addEventListener('click', finishIntro);
  introTimer = window.setTimeout(finishIntro, reducedMotion ? 3500 : 9200);

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((item, index) => {
    item.style.transitionDelay = `${(index % 3) * 90}ms`;
    revealObserver.observe(item);
  });

  document.querySelectorAll('.quote-card').forEach((card) => {
    card.addEventListener('click', () => {
      card.setAttribute('aria-pressed', String(card.getAttribute('aria-pressed') !== 'true'));
    });
  });

  letterToggle.addEventListener('click', () => {
    const open = letterToggle.getAttribute('aria-expanded') !== 'true';
    letterToggle.setAttribute('aria-expanded', String(open));
    letter.hidden = !open;
    letterPrompt.textContent = open ? 'Close your letter' : 'Open your letter';
    if (open) letter.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
  });

  musicToggle.addEventListener('click', async () => {
    if (audio.paused) {
      try {
        await audio.play();
        musicToggle.setAttribute('aria-pressed', 'true');
        musicToggle.setAttribute('aria-label', 'Pause anniversary music');
        musicLabel.textContent = 'Pause music';
      } catch (error) {
        musicLabel.textContent = 'Add your song';
        musicToggle.setAttribute('aria-label', 'Add a song at assets/music/our-song.mp3');
        window.setTimeout(() => {
          if (audio.paused) {
            musicLabel.textContent = 'Play music';
            musicToggle.setAttribute('aria-label', 'Play anniversary music');
          }
        }, 2600);
      }
    } else {
      audio.pause();
      musicToggle.setAttribute('aria-pressed', 'false');
      musicToggle.setAttribute('aria-label', 'Play anniversary music');
      musicLabel.textContent = 'Play music';
    }
  });
  audio.addEventListener('ended', () => {
    musicToggle.setAttribute('aria-pressed', 'false');
    musicToggle.setAttribute('aria-label', 'Play anniversary music');
    musicLabel.textContent = 'Play music';
  });

  function launchConfetti(container, total = 90) {
    const colors = ['#e7b5bc', '#d7b17e', '#f9e3ce', '#bf7c9a', '#f1d1b3'];
    for (let i = 0; i < (reducedMotion ? Math.min(20, total) : total); i += 1) {
      const piece = document.createElement('span');
      const heart = i % 5 === 0;
      piece.className = `confetti${heart ? ' heart' : ''}`;
      if (heart) piece.textContent = '♥';
      else piece.style.backgroundColor = colors[i % colors.length];
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.setProperty('--fall', `${2.5 + Math.random() * 3}s`);
      piece.style.setProperty('--drift', `${Math.round(Math.random() * 300 - 150)}px`);
      piece.style.animationDelay = `${Math.random() * 350}ms`;
      container.append(piece);
      piece.addEventListener('animationend', () => piece.remove(), { once: true });
    }
  }
  function celebrate() { launchConfetti(celebrationLayer); }

  function heartExplosion() {
    const burst = document.createElement('div');
    burst.className = 'heart-explosion';
    burst.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 72; i += 1) {
      const particle = document.createElement('span');
      particle.textContent = i % 5 === 0 ? '✦' : '♥';
      particle.className = i % 5 === 0 ? 'explosion-spark' : 'explosion-heart';
      particle.style.left = `${50 + (Math.random() - 0.5) * 8}%`;
      particle.style.top = `${48 + (Math.random() - 0.5) * 8}%`;
      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * Math.max(window.innerWidth, window.innerHeight) * 0.58;
      particle.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
      particle.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
      particle.style.setProperty('--burst-delay', `${Math.random() * 180}ms`);
      burst.append(particle);
    }
    document.body.append(burst);
    window.setTimeout(() => burst.remove(), 1500);
  }

  giftButton.addEventListener('click', () => {
    const opened = giftButton.classList.toggle('open');
    giftButton.setAttribute('aria-label', opened ? 'Close your anniversary surprise' : 'Open your anniversary surprise');
    giftMessage.hidden = !opened;
    if (opened) celebrate();
  });

  const rainButton = document.querySelector('#heart-rain-button');
  const rainClose = document.querySelector('#rain-close');
  function closeRain() {
    if (!rainActive) return;
    rainActive = false;
    window.clearTimeout(rainStopTimer);
    heartRain.classList.remove('is-open');
    heartRain.setAttribute('aria-hidden', 'true');
    body.classList.remove('overlay-open');
    rainScene.stop();
    if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
  }
  rainButton.addEventListener('click', () => {
    lastFocusedElement = rainButton;
    rainActive = true;
    heartRain.classList.add('is-open');
    heartRain.setAttribute('aria-hidden', 'false');
    body.classList.add('overlay-open');
    rainScene.start();
    rainClose.focus();
    rainStopTimer = window.setTimeout(closeRain, 16000);
  });
  rainClose.addEventListener('click', closeRain);

  function showFinale() {
    finaleActive = true;
    window.clearInterval(finaleBurstTimer);
    finale.classList.add('is-open');
    finale.setAttribute('aria-hidden', 'false');
    body.classList.add('overlay-open');
    finaleScene.start();
    launchConfetti(finale, 64);
    finaleBurstTimer = window.setInterval(() => launchConfetti(finale, 24), 2600);
  }
  function closeFinale() {
    if (!finaleActive) return;
    finaleActive = false;
    window.clearInterval(finaleBurstTimer);
    finale.classList.remove('is-open');
    finale.setAttribute('aria-hidden', 'true');
    body.classList.remove('overlay-open');
    finaleScene.stop();
    document.querySelector('#finale-button').focus();
  }
  document.querySelector('#finale-button').addEventListener('click', (event) => {
    lastFocusedElement = event.currentTarget;
    showFinale();
    document.querySelector('#finale-close').focus();
  });
  document.querySelector('#replay-finale').addEventListener('click', () => {
    finaleScene.stop();
    showFinale();
  });
  document.querySelector('#finale-close').addEventListener('click', closeFinale);

  // Pointer and touch trails are throttled to keep the visual flourish inexpensive.
  let lastTrailAt = 0;
  function addTrail(x, y) {
    if (reducedMotion || document.hidden || Date.now() - lastTrailAt < 65) return;
    lastTrailAt = Date.now();
    const heart = document.createElement('span');
    heart.className = 'pointer-heart';
    heart.textContent = Math.random() > 0.4 ? '♡' : '✦';
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.style.setProperty('--trail-drift', `${Math.round(Math.random() * 44 - 22)}px`);
    document.body.append(heart);
    heart.addEventListener('animationend', () => heart.remove(), { once: true });
  }
  window.addEventListener('pointermove', (event) => addTrail(event.clientX, event.clientY), { passive: true });

  // Six local placeholders open in an accessible, keyboard-operable lightbox.
  const lightbox = document.querySelector('#gallery-lightbox');
  const lightboxImage = document.querySelector('#lightbox-image');
  const lightboxCaption = document.querySelector('#lightbox-caption');
  const galleryCards = [...document.querySelectorAll('.gallery-card')];
  let galleryIndex = 0;
  function showGalleryImage(index) {
    galleryIndex = (index + galleryCards.length) % galleryCards.length;
    const card = galleryCards[galleryIndex];
    const image = card.querySelector('img');
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = card.querySelector('figcaption').textContent.trim();
  }
  function openGallery(index) {
    lastFocusedElement = galleryCards[index];
    showGalleryImage(index);
    if (typeof lightbox.showModal === 'function') lightbox.showModal();
    else lightbox.setAttribute('open', '');
    document.querySelector('#lightbox-close').focus();
  }
  function closeGallery() {
    if (typeof lightbox.close === 'function' && lightbox.open) lightbox.close();
    else lightbox.removeAttribute('open');
    if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
  }
  galleryCards.forEach((card, index) => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `View photo ${index + 1}: ${card.querySelector('figcaption').textContent.trim()}`);
    card.addEventListener('click', () => openGallery(index));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openGallery(index);
      }
    });
  });
  document.querySelector('#lightbox-close').addEventListener('click', closeGallery);
  document.querySelector('#lightbox-prev').addEventListener('click', () => showGalleryImage(galleryIndex - 1));
  document.querySelector('#lightbox-next').addEventListener('click', () => showGalleryImage(galleryIndex + 1));
  lightbox.addEventListener('click', (event) => { if (event.target === lightbox) closeGallery(); });
  lightbox.addEventListener('close', () => {
    if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
  });
  lightbox.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') showGalleryImage(galleryIndex - 1);
    if (event.key === 'ArrowRight') showGalleryImage(galleryIndex + 1);
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeRain();
      closeFinale();
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !intro.classList.contains('is-done')) introScene.start();
  });
})();
