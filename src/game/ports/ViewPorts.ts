import { Cozy } from "../../entities/Cozy";
import { Tower } from "../../entities/Tower";
import { PathMap } from "../../map/PathMap";

export interface ProjectileLauncher {
    launch(from: Tower, target: Cozy, src: string, onArrive: () => void): void;
}

export interface PlacementMapSurface {
    onClick(handler: (x: number, y: number) => void): void;
    setCursor(cursor: string): void;
}

export interface GameMapSurface {
    clear(): void;
    drawPath(path: PathMap): void;
}

export interface TowerViewPort {
    show(): void;
    hide(): void;
}

export interface TowerViewFactory {
    create(tower: Tower): TowerViewPort;
}

export interface CozyViewPort {
    readonly events: { on(event: "deathAnimationEnded", handler: (c: Cozy) => void): void };
}

export interface CozyViewFactory {
    create(cozy: Cozy): CozyViewPort;
}
