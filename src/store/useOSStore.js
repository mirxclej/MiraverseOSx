import { create } from 'zustand';

const MENU_BAR_HEIGHT = 32;
const DEFAULT_WALLPAPER =
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop';
const DEFAULT_WINDOW_SIZE = { width: 720, height: 480 };

const createSignalRunnerSession = () => ({
  energy: 6,
  intel: 0,
  turn: 0,
  phase: 'Briefing',
  log: ['Mission control online. Scan sectors to gather intel.'],
});

// Cascade new windows so they don't stack perfectly on top of each other.
const spawnPosition = (count) => ({
  x: 120 + (count % 6) * 32,
  y: MENU_BAR_HEIGHT + 32 + (count % 6) * 32,
});

const getNextWindowId = (app) => app.id || Math.random().toString(36).slice(2, 11);

const getTopWindowId = (windows) =>
  windows.slice().sort((a, b) => b.zIndex - a.zIndex)[0]?.id || null;

const buildWindow = (app, count, zIndex) => ({
  id: getNextWindowId(app),
  title: app.title,
  contentKey: app.contentKey || app.id,
  kind: app.kind || 'app',
  zIndex,
  isMinimized: false,
  isMaximized: false,
  position: app.position || spawnPosition(count),
  size: app.size || DEFAULT_WINDOW_SIZE,
  minSize: app.minSize || { width: 420, height: 280 },
  ...app,
});

export const useOSStore = create((set) => ({
  windows: [],
  activeWindowId: null,
  wallpaper: DEFAULT_WALLPAPER,
  gameplay: {
    activeGameId: 'signal-runner',
    sessions: {
      'signal-runner': createSignalRunnerSession(),
    },
  },

  addWindow: (app) => set((state) => {
    // If the app already has a window, just focus/restore it.
    const existing = state.windows.find((w) => w.id === app.id);
    const maxZ = Math.max(0, ...state.windows.map((w) => w.zIndex));

    if (existing) {
      return {
        windows: state.windows.map((w) =>
          w.id === app.id ? { ...w, zIndex: maxZ + 1, isMinimized: false } : w
        ),
        activeWindowId: app.id,
      };
    }

    const newWindow = buildWindow(app, state.windows.length, maxZ + 1);

    return {
      windows: [...state.windows, newWindow],
      activeWindowId: newWindow.id,
    };
  }),

  toggleApp: (app) => set((state) => {
    const existing = state.windows.find((w) => w.id === app.id);
    const maxZ = Math.max(0, ...state.windows.map((w) => w.zIndex));

    if (existing) {
      // If the app is open and currently active, pressing its button closes it
      if (state.activeWindowId === app.id && !existing.isMinimized) {
        const remaining = state.windows.filter((w) => w.id !== app.id);
        return {
          windows: remaining,
          activeWindowId: getTopWindowId(remaining),
        };
      }

      // If it's minimized or behind another window, focus & unminimize it
      return {
        windows: state.windows.map((w) =>
          w.id === app.id ? { ...w, zIndex: maxZ + 1, isMinimized: false } : w
        ),
        activeWindowId: app.id,
      };
    }

    // App is not open yet, create and open it
    const newWindow = buildWindow(app, state.windows.length, maxZ + 1);

    return {
      windows: [...state.windows, newWindow],
      activeWindowId: newWindow.id,
    };
  }),

  closeWindow: (id) => set((state) => {
    const remaining = state.windows.filter((w) => w.id !== id);
    return {
      windows: remaining,
      activeWindowId:
        state.activeWindowId === id
          ? getTopWindowId(remaining)
          : state.activeWindowId,
    };
  }),

  focusWindow: (id) => set((state) => {
    const maxZ = Math.max(0, ...state.windows.map((w) => w.zIndex));
    return {
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, zIndex: maxZ + 1, isMinimized: false } : w
      ),
      activeWindowId: id,
    };
  }),

  toggleMinimize: (id) => set((state) => ({
    windows: state.windows.map((w) => {
      if (w.id !== id) return w;
      return { ...w, isMinimized: !w.isMinimized };
    }),
    activeWindowId:
      state.activeWindowId === id
        ? getTopWindowId(state.windows.filter((w) => w.id !== id && !w.isMinimized))
        : state.activeWindowId,
  })),

  toggleMaximize: (id) => set((state) => ({
    windows: state.windows.map((w) =>
      w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
    ),
  })),

  // Persist a window's position after the user drags it.
  moveWindow: (id, position) => set((state) => ({
    windows: state.windows.map((w) =>
      w.id === id ? { ...w, position } : w
    ),
  })),

  clearActive: () => set({ activeWindowId: null }),

  setWallpaper: (url) => set({ wallpaper: url }),

  setActiveGame: (gameId) =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        activeGameId: gameId,
        sessions: state.gameplay.sessions[gameId]
          ? state.gameplay.sessions
          : {
              ...state.gameplay.sessions,
              [gameId]: createSignalRunnerSession(),
            },
      },
    })),

  playSignalRunnerTurn: () =>
    set((state) => {
      const session = state.gameplay.sessions['signal-runner'] || createSignalRunnerSession();

      if (session.energy <= 0) {
        return {
          gameplay: {
            ...state.gameplay,
            sessions: {
              ...state.gameplay.sessions,
              'signal-runner': {
                ...session,
                turn: session.turn + 1,
                phase: 'Cooldown',
                log: ['No energy left. Reboot to continue operation.', ...session.log].slice(0, 10),
              },
            },
          },
        };
      }

      const intelGain = 1 + (session.turn % 3);
      const phases = ['Briefing', 'Recon', 'Extraction', 'Debrief'];
      const nextTurn = session.turn + 1;

      return {
        gameplay: {
          ...state.gameplay,
          sessions: {
            ...state.gameplay.sessions,
            'signal-runner': {
              ...session,
              energy: session.energy - 1,
              intel: session.intel + intelGain,
              turn: nextTurn,
              phase: phases[nextTurn % phases.length],
              log: [`Turn ${nextTurn}: +${intelGain} intel secured.`, ...session.log].slice(0, 10),
            },
          },
        },
      };
    }),

  resetSignalRunner: () =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        sessions: {
          ...state.gameplay.sessions,
          'signal-runner': createSignalRunnerSession(),
        },
      },
    })),
}));
