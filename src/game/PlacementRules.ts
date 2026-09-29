import { PathMap } from "../map/PathMap";
import { Tower } from "../entities/Tower";

export type PlacementVerdict = { ok: true } | { ok: false; message: string };

/** Responsabilidad ÚNICA: decidir si una posición es válida para colocar una torre. */
export class PlacementRules {
    constructor(private readonly path: PathMap) {}

    check(x: number, y: number, towers: readonly Tower[]): PlacementVerdict {
        if (this.path.isOnPath(x, y)) {
            return { ok: false, message: "🚫 No puedes colocar torres en el camino." };
        }
        if (towers.some(t => Math.abs(t.x - x) < 55 && Math.abs(t.y - y) < 55)) {
            return { ok: false, message: "⚠️ Ya hay una torre aquí." };
        }
        return { ok: true };
    }
}
