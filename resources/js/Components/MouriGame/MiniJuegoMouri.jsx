import { useState, useEffect, useRef, useCallback } from "react";

/* =====================================================================
 *  UN DESCANSO CON MOURI — EL JARDÍN DE LOS RECUERDOS
 *  =====================================================================
 *  TODO LO QUE PUEDES PERSONALIZAR ESTÁ EN LOS BLOQUES DE ARRIBA:
 *
 *    1. ASSETS        -> sprites (emoji o ruta a tu imagen)
 *    2. DAY_BG        -> fondo de cada día
 *    3. BOSS_SPRITE   -> El Olvido, un sprite por fase
 *    4. MUSICA        -> música de fondo (pon aquí tus .mp3)
 *    5. SONIDOS       -> efectos de sonido
 *    6. DIALOGOS      -> todos los textos de los personajes
 *    7. PERSONAJES    -> nombre y retrato de quien habla
 *    8. MINI_JEFES    -> los mini-jefes y su comportamiento
 *    9. DAYS          -> duración y dificultad de cada día
 *   10. T             -> números generales (velocidad, daño, vida...)
 *   11. CREDITOS_IMAGENES -> imágenes que se muestran al ganar, antes
 *                            de la pantalla final (pon aquí tus rutas)
 *
 *  Lee INSTRUCCIONES.txt para el paso a paso.
 *
 *  ----------------------------------------------------------------
 *  CAMBIOS EN ESTA VERSIÓN (a pedido tuyo, sin quitar nada):
 *   - Orbes más grandes y con hitbox ajustada a su tamaño real.
 *   - Arreglado el bug de Mouri "encogiéndose" cerca del borde derecho
 *     (era un problema de orden de transforms al voltear el sprite).
 *   - Anillo rojo de aviso cuando Mouri recibe daño, para que se note
 *     claramente CUÁNDO y POR QUÉ perdió una vida.
 *   - Sombras (enemigos pequeños) con más vida por día.
 *   - Mini-jefes más difíciles (más vida, más velocidad, atacan más
 *     seguido). El Eco (el que persigue/"imita" tus movimientos) es
 *     ahora notablemente más agresivo y se divide más.
 *   - Jefe final con más vida, ataques más rápidos, dos ataques nuevos
 *     (Espejo y Tormenta) y una Fase 3 con un estilo de juego distinto:
 *     El Olvido ahora seextra   "refleja" y persigue tu posición en espejo
 *     en vez de solo patrullar.
 *   - Diálogos previos a la pelea final ampliados.
 *   - Al ganar: pasa por tus imágenes de créditos (CREDITOS_IMAGENES)
 *     con música de créditos, y luego llega a la pantalla de victoria.
 *
 *  ----------------------------------------------------------------
 *  NUEVOS CAMBIOS (a pedido tuyo, sin quitar nada de lo anterior):
 *   - Cada día (1 a 6) tiene un mini-jefe inspirado en un pecado capital:
 *     Gula (día 1, nuevo), Lujuria (día 2, nuevo), Pereza (La Bruma),
 *     Envidia (El Susurro), Ira (El Eco) y Codicia (La Grieta).
 *   - La Gula muerde y drena la flor más sana directamente (mecánica
 *     nueva: daño directo por mordisco, no solo "necesidad").
 *   - La Lujuria te "hechiza": si te toca, tus controles se invierten
 *     unos segundos (mecánica nueva de estado alterado).
 *   - Tutorial jugable desde el título ("❔ Cómo jugar"), con pasos.
 *   - Las flores ahora protegen de verdad en la pelea final: si el
 *     jardín está sano (75%+), Mouri gana un escudo que absorbe un
 *     golpe del dragón. Si las flores mueren todas, el dragón se
 *     regenera — cuidarlas importa hasta el último combate.
 *   - Jefe final reinterpretado como un DRAGÓN MARINO GIGANTE, con
 *     4 fases (antes 3), más vida y ataques de agua nuevos (Maremoto,
 *     Chorro, Sumersión con emboscada, Coletazo, Perlas de luz que
 *     cargan tu Especial), sumados a los ataques que ya tenía.
 * ===================================================================== */

/* -------------------------------------------------------------- 1. SPRITES
 * Pon "/images/mouri-game/mouri.gif" en vez del emoji cuando tengas tu arte.
 * El juego detecta solo si es emoji o ruta (si contiene "/").               */
const ASSETS = {
  mouri: "/images/mouri-game/mouri_walk_right.gif",
  // CAMBIO: si tienes un gif de Mouri caminando hacia la IZQUIERDA, ponlo
  // aquí. Así, al caminar a la izquierda, se usa ese gif tal cual (sin
  // voltear el de la derecha). Voltear un gif de caminata a veces hace
  // que el ciclo de piernas se vea "al revés"/de espaldas, así que esto
  // lo evita. Si lo dejas en null, el juego sigue volteando el de la
  // derecha como hasta ahora.
  mouriIzquierda: "/images/mouri-game/mouri_walk_left.gif", // "/images/mouri-game/mouri_walk_left.gif"
  mouriVolador: "/images/mouri-game/mouri_volador.gif",
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
  // CAMBIO: nuevos assets para las mecánicas del dragón final y la Lujuria
  perla: "✨",           // perla de luz del dragón (carga tu Especial al tocarla)
  hechizo: "💫",          // ícono que aparece sobre Mouri mientras está hechizado
  escudo: "🛡️",          // ícono del escudo de flores en la pelea final
};

const FLOOR_IMG = "/images/mouri-game/piso.png"

/* ------------------------------------------------------- 2. FONDOS POR DÍA
 * null = usa el degradado por defecto.                                     */
const DAY_BG = { 1: "/images/mouri-game/fondo1.jpg", 2: "/images/mouri-game/fondo2.jpg", 3: "/images/mouri-game/fondo3.jpg", 4: "/images/mouri-game/fondo4.jpg",
   5: "/images/mouri-game/fondo5.gif", 6: "/images/mouri-game/fondo6.gif", 7: "/images/mouri-game/fondo7.gif" };

/* ------------------------------------------- 3. EL OLVIDO (una por fase) */
const BOSS_SPRITE = { 1: "🌑", 2: "🌚", 3: "👁️", 4: "🐉" }; // CAMBIO: fase 4 = el dragón despierto del todo

/* -------------------------------------------------------------- 4. MÚSICA
 * Copia tus .mp3 en  public/audio/  y escribe la ruta aquí.
 * Ejemplo:  jefe: "/audio/jefe.mp3"
 * Deja null si todavía no tienes ese tema (no suena nada y no da error).   */
const MUSICA = {
  menu: "/images/mouri-game/audios/menu.mp3", // "/audio/menu.mp3"
  dia: "/images/mouri-game/audios/menu.mp3", // "/audio/dia_tranquilo.mp3"
  noche: "/images/mouri-game/audios/noche.mp3", // "/audio/noche.mp3"        (día 6)
  miniJefe: "/images/mouri-game/audios/bosses.mp3", // "/audio/mini_jefe.mp3"
  jefe: "/images/mouri-game/audios/bosses.mp3", // "/audio/jefe.mp3"          <-- LA MÚSICA DEL JEFE
  jefeFase3: null, // "/audio/jefe_furia.mp3"    (opcional, fase final)
  jefeFase4: null, // "/audio/dragon_furia.mp3"  (opcional, cuando el dragón despierta del todo)
  victoria: null, // "/audio/victoria.mp3"
  derrota: null, // "/audio/derrota.mp3"
  creditos: null, // "/audio/creditos.mp3"      <-- LA MÚSICA DE LOS CRÉDITOS FINALES
};
const VOLUMEN_MUSICA = 0.45;

/* ------------------------------------------------------------- 5. SONIDOS */
const SONIDOS = {
  disparo: null, // "/audio/sfx_disparo.mp3"
  golpe: null, // "/audio/sfx_golpe.mp3"
  curar: null, // "/audio/sfx_curar.mp3"
  especial: null, // "/audio/sfx_especial.mp3"
  sombra: null, // "/audio/sfx_sombra.mp3"
  aparicion: null, // "/audio/sfx_aparicion.mp3"
};
const VOLUMEN_SONIDOS = 0.6;

/* -------------------------------------------------- 11. CRÉDITOS FINALES
 * Pon aquí, en orden, las rutas de las imágenes que quieras mostrar al
 * ganar (antes de la pantalla de victoria). Si dejas el arreglo vacío,
 * el juego pasa directo a la pantalla de victoria como antes.
 * Ejemplo: "/images/mouri-game/creditos/foto1.jpg"                        */
const CREDITOS_IMAGENES = [
  // "/images/mouri-game/creditos/foto1.jpg",
  // "/images/mouri-game/creditos/foto2.jpg",
];

/* ---------------------------------------------------------- 7. PERSONAJES
 * Quién habla en los diálogos. Cambia el retrato por tu sprite.            */
const PERSONAJES = {
  mouri: { nombre: "Mouri", retrato: "🧚", color: "#4E3A25", fondo: "#FFF8E8" },
  olvido: { nombre: "El Olvido", retrato: "🌑", color: "#EDE6FF", fondo: "#2a2140" },
  jardin: { nombre: "El Jardín", retrato: "🌱", color: "#2f4a24", fondo: "#e6f3d8" },
  narrador: { nombre: "", retrato: "", color: "#f3ecd8", fondo: "#1c1a2b" },
  // Agrega los tuyos:  abuela: { nombre:"Abuela", retrato:"👵", color:"#4E3A25", fondo:"#FFF8E8" },
};

/* ----------------------------------------------------------- 6. DIÁLOGOS
 * Cada línea es  { quien: "mouri", texto: "..." }
 * "quien" debe existir en PERSONAJES. Puedes poner las líneas que quieras.
 * Se avanza con ENTER o clic.                                              */
const DIALOGOS = {
  // Al abrir el juego
  intro: [
    { quien: "narrador", texto: "Un jardín donde cada flor es un recuerdo de alguien que amamos." },
    { quien: "mouri", texto: "¡Hola! Soy Mouri. Cuidaré este jardín contigo durante siete días." },
    { quien: "mouri", texto: "Si las flores florecen, los recuerdos viven. Si las descuidamos... llega El Olvido." },
  ],

  // Al empezar cada día (la clave es el número del día)
  dia: {
    1: [{ quien: "mouri", texto: "Hoy solo aprenderemos a cuidarlas. Acércate a una flor y presiona X." }],
    2: [
      { quien: "mouri", texto: "Algo se mueve entre los arbustos..." },
      { quien: "mouri", texto: "¡Son sombras! Presiona ESPACIO para disparar luz. La luz las disuelve." },
    ],
    3: [{ quien: "mouri", texto: "Vienen más. Recuerda: cada flor tiene un poder que nos ayuda." }],
    4: [{ quien: "mouri", texto: "Hoy aprendí algo nuevo: puedo saltar con ↑. Úsalo para esquivar." }],
    5: [
      { quien: "jardin", texto: "El jardín brilla cuando lo cuidas. Esa luz se puede usar." },
      { quien: "mouri", texto: "¡Es el Rayo del Recuerdo! Se carga solo si las flores están sanas. Presiona C." },
    ],
    6: [
      { quien: "mouri", texto: "Cae la noche. El aire se siente pesado..." },
      { quien: "olvido", texto: "Mañana... nadie recordará este jardín." },
      { quien: "mouri", texto: "¡No le hagas caso! Resiste hasta el amanecer." },
    ],
    7: [
      { quien: "narrador", texto: "El cielo se apagó. El jardín contuvo la respiración." },
      { quien: "mouri", texto: "Ten cuidado... siento una presencia..." },
      { quien: "olvido", texto: "Todo lo que amaste se vuelve niebla. Yo solo llego un poco antes." },
      { quien: "mouri", texto: "¡Mientras las flores vivan, no puedes ganar!" },
      { quien: "olvido", texto: "Entonces empecemos a olvidar... ahora mismo." },
      { quien: "mouri", texto: "Respira, jardín. Yo te voy a proteger." },
      // CAMBIO: se anticipa que El Olvido no es solo una sombra, sino algo
      // inmenso que duerme bajo el agua del jardín.
      { quien: "narrador", texto: "Bajo la tierra húmeda del jardín, algo enorme se remueve entre las raíces." },
      { quien: "mouri", texto: "Eso no suena como una sombra... suena como algo que ha esperado mucho tiempo." },
    ],
  },

  // Cuando aparece un mini-jefe (la clave es el id del mini-jefe)
  miniJefe: {
    // CAMBIO: se agregó una segunda línea a cada uno nombrando su pecado,
    // y dos mini-jefes nuevos (Gula y Lujuria) para que los 6 primeros
    // días tengan, cada uno, un pecado capital distinto.
    gula: [
      { quien: "mouri", texto: "¡La Gula! Va directo a la flor más sana para devorarla." },
      { quien: "mouri", texto: "Cada mordisco la hace más fuerte. ¡No dejes que coma tranquila!" },
    ],
    lujuria: [
      { quien: "mouri", texto: "La Lujuria... cuidado con su hechizo, invierte tus pasos." },
      { quien: "mouri", texto: "Si sientes que caminas al revés, respira y espera a que pase." },
    ],
    bruma: [
      { quien: "mouri", texto: "¡La Bruma! Nubla la vista... pero no puede apagar la luz." },
      { quien: "mouri", texto: "Es la Pereza del jardín: se arrastra, pero no perdona." },
    ],
    susurro: [
      { quien: "mouri", texto: "El Susurro se teletransporta. Escucha antes de disparar." },
      { quien: "mouri", texto: "Es la Envidia: nunca se queda quieta, siempre quiere tu lugar." },
    ],
    grieta: [
      { quien: "mouri", texto: "¡Una Grieta! Invoca sombras sin parar. Ciérrala rápido." },
      { quien: "mouri", texto: "Es la Codicia: mientras más espera, más sombras acumula." },
    ],
    eco: [
      { quien: "mouri", texto: "El Eco copia cada uno de mis pasos... y se divide si lo golpeo. ¡Cuidado!" },
      { quien: "mouri", texto: "Es la Ira: entre más lo golpeas, más se multiplica su furia." },
    ],
  },
  miniJefeVencido: [
    { quien: "mouri", texto: "¡Bien hecho! El jardín respira otra vez." },
  ],

  // Al terminar un día
  finDia: [{ quien: "mouri", texto: "Un día más. Las flores aguantaron gracias a ti." }],

  // Cambios de fase del jefe
  jefeFase2: [
    { quien: "olvido", texto: "¿Por qué insistes? Ni siquiera recuerdas sus voces." },
    { quien: "mouri", texto: "Recuerdo cómo me hacían sentir. Con eso basta." },
  ],
  jefeFase3: [
    { quien: "olvido", texto: "¡Entonces te borraré a ti también!" },
    { quien: "olvido", texto: "Mírame bien... desde ahora seré tu propio reflejo." },
    { quien: "mouri", texto: "¡Ahora! Usa el Rayo del Recuerdo. ¡Las flores están contigo!" },
  ],
  // CAMBIO: fase 4 — el dragón marino despierta por completo
  jefeFase4: [
    { quien: "narrador", texto: "El suelo tiembla. Debajo del jardín, algo inmenso abre los ojos." },
    { quien: "olvido", texto: "¡Soy más viejo que cualquier recuerdo! ¡Soy la marea que se lo lleva todo!" },
    { quien: "mouri", texto: "¡Si el jardín resiste, su corriente no puede arrastrarnos! ¡Protege las flores!" },
  ],

  victoria: [
    { quien: "olvido", texto: "No... alguien... todavía... recuerda..." },
    { quien: "mouri", texto: "Mientras alguien recuerde... ninguna flor deja de florecer." },
    { quien: "narrador", texto: "El cielo volvió a encenderse sobre el Jardín de los Recuerdos." },
  ],
  derrota: [
    { quien: "narrador", texto: "El jardín se apagó..." },
    { quien: "mouri", texto: "No pasa nada. Un recuerdo siempre puede volver a florecer. ¿Lo intentamos otra vez?" },
  ],
};

/* --------------------------------------------------- 12. TUTORIAL JUGABLE
 * CAMBIO: pasos del tutorial que se ve al tocar "❔ Cómo jugar" en el
 * título. Puedes editar los textos o agregar más pasos libremente.       */
const TUTORIAL_PASOS = [
  {
    icono: "🕹️",
    titulo: "Moverte y cuidar",
    texto: "Usa ← → para caminar. Acércate a una flor y presiona X para cuidarla, revivirla o atender lo que necesite.",
  },
  {
    icono: "✨",
    titulo: "Disparo de luz",
    texto: "Desde el día 2 puedes disparar con ESPACIO. La luz disuelve las sombras y también hace daño a los mini-jefes.",
  },
  {
    icono: "⤴",
    titulo: "Salto y Especial",
    texto: "Desde el día 4 puedes saltar con ↑ para esquivar. Desde el día 5, la tecla C lanza el Rayo del Recuerdo cuando la barra de Recuerdos está llena.",
  },
  {
    icono: "😈",
    titulo: "Los 7 pecados",
    texto: "Cada día (1 a 6) enfrentas un mini-jefe inspirado en un pecado capital: Gula, Lujuria, Pereza, Envidia, Codicia e Ira. Cada uno se comporta distinto — algunos muerden tus flores, otros se dividen o te hechizan.",
  },
  {
    icono: "💫",
    titulo: "Cuidado con el hechizo",
    texto: "Si la Lujuria te toca con su hechizo, tus controles se invertirán unos segundos. Respira y espera a que pase antes de moverte de más.",
  },
  {
    icono: "🐉",
    titulo: "El dragón final",
    texto: "El día 7 no es una sombra cualquiera: bajo el jardín duerme un dragón marino gigante, con 4 fases y ataques de agua. Cuídate de sus mareas y sumersiones.",
  },
  {
    icono: "🛡️",
    titulo: "Las flores te protegen",
    texto: "En la pelea final, si mantienes el jardín sano (la mayoría de las flores con buena vida), Mouri gana un escudo que absorbe un golpe del dragón. Si las flores mueren todas, el dragón se regenera. ¡Cuídalas hasta el final!",
  },
];

/* -------------------------------------------------------- 10. NÚMEROS BASE */
const T = {
  CW: 1200,            // ancho lógico del escenario (se estira a la pantalla)
  base: 100,            // altura del suelo
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
  bossMaxHP: 620,           // CAMBIO: dragón final con 4 fases, pelea más larga
  escudoUmbral: 0.75,       // CAMBIO: % de jardín sano para ganar el escudo de flores
  escudoCooldown: 10,       // CAMBIO: segundos de espera entre escudo y escudo
  reviveHealth: 40,
  regenRosaGarden: 2.5,
  regenGirasol: 5,
  tickMs: 33,
};

/* ---------------------------------------------------------- 8. MINI-JEFES
 * hp        -> cuánta vida tiene
 * vel       -> qué tan rápido se mueve
 * ataque    -> cada cuántos segundos ataca
 * comportamiento define su "personalidad" (ver runMiniBoss).
 * CAMBIO: todos un poco más difíciles (más vida, más rápidos, atacan
 * más seguido). El Eco (el que persigue/"imita" tus movimientos) es
 * el que más subió en dificultad.                                          */
const MINI_JEFES = {
  // CAMBIO: Gula y Lujuria son nuevos, para que los días 1 y 2 también
  // tengan su propio mini-jefe (antes no tenían ninguno).
  gula: {
    id: "gula", nombre: "El Glotón", pecado: "Gula", sprite: "🐷",
    hp: 50, vel: 90, ataque: 1.6, color: "#C17817",
    desc: "Va directo a la flor más sana y la muerde para drenarla y curarse",
  },
  lujuria: {
    id: "lujuria", nombre: "La Seducción", pecado: "Lujuria", sprite: "💋",
    hp: 38, vel: 140, ataque: 2.2, color: "#D6567B",
    desc: "Se teletransporta y lanza un hechizo que invierte tus controles unos segundos",
  },
  bruma: {
    id: "bruma", nombre: "La Bruma", pecado: "Pereza", sprite: "🌫️",
    hp: 36, vel: 190, ataque: 1.2, color: "#9fb3c8",
    desc: "Oscurece el jardín y se desliza de lado a lado",
  },
  susurro: {
    id: "susurro", nombre: "El Susurro", pecado: "Envidia", sprite: "🗣️",
    hp: 40, vel: 0, ataque: 0.95, color: "#c8a2e0",
    desc: "Se teletransporta y dispara ondas en abanico",
  },
  grieta: {
    id: "grieta", nombre: "La Grieta", pecado: "Codicia", sprite: "🕳️",
    hp: 58, vel: 0, ataque: 1.5, color: "#6b5f8a",
    desc: "No se mueve, pero invoca sombras sin parar",
  },
  eco: {
    id: "eco", nombre: "El Eco", pecado: "Ira", sprite: "🌀",
    hp: 34, vel: 250, ataque: 1.15, color: "#7fc4c8",
    desc: "Persigue e imita tus movimientos. Al ser golpeado se divide en copias más pequeñas",
  },
};

/* -------------------------------------------------------------- 9. LOS DÍAS
 * dur         -> duración en segundos (¡súbela si lo quieres más largo!)
 * miniJefeEn  -> segundo en que aparece el mini-jefe (null = ninguno)
 * miniJefe    -> id del mini-jefe de ese día
 * CAMBIO: shadowHP subido en cada día para que las sombras (enemigos
 * pequeños) aguanten más disparos.                                         */
const DAYS = [
  {
    n: 1, name: "El jardín despierta", dur: 45,
    shadowRate: 0, shadowSpeed: 0, shadowHP: 1, needRate: 4.2, needDecay: 5,
    // CAMBIO: ahora el día 1 también tiene mini-jefe (Gula)
    miniJefeEn: 24, miniJefe: "gula"
  },

  {
    n: 2, name: "Primeras sombras", dur: 60,
    shadowRate: 4.6, shadowSpeed: 24, shadowHP: 2, needRate: 3.8, needDecay: 6,
    unlock: "Nuevo poder: DISPARO DE LUZ (ESPACIO)",
    // CAMBIO: ahora el día 2 también tiene mini-jefe (Lujuria)
    miniJefeEn: 34, miniJefe: "lujuria"
  },

  {
    n: 3, name: "La niebla del olvido", dur: 75,
    shadowRate: 3.8, shadowSpeed: 28, shadowHP: 2, needRate: 3.4, needDecay: 7,
    miniJefeEn: 32, miniJefe: "bruma"
  },

  {
    n: 4, name: "Saltos de esperanza", dur: 85,
    shadowRate: 3.3, shadowSpeed: 30, shadowHP: 3, needRate: 3.1, needDecay: 7,
    unlock: "Nuevo poder: SALTO (↑)",
    miniJefeEn: 40, miniJefe: "susurro"
  },

  {
    n: 5, name: "La memoria brilla", dur: 95,
    shadowRate: 2.9, shadowSpeed: 33, shadowHP: 3, needRate: 2.9, needDecay: 8,
    unlock: "Nuevo poder: ESPECIAL — Rayo del Recuerdo (C)",
    miniJefeEn: 45, miniJefe: "eco"
  },

  {
    n: 6, name: "Víspera del Olvido", dur: 110, night: true,
    shadowRate: 2.4, shadowSpeed: 37, shadowHP: 4, needRate: 2.6, needDecay: 9,
    miniJefeEn: 50, miniJefe: "grieta"
  },

  { n: 7, name: "El Olvido", boss: true },
];

/* ====================================================================== */
/*  Utilidades                                                            */
/* ====================================================================== */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const dayCfg = (n) => DAYS.find((d) => d.n === n);

const NEEDS = {
  agua: { icon: "💧", label: "Necesita agua" },
  luz: { icon: "☀️", label: "Necesita luz" },
  carino: { icon: "💗", label: "Necesita cariño" },
  proteccion: { icon: "🛡️", label: "Necesita protección" },
};
const NEED_KEYS = Object.keys(NEEDS);

const FLOWER_DEFS = [
  {
    id: "girasol", type: "girasol", xr: 0.12, name: "Girasol",
    pasivo: "Cura a las flores vecinas", combate: "Tus disparos hacen más daño"
  },
  {
    id: "rosa", type: "rosa", xr: 0.37, name: "Rosa",
    pasivo: "Regenera todo el jardín", combate: "Mouri recupera corazones"
  },
  {
    id: "lavanda", type: "lavanda", xr: 0.62, name: "Lavanda",
    pasivo: "Ralentiza a las sombras", combate: "Ralentiza los ataques del Olvido"
  },
  {
    id: "margarita", type: "margarita", xr: 0.87, name: "Margarita",
    pasivo: "Las necesidades tardan más", combate: "Disparas y cargas el Especial más rápido"
  },
];

const healthy = (w) => w.flowers.filter((f) => f.health > 50).length;
const alive = (w) => w.flowers.filter((f) => f.health > 0);
const has = (w, type) => w.flowers.some((f) => f.type === type && f.health > 0);
const gardenLight = (w) =>
  w.flowers.reduce((s, f) => s + Math.max(0, f.health), 0) / (T.flowerMax * w.flowers.length);

// CAMBIO: el día 1 ahora tiene mini-jefe (Gula) antes de que el disparo se
// desbloquee oficialmente el día 2, así que se permite disparar mientras
// ese mini-jefe esté activo (si no, sería imposible vencerlo ese día).
const canShoot = (w) => w.day >= 2 || w.scene === "boss" || !!w.mini;
const canJump = (w) => w.day >= 4 || w.scene === "boss";
const canSpecial = (w) => w.day >= 5 || w.scene === "boss";

function makeWorld() {
  return {
    scene: "title",              // title|dialog|dayIntro|playing|dayClear|boss|victory|gameover|creditos
    prevScene: null,
    dialog: null,                // { lines, i, then }
    day: 1,
    // CAMBIO: mouri.hechizado -> segundos restantes con los controles
    // invertidos (lo aplica la Lujuria)
    mouri: { x: T.CW / 2, y: 0, vy: 0, onGround: true, facing: "right", moving: false, hp: T.mouriMaxHP, invuln: 0, hechizado: 0 },
    bullets: [], shadows: [], orbs: [], beams: [],
    flowers: FLOWER_DEFS.map((f) => ({ ...f, x: f.xr * T.CW, health: T.flowerMax, need: null })),
    score: 0, special: 0, fireCd: 0,
    dayTimer: 0, needTimer: 3, shadowTimer: 3, nextId: 1,
    mini: null,                  // mini-jefe activo
    miniDone: false,
    bossHP: T.bossMaxHP, bossPhase: 1, bossX: T.CW / 2, bossY: 210,
    bossDir: 1, bossAtk: 2.2, bossInvuln: 0, bossState: "idle", bossStateT: 0,
    // CAMBIO: escudo de flores para la pelea final — se arma solo si el
    // jardín está sano, y absorbe un golpe del dragón.
    escudoActivo: false, escudoCd: 0,
    message: "", msgTimer: 0, flash: 0, darkness: 0, shake: 0, badge: false,
    creditoIdx: 0,
    _rosaCd: 6, _sumCd: 3,
  };
}

const say = (w, text, secs = 3.5) => { w.message = text; w.msgTimer = secs; };

/* ====================================================================== */
/*  AUDIO — sistema seguro: si la ruta es null, no hace nada               */
/* ====================================================================== */
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
      a.play().catch(() => { }); // el navegador puede bloquear hasta el 1er clic
      musica.actual = a;
    } catch (e) { /* sin audio, seguimos */ }
  };

  const playSfx = (key) => {
    const src = SONIDOS[key];
    if (!src || mute) return;
    try { const a = new Audio(src); a.volume = VOLUMEN_SONIDOS; a.play().catch(() => { }); } catch (e) { }
  };

  const setMute = (v) => {
    mute = v;
    if (musica.actual) musica.actual.volume = v ? 0 : VOLUMEN_MUSICA;
  };
  const stop = () => { if (musica.actual) { musica.actual.pause(); musica.actual = null; } musica.key = null; };

  return { playMusica, playSfx, setMute, stop };
}

/* ====================================================================== */
/*  COMPONENTE                                                            */
/* ====================================================================== */
export default function MiniJuegoMouri({ onGameComplete }) {
  const world = useRef(makeWorld());
  const keys = useRef({ left: false, right: false, shoot: false });
  const audio = useRef(null);
  if (!audio.current) audio.current = crearAudio();
  const [, setFrame] = useState(0);
  const [mute, setMute] = useState(false);
  // CAMBIO: el tutorial vive en su propio estado de React (no en `world`)
  // porque es solo una capa de ayuda por encima del juego; así no hay que
  // tocar nada de la máquina de escenas (title/dialog/playing/boss...).
  const [tutorialAbierto, setTutorialAbierto] = useState(false);
  const [tutPaso, setTutPaso] = useState(0);
  const completed = useRef(false);
  const rerender = useCallback(() => setFrame((f) => (f + 1) % 1e6), []);

  const A = audio.current;

  // CAMBIO: al desmontar el minijuego (salir de la página), aseguramos que
  // el sidebar quede abierto otra vez, por si se cerró al jugar.
  useEffect(() => {
    return () => window.dispatchEvent(new CustomEvent('sidebar:abrir'));
  }, []);

  /* ---------- diálogos ---------- */
  const startDialog = useCallback((lines, then) => {
    const w = world.current;
    if (!lines || !lines.length) { then && then(); return; }
    w.prevScene = w.scene;
    w.scene = "dialog";
    w.dialog = { lines, i: 0, then };
  }, []);

  const advanceDialog = useCallback(() => {
    const w = world.current;
    if (w.scene !== "dialog" || !w.dialog) return;
    w.dialog.i += 1;
    if (w.dialog.i >= w.dialog.lines.length) {
      const then = w.dialog.then;
      w.dialog = null;
      w.scene = w.prevScene || "playing";
      then && then();
    }
    rerender();
  }, [rerender]);

  /* ---------- créditos finales ---------- */
  const advanceCreditos = useCallback(() => {
    const w = world.current;
    w.creditoIdx += 1;
    if (w.creditoIdx >= CREDITOS_IMAGENES.length) {
      world_setScene(w, "victory");
    }
    rerender();
  }, [rerender]);

  /* ---------- acciones ---------- */
  const doJump = useCallback(() => {
    const w = world.current;
    if ((w.scene !== "playing" && w.scene !== "boss") || !canJump(w)) return;
    if (w.mouri.onGround) { w.mouri.vy = T.jumpV; w.mouri.onGround = false; }
  }, []);

  const doCare = useCallback(() => {
    const w = world.current;
    if (w.scene !== "playing" && w.scene !== "boss") return;
    let best = null, bd = Infinity;
    for (const f of w.flowers) { const d = Math.abs(f.x - w.mouri.x); if (d < T.reach && d < bd) { bd = d; best = f; } }
    if (!best) return;
    if (best.health <= 0) { best.health = T.reviveHealth; best.need = null; w.score += 25; A.playSfx("curar"); }
    else if (best.need) { best.need = null; best.health = clamp(best.health + 28, 0, T.flowerMax); w.score += 30; A.playSfx("curar"); }
    else if (best.health < T.flowerMax) { best.health = clamp(best.health + 18, 0, T.flowerMax); w.score += 5; A.playSfx("curar"); }
  }, [A]);

  const doSpecial = useCallback(() => {
    const w = world.current;
    if ((w.scene !== "playing" && w.scene !== "boss") || !canSpecial(w)) return;
    if (w.special < 100) return;
    const h = healthy(w);
    w.special = 0; w.flash = 0.5; w.shadows = []; w.orbs = []; w.beams = [];
    A.playSfx("especial");
    if (w.scene === "boss") {
      const dmg = 28 + h * 9;
      if (w.bossInvuln <= 0) w.bossHP = Math.max(0, w.bossHP - dmg);
      say(w, `¡Rayo del Recuerdo! -${dmg}`, 2);
    } else if (w.mini) {
      w.mini.hp -= 10 + h * 2;
      say(w, "¡Rayo del Recuerdo!", 2);
    } else {
      for (const f of w.flowers) if (f.health > 0) f.health = clamp(f.health + 25, 0, T.flowerMax);
      say(w, "¡Rayo del Recuerdo! El jardín brilla.", 2);
    }
  }, [A]);

  /* ---------- avanzar de pantalla ---------- */
  const beginDayFlow = useCallback((n) => {
    const w = world.current;
    if (n > 7) { toVictory(w, A, startDialog, rerender); return; }
    beginDay(w, n);
    rerender();
  }, [A, rerender, startDialog]);

  // CAMBIO: función centralizada para arrancar el juego, que además
  // cierra el sidebar para dejar toda la pantalla libre.
  const iniciarJuego = useCallback(() => {
    window.dispatchEvent(new CustomEvent('sidebar:cerrar'));
    A.playMusica("menu");
    startDialog(DIALOGOS.intro, () => beginDayFlow(1));
    rerender();
  }, [A, startDialog, beginDayFlow, rerender]);

  const enterDay = useCallback(() => {
    const w = world.current;
    const cfg = dayCfg(w.day);
    const lines = DIALOGOS.dia[w.day] || [];
    w.scene = w.day === 7 ? "boss" : "playing";
    A.playMusica(cfg.boss ? "jefe" : cfg.night ? "noche" : "dia");
    startDialog(lines, () => { });
    rerender();
  }, [A, rerender, startDialog]);

  /* ---------- teclado ---------- */
  useEffect(() => {
    const down = (e) => {
      const w = world.current, k = e.key;
      if (w.scene === "dialog") {
        if (k === "Enter" || k === " " || e.code === "Space") { e.preventDefault(); advanceDialog(); }
        return;
      }
      if (w.scene === "creditos") {
        if (k === "Enter" || k === " " || e.code === "Space") { e.preventDefault(); advanceCreditos(); }
        return;
      }
      if (k === "ArrowLeft") { keys.current.left = true; e.preventDefault(); }
      else if (k === "ArrowRight") { keys.current.right = true; e.preventDefault(); }
      else if (k === "ArrowUp" || k === "w" || k === "W") { if (!e.repeat) doJump(); e.preventDefault(); }
      else if (k === " " || e.code === "Space") { keys.current.shoot = true; e.preventDefault(); }
      else if (k === "x" || k === "X") { if (!e.repeat) doCare(); }
      else if (k === "c" || k === "C") { if (!e.repeat) doSpecial(); }
      else if (k === "Enter") {
        e.preventDefault();
        if (w.scene === "title") { A.playSfx("aparicion"); iniciarJuego(); }
        else if (w.scene === "dayIntro") enterDay();
        else if (w.scene === "dayClear") beginDayFlow(w.day + 1);
        else if (w.scene === "victory" || w.scene === "gameover") {
          world.current = makeWorld(); A.stop();
          window.dispatchEvent(new CustomEvent('sidebar:abrir')); // CAMBIO
          rerender();
        }
      }
    };
    const up = (e) => {
      if (e.key === "ArrowLeft") keys.current.left = false;
      if (e.key === "ArrowRight") keys.current.right = false;
      if (e.key === " " || e.code === "Space") keys.current.shoot = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [advanceDialog, advanceCreditos, doJump, doCare, doSpecial, enterDay, beginDayFlow, startDialog, rerender, A, iniciarJuego]);

  /* ---------- bucle ---------- */
  useEffect(() => {
    const dt = T.tickMs / 1000;
    const id = setInterval(() => {
      const w = world.current;
      if (w.msgTimer > 0) w.msgTimer -= dt;
      if (w.flash > 0) w.flash -= dt;
      if (w.shake > 0) w.shake -= dt;
      if (w.scene === "playing") runGarden(w, dt, keys.current, A, startDialog, rerender);
      else if (w.scene === "boss") runBoss(w, dt, keys.current, A, startDialog, rerender);
      rerender();
    }, T.tickMs);
    return () => clearInterval(id);
  }, [A, startDialog, rerender]);

  /* ---------- insignia ---------- */
  useEffect(() => {
    const w = world.current;
    if (w.scene === "victory" && !completed.current) {
      completed.current = true; w.badge = true;
      if (typeof onGameComplete === "function") onGameComplete();
    }
    if (w.scene === "title") completed.current = false;
  });

  useEffect(() => { A.setMute(mute); }, [mute, A]);
  useEffect(() => () => A.stop(), [A]);

  /* ====================== RENDER ====================== */
  const w = world.current;
  const cfg = dayCfg(w.day);
  const isBoss = w.scene === "boss";
  const isNight = (cfg && cfg.night) || isBoss;
  const pct = (x) => `${(x / T.CW) * 100}%`;
  const brown = "#786F49";
  const bgImg = DAY_BG[w.day];

  const skyStyle = bgImg
    ? { background: "#000" }
    : isBoss
      ? { background: "linear-gradient(180deg,#171326 0%,#241d3a 55%,#332a4d 100%)" }
      : isNight
        ? { background: "linear-gradient(180deg,#2a3358 0%,#4a5a7a 60%,#6a7a5a 100%)" }
        : { background: "linear-gradient(180deg,#bfe6ff 0%,#dff3d6 60%,#cfe9b8 100%)" };

  let carePrompt = null;
  if (w.scene === "playing" || isBoss) {
    const nf = w.flowers.filter((f) => Math.abs(f.x - w.mouri.x) < T.reach)
      .sort((a, b) => Math.abs(a.x - w.mouri.x) - Math.abs(b.x - w.mouri.x))[0];
    if (nf && nf.health <= 0) carePrompt = "X: revivir esta flor";
    else if (nf && nf.need) carePrompt = `${NEEDS[nf.need].label} — X`;
    else if (nf && nf.health < T.flowerMax) carePrompt = "X: cuidar";
  }

  const topBarPct = isBoss ? (w.bossHP / T.bossMaxHP) * 100 : cfg && cfg.dur ? (w.dayTimer / cfg.dur) * 100 : 0;
  const shakeX = w.shake > 0 ? (Math.random() - 0.5) * 8 : 0;
  const shakeY = w.shake > 0 ? (Math.random() - 0.5) * 8 : 0;
  // CAMBIO: anillo rojo justo después de recibir un golpe, para que se
  // note claramente cuándo y por qué Mouri perdió una vida.
  const recienGolpeado = w.mouri.invuln > (T.invulnTime - 0.3);

  return (
    // CAMBIO: antes este div usaba width:"100vw" + marginLeft:"calc(50% - 50vw)"
    // para "romper" el contenedor y ocupar toda la pantalla. Eso ignoraba el
    // espacio que ocupa el sidebar y provocaba que el juego se cortara /
    // generara scroll horizontal. Ahora simplemente ocupa el 100% del
    // contenedor que le da la página (que ya respeta el sidebar).
    <div style={{ width: "100%", fontFamily: "system-ui, sans-serif" }}>
      <style>{`
        @keyframes m-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
        @keyframes m-shake{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
        @keyframes m-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes m-pulse{0%,100%{opacity:.55}50%{opacity:1}}
        @keyframes m-hitring{0%{transform:scale(.6);opacity:.9}100%{transform:scale(1.3);opacity:0}}
      `}</style>

      {/* barra superior */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 18px", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontWeight: 700, color: "#4E3A25" }}>
          <span>🌱 El Jardín de los Recuerdos</span>
          <span>⭐ {w.score}</span>
          <span>{Array.from({ length: T.mouriMaxHP }).map((_, i) => (
            <span key={i} style={{ opacity: i < w.mouri.hp ? 1 : 0.2 }}>❤️</span>))}</span>
          {/* CAMBIO: indicador del escudo de flores durante la pelea final */}
          {isBoss && w.escudoActivo && (
            <span title="Escudo de flores activo" style={{ fontSize: 14 }}>
              <Sprite asset={ASSETS.escudo} size={16} />
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontWeight: 700, color: "#4E3A25" }}>
          <span>{isBoss ? `🐉 El Dragón del Olvido — Fase ${w.bossPhase}/4` : `📅 Día ${w.day}/7`}</span>
          <button onClick={() => setMute((m) => !m)}
            style={{ background: "#FFF8E8", border: `2px solid ${brown}`, borderRadius: 10, padding: "2px 10px", cursor: "pointer" }}>
            {mute ? "🔇" : "🔊"}
          </button>
        </div>
      </div>

      {/* barras */}
      <div style={{ padding: "0 18px 6px", display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ height: 12, background: "#0000002a", border: `2px solid ${brown}`, borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: `${topBarPct}%`, height: "100%", background: isBoss ? "#8a6cff" : "#7CB342", transition: "width .15s" }} />
        </div>
        {(canSpecial(w) || isBoss) && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#4E3A25" }}>Recuerdos</span>
            <div style={{ flex: 1, height: 9, background: "#0000002a", border: `2px solid ${brown}`, borderRadius: 999, overflow: "hidden" }}>
              <div style={{ width: `${w.special}%`, height: "100%", background: w.special >= 100 ? "#ffd24a" : "#c9a24a" }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: w.special >= 100 ? "#e0a500" : "#4E3A25" }}>
              {w.special >= 100 ? "¡C = LISTO!" : `${Math.floor(w.special)}%`}
            </span>
          </div>
        )}
        {/* vida del mini-jefe */}
        {w.mini && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: w.mini.color }}>
              {w.mini.sprite} {w.mini.pecado ? `${w.mini.pecado} — ` : ""}{w.mini.nombre}
            </span>
            <div style={{ flex: 1, height: 9, background: "#0000002a", border: `2px solid ${brown}`, borderRadius: 999, overflow: "hidden" }}>
              <div style={{ width: `${(w.mini.hp / w.mini.hpMax) * 100}%`, height: "100%", background: w.mini.color }} />
            </div>
          </div>
        )}
      </div>

      {/* ESCENARIO a lo ancho */}
      <div style={{
        position: "relative", width: "100%", height: "min(62vh, 520px)", overflow: "hidden",
        borderTop: `4px solid ${brown}`, borderBottom: `4px solid ${brown}`,
        transform: `translate(${shakeX}px,${shakeY}px)`, ...skyStyle, transition: "background .8s",
      }}>
        {bgImg && <img src={bgImg} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}

        {/* oscuridad de La Bruma */}
        {w.darkness > 0 && <div style={{ position: "absolute", inset: 0, background: "#0a0a14", opacity: clamp(w.darkness, 0, 0.72), pointerEvents: "none" }} />}
        {w.flash > 0 && <div style={{ position: "absolute", inset: 0, background: "#fff6cc", opacity: clamp(w.flash, 0, 0.6), pointerEvents: "none" }} />}

        {isBoss && (
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: `radial-gradient(circle at 50% 85%, rgba(255,227,154,${gardenLight(w) * 0.5}) 0%, rgba(255,227,154,0) 60%)`
          }} />
        )}

        <div style={{
          position: "absolute", bottom: 0, left: 0, width: "100%", height: T.base,
          background: FLOOR_IMG ? `url(${FLOOR_IMG})` : (isNight ? "#2d2740" : "#8bbf5a"),
          backgroundSize: "cover", backgroundRepeat: "repeat-x",
          transition: "background .8s",
        }} />
        {!bgImg && (
          <div style={{ position: "absolute", bottom: T.base, left: 0, width: "100%", height: 5, background: isNight ? "#3a3352" : "#79ab4b", transition: "background .8s" }} />
        )}

        {/* JEFE */}
        {isBoss && (
          <div style={{ position: "absolute", left: pct(w.bossX), bottom: T.base + w.bossY, transform: "translateX(-50%)" }}>
            <div style={{
              fontSize: 100, filter: "grayscale(1) drop-shadow(0 0 18px #000)", animation: "m-float 3s infinite",
              opacity: w.bossInvuln > 0 && Math.floor(w.bossInvuln * 12) % 2 ? 0.3 : 1
            }}>
              <Sprite asset={BOSS_SPRITE[w.bossPhase]} size={100} />
            </div>
            {w.bossPhase >= 3 && (
              <div style={{
                position: "absolute", inset: -14, borderRadius: "50%",
                border: `3px dashed ${w.bossPhase === 4 ? "#7fd6ff" : "#c9a6ff"}`, opacity: .55,
                animation: "m-pulse 1.2s infinite", pointerEvents: "none"
              }} />
            )}
          </div>
        )}

        {/* MINI-JEFE */}
        {w.mini && (
          <div style={{ position: "absolute", left: pct(w.mini.x), bottom: T.base + w.mini.y, transform: `translateX(-50%) scale(${w.mini.scale || 1})` }}>
            <div style={{
              fontSize: 62, animation: "m-float 2s infinite",
              opacity: w.mini.hitT > 0 && Math.floor(w.mini.hitT * 20) % 2 ? 0.35 : 1,
              filter: `drop-shadow(0 0 12px ${w.mini.color})`
            }}>
              <Sprite asset={w.mini.sprite} size={62} />
            </div>
          </div>
        )}
        {/* copias de El Eco */}
        {(w.mini?.copias || []).map((c) => (
          <div key={c.id} style={{ position: "absolute", left: pct(c.x), bottom: T.base + c.y, transform: `translateX(-50%) scale(${c.scale})` }}>
            <div style={{ fontSize: 62, opacity: 0.85, filter: `drop-shadow(0 0 8px ${w.mini.color})` }}>
              <Sprite asset={w.mini.sprite} size={62} />
            </div>
          </div>
        ))}

        {/* FLORES */}
        {w.flowers.map((f) => <Flower key={f.id} f={f} left={pct(f.x)} isNight={isNight} />)}

        {/* SOMBRAS */}
        {w.shadows.map((s) => (
          <div key={s.id} style={{
            position: "absolute", left: pct(s.x), bottom: T.base, transform: "translateX(-50%)",
            fontSize: s.big ? 42 : 32, filter: "grayscale(1) brightness(.4)", opacity: .9
          }}>
            <Sprite asset={s.big ? ASSETS.sombraGrande : ASSETS.sombra} size={s.big ? 42 : 32} />
          </div>
        ))}

        {/* BALAS */}
        {w.bullets.map((b) => (
          <div key={b.id} style={{ position: "absolute", left: pct(b.x), bottom: T.base + b.y, transform: "translate(-50%,50%)", fontSize: 18 }}>
            <Sprite asset={ASSETS.bala} size={26} />
          </div>
        ))}

        {/* ORBES enemigos — CAMBIO: más grandes, hitbox ajustada abajo en tickOrbs */}
        {w.orbs.map((o) => (
          <div key={o.id} style={{
            position: "absolute", left: pct(o.x), bottom: T.base + o.y, transform: "translate(-50%,50%)",
            fontSize: o.big ? 74 : 40, filter: "hue-rotate(250deg) saturate(1.5)"
          }}>
            <Sprite asset={ASSETS.orbe} size={o.big ? 74 : 40} />
          </div>
        ))}

        {/* RAYOS del jefe (columnas) */}
        {w.beams.map((b) => (
          <div key={b.id} style={{
            position: "absolute", left: pct(b.x), bottom: 0, transform: "translateX(-50%)",
            width: 46, height: "100%",
            background: b.active ? "linear-gradient(180deg,#c9a6ff,#6b3fd4)" : "transparent",
            opacity: b.active ? .85 : 1, borderRadius: 8, pointerEvents: "none"
          }}>
            {!b.active && (
              <div style={{
                position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 6, height: "100%",
                background: "#ffe08a", opacity: .7, animation: "m-pulse .25s infinite"
              }} />
            )}
          </div>
        ))}

        {/* MOURI — CAMBIO: el volteo (scaleX) ahora va en un div interno,
            separado del div que hace translateX(-50%). Antes ambos
            transforms iban juntos y, al voltear cerca del borde derecho,
            el volteo desplazaba mal el centrado y el sprite se veía
            "encogido"/cortado por el overflow:hidden del escenario. */}
        <div style={{
          position: "absolute", left: pct(w.mouri.x), bottom: T.base + w.mouri.y,
          transform: "translateX(-50%)",
          opacity: w.mouri.invuln > 0 && Math.floor(w.mouri.invuln * 12) % 2 ? 0.35 : 1
        }}>
          <div style={{
            fontSize: 70, animation: w.mouri.moving && w.mouri.onGround ? "m-bob .3s infinite" : "none",
            // CAMBIO: si hay un gif dedicado para la izquierda, no se voltea
            // nada (se usa tal cual). Solo se voltea el de la derecha cuando
            // NO tienes un gif propio para la izquierda.
            transform: (w.mouri.facing === "left" && !ASSETS.mouriIzquierda)
              ? "scaleX(-1)" : "scaleX(1)",
            transformOrigin: "center"
          }}>
            <Sprite asset={(w.mouri.facing === "left" && ASSETS.mouriIzquierda) ? ASSETS.mouriIzquierda : ASSETS.mouri} size={70} />
          </div>

          {/* CAMBIO: anillo rojo que se dispara justo al recibir un golpe,
              para que quede clarísimo cuándo y por qué se perdió vida. */}
          {recienGolpeado && (
            <div style={{
              position: "absolute", left: "50%", top: "50%", width: 90, height: 90,
              marginLeft: -45, marginTop: -45, borderRadius: "50%",
              border: "4px solid #ff4d4d", pointerEvents: "none",
              animation: "m-hitring .3s ease-out"
            }} />
          )}

          {/* CAMBIO: escudo de flores activo en la pelea final */}
          {isBoss && w.escudoActivo && (
            <div style={{
              position: "absolute", left: "50%", top: "50%", width: 96, height: 96,
              marginLeft: -48, marginTop: -48, borderRadius: "50%",
              border: "3px solid #57b846", boxShadow: "0 0 14px #57b84699",
              pointerEvents: "none", animation: "m-pulse 1s infinite"
            }} />
          )}

          {/* CAMBIO: ícono sobre Mouri mientras está hechizado (controles invertidos) */}
          {w.mouri.hechizado > 0 && (
            <div style={{ position: "absolute", left: "50%", top: -26, transform: "translateX(-50%)", fontSize: 20 }}>
              <Sprite asset={ASSETS.hechizo} size={20} />
            </div>
          )}
        </div>

        {carePrompt && (
          <div style={{
            position: "absolute", left: pct(w.mouri.x), bottom: T.base + w.mouri.y + 56, transform: "translateX(-50%)",
            whiteSpace: "nowrap", background: "rgba(255,255,255,.92)", border: `2px solid ${brown}`, color: "#5C4A2C",
            fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: 8
          }}>
            {carePrompt}
          </div>
        )}

        {/* globo corto de Mouri */}
        {w.msgTimer > 0 && (w.scene === "playing" || isBoss) && (
          <div style={{ position: "absolute", bottom: 14, right: 16, maxWidth: 280, zIndex: 20 }}>
            <div style={{ background: "#FFF8E8", border: `2px solid ${brown}`, borderRadius: 16, padding: "8px 12px" }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#4E3A25" }}>{w.message}</p>
            </div>
            <div style={{ textAlign: "right", fontSize: 30 }}><Sprite asset={ASSETS.mouriVolador} size={30} /></div>
          </div>
        )}

        {/* ---------- PANTALLAS ---------- */}
        {w.scene === "title" && (
          <Overlay bg="rgba(20,30,20,.62)">
            <div style={{ fontSize: 90 }}><Sprite asset={ASSETS.mouriVolador} size={90} /></div>
            <h2 style={{ margin: "6px 0", color: "#FFF8E8", fontSize: 26 }}>El Jardín de los Recuerdos</h2>
            <p style={{ color: "#e8e0cc", fontSize: 14, maxWidth: 560, margin: "4px auto" }}>
              Siete días cuidando flores que son recuerdos. Sombras, mini-jefes, y al final: El Olvido.
            </p>
            <Controls />
            {/* CAMBIO: ahora usa iniciarJuego(), que también cierra el sidebar */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              <PixelBtn onClick={iniciarJuego}>
                ▶ Comenzar
              </PixelBtn>
              {/* CAMBIO: botón nuevo que abre el tutorial jugable */}
              <PixelBtn onClick={() => { setTutPaso(0); setTutorialAbierto(true); }}>
                ❔ Cómo jugar
              </PixelBtn>
            </div>
          </Overlay>
        )}

        {w.scene === "dayIntro" && cfg && (
          <Overlay bg={cfg.boss ? "rgba(15,12,25,.85)" : "rgba(20,30,20,.65)"}>
            <p style={{ color: "#ffd88a", fontSize: 13, letterSpacing: 3, margin: 0 }}>DÍA {cfg.n} DE 7</p>
            <h2 style={{ margin: "4px 0", color: "#FFF8E8", fontSize: 24 }}>{cfg.name}</h2>
            {cfg.unlock && <div style={{ display: "inline-block", background: "#FFE39A", color: "#5C4A2C", fontWeight: 700, fontSize: 13, borderRadius: 999, padding: "4px 12px", margin: "6px 0" }}>⭐ {cfg.unlock}</div>}
            {cfg.miniJefe && (
              <p style={{ color: "#e6b8b8", fontSize: 13 }}>
                ⚠ Hoy aparecerá: {MINI_JEFES[cfg.miniJefe].nombre}
                {MINI_JEFES[cfg.miniJefe].pecado && ` (${MINI_JEFES[cfg.miniJefe].pecado})`}
              </p>
            )}
            <PixelBtn onClick={enterDay}>{cfg.boss ? "🐉 ¡Enfrentar al Dragón del Olvido!" : "▶ Empezar el día"}</PixelBtn>
          </Overlay>
        )}

        {w.scene === "dayClear" && (
          <Overlay bg="rgba(255,240,200,.86)">
            <div style={{ fontSize: 46 }}>🌷✨</div>
            <h2 style={{ margin: "4px 0", color: "#4E3A25" }}>¡Día {w.day} completado!</h2>
            <p style={{ color: "#5C4A2C", fontSize: 14 }}>Flores vivas: {alive(w).length}/4 · Puntos: {w.score}</p>
            <PixelBtn onClick={() => beginDayFlow(w.day + 1)}>▶ Continuar al Día {w.day + 1}</PixelBtn>
          </Overlay>
        )}

        {/* CAMBIO: pantalla de créditos con tus imágenes, antes de la victoria */}
        {w.scene === "creditos" && (
          <CreditsOverlay
            img={CREDITOS_IMAGENES[w.creditoIdx]}
            onNext={advanceCreditos}
            step={w.creditoIdx + 1}
            total={CREDITOS_IMAGENES.length}
          />
        )}

        {w.scene === "victory" && (
          <Overlay bg="rgba(255,242,205,.92)">
            <div style={{ fontSize: 52 }}>🌸✨🌼</div>
            <h2 style={{ margin: "6px 0", color: "#4E3A25" }}>¡Salvaste el Jardín de los Recuerdos!</h2>
            <div style={{
              display: "inline-flex", gap: 8, background: "#FFF8E8", border: `2px solid ${brown}`,
              color: "#5C4A2C", fontWeight: 700, borderRadius: 999, padding: "8px 16px", margin: "8px 0"
            }}>
              🏅 Insignia obtenida: Guardián del Jardín
            </div>
            <div><PixelBtn onClick={() => {
              world.current = makeWorld(); A.stop();
              window.dispatchEvent(new CustomEvent('sidebar:abrir')); // CAMBIO
              rerender();
            }}>↺ Jugar de nuevo</PixelBtn></div>
          </Overlay>
        )}

        {w.scene === "gameover" && (
          <Overlay bg="rgba(18,15,28,.88)">
            <div style={{ fontSize: 48 }}><Sprite asset={ASSETS.marchita} size={48} /></div>
            <h2 style={{ margin: "6px 0", color: "#FFF8E8" }}>El jardín se apagó...</h2>
            <p style={{ color: "#bcae9a", fontSize: 13 }}>Llegaste al Día {w.day}. Puntos: {w.score}</p>
            <PixelBtn onClick={() => {
              world.current = makeWorld(); A.stop();
              window.dispatchEvent(new CustomEvent('sidebar:abrir')); // CAMBIO
              rerender();
            }}>↺ Volver a intentarlo</PixelBtn>
          </Overlay>
        )}

        {/* ---------- CAJA DE DIÁLOGO ---------- */}
        {w.scene === "dialog" && w.dialog && (
          <DialogBox line={w.dialog.lines[w.dialog.i]} onNext={advanceDialog}
            step={w.dialog.i + 1} total={w.dialog.lines.length} />
        )}
      </div>

      {/* CONTROLES TÁCTILES */}
      {(w.scene === "playing" || isBoss) && (
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 18px", gap: 8 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <Hold onDown={() => (keys.current.left = true)} onUp={() => (keys.current.left = false)}>←</Hold>
            <Hold onDown={() => (keys.current.right = true)} onUp={() => (keys.current.right = false)}>→</Hold>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {canShoot(w) && <Hold onDown={() => (keys.current.shoot = true)} onUp={() => (keys.current.shoot = false)}>✨</Hold>}
            {canJump(w) && <Tap onTap={doJump}>⤴</Tap>}
            <Tap onTap={doCare}>🌱</Tap>
            {canSpecial(w) && <Tap onTap={doSpecial} glow={w.special >= 100}>⚡</Tap>}
          </div>
        </div>
      )}

      {/* leyenda de flores */}
      <div style={{
        display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px 20px", padding: "4px 18px 14px",
        fontSize: 12, color: "#5C4A2C"
      }}>
        {FLOWER_DEFS.map((f) => (
          <span key={f.id}><Sprite asset={ASSETS[f.type]} size={15} /> <b>{f.name}:</b> {isBoss ? f.combate : f.pasivo}</span>
        ))}
      </div>

      {/* CAMBIO: overlay del tutorial jugable, por encima de todo lo demás */}
      {tutorialAbierto && (
        <TutorialOverlay
          paso={TUTORIAL_PASOS[tutPaso]}
          indice={tutPaso}
          total={TUTORIAL_PASOS.length}
          onAnterior={() => setTutPaso((p) => Math.max(0, p - 1))}
          onSiguiente={() => setTutPaso((p) => Math.min(TUTORIAL_PASOS.length - 1, p + 1))}
          onCerrar={() => setTutorialAbierto(false)}
        />
      )}
    </div>
  );
}

/* ====================================================================== */
/*  FLUJO                                                                 */
/* ====================================================================== */
function beginDay(w, n) {
  w.day = n;
  const cfg = dayCfg(n);
  // CAMBIO: hechizado:0 para que ningún día empiece con los controles invertidos
  w.mouri = { x: T.CW / 2, y: 0, vy: 0, onGround: true, facing: "right", moving: false, hp: T.mouriMaxHP, invuln: 0, hechizado: 0 };
  w.bullets = []; w.shadows = []; w.orbs = []; w.beams = [];
  w.dayTimer = 0; w.needTimer = 3; w.shadowTimer = (cfg.shadowRate || 0) + 2; w.fireCd = 0;
  w.mini = null; w.miniDone = false; w.darkness = 0;
  w._rosaCd = 6; w._sumCd = 3;
  for (const f of w.flowers) { f.health = Math.max(f.health, 60); f.need = null; }
  if (cfg.boss) {
    w.bossHP = T.bossMaxHP; w.bossPhase = 1; w.bossX = T.CW / 2; w.bossY = 210;
    w.bossDir = 1; w.bossAtk = 2.2; w.bossInvuln = 1.5; w.bossState = "idle"; w.bossStateT = 0;
    // CAMBIO: escudo de flores reiniciado al empezar la pelea final
    w.escudoActivo = false; w.escudoCd = 0;
  }
  w.scene = "dayIntro"; w.msgTimer = 0;
}

function toVictory(w, A, startDialog, rerender) {
  A.playMusica("victoria");
  w.scene = "playing";
  startDialog(DIALOGOS.victoria, () => {
    // CAMBIO: si pusiste imágenes en CREDITOS_IMAGENES, primero se
    // muestran (con la música de créditos) y luego llega la victoria.
    w.creditoIdx = 0;
    if (CREDITOS_IMAGENES.length > 0) {
      world_setScene(w, "creditos");
      A.playMusica("creditos");
    } else {
      world_setScene(w, "victory");
    }
    rerender();
  });
  rerender();
}
function world_setScene(w, s) { w.scene = s; w.prevScene = null; }

function toGameOver(w, A, startDialog, rerender) {
  A.playMusica("derrota");
  w.scene = "playing";
  startDialog(DIALOGOS.derrota, () => { world_setScene(w, "gameover"); rerender(); });
}

/* ====================================================================== */
/*  FÍSICA COMPARTIDA                                                     */
/* ====================================================================== */
function movePhysics(w, dt, keys, A) {
  const m = w.mouri;
  // CAMBIO: hechizo de la Lujuria — mientras dure, izquierda y derecha
  // quedan invertidas.
  if (m.hechizado > 0) m.hechizado = Math.max(0, m.hechizado - dt);
  const hechizado = m.hechizado > 0;
  const presionaIzq = hechizado ? keys.right : keys.left;
  const presionaDer = hechizado ? keys.left : keys.right;
  if (presionaIzq) { m.x -= T.mouriSpeed * dt; m.facing = "left"; m.moving = true; }
  else if (presionaDer) { m.x += T.mouriSpeed * dt; m.facing = "right"; m.moving = true; }
  else m.moving = false;
  // CAMBIO: un poco más de margen respecto al borde para que el sprite
  // nunca quede a medio cortar por el overflow:hidden del escenario.
  m.x = clamp(m.x, 40, T.CW - 40);
  m.vy -= T.gravity * dt; m.y += m.vy * dt;
  if (m.y <= 0) { m.y = 0; m.vy = 0; m.onGround = true; }
  if (m.invuln > 0) m.invuln -= dt;

  if (w.fireCd > 0) w.fireCd -= dt;
  const fast = has(w, "margarita");
  if (keys.shoot && canShoot(w) && w.fireCd <= 0) {
    w.bullets.push({ id: w.nextId++, x: m.x + (m.facing === "left" ? -20 : 20), y: m.y + 24, dir: m.facing === "left" ? -1 : 1 });
    w.fireCd = T.fireRate * (fast ? 0.62 : 1);
    A.playSfx("disparo");
  }
  for (const b of w.bullets) b.x += b.dir * T.bulletSpeed * dt;
  w.bullets = w.bullets.filter((b) => b.x > -20 && b.x < T.CW + 20);

  if (canSpecial(w)) {
    const rate = 3 + healthy(w) * 2.2;
    w.special = clamp(w.special + rate * (fast ? 1.4 : 1) * dt, 0, 100);
  }
}

function flowerPassives(w, dt) {
  if (has(w, "rosa")) for (const f of w.flowers) if (f.health > 0) f.health += T.regenRosaGarden * dt;
  if (has(w, "girasol")) {
    const g = w.flowers.find((f) => f.type === "girasol");
    for (const f of w.flowers) if (f !== g && f.health > 0 && Math.abs(f.x - g.x) < 360) f.health += T.regenGirasol * dt;
  }
  for (const f of w.flowers) f.health = clamp(f.health, 0, T.flowerMax);
}

function tickNeeds(w, dt, needRate, needDecay) {
  const slow = has(w, "margarita") ? 1.5 : 1;
  w.needTimer -= dt;
  if (w.needTimer <= 0) {
    const cand = alive(w).filter((f) => !f.need);
    if (cand.length) rand(cand).need = rand(NEED_KEYS);
    w.needTimer = Math.max(1.4, needRate * slow);
  }
  for (const f of w.flowers) if (f.health > 0 && f.need) f.health -= needDecay * dt;
}

function spawnShadow(w, hp = 1, big = false) {
  const a = alive(w); if (!a.length) return;
  const t = rand(a), left = Math.random() < 0.5;
  w.shadows.push({ id: w.nextId++, x: left ? 0 : T.CW, targetId: t.id, hp, big });
}

function tickShadows(w, dt, speed, A) {
  const slow = has(w, "lavanda") ? 0.6 : 1;
  for (const s of w.shadows) {
    let tf = w.flowers.find((f) => f.id === s.targetId);
    if (!tf || tf.health <= 0) { const a = alive(w)[0]; if (a) { s.targetId = a.id; tf = a; } else break; }
    if (!tf) continue;
    if (Math.abs(s.x - tf.x) > 8) s.x += Math.sign(tf.x - s.x) * speed * slow * dt;
    else tf.health -= T.shadowDmg * dt;
  }
  for (const b of w.bullets) for (const s of w.shadows) {
    // CAMBIO: hitbox de la bala vs sombra un poco más generosa y clara
    if (b.y < 55 && Math.abs(b.x - s.x) < 30) {
      s.hp -= has(w, "girasol") ? 2 : 1; b.dead = true;
      if (s.hp <= 0 && !s.dead) { s.dead = true; w.score += 12; A.playSfx("sombra"); }
    }
  }
  w.bullets = w.bullets.filter((b) => !b.dead);
  w.shadows = w.shadows.filter((s) => !s.dead);
  if (alive(w).length === 0) w.shadows = [];
}

/* daña a Mouri con un proyectil */
function hurtMouri(w, A) {
  const m = w.mouri;
  if (m.invuln > 0) return false;
  // CAMBIO: si el escudo de flores está activo, absorbe el golpe (no se
  // pierde vida) y entra en enfriamiento en vez de dañar a Mouri.
  if (w.escudoActivo) {
    w.escudoActivo = false; w.escudoCd = T.escudoCooldown;
    m.invuln = 0.5; w.flash = .3; w.shake = .15;
    A.playSfx("curar");
    return true;
  }
  m.hp -= 1; m.invuln = T.invulnTime; w.flash = .25; w.shake = .25;
  A.playSfx("golpe");
  return true;
}

function tickOrbs(w, dt, A) {
  const m = w.mouri;
  for (const o of w.orbs) {
    o.x += o.vx * dt; o.y += o.vy * dt;
    if (o.gravity) o.vy -= 420 * dt;
    // CAMBIO: hitbox del orbe ajustada a su nuevo tamaño visual (más grande)
    const r = o.big ? 46 : 32;
    const toca = Math.abs(o.x - m.x) < r && o.y > m.y - 8 && o.y < m.y + 48;
    if (!toca) continue;
    if (o.perla) {
      // CAMBIO: perla de luz del dragón — no hace daño, carga el Especial
      w.special = clamp(w.special + 18, 0, 100);
      w.flash = .15; A.playSfx("curar");
      o.dead = true;
    } else if (o.hechizo) {
      // CAMBIO: orbe de hechizo de la Lujuria — no quita vida, invierte
      // los controles unos segundos (si Mouri no está invulnerable)
      if (m.invuln <= 0) { m.hechizado = 3; w.flash = .2; A.playSfx("aparicion"); }
      o.dead = true;
    } else if (hurtMouri(w, A)) {
      o.dead = true;
    }
  }
  w.orbs = w.orbs.filter((o) => !o.dead && o.x > -40 && o.x < T.CW + 40 && o.y > -60 && o.y < 620);
}

/* ====================================================================== */
/*  MINI-JEFES                                                            */
/* ====================================================================== */
function spawnMiniBoss(w, id, A, startDialog, rerender) {
  const d = MINI_JEFES[id];
  w.mini = {
    ...d, hpMax: d.hp, hp: d.hp,
    x: T.CW * 0.5, y: 150, dir: 1, atkT: 1.2, hitT: 0, scale: 1,
    copias: [], teleT: 1.5,
  };
  A.playMusica("miniJefe");
  A.playSfx("aparicion");
  w.shake = .5;
  startDialog(DIALOGOS.miniJefe[id] || [], () => { });
  rerender();
}

function runMiniBoss(w, dt, A, startDialog, rerender) {
  const mb = w.mini;
  if (!mb) return;
  if (mb.hitT > 0) mb.hitT -= dt;

  // ---- comportamiento por tipo ----
  if (mb.id === "gula") {
    // CAMBIO: La Gula va directo a la flor más sana y la muerde
    // directamente (mecánica nueva: daño directo, no por "necesidad").
    // Cada mordisco la cura un poco, así que hay que apurarse en matarla.
    mb.y = 30;
    const objetivo = alive(w).sort((a, b) => b.health - a.health)[0];
    if (objetivo) {
      const dir = Math.sign(objetivo.x - mb.x) || 1;
      if (Math.abs(objetivo.x - mb.x) > 45) mb.x += dir * mb.vel * dt;
      else {
        objetivo.health = clamp(objetivo.health - 26 * dt, 0, T.flowerMax);
        mb.hp = clamp(mb.hp + 5 * dt, 0, mb.hpMax);
      }
    }
    mb.atkT -= dt;
    if (mb.atkT <= 0) { orb(w, mb.x, mb.y + 20, 0, -140); mb.atkT = mb.ataque; }
  }

  else if (mb.id === "lujuria") {
    // CAMBIO: La Lujuria se teletransporta y lanza un hechizo que invierte
    // los controles de Mouri unos segundos (ver tickOrbs -> o.hechizo).
    mb.teleT -= dt;
    if (mb.teleT <= 0) {
      mb.x = 120 + Math.random() * (T.CW - 240);
      mb.y = 130 + Math.random() * 100;
      mb.teleT = 2.6; w.flash = .1;
    }
    mb.atkT -= dt;
    if (mb.atkT <= 0) {
      const dx = w.mouri.x - mb.x, dy = (w.mouri.y + 20) - mb.y, L = Math.hypot(dx, dy) || 1;
      orb(w, mb.x, mb.y, (dx / L) * 130, (dy / L) * 130, { hechizo: true });
      mb.atkT = mb.ataque;
    }
  }

  else if (mb.id === "bruma") {
    // se desliza rápido y oscurece la pantalla
    mb.x += mb.dir * mb.vel * dt;
    if (mb.x < 80) { mb.x = 80; mb.dir = 1; }
    if (mb.x > T.CW - 80) { mb.x = T.CW - 80; mb.dir = -1; }
    mb.y = 45 + Math.sin(Date.now() / 400) * 20;
    w.darkness = clamp(w.darkness + 0.25 * dt, 0, 0.7);
    mb.atkT -= dt;
    if (mb.atkT <= 0) { orb(w, mb.x, mb.y, 0, -170); mb.atkT = mb.ataque; }
  }

  else if (mb.id === "susurro") {
    // se teletransporta y lanza abanicos — CAMBIO: teletransporta más seguido
    mb.teleT -= dt;
    if (mb.teleT <= 0) { mb.x = 120 + Math.random() * (T.CW - 240); mb.y = 120 + Math.random() * 110; mb.teleT = 1.9; w.flash = .12; }
    mb.atkT -= dt;
    if (mb.atkT <= 0) {
      for (const a of [-0.6, -0.2, 0.2, 0.6]) orb(w, mb.x, mb.y, Math.sin(a) * 150, -Math.cos(a) * 150);
      mb.atkT = mb.ataque;
    }
  }

  else if (mb.id === "grieta") {
    // fija, invoca sombras y deja caer orbes pesados
    mb.x = T.CW / 2; mb.y = 130 + Math.sin(Date.now() / 700) * 12;
    mb.atkT -= dt;
    if (mb.atkT <= 0) {
      spawnShadow(w, 1);
      if (Math.random() < 0.5) orb(w, 120 + Math.random() * (T.CW - 240), 340, 0, -40, { gravity: true, big: true });
      mb.atkT = mb.ataque;
    }
  }

  else if (mb.id === "eco") {
    // persigue e imita a Mouri; al recibir daño se divide.
    // CAMBIO: más agresivo, se divide más seguido y hasta 4 copias.
    const dir = Math.sign(w.mouri.x - mb.x) || 1;
    mb.x += dir * mb.vel * dt;
    mb.y = 130 + Math.sin(Date.now() / 300) * 30;
    for (const c of mb.copias) {
      c.x += Math.sign(w.mouri.x - c.x) * mb.vel * 0.75 * dt;
      c.y = 130 + Math.sin((Date.now() + c.off) / 300) * 30;
      if (Math.abs(c.x - w.mouri.x) < 30 && Math.abs(c.y - w.mouri.y) < 50) hurtMouri(w, A);
    }
    mb.atkT -= dt;
    if (mb.atkT <= 0) { orb(w, mb.x, mb.y, 0, -160); mb.atkT = mb.ataque; }
    if (Math.abs(mb.x - w.mouri.x) < 34 && Math.abs(mb.y - w.mouri.y) < 54) hurtMouri(w, A);
  }

  // ---- balas de Mouri contra el mini-jefe ----
  const hitR = 50;
  for (const b of w.bullets) {
    // copias del eco
    if (mb.id === "eco") {
      for (const c of mb.copias) {
        if (!b.dead && Math.abs(b.x - c.x) < 34 && Math.abs(b.y - c.y) < 44) { c.hp -= 1; b.dead = true; if (c.hp <= 0) c.dead = true; }
      }
      mb.copias = mb.copias.filter((c) => !c.dead);
    }
    if (!b.dead && Math.abs(b.x - mb.x) < hitR && Math.abs(b.y - mb.y) < 58) {
      b.dead = true;
      mb.hp -= has(w, "girasol") ? T.bulletDmgMini + 1 : T.bulletDmgMini;
      mb.hitT = .18;
      A.playSfx("golpe");
      // El Eco se divide (CAMBIO: más probable y hasta 4 copias)
      if (mb.id === "eco" && mb.copias.length < 4 && Math.random() < 0.45) {
        mb.copias.push({ id: w.nextId++, x: mb.x + (Math.random() < .5 ? -70 : 70), y: mb.y, hp: 2, scale: .6, off: Math.random() * 1000 });
      }
    }
  }
  w.bullets = w.bullets.filter((b) => !b.dead);

  // ---- derrotado ----
  if (mb.hp <= 0) {
    w.mini = null; w.miniDone = true; w.darkness = 0; w.score += 120; w.flash = .5; w.shake = .4;
    w.orbs = [];
    A.playMusica(dayCfg(w.day).night ? "noche" : "dia");
    startDialog(DIALOGOS.miniJefeVencido, () => { });
    rerender();
  }
}

function orb(w, x, y, vx, vy, extra = {}) {
  w.orbs.push({ id: w.nextId++, x, y, vx, vy, ...extra });
}

/* ====================================================================== */
/*  DÍA NORMAL                                                            */
/* ====================================================================== */
function runGarden(w, dt, keys, A, startDialog, rerender) {
  const cfg = dayCfg(w.day);
  movePhysics(w, dt, keys, A);
  tickNeeds(w, dt, cfg.needRate, cfg.needDecay);

  if (cfg.shadowRate > 0) {
    w.shadowTimer -= dt;
    if (w.shadowTimer <= 0) { spawnShadow(w, cfg.shadowHP, cfg.shadowHP >= 2); w.shadowTimer = cfg.shadowRate; }
    tickShadows(w, dt, cfg.shadowSpeed, A);
  }

  // aparición del mini-jefe
  if (cfg.miniJefe && !w.mini && !w.miniDone && w.dayTimer >= cfg.miniJefeEn) {
    spawnMiniBoss(w, cfg.miniJefe, A, startDialog, rerender);
    return;
  }
  if (w.mini) runMiniBoss(w, dt, A, startDialog, rerender);
  tickOrbs(w, dt, A);
  flowerPassives(w, dt);

  if (w.flowers.every((f) => f.health <= 0) || w.mouri.hp <= 0) { toGameOver(w, A, startDialog, rerender); return; }

  w.dayTimer += dt;
  // el día no termina hasta vencer al mini-jefe
  if (w.dayTimer >= cfg.dur && !w.mini) {
    w.scene = "dayClear";
    startDialog(DIALOGOS.finDia, () => { w.scene = "dayClear"; rerender(); });
  }
}

/* ====================================================================== */
/*  JEFE FINAL — EL OLVIDO (3 fases, muchos ataques)                      */
/*  CAMBIO: fase 3 tiene un estilo de juego distinto — El Olvido se       */
/*  "refleja" y persigue tu posición en espejo, y suma dos ataques nuevos */
/*  (Espejo y Tormenta) a los que ya tenía.                               */
/* ====================================================================== */
const ATAQUES_POR_FASE = {
  1: ["dirigido", "abanico", "lluvia"],
  2: ["abanico", "lluvia", "muro", "invocar"],
  3: ["dirigido", "muro", "rayos", "embestida", "lluvia", "invocar", "espejo", "tormenta"],
  // CAMBIO: Fase 4 — el dragón marino despierta del todo. Mecánicas de
  // agua nuevas, sumadas a las que ya usaba en fases anteriores.
  4: ["maremoto", "chorro", "sumersion", "coletazo", "perlas", "tormenta", "rayos", "embestida"],
};

function runBoss(w, dt, keys, A, startDialog, rerender) {
  movePhysics(w, dt, keys, A);
  tickNeeds(w, dt, 3.4, 8);
  flowerPassives(w, dt);
  if (w.bossInvuln > 0) w.bossInvuln -= dt;

  // ROSA: regenera corazones
  if (has(w, "rosa") && w.mouri.hp < T.mouriMaxHP) {
    w._rosaCd -= dt;
    if (w._rosaCd <= 0) { w.mouri.hp = Math.min(T.mouriMaxHP, w.mouri.hp + 1); w._rosaCd = 7; }
  }

  // balas vs jefe
  for (const b of w.bullets) {
    if (Math.abs(b.x - w.bossX) < 76 && w.bossInvuln <= 0) {
      w.bossHP = Math.max(0, w.bossHP - (has(w, "girasol") ? T.bulletDmgBoss + 2 : T.bulletDmgBoss));
      b.dead = true;
    }
  }
  w.bullets = w.bullets.filter((b) => !b.dead);
  tickShadows(w, dt, 34, A);

  // CAMBIO: escudo de flores — si el jardín está sano, Mouri gana un
  // escudo que absorbe un golpe del dragón (ver hurtMouri).
  if (w.escudoCd > 0) w.escudoCd -= dt;
  if (!w.escudoActivo && w.escudoCd <= 0 && gardenLight(w) >= T.escudoUmbral) {
    w.escudoActivo = true;
  }

  // ---- cambio de fase (con diálogo) — CAMBIO: ahora son 4 fases ----
  const nueva = w.bossHP > 460 ? 1 : w.bossHP > 300 ? 2 : w.bossHP > 140 ? 3 : 4;
  if (nueva > w.bossPhase) {
    w.bossPhase = nueva; w.bossInvuln = 2.0; w.orbs = []; w.beams = []; w.shake = .5; w.flash = .4;
    if (nueva === 3 && MUSICA.jefeFase3) A.playMusica("jefeFase3");
    if (nueva === 4 && MUSICA.jefeFase4) A.playMusica("jefeFase4");
    const dialogoFase = nueva === 2 ? DIALOGOS.jefeFase2 : nueva === 3 ? DIALOGOS.jefeFase3 : DIALOGOS.jefeFase4;
    startDialog(dialogoFase, () => { });
    rerender();
    return;
  }

  // ---- movimiento ----
  if (w.bossState === "embestida") {
    w.bossStateT -= dt;
    w.bossY = Math.max(20, w.bossY - 300 * dt);
    w.bossX += w.bossDir * 460 * dt;
    if (w.bossX < 70 || w.bossX > T.CW - 70) w.bossDir *= -1;
    if (Math.abs(w.bossX - w.mouri.x) < 60 && w.mouri.y < 70) hurtMouri(w, A);
    if (w.bossStateT <= 0) { w.bossState = "idle"; w.bossY = 210; }
  } else if (w.bossState === "sumergido") {
    // CAMBIO: el dragón se hunde (fuera de vista) y luego emerge cerca de
    // Mouri con un golpe de agua — mecánica nueva exclusiva del dragón.
    w.bossStateT -= dt;
    w.bossY = -260;
    if (w.bossStateT <= 0) {
      w.bossX = clamp(w.mouri.x + (Math.random() < .5 ? -220 : 220), 90, T.CW - 90);
      w.bossY = 210; w.bossState = "idle"; w.bossInvuln = 0.6;
      for (const a of [-0.5, 0, 0.5]) orb(w, w.bossX, 60, Math.sin(a) * 190, -Math.cos(a) * 190, { big: true });
      w.shake = .4; w.flash = .3;
    }
  } else if (w.bossPhase === 1) {
    w.bossX = T.CW / 2 + Math.sin(Date.now() / 1200) * T.CW * 0.28;
    w.bossY = 210 + Math.sin(Date.now() / 800) * 12;
  } else if (w.bossPhase >= 3) {
    // CAMBIO: estilo distinto desde la fase 3 — El Olvido/dragón se
    // posiciona en espejo respecto a Mouri y te sigue con eso, en vez de
    // solo patrullar. En fase 4 reacciona todavía más rápido.
    const target = clamp(T.CW - w.mouri.x, 90, T.CW - 90);
    const velocidadSeguimiento = w.bossPhase === 4 ? 3.2 : 2.4;
    w.bossX += (target - w.bossX) * Math.min(1, dt * velocidadSeguimiento);
    w.bossY = 190 + Math.sin(Date.now() / 550) * 22;
  } else {
    w.bossX += w.bossDir * 115 * dt;
    if (w.bossX < 90) { w.bossX = 90; w.bossDir = 1; }
    if (w.bossX > T.CW - 90) { w.bossX = T.CW - 90; w.bossDir = -1; }
    w.bossY = 210 + Math.sin(Date.now() / 700) * 16;
  }

  // ---- ataques — CAMBIO: más rápidos en todas las fases, fase 4 incluida ----
  const lav = has(w, "lavanda");
  const ritmo = (w.bossPhase === 1 ? 1.7 : w.bossPhase === 2 ? 1.1 : w.bossPhase === 3 ? 0.75 : 0.55) * (lav ? 1.5 : 1);
  w.bossAtk -= dt;
  if (w.bossAtk <= 0 && w.bossInvuln <= 0 && w.bossState === "idle") {
    ejecutarAtaque(w, rand(ATAQUES_POR_FASE[w.bossPhase]), lav, A);
    w.bossAtk = ritmo;
  }

  // rayos (columnas): primero avisan, luego queman
  for (const b of w.beams) {
    b.t -= dt;
    if (!b.active && b.t <= 0) { b.active = true; b.t = 0.55; w.shake = .2; }
    else if (b.active && b.t <= 0) b.dead = true;
    if (b.active && Math.abs(b.x - w.mouri.x) < 26) hurtMouri(w, A);
  }
  w.beams = w.beams.filter((b) => !b.dead);

  // drena flores
  const drain = 2 + w.bossPhase * 1.6;
  for (const f of w.flowers) if (f.health > 0) f.health -= drain * dt;
  for (const f of w.flowers) f.health = clamp(f.health, 0, T.flowerMax);

  // CAMBIO: si el jardín está muy débil, el dragón se fortalece y se
  // regenera — así cuidar las flores importa de verdad durante toda la
  // pelea, no solo en el instante final (perder TODAS las flores ya
  // termina la partida, así que esto actúa antes de llegar a ese extremo).
  const luzJardin = gardenLight(w);
  if (luzJardin < 0.3) {
    w.bossHP = Math.min(T.bossMaxHP, w.bossHP + (0.3 - luzJardin) * 26 * dt);
  }

  tickOrbs(w, dt, A);

  if (w.bossHP <= 0) { toVictory(w, A, startDialog, rerender); return; }
  if (w.mouri.hp <= 0 || w.flowers.every((f) => f.health <= 0)) { toGameOver(w, A, startDialog, rerender); return; }
}

function ejecutarAtaque(w, tipo, lav, A) {
  const v = (lav ? 105 : 145) * (w.bossPhase === 3 ? 1.3 : w.bossPhase === 2 ? 1.12 : 1);
  const bx = w.bossX, by = w.bossY;

  if (tipo === "dirigido") {
    const dx = w.mouri.x - bx, dy = (w.mouri.y + 22) - by, L = Math.hypot(dx, dy) || 1;
    orb(w, bx, by, (dx / L) * v, (dy / L) * v);
  }
  else if (tipo === "abanico") {
    for (const a of [-0.6, -0.3, 0, 0.3, 0.6]) orb(w, bx, by, Math.sin(a) * v, -Math.cos(a) * v);
  }
  else if (tipo === "lluvia") {
    // caen orbes desde arriba en posiciones aleatorias
    for (let i = 0; i < (w.bossPhase === 3 ? 6 : 4); i++)
      orb(w, 80 + Math.random() * (T.CW - 160), 460, 0, -30, { gravity: true });
  }
  else if (tipo === "muro") {
    // pared de orbes con un hueco por donde pasar
    const hueco = 1 + Math.floor(Math.random() * 4);
    for (let i = 0; i < 6; i++) {
      if (i === hueco) continue;
      orb(w, bx, 60 + i * 70, w.mouri.x < bx ? -v * 0.8 : v * 0.8, 0);
    }
  }
  else if (tipo === "rayos") {
    // columnas de luz: avisan y luego caen
    const n = 3;
    for (let i = 0; i < n; i++) {
      const x = i === 0 ? w.mouri.x : 90 + Math.random() * (T.CW - 180);
      w.beams.push({ id: w.nextId++, x, t: 0.9, active: false });
    }
  }
  else if (tipo === "embestida") {
    w.bossState = "embestida"; w.bossStateT = 1.6;
    w.bossDir = w.mouri.x < w.bossX ? -1 : 1;
    w.shake = .3;
  }
  else if (tipo === "invocar") {
    spawnShadow(w, 1); spawnShadow(w, w.bossPhase === 3 ? 2 : 1, w.bossPhase === 3);
    A.playSfx("aparicion");
  }
  // CAMBIO: ataques nuevos, exclusivos de la Fase 3
  else if (tipo === "espejo") {
    // El Olvido dispara desde tu posición reflejada en espejo
    const mx = T.CW - w.mouri.x;
    orb(w, mx, 260, 0, -30, { gravity: true });
    orb(w, mx, 260, (w.mouri.x < mx ? -1 : 1) * v * 0.7, 0);
    w.flash = .15;
  }
  else if (tipo === "tormenta") {
    // lluvia intensa y rápida por toda la pantalla
    for (let i = 0; i < 8; i++)
      orb(w, 60 + Math.random() * (T.CW - 120), 480 + Math.random() * 80, 0, -50 - Math.random() * 30, { gravity: true });
  }
  // ==================== CAMBIO: ataques nuevos del dragón marino ====================
  else if (tipo === "maremoto") {
    // ola de agua a ras de suelo que recorre toda la pantalla: hay que saltarla
    const dir = w.bossX < T.CW / 2 ? 1 : -1;
    for (let i = 0; i < 9; i++) orb(w, w.bossX - dir * i * 70, 20, dir * 260, 0);
  }
  else if (tipo === "chorro") {
    // chorro de agua horizontal a distintas alturas, hay que esquivarlo moviéndote
    const dir = w.mouri.x < w.bossX ? -1 : 1;
    for (let i = 0; i < 5; i++) orb(w, bx, by - i * 14 + 20, dir * 300, 0);
  }
  else if (tipo === "sumersion") {
    // el dragón se hunde y reaparece cerca de Mouri con un golpe de agua
    w.bossState = "sumergido"; w.bossStateT = 1.3; w.bossInvuln = 1.6; w.shake = .2;
  }
  else if (tipo === "coletazo") {
    // coletazo: barre un lado completo del escenario con columnas de aviso
    const ladoIzquierdo = Math.random() < 0.5;
    for (let i = 0; i < 6; i++) {
      const x = ladoIzquierdo ? 40 + i * 90 : T.CW - 40 - i * 90;
      w.beams.push({ id: w.nextId++, x, t: 1.1, active: false });
    }
  }
  else if (tipo === "perlas") {
    // perlas de luz: si Mouri las toca, cargan el Especial en vez de dañarlo
    for (let i = 0; i < 4; i++)
      orb(w, 100 + Math.random() * (T.CW - 200), 300 + Math.random() * 100, 0, -20, { gravity: true, perla: true });
  }
}

/* ====================================================================== */
/*  SUBCOMPONENTES                                                        */
/* ====================================================================== */
function Flower({ f, left, isNight }) {
  const wilted = f.health <= 0;
  const hp = f.health / T.flowerMax;
  return (
    <div style={{ position: "absolute", left, bottom: T.base, transform: "translateX(-50%)", textAlign: "center" }}>
      {f.need && !wilted && <div style={{ fontSize: 18, marginBottom: -2, animation: "m-bob .8s infinite" }}>{NEEDS[f.need].icon}</div>}
      <div style={{
        fontSize: 40, filter: wilted ? "grayscale(1) brightness(.7)" : isNight ? `brightness(${0.65 + 0.35 * hp})` : "none",
        transform: wilted ? "rotate(8deg)" : "none", animation: f.need && !wilted ? "m-shake .5s infinite" : "none"
      }}>
        <Sprite asset={wilted ? ASSETS.marchita : ASSETS[f.type]} size={40} />
      </div>
      <div style={{ width: 42, height: 5, margin: "2px auto 0", background: "#0000002a", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${hp * 100}%`, height: "100%", background: hp > .5 ? "#57b846" : hp > .2 ? "#e0a520" : "#d84343" }} />
      </div>
    </div>
  );
}

function Sprite({ asset, size = 40 }) {
  const isImg = typeof asset === "string" && asset.includes("/");
  if (isImg) return <img src={asset} alt="" style={{ width: size, height: size, imageRendering: "pixelated", display: "inline-block", verticalAlign: "middle", objectFit: "contain", flexShrink: 0 }} />;
  return <span>{asset}</span>;
}

function DialogBox({ line, onNext, step, total }) {
  const p = PERSONAJES[line.quien] || PERSONAJES.narrador;
  return (
    <div onClick={onNext}
      style={{
        position: "absolute", inset: 0, zIndex: 40, background: "rgba(8,8,14,.45)",
        display: "flex", alignItems: "flex-end", justifyContent: "center", cursor: "pointer", padding: 18
      }}>
      <div style={{
        width: "min(760px, 100%)", background: p.fondo, border: "4px solid #786F49",
        borderRadius: 18, padding: "14px 18px", boxShadow: "0 8px 30px rgba(0,0,0,.4)"
      }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          {p.retrato && <div style={{ fontSize: 44, lineHeight: 1 }}><Sprite asset={p.retrato} size={44} /></div>}
          <div style={{ flex: 1 }}>
            {p.nombre && <div style={{ fontWeight: 800, fontSize: 13, letterSpacing: 1, color: p.color, opacity: .75, marginBottom: 2 }}>{p.nombre}</div>}
            <div style={{ fontSize: 16, lineHeight: 1.45, color: p.color, fontStyle: p.nombre ? "normal" : "italic" }}>{line.texto}</div>
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: 11, color: p.color, opacity: .6, marginTop: 6 }}>
          {step}/{total} · clic o ENTER ▸
        </div>
      </div>
    </div>
  );
}

/* CAMBIO: pantalla de créditos finales — muestra tus imágenes una por una */
function CreditsOverlay({ img, onNext, step, total }) {
  return (
    <div onClick={onNext}
      style={{
        position: "absolute", inset: 0, zIndex: 40, background: "#000",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        cursor: "pointer", padding: 16
      }}>
      {img ? (
        <img src={img} alt="" style={{ maxWidth: "92%", maxHeight: "78%", objectFit: "contain", borderRadius: 10, boxShadow: "0 8px 30px rgba(0,0,0,.6)" }} />
      ) : (
        <div style={{ color: "#e8e0cc", fontSize: 14 }}>✨</div>
      )}
      <div style={{ color: "#e8e0cc", fontSize: 12, marginTop: 14, opacity: .8 }}>
        {step}/{total} · clic o ENTER para continuar ▸
      </div>
    </div>
  );
}

/* CAMBIO: pantalla del tutorial jugable, accesible desde el título */
function TutorialOverlay({ paso, indice, total, onAnterior, onSiguiente, onCerrar }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 90, background: "rgba(10,10,16,.75)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 18
      }}
    >
      <div style={{
        width: "min(520px,100%)", background: "#FFF8E8", border: "4px solid #786F49",
        borderRadius: 24, padding: "22px 24px", boxShadow: "0 12px 40px rgba(0,0,0,.5)", textAlign: "center"
      }}>
        <div style={{ fontSize: 46, marginBottom: 6 }}>{paso.icono}</div>
        <h3 style={{ margin: "4px 0 10px", color: "#4E3A25", fontSize: 18 }}>{paso.titulo}</h3>
        <p style={{ color: "#5C4A2C", fontSize: 13, lineHeight: 1.6, margin: "0 0 18px" }}>{paso.texto}</p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <PixelBtn onClick={onAnterior}>◀ Atrás</PixelBtn>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#8A7A63" }}>{indice + 1} / {total}</span>
          {indice < total - 1 ? (
            <PixelBtn onClick={onSiguiente}>Siguiente ▶</PixelBtn>
          ) : (
            <PixelBtn onClick={onCerrar}>Entendido ✓</PixelBtn>
          )}
        </div>

        <button
          onClick={onCerrar}
          style={{
            marginTop: 14, background: "none", border: "none", color: "#8A7A63",
            fontSize: 11, fontWeight: 700, textDecoration: "underline", cursor: "pointer"
          }}
        >
          Cerrar tutorial
        </button>
      </div>
    </div>
  );
}

function Overlay({ children, bg }) {
  return <div style={{
    position: "absolute", inset: 0, zIndex: 30, background: bg, display: "flex",
    flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 16
  }}>{children}</div>;
}

function Controls() {
  return (
    <div style={{ fontSize: 12, marginTop: 6, color: "#d8d0bc", lineHeight: 1.7 }}>
      <div>← → mover · ↑ saltar · <b>ESPACIO</b> disparar</div>
      <div><b>X</b> cuidar flor · <b>C</b> Rayo del Recuerdo · <b>ENTER</b> avanzar diálogos</div>
    </div>
  );
}

function PixelBtn({ children, onClick }) {
  return <button onClick={onClick} style={{
    background: "#FFE39A", border: "3px solid #786F49", color: "#4E3A25",
    borderRadius: 16, padding: "10px 22px", fontWeight: 700, marginTop: 10, cursor: "pointer", fontSize: 15
  }}>{children}</button>;
}

function Hold({ children, onDown, onUp }) {
  return <button style={{
    background: "#FFF8E8", border: "3px solid #786F49", color: "#4E3A25", borderRadius: 16,
    padding: "12px 18px", fontWeight: 700, fontSize: 18, minWidth: 56, touchAction: "none", userSelect: "none"
  }}
    onMouseDown={onDown} onMouseUp={onUp} onMouseLeave={onUp}
    onTouchStart={(e) => { e.preventDefault(); onDown(); }} onTouchEnd={(e) => { e.preventDefault(); onUp(); }}>{children}</button>;
}

function Tap({ children, onTap, glow }) {
  return <button onClick={onTap} onTouchStart={(e) => { e.preventDefault(); onTap(); }}
    style={{
      background: glow ? "#FFE39A" : "#FFF8E8", border: "3px solid #786F49", color: "#4E3A25", borderRadius: 16,
      padding: "12px 18px", fontWeight: 700, fontSize: 18, minWidth: 56, touchAction: "none", userSelect: "none",
      boxShadow: glow ? "0 0 14px #ffcf4a" : "none"
    }}>{children}</button>;
}
