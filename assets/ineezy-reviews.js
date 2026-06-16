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
