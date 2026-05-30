// Initialize the slick slider for home-image-slider FIRST
$('.home-image-slider').slick({
    asNavFor: '.home-text-slider',
    centerMode: true,
    centerPadding: '500px',
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 2000,
    infinite: true,
    arrows: true,
    dots: false,
    prevArrow: "<button type='button' class='slick-prev pull-left'><img src='https://gerringongdental.com.au/wp-content/uploads/2023/08/fi-rr-arrow-small-right.svg' alt=''></button>",
    nextArrow: "<button type='button' class='slick-next pull-right'><img src='https://gerringongdental.com.au/wp-content/uploads/2023/08/fi-rr-arrow-small-right-1.svg' alt=''></button>",
    responsive: [
        {
            breakpoint: 1500,
            settings: {
                centerPadding: '500px',
                centerMode: true
            }
        },
        {
            breakpoint: 1400,
            settings: {
                centerPadding: '350px',
                centerMode: true
            }
        },
        {
            breakpoint: 1200,
            settings: {
                centerPadding: '100px',
                centerMode: true
            }
        },
        {
            breakpoint: 992,
            settings: {
                centerPadding: '30px',
                centerMode: true
            }
        },
        {
            breakpoint: 767,
            settings: {
                centerPadding: '20px',
                centerMode: false
            }
        },
        {
            breakpoint: 320,
            settings: {
                centerPadding: '20px',
                centerMode: false
            }
        },
    ]
});

// Now initialize the home-text-slider
$('.home-text-slider').slick({
    asNavFor: '.home-image-slider',
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 2000,
    infinite: true,
    arrows: false,
    dots: false,
    responsive: [{
        breakpoint: 992,
        settings: {
            dots: false
        }
    }]
});

$('.explore-slider').slick({
  dots: false,
  infinite: false,
  speed: 300,
  slidesToShow: 4,
  slidesToScroll: 4,
  prevArrow:"<button type='button' class='slick-prev pull-left'> <img src='https://cdn.shopify.com/s/files/1/0927/2603/4727/files/arrow-left.svg?v=1743747570' /> </button>",
  nextArrow:"<button type='button' class='slick-next pull-right'><img src='https://cdn.shopify.com/s/files/1/0927/2603/4727/files/arrow-right.svg?v=1743747570' /></button>",
  responsive: [
    {
      breakpoint: 1200,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 3,
        infinite: true,
        dots: true
      }
    },
    {
      breakpoint: 992,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2
      }
    },
    {
      breakpoint: 767,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2
      }
    }
    // You can unslick at a given breakpoint now by adding:
    // settings: "unslick"
    // instead of a settings object
  ]
});



$('.ineezy-hamper-slider').slick({
  dots: true,
  infinite: true,
  speed: 300,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000, // 3 seconds
});



$('.ineezy-main-home-slider').slick({
  dots: true,
  infinite: true,
  speed: 300,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000, // 3 seconds
    prevArrow:"<button type='button' class='slick-prev pull-left'> <img src='https://cdn.shopify.com/s/files/1/0927/2603/4727/files/arrow-left.svg?v=1743747570' /> </button>",
  nextArrow:"<button type='button' class='slick-next pull-right'><img src='https://cdn.shopify.com/s/files/1/0927/2603/4727/files/arrow-right.svg?v=1743747570' /></button>",
    responsive: [
    {
      breakpoint: 1200,
      settings: {
        arrows: false
      }
    }
  ]
});

$('.ineezy-home-category-slider').slick({
  dots: false,
  infinite: false,
  speed: 300,
  slidesToShow: 4,
  slidesToScroll: 4,
  infinite: false,
  prevArrow:"<button type='button' class='slick-prev pull-left'> <img src='https://cdn.shopify.com/s/files/1/0927/2603/4727/files/arrow-left.svg?v=1743747570' /> </button>",
  nextArrow:"<button type='button' class='slick-next pull-right'><img src='https://cdn.shopify.com/s/files/1/0927/2603/4727/files/arrow-right.svg?v=1743747570' /></button>",
  responsive: [
    {
      breakpoint: 1200,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 1,
        infinite: true,
        dots: false
      }
    },
    {
      breakpoint: 992,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 1,
        arrows: false
      }
    },
    {
      breakpoint: 767,
      settings: {
        slidesToShow: 2.2,
        slidesToScroll: 1,
        arrows: false
      }
    }
    // You can unslick at a given breakpoint now by adding:
    // settings: "unslick"
    // instead of a settings object
  ]
});

$('.spring-collection-slider').slick({ 
  dots: true,
  infinite: true,
  speed: 500,
   prevArrow:"<button type='button' class='slick-prev pull-left'> <img src='https://cdn.shopify.com/s/files/1/0927/2603/4727/files/arrow-left-2.svg' /> </button>",
  nextArrow:"<button type='button' class='slick-next pull-right'><img src='https://cdn.shopify.com/s/files/1/0927/2603/4727/files/arrow-right-2.svg' /></button>",
      responsive: [
    {
      breakpoint: 767,
      settings: {
          dots: false,
      }
    }
    // You can unslick at a given breakpoint now by adding:
    // settings: "unslick"
    // instead of a settings object
  ]
});

$('.ijl-home-testimonials-slider').slick({ 
    slidesToShow: 3,
    slidesToScroll: 1,
    dots: false,
    infinite: true,
    speed: 500,
    prevArrow:"<button type='button' class='slick-prev pull-left'> <img src='https://cdn.shopify.com/s/files/1/0927/2603/4727/files/arrow-left-2.svg' /> </button>",
    nextArrow:"<button type='button' class='slick-next pull-right'><img src='https://cdn.shopify.com/s/files/1/0927/2603/4727/files/arrow-right-2.svg' /></button>",
    responsive: [
    {
      breakpoint: 1200,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 1,
      }
    },
    {
      breakpoint: 992,
      settings: {
     slidesToShow: 2,
        slidesToScroll: 1,
      }
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      }
    }
    // You can unslick at a given breakpoint now by adding:
    // settings: "unslick"
    // instead of a settings object
  ]
});

$('.ijl-home-journal-slider').slick({ 
    slidesToShow: 3,
    slidesToScroll: 1,
    dots: false,
    infinite: true,
    speed: 500,
    prevArrow:"<button type='button' class='slick-prev pull-left'> <img src='https://cdn.shopify.com/s/files/1/0927/2603/4727/files/arrow-left-2.svg' /> </button>",
    nextArrow:"<button type='button' class='slick-next pull-right'><img src='https://cdn.shopify.com/s/files/1/0927/2603/4727/files/arrow-right-2.svg' /></button>",
     responsive: [
    {
      breakpoint: 1200,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 1,
      }
    },
    {
      breakpoint: 992,
      settings: {
     slidesToShow: 2,
        slidesToScroll: 1,
      }
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      }
    }
    // You can unslick at a given breakpoint now by adding:
    // settings: "unslick"
    // instead of a settings object
  ]
});

// $('.band-size-slider').slick({ 
//     slidesToScroll: 1,
//     dots: false,
//   variableWidth: true,
//   centerPadding: '60px',
//     infinite: false,
//     prevArrow:"<button type='button' class='slick-prev pull-left'> <img src='https://cdn.shopify.com/s/files/1/0927/2603/4727/files/caret-left.svg?v=1744715161' /> </button>",
//     nextArrow:"<button type='button' class='slick-next pull-right'><img src='https://cdn.shopify.com/s/files/1/0927/2603/4727/files/caret-right.svg?v=1744715161' /></button>",
// });

$('.suggested-blog-slider').slick({ 
   infinite: true,
    slidesToShow: 3,
    slidesToScroll: 3,
    responsive: [
    {
      breakpoint: 1200,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 3,
        infinite: true,
        dots: true
      }
    },
    {
      breakpoint: 992,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2
      }
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1
      }
    }
    // You can unslick at a given breakpoint now by adding:
    // settings: "unslick"
    // instead of a settings object
  ]
});

// single product page
$(document).ready(function () {
  // $('.product-form__input input[type="radio"]').on('change', function () {    
  //   setTimeout(function () {
  //     location.reload();
  //   }, 800); // 2000 milliseconds = 2 seconds
  // });

  // Find index of selected variant in the slider
  var $selected = $('.singlevariant .variant-pill-label.is-selected');
  if ($selected.length > 0) {
    var $slide = $selected.closest('.slick-slide');
    var selectedIndex = $slide.data('slick-index');

    if (typeof selectedIndex !== 'undefined') {
      console.log("Scrolling to variant index:", selectedIndex);
      $('.singlevariant').slick('slickGoTo', selectedIndex);
    } else {
      console.warn("Selected variant has no slick-index.");
    }
  } else {
    console.warn("No .is-selected variant found.");
  }
});

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('btn-edit-profile')?.addEventListener('click', function () {
      const tabTrigger = document.getElementById('profile-tab');
      if (tabTrigger) {
        const tab = new bootstrap.Tab(tabTrigger);
        tab.show();
      }
    });
  });

// My account
jQuery(document).ready(function() {
  // jQuery('.edit-profile').on('click', function(e) {
  //   e.preventDefault(); // Prevent the default anchor behavior
  //   jQuery('#profile-tab').tab('show'); // Trigger the Bootstrap tab
  // });

  $('.orderhistory').on('click', function(e) {
    e.preventDefault(); // Prevent the default anchor behavior
    $('#orders-tab').tab('show'); // Trigger the Bootstrap tab
  });

  $('.currentorder').on('click', function(e) {
    e.preventDefault(); // Prevent the default anchor behavior
    $('#orders-tab').tab('show'); // Trigger the Bootstrap tab
  });

  $('.wishlistbtn').on('click', function(e) {
    e.preventDefault(); // Prevent the default anchor behavior
    $('#wishlist-tab').tab('show'); // Trigger the Bootstrap tab
  });

  $('.couponsbtn').on('click', function(e) {
    e.preventDefault(); // Prevent the default anchor behavior
    $('#offers-tab').tab('show'); // Trigger the Bootstrap tab
  });

  $(document).on('click', '.orderbackbtn', function () {
    // e.preventDefault(); // Prevent the default anchor behavior
    const orderListing = document.querySelector('.order-listing');
    const orderDetails = document.querySelector('.order-details');
    orderListing.style.display = 'block';
    orderDetails.style.display = 'none';
  });
  
});

// Metal Type Text Change
$(document).ready(function () {
    // Enable HTML5 validation
    const form = $("form[novalidate]");
    if (form.length) form.removeAttr("novalidate");

    const output = $("#variant-selected-text");

    function updateSelectedText() {
        const selectedType = $('input[name="properties[Type]"]:checked').val() || '';
        const selectedColor = $('input[name="properties[Color]"]:checked').val() || '';
        output.text(selectedType + " - " + selectedColor);
    }

    function updateIsSelectedClasses(name) {
        const inputs = $(`input[name="${name}"]`);
        inputs.each(function () {
            const label = $(`label[for="${this.id}"]`);
            label.removeClass('is-selected');
            if ($(this).is(':checked')) {
                label.addClass('is-selected');
            }
        });
    }

    // Initial setup
    updateSelectedText();
    updateIsSelectedClasses("properties[Type]");
    updateIsSelectedClasses("properties[Color]");

    $('.variant-pill-input').on('change', function () {
        updateSelectedText();
        updateIsSelectedClasses($(this).attr('name'));
    });
});

// Diamond Type Text Change
jQuery(document).ready(function ($) {
  function updateDiamondText() {
    const category = $('input[name^="Category"]:checked').val() || 'Lab Jewelry';
    const clarity = $('input[name^="Clarity"]:checked').val() || 'VVS';
    const cartSize = $('input[name^="Cart Size"]:checked').val() || '1';

    const fullText = `${category} - ${clarity} - ${cartSize}`;
    $(".diamond-variation").text(fullText);
  }

  // Initial load
  updateDiamondText();

  // Use event delegation for dynamic elements
  $(document).on("change", 'input[name^="Category"], input[name^="Clarity"], input[name^="Cart Size"]', function() {
    updateDiamondText();
  });
});

// // Band Size Text Change
// $(document).ready(function() {
//   $('.band-size-slider input').on('click', function() {  
//     var selectedSize = $(this).val();
//     $('.band-size-title h6 span').text(selectedSize);
//   });
// });

// wishlist count bug
jQuery(document).ready(function ($) {
  function updateWishlistCount() {
    // Get the count element
    var $countElement = $('.wishlist-hero-items-count.cart-count-bubble');
    
    // Log for debugging
    console.log('Count element found:', $countElement.length, 'Current text:', $countElement.text());
    
    // Proceed only if the element exists
    if ($countElement.length) {
      var currentCount = parseInt($countElement.text()) || 0;
      var newCount = currentCount - 2;
      
      // Ensure the count doesn't go below 0
      if (newCount < 0) {
        newCount = 0;
      }
      
      // Update the span with the new count
      $countElement.text(newCount);
      
      // Toggle visibility based on count
      if (newCount === 0) {
        $countElement.hide();
      } else {
        $countElement.show();
      }
      
      console.log('Updated count to:', newCount);
    } else {
      console.log('Count element not found during updateWishlistCount');
    }
  }

  // Initial check and attempt to update
  console.log('Initial check - Element exists:', $('.wishlist-hero-items-count.cart-count-bubble').length);
  if ($('.wishlist-hero-items-count.cart-count-bubble').length) {
    console.log('Running initial updateWishlistCount');
    updateWishlistCount();
  } else {
    console.log('Element not found on initial load');
  }

  // Handle button click with event delegation
  $(document).on('click', '.wishlist-main', function() {
    console.log('Add to wishlist button clicked');
    updateWishlistCount();
  });

  // Listen for Shopify section load events
  $(document).on('shopify:section:load', function(event) {
    console.log('Shopify section loaded:', event.target);
    if ($(event.target).find('.wishlist-hero-items-count.cart-count-bubble').length) {
      console.log('Wishlist count element found in section, updating...');
      updateWishlistCount();
    } else {
      console.log('Wishlist count element not found in loaded section');
    }
  });

  // Poll for the element as a fallback for dynamic loading
  var checkInterval = setInterval(function() {
    if ($('.wishlist-hero-items-count.cart-count-bubble').length) {
      console.log('Element found via polling, updating...');
      updateWishlistCount();
      clearInterval(checkInterval); // Stop polling once found
    }
  }, 500); // Check every 500ms

  // Optional: Listen for Wishlist Hero-specific events
  $(document).on('wishlist:updated', function() {
    console.log('Wishlist updated event triggered');
    updateWishlistCount();
  });

  // Stop polling after a timeout (e.g., 10 seconds) to avoid infinite polling
  setTimeout(function() {
    clearInterval(checkInterval);
    console.log('Stopped polling for wishlist count element');
  }, 10000);
});

// Video Auto Play in product page
jQuery(document).ready(function ($) {
  var $button = $('#Deferred-Poster-Modal-41416891433255');

  if ($button.length) {
    var $template = $button.siblings('template');
    if ($template.length) {
      var videoHtml = $template.html();

      // Inject the video into the DOM
      var $mediaWrapper = $button.closest('.deferred-media');
      $mediaWrapper.html(videoHtml);

      // Select and configure the video
      var video = $mediaWrapper.find('video')[0];
      if (video) {
        video.muted = true; // required for autoplay
        video.autoplay = true;
        video.playsInline = true;
        video.loop = true;  // enable looping

        // Attempt to play
        video.play().catch(function (e) {
          console.warn("Autoplay failed:", e);
        });
      }
    }
  }
});

// Read More / Read Less
$(document).ready(function () {
  const $descriptionText = $(".description-text");
  const $fullDescription = $(".full-description");
  const $toggleLink = $(".read-more-toggle");

  // Check if full description is longer
  if ($fullDescription.text().length > $descriptionText.text().length) {
    $descriptionText.show();
  } else {
    $toggleLink.hide();
  }

  $toggleLink.on("click", function (e) {
    e.preventDefault();
    if ($descriptionText.is(":visible")) {
      $descriptionText.hide();
      $fullDescription.show();
      $toggleLink.text("Read Less");
    } else {
      $descriptionText.show();
      $fullDescription.hide();
      $toggleLink.text("Read More");
    }
  });
});

// 
// document.addEventListener('click', function (event) {
//   console.log("cliecked");
//   const dropdown = document.querySelector('.shop-filter-dropdown');
  
//   if (dropdown.style.display == 'block') {
//     console.log(dropdown.style.display);
//     dropdown.style.display = 'none';
//   }else if (dropdown.style.display == 'none') {
//     console.log(dropdown.style.display);
//     dropdown.style.display = 'block';
//   }
// });

