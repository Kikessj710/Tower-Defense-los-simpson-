/**
 * Pruebas del MODELO. Corren en Node, SIN navegador ni DOM.
 * Esto solo es posible porque tras aplicar SRP las clases de lógica
 * (Cozy, Tower, CircularQueue...) ya no mezclan lógica con dibujo.
 */
import assert from "node:assert/strict";
import { CircularQueue } from "../src/structures/CircularQueue";
import { Cozy } from "../src/entities/Cozy";
import { Tower } from "../src/entities/Tower";
import { PathMap } from "../src/map/PathMap";
import { PlacementRules } from "../src/game/PlacementRules";
import { PlayerState } from "../src/game/PlayerState";
import { TowerHistory } from "../src/game/TowerHistory";
import { UnlockManager } from "../src/game/UnlockManager";
import { TOWER_CONFIG, TOWER_TYPES } from "../src/config/towers";
import { COZY_CONFIG, ENEMY_TYPES } from "../src/config/enemies";
import { SlowEffect } from "../src/game/effects/SlowEffect";
import { HitEffect } from "../src/game/effects/HitEffect";
import { StrongestTarget } from "../src/game/targeting/StrongestTarget";
import { TargetingStrategy } from "../src/game/targeting/TargetingStrategy";

let passed = 0;
function test(name: string, fn: () => void): void {
    fn();
    passed++;
    console.log("  ✔", name);
}

const path = new PathMap(900, 500);

console.log("CircularQueue");
test("encola, desencola y respeta la capacidad", () => {
    const q = new CircularQueue<number>(3);
    assert.ok(q.enqueue(1) && q.enqueue(2) && q.enqueue(3));
    assert.equal(q.enqueue(4), false);
    assert.equal(q.dequeue(), 1);
    assert.ok(q.enqueue(4));
    assert.deepEqual(q.toArray(), [2, 3, 4]);
});
test("removeWhere saca solo lo que cumple el predicado", () => {
    const q = new CircularQueue<number>(5);
    [1, 2, 3, 4].forEach(n => q.enqueue(n));
    q.removeWhere(n => n % 2 === 0);
    assert.deepEqual(q.toArray(), [1, 3]);
});

console.log("Cozy (enemigo)");
test("avanza por los waypoints y avisa con eventos", () => {
    const c = new Cozy("burns", 0, 0, path.start);
    let moved = 0;
    c.events.on("moved", () => moved++);
    c.step(path.waypoints);
    assert.equal(moved, 1);
    assert.ok(c.x > path.start.x);
});
test("muere al llegar a 0 de vida y emite 'died' una sola vez", () => {
    const c = new Cozy("burns", 0, 0, path.start);
    let died = 0;
    c.events.on("died", () => died++);
    c.takeDamage(1000);
    c.takeDamage(1000);
    assert.equal(c.isDead, true);
    assert.equal(died, 1);
});
test("llega al final y emite 'reachedEnd'", () => {
    const c = new Cozy("kodos", 0, 0, path.start);
    let ended = false;
    c.events.on("reachedEnd", () => { ended = true; });
    for (let i = 0; i < 5000 && !c.reachedEnd; i++) c.step(path.waypoints);
    assert.equal(ended, true);
});

console.log("Tower (torre)");
test("dispara al enemigo más avanzado dentro del rango y respeta el cooldown", () => {
    const tower = new Tower("homero", 100, 100, 60, 60);
    const near = new Cozy("burns", 0, 0, { x: 100, y: 150 });
    const ahead = new Cozy("burns", 0, 0, { x: 100, y: 160 });
    ahead.wpIndex = 3;
    const far = new Cozy("burns", 0, 0, { x: 900, y: 900 });
    assert.equal(tower.update([near, ahead, far]), ahead);
    assert.equal(tower.update([near, ahead, far]), null); // en cooldown
});

console.log("Reglas de colocación");
test("rechaza el camino y las torres encimadas, acepta un lugar libre", () => {
    const rules = new PlacementRules(path);
    const existing = new Tower("homero", 210, 210, 180, 180);
    assert.equal(rules.check(path.waypoints[1].x - 100, path.waypoints[1].y, []).ok, false);
    assert.equal(rules.check(215, 215, [existing]).ok, false);
    assert.equal(rules.check(750, 300, [existing]).ok, true);
});

console.log("Historial y desbloqueos");
test("undo / redo con dos pilas", () => {
    const h = new TowerHistory();
    const t = new Tower("homero", 1, 1, 0, 0);
    h.record(t);
    assert.equal(h.undo(), t);
    assert.equal(h.undo(), null);
    assert.equal(h.redo(), t);
});
test("las torres se desbloquean según el XP", () => {
    const u = new UnlockManager();
    assert.deepEqual(u.check(499), []);
    assert.deepEqual(u.check(500), ["lisa"]);
    assert.deepEqual(u.check(1500), ["marge", "bart"]);
    assert.equal(u.latest, "bart");
});
test("el jugador acumula score/XP y muere sin salud", () => {
    const p = new PlayerState();
    p.addReward(150);
    assert.equal(p.score, 150);
    assert.equal(p.xp, 150);
    p.takeDamage(100);
    assert.equal(p.isDead, true);
});

console.log("OCP: extender sin modificar");
test("Tower acepta una estrategia de apuntado nueva sin cambiar Tower", () => {
    const weak = new Cozy("burns", 0, 0, { x: 100, y: 150 });
    const tank = new Cozy("skinner", 0, 0, { x: 100, y: 160 });
    const strongest = new Tower("homero", 100, 100, 60, 60, new StrongestTarget());
    assert.equal(strongest.update([weak, tank]), tank);

    // Una estrategia inventada aquí mismo, en la prueba: "el primero de la lista".
    const first: TargetingStrategy = { pick: (_o, _r, list) => list[0] ?? null };
    assert.equal(new Tower("homero", 100, 100, 60, 60, first).update([weak, tank]), weak);
});
test("un HitEffect nuevo funciona sin tocar Cozy ni CombatSystem", () => {
    const c = new Cozy("burns", 0, 0, path.start);
    const marked: string[] = [];
    const mark: HitEffect = { apply: (t) => marked.push(t.name) };
    mark.apply(c);
    assert.deepEqual(marked, ["Sr. Burns"]);
});
test("SlowEffect ralentiza al enemigo y el efecto expira", () => {
    const normal = new Cozy("burns", 0, 0, path.start);
    const slowed = new Cozy("burns", 0, 0, path.start);
    new SlowEffect(0.45, 3).apply(slowed);
    normal.step(path.waypoints);
    slowed.step(path.waypoints);
    const dNormal = Math.hypot(normal.x - path.start.x, normal.y - path.start.y);
    const dSlowed = Math.hypot(slowed.x - path.start.x, slowed.y - path.start.y);
    assert.ok(Math.abs(dSlowed - dNormal * 0.45) < 1e-9);
    for (let i = 0; i < 5; i++) slowed.step(path.waypoints); // expira tras 3 ticks
    const before = { x: slowed.x, y: slowed.y };
    slowed.step(path.waypoints);
    assert.ok(Math.abs(Math.hypot(slowed.x - before.x, slowed.y - before.y) - slowed.speed) < 1e-9);
});
test("Marge ralentiza (viene de su config); Homero no", () => {
    assert.equal(TOWER_CONFIG.marge.effects.length, 1);
    assert.equal(TOWER_CONFIG.homero.effects.length, 0);
});
test("el comportamiento de los enemigos sale de su config, no de `if (tipo)`", () => {
    const boss = new Cozy("flanders", 0, 0, path.start);
    const grunt = new Cozy("burns", 0, 0, path.start);
    assert.deepEqual([boss.leakDamage, boss.spawnsLast, boss.winsOnDeath], [30, true, true]);
    assert.deepEqual([grunt.leakDamage, grunt.spawnsLast, grunt.winsOnDeath], [15, false, false]);
});
test("las listas de tipos se derivan de la config (no hay que mantenerlas a mano)", () => {
    assert.deepEqual(TOWER_TYPES, Object.keys(TOWER_CONFIG));
    assert.deepEqual(ENEMY_TYPES, Object.keys(COZY_CONFIG));
    assert.deepEqual(TOWER_TYPES, ["homero", "lisa", "marge", "bart"]);
});

console.log(`\n${passed} pruebas OK`);
