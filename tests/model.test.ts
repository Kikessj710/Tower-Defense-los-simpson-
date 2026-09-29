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

console.log(`\n${passed} pruebas OK`);
