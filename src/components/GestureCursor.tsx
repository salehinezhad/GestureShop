import { useGestureStore } from '../gesture/useGestureStore';

export function GestureCursor() {
  const cursor = useGestureStore((state) => state.cursor);
  const active = useGestureStore((state) => state.controlActive);
  const hands = useGestureStore((state) => state.handsDetected);
  if (!active || !cursor || !hands) return null;
  return (
    <div
      className="gesture-cursor"
      style={{ transform: `translate3d(${cursor.x * window.innerWidth}px, ${cursor.y * window.innerHeight}px, 0)` }}
      aria-hidden="true"
    >
      <span />
    </div>
  );
}
