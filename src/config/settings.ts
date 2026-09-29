// Constantes generales del juego (antes eran "números mágicos" repartidos por game.js)

export const CELL_SIZE = 60;            // tamaño de la cuadrícula para colocar torres
export const STARTING_HEALTH = 100;
export const XP_BAR_MAX = 1500;         // XP que llena la barra de experiencia
export const QUEUE_CAPACITY = 200;      // capacidad de la cola circular de enemigos

export const INTRO_BANNER_MS = 3000;
export const WAVE_BREAK_MS = 3000;      // pausa entre olas

export const DIFFICULTY = { hpPerWave: 8, speedPerWave: 0.05 };
export const SPAWN_INTERVAL = { baseMs: 950, reductionPerWaveMs: 22, minMs: 400 };

export const LEAK_DAMAGE = { boss: 30, default: 15 };

export const SPECIAL_COOLDOWN_FRAMES = 300; // 300 "ticks" de 1/60 s = 5 s
export const SPECIAL_DAMAGE = 9999;
