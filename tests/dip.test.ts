import assert from "node:assert/strict";
import { CombatSystem } from "../src/game/CombatSystem";
import { Tower } from "../src/entities/Tower";
import { Cozy } from "../src/entities/Cozy";
import { ProjectileLauncher, GameMapSurface } from "../src/game/ports/ViewPorts";
import { PlacementController } from "../src/game/PlacementController";
import { PlacementRules } from "../src/game/PlacementRules";
import { TowerRoster } from "../src/game/TowerRoster";
import { TowerHistory } from "../src/game/TowerHistory";
import { ControlsPort, ToastPort, HudPort, PalettePort, EndScreenPort } from "../src/game/ports/UIPorts";
import { VoicePlayer } from "../src/game/ports/AudioPorts";
import { PathMap } from "../src/map/PathMap";
import { Game } from "../src/game/Game";
import { PlayerState } from "../src/game/PlayerState";
import { UnlockManager } from "../src/game/UnlockManager";
import { EnemyRoster } from "../src/game/EnemyRoster";
import { WaveManager } from "../src/game/WaveManager";
import { SpecialAttack } from "../src/game/SpecialAttack";
import { GameLoop } from "../src/game/GameLoop";
import { TowerKey } from "../src/config/towers";

let passed = 0;
function test(name: string, fn: () => void): void {
    fn();
    passed++;
    console.log("  ✔", name);
}

console.log("DIP: Pruebas con puertos y fakes");

test("CombatSystem funciona con un ProjectileLauncher falso", () => {
    const fakeLauncher: ProjectileLauncher = {
        launch: (_from, _target, _src, onArrive) => onArrive()
    };
    const combat = new CombatSystem(fakeLauncher);
    
    const marge = new Tower("marge", 100, 100, 60, 60);
    const path = new PathMap(900, 500);
    const enemy = new Cozy("burns", 0, 0, path.start); 
    const initialHp = enemy.hp;
    
    // Lo movemos para que entre en rango (Marge está en 100, 100 y rango 130)
    enemy.x = 100;
    enemy.y = 120;

    combat.update([marge], [enemy]);
    
    assert.equal(enemy.hp, initialHp - marge.damage);

    // Marge aplica SlowEffect(0.5). Comprobamos que el paso es más corto.
    const beforeX = enemy.x;
    enemy.step(path.waypoints);
    const stepDist = Math.hypot(enemy.x - beforeX, enemy.y - 120);
    assert.ok(stepDist < enemy.speed);
});

test("PlacementController con fakes (colocar, undo, redo, rechazo)", () => {
    const path = new PathMap(900, 500);
    const rules = new PlacementRules(path);
    const roster = new TowerRoster({ create: () => ({ show: ()=>{}, hide: ()=>{} }) });
    const history = new TowerHistory();

    const msgs: string[] = [];
    const toasts: ToastPort = { showToast: (msg) => msgs.push(msg) };
    const voice: VoicePlayer = { play: () => {} };
    
    let clicked: (x: number, y: number) => void;
    let cursor = "default";
    const mapSurface = {
        onClick: (handler: any) => clicked = handler,
        setCursor: (c: string) => cursor = c
    };
    
    let placingText = null as string | null;
    const panel: ControlsPort = {
        bind: () => {},
        showPlacing: (text) => placingText = text
    };

    const ctrl = new PlacementController(mapSurface, panel, rules, roster, history, toasts, voice);

    ctrl.enter("homero");
    assert.equal(cursor, "crosshair");
    assert.ok(placingText?.includes("Homero"));

    clicked!(path.waypoints[0].x, path.waypoints[0].y); // camino
    assert.ok(msgs.length > 0);
    assert.equal(roster.towers.length, 0);

    clicked!(500, 500); // válido
    assert.equal(roster.towers.length, 1);
    assert.equal(cursor, "default"); 

    ctrl.undo();
    assert.equal(roster.towers.length, 0);
    ctrl.redo();
    assert.equal(roster.towers.length, 1);
});

test("Game reacciona a muerte o escape de enemigos usando fakes", () => {
    const path = new PathMap(900, 500);
    const player = new PlayerState();
    const unlocks = new UnlockManager();
    const enemies = new EnemyRoster(10);
    const towers = new TowerRoster({ create: () => ({ show: ()=>{}, hide: ()=>{} }) });
    const waves = new WaveManager([], path);
    const combat = new CombatSystem({ launch: () => {} });
    const special = new SpecialAttack();
    
    const messages: any = { showWaveBanner: ()=>{}, showStoryBanner: ()=>{}, showUnlock: ()=>{} };
    const endScreen: any = { showGameOver: ()=>{ isGameOver = true; }, showVictory: ()=>{} };
    const hud: HudPort = { render: ()=>{} };
    const palette: PalettePort = { render: ()=>{} };
    const panel: ControlsPort = { bind: ()=>{}, showPlacing: ()=>{} };
    const voice: VoicePlayer = { play: ()=>{} };
    const mapView: GameMapSurface = { clear: ()=>{}, drawPath: ()=>{} };
    const loop = new GameLoop();
    let isGameOver = false;
    let bartHookCalled = false;

    // Mock para Node
    (global as any).requestAnimationFrame = () => {};

    const placement = new PlacementController(
        { onClick: ()=>{}, setCursor: ()=>{} }, panel, new PlacementRules(path), towers, new TowerHistory(), messages, voice
    );

    const game = new Game({
        path, player, unlocks, enemies, towers, waves, combat, special, placement, loop, voice,
        mapView, hud, palette, panel, messages, endScreen,
        cozyFactory: { create: () => ({ events: { on: ()=>{} } as any }) },
        unlockHooks: new Map<TowerKey, () => void>([["bart", () => { bartHookCalled = true; }]])
    });

    game.start();

    // Simular que el WaveManager hizo aparecer un enemigo
    const c = new Cozy("burns", 0, 0, path.start);
    waves.events.emit("cozySpawned", c);

    // Muerte
    player.xp = 1450; // a los 1500 desbloquea a bart
    c.takeDamage(1000); 
    assert.equal(player.score, c.reward);
    assert.ok(bartHookCalled); // 1450 + reward(50) = 1500, unlock de bart

    // Escape
    const c2 = new Cozy("burns", 0, 0, path.start);
    waves.events.emit("cozySpawned", c2);
    player.health = c2.leakDamage;
    c2.events.emit("reachedEnd", c2);
    assert.equal(player.isDead, true);
    assert.ok(isGameOver);

    delete (global as any).requestAnimationFrame;
});

test("Reemplazo de implementación (VoicePlayer)", () => {
    let playedA = false;
    const implA: VoicePlayer = { play: () => playedA = true };
    
    let playedB = false;
    const implB: VoicePlayer = { play: () => playedB = true };

    implA.play("test.mp3");
    implB.play("test.mp3");
    
    assert.ok(playedA);
    assert.ok(playedB);
});

console.log(`\n${passed} pruebas de DIP OK`);
