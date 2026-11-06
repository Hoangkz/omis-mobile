import { ThemeColorKey } from '@/src/lib/theme';
import { create } from 'zustand';

interface BackgroundColorState {
  backgroundColor: ThemeColorKey;
  setBackgroundColor: (backgroundColor: ThemeColorKey) => void;
  resetBackgroundColor: () => void;
}

const DEFAULT_BACKGROUND_COLOR_STATE: { backgroundColor: ThemeColorKey } = {
  backgroundColor: 'lightPrimaryBackground',
}

export const useBackgroundColorStore = create<BackgroundColorState>((set) => ({
  ...DEFAULT_BACKGROUND_COLOR_STATE,
  setBackgroundColor: (backgroundColor) => set({ backgroundColor }),
  resetBackgroundColor: () => set(() => ({ ...DEFAULT_BACKGROUND_COLOR_STATE })),
}));