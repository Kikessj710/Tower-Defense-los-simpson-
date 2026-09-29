import { Cozy } from "../../entities/Cozy";
import { Point } from "../../core/Point";

/**
 * Contrato para elegir a QUIÉN dispara una torre.
 * OCP: para inventar una nueva forma de apuntar se crea una clase nueva que
 * implemente esta interfaz; `Tower` no se modifica.
 */
export interface TargetingStrategy {
    pick(origin: Point, range: number, enemies: readonly Cozy[]): Cozy | null;
}

/** Enemigos vivos, en el mapa y dentro del alcance. Utilidad compartida por las estrategias. */
export function candidatesInRange(origin: Point, range: number, enemies: readonly Cozy[]): Cozy[] {
    return enemies.filter(e =>
        !e.isDead && !e.reachedEnd && Math.hypot(e.x - origin.x, e.y - origin.y) <= range);
}
