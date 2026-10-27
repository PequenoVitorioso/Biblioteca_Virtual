const test = require('node:test');
const assert = require('node:assert/strict');

class MemoryStorage {
  data = new Map();
  getItem(key) { return this.data.has(key) ? this.data.get(key) : null; }
  setItem(key, value) { this.data.set(key, String(value)); }
  removeItem(key) { this.data.delete(key); }
}

function freshLibrary(storage = new MemoryStorage()) {
  global.localStorage = storage;
  const path = require.resolve('../js/library-state.js');
  delete require.cache[path];
  return require(path);
}

test('adicionar no Descobrir aparece na coleção e persiste após recarregar', () => {
  const storage = new MemoryStorage();
  const library = freshLibrary(storage);
  const item = {
    title: 'O Sol na Cabeça', creator: 'Geovani Martins', kind: 'book',
    image: '../../Images/Discover/o-sol-na-cabeca-geovani-martins.jpg'
  };

  library.toggleWish(item);
  assert.equal(library.collection().find((entry) => entry.id === 'o-sol-na-cabeca')?.wished, true);
  assert.equal(library.counts().total, 7);

  const reloaded = freshLibrary(storage);
  assert.equal(reloaded.collection().find((entry) => entry.id === 'o-sol-na-cabeca')?.title, item.title);
  reloaded.toggleWish(item);
  assert.equal(reloaded.collection().some((entry) => entry.id === 'o-sol-na-cabeca'), false);
});

test('opções da coleção atualizam status, desejos e remoção', () => {
  const library = freshLibrary();
  assert.deepEqual(library.counts(), { books: 3, films: 2, wishes: 1, total: 6 });

  library.setStatus('aquarius', 'done');
  assert.deepEqual(library.counts(), { books: 3, films: 3, wishes: 0, total: 6 });
  library.removeItem('aquarius');
  assert.equal(library.counts().total, 5);
  library.toggleWish({ title: 'Aquarius', creator: 'Kleber Mendonça Filho', kind: 'film', image: '' });
  assert.equal(library.counts().total, 6);
  assert.equal(library.counts().wishes, 1);
});

test('progresso salvo respeita os limites de páginas e minutos', () => {
  const storage = new MemoryStorage();
  const library = freshLibrary(storage);
  library.setProgress('reading', 310);
  library.setProgress('watching', 92);
  library.setProgress('reading', 321);

  const reloaded = freshLibrary(storage);
  assert.deepEqual(reloaded.read().progress, { reading: 310, watching: 92 });
});

test('restaurar dados recupera obras removidas e o progresso inicial', () => {
  const library = freshLibrary();
  library.removeItem('aquarius');
  library.setProgress('reading', 290);
  library.reset();
  assert.deepEqual(library.counts(), { books: 3, films: 2, wishes: 1, total: 6 });
  assert.deepEqual(library.read().progress, { reading: 164, watching: 55 });
});
