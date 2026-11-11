// Aura Glass — fondo con la portada actual y tinte del cristal según la canción.
(function auraGlass() {
  if (!window.Spicetify || !Spicetify.Player || !Spicetify.Player.data || !document.body) {
    setTimeout(auraGlass, 300);
    return;
  }

  const root = document.documentElement;

  // Capa de contenido: dos capas de portada que se funden entre canciones.
  const backdrop = document.createElement("div");
  backdrop.id = "aura-backdrop";
  backdrop.innerHTML = '<div class="aura-layer"></div><div class="aura-layer"></div><div class="aura-scrim"></div>';
  document.body.prepend(backdrop);
  const layers = backdrop.querySelectorAll(".aura-layer");
  let front = 0;

  function coverUrl(item) {
    const meta = (item && item.metadata) || {};
    const uri = meta.image_xlarge_url || meta.image_large_url || meta.image_url || "";
    return uri.startsWith("spotify:image:")
      ? "https://i.scdn.co/image/" + uri.slice("spotify:image:".length)
      : uri;
  }

  function hexToRgb(hex) {
    const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex || "");
    return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null;
  }

  async function update() {
    const item = Spicetify.Player.data && Spicetify.Player.data.item;
    if (!item) return;

    const url = coverUrl(item);
    if (url) {
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

    // Tinte del cristal: color oscuro y vibrante de la portada.
    try {
      const colors = await Spicetify.colorExtractor(item.uri);
      const rgb = hexToRgb(colors.DARK_VIBRANT) || hexToRgb(colors.DESATURATED) || [28, 28, 34];
      root.style.setProperty("--aura-tint", rgb.join(","));
    } catch (e) {
      root.style.setProperty("--aura-tint", "28,28,34");
    }
  }

  Spicetify.Player.addEventListener("songchange", update);
  update();
})();
