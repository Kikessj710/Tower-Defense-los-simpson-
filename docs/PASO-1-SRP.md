# Paso 1 — S: Principio de Responsabilidad Única (SRP)

> "Una clase debe tener una sola razón para cambiar."

## 1. Diagnóstico (el código "stupid")

`game.js` tenía **937 líneas en un solo archivo** y mezclaba: estructuras de datos, configuración,
dibujo del mapa, reglas del juego, audio, banners de UI y variables globales (`score`, `xp`,
`playerHealth`, `WAVE...`).

Las dos clases principales eran las peores:

| Clase original | Razones para cambiar (responsabilidades mezcladas) |
|---|---|
| `Cozy` | 1) estado/movimiento del enemigo 2) crear `<video>` y barra de vida en el DOM 3) reproducir su voz (en el constructor) 4) sumar `score`/`xp` globales 5) llamar a `checkUnlocks()` y `gameWin()` |
| `Tower` | 1) estadísticas y elegir objetivo 2) crear el `<video>` de la torre 3) crear y animar proyectiles con `setInterval` 4) aplicar el daño |
| `CircularQueue` | Era una cola **y además** sabía de enemigos (`isDead`, `reachedEnd` en `updateAll` y `purge`) |
| funciones globales | Colocar torres, undo/redo, olas, desbloqueos, bomba de Bart, banners, HUD... todo suelto y compartiendo globales |

## 2. Qué se hizo (antes → después)

| Responsabilidad | Antes | Ahora (una razón de cambio cada una) |
|---|---|---|
| Estado y reglas del enemigo | `Cozy` | `entities/Cozy` (solo lógica; **avisa** con eventos) |
| Dibujar al enemigo | dentro de `Cozy` | `views/CozyView` |
| Números de daño flotantes | función global | `views/DamageFloatView` |
| Estado y decisión de disparo de la torre | `Tower` | `entities/Tower` |
| Dibujar la torre | dentro de `Tower` | `views/TowerView` |
| Animar proyectil | dentro de `Tower._shoot` | `views/ProjectileView` |
| Aplicar daño de disparos | dentro de `Tower._shoot` | `game/CombatSystem` |
| Cola circular | `CircularQueue` (mezclada con enemigos) | `structures/CircularQueue<T>` genérica y pura |
| Guardar enemigos vivos | globales `cozyQueue` | `game/EnemyRoster` |
| Guardar torres activas | global `activeTowers` | `game/TowerRoster` |
| Deshacer / rehacer | globales `towerHistory/towerRedo` | `game/TowerHistory` |
| ¿Se puede colocar aquí? | dentro del handler de click | `game/PlacementRules` + `map/PathMap` |
| Flujo de colocar/undo/redo | funciones sueltas | `game/PlacementController` |
| Olas y spawn | globales + 3 funciones | `game/WaveManager` |
| Desbloqueo de torres | `checkUnlocks` global | `game/UnlockManager` |
| Bomba de Bart | funciones globales | `game/SpecialAttack` (regla) + `ui/SpecialAttackView` (botón y VFX) |
| Salud / score / XP | 3 variables globales | `game/PlayerState` |
| Game loop | función global | `game/GameLoop` |
| Audio | `reproducirVoz` global | `services/VoiceService` |
| Geometría del camino | `buildWaypoints` global | `map/PathMap` |
| Dibujar mapa/camino | `_drawPath` | `views/MapView` |
| HUD, botones, banners, pantallas finales | funciones globales | `ui/Hud`, `TowerPalette`, `ControlPanel`, `MessageBoard`, `EndScreen` |
| Datos de configuración | mezclados en game.js | `config/*` |
| Números mágicos (`15`, `30`, `300`, `950`...) | dispersos | `config/settings.ts` |
| Arrancar y conectar todo | `initGame()` + globales | `main.ts` (composition root) + `game/Game` (orquestador) |

### Ejemplo: `Cozy` antes y ahora

**Antes** — una clase, cinco razones para cambiar:
```js
_die() {
    this.isDead = true;
    score += this.reward;      // ← puntaje global
    xp    += this.reward;
    updateUI();                // ← interfaz
    checkUnlocks();            // ← desbloqueos
    ...this.vid.src = this.dieSrc; // ← DOM
    if (isFinalBoss) gameWin();    // ← flujo del juego
}
```

**Después** — el enemigo solo avisa; cada quien reacciona en su clase:
```ts
// entities/Cozy.ts   (lógica)
this.isDead = true;
this.events.emit("died", this);

// views/CozyView.ts  (dibujo)     → reproduce la animación de muerte
// game/Game.ts       (orquestador) → player.addReward(), unlocks.check(), win()
```

## 3. Beneficios comprobables

- **`game.js`: 937 líneas → 38 archivos**, 33 de ellos con menos de 80 líneas.
- **Sin variables globales**: el estado vive en `PlayerState`, `WaveManager`, `TowerRoster`...
- **Se puede probar sin navegador**: `npm test` ejecuta 10 pruebas del modelo en Node
  (imposible antes, porque `Cozy` y `Tower` tocaban el DOM en cada método).
- **Tipado estricto** (`strict: true`): el compilador detecta errores antes de ejecutar.

## 4. Pequeños cambios de comportamiento (intencionales)

1. La voz del enemigo suena **cuando aparece** en el mapa. Antes sonaba al *crear* toda la ola
   de golpe (todas las voces juntas al inicio de la ola).
2. Al terminar la partida también se cancela el temporizador de la siguiente ola
   (antes solo el de spawn).

## 5. Lo que queda pendiente para los siguientes pasos (a propósito)

Aún quedan "olores" que corresponden a otros principios; no se tocaron para no mezclar pasos:

- `Game.ts` tiene `if (key === "bart")`, `cfgKey === "flanders"` y `type === "boss" ? 30 : 15` → **O**.
- Agregar una torre nueva todavía obliga a tocar varios archivos → **O**.
- El objetivo de las torres siempre es "el más adelantado" y está fijo dentro de `Tower` → **O**.
- Las clases crean sus dependencias concretas (`new VoiceService()`, etc.) en `main.ts` y las
  reciben como clases, no como interfaces → **D** (y **I** para definir interfaces pequeñas).
