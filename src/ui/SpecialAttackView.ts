import { SpecialAttack } from "../game/SpecialAttack";

/** VISTA de la bomba de Bart: el botón (con cuenta regresiva) y la explosión visual. */
export class SpecialAttackView {
    private button: HTMLButtonElement | null = null;

    constructor(special: SpecialAttack, private readonly onClick: () => void) {
        special.events.on("triggered", () => this.playExplosion());
        special.events.on("cooldownTick", (frames) => {
            if (!this.button) return;
            this.button.disabled = true;
            this.button.textContent = `💣 BART — ${Math.ceil(frames / 60)}s`;
        });
        special.events.on("ready", () => {
            if (!this.button) return;
            this.button.disabled = false;
            this.button.textContent = "💣 BART — BOMBA GLOBAL";
        });
    }

    ensureButton(): void {
        if (document.getElementById("specialBtn")) return;
        const btn = document.createElement("button");
        btn.id = "specialBtn";
        btn.textContent = "💣 BART — BOMBA GLOBAL";
        btn.onclick = this.onClick;
        document.getElementById("controls")?.appendChild(btn);
        this.button = btn;
    }

    private playExplosion(): void {
        const vfx = document.createElement("div");
        vfx.style.cssText = `position:fixed;top:50%;left:50%;width:320px;height:320px;
            transform:translate(-50%,-50%);border-radius:50%;pointer-events:none;z-index:9999;
            background:radial-gradient(circle,rgba(255,220,0,.95),rgba(255,80,0,.6) 50%,transparent 75%);
            animation:explodeVFX .65s ease forwards;`;
        document.body.appendChild(vfx);
        setTimeout(() => vfx.remove(), 750);
    }
}
