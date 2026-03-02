type EventMap = {
  starClicked: { starId: string; systemId: string };
  systemClicked: { systemId: string };
  systemHovered: { systemId: string };
  starHovered: { starId: string; systemId: string };
  planetHovered: { planetId: string };
  moonHovered: { moonId: string };
  asteroidHovered: { asteroidId: string };
  hoverCleared: undefined;
  requestSystemView: { systemId: string };
  requestGalaxyView: { reason: "user_back_to_galaxy" | "zoom_threshold" };
  backgroundClicked: undefined;
};

type EventKey = keyof EventMap;
type Listener<K extends EventKey> = (payload: EventMap[K]) => void;

export class EventBridge {
  private listeners: Map<EventKey, Set<Listener<any>>> = new Map();

  on<K extends EventKey>(event: K, listener: Listener<K>): () => void {
    const set = this.listeners.get(event) ?? new Set();
    set.add(listener);
    this.listeners.set(event, set);

    return () => this.off(event, listener);
  }

  off<K extends EventKey>(event: K, listener: Listener<K>): void {
    const set = this.listeners.get(event);
    if (!set) return;
    set.delete(listener);
    if (set.size === 0) this.listeners.delete(event);
  }

  emit<K extends EventKey>(event: K, payload: EventMap[K]): void {
    const set = this.listeners.get(event);
    if (!set) return;
    set.forEach((listener) => listener(payload));
  }

  clear(): void {
    this.listeners.clear();
  }
}
