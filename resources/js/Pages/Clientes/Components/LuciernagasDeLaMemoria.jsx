import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

/* =====================================================================
 *  LUCIÉRNAGAS DE LA MEMORIA — VERSIÓN 3D
 *  =====================================================================
 *  Requiere: npm install three
 *
 *  Primera persona, en un campo nocturno. Caminas de verdad (WASD /
 *  flechas en computador, joystick virtual en móvil) SIEMPRE, en todos
 *  los modos — nunca se quita. Giras la cabeza con el mouse, atrapas
 *  luciérnagas o disparas luz con un clic, según lo que apuntes.
 *
 *  TODO LO PERSONALIZABLE ESTÁ ARRIBA:
 *    1. ASSETS_2D   -> sprites planos superpuestos (manos de Mouri, mira)
 *    2. TEXTURAS    -> imágenes opcionales para el entorno 3D
 *    3. PALABRAS    -> los sets de palabras que arman cada frase / logro
 *    4. MUSICA      -> música ambiental y efectos (null = sin audio)
 *    5. NIVELES     -> dificultad de cada modo
 *    6. T           -> números generales
 *
 *  ----------------------------------------------------------------
 *  NUEVO EN ESTA VERSIÓN:
 *   - Tercer enemigo: LA GRIETA 🕳️ — grande, lenta, resistente (necesita
 *     varios disparos). No va tras ti ni las luciérnagas: va directo al
 *     ALTAR. Si llega, le quita vida de verdad.
 *   - El altar ahora tiene una barra de vida propia (visible cuando hay
 *     Grietas en el modo). Protegerlo es un objetivo real, no decorativo.
 *   - Faroles de Poder 🕯️ — 4 puntos fijos repartidos por el mapa. Al
 *     acercarte, te dan una "Bendición" temporal (mejor puntería y disparo
 *     más certero). Le dan propósito real a caminar, EN TODOS LOS MODOS.
 *   - Modo Supervivencia 🏆 nuevo: no hay que "ganar" atrapando todo —
 *     las palabras se desbloquean solas con el tiempo, como logros. El
 *     objetivo real es defender el altar; la dificultad sube poco a poco
 *     mientras resistes, y termina cuando el altar se apaga del todo.
 * ===================================================================== */

/* --------------------------------------------- 1. SPRITES PLANOS (2D) */
const ASSETS_2D = {
  mouriManos: "🧤",   // manos/farol en primera persona (abajo). Pon tu PNG aquí.
  mira: "✛",          // mira/retícula del centro
};

/* --------------------------------------------------- 2. TEXTURAS 3D */
const TEXTURAS = {
  suelo: null,   // "/images/luciernagas3d/pasto.jpg"
  colinas: null, // "/images/luciernagas3d/colinas.png"
  luna: null,    // "/images/luciernagas3d/luna.png"
  arbol: null,   // "/images/luciernagas3d/arbol.png"
};

/* ----------------------------------------------------------- 3. PALABRAS */
const SETS_DE_PALABRAS = [
  ["Cada", "recuerdo", "es", "una", "luz", "que", "no", "se", "apaga"],
  ["El", "amor", "que", "diste", "sigue", "aquí", "brillando"],
  ["Mientras", "alguien", "recuerde", "nunca", "estarás", "solo"],
  ["Tu", "historia", "sigue", "viva", "en", "cada", "corazón"],
];

/* -------------------------------------------------------------- 4. MÚSICA
 * Sistema seguro: si dejas cualquier ruta en null, no suena nada.       */
const MUSICA = {
  ambienteTranquilo: null, // "/images/luciernagas3d/audio/ambiente_tranquilo.mp3"
  ambienteAccion: null,    // "/images/luciernagas3d/audio/ambiente_accion.mp3"
  atrapar: null,
  deseo: null,
  combo: null,
  disparo: null,
  impacto: null,
  robo: null,
  logro: null,   // "/images/luciernagas3d/audio/logro.mp3" (Supervivencia)
  farol: null,   // "/images/luciernagas3d/audio/farol.mp3"
  altarDanio: null, // "/images/luciernagas3d/audio/altar_danio.mp3"
};
const VOLUMEN_MUSICA = 0.35;
const VOLUMEN_SFX = 0.6;

/* -------------------------------------------------------------- 5. NIVELES
 * "libre" y "recuerdo" siguen serenos (Libre sin enemigos del todo).
 * "accion" y "supervivencia" incluyen los 3 enemigos: Sombra, Susurro y
 * La Grieta (va al altar). "supervivencia" es infinito y escala solo.   */
const NIVELES = {
  libre: {
    dur: null, spawnRate: 1.4, vidaMin: 6, vidaMax: 10, maxSimultaneas: 5,
    estrellaMin: 5, estrellaMax: 10, maxEstrellas: 2, musica: "ambienteTranquilo",
    sombraMin: 0, sombraMax: 0, sombraVel: 0, sombraMax_activas: 0, sombraEscala: 0,
    susurroMin: 0, susurroMax: 0, susurroVel: 0, susurroMaxActivas: 0, susurroEscala: 0,
    grietaMin: 0, grietaMax: 0, grietaMaxActivas: 0, grietaEscala: 0, grietaGolpes: 1,
  },
  recuerdo: {
    dur: 70, spawnRate: 1.2, vidaMin: 6, vidaMax: 10, maxSimultaneas: 6,
    estrellaMin: 5, estrellaMax: 10, maxEstrellas: 2, musica: "ambienteTranquilo",
    sombraMin: 14, sombraMax: 20, sombraVel: 2.4, sombraMax_activas: 2, sombraEscala: 3,
    susurroMin: 26, susurroMax: 36, susurroVel: 3, susurroMaxActivas: 1, susurroEscala: 1.6,
    grietaMin: 0, grietaMax: 0, grietaMaxActivas: 0, grietaEscala: 0, grietaGolpes: 1,
  },
  accion: {
    dur: 100, spawnRate: 0.42, vidaMin: 2.6, vidaMax: 4.2, maxSimultaneas: 13,
    estrellaMin: 2.5, estrellaMax: 5, maxEstrellas: 4, musica: "ambienteAccion",
    sombraMin: 3, sombraMax: 5.5, sombraVel: 6.5, sombraMax_activas: 6, sombraEscala: 4.4,
    susurroMin: 7, susurroMax: 11, susurroVel: 8, susurroMaxActivas: 3, susurroEscala: 2,
    grietaMin: 20, grietaMax: 30, grietaMaxActivas: 1, grietaEscala: 3.2, grietaGolpes: 3,
  },
  supervivencia: {
    dur: null, spawnRate: 1.1, vidaMin: 5, vidaMax: 8, maxSimultaneas: 6,
    estrellaMin: 4, estrellaMax: 8, maxEstrellas: 3, musica: "ambienteAccion",
    sombraMin: 10, sombraMax: 16, sombraVel: 4, sombraMax_activas: 3, sombraEscala: 3.6,
    susurroMin: 12, susurroMax: 18, susurroVel: 5.5, susurroMaxActivas: 2, susurroEscala: 1.9,
    grietaMin: 16, grietaMax: 24, grietaMaxActivas: 1, grietaEscala: 3.4, grietaGolpes: 3,
  },
};

/* -------------------------------------------------------------- 6. NÚMEROS */
const T = {
  fovYaw: 100,
  fovPitch: 30,
  pitchBase: -10,
  radioMira: 0.18,
  velocidadCaminar: 6,
  limiteCampo: 36,
  cantidadAmbientales: 26,
  cantidadArboles: 14,
  ventanaCombo: 2200,
  velocidadDisparo: 34,
  vidaDisparo: 2.2,
  radioImpacto: 1.4,
  radioConsumo: 1.3,
  // altar y La Grieta
  altarVidaMax: 100,
  danioGrieta: 34,
  grietaVel: 1.7,
  // Faroles de Poder — le dan propósito real a caminar, en todos los modos
  posicionesFaroles: [[24, 24], [-24, 24], [24, -24], [-24, -24]],
  radioFarol: 4,
  duracionBendicion: 9,
  cooldownFarol: 5,
  multiplicadorBendicion: 1.6,
  // Supervivencia: logros por tiempo, y escalada de dificultad
  logroIntervalo: 22,
  supervivenciaEscaladaSeg: 260, // a los cuántos segundos llega a la dificultad máxima
  supervivenciaFactorMin: 0.55,  // qué tan intenso llega a ponerse (más chico = más difícil)
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);
const randItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

function texturaBrillo(colorHex = "#ffe9a8") {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, colorHex);
  g.addColorStop(0.4, colorHex + "aa");
  g.addColorStop(1, colorHex + "00");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function texturaSueloConCuadricula() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#182a1e";
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 2;
  const paso = 32;
  for (let i = 0; i <= 256; i += paso) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 256); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(256, i); ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(60, 60);
  return tex;
}

function texturaArbol() {
  const c = document.createElement("canvas");
  c.width = 128; c.height = 160;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#0d1a12";
  ctx.beginPath();
  ctx.ellipse(64, 55, 46, 50, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(58, 95, 12, 55);
  return new THREE.CanvasTexture(c);
}

function texturaSombra() {
  const c = document.createElement("canvas");
  c.width = c.height = 160;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(80, 80, 0, 80, 80, 80);
  g.addColorStop(0, "rgba(15,8,20,0.97)");
  g.addColorStop(0.45, "rgba(35,15,45,0.92)");
  g.addColorStop(0.68, "rgba(140,40,90,0.55)");
  g.addColorStop(0.85, "rgba(200,60,110,0.22)");
  g.addColorStop(1, "rgba(200,60,110,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 160, 160);
  return new THREE.CanvasTexture(c);
}

function texturaSusurro() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(230,245,255,0.9)");
  g.addColorStop(0.4, "rgba(180,220,255,0.6)");
  g.addColorStop(0.7, "rgba(140,190,255,0.28)");
  g.addColorStop(1, "rgba(140,190,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/* ---------- tercer tipo de enemigo — La Grieta. Grande, lenta, resistente
 * (necesita varios disparos). No va tras luciérnagas ni el jugador: va
 * directo al ALTAR para apagarlo. ---------- */
function texturaGrieta() {
  const c = document.createElement("canvas");
  c.width = c.height = 160;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(80, 80, 0, 80, 80, 80);
  g.addColorStop(0, "rgba(5,5,10,0.98)");
  g.addColorStop(0.4, "rgba(20,10,15,0.95)");
  g.addColorStop(0.62, "rgba(90,15,20,0.6)");
  g.addColorStop(0.82, "rgba(160,30,20,0.25)");
  g.addColorStop(1, "rgba(160,30,20,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 160, 160);
  return new THREE.CanvasTexture(c);
}

/* ---------- Farol de Poder — textura de brillo cálido para el pilar ---------- */
function texturaFarol() {
  return texturaBrillo("#ffe08a");
}

function crearAudio() {
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
    } catch (e) {}
  };
  const playSfx = (key) => {
    const src = MUSICA[key];
    if (!src || mute) return;
    try { const a = new Audio(src); a.volume = VOLUMEN_SFX; a.play().catch(() => {}); } catch (e) {}
  };
  const setMute = (v) => { mute = v; if (musica.actual) musica.actual.volume = v ? 0 : VOLUMEN_MUSICA; };
  const stop = () => { if (musica.actual) { musica.actual.pause(); musica.actual = null; musica.key = null; } };
  return { playMusica, playSfx, setMute, stop };
}

/* ------------------------------------------------------- 7. DIÁLOGOS */
const PERSONAJES = {
  mouri: { nombre: "Mouri", retrato: "🧚", color: "#4E3A25", fondo: "#FFF8E8" },
  narrador: { nombre: "", retrato: "", color: "#f3ecd8", fondo: "#1c1a2b" },
};

const DIALOGOS = {
  intro: [
    { quien: "narrador", texto: "Un campo tranquilo, de noche, donde las luciérnagas guardan recuerdos." },
    { quien: "mouri", texto: "Aquí puedes caminar despacio, mirar a tu alrededor y respirar un momento." },
    { quien: "mouri", texto: "Cada luciérnaga que atrapes con el farol lleva una palabra. Reúnelas todas." },
    { quien: "mouri", texto: "Si ves una sombra rondando, tu farol también dispara luz para dispersarla." },
  ],
  introAccion: [
    { quien: "mouri", texto: "¡Modo Acción! Las luciérnagas se apagan rápido y aparecen muchas más." },
    { quien: "mouri", texto: "Atrápalas seguidas, sin pausa, y arma un combo para ganar puntos extra." },
    { quien: "mouri", texto: "Sombras y Susurros vendrán por las luciérnagas y por ti — dispérsalos con luz." },
    { quien: "mouri", texto: "Cuidado con La Grieta: es grande, resistente, y va directo al altar. No la dejes llegar." },
    { quien: "mouri", texto: "Busca los Faroles de Poder repartidos por el mapa: te dan un empujón al acercarte." },
  ],
  introSupervivencia: [
    { quien: "narrador", texto: "El altar es lo único que no puede apagarse. Ahora depende de ti." },
    { quien: "mouri", texto: "Camina, explora, no te quedes quieto — el campo entero es tuyo para defenderlo." },
    { quien: "mouri", texto: "Busca los Faroles de Poder repartidos por el mapa: acércate y te dan un empujón temporal." },
    { quien: "mouri", texto: "Sombras y Susurros seguirán viniendo, cada vez más seguido." },
    { quien: "mouri", texto: "Cuidado con La Grieta: es lenta pero resistente, y va directo al altar. No la dejes llegar." },
    { quien: "mouri", texto: "Las palabras ya no son el objetivo — se irán desbloqueando solas, como logros, mientras resistes." },
    { quien: "mouri", texto: "No hay límite de tiempo. Aguanta todo lo que puedas." },
  ],
  finalSupervivencia: [
    { quien: "mouri", texto: "El altar se apagó… pero resististe mucho más de lo que crees." },
  ],
  final: [
    { quien: "mouri", texto: "Mira nada más… lo lograste." },
    { quien: "narrador", texto: "El altar brilla del todo, y el campo entero parece respirar aliviado." },
  ],
  altarDestruidoAccion: [
    { quien: "narrador", texto: "El altar se apagó. Sin su luz, el jardín entero se queda a oscuras." },
  ],
};

export default function LuciernagasDeLaMemoria3D({ onSalir }) {
  const contenedorRef = useRef(null);
  const [pantalla, setPantalla] = useState("titulo"); // titulo|dialogo|jugando|final
  const [modo, setModo] = useState("libre");
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [tiempoSobrevividoUI, setTiempoSobrevividoUI] = useState(0);
  const [esMovil, setEsMovil] = useState(false);
  const [dialogo, setDialogo] = useState(null);
  const [mute, setMute] = useState(false);
  const [mensajeFlotante, setMensajeFlotante] = useState(null);
  const [resultadoFinal, setResultadoFinal] = useState(null); // texto especial para pantalla final
  const [, forzar] = useState(0);
  const rerender = useCallback(() => forzar((n) => n + 1), []);

  const three = useRef(null);
  const luciernagas = useRef([]);
  const ambientales = useRef([]);
  const idsAtrapados = useRef(new Set());
  const palabrasSet = useRef([]);
  const nextId = useRef(1);
  const spawnTimer = useRef(0);
  const contador = useRef({ atrapadas: 0, perdidas: 0 });
  const chispasJuego = useRef(0);
  const estrellasFugaces = useRef([]);
  const estrellaTimer = useRef(4);
  const tiempoQuieto = useRef(0);
  const mirada = useRef({ yaw: 0, pitch: 0 });
  const posicion = useRef({ x: 0, z: 10 });
  const teclas = useRef({ adelante: false, atras: false, izq: false, der: false });
  const joystick = useRef({ activo: false, x: 0, z: 0, touchId: null });
  const miradaTouch = useRef({ activo: false, touchId: null, ultimoX: 0, ultimoY: 0 });
  const altarRef = useRef(null);
  const chispas = useRef([]);
  const nivelRef = useRef(NIVELES.libre);

  const disparos = useRef([]);
  const sombras = useRef([]);
  const sombraTimer = useRef(6);
  const flashRoja = useRef(0);

  const susurros = useRef([]);
  const susurroTimer = useRef(10);
  const hechizoJugador = useRef(0);
  const flashAzul = useRef(0);

  // CAMBIO: La Grieta y la vida del altar
  const grietas = useRef([]); // { id, mesh, luz, golpes, escalaBase }
  const grietaTimer = useRef(14);
  const altarVida = useRef(T.altarVidaMax);
  const flashMorada = useRef(0);

  // CAMBIO: Faroles de Poder (fijos, viven durante toda la partida)
  const faroles = useRef([]); // { mesh, luz, base, cooldownHasta }
  const bendicion = useRef(0); // segundos restantes de la Bendición activa

  // CAMBIO: Supervivencia — tiempo sobrevivido (escala la dificultad y
  // desbloquea logros), sin límite de tiempo
  const tiempoSobrevivido = useRef(0);
  const logroTimer = useRef(T.logroIntervalo);

  const ultimaAtrapada = useRef(0);
  const racha = useRef(0);
  const miradaBase = useRef(0);

  const audio = useRef(null);
  if (!audio.current) audio.current = crearAudio();
  const A = audio.current;

  useEffect(() => {
    const uaClasico = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const iPadModerno = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
    setEsMovil(uaClasico || iPadModerno);
  }, []);

  useEffect(() => { A.setMute(mute); }, [mute, A]);
  useEffect(() => () => A.stop(), [A]);

  /* ============================ SETUP DE THREE.JS ============================ */
  useEffect(() => {
    const contenedor = contenedorRef.current;
    if (!contenedor) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1230);
    scene.fog = new THREE.Fog(0x0a1230, 22, 78);

    const camera = new THREE.PerspectiveCamera(60, contenedor.clientWidth / contenedor.clientHeight, 0.1, 200);
    camera.position.set(0, 3.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(contenedor.clientWidth, contenedor.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    contenedor.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x4a5a9a, 0.9));
    const luzLuna = new THREE.DirectionalLight(0xbfd4ff, 0.5);
    luzLuna.position.set(-20, 30, -10);
    scene.add(luzLuna);

    const sueloGeo = new THREE.PlaneGeometry(400, 400);
    let sueloMat;
    if (TEXTURAS.suelo) {
      const mapa = new THREE.TextureLoader().load(TEXTURAS.suelo);
      mapa.wrapS = mapa.wrapT = THREE.RepeatWrapping;
      mapa.repeat.set(40, 40);
      sueloMat = new THREE.MeshStandardMaterial({ map: mapa });
    } else {
      sueloMat = new THREE.MeshStandardMaterial({ map: texturaSueloConCuadricula(), roughness: 1 });
    }
    const suelo = new THREE.Mesh(sueloGeo, sueloMat);
    suelo.rotation.x = -Math.PI / 2;
    scene.add(suelo);

    const estrellasGeo = new THREE.BufferGeometry();
    const posiciones = [];
    for (let i = 0; i < 800; i++) {
      const r = rand(60, 150);
      const theta = rand(0, Math.PI * 2);
      const phi = rand(0.05, 0.85) * Math.PI * 0.5;
      posiciones.push(r * Math.cos(theta) * Math.cos(phi), r * Math.sin(phi) + 8, r * Math.sin(theta) * Math.cos(phi));
    }
    estrellasGeo.setAttribute("position", new THREE.Float32BufferAttribute(posiciones, 3));
    scene.add(new THREE.Points(estrellasGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.6, sizeAttenuation: true })));

    const lunaTex = TEXTURAS.luna ? new THREE.TextureLoader().load(TEXTURAS.luna) : texturaBrillo("#fff3cf");
    const luna = new THREE.Sprite(new THREE.SpriteMaterial({ map: lunaTex, transparent: true, depthWrite: false }));
    luna.scale.set(14, 14, 1);
    luna.position.set(-24, 22, -55);
    scene.add(luna);

    const grupoColinas = new THREE.Group();
    for (let i = 0; i < 12; i++) {
      const ang = (i / 12) * Math.PI * 2;
      const alto = rand(9, 18);
      const geo = new THREE.ConeGeometry(rand(12, 20), alto, 6);
      const mat = new THREE.MeshBasicMaterial({ color: 0x141b32, fog: true });
      const cono = new THREE.Mesh(geo, mat);
      cono.position.set(Math.cos(ang) * 42, alto / 2 - 1, Math.sin(ang) * 42);
      grupoColinas.add(cono);
    }
    scene.add(grupoColinas);

    const arbolTex = TEXTURAS.arbol ? new THREE.TextureLoader().load(TEXTURAS.arbol) : texturaArbol();
    const grupoArboles = new THREE.Group();
    for (let i = 0; i < T.cantidadArboles; i++) {
      const ang = rand(0, Math.PI * 2);
      const dist = rand(14, 34);
      const escala = rand(3, 5.5);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: arbolTex, transparent: true }));
      sprite.scale.set(escala * 0.8, escala, 1);
      sprite.position.set(Math.cos(ang) * dist, escala / 2 - 0.3, Math.sin(ang) * dist);
      grupoArboles.add(sprite);
    }
    scene.add(grupoArboles);

    const altarMat = new THREE.MeshStandardMaterial({ color: 0x3a2f1e, emissive: 0x000000, emissiveIntensity: 0 });
    const altarBase = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, 3, 8), new THREE.MeshStandardMaterial({ color: 0x1c1a2b }));
    altarBase.position.set(0, 1.5, -30);
    const altarBola = new THREE.Mesh(new THREE.SphereGeometry(1.1, 16, 16), altarMat);
    altarBola.position.set(0, 3.4, -30);
    scene.add(altarBase, altarBola);
    const luzAltar = new THREE.PointLight(0xffd97d, 0, 20);
    luzAltar.position.copy(altarBola.position);
    scene.add(luzAltar);
    altarRef.current = { bola: altarBola, luz: luzAltar, posicion: altarBola.position.clone() };

    const glowTex = texturaBrillo("#ffe9a8");
    const sombraTex = texturaSombra();
    const susurroTex = texturaSusurro();
    const grietaTex = texturaGrieta();
    const farolTex = texturaFarol();
    const disparoTex = texturaBrillo("#bfe0ff");
    three.current = { scene, camera, renderer, glowTex, sombraTex, susurroTex, grietaTex, farolTex, disparoTex };

    for (let i = 0; i < T.cantidadAmbientales; i++) {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.7,
      }));
      const escala = rand(0.5, 0.9);
      sprite.scale.set(escala, escala, 1);
      const ang = rand(0, Math.PI * 2), dist = rand(4, 34);
      sprite.position.set(Math.cos(ang) * dist, rand(0.6, 5), Math.sin(ang) * dist);
      scene.add(sprite);
      ambientales.current.push({
        mesh: sprite, base: sprite.position.clone(), fase: rand(0, 100), velocidad: rand(0.3, 0.8),
        anguloOrbita: rand(0, Math.PI * 2), esDeLasQueSeAcercan: i < 6,
      });
    }

    // CAMBIO: Faroles de Poder — 4 pilares fijos repartidos por el mapa,
    // presentes en TODOS los modos. Caminar hasta ellos siempre vale la pena.
    for (const [fx, fz] of T.posicionesFaroles) {
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.55, 2.4, 8),
        new THREE.MeshStandardMaterial({ color: 0x2a2418 })
      );
      base.position.set(fx, 1.2, fz);
      const bola = new THREE.Sprite(new THREE.SpriteMaterial({
        map: farolTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      }));
      bola.scale.set(1.6, 1.6, 1);
      bola.position.set(fx, 2.7, fz);
      const luzFarol = new THREE.PointLight(0xffd97d, 0.9, 10);
      luzFarol.position.set(fx, 2.7, fz);
      scene.add(base, bola, luzFarol);
      faroles.current.push({ mesh: bola, luz: luzFarol, base: { x: fx, z: fz }, cooldownHasta: 0 });
    }

    const onResize = () => {
      if (!contenedor) return;
      camera.aspect = contenedor.clientWidth / contenedor.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(contenedor.clientWidth, contenedor.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  /* ---------- diálogos ---------- */
  const mostrarDialogo = useCallback((lines, then) => {
    if (!lines || lines.length === 0) { then && then(); return; }
    setDialogo({ lines, i: 0, then });
  }, []);

  const avanzarDialogo = useCallback(() => {
    setDialogo((d) => {
      if (!d) return d;
      const siguiente = d.i + 1;
      if (siguiente >= d.lines.length) {
        d.then && d.then();
        return null;
      }
      return { ...d, i: siguiente };
    });
  }, []);

  /* ============================ LÓGICA DEL JUEGO ============================ */
  const iniciarPartida = useCallback((modoElegido) => {
    const nivel = NIVELES[modoElegido] || NIVELES.libre;
    nivelRef.current = nivel;
    setModo(modoElegido);
    palabrasSet.current = randItem(SETS_DE_PALABRAS);
    idsAtrapados.current = new Set();
    contador.current = { atrapadas: 0, perdidas: 0 };
    spawnTimer.current = 0.5;
    mirada.current = { yaw: 0, pitch: 0 };
    miradaBase.current = 0;
    posicion.current = { x: 0, z: 10 };
    setTiempoRestante(nivel.dur || 0);
    setTiempoSobrevividoUI(0);
    setResultadoFinal(null);

    const { scene } = three.current;
    for (const l of luciernagas.current) scene.remove(l.mesh);
    luciernagas.current = [];

    chispasJuego.current = 0;
    tiempoQuieto.current = 0;
    racha.current = 0;
    ultimaAtrapada.current = 0;

    for (const e of estrellasFugaces.current) scene.remove(e.mesh);
    estrellasFugaces.current = [];
    estrellaTimer.current = rand(3, 6);

    for (const d of disparos.current) scene.remove(d.mesh);
    disparos.current = [];

    for (const s of sombras.current) { scene.remove(s.mesh); if (s.luz) scene.remove(s.luz); }
    sombras.current = [];
    sombraTimer.current = nivel.sombraMin > 0 ? rand(nivel.sombraMin, nivel.sombraMax) : Infinity;

    for (const s of susurros.current) { scene.remove(s.mesh); if (s.luz) scene.remove(s.luz); }
    susurros.current = [];
    susurroTimer.current = nivel.susurroMin > 0 ? rand(nivel.susurroMin, nivel.susurroMax) : Infinity;
    hechizoJugador.current = 0;
    flashAzul.current = 0;
    flashRoja.current = 0;

    // CAMBIO: reiniciar Grietas y la vida del altar
    for (const g of grietas.current) { scene.remove(g.mesh); if (g.luz) scene.remove(g.luz); }
    grietas.current = [];
    grietaTimer.current = nivel.grietaMin > 0 ? rand(nivel.grietaMin, nivel.grietaMax) : Infinity;
    altarVida.current = T.altarVidaMax;
    flashMorada.current = 0;

    // CAMBIO: Faroles de Poder — se resetean los cooldowns, no la posición
    for (const f of faroles.current) f.cooldownHasta = 0;
    bendicion.current = 0;

    tiempoSobrevivido.current = 0;
    logroTimer.current = T.logroIntervalo;

    setPantalla("dialogo");
    const lineasIntro = modoElegido === "accion" ? DIALOGOS.introAccion
      : modoElegido === "supervivencia" ? DIALOGOS.introSupervivencia
      : DIALOGOS.intro;
    mostrarDialogo(lineasIntro, () => {
      setPantalla("jugando");
      A.playMusica(nivel.musica);
    });
  }, [mostrarDialogo, A]);

  /* ---------- CAMBIO: factor de dificultad de Supervivencia (sube solo) ---------- */
  const factorDificultad = useCallback(() => {
    if (modo !== "supervivencia") return 1;
    const t = clamp(tiempoSobrevivido.current / T.supervivenciaEscaladaSeg, 0, 1);
    return 1 - t * (1 - T.supervivenciaFactorMin);
  }, [modo]);

  const generarLuciernaga = useCallback(() => {
    const { scene, glowTex } = three.current;
    const enJuego = new Set(luciernagas.current.map((l) => l.palabraIdx));
    const disponibles = palabrasSet.current
      .map((_, i) => i)
      .filter((i) => !idsAtrapados.current.has(i) && !enJuego.has(i));
    if (disponibles.length === 0) return;

    const nivel = nivelRef.current;
    const palabraIdx = randItem(disponibles);
    const vidaMax = rand(nivel.vidaMin, nivel.vidaMax);

    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    sprite.scale.set(1.5, 1.5, 1);
    const ang = rand(0, Math.PI * 2);
    const dist = rand(6, 20);
    const x = clamp(posicion.current.x + Math.cos(ang) * dist, -T.limiteCampo, T.limiteCampo);
    const z = clamp(posicion.current.z + Math.sin(ang) * dist, -T.limiteCampo, T.limiteCampo);
    sprite.position.set(x, rand(2, 7), z);
    scene.add(sprite);

    luciernagas.current.push({
      id: nextId.current++, mesh: sprite, vida: vidaMax, vidaMax,
      base: sprite.position.clone(), palabraIdx, palabra: palabrasSet.current[palabraIdx],
    });
  }, []);

  const generarEstrellaFugaz = useCallback(() => {
    const { scene, glowTex } = three.current;
    const deIzqADer = Math.random() < 0.5;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xcfe8ff,
    }));
    sprite.scale.set(2.2, 2.2, 1);
    const z = rand(-50, -20);
    const y = rand(18, 34);
    sprite.position.set(deIzqADer ? -70 : 70, y, z);
    scene.add(sprite);
    estrellasFugaces.current.push({
      id: nextId.current++, mesh: sprite, vx: (deIzqADer ? 1 : -1) * rand(16, 24), vida: 5,
    });
  }, []);

  const generarSombra = useCallback(() => {
    const { scene, sombraTex } = three.current;
    const nivel = nivelRef.current;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: sombraTex, transparent: true, depthWrite: false,
    }));
    const escala = nivel.sombraEscala || 3.2;
    sprite.scale.set(escala, escala, 1);
    const ang = rand(0, Math.PI * 2);
    const x = clamp(posicion.current.x + Math.cos(ang) * (T.limiteCampo - 3), -T.limiteCampo, T.limiteCampo);
    const z = clamp(posicion.current.z + Math.sin(ang) * (T.limiteCampo - 3), -T.limiteCampo, T.limiteCampo);
    sprite.position.set(x, rand(1.5, 4), z);
    scene.add(sprite);

    const luz = new THREE.PointLight(0xc23a7a, 2.2, 14);
    luz.position.copy(sprite.position);
    scene.add(luz);

    sombras.current.push({
      id: nextId.current++, mesh: sprite, luz, vida: rand(20, 30),
      escalaBase: escala, fasePulso: rand(0, 10),
    });
  }, []);

  const generarSusurro = useCallback(() => {
    const { scene, susurroTex } = three.current;
    const nivel = nivelRef.current;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: susurroTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    const escala = nivel.susurroEscala || 1.6;
    sprite.scale.set(escala, escala, 1);
    const ang = rand(0, Math.PI * 2);
    const x = clamp(posicion.current.x + Math.cos(ang) * (T.limiteCampo - 2), -T.limiteCampo, T.limiteCampo);
    const z = clamp(posicion.current.z + Math.sin(ang) * (T.limiteCampo - 2), -T.limiteCampo, T.limiteCampo);
    sprite.position.set(x, rand(2, 4), z);
    scene.add(sprite);

    const luz = new THREE.PointLight(0x8fd0ff, 1.6, 10);
    luz.position.copy(sprite.position);
    scene.add(luz);

    susurros.current.push({
      id: nextId.current++, mesh: sprite, luz, vida: rand(14, 20),
      escalaBase: escala, faseErratica: rand(0, 20),
    });
  }, []);

  /* ---------- CAMBIO: La Grieta — grande, lenta, resistente, va al altar ---------- */
  const generarGrieta = useCallback(() => {
    const { scene, grietaTex } = three.current;
    const nivel = nivelRef.current;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: grietaTex, transparent: true, depthWrite: false,
    }));
    const escala = nivel.grietaEscala || 3.2;
    sprite.scale.set(escala, escala, 1);
    // aparece lejos, en el borde del campo, para que tengas tiempo de reaccionar
    const ang = rand(0, Math.PI * 2);
    const x = clamp(Math.cos(ang) * (T.limiteCampo - 1), -T.limiteCampo, T.limiteCampo);
    const z = clamp(Math.sin(ang) * (T.limiteCampo - 1), -T.limiteCampo, T.limiteCampo);
    sprite.position.set(x, 2.2, z);
    scene.add(sprite);

    const luz = new THREE.PointLight(0xaa2222, 2, 16);
    luz.position.copy(sprite.position);
    scene.add(luz);

    grietas.current.push({
      id: nextId.current++, mesh: sprite, luz,
      golpes: nivel.grietaGolpes || 3, escalaBase: escala, fasePulso: rand(0, 10),
    });
  }, []);

  const intentarAtrapar = useCallback(() => {
    const { camera, scene } = three.current;
    const radioMiraEfectivo = bendicion.current > 0 ? T.radioMira * T.multiplicadorBendicion : T.radioMira;

    // 1) prioridad: luciérnagas con palabra
    let mejor = null, mejorDist = Infinity;
    for (const l of luciernagas.current) {
      const ndc = l.mesh.position.clone().project(camera);
      if (ndc.z > 1) continue;
      const dist = Math.hypot(ndc.x, ndc.y);
      if (dist < radioMiraEfectivo && dist < mejorDist) { mejor = l; mejorDist = dist; }
    }
    if (mejor) {
      idsAtrapados.current.add(mejor.palabraIdx);
      contador.current.atrapadas += 1;
      chispas.current.push({ pos: mejor.mesh.position.clone(), nacida: Date.now() });
      scene.remove(mejor.mesh);
      luciernagas.current = luciernagas.current.filter((l) => l.id !== mejor.id);
      A.playSfx("atrapar");

      const ahora = Date.now();
      if (ahora - ultimaAtrapada.current < T.ventanaCombo) racha.current += 1;
      else racha.current = 1;
      ultimaAtrapada.current = ahora;
      if (racha.current >= 3) {
        const bonus = (racha.current - 2) * 2;
        chispasJuego.current += bonus;
        A.playSfx("combo");
        setMensajeFlotante(`🔥 ¡Combo x${racha.current}! +${bonus}`);
        setTimeout(() => setMensajeFlotante(null), 1300);
      }
      rerender();
      return true;
    }

    // 2) estrella fugaz -> "deseo" cumplido
    let mejorEstrella = null, mejorDistEstrella = Infinity;
    for (const e of estrellasFugaces.current) {
      const ndc = e.mesh.position.clone().project(camera);
      if (ndc.z > 1) continue;
      const dist = Math.hypot(ndc.x, ndc.y);
      if (dist < radioMiraEfectivo * 1.4 && dist < mejorDistEstrella) { mejorEstrella = e; mejorDistEstrella = dist; }
    }
    if (mejorEstrella) {
      chispasJuego.current += 10;
      chispas.current.push({ pos: mejorEstrella.mesh.position.clone(), nacida: Date.now() });
      scene.remove(mejorEstrella.mesh);
      estrellasFugaces.current = estrellasFugaces.current.filter((e) => e.id !== mejorEstrella.id);
      spawnTimer.current = 0;
      A.playSfx("deseo");
      setMensajeFlotante("✨ ¡Un deseo! +10");
      setTimeout(() => setMensajeFlotante(null), 1600);
      rerender();
      return true;
    }

    // 3) ambiental -> chispita de diversión
    let mejorAmbiental = null, mejorDistAmbiental = Infinity;
    for (const a of ambientales.current) {
      const ndc = a.mesh.position.clone().project(camera);
      if (ndc.z > 1) continue;
      const dist = Math.hypot(ndc.x, ndc.y);
      if (dist < radioMiraEfectivo * 0.8 && dist < mejorDistAmbiental) { mejorAmbiental = a; mejorDistAmbiental = dist; }
    }
    if (mejorAmbiental) {
      chispasJuego.current += 1;
      chispas.current.push({ pos: mejorAmbiental.mesh.position.clone(), nacida: Date.now() });
      const ang = rand(0, Math.PI * 2), dist2 = rand(6, 22);
      mejorAmbiental.base.set(
        clamp(posicion.current.x + Math.cos(ang) * dist2, -T.limiteCampo, T.limiteCampo),
        rand(0.6, 5),
        clamp(posicion.current.z + Math.sin(ang) * dist2, -T.limiteCampo, T.limiteCampo)
      );
      rerender();
      return true;
    }

    return false;
  }, [rerender, A]);

  const mirarConMouse = useCallback((clientX, clientY) => {
    const rect = contenedorRef.current.getBoundingClientRect();
    const nx = clamp(((clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
    const ny = clamp(((clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
    mirada.current.yaw = miradaBase.current + nx * T.fovYaw;
    mirada.current.pitch = -ny * T.fovPitch;
  }, []);

  const girar180 = useCallback(() => {
    miradaBase.current += 180;
    mirada.current.yaw += 180;
  }, []);

  const onMouseMove = (e) => { if (!esMovil) mirarConMouse(e.clientX, e.clientY); };

  const dispararLuz = useCallback(() => {
    if (!three.current || pantalla !== "jugando") return;
    const { scene, camera, disparoTex } = three.current;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: disparoTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    sprite.scale.set(0.7, 0.7, 1);
    sprite.position.copy(camera.position);
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    scene.add(sprite);
    disparos.current.push({ id: nextId.current++, mesh: sprite, dir: { x: forward.x, z: forward.z }, vida: T.vidaDisparo });
    A.playSfx("disparo");
  }, [pantalla, A]);

  const onClickDesktop = () => {
    if (esMovil) return;
    const atrapoAlgo = intentarAtrapar();
    if (!atrapoAlgo) dispararLuz();
  };

  useEffect(() => {
    if (pantalla !== "dialogo") return;
    const onKey = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); avanzarDialogo(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pantalla, avanzarDialogo]);

  useEffect(() => {
    if (pantalla !== "jugando") return;
    const abajo = (e) => {
      if (["w", "W", "ArrowUp"].includes(e.key)) teclas.current.adelante = true;
      if (["s", "S", "ArrowDown"].includes(e.key)) teclas.current.atras = true;
      if (["a", "A", "ArrowLeft"].includes(e.key)) teclas.current.izq = true;
      if (["d", "D", "ArrowRight"].includes(e.key)) teclas.current.der = true;
      if (e.key === " " && !e.repeat) { e.preventDefault(); dispararLuz(); }
      if (["q", "Q"].includes(e.key) && !e.repeat) { e.preventDefault(); girar180(); }
    };
    const arriba = (e) => {
      if (["w", "W", "ArrowUp"].includes(e.key)) teclas.current.adelante = false;
      if (["s", "S", "ArrowDown"].includes(e.key)) teclas.current.atras = false;
      if (["a", "A", "ArrowLeft"].includes(e.key)) teclas.current.izq = false;
      if (["d", "D", "ArrowRight"].includes(e.key)) teclas.current.der = false;
    };
    window.addEventListener("keydown", abajo);
    window.addEventListener("keyup", arriba);
    return () => { window.removeEventListener("keydown", abajo); window.removeEventListener("keyup", arriba); };
  }, [pantalla, dispararLuz, girar180]);

  const onTouchStartEscenario = (e) => {
    for (const t of e.changedTouches) {
      const rect = contenedorRef.current.getBoundingClientRect();
      const esLadoIzquierdo = (t.clientX - rect.left) < rect.width / 2;
      if (esLadoIzquierdo && !joystick.current.activo) {
        joystick.current = { activo: true, x: 0, z: 0, touchId: t.identifier, origenX: t.clientX, origenY: t.clientY };
      } else if (!esLadoIzquierdo && !miradaTouch.current.activo) {
        miradaTouch.current = { activo: true, touchId: t.identifier, ultimoX: t.clientX, ultimoY: t.clientY };
      }
    }
  };
  const onTouchMoveEscenario = (e) => {
    for (const t of e.changedTouches) {
      if (joystick.current.activo && t.identifier === joystick.current.touchId) {
        const dx = clamp((t.clientX - joystick.current.origenX) / 45, -1, 1);
        const dy = clamp((t.clientY - joystick.current.origenY) / 45, -1, 1);
        joystick.current.x = dx; joystick.current.z = dy;
      }
      if (miradaTouch.current.activo && t.identifier === miradaTouch.current.touchId) {
        const dx = t.clientX - miradaTouch.current.ultimoX;
        const dy = t.clientY - miradaTouch.current.ultimoY;
        mirada.current.yaw = clamp(mirada.current.yaw + dx * 0.3, -180, 180);
        mirada.current.pitch = clamp(mirada.current.pitch - dy * 0.3, -T.fovPitch, T.fovPitch);
        miradaTouch.current.ultimoX = t.clientX; miradaTouch.current.ultimoY = t.clientY;
      }
    }
  };
  const onTouchEndEscenario = (e) => {
    for (const t of e.changedTouches) {
      if (joystick.current.touchId === t.identifier) joystick.current = { activo: false, x: 0, z: 0, touchId: null };
      if (miradaTouch.current.touchId === t.identifier) miradaTouch.current.activo = false;
    }
  };

  /* ============================ BUCLE PRINCIPAL ============================ */
  useEffect(() => {
    if (pantalla !== "jugando" || !three.current) return;
    let raf, ultimo = performance.now();

    const loop = (ahora) => {
      const dt = Math.min((ahora - ultimo) / 1000, 0.05);
      ultimo = ahora;
      const { camera, renderer, scene } = three.current;
      const nivel = nivelRef.current;
      const esSupervivencia = modo === "supervivencia";
      const factorDif = esSupervivencia ? factorDificultad() : 1;

      const yawRad = THREE.MathUtils.degToRad(mirada.current.yaw);
      const adelanteVec = { x: Math.sin(yawRad), z: -Math.cos(yawRad) };
      const derechaVec = { x: Math.cos(yawRad), z: Math.sin(yawRad) };

      let mx = 0, mz = 0;
      if (esMovil) {
        mx = joystick.current.x; mz = -joystick.current.z;
      } else {
        if (teclas.current.adelante) mz += 1;
        if (teclas.current.atras) mz -= 1;
        if (teclas.current.der) mx += 1;
        if (teclas.current.izq) mx -= 1;
      }
      if (hechizoJugador.current > 0) { mx = -mx; mz = -mz; }
      const mag = Math.hypot(mx, mz);
      let caminando = false;
      if (mag > 0.05) {
        caminando = true;
        const nx = mx / mag, nz = mz / mag;
        const despX = (adelanteVec.x * nz + derechaVec.x * nx) * T.velocidadCaminar * dt;
        const despZ = (adelanteVec.z * nz + derechaVec.z * nx) * T.velocidadCaminar * dt;
        const nuevoX = posicion.current.x + despX;
        const nuevoZ = posicion.current.z + despZ;
        if (Math.hypot(nuevoX, nuevoZ) < T.limiteCampo) {
          posicion.current.x = nuevoX; posicion.current.z = nuevoZ;
        }
      }

      const bamboleo = caminando ? Math.sin(ahora / 140) * 0.08 : 0;
      camera.position.set(posicion.current.x, 3.2 + bamboleo, posicion.current.z);
      camera.rotation.order = "YXZ";
      camera.rotation.y = -yawRad;
      camera.rotation.x = THREE.MathUtils.degToRad(mirada.current.pitch + T.pitchBase);

      tiempoQuieto.current = caminando ? 0 : tiempoQuieto.current + dt;
      const enMomentoMagico = tiempoQuieto.current > 2.5;

      // --- luciérnagas con palabra ---
      for (const l of luciernagas.current) {
        l.vida -= dt;
        const t = ahora / 500;
        l.mesh.position.y = l.base.y + Math.sin(t + l.id) * 0.4;
        const apagandose = l.vida < 1.6;
        l.mesh.material.opacity = apagandose ? clamp(l.vida / 1.6, 0.15, 1) * (0.6 + Math.sin(t * 6) * 0.4) : 1;

        const distCamara = l.mesh.position.distanceTo(camera.position);
        if (distCamara < 2.8 && Math.random() < 0.035) {
          const angEscape = rand(0, Math.PI * 2);
          l.base.x = clamp(l.base.x + Math.cos(angEscape) * 2.5, -T.limiteCampo, T.limiteCampo);
          l.base.z = clamp(l.base.z + Math.sin(angEscape) * 2.5, -T.limiteCampo, T.limiteCampo);
        }
      }
      const antes = luciernagas.current.length;
      luciernagas.current = luciernagas.current.filter((l) => {
        if (l.vida <= 0) { scene.remove(l.mesh); return false; }
        return true;
      });
      contador.current.perdidas += antes - luciernagas.current.length;

      // --- ambientales ---
      for (const a of ambientales.current) {
        if (enMomentoMagico && a.esDeLasQueSeAcercan) {
          const angulo = ahora / 900 + a.anguloOrbita;
          const objetivoX = posicion.current.x + Math.cos(angulo) * 2.6;
          const objetivoZ = posicion.current.z + Math.sin(angulo) * 2.6;
          const objetivoY = 2.6 + Math.sin(angulo * 2) * 0.4;
          a.mesh.position.x += (objetivoX - a.mesh.position.x) * Math.min(1, dt * 2);
          a.mesh.position.z += (objetivoZ - a.mesh.position.z) * Math.min(1, dt * 2);
          a.mesh.position.y += (objetivoY - a.mesh.position.y) * Math.min(1, dt * 2);
        } else {
          const t = ahora / 1000 * a.velocidad + a.fase;
          a.mesh.position.x += ((a.base.x + Math.sin(t) * 1.6) - a.mesh.position.x) * Math.min(1, dt * 2);
          a.mesh.position.z += ((a.base.z + Math.cos(t * 0.8) * 1.6) - a.mesh.position.z) * Math.min(1, dt * 2);
          a.mesh.position.y += ((a.base.y + Math.sin(t * 1.4) * 0.5) - a.mesh.position.y) * Math.min(1, dt * 2);
        }
      }

      // --- estrellas fugaces ---
      estrellasFugaces.current = estrellasFugaces.current.filter((e) => {
        e.mesh.position.x += e.vx * dt;
        e.vida -= dt;
        if (e.vida <= 0 || Math.abs(e.mesh.position.x) > 75) { scene.remove(e.mesh); return false; }
        return true;
      });
      estrellaTimer.current -= dt;
      if (estrellaTimer.current <= 0 && estrellasFugaces.current.length < nivel.maxEstrellas) {
        generarEstrellaFugaz();
        estrellaTimer.current = rand(nivel.estrellaMin, nivel.estrellaMax);
      }

      // --- Faroles de Poder: le dan propósito real a caminar en TODOS los modos ---
      for (const f of faroles.current) {
        const pulso = 1 + Math.sin(ahora / 260) * 0.12;
        f.mesh.scale.set(1.6 * pulso, 1.6 * pulso, 1);
        const listo = ahora >= f.cooldownHasta;
        f.luz.intensity = listo ? 0.9 + Math.sin(ahora / 200) * 0.3 : 0.25;
        const dist = Math.hypot(posicion.current.x - f.base.x, posicion.current.z - f.base.z);
        if (dist < T.radioFarol && listo) {
          bendicion.current = T.duracionBendicion;
          f.cooldownHasta = ahora + T.cooldownFarol * 1000;
          A.playSfx("farol");
          setMensajeFlotante("🕯️ ¡Bendición! Puntería y disparo mejorados");
          setTimeout(() => setMensajeFlotante(null), 1500);
        }
      }
      if (bendicion.current > 0) bendicion.current = Math.max(0, bendicion.current - dt);

      // --- Sombras ---
      if (nivel.sombraMin > 0) {
        for (const s of sombras.current) {
          s.vida -= dt;
          const pulso = 1 + Math.sin(ahora / 220 + s.fasePulso) * 0.18;
          s.mesh.scale.set(s.escalaBase * pulso, s.escalaBase * pulso, 1);
          s.luz.position.copy(s.mesh.position);
          s.luz.intensity = 2 + Math.sin(ahora / 180 + s.fasePulso) * 0.8;

          let objetivo = null, menorDist = Infinity;
          for (const l of luciernagas.current) {
            const d = s.mesh.position.distanceTo(l.mesh.position);
            if (d < menorDist) { menorDist = d; objetivo = { tipo: "palabra", ref: l }; }
          }
          if (!objetivo) {
            for (const a of ambientales.current) {
              const d = s.mesh.position.distanceTo(a.mesh.position);
              if (d < menorDist) { menorDist = d; objetivo = { tipo: "ambiental", ref: a }; }
            }
          }
          if (objetivo) {
            const dx = objetivo.ref.mesh.position.x - s.mesh.position.x;
            const dz = objetivo.ref.mesh.position.z - s.mesh.position.z;
            const dist = Math.hypot(dx, dz) || 1;
            s.mesh.position.x += (dx / dist) * nivel.sombraVel * dt;
            s.mesh.position.z += (dz / dist) * nivel.sombraVel * dt;
            if (menorDist < Math.max(T.radioConsumo, s.escalaBase * 0.4)) {
              if (objetivo.tipo === "palabra") {
                objetivo.ref.vida = 0;
                flashRoja.current = 0.35;
              } else {
                const angF = rand(0, Math.PI * 2), distF = rand(10, 24);
                objetivo.ref.base.set(
                  clamp(posicion.current.x + Math.cos(angF) * distF, -T.limiteCampo, T.limiteCampo),
                  rand(0.6, 5),
                  clamp(posicion.current.z + Math.sin(angF) * distF, -T.limiteCampo, T.limiteCampo)
                );
              }
              s.vida = 0;
            }
          }
        }
        sombras.current = sombras.current.filter((s) => {
          if (s.vida <= 0) { scene.remove(s.mesh); scene.remove(s.luz); return false; }
          return true;
        });

        sombraTimer.current -= dt;
        if (sombraTimer.current <= 0 && sombras.current.length < nivel.sombraMax_activas) {
          generarSombra();
          sombraTimer.current = rand(nivel.sombraMin, nivel.sombraMax) * factorDif;
        }
      }
      if (flashRoja.current > 0) flashRoja.current = Math.max(0, flashRoja.current - dt * 2.2);

      // --- Susurros ---
      if (nivel.susurroMin > 0) {
        for (const s of susurros.current) {
          s.vida -= dt;
          const dx0 = posicion.current.x - s.mesh.position.x;
          const dz0 = posicion.current.z - s.mesh.position.z;
          const dist0 = Math.hypot(dx0, dz0) || 1;
          const perpX = -dz0 / dist0, perpZ = dx0 / dist0;
          const vaiven = Math.sin(ahora / 160 + s.faseErratica) * 2.4;
          s.mesh.position.x += ((dx0 / dist0) * nivel.susurroVel + perpX * vaiven) * dt;
          s.mesh.position.z += ((dz0 / dist0) * nivel.susurroVel + perpZ * vaiven) * dt;
          s.luz.position.copy(s.mesh.position);
          s.luz.intensity = 1.4 + Math.sin(ahora / 130 + s.faseErratica) * 0.6;

          if (dist0 < 1.6) {
            chispasJuego.current = Math.max(0, chispasJuego.current - 5);
            hechizoJugador.current = 2.5;
            flashAzul.current = 0.35;
            A.playSfx("robo");
            setMensajeFlotante("💫 ¡Un susurro te desorientó! -5");
            setTimeout(() => setMensajeFlotante(null), 1400);
            s.vida = 0;
          }
        }
        susurros.current = susurros.current.filter((s) => {
          if (s.vida <= 0) { scene.remove(s.mesh); scene.remove(s.luz); return false; }
          return true;
        });

        susurroTimer.current -= dt;
        if (susurroTimer.current <= 0 && susurros.current.length < nivel.susurroMaxActivas) {
          generarSusurro();
          susurroTimer.current = rand(nivel.susurroMin, nivel.susurroMax) * factorDif;
        }
      }
      if (hechizoJugador.current > 0) hechizoJugador.current = Math.max(0, hechizoJugador.current - dt);
      if (flashAzul.current > 0) flashAzul.current = Math.max(0, flashAzul.current - dt * 2.2);

      // --- CAMBIO: La Grieta — va directo al altar, no a ti ni a las luciérnagas ---
      if (nivel.grietaMin > 0 && altarRef.current) {
        const posAltar = altarRef.current.posicion;
        for (const g of grietas.current) {
          const pulso = 1 + Math.sin(ahora / 300 + g.fasePulso) * 0.15;
          g.mesh.scale.set(g.escalaBase * pulso, g.escalaBase * pulso, 1);
          g.luz.position.copy(g.mesh.position);

          const dx = posAltar.x - g.mesh.position.x;
          const dz = posAltar.z - g.mesh.position.z;
          const dist = Math.hypot(dx, dz) || 1;
          g.mesh.position.x += (dx / dist) * T.grietaVel * dt;
          g.mesh.position.z += (dz / dist) * T.grietaVel * dt;

          if (dist < 2.5) {
            altarVida.current = Math.max(0, altarVida.current - T.danioGrieta);
            flashMorada.current = 0.4;
            A.playSfx("altarDanio");
            g.golpes = 0; // se disuelve tras golpear, ya cumplió su propósito
          }
        }
        grietas.current = grietas.current.filter((g) => {
          if (g.golpes <= 0) { scene.remove(g.mesh); scene.remove(g.luz); return false; }
          return true;
        });

        grietaTimer.current -= dt;
        if (grietaTimer.current <= 0 && grietas.current.length < nivel.grietaMaxActivas) {
          generarGrieta();
          grietaTimer.current = rand(nivel.grietaMin, nivel.grietaMax) * factorDif;
        }
      }
      if (flashMorada.current > 0) flashMorada.current = Math.max(0, flashMorada.current - dt * 1.8);

      // --- disparos de luz: dispersan sombras, susurros, y hieren a La Grieta ---
      const radioImpactoEfectivo = bendicion.current > 0 ? T.radioImpacto * T.multiplicadorBendicion : T.radioImpacto;
      disparos.current = disparos.current.filter((d) => {
        d.mesh.position.x += d.dir.x * T.velocidadDisparo * dt;
        d.mesh.position.z += d.dir.z * T.velocidadDisparo * dt;
        d.vida -= dt;
        if (d.vida <= 0) { scene.remove(d.mesh); return false; }

        for (const s of sombras.current) {
          if (d.mesh.position.distanceTo(s.mesh.position) < Math.max(radioImpactoEfectivo, s.escalaBase * 0.35)) {
            s.vida = 0;
            chispasJuego.current += 3;
            chispas.current.push({ pos: s.mesh.position.clone(), nacida: Date.now() });
            A.playSfx("impacto");
            scene.remove(d.mesh);
            return false;
          }
        }
        for (const s of susurros.current) {
          if (d.mesh.position.distanceTo(s.mesh.position) < Math.max(radioImpactoEfectivo, s.escalaBase * 0.5)) {
            s.vida = 0;
            chispasJuego.current += 2;
            chispas.current.push({ pos: s.mesh.position.clone(), nacida: Date.now() });
            A.playSfx("impacto");
            scene.remove(d.mesh);
            return false;
          }
        }
        for (const g of grietas.current) {
          if (d.mesh.position.distanceTo(g.mesh.position) < Math.max(radioImpactoEfectivo, g.escalaBase * 0.4)) {
            g.golpes -= 1; // CAMBIO: resistente — necesita varios impactos
            chispas.current.push({ pos: g.mesh.position.clone(), nacida: Date.now() });
            A.playSfx("impacto");
            if (g.golpes <= 0) chispasJuego.current += 12;
            scene.remove(d.mesh);
            return false;
          }
        }
        return true;
      });
      sombras.current = sombras.current.filter((s) => {
        if (s.vida <= 0) { scene.remove(s.mesh); scene.remove(s.luz); return false; }
        return true;
      });
      susurros.current = susurros.current.filter((s) => {
        if (s.vida <= 0) { scene.remove(s.mesh); scene.remove(s.luz); return false; }
        return true;
      });
      grietas.current = grietas.current.filter((g) => {
        if (g.golpes <= 0) { scene.remove(g.mesh); scene.remove(g.luz); return false; }
        return true;
      });

      chispas.current = chispas.current.filter((c) => (Date.now() - c.nacida) < 600);

      spawnTimer.current -= dt;
      if (spawnTimer.current <= 0 && luciernagas.current.length < nivel.maxSimultaneas) {
        generarLuciernaga();
        spawnTimer.current = nivel.spawnRate * factorDif;
      }

      // --- altar: brillo según progreso de palabras, y su propia vida ---
      const progreso = idsAtrapados.current.size / (palabrasSet.current.length || 1);
      if (altarRef.current) {
        altarRef.current.bola.material.emissive.setHex(0xffd97d);
        altarRef.current.bola.material.emissiveIntensity = Math.max(progreso * 1.6, (altarVida.current / T.altarVidaMax) * 0.5);
        altarRef.current.luz.intensity = Math.max(progreso * 3.5, (altarVida.current / T.altarVidaMax) * 1.5);
      }

      if (racha.current > 0 && Date.now() - ultimaAtrapada.current > T.ventanaCombo) racha.current = 0;

      // --- CAMBIO: Supervivencia — tiempo, logros automáticos, y final por altar ---
      if (esSupervivencia) {
        tiempoSobrevivido.current += dt;
        setTiempoSobrevividoUI(Math.floor(tiempoSobrevivido.current));

        logroTimer.current -= dt;
        if (logroTimer.current <= 0) {
          const pendientes = palabrasSet.current.map((_, i) => i).filter((i) => !idsAtrapados.current.has(i));
          if (pendientes.length > 0) {
            const idx = pendientes[0];
            idsAtrapados.current.add(idx);
            A.playSfx("logro");
            setMensajeFlotante(`🏆 Logro: "${palabrasSet.current[idx]}"`);
            setTimeout(() => setMensajeFlotante(null), 1800);
          } else {
            // ya se desbloquearon todas — arma una frase nueva y sigue
            palabrasSet.current = randItem(SETS_DE_PALABRAS);
            idsAtrapados.current = new Set();
            setMensajeFlotante("🌟 ¡Frase completa! Sigues resistiendo...");
            setTimeout(() => setMensajeFlotante(null), 1800);
          }
          logroTimer.current = T.logroIntervalo;
        }

        if (altarVida.current <= 0) {
          setPantalla("dialogo");
          A.stop();
          setResultadoFinal({
            tipo: "supervivencia",
            tiempo: Math.floor(tiempoSobrevivido.current),
            chispas: chispasJuego.current,
          });
          mostrarDialogo(DIALOGOS.finalSupervivencia, () => setPantalla("final"));
        }
      } else {
        // --- otros modos: ganar atrapando todo, o perder si el altar muere (si aplica) ---
        if (nivel.grietaMaxActivas > 0 && altarVida.current <= 0) {
          setPantalla("dialogo");
          A.stop();
          setResultadoFinal({ tipo: "altarDestruido", chispas: chispasJuego.current });
          mostrarDialogo(DIALOGOS.altarDestruidoAccion, () => setPantalla("final"));
        } else if (idsAtrapados.current.size >= palabrasSet.current.length) {
          setPantalla("dialogo");
          A.stop();
          setResultadoFinal(null);
          mostrarDialogo(DIALOGOS.final, () => setPantalla("final"));
        } else if (modo !== "libre") {
          setTiempoRestante((t) => {
            if (t <= dt) {
              setPantalla("final");
              A.stop();
              return 0;
            }
            return t - dt;
          });
        }
      }

      renderer.render(scene, camera);
      rerender();
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [pantalla, modo, esMovil, factorDificultad, generarLuciernaga, generarEstrellaFugaz, generarSombra, generarSusurro, generarGrieta, rerender, mostrarDialogo, A]);

  /* ============================ INDICADOR DE DIRECCIÓN ============================ */
  let indicador = null;
  if (pantalla === "jugando" && three.current && luciernagas.current.length > 0) {
    const { camera } = three.current;
    let menorAngulo = Infinity, anguloElegido = 0;
    for (const l of luciernagas.current) {
      const dir = l.mesh.position.clone().sub(camera.position).normalize();
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      let a = Math.atan2(dir.x, -dir.z) - Math.atan2(forward.x, -forward.z);
      while (a > Math.PI) a -= Math.PI * 2;
      while (a < -Math.PI) a += Math.PI * 2;
      if (Math.abs(a) < menorAngulo) { menorAngulo = Math.abs(a); anguloElegido = a; }
    }
    if (menorAngulo > THREE.MathUtils.degToRad(T.fovYaw * 0.5)) {
      indicador = anguloElegido > 0 ? "derecha" : "izquierda";
    }
  }

  /* ============================ INDICADOR DE PELIGRO ============================ */
  let peligro = null;
  if (pantalla === "jugando" && three.current) {
    const { camera } = three.current;
    const amenazas = [
      ...sombras.current.map((s) => ({ ...s, tipo: "sombra" })),
      ...susurros.current.map((s) => ({ ...s, tipo: "susurro" })),
      ...grietas.current.map((s) => ({ ...s, tipo: "grieta" })),
    ];
    let masCercana = null, menorDist = Infinity;
    for (const a of amenazas) {
      const d = a.mesh.position.distanceTo(camera.position);
      if (d < menorDist) { menorDist = d; masCercana = a; }
    }
    const radioAlerta = 15;
    if (masCercana && menorDist < radioAlerta) {
      const dir = masCercana.mesh.position.clone().sub(camera.position).normalize();
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      let a = Math.atan2(dir.x, -dir.z) - Math.atan2(forward.x, -forward.z);
      while (a > Math.PI) a -= Math.PI * 2;
      while (a < -Math.PI) a += Math.PI * 2;
      const lado = Math.abs(a) > THREE.MathUtils.degToRad(150) ? "atras"
        : a > 0 ? "derecha" : "izquierda";
      peligro = { lado, tipo: masCercana.tipo, cerca: menorDist < 6 };
    }
  }

  const totalPalabras = palabrasSet.current.length || 1;
  const progresoPct = (idsAtrapados.current.size / totalPalabras) * 100;
  const altarPct = (altarVida.current / T.altarVidaMax) * 100;
  const nivelActual = nivelRef.current;
  const muestraAltar = pantalla === "jugando" && nivelActual.grietaMaxActivas > 0;

  return (
    <div style={{ width: "100%", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 4px", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, color: "#3a3160", flexWrap: "wrap" }}>
          <span>✨ Luciérnagas de la Memoria</span>
          {pantalla === "jugando" && <span>🍯 {idsAtrapados.current.size}/{totalPalabras}</span>}
          {pantalla === "jugando" && <span>💫 {chispasJuego.current}</span>}
          {pantalla === "jugando" && modo === "supervivencia" && <span>⏱️ {tiempoSobrevividoUI}s</span>}
          {pantalla === "jugando" && modo !== "libre" && modo !== "supervivencia" && <span>⏳ {Math.ceil(tiempoRestante)}s</span>}
          {pantalla === "jugando" && racha.current >= 2 && <span>🔥 x{racha.current}</span>}
          {pantalla === "jugando" && bendicion.current > 0 && <span>🕯️ {Math.ceil(bendicion.current)}s</span>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setMute((m) => !m)} style={{ background: "#F4EDE6", border: "2px solid #3a3160", borderRadius: 10, padding: "2px 10px", cursor: "pointer" }}>
            {mute ? "🔇" : "🔊"}
          </button>
          {onSalir && (
            <button onClick={() => { A.stop(); onSalir(); }} style={{ background: "#F4EDE6", border: "2px solid #3a3160", borderRadius: 10, padding: "2px 10px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
              Salir
            </button>
          )}
        </div>
      </div>

      {/* CAMBIO: barra de vida del altar, cuando hay Grietas en el modo */}
      {muestraAltar && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 4px 4px" }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#3a3160" }}>🏛️ Altar</span>
          <div style={{ flex: 1, height: 8, background: "#00000020", borderRadius: 999, overflow: "hidden" }}>
            <div style={{
              width: `${altarPct}%`, height: "100%",
              background: altarPct > 50 ? "#ffd97d" : altarPct > 20 ? "#e0a520" : "#d84343",
              transition: "width .3s",
            }} />
          </div>
        </div>
      )}

      {pantalla === "jugando" && (
        <div style={{ height: 8, background: "#00000020", borderRadius: 999, overflow: "hidden", margin: "0 4px 8px" }}>
          <div style={{ width: `${progresoPct}%`, height: "100%", background: "#ffd97d", transition: "width .3s" }} />
        </div>
      )}

      <div
        ref={contenedorRef}
        onMouseMove={pantalla === "jugando" ? onMouseMove : undefined}
        onClick={pantalla === "jugando" ? onClickDesktop : undefined}
        onTouchStart={pantalla === "jugando" ? onTouchStartEscenario : undefined}
        onTouchMove={pantalla === "jugando" ? onTouchMoveEscenario : undefined}
        onTouchEnd={pantalla === "jugando" ? onTouchEndEscenario : undefined}
        style={{
          position: "relative", width: "100%", height: "min(64vh, 520px)",
          borderRadius: 24, overflow: "hidden", border: "3px solid #3a3160",
          cursor: pantalla === "jugando" && !esMovil ? "none" : "default", background: "#0a1230",
          touchAction: "none",
        }}
      >
        {pantalla === "jugando" && three.current && luciernagas.current.map((l) => {
          const { camera } = three.current;
          const ndc = l.mesh.position.clone().project(camera);
          if (ndc.z > 1) return null;
          const x = (ndc.x * 0.5 + 0.5) * 100;
          const y = (-ndc.y * 0.5 + 0.5) * 100;
          return (
            <div key={l.id} style={{
              position: "absolute", left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-160%)",
              fontSize: 11, fontWeight: 800, color: "#fff8e2", textShadow: "0 1px 4px rgba(0,0,0,.7)",
              whiteSpace: "nowrap", pointerEvents: "none",
            }}>
              {l.palabra}
            </div>
          );
        })}

        {pantalla === "jugando" && (
          <div style={{
            position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)",
            fontSize: 22, color: bendicion.current > 0 ? "#ffe08acc" : "#ffe9a8cc", pointerEvents: "none",
          }}>
            {ASSETS_2D.mira}
          </div>
        )}

        {mensajeFlotante && (
          <div style={{
            position: "absolute", left: "50%", top: "30%", transform: "translate(-50%,-50%)",
            fontSize: 18, fontWeight: 800, color: "#fff8e2", textShadow: "0 2px 8px rgba(0,0,0,.7)",
            pointerEvents: "none", animation: "luc3d-flotar-msj 1.6s ease-out forwards", textAlign: "center", maxWidth: "80%",
          }}>
            {mensajeFlotante}
          </div>
        )}

        {indicador && (
          <div style={{
            position: "absolute", top: "50%", [indicador === "derecha" ? "right" : "left"]: 10,
            transform: "translateY(-50%)", fontSize: 26, color: "#ffe9a8", opacity: 0.85,
            animation: "luc3d-pulso 1s infinite", pointerEvents: "none",
          }}>
            {indicador === "derecha" ? "➤" : "◀"}
          </div>
        )}

        {peligro && (
          <div style={{
            position: "absolute",
            ...(peligro.lado === "atras"
              ? { top: 10, left: "50%", transform: "translateX(-50%)" }
              : { top: "40%", [peligro.lado === "derecha" ? "right" : "left"]: 10 }),
            fontSize: peligro.cerca ? 30 : 24,
            color: peligro.tipo === "sombra" ? "#ff6688" : peligro.tipo === "susurro" ? "#8fd0ff" : "#ff9955",
            opacity: 0.9, pointerEvents: "none",
            animation: `luc3d-pulso ${peligro.cerca ? "0.4s" : "0.8s"} infinite`,
            textShadow: "0 0 8px rgba(0,0,0,.6)",
          }}>
            {peligro.lado === "atras" ? "⚠️ ¡DETRÁS!" : peligro.lado === "derecha" ? "⚠️➤" : "◀⚠️"}
          </div>
        )}

        {pantalla === "jugando" && (
          <div style={{
            position: "absolute", left: "50%", bottom: -14, transform: "translateX(-50%)",
            fontSize: 120, filter: "drop-shadow(0 -8px 18px rgba(0,0,0,.55))", pointerEvents: "none",
          }}>
            {ASSETS_2D.mouriManos}
          </div>
        )}

        {pantalla === "jugando" && (
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", boxShadow: "inset 0 0 100px 25px rgba(5,6,20,.5)" }} />
        )}

        {pantalla === "jugando" && flashRoja.current > 0 && (
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: `rgba(180,20,60,${flashRoja.current * 0.5})`,
            boxShadow: `inset 0 0 140px 30px rgba(180,20,60,${flashRoja.current * 0.7})`,
          }} />
        )}

        {pantalla === "jugando" && flashAzul.current > 0 && (
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: `rgba(90,160,255,${flashAzul.current * 0.45})`,
            boxShadow: `inset 0 0 140px 30px rgba(90,160,255,${flashAzul.current * 0.7})`,
          }} />
        )}

        {/* CAMBIO: destello cuando La Grieta golpea el altar */}
        {pantalla === "jugando" && flashMorada.current > 0 && (
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: `rgba(140,20,30,${flashMorada.current * 0.4})`,
            boxShadow: `inset 0 0 160px 40px rgba(140,20,30,${flashMorada.current * 0.6})`,
          }} />
        )}

        {pantalla === "jugando" && hechizoJugador.current > 0 && (
          <div style={{
            position: "absolute", left: "50%", top: "16%", transform: "translateX(-50%)",
            fontSize: 26, pointerEvents: "none", animation: "luc3d-pulso .6s infinite",
          }}>
            💫
          </div>
        )}

        {/* CAMBIO: ícono de Bendición activa (Farol de Poder) */}
        {pantalla === "jugando" && bendicion.current > 0 && (
          <div style={{
            position: "absolute", right: "6%", top: "16%",
            fontSize: 22, pointerEvents: "none", animation: "luc3d-pulso .8s infinite",
          }}>
            🕯️
          </div>
        )}

        {pantalla === "jugando" && esMovil && (
          <div style={{
            position: "absolute", left: 24, bottom: 24, width: 90, height: 90, borderRadius: "50%",
            border: "2px solid rgba(255,255,255,.35)", background: "rgba(255,255,255,.08)", pointerEvents: "none",
          }}>
            <div style={{
              position: "absolute", left: "50%", top: "50%",
              transform: `translate(calc(-50% + ${joystick.current.x * 30}px), calc(-50% + ${joystick.current.z * 30}px))`,
              width: 36, height: 36, borderRadius: "50%", background: "rgba(255,217,125,.75)",
            }} />
          </div>
        )}

        {pantalla === "jugando" && esMovil && (
          <button
            onTouchStart={(e) => { e.stopPropagation(); intentarAtrapar(); }}
            style={{
              position: "absolute", right: 24, bottom: 24, width: 74, height: 74, borderRadius: "50%",
              background: "#ffd97d", border: "3px solid #4a3b2c", fontSize: 26, fontWeight: 800,
              color: "#4a3b2c", boxShadow: "0 4px 14px rgba(0,0,0,.4)",
            }}
          >
            🏮
          </button>
        )}

        {pantalla === "jugando" && esMovil && (
          <button
            onTouchStart={(e) => { e.stopPropagation(); dispararLuz(); }}
            style={{
              position: "absolute", right: 110, bottom: 24, width: 60, height: 60, borderRadius: "50%",
              background: "#bfe0ff", border: "3px solid #23406b", fontSize: 22, fontWeight: 800,
              color: "#23406b", boxShadow: "0 4px 14px rgba(0,0,0,.4)",
            }}
          >
            ✨
          </button>
        )}

        {pantalla === "jugando" && esMovil && (
          <button
            onTouchStart={(e) => { e.stopPropagation(); girar180(); }}
            style={{
              position: "absolute", left: 130, bottom: 24, width: 54, height: 54, borderRadius: "50%",
              background: "#F4EDE6", border: "3px solid #3a3160", fontSize: 22, fontWeight: 800,
              color: "#3a3160", boxShadow: "0 4px 14px rgba(0,0,0,.4)",
            }}
          >
            ↩️
          </button>
        )}

        {pantalla === "dialogo" && dialogo && (
          <CajaDeDialogo linea={dialogo.lines[dialogo.i]} paso={dialogo.i + 1} total={dialogo.lines.length} onSiguiente={avanzarDialogo} />
        )}

        {pantalla === "titulo" && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 20, background: "rgba(10,12,30,.6)" }}>
            <div style={{ fontSize: 54 }}>✨</div>
            <h2 style={{ color: "#fff8e2", margin: "6px 0", fontSize: 24 }}>Luciérnagas de la Memoria</h2>
            <p style={{ color: "#e8e0cc", fontSize: 13, maxWidth: 480, margin: "6px auto 18px" }}>
              {esMovil
                ? "Usa el joystick de la izquierda para caminar, arrastra del lado derecho para mirar, toca 🏮 para atrapar, ✨ para disparar y ↩️ para girar 180°."
                : "Camina con W A S D (o flechas), mira con el mouse. Un clic atrapa o dispara según lo que apuntes, y Q gira 180° al instante."}
              {" "}Busca los Faroles de Poder 🕯️ repartidos por el mapa — te dan un empujón temporal.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              <button onClick={() => iniciarPartida("libre")} style={btn("#ffd97d", "#4a3b2c")}>🌙 Modo Libre</button>
              <button onClick={() => iniciarPartida("recuerdo")} style={btn("#a68966", "#fff")}>⏳ Modo Recuerdo</button>
              <button onClick={() => iniciarPartida("accion")} style={btn("#d9534f", "#fff")}>🔥 Modo Acción</button>
              <button onClick={() => iniciarPartida("supervivencia")} style={btn("#5b4a8a", "#fff")}>🏆 Supervivencia</button>
            </div>
          </div>
        )}

        {pantalla === "final" && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 24, background: "rgba(10,12,30,.75)" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>{resultadoFinal ? "🕯️" : "🌟"}</div>
            <p style={{ color: "#fff8e2", fontSize: 20, fontWeight: 800, maxWidth: 500, lineHeight: 1.5, margin: "0 0 12px" }}>
              {resultadoFinal?.tipo === "supervivencia"
                ? `Resististe ${resultadoFinal.tiempo} segundos defendiendo el altar.`
                : resultadoFinal?.tipo === "altarDestruido"
                ? "El altar se apagó. Puedes intentarlo de nuevo."
                : idsAtrapados.current.size >= totalPalabras
                ? palabrasSet.current.join(" ")
                : "Esta vez no alcanzaste a reunir todas las palabras… inténtalo otra vez."}
            </p>
            <p style={{ color: "#c9c2e0", fontSize: 12, marginBottom: 16 }}>
              💫 Chispas conseguidas: {resultadoFinal ? resultadoFinal.chispas : chispasJuego.current}
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => iniciarPartida(modo)} style={btn("#ffd97d", "#4a3b2c")}>↺ Jugar de nuevo</button>
              <button onClick={() => setPantalla("titulo")} style={btn("#a68966", "#fff")}>Cambiar modo</button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes luc3d-pulso{0%,100%{opacity:.4}50%{opacity:.9}}
        @keyframes luc3d-flotar-msj{0%{opacity:0;transform:translate(-50%,-30%) scale(.8)}15%{opacity:1;transform:translate(-50%,-50%) scale(1.1)}75%{opacity:1}100%{opacity:0;transform:translate(-50%,-70%) scale(1)}}
      `}</style>
    </div>
  );
}

function btn(bg, color) {
  return { background: bg, color, border: "none", borderRadius: 16, padding: "10px 20px", fontWeight: 800, fontSize: 13, cursor: "pointer", boxShadow: "0 4px 14px rgba(0,0,0,.25)" };
}

function CajaDeDialogo({ linea, paso, total, onSiguiente }) {
  const p = PERSONAJES[linea.quien] || PERSONAJES.narrador;
  return (
    <div
      onClick={onSiguiente}
      style={{
        position: "absolute", inset: 0, zIndex: 40, background: "rgba(8,8,14,.5)",
        display: "flex", alignItems: "flex-end", justifyContent: "center", cursor: "pointer", padding: 18,
      }}
    >
      <div style={{
        width: "min(560px, 100%)", background: p.fondo, border: "4px solid #786F49",
        borderRadius: 18, padding: "14px 18px", boxShadow: "0 8px 30px rgba(0,0,0,.4)",
      }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          {p.retrato && <div style={{ fontSize: 40, lineHeight: 1 }}>{p.retrato}</div>}
          <div style={{ flex: 1 }}>
            {p.nombre && (
              <div style={{ fontWeight: 800, fontSize: 12, letterSpacing: 1, color: p.color, opacity: .75, marginBottom: 2 }}>
                {p.nombre}
              </div>
            )}
            <div style={{ fontSize: 15, lineHeight: 1.45, color: p.color, fontStyle: p.nombre ? "normal" : "italic" }}>
              {linea.texto}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: 11, color: p.color, opacity: .6, marginTop: 6 }}>
          {paso}/{total} · clic/tap o ENTER ▸
        </div>
      </div>
    </div>
  );
}
