/* =====================================================================
 *  config-avion.js — TODO lo editable de los dos modos nuevos:
 *    1) MODO PC/TABLET  -> "avioncito" (Mouri vuela, dispara solo, lo
 *       mueves con el dedo o el mouse). Usa ETAPAS, JEFES, DIALOGOS_AV.
 *    2) MODO CELULAR    -> "Mouri guía a las almas" (otra historia).
 *       Usa CAPITULOS_ALMAS y DIALOGOS_ALMAS.
 *
 *  Las imágenes, fondos y música se siguen leyendo de config.js
 *  (ASSETS, DAY_BG, MUSICA). Nada de aquí rompe si falta un archivo:
 *  siempre hay un emoji o un dibujo de respaldo.
 * ===================================================================== */

/* ---------------------- MODO PC / TABLET (avioncito) ---------------------- */

export const AV = {
  W: 480,            // ancho lógico del campo de juego
  H: 760,            // alto lógico
  vidas: 5,          // corazones de Mouri
  cadencia: 0.15,    // segundos entre disparos (más chico = dispara más rápido)
  velBala: 760,      // velocidad de las balas de Mouri
  velTeclado: 360,   // velocidad con flechas / WASD
  sensibilidadDedo: 1.25, // cuánto se mueve la nave por cada px que mueves el dedo
  invulnerable: 1.6, // segundos sin recibir daño después de un golpe
};

// Mostrar los 3 botones pequeños para cambiar de modo (útil para probar en PC).
// Cuando termines de probar, ponlo en false.
export const MOSTRAR_SELECTOR_MODO = true;

/* Una etapa por día. `dur` = segundos de oleadas antes del jefe.
 * `ritmo` = segundos entre oleadas (más chico = más enemigos).
 * `patrones` = qué tipos de oleadas aparecen ese día. */
export const ETAPAS = [
  { n: 1, id: "gula",     nombre: "La Gula acecha",          dur: 30, ritmo: 1.9, skin: "🍖", color: "#C17817", musica: "gula",
    patrones: ["fila", "v", "lluvia"] },
  { n: 2, id: "lujuria",  nombre: "El vuelo de la Lujuria",  dur: 34, ritmo: 1.8, skin: "🦋", color: "#D6567B", musica: "lujuria",
    patrones: ["zig", "v", "fila", "tirador", "anillo"] },
  { n: 3, id: "pereza",   nombre: "El peso de la Pereza",    dur: 36, ritmo: 1.8, skin: "🐌", color: "#9fb3c8", musica: "pereza",
    patrones: ["fila", "grande", "tirador", "lluvia", "anillo"] },
  { n: 4, id: "envidia",  nombre: "La marea de la Envidia",  dur: 38, ritmo: 1.6, skin: "🐟", color: "#3f9c8f", musica: "envidia",
    patrones: ["zig", "kamikaze", "v", "tirador", "bombardero"] },
  { n: 5, id: "avaricia", nombre: "El rincón de la Avaricia", dur: 40, ritmo: 1.5, skin: "🪙", color: "#c9a24a", musica: "avaricia",
    patrones: ["lluvia", "grande", "tirador", "kamikaze", "v", "anillo", "bombardero"] },
  { n: 6, id: "ira",      nombre: "Cielo de la Ira",         dur: 42, ritmo: 1.35, skin: "🔥", color: "#e2573a", musica: "ira",
    patrones: ["kamikaze", "zig", "tirador", "grande", "v", "lluvia", "bombardero"] },
  { n: 7, id: "orgullo",  nombre: "El Orgullo",              dur: 40, ritmo: 1.3, skin: "🪞", color: "#7fd6ff", musica: "orgullo",
    patrones: ["zig", "kamikaze", "tirador", "grande", "v", "lluvia", "fila", "anillo", "bombardero"] },
];

/* Jefes de cada etapa. hp = golpes que aguanta. El Orgullo tiene 4 fases
 * (cada una con su propia barra de vida): ver `fases` abajo. */
export const JEFES = {
  gula:     { nombre: "El Glotón",         pecado: "Gula",     sprite: "🐷", hp: 120, color: "#C17817", ancho: 54, alto: 50 },
  lujuria:  { nombre: "La Seducción",      pecado: "Lujuria",  sprite: "/images/mouri-game/jefes/lujuria.png", respaldo: "🦋", hp: 100, color: "#D6567B", ancho: 48, alto: 48 },
  pereza:   { nombre: "La Bruma",          pecado: "Pereza",   sprite: "🌫️", hp: 160, color: "#9fb3c8", ancho: 64, alto: 52 },
  envidia:  { nombre: "El Leviatán",       pecado: "Envidia",  sprite: "🐍", hp: 150, color: "#3f9c8f", ancho: 56, alto: 48 },
  avaricia: { nombre: "La Grieta Dorada",  pecado: "Avaricia", sprite: "🕳️", hp: 150, color: "#c9a24a", ancho: 44, alto: 44 },
  ira:      { nombre: "La Ira",            pecado: "Ira",      sprite: "🔥", hp: 170, color: "#e2573a", ancho: 52, alto: 52 },
  orgullo:  { nombre: "El Orgullo",        pecado: "Orgullo",  sprite: "👁️", hp: 0,   color: "#7fd6ff", ancho: 60, alto: 56,
    fases: [
      { id: 1, nombre: "El Reflejo",       hp: 140, color: "#7fd6ff" },
      { id: 2, nombre: "La Máscara",       hp: 160, color: "#c98bff" },
      { id: 3, nombre: "El Espejo Roto",   hp: 170, color: "#ff8a8a" },
      { id: 4, nombre: "El Olvido",        hp: 120, color: "#f3ecd8" },
    ],
  },
};

export const PERSONAJES_AV = {
  // Mouri, narrador, ecos y el Orgullo ya existen en config.js (PERSONAJES).
  // Aquí solo agregamos lo que falta.
};

export const DIALOGOS_AV = {
  intro: [
    { quien: "narrador", texto: "Un jardín donde cada flor es un recuerdo de alguien que amamos." },
    { quien: "mouri", texto: "¡Hola! Soy Mouri. Esta vez no caminaré: ¡volaré para defender el jardín desde el cielo!" },
    { quien: "mouri", texto: "Mi luz dispara sola. Tú solo guíame: arrastra el dedo (o mueve el mouse) y yo te sigo." },
    { quien: "mouri", texto: "Si la barra de Recuerdos se llena, toca el botón ⚡ (o la tecla ESPACIO) para lanzar el Rayo del Recuerdo." },
  ],
  dia: {
    1: [{ quien: "mouri", texto: "La Gula viene con sus sombras hambrientas. Recoge las perlas ✨: mejoran mi disparo." }],
    2: [{ quien: "mouri", texto: "La Lujuria vuela por todo el cielo. Si su hechizo 💘 te toca, me costará moverme." }],
    3: [{ quien: "mouri", texto: "La Pereza casi no se mueve, pero cuando brillan las columnas... ¡sal de ahí!" }],
    4: [{ quien: "mouri", texto: "La Envidia copia cada movimiento que hago. Cuidado: dispara a donde estuve." }],
    5: [{ quien: "mouri", texto: "La Avaricia esconde su cuerpo detrás de monedas. Hay que encontrar el hueco." }],
    6: [{ quien: "mouri", texto: "¡La Ira nos persigue por el cielo! Cuando se ponga roja, prepárate a esquivar su embestida." }],
    7: [
      { quien: "narrador", texto: "El salón del Orgullo. Aquí no hay tierra ni cielo: solo espejos." },
      { quien: "olvido", texto: "Vuela todo lo que quieras... acabarás mirándote a ti mismo." },
    ],
  },
  jefe: {
    gula: [{ quien: "mouri", texto: "¡La Gula! Cuando abra la boca nos jalará... y después ¡eructa en círculo! Y si se enfurece, lanza comida: ¡derríbala antes de que se la coma y se cure!" }],
    lujuria: [{ quien: "mouri", texto: "La Lujuria aparece y desaparece... y deja COPIAS falsas. Dispárales para deshacerlas y busca a la verdadera." }],
    pereza: [{ quien: "mouri", texto: "La Bruma suelta nubes de sueño 💤: ahí volaré muy lento. Sal de ellas y mira dónde brillan las columnas." }],
    envidia: [{ quien: "mouri", texto: "El Leviatán imita mis pasos... y manda mi propia SOMBRA a perseguirme. ¡Dispárale a la sombra para romperla!" }],
    avaricia: [{ quien: "mouri", texto: "Las monedas la protegen. Espera el hueco... y cuidado: lanza monedas al aire que rebotan en el suelo." }],
    ira: [{ quien: "mouri", texto: "¡La Ira! Se lanza en línea recta, brotan géiseres de lava desde abajo y, enfurecida, los bordes arden. ¡Quédate al centro!" }],
  },
  jefeVencido: [{ quien: "mouri", texto: "¡Bien hecho! El jardín respira otra vez." }],
  finDia: [{ quien: "mouri", texto: "Un día más. Las flores aguantaron gracias a ti." }],
  orgulloIntro: [
    { quien: "narrador", texto: "Las voces de los seis pecados vencidos resuenan en las paredes de cristal." },
    { quien: "ecoGula", texto: "Me venciste con hambre... pero aquí no hay nada que morder." },
    { quien: "ecoLujuria", texto: "Ni mis encantos te detuvieron. Veamos si tu corazón aguanta esto." },
    { quien: "ecoPereza", texto: "Yo apenas me moví, y aun así dudaste. Aquí, dudar te va a costar todo." },
    { quien: "ecoEnvidia", texto: "Yo copiaba cada paso tuyo... él no necesita copiarte: él ES tú, reflejado." },
    { quien: "ecoAvaricia", texto: "Yo quería tus monedas. Él quiere algo que no se gasta: tu certeza." },
    { quien: "ecoIra", texto: "Volaste lejos de mí. Aquí ya no hay a dónde volar." },
    { quien: "olvido", texto: "Ríndete. Ni con toda tu luz podrás tocarme." },
    { quien: "mouri", texto: "No vengo a ganar por fuerza. Vengo a recordar." },
  ],
  orgulloFase: {
    1: [
      { quien: "olvido", texto: "¿Un reflejo roto? Solo era un calentamiento. Mira mi verdadero rostro: la Máscara." },
      { quien: "mouri", texto: "Entonces me enfrentaré a todos tus rostros. Y cuando canalice dos pecados a la vez... esquivaré el doble." },
    ],
    2: [
      { quien: "olvido", texto: "Los ecos no bastaron... ¡Entonces el espejo se romperá y cada pedazo te cortará!" },
      { quien: "mouri", texto: "Los pedazos rotos también reflejan luz... y sus rayos rebotan. Buscaré el hueco." },
    ],
    3: [
      { quien: "olvido", texto: "Basta de espejos. Voy a borrar el jardín entero. Voy a borrarte a ti." },
      { quien: "narrador", texto: "La luz del salón se apaga. Solo queda la pequeña llama de Mouri." },
      { quien: "mouri", texto: "Mientras alguien recuerde, mi luz no se apaga." },
      { quien: "narrador", texto: "El Olvido está protegido: nada lo hiere si nadie lo recuerda. Recoge las flores 🌻🌹💜🌼 que caen: cada recuerdo devuelve luz y rompe su escudo." },
    ],
  },
  orgulloVictoria: [
    { quien: "olvido", texto: "Imposible... alguien vio a través de mí..." },
    { quien: "narrador", texto: "Los ecos de los seis pecados se apagan, uno a uno, hasta el silencio." },
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

/* Las flores ganadas dan un pequeño poder permanente para los días siguientes. */
export const BENDICIONES = {
  1: { id: "girasol",   icono: "🌻", nombre: "Girasol",   texto: "Tus disparos hacen 25% más daño" },
  2: { id: "rosa",      icono: "🌹", nombre: "Rosa",      texto: "Entre días recuperas 2 corazones" },
  3: { id: "lavanda",   icono: "💜", nombre: "Lavanda",   texto: "Los disparos enemigos van 15% más lentos" },
  4: { id: "margarita", icono: "🌼", nombre: "Margarita", texto: "Disparas más rápido y cargas el Rayo antes" },
};

export const TUTORIAL_AV = [
  { icono: "👆", titulo: "Moverte", texto: "Arrastra el dedo (o mueve el mouse) y Mouri te sigue. En computador también puedes usar las flechas o WASD." },
  { icono: "✨", titulo: "Disparo automático", texto: "No tienes que disparar: Mouri lanza su luz solo. Recoge las perlas ✨ para tener disparos dobles y triples." },
  { icono: "⚡", titulo: "Rayo del Recuerdo", texto: "Cuando la barra de Recuerdos se llena, toca el botón ⚡ (o ESPACIO / C) para borrar los disparos enemigos y dañar al jefe." },
  { icono: "💗", titulo: "Corazones", texto: "Solo el centro de Mouri puede ser golpeado (el puntito brillante). Si te golpean pierdes un corazón; los 💗 te curan." },
  { icono: "😈", titulo: "Los 7 pecados", texto: "Cada día un jefe distinto, con su propia forma de pelear. El último, el Orgullo, tiene 4 fases." },
];

/* ------------------- MODO CELULAR: Mouri guía a las almas ------------------- */

export const ALMAS = {
  titulo: "Mouri, guía de almas",
  subtitulo: "Una noche, cinco almas y un solo amanecer.",
  fondoTitulo: ["#0b1030", "#1c2a5a", "#3b3a7a"],
};

export const PERSONAJES_ALMAS = {
  lucero: { nombre: "Lucero", retrato: "🐶", color: "#FFE9C7", fondo: "#3a2a12" },
  miel:   { nombre: "Miel",   retrato: "🐱", color: "#FFE3F0", fondo: "#3a1a2c" },
  nube:   { nombre: "Nube",   retrato: "🐰", color: "#E8EEFF", fondo: "#1d2748" },
  pepita: { nombre: "Pepita", retrato: "🦜", color: "#DDF7D8", fondo: "#173a1a" },
  tomas:  { nombre: "Tomás",  retrato: "🐢", color: "#E5F2D3", fondo: "#22351a" },
  olvidoNoche: { nombre: "El Olvido", retrato: "🌑", color: "#EDE6FF", fondo: "#14101f" },
};

/* Cada capítulo = un alma. `dur` en segundos. `vel` = qué tan rápido vuela el
 * cielo. `obst` = qué tipo de peligros aparecen (ver almas-engine.js). Los
 * `recuerdos` salen en pantalla cuando Mouri recoge una luz. */
export const CAPITULOS_ALMAS = [
  {
    n: 1, alma: "lucero", emoji: "🐶", nombre: "Lucero, el perrito", color: "#ffd27a",
    cielo: ["#0b1030", "#1c2a5a", "#2d3f78"], dur: 38, vel: 150,
    obst: { sombra: 1.5, sigue: 0, viento: false, niebla: false, rayos: false, muro: false },
    ayuda: "Desliza el dedo para volar. Toca la pantalla para graznar y espantar sombras.",
    recuerdos: [
      "La pelota roja del parque", "Sus manos rascándole la barriga", "El primer paseo de la mañana",
      "Esperarlo en la puerta cada tarde", "El sofá donde dormían juntos", "Saltar con la lluvia",
      "Su voz diciendo su nombre", "Un hueso escondido en el jardín", "Correr tras las palomas", "Un ladrido de alegría",
    ],
    intro: [
      { quien: "lucero", texto: "¿Dónde estoy...? Estaba jugando con la pelota y mi humano me abrazaba." },
      { quien: "mouri", texto: "Estás a salvo, Lucero. Soy Mouri. Te acompañaré hasta el amanecer." },
      { quien: "mouri", texto: "Recoge las luces ✨: cada una es un recuerdo tuyo. Y esquiva las sombras del Olvido." },
    ],
    fin: [
      { quien: "lucero", texto: "¡Ya me acuerdo de todo! Sus manos, el parque, su risa... Gracias, Mouri." },
      { quien: "mouri", texto: "Corre hacia la luz, Lucero. Él te recordará cada vez que vea una pelota roja." },
    ],
    finParcial: [
      { quien: "lucero", texto: "Me falta algún recuerdo... pero sé que él nunca me va a olvidar." },
      { quien: "mouri", texto: "Con eso basta, Lucero. Ve a la luz." },
    ],
  },
  {
    n: 2, alma: "miel", emoji: "🐱", nombre: "Miel, la gatita", color: "#ffb3d1",
    cielo: ["#1a0b2e", "#3a1a5a", "#5a2a6a"], dur: 42, vel: 165,
    obst: { sombra: 1.3, sigue: 0.5, viento: true, niebla: false, rayos: false, muro: false },
    ayuda: "Cuando aparezca una flecha, viene viento: el cielo te empujará hacia un lado.",
    recuerdos: [
      "Ronronear al sol de la ventana", "Su lugar favorito en la cama", "Perseguir la cinta de colores",
      "Dormir sobre su pecho", "El plato siempre lleno a tiempo", "Su dedo en la nariz",
      "La caja de cartón nueva", "Maullar al oír las llaves", "La manta con su olor", "Ronronear al despedirse",
    ],
    intro: [
      { quien: "miel", texto: "No me gustan las alturas... ni el viento. Los gatos preferimos el sofá." },
      { quien: "mouri", texto: "El viento también va con nosotros, Miel. Déjate llevar, pero no te dejes arrastrar." },
    ],
    fin: [
      { quien: "miel", texto: "Ronroneé en su regazo cada noche. Eso nunca se va, ¿verdad?" },
      { quien: "mouri", texto: "Nunca, Miel. Ese sonido vive en su casa para siempre." },
    ],
    finParcial: [
      { quien: "miel", texto: "Algunos recuerdos se me escaparon con el viento... pero el ronroneo sigue aquí." },
      { quien: "mouri", texto: "Con eso alcanza. Sube a la luz, Miel." },
    ],
  },
  {
    n: 3, alma: "nube", emoji: "🐰", nombre: "Nube, la conejita", color: "#cfe0ff",
    cielo: ["#0a1a2a", "#1d3a52", "#35596f"], dur: 44, vel: 170,
    obst: { sombra: 1.2, sigue: 0.7, viento: false, niebla: true, rayos: false, muro: false },
    ayuda: "La niebla tapa el cielo. Quédate cerca de la luz de tu alma y mira bien antes de moverte.",
    recuerdos: [
      "Zanahorias a escondidas", "El abrazo de la noche", "Saltar en el pasto fresco",
      "Orejas acariciadas despacito", "Su madriguera de mantas", "Susurros al oído",
      "La primera nevada", "Hojas de lechuga crujientes", "Su manta suave", "Siempre te quiero",
    ],
    intro: [
      { quien: "nube", texto: "No veo nada... tengo miedo." },
      { quien: "mouri", texto: "La niebla es el Olvido asomándose. Quédate cerca de mi luz, Nube. Yo veo por los dos." },
    ],
    fin: [
      { quien: "nube", texto: "Su voz fue lo último que oí... ¡y ahora la escucho clarito!" },
      { quien: "mouri", texto: "Esa voz no la borra ninguna niebla. Ve, Nube." },
    ],
    finParcial: [
      { quien: "nube", texto: "Hay partes borrosas... pero su voz sigue ahí." },
      { quien: "mouri", texto: "La voz es lo más importante. Ve a la luz." },
    ],
  },
  {
    n: 4, alma: "pepita", emoji: "🦜", nombre: "Pepita, la lorita", color: "#a8f0a0",
    cielo: ["#0b1a1a", "#12303a", "#1f4a55"], dur: 46, vel: 185,
    obst: { sombra: 1.1, sigue: 0.6, viento: true, niebla: false, rayos: true, muro: false },
    ayuda: "Antes de cada rayo se enciende una columna en el cielo. ¡Sal de ahí!",
    recuerdos: [
      "¡Buenos días! cada mañana", "Silbar con la tele encendida", "Su hombro, su lugar favorito",
      "Las semillas de girasol", "Aprender a decir su nombre", "Cantar cuando él llegaba",
      "Volar por la sala", "Imitar el teléfono", "Los besitos en el pico", "El 'te quiero' de Pepita",
    ],
    intro: [
      { quien: "pepita", texto: "¡Hola! ¡Hola! ¿A dónde vamos? ¡Qué tormenta!" },
      { quien: "mouri", texto: "Los rayos avisan antes de caer, Pepita. Mira el brillo en el cielo y esquívalo." },
    ],
    fin: [
      { quien: "pepita", texto: "¡Aprendí a decir su nombre! ¡Lo diré siempre! ¡Siempre!" },
      { quien: "mouri", texto: "Y él lo oirá en su corazón. Vuela, Pepita." },
    ],
    finParcial: [
      { quien: "pepita", texto: "Se me olvidaron un par de palabras... ¡pero no su nombre!" },
      { quien: "mouri", texto: "Su nombre es lo único que importa. Ve a la luz." },
    ],
  },
  {
    n: 5, alma: "tomas", emoji: "🐢", nombre: "Tomás, la tortuga", color: "#bfe8a0",
    cielo: ["#07091a", "#161a3a", "#2a2450"], dur: 52, vel: 190,
    obst: { sombra: 1.0, sigue: 0.8, viento: true, niebla: true, rayos: true, muro: true },
    ayuda: "El Olvido viene con muros de sombras. Graznar abre un hueco. ¡Esta noche es la más larga!",
    recuerdos: [
      "Caminar despacio por el jardín", "Tomar el sol sobre una piedra", "Fresas en la mano de él",
      "Esconderse en su caparazón", "Su paciencia infinita", "Ver crecer a los niños",
      "El estanque del patio", "Treinta años juntos", "Sus ojos al despedirse", "Un 'gracias' sin palabras",
    ],
    intro: [
      { quien: "tomas", texto: "Yo siempre fui lento. ¿Llegaré a tiempo al amanecer?" },
      { quien: "narrador", texto: "El cielo se oscurece. Algo enorme se acerca desde el fondo de la noche." },
      { quien: "olvidoNoche", texto: "Treinta años de recuerdos... tantos que me costará borrarlos. Pero lo haré." },
      { quien: "mouri", texto: "No mientras yo vuele. Tomás, ¡agárrate a mi luz!" },
    ],
    fin: [
      { quien: "tomas", texto: "Caminé despacio toda mi vida y aun así fui amado. El tiempo no importa: importa quien te recuerda." },
      { quien: "mouri", texto: "Y a ti te recuerdan, Tomás. Ve, el amanecer te espera." },
    ],
    finParcial: [
      { quien: "tomas", texto: "Algunos recuerdos se quedaron en la noche... pero los más importantes vienen conmigo." },
      { quien: "mouri", texto: "Con eso basta, Tomás. Ve a la luz." },
    ],
  },
];

export const DIALOGOS_ALMAS = {
  intro: [
    { quien: "narrador", texto: "Cuando una mascota se despide, su alma queda un instante perdida en la noche." },
    { quien: "narrador", texto: "Pero hay un cuervo pequeño que las espera: Mouri." },
    { quien: "mouri", texto: "No tengan miedo. Conozco el camino hasta el amanecer. Solo sigan mi luz." },
    { quien: "narrador", texto: "El Olvido también ronda: sombras que borran los recuerdos de quien se va." },
  ],
  victoria: [
    { quien: "narrador", texto: "El amanecer se abrió, y cada alma encontró su lugar en la luz." },
    { quien: "mouri", texto: "Mientras alguien recuerde, ninguna alma se pierde." },
    { quien: "narrador", texto: "Y Mouri volvió a la noche, listo para la siguiente alma que lo necesite." },
  ],
  derrota: [
    { quien: "narrador", texto: "La luz de Mouri tembló y se apagó un instante..." },
    { quien: "mouri", texto: "Respira. Podemos intentarlo otra vez. Ninguna alma se queda atrás." },
  ],
};

export const TUTORIAL_ALMAS = [
  { icono: "👆", titulo: "Un dedo", texto: "Desliza el dedo por la pantalla y Mouri vuela. No hay botones." },
  { icono: "✨", titulo: "Recuerdos", texto: "Recoge las luces: son los recuerdos del alma que acompañas. Cada 6 te devuelven una luz de vida." },
  { icono: "🌑", titulo: "Sombras", texto: "Las sombras del Olvido te quitan luz. Esquívalas, o toca la pantalla para graznar y espantarlas." },
  { icono: "🌅", titulo: "El amanecer", texto: "Llega al final del camino para llevar a cada alma hasta la luz." },
];
