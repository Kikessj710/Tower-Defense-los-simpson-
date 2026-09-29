import { Cozy } from "../../entities/Cozy";
import { Point } from "../../core/Point";
import { candidatesInRange, TargetingStrategy } from "./TargetingStrategy";

/** El enemigo más adelantado en el camino (el que está más cerca de llegar a la meta). */
export class FurthestAlongPath implements TargetingStrategy {
    pick(origin: Point, range: number, enemies: readonly Cozy[]): Cozy | null {
        let best: Cozy | null = null;
        for (const e of candidatesInRange(origin, range, enemies)) {
            if (!best || e.wpIndex > best.wpIndex) best = e;
        }
        return best;
    }
}
