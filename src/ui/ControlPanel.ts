/** Responsabilidad ÚNICA: los botones principales (Colocar / Deshacer / Rehacer). */
export class ControlPanel {
    private readonly placeBtn = document.getElementById("placeTowerBtn") as HTMLButtonElement;
    private readonly undoBtn = document.getElementById("undoBtn") as HTMLButtonElement;
    private readonly redoBtn = document.getElementById("redoBtn") as HTMLButtonElement;

    bind(handlers: { onTogglePlace: () => void; onUndo: () => void; onRedo: () => void }): void {
        this.placeBtn.onclick = handlers.onTogglePlace;
        this.undoBtn.onclick = handlers.onUndo;
        this.redoBtn.onclick = handlers.onRedo;
    }

    /** Pasa el nombre de la torre que se está colocando, o null para el estado normal. */
    showPlacing(towerName: string | null): void {
        if (towerName) {
            this.placeBtn.textContent = `✅ Colocando ${towerName} — click en el mapa`;
            this.placeBtn.style.background = "#22c55e";
            this.placeBtn.style.color = "#000";
        } else {
            this.placeBtn.textContent = "🗼 Colocar Torre";
            this.placeBtn.style.background = "";
            this.placeBtn.style.color = "";
        }
    }
}
