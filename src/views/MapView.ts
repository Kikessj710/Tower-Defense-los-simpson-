import { PathMap } from "../map/PathMap";

/** VISTA del mapa: dibuja el camino, marcadores de inicio/fin y captura clicks. */
export class MapView {
    readonly mapEl = document.getElementById("map") as HTMLElement;
    readonly enemiesEl = document.getElementById("enemies") as HTMLElement;
    private readonly container = document.getElementById("mapContainer") as HTMLElement;

    get width(): number { return this.container.offsetWidth || 800; }
    get height(): number { return this.container.offsetHeight || 500; }

    clear(): void {
        this.mapEl.innerHTML = "";
        this.enemiesEl.innerHTML = "";
    }

    drawPath(path: PathMap): void {
        const T = 38;
        const wp = path.waypoints;
        for (let i = 0; i < wp.length - 1; i++) {
            const a = wp[i], b = wp[i + 1];
            const seg = document.createElement("div");
            seg.style.cssText = "position:absolute;background:#8B7355;z-index:1;";
            if (Math.abs(b.y - a.y) < 2) {
                seg.style.left = Math.min(a.x, b.x) + "px";
                seg.style.top = (a.y - T / 2) + "px";
                seg.style.width = (Math.abs(b.x - a.x) + T) + "px";
                seg.style.height = T + "px";
            } else {
                seg.style.left = (a.x - T / 2) + "px";
                seg.style.top = Math.min(a.y, b.y) + "px";
                seg.style.width = T + "px";
                seg.style.height = (Math.abs(b.y - a.y) + T) + "px";
            }
            this.mapEl.appendChild(seg);
        }

        const start = document.createElement("div");
        start.textContent = "▶";
        start.style.cssText = `position:absolute;left:${path.start.x - 12}px;top:${path.start.y - 18}px;
            z-index:3;font-size:24px;color:#22c55e;text-shadow:0 0 10px #22c55e;`;
        this.mapEl.appendChild(start);

        const end = document.createElement("div");
        end.textContent = "🏠";
        end.style.cssText = `position:absolute;left:${path.end.x - 70}px;top:${path.end.y - 40}px;
            z-index:10;font-size:45px;filter:drop-shadow(0 0 10px gold);`;
        this.mapEl.appendChild(end);
    }

    /** Entrega las coordenadas del click relativas al contenedor del mapa. */
    onClick(handler: (mx: number, my: number) => void): void {
        this.mapEl.addEventListener("click", (e) => {
            const rect = this.container.getBoundingClientRect();
            handler(e.clientX - rect.left, e.clientY - rect.top);
        });
    }

    setCursor(cursor: "crosshair" | "default"): void {
        this.mapEl.style.cursor = cursor;
    }
}
