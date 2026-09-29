import { TOWER_CONFIG, TowerKey } from "../config/towers";
import { Cozy } from "./Cozy";

/**
 * MODELO de la torre. Responsabilidad ÚNICA: sus estadísticas y decidir
 * A QUIÉN dispara y CUÁNDO (cooldown + rango).
 *
 * Ya NO: crea <video>, anima proyectiles ni aplica el daño (eso lo hacen
 * TowerView, ProjectileView y CombatSystem).
 */
export class Tower {
    readonly name: string;
    readonly icon: string;
    readonly damage: number;
    readonly range: number;
    readonly delay: number;
    readonly slow: boolean;
    readonly spriteSrc: string;
    readonly projSrc: string;
    private cooldown = 0;

    constructor(
        readonly typeKey: TowerKey,
        readonly x: number, readonly y: number,
        readonly cellX: number, readonly cellY: number,
    ) {
        const c = TOWER_CONFIG[typeKey];
        this.name = c.name;
        this.icon = c.icon;
        this.damage = c.damage;
        this.range = c.range;
        this.delay = c.delay;
        this.slow = c.slow;
        this.spriteSrc = c.sprite;
        this.projSrc = c.projectile;
    }

    /** Un "tick" de juego. Devuelve el enemigo al que dispara, o null. */
    update(enemies: readonly Cozy[]): Cozy | null {
        if (this.cooldown > 0) { this.cooldown--; return null; }

        let target: Cozy | null = null;
        let bestWP = -1;
        for (const e of enemies) {
            if (e.isDead || e.reachedEnd) continue;
            if (Math.hypot(e.x - this.x, e.y - this.y) <= this.range && e.wpIndex > bestWP) {
                target = e; bestWP = e.wpIndex;
            }
        }
        if (!target) return null;
        this.cooldown = this.delay;
        return target;
    }
}
