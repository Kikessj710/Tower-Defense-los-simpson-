/** Muestra el número flotante de daño ("-20" o "💥 KO"). */
export class DamageFloatView {
    constructor(private readonly layer: HTMLElement) {}

    show(x: number, y: number, amount: number): void {
        const div = document.createElement("div");
        div.textContent = amount >= 9999 ? "💥 KO" : `-${amount}`;
        div.style.cssText = `position:absolute;left:${x - 14}px;top:${y - 16}px;
            color:#fff;font-weight:bold;font-size:14px;z-index:50;
            pointer-events:none;text-shadow:1px 1px 2px #000;
            animation:dmgFloat .85s ease forwards;`;
        this.layer.appendChild(div);
        setTimeout(() => div.remove(), 900);
    }
}
