// One shared state for physical objects, the sound popover and settings drawer.
const values = { scene: 'city', brush: 75, paused: false, rain: 'medium', master: 45,
  sound: { rain: 55, city: 0, wind: 0 }, playing: false };
const listeners = new Set();
export const state = values;
export function update(patch) { Object.assign(values, patch); listeners.forEach(fn => fn(values)); }
export function subscribe(fn) { listeners.add(fn); fn(values); return () => listeners.delete(fn); }
