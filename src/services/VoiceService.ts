import { VOICE_FILES } from "../config/voices";

/** Responsabilidad ÚNICA: reproducir la "voz" de un personaje. */
export class VoiceService {
    play(character: string): void {
        const file = VOICE_FILES[character];
        if (!file) {
            console.warn("No hay sonido asignado para: " + character);
            return;
        }
        const audio = new Audio(file);
        audio.volume = 0.5;
        audio.play().catch(() => {
            console.error("No se pudo reproducir. Revisa si el nombre es exacto: " + file);
        });
    }
}
