import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { describe, expect, it } from 'vitest';
import { GestureEngine } from './GestureEngine';
import { classifyHand } from './geometry';

const point = (x: number, y: number): NormalizedLandmark => ({ x, y, z: 0, visibility: 1 });
const openHand = (): NormalizedLandmark[] => [
  point(.50, .85),
  point(.43, .75), point(.36, .67), point(.30, .60), point(.23, .52),
  point(.43, .65), point(.42, .48), point(.41, .35), point(.40, .20),
  point(.49, .63), point(.49, .43), point(.49, .29), point(.49, .13),
  point(.55, .65), point(.56, .46), point(.57, .34), point(.58, .21),
  point(.61, .69), point(.64, .54), point(.66, .44), point(.68, .33),
];
const fistHand = (): NormalizedLandmark[] => [
  point(.50, .85),
  point(.44, .75), point(.43, .69), point(.47, .69), point(.51, .73),
  point(.43, .65), point(.42, .57), point(.46, .62), point(.45, .72),
  point(.49, .63), point(.49, .54), point(.52, .61), point(.51, .72),
  point(.55, .65), point(.56, .57), point(.57, .64), point(.56, .73),
  point(.61, .69), point(.62, .62), point(.62, .68), point(.61, .75),
];
const okHand = () => {
  const hand = openHand();
  hand[4] = point(.405, .255);
  hand[8] = point(.40, .25);
  return hand;
};
const pointingHand = () => {
  const hand = fistHand();
  for (let i = 5; i <= 8; i++) hand[i] = openHand()[i];
  return hand;
};
const pinchHand = () => {
  const hand = fistHand();
  hand[4] = point(.43, .58);
  hand[8] = point(.435, .585);
  return hand;
};
const shift = (hand: NormalizedLandmark[], dx: number, dy = 0) => hand.map((landmark) => ({ ...landmark, x: landmark.x + dx, y: landmark.y + dy }));
const peaceHand = () => {
  const hand = fistHand();
  for (let index = 5; index <= 12; index++) hand[index] = openHand()[index];
  return hand;
};
const rotateHand = (hand: NormalizedLandmark[], radians: number) => hand.map((p) => {
  const dx = p.x - hand[0].x;
  const dy = p.y - hand[0].y;
  return { ...p, x: hand[0].x + dx * Math.cos(radians) - dy * Math.sin(radians), y: hand[0].y + dx * Math.sin(radians) + dy * Math.cos(radians) };
});

describe('one-hand pose classification', () => {
  it('recognizes palm, fist, OK and pointer without any pinch/zoom', () => {
    expect(classifyHand(openHand())).toBe('OPEN_PALM');
    expect(classifyHand(fistHand())).toBe('FIST');
    expect(classifyHand(okHand())).toBe('OK_SIGN');
    expect(classifyHand(pointingHand())).toBe('POINTING');
    expect(classifyHand(peaceHand())).toBe('VICTORY');
    expect(classifyHand(rotateHand(openHand(), Math.PI / 2.9))).toBe('OPEN_PALM');
    expect(classifyHand(pinchHand())).toBe('NONE');
  });
});

describe('one-hand shopping gestures', () => {
  it('activates only after holding a stable open palm', () => {
    const engine = new GestureEngine();
    expect(engine.process([openHand()], 0, 'storefront', false).action).toBeUndefined();
    expect(engine.process([openHand()], 180, 'storefront', false).action).toBeUndefined();
    expect(engine.process([openHand()], 270, 'storefront', false).action).toEqual({ type: 'activate' });
  });

  it('adds once per OK pose, never repeatedly while held', () => {
    const engine = new GestureEngine();
    engine.process([okHand()], 0, 'storefront', true);
    expect(engine.process([okHand()], 430, 'storefront', true).action).toEqual({ type: 'add-to-cart' });
    expect(engine.process([okHand()], 1400, 'storefront', true).action).toBeUndefined();
    engine.process([fistHand()], 1600, 'storefront', true);
    engine.process([fistHand()], 1850, 'storefront', true);
    engine.process([okHand()], 1900, 'storefront', true);
    expect(engine.process([okHand()], 2320, 'storefront', true).action).toEqual({ type: 'add-to-cart' });
  });

  it('opens the cart directly with a V/peace sign in under 250ms, no aiming or dwell', () => {
    const engine = new GestureEngine();
    expect(engine.process([peaceHand()], 0, 'storefront', true).action).toBeUndefined();
    expect(engine.process([peaceHand()], 190, 'storefront', true).action).toEqual({ type: 'open-cart' });
    expect(engine.process([peaceHand()], 950, 'storefront', true).action).toBeUndefined();
  });

  it('recognizes tilting the open hand sideways, even without moving the wrist', () => {
    const engine = new GestureEngine();
    const neutral = openHand();
    const tilted = rotateHand(neutral, Math.PI / 2.9);
    engine.process([neutral], 0, 'storefront', true);
    engine.process([tilted], 100, 'storefront', true);
    expect(engine.process([tilted], 290, 'storefront', true).action).toEqual({ type: 'swipe-left' });
    expect(engine.process([tilted], 650, 'storefront', true).action).toBeUndefined();
    engine.process([neutral], 800, 'storefront', true);
    engine.process([neutral], 950, 'storefront', true);
    engine.process([tilted], 1020, 'storefront', true);
    expect(engine.process([tilted], 1200, 'storefront', true).action).toEqual({ type: 'swipe-left' });
  });

  it('changes products when fingers rotate left then right, without moving wrist', () => {
    const engine = new GestureEngine();
    const left = rotateHand(openHand(), Math.PI / 2);
    const right = rotateHand(openHand(), -Math.PI / 2);
    engine.process([openHand()], 0, 'storefront', true);
    engine.process([left], 80, 'storefront', true);
    expect(engine.process([left], 160, 'storefront', true).action).toEqual({ type: 'swipe-left' });
    expect(engine.process([left], 430, 'storefront', true).action).toBeUndefined();
    engine.process([right], 460, 'storefront', true);
    expect(engine.process([right], 540, 'storefront', true).action).toEqual({ type: 'swipe-right' });
  });

  it('opens details when all fingers point down without translating wrist', () => {
    const engine = new GestureEngine();
    const down = rotateHand(openHand(), Math.PI);
    engine.process([openHand()], 0, 'storefront', true);
    engine.process([down], 100, 'storefront', true);
    expect(engine.process([down], 180, 'storefront', true).action).toEqual({ type: 'open-detail' });
    expect(engine.process([down], 450, 'storefront', true).action).toBeUndefined();
  });

  it('does not open detail again when fingers point down inside detail view', () => {
    const engine = new GestureEngine();
    const down = rotateHand(openHand(), Math.PI);
    engine.process([openHand()], 0, 'detail', true);
    engine.process([down], 100, 'detail', true);
    expect(engine.process([down], 180, 'detail', true).action).toBeUndefined();
  });

  it('returns on fist then open palm', () => {
    const engine = new GestureEngine();
    engine.process([fistHand()], 0, 'detail', true);
    engine.process([fistHand()], 410, 'detail', true);
    engine.process([openHand()], 520, 'detail', true);
    expect(engine.process([openHand()], 960, 'detail', true).action).toEqual({ type: 'go-back' });
  });

  it('never produces any pinch or two-hand zoom action', () => {
    const engine = new GestureEngine();
    engine.process([pinchHand()], 0, 'storefront', true);
    expect(engine.process([pinchHand()], 450, 'storefront', true).action).toBeUndefined();
    const frame = engine.process([openHand(), shift(openHand(), .1)], 800, 'storefront', true);
    expect(frame.gesture).not.toBe('TWO_HAND_ZOOM');
  });
});
