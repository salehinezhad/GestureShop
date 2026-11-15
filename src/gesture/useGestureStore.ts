import { create } from 'zustand';
import type { GestureUiState } from '../types';

type GestureState = GestureUiState & {
  cursor: { x: number; y: number } | null;
  setUi: (next: Partial<GestureUiState>) => void;
  setCursor: (cursor: { x: number; y: number } | null) => void;
};

export const initialGestureState: GestureUiState = {
  phase: 'CAMERA_OFF',
  enabled: false,
  controlActive: false,
  handsDetected: 0,
  currentGesture: 'NONE',
  gestureLabel: 'حرکتی دیده نمی‌شود',
  lastAction: 'هنوز اقدامی انجام نشده',
  stability: 0,
  message: 'برای شروع، دوربین را روشن کنید.',
  error: null,
};

export const useGestureStore = create<GestureState>((set) => ({
  ...initialGestureState,
  cursor: null,
  setUi: (next) => set(next),
  setCursor: (cursor) => set({ cursor }),
}));

export const gestureLabels = {
  NONE: 'حرکتی دیده نمی‌شود',
  OPEN_PALM: 'کف دست باز',
  FIST: 'مشت بسته',
  OK_SIGN: 'علامت OK',
  VICTORY: 'دو انگشت ✌️ · باز کردن سبد',
  POINTING: 'انگشت اشاره',
  SWIPE_LEFT: 'حرکت به چپ',
  SWIPE_RIGHT: 'حرکت به راست',
  SWIPE_DOWN: 'حرکت به پایین',
} as const;
