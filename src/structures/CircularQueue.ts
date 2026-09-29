/**
 * Cola circular genérica (estructura de datos pura).
 * Ya NO sabe nada de enemigos: antes tenía updateAll() y purge() que consultaban
 * isDead / reachedEnd. Ahora solo ofrece operaciones genéricas de cola.
 */
export class CircularQueue<T> {
    private queue: (T | null)[];
    private front = -1;
    private rear = -1;
    private count = 0;

    constructor(private readonly capacity: number) {
        this.queue = new Array<T | null>(capacity).fill(null);
    }

    get length(): number { return this.count; }
    isEmpty(): boolean { return this.count === 0; }
    isFull(): boolean { return this.count === this.capacity; }

    enqueue(item: T): boolean {
        if (this.isFull()) return false;
        this.rear = (this.rear + 1) % this.capacity;
        this.queue[this.rear] = item;
        if (this.front === -1) this.front = this.rear;
        this.count++;
        return true;
    }

    dequeue(): T | null {
        if (this.isEmpty()) return null;
        const item = this.queue[this.front];
        this.queue[this.front] = null;
        this.front = (this.front + 1) % this.capacity;
        this.count--;
        if (this.isEmpty()) { this.front = -1; this.rear = -1; }
        return item;
    }

    forEach(callback: (item: T) => void): void {
        this.toArray().forEach(callback);
    }

    /** Saca de la cola todos los elementos que cumplan el predicado. */
    removeWhere(predicate: (item: T) => boolean): void {
        const kept = this.toArray().filter(item => !predicate(item));
        this.queue = new Array<T | null>(this.capacity).fill(null);
        this.front = -1; this.rear = -1; this.count = 0;
        for (const item of kept) this.enqueue(item);
    }

    toArray(): T[] {
        const result: T[] = [];
        let idx = this.front;
        for (let i = 0; i < this.count; i++) {
            result.push(this.queue[idx] as T);
            idx = (idx + 1) % this.capacity;
        }
        return result;
    }
}
