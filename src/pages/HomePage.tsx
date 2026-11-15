import { ChevronLeft, ChevronRight, Cpu, HardDrive, Heart, Info, MemoryStick, Monitor, ShoppingCart, Star } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { GestureGuide } from '../components/GestureGuide';
import { ProductCarousel } from '../components/ProductCarousel';
import { ProductGallery } from '../components/ProductGallery';
import { formatNumber, formatPrice, PRODUCTS } from '../data/products';
import { useShopStore } from '../store/useShopStore';

const specIcons = [Cpu, Monitor, MemoryStick, HardDrive];

export function HomePage() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const selectedId = useShopStore((state) => state.selectedProductId);
  const selectedColors = useShopStore((state) => state.selectedColors);
  const wishlist = useShopStore((state) => state.wishlist);
  const addToCart = useShopStore((state) => state.addToCart);
  const toggleWishlist = useShopStore((state) => state.toggleWishlist);
  const selectRelative = useShopStore((state) => state.selectRelative);
  const product = PRODUCTS.find((item) => item.id === selectedId) ?? PRODUCTS[0];
  const color = product.colors.find((entry) => entry.id === selectedColors[product.id]) ?? product.colors[0];
  const wished = wishlist.includes(product.id);
  const productPosition = PRODUCTS.findIndex((entry) => entry.id === product.id) + 1;

  return (
    <main className="page page--home page-with-camera">
      <section className="home-hero" aria-labelledby="home-product-title">
        <motion.div
          className="hero-product-info"
          key={`info-${product.id}`}
          initial={reduce ? false : { opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: reduce ? 0 : 0.44, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="hero-switcher" aria-label="انتخاب محصول اصلی">
            <span className="hero-switcher__tag">با یک دست خرید کن ✦</span>
            <div className="hero-switcher__controls">
              <button type="button" onClick={() => selectRelative(-1)} aria-label="محصول قبلی"><ChevronRight /></button>
              <span>{new Intl.NumberFormat('fa-IR').format(productPosition)} از {new Intl.NumberFormat('fa-IR').format(PRODUCTS.length)}</span>
              <button type="button" onClick={() => selectRelative(1)} aria-label="محصول بعدی"><ChevronLeft /></button>
            </div>
          </div>
          <div className="product-brand"><span>{product.brand}</span><small>{product.category}</small></div>
          <h1 id="home-product-title" dir="ltr">{product.name}</h1>
          <p className="product-tagline">{product.tagline}</p>

          <div className="hero-specs" aria-label="مشخصات کلیدی">
            {product.specs.map((spec, index) => {
              const Icon = specIcons[index] ?? Cpu;
              return <div key={spec.label}><Icon /><span><b dir="auto">{spec.value}</b><small>{spec.label}</small></span></div>;
            })}
          </div>

          <div className="hero-rating"><Star fill="currentColor" /><b>{new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(product.rating)}</b><span>{formatNumber(product.reviews)} نظر ثبت‌شده</span></div>
          <div className="hero-price"><span>قیمت:</span><strong>{formatPrice(product.price)}</strong>{product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}</div>
          <div className="hero-actions">
            <button className="button button--primary" type="button" onClick={() => addToCart(product.id, color.id)} data-gesture-target><ShoppingCart /> افزودن به سبد خرید</button>
            <button className="button button--secondary" type="button" onClick={() => navigate(`/product/${product.slug}`)} data-gesture-target><Info /> مشاهدهٔ جزئیات</button>
            <button className={`button button--icon ${wished ? 'is-active' : ''}`} type="button" onClick={() => toggleWishlist(product.id)} aria-label={wished ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'} aria-pressed={wished}><Heart fill={wished ? 'currentColor' : 'none'} /></button>
          </div>
        </motion.div>

        <motion.div
          className="hero-gallery"
          key={`gallery-${product.id}`}
          initial={reduce ? false : { opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduce ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <ProductGallery product={product} />
        </motion.div>
      </section>

      <section className="catalog-section" id="products" aria-labelledby="catalog-title">
        <div className="section-heading"><span aria-hidden="true" /><h2 id="catalog-title">محصولات منتخب</h2><p>برای تغییر محصول اصلی، یک کارت را انتخاب کنید.</p></div>
        <ProductCarousel />
      </section>

      <GestureGuide />
    </main>
  );
}
