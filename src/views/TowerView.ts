import { TowerViewPort } from "../game/ports/ViewPorts";
import { Tower } from "../entities/Tower";

/** VISTA de la torre: dibuja/quita el sprite de la torre en el mapa. */
export class TowerView implements TowerViewPort {
    private video: HTMLVideoElement | null = null;
    private fallback: HTMLDivElement | null = null;

    constructor(private readonly tower: Tower, private readonly layer: HTMLElement) {}

    show(): void {
        const t = this.tower;
        const vid = document.createElement("video");
        vid.src = t.spriteSrc;
        vid.autoplay = true; vid.loop = true; vid.muted = true;
        vid.width = 50; vid.height = 50;
        vid.style.cssText = `position:absolute;left:${t.cellX}px;top:${t.cellY}px;z-index:9;pointer-events:none;`;
        vid.onerror = () => {
            vid.style.display = "none";
            const fb = document.createElement("div");
            fb.style.cssText = `position:absolute;left:${t.cellX}px;top:${t.cellY}px;
                width:50px;height:50px;z-index:9;
                background:#f59e0b;border-radius:10px;border:2px solid #000;
                display:flex;align-items:center;justify-content:center;font-size:24px;`;
            fb.textContent = t.icon;
            this.layer.appendChild(fb);
            this.fallback = fb;
        };
        this.layer.appendChild(vid);
        this.video = vid;
    }

    hide(): void {
        this.video?.remove();
        this.fallback?.remove();
        this.video = null;
        this.fallback = null;
    }
}
