/* =========================================================
   LES INFECTÉS : interactions
   - écran d'entrée (déclenche le son)
   - fougères générées en SVG
   - parallaxe : hero en plans (scroll + souris) et éléments [data-speed]
   - apparitions, rail d'infection
   - mode écoute (maintenir Espace / bouton)
   - sons générés (cliquetis, grognements, grondement) + musique
   ========================================================= */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const rand = (a, b) => a + Math.random() * (b - a);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Captures : si la vraie capture manque, on recadre le décor ---------- */
$$(".shot img").forEach((img) => {
  const standin = () => {
    if (img.classList.contains("standin")) return;
    img.classList.add("standin");
    img.style.objectPosition = img.dataset.pos || "center";
    img.style.transformOrigin = img.dataset.pos || "center";
    img.style.setProperty("--z", img.dataset.zoom || 1.6);
    img.src = "assets/decor.webp";
  };
  if (img.complete && img.naturalWidth === 0) standin();
  else img.addEventListener("error", standin, { once: true });
});
$$(".horde img, .cut img").forEach((img) =>
  img.addEventListener("error", () => img.remove(), { once: true })
);

/* =========================================================
   FOUGÈRES
   ========================================================= */
const PALETTES = {
  light: ["#22301a", "#2b3d1f", "#354a24", "#40592b", "#4d6a33"],
  dark: ["#090d07", "#0e150b", "#131c0f", "#18240f"],
};

function frondSVG(curl, palette) {
  const P0 = { x: 100, y: 500 };
  const P1 = { x: 100 + curl * 90, y: 260 };
  const P2 = { x: 100 + curl * 150, y: 30 };
  const bez = (t) => ({
    x: (1 - t) ** 2 * P0.x + 2 * (1 - t) * t * P1.x + t * t * P2.x,
    y: (1 - t) ** 2 * P0.y + 2 * (1 - t) * t * P1.y + t * t * P2.y,
  });
  const der = (t) => ({
    x: 2 * (1 - t) * (P1.x - P0.x) + 2 * t * (P2.x - P1.x),
    y: 2 * (1 - t) * (P1.y - P0.y) + 2 * t * (P2.y - P1.y),
  });

  const stem = palette[0];
  let out = `<path d="M${P0.x} ${P0.y} Q${P1.x} ${P1.y} ${P2.x} ${P2.y}" stroke="${stem}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;

  const N = 24;
  for (let i = 0; i < N; i++) {
    const t = 0.1 + (i / N) * 0.88;
    const p = bez(t);
    const d = der(t);
    const a = Math.atan2(d.y, d.x);
    const L = 82 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.05)), 0.75) * (1 - t * 0.3) + 4;
    for (const side of [-1, 1]) {
      const ang = a + side * (Math.PI / 2 - 0.5);
      const ux = Math.cos(ang), uy = Math.sin(ang);
      const nx = -uy, ny = ux;
      const w = L * 0.2;
      const droop = L * 0.12;
      // contour lobé de la penne : aller sur un bord, retour sur l'autre
      const K = 7;
      const pts = [];
      for (let k = 0; k <= K; k++) {
        const s = k / K;
        const lobe = (k % 2 ? 1 : 0.45) * w * (1 - s * 0.85);
        pts.push([p.x + ux * L * s + nx * lobe, p.y + uy * L * s + ny * lobe + droop * s * s]);
      }
      for (let k = K - 1; k >= 1; k--) {
        const s = k / K;
        const lobe = (k % 2 ? 1 : 0.45) * w * (1 - s * 0.85);
        pts.push([p.x + ux * L * s - nx * lobe, p.y + uy * L * s - ny * lobe + droop * s * s]);
      }
      const dPath = `M${p.x.toFixed(1)} ${p.y.toFixed(1)}` + pts.map(([x, y]) => `L${x.toFixed(1)} ${y.toFixed(1)}`).join("") + "Z";
      const fill = palette[1 + Math.floor(Math.random() * (palette.length - 1))];
      out += `<path d="${dPath}" fill="${fill}"/>`;
    }
  }
  return `<svg viewBox="-40 0 280 500" width="280" height="500" xmlns="http://www.w3.org/2000/svg">${out}</svg>`;
}

$$(".ferns").forEach((box) => {
  const count = +box.dataset.count || 5;
  const size = +box.dataset.size || 1;
  const palette = PALETTES[box.dataset.tone === "dark" ? "dark" : "light"];
  const flip = parseFloat(getComputedStyle(box).getPropertyValue("--flip")) || 0;
  let html = "";
  for (let i = 0; i < count; i++) {
    const h = rand(55, 95) * size;
    const spread = flip ? rand(-15, 38) * flip : rand(-55, 55);
    const curl = Math.sign(spread || 1) * rand(0.15, 0.55);
    const left = (i / Math.max(1, count - 1)) * 70 + rand(-6, 6);
    const style = `height:${h.toFixed(0)}%;aspect-ratio:280/500;left:${left.toFixed(0)}%;--r:${spread.toFixed(0)}deg;--d:${rand(5, 9).toFixed(1)}s;--delay:-${rand(0, 8).toFixed(1)}s`;
    const url = URL.createObjectURL(new Blob([frondSVG(curl, palette)], { type: "image/svg+xml" }));
    html += `<img class="frond" alt="" decoding="async" src="${url}" style="${style}">`;
  }
  box.innerHTML = html;
});

// On ne fait onduler que les fougères visibles à l'écran
const swayObs = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.target.classList.toggle("paused", !e.isIntersecting)),
  { rootMargin: "100px" }
);
$$(".ferns.sway").forEach((f) => { f.classList.add("paused"); swayObs.observe(f); });

/* =========================================================
   AUDIO
   ========================================================= */
const music = $("#music");
let ctx = null;
let master = null;
let noiseBuf = null;
let analyser = null;
let freqData = null;
let soundOn = true;
let musicOk = true;
music.addEventListener("error", () => (musicOk = false));

function initAudio() {
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain();
  master.gain.value = 0.9;
  // l'analyseur écoute tout ce qui sort (ambiance + monstres) pour animer l'égaliseur
  analyser = ctx.createAnalyser();
  analyser.fftSize = 64;
  analyser.smoothingTimeConstant = 0.7;
  freqData = new Uint8Array(analyser.frequencyBinCount);
  master.connect(analyser);
  analyser.connect(ctx.destination);
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  startAmbience();
  loadTracks();
}

function noise() {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = true;
  return src;
}

/* Nappe : bourdon grave + vent */
function startAmbience() {
  const t = ctx.currentTime;
  const drone = ctx.createGain();
  drone.gain.setValueAtTime(0, t);
  drone.gain.linearRampToValueAtTime(0.045, t + 6);
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 170;
  [43.6, 44.1, 65.4].forEach((f) => {
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = f;
    o.connect(lp);
    o.start();
  });
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.05;
  lfoGain.gain.value = 70;
  lfo.connect(lfoGain).connect(lp.frequency);
  lfo.start();
  lp.connect(drone).connect(master);

  const wind = noise();
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 380;
  bp.Q.value = 0.6;
  const wg = ctx.createGain();
  wg.gain.value = 0.025;
  const wl = ctx.createOscillator();
  const wlg = ctx.createGain();
  wl.frequency.value = 0.08;
  wlg.gain.value = 0.02;
  wl.connect(wlg).connect(wg.gain);
  wl.start();
  wind.connect(bp).connect(wg).connect(master);
  wind.start();
}

/* =========================================================
   SONS DES MONSTRES
   Chaque son tourne en boucle en continu, volume à 0.
   On ne les entend qu'en maintenant Espace (mode écoute). Le volume dépend alors
   de la distance entre la section et le milieu de l'écran : fondu enchaîné au scroll.
   ========================================================= */
const TRACKS = {
  coureur:  { vol: 0.5 },
  rodeur:   { vol: 0.9 },
  claqueur: { vol: 1 },
  colosse:  { vol: 0.95 },
};
let tracksLoaded = false;

async function loadTracks() {
  await Promise.all(Object.entries(TRACKS).map(async ([name, t]) => {
    const url = `assets/sounds/${name}.mp3?v=2`;
    t.level = 0;      // volume demandé (0..1)
    t.boost = 1;      // gonflé au survol du monstre
    try {
      // voie normale (serveur local) : Web Audio, fondus précis et égaliseur réel
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.status);
      const buf = await ctx.decodeAudioData(await res.arrayBuffer());
      t.gain = ctx.createGain();
      t.gain.gain.value = 0;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      src.connect(t.gain).connect(master);
      src.start(0, Math.random() * buf.duration); // départs décalés : les boucles ne tombent pas en même temps
    } catch {
      // page ouverte en double-clic (file://) : fetch interdit, on passe par <audio>
      t.el = new Audio(url);
      t.el.loop = true;
      t.el.volume = 0;
      t.el.play().catch(() => {});
    }
  }));
  tracksLoaded = true;
}

const smooth01 = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
let musicLevel = 0;

function updateMix() {
  if (!ctx || !tracksLoaded) return;
  const mid = sy + vh / 2;
  let loudest = 0;
  for (const en of enemies) {
    const t = TRACKS[en.dataset.sound];
    if (!t || en._mc === undefined) continue;
    // 0 = milieu de l'écran au centre de la section, 1 = on vient d'en sortir
    const d = Math.abs(mid - en._mc) / (en._mh / 2 + vh * 0.35);
    // on n'entend les infectés qu'en mode écoute (Espace maintenu), comme dans le jeu
    const level = listening ? 1 - smooth01(0.45, 1, d) : 0;
    t.boost += (1 - t.boost) * 0.02;                     // le gonflement du survol retombe doucement
    const target = soundOn ? level * t.vol * t.boost : 0;
    loudest = Math.max(loudest, level);
    if (t.el) {
      // lecture <audio> (page ouverte en double-clic) : on rapproche le volume de la cible à chaque image
      const v = t.el.volume + (Math.min(1, target) - t.el.volume) * 0.12;
      t.el.volume = Math.abs(v - target) < 0.002 ? Math.min(1, target) : v;
      continue;
    }
    if (Math.abs(target - t.level) < 0.003) continue;
    t.level = target;
    if (t.gain) t.gain.gain.setTargetAtTime(target, ctx.currentTime, 0.18); // fondu ~0,5 s
  }
  // la musique s'efface derrière les monstres, et presque totalement en mode écoute
  if (musicOk && soundOn) {
    const want = listening ? 0.05 : MUSIC_VOL * (1 - 0.55 * loudest);
    musicLevel += (want - musicLevel) * 0.04;
    music.volume = Math.max(0, Math.min(1, musicLevel));
  }
}

/* Égaliseur du bouton son : 5 barres qui bougent avec ce qu'on entend */
const meterBars = $$("#soundBtn .meter i");
const meterShown = [0, 0, 0, 0, 0];
const BANDS = [[1, 2], [3, 4], [5, 7], [8, 11], [12, 18]];
const BAND_GAIN = [0.55, 0.8, 1.05, 1.35, 1.8]; // les graves (bourdon d'ambiance) sont atténués, les aigus relevés
function updateMeter(time) {
  if (!ctx) return;
  let fallback = 0;
  if (analyser) analyser.getByteFrequencyData(freqData);
  for (const t of Object.values(TRACKS)) if (t.el) fallback = Math.max(fallback, t.el.volume);
  BANDS.forEach(([a, b], i) => {
    let v = 0;
    if (analyser) { for (let k = a; k <= b; k++) v += freqData[k]; v = v / (b - a + 1) / 255; }
    // sons lus en <audio> (file://) : non mesurables, on simule à partir du volume
    if (fallback) v = Math.max(v, fallback * (0.35 + 0.65 * Math.abs(Math.sin(time * 0.009 * (i + 1.7) + i))));
    v = soundOn ? Math.min(1, Math.pow(v * BAND_GAIN[i], 1.4) * 1.7) : 0;
    meterShown[i] = Math.max(v, meterShown[i] * 0.86);  // monte vite, retombe doucement
    meterBars[i].style.transform = `scaleY(${(0.1 + meterShown[i] * 0.9).toFixed(3)})`;
  });
}

/* Battement de cœur (mode écoute) */
function sfxHeart() {
  if (!ctx || !soundOn) return;
  [0, 0.22].forEach((dt, i) => {
    const t = ctx.currentTime + dt;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(70, t);
    o.frequency.exponentialRampToValueAtTime(38, t + 0.15);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(i ? 0.35 : 0.5, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + 0.25);
  });
}

/* Musique (assets/musique.mp3 si présente) : volume piloté par updateMix */
const MUSIC_VOL = 0.22; // nappe de fond, bien en dessous des infectés

/* ---------- Le son démarre au premier geste (règle des navigateurs) ---------- */
let unlockedAt = 0;
const soundBtn = $("#soundBtn");
function unlockAudio() {
  if (ctx) return;
  unlockedAt = performance.now();
  initAudio();
  if (musicOk) {
    music.volume = 0;
    music.play().catch(() => (musicOk = false));
  }
  soundBtn.classList.add("live");
}
["pointerdown", "keydown", "touchstart"].forEach((ev) =>
  addEventListener(ev, unlockAudio, { once: true, passive: true })
);

soundBtn.addEventListener("click", () => {
  if (performance.now() - unlockedAt < 800) return; // ce clic vient d'allumer le son
  if (!ctx) return unlockAudio();
  soundOn = !soundOn;
  soundBtn.classList.toggle("muted", !soundOn);
  if (master) master.gain.setTargetAtTime(soundOn ? 0.9 : 0, ctx.currentTime, 0.2);
  if (musicOk) soundOn ? music.play().catch(() => {}) : music.pause();
  for (const t of Object.values(TRACKS)) if (t.el) soundOn ? t.el.play().catch(() => {}) : t.el.pause();
});

/* =========================================================
   MODE ÉCOUTE
   ========================================================= */
let listening = false;
let heartTimer = null;
let currentEnemy = null;
const listenBtn = $("#listenBtn");

function setListen(on) {
  if (on === listening) return;
  listening = on;
  document.body.classList.toggle("listen", on);
  listenBtn.classList.toggle("on", on);
  if (on) {
    sfxHeart();
    heartTimer = setInterval(sfxHeart, 1000);
  } else {
    clearInterval(heartTimer);
  }
}
addEventListener("keydown", (e) => {
  if (e.code !== "Space") return;
  e.preventDefault(); // y compris les répétitions quand on maintient la touche, sinon la page défile
  if (!e.repeat) setListen(true);
});
addEventListener("keyup", (e) => {
  if (e.code === "Space") { e.preventDefault(); setListen(false); }
});
listenBtn.addEventListener("pointerdown", (e) => { e.preventDefault(); setListen(true); });
["pointerup", "pointerleave", "pointercancel"].forEach((ev) =>
  listenBtn.addEventListener(ev, () => setListen(false))
);
listenBtn.addEventListener("contextmenu", (e) => e.preventDefault());

/* =========================================================
   APPARITIONS, SONS PAR SECTION, RAIL
   ========================================================= */
const enemies = $$(".enemy");
const railLinks = $$(".rail a");

const revealObs = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("seen")),
  { threshold: 0.12 }
);
$$(".reveal").forEach((el) => revealObs.observe(el));

const enemyObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const en = e.target;
      en.classList.add("in");
      currentEnemy = en;
      const cur = enemies.indexOf(en);
      railLinks.forEach((a) => {
        const idx = enemies.findIndex((x) => x.id === a.dataset.target);
        a.classList.toggle("active", idx === cur);
        a.classList.toggle("done", idx < cur);
      });
    });
  },
  { threshold: 0.3 }
);
enemies.forEach((s) => enemyObs.observe(s));

/* Survol d'un monstre : son son monte un instant puis redescend en fondu */
enemies.forEach((en) => {
  $(".cut", en).addEventListener("pointerenter", () => {
    const t = TRACKS[en.dataset.sound];
    if (t) t.boost = 1.35;
  });
});

/* =========================================================
   SCROLL FLUIDE (Lenis) + PARALLAXE
   Les positions sont mesurées une fois (et au resize),
   puis tout est calculé depuis scrollY : aucune lecture du DOM par frame.
   ========================================================= */
const hero = $("#hero");
const heroLayers = $$("#hero .layer");
const torch = $(".torch");
const speedEls = $$("[data-speed]");
const rail = $(".rail");
const railFill = $("#railFill");
const desk = $(".desk");

let lenis = null;
if (window.Lenis && !reduced) {
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true });
}
let sy = scrollY;
let vh = innerHeight;
let heroH = 0, deskTop = 0, deskH = 0;

function measure() {
  vh = innerHeight;
  heroH = hero.offsetHeight;
  deskTop = desk.offsetTop;
  deskH = desk.offsetHeight;
  enemies.forEach((en) => {
    const r = en.getBoundingClientRect();
    en._mc = r.top + scrollY + r.height / 2;
    en._mh = r.height;
  });
  speedEls.forEach((el) => {
    el.style.transform = "";
    const r = el.getBoundingClientRect();
    el._c = r.top + scrollY + r.height / 2;
    el._h = r.height;
  });
  onScroll(scrollY);
}

function onScroll(y) {
  sy = y;
  // Guide : monstres et fougères décalés par rapport au papier
  for (const el of speedEls) {
    const rel = el._c - sy - vh / 2;
    if (Math.abs(rel) > vh * 1.4 + el._h) continue;
    el.style.transform = `translate3d(0, ${(rel * el.dataset.speed).toFixed(1)}px, 0)`;
  }
  // Rail
  const p = Math.min(1, Math.max(0, (sy - deskTop + vh * 0.3) / (deskH - vh)));
  railFill.style.transform = `scaleY(${p.toFixed(4)})`;
  rail.classList.toggle("show", sy > deskTop - vh * 0.5 && sy < deskTop + deskH - vh * 0.6);
  heroDirty = true;
}

if (lenis) lenis.on("scroll", ({ scroll }) => onScroll(scroll));
else addEventListener("scroll", () => onScroll(scrollY), { passive: true });

// Hero : plans en parallaxe (scroll + souris) et lampe torche
let mx = 0, my = 0, tx = 0, ty = 0;
let cx = innerWidth / 2, cy = innerHeight * 0.42;          // curseur (coordonnées écran)
let fx = cx, fy = cy, ftx = cx, fty = cy;
let heroDirty = true;
addEventListener("pointermove", (e) => {
  tx = (e.clientX / innerWidth) * 2 - 1;
  ty = (e.clientY / innerHeight) * 2 - 1;
  cx = e.clientX;
  cy = e.clientY;
  heroDirty = true;
}, { passive: true });

function heroFrame() {
  if (sy > heroH) return;
  // la torche est dans le hero (qui défile) : on la place sous le curseur en coordonnées page
  ftx = cx;
  fty = cy + sy;
  const dx = tx - mx, dy = ty - my;
  const moving = Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001 ||
                 Math.abs(ftx - fx) > 0.5 || Math.abs(fty - fy) > 0.5;
  if (!moving && !heroDirty) return;
  heroDirty = false;
  mx += dx * 0.07;
  my += dy * 0.07;
  fx += (ftx - fx) * 0.12;
  fy += (fty - fy) * 0.12;
  for (const l of heroLayers) {
    const d = +l.dataset.depth || 0;
    const s = +l.dataset.scroll || 0;
    l.style.transform = `translate3d(${(-mx * d * 40).toFixed(1)}px, ${(-my * d * 22 + sy * s).toFixed(1)}px, 0)`;
  }
  if (torch) torch.style.transform = `translate3d(${fx.toFixed(1)}px, ${fy.toFixed(1)}px, 0)`;
}

function raf(time) {
  if (lenis) lenis.raf(time);
  heroFrame();
  updateMix();
  updateMeter(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Mesures : au chargement, au resize, et quand la page change de hauteur (images, polices)
measure();
addEventListener("resize", measure);
addEventListener("load", measure);
new ResizeObserver(() => measure()).observe(document.body);

// Liens internes : défilement fluide via Lenis
$$('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    const target = id === "#hero" || id === "#top" ? 0 : $(id);
    if (target === null) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { duration: 1.6, offset: target === 0 ? 0 : -40 });
    else (target === 0 ? scrollTo({ top: 0, behavior: "smooth" }) : target.scrollIntoView({ behavior: "smooth" }));
  });
});

/* =========================================================
   CHARGEMENT : on attend le décor, les monstres du hero et les polices,
   avec une durée mini (pour voir la barre) et maxi (si le réseau traîne)
   ========================================================= */
(function loader() {
  const MIN_MS = 1100, MAX_MS = 6000;
  const start = performance.now();
  const el = $("#loader");
  const bar = $("#loaderBar");
  const pct = $("#loaderPct");
  const files = ["assets/decor.webp", "assets/claqueur.webp", "assets/colosse.webp", "assets/decor-blur.webp"];
  const total = files.length + 1;
  let done = 0, shown = 0, finished = false;
  const step = () => done++;

  if (lenis) lenis.stop();
  scrollTo(0, 0);
  files.forEach((src) => {
    const img = new Image();
    img.onload = img.onerror = step;
    img.src = src;
  });
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(step);

  function finish() {
    if (finished) return;
    finished = true;
    el.classList.add("done");
    document.documentElement.classList.remove("is-loading");
    document.documentElement.classList.add("ready");
    if (lenis) lenis.start();
    measure();
  }

  (function tick(now) {
    const elapsed = now - start;
    // la barre suit le chargement réel, sans dépasser le temps écoulé
    const target = Math.min(done / total, elapsed / MIN_MS);
    shown += (target - shown) * 0.12;
    bar.style.transform = `scaleX(${shown.toFixed(3)})`;
    pct.textContent = `${Math.round(shown * 100)} %`;
    if ((done >= total && shown > 0.985) || elapsed > MAX_MS) {
      bar.style.transform = "scaleX(1)";
      pct.textContent = "100 %";
      return setTimeout(finish, 200);
    }
    requestAnimationFrame(tick);
  })(start);
})();

/* =========================================================
   SPORES
   ========================================================= */
const cv = $("#spores");
const c2 = cv.getContext("2d");
let W, H, DPR;
const spores = [];

function resize() {
  DPR = Math.min(devicePixelRatio || 1, 2);
  W = cv.width = innerWidth * DPR;
  H = cv.height = innerHeight * DPR;
}
resize();
addEventListener("resize", resize);

const COUNT = innerWidth < 700 ? 35 : 60;
for (let i = 0; i < COUNT; i++) {
  spores.push({
    x: Math.random(), y: Math.random(),
    z: rand(0.2, 1),
    vx: (Math.random() - 0.5) * 0.00012,
    vy: -Math.random() * 0.00018 - 0.00003,
    ph: Math.random() * Math.PI * 2,
  });
}

function sprite(rgb) {
  const c = document.createElement("canvas");
  c.width = c.height = 32;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, `rgba(${rgb},1)`);
  grad.addColorStop(0.25, `rgba(${rgb},.8)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 32, 32);
  return c;
}
const SPRITE = sprite("216,207,138");
const SPRITE_LISTEN = sprite("255,255,255");

let lastY = sy;
function draw(t) {
  requestAnimationFrame(draw);
  if (document.hidden) return;
  c2.clearRect(0, 0, W, H);
  const dy = (sy - lastY) / vh;
  lastY = sy;
  const img = listening ? SPRITE_LISTEN : SPRITE;
  for (const s of spores) {
    s.x += s.vx + Math.sin(t * 0.0004 + s.ph) * 0.00008;
    s.y += s.vy - dy * 0.25 * s.z;
    if (s.y < -0.02) s.y = 1.02;
    if (s.y > 1.02) s.y = -0.02;
    if (s.x < -0.02) s.x = 1.02;
    if (s.x > 1.02) s.x = -0.02;
    const size = (4 + s.z * 9) * DPR;
    c2.globalAlpha = (0.15 + s.z * 0.45) * (0.6 + 0.4 * Math.sin(t * 0.002 + s.ph));
    c2.drawImage(img, s.x * W - size / 2, s.y * H - size / 2, size, size);
  }
}
if (!reduced) requestAnimationFrame(draw);
