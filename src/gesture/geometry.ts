import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { GestureName } from '../types';

export const distance2D = (a: NormalizedLandmark, b: NormalizedLandmark) => Math.hypot(a.x - b.x, a.y - b.y);

const angle = (a: NormalizedLandmark, b: NormalizedLandmark, c: NormalizedLandmark) => {
  const ab = { x: a.x - b.x, y: a.y - b.y, z: (a.z ?? 0) - (b.z ?? 0) };
  const cb = { x: c.x - b.x, y: c.y - b.y, z: (c.z ?? 0) - (b.z ?? 0) };
  const dot = ab.x * cb.x + ab.y * cb.y + ab.z * cb.z;
  const mag = Math.hypot(ab.x, ab.y, ab.z) * Math.hypot(cb.x, cb.y, cb.z);
  return Math.acos(Math.max(-1, Math.min(1, dot / Math.max(mag, 1e-6)))) * (180 / Math.PI);
};

const isFingerExtended = (hand: NormalizedLandmark[], mcp: number, pip: number, dip: number, tip: number) => {
  // Joint angles are orientation-independent: a sideways/open tilted hand remains OPEN_PALM.
  const straight = angle(hand[mcp], hand[pip], hand[dip]) > 133 && angle(hand[pip], hand[dip], hand[tip]) > 127;
  const reach = distance2D(hand[tip], hand[0]) > distance2D(hand[pip], hand[0]) * 1.025;
  return straight && reach;
};

export const palmScale = (hand: NormalizedLandmark[]) => Math.max(distance2D(hand[0], hand[9]), distance2D(hand[5], hand[17]), 0.04);

export const palmCenter = (hand: NormalizedLandmark[]) => ({
  x: (hand[0].x + hand[5].x + hand[9].x + hand[13].x + hand[17].x) / 5,
  y: (hand[0].y + hand[5].y + hand[9].y + hand[13].y + hand[17].y) / 5,
});

/**
 * Mirrored orientation of the line from wrist to middle finger MCP.
 *  0 = fingers up, -1 = fingers toward viewer's left, +1 = viewer's right.
 * This complements actual sideways wrist movement; the user can tilt a single
 * open hand without translating it outside the webcam's field of view.
 */
export const handLean = (hand: NormalizedLandmark[]) => {
  const dx = hand[0].x - hand[9].x; // mirrored preview, so reverse x
  const dy = hand[0].y - hand[9].y;
  return Math.atan2(dx, dy) / (Math.PI / 2);
};

/** Finger direction in mirrored webcam coordinates, independent of wrist translation.
 * The four fingertips are averaged to remain stable when a single finger jitters.
 * Screen x is mirrored to match the live camera preview.
 */
export type PalmDirection = 'up' | 'left' | 'right' | 'down' | 'diagonal';
export const palmDirection = (hand: NormalizedLandmark[]): PalmDirection => {
  if (hand.length < 21) return 'diagonal';
  const tips = [8, 12, 16, 20];
  const tipX = tips.reduce((sum, i) => sum + hand[i].x, 0) / tips.length;
  const tipY = tips.reduce((sum, i) => sum + hand[i].y, 0) / tips.length;
  const baseX = (hand[5].x + hand[9].x + hand[13].x + hand[17].x) / 4;
  const baseY = (hand[5].y + hand[9].y + hand[13].y + hand[17].y) / 4;
  const dx = baseX - tipX; // webcam preview is mirrored
  const dy = tipY - baseY; // positive is downward on screen
  const length = Math.hypot(dx, dy);
  if (length < palmScale(hand) * .30) return 'diagonal';
  const x = dx / length;
  const y = dy / length;
  if (x <= -.70) return 'left';
  if (x >= .70) return 'right';
  if (y >= .70) return 'down';
  if (y <= -.70) return 'up';
  return 'diagonal';
};

export const classifyHand = (hand: NormalizedLandmark[]): GestureName => {
  if (hand.length < 21) return 'NONE';

  const index = isFingerExtended(hand, 5, 6, 7, 8);
  const middle = isFingerExtended(hand, 9, 10, 11, 12);
  const ring = isFingerExtended(hand, 13, 14, 15, 16);
  const pinky = isFingerExtended(hand, 17, 18, 19, 20);
  const extendedCount = [index, middle, ring, pinky].filter(Boolean).length;
  const scale = palmScale(hand);
  const thumbIndexDistance = distance2D(hand[4], hand[8]) / scale;

  // Preserve the existing reliable OK command. Its extended ring/pinky fingers
  // differentiate it from a two-finger V/peace sign.
  if (thumbIndexDistance < 0.37 && [middle, ring, pinky].filter(Boolean).length >= 2) return 'OK_SIGN';

  // V sign: index and middle up, ring and little finger tucked away.
  // No pointing at an icon and no dwell timer required to open the cart.
  if (index && middle && !ring && !pinky && distance2D(hand[8], hand[12]) / scale > 0.22) return 'VICTORY';

  // Tilted, sideways or partially occluded thumbs are common with webcams.
  // Rely on four extended fingers, not thumb visibility.
  if (extendedCount === 4) return 'OPEN_PALM';

  if (thumbIndexDistance < 0.20) return 'NONE'; // stray pinch is not a gesture
  if (index && !middle && !ring && !pinky) return 'POINTING';

  const tipsNearPalm = [8, 12, 16, 20].filter((tip) => distance2D(hand[tip], hand[0]) / scale < 1.28).length;
  if (extendedCount === 0 && tipsNearPalm >= 3) return 'FIST';
  return 'NONE';
};
