/**
 * Emisor de eventos tipado y minimalista.
 * Permite que una clase AVISE que pasó algo sin conocer quién le escucha
 * (por ejemplo: Cozy avisa "morí" sin saber nada de puntajes, DOM o sonidos).
 */
export class Emitter<E extends { [K in keyof E]: unknown[] }> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private handlers = new Map<keyof E, Array<(...args: any[]) => void>>();

    on<K extends keyof E>(event: K, handler: (...args: E[K]) => void): void {
        const list = this.handlers.get(event) ?? [];
        list.push(handler);
        this.handlers.set(event, list);
    }

    emit<K extends keyof E>(event: K, ...args: E[K]): void {
        this.handlers.get(event)?.forEach(h => h(...args));
    }
}
