import { FurthestAlongPath } from "../game/targeting/FurthestAlongPath";
import { TargetingStrategy } from "../game/targeting/TargetingStrategy";
import { HitEffect } from "../game/effects/HitEffect";
import { SlowEffect } from "../game/effects/SlowEffect";

/**
 * Cada torre es DATO autosuficiente: estadísticas, voz, cómo apunta y qué efectos aplica.
 * OCP: agregar una torre = agregar UNA entrada aquí. Ya no hay que tocar TOWER_TYPES,
 * voices.ts, Tower, CombatSystem ni la paleta.
 */
export interface TowerConfig {
    name: string;
    icon: string;
    damage: number;
    range: number;
    delay: number;
    unlockXP: number;
    sprite: string;
    projectile: string;
    desc: string;
    voice: string;
    targeting: TargetingStrategy;
    effects: readonly HitEffect[];
    unlockStory?: string;
}

const furthest = new FurthestAlongPath();

export const TOWER_CONFIG = {
    homero: { name: "Homero", icon: "🍩", damage: 20, range: 110, delay: 45, unlockXP: 0,
              sprite: "Personajes/Homero/HomerNormal.webm", projectile: "Personajes/Homero/DonaAvanzando.webm",
              voice: "sonidos/presencia.mp3", targeting: furthest, effects: [],
              desc: "Lanza donas. Perfecto para empezar." },
    lisa:   { name: "Lisa", icon: "🎷", damage: 38, range: 155, delay: 33, unlockXP: 500,
              sprite: "Personajes/Lisa/Lisa.webm", projectile: "Personajes/Lisa/Notas.webm",
              voice: "sonidos/saxo.mp3", targeting: furthest, effects: [],
              desc: "Saxofón. Más daño y mayor alcance.",
              unlockStory: "Su saxofón hace más daño y alcanza más lejos. ¡Úsala contra alienígenas!" },
    marge:  { name: "Marge", icon: "👶", damage: 18, range: 125, delay: 38, unlockXP: 1000,
              sprite: "Personajes/Marge/Marge.webm", projectile: "Personajes/Marge/Maggie.webm",
              voice: "sonidos/murmullo.mp3", targeting: furthest, effects: [new SlowEffect(0.45, 130)],
              desc: "Lanza a Maggie. Ralentiza a los Cozy.",
              unlockStory: "Lanza a Maggie. Hace menos daño pero <b>ralentiza</b> a los Cozy un 55%." },
    bart:   { name: "Bart", icon: "💣", damage: 55, range: 135, delay: 44, unlockXP: 1500,
              sprite: "Personajes/Bart/Bart.webm", projectile: "Personajes/Bart/BartExplotando.webm",
              voice: "sonidos/aycaramba.mp3", targeting: furthest, effects: [],
              desc: "Torre + bomba especial global.",
              unlockStory: "Torre normal <b>y</b> botón de bomba global disponible (cooldown 5s)." },
} satisfies Record<string, TowerConfig>;

/** Se deriva de TOWER_CONFIG (el orden de las entradas es el orden de desbloqueo). */
export type TowerKey = keyof typeof TOWER_CONFIG;
export const TOWER_TYPES = Object.keys(TOWER_CONFIG) as TowerKey[];
