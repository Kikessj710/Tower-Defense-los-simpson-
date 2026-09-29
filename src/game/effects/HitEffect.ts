import { Cozy } from "../../entities/Cozy";

/**
 * Contrato para un efecto que un disparo aplica al impactar (además del daño).
 * OCP: un efecto nuevo (veneno, aturdir...) es una clase nueva; ni `Tower`,
 * ni `CombatSystem` ni `Cozy` necesitan un `if` nuevo.
 */
export interface HitEffect {
    /** Emoji que la paleta muestra junto a la torre (opcional). */
    readonly icon?: string;
    apply(target: Cozy): void;
}
