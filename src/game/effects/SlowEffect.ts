import { Cozy } from "../../entities/Cozy";
import { HitEffect } from "./HitEffect";

/** Ralentiza al enemigo: su velocidad se multiplica por `factor` durante `ticks`. */
export class SlowEffect implements HitEffect {
    readonly icon = "❄️";
    constructor(private readonly factor: number, private readonly ticks: number) {}

    apply(target: Cozy): void {
        target.slowDown(this.factor, this.ticks);
    }
}
