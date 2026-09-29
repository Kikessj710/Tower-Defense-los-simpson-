import { TOWER_CONFIG, TowerConfig, TowerKey } from "../config/towers";
import { HitEffect } from "../game/effects/HitEffect";
import { TargetingStrategy } from "../game/targeting/TargetingStrategy";
import { Cozy } from "./Cozy";

/**
 * MODELO de la torre. Responsabilidad: sus estadísticas y decidir CUÁNDO dispara (cooldown).
 * A QUIÉN dispara lo decide su `TargetingStrategy` y QUÉ efectos deja el disparo lo
 * dicen sus `HitEffect`: ambos vienen de la configuración, así que la torre está
 * CERRADA a modificaciones y ABIERTA a nuevas estrategias/efectos.
 */
export class Tower {
    readonly name: string;
    readonly icon: string;
    readonly damage: number;
    readonly range: number;
    readonly delay: number;
    readonly spriteSrc: string;
    readonly projSrc: string;
    readonly voice: string;
    readonly effects: readonly HitEffect[];
    private readonly targeting: TargetingStrategy;
    private cooldown = 0;

    constructor(
        readonly typeKey: TowerKey,
        readonly x: number, readonly y: number,
        readonly cellX: number, readonly cellY: number,
        targeting?: TargetingStrategy,
    ) {
        const c: TowerConfig = TOWER_CONFIG[typeKey];
        this.name = c.name;
        this.icon = c.icon;
        this.damage = c.damage;
        this.range = c.range;
        this.delay = c.delay;
        this.spriteSrc = c.sprite;
        this.projSrc = c.projectile;
        this.voice = c.voice;
        this.effects = c.effects;
        this.targeting = targeting ?? c.targeting;
    }

    /** Un "tick" de juego. Devuelve el enemigo al que dispara, o null. */
    update(enemies: readonly Cozy[]): Cozy | null {
        if (this.cooldown > 0) { this.cooldown--; return null; }
        const target = this.targeting.pick(this, this.range, enemies);
        if (!target) return null;
        this.cooldown = this.delay;
        return target;
    }
}
