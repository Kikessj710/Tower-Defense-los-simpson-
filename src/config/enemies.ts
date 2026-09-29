/**
 * Cada enemigo es DATO autosuficiente: incluye su voz, cuánto daño hace si llega
 * a la meta y si sale al final de la ola / gana el juego al morir.
 * OCP: agregar un enemigo = agregar UNA entrada aquí (y usarlo en waves.ts).
 */
export interface EnemyConfig {
    name: string;
    icon: string;
    hp: number;
    speed: number;
    reward: number;
    size: number;
    walk: string;
    die: string;
    voice?: string;
    /** Vida que le quita al jugador si llega al final. */
    leakDamage: number;
    /** Sale siempre al final de su ola. */
    spawnsLast?: boolean;
    /** Si muere, el jugador gana la partida. */
    winsOnDeath?: boolean;
}

const LEAK_NORMAL = 15;
const LEAK_BOSS = 30;

export const COZY_CONFIG = {
    burns:    { name: "Sr. Burns", icon: "🧓", hp: 80, speed: 1.2, reward: 100, size: 44, leakDamage: LEAK_NORMAL,
                walk: "Personajes/Burns/BurnsCaminando.webm", die: "Personajes/Burns/BurnsMuriendo.webm",
                voice: "sonidos/burns.mp3" },
    nelson:   { name: "Nelson", icon: "😤", hp: 110, speed: 1.8, reward: 150, size: 44, leakDamage: LEAK_NORMAL,
                walk: "Personajes/Milhouse-Nelson/NelsonCaminando.webm", die: "Personajes/Milhouse-Nelson/Nelson.webm",
                voice: "sonidos/nelson.mp3" },
    milhouse: { name: "Milhouse", icon: "🤓", hp: 95, speed: 1.6, reward: 130, size: 44, leakDamage: LEAK_NORMAL,
                walk: "Personajes/Milhouse-Nelson/milhouse.webm", die: "Personajes/Milhouse-Nelson/MilhouseParado.webm",
                voice: "sonidos/milhouse.mp3" },
    kang:     { name: "Kang", icon: "👽", hp: 160, speed: 2.0, reward: 200, size: 50, leakDamage: LEAK_NORMAL,
                walk: "Personajes/Kang y Kodos/KangYKodos.webm", die: "Personajes/Kang y Kodos/KangYKodosMuriendo.webm",
                voice: "sonidos/alien.mp3" },
    kodos:    { name: "Kodos", icon: "👽", hp: 200, speed: 4.0, reward: 200, size: 50, leakDamage: LEAK_NORMAL,
                walk: "Personajes/Kang y Kodos/KangYKodos.webm", die: "Personajes/Kang y Kodos/KangYKodosMuriendo.webm",
                voice: "sonidos/alien.mp3" },
    skinner:  { name: "Dir. Skinner", icon: "👔", hp: 220, speed: 1.0, reward: 250, size: 50, leakDamage: LEAK_NORMAL,
                walk: "Personajes/Skinner/SkinnerCaminando.webm", die: "Personajes/Skinner/SkinnerCaida.webm" },
    flanders: { name: "DIABLO FLANDERS", icon: "😈", hp: 2000, speed: 1.1, reward: 5000, size: 70, leakDamage: LEAK_BOSS,
                spawnsLast: true, winsOnDeath: true,
                walk: "Personajes/Flanders/FlandersEntrada.webm", die: "Personajes/Flanders/FlandersMuriendo.webm" },
} satisfies Record<string, EnemyConfig>;

/** Se deriva de COZY_CONFIG: nunca hay que mantener una lista aparte. */
export type EnemyKey = keyof typeof COZY_CONFIG;
export const ENEMY_TYPES = Object.keys(COZY_CONFIG) as EnemyKey[];
