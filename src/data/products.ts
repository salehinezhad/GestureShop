import type { Product, ProductKind } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: 'laptop', slug: 'macbook-pro-14-m4', brand: 'Apple', name: 'MacBook Pro 14″ (M4)', shortName: 'MacBook Pro M4',
    category: 'لپ‌تاپ حرفه‌ای', tagline: 'قدرت حرفه‌ای برای خلاقیت، کار و بازی',
    description: 'مک‌بوک پرو ۱۴ اینچی با تراشهٔ M4، نمایشگر درخشان Liquid Retina XDR و حافظهٔ یکپارچه برای جریان کاری سریع و کم‌مصرف.',
    price: 139900000, oldPrice: 146500000, rating: 4.9, reviews: 1420,
    image: '/assets/products/macbook-pro-m4-featured.webp',
    images: ['/assets/products/macbook-pro-m4-featured.webp', '/assets/products/macbook-pro-m4-2.webp', '/assets/products/macbook-pro-m4-3.webp'],
    colors: [{ id: 'silver', name: 'نقره‌ای', hex: '#d9dbdd' }],
    specs: [
      { label: 'پردازنده', value: 'Apple M4 · 10-core CPU' }, { label: 'نمایشگر', value: '14.2″ Liquid Retina XDR' },
      { label: 'حافظه', value: '24GB Unified Memory' }, { label: 'ذخیره‌سازی', value: '1TB SSD' },
    ],
  },
  {
    id: 'headphones', slug: 'sony-wh-1000xm5', brand: 'Sony', name: 'Sony WH-1000XM5', shortName: 'Sony WH-1000XM5',
    category: 'هدفون بی‌سیم', tagline: 'سکوت هوشمند، صدای دقیق',
    description: 'هدفون پریمیوم سونی با حذف نویز تطبیقی، صدای شفاف و طراحی سبک برای سفر، کار و شنیدن طولانی.',
    price: 16900000, rating: 4.8, reviews: 984,
    image: '/assets/products/sony-wh-1000xm5-1.webp',
    images: ['/assets/products/sony-wh-1000xm5-1.webp', '/assets/products/sony-wh-1000xm5-2.webp', '/assets/products/sony-wh-1000xm5-3.webp'],
    colors: [{ id: 'black', name: 'مشکی', hex: '#18191b' }],
    specs: [
      { label: 'حذف نویز', value: 'Adaptive ANC' }, { label: 'شارژدهی', value: 'تا ۳۰ ساعت' },
      { label: 'درایور', value: '30mm Carbon Fiber' }, { label: 'اتصال', value: 'Bluetooth 5.2 · LDAC' },
    ],
  },
  {
    id: 'smartphone', slug: 'iphone-17-pro-max', brand: 'Apple', name: 'iPhone 17 Pro Max', shortName: 'iPhone 17 Pro Max',
    category: 'گوشی هوشمند', tagline: 'طراحی یکپارچه، دوربین حرفه‌ای',
    description: 'آیفون ۱۷ پرو مکس با بدنهٔ نارنجی Cosmic Orange، نمایشگر ۶٫۹ اینچی ProMotion و سامانهٔ دوربین حرفه‌ای ۴۸ مگاپیکسلی.',
    price: 98900000, rating: 4.8, reviews: 2136,
    image: '/assets/products/iphone-17-pro-max-1.webp',
    images: ['/assets/products/iphone-17-pro-max-1.webp', '/assets/products/iphone-17-pro-max-2.webp', '/assets/products/iphone-17-pro-max-3.webp'],
    colors: [{ id: 'orange', name: 'نارنجی کیهانی', hex: '#e87936' }],
    specs: [
      { label: 'پردازنده', value: 'A19 Pro' }, { label: 'نمایشگر', value: '6.9″ Super Retina XDR' },
      { label: 'دوربین', value: '48MP Pro Fusion System' }, { label: 'حافظه', value: '256GB' },
    ],
  },
  {
    id: 'smartwatch', slug: 'apple-watch-series-10', brand: 'Apple', name: 'Apple Watch Series 10', shortName: 'Apple Watch Series 10',
    category: 'ساعت هوشمند', tagline: 'باریک‌تر، روشن‌تر و دقیق‌تر',
    description: 'اپل واچ سری ۱۰ با نمایشگر بزرگ Wide-Angle OLED، بدنهٔ باریک و حسگرهای کامل سلامت و فعالیت روزانه.',
    price: 39900000, rating: 4.7, reviews: 764,
    image: '/assets/products/apple-watch-series-10-featured.webp',
    images: ['/assets/products/apple-watch-series-10-featured.webp', '/assets/products/apple-watch-series-10-2.webp', '/assets/products/apple-watch-series-10-3.webp'],
    colors: [{ id: 'jet-black', name: 'مشکی براق', hex: '#111214' }],
    specs: [
      { label: 'بدنه', value: '46mm Aluminum' }, { label: 'نمایشگر', value: 'Wide-Angle OLED' },
      { label: 'تراشه', value: 'Apple S10 SiP' }, { label: 'مقاومت', value: '50m Water Resistant' },
    ],
  },
  {
    id: 'camera', slug: 'canon-eos-r8', brand: 'Canon', name: 'Canon EOS R8', shortName: 'Canon EOS R8',
    category: 'دوربین بدون‌آینه', tagline: 'فول‌فریم سبک برای تصویر حرفه‌ای',
    description: 'دوربین بدون‌آینهٔ سبک Canon با حسگر فول‌فریم، فوکوس سریع Dual Pixel و ویدیوی 4K برای عکاسی و تولید محتوا.',
    price: 98000000, rating: 4.8, reviews: 531,
    image: '/assets/products/canon-eos-r8-1.webp',
    images: ['/assets/products/canon-eos-r8-1.webp', '/assets/products/canon-eos-r8-2.webp', '/assets/products/canon-eos-r8-3.webp'],
    colors: [{ id: 'black', name: 'مشکی', hex: '#151617' }],
    specs: [
      { label: 'حسگر', value: '24.2MP Full-Frame CMOS' }, { label: 'ویدیو', value: '4K 60p · 6K Oversampled' },
      { label: 'فوکوس', value: 'Dual Pixel CMOS AF II' }, { label: 'وزن', value: '461g' },
    ],
  },
  {
    id: 'speaker', slug: 'jbl-charge-5', brand: 'JBL', name: 'JBL Charge 5', shortName: 'JBL Charge 5',
    category: 'اسپیکر قابل‌حمل', tagline: 'صدای پرقدرت در هر سفر',
    description: 'اسپیکر مقاوم JBL با صدای قدرتمند، شارژدهی طولانی و پاوربانک داخلی برای خانه، سفر و فضای باز.',
    price: 8900000, rating: 4.7, reviews: 1254,
    image: '/assets/products/jbl-charge-5-featured.webp',
    images: ['/assets/products/jbl-charge-5-featured.webp', '/assets/products/jbl-charge-5-2.webp', '/assets/products/jbl-charge-5-3.webp'],
    colors: [{ id: 'black', name: 'مشکی', hex: '#18191b' }],
    specs: [
      { label: 'توان خروجی', value: '40W RMS' }, { label: 'شارژدهی', value: 'تا ۲۰ ساعت' },
      { label: 'مقاومت', value: 'IP67' }, { label: 'اتصال', value: 'Bluetooth 5.1' },
    ],
  },
];

export const getProductBySlug = (slug?: string) => PRODUCTS.find((product) => product.slug === slug);
export const getProductById = (id: ProductKind) => PRODUCTS.find((product) => product.id === id)!;
export const formatPrice = (price: number) => `${new Intl.NumberFormat('fa-IR').format(price)} تومان`;
export const formatNumber = (value: number) => new Intl.NumberFormat('fa-IR').format(value);
