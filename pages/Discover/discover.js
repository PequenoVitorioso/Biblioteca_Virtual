// 1. Lógica original dos botões "Adicionar à Lista"
document.querySelectorAll('.add-button').forEach((button) => {
  button.addEventListener('click', () => {
    const added = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(added));
    button.firstChild.textContent = added ? 'Adicionado à Lista ' : 'Adicionar à Lista ';
    button.querySelector('span').textContent = added ? '✓' : '+';
  });
});

// 2. Lógica original do Progresso de Consumo (Leitura e Filmes)
document.querySelectorAll('[data-progress-card]').forEach((card) => {
  const button = card.querySelector('.progress-button');
  if (!button) return;

  button.addEventListener('click', () => {
    const total = Number(card.dataset.total);
    const current = Math.min(Number(card.dataset.current) + 1, total);
    const percentage = Math.round((current / total) * 100);
    const unit = card.dataset.unit;
    const label = unit === 'page' ? 'Meta de leitura' : 'Progresso do filme';

    card.dataset.current = String(current);
    card.querySelector('.progress-count').textContent = unit === 'page'
      ? `Pág. ${current} de ${total}`
      : `${current} min de ${total} min`;
    card.querySelector('.progress-label strong').textContent = `${percentage}%`;

    const progress = card.querySelector('progress');
    if (progress) {
      progress.value = percentage;
      progress.textContent = `${percentage}%`;
      progress.setAttribute('aria-label', `${label}: ${percentage}%`);
    }

    if (current === total) button.disabled = true;
  });
});

// 3. Novo Módulo Integrado: Busca, Filtros e Ordenação
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.querySelector('.search-bar input[name="busca"]');
  const categorySelect = document.querySelector('#filter-category');
  const sortSelect = document.querySelector('#filter-sort');
  const gridContainer = document.querySelector('.recommendation-grid');

  if (!gridContainer || !searchInput) return;

  const originalCards = Array.from(gridContainer.querySelectorAll('.recommendation-card'));

  const emptyMessage = document.createElement('p');
  emptyMessage.className = 'no-results-message';
  emptyMessage.textContent = 'Nenhum item encontrado para os filtros selecionados.';
  emptyMessage.style.display = 'none';
  emptyMessage.style.gridColumn = '1 / -1';
  emptyMessage.style.textAlign = 'center';
  emptyMessage.style.padding = '32px 0';
  emptyMessage.style.color = 'var(--color-muted)';
  gridContainer.appendChild(emptyMessage);

  function filterAndSortCards() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedCategory = categorySelect ? categorySelect.value.toLowerCase() : 'all';
    const sortOption = sortSelect ? sortSelect.value : 'default';

    let filteredCards = originalCards.filter((card) => {
      const title = card.querySelector('h2')?.textContent.toLowerCase() || '';
      const creator = card.querySelector('.creator')?.textContent.toLowerCase() || '';
      const tags = Array.from(card.querySelectorAll('.tags span')).map(t => t.textContent.toLowerCase());

      const matchesSearch = `${title} ${creator} ${tags.join(' ')}`.includes(searchTerm);
      const matchesCategory = selectedCategory === 'all' || tags.includes(selectedCategory);

      return matchesSearch && matchesCategory;
    });

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

  searchInput.addEventListener('input', filterAndSortCards);
  if (categorySelect) categorySelect.addEventListener('change', filterAndSortCards);
  if (sortSelect) sortSelect.addEventListener('change', filterAndSortCards);
});