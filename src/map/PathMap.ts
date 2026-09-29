import { Point } from "../core/Point";

/**
 * Responsabilidad ÚNICA: conocer la geometría del camino
 * (waypoints y si un punto cae encima del camino). No dibuja nada.
 */
export class PathMap {
    readonly waypoints: readonly Point[];

    constructor(width: number, height: number) {
        this.waypoints = [
            { x: -30,          y: height * 0.18 },
            { x: width * 0.28, y: height * 0.18 },
            { x: width * 0.28, y: height * 0.50 },
            { x: width * 0.65, y: height * 0.50 },
            { x: width * 0.65, y: height * 0.82 },
            { x: width + 30,   y: height * 0.82 },
        ];
    }

    get start(): Point { return this.waypoints[0]; }
    get end(): Point { return this.waypoints[this.waypoints.length - 1]; }

    isOnPath(x: number, y: number, half = 26): boolean {
        for (let i = 0; i < this.waypoints.length - 1; i++) {
            const a = this.waypoints[i], b = this.waypoints[i + 1];
            if (Math.abs(b.y - a.y) < 2) {
                const x1 = Math.min(a.x, b.x), x2 = Math.max(a.x, b.x);
                if (x >= x1 - half && x <= x2 + half && Math.abs(y - a.y) < half + 10) return true;
            } else {
                const y1 = Math.min(a.y, b.y), y2 = Math.max(a.y, b.y);
                if (y >= y1 - half && y <= y2 + half && Math.abs(x - a.x) < half + 10) return true;
            }
        }
        return false;
    }
}
