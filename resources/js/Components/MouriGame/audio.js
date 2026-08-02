/* mouri-game.audio.js — sistema de audio seguro (si la ruta es null, no hace nada) */
import { MUSICA, SONIDOS, VOLUMEN_MUSICA, VOLUMEN_SONIDOS } from "./config";

export function crearAudio() {
  const musica = { actual: null, key: null };
  let mute = false;

  const playMusica = (key) => {
    if (musica.key === key) return;
    const src = MUSICA[key];
    if (musica.actual) { musica.actual.pause(); musica.actual = null; }
    musica.key = key;
    if (!src) return;
    try {
      const a = new Audio(src);
      a.loop = true;
      a.volume = mute ? 0 : VOLUMEN_MUSICA;
      a.play().catch(() => {});
      musica.actual = a;
    } catch (e) { /* sin audio, seguimos */ }
  };

  const playSfx = (key) => {
    const src = SONIDOS[key];
    if (!src || mute) return;
    try { const a = new Audio(src); a.volume = VOLUMEN_SONIDOS; a.play().catch(() => {}); } catch (e) {}
  };

  const setMute = (v) => {
    mute = v;
    if (musica.actual) musica.actual.volume = v ? 0 : VOLUMEN_MUSICA;
  };
  const stop = () => { if (musica.actual) { musica.actual.pause(); musica.actual = null; } musica.key = null; };

  return { playMusica, playSfx, setMute, stop };
}
