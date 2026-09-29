import { Emitter } from "../core/Emitter";
import { Cozy } from "../entities/Cozy";
import { SPECIAL_COOLDOWN_FRAMES, SPECIAL_DAMAGE } from "../config/settings";

/**
 * MODELO de la bomba global de Bart. Responsabilidad ÚNICA: regla del ataque
 * (daño a todos) y su cooldown. El botón y la explosión visual son de SpecialAttackView.
 */
export class SpecialAttack {
    readonly events = new Emitter<{ triggered: []; cooldownTick: [number]; ready: [] }>();
    private cooldown = 0;
    private timer: ReturnType<typeof setInterval> | null = null;

    get isReady(): boolean { return this.cooldown <= 0; }

    trigger(targets: readonly Cozy[]): boolean {
        if (!this.isReady) return false;
        for (const e of targets) if (!e.isDead) e.takeDamage(SPECIAL_DAMAGE);
        this.events.emit("triggered");

        this.cooldown = SPECIAL_COOLDOWN_FRAMES;
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.cooldown--;
            if (this.cooldown <= 0) {
                if (this.timer) clearInterval(this.timer);
                this.events.emit("ready");
            } else {
                this.events.emit("cooldownTick", this.cooldown);
            }
        }, 1000 / 60);
        return true;
    }
}
