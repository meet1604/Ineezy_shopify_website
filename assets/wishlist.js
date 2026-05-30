// // Wishlist.js - Handles wishlist functionality for Shopify product cards with count update
// (function () {
//   const Wishlist = {
//     storageKey: 'shopify_wishlist',
//     storefrontApiUrl: '/api/2025-01/graphql.json',
//     storefrontAccessToken: '98de43688c0e42838a69f3caacd1e0de', // Your Storefront API token

//     init() {
//       this.loadWishlist();
//       this.bindEvents();
//     },

//     async loadWishlist() {
//       let wishlist = JSON.parse(localStorage.getItem(this.storageKey)) || [];
//       if (this.isLoggedIn()) {
//         const serverWishlist = await this.fetchWishlistFromMetafield();
//         wishlist = [...new Set([...wishlist, ...serverWishlist])];
//         localStorage.setItem(this.storageKey, JSON.stringify(wishlist));
//         if (serverWishlist.length !== wishlist.length) {
//           await this.updateWishlistMetafield(wishlist);
//         }
//       }
//       this.updateWishlistButtons(wishlist);
//       this.updateWishlistCount(wishlist); // Update count on load
//     },

//     bindEvents() {
//       document.querySelectorAll('.wishlist-btn').forEach(btn => {
//         btn.addEventListener('click', () => this.toggleWishlist(btn));
//       });
//       document.addEventListener('wishlist-updated', () => this.loadWishlist());
//     },

//     async toggleWishlist(btn) {
//       const handle = btn.dataset.productHandle;
//       const iconDefault = btn.dataset.iconDefault;
//       const iconFilled = btn.dataset.iconFilled;
//       const iconElement = btn.querySelector('.wishlist-icon');
//       let wishlist = JSON.parse(localStorage.getItem(this.storageKey)) || [];

//       if (wishlist.includes(handle)) {
//         wishlist = wishlist.filter(item => item !== handle);
//         btn.classList.remove('is-active');
//         if (iconElement && iconDefault) {
//           iconElement.src = iconDefault; // Set to new-icon-wishlight.svg
//         }
//       } else {
//         wishlist.push(handle);
//         btn.classList.add('is-active');
//         if (iconElement && iconFilled) {
//           iconElement.src = iconFilled; // Set to new-icon-wishlight-fill.svg
//         }
//       }

//       localStorage.setItem(this.storageKey, JSON.stringify(wishlist));
//       if (this.isLoggedIn()) {
//         await this.updateWishlistMetafield(wishlist);
//       }
//       document.dispatchEvent(new Event('wishlist-updated'));
//       this.updateWishlistCount(wishlist); // Update count after toggle
//     },

//     updateWishlistButtons(wishlist) {
//       document.querySelectorAll('.wishlist-btn').forEach(btn => {
//         const handle = btn.dataset.productHandle;
//         const iconDefault = btn.dataset.iconDefault;
//         const iconFilled = btn.dataset.iconFilled;
//         const iconElement = btn.querySelector('.wishlist-icon');

//         if (wishlist.includes(handle)) {
//           btn.classList.add('is-active');
//           if (iconElement && iconFilled) {
//             iconElement.src = iconFilled; // Set to new-icon-wishlight-fill.svg
//           }
//         } else {
//           btn.classList.remove('is-active');
//           if (iconElement && iconDefault) {
//             iconElement.src = iconDefault; // Set to new-icon-wishlight.svg
//           }
//         }
//       });
//     },

//     updateWishlistCount(wishlist) {
//       const countElement = document.querySelector('#wishlist-count-number span');
//       if (countElement) {
//         countElement.textContent = wishlist.length; // Update the count
//       }
//     },

//     isLoggedIn() {
//       return !!window.Shopify?.customer;
//     },

//     async fetchWishlistFromMetafield() {
//       const query = `
//         query {
//           customer(customerAccessToken: "${this.getCustomerAccessToken()}") {
//             metafield(namespace: "custom", key: "wishlist_items") {
//               values
//             }
//           }
//         }
//       `;
//       const response = await this.storefrontApiRequest(query);
//       const values = response.data?.customer?.metafield?.values || [];
//       return values.map(gid => gid.split('/').pop());
//     },

//     async updateWishlistMetafield(wishlist) {
//       const mutation = `
//         mutation($input: CustomerUpdateInput!) {
//           customerUpdate(input: $input) {
//             customer {
//               id
//             }
//             userErrors {
//               field
//               message
//             }
//           }
//         }
//       `;
//       const variables = {
//         input: {
//           metafields: [
//             {
//               namespace: "custom",
//               key: "wishlist_items",
//               value: JSON.stringify(wishlist.map(handle => `gid://shopify/Product/${handle}`)),
//               type: "list.product_reference"
//             }
//           ]
//         }
//       };
//       const response = await this.storefrontApiRequest(mutation, variables);
//       if (response.data?.customerUpdate?.userErrors?.length) {
//         console.error('Metafield update failed:', response.data.customerUpdate.userErrors);
//       }
//     },

//     async storefrontApiRequest(query, variables = {}) {
//       const response = await fetch(this.storefrontApiUrl, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'X-Shopify-Storefront-Access-Token': this.storefrontAccessToken
//         },
//         body: JSON.stringify({ query, variables })
//       });
//       return await response.json();
//     },

//     getCustomerAccessToken() {
//       return localStorage.getItem('authToken') || '';
//     }
//   };

//   document.addEventListener('DOMContentLoaded', () => Wishlist.init());
// })();