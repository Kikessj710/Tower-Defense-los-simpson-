/** Responsabilidad ÚNICA: pantallas de Game Over y Victoria. */
export class EndScreen {
    showGameOver(score: number, wave: number, totalWaves: number): void {
        this.show(`<div style="background:#1a0000;border:3px solid #dc2626;
                border-radius:20px;padding:44px 64px;text-align:center;color:#fff;">
            <div style="font-size:52px;font-weight:bold;color:#dc2626">💀 GAME OVER 💀</div>
            <p style="margin:14px 0;opacity:0.75">Springfield no pudo resistir...</p>
            <p>⭐ Score: <b>${score}</b></p>
            <p>🌊 Ola alcanzada: <b>${wave}</b> de ${totalWaves}</p>
            <button id="retryBtn" style="margin-top:22px;padding:12px 44px;
                background:gold;color:#000;border:none;border-radius:50px;
                font-size:18px;font-weight:bold;cursor:pointer;">🔄 REINTENTAR</button>
            </div>`);
    }

    showVictory(score: number, totalWaves: number): void {
        this.show(`<div style="background:#0d2b0d;border:3px solid gold;
                border-radius:20px;padding:44px 64px;text-align:center;color:#fff;">
            <div style="font-size:52px;font-weight:bold;color:gold">🏆 ¡VICTORIA! 🏆</div>
            <div style="font-size:28px;margin:10px 0">😈 ¡Diablo Flanders derrotado!</div>
            <p style="margin:10px 0;opacity:0.75">¡Springfield está a salvo gracias a los Simpson!</p>
            <p>⭐ Score Final: <b style="color:gold">${score}</b></p>
            <p>💪 Sobreviviste las ${totalWaves} olas</p>
            <button id="retryBtn" style="margin-top:22px;padding:12px 44px;
                background:gold;color:#000;border:none;border-radius:50px;
                font-size:18px;font-weight:bold;cursor:pointer;">🔄 JUGAR DE NUEVO</button>
            </div>`);
    }

    private show(innerHtml: string): void {
        const overlay = document.createElement("div");
        overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.88);
            display:flex;align-items:center;justify-content:center;z-index:9999;`;
        overlay.innerHTML = innerHtml;
        document.body.appendChild(overlay);
        overlay.querySelector("#retryBtn")?.addEventListener("click", () => location.reload());
    }
}
