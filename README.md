# Aura Glass

Tema para [Spicetify](https://spicetify.app) inspirado en el Liquid Glass de Apple.

![Vista previa](preview.png)

## Cómo es

- **Fondo vivo**: la portada de la canción que suena, desenfocada a pantalla completa, con un movimiento lento y un fundido al cambiar de canción.
- **Cristal teñido**: la barra lateral, la barra superior, el panel derecho y los menús son de cristal esmerilado, teñido con el color de la portada.
- **Reproductor en cápsula**: el reproductor flota como una cápsula de cristal y el botón de play es el único elemento destacado.
- **El contenido se lee primero**: la vista central no lleva cristal, solo un oscurecido suave para que el texto se lea bien.
- **Accesible**: respeta "reducir transparencia", "más contraste" y "reducir movimiento" del sistema.

## Instalación

### Desde el Marketplace

Abre el Marketplace de Spicetify en Spotify, ve a **Themes**, busca **Aura Glass** e instálalo.

### A mano

1. Copia esta carpeta en la carpeta de temas de Spicetify:
   - Windows: `%APPDATA%\spicetify\Themes\AuraGlass`
   - macOS / Linux: `~/.config/spicetify/Themes/AuraGlass`
2. Ejecuta:

```bash
spicetify config current_theme AuraGlass color_scheme Noche inject_css 1 replace_colors 1 inject_theme_js 1
spicetify apply
```

## Personalizar

Las variables están al principio de `user.css`:

| Variable | Qué cambia |
| --- | --- |
| `--aura-blur` | Desenfoque del cristal |
| `--aura-fill`, `--aura-fill-strong` | Opacidad del cristal |
| `--aura-radius` | Redondeo de los paneles |
| `--aura-content` | Oscurecido de la vista central |

## Requisitos

Spotify de escritorio (no la versión de Microsoft Store) y Spicetify 2.x. Probado con Spotify 1.3.8 y Spicetify 2.46.4.

## Licencia

MIT
