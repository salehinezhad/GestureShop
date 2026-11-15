import { Check, ShoppingBag, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';
import { useShopStore } from '../store/useShopStore';

export function CartToast() {
  const notice = useShopStore((state) => state.cartNotice);
  const clear = useShopStore((state) => state.clearCartNotice);
  const setCartOpen = useShopStore((state) => state.setCartOpen);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(clear, 3400);
    return () => window.clearTimeout(timer);
  }, [notice, clear]);
  return (
    <AnimatePresence>
      {notice && (
        <motion.div role="status" aria-live="polite" className="cart-toast"
          initial={{ opacity: 0, y: 16, scale: .95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10 }}>
          <span className="cart-toast__icon"><Check /></span><strong>{notice.message}</strong>
          <button type="button" onClick={() => { setCartOpen(true); clear(); }}><ShoppingBag /> مشاهده سبد</button>
          <button className="cart-toast__close" type="button" onClick={clear} aria-label="بستن اعلان"><X /></button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
