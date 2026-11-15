import type { HandLandmarker, NormalizedLandmark } from '@mediapipe/tasks-vision';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../data/products';
import { useShopStore } from '../store/useShopStore';
import type { GestureName } from '../types';
import { GESTURE_CONFIG } from './config';
import { GestureEngine } from './GestureEngine';
import { gestureLabels, initialGestureState, useGestureStore } from './useGestureStore';

type GestureContextValue = {
  attachVideo: (node: HTMLVideoElement | null) => void;
  attachCanvas: (node: HTMLCanvasElement | null) => void;
  enableCamera: () => Promise<void>;
  disableCamera: () => void;
  retryCamera: () => Promise<void>;
  resetCalibration: () => void;
};

const GestureContext = createContext<GestureContextValue | null>(null);

const CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20], [0, 17],
];

const errorMessage = (error: unknown) => {
  const name = error instanceof DOMException ? error.name : '';
  if (!window.isSecureContext && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1')
    return 'برای دسترسی به دوربین، برنامه را روی HTTPS یا localhost باز کنید.';
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'اجازهٔ دوربین داده نشد. دسترسی Camera را در تنظیمات مرورگر فعال کنید.';
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') return 'هیچ دوربین قابل‌استفاده‌ای پیدا نشد.';
  if (name === 'NotReadableError' || name === 'TrackStartError') return 'دوربین در برنامهٔ دیگری در حال استفاده است یا فعلاً در دسترس نیست.';
  if (!navigator.mediaDevices?.getUserMedia) return 'این مرورگر از دسترسی استاندارد به دوربین پشتیبانی نمی‌کند.';
  return 'راه‌اندازی دوربین یا مدل تشخیص دست ناموفق بود. دوباره تلاش کنید.';
};

const drawLandmarks = (canvas: HTMLCanvasElement, hands: NormalizedLandmark[][]) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  hands.forEach((hand, handIndex) => {
    ctx.strokeStyle = handIndex === 0 ? 'rgba(19, 143, 91, .96)' : 'rgba(116, 216, 170, .92)';
    ctx.lineWidth = Math.max(2, canvas.width / 320);
    CONNECTIONS.forEach(([start, end]) => {
      ctx.beginPath();
      ctx.moveTo(hand[start].x * canvas.width, hand[start].y * canvas.height);
      ctx.lineTo(hand[end].x * canvas.width, hand[end].y * canvas.height);
      ctx.stroke();
    });
    hand.forEach((point, index) => {
      ctx.beginPath();
      ctx.fillStyle = [4, 8, 12, 16, 20].includes(index) ? '#effbf5' : '#0a7b4f';
      ctx.arc(point.x * canvas.width, point.y * canvas.height, Math.max(2.5, canvas.width / 210), 0, Math.PI * 2);
      ctx.fill();
    });
  });
};

export function GestureProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const engineRef = useRef(new GestureEngine());
  const activeRef = useRef(false);
  const runningRef = useRef(false);
  const rafRef = useRef(0);
  const previousVideoTimeRef = useRef(-1);
  const lastInferenceRef = useRef(0);
  const lastUiRef = useRef(0);
  const routeRef = useRef<'storefront' | 'detail'>(location.pathname.startsWith('/product/') ? 'detail' : 'storefront');

  useEffect(() => {
    routeRef.current = location.pathname.startsWith('/product/') ? 'detail' : 'storefront';
    const state = useGestureStore.getState();
    if (!state.enabled) return;
    state.setUi({
      phase: routeRef.current === 'detail' ? 'DETAIL_GALLERY' : activeRef.current ? 'STOREFRONT_ACTIVE' : 'STOREFRONT_IDLE',
      message: routeRef.current === 'detail' ? 'صفحه جزئیات باز شد؛ مچ را به طرفین کج کنید تا عکس عوض شود.' : 'مچ را به طرفین کج کنید یا دست را افقی حرکت دهید.',
    });
  }, [location.pathname]);

  const attachVideo = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && streamRef.current) {
      node.srcObject = streamRef.current;
      void node.play().catch(() => undefined);
    }
  }, []);

  const attachCanvas = useCallback((node: HTMLCanvasElement | null) => {
    canvasRef.current = node;
  }, []);

  const ensureLandmarker = useCallback(async () => {
    if (landmarkerRef.current) return landmarkerRef.current;
    useGestureStore.getState().setUi({ phase: 'LOADING_MODEL', message: 'در حال بارگذاری مدل تشخیص دست...' });
    const { FilesetResolver, HandLandmarker } = await import('@mediapipe/tasks-vision');
    const vision = await FilesetResolver.forVisionTasks('/mediapipe/wasm');
    const options = {
      baseOptions: { modelAssetPath: '/models/hand_landmarker.task', delegate: 'GPU' as const },
      runningMode: 'VIDEO' as const,
      numHands: 1,
      minHandDetectionConfidence: 0.36,
      minHandPresenceConfidence: 0.38,
      minTrackingConfidence: 0.38,
    };
    try {
      landmarkerRef.current = await HandLandmarker.createFromOptions(vision, options);
    } catch {
      landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
        ...options,
        baseOptions: { modelAssetPath: '/models/hand_landmarker.task', delegate: 'CPU' as const },
      });
    }
    return landmarkerRef.current;
  }, []);

  const processAction = useCallback(
    (action: ReturnType<GestureEngine['process']>['action']) => {
      if (!action) return;
      const shop = useShopStore.getState();
      const gesture = useGestureStore.getState();
      switch (action.type) {
        case 'activate':
          activeRef.current = true;
          gesture.setUi({
            controlActive: true,
            phase: routeRef.current === 'detail' ? 'DETAIL_GALLERY' : 'STOREFRONT_ACTIVE',
            lastAction: 'کنترل حرکتی فعال شد',
            message: 'کنترل بدون لمس آماده است.',
          });
          break;
        case 'swipe-left':
        case 'swipe-right': {
          const direction = action.type === 'swipe-right' ? 1 : -1;
          if (shop.cartOpen || shop.guideOpen || shop.mobileMenuOpen) break;
          if (routeRef.current === 'storefront') {
            shop.selectRelative(direction);
            const selected = PRODUCTS.find((item) => item.id === useShopStore.getState().selectedProductId)!;
            gesture.setUi({ lastAction: `${selected.shortName} انتخاب شد` });
          } else {
            shop.selectGalleryRelative(direction);
            gesture.setUi({ lastAction: 'نمای محصول تغییر کرد' });
          }
          break;
        }
        case 'open-detail': {
          if (routeRef.current !== 'storefront' || shop.cartOpen || shop.guideOpen || shop.mobileMenuOpen) break;
          const product = PRODUCTS.find((item) => item.id === shop.selectedProductId)!;
          gesture.setUi({ phase: 'NAVIGATION_TRANSITION', lastAction: `جزئیات ${product.shortName} باز شد` });
          navigate(`/product/${product.slug}`);
          break;
        }
        case 'open-cart': {
          if (shop.guideOpen || shop.mobileMenuOpen) break;
          if (!shop.cartOpen) {
            shop.setCartOpen(true);
            gesture.setUi({ lastAction: '✌️ سبد خرید باز شد' });
          }
          break;
        }
        case 'add-to-cart': {
          if (shop.cartOpen || shop.guideOpen || shop.mobileMenuOpen) break;
          const product = PRODUCTS.find((item) => item.id === shop.selectedProductId)!;
          shop.addToCart(product.id);
          gesture.setUi({ lastAction: `${product.shortName} به سبد خرید اضافه شد` });
          break;
        }
        case 'go-back':
          if (shop.cartOpen) {
            shop.setCartOpen(false);
            gesture.setUi({ lastAction: 'سبد خرید بسته شد' });
          } else if (shop.guideOpen) {
            shop.setGuideOpen(false);
            gesture.setUi({ lastAction: 'راهنمای حرکات بسته شد' });
          } else if (shop.mobileMenuOpen) {
            shop.setMobileMenuOpen(false);
            gesture.setUi({ lastAction: 'منو بسته شد' });
          } else if (routeRef.current === 'detail') {
            gesture.setUi({ phase: 'NAVIGATION_TRANSITION', lastAction: 'بازگشت به فروشگاه انجام شد' });
            navigate('/');
          }
          break;
      }
    },
    [navigate],
  );

  const loop = useCallback(() => {
    if (!runningRef.current) return;
    rafRef.current = requestAnimationFrame(loop);
    if (document.visibilityState !== 'visible') return;
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;
    if (!video || !landmarker || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;

    const now = performance.now();
    if (now - lastInferenceRef.current < 1000 / GESTURE_CONFIG.inferenceFps || video.currentTime === previousVideoTimeRef.current) return;
    lastInferenceRef.current = now;
    previousVideoTimeRef.current = video.currentTime;

    try {
      const result = landmarker.detectForVideo(video, now);
      const hands = result.landmarks as NormalizedLandmark[][];
      const canvas = canvasRef.current;
      if (canvas) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
        drawLandmarks(canvas, hands);
      }

      const frame = engineRef.current.process(hands, now, routeRef.current, activeRef.current);
      const store = useGestureStore.getState();
      store.setCursor(frame.cursor);
      processAction(frame.action);

      if (now - lastUiRef.current > 1000 / GESTURE_CONFIG.uiFps) {
        lastUiRef.current = now;
        const phase =
          routeRef.current === 'detail'
            ? 'DETAIL_GALLERY'
            : activeRef.current
              ? 'STOREFRONT_ACTIVE'
              : 'STOREFRONT_IDLE';
        store.setUi({
          phase,
          handsDetected: hands.length,
          currentGesture: frame.gesture,
          gestureLabel: gestureLabels[frame.gesture],
          stability: frame.stability,
          message: hands.length ? (activeRef.current ? '✌️ سبد خرید · 👌 افزودن · ↔️ تعویض' : 'کف دست باز را روبه‌روی دوربین بگیرید.') : 'دستی در تصویر دیده نمی‌شود.',
          error: null,
        });
      }
    } catch (error) {
      useGestureStore.getState().setUi({ error: errorMessage(error), phase: 'ERROR', message: 'ردیابی متوقف شد.' });
    }
  }, [processAction]);

  const stopStream = useCallback(() => {
    runningRef.current = false;
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    const canvas = canvasRef.current;
    canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    engineRef.current.reset();
    activeRef.current = false;
    useGestureStore.setState({ ...initialGestureState, cursor: null });
  }, []);

  const enableCamera = useCallback(async () => {
    const ui = useGestureStore.getState();
    ui.setUi({ phase: 'REQUESTING_PERMISSION', message: 'در انتظار اجازهٔ دوربین...', error: null });
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new DOMException('unsupported', 'NotSupportedError');
      if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
        throw new DOMException('insecure', 'SecurityError');
      const landmarkerPromise = ensureLandmarker();
      const streamPromise = navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30, max: 30 } },
      });
      const [stream] = await Promise.all([streamPromise, landmarkerPromise]);
      stopStream();
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
      }
      const track = stream.getVideoTracks()[0];
      track.addEventListener('ended', () => {
        if (!runningRef.current) return;
        runningRef.current = false;
        useGestureStore.getState().setUi({
          enabled: false,
          phase: 'ERROR',
          error: 'جریان دوربین قطع شد. اتصال دوربین را بررسی و دوباره تلاش کنید.',
          message: 'دوربین متوقف شده است.',
        });
      });
      runningRef.current = true;
      ui.setUi({
        enabled: true,
        controlActive: false,
        phase: 'CALIBRATING',
        message: 'دست خود را در مرکز کادر قرار دهید.',
        error: null,
      });
      rafRef.current = requestAnimationFrame(loop);
    } catch (error) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      ui.setUi({ enabled: false, controlActive: false, phase: 'ERROR', error: errorMessage(error), message: 'دوربین آماده نشد.' });
    }
  }, [ensureLandmarker, loop, stopStream]);

  const disableCamera = useCallback(() => stopStream(), [stopStream]);
  const retryCamera = useCallback(async () => {
    stopStream();
    await enableCamera();
  }, [enableCamera, stopStream]);
  const resetCalibration = useCallback(() => {
    engineRef.current.reset();
    activeRef.current = false;
    useGestureStore.getState().setUi({
      controlActive: false,
      phase: 'CALIBRATING',
      currentGesture: 'NONE' as GestureName,
      gestureLabel: gestureLabels.NONE,
      stability: 0,
      lastAction: 'کالیبراسیون از نو آغاز شد',
      message: 'دست خود را در مرکز کادر قرار دهید.',
    });
  }, []);

  useEffect(() => () => {
    runningRef.current = false;
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    landmarkerRef.current?.close();
  }, []);

  const value = useMemo(
    () => ({ attachVideo, attachCanvas, enableCamera, disableCamera, retryCamera, resetCalibration }),
    [attachVideo, attachCanvas, enableCamera, disableCamera, retryCamera, resetCalibration],
  );

  return <GestureContext.Provider value={value}>{children}</GestureContext.Provider>;
}

export const useGestureController = () => {
  const value = useContext(GestureContext);
  if (!value) throw new Error('useGestureController must be used inside GestureProvider');
  return value;
};
