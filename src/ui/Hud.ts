import { XP_BAR_MAX } from "../config/settings";
import { PlayerState } from "../game/PlayerState";

/** Responsabilidad ÚNICA: pintar el panel de estadísticas (salud, ola, score, XP). */
export class Hud {
    private readonly health = document.getElementById("playerHealth") as HTMLElement;
    private readonly wave = document.getElementById("currentWave") as HTMLElement;
    private readonly score = document.getElementById("score") as HTMLElement;
    private readonly xp = document.getElementById("xp") as HTMLElement;
    private readonly xpFill = document.getElementById("xpFill");

    render(player: PlayerState, currentWave: number, totalWaves: number): void {
        this.health.textContent = `❤️ Salud: ${Math.max(0, player.health)}`;
        this.score.textContent = `⭐ Score: ${player.score}`;
        this.xp.textContent = `📈 XP: ${player.xp}`;
        this.wave.textContent = `🌊 Wave: ${currentWave} / ${totalWaves}`;
        if (this.xpFill) this.xpFill.style.width = Math.min(player.xp / XP_BAR_MAX * 100, 100) + "%";
    }
}
