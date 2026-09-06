# Cómo conectar el juego (no te preocupes, no hay que hacer nada raro)

## 1. Dónde poner los archivos

Copia estos 11 archivos **todos en la misma carpeta** donde antes tenías tu componente
`MiniJuegoMouri.jsx` (reemplaza el archivo viejo por el nuevo):

```
config.js
audio.js
helpers.js
minibosses.js
bosses-gula.js
bosses-lujuria.js
bosses-pereza.js
bosses-envidia.js
bosses-avaricia.js
bosses-ira.js
bosses-orgullo.js
IntroScreen.jsx
MiniJuegoMouri.jsx
```

No necesitas cambiar nada en el resto de tu proyecto: donde antes importabas
`MiniJuegoMouri`, sigue funcionando exactamente igual:

```jsx
import MiniJuegoMouri from "./MiniJuegoMouri";
```

## 2. Qué cambia respecto a tu versión anterior

- **Fondos**: cada uno de los 7 días tiene su propio fondo. Edítalos en `config.js`,
  bloque `DAY_BG`.
- **Música**: cada pecado (Gula, Lujuria, Pereza, Envidia, Avaricia, Ira, Orgullo)
  tiene su propia pista. Edítalas en `config.js`, bloque `MUSICA`.
- **Introducción**: antes del título puedes mostrar tus propias pantallas con imagen
  + texto. Se controla en `config.js`, bloque `INTRO_SLIDES`. Si lo dejas vacío
  (como está ahora), el juego pasa directo al título, igual que antes.
- **Mecánicas por jefe**: cada pecado juega distinto, cada uno en su propio archivo
  `bosses-*.js`. 🆕 Todos los mini-jefes (días 1-5) ahora tienen una **fase de
  furia** al bajar de la mitad de su vida — no cambia su identidad, pero la
  segunda mitad de cada pelea se siente claramente más intensa que la primera:
  - **Día 1 — Gula** (`bosses-gula.js`): se queda pegada al fondo, a un lado,
    mordiendo directamente la flor más sana en vez de perseguirte. En furia: se
    mueve más rápido, muerde más fuerte y dispara un abanico de 3 orbes.
  - **Día 2 — Lujuria** (`bosses-lujuria.js`): la única que de verdad *vuela* por
    todo el escenario, se teletransporta y te hechiza (invierte tus controles).
    En furia: se teletransporta más seguido, aletea más errático y lanza 2
    hechizos en vez de 1.
  - **Día 3 — Pereza** (`bosses-pereza.js`): casi no se mueve, pero sus ataques
    tienen un aviso largo y cubren mucho espacio — premia la paciencia. En
    furia: el aviso dura menos tiempo, y suma un disparo directo hacia ti.
  - **Día 4 — Envidia** (`bosses-envidia.js`, con estética de "Leviatán" marino):
    agresiva, ondula a ras de suelo, e imita con retraso tu altura. En furia:
    35% más rápida y su abanico pasa de 3 a 5 proyectiles.
  - **Día 5 — Avaricia** (`bosses-avaricia.js`): se PLANTA fija del lado derecho
    y jamás se mueve, pero ataca sin parar y roba salud de tus flores a
    distancia. En furia: roba más rápido y dispara 2 proyectiles en vez de 1.
  - **Día 6 — Ira** (`bosses-ira.js`): ¡cambia el juego por completo! Es una
    carrera de autos: usas ← → para cambiar de carril y esquivar obstáculos
    mientras la Ira te persigue por detrás. 🆕 Ahora tiene **2 fases**: a
    mitad de tiempo la Ira acelera y empiezan a aparecer "muros" que bloquean
    2 de los 3 carriles. También se arregló el hitbox: antes los obstáculos
    se veían del mismo tamaño sin importar la distancia (por eso el choque se
    sentía "random"); ahora crecen y se aclaran según se acercan, así se ve
    venir el golpe de verdad.
  - **Día 7 — Orgullo** (`bosses-orgullo.js`): el jefe final, ahora con
    **3 fases de dos tipos distintos**:
    - Fase 1 "El Reflejo" (memoria, intacta): te muestra una secuencia de
      símbolos (← → ↑ ✨) que debes repetir; falla y pierdes una vida, acierta
      rondas y le quitas sus "corazas".
    - Fase 2 "La Máscara" (🆕 combate — disparo normal): el Orgullo tiene HP
      de verdad. Te mueves, saltas y disparas con tus controles normales para
      bajarle la vida, mientras esquivas los orbes que lanza.
    - Fase 3 "El Espejo Roto" (🆕 combate — increíble/final): más HP, se mueve
      más rápido y dispara en abanico + un tiro directo apuntado a ti.
    Tus vidas usan tu HP normal (el mismo del jardín) y NO se reinician entre
    fases: es una sola pelea continua que va subiendo la exigencia. Además, la
    intro de esta pelea ahora tiene diálogos de los **6 pecados ya vencidos**
    (Gula, Lujuria, Pereza, Envidia, Avaricia, Ira) hablando antes de empezar.

## 3. 🆕 Cambios de desbloqueo (día 1 más activo)

- **Salto (↑) y disparo (ESPACIO/Z)** ahora están disponibles desde el
  **día 1**, no desde el día 2/3 como antes.
- **Sombras (mini-enemigos)** ahora también aparecen desde el día 1 —
  antes ese día no tenía ninguna. Como las sombras solo se eliminan
  disparándoles, era necesario desbloquear el disparo también desde el
  día 1 (si no, hubieran sido imposibles de quitar). Esto se ajustó en
  `helpers.js` (`canJump`, `canShoot`) y en `config.js` (bloque `DAYS`,
  día 1: `shadowRate`).

## 4. 🆕 Mejoras para celular/tablet

- **Vibración táctil** (`navigator.vibrate`) al recibir un golpe y al
  vencer un mini-jefe. En iPhone o computador simplemente no hace nada
  (esa API no existe ahí), no rompe nada.
- **Botones táctiles más grandes** (64px en vez de 56px) con animación
  de "presión" al tocarlos, para que se sientan más nativos del celular.
- **Aviso de "gira tu celular"**: en pantallas angostas en vertical
  aparece un banner discreto y cerrable sugiriendo pasar a horizontal
  (no bloquea el juego, el jugador puede seguir en vertical si prefiere).

## 5. Cosas que debes reemplazar tú (rutas de imágenes/audio)

Todas las rutas que aparecen en `config.js` (fondos, música, sprites) son
**ejemplos**. Si el archivo no existe en esa ruta, el juego simplemente no
muestra nada roto: las imágenes usan emoji de respaldo cuando no encuentran el
archivo, y la música con ruta inválida no truena, solo no suena. Ve
reemplazando cada ruta por la tuya real, poco a poco, sin miedo a romper nada.

## 6. Si quieres ajustar la dificultad

- Gula: en `bosses-gula.js`, el `1.7` es cuánto más rápida se pone en furia, y
  el `0.5` (en `mb.hp <= mb.hpMax * 0.5`) es a qué porcentaje de vida entra en
  furia.
- Carrera de autos: en `config.js`, bloque `T`, cambia `iraDur` (duración en
  segundos) o `iraVelBase`/`iraVelIra`. La Fase 2 empieza a la mitad de
  `iraDur`; para cambiar eso, edita el `0.5` en `bosses-ira.js` (busca
  `r.timer >= T.iraDur * 0.5`). La probabilidad de que salga un muro doble en
  vez de un obstáculo normal es el `0.32` justo debajo.
- Orgullo: en `config.js`, bloque `T`, cambia `orgulloRondas` (cuántas rondas
  hay que superar) y `orgulloTiempoPorSimbolo` (qué tan rápido se muestra cada
  símbolo — más chico = más difícil). Estos dos valores son los que usa la
  **Fase 1** (memoria). Las Fases 2 y 3 (combate) se ajustan aparte en
  `config.js`, bloque `ORGULLO_FASES`: ahí puedes cambiar su `hp` (vida del
  Orgullo), `velMovimiento` (qué tan rápido se desliza) y `cadenciaAtaque`
  (cada cuántos segundos dispara — más chico = ataca más seguido).
- Cualquier mini-jefe (días 1 a 5): en `config.js`, bloque `MINI_JEFES`, ajusta
  `hp`, `vel` y `ataque` de cada uno.

## 7. Si algo no prende

Lo más probable es un nombre de archivo mal copiado (revisa que estén los 13
archivos exactos, con esos nombres) o una ruta de imagen/audio que tu proyecto
no reconoce (revisa que empiece con `/` y que el archivo esté dentro de tu
carpeta `public/`). Si me compartes el error exacto que te marca la consola,
te ayudo a resolverlo.
