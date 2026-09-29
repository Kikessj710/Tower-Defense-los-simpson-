# 🍩 The Simpsons Attack — Tower Defense (SOLID + TypeScript)

Proyecto de **Patrones de Software**: un tower defense de Los Simpson refactorizado
de código "stupid" a código **SOLID**, paso a paso (un commit por principio).

## Cómo ejecutarlo

```bash
npm install        # solo la primera vez (TypeScript + esbuild)
npm run build      # compila src/ -> dist/game.js y dist/login.js
npm test           # pruebas del modelo (corren en Node, sin navegador)
```

Luego abre `Login.html` en el navegador (o usa Live Server). La carpeta `dist/` ya viene compilada.

## Progreso

| Paso | Principio | Estado |
|------|-----------|--------|
| 0 | Punto de partida (JavaScript, `game.js` de 937 líneas) | ✅ en `legacy/` |
| 1 | **S** — Responsabilidad Única + migración a TypeScript | ✅ ver `docs/PASO-1-SRP.md` |
| 2 | **O** — Abierto/Cerrado | ⏳ |
| 3 | **L** — Sustitución de Liskov | ⏳ |
| 4 | **I** — Segregación de Interfaces | ⏳ |
| 5 | **D** — Inversión de Dependencias | ⏳ |

## Estructura actual

```
src/
├── config/      datos: torres, enemigos, olas, sonidos, constantes
├── core/        Emitter (eventos tipados), Point
├── structures/  CircularQueue<T>, Stack<T>
├── map/         PathMap (geometría del camino)
├── entities/    Cozy, Tower  (MODELO: solo lógica, sin DOM)
├── views/       CozyView, TowerView, ProjectileView, MapView, DamageFloatView (solo dibujan)
├── services/    VoiceService (audio)
├── game/        Game (orquestador), WaveManager, EnemyRoster, TowerRoster, TowerHistory,
│                PlacementController, PlacementRules, CombatSystem, SpecialAttack,
│                UnlockManager, PlayerState, GameLoop
├── ui/          Hud, TowerPalette, ControlPanel, MessageBoard, EndScreen, SpecialAttackView
└── main.ts      composition root (donde se crean y conectan las piezas)
legacy/          código original (para comparar antes/después)
tests/           pruebas del modelo
```
