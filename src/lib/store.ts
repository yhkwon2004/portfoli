/**
 * A value that changes often and that only one component displays.
 *
 * The telemetry reading arrives eight times a second. Held as state on the stage, every sample
 * re-rendered the stage and, through it, all twelve mounted chapters — thousands of elements
 * reconciled eight times a second to move six digits in one corner. Held here, the only thing
 * that re-renders is the component that subscribes (see `useSyncExternalStore`).
 */
export type Store<T> = {
  readonly get: () => T;
  readonly set: (next: T) => void;
  readonly subscribe: (fn: () => void) => () => void;
};

export function createStore<T>(initial: T): Store<T> {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set: (next) => {
      if (Object.is(next, value)) return;
      value = next;
      for (const fn of listeners) fn();
    },
    subscribe: (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
