import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { formatPrice, getProductById } from '../data/products';
import { useShopStore } from '../store/useShopStore';

export function CartDrawer() {
  const open = useShopStore((state) => state.cartOpen);
  const cart = useShopStore((state) => state.cart);
  const setOpen = useShopStore((state) => state.setCartOpen);
  const changeQuantity = useShopStore((state) => state.changeQuantity);
  const remove = useShopStore((state) => state.removeFromCart);
  const reduce = useReducedMotion();
  const total = cart.reduce((sum, item) => sum + getProductById(item.productId).price * item.quantity, 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            className="drawer-backdrop"
            type="button"
            aria-label="بستن سبد خرید"
            onClick={() => setOpen(false)}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            className="cart-drawer"
            initial={reduce ? false : { x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 30 }}
            aria-label="سبد خرید"
          >
            <div className="cart-drawer__header">
              <div><ShoppingBag /><span><strong>سبد خرید</strong><small>{new Intl.NumberFormat('fa-IR').format(cart.length)} انتخاب</small></span></div>
              <button className="icon-button" type="button" onClick={() => setOpen(false)} data-gesture-target aria-label="بستن سبد خرید"><X /></button>
            </div>
            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="empty-cart"><ShoppingBag /><strong>سبد شما خالی است</strong><p>یک محصول را انتخاب کنید و رنگ دلخواه را به سبد بیفزایید.</p></div>
              ) : cart.map((item) => {
                const product = getProductById(item.productId);
                const color = product.colors.find((entry) => entry.id === item.colorId) ?? product.colors[0];
                return (
                  <article className="cart-item" key={`${item.productId}-${item.colorId}`}>
                    <img src={product.image} alt={product.name} loading="lazy" width="176" height="176" />
                    <div className="cart-item__content">
                      <strong>{product.shortName}</strong>
                      <span><i style={{ background: color.hex }} />{color.name}</span>
                      <b>{formatPrice(product.price * item.quantity)}</b>
                      <div className="quantity-control">
                        <button type="button" onClick={() => changeQuantity(item.productId, item.colorId, -1)} data-gesture-target aria-label="کم کردن تعداد"><Minus /></button>
                        <span>{new Intl.NumberFormat('fa-IR').format(item.quantity)}</span>
                        <button type="button" onClick={() => changeQuantity(item.productId, item.colorId, 1)} data-gesture-target aria-label="زیاد کردن تعداد"><Plus /></button>
                      </div>
                    </div>
                    <button className="remove-button" type="button" onClick={() => remove(item.productId, item.colorId)} data-gesture-target aria-label={`حذف ${product.shortName}`}><Trash2 /></button>
                  </article>
                );
              })}
            </div>
            {cart.length > 0 && (
              <div className="cart-summary">
                <div><span>جمع کل</span><strong>{formatPrice(total)}</strong></div>
                <button className="button button--primary" type="button" data-gesture-target onClick={() => window.alert('این یک سبد خرید نمایشی محلی است و پرداخت واقعی انجام نمی‌شود.')}>
                  ادامهٔ خرید نمایشی
                </button>
                <small>اطلاعات سبد فقط در همین مرورگر ذخیره می‌شود.</small>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
