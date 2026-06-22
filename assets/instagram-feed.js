(function () {
  const sections = document.querySelectorAll('[data-instagram-feed]');

  function formatDate(value) {
    try {
      return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(value));
    } catch (error) {
      return value || '';
    }
  }

  function mediaLabel(type) {
    if (type === 'VIDEO' || type === 'REELS') return 'Reel';
    if (type === 'CAROUSEL_ALBUM') return 'Carousel';
    return 'Post';
  }

  function esc(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function formatPrice(price, currency) {
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format(price);
    } catch (e) {
      return `${currency || ''} ${price}`.trim();
    }
  }

  function createProductChips(products) {
    if (!Array.isArray(products) || !products.length) return '';
    return `
      <div class="instagram-feed-products">
        ${products.map((p) => `
          <a class="instagram-feed-product-chip" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">
            ${p.image ? `<img class="instagram-feed-product-img" src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">` : ''}
            <span class="instagram-feed-product-info">
              <span class="instagram-feed-product-name">${esc(p.title)}</span>
              <span class="instagram-feed-product-price">${formatPrice(p.price, p.currency)}</span>
            </span>
            <span class="instagram-feed-product-cta">Shop <img src="https://cdn.shopify.com/s/files/1/0618/9246/0587/files/n-web-arrow-right.svg?v=1780070597" alt=""></span>
          </a>
        `).join('')}
      </div>
    `;
  }

  function createMediaMarkup(item, autoplay) {
    const isVideo = item.media_type === 'VIDEO' || item.media_type === 'REELS';
    const thumb = item.thumbnail_url || item.media_url;

    return `
      <article class="instagram-feed-card" tabindex="0" data-instagram-card='${JSON.stringify(item)}'>
        <div class="instagram-feed-media">
          <span class="instagram-feed-badge">${mediaLabel(item.media_type)}</span>
          ${isVideo && item.media_url
            ? `<video ${autoplay ? 'autoplay loop muted playsinline' : 'controls'} preload="metadata" poster="${esc(thumb)}"
                onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
                <source src="${esc(item.media_url)}">
               </video>
               <img src="${esc(thumb)}" alt="${esc(item.caption || 'Instagram media')}" style="display:none" loading="lazy">`
            : thumb
              ? `<img src="${esc(thumb)}" alt="${esc(item.caption || 'Instagram media')}" loading="lazy">`
              : `<div class="instagram-feed-thumb-placeholder"></div>`
          }
        </div>
        <div class="instagram-feed-content">
          ${createProductChips(item.linked_products)}
          <a class="instagram-feed-link" href="${esc(item.permalink)}" target="_blank" rel="noopener noreferrer">View on Instagram</a>
        </div>
      </article>
    `;
  }

  function initSlick(track, desktopColumns, mobileColumns, autoplay) {
    if (typeof jQuery === 'undefined' || typeof jQuery.fn.slick === 'undefined') {
      console.warn('Slick slider not loaded.');
      return;
    }
    jQuery(track).slick({
      slidesToShow: parseInt(desktopColumns) || 3,
      slidesToScroll: 1,
      arrows: true,
      dots: false,
      infinite: true,
      autoplay: autoplay,
      autoplaySpeed: 3500,
      pauseOnHover: true,
      speed: 500,
      prevArrow:"<button type='button' class='slick-prev slider-arrows-2'> <img src='https://cdn.shopify.com/s/files/1/0927/2603/4727/files/arrow-left.svg?v=1743747570' /> </button>",
      nextArrow:"<button type='button' class='slick-next slider-arrows-2'><img src='https://cdn.shopify.com/s/files/1/0927/2603/4727/files/arrow-right.svg?v=1743747570' /></button>",
  
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: Math.min(parseInt(desktopColumns) || 3, 2),
          },
        },
        {
          breakpoint: 749,
          settings: {
            slidesToShow: parseInt(mobileColumns) || 1,
            arrows: false,
            dots: false,
          },
        },
      ],
    });
  }

  sections.forEach(async (section) => {
    const apiBase = (section.dataset.apiBase || '').replace(/\/$/, '');
    const layout = section.dataset.layout || 'grid';
    const desktopColumns = section.dataset.columnsDesktop || '4';
    const mobileColumns = section.dataset.columnsMobile || '1';
    const gap = section.dataset.gap || '18';
    const autoplay = section.dataset.autoplay === 'true';
    const track = section.querySelector('[data-instagram-feed-track]');
    const emptyState = section.querySelector('[data-instagram-feed-empty]');
    if (layout === 'grid') {
      track.style.setProperty('--if-columns-desktop', desktopColumns);
      track.style.setProperty('--if-columns-mobile', mobileColumns);
      track.style.setProperty('--if-gap', `${gap}px`);
    }

    try {
      const response = await fetch(`${apiBase}/api/selected-media`);
      const payload = await response.json();
      const items = Array.isArray(payload.data) ? payload.data : [];

      if (!items.length) {
        emptyState.hidden = false;
        return;
      }

      track.innerHTML = items.map((item) => createMediaMarkup(item, autoplay)).join('');

      if (layout === 'slider') {
        initSlick(track, desktopColumns, mobileColumns, autoplay);
      }

      const cards = track.querySelectorAll('.instagram-feed-card');
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
            }
          });
        },
        { threshold: 0.2 }
      );
      cards.forEach((card) => observer.observe(card));

      track.addEventListener('click', (event) => {
        if (event.target.closest('.instagram-feed-product-chip')) return;
        const card = event.target.closest('[data-instagram-card]');
        if (!card) return;

        const item = JSON.parse(card.dataset.instagramCard);
        if (item.permalink) {
          window.open(item.permalink, '_blank', 'noopener,noreferrer');
        }
      });
    } catch (error) {
      emptyState.hidden = false;
      emptyState.innerHTML = '<p>Unable to load Instagram media right now.</p>';
    }
  });
})();
