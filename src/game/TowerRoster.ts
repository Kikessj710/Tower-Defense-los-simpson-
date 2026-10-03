import { Tower } from "../entities/Tower";
import { TowerViewFactory, TowerViewPort } from "./ports/ViewPorts";

/** Responsabilidad ÚNICA: guardar las torres activas y mostrar/ocultar su vista. */
export class TowerRoster {
    private readonly list: Tower[] = [];
    private readonly views = new Map<Tower, TowerViewPort>();

    constructor(private readonly factory: TowerViewFactory) {}

    get towers(): readonly Tower[] { return this.list; }

    add(tower: Tower): void {
        let view = this.views.get(tower);
        if (!view) {
            view = this.factory.create(tower);
            this.views.set(tower, view);
        }
        view.show();
        this.list.push(tower);
    }

    remove(tower: Tower): void {
        this.views.get(tower)?.hide();
        const idx = this.list.indexOf(tower);
        if (idx >= 0) this.list.splice(idx, 1);
    }
}
