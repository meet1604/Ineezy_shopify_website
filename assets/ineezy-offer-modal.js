document.addEventListener('DOMContentLoaded', () => {

  const modalElement = document.getElementById('ineezyOfferModal');

  if (!modalElement) return;

  const lastClosed = localStorage.getItem('ineezy_offer_closed');

  const now = new Date().getTime();

  const oneDay = 24 * 60 * 60 * 1000;

  if (!lastClosed || now - lastClosed > oneDay) {

    setTimeout(() => {

      const modal = new bootstrap.Modal(modalElement);

      modal.show();

    }, 2500);

  }

  modalElement.addEventListener('hidden.bs.modal', () => {

    localStorage.setItem('ineezy_offer_closed', now);

  });

});



// document.addEventListener('DOMContentLoaded', () => {

//   const modalElement = document.getElementById('ineezyOfferModal');

//   if (!modalElement) return;

//   setTimeout(() => {

//     const modal = new bootstrap.Modal(modalElement);

//     modal.show();

//   }, 2500);

// });