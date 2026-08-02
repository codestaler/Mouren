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
  `bosses-*.js`:
  - **Día 1 — Gula** (`bosses-gula.js`): se queda pegada al fondo, a un lado,
    mordiendo directamente la flor más sana en vez de perseguirte.
  - **Día 2 — Lujuria** (`bosses-lujuria.js`): la única que de verdad *vuela* por
    todo el escenario, se teletransporta y te hechiza (invierte tus controles).
  - **Día 3 — Pereza** (`bosses-pereza.js`): casi no se mueve, pero sus ataques
    tienen un aviso largo y cubren mucho espacio — premia la paciencia.
  - **Día 4 — Envidia** (`bosses-envidia.js`, con estética de "Leviatán" marino):
    agresiva, ondula a ras de suelo, e imita con retraso tu altura.
  - **Día 5 — Avaricia** (`bosses-avaricia.js`): se PLANTA fija del lado derecho
    y jamás se mueve, pero ataca sin parar y roba salud de tus flores a distancia.
  - **Día 6 — Ira** (`bosses-ira.js`): ¡cambia el juego por completo! Es una
    carrera de autos: usas ← → para cambiar de carril y esquivar obstáculos
    mientras la Ira te persigue por detrás.
  - **Día 7 — Orgullo** (`bosses-orgullo.js`): jefe final que no se vence a
    golpes. Te muestra una secuencia de símbolos (← → ↑ ✨) que debes repetir de
    memoria; falla y pierdes una vida, acierta rondas y le quitas sus "corazas".

## 3. Cosas que debes reemplazar tú (rutas de imágenes/audio)

Todas las rutas que aparecen en `config.js` (fondos, música, sprites) son
**ejemplos**. Si el archivo no existe en esa ruta, el juego simplemente no
muestra nada roto: las imágenes usan emoji de respaldo cuando no encuentran el
archivo, y la música con ruta inválida no truena, solo no suena. Ve
reemplazando cada ruta por la tuya real, poco a poco, sin miedo a romper nada.

## 4. Si quieres ajustar la dificultad

- Carrera de autos: en `config.js`, bloque `T`, cambia `iraDur` (duración en
  segundos) o `iraVelBase`/`iraVelIra`.
- Orgullo: en `config.js`, bloque `T`, cambia `orgulloRondas` (cuántas rondas
  hay que superar) y `orgulloTiempoPorSimbolo` (qué tan rápido se muestra cada
  símbolo — más chico = más difícil).
- Cualquier mini-jefe (días 1 a 5): en `config.js`, bloque `MINI_JEFES`, ajusta
  `hp`, `vel` y `ataque` de cada uno.

## 5. Si algo no prende

Lo más probable es un nombre de archivo mal copiado (revisa que estén los 13
archivos exactos, con esos nombres) o una ruta de imagen/audio que tu proyecto
no reconoce (revisa que empiece con `/` y que el archivo esté dentro de tu
carpeta `public/`). Si me compartes el error exacto que te marca la consola,
te ayudo a resolverlo.
