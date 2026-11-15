import { ChevronLeft, ChevronRight, Heart, ShoppingCart } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatPrice, PRODUCTS } from '../data/products';
import { useShopStore } from '../store/useShopStore';

export function ProductCarousel({ relatedOnly = false }: { relatedOnly?: boolean }) {
  const navigate = useNavigate();
  const trackRef = useRef<HTMLDivElement>(null);
  const selectedId = useShopStore((state) => state.selectedProductId);
  const selectedColors = useShopStore((state) => state.selectedColors);
  const wishlist = useShopStore((state) => state.wishlist);
  const selectProduct = useShopStore((state) => state.selectProduct);
  const addToCart = useShopStore((state) => state.addToCart);
  const toggleWishlist = useShopStore((state) => state.toggleWishlist);
  const reduce = useReducedMotion();
  const items = PRODUCTS.filter((product) => product.id !== selectedId);

  const scroll = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * Math.min(track.clientWidth * 0.75, 620), behavior: reduce ? 'auto' : 'smooth' });
  };

  const showProduct = (productId: (typeof PRODUCTS)[number]['id'], slug?: string) => {
    selectProduct(productId);
    if (relatedOnly && slug) navigate(`/product/${slug}`);
    else document.querySelector('.home-hero')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <div className="carousel-shell">
      <button className="carousel-arrow carousel-arrow--right" type="button" onClick={() => scroll(1)} aria-label="محصول بعدی"><ChevronRight /></button>
      <div className="product-carousel" ref={trackRef}>
        {items.map((product, index) => {
          const wished = wishlist.includes(product.id);
          const color = selectedColors[product.id] ?? product.colors[0].id;
          return (
            <motion.article
              className="product-card"
              key={product.id}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: reduce ? 0 : 0.38, delay: reduce ? 0 : index * 0.04 }}
            >
              <button className={`product-card__favorite ${wished ? 'is-active' : ''}`} type="button" onClick={() => toggleWishlist(product.id)} aria-label={wished ? `حذف ${product.name} از علاقه‌مندی‌ها` : `افزودن ${product.name} به علاقه‌مندی‌ها`} aria-pressed={wished}>
                <Heart fill={wished ? 'currentColor' : 'none'} />
              </button>
              <button className="product-card__main" type="button" onClick={() => showProduct(product.id, product.slug)} data-gesture-target>
                <span className="product-card__image"><img src={product.image} alt={product.name} loading="lazy" width="420" height="300" draggable={false} /></span>
                <span className="product-card__content"><strong dir="ltr">{product.name}</strong><small>{formatPrice(product.price)}</small></span>
              </button>
              <button className="product-card__cart" type="button" onClick={() => addToCart(product.id, color)} data-gesture-target aria-label={`افزودن ${product.name} به سبد خرید`}><ShoppingCart /></button>
            </motion.article>
          );
        })}
      </div>
      <button className="carousel-arrow carousel-arrow--left" type="button" onClick={() => scroll(-1)} aria-label="محصول قبلی"><ChevronLeft /></button>
    </div>
  );
}
