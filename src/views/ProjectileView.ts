import { Point } from "../core/Point";

/** VISTA del proyectil: anima el video desde la torre hasta el enemigo y avisa al llegar. */
export class ProjectileView {
    constructor(private readonly layer: HTMLElement) {}

    launch(from: Point, target: Point, src: string, onArrive: () => void): void {
        const proj = document.createElement("video");
        proj.src = src;
        proj.autoplay = true; proj.loop = false; proj.muted = true;
        proj.style.cssText = `position:absolute;width:22px;height:22px;
            left:${from.x - 11}px;top:${from.y - 11}px;z-index:20;pointer-events:none;`;
        proj.onerror = () => {};
        this.layer.appendChild(proj);

        let t = 0;
        const id = setInterval(() => {
            t += 0.11;
            if (t >= 1) {
                clearInterval(id);
                proj.remove();
                onArrive();
            } else {
                proj.style.left = (from.x + (target.x - from.x) * t - 11) + "px";
                proj.style.top = (from.y + (target.y - from.y) * t - 11) + "px";
            }
        }, 25);
    }
}
