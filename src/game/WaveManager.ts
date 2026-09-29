import { Emitter } from "../core/Emitter";
import { Cozy } from "../entities/Cozy";
import { PathMap } from "../map/PathMap";
import { WaveDesign } from "../config/waves";
import { DIFFICULTY, SPAWN_INTERVAL, WAVE_BREAK_MS } from "../config/settings";

export interface WaveInfo { waveNumber: number; total: number; isFinal: boolean; label: string; bossName?: string; }
export interface WaveRecord { wave: number; total: number; }

/**
 * Responsabilidad ÚNICA: controlar las olas (crear los enemigos de cada ola,
 * soltarlos uno a uno y saber cuándo la ola terminó). Avisa con eventos.
 */
export class WaveManager {
    readonly events = new Emitter<{ waveStarted: [WaveInfo]; cozySpawned: [Cozy] }>();

    currentWave = 0;
    readonly history: WaveRecord[] = [];

    private spawning = false;
    private waveActive = false;
    private spawnList: Cozy[] = [];
    private spawnIdx = 0;
    private spawnTimer: ReturnType<typeof setTimeout> | null = null;
    private nextWaveTimer: ReturnType<typeof setTimeout> | null = null;
    private running = true;

    constructor(private readonly designs: readonly WaveDesign[], private readonly path: PathMap) {}

    get totalWaves(): number { return this.designs.length; }

    startNextWave(): void {
        if (!this.running || this.currentWave >= this.designs.length) return;

        const design = this.designs[this.currentWave];
        this.currentWave++;

        const hpBonus = (this.currentWave - 1) * DIFFICULTY.hpPerWave;
        const spdBonus = (this.currentWave - 1) * DIFFICULTY.speedPerWave;

        const normal: Cozy[] = [];
        const bosses: Cozy[] = [];
        for (const entry of design.enemies) {
            for (let i = 0; i < entry.count; i++) {
                const c = new Cozy(entry.key, hpBonus, spdBonus, this.path.start);
                (c.spawnsLast ? bosses : normal).push(c);
            }
        }
        this.shuffle(normal);
        this.spawnList = [...normal, ...bosses]; // jefes siempre al final

        this.history.push({ wave: this.currentWave, total: this.spawnList.length });
        this.spawnIdx = 0;
        this.spawning = true;
        this.waveActive = true;

        this.events.emit("waveStarted", {
            waveNumber: this.currentWave,
            total: this.spawnList.length,
            isFinal: !!design.isFinal,
            label: design.label,
            bossName: design.bossName,
        });
        this.spawnNext();
    }

    /** Se llama en cada frame con la cantidad de enemigos vivos. */
    update(activeEnemies: number): void {
        if (this.waveActive && !this.spawning && activeEnemies === 0) {
            this.waveActive = false;
            if (this.currentWave < this.designs.length) {
                this.nextWaveTimer = setTimeout(() => this.startNextWave(), WAVE_BREAK_MS);
            }
        }
    }

    stop(): void {
        this.running = false;
        if (this.spawnTimer) clearTimeout(this.spawnTimer);
        if (this.nextWaveTimer) clearTimeout(this.nextWaveTimer);
    }

    private spawnNext(): void {
        if (!this.running) return;
        if (this.spawnIdx >= this.spawnList.length) {
            this.spawning = false;
            return;
        }
        this.events.emit("cozySpawned", this.spawnList[this.spawnIdx++]);

        const interval = Math.max(
            SPAWN_INTERVAL.minMs,
            SPAWN_INTERVAL.baseMs - this.currentWave * SPAWN_INTERVAL.reductionPerWaveMs,
        );
        this.spawnTimer = setTimeout(() => this.spawnNext(), interval);
    }

    private shuffle<T>(arr: T[]): void {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
}
