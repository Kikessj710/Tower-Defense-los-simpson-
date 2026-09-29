import { STARTING_HEALTH } from "../config/settings";

/** Responsabilidad ÚNICA: estado del jugador (salud, puntaje, XP). Reemplaza las variables globales. */
export class PlayerState {
    health = STARTING_HEALTH;
    score = 0;
    xp = 0;

    get isDead(): boolean { return this.health <= 0; }

    takeDamage(amount: number): void { this.health -= amount; }

    addReward(amount: number): void {
        this.score += amount;
        this.xp += amount;
    }
}
