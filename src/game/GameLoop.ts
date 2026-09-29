/** Responsabilidad ÚNICA: repetir un callback en cada frame mientras esté activo. */
export class GameLoop {
    private running = false;

    start(update: () => void): void {
        this.running = true;
        const frame = () => {
            if (!this.running) return;
            update();
            requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
    }

    stop(): void { this.running = false; }
}
