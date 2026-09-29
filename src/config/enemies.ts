export const ENEMY_TYPES = ["burns", "nelson", "milhouse", "kang", "kodos", "skinner", "flanders"] as const;
export type EnemyKey = typeof ENEMY_TYPES[number];
export type EnemyCategory = "normal" | "alien" | "strong" | "boss";

export interface EnemyConfig {
    name: string;
    icon: string;
    hp: number;
    speed: number;
    reward: number;
    type: EnemyCategory;
    size: number;
    walk: string;
    die: string;
}

export const COZY_CONFIG: Record<EnemyKey, EnemyConfig> = {
    burns:    { name: "Sr. Burns", icon: "🧓", hp: 80, speed: 1.2, reward: 100, type: "normal", size: 44,
                walk: "Personajes/Burns/BurnsCaminando.webm", die: "Personajes/Burns/BurnsMuriendo.webm" },
    nelson:   { name: "Nelson", icon: "😤", hp: 110, speed: 1.8, reward: 150, type: "normal", size: 44,
                walk: "Personajes/Milhouse-Nelson/NelsonCaminando.webm", die: "Personajes/Milhouse-Nelson/Nelson.webm" },
    milhouse: { name: "Milhouse", icon: "🤓", hp: 95, speed: 1.6, reward: 130, type: "normal", size: 44,
                walk: "Personajes/Milhouse-Nelson/milhouse.webm", die: "Personajes/Milhouse-Nelson/MilhouseParado.webm" },
    kang:     { name: "Kang", icon: "👽", hp: 160, speed: 2.0, reward: 200, type: "alien", size: 50,
                walk: "Personajes/Kang y Kodos/KangYKodos.webm", die: "Personajes/Kang y Kodos/KangYKodosMuriendo.webm" },
    kodos:    { name: "Kodos", icon: "👽", hp: 200, speed: 4.0, reward: 200, type: "alien", size: 50,
                walk: "Personajes/Kang y Kodos/KangYKodos.webm", die: "Personajes/Kang y Kodos/KangYKodosMuriendo.webm" },
    skinner:  { name: "Dir. Skinner", icon: "👔", hp: 220, speed: 1.0, reward: 250, type: "strong", size: 50,
                walk: "Personajes/Skinner/SkinnerCaminando.webm", die: "Personajes/Skinner/SkinnerCaida.webm" },
    flanders: { name: "DIABLO FLANDERS", icon: "😈", hp: 2000, speed: 1.1, reward: 5000, type: "boss", size: 70,
                walk: "Personajes/Flanders/FlandersEntrada.webm", die: "Personajes/Flanders/FlandersMuriendo.webm" },
};
