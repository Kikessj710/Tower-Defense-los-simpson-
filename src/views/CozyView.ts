import { Cozy } from "../entities/Cozy";
import { Emitter } from "../core/Emitter";
import { DamageFloatView } from "./DamageFloatView";

/**
 * VISTA del enemigo. Responsabilidad ÚNICA: dibujar al Cozy (video, barra de vida,
 * parpadeo al recibir daño, animación de muerte) reaccionando a los eventos del modelo.
 */
export class CozyView {
    readonly events = new Emitter<{ deathAnimationEnded: [Cozy] }>();

    private readonly wrap: HTMLDivElement;
    private readonly video: HTMLVideoElement;
    private readonly hpBar: HTMLDivElement;
    private fallbackShown = false;

    constructor(private readonly cozy: Cozy, layer: HTMLElement, private readonly floats: DamageFloatView) {
        const size = cozy.size;

        this.wrap = document.createElement("div");
        this.wrap.style.cssText = `
            position:absolute; pointer-events:none; z-index:8;
            left:${cozy.x - size / 2}px; top:${cozy.y - size / 2}px;
            width:${size}px;`;

        this.video = document.createElement("video");
        this.video.src = cozy.walkSrc;
        this.video.autoplay = true; this.video.loop = true; this.video.muted = true;
        this.video.width = size; this.video.height = size;
        this.video.style.display = "block";
        this.video.onerror = () => this.showFallback();

        const hpWrap = document.createElement("div");
        hpWrap.style.cssText = `width:${size}px;height:5px;margin-top:2px;
            background:rgba(0,0,0,0.5);border-radius:3px;overflow:hidden;`;
        this.hpBar = document.createElement("div");
        this.hpBar.style.cssText = `height:100%;width:100%;background:#22c55e;
            border-radius:3px;transition:width .1s;`;
        hpWrap.appendChild(this.hpBar);

        this.wrap.appendChild(this.video);
        this.wrap.appendChild(hpWrap);
        layer.appendChild(this.wrap);

        cozy.events.on("moved", () => this.syncPosition());
        cozy.events.on("damaged", (_c, amount) => this.showDamage(amount));
        cozy.events.on("died", () => this.playDeathAnimation());
        cozy.events.on("reachedEnd", () => this.remove());
    }

    private syncPosition(): void {
        this.wrap.style.left = (this.cozy.x - this.cozy.size / 2) + "px";
        this.wrap.style.top = (this.cozy.y - this.cozy.size / 2) + "px";
    }

    private showDamage(amount: number): void {
        this.video.style.filter = "brightness(4) saturate(0)";
        setTimeout(() => { this.video.style.filter = ""; }, 130);

        const pct = Math.max(0, this.cozy.hp / this.cozy.maxHp);
        this.hpBar.style.width = (pct * 100) + "%";
        this.hpBar.style.background = pct > 0.6 ? "#22c55e" : pct > 0.3 ? "#f59e0b" : "#ef4444";

        this.floats.show(this.cozy.x, this.cozy.y, amount);
    }

    private playDeathAnimation(): void {
        let finished = false;
        const finish = () => {
            if (finished) return;
            finished = true;
            this.remove();
            this.events.emit("deathAnimationEnded", this.cozy);
        };
        this.video.src = this.cozy.dieSrc;
        this.video.loop = false;
        this.video.onended = finish;
        this.video.onerror = finish;
    }

    private showFallback(): void {
        this.video.style.display = "none";
        if (this.fallbackShown) return;
        const size = this.cozy.size;
        const fb = document.createElement("div");
        fb.style.cssText = `
            width:${size}px; height:${size}px;
            background:rgba(200,60,60,0.85);
            border-radius:8px; border:2px solid #000;
            display:flex; align-items:center; justify-content:center;
            font-size:${Math.floor(size * 0.5)}px;`;
        fb.textContent = this.cozy.icon;
        this.wrap.insertBefore(fb, this.wrap.firstChild);
        this.fallbackShown = true;
    }

    remove(): void { this.wrap.remove(); }
}
