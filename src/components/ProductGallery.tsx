import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useShopStore } from '../store/useShopStore';
import type { Product } from '../types';

/** Real 2D product photos only. Camera gestures never zoom or rotate products. */
export function ProductGallery({ product, detail = false }: { product: Product; detail?: boolean }) {
  const reduce = useReducedMotion();
  const imageIndexes = useShopStore((state) => state.imageIndexes);
  const selectImage = useShopStore((state) => state.selectGalleryImage);
  const selectRelative = useShopStore((state) => state.selectGalleryRelative);
  const index = imageIndexes[product.id] ?? 0;

  return (
    <section className={`product-gallery ${detail ? 'is-detail' : ''}`} aria-label={`گالری تصاویر ${product.name}`}>
      <div className="product-gallery__main">
        {detail && <span className="gallery-detail-stamp">گالری اختصاصی · ۳ نما</span>}
        <span className="gallery-counter" aria-label={`تصویر ${index + 1} از ${product.images.length}`}>
          {new Intl.NumberFormat('fa-IR').format(index + 1)} / {new Intl.NumberFormat('fa-IR').format(product.images.length)}
        </span>
        <motion.img
          key={`${product.id}-${index}`}
          src={product.images[index]}
          alt={`${product.name}، نمای ${new Intl.NumberFormat('fa-IR').format(index + 1)}`}
          width="1400" height="1000"
          sizes={detail ? '(max-width: 767px) 100vw, 60vw' : '(max-width: 767px) 100vw, 52vw'}
          loading="eager"
          fetchPriority={product.id === 'laptop' && index === 0 ? 'high' : 'auto'}
          draggable={false}
          initial={reduce ? false : { opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: reduce ? 0 : .3, ease: [0.16, 1, 0.3, 1] }}
          drag={reduce ? false : 'x'}
          dragConstraints={{ left: -90, right: 90 }}
          dragElastic={0.15}
          onDragEnd={(_, info) => {
            if (Math.abs(info.offset.x) > 52) selectRelative(info.offset.x < 0 ? 1 : -1);
          }}
        />
        <button className="gallery-arrow gallery-arrow--next" type="button" onClick={() => selectRelative(1)} data-gesture-target aria-label="تصویر بعدی"><ChevronLeft /></button>
        <button className="gallery-arrow gallery-arrow--prev" type="button" onClick={() => selectRelative(-1)} data-gesture-target aria-label="تصویر قبلی"><ChevronRight /></button>
      </div>
      <div className="product-gallery__thumbs" aria-label="انتخاب نمای محصول">
        {product.images.map((image, imageIndex) => (
          <button key={image} className={imageIndex === index ? 'is-active' : ''} type="button"
            onClick={() => selectImage(product.id, imageIndex)} data-gesture-target aria-pressed={imageIndex === index}
            aria-label={`نمای ${new Intl.NumberFormat('fa-IR').format(imageIndex + 1)} از ${product.name}`}>
            <img src={image} alt="" draggable={false} loading="lazy" width="280" height="200" />
          </button>
        ))}
      </div>
    </section>
  );
}
