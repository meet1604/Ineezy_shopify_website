document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.ijl-product-card').forEach(card => {
    const mainImage = card.querySelector('.ijl-product-image-one');
    const hoverImage = card.querySelector('.ijl-product-image-two');
    const swatches = card.querySelectorAll('.variant-swatch');

    swatches.forEach(swatch => {
      swatch.addEventListener('click', function () {
        // Remove 'active' from all swatches
        swatches.forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');

        // Get the image URL
        const imageUrl = swatch.getAttribute('data-image-url');
        if (imageUrl && mainImage && hoverImage) {
          const fullUrl = imageUrl.startsWith('//') ? 'https:' + imageUrl : imageUrl;

          // Update both main and hover images
          mainImage.setAttribute('src', fullUrl);
          hoverImage.setAttribute('src', fullUrl); // Optional: use different image for hover if needed

          console.log('✅ Images updated to:', fullUrl);
        } else {
          console.warn('⚠️ Missing image URL or image element');
        }
      });
    });
  });
});

// JavaScript to handle variant image swapping
document.addEventListener('DOMContentLoaded', function() {
   // Select all product cards
   const productCards = document.querySelectorAll('.ijl-product-card');

   productCards.forEach(card => {
      // Find all variant swatches in this card
      const swatches = card.querySelectorAll('.variant-swatch');
      const productImage = card.querySelector('.ijl-product-card-image img.active-image');
      const defaultImage = productImage.getAttribute('data-default-image');

      swatches.forEach(swatch => {
         swatch.addEventListener('click', function() {
            // Get the image URL associated with this variant
            const imageUrl = this.getAttribute('data-image-url');

            // Update the product image
            if (imageUrl) {
               productImage.src = imageUrl;
            } else {
               // Fallback to default image if no variant image is available
               productImage.src = defaultImage;
            }

            // Optional: Add active class to the selected swatch (for styling)
            swatches.forEach(s => s.classList.remove('active-swatch'));
            this.classList.add('active-swatch');
         });
      });
   });
});

console.log('development js loaded');

 




  // On page load

                
     

//quick button features
$(document).on('click', '#quick-view-btn', function () {
  const handle = $(this).data('product-handle');

  // Helper function to format price from cents to dollars
  function formatPrice(cents) {
    return `$${(cents / 100).toFixed(2)}`; // e.g., 5500 -> $55.00, 6999 -> $69.99
  }

  $.getJSON(`/products/${handle}.js`, function (product) {
    // Set product title and description
    $('#quick-view-title').text(product.title);
    $('#quick-view-description').html(product.description);

    // Format price or price range
    let priceText;
    if (product.price_min === product.price_max) {
      priceText = formatPrice(product.price_min); // Single price, e.g., $55.00
    } else {
      priceText = `${formatPrice(product.price_min)} - ${formatPrice(product.price_max)}`; // Range, e.g., $55.00 - $69.99
    }
    $('#quick-view-price').text(priceText);

    const $slider = $('#quick-view-slider');

    // Destroy existing Slick instance and clear slider content
    if ($slider.hasClass('slick-initialized')) {
      $slider.slick('unslick');
    }
    $slider.empty();

    // Inject product images
    const sliderHtml = product.images.map(img => `
      <img src="${img}" height="50" width="50" class="img-fluid product-thumbnail" alt="Product Image">
    `).join('');
    $slider.html(sliderHtml);

    // Reviews using Shopify's badge system
    $('#quick-view-reviews').html(`
      <span class="shopify-product-reviews-badge" data-id="${product.id}"></span>
    `);

    // Step 1: Parse and group variants
let categories = {};
let allClarities = new Set();
let allSizes = new Set();

// Build category structure & collect all clarity and size values
product.variants.forEach(variant => {
  const [category, clarity, size] = variant.title.split(' / ');
  if (!category || !clarity || !size) return;

  if (!categories[category]) categories[category] = {};
  if (!categories[category][clarity]) categories[category][clarity] = {};
  categories[category][clarity][size] = variant;

  allClarities.add(clarity);
  allSizes.add(size);
});

function generateVariantBlock(labelText, items, type) {
  return `
    <div class="pills-variant">
      <div class="product-form__input product-form__input--pill pills-variant-${type.toLowerCase()}">
        <label class="form__label">${labelText}</label>
        <div class="custom-radio singlevariant">
          ${items.map(value => {
            const id = `${type}-${value.replace(/\s+/g, '')}`;
            return `
              <div class="variant-pill-wrapper">
                <input type="radio" id="${id}" class="variant-pill-input ${type.toLowerCase()}-btn" name="variant-${type}" value="${value}">
                <label class="variant-radio-label variant-pill-label" for="${id}">${value}</label>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

// Generate UI
let uiHtml = `
  <div class="main-variant-picker">
    <h5 class="variant-picker-heading">Diamond: &nbsp;
      <span class="variant-picker-heading-span" id="variant-selected-text">Not selected</span>
    </h5>
    ${generateVariantBlock('Category', Object.keys(categories), 'Category')}
    ${generateVariantBlock('Clarity', Array.from(allClarities), 'Clarity')}
    ${generateVariantBlock('Cart Size', Array.from(allSizes), 'Size')}
  </div>
`;

// Inject UI
$('#quick-view-variants').html(uiHtml).show();
let selected = { category: null, clarity: null, size: null };

// Click handlers
$(document).on('change', '.category-btn', function () {
  selected.category = $(this).val();
  updateIsSelectedClasses($(this).attr('name'));
  trySetVariant();
});

$(document).on('change', '.clarity-btn', function () {
  selected.clarity = $(this).val();
  updateIsSelectedClasses($(this).attr('name'));
  trySetVariant();
});

$(document).on('change', '.size-btn', function () {
  selected.size = $(this).val();
  updateIsSelectedClasses($(this).attr('name'));
  trySetVariant();
});

function updateIsSelectedClasses(name) {
  console.log("Function called");
  const inputs = $(`input[name="${name}"]`);
  inputs.each(function () {
      const label = $(`label[for="${this.id}"]`);
      label.removeClass('is-selected');
      if ($(this).is(':checked')) {
          label.addClass('is-selected');
      }
  });
}

// Try to set the selected variant ID
function trySetVariant() {
  const { category, clarity, size } = selected;
  if (category && clarity && size && categories[category] && categories[category][clarity] && categories[category][clarity][size]) {
    const variant = categories[category][clarity][size];
    $('#quick-view-add-to-cart').data('variant-id', variant.id);
    $('#variant-selected-text').text(`${category} - ${clarity} - ${size}`);
    console.log('Selected Variant ID:', variant.id);
  }
}



    // Dynamically set the product URL for the modal button
    const $modalBuyNowButton = $('#quickViewModal .btn-primary');
    $modalBuyNowButton.attr('onclick', `window.location.href='${product.url}'`);
    // Update disabled state damper on product availability
    if (product.available) {
      $modalBuyNowButton.removeClass('disabled').removeAttr('disabled');
    } else {
      $modalBuyNowButton.addClass('disabled').attr('disabled', 'disabled');
    }

    // Dynamically append color swatches and description
    const $variationWrapper = $('#quickViewModal .ijl-product-variation-metal-wrapper');
    let variationHtml = '';

    // Check if product has a "Color" option
    let hasColorOption = false;
    let colorOptionIndex = 1;
    product.options.forEach((option, index) => {
      if (option.name === 'Color') {
        hasColorOption = true;
        colorOptionIndex = index + 1;
      }
    });
    
    if (hasColorOption) {
      variationHtml += '<span class="product-color">Color</span><div class="ijl-product-variation">';
      product.variants.forEach(variant => {
        const colorValue = variant[`option${colorOptionIndex}`];
        if (variant.available && colorValue) {
          const imageUrl = variant.featured_image ? variant.featured_image.src : product.featured_image;
          variationHtml += `
            <div class="ijl-product-variation-item">
              <span class="variant-swatch" 
                    style="background-color: ${colorValue.toLowerCase()};" 
                    title="${colorValue}"
                    data-variant-id="${variant.id}"
                    data-image-url="${imageUrl}"></span>
            </div>
          `;
        }
      });
      variationHtml += '</div>';
    }

    // Append description (truncate to 100 characters)
    // const descriptionText = product.description.replace(/(<([^>]+)>)/gi, '').substring(0, 100);
    // variationHtml += `
    //   <div class="ijl-product-metal-text">
    //     <p>${descriptionText}</p>
    //   </div>
    // `;

    // Inject the generated HTML into the wrapper
    $variationWrapper.html(variationHtml);

    // Show modal
    $('#quickViewModal').modal('show');

    // Initialize slick after modal is shown
    $('#quickViewModal').off('shown.bs.modal').on('shown.bs.modal', function () {
      const $slider = $('#quick-view-slider');
      if (!$slider.hasClass('slick-initialized')) {
        $slider.slick({
          dots: false,
          infinite: true,
          speed: 500,
          prevArrow: "<button type='button' class='slick-prev pull-left'><img src='https://cdn.shopify.com/s/files/1/0927/2603/4727/files/arrow-left-2.svg' /></button>",
          nextArrow: "<button type='button' class='slick-next pull-right'><img src='https://cdn.shopify.com/s/files/1/0927/2603/4727/files/arrow-right-2.svg' /></button>",
        });
      }
    });
  });
});
    
$('.shop-filter-item .btn').click(function() {
        $('.shop-filter-dropdown').toggle();
});

const savedToken = localStorage.getItem('authToken');
console.log('🔐 Token from localStorage:', savedToken);
    



//custom-login-form
$(document).ready(function () {
  $('#custom-login-form').on('submit', function (e) {
    const email = $('#login-email').val().trim();
    const password = $('#login-password').val().trim();

    // Save email & password temporarily in sessionStorage
    sessionStorage.setItem('tempEmail', email);
    sessionStorage.setItem('tempPassword', password);

    // Let the form submit naturally (do NOT preventDefault)
  });

  // After redirect to /account (user logged in)
  if (window.location.pathname === '/account') {
    const email = sessionStorage.getItem('tempEmail');
    const password = sessionStorage.getItem('tempPassword');

    if (email && password) {
      // Call for access token
      getAccessToken(email, password).then(function (tokenData) {
        if (tokenData.accessToken) {
          localStorage.setItem('authToken', tokenData.accessToken);
          localStorage.setItem('authTokenExpiresAt', tokenData.expiresAt);

          console.log('✅ Access Token:', tokenData.accessToken);
          console.log('⏳ Expires At:', tokenData.expiresAt);

          // Cleanup
          sessionStorage.removeItem('tempEmail');
          sessionStorage.removeItem('tempPassword');
        }
      }).catch(function (err) {
        console.error('❌ Error getting access token:', err.message);
      });
    }
  }

  function getAccessToken(email, password) {
    return new Promise(function (resolve, reject) {
      $.ajax({
        url: 'https://ineezy.myshopify.com/api/2025-07/graphql.json',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': '881ac94b12f00d73ce71dfbfc410a115'
        },
        data: JSON.stringify({
          query: `
            mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
              customerAccessTokenCreate(input: $input) {
                customerAccessToken {
                  accessToken
                  expiresAt
                }
                userErrors {
                  field
                  message
                }
              }
            }
          `,
          variables: {
            input: { email, password }
          }
        }),
        success: function (response) {
          const data = response.data.customerAccessTokenCreate;
          if (data.customerAccessToken) {
            resolve({
              accessToken: data.customerAccessToken.accessToken,
              expiresAt: data.customerAccessToken.expiresAt
            });
          } else {
            const errors = data.userErrors.map(err => err.message).join(', ');
            reject(new Error(errors || 'Failed to get token'));
          }
        },
        error: function (xhr) {
          reject(new Error('GraphQL failed: ' + xhr.statusText));
        }
      });
    });
  }
});


//arget your specific tab remember last tab account section
$(document).ready(function () {
  const $tabs = $('.my-account-menu .nav-link'); // Target your specific tab buttons
  const lastTabKey = 'lastVisitedTab'; // Key for localStorage
  const $tabContent = $('#v-pills-tabContent');

  // Function to set the active tab
  function setActiveTab(tabTarget) {
    const tabId = tabTarget; // Use the data-bs-target value (e.g., #dashboard)
    $tabs.removeClass('active').filter(`[data-bs-target="${tabId}"]`).addClass('active');
    $tabContent.find('.tab-pane').removeClass('show active').filter(tabId).addClass('show active');
    localStorage.setItem(lastTabKey, tabId); // Save the last visited tab
  }

  // On page load, check and set the last visited tab
  const lastTab = localStorage.getItem(lastTabKey);
  if (lastTab && $tabs.filter(`[data-bs-target="${lastTab}"]`).length) {
    // setActiveTab(lastTab);
    // Manually activate Bootstrap tab
    new bootstrap.Tab($tabs.filter(`[data-bs-target="${lastTab}"]`)[0]).show();
  } else {
    // Default to the first tab if no last tab or invalid
    // setActiveTab($tabs.first().data('bs-target'));
    new bootstrap.Tab($tabs.first()[0]).show();
  }

  // Handle tab click to update the active tab and store it
  $tabs.on('shown.bs.tab', function (e) {
    const tabId = $(e.target).data('bs-target'); // Get the target from the event
    localStorage.setItem(lastTabKey, tabId);
  });
});


//Storefront API to update profile account section
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('customerNameUpdateForm');
  const messageEl = document.getElementById('updateMessage');

  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();

      const firstName = document.getElementById('firstName').value.trim();
      const lastName = document.getElementById('lastName').value.trim();
      const email = document.getElementById('email').value.trim();
      // const dob = document.getElementById('dob').value;
      // const anniversary = document.getElementById('anniversary').value;

      const customerAccessToken = localStorage.getItem('authToken');

      if (!customerAccessToken) {
        showMessage('You need to be logged in to update your information.', 'error');
        return;
      }

      try {
        const response = await updateCustomerInfo(customerAccessToken, firstName, lastName, email);

        if (response.errors) {
          console.error('GraphQL Errors:', response.errors);
          showMessage('Failed to update your profile. Please try again.', 'error');
          return;
        }

        const errors = response.data?.customerUpdate?.userErrors;
        if (errors && errors.length > 0) {
          showMessage(errors[0].message, 'error');
        } else {
          showMessage('Your information has been updated successfully!', 'success');
        }
      } catch (error) {
        console.error('Request Error:', error);
        showMessage('Something went wrong. Please try again.', 'error');
      }
    });
  }

  async function updateCustomerInfo(token, firstName, lastName) {
    const mutation = `
      mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
        customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
          customer {
            id
            firstName
            lastName
            email
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      customerAccessToken: token,
      customer: {
        firstName,
        lastName,
        email,
      }
    };

    const res = await fetch('https://ineezy.myshopify.com/api/2025-07/graphql.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': '881ac94b12f00d73ce71dfbfc410a115'
      },
      body: JSON.stringify({ query: mutation, variables })
    });

    return await res.json();
  }

  function showMessage(message, type) {
    if (!messageEl) return;

    messageEl.textContent = message;
    messageEl.style.display = 'block';
    messageEl.style.color = type === 'success' ? 'green' : 'red';
    messageEl.style.padding = '10px';
    messageEl.style.margin = '10px 0';
    messageEl.style.borderRadius = '4px';
    messageEl.style.backgroundColor = type === 'success' ? '#f0fff0' : '#fff0f0';

    setTimeout(() => {
      messageEl.style.display = 'none';
    }, 5000);
  }
});



//list order details on customer account page
document.addEventListener('DOMContentLoaded', () => {
  const viewDetailsLinks = document.querySelectorAll('.view-details-link');
  const orderListing = document.querySelector('.order-listing');
  const orderDetails = document.querySelector('.order-details');
  let ordersData = [];

  // Load JSON data with error handling
  const jsonElement = document.getElementById('customer-orders-data');
  if (jsonElement && jsonElement.textContent) {
    try {
      const jsonData = jsonElement.textContent;
      ordersData = JSON.parse(jsonData).orders || [];
      console.log('Orders data loaded:', ordersData);
    } catch (error) {
      console.error('Error parsing JSON data:', error);
    }
  } else {
    console.warn('JSON data element not found or empty');
  }

  // Handle View Details click
  viewDetailsLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const orderId = parseInt(link.dataset.orderId);
      const order = ordersData.find(o => o.id === orderId);

      if (order) {
        renderOrderDetails(order);
        orderListing.style.display = 'none';
        orderDetails.style.display = 'block';
      } else {
        console.error('Order not found:', orderId);
        orderDetails.innerHTML = '<p>Order details not available.</p><button class="back-button">Back</button>';
        orderListing.style.display = 'none';
        orderDetails.style.display = 'block';
      }
    });
  });

  // Handle Back button click using event delegation
  // orderDetails.addEventListener('click', (e) => {
  //   if (e.target.classList.contains('back-button')) {
  //     e.preventDefault();
  //     console.log('Back button clicked');
  //     orderDetails.style.display = 'none';
  //     orderListing.style.display = 'block';
  //     orderDetails.innerHTML = '<button class="back-button">Back</button>'; // Reset to initial state
  //   }
  // });

  // Render order details
  function renderOrderDetails(order) {
    const orderDate = new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const cancelledDate = order.cancelled_at ? new Date(order.cancelled_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
    let html = `
    <div class="d-flex align-items-center gap-4">
      <button class="btn orderbackbtn btn-icon btn-primary">
        <i class="svg-wrapper"> <img src="/cdn/shop/t/2/assets/arrow-left-2.svg" alt="Back Arrow" style="width: 16px; height: 16px;"> </i>
      </button>
      <div>
      <h2>Order ${order.name}</h2>
      <p class="mb-0">Date: ${orderDate}</p>
    </div>
    </div>
      
      ${order.cancelled ? `<p>Cancelled on: ${cancelledDate}</p><p>Reason: ${order.cancel_reason_label}</p>` : ''}

      <table role="table" class="order-details">
        <caption class="visually-hidden">Order ${order.name}</caption>
        <thead role="rowgroup">
          <tr role="row">
            <th id="ColumnProduct" scope="col" role="columnheader">Product</th>
            <th id="ColumnSku" scope="col" role="columnheader">SKU</th>
            <th id="ColumnPrice" scope="col" role="columnheader">Price</th>
            <th id="ColumnQuantity" scope="col" role="columnheader">Quantity</th>
            <th id="ColumnTotal" scope="col" role="columnheader">Total</th>
          </tr>
        </thead>
        <tbody role="rowgroup">
    `;

    order.line_items.forEach(line_item => {
      html += `
        <tr role="row">
          <td id="Row${line_item.key}" headers="ColumnProduct" role="rowheader" scope="row" data-label="Product">
            <div>
              <p>${line_item.title}</p>
              ${line_item.variant_title && line_item.variant_title !== 'Default Title' ? `<span>${line_item.variant_title}</span>` : ''}
            </div>
          </td>
          <td headers="Row${line_item.key} ColumnSku" role="cell" data-label="SKU">${line_item.sku || ''}</td>
          <td headers="Row${line_item.key} ColumnPrice" role="cell" data-label="Price">${line_item.final_price}</td>
          <td headers="Row${line_item.key} ColumnQuantity" role="cell" data-label="Quantity">${line_item.quantity}</td>
          <td headers="Row${line_item.key} ColumnTotal" role="cell" data-label="Total">${line_item.final_line_price}</td>
        </tr>
      `;
    });

    html += `
        </tbody>
        <tfoot role="rowgroup">
          <tr role="row">
            <td id="RowSubtotal" role="rowheader" scope="row" colspan="4">Subtotal</td>
            <td headers="RowSubtotal" role="cell" data-label="Subtotal">${order.line_items_subtotal_price}</td>
          </tr>
          ${order.shipping_methods.length > 0 ? `<tr role="row"><td id="RowShipping" role="rowheader" scope="row" colspan="4">Shipping (${order.shipping_methods[0].title})</td><td headers="RowShipping" role="cell" data-label="Shipping">${order.shipping_methods[0].price}</td></tr>` : ''}
          <tr role="row">
            <td id="RowTotal" role="rowheader" scope="row" colspan="3">Total</td>
            <td headers="RowTotal" role="cell" colspan="2" data-label="Total">${order.total_net_amount}</td>
          </tr>
        </tfoot>
      </table>

      <div>
        <div>
          <h2>Billing Address</h2>
          <p><strong>Payment Status:</strong> ${order.financial_status_label}</p>
          <p>${order.billing_address.name || ''}<br>${order.billing_address.address1 || ''}<br>${order.billing_address.city || ''}, ${order.billing_address.province_code || ''} ${order.billing_address.zip || ''}<br>${order.billing_address.country || ''}</p>
        </div>
        <div>
          <h2>Shipping Address</h2>
          <p><strong>Fulfillment Status:</strong> ${order.fulfillment_status_label}</p>
          <p>${order.shipping_address.name || ''}<br>${order.shipping_address.address1 || ''}<br>${order.shipping_address.city || ''}, ${order.shipping_address.province_code || ''} ${order.shipping_address.zip || ''}<br>${order.shipping_address.country || ''}</p>
        </div>
      </div>
    `;

    orderDetails.innerHTML = html + '<button class=" orderbackbtn back-button btn btn-primary">Back</button>';
  }
  });

// User information Update
$(document).ready(function() {
   $('#update-customer').on('submit', function(e) {
     e.preventDefault();
    console.log("update-customer clicked");
     $.ajax({
       type: 'POST',
       url: '{{ shop.url }}/account', // Use absolute URL
       data: $(this).serialize(),
       success: function(response) {
         alert('Profile updated successfully!');
         // Optionally refresh page
         window.location.reload();
       },
       error: function(xhr, status, error) {
         console.log('Error:', xhr.status, xhr.responseText);
         alert('Error updating profile: ' + xhr.status + ' - ' + error);
       }
     });
   });
 });

$(document).ready(function () {
  $('#address_form_new').on('submit', function (e) {
    e.preventDefault(); 

    var $form = $(this);
    var formData = $form.serialize();

    $.ajax({
      type: 'POST',
      url: '/account/addresses',
      data: formData,
      success: function () {
      
        console.log('Address added successfully.');
        location.reload(); 
      },
      error: function () {
        alert('There was an error adding the address. Please try again.');
      }
    });
  });
});


$(document).on('click', '.delete-address-button', function (e) {
  e.preventDefault();

  const confirmMessage = $(this).data('confirm-message') || 'Are you sure?';
  const deleteUrl = $(this).data('target');

  if (!deleteUrl) return;

  if (confirm(confirmMessage)) {
    $.ajax({
      type: 'POST',
      url: deleteUrl,
      data: {
        _method: 'delete' // method spoofing required by Shopify
      },
      success: function () {
        // Optional: fade out and remove the address item
      location.reload();
      },
      error: function () {
        alert('Failed to delete the address. Please try again.');
      }
    });
  }
});




  function addToCartWithDawn(variantId) {
    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        id: variantId,
        quantity: 1
      })
    })
    .then(res => {
      if (!res.ok) throw new Error('Add to cart failed');
      return res.json();
    })
    .then(() => {
      const oldDrawer = document.querySelector('cart-drawer');

      if (oldDrawer) {
        fetch('/?section_id=cart-drawer')
          .then(res => res.text())
          .then(html => {
            const htmlDoc = new DOMParser().parseFromString(html, 'text/html');
            const newDrawer = htmlDoc.querySelector('cart-drawer');

            if (newDrawer) {
              oldDrawer.replaceWith(newDrawer);
              newDrawer.classList.add('active');
              document.body.classList.add('overflow-hidden');

              // Rebind close events after replacement
              bindCartDrawerCloseListeners();
            }
          });
      }
    })
    .catch(err => {
      console.error('Add to cart error:', err);
    });
  }

  function bindCartDrawerCloseListeners() {
    document.addEventListener('click', function (event) {
      const cartDrawer = document.querySelector('cart-drawer');
      if (
        cartDrawer &&
        cartDrawer.classList.contains('active') &&
        !cartDrawer.contains(event.target) &&
        !event.target.closest('[data-cart-toggle], .ijl-product-card-action-button, .cart-icon-bubble')
      ) {
        cartDrawer.classList.remove('active');
        document.body.classList.remove('overflow-hidden');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        const cartDrawer = document.querySelector('cart-drawer');
        if (cartDrawer && cartDrawer.classList.contains('active')) {
          cartDrawer.classList.remove('active');
          document.body.classList.remove('overflow-hidden');
        }
      }
    });
  }

  // ✅ Initial bind
  document.addEventListener('DOMContentLoaded', bindCartDrawerCloseListeners);