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

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.querySelector('.search-bar input[name="busca"]');
  const categorySelect = document.querySelector('#filter-category');
  const sortSelect = document.querySelector('#filter-sort');
  const typeFilterButtons = document.querySelectorAll('.filters button[data-filter]');
  const gridContainer = document.querySelector('.collection-grid');

  if (!gridContainer || !searchInput) return;

  // Armazena a referência dos cartões (.article)
  const originalCards = Array.from(gridContainer.querySelectorAll('.article'));

  // Estado do filtro por botões (Todos, Livros, Filmes, Desejos)
  let activeTabFilter = 'all';

  // Mensagem para quando nenhum resultado for localizado
  const emptyMessage = document.createElement('p');
  emptyMessage.className = 'no-results-message';
  emptyMessage.textContent = 'Nenhum item encontrado na sua coleção.';
  emptyMessage.style.display = 'none';
  emptyMessage.style.gridColumn = '1 / -1';
  emptyMessage.style.textAlign = 'center';
  emptyMessage.style.padding = '40px 0';
  emptyMessage.style.color = 'var(--color-muted)';
  gridContainer.appendChild(emptyMessage);

  function filterAndSortCards() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedCategory = categorySelect ? categorySelect.value.toLowerCase() : 'all';
    const sortOption = sortSelect ? sortSelect.value : 'default';

    let filteredCards = originalCards.filter((card) => {
      // Captura dados do cartão na estrutura do HTML de Minha Coleção
      const title = card.querySelector('h2')?.textContent.toLowerCase() || '';
      const author = card.querySelector('p')?.textContent.toLowerCase() || '';
      const kind = card.querySelector('.kind')?.textContent.toLowerCase() || '';
      const status = card.querySelector('.status')?.textContent.toLowerCase() || '';

      // 1. Filtro de busca textual
      const matchesSearch = `${title} ${author} ${kind} ${status}`.includes(searchTerm);

      // 2. Filtro de categoria no <select> (Livro, Filme, etc.)
      const matchesCategory = selectedCategory === 'all' || 
                              kind.includes(selectedCategory) || 
                              status.includes(selectedCategory);

      // 3. Filtro dos botões rápidos (Todos, Livros, Filmes, Desejos)
      let matchesTab = true;
      if (activeTabFilter === 'book') {
        matchesTab = card.dataset.kind === 'book';
      } else if (activeTabFilter === 'film') {
        matchesTab = card.dataset.kind === 'film';
      } else if (activeTabFilter === 'wishlist') {
        matchesTab = card.dataset.wishlist === 'true' || status.includes('quero');
      }

      return matchesSearch && matchesCategory && matchesTab;
    });

    // 4. Ordenação A-Z / Z-A
    if (sortOption === 'title-asc') {
      filteredCards.sort((a, b) => {
        const titleA = a.querySelector('h2')?.textContent.toLowerCase() || '';
        const titleB = b.querySelector('h2')?.textContent.toLowerCase() || '';
        return titleA.localeCompare(titleB);
      });
    } else if (sortOption === 'title-desc') {
      filteredCards.sort((a, b) => {
        const titleA = a.querySelector('h2')?.textContent.toLowerCase() || '';
        const titleB = b.querySelector('h2')?.textContent.toLowerCase() || '';
        return titleB.localeCompare(titleA);
      });
    }

    // Oculta todos os cartões e reexibe apenas os filtrados
    originalCards.forEach(card => card.style.display = 'none');

    if (filteredCards.length === 0) {
      emptyMessage.style.display = 'block';
    } else {
      emptyMessage.style.display = 'none';
      filteredCards.forEach(card => {
        card.style.display = '';
        gridContainer.appendChild(card);
      });
    }
  }

  // Eventos para o campo de busca e seletores
  searchInput.addEventListener('input', filterAndSortCards);
  if (categorySelect) categorySelect.addEventListener('change', filterAndSortCards);
  if (sortSelect) sortSelect.addEventListener('change', filterAndSortCards);

  // Eventos para os botões de filtro rápido (Todos / Livros / Filmes / Desejos)
  typeFilterButtons.forEach(button => {
    button.addEventListener('click', () => {
      typeFilterButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');

      activeTabFilter = button.dataset.filter;
      filterAndSortCards();
    });
  });
});