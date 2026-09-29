import { Tower } from "../entities/Tower";
import { Stack } from "../structures/Stack";

/** Responsabilidad ÚNICA: historial de deshacer/rehacer torres (dos pilas). */
export class TowerHistory {
    private undoStack = new Stack<Tower>();
    private redoStack = new Stack<Tower>();

    record(tower: Tower): void {
        this.undoStack.push(tower);
        this.redoStack.clear();
    }

    undo(): Tower | null {
        const t = this.undoStack.pop();
        if (!t) return null;
        this.redoStack.push(t);
        return t;
    }

    redo(): Tower | null {
        const t = this.redoStack.pop();
        if (!t) return null;
        this.undoStack.push(t);
        return t;
    }
}
