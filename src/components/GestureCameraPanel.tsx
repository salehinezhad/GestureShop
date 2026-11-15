import { Activity, BookOpen, Camera, CameraOff, ChevronDown, ChevronUp, Eye, EyeOff, Hand, RefreshCw, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { useGestureController } from '../gesture/GestureProvider';
import { useGestureStore } from '../gesture/useGestureStore';
import { useShopStore } from '../store/useShopStore';

const phaseLabels = {
  CAMERA_OFF: 'دوربین خاموش',
  LOADING_MODEL: 'بارگذاری مدل',
  REQUESTING_PERMISSION: 'در انتظار اجازه',
  CALIBRATING: 'در حال کالیبراسیون',
  STOREFRONT_IDLE: 'آماده‌سازی کنترل',
  STOREFRONT_ACTIVE: 'کنترل فروشگاه',
  DETAIL_GALLERY: 'کنترل گالری',
  NAVIGATION_TRANSITION: 'تغییر صفحه',
  ERROR: 'نیازمند بررسی',
} as const;

export function GestureCameraPanel() {
  const { attachVideo, attachCanvas, enableCamera, disableCamera, retryCamera, resetCalibration } = useGestureController();
  const ui = useGestureStore();
  const minimized = useShopStore((state) => state.cameraMinimized);
  const setMinimized = useShopStore((state) => state.setCameraMinimized);
  const setGuideOpen = useShopStore((state) => state.setGuideOpen);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const busy = ui.phase === 'LOADING_MODEL' || ui.phase === 'REQUESTING_PERMISSION';

  return (
    <aside className={`camera-panel glass-panel ${minimized ? 'is-minimized' : ''}`} aria-label="کنترل دوربین و حرکات دست">
      <div className="camera-panel__header">
        <div className="camera-panel__title">
          <span className={`status-light ${ui.enabled && !ui.error ? 'is-live' : ''}`} aria-hidden="true" />
          <div>
            <strong>کنترل با حرکت دست</strong>
            <small>{ui.enabled ? '● دوربین روشن' : '○ دوربین خاموش'} · {phaseLabels[ui.phase]}</small>
          </div>
        </div>
        <div className="icon-actions">
          <button
            className="icon-button"
            type="button"
            onClick={() => setMinimized(!minimized)}
            aria-label={minimized ? 'باز کردن پنل دوربین' : 'کوچک کردن پنل دوربین'}
            title={minimized ? 'باز کردن پنل' : 'کوچک کردن پنل'}
            data-gesture-target
          >
            {minimized ? <ChevronDown /> : <ChevronUp />}
          </button>
          <button
            className="icon-button"
            type="button"
            onClick={() => (ui.enabled ? disableCamera() : void enableCamera())}
            aria-label={ui.enabled ? 'خاموش کردن دوربین' : 'روشن کردن دوربین'}
            title={ui.enabled ? 'خاموش کردن دوربین' : 'روشن کردن دوربین'}
            disabled={busy}
            data-gesture-target
          >
            {ui.enabled ? <CameraOff /> : <Camera />}
          </button>
        </div>
      </div>

      <div className="camera-panel__body">
          <div className="camera-preview">
            <video ref={attachVideo} autoPlay muted playsInline aria-label="پیش‌نمایش زندهٔ وب‌کم" />
            <canvas ref={attachCanvas} className={showLandmarks ? '' : 'is-hidden'} aria-hidden="true" />
            {!ui.enabled && (
              <div className="camera-placeholder">
                <Hand />
                <p>{busy ? ui.message : 'دوربین فقط با اجازهٔ شما فعال می‌شود.'}</p>
                {!busy && (
                  <button className="button button--small" type="button" onClick={() => void enableCamera()} data-gesture-target aria-label="روشن کردن دوربین">
                    <Camera /> روشن کردن دوربین
                  </button>
                )}
              </div>
            )}
            {ui.enabled && ui.handsDetected === 0 && <div className="tracking-lost">دست را داخل کادر قرار دهید</div>}
            {busy && <div className="camera-loading" aria-live="polite"><span />{ui.message}</div>}
          </div>

          <div className="camera-status" aria-live="polite">
            <div className="camera-status__row">
              <span><Activity /> وضعیت کنترل</span>
              <b className={ui.controlActive ? 'text-success' : ''}>{ui.controlActive ? 'فعال' : 'منتظر کف دست باز'}</b>
            </div>
            <div className="camera-status__row">
              <span><Hand /> حرکت شناخته‌شده</span>
              <b>{ui.gestureLabel}</b>
            </div>
            <div className="stability-row">
              <div>
                <span>پایداری زمانی</span>
                <small>بر پایهٔ مدت ثابت ماندن حرکت</small>
              </div>
              <strong>{new Intl.NumberFormat('fa-IR', { style: 'percent', maximumFractionDigits: 0 }).format(ui.stability)}</strong>
            </div>
            <div className="stability-meter" aria-label={`پایداری زمانی ${Math.round(ui.stability * 100)} درصد`}>
              <span style={{ transform: `scaleX(${ui.stability})` }} />
            </div>
            <div className="camera-shortcuts"><b>✌️ باز کردن سبد</b><b>👌 افزودن</b><b>↔️ تعویض</b></div>

          <div className="last-action"><span>آخرین اقدام</span><b>{ui.lastAction}</b></div>
          </div>

          {ui.error && (
            <div className="camera-error" role="alert">
              <p>{ui.error}</p>
              <button className="button button--small button--ghost" type="button" onClick={() => void retryCamera()}>
                <RefreshCw /> تلاش دوباره
              </button>
            </div>
          )}

          <div className="camera-panel__footer">
            <button className="text-button" type="button" onClick={() => setShowLandmarks((value) => !value)}>
              {showLandmarks ? <EyeOff /> : <Eye />} {showLandmarks ? 'پنهان‌کردن نقاط دست' : 'نمایش نقاط دست'}
            </button>
            <button className="text-button" type="button" onClick={resetCalibration} disabled={!ui.enabled}>
              <RotateCcw /> کالیبراسیون دوباره
            </button>
          </div>
          <button className="camera-guide-button" type="button" onClick={() => setGuideOpen(true)} data-gesture-target aria-label="باز کردن راهنمای کامل حرکات">
            <BookOpen /> راهنمای کامل حرکات
          </button>
      </div>
    </aside>
  );
}
