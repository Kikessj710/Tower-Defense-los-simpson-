import { Cozy } from "../../entities/Cozy";
import { Point } from "../../core/Point";
import { candidatesInRange, TargetingStrategy } from "./TargetingStrategy";

/** El enemigo con más vida actual dentro del alcance. (Ejemplo de extensión: cero cambios en Tower.) */
export class StrongestTarget implements TargetingStrategy {
    pick(origin: Point, range: number, enemies: readonly Cozy[]): Cozy | null {
        let best: Cozy | null = null;
        for (const e of candidatesInRange(origin, range, enemies)) {
            if (!best || e.hp > best.hp) best = e;
        }
        return best;
    }
}
