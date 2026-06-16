/**
 * INEEZY Reviews — Storefront Widget Engine
 * Upload to: Shopify theme → assets/ineezy-reviews.js
 *
 * Reads: data-app-url="https://your-render-app.onrender.com" on the root element.
 * Initialises all widgets found in the page via data attributes:
 *   [data-ineezy-summary]      — star summary + rating bars (product page)
 *   [data-ineezy-widget]       — filterable review list + pagination (product page)
 *   [data-ineezy-gallery]      — photo-review gallery with lightbox (collection / homepage)
 *   [data-ineezy-testimonials] — auto-scrolling testimonial slider (homepage)
 *   [data-ineezy-write-btn]    — "Write a Review" button (product page)
 */
(function () {
  'use strict';

  /* ================================================================
     UTILITY
     ================================================================ */
  function q(sel, ctx) { return (ctx || document).querySelector(sel); }

  function starsHTML(rating, max) {
    max = max || 5;
    var filled = Math.round(rating);
    var html = '<span class="ineezy-stars" aria-label="' + rating + ' out of ' + max + ' stars">';
    for (var i = 1; i <= max; i++) {
      html += '<span class="ineezy-star' + (i <= filled ? '' : ' empty') + '">★</span>';
    }
    return html + '</span>';
  }

  function fmtDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function sanitize(str) {
    var d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }

  function skeletonRows(n) {
    var html = '<div class="ineezy-skeleton">';
    for (var i = 0; i < n; i++) {
      html += '<div class="ineezy-skel" style="height:' + (16 + (i % 2) * 8) + 'px;width:' + (60 + (i * 13) % 35) + '%"></div>';
    }
    return html + '</div>';
  }

  /* ================================================================
     API
     ================================================================ */
  function buildApi(appUrl) {
    var base = appUrl.replace(/\/$/, '') + '/api/public';

    function get(path) {
      return fetch(base + path, { headers: { 'Accept': 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (json) {
          if (!json.success) throw new Error(json.message || 'API error');
          return json;
        });
    }

    return {
      reviews: function (productId, params) {
        var qs = '?sort=' + (params.sort || 'latest') +
          '&page=' + (params.page || 1) +
          '&limit=' + (params.limit || 10) +
          (params.rating ? '&rating=' + params.rating : '');
        return get('/reviews/' + productId + qs);
      },
      ratings: function (productId) {
        return get('/ratings/' + productId);
      },
      testimonials: function () {
        return get('/testimonials');
      },
    };
  }

  /* ================================================================
     JSON-LD SCHEMA INJECTION
     ================================================================ */
  function injectSchema(productName, productUrl, data) {
    if (!data || !data.count) return;
    var schema = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      'name': productName || document.title,
      'url': productUrl || window.location.href,
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': data.average_rating || 0,
        'reviewCount': data.count || 0,
        'bestRating': 5,
        'worstRating': 1,
      },
      'review': (data.reviews || []).slice(0, 5).map(function (r) {
        return {
          '@type': 'Review',
          'reviewRating': { '@type': 'Rating', 'ratingValue': r.rating },
          'author': { '@type': 'Person', 'name': r.customer_name },
          'reviewBody': r.review || '',
          'datePublished': (r.created_at || '').substring(0, 10),
        };
      }),
    };
    var el = document.getElementById('ineezy-schema');
    if (!el) {
      el = document.createElement('script');
      el.id = 'ineezy-schema';
      el.type = 'application/ld+json';
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(schema);
  }

  /* ================================================================
     SUMMARY WIDGET
     ================================================================ */
  function initSummary(el, api) {
    var productId = el.getAttribute('data-product-id');
    if (!productId) return;

    el.innerHTML = skeletonRows(4);

    api.ratings(productId).then(function (json) {
      var d = json.data || {};
      var avg = parseFloat(d.average) || 0;
      var count = d.count || 0;
      var dist = d.breakdown || {};

      if (!count) {
        el.innerHTML = '<div class="ineezy-empty"><div class="ineezy-empty-icon">☆</div><div>No reviews yet</div></div>';
        return;
      }

      var barsHTML = '';
      for (var star = 5; star >= 1; star--) {
        var c = dist[star] || 0;
        var pct = count > 0 ? Math.round((c / count) * 100) : 0;
        barsHTML += '<div class="ineezy-bar-row">' +
          '<span class="ineezy-bar-label">' + star + ' ★</span>' +
          '<div class="ineezy-bar-track"><div class="ineezy-bar-fill" style="width:' + pct + '%"></div></div>' +
          '<span class="ineezy-bar-count">' + c + '</span>' +
          '</div>';
      }

      el.innerHTML = '<div class="ineezy-summary">' +
        '<div class="ineezy-summary-score-col">' +
          '<div class="ineezy-summary-number">' + avg.toFixed(1) + '</div>' +
          starsHTML(avg) +
          '<div class="ineezy-summary-count">' + count + ' review' + (count !== 1 ? 's' : '') + '</div>' +
        '</div>' +
        '<div class="ineezy-summary-bars">' + barsHTML + '</div>' +
        '</div>';
    }).catch(function () {
      el.innerHTML = '';
    });
  }

  /* ================================================================
     REVIEW WIDGET (list + filters + pagination)
     ================================================================ */
  function initWidget(el, api, appUrl) {
    var productId = el.getAttribute('data-product-id');
    var productName = el.getAttribute('data-product-name') || '';
    var productUrl = el.getAttribute('data-product-url') || window.location.href;
    var limit = parseInt(el.getAttribute('data-limit') || '10', 10);
    if (!productId) return;

    var state = { sort: 'latest', page: 1, rating: 0, avgRating: 0 };

    api.ratings(productId).then(function (json) {
      state.avgRating = parseFloat((json.data || {}).average) || 0;
    }).catch(function () {});

    function render() {
      var listEl = q('.ineezy-review-list', el);
      if (listEl) listEl.innerHTML = skeletonRows(6);

      api.reviews(productId, { sort: state.sort, page: state.page, limit: limit, rating: state.rating || 0 })
        .then(function (json) {
          var reviews = json.data || [];
          var totalCount = json.count || 0;
          var totalPages = Math.ceil(totalCount / limit);

          var listEl2 = q('.ineezy-review-list', el);
          if (!listEl2) return;

          if (!reviews.length) {
            listEl2.innerHTML = '<div class="ineezy-empty"><div class="ineezy-empty-icon">☆</div><div>No reviews match your filter.</div></div>';
          } else {
            listEl2.innerHTML = reviews.map(function (r) {
              var photosHTML = '';
              if (r.review_images && r.review_images.length) {
                photosHTML = '<div class="ineezy-card-photos">' +
                  r.review_images.map(function (p) {
                    return '<img class="ineezy-card-photo" src="' + sanitize(p.image_url) + '" alt="Review photo" loading="lazy" data-lightbox>';
                  }).join('') +
                '</div>';
              }
              var productsHTML = '';
              if (r.review_products && r.review_products.length) {
                productsHTML = '<div class="ineezy-card-products">' +
                  r.review_products.map(function (p) {
                    return '<span class="ineezy-product-tag">' + sanitize(p.product_title || p.title || '') + '</span>';
                  }).join('') +
                '</div>';
              }
              return '<div class="ineezy-review-card">' +
                '<div class="ineezy-card-header">' +
                  '<div class="ineezy-card-meta">' +
                    '<div class="ineezy-card-name">' + sanitize(r.customer_name) +
                      (r.verified_buyer ? '<span class="ineezy-verified-badge">✓ Verified Buyer</span>' : '') +
                    '</div>' +
                    '<div class="ineezy-card-date">' + fmtDate(r.created_at) + '</div>' +
                  '</div>' +
                  '<div>' + starsHTML(r.rating) + '</div>' +
                '</div>' +
                (r.title ? '<div class="ineezy-card-title">' + sanitize(r.title) + '</div>' : '') +
                '<div class="ineezy-card-body">' + sanitize(r.review) + '</div>' +
                photosHTML +
                productsHTML +
              '</div>';
            }).join('');

            // Attach lightbox triggers
            [].forEach.call(listEl2.querySelectorAll('[data-lightbox]'), function (img) {
              img.addEventListener('click', function () {
                openLightbox([img.src], 0);
              });
            });

            // Inject schema on first page
            if (state.page === 1) {
              injectSchema(productName, productUrl, { count: totalCount, average_rating: state.avgRating || 0, reviews: reviews });
            }
          }

          // Pagination
          var paginEl = q('.ineezy-pagination', el);
          if (paginEl) {
            paginEl.innerHTML = totalPages <= 1 ? '' :
              '<button class="ineezy-page-btn" id="irPrev" ' + (state.page <= 1 ? 'disabled' : '') + '>← Prev</button>' +
              '<span class="ineezy-page-info">Page ' + state.page + ' of ' + totalPages + '</span>' +
              '<button class="ineezy-page-btn" id="irNext" ' + (state.page >= totalPages ? 'disabled' : '') + '>Next →</button>';

            var prevBtn = q('#irPrev', el);
            var nextBtn = q('#irNext', el);
            if (prevBtn) prevBtn.addEventListener('click', function () { state.page--; render(); });
            if (nextBtn) nextBtn.addEventListener('click', function () { state.page++; render(); });
          }
        })
        .catch(function () {
          var listEl3 = q('.ineezy-review-list', el);
          if (listEl3) listEl3.innerHTML = '<div class="ineezy-empty">Unable to load reviews.</div>';
        });
    }

    // Build scaffold
    var writeBtn = '<button type="button" class="ineezy-write-btn" id="ineezy-widget-write-btn">✎ Write a Review</button>';

    el.innerHTML =
      '<div class="ineezy-section-header">' +
        '<div class="ineezy-section-title">Customer Reviews</div>' +
        writeBtn +
      '</div>' +
      '<div class="ineezy-filters">' +
        '<button class="ineezy-filter-chip active" data-rating="0">All</button>' +
        '<button class="ineezy-filter-chip" data-rating="5">5 ★</button>' +
        '<button class="ineezy-filter-chip" data-rating="4">4 ★</button>' +
        '<button class="ineezy-filter-chip" data-rating="3">3 ★</button>' +
        '<button class="ineezy-filter-chip" data-rating="2">2 ★</button>' +
        '<button class="ineezy-filter-chip" data-rating="1">1 ★</button>' +
        '<select class="ineezy-sort-select">' +
          '<option value="latest">Latest</option>' +
          '<option value="highest">Highest Rated</option>' +
          '<option value="lowest">Lowest Rated</option>' +
        '</select>' +
      '</div>' +
      '<div class="ineezy-review-list"></div>' +
      '<div class="ineezy-pagination"></div>';

    // Write review button — opens inline modal
    var writeBtnEl = document.getElementById('ineezy-widget-write-btn');
    if (writeBtnEl) {
      writeBtnEl.addEventListener('click', function () { showReviewModal(appUrl, productId); });
    }

    // Filter chips
    [].forEach.call(el.querySelectorAll('.ineezy-filter-chip'), function (chip) {
      chip.addEventListener('click', function () {
        [].forEach.call(el.querySelectorAll('.ineezy-filter-chip'), function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        state.rating = parseInt(chip.getAttribute('data-rating'), 10);
        state.page = 1;
        render();
      });
    });

    // Sort select
    var sortSel = q('.ineezy-sort-select', el);
    if (sortSel) {
      sortSel.addEventListener('change', function () {
        state.sort = sortSel.value;
        state.page = 1;
        render();
      });
    }

    render();
  }

  /* ================================================================
     LIGHTBOX
     ================================================================ */
  var lbEl = null;
  var lbImages = [];
  var lbIndex = 0;

  function buildLightbox() {
    if (lbEl) return;
    lbEl = document.createElement('div');
    lbEl.className = 'ineezy-lightbox';
    lbEl.innerHTML =
      '<button class="ineezy-lb-close" aria-label="Close">✕</button>' +
      '<button class="ineezy-lb-nav prev" aria-label="Previous">‹</button>' +
      '<img src="" alt="Review photo">' +
      '<button class="ineezy-lb-nav next" aria-label="Next">›</button>';
    document.body.appendChild(lbEl);

    q('.ineezy-lb-close', lbEl).addEventListener('click', closeLightbox);
    q('.ineezy-lb-nav.prev', lbEl).addEventListener('click', function () { showLbImage(lbIndex - 1); });
    q('.ineezy-lb-nav.next', lbEl).addEventListener('click', function () { showLbImage(lbIndex + 1); });
    lbEl.addEventListener('click', function (e) { if (e.target === lbEl) closeLightbox(); });

    document.addEventListener('keydown', function (e) {
      if (!lbEl || !lbEl.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showLbImage(lbIndex - 1);
      if (e.key === 'ArrowRight') showLbImage(lbIndex + 1);
    });
  }

  function showLbImage(idx) {
    if (!lbImages.length) return;
    lbIndex = (idx + lbImages.length) % lbImages.length;
    q('img', lbEl).src = lbImages[lbIndex];
    var prevBtn = q('.ineezy-lb-nav.prev', lbEl);
    var nextBtn = q('.ineezy-lb-nav.next', lbEl);
    if (prevBtn) prevBtn.style.display = lbImages.length > 1 ? '' : 'none';
    if (nextBtn) nextBtn.style.display = lbImages.length > 1 ? '' : 'none';
  }

  function openLightbox(images, index) {
    buildLightbox();
    lbImages = images;
    showLbImage(index || 0);
    lbEl.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (lbEl) lbEl.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ================================================================
     GALLERY WIDGET
     ================================================================ */
  function initGallery(el, api) {
    var productId = el.getAttribute('data-product-id');
    if (!productId) return;

    el.innerHTML = skeletonRows(3);

    api.reviews(productId, { sort: 'latest', page: 1, limit: 50 }).then(function (json) {
      var photos = [];
      (json.data || []).forEach(function (r) {
        if (r.review_images) r.review_images.forEach(function (p) { if (p.image_url) photos.push(p.image_url); });
      });

      if (!photos.length) { el.innerHTML = ''; return; }

      el.innerHTML = '<div class="ineezy-gallery">' +
        photos.map(function (url, i) {
          return '<div class="ineezy-gallery-item" data-idx="' + i + '">' +
            '<img src="' + sanitize(url) + '" alt="Customer photo" loading="lazy">' +
          '</div>';
        }).join('') +
      '</div>';

      [].forEach.call(el.querySelectorAll('.ineezy-gallery-item'), function (item) {
        item.addEventListener('click', function () {
          openLightbox(photos, parseInt(item.getAttribute('data-idx'), 10));
        });
      });
    }).catch(function () { el.innerHTML = ''; });
  }

  /* ================================================================
     TESTIMONIALS SLIDER
     ================================================================ */
  function initTestimonials(el, api) {
    el.innerHTML = skeletonRows(3);

    api.testimonials().then(function (json) {
      var items = json.data || [];
      if (!items.length) { el.innerHTML = ''; return; }

      var perPage = window.innerWidth < 600 ? 1 : window.innerWidth < 900 ? 2 : 3;
      var current = 0;
      var totalPages = Math.ceil(items.length / perPage);

      function avatarHTML(name) {
        return '<div class="ineezy-t-avatar">' + (name || '?').charAt(0).toUpperCase() + '</div>';
      }

      var cardsHTML = items.map(function (t) {
        return '<div class="ineezy-testimonial-card">' +
          '<div class="ineezy-t-stars">' + starsHTML(t.rating || 5) + '</div>' +
          '<div class="ineezy-t-text">' + sanitize(t.review || '') + '</div>' +
          '<div class="ineezy-t-author">' +
            avatarHTML(t.customer_name) +
            '<div>' +
              '<div class="ineezy-t-name">' + sanitize(t.customer_name || 'Customer') + '</div>' +
              (t.verified_buyer ? '<div class="ineezy-t-badge">✓ Verified Buyer</div>' : '') +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');

      el.innerHTML =
        '<div class="ineezy-testimonials">' +
          '<div class="ineezy-testimonials-track">' + cardsHTML + '</div>' +
        '</div>' +
        '<div class="ineezy-slider-nav">' +
          '<button class="ineezy-slider-btn" id="irSliderPrev">‹</button>' +
          '<div class="ineezy-slider-dots">' +
            Array.from({ length: totalPages }, function (_, i) {
              return '<div class="ineezy-slider-dot' + (i === 0 ? ' active' : '') + '" data-page="' + i + '"></div>';
            }).join('') +
          '</div>' +
          '<button class="ineezy-slider-btn" id="irSliderNext">›</button>' +
        '</div>';

      var track = q('.ineezy-testimonials-track', el);

      function goTo(page) {
        if (page < 0) page = totalPages - 1;
        if (page >= totalPages) page = 0;
        current = page;
        var cards = track.querySelectorAll('.ineezy-testimonial-card');
        var cardWidth = cards[0] ? (cards[0].offsetWidth + 20) : 0;
        track.style.transform = 'translateX(-' + (current * perPage * cardWidth) + 'px)';
        [].forEach.call(el.querySelectorAll('.ineezy-slider-dot'), function (d, i) {
          d.classList.toggle('active', i === current);
        });
      }

      var prevBtn = q('#irSliderPrev', el);
      var nextBtn = q('#irSliderNext', el);
      if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); });
      if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); });

      [].forEach.call(el.querySelectorAll('.ineezy-slider-dot'), function (dot) {
        dot.addEventListener('click', function () { goTo(parseInt(dot.getAttribute('data-page'), 10)); });
      });

      // Auto-advance every 6 seconds
      var autoplay = setInterval(function () { goTo(current + 1); }, 6000);
      el.addEventListener('mouseenter', function () { clearInterval(autoplay); });
      el.addEventListener('mouseleave', function () { autoplay = setInterval(function () { goTo(current + 1); }, 6000); });
    }).catch(function () { el.innerHTML = ''; });
  }

  /* ================================================================
     INLINE REVIEW MODAL
     ================================================================ */
  function injectModalCss() {
    if (document.getElementById('ineezy-modal-css')) return;
    var s = document.createElement('style');
    s.id = 'ineezy-modal-css';
    s.textContent =
      '#ineezy-modal{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(28,25,21,.55);z-index:99999;display:flex;align-items:flex-start;justify-content:center;padding:24px 16px 40px;overflow-y:auto;}' +
      '.ineezy-md{background:#fff;border-radius:14px;width:100%;max-width:520px;box-shadow:0 20px 60px rgba(28,25,21,.18);position:relative;margin:auto;}' +
      '.ineezy-md-head{display:flex;align-items:center;justify-content:space-between;padding:20px 24px 0;}' +
      '.ineezy-md-title{font-size:18px;font-weight:600;color:#1C1915;}' +
      '.ineezy-md-close{background:none;border:none;font-size:24px;cursor:pointer;color:#ABA69F;line-height:1;padding:4px;}' +
      '.ineezy-md-body{padding:20px 24px 28px;}' +
      '.ineezy-md-body label{display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#6B6560;margin-bottom:6px;margin-top:18px;}' +
      '.ineezy-md-body label:first-child{margin-top:0;}' +
      '.ineezy-md-body input[type=text],.ineezy-md-body input[type=email],.ineezy-md-body textarea{width:100%;border:1px solid #E8E4DE;border-radius:8px;padding:10px 14px;font-size:14px;color:#1C1915;background:#FAFAF8;box-sizing:border-box;font-family:inherit;}' +
      '.ineezy-md-body input:focus,.ineezy-md-body textarea:focus{outline:none;border-color:#C8A96E;}' +
      '.ineezy-md-body textarea{min-height:90px;resize:vertical;line-height:1.6;}' +
      '.ineezy-md-stars{display:flex;gap:6px;margin-top:4px;}' +
      '.ineezy-md-star{background:none;border:none;font-size:30px;color:#E8E4DE;cursor:pointer;padding:0 2px;line-height:1;transition:color .12s;}' +
      '.ineezy-md-star.on{color:#C8A96E;}' +
      '.ineezy-md-products{display:flex;flex-direction:column;gap:6px;max-height:180px;overflow-y:auto;margin-top:4px;}' +
      '.ineezy-md-product{display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid #E8E4DE;border-radius:8px;cursor:pointer;}' +
      '.ineezy-md-product input{width:15px;height:15px;accent-color:#C8A96E;flex-shrink:0;}' +
      '.ineezy-md-product img{width:36px;height:36px;object-fit:cover;border-radius:5px;border:1px solid #E8E4DE;flex-shrink:0;}' +
      '.ineezy-md-product-name{font-size:13px;font-weight:500;color:#1C1915;}' +
      '.ineezy-md-product-price{font-size:11px;color:#ABA69F;}' +
      '.ineezy-md-photos-label{border:1.5px dashed #E8E4DE;border-radius:8px;padding:14px;text-align:center;cursor:pointer;font-size:13px;color:#6B6560;margin-top:4px;display:block;}' +
      '.ineezy-md-photos-label:hover{border-color:#C8A96E;}' +
      '.ineezy-md-photo-previews{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;}' +
      '.ineezy-md-photo-wrap{position:relative;width:64px;height:64px;}' +
      '.ineezy-md-photo-wrap img{width:64px;height:64px;object-fit:cover;border-radius:6px;border:1px solid #E8E4DE;}' +
      '.ineezy-md-photo-rm{position:absolute;top:-5px;right:-5px;width:18px;height:18px;background:#1C1915;color:#fff;border:none;border-radius:50%;font-size:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;}' +
      '.ineezy-md-submit{width:100%;background:#1C1915;color:#fff;border:none;border-radius:8px;padding:13px;font-size:14px;font-weight:600;letter-spacing:.04em;cursor:pointer;margin-top:22px;transition:background .12s;}' +
      '.ineezy-md-submit:hover:not(:disabled){background:#3A3632;}' +
      '.ineezy-md-submit:disabled{opacity:.5;cursor:not-allowed;}' +
      '.ineezy-md-success{text-align:center;padding:40px 20px;}' +
      '.ineezy-md-success-icon{font-size:44px;margin-bottom:14px;}' +
      '.ineezy-md-success h3{font-size:20px;font-weight:600;margin-bottom:8px;color:#1C1915;}' +
      '.ineezy-md-success p{font-size:14px;color:#6B6560;line-height:1.6;}';
    document.head.appendChild(s);
  }

  function showReviewModal(appUrl, preProductId) {
    injectModalCss();
    var existing = document.getElementById('ineezy-modal');
    if (existing) existing.remove();

    var base = appUrl.replace(/\/$/, '');
    var selRating = 0;
    var selFiles = [];

    var overlay = document.createElement('div');
    overlay.id = 'ineezy-modal';

    var dialog = document.createElement('div');
    dialog.className = 'ineezy-md';
    dialog.innerHTML =
      '<div class="ineezy-md-head">' +
        '<div class="ineezy-md-title">Write a Review</div>' +
        '<button type="button" class="ineezy-md-close" id="ineezy-md-close">×</button>' +
      '</div>' +
      '<div class="ineezy-md-body" id="ineezy-md-body">' +
        '<label>Your Rating <span style="color:#C8A96E">*</span></label>' +
        '<div class="ineezy-md-stars" id="ineezy-md-stars">' +
          '<button type="button" class="ineezy-md-star" data-v="1">★</button>' +
          '<button type="button" class="ineezy-md-star" data-v="2">★</button>' +
          '<button type="button" class="ineezy-md-star" data-v="3">★</button>' +
          '<button type="button" class="ineezy-md-star" data-v="4">★</button>' +
          '<button type="button" class="ineezy-md-star" data-v="5">★</button>' +
        '</div>' +
        '<label>Products You\'re Reviewing</label>' +
        '<div class="ineezy-md-products" id="ineezy-md-products"><div style="font-size:13px;color:#ABA69F">Loading…</div></div>' +
        '<label>Your Name <span style="color:#C8A96E">*</span></label>' +
        '<input type="text" id="ineezy-md-name" placeholder="Full name">' +
        '<label>Email (optional)</label>' +
        '<input type="email" id="ineezy-md-email" placeholder="your@email.com">' +
        '<label>Review Title (optional)</label>' +
        '<input type="text" id="ineezy-md-rtitle" placeholder="Summarise your experience">' +
        '<label>Your Review <span style="color:#C8A96E">*</span></label>' +
        '<textarea id="ineezy-md-review" placeholder="Tell us about the quality and your experience…"></textarea>' +
        '<label>Add Photos (optional, max 5)</label>' +
        '<label class="ineezy-md-photos-label" for="ineezy-md-file">📷 Click to upload photos<br><span style="font-size:11px;color:#ABA69F">JPG, PNG or WebP — max 10 MB each</span>' +
          '<input type="file" id="ineezy-md-file" accept="image/jpeg,image/jpg,image/png,image/webp" multiple style="display:none">' +
        '</label>' +
        '<div class="ineezy-md-photo-previews" id="ineezy-md-previews"></div>' +
        '<button type="button" class="ineezy-md-submit" id="ineezy-md-submit">Submit Review</button>' +
      '</div>';

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    function closeModal() {
      document.body.style.overflow = '';
      overlay.remove();
    }

    document.getElementById('ineezy-md-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });

    // Stars
    var starsEl = document.getElementById('ineezy-md-stars');
    starsEl.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.ineezy-md-star') : e.target;
      if (!btn || !btn.getAttribute('data-v')) return;
      selRating = parseInt(btn.getAttribute('data-v'), 10);
      [].forEach.call(starsEl.querySelectorAll('.ineezy-md-star'), function (s, i) {
        s.classList.toggle('on', i < selRating);
      });
    });

    // Load products
    fetch(base + '/api/public/shop-products', { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (json) {
        var products = (json.data || []).slice(0, 20);
        var listEl = document.getElementById('ineezy-md-products');
        if (!listEl) return;
        if (!products.length) { listEl.innerHTML = '<div style="font-size:13px;color:#ABA69F">No products found.</div>'; return; }
        listEl.innerHTML = products.map(function (p) {
          var checked = String(p.id) === String(preProductId) ? ' checked' : '';
          return '<label class="ineezy-md-product">' +
            '<input type="checkbox" name="ir-product" value="' + sanitize(String(p.id)) + '" data-title="' + sanitize(p.title || '') + '" data-handle="' + sanitize(p.handle || '') + '"' + checked + '>' +
            (p.image ? '<img src="' + sanitize(p.image) + '" alt="" loading="lazy">' : '') +
            '<div><div class="ineezy-md-product-name">' + sanitize(p.title || '') + '</div>' +
            (p.price ? '<div class="ineezy-md-product-price">' + sanitize(p.currency || '') + ' ' + sanitize(String(p.price)) + '</div>' : '') +
            '</div></label>';
        }).join('');
      })
      .catch(function () {
        var listEl2 = document.getElementById('ineezy-md-products');
        if (listEl2) listEl2.innerHTML = '<div style="font-size:13px;color:#ABA69F">Could not load products.</div>';
      });

    // Photo upload
    document.getElementById('ineezy-md-file').addEventListener('change', function (e) {
      selFiles = selFiles.concat(Array.prototype.slice.call(e.target.files || [])).slice(0, 5);
      renderPreviews();
      e.target.value = '';
    });

    function renderPreviews() {
      var wrap = document.getElementById('ineezy-md-previews');
      if (!wrap) return;
      wrap.innerHTML = selFiles.map(function (f, i) {
        return '<div class="ineezy-md-photo-wrap">' +
          '<img src="' + URL.createObjectURL(f) + '" alt="">' +
          '<button type="button" class="ineezy-md-photo-rm" data-i="' + i + '">×</button>' +
          '</div>';
      }).join('');
      [].forEach.call(wrap.querySelectorAll('.ineezy-md-photo-rm'), function (btn) {
        btn.addEventListener('click', function () {
          selFiles.splice(parseInt(btn.getAttribute('data-i'), 10), 1);
          renderPreviews();
        });
      });
    }

    // Submit
    document.getElementById('ineezy-md-submit').addEventListener('click', function () {
      if (!selRating) { alert('Please select a star rating.'); return; }
      var name = (document.getElementById('ineezy-md-name').value || '').trim();
      if (!name) { alert('Please enter your name.'); return; }
      var reviewText = (document.getElementById('ineezy-md-review').value || '').trim();
      if (!reviewText) { alert('Please write your review.'); return; }

      var checkedProducts = [];
      [].forEach.call(document.querySelectorAll('input[name="ir-product"]:checked'), function (cb) {
        checkedProducts.push({ product_id: cb.value, product_title: cb.getAttribute('data-title') || '', product_handle: cb.getAttribute('data-handle') || '' });
      });

      var submitBtn = document.getElementById('ineezy-md-submit');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting…';

      var fd = new FormData();
      fd.append('shop_domain', 'default');
      fd.append('customer_name', name);
      fd.append('customer_email', (document.getElementById('ineezy-md-email').value || '').trim());
      fd.append('rating', String(selRating));
      fd.append('title', (document.getElementById('ineezy-md-rtitle').value || '').trim());
      fd.append('review', reviewText);
      fd.append('products', JSON.stringify(checkedProducts));
      selFiles.forEach(function (f) { fd.append('images', f); });

      fetch(base + '/api/public/reviews/submit', { method: 'POST', body: fd })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, json: j }; }); })
        .then(function (res) {
          if (!res.ok || !res.json.success) throw new Error(res.json.errors ? res.json.errors.join(', ') : (res.json.message || 'Submission failed.'));
          var body = document.getElementById('ineezy-md-body');
          if (body) body.innerHTML = '<div class="ineezy-md-success"><div class="ineezy-md-success-icon">❤️</div><h3>Thank You!</h3><p>Your review has been submitted and will appear after approval.</p></div>';
        })
        .catch(function (err) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Review';
          alert('Error: ' + err.message);
        });
    });
  }

  /* ================================================================
     COMPACT PRODUCT RATING BADGE (e.g. inline on main-product.liquid)
     ================================================================ */
  function badgeStarsHTML(rating) {
    var filled = Math.round(rating);
    var FILLED_SVG = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.9634 5.09658C13.9185 4.95809 13.8339 4.83583 13.7202 4.74498C13.6064 4.65413 13.4685 4.5987 13.3235 4.58557L9.28207 4.21867L7.6849 0.479344C7.56696 0.204616 7.29866 0.0273438 7.00001 0.0273438C6.70135 0.0273438 6.43294 0.204616 6.31577 0.479344L4.7186 4.21867L0.676571 4.58557C0.380242 4.61292 0.129331 4.81362 0.0366345 5.09658C-0.00853441 5.2352 -0.0120479 5.38402 0.0265292 5.52461C0.0651063 5.6652 0.144079 5.79139 0.253666 5.88754L3.30865 8.56629L2.4079 12.5336C2.342 12.8253 2.4552 13.127 2.69726 13.3019C2.82403 13.3941 2.97681 13.4438 3.13359 13.4437C3.26798 13.4437 3.39985 13.4072 3.51512 13.3381L7.00001 11.2544L10.4843 13.3381C10.6093 13.4129 10.7534 13.4493 10.899 13.4429C11.0445 13.4365 11.1849 13.3874 11.3028 13.3019C11.5448 13.127 11.658 12.8253 11.5921 12.5336L10.6914 8.56632L13.7463 5.88757C13.8559 5.79142 13.9349 5.66524 13.9735 5.52464C14.0121 5.38405 14.0086 5.23522 13.9634 5.09661V5.09658Z" fill="#B69238"/></svg>';
    var EMPTY_SVG = FILLED_SVG.replace('#B69238', '#E9E5E2');
    var html = '';
    for (var i = 1; i <= 5; i++) html += i <= filled ? FILLED_SVG : EMPTY_SVG;
    return html;
  }

  function initRatingBadge(el, api) {
    var productId = el.getAttribute('data-product-id');
    if (!productId) return;

    api.ratings(productId).then(function (json) {
      var d = json.data || {};
      var avg = parseFloat(d.average) || 0;
      var count = d.count || 0;

      if (!count) return; // stays hidden -- mirrors the old "!= blank" check

      var starsEl = q('.ineezy-product-rating__stars', el);
      var countEl = q('.ineezy-product-rating__count', el);
      if (starsEl) starsEl.innerHTML = badgeStarsHTML(avg);
      if (countEl) countEl.textContent = count + ' Review' + (count !== 1 ? 's' : '');

      el.style.display = '';
    }).catch(function () {});
  }

  /* ================================================================
     WRITE REVIEW BUTTON
     ================================================================ */
  function initWriteBtn(el, appUrl) {
    var productId = el.getAttribute('data-product-id') || '';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ineezy-write-btn';
    btn.textContent = '✎ Write a Review';
    btn.addEventListener('click', function () { showReviewModal(appUrl, productId); });
    el.innerHTML = '';
    el.appendChild(btn);
  }

  /* ================================================================
     BOOT
     ================================================================ */
  function boot() {
    // Find any widget that has data-app-url, or fall back to a <meta> tag
    var appUrlEl = document.querySelector('[data-app-url]');
    var appUrl = appUrlEl
      ? appUrlEl.getAttribute('data-app-url')
      : (document.querySelector('meta[name="ineezy-app-url"]') || {}).content;

    if (!appUrl) {
      console.warn('[INEEZY Reviews] data-app-url not found. Widgets will not load.');
      return;
    }

    var api = buildApi(appUrl);

    // Summary
    [].forEach.call(document.querySelectorAll('[data-ineezy-summary]'), function (el) {
      initSummary(el, api);
    });

    // Review widget
    [].forEach.call(document.querySelectorAll('[data-ineezy-widget]'), function (el) {
      initWidget(el, api, appUrl);
    });

    // Gallery
    [].forEach.call(document.querySelectorAll('[data-ineezy-gallery]'), function (el) {
      initGallery(el, api);
    });

    // Testimonials
    [].forEach.call(document.querySelectorAll('[data-ineezy-testimonials]'), function (el) {
      initTestimonials(el, api);
    });

    // Write-review buttons
    [].forEach.call(document.querySelectorAll('[data-ineezy-write-btn]'), function (el) {
      initWriteBtn(el, appUrl);
    });

    // Compact rating badge
    [].forEach.call(document.querySelectorAll('[data-ineezy-rating-badge]'), function (el) {
      initRatingBadge(el, api);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
