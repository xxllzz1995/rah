/**
 * Phaser ↔ React 通信总线
 * Phaser 端 emit，React 端 on/off；反之亦然。
 */
type Handler = (...args: any[]) => void;

class EventBus {
  private listeners = new Map<string, Set<Handler>>();

  on(event: string, fn: Handler) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(fn);
    return () => this.off(event, fn);
  }

  off(event: string, fn: Handler) {
    this.listeners.get(event)?.delete(fn);
  }

  emit(event: string, ...args: any[]) {
    this.listeners.get(event)?.forEach((fn) => fn(...args));
  }
}

export const eventBus = new EventBus();
