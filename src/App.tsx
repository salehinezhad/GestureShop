import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useLayoutEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { CartDrawer } from './components/CartDrawer';
import { CartToast } from './components/CartToast';
import { GestureGuideModal } from './components/GestureGuide';
import { GestureCameraPanel } from './components/GestureCameraPanel';
import { GestureCursor } from './components/GestureCursor';
import { Header } from './components/Header';
import { GestureProvider } from './gesture/GestureProvider';
import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { useShopStore } from './store/useShopStore';

function ResponsiveCameraDefaults() {
  useEffect(() => {
    const media = window.matchMedia('(max-width: 1199px)');
    const compact = (event: MediaQueryListEvent | MediaQueryList) => {
      if (event.matches) useShopStore.getState().setCameraMinimized(true);
    };
    compact(media);
    media.addEventListener('change', compact);
    return () => media.removeEventListener('change', compact);
  }, []);
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  const reduce = useReducedMotion();
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={reduce ? false : { opacity: 0, scale: 0.992 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={reduce ? undefined : { opacity: 0, scale: 1.008 }}
        transition={{ duration: reduce ? 0 : 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <GestureProvider>
      <ResponsiveCameraDefaults />
      <Header />
      <GestureCameraPanel />
      <GestureCursor />
      <AnimatedRoutes />
      <CartDrawer />
      <CartToast />
      <GestureGuideModal />
    </GestureProvider>
  );
}
