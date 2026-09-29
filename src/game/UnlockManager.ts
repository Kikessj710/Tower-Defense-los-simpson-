import { TOWER_CONFIG, TOWER_TYPES, TowerKey } from "../config/towers";

/** Responsabilidad ÚNICA: saber qué torres están desbloqueadas según el XP. */
export class UnlockManager {
    private readonly unlocked: TowerKey[] = ["homero"];

    get all(): readonly TowerKey[] { return this.unlocked; }
    get latest(): TowerKey { return this.unlocked[this.unlocked.length - 1]; }

    /** Devuelve las torres que se acaban de desbloquear con este XP. */
    check(xp: number): TowerKey[] {
        const newly: TowerKey[] = [];
        for (const key of TOWER_TYPES) {
            if (!this.unlocked.includes(key) && xp >= TOWER_CONFIG[key].unlockXP) {
                this.unlocked.push(key);
                newly.push(key);
            }
        }
        return newly;
    }
}
