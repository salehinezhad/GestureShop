import { Heart, Hand, Menu, Search, ShoppingCart, UserRound, X } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../data/products';
import { useShopStore } from '../store/useShopStore';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [accountNoteOpen, setAccountNoteOpen] = useState(false);
  const cart = useShopStore((state) => state.cart);
  const wishlist = useShopStore((state) => state.wishlist);
  const mobileMenuOpen = useShopStore((state) => state.mobileMenuOpen);
  const searchQuery = useShopStore((state) => state.searchQuery);
  const setSearchQuery = useShopStore((state) => state.setSearchQuery);
  const setMobileMenuOpen = useShopStore((state) => state.setMobileMenuOpen);
  const setCartOpen = useShopStore((state) => state.setCartOpen);
  const setGuideOpen = useShopStore((state) => state.setGuideOpen);
  const selectProduct = useShopStore((state) => state.selectProduct);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const matches = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase('fa');
    if (!query) return [];
    return PRODUCTS.filter((product) =>
      [product.name, product.shortName, product.brand, product.category]
        .some((value) => value.toLocaleLowerCase('fa').includes(query)),
    ).slice(0, 5);
  }, [searchQuery]);

  const chooseProduct = (productId: (typeof PRODUCTS)[number]['id']) => {
    selectProduct(productId);
    setSearchQuery('');
    setMobileMenuOpen(false);
    navigate('/');
    requestAnimationFrame(() => document.querySelector('.home-hero')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (matches[0]) chooseProduct(matches[0].id);
  };

  const goToProducts = () => {
    setMobileMenuOpen(false);
    navigate('/');
    requestAnimationFrame(() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }));
  };

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <button className="menu-button icon-button" type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label={mobileMenuOpen ? 'بستن منو' : 'باز کردن منو'} aria-expanded={mobileMenuOpen}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>

        <Link className="brand" to="/" onClick={() => setMobileMenuOpen(false)} aria-label="GestureShop، صفحهٔ اصلی">
          <span className="brand__mark"><Hand /></span>
          <span><b>GestureShop</b><small>فروشگاه هوشمند با کنترل حرکتی</small></span>
        </Link>

        <form className="header-search" role="search" onSubmit={submitSearch}>
          <Search aria-hidden="true" />
          <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="جستجوی محصول، برند یا مدل" aria-label="جستجوی محصولات" />
          {matches.length > 0 && (
            <div className="search-results" role="listbox" aria-label="نتایج جستجو">
              {matches.map((product) => (
                <button key={product.id} type="button" onClick={() => chooseProduct(product.id)} role="option">
                  <img src={product.image} alt="" loading="lazy" /><span><b dir="ltr">{product.name}</b><small>{product.category}</small></span>
                </button>
              ))}
            </div>
          )}
        </form>

        <nav className={`main-nav ${mobileMenuOpen ? 'is-open' : ''}`} aria-label="ناوبری اصلی">
          <Link className={location.pathname === '/' ? 'is-active' : ''} to="/" onClick={() => setMobileMenuOpen(false)}>خانه</Link>
          <button type="button" onClick={goToProducts}>محصولات</button>
          <button type="button" onClick={() => { setGuideOpen(true); setMobileMenuOpen(false); }} data-gesture-target>راهنمای حرکات</button>
        </nav>

        <div className="header-actions">
          <div className="account-action">
            <button className="icon-button" type="button" onClick={() => setAccountNoteOpen(!accountNoteOpen)} aria-label="حساب کاربری" aria-expanded={accountNoteOpen}><UserRound /></button>
            {accountNoteOpen && <p className="account-note" role="status">ورود کاربری در نسخهٔ نمایشی فعال نیست.</p>}
          </div>
          <button className="icon-button wishlist-button" type="button" onClick={goToProducts} aria-label={`علاقه‌مندی‌ها، ${wishlist.length} مورد`}>
            <Heart fill={wishlist.length ? 'currentColor' : 'none'} />{wishlist.length > 0 && <b>{new Intl.NumberFormat('fa-IR').format(wishlist.length)}</b>}
          </button>
          <button className="icon-button cart-button" type="button" onClick={() => setCartOpen(true)} data-gesture-target data-gesture-cart aria-label={`سبد خرید، ${cartCount} کالا`}>
            <ShoppingCart /><b>{new Intl.NumberFormat('fa-IR').format(cartCount)}</b>
          </button>
        </div>
      </div>
    </header>
  );
}
