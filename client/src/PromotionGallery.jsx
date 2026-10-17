import { useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { assetUrl } from './services/api.js';
import { useLanguage } from './LanguageContext.jsx';

const defaultBanners = [
  { id: 1, imageUrl: '/banners/banner1.svg', title: 'Invest in Fresh Fruits', subtitle: 'Earn 5% Daily Income', link: '/products' },
  { id: 2, imageUrl: '/banners/banner2.svg', title: 'Welcome Bonus', subtitle: 'Explore the new member offer', link: '/register' },
  { id: 3, imageUrl: '/banners/banner3.svg', title: 'Convenient Payments', subtitle: 'Bank and mobile money channels', link: '/login' },
  { id: 4, imageUrl: '/banners/banner4.svg', title: 'Daily Harvest Tasks', subtitle: 'Review your daily rewards', link: '/login' },
  { id: 5, imageUrl: '/banners/banner5.svg', title: 'Invite Friends & Earn', subtitle: 'Level A 10% · B 3% · C 2%', link: '/register' },
];

export default function PromotionGallery({ banners, presentation = 'gallery' }) {
  const { t } = useLanguage();
  const items = Array.isArray(banners) && banners.length ? banners : defaultBanners;
  const [activeIndex, setActiveIndex] = useState(0);
  const isCarousel = presentation === 'carousel';

  useEffect(() => {
    if (!isCarousel || items.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [isCarousel, items.length]);

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, items.length - 1));
  }, [items.length]);

  function changeSlide(direction) {
    setActiveIndex((current) => (current + direction + items.length) % items.length);
  }

  function renderCard(banner, index, active = true) {
    return (
      <article className={`promotion-gallery-card${active && isCarousel ? ' is-active' : ''}`} key={banner.id ?? index} aria-hidden={!active}>
        <Link to={banner.link?.startsWith('/') ? banner.link : '/products'} className='promotion-gallery-image-link' tabIndex={active ? 0 : -1}>
          <img
            src={assetUrl(banner.imageUrl)}
            alt={banner.title || `Online Trade promotion ${index + 1}`}
            loading={active ? 'eager' : 'lazy'}
          />
        </Link>
        <div className='promotion-gallery-copy'>
          <div>
            <h3>{t(banner.title)}</h3>
            <p>{t(banner.subtitle)}</p>
          </div>
          <Link to={banner.link?.startsWith('/') ? banner.link : '/products'} aria-label={`Explore ${banner.title}`} tabIndex={active ? 0 : -1}>
            <ArrowRight size={16} />
          </Link>
        </div>
      </article>
    );
  }

  return (
    <section className={`promotion-gallery${isCarousel ? ' is-carousel' : ''}`} aria-labelledby='promotion-gallery-title'>
      <div className='promotion-gallery-heading'>
        <p className='eyebrow'>{t('ONLINE TRADE PROMOTIONS')}</p>
        <h2 id='promotion-gallery-title'>{t('Explore member offers')}</h2>
      </div>
      {isCarousel ? (
        <>
          <div className='promotion-carousel' aria-live='polite'>
            {items.map((banner, index) => renderCard(banner, index, index === activeIndex))}
            {items.length > 1 && (
              <>
                <button className='promotion-carousel-arrow is-previous' type='button' onClick={() => changeSlide(-1)} aria-label='Previous promotion'>
                  <ChevronLeft size={20} />
                </button>
                <button className='promotion-carousel-arrow is-next' type='button' onClick={() => changeSlide(1)} aria-label='Next promotion'>
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
          {items.length > 1 && (
            <div className='promotion-carousel-dots' role='group' aria-label='Choose a promotion'>
              {items.map((banner, index) => (
                <button
                  key={banner.id ?? index}
                  type='button'
                  className={index === activeIndex ? 'is-active' : ''}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Show promotion ${index + 1}: ${banner.title || 'Online Trade offer'}`}
                  aria-current={index === activeIndex ? 'true' : undefined}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className='promotion-gallery-grid'>
          {items.map((banner, index) => renderCard(banner, index))}
        </div>
      )}
    </section>
  );
}
