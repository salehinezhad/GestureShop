import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PRODUCTS } from '../data/products';
import type { CartItem, ProductKind } from '../types';

type ShopState = {
  selectedProductId: ProductKind;
  selectedColors: Partial<Record<ProductKind, string>>;
  imageIndexes: Partial<Record<ProductKind, number>>;
  cartNotice: { id: number; message: string } | null;
  cart: CartItem[];
  wishlist: ProductKind[];
  cartOpen: boolean;
  guideOpen: boolean;
  mobileMenuOpen: boolean;
  cameraMinimized: boolean;
  searchQuery: string;
  selectProduct: (id: ProductKind) => void;
  selectRelative: (direction: -1 | 1) => void;
  selectGalleryImage: (productId: ProductKind, index: number) => void;
  selectGalleryRelative: (direction: -1 | 1) => void;
  clearCartNotice: () => void;
  selectColor: (productId: ProductKind, colorId: string) => void;
  addToCart: (productId: ProductKind, colorId?: string) => void;
  changeQuantity: (productId: ProductKind, colorId: string, delta: number) => void;
  removeFromCart: (productId: ProductKind, colorId: string) => void;
  toggleWishlist: (productId: ProductKind) => void;
  setCartOpen: (open: boolean) => void;
  setGuideOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setCameraMinimized: (minimized: boolean) => void;
  setSearchQuery: (query: string) => void;
};

const defaultColors = Object.fromEntries(PRODUCTS.map((p) => [p.id, p.colors[0].id])) as Record<ProductKind, string>;

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      selectedProductId: 'laptop',
      selectedColors: defaultColors,
      imageIndexes: {},
      cartNotice: null,
      cart: [],
      wishlist: [],
      cartOpen: false,
      guideOpen: false,
      mobileMenuOpen: false,
      cameraMinimized: false,
      searchQuery: '',
      selectProduct: (id) => set({ selectedProductId: id }),
      selectRelative: (direction) => {
        const current = PRODUCTS.findIndex((p) => p.id === get().selectedProductId);
        const next = (current + direction + PRODUCTS.length) % PRODUCTS.length;
        set({ selectedProductId: PRODUCTS[next].id });
      },
      selectGalleryImage: (productId, index) => {
        const length = PRODUCTS.find((product) => product.id === productId)?.images.length ?? 1;
        const safeIndex = (index + length) % length;
        set((state) => ({ imageIndexes: { ...state.imageIndexes, [productId]: safeIndex } }));
      },
      selectGalleryRelative: (direction) => {
        const product = PRODUCTS.find((item) => item.id === get().selectedProductId) ?? PRODUCTS[0];
        const current = get().imageIndexes[product.id] ?? 0;
        get().selectGalleryImage(product.id, current + direction);
      },
      clearCartNotice: () => set({ cartNotice: null }),
      selectColor: (productId, colorId) => set((state) => ({ selectedColors: { ...state.selectedColors, [productId]: colorId } })),
      addToCart: (productId, requestedColor) => {
        const colorId = requestedColor ?? get().selectedColors[productId] ?? defaultColors[productId];
        const cart = [...get().cart];
        const index = cart.findIndex((item) => item.productId === productId && item.colorId === colorId);
        if (index >= 0) cart[index] = { ...cart[index], quantity: cart[index].quantity + 1 };
        else cart.push({ productId, colorId, quantity: 1 });
        const product = PRODUCTS.find((item) => item.id === productId);
        set({ cart, cartNotice: { id: Date.now(), message: `${product?.shortName ?? 'محصول'} به سبد خرید اضافه شد` } });
      },
      changeQuantity: (productId, colorId, delta) => set((state) => ({
        cart: state.cart
          .map((item) => item.productId === productId && item.colorId === colorId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item)
          .filter((item) => item.quantity > 0),
      })),
      removeFromCart: (productId, colorId) => set((state) => ({ cart: state.cart.filter((item) => item.productId !== productId || item.colorId !== colorId) })),
      toggleWishlist: (productId) => set((state) => ({ wishlist: state.wishlist.includes(productId) ? state.wishlist.filter((id) => id !== productId) : [...state.wishlist, productId] })),
      setCartOpen: (cartOpen) => set({ cartOpen }),
      setGuideOpen: (guideOpen) => set({ guideOpen }),
      setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
      setCameraMinimized: (cameraMinimized) => set({ cameraMinimized }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
    }),
    {
      name: 'gesture-shop',
      partialize: (state) => ({ cart: state.cart, wishlist: state.wishlist, selectedColors: state.selectedColors, selectedProductId: state.selectedProductId }),
    },
  ),
);
