import { BookOpen, CircleCheck, Hand, MoveDown, MoveLeft, MoveRight, HandMetal, Undo2, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useShopStore } from '../store/useShopStore';

const gestures = [
  { icon: Hand, title: '۱. کف دست باز', text: 'دست راست را باز و روبه‌روی وب‌کم نگه دارید؛ پس از یک مکث خیلی کوتاه کنترل فعال می‌شود.' },
  { icon: MoveLeft, title: '۲. مچ به چپ', text: 'بدون جابه‌جایی دست، مچ را طوری بچرخانید که انگشت‌ها به چپ اشاره کنند؛ محصول قبلی را ببینید.' },
  { icon: MoveRight, title: '۳. مچ به راست', text: 'مچ را بچرخانید تا پنج انگشت به راست اشاره کنند؛ محصول بعدی را ببینید. با چرخش به جهت مخالف، محصول هم برمی‌گردد.' },
  { icon: MoveDown, title: '۴. حرکت به پایین', text: 'پنج انگشت را باز نگه دارید و مچ را بچرخانید تا انگشت‌ها رو به پایین باشند؛ تا وارد صفحهٔ متفاوت و سبزرنگ جزئیات همان محصول شوید.' },
  { icon: CircleCheck, title: '۵. علامت OK', text: 'شست و اشاره را به شکل حلقه درآورید، سه انگشت دیگر را باز نگه دارید؛ یک محصول به سبد اضافه می‌شود.' },
  { icon: HandMetal, title: '۶. دو انگشت ✌️', text: 'فقط اشاره و وسط را به شکل V باز کنید و انگشت‌های دیگر را جمع کنید؛ سبد خرید فوراً باز می‌شود. دیگر نیازی نیست نشانه‌گیری کنید.' },
  { icon: Undo2, title: '۷. مشت، سپس کف باز', text: 'کف دست را مشت کنید و دوباره باز کنید؛ سبد یا راهنما بسته می‌شود یا به فروشگاه برمی‌گردید.' },
];

export function GestureGuide({ compact = false }: { compact?: boolean }) {
  const setOpen = useShopStore((state) => state.setGuideOpen);
  return (
    <section id="gesture-guide" className={`gesture-quick ${compact ? 'is-compact' : ''}`} aria-label="راهنمای سریع حرکات دست">
      <button className="gesture-quick__intro" type="button" onClick={() => setOpen(true)} data-gesture-target aria-label="باز کردن راهنمای کامل حرکات">
        <BookOpen /><span><strong>خرید بدون موس، فقط با یک دست!</strong><small>نمایش راهنمای ۷ حرکت · ✌️ سبد خرید</small></span>
      </button>
      <div className="gesture-quick__items">
        {gestures.slice(0, compact ? 3 : 4).map((gesture) => <span key={gesture.title}><gesture.icon /><b>{gesture.title.slice(3)}</b></span>)}
      </div>
    </section>
  );
}

export function GestureGuideModal() {
  const open = useShopStore((state) => state.guideOpen);
  const setOpen = useShopStore((state) => state.setGuideOpen);
  const reduce = useReducedMotion();
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button className="drawer-backdrop" type="button" onClick={() => setOpen(false)} aria-label="بستن راهنما" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.section className="gesture-modal" role="dialog" aria-modal="true" aria-labelledby="gesture-modal-title" initial={reduce ? false : { opacity: 0, y: 24, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: .98 }}>
            <header>
              <span><Hand /></span>
              <div><h2 id="gesture-modal-title">راهنمای کنترل یک‌دستی</h2><p>یک دست کافی است؛ دست را روبه‌روی وب‌کم نگه دارید و حرکت‌ها را واضح انجام دهید.</p></div>
              <button type="button" onClick={() => setOpen(false)} data-gesture-target aria-label="بستن راهنمای حرکات"><X /></button>
            </header>
            <div className="gesture-modal__grid">
              {gestures.map((gesture) => (
                <article key={gesture.title}><gesture.icon /><div><h3>{gesture.title}</h3><p>{gesture.text}</p></div></article>
              ))}
            </div>
            <p className="gesture-modal__note">ژست دو انگشت بدون حرکت‌دادن نشانگر به سمت آیکن، سبد را باز می‌کند. هر تغییر جهت مچ، یک محصول را عوض می‌کند. زوم و ژست دو دستی حذف شده‌اند؛ ماوس و لمس همچنان کار می‌کنند.</p>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}
