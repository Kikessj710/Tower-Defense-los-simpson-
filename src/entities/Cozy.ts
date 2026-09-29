import { COZY_CONFIG, EnemyCategory, EnemyKey } from "../config/enemies";
import { Emitter } from "../core/Emitter";
import { Point } from "../core/Point";

export type CozyEvents = {
    moved: [Cozy];
    damaged: [Cozy, number];
    died: [Cozy];
    reachedEnd: [Cozy];
};

/**
 * MODELO del enemigo. Responsabilidad ÚNICA: su estado (vida, posición, velocidad)
 * y sus reglas de movimiento/daño.
 *
 * Ya NO: dibuja en el DOM, reproduce sonidos, suma puntaje, desbloquea torres
 * ni llama a gameWin(). Solo AVISA con eventos y otros reaccionan.
 */
export class Cozy {
    readonly events = new Emitter<CozyEvents>();

    readonly name: string;
    readonly icon: string;
    readonly maxHp: number;
    readonly speed: number;
    readonly reward: number;
    readonly type: EnemyCategory;
    readonly size: number;
    readonly walkSrc: string;
    readonly dieSrc: string;

    hp: number;
    x: number;
    y: number;
    wpIndex = 1;
    isDead = false;
    reachedEnd = false;
    private slowed = false;
    private slowTick = 0;

    constructor(readonly cfgKey: EnemyKey, hpBonus: number, speedBonus: number, spawnPoint: Point) {
        const c = COZY_CONFIG[cfgKey];
        this.name = c.name;
        this.icon = c.icon;
        this.hp = c.hp + hpBonus;
        this.maxHp = this.hp;
        this.speed = c.speed + speedBonus;
        this.reward = c.reward;
        this.type = c.type;
        this.size = c.size;
        this.walkSrc = c.walk;
        this.dieSrc = c.die;
        this.x = spawnPoint.x;
        this.y = spawnPoint.y;
    }

    /** Mueve al enemigo un paso hacia el siguiente waypoint. */
    step(waypoints: readonly Point[]): void {
        if (this.wpIndex >= waypoints.length) {
            if (!this.reachedEnd) {
                this.reachedEnd = true;
                this.events.emit("reachedEnd", this);
            }
            return;
        }
        const t = waypoints[this.wpIndex];
        const dx = t.x - this.x, dy = t.y - this.y;
        const dist = Math.hypot(dx, dy);
        const spd = this.slowed ? this.speed * 0.45 : this.speed;

        if (dist <= spd) {
            this.x = t.x; this.y = t.y; this.wpIndex++;
        } else {
            const a = Math.atan2(dy, dx);
            this.x += Math.cos(a) * spd;
            this.y += Math.sin(a) * spd;
        }
        this.events.emit("moved", this);
        if (this.slowTick > 0 && --this.slowTick === 0) this.slowed = false;
    }

    takeDamage(amount: number, slow = false): void {
        if (this.isDead) return;
        this.hp -= amount;
        if (slow) { this.slowed = true; this.slowTick = 130; }
        this.events.emit("damaged", this, amount);
        if (this.hp <= 0) {
            this.isDead = true;
            this.events.emit("died", this);
        }
    }
}
