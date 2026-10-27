const recommendationGrid = document.querySelector('.recommendation-grid');
const recommendationCards = [...recommendationGrid.querySelectorAll('.recommendation-card')];
const discoverSearch = document.querySelector('.search-bar input[name="busca"]');
const categorySelect = document.querySelector('#filter-category');
const sortSelect = document.querySelector('#filter-sort');

function recommendationItem(card) {
  const tags = [...card.querySelectorAll('.tags span')].map((tag) => tag.textContent.trim());
  return {
    title: card.querySelector('h2').textContent.trim(),
    creator: card.querySelector('.creator').textContent.trim(),
    kind: tags.some((tag) => tag.toLowerCase() === 'filme') ? 'film' : 'book',
    image: card.querySelector('img').getAttribute('src')
  };
}

function renderAddButtons() {
  const wishes = window.Estante.read().wishes;
  recommendationCards.forEach((card) => {
    const button = card.querySelector('.add-button');
    const added = wishes.includes(window.Estante.idFor(recommendationItem(card).title));
    button.setAttribute('aria-pressed', String(added));
    button.firstChild.textContent = added ? 'Adicionado à Lista ' : 'Adicionar à Lista ';
    button.querySelector('span').textContent = added ? '✓' : '+';
  });
}

recommendationCards.forEach((card) => {
  card.querySelector('.add-button').addEventListener('click', () => {
    window.Estante.toggleWish(recommendationItem(card));
  });
});
window.addEventListener('estante:change', renderAddButtons);
renderAddButtons();

const emptyMessage = document.createElement('p');
emptyMessage.className = 'no-results-message';
emptyMessage.textContent = 'Nenhuma obra encontrada. Tente outra busca ou categoria.';
emptyMessage.hidden = true;
recommendationGrid.appendChild(emptyMessage);

function normalize(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function filterAndSortCards() {
  const search = normalize(discoverSearch.value.trim());
  const category = normalize(categorySelect.value);
  const sort = sortSelect.value;
  const filtered = recommendationCards.filter((card) => {
    const item = recommendationItem(card);
    const tags = [...card.querySelectorAll('.tags span')].map((tag) => normalize(tag.textContent));
    return normalize(`${item.title} ${item.creator} ${tags.join(' ')}`).includes(search) &&
      (category === 'all' || tags.includes(category));
  });

  if (sort !== 'default') {
    filtered.sort((a, b) => {
      const first = recommendationItem(a).title;
      const second = recommendationItem(b).title;
      return sort === 'title-asc' ? first.localeCompare(second, 'pt-BR') : second.localeCompare(first, 'pt-BR');
    });
  }

  recommendationCards.forEach((card) => { card.hidden = true; });
  filtered.forEach((card) => {
    card.hidden = false;
    recommendationGrid.appendChild(card);
  });
  emptyMessage.hidden = filtered.length > 0;
}

const initialQuery = new URLSearchParams(location.search).get('q');
if (initialQuery) discoverSearch.value = initialQuery;
discoverSearch.addEventListener('input', filterAndSortCards);
categorySelect.addEventListener('change', filterAndSortCards);
sortSelect.addEventListener('change', filterAndSortCards);
filterAndSortCards();
