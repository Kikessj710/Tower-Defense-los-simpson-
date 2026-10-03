import { Tower } from "../entities/Tower";
import { Cozy } from "../entities/Cozy";
import { ProjectileLauncher } from "./ports/ViewPorts";

/** Responsabilidad ÚNICA: resolver los disparos (torre -> proyectil -> daño al llegar). */
export class CombatSystem {
    constructor(private readonly projectiles: ProjectileLauncher) {}

    update(towers: readonly Tower[], enemies: readonly Cozy[]): void {
        for (const tower of towers) {
            const target = tower.update(enemies);
            if (!target) continue;
            const { damage, effects } = tower;
            this.projectiles.launch(tower, target, tower.projSrc, () => {
                if (target.isDead) return;
                target.takeDamage(damage);
                for (const effect of effects) effect.apply(target);
            });
        }
    }
}
