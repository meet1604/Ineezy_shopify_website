(function () {
  function initSelectors() {
    if (!Shopify || !Shopify.CountryProvinceSelector) return;

    // New address form
    new Shopify.CountryProvinceSelector('AddressCountryNew', 'AddressProvinceNew', {
      hideElement: 'AddressProvinceContainerNew'
    });

    // Edit address forms
    document.querySelectorAll('[data-address-country-select]').forEach(function (select) {
      var id = select.dataset.formId;
      if (!id) return;
      new Shopify.CountryProvinceSelector(
        'AddressCountry_' + id,
        'AddressProvince_' + id,
        { hideElement: 'AddressProvinceContainer_' + id }
      );
    });
  }

  // Delete address
  function bindDeleteButtons() {
    document.querySelectorAll('.btn-address-delete[data-confirm-message]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (confirm(this.dataset.confirmMessage)) {
          Shopify.postLink(this.dataset.target, { parameters: { _method: 'delete' } });
        }
      });
    });
  }

  window.addEventListener('load', function () {
    initSelectors();
    bindDeleteButtons();
  });
}());
