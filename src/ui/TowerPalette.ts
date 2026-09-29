import { TOWER_CONFIG, TOWER_TYPES, TowerKey } from "../config/towers";

/** Responsabilidad ÚNICA: dibujar los botones de torres (bloqueadas / desbloqueadas). */
export class TowerPalette {
    private readonly container = document.getElementById("towerButtons") as HTMLElement;

    constructor(private readonly onSelect: (key: TowerKey) => void) {}

    render(unlocked: readonly TowerKey[]): void {
        this.container.innerHTML = "";
        for (const key of TOWER_TYPES) {
            const cfg = TOWER_CONFIG[key];
            const ok = unlocked.includes(key);
            const btn = document.createElement("button");
            btn.disabled = !ok;
            btn.title = cfg.desc;
            btn.textContent = ok
                ? `${cfg.icon} ${cfg.name} | 💥${cfg.damage} 📡${cfg.range}${cfg.effects.map(e => e.icon ? " " + e.icon : "").join("")}`
                : `🔒 ${cfg.name} — ${cfg.unlockXP} XP`;
            if (ok) btn.onclick = () => this.onSelect(key);
            this.container.appendChild(btn);
        }
    }
}
