import { useSyncExternalStore } from "react";

/**
 * Shared state between the HTML overlay and the 3D scene.
 *
 * `rig` is read every frame by the scene and written on scroll, so it is a plain
 * mutable object. `state` drives React UI and only changes on discrete events.
 */
export const rig = {
  /** Continuous station position: 2.4 = 40% of the way from station 2 to 3. */
  s: 0,
};

type State = {
  station: number;
  /** Index into `projects` shown on the monitor; -1 shows the terminal. */
  project: number;
  /** performance.now() of the last wave request. */
  waveAt: number;
  ready: boolean;
  /** Clicking the window flips the room between golden hour and night. */
  night: boolean;
};

let state: State = { station: 0, project: -1, waveAt: 0, ready: false, night: false };
const listeners = new Set<() => void>();

export function setState(patch: Partial<State>) {
  const next = { ...state, ...patch };
  if (
    next.station === state.station &&
    next.project === state.project &&
    next.waveAt === state.waveAt &&
    next.ready === state.ready &&
    next.night === state.night
  ) {
    return;
  }
  state = next;
  listeners.forEach((l) => l());
}

export function getState() {
  return state;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Smooth-scrolls the page to a section; the camera follows the scroll. */
export function goTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  );
}
