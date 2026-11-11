// Aura Glass — Liquid Glass para Spotify (Spicetify)
// Fondo con la portada, cristal teñido, panel de ajustes, modo escaparate
// con letras sincronizadas, mini ecualizador, foco en tarjetas y temporizador.
(function auraGlass() {
  const S = window.Spicetify;
  if (!S || !S.Player || !S.Player.data || !S.Topbar || !S.PopupModal || !document.body) {
    setTimeout(auraGlass, 300);
    return;
  }

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ------------------------------------------------------------------ */
  /* Ajustes                                                              */
  /* ------------------------------------------------------------------ */

  const STORE_KEY = "aura-glass:settings";
  const PRESETS = {
    medianoche: { name: "Medianoche", tint: [24, 26, 46], accent: "#8EA2FF" },
    glaciar: { name: "Glaciar", tint: [14, 40, 52], accent: "#7FE3F0" },
    coral: { name: "Coral", tint: [52, 22, 28], accent: "#FF8A7A" },
    bosque: { name: "Bosque", tint: [16, 40, 30], accent: "#7CE0A8" },
  };
  const DEFAULTS = {
    color: "auto",          // auto | medianoche | glaciar | coral | bosque | custom
    custom: "#8EA2FF",
    blur: 36,               // px
    glass: 0.52,            // opacidad del cristal
    brightness: 0.62,       // brillo del fondo
    radius: 22,             // px
    equalizer: true,
    spotlight: true,
    motion: true,
    lowPower: false,
  };

  function loadSettings() {
    try {
      const raw = S.LocalStorage.get(STORE_KEY);
      return Object.assign({}, DEFAULTS, raw ? JSON.parse(raw) : {});
    } catch (e) {
      return Object.assign({}, DEFAULTS);
    }
  }
  let settings = loadSettings();

  function saveSettings() {
    try { S.LocalStorage.set(STORE_KEY, JSON.stringify(settings)); } catch (e) { /* sin almacenamiento */ }
  }

  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

  function hexToRgb(hex) {
    const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex || "");
    return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null;
  }

  // Un color cualquiera puede ser demasiado claro para el cristal: lo
  // oscurecemos hasta una luminancia que mantiene legible el texto blanco.
  function tintFromAccent(rgb) {
    const lum = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
    const factor = clamp(0.2 / Math.max(lum, 0.01), 0.12, 0.6);
    return rgb.map((c) => Math.round(c * factor));
  }

  /* ------------------------------------------------------------------ */
  /* Fondo con la portada y color                                         */
  /* ------------------------------------------------------------------ */

  const backdrop = document.createElement("div");
  backdrop.id = "aura-backdrop";
  backdrop.setAttribute("aria-hidden", "true");
  backdrop.innerHTML = '<div class="aura-layer"></div><div class="aura-layer"></div><div class="aura-scrim"></div>';
  document.body.prepend(backdrop);
  const layers = backdrop.querySelectorAll(".aura-layer");
  let front = 0;
  let coverColors = { tint: [28, 28, 34], accent: "#F5F5F7" };
  let currentCover = "";

  function coverUrl(item) {
    const meta = (item && item.metadata) || {};
    const uri = meta.image_xlarge_url || meta.image_large_url || meta.image_url || "";
    return uri.startsWith("spotify:image:")
      ? "https://i.scdn.co/image/" + uri.slice("spotify:image:".length)
      : uri;
  }

  function setBackdrop(url) {
    if (!url || url === currentCover) return;
    currentCover = url;
    const next = layers[1 - front];
    const img = new Image();
    img.onload = () => {
      next.style.backgroundImage = 'url("' + url + '")';
      next.classList.add("is-visible");
      layers[front].classList.remove("is-visible");
      front = 1 - front;
    };
    img.src = url;
  }

  function applyColors() {
    let tint;
    let accent;
    if (settings.color === "auto") {
      tint = coverColors.tint;
      accent = coverColors.accent;
    } else if (settings.color === "custom") {
      const rgb = hexToRgb(settings.custom) || [142, 162, 255];
      tint = tintFromAccent(rgb);
      accent = settings.custom;
    } else {
      const p = PRESETS[settings.color] || PRESETS.medianoche;
      tint = p.tint;
      accent = p.accent;
    }
    root.style.setProperty("--aura-tint", tint.join(","));
    root.style.setProperty("--aura-accent", accent);
  }

  function applySettings() {
    // En bajo consumo limitamos el desenfoque, que es lo que más GPU gasta.
    root.style.setProperty("--aura-blur", (settings.lowPower ? Math.min(16, settings.blur) : settings.blur) + "px");
    root.style.setProperty("--aura-glass-alpha", String(settings.glass));
    root.style.setProperty("--aura-bg-brightness", String(settings.brightness));
    root.style.setProperty("--aura-radius", settings.radius + "px");
    root.classList.toggle("aura-no-eq", !settings.equalizer);
    root.classList.toggle("aura-no-spotlight", !settings.spotlight || settings.lowPower);
    root.classList.toggle("aura-still", !settings.motion);
    root.classList.toggle("aura-low-power", settings.lowPower);
    applyColors();
  }

  // Color propio a partir de la portada: Spicetify.colorExtractor devuelve
  // null en algunas versiones de Spotify, así que no dependemos de él.
  function extractFromImage(url) {
    return new Promise((resolve) => {
      if (!url) return resolve(null);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onerror = () => resolve(null);
      img.onload = () => {
        try {
          const size = 32;
          const canvas = document.createElement("canvas");
          canvas.width = canvas.height = size;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          ctx.drawImage(img, 0, 0, size, size);
          const data = ctx.getImageData(0, 0, size, size).data;
          let r = 0, g = 0, b = 0, total = 0;
          for (let i = 0; i < data.length; i += 4) {
            const pr = data[i], pg = data[i + 1], pb = data[i + 2];
            const max = Math.max(pr, pg, pb), min = Math.min(pr, pg, pb);
            const sat = max === 0 ? 0 : (max - min) / max;
            const light = max / 255;
            // Pesan más los píxeles saturados y de luz media: el "color" de la portada.
            const w = 0.05 + sat * sat * (1 - Math.abs(light - 0.55));
            r += pr * w; g += pg * w; b += pb * w; total += w;
          }
          const base = [r / total, g / total, b / total];
          // Acento: el mismo tono, llevado a un brillo legible sobre oscuro.
          const max = Math.max(...base, 1);
          const accent = base.map((c) => Math.round(clamp((c / max) * 235 + 20, 0, 255)));
          resolve({ tint: tintFromAccent(base.map(Math.round)), accent });
        } catch (e) {
          resolve(null); // imagen sin CORS: canvas "contaminado"
        }
      };
      img.src = url;
    });
  }

  const toHex = (rgb) => "#" + rgb.map((c) => c.toString(16).padStart(2, "0")).join("");

  async function onSongChange() {
    const item = S.Player.data && S.Player.data.item;
    if (!item) return;
    const url = coverUrl(item);
    setBackdrop(url);
    let colors = null;
    try {
      const c = await S.colorExtractor(item.uri);
      const dark = c && (hexToRgb(c.DARK_VIBRANT) || hexToRgb(c.DESATURATED));
      if (dark) colors = { tint: dark, accent: c.LIGHT_VIBRANT || c.VIBRANT || "#F5F5F7" };
    } catch (e) { /* usamos el nuestro */ }
    if (!colors) {
      const own = await extractFromImage(url);
      if (own) colors = { tint: own.tint, accent: toHex(own.accent) };
    }
    // Si mientras tanto cambió la canción, no aplicamos colores viejos.
    if (!S.Player.data || !S.Player.data.item || S.Player.data.item.uri !== item.uri) return;
    coverColors = colors || { tint: [28, 28, 34], accent: "#F5F5F7" };
    applyColors();
    ensureEqualizer();
    if (showcase.open) showcase.load(item);
    sleep.onSongChange();
  }

  /* ------------------------------------------------------------------ */
  /* Estado de reproducción, visibilidad y ahorro                         */
  /* ------------------------------------------------------------------ */

  function onPlayPause() {
    root.classList.toggle("aura-paused", !S.Player.isPlaying());
  }

  // Con la ventana oculta no animamos nada: ahorra GPU y batería.
  document.addEventListener("visibilitychange", () => {
    root.classList.toggle("aura-hidden", document.hidden);
    if (showcase.open) showcase.loop(!document.hidden);
  });

  /* ------------------------------------------------------------------ */
  /* Mini ecualizador junto al título                                     */
  /* ------------------------------------------------------------------ */

  function ensureEqualizer() {
    const host = document.querySelector(".main-nowPlayingWidget-trackInfo, .main-trackInfo-container");
    if (!host || host.querySelector(".aura-eq")) return;
    const eq = document.createElement("span");
    eq.className = "aura-eq";
    eq.setAttribute("aria-hidden", "true");
    eq.innerHTML = "<i></i><i></i><i></i><i></i>";
    host.appendChild(eq);
  }
  // React vuelve a pintar el reproductor a veces; lo reponemos si desaparece.
  new MutationObserver(() => ensureEqualizer()).observe(
    document.querySelector(".Root__now-playing-bar") || document.body,
    { childList: true, subtree: true }
  );

  /* ------------------------------------------------------------------ */
  /* Foco de luz en tarjetas                                              */
  /* ------------------------------------------------------------------ */

  let spotlightFrame = 0;
  document.addEventListener("pointermove", (e) => {
    if (root.classList.contains("aura-no-spotlight") || spotlightFrame) return;
    spotlightFrame = requestAnimationFrame(() => {
      spotlightFrame = 0;
      const card = e.target.closest && e.target.closest(".main-card-card");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--aura-x", (e.clientX - r.left) + "px");
      card.style.setProperty("--aura-y", (e.clientY - r.top) + "px");
    });
  }, { passive: true });

  /* ------------------------------------------------------------------ */
  /* Temporizador de apagado (con bajada suave de volumen)                */
  /* ------------------------------------------------------------------ */

  const FADE_MS = 30000;
  const sleep = {
    mode: null,          // "time" | "track"
    endAt: 0,
    startVolume: null,
    timer: 0,
    listeners: new Set(),

    start(mode, minutes) {
      this.cancel(true);
      this.mode = mode;
      this.endAt = mode === "time" ? Date.now() + minutes * 60000 : 0;
      this.timer = setInterval(() => this.tick(), 500);
      this.notify();
      S.showNotification(mode === "time"
        ? "Temporizador: se pausará en " + minutes + " min"
        : "Temporizador: se pausará al acabar la canción");
    },

    remainingMs() {
      if (this.mode === "time") return Math.max(0, this.endAt - Date.now());
      if (this.mode === "track") return Math.max(0, S.Player.getDuration() - S.Player.getProgress());
      return 0;
    },

    tick() {
      const left = this.remainingMs();
      const fadeWindow = this.mode === "track" ? 6000 : FADE_MS;
      if (left <= fadeWindow && S.Player.isPlaying()) {
        if (this.startVolume === null) this.startVolume = S.Player.getVolume();
        S.Player.setVolume(this.startVolume * (left / fadeWindow));
      }
      if (this.mode === "time" && left <= 0) this.finish();
      this.notify();
    },

    onSongChange() {
      if (this.mode === "track" && this.startVolume !== null) this.finish();
    },

    finish() {
      S.Player.pause();
      const vol = this.startVolume;
      this.cancel(true);
      // Devolvemos el volumen cuando ya está en pausa.
      if (vol !== null) setTimeout(() => S.Player.setVolume(vol), 800);
      S.showNotification("Temporizador: reproducción pausada");
    },

    cancel(silent) {
      clearInterval(this.timer);
      if (!silent && this.startVolume !== null) S.Player.setVolume(this.startVolume);
      this.mode = null;
      this.endAt = 0;
      this.startVolume = null;
      this.timer = 0;
      this.notify();
    },

    label() {
      if (!this.mode) return "Apagado";
      if (this.mode === "track") return "Al acabar la canción";
      const s = Math.ceil(this.remainingMs() / 1000);
      return "Quedan " + Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
    },

    notify() { this.listeners.forEach((fn) => fn()); },
  };

  /* ------------------------------------------------------------------ */
  /* Letras sincronizadas (para el escaparate)                            */
  /* ------------------------------------------------------------------ */

  const lyricsCache = new Map();
  async function fetchLyrics(uri) {
    if (lyricsCache.has(uri)) return lyricsCache.get(uri);
    const id = (uri || "").split(":")[2];
    let result = null;
    if (id) {
      try {
        const res = await S.CosmosAsync.get(
          "https://spclient.wg.spotify.com/color-lyrics/v2/track/" + id +
          "?format=json&vocalRemoval=false&market=from_token"
        );
        const l = res && res.lyrics;
        if (l && Array.isArray(l.lines)) {
          const lines = l.lines
            .map((x) => ({ t: Number(x.startTimeMs) || 0, text: (x.words || "").trim() }))
            .filter((x) => x.text && x.text !== "♪");
          if (lines.length) result = { synced: l.syncType === "LINE_SYNCED", lines };
        }
      } catch (e) { /* sin letra */ }
    }
    lyricsCache.set(uri, result);
    return result;
  }

  /* ------------------------------------------------------------------ */
  /* Modo escaparate (Alt + S)                                            */
  /* ------------------------------------------------------------------ */

  const fmt = (ms) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  };

  const showcase = {
    open: false,
    el: null,
    raf: 0,
    lyrics: null,
    active: -1,
    lastFocus: null,
    minute: -1,

    build() {
      const el = document.createElement("div");
      el.className = "aura-showcase";
      el.setAttribute("role", "dialog");
      el.setAttribute("aria-modal", "true");
      el.setAttribute("aria-label", "Modo escaparate");
      el.innerHTML = [
        '<div class="aura-sc-bg" aria-hidden="true"></div>',
        '<button class="aura-sc-close" type="button" aria-label="Salir del modo escaparate (Esc)">✕</button>',
        '<div class="aura-sc-clock" aria-hidden="true"></div>',
        '<div class="aura-sc-stage">',
        '  <div class="aura-sc-disc" aria-hidden="true">',
        '    <div class="aura-sc-vinyl"><div class="aura-sc-label"></div></div>',
        '    <img class="aura-sc-cover" alt="">',
        '  </div>',
        '  <div class="aura-sc-info">',
        '    <h2 class="aura-sc-title"></h2>',
        '    <p class="aura-sc-artist"></p>',
        '    <div class="aura-sc-lyrics" aria-live="off"></div>',
        '    <div class="aura-sc-progress">',
        '      <span class="aura-sc-time aura-sc-elapsed">0:00</span>',
        '      <div class="aura-sc-bar" role="slider" tabindex="0" aria-label="Posición de la canción" aria-valuemin="0">',
        '        <div class="aura-sc-fill"></div>',
        '      </div>',
        '      <span class="aura-sc-time aura-sc-total">0:00</span>',
        '    </div>',
        '    <div class="aura-sc-controls">',
        '      <button type="button" class="aura-sc-btn" data-act="back" aria-label="Anterior">',
        '        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7h1.6z"/></svg>',
        '      </button>',
        '      <button type="button" class="aura-sc-btn aura-sc-play" data-act="toggle" aria-label="Reproducir o pausar">',
        '        <svg class="aura-i-play" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z"/></svg>',
        '        <svg class="aura-i-pause" viewBox="0 0 16 16" aria-hidden="true"><path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"/></svg>',
        '      </button>',
        '      <button type="button" class="aura-sc-btn" data-act="next" aria-label="Siguiente">',
        '        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-1.6z"/></svg>',
        '      </button>',
        '    </div>',
        '  </div>',
        '</div>',
      ].join("");

      el.querySelector(".aura-sc-close").addEventListener("click", () => this.toggle(false));
      el.querySelector(".aura-sc-controls").addEventListener("click", (e) => {
        const act = e.target.closest("[data-act]");
        if (!act) return;
        if (act.dataset.act === "back") S.Player.back();
        if (act.dataset.act === "next") S.Player.next();
        if (act.dataset.act === "toggle") S.Player.togglePlay();
      });

      const bar = el.querySelector(".aura-sc-bar");
      const seekFromPointer = (e) => {
        const r = bar.getBoundingClientRect();
        S.Player.seek(clamp((e.clientX - r.left) / r.width, 0, 1) * S.Player.getDuration());
      };
      bar.addEventListener("click", seekFromPointer);
      bar.addEventListener("keydown", (e) => {
        const step = e.shiftKey ? 30000 : 5000;
        if (e.key === "ArrowRight") S.Player.seek(Math.min(S.Player.getDuration(), S.Player.getProgress() + step));
        else if (e.key === "ArrowLeft") S.Player.seek(Math.max(0, S.Player.getProgress() - step));
        else return;
        e.preventDefault();
      });

      // Clic en una línea de la letra: salta a ese momento.
      el.querySelector(".aura-sc-lyrics").addEventListener("click", (e) => {
        const line = e.target.closest("[data-t]");
        if (line && this.lyrics && this.lyrics.synced) S.Player.seek(Number(line.dataset.t));
      });

      el.addEventListener("keydown", (e) => {
        if (e.key === "Escape") { e.stopPropagation(); this.toggle(false); }
        if (e.key === " " && e.target === el) { e.preventDefault(); S.Player.togglePlay(); }
      });

      document.body.appendChild(el);
      this.el = el;
    },

    toggle(force) {
      const want = typeof force === "boolean" ? force : !this.open;
      if (want === this.open) return;
      if (!this.el) this.build();
      this.open = want;
      this.el.classList.toggle("is-open", want);
      root.classList.toggle("aura-showcase-open", want);
      if (want) {
        this.lastFocus = document.activeElement;
        this.load(S.Player.data && S.Player.data.item);
        this.loop(true);
        this.el.querySelector(".aura-sc-close").focus();
      } else {
        this.loop(false);
        if (this.lastFocus && this.lastFocus.focus) this.lastFocus.focus();
      }
    },

    async load(item) {
      if (!this.el || !item) return;
      const meta = item.metadata || {};
      const url = coverUrl(item);
      this.el.querySelector(".aura-sc-bg").style.backgroundImage = url ? 'url("' + url + '")' : "";
      this.el.querySelector(".aura-sc-cover").src = url;
      this.el.querySelector(".aura-sc-label").style.backgroundImage = url ? 'url("' + url + '")' : "";
      this.el.querySelector(".aura-sc-title").textContent = meta.title || item.name || "";
      this.el.querySelector(".aura-sc-artist").textContent =
        meta.artist_name || (item.artists || []).map((a) => a.name).join(", ");

      const box = this.el.querySelector(".aura-sc-lyrics");
      box.replaceChildren();
      this.active = -1;
      this.lyrics = null;
      const uri = item.uri;
      const lyrics = await fetchLyrics(uri);
      // Si cambió la canción mientras cargaba, no pintamos una letra vieja.
      if (!S.Player.data || !S.Player.data.item || S.Player.data.item.uri !== uri) return;
      this.lyrics = lyrics;
      box.classList.toggle("is-empty", !lyrics);
      box.classList.toggle("is-unsynced", !!lyrics && !lyrics.synced);
      if (!lyrics) {
        const p = document.createElement("p");
        p.className = "aura-sc-line is-note";
        p.textContent = "Sin letra para esta canción";
        box.appendChild(p);
        return;
      }
      lyrics.lines.forEach((l) => {
        const p = document.createElement("p");
        p.className = "aura-sc-line";
        p.dataset.t = String(l.t);
        p.textContent = l.text;
        box.appendChild(p);
      });
    },

    loop(run) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
      if (!run || !this.open) return;
      const step = () => {
        this.update();
        this.raf = requestAnimationFrame(step);
      };
      this.raf = requestAnimationFrame(step);
    },

    update() {
      const el = this.el;
      const pos = S.Player.getProgress();
      const dur = S.Player.getDuration() || 1;
      el.querySelector(".aura-sc-fill").style.transform = "scaleX(" + clamp(pos / dur, 0, 1) + ")";
      el.querySelector(".aura-sc-elapsed").textContent = fmt(pos);
      el.querySelector(".aura-sc-total").textContent = fmt(dur);
      const bar = el.querySelector(".aura-sc-bar");
      bar.setAttribute("aria-valuemax", String(Math.round(dur / 1000)));
      bar.setAttribute("aria-valuenow", String(Math.round(pos / 1000)));
      bar.setAttribute("aria-valuetext", fmt(pos) + " de " + fmt(dur));
      el.classList.toggle("is-playing", S.Player.isPlaying());

      const now = new Date();
      if (now.getMinutes() !== this.minute) {
        this.minute = now.getMinutes();
        el.querySelector(".aura-sc-clock").textContent =
          now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }

      if (!this.lyrics || !this.lyrics.synced) return;
      // Búsqueda binaria de la línea activa.
      const lines = this.lyrics.lines;
      let lo = 0;
      let hi = lines.length - 1;
      let idx = -1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (lines[mid].t <= pos + 150) { idx = mid; lo = mid + 1; } else hi = mid - 1;
      }
      if (idx === this.active) return;
      const nodes = el.querySelectorAll(".aura-sc-line");
      if (nodes[this.active]) nodes[this.active].classList.remove("is-active");
      this.active = idx;
      nodes.forEach((n, i) => n.classList.toggle("is-past", i < idx));
      const cur = nodes[idx];
      if (cur) {
        cur.classList.add("is-active");
        // Solo desplazamos la caja de letras (scrollIntoView movería toda la pantalla).
        const box = cur.parentElement;
        box.scrollTo({
          top: cur.offsetTop - box.clientHeight / 2 + cur.offsetHeight / 2,
          behavior: reduceMotion.matches ? "auto" : "smooth",
        });
      }
    },
  };

  document.addEventListener("keydown", (e) => {
    if (e.altKey && !e.ctrlKey && !e.metaKey && e.code === "KeyS") {
      e.preventDefault();
      showcase.toggle();
    }
  });

  /* ------------------------------------------------------------------ */
  /* Panel de ajustes                                                     */
  /* ------------------------------------------------------------------ */

  function el(tag, attrs, children) {
    const n = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (k === "text") n.textContent = v;
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    });
    (children || []).forEach((c) => c && n.appendChild(c));
    return n;
  }

  let uid = 0;
  function rangeRow(label, key, min, max, step, unit, toText) {
    const id = "aura-r" + (++uid);
    const out = el("output", { for: id, text: toText(settings[key]) + unit });
    const input = el("input", {
      type: "range", id, min: String(min), max: String(max), step: String(step),
      value: String(settings[key]),
      oninput: (e) => {
        settings[key] = Number(e.target.value);
        out.textContent = toText(settings[key]) + unit;
        applySettings();
        saveSettings();
      },
    });
    return el("div", { class: "aura-row" }, [el("label", { for: id, text: label }), input, out]);
  }

  function toggleRow(label, key, hint) {
    const id = "aura-t" + (++uid);
    const input = el("input", {
      type: "checkbox", id, role: "switch",
      onchange: (e) => { settings[key] = e.target.checked; applySettings(); saveSettings(); },
    });
    input.checked = !!settings[key];
    return el("div", { class: "aura-row aura-row-toggle" }, [
      el("label", { for: id }, [el("span", { text: label }), hint ? el("small", { text: hint }) : null]),
      input,
    ]);
  }

  function openStudio() {
    const pct = (v) => Math.round(v * 100);
    const same = (v) => v;

    // Colores
    const colorOptions = [["auto", "Portada"]].concat(
      Object.entries(PRESETS).map(([k, p]) => [k, p.name]),
      [["custom", "Personal"]]
    );
    const swatches = el("div", { class: "aura-swatches", role: "radiogroup", "aria-label": "Color del cristal" });
    const picker = el("input", {
      type: "color", value: settings.custom, "aria-label": "Color personal",
      oninput: (e) => {
        settings.custom = e.target.value;
        settings.color = "custom";
        syncSwatches();
        applySettings();
        saveSettings();
      },
    });
    function syncSwatches() {
      swatches.querySelectorAll("button").forEach((b) => {
        const on = b.dataset.value === settings.color;
        b.setAttribute("aria-checked", String(on));
        b.tabIndex = on ? 0 : -1;
      });
    }
    colorOptions.forEach(([value, name]) => {
      const dot = el("span", { class: "aura-swatch-dot", "aria-hidden": "true" });
      if (PRESETS[value]) dot.style.background = PRESETS[value].accent;
      if (value === "custom") dot.style.background = settings.custom;
      swatches.appendChild(el("button", {
        type: "button", role: "radio", "data-value": value, class: "aura-swatch",
        onclick: () => {
          settings.color = value;
          syncSwatches();
          applySettings();
          saveSettings();
          if (value === "custom") picker.click();
        },
      }, [dot, el("span", { text: name })]));
    });
    swatches.addEventListener("keydown", (e) => {
      if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(e.key)) return;
      e.preventDefault();
      const btns = [...swatches.querySelectorAll("button")];
      const i = btns.findIndex((b) => b.dataset.value === settings.color);
      const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
      btns[(i + dir + btns.length) % btns.length].click();
      swatches.querySelector('[aria-checked="true"]').focus();
    });
    syncSwatches();

    // Temporizador
    const sleepStatus = el("p", { class: "aura-sleep-status", "aria-live": "polite", text: sleep.label() });
    const updateSleep = () => { sleepStatus.textContent = sleep.label(); };
    sleep.listeners.add(updateSleep);
    const sleepButtons = el("div", { class: "aura-chips" }, [15, 30, 45, 60].map((m) =>
      el("button", { type: "button", class: "aura-chip", text: m + " min", onclick: () => sleep.start("time", m) })
    ).concat([
      el("button", { type: "button", class: "aura-chip", text: "Al acabar la canción", onclick: () => sleep.start("track") }),
      el("button", { type: "button", class: "aura-chip aura-chip-quiet", text: "Cancelar", onclick: () => sleep.cancel() }),
    ]));

    const content = el("div", { class: "aura-studio" }, [
      el("section", {}, [el("h3", { text: "Color" }), swatches, el("div", { class: "aura-row" }, [
        el("label", { text: "Color personal" }), picker,
      ])]),
      el("section", {}, [
        el("h3", { text: "Cristal" }),
        rangeRow("Desenfoque", "blur", 8, 60, 1, " px", same),
        rangeRow("Opacidad", "glass", 0.3, 0.85, 0.01, " %", pct),
        rangeRow("Redondeo", "radius", 6, 32, 1, " px", same),
        rangeRow("Brillo del fondo", "brightness", 0.3, 1, 0.01, " %", pct),
      ]),
      el("section", {}, [
        el("h3", { text: "Efectos" }),
        toggleRow("Movimiento del fondo", "motion"),
        toggleRow("Mini ecualizador", "equalizer"),
        toggleRow("Foco de luz en tarjetas", "spotlight"),
        toggleRow("Bajo consumo", "lowPower", "Menos desenfoque y sin animaciones"),
      ]),
      el("section", {}, [el("h3", { text: "Temporizador de apagado" }), sleepButtons, sleepStatus,
        el("p", { class: "aura-hint", text: "Baja el volumen poco a poco antes de pausar y luego lo devuelve a su nivel." })]),
      el("section", { class: "aura-studio-footer" }, [
        el("button", { type: "button", class: "aura-chip", text: "Modo escaparate (Alt + S)", onclick: () => { S.PopupModal.hide(); showcase.toggle(true); } }),
        el("button", {
          type: "button", class: "aura-chip aura-chip-quiet", text: "Restablecer",
          onclick: () => { settings = Object.assign({}, DEFAULTS); saveSettings(); applySettings(); S.PopupModal.hide(); openStudio(); },
        }),
      ]),
    ]);

    // Al cerrar el panel dejamos de escuchar el temporizador.
    const stop = new MutationObserver(() => {
      if (!document.body.contains(content)) { sleep.listeners.delete(updateSleep); stop.disconnect(); }
    });
    stop.observe(document.body, { childList: true, subtree: true });

    S.PopupModal.display({ title: "Aura Glass", content, isLarge: true });
  }

  /* ------------------------------------------------------------------ */
  /* Botones de la barra superior                                         */
  /* ------------------------------------------------------------------ */

  const ICON_STUDIO = '<svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 1.5a6.5 6.5 0 1 0 0 13c.9 0 1.4-.6 1.4-1.3 0-.4-.2-.7-.4-1-.2-.2-.3-.5-.3-.8 0-.7.6-1.2 1.3-1.2h1.4A3.1 3.1 0 0 0 14.5 7C14.5 3.9 11.6 1.5 8 1.5zM4.5 8.2a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm2-2.7a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm3 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm2 2.7a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/></svg>';
  const ICON_SHOWCASE = '<svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 1.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zM8 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>';
  new S.Topbar.Button("Ajustes de Aura Glass", ICON_STUDIO, openStudio);
  new S.Topbar.Button("Modo escaparate (Alt + S)", ICON_SHOWCASE, () => showcase.toggle(true));

  /* ------------------------------------------------------------------ */
  /* Arranque                                                             */
  /* ------------------------------------------------------------------ */

  applySettings();
  S.Player.addEventListener("songchange", onSongChange);
  S.Player.addEventListener("onplaypause", onPlayPause);
  onSongChange();
  onPlayPause();
})();
