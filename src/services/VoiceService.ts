/** Responsabilidad ÚNICA: reproducir un archivo de voz. (Cada torre/enemigo trae el suyo en su config.) */
export class VoiceService {
    play(file: string | undefined): void {
        if (!file) return;
        const audio = new Audio(file);
        audio.volume = 0.5;
        audio.play().catch(() => {
            console.error("No se pudo reproducir. Revisa si el nombre es exacto: " + file);
        });
    }
}
