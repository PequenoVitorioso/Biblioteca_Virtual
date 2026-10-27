const filterButtons = document.querySelectorAll('.filters button');
const cards = document.querySelectorAll('.collection-grid .article');

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });

    cards.forEach((card) => {
      card.hidden = filter !== 'all' &&
        (filter === 'wishlist' ? card.dataset.wishlist !== 'true' : card.dataset.kind !== filter);
    });
  });
});
