import { EnemyKey } from "./enemies";

export interface WaveEntry { key: EnemyKey; count: number; }
export interface WaveDesign { label: string; enemies: WaveEntry[]; isFinal?: boolean; bossName?: string; }

// Los jefes siempre salen al final de cada ola.
export const WAVE_DESIGNS: readonly WaveDesign[] = [
    { label: "¡Burns ataca!",            enemies: [{ key: "burns", count: 4 }] },
    { label: "Nelson entra al juego",    enemies: [{ key: "burns", count: 4 }, { key: "nelson", count: 2 }] },
    { label: "¡Milhouse también!",       enemies: [{ key: "burns", count: 3 }, { key: "nelson", count: 3 }, { key: "milhouse", count: 2 }] },
    { label: "👾 ¡Invasión alienígena!", enemies: [{ key: "burns", count: 3 }, { key: "milhouse", count: 2 }, { key: "kang", count: 2 }, { key: "kodos", count: 2 }] },
    { label: "El Director Skinner llega", enemies: [{ key: "nelson", count: 3 }, { key: "kang", count: 2 }, { key: "kodos", count: 2 }, { key: "skinner", count: 2 }] },
    { label: "Más alienígenas",          enemies: [{ key: "milhouse", count: 3 }, { key: "kang", count: 3 }, { key: "skinner", count: 2 }] },
    { label: "Ataque masivo alienígena", enemies: [{ key: "kang", count: 3 }, { key: "kodos", count: 3 }, { key: "skinner", count: 3 }] },
    { label: "¡Todos juntos!",           enemies: [{ key: "nelson", count: 4 }, { key: "kang", count: 3 }, { key: "kodos", count: 3 }, { key: "skinner", count: 2 }] },
    { label: "⚠️ El ejército final...",  enemies: [{ key: "kang", count: 4 }, { key: "kodos", count: 4 }, { key: "skinner", count: 3 }] },
    { label: "😈 ¡DIABLO FLANDERS!",     enemies: [{ key: "burns", count: 3 }, { key: "skinner", count: 2 }, { key: "flanders", count: 1 }], isFinal: true, bossName: "DIABLO FLANDERS" },
];
