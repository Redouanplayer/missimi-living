// ── MISSIMI LIVING — Musique persistante entre pages ──
// Chopin Nocturne Op.9 No.2 — Musopen CC0 Domaine public

(function() {

  // Crée l'élément audio une seule fois
  const piano = new Audio();
  piano.loop = true;
  piano.volume = 0;
  piano.preload = 'auto';

  const SOURCES = [
    'https://archive.org/download/musopen-chopin/Nocturne%20Op.%209%20no.%202%20in%20E%20flat%20major.mp3',
    'https://archive.org/download/musopen-chopin/NocturneOp9No2.mp3',
  ];
  let srcIdx = 0;
  piano.src = SOURCES[srcIdx];
  piano.addEventListener('error', () => {
    srcIdx++;
    if (srcIdx < SOURCES.length) piano.src = SOURCES[srcIdx];
  });

  let playing = false;
  let ready   = false;
  const TARGET_VOL = 0.32;
  const PREF_KEY   = 'missimi_music';

  // ── Fade ──────────────────────────────────────────
  function fadeIn(dur) {
    piano.volume = 0;
    const steps = 60, inc = TARGET_VOL / steps;
    let s = 0;
    const t = setInterval(() => {
      s++;
      piano.volume = Math.min(s * inc, TARGET_VOL);
      if (s >= steps) { piano.volume = TARGET_VOL; clearInterval(t); }
    }, dur / steps);
  }

  function fadeOut(dur, cb) {
    const start = piano.volume;
    const steps = 60, dec = start / steps;
    let s = 0;
    const t = setInterval(() => {
      s++;
      piano.volume = Math.max(start - s * dec, 0);
      if (s >= steps) { piano.volume = 0; piano.pause(); clearInterval(t); if (cb) cb(); }
    }, dur / steps);
  }

  // ── Etat bouton ───────────────────────────────────
  function updateBtn(on) {
    const btn = document.getElementById('muteBtn');
    if (!btn) return;
    const icon  = btn.querySelector('.music-icon')  || btn;
    const label = btn.querySelector('.music-label');
    icon.textContent = on ? '🔊' : '🔇';
    if (label) label.style.color = on ? 'var(--gold, #b8975a)' : '';
    on ? btn.classList.add('playing') : btn.classList.remove('playing');
  }

  // ── Démarrer ──────────────────────────────────────
  function start(fadeDur) {
    piano.play().then(() => {
      ready = true; playing = true;
      fadeIn(fadeDur || 3000);
      updateBtn(true);
      localStorage.setItem(PREF_KEY, '1');
    }).catch(() => {
      // Autoplay bloqué — attendre interaction
    });
  }

  // ── Couper ────────────────────────────────────────
  function stop() {
    fadeOut(1500, () => {
      playing = false;
      updateBtn(false);
      localStorage.setItem(PREF_KEY, '0');
    });
  }

  // ── Toggle (bouton mute) ──────────────────────────
  window.toggleMusic = function(e) {
    if (e) { e.stopPropagation(); }
    if (!ready && !playing) {
      start(2000);
    } else if (playing) {
      stop();
    } else {
      piano.play().then(() => {
        playing = true; ready = true;
        fadeIn(1500);
        updateBtn(true);
        localStorage.setItem(PREF_KEY, '1');
      }).catch(() => {});
    }
  };

  // ── Autostart au premier clic sur la page ─────────
  function onFirstClick(e) {
    const btn = document.getElementById('muteBtn');
    if (btn && btn.contains(e.target)) return; // Géré par toggleMusic
    if (!ready) start(3000);
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Si l'utilisateur avait activé la musique → relancer
    const pref = localStorage.getItem(PREF_KEY);
    if (pref === '1') {
      // Tentative autoplay (marche si utilisateur a déjà interagi sur le site)
      start(2000);
    }
    // Sinon attendre premier clic
    document.addEventListener('click', onFirstClick, { once: true });
  });

  // ── Transition entre pages — pas de coupure brutale ──
  window.addEventListener('beforeunload', () => {
    // Sauvegarder état
    localStorage.setItem(PREF_KEY, playing ? '1' : '0');
  });

})();
