import { ArrowRight, Check, Heart, ShieldCheck, ShoppingCart, Star } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { GestureGuide } from '../components/GestureGuide';
import { ProductCarousel } from '../components/ProductCarousel';
import { ProductGallery } from '../components/ProductGallery';
import { formatNumber, formatPrice, getProductBySlug } from '../data/products';
import { useShopStore } from '../store/useShopStore';

export function ProductDetailPage() {
  const { slug } = useParams();
  const product = getProductBySlug(slug);
  const reduce = useReducedMotion();
  const selectedColors = useShopStore((state) => state.selectedColors);
  const wishlist = useShopStore((state) => state.wishlist);
  const selectColor = useShopStore((state) => state.selectColor);
  const selectProduct = useShopStore((state) => state.selectProduct);
  const addToCart = useShopStore((state) => state.addToCart);
  const toggleWishlist = useShopStore((state) => state.toggleWishlist);

  useEffect(() => {
    if (!product) return;
    selectProduct(product.id);
    document.title = `${product.name} | GestureShop`;
    return () => { document.title = 'GestureShop | فروشگاه هوشمند با کنترل حرکتی'; };
  }, [product, selectProduct]);

  if (!product) return <Navigate to="/" replace />;
  const color = product.colors.find((entry) => entry.id === selectedColors[product.id]) ?? product.colors[0];
  const wished = wishlist.includes(product.id);

  return (
    <main className="page page--detail page-with-camera">
      <div className="detail-topbar"><Link to="/" className="back-link"><ArrowRight /> بازگشت به فروشگاه</Link><span>{product.category}</span></div>

      <div className="detail-reel-heading"><span>✦ نمای اختصاصی محصول</span><strong>یک نگاه نزدیک‌تر به {product.shortName}</strong><span>02 / DETAILS</span></div>

      <section className="detail-layout" aria-labelledby="detail-product-title">
        <motion.div className="detail-gallery" initial={reduce ? false : { opacity: 0, scale: 0.985 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: reduce ? 0 : 0.48, ease: [0.16, 1, 0.3, 1] }}>
          <ProductGallery product={product} detail />
        </motion.div>

        <motion.aside className="detail-info" initial={reduce ? false : { opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: reduce ? 0 : 0.44, ease: [0.16, 1, 0.3, 1] }}>
          <div className="detail-info__eyebrow"><span>بررسی دقیق محصول</span><b>02</b></div>
          <div className="product-brand"><span>{product.brand}</span><small>{product.category}</small></div>
          <h1 id="detail-product-title" dir="ltr">{product.name}</h1>
          <p className="product-tagline">{product.tagline}</p>
          <div className="hero-rating"><Star fill="currentColor" /><b>{new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(product.rating)}</b><span>{formatNumber(product.reviews)} نظر ثبت‌شده</span></div>
          <div className="detail-purchase"><div><span>قیمت نهایی</span><strong>{formatPrice(product.price)}</strong></div><div className="detail-actions"><button className="button button--primary" type="button" onClick={() => addToCart(product.id, color.id)} data-gesture-target><ShoppingCart /> افزودن به سبد خرید</button><button className={`button button--icon ${wished ? 'is-active' : ''}`} type="button" onClick={() => toggleWishlist(product.id)} aria-label={wished ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}><Heart fill={wished ? 'currentColor' : 'none'} /></button></div></div>

          <p className="detail-description">{product.description}</p>

          <h2 className="detail-specs-heading"><ShieldCheck /> مشخصات کلیدی</h2>
          <div className="detail-specs" aria-label="مشخصات محصول">
            {product.specs.map((spec) => <div key={spec.label}><span>{spec.label}</span><strong dir="auto">{spec.value}</strong></div>)}
          </div>

          <div className="color-selector"><h2>رنگ موجود</h2><div>{product.colors.map((entry) => (
            <button key={entry.id} type="button" className={color.id === entry.id ? 'is-selected' : ''} onClick={() => selectColor(product.id, entry.id)} aria-label={`انتخاب رنگ ${entry.name}`} aria-pressed={color.id === entry.id}>
              <i style={{ background: entry.hex }} />{color.id === entry.id && <Check />}
            </button>
          ))}<b>{color.name}</b></div></div>

        </motion.aside>
      </section>

      <section className="catalog-section related-section" aria-labelledby="related-title"><div className="section-heading"><span aria-hidden="true" /><h2 id="related-title">محصولات مرتبط</h2><p>پیشنهادهای دیگر فروشگاه را ببینید.</p></div><ProductCarousel relatedOnly /></section>
      <GestureGuide compact />
    </main>
  );
}
