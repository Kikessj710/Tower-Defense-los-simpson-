import { TowerConfig, TowerKey } from "../../config/towers";

export interface ToastPort {
    showToast(msg: string): void;
}

export interface WaveBannerPort {
    showWaveBanner(waveNum: number, totalWaves: number, count: number, isFinal: boolean, label: string, bossName?: string): void;
}

export interface StoryBannerPort {
    showStoryBanner(title: string, body: string, duration: number, callback?: () => void): void;
}

export interface UnlockNotifier {
    showUnlock(cfg: TowerConfig): void;
}

export interface EndScreenPort {
    showGameOver(score: number, wave: number, totalWaves: number): void;
    showVictory(score: number, totalWaves: number): void;
}

export interface PlayerStatus {
    readonly health: number;
    readonly score: number;
    readonly xp: number;
}

export interface HudPort {
    render(status: PlayerStatus, currentWave: number, totalWaves: number): void;
}

export interface PalettePort {
    render(unlocked: readonly TowerKey[]): void;
}

export interface ControlsPort {
    bind(handlers: { onTogglePlace: () => void; onUndo: () => void; onRedo: () => void }): void;
    showPlacing(name: string | null): void;
}
