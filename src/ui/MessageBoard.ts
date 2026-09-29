import { TowerConfig } from "../config/towers";

/** Responsabilidad ÚNICA: mostrar mensajes temporales (toasts y banners). */
export class MessageBoard {
    showToast(msg: string): void {
        const div = document.createElement("div");
        div.style.cssText = `position:fixed;top:50%;left:50%;
            transform:translate(-50%,-50%);
            background:rgba(0,0,0,0.88);border:1px solid #666;
            padding:12px 28px;border-radius:10px;color:#fff;
            font-size:15px;font-weight:bold;z-index:9000;pointer-events:none;`;
        div.textContent = msg;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 1700);
    }

    showWaveBanner(waveNum: number, totalWaves: number, count: number, isFinal: boolean, label: string, bossName = ""): void {
        const div = document.createElement("div");
        div.style.cssText = `position:fixed;top:50%;left:50%;
            transform:translate(-50%,-50%);
            background:rgba(0,0,0,0.91);border:2px solid gold;
            padding:22px 44px;border-radius:16px;text-align:center;
            z-index:8000;color:#fff;font-size:24px;font-weight:bold;pointer-events:none;`;
        div.innerHTML = isFinal
            ? `😈 <span style="color:gold">OLA FINAL</span><br>
               <span style="font-size:32px">${bossName}</span><br>
               <small style="font-size:13px;opacity:0.8">¡El jefe final se aproxima! ¡No lo dejes pasar!</small>`
            : `🌊 <span style="color:gold">OLA ${waveNum}</span> de ${totalWaves} — ${label}<br>
               <small style="font-size:13px;opacity:0.8">${count} Cozy en camino</small>`;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 2400);
    }

    showStoryBanner(title: string, body: string, duration: number, callback?: () => void): void {
        const div = document.createElement("div");
        div.style.cssText = `position:fixed;top:50%;left:50%;
            transform:translate(-50%,-50%);
            background:rgba(0,0,0,0.93);border:2px solid gold;
            padding:28px 52px;border-radius:18px;text-align:center;
            z-index:8000;color:#fff;max-width:460px;pointer-events:none;`;
        div.innerHTML = `<div style="font-size:22px;font-weight:bold;margin-bottom:10px">${title}</div>
                         <div style="font-size:15px;opacity:0.88;line-height:1.6">${body}</div>`;
        document.body.appendChild(div);
        setTimeout(() => { div.remove(); callback?.(); }, duration);
    }

    showUnlock(cfg: TowerConfig): void {
        const div = document.createElement("div");
        div.style.cssText = `position:fixed;top:18px;right:18px;
            background:rgba(0,0,0,0.93);border:2px solid gold;
            padding:16px 22px;border-radius:14px;z-index:8500;
            color:#fff;text-align:center;min-width:220px;max-width:300px;
            font-size:14px;line-height:1.5;animation:slideInRight .4s ease;`;
        div.innerHTML = `<div style="font-size:17px;font-weight:bold;margin-bottom:6px">🎉 ¡DESBLOQUEADO!</div>
            <div style="font-size:28px">${cfg.icon}</div>
            <div style="font-weight:bold">${cfg.name}</div>
            <div style="margin-top:6px;font-size:13px">${cfg.unlockStory ?? ""}</div>`;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 4200);
    }
}
