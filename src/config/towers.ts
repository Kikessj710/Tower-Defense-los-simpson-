export const TOWER_TYPES = ["homero", "lisa", "marge", "bart"] as const;
export type TowerKey = typeof TOWER_TYPES[number];

export interface TowerConfig {
    name: string;
    icon: string;
    damage: number;
    range: number;
    delay: number;
    slow: boolean;
    unlockXP: number;
    sprite: string;
    projectile: string;
    desc: string;
    unlockStory?: string;
}

export const TOWER_CONFIG: Record<TowerKey, TowerConfig> = {
    homero: { name: "Homero", icon: "🍩", damage: 20, range: 110, delay: 45, slow: false, unlockXP: 0,
              sprite: "Personajes/Homero/HomerNormal.webm", projectile: "Personajes/Homero/DonaAvanzando.webm",
              desc: "Lanza donas. Perfecto para empezar." },
    lisa:   { name: "Lisa", icon: "🎷", damage: 38, range: 155, delay: 33, slow: false, unlockXP: 500,
              sprite: "Personajes/Lisa/Lisa.webm", projectile: "Personajes/Lisa/Notas.webm",
              desc: "Saxofón. Más daño y mayor alcance.",
              unlockStory: "Su saxofón hace más daño y alcanza más lejos. ¡Úsala contra alienígenas!" },
    marge:  { name: "Marge", icon: "👶", damage: 18, range: 125, delay: 38, slow: true, unlockXP: 1000,
              sprite: "Personajes/Marge/Marge.webm", projectile: "Personajes/Marge/Maggie.webm",
              desc: "Lanza a Maggie. Ralentiza a los Cozy.",
              unlockStory: "Lanza a Maggie. Hace menos daño pero <b>ralentiza</b> a los Cozy un 55%." },
    bart:   { name: "Bart", icon: "💣", damage: 55, range: 135, delay: 44, slow: false, unlockXP: 1500,
              sprite: "Personajes/Bart/Bart.webm", projectile: "Personajes/Bart/BartExplotando.webm",
              desc: "Torre + bomba especial global.",
              unlockStory: "Torre normal <b>y</b> botón de bomba global disponible (cooldown 5s)." },
};
