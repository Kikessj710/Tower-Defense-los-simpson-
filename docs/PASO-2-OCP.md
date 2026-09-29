# Paso 2 — O: Principio Abierto/Cerrado (OCP)

> "Las clases deben estar **abiertas a extensión** pero **cerradas a modificación**."
> Agregar comportamiento nuevo = escribir código nuevo, no editar código que ya funciona.

## 1. Diagnóstico (los "olores" que dejó el paso 1)

| # | Olor | Dónde estaba | Qué obligaba a modificar |
|---|------|--------------|--------------------------|
| 1 | `if (key === "bart") ensureButton()` | `Game.ts` | editar `Game` por cada torre con habilidad |
| 2 | `if (c.cfgKey === "flanders") win()` | `Game.ts` | editar `Game` para otro jefe final |
| 3 | `cozy.type === "boss" ? 30 : 15` | `Game.ts` | editar `Game` para un enemigo con otro daño |
| 4 | `c.type === "boss" ? bosses : normal` | `WaveManager.ts` | editar `WaveManager` para otro orden de salida |
| 5 | Elegir objetivo "el más adelantado" fijo en `Tower.update` | `Tower.ts` | editar `Tower` para otra forma de apuntar |
| 6 | `slow: boolean` + `takeDamage(amount, slow)` + `0.45` / `130` fijos | `Tower`, `CombatSystem`, `Cozy` | editar 3 clases para un efecto nuevo (veneno, aturdir...) |
| 7 | Una torre nueva = tocar `TOWER_TYPES` + `TOWER_CONFIG` + `VOICE_FILES` | `config/*` | editar 3 listas y mantenerlas sincronizadas |
| 8 | `"DIABLO FLANDERS"` escrito dentro del banner | `MessageBoard.ts` | editar la UI para otro jefe |

## 2. Qué se hizo (antes → después)

| Variación | Antes | Ahora (abstracción que la absorbe) |
|---|---|---|
| Cómo apunta una torre | fijo dentro de `Tower` | interfaz **`TargetingStrategy`** → `FurthestAlongPath`, `StrongestTarget` (Strategy) |
| Qué efecto deja un disparo | `slow: boolean` con `if` | interfaz **`HitEffect`** → `SlowEffect` (lista `effects` por torre) |
| Reglas por enemigo | `if (tipo === "boss")`, `if (=== "flanders")` | campos en `EnemyConfig`: `leakDamage`, `spawnsLast`, `winsOnDeath`, `voice` |
| Habilidad al desbloquear | `if (key === "bart")` | mapa **`unlockHooks`** registrado en `main.ts` |
| Voces | tabla aparte `voices.ts` | campo `voice` dentro de cada torre / enemigo (se eliminó `voices.ts`) |
| Listas de tipos | `TOWER_TYPES`, `ENEMY_TYPES` escritas a mano | se **derivan** de la config: `Object.keys(TOWER_CONFIG)` |
| Nombre del jefe en el banner | texto fijo | `WaveDesign.bossName` |

### Ejemplo: apuntado, antes y ahora

**Antes** — para cambiar la regla había que abrir `Tower`:
```ts
for (const e of enemies) {
    if (... <= this.range && e.wpIndex > bestWP) { target = e; bestWP = e.wpIndex; }
}
```

**Después** — `Tower` solo delega; una regla nueva es una clase nueva:
```ts
// game/targeting/StrongestTarget.ts  (archivo NUEVO, nada existente cambia)
export class StrongestTarget implements TargetingStrategy {
    pick(origin, range, enemies) { /* el de más vida en rango */ }
}
// entities/Tower.ts
const target = this.targeting.pick(this, this.range, enemies);
```

## 3. "Receta": cómo extender ahora

**Nueva torre "Ned"** (que ralentiza y apunta al más fuerte) → solo se agrega una entrada en `config/towers.ts`:
```ts
ned: { name: "Ned", icon: "🙏", damage: 30, range: 120, delay: 40, unlockXP: 2000,
       sprite: "...", projectile: "...", voice: "sonidos/ned.mp3",
       targeting: new StrongestTarget(), effects: [new SlowEffect(0.6, 90)], desc: "..." },
```
Se desbloquea, aparece en la paleta, suena su voz, apunta y ralentiza: **0 archivos existentes modificados** (aparte de `config`).

**Nuevo efecto "Veneno"** → 1 clase nueva `PoisonEffect implements HitEffect`. No se toca `Tower`, `CombatSystem` ni `Cozy`.

**Nuevo enemigo mini-jefe** → 1 entrada en `config/enemies.ts` con `spawnsLast: true, leakDamage: 20`. `Game` y `WaveManager` no cambian.

**Nueva habilidad al desbloquear** → 1 línea en el `Map` de `unlockHooks` en `main.ts` (el composition root es el lugar legítimo para "cablear").

## 4. Pruebas (`npm test`: 16 en total, 6 nuevas)

- `Tower` acepta una estrategia inventada en la propia prueba (prueba viva de OCP).
- Un `HitEffect` nuevo funciona sin tocar `Cozy` ni `CombatSystem`.
- `SlowEffect` ralentiza y expira.
- El comportamiento de jefes/enemigos sale de la config.
- Las listas de tipos se derivan de la config.

## 5. Cambios de comportamiento

Ninguno en el juego (mismos números: 0.45 de velocidad, 130 ticks, 15/30 de daño...).
Único detalle: ya no se imprime el `console.warn` "No hay sonido asignado" para Skinner y Flanders (no tienen voz; ahora `voice` es opcional).

## 6. Pendiente para los siguientes pasos (a propósito)

- `Cozy.slowDown()` y `SpecialAttack` (bomba de Bart) siguen siendo clases concretas → se revisan en **L** e **I**.
- `Game` recibe `GameParts` con clases concretas y `MessageBoard` importa `WaveInfo` de `game/` → **D** (inversión de dependencias) e **I** (interfaces pequeñas).
- `PlacementRules` tiene el `55` de distancia mínima fijo → candidato a config/regla intercambiable.
