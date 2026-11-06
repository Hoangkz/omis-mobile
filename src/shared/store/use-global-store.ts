import { create } from "zustand";

interface GlobalState {
  // Footer state
  showTabBar: boolean;
  heightSafeWithTabBar: number;

  // Common actions
  setGlobalState: (config: Partial<GlobalState>) => void;
  reset: () => void;
}

const DEFAULT_STATE = {
  showTabBar: true,
};

export const useGlobalStore = create<GlobalState>((set) => ({
  ...DEFAULT_STATE,
  heightSafeWithTabBar: 0,
  setGlobalState: (config) => set((state) => ({ ...state, ...config })),

  reset: () => set(() => ({ ...DEFAULT_STATE })),
}));
