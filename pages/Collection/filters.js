const collectionGrid = document.querySelector('.collection-grid');
const originalCards = [...collectionGrid.querySelectorAll('.article')];
const filterButtons = [...document.querySelectorAll('.filters button')];
const collectionSearch = document.querySelector('.search-bar input[name="busca"]');
const categorySelect = document.querySelector('#filter-category');
const sortSelect = document.querySelector('#filter-sort');
const emptyCollection = document.createElement('p');
emptyCollection.className = 'collection-empty';
emptyCollection.textContent = 'Nenhuma obra encontrada. Experimente outro filtro ou explore novas obras.';
emptyCollection.hidden = true;
collectionGrid.after(emptyCollection);

originalCards.forEach((card) => {
  card.dataset.id = window.Estante.idFor(card.querySelector('h2').textContent);
});

function dynamicCard(item) {
  const card = document.createElement('article');
  card.className = 'article';
  card.dataset.id = item.id;
  card.dataset.kind = item.kind;
  card.dataset.dynamic = 'true';

  const image = document.createElement('img');
  image.src = item.image;
  image.alt = `${item.kind === 'book' ? 'Capa de' : 'Imagem de'} ${item.title}`;
  card.appendChild(image);

  const meta = document.createElement('div');
  meta.className = 'card-meta';
  const kind = document.createElement('span');
  kind.className = `kind kind-${item.kind}`;
  kind.textContent = item.kind === 'book' ? 'Livro' : 'Filme';
  meta.appendChild(kind);
  card.appendChild(meta);

  const title = document.createElement('h2');
  title.textContent = item.title;
  card.appendChild(title);
  const creator = document.createElement('p');
  creator.textContent = item.creator;
  card.appendChild(creator);

  const divider = document.createElement('div');
  divider.className = 'card-divider';
  card.appendChild(divider);
  const bottom = document.createElement('div');
  bottom.className = 'card-bottom';
  const status = document.createElement('span');
  status.className = 'status';
  bottom.appendChild(status);
  const options = document.createElement('button');
  options.className = 'more-menu';
  options.type = 'button';
  options.textContent = '•••';
  options.setAttribute('aria-label', `Mais opções para ${item.title}`);
  bottom.appendChild(options);
  card.appendChild(bottom);
  return card;
}

function applyFilters() {
  const active = filterButtons.find((button) => button.classList.contains('active'))?.dataset.filter || 'all';
  const query = collectionSearch.value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const category = categorySelect.value;
  const items = new Map(window.Estante.collection().map((item) => [item.id, item]));
  let visible = 0;
  collectionGrid.querySelectorAll('.article').forEach((card) => {
    const item = items.get(card.dataset.id);
    const text = `${item?.title || ''} ${item?.creator || ''}`.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const matches = item && text.includes(query) &&
      (active === 'all' || (active === 'wishlist' ? item.wished : item.kind === active)) &&
      (category === 'all' || (category === 'wishlist' ? item.wished :
        category === 'done' ? item.status === 'done' :
        category === 'drama' ? [...card.querySelectorAll('.kind-standard')].some((tag) => tag.textContent.trim().toLowerCase() === 'drama') :
        item.kind === category));
    card.hidden = !matches;
    if (matches) visible += 1;
  });
  const sort = sortSelect.value;
  const initialOrder = new Map([...items.keys()].map((id, index) => [id, index]));
  [...collectionGrid.querySelectorAll('.article')]
    .sort((a, b) => {
      if (sort === 'default') return (initialOrder.get(a.dataset.id) ?? 0) - (initialOrder.get(b.dataset.id) ?? 0);
      const first = items.get(a.dataset.id)?.title || '';
      const second = items.get(b.dataset.id)?.title || '';
      return sort === 'title-asc'
        ? first.localeCompare(second, 'pt-BR') : second.localeCompare(first, 'pt-BR');
    })
    .forEach((card) => collectionGrid.appendChild(card));
  emptyCollection.hidden = visible > 0;
}

function renderCollection() {
  collectionGrid.querySelectorAll('[data-dynamic="true"]').forEach((card) => card.remove());
  const items = window.Estante.collection();
  const baseIds = new Set(originalCards.map((card) => card.dataset.id));
  items.filter((item) => !baseIds.has(item.id)).forEach((item) => {
    collectionGrid.appendChild(dynamicCard(item));
  });
  collectionGrid.querySelectorAll('.article').forEach((card) => {
    const item = items.find((entry) => entry.id === card.dataset.id);
    if (!item) return;
    const status = card.querySelector('.status');
    status.classList.toggle('status-done', item.status === 'done');
    status.classList.toggle('status-wishlist', item.status !== 'done');
    status.textContent = item.status === 'done'
      ? (item.kind === 'book' ? 'Lido' : 'Assistido')
      : item.wished ? (item.kind === 'book' ? 'Quero ler' : 'Quero ver') : 'Não iniciado';
  });
  applyFilters();
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    applyFilters();
  });
});
collectionSearch.addEventListener('input', applyFilters);
categorySelect.addEventListener('change', applyFilters);
sortSelect.addEventListener('change', applyFilters);
document.querySelector('.collection-more button').addEventListener('click', () => {
  location.href = '../Discover/index.html';
});

const optionsDialog = document.createElement('dialog');
optionsDialog.className = 'action-dialog';
optionsDialog.innerHTML = `
  <div class="action-dialog-form">
    <h2 id="collection-dialog-title"></h2>
    <p class="action-dialog-hint">O que você quer fazer com esta obra?</p>
    <div class="collection-dialog-options">
      <button type="button" data-action="status"></button>
      <button type="button" data-action="wish"></button>
      <button type="button" data-action="remove">Remover da coleção</button>
    </div>
    <div class="action-dialog-actions"><button type="button" class="dialog-cancel">Fechar</button></div>
  </div>`;
optionsDialog.setAttribute('aria-labelledby', 'collection-dialog-title');
document.body.appendChild(optionsDialog);
let selectedId = null;

collectionGrid.addEventListener('click', (event) => {
  const button = event.target.closest('.more-menu');
  if (!button) return;
  const item = window.Estante.collection().find((entry) => entry.id === button.closest('.article').dataset.id);
  if (!item) return;
  selectedId = item.id;
  optionsDialog.querySelector('h2').textContent = item.title;
  optionsDialog.querySelector('[data-action="status"]').textContent = item.status === 'done'
    ? `Marcar como quero ${item.kind === 'book' ? 'ler' : 'ver'}`
    : `Marcar como ${item.kind === 'book' ? 'lido' : 'assistido'}`;
  optionsDialog.querySelector('[data-action="wish"]').textContent = item.wished
    ? 'Tirar dos desejos' : 'Adicionar aos desejos';
  optionsDialog.showModal();
});

optionsDialog.querySelector('.dialog-cancel').addEventListener('click', () => optionsDialog.close());
optionsDialog.querySelectorAll('[data-action]').forEach((button) => {
  button.addEventListener('click', () => {
    const item = window.Estante.collection().find((entry) => entry.id === selectedId);
    if (!item) return;
    if (button.dataset.action === 'wish') window.Estante.toggleWish(item);
    if (button.dataset.action === 'status') window.Estante.setStatus(item.id, item.status === 'done' ? 'wishlist' : 'done');
    if (button.dataset.action === 'remove') {
      if (!confirm(`Remover ${item.title} da coleção neste navegador?`)) return;
      window.Estante.removeItem(item.id);
    }
    optionsDialog.close();
  });
});

window.addEventListener('estante:change', renderCollection);
renderCollection();
