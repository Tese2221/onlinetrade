import { useEffect, useState } from 'react';
import { ArrowDownToLine, ArrowRight, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { api } from './services/api.js';
import { getProductImage } from './productImages.js';
import PromotionGallery from './PromotionGallery.jsx';
import { LanguageSwitcher, useLanguage } from './LanguageContext.jsx';

const navigation = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/about', label: 'About' },
  { to: '/support', label: 'Support' },
];

const money = (amount) => `${Number(amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`;
const rateFraction = (rate) => {
  const value = Number(rate ?? 0);
  return value > 1 ? value / 100 : value;
};

export default function PublicWebsite({ appDownloadUrl, user, onPurchase, busy }) {
  const location = useLocation();
  const { t } = useLanguage();
  const productId = location.pathname.split('/').filter(Boolean).at(-1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [config, setConfig] = useState(null);
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/config/public').then(setConfig).catch(() => setConfig(null));
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setError('');
    if (location.pathname === '/products') {
      setLoading(true);
      api('/products').then(setProducts).catch((cause) => setError(cause.message)).finally(() => setLoading(false));
    } else if (location.pathname.startsWith('/products/')) {
      setLoading(true);
      setProduct(null);
      api(`/products/${productId}`).then(setProduct).catch((cause) => setError(cause.message)).finally(() => setLoading(false));
    }
  }, [location.pathname, productId]);

  const title = config?.siteName || 'Online Trade';
  const downloadUrl = appDownloadUrl || config?.appDownloadUrl;
  const page = location.pathname;

  return (
    <div className='public-site'>
      <header className='public-header'>
        <Link className='public-brand' to='/' aria-label={`${title} home`}>
          <span className='brand-mark'>OT</span>
          <span>{t(title)}<small>{t('MEMBER PLATFORM')}</small></span>
        </Link>
        <button
          className='public-menu-toggle'
          type='button'
          aria-label={menuOpen ? t('Close navigation') : t('Open navigation')}
          aria-expanded={menuOpen}
          aria-controls='public-navigation'
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav id='public-navigation' className={`public-navigation ${menuOpen ? 'is-open' : ''}`} aria-label='Public navigation'>
          {navigation.map((item) => <Link key={item.to} to={item.to} aria-current={page === item.to ? 'page' : undefined}>{t(item.label)}</Link>)}
          <Link className='public-login' to='/login'>{t('Login')}</Link>
          <Link className='public-register' to='/register'>{t('Register')} <ArrowRight size={15} /></Link>
          {downloadUrl && <a className='public-download' href={downloadUrl} target='_blank' rel='noreferrer'><ArrowDownToLine size={15} /> {t('Download App')}</a>}
          <LanguageSwitcher className='public-language-switcher' />
        </nav>
      </header>

      <main className='public-main'>
        {page === '/' && <HomePage downloadUrl={downloadUrl} banners={config?.promotionBanners} />}
        {page === '/about' && <AboutPage config={config} />}
        {page === '/products' && <ProductsPage products={products} loading={loading} error={error} user={user} onPurchase={onPurchase} busy={busy} />}
        {page.startsWith('/products/') && <ProductPage product={product} loading={loading} error={error} user={user} onPurchase={onPurchase} busy={busy} />}
        {page === '/support' && <SupportPage config={config} />}
        {page === '/download' && <DownloadPage url={downloadUrl} />}
        {page === '/forgot-password' && <RecoveryPage config={config} />}
        {page === '/terms' && <TermsPage />}
        {page === '/privacy' && <PrivacyPage />}
      </main>

      <footer className='public-footer'>
        <Link className='public-brand' to='/'><span className='brand-mark'>OT</span><span>{title}<small>MEMBER PLATFORM</small></span></Link>
        <p>{t('Account, wallet and product services in one place.')}</p>
        <nav aria-label='Legal and help links'><Link to='/terms'>{t('Terms')}</Link><Link to='/privacy'>{t('Privacy')}</Link><Link to='/support'>{t('Support')}</Link></nav>
      </footer>
    </div>
  );
}

function HomePage({ downloadUrl, banners }) {
  const { t } = useLanguage();
  return (
    <>
      <section className='public-hero'>
        <div className='public-hero-copy'>
          <p className='eyebrow'>{t('A CLEARER WAY FORWARD')}</p>
          <h1>{t('Make your next move with Online Trade.')}</h1>
          <p>{t('Explore available products, manage your account and keep your activity together in one secure member platform.')}</p>
          <div className='public-hero-actions'><Link className='public-primary' to='/register'>{t('Create an account')} <ArrowRight size={16} /></Link><Link className='public-secondary' to='/products'>{t('Explore products')}</Link></div>
        </div>
        <div className='public-hero-art' aria-hidden='true'>
          <div className='hero-index'>OT / 01</div>
          <div className='hero-orbit hero-orbit-one' />
          <div className='hero-orbit hero-orbit-two' />
          <div className='hero-monogram'>OT</div>
          <div className='hero-caption'>{t('MEMBERSHIP')}<br />{t('BEGINS HERE')}</div>
        </div>
      </section>
      <section className='public-section public-benefits'>
        <div><p className='eyebrow'>{t('THE MEMBER EXPERIENCE')}</p><h2>{t('Everything starts with a clear view.')}</h2></div>
        <div className='public-benefit-grid'>
          <article><span>01</span><h3>{t('Your account')}</h3><p>{t('Access your account, wallet activity and important updates from one place.')}</p></article>
          <article><span>02</span><h3>{t('Available products')}</h3><p>{t('Review product details and availability before signing in to invest.')}</p></article>
          <article><span>03</span><h3>{t('People and support')}</h3><p>{t('Keep up with your referral team and reach Online Trade support when you need help.')}</p></article>
        </div>
      </section>
      <PromotionGallery banners={banners} />
      {downloadUrl && <section className='public-download-band'><div><p className='eyebrow'>{t('ONLINE TRADE ON YOUR DEVICE')}</p><h2>{t('Take your account with you.')}</h2></div><a className='public-primary' href={downloadUrl} target='_blank' rel='noreferrer'><ArrowDownToLine size={16} /> {t('Download App')}</a></section>}
    </>
  );
}

function AboutPage({ config }) {
  const { t } = useLanguage();
  return <article className='public-copy-page'><p className='eyebrow'>{t('ABOUT ONLINE TRADE')}</p><h1>{config?.aboutTitle || t('One place for your member activity.')}</h1><p className='about-copy'>{config?.aboutIntro || t('Online Trade brings account access, wallet records, product information, referrals and support into a single member experience.')}</p><div className='public-copy-columns'><section><h2>{config?.aboutFirstHeading || t('Account-led')}</h2><p className='about-copy'>{config?.aboutFirstContent || t('Members sign in with a phone number and can review account activity from the dashboard.')}</p></section><section><h2>{config?.aboutSecondHeading || t('Clear records')}</h2><p className='about-copy'>{config?.aboutSecondContent || t('Wallet and transaction activity is recorded by the Online Trade service and shown in the member portal.')}</p></section></div><Link className='public-primary' to='/products'>{t('View products')} <ArrowRight size={16} /></Link></article>;
}

function ProductsPage({ products, loading, error, user, onPurchase, busy }) {
  const { t } = useLanguage();
  return (
    <section className='public-catalog'>
      <div className='public-section-heading'><div><p className='eyebrow'>{t('PRODUCT CATALOG')}</p><h1>{t('Explore products')}</h1></div><p>{t('Review current availability and product terms before investing.')}</p></div>
      {loading ? <p className='public-state' role='status'>{t('Loading products…')}</p> : error ? <p className='public-state public-error' role='alert'>{error}</p> : products.length ? (
        <div className='public-product-grid'>{products.map((item) => <ProductCard key={item.id} product={item} user={user} onPurchase={onPurchase} busy={busy} />)}</div>
      ) : <p className='public-state'>{t('There are no products available to display right now.')}</p>}
    </section>
  );
}

function ProductCard({ product, user, onPurchase, busy }) {
  const { t } = useLanguage();
  const price = Number(product.price ?? 0);
  const normalizedRate = rateFraction(product.dailyRate ?? 0.05);
  const dailyIncome = price * normalizedRate;
  const isComingSoon = product.status === 'COMING_SOON' || (product.availableFrom && new Date(product.availableFrom) > new Date());

  return (
    <article className='public-product'>
      <Link className='public-product-image' to={`/products/${product.id}`} aria-label={`${t('View details')}: ${product.name}`}>
        <img src={getProductImage(product)} alt='' loading='lazy' />
        <span className={`product-status ${isComingSoon ? 'coming_soon' : String(product.status).toLowerCase()}`}>
          {isComingSoon ? t('COMING SOON') : t(String(product.status).replaceAll('_', ' '))}
        </span>
      </Link>
      <div className='public-product-body'>
        <p className='eyebrow'>{t('MEMBER PRODUCT')}</p>
        <h2><Link to={`/products/${product.id}`}>{product.name}</Link></h2>
        <p>{product.description || t('Daily income product package with daily accrual.')}</p>
        <dl>
          <div><dt>{t('Price')}</dt><dd>{money(product.price)}</dd></div>
          <div><dt>{t('Daily Income')} ({Math.round(normalizedRate * 100)}%)</dt><dd className='highlight-green'>{money(dailyIncome)} / {t('day')}</dd></div>
          <div><dt>{t('Duration')}</dt><dd>{product.durationDays} {t('days')}</dd></div>
          <div><dt>{t('Total Revenue')}</dt><dd>{money(dailyIncome * product.durationDays)}</dd></div>
        </dl>
        {isComingSoon && product.availableFrom && (
          <div className='scheduled-badge'>
            {t('Available:')} {new Date(product.availableFrom).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
        {user ? (
          <button className='public-primary' type='button' disabled={busy || isComingSoon || product.status !== 'AVAILABLE'} onClick={() => onPurchase(product.id)}>
            {busy ? t('Please wait…') : isComingSoon ? t('Coming Soon') : t('Invest')} <ArrowRight size={16} />
          </button>
        ) : (
          <Link className='public-primary' to='/login'>{t('Sign in to invest')} <ArrowRight size={16} /></Link>
        )}
      </div>
    </article>
  );
}

function ProductPage({ product, loading, error, user, onPurchase, busy }) {
  const { t } = useLanguage();
  if (loading) return <p className='public-state' role='status'>{t('Loading product…')}</p>;
  if (error) return <p className='public-state public-error' role='alert'>{error}</p>;
  if (!product) return <p className='public-state'>{t('This product is not available.')}</p>;

  const price = Number(product.price ?? 0);
  const normalizedRate = rateFraction(product.dailyRate ?? 0.05);
  const dailyIncome = price * normalizedRate;
  const isComingSoon = product.status === 'COMING_SOON' || (product.availableFrom && new Date(product.availableFrom) > new Date());

  return (
    <article className='public-product-detail'>
      <div className='public-detail-image'><img src={getProductImage(product)} alt={product.name} /></div>
      <div className='public-detail-copy'>
        <p className='eyebrow'>{t('PRODUCT DETAILS')}</p>
        <p className={`product-status ${isComingSoon ? 'coming_soon' : String(product.status).toLowerCase()}`}>
          {isComingSoon ? t('COMING SOON') : t(String(product.status).replaceAll('_', ' '))}
        </p>
        <h1>{product.name}</h1>
        <p>{product.description || t('Contact support for more information about this product package.')}</p>
        <dl>
          <div><dt>{t('Package Price')}</dt><dd>{money(product.price)}</dd></div>
          <div><dt>{t('Daily Income')} ({Math.round(normalizedRate * 100)}%)</dt><dd className='highlight-green'>{money(dailyIncome)} / {t('day')}</dd></div>
          <div><dt>{t('Duration')}</dt><dd>{product.durationDays} {t('days')}</dd></div>
          <div><dt>{t('Total Revenue')}</dt><dd>{money(dailyIncome * product.durationDays)}</dd></div>
        </dl>
        {isComingSoon && product.availableFrom && (
          <div className='scheduled-badge'>
            {t('Available:')} {new Date(product.availableFrom).toLocaleString(undefined, { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
        {user ? (
          <button className='public-primary' type='button' disabled={busy || isComingSoon || product.status !== 'AVAILABLE'} onClick={() => onPurchase(product.id)}>
            {busy ? t('Please wait…') : isComingSoon ? t('Coming Soon') : t('Invest')} <ArrowRight size={16} />
          </button>
        ) : (
          <Link className='public-primary' to='/login'>{t('Sign in to invest')} <ArrowRight size={16} /></Link>
        )}
        <Link className='public-back-link' to='/products'>{t('Back to products')}</Link>
      </div>
    </article>
  );
}

function SupportPage({ config }) {
  const { t } = useLanguage();
  return <section className='public-copy-page'><p className='eyebrow'>{t('CONTACT')}</p><h1>{t('Support from the Online Trade team.')}</h1><p>{config?.supportMessage || t('Contact our support team for help with your account.')}</p><div className='public-support-links'>{config?.supportEnabled !== false && <><div><small>{t('SUPPORT')}</small><strong>{config?.supportName || t('Customer Support')}</strong>{config?.supportPhone && <a href={`tel:${config.supportPhone}`}>{config.supportPhone}</a>}</div>{config?.whatsappUrl && <a className='public-primary' href={config.whatsappUrl} target='_blank' rel='noreferrer'>{t('Message on WhatsApp')} <ArrowRight size={16} /></a>}</>}{config?.officialGroupEnabled && config?.officialGroupUrl && <div><small>{t('COMMUNITY')}</small><strong>{config.officialGroupName || t('Official Group')}</strong><a href={config.officialGroupUrl} target='_blank' rel='noreferrer'>{t('Visit group')}</a></div>}{!config && <p className='public-state'>{t('Support details are currently unavailable.')}</p>}</div></section>;
}

function DownloadPage({ url }) {
  const { t } = useLanguage();
  return <article className='public-copy-page'><p className='eyebrow'>{t('ONLINE TRADE MOBILE')}</p><h1>{t('Download the Online Trade app.')}</h1><p>{t('Use the official app link provided by Online Trade to access your member account on your device.')}</p>{url ? <a className='public-primary' href={url} target='_blank' rel='noreferrer'><ArrowDownToLine size={16} /> {t('Download App')}</a> : <p className='public-state'>{t('The app download link has not been configured yet.')}</p>}</article>;
}

function RecoveryPage({ config }) {
  const { t } = useLanguage();
  return <article className='public-copy-page'><p className='eyebrow'>{t('ACCOUNT ACCESS')}</p><h1>{t('Recover your account.')}</h1><p>{t('Automated password reset is not configured. For account recovery, contact Online Trade support using the official contact details below. Never share your password or withdrawal password.')}</p><div className='public-support-links'>{config?.supportPhone && <div><small>{t('SUPPORT PHONE')}</small><a href={`tel:${config.supportPhone}`}>{config.supportPhone}</a></div>}{config?.whatsappUrl && <a className='public-primary' href={config.whatsappUrl} target='_blank' rel='noreferrer'>{t('Contact support on WhatsApp')} <ArrowRight size={16} /></a>}{!config?.supportPhone && !config?.whatsappUrl && <p className='public-state'>{t('Contact information is currently unavailable.')}</p>}</div></article>;
}

function TermsPage() {
  const { t } = useLanguage();
  return <article className='public-copy-page legal-page'><p className='eyebrow'>{t('ONLINE TRADE POLICIES')}</p><h1>{t('Terms of service')}</h1><p className='legal-notice'>{t('This page summarizes the current service flow. The business owner should review and approve the final legal terms before launch.')}</p><section><h2>{t('Using an account')}</h2><p>{t('Use accurate account information and keep your login and withdrawal credentials private. You are responsible for activity performed through your authenticated account.')}</p></section><section><h2>{t('Payments and wallet records')}</h2><p>{t('Recharge requests are reviewed before funds are credited. Withdrawal requests are subject to account verification, configured limits and administrative processing. The status shown in your account reflects the service records.')}</p></section><section><h2>{t('Products and rewards')}</h2><p>{t('Product availability, price, duration and configured rates are shown in the catalog. Review those details before confirming an investment. Referral rewards are calculated from approved activity according to the rates configured by Online Trade.')}</p></section><section><h2>{t('Support')}</h2><p>{t('For questions about your account or a transaction, contact Online Trade through the official support channels.')}</p></section></article>;
}

function PrivacyPage() {
  const { t } = useLanguage();
  return <article className='public-copy-page legal-page'><p className='eyebrow'>{t('ONLINE TRADE POLICIES')}</p><h1>{t('Privacy notice')}</h1><p className='legal-notice'>{t('This notice describes information used by the current Online Trade service. The business owner should confirm retention, legal basis and contact details before launch.')}</p><section><h2>{t('Information used')}</h2><p>{t('The service stores account name and phone number, password hashes, wallet and transaction records, referral relationships, withdrawal account details and payment proof submitted with recharge requests.')}</p></section><section><h2>{t('Why it is used')}</h2><p>{t('This information supports account access, payment review, wallet and withdrawal processing, referral calculations, customer support, fraud prevention and required service records.')}</p></section><section><h2>{t('Security')}</h2><p>{t('Credentials are handled by the service and should never be shared with support. Do not send passwords or one-time codes to anyone claiming to represent Online Trade.')}</p></section><section><h2>{t('Questions')}</h2><p>{t('Use the official')} <Link to='/support'>{t('Online Trade support channels')}</Link> {t('for questions about your information.')}</p></section></article>;
}
