(function (root) {
  const storageKey = 'minha-estante-library-v1';
  const baseItems = [
    { title: 'Torto Arado', creator: 'Itamar Vieira Junior', kind: 'book', image: '../../Images/Capa_livros/torto arado.jpg', rating: 5, status: 'done' },
    { title: 'Cidade de Deus', creator: 'Fernando Meirelles', kind: 'film', image: '../../Images/Capa_livros/cidade de deus.jpeg', rating: 5, status: 'done' },
    { title: 'Memórias Póstumas', creator: 'Machado de Assis', kind: 'book', image: '../../Images/Capa_livros/memorias postumas.jpeg', rating: 4, status: 'done' },
    { title: 'Bacurau', creator: 'Kleber Mendonça Filho', kind: 'film', image: '../../Images/Capa_livros/bacurau.jpeg', rating: 5, status: 'done' },
    { title: 'Quarto de Despejo', creator: 'Carolina Maria de Jesus', kind: 'book', image: '../../Images/Capa_livros/quarto de despejo.jpeg', rating: 5, status: 'done' },
    { title: 'Aquarius', creator: 'Kleber Mendonça Filho', kind: 'film', image: '../../Images/Capa_livros/aquarius.jpeg', rating: 4, status: 'wishlist' }
  ];

  function idFor(title) {
    return String(title).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  const catalog = baseItems.map((item) => ({ ...item, id: idFor(item.title) }));
  const baseIds = new Set(catalog.map((item) => item.id));
  const initial = () => ({ saved: [], wishes: ['aquarius'], removed: [], statuses: {}, progress: { reading: 164, watching: 55 } });

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (saved && typeof saved === 'object') {
        return {
          saved: Array.isArray(saved.saved) ? saved.saved : [],
          wishes: Array.isArray(saved.wishes) ? saved.wishes : [],
          removed: Array.isArray(saved.removed) ? saved.removed : [],
          statuses: saved.statuses && typeof saved.statuses === 'object' ? saved.statuses : {},
          progress: {
            reading: Number.isFinite(Number(saved.progress?.reading)) ? Number(saved.progress.reading) : 164,
            watching: Number.isFinite(Number(saved.progress?.watching)) ? Number(saved.progress.watching) : 55
          }
        };
      }
    } catch {
      // A página continua utilizável se o navegador bloquear o armazenamento.
    }
    return initial();
  }

  let current = load();
  const read = () => JSON.parse(JSON.stringify(current));

  function update(change) {
    const next = read();
    change(next);
    current = next;
    try { localStorage.setItem(storageKey, JSON.stringify(current)); } catch { /* Estado disponível até recarregar. */ }
    if (typeof root.dispatchEvent === 'function' && typeof CustomEvent !== 'undefined') {
      root.dispatchEvent(new CustomEvent('estante:change', { detail: read() }));
    }
    return read();
  }

  function collection(state = current) {
    const all = [...catalog, ...state.saved.filter((item) => !baseIds.has(item.id))];
    return all.filter((item) => !state.removed.includes(item.id)).map((item) => ({
      ...item,
      status: state.statuses[item.id] || item.status || 'wishlist',
      wished: state.wishes.includes(item.id)
    }));
  }

  function toggleWish(item) {
    const id = idFor(item.title);
    return update((state) => {
      const wished = state.wishes.includes(id);
      state.wishes = state.wishes.filter((value) => value !== id);
      if (wished) {
        if (!baseIds.has(id) && state.statuses[id] !== 'done') {
          state.saved = state.saved.filter((value) => value.id !== id);
          delete state.statuses[id];
        }
      } else {
        state.wishes.push(id);
        state.removed = state.removed.filter((value) => value !== id);
        if (!baseIds.has(id) && !state.saved.some((value) => value.id === id)) {
          state.saved.push({
            id,
            title: String(item.title).slice(0, 120),
            creator: String(item.creator).slice(0, 120),
            kind: item.kind === 'film' ? 'film' : 'book',
            image: /^\.\.\/\.\.\/Images\/Discover\/[\w.-]+$/.test(item.image) ? item.image : '',
            rating: 0,
            status: 'wishlist'
          });
        }
      }
    });
  }

  function setStatus(id, status) {
    if (!['done', 'wishlist'].includes(status)) return read();
    return update((state) => {
      state.statuses[id] = status;
      state.wishes = state.wishes.filter((value) => value !== id);
      if (status === 'wishlist') state.wishes.push(id);
    });
  }

  function removeItem(id) {
    return update((state) => {
      if (baseIds.has(id)) state.removed.push(id);
      else state.saved = state.saved.filter((item) => item.id !== id);
      state.wishes = state.wishes.filter((value) => value !== id);
      delete state.statuses[id];
    });
  }

  function setProgress(kind, value) {
    const total = kind === 'reading' ? 320 : kind === 'watching' ? 93 : 0;
    if (!total || !Number.isInteger(value) || value < 0 || value > total) return read();
    return update((state) => { state.progress[kind] = value; });
  }

  function reset() {
    current = initial();
    try { localStorage.removeItem(storageKey); } catch { /* Restauração válida nesta página. */ }
    if (typeof root.dispatchEvent === 'function' && typeof CustomEvent !== 'undefined') {
      root.dispatchEvent(new CustomEvent('estante:change', { detail: read() }));
    }
    return read();
  }

  function counts() {
    const items = collection();
    return {
      books: items.filter((item) => item.kind === 'book' && item.status === 'done').length,
      films: items.filter((item) => item.kind === 'film' && item.status === 'done').length,
      wishes: items.filter((item) => item.wished).length,
      total: items.length
    };
  }

  const api = { idFor, read, collection, counts, toggleWish, setStatus, removeItem, setProgress, reset };
  root.Estante = api;
  if (typeof root.addEventListener === 'function') {
    root.addEventListener('storage', (event) => {
      if (event.key !== storageKey) return;
      current = load();
      root.dispatchEvent(new CustomEvent('estante:change', { detail: read() }));
    });
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
