/* =====================================================================
 *  mouri-game.config.js — Todo lo que puedes personalizar sin tocar el
 *  resto del código: sprites, fondos por día, música (una por cada
 *  pecado/jefe), introducción con tus imágenes y textos, diálogos, y
 *  los números generales del juego.
 *
 *  Mapeo final de los 7 días -> 7 pecados capitales:
 *    Día 1 = Gula      (se queda en un lado del fondo, intenta tragarnos)
 *    Día 2 = Lujuria    (vuela, hechiza y nos invierte los controles)
 *    Día 3 = Pereza     (mecánica lenta y perezosa, pero traicionera)
 *    Día 4 = Envidia    (agresiva, nos imita, estilo "Leviatán" del mar)
 *    Día 5 = Avaricia   (se planta a la derecha y ataca sin parar)
 *    Día 6 = Ira        (¡carrera de autos! nos persigue sin descanso)
 *    Día 7 = Orgullo    (jefe final: se derrota con inteligencia, no fuerza)
 * ===================================================================== */

export const ASSETS = {
  mouri: "/images/mouri-game/mouri_walk_right.gif",
  mouriIzquierda: "/images/mouri-game/mouri_walk_left.gif",
  mouriVolador: "/images/mouri-game/mouri_volador.gif",
  mouriAuto: "/images/mouri-game/mouri_auto.gif",
  girasol: "/images/mouri-game/flor_amarilla.gif",
  rosa: "/images/mouri-game/rosa_amarilla.gif",
  lavanda: "/images/mouri-game/flor_morada.gif",
  margarita: "/images/mouri-game/flor_azul.gif",
  marchita: "🥀",
  sombra: "👤",
  sombraGrande: "🕴️",
  bala: "/images/mouri-game/rayo.gif",
  orbe: "/images/mouri-game/orbe.gif",
  rayo: "⚡",
  perla: "✨",
  hechizo: "💫",
  escudo: "🛡️",
  auto: "/images/mouri-game/mouri_kart.png",
  autoIra: "🔥",
  obstaculo: "🪨",
  moneda: "🪙",
};

export const FLOOR_IMG = "/images/mouri-game/piso.png";

export const DAY_BG = {
  1: "/images/mouri-game/fondo_gula.gif",
  2: "/images/mouri-game/fondo_lujuria.gif",
  3: "/images/mouri-game/fondo_pereza.gif",
  4: "/images/mouri-game/fondo_envidia.gif",
  5: "/images/mouri-game/fondo_avaricia.gif",
  6: "/images/mouri-game/fondo_ira.gif",
  7: "/images/mouri-game/fondo_orgullo.gif",
};

export const MUSICA = {
  menu: "/images/mouri-game/audios/menu.mp3",
  dia: "/images/mouri-game/audios/noche.mp3",
  noche: "/images/mouri-game/audios/noche.mp3",
  victoria: null,
  derrota: null,
  creditos: null,
  gula: "/images/mouri-game/audios/gula.mp3",
  lujuria: "/images/mouri-game/audios/lujuria.mp3",
  pereza: "/images/mouri-game/audios/pereza.mp3",
  envidia: "/images/mouri-game/audios/envidia.mp3",
  avaricia: "/images/mouri-game/audios/avaricia.mp3",
  ira: "/images/mouri-game/audios/ira.mp3",
  orgullo: "/images/mouri-game/audios/orgullo.mp3",
  orgulloFase2: null,
};
export const VOLUMEN_MUSICA = 0.45;

export const SONIDOS = {
  disparo: null,
  golpe: null,
  curar: null,
  especial: null,
  sombra: null,
  aparicion: null,
  correcto: null,
  error: null,
  choque: null,
};
export const VOLUMEN_SONIDOS = 0.6;

/* Introducción: pantallas iniciales, antes del título. Cada una es
 * { imagen, texto }. Vacío = va directo al título. Se avanza con clic/ENTER. */
export const INTRO_SLIDES = [
  {
  imagen: "/images/mouri-game/intro/1.jpg",
  texto: "Hace mucho tiempo, en el limbo habia un cuervo llamado Mouri el cual tenia el sueño de montar una funeraria en el mundo humano con la cual querian salvar a la gente del pecado y ayudarles en el duelo.",
  },
  {
  imagen: "/images/mouri-game/intro/2.jpg",
  texto: "Pero cuando los 7 pecados capitales y reyes del infierno escucharon esto pusieron a mouri en la mira, no dejarian que mouri salvara a la gente del pecado",
  },
  {
  imagen: "/images/mouri-game/intro/3.jpg",
  texto: "Mouri fue secuestrado y puesto en el primer anillo del inframundo como pricionero por alterar el orden dijeron !!!Un cuervo no ayudara a los pecaminosos humanos!!!",
  },
  {
  imagen: "/images/mouri-game/intro/4.jpg",
  texto: "Pero sus amigos cuervos no dejarian que se llevaran a Mouri iban a salvar a la humanidad del pecado por eso todos los cuervos reunieron un poder en 4 flores representando, la huella eterna, el descanso sereno, el legado eterno y el tributo a la vida.",
  },
  {
  imagen: "/images/mouri-game/intro/5.jpg",
  texto: "Y cuando mouri estaba apunto de ser ejecutado",
  },
  {
  imagen: "/images/mouri-game/intro/6.jpg",
  texto: "Aparecieron las 4 flores con el poder de sus amigos los cuervos y la esperanza y todos estuvieron dispuestos a acabar con los 7 pecados capitales y es tu deber guiar a mouri en su camino a derrotarlos..",
  },
];

export const CREDITOS_IMAGENES = [
  // "/images/mouri-game/creditos/foto1.jpg",
];

/* Imagen final a pantalla completa: se muestra en la pantalla de victoria,
 * justo después de los créditos (o después del diálogo de victoria si no
 * hay créditos). Pon aquí la ruta de tu imagen, o null para no usar ninguna
 * y quedarte con el fondo degradado + emojis de siempre. */
export const FINAL_IMG = null; // ej: "/images/mouri-game/final.jpg"

export const PERSONAJES = {
  mouri: { nombre: "Mouri", retrato: "/images/mouri-game/mouri_talker.png", color: "#4E3A25", fondo: "#FFF8E8" },
  olvido: { nombre: "El Orgullo", retrato: "👁️", color: "#EDE6FF", fondo: "#2a2140" },
  jardin: { nombre: "El Jardín", retrato: "🌱", color: "#2f4a24", fondo: "#e6f3d8" },
  narrador: { nombre: "", retrato: "", color: "#f3ecd8", fondo: "#1c1a2b" },
};

export const DIALOGOS = {
  intro: [
    { quien: "narrador", texto: "Un jardín donde cada flor es un recuerdo de alguien que amamos." },
    { quien: "mouri", texto: "¡Hola! Soy Mouri. Cuidaré este jardín contigo durante siete días." },
    { quien: "mouri", texto: "Cada día llega un pecado distinto a apagar una flor. Hoy empezamos por la Gula." },
  ],
  dia: {
    1: [{ quien: "mouri", texto: "Algo devora las sobras del jardín al fondo... ¡es la Gula! Cuídate de sus mordiscos." }],
    2: [{ quien: "mouri", texto: "La Lujuria vuela sobre nosotros. Si su hechizo te toca, tus controles se invierten." }],
    3: [{ quien: "mouri", texto: "La Pereza casi no se mueve... pero barre el suelo con sus golpes. ¡Ya puedes SALTAR (↑) para esquivarlos!" }],
    4: [{ quien: "mouri", texto: "El agua se agita: la Envidia llega desde el mar, imitando cada paso que doy." }],
    5: [{ quien: "mouri", texto: "La Avaricia se planta del lado derecho. No se moverá, pero no dejará de atacar. esta plata no deja ver nadaa" }],
    6: [{ quien: "mouri", texto: "¡La Ira nos persigue en la carretera! Toma el coche funebre y conduceeeee" }],
    7: [
      { quien: "narrador", texto: "El salón del Orgullo. Ningún golpe basta aquí: solo la mente gana esta pelea." },
      { quien: "olvido", texto: "Repite lo que hago... si puedes." },
    ],
  },
  miniJefe: {
    gula: [{ quien: "mouri", texto: "¡La Gula! Se queda cerca del fondo, tratando de tragarnos y devorar la flor más sana." }],
    lujuria: [{ quien: "mouri", texto: "La Lujuria vuela en zigzag. Cuidado con su hechizo: invierte tus pasos." }],
    pereza: [{ quien: "mouri", texto: "La Pereza apenas se mueve, pero cuando ataca, ya es tarde para esquivar sin pensar." }],
    envidia: [{ quien: "mouri", texto: "¡La Envidia! Copia mis movimientos como un reflejo agresivo del mar." }],
    avaricia: [{ quien: "mouri", texto: "La Avaricia no se mueve de su rincón, pero acumula monedas que la hacen más fuerte." }],
  },
  miniJefeVencido: [{ quien: "mouri", texto: "¡Bien hecho! El jardín respira otra vez." }],
  finDia: [{ quien: "mouri", texto: "Un día más. Las flores aguantaron gracias a ti." }],
  iraIntro: [{ quien: "mouri", texto: "¡No hay tiempo para pelear! Súbete al auto, la Ira viene detrás." }],
  iraVictoria: [{ quien: "mouri", texto: "¡Lo logramos! Dejamos a la Ira atrás, por ahora." }],
  iraDerrota: [{ quien: "mouri", texto: "Nos alcanzó... respira, podemos intentarlo de nuevo." }],
  orgulloIntro: [
    { quien: "olvido", texto: "Ríndete. Ni con toda tu fuerza podrás tocarme." },
    { quien: "mouri", texto: "No necesito fuerza. Solo necesito prestar atención." },
  ],
  orgulloVictoria: [
    { quien: "olvido", texto: "Imposible... alguien vio a través de mí..." },
    { quien: "mouri", texto: "El orgullo se cae solo, cuando alguien deja de creerle." },
  ],
  victoria: [
    { quien: "mouri", texto: "Mientras alguien recuerde, ninguna flor deja de florecer." },
    { quien: "narrador", texto: "El cielo volvió a encenderse sobre el Jardín de los Recuerdos." },
  ],
  derrota: [
    { quien: "narrador", texto: "El jardín se apagó..." },
    { quien: "mouri", texto: "No pasa nada. Un recuerdo siempre puede volver a florecer. ¿Lo intentamos otra vez?" },
  ],
};

export const TUTORIAL_PASOS = [
  { icono: "🕹️", titulo: "Moverte y cuidar", texto: "Usa ← → para caminar. Acércate a una flor y presiona X para cuidarla." },
  { icono: "✨", titulo: "Disparo de luz", texto: "Desde el día 2 puedes disparar con ESPACIO (disparo recto) o con Z (disparo ondulante, más lento pero cubre más altura)." },
  { icono: "⤴", titulo: "Salto y Especial", texto: "↑ para saltar. C lanza el Rayo del Recuerdo cuando la barra esté llena." },
  { icono: "😈", titulo: "Los 7 pecados", texto: "Cada día enfrentas un pecado distinto, cada uno con su propia forma de jugar: Gula, Lujuria, Pereza, Envidia, Avaricia, Ira y Orgullo." },
  { icono: "🚗", titulo: "Día de la Ira", texto: "Ese día el juego cambia por completo: manejas un auto y esquivas obstáculos mientras la Ira te persigue." },
  { icono: "👁️", titulo: "El Orgullo final", texto: "No se vence a golpes: debes repetir el patrón que él te muestra. Un error te cuesta una vida." },
];

export const T = {
  CW: 1200,
  base: 100,
  mouriSpeed: 300,
  gravity: 1400,
  jumpV: 520,
  reach: 95,
  bulletSpeed: 520,
  fireRate: 0.2,
  bulletDmgBoss: 3,
  bulletDmgMini: 1,
  flowerMax: 100,
  shadowDmg: 15,
  mouriMaxHP: 3,
  invulnTime: 1.2,
  reviveHealth: 40,
  regenRosaGarden: 2.5,
  regenGirasol: 5,
  tickMs: 33,
  iraDur: 40,
  iraCarrilAncho: 200,
  iraVelBase: 260,
  iraVelIra: 235,
  orgulloRondas: 6,
  orgulloTiempoPorSimbolo: 0.62,
};

export const MINI_JEFES = {
  gula: { id: "gula", nombre: "El Glotón", pecado: "Gula", sprite: "🐷", hp: 100, vel: 60, ataque: 1.7, color: "#C17817" },
  lujuria: { id: "lujuria", nombre: "La Seducción", pecado: "Lujuria", sprite: "/images/mouri-game/jefes/lujuria.png", hp: 40, vel: 150, ataque: 2.1, color: "#D6567B" },
  pereza: { id: "pereza", nombre: "La Bruma", pecado: "Pereza", sprite: "🌫️", hp: 130, vel: 18, ataque: 3.4, color: "#9fb3c8" },
  envidia: { id: "envidia", nombre: "El Leviatán", pecado: "Envidia", sprite: "🐍", hp: 16, vel: 150, ataque: 1.9, color: "#3f9c8f" },
  avaricia: { id: "avaricia", nombre: "La Grieta Dorada", pecado: "Avaricia", sprite: "🕳️", hp: 15, vel: 0, ataque: 1.0, color: "#c9a24a" },
};

/* Día 6 (Ira) y Día 7 (Orgullo) usan escenas especiales ("carrera" y
 * "orgullo"), por eso no llevan shadowRate/miniJefe como los demás. */
export const DAYS = [
  { n: 1, name: "La Gula acecha", dur: 45, shadowRate: 0, shadowSpeed: 0, shadowHP: 1, needRate: 4.2, needDecay: 5, miniJefeEn: 22, miniJefe: "gula" },
  { n: 2, name: "El vuelo de la Lujuria", dur: 60, shadowRate: 4.6, shadowSpeed: 24, shadowHP: 2, needRate: 3.8, needDecay: 6, unlock: "Nuevo poder: DISPARO DE LUZ (ESPACIO)", miniJefeEn: 30, miniJefe: "lujuria" },
  { n: 3, name: "El peso de la Pereza", dur: 70, shadowRate: 5.2, shadowSpeed: 16, shadowHP: 2, needRate: 3.4, needDecay: 7, unlock: "Nuevo poder: SALTO (↑)", miniJefeEn: 28, miniJefe: "pereza" },
  { n: 4, name: "La marea de la Envidia", dur: 80, shadowRate: 3.3, shadowSpeed: 30, shadowHP: 3, needRate: 3.1, needDecay: 7, miniJefeEn: 34, miniJefe: "envidia" },
  { n: 5, name: "El rincón de la Avaricia", dur: 90, shadowRate: 2.9, shadowSpeed: 33, shadowHP: 3, needRate: 2.9, needDecay: 8, unlock: "Nuevo poder: ESPECIAL — Rayo del Recuerdo (C)", miniJefeEn: 38, miniJefe: "avaricia" },
  { n: 6, name: "Carretera de la Ira", carrera: true, dur: T.iraDur },
  { n: 7, name: "El Orgullo", orgullo: true },
];
