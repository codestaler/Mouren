# Mouri — modo avioncito (PC/tablet) y "guía de almas" (celular)

Tu juego anterior **no se tocó**: quedó guardado como `MiniJuegoJardin.jsx` (modo "Clásico").
`MiniJuegoMouri.jsx` sigue llamándose igual, así que **no hay que cambiar ningún import** en tu proyecto.

## Qué hace cada modo

| Aparato | Modo | Archivo |
|---|---|---|
| PC y tablet | Avioncito: Mouri vuela, dispara solo, lo mueves con el dedo/mouse (o flechas/WASD). Rayo del Recuerdo con el botón ⚡ o ESPACIO. 7 días = 7 pecados. | `MouriAvion.jsx` |
| Celular | "Mouri, guía de almas": otra historia. Un solo dedo: deslizas para volar, tocas para graznar. 5 almas de mascotas, hasta el amanecer. | `MouriAlmas.jsx` |
| Respaldo | Tu juego anterior, intacto | `MiniJuegoJardin.jsx` |

El modo se elige solo: pantalla táctil con lado corto menor a 600px = celular; todo lo demás = PC/tablet.

## Probar fácil (agrega esto al final de la dirección de la página del juego)

- `?modo=pc` · `?modo=celular` · `?modo=clasico` → fuerza un modo.
- `?modo=pc&dia=7` → empieza en el día 7. Agrega `&jefe=1` para saltar directo al jefe, y `&fase=3` para empezar en la fase 3 del Orgullo.
- `?modo=celular&alma=5` → empieza en la quinta alma (Tomás, con el Olvido).
- Abajo del juego hay 3 botoncitos para cambiar de modo. Para ocultarlos: `MOSTRAR_SELECTOR_MODO = false` en `config-avion.js`.

## Los 6 jefes — cada uno con su truco

| Día | Jefe | Lo nuevo |
|---|---|---|
| 1 | Gula | Después de tragar, **eructa en círculo**. Enfurecida lanza **comida 🍖**: hay que derribarla antes de que vuelva a su boca y la **cure**. |
| 2 | Lujuria | Deja **copias falsas** al reaparecer (disparan corazones; un tiro las deshace). |
| 3 | Pereza | **Nubes de sueño 💤** que te hacen volar lento + balas "zzz" que curvan. |
| 4 | Envidia | Manda **tu propia sombra** (copia de tu recorrido de los últimos segundos) a perseguirte; se rompe a tiros. |
| 5 | Avaricia | Lanza **monedas al aire** que caen y **rebotan en el suelo**. |
| 6 | Ira | **Géiseres de lava** desde abajo; enfurecida, los **bordes de la pantalla arden**. |

Entre oleadas hay eventos por día (corrientes de agua, lluvia de monedas, géiseres, nubes) y enemigos nuevos: **anillo giratorio** y **bombarderos**.

## El jefe final (Orgullo) — 4 fases, una sola barra de corazones

1. **El Reflejo**: espiral de 3 brazos + un **clon espejo** de Mouri que dispara en simetría; en la 2.ª mitad, espiral inversa y anillos en pinza.
2. **La Máscara**: canaliza a los 6 pecados vencidos (con su emoji en la máscara). En la **segunda mitad canaliza DOS a la vez**.
3. **El Espejo Roto**: esquirlas que rebotan, lluvia de cristales y **rayos que rebotan en las paredes** (con aviso; busca el hueco).
4. **El Olvido**: está **protegido**: recibe muy poco daño hasta que Mouri **recoja los 4 recuerdos 🌻🌹💜🌼** que caen. Cada recuerdo devuelve luz a la pantalla y rompe su escudo. Cortinas de balas con hueco.

Cada jefe y cada fase abren con un **cartel grande**. Entre fases: pequeño diálogo y +1 corazón (+2 al empezar el Olvido). Textos en `config-avion.js` (`DIALOGOS_AV`).

## Dónde cambiar cosas (todo en `config-avion.js`)

- **Vidas, velocidad de disparo, sensibilidad del dedo**: bloque `AV`.
- **Cuánto dura cada día / cuántos enemigos / qué enemigos**: `ETAPAS` (`dur`, `ritmo`, `patrones`).
- **Vida de cada jefe**: `JEFES` (`hp`). El Orgullo: `fases[].hp`.
- **Poderes que da cada flor al ganar un día**: `BENDICIONES`.
- **Textos del avioncito**: `DIALOGOS_AV`. **Textos y capítulos del celular**: `CAPITULOS_ALMAS`, `DIALOGOS_ALMAS`, `PERSONAJES_ALMAS`.
- Imágenes, fondos y música siguen en `config.js` (`ASSETS`, `DAY_BG`, `MUSICA`). Si falta un archivo, se dibuja un emoji de respaldo.
- Un jefe en particular: su comportamiento está en `avion-bosses.js` (una función por jefe).

## Archivos nuevos (copiar todos a la misma carpeta, junto a los de siempre)

`config-avion.js` · `avion-util.js` · `avion-bosses.js` · `avion-engine.js` · `avion-render.js` · `MouriAvion.jsx` ·
`almas-engine.js` · `almas-render.js` · `MouriAlmas.jsx` · `ui-comunes.jsx` · `MiniJuegoJardin.jsx` (respaldo) · `MiniJuegoMouri.jsx` (reemplaza al anterior)

Los archivos viejos (`config.js`, `helpers.js`, `audio.js`, `bosses-*.js`, `minibosses.js`, `IntroScreen.jsx`) siguen usándose y no cambiaron.
