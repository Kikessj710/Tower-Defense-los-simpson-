# Paso 3 — I & D: Segregación de Interfaces e Inversión de Dependencias

> **I - Segregación de Interfaces (ISP):** "Ningún cliente debería verse obligado a depender de métodos que no usa."
> **D - Inversión de Dependencias (DIP):** "Depender de abstracciones (interfaces), no de clases concretas."

## 1. Diagnóstico (los "olores" que dejó el paso 2)

| # | Olor | Dónde estaba | Por qué viola SOLID |
|---|------|--------------|---------------------|
| 1 | `Game` y `PlacementController` importaban clases de UI concretas (`MessageBoard`, `VoiceService`, etc.) | Capa de `game/` | **D**: La lógica del juego dependía de detalles de infraestructura y presentación. |
| 2 | `GameParts` exigía dependencias concretas para construir `Game` | `Game.ts` | **I**: `Game` recibía objetos muy grandes (como `MessageBoard`) y dependía de todos sus métodos, aunque usara pocos. |
| 3 | `Game` instanciaba explícitamente `new CozyView(...)` | `Game.ts` | **D**: Acoplamiento fuerte entre lógica (`Game`) y dibujo (`CozyView`). Imposibilita pruebas limpias sin DOM. |
| 4 | `PlacementController` usaba `panel` y `mapView`, pero solo 1 o 2 métodos de cada uno | `PlacementController.ts` | **I**: Recibía clases gigantes y se acoplaba a toda su API. |

## 2. Qué se hizo (antes → después)

| Variación | Antes (Implementación concreta) | Ahora (Puertos/Interfaces) |
|---|---|---|
| Interacción con UI (Banner/Toast) | `MessageBoard` | `ToastPort`, `WaveBannerPort`, `StoryBannerPort`, `UnlockNotifier` |
| Interacción con Mapa | `MapView` | `GameMapSurface`, `PlacementMapSurface` |
| Creación de Vistas de Torre | `new TowerView(...)` en `TowerRoster` | `TowerViewFactory` |
| Creación de Vistas de Enemigos | `new CozyView(...)` en `Game` | `CozyViewFactory` |
| Reproducción de Audio | `VoiceService` | `VoicePlayer` |
| Lanzamiento de Proyectiles | `ProjectileView` | `ProjectileLauncher` |
| Visualización de Pantalla Final | `EndScreen` | `EndScreenPort` |

### Ejemplo: `PlacementController`, antes y ahora

**Antes** — Dependía fuertemente de clases concretas y pesadas:
```ts
constructor(
    private readonly map: MapView,
    private readonly panel: ControlPanel,
    private readonly messages: MessageBoard,
    private readonly voice: VoiceService,
    // ...
)
```

**Después** — Depende solo de lo que verdaderamente necesita a través de interfaces segregadas (`src/game/ports/`):
```ts
constructor(
    private readonly map: PlacementMapSurface,
    private readonly panel: ControlsPort,
    private readonly messages: ToastPort,
    private readonly voice: VoicePlayer,
    // ...
)
```

## 3. "Receta": cómo extender ahora

**Cambiar la implementación de audio (ej: usar una librería externa o un mock para pruebas)**
Basta con crear una nueva clase que implemente `VoicePlayer`:
```ts
export class HowlerVoiceService implements VoicePlayer {
    play(file: string | undefined): void {
        // Implementación con otra librería
    }
}
```
Y sustituirla únicamente en `main.ts` (el *Composition Root*). **Cero modificaciones** a la lógica del juego.

**Probar `Game` sin necesidad de DOM**
Se pueden inyectar fakes simples que cumplan las interfaces (como un `CozyViewFactory` de prueba que no requiere `HTMLElement`), evitando tener que mockear todo el DOM.

## 4. Pruebas (`npm test`: 20 en total, 4 nuevas)

Se agregaron pruebas limpias en `tests/dip.test.ts` que **NO usan DOM**:
- `CombatSystem` con un `ProjectileLauncher` falso que resuelve el impacto de inmediato.
- `PlacementController` con fakes de controles, mapa y toasts.
- `Game` reaccionando correctamente a eventos de los enemigos (muerte o escape).
- Prueba demostrativa del reemplazo de implementaciones múltiples para la misma interfaz (`VoicePlayer`).

## 5. Cambios de comportamiento

**Ninguno.** El comportamiento del juego es idéntico; se trata estrictamente de un refactor estructural.

## 6. Principio L (Sustitución de Liskov) - ¿Por qué no aplica aquí?

El proyecto no implementa jerarquías de herencia (no existe `class Boss extends Cozy` o `class SlowTower extends Tower`). 
En este diseño, la variabilidad se maneja mediante **composición** (Strategy, configs) y mediante **interfaces** que cumplen los contratos. Liskov aplica principalmente cuando se usan clases base y subclases, donde una subclase no debe romper el contrato de su clase base. Al usar directamente interfaces segregadas, cada implementación cumple su contrato explícitamente y es totalmente intercambiable, asegurando el correcto diseño del software sin requerir jerarquías complejas.
