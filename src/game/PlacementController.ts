import { CELL_SIZE } from "../config/settings";
import { TOWER_CONFIG, TowerKey } from "../config/towers";
import { Tower } from "../entities/Tower";
import { VoiceService } from "../services/VoiceService";
import { ControlPanel } from "../ui/ControlPanel";
import { MessageBoard } from "../ui/MessageBoard";
import { MapView } from "../views/MapView";
import { PlacementRules } from "./PlacementRules";
import { TowerHistory } from "./TowerHistory";
import { TowerRoster } from "./TowerRoster";

/**
 * Responsabilidad ÚNICA: la interacción del jugador para colocar / deshacer / rehacer torres.
 * Las reglas (PlacementRules), el almacenamiento (TowerRoster) y el historial (TowerHistory)
 * son clases separadas; aquí solo se coordinan.
 */
export class PlacementController {
    private placing = false;
    private enabled = true;
    private selected: TowerKey = "homero";

    constructor(
        private readonly map: MapView,
        private readonly panel: ControlPanel,
        private readonly rules: PlacementRules,
        private readonly roster: TowerRoster,
        private readonly history: TowerHistory,
        private readonly messages: MessageBoard,
        private readonly voice: VoiceService,
    ) {
        map.onClick((mx, my) => this.handleMapClick(mx, my));
    }

    setEnabled(enabled: boolean): void { this.enabled = enabled; }

    enter(type: TowerKey): void {
        if (!this.enabled) return;
        this.selected = type;
        this.placing = true;
        this.map.setCursor("crosshair");
        this.panel.showPlacing(TOWER_CONFIG[type].name);
    }

    exit(): void {
        this.placing = false;
        this.map.setCursor("default");
        this.panel.showPlacing(null);
    }

    toggle(defaultType: TowerKey): void {
        if (this.placing) this.exit();
        else this.enter(defaultType);
    }

    undo(): void {
        const tower = this.history.undo();
        if (!tower) { this.messages.showToast("⚠️ No hay torres para deshacer."); return; }
        this.roster.remove(tower);
    }

    redo(): void {
        const tower = this.history.redo();
        if (!tower) { this.messages.showToast("⚠️ No hay acciones para rehacer."); return; }
        this.roster.add(tower);
    }

    private handleMapClick(mx: number, my: number): void {
        if (!this.placing || !this.enabled) return;

        const cellX = Math.floor(mx / CELL_SIZE) * CELL_SIZE;
        const cellY = Math.floor(my / CELL_SIZE) * CELL_SIZE;
        const tx = cellX + CELL_SIZE / 2, ty = cellY + CELL_SIZE / 2;

        const verdict = this.rules.check(tx, ty, this.roster.towers);
        if (!verdict.ok) { this.messages.showToast(verdict.message); return; }

        const tower = new Tower(this.selected, tx, ty, cellX, cellY);
        this.roster.add(tower);
        this.history.record(tower);
        this.voice.play(tower.voice);
        this.exit();
    }
}
