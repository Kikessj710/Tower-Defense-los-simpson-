import { Cozy } from "../entities/Cozy";
import { CircularQueue } from "../structures/CircularQueue";
import { Point } from "../core/Point";

/** Responsabilidad ÚNICA: administrar los enemigos vivos en la cola circular. */
export class EnemyRoster {
    private readonly queue: CircularQueue<Cozy>;

    constructor(capacity: number) {
        this.queue = new CircularQueue<Cozy>(capacity);
    }

    add(cozy: Cozy): boolean { return this.queue.enqueue(cozy); }
    get count(): number { return this.queue.length; }
    toArray(): Cozy[] { return this.queue.toArray(); }

    /** Quantum de tiempo: mueve un paso a cada enemigo activo. */
    stepAll(waypoints: readonly Point[]): void {
        this.queue.forEach(e => {
            if (!e.isDead && !e.reachedEnd) e.step(waypoints);
        });
    }

    /** Saca de la cola a los que murieron o llegaron al final. */
    purge(): void {
        this.queue.removeWhere(e => e.isDead || e.reachedEnd);
    }
}
