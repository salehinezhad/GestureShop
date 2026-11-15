import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { GestureName } from '../types';
import { GESTURE_CONFIG as C } from './config';
import { classifyHand, palmCenter, palmDirection } from './geometry';

export type InteractionMode = 'storefront' | 'detail';
export type EngineAction =
  | { type: 'activate' }
  | { type: 'swipe-left' }
  | { type: 'swipe-right' }
  | { type: 'open-detail' }
  | { type: 'add-to-cart' }
  | { type: 'open-cart' }
  | { type: 'go-back' };

export type EngineFrame = {
  gesture: GestureName;
  stability: number;
  cursor: { x: number; y: number } | null;
  action?: EngineAction;
};

type HistoryPoint = { x: number; y: number; t: number };

/**
 * Existing one-hand interaction state machine, retuned for natural, fast poses.
 * A sideways translation OR leaning an open palm switches products. A V/peace
 * sign opens the cart immediately without aiming at an icon. No pinch/zoom.
 */
export class GestureEngine {
  private candidate: GestureName = 'NONE';
  private candidateSince = 0;
  private fistArmedAt = 0;
  private lastNavigationAt = -Infinity;
  private lastSwipeAt = -Infinity;
  private lastSelectAt = -Infinity;
  private lastCartAt = -Infinity;
  private cursor: { x: number; y: number } | null = null;
  private history: HistoryPoint[] = [];
  private swipeReady = true;
  private stillSince = 0;
  private lastWrist: HistoryPoint | null = null;
  private tiltArmed = true;
  private tiltDirection: -1 | 0 | 1 = 0;
  private tiltSince = 0;
  private neutralSince = 0;
  private okLatched = false;
  private notOkSince = 0;
  private vLatched = false;
  private notVSince = 0;
  private lastSeenAt = 0;
  private directionCandidate: ReturnType<typeof palmDirection> = 'diagonal';
  private directionSince = 0;
  private lastDirection: ReturnType<typeof palmDirection> = 'up';
  private directionReady = true;

  reset() {
    this.candidate = 'NONE';
    this.candidateSince = 0;
    this.fistArmedAt = 0;
    this.cursor = null;
    this.history = [];
    this.swipeReady = true;
    this.stillSince = 0;
    this.lastWrist = null;
    this.tiltArmed = true;
    this.tiltDirection = 0;
    this.tiltSince = 0;
    this.neutralSince = 0;
    this.okLatched = false;
    this.notOkSince = 0;
    this.vLatched = false;
    this.notVSince = 0;
    this.directionCandidate = 'diagonal';
    this.directionSince = 0;
    this.lastDirection = 'up';
    this.directionReady = true;
    this.lastSwipeAt = -Infinity;
    this.lastSelectAt = -Infinity;
    this.lastCartAt = -Infinity;
    this.lastNavigationAt = -Infinity;
  }

  private registerSwipe(now: number, action: EngineAction, wrist: HistoryPoint): EngineFrame {
    this.lastSwipeAt = now;
    this.lastNavigationAt = now;
    this.swipeReady = false;
    this.tiltArmed = false;
    this.stillSince = 0;
    this.neutralSince = 0;
    this.history = [];
    this.lastWrist = wrist;
    const gesture: GestureName = action.type === 'open-detail'
      ? 'SWIPE_DOWN' : action.type === 'swipe-right' ? 'SWIPE_RIGHT' : 'SWIPE_LEFT';
    return { gesture, stability: 1, cursor: this.cursor, action };
  }

  process(hands: NormalizedLandmark[][], now: number, mode: InteractionMode, active: boolean): EngineFrame {
    if (!hands.length) {
      if (now - this.lastSeenAt > C.trackingLossResetMs) this.reset();
      return { gesture: 'NONE', stability: 0, cursor: null };
    }

    this.lastSeenAt = now;
    const primary = hands[0];
    const center = palmCenter(primary);
    const pose = classifyHand(primary);
    const pointerPoint = pose === 'POINTING' ? primary[8] : center;
    const displayPoint = { x: 1 - pointerPoint.x, y: pointerPoint.y };
    const wrist = { x: 1 - primary[0].x, y: primary[0].y, t: now };
    this.cursor = this.cursor
      ? { x: this.cursor.x + (displayPoint.x - this.cursor.x) * C.cursorSmoothing, y: this.cursor.y + (displayPoint.y - this.cursor.y) * C.cursorSmoothing }
      : displayPoint;

    if (pose !== this.candidate) {
      this.candidate = pose;
      this.candidateSince = now;
      this.history = [];
      this.stillSince = 0;
      this.tiltDirection = 0;
      this.tiltSince = 0;
    }
    const heldMs = now - this.candidateSince;
    const requiredMs = pose === 'OPEN_PALM' ? C.openPalmHoldMs
      : pose === 'OK_SIGN' ? C.okHoldMs
      : pose === 'VICTORY' ? C.vHoldMs : C.fistHoldMs;
    const stability = pose === 'NONE' ? 0 : Math.min(1, heldMs / requiredMs);

    if (pose !== 'OK_SIGN') {
      if (!this.notOkSince) this.notOkSince = now;
      if (now - this.notOkSince >= C.okReleaseMs) this.okLatched = false;
    } else this.notOkSince = 0;

    if (pose !== 'VICTORY') {
      if (!this.notVSince) this.notVSince = now;
      if (now - this.notVSince >= C.vReleaseMs) this.vLatched = false;
    } else this.notVSince = 0;

    if (!active) {
      this.lastWrist = wrist;
      if (pose === 'OPEN_PALM' && heldMs >= C.openPalmHoldMs) {
        this.candidateSince = now;
        this.lastNavigationAt = now;
        this.lastSwipeAt = now; // suppress an unwanted swipe when raising the hand to activate
        this.history = [];
        this.directionReady = false; // the first upright palm only activates
        this.lastDirection = 'up';
        return { gesture: pose, stability: 1, cursor: this.cursor, action: { type: 'activate' } };
      }
      return { gesture: pose, stability, cursor: this.cursor };
    }

    if (pose === 'FIST' && heldMs >= C.fistHoldMs && !this.fistArmedAt) this.fistArmedAt = now;
    if (pose === 'OPEN_PALM' && heldMs >= C.openPalmSequenceHoldMs && this.fistArmedAt > 0 && now - this.fistArmedAt <= C.fistToOpenWindowMs && now - this.lastNavigationAt > C.navigationCooldownMs) {
      this.fistArmedAt = 0;
      this.lastNavigationAt = now;
      this.history = [];
      this.swipeReady = false;
      return { gesture: pose, stability: 1, cursor: this.cursor, action: { type: 'go-back' } };
    }
    if (this.fistArmedAt && now - this.fistArmedAt > C.fistToOpenWindowMs) this.fistArmedAt = 0;

    // One quick V sign directly opens the cart; unlike the old pointer-dwell,
    // this never depends on the camera-to-screen cursor calibration.
    if (pose === 'VICTORY' && !this.vLatched && heldMs >= C.vHoldMs && now - this.lastCartAt >= C.cartCooldownMs) {
      this.vLatched = true;
      this.lastCartAt = now;
      this.history = [];
      return { gesture: pose, stability: 1, cursor: this.cursor, action: { type: 'open-cart' } };
    }

    // Keep the original reliable OK gesture and its one-action-per-pose latch.
    if (pose === 'OK_SIGN' && !this.okLatched && heldMs >= C.okHoldMs && now - this.lastSelectAt >= C.selectCooldownMs) {
      this.okLatched = true;
      this.lastSelectAt = now;
      this.history = [];
      return { gesture: pose, stability: 1, cursor: this.cursor, action: { type: 'add-to-cart' } };
    }

    // Direction of the FIVE OPEN FINGERS is the command, not hand travel.
    // Each distinct direction is an edge: a fast left->right turn is two actions,
    // while holding a pose cannot scroll through the entire catalog.
    if (pose === 'OPEN_PALM') {
      const direction = palmDirection(primary);
      if (direction !== this.directionCandidate) {
        this.directionCandidate = direction;
        this.directionSince = now;
      }
      if (direction === 'up' || direction === 'diagonal') {
        this.directionReady = true;
      } else if (direction !== this.lastDirection) {
        // Reversing direction is itself a new gesture; no neutral reset required.
        this.directionReady = true;
      }
      if (direction !== 'diagonal' && direction !== 'up' && this.directionReady &&
          now - this.directionSince >= C.directionHoldMs &&
          now - this.lastSwipeAt >= C.directionCooldownMs) {
        const action: EngineAction | null = direction === 'left'
          ? { type: 'swipe-left' }
          : direction === 'right'
            ? { type: 'swipe-right' }
            : mode === 'storefront' ? { type: 'open-detail' } : null;
        if (action) {
          this.lastDirection = direction;
          this.directionReady = false;
          return this.registerSwipe(now, action, wrist);
        }
      }
    } else {
      this.directionCandidate = 'diagonal';
      this.directionReady = true;
    }
    this.lastWrist = wrist;
    return { gesture: pose, stability, cursor: this.cursor };
  }
}
