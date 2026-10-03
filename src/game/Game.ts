import { INTRO_BANNER_MS } from "../config/settings";
import { TOWER_CONFIG, TowerKey } from "../config/towers";
import { Cozy } from "../entities/Cozy";
import { PathMap } from "../map/PathMap";
import { VoicePlayer } from "./ports/AudioPorts";
import { ControlsPort, EndScreenPort, HudPort, PalettePort, StoryBannerPort, UnlockNotifier, WaveBannerPort } from "./ports/UIPorts";
import { CozyViewFactory, GameMapSurface } from "./ports/ViewPorts";
import { CombatSystem } from "./CombatSystem";
import { EnemyRoster } from "./EnemyRoster";
import { GameLoop } from "./GameLoop";
import { PlacementController } from "./PlacementController";
import { PlayerState } from "./PlayerState";
import { SpecialAttack } from "./SpecialAttack";
import { TowerRoster } from "./TowerRoster";
import { UnlockManager } from "./UnlockManager";
import { WaveManager } from "./WaveManager";

export interface GameParts {
    path: PathMap;
    player: PlayerState;
    unlocks: UnlockManager;
    enemies: EnemyRoster;
    towers: TowerRoster;
    waves: WaveManager;
    combat: CombatSystem;
    special: SpecialAttack;
    placement: PlacementController;
    loop: GameLoop;
    voice: VoicePlayer;
    mapView: GameMapSurface;
    hud: HudPort;
    palette: PalettePort;
    panel: ControlsPort;
    messages: WaveBannerPort & StoryBannerPort & UnlockNotifier;
    endScreen: EndScreenPort;
    cozyFactory: CozyViewFactory;
    /** Qué hacer al desbloquear cada torre (p. ej. Bart habilita su bomba). Se registra en main.ts. */
    unlockHooks: ReadonlyMap<TowerKey, () => void>;
}

/**
 * Responsabilidad ÚNICA: ORQUESTAR. Conecta las piezas y aplica las reglas
 * de alto nivel (qué pasa cuando un enemigo muere, llega al final, se gana o se pierde).
 * No dibuja, no reproduce audio, no calcula geometría: delega en las demás clases.
 */
export class Game {
    private running = true;

    constructor(private readonly p: GameParts) {
        p.waves.events.on("waveStarted", (info) => {
            p.hud.render(p.player, p.waves.currentWave, p.waves.totalWaves);
            p.messages.showWaveBanner(info.waveNumber, p.waves.totalWaves, info.total, info.isFinal, info.label, info.bossName);
        });
        p.waves.events.on("cozySpawned", (cozy) => this.onCozySpawned(cozy));
    }

    start(): void {
        const p = this.p;
        p.mapView.clear();
        p.mapView.drawPath(p.path);
        p.panel.bind({
            onTogglePlace: () => p.placement.toggle(p.unlocks.latest),
            onUndo: () => p.placement.undo(),
            onRedo: () => p.placement.redo(),
        });
        p.palette.render(p.unlocks.all);
        p.hud.render(p.player, p.waves.currentWave, p.waves.totalWaves);

        p.messages.showStoryBanner(
            "🍩 ¡Springfield necesita tu ayuda!",
            "Sr. Burns lidera el ataque con sus secuaces.<br>Coloca a <b>Homero</b> en una torre y defiende la ciudad.<br>¡Elimina Cozy para desbloquear nuevos personajes!",
            INTRO_BANNER_MS,
            () => p.waves.startNextWave(),
        );
        p.loop.start(() => this.update());
    }

    /** Botón de la bomba de Bart. */
    useSpecialAttack(): void {
        if (!this.running) return;
        this.p.special.trigger(this.p.enemies.toArray());
    }

    private update(): void {
        const p = this.p;
        p.enemies.stepAll(p.path.waypoints);
        p.enemies.purge();
        p.combat.update(p.towers.towers, p.enemies.toArray());
        p.waves.update(p.enemies.count);
    }

    private onCozySpawned(cozy: Cozy): void {
        const p = this.p;
        const view = p.cozyFactory.create(cozy);
        p.enemies.add(cozy);
        p.voice.play(cozy.voice);

        cozy.events.on("died", (c) => this.onCozyDied(c));
        cozy.events.on("reachedEnd", (c) => this.onCozyReachedEnd(c));
        view.events.on("deathAnimationEnded", (c) => {
            if (c.winsOnDeath) this.win();
        });
    }

    private onCozyDied(cozy: Cozy): void {
        const p = this.p;
        p.player.addReward(cozy.reward);
        p.hud.render(p.player, p.waves.currentWave, p.waves.totalWaves);

        const newlyUnlocked = p.unlocks.check(p.player.xp);
        for (const key of newlyUnlocked) {
            p.messages.showUnlock(TOWER_CONFIG[key]);
            p.unlockHooks.get(key)?.();
        }
        if (newlyUnlocked.length > 0) p.palette.render(p.unlocks.all);
    }

    private onCozyReachedEnd(cozy: Cozy): void {
        const p = this.p;
        p.player.takeDamage(cozy.leakDamage);
        p.hud.render(p.player, p.waves.currentWave, p.waves.totalWaves);
        if (p.player.isDead) this.gameOver();
    }

    private stopEverything(): boolean {
        if (!this.running) return false;
        this.running = false;
        this.p.loop.stop();
        this.p.waves.stop();
        this.p.placement.setEnabled(false);
        return true;
    }

    private gameOver(): void {
        if (!this.stopEverything()) return;
        this.p.endScreen.showGameOver(this.p.player.score, this.p.waves.currentWave, this.p.waves.totalWaves);
    }

    private win(): void {
        if (!this.stopEverything()) return;
        this.p.endScreen.showVictory(this.p.player.score, this.p.waves.totalWaves);
    }
}
