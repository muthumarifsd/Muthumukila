(() => {
  'use strict';

  const form = document.querySelector('#login-form');
  const username = document.querySelector('#username');
  const password = document.querySelector('#password');
  const message = document.querySelector('#form-message');
  const toggle = document.querySelector('#toggle-password');
  const card = document.querySelector('.login-card');
  const overlay = document.querySelector('#transition-overlay');
  const particleField = document.querySelector('#particle-field');
  const allowedNames = new Set(['mukila', 'marimuthu']);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function makeParticle(symbol, className = '') {
    const particle = document.createElement('span');
    particle.className = `particle ${className}`.trim();
    particle.textContent = symbol;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.setProperty('--duration', `${6 + Math.random() * 7}s`);
    particle.style.setProperty('--drift', `${Math.round(Math.random() * 130 - 65)}px`);
    particle.style.fontSize = `${14 + Math.random() * 15}px`;
    particleField.append(particle);
    particle.addEventListener('animationend', () => particle.remove(), { once: true });
  }

  if (!reducedMotion) {
    window.setInterval(() => {
      makeParticle(Math.random() > 0.55 ? '♡' : '✦', Math.random() > 0.75 ? 'sparkle' : '');
    }, 850);
  }

  toggle.addEventListener('click', () => {
    const reveal = password.type === 'password';
    password.type = reveal ? 'text' : 'password';
    toggle.textContent = reveal ? 'Hide' : 'Show';
    toggle.setAttribute('aria-label', `${reveal ? 'Hide' : 'Show'} password`);
    toggle.setAttribute('aria-pressed', String(reveal));
  });

  function showError(text) {
    message.textContent = text;
    message.classList.remove('error');
    // Restart the short shake so repeated invalid submissions remain noticeable.
    void message.offsetWidth;
    message.classList.add('error');
    (allowedNames.has(username.value.trim().toLowerCase()) ? password : username).focus();
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = username.value.trim().toLowerCase();
    const date = password.value.trim();
    message.classList.remove('error');

    if (!allowedNames.has(name)) {
      showError('That name doesn’t unlock this little love story. Try Mukila or Marimuthu.');
      return;
    }
    if (date !== '31-10-2022') {
      showError('Not quite the right date. Think of the day your forever began.');
      return;
    }

    message.textContent = 'The door to your forever is opening…';
    card.classList.add('success');
    if (!reducedMotion) {
      for (let i = 0; i < 38; i += 1) {
        window.setTimeout(() => makeParticle(i % 3 === 0 ? '✦' : '♥'), i * 18);
      }
      overlay.classList.add('active');
    }
    window.setTimeout(() => {
      try {
        window.sessionStorage.setItem('foreverLoveUnlocked', 'true');
      } catch (error) {
        // The demo can still continue when browser storage is disabled.
      }
      window.location.assign('love.html');
    }, reducedMotion ? 250 : 850);
  });
})();