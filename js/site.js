(function () {
  const statSelectors = {
    books: '.stat-books',
    films: '.stat-films, .stat-movies',
    wishes: '.stat-wishes, .stat-wishlist',
    total: '.stat-total'
  };

  function updateStats() {
    const values = window.Estante.counts();
    Object.entries(statSelectors).forEach(([key, selector]) => {
      document.querySelectorAll(selector).forEach((card) => {
        const number = card.querySelector('strong, h2');
        if (number) number.textContent = String(values[key]);
      });
    });
  }

  function updateAvatar() {
    try {
      const key = 'minha-estante-profile-v1';
      const profile = JSON.parse(sessionStorage.getItem(key) || localStorage.getItem(key) || 'null');
      if (!profile?.name) return;
      const words = profile.name.trim().split(/\s+/).filter(Boolean);
      const initials = words.length === 1
        ? Array.from(words[0]).slice(0, 2).join('')
        : Array.from(words[0])[0] + Array.from(words.at(-1))[0];
      document.querySelectorAll('.avatar-wrapper span').forEach((avatar) => {
        avatar.textContent = initials.toUpperCase();
      });
    } catch { /* O avatar padrão continua visível. */ }
  }

  function updateActivity() {
    const progress = window.Estante.read().progress;
    document.querySelectorAll('.activity-card[data-progress-key]').forEach((card) => {
      const kind = card.dataset.progressKey;
      const total = Number(card.dataset.total);
      const current = Math.max(0, Math.min(total, Number(progress[kind])));
      const percentage = Math.round(current / total * 100);
      card.querySelector('.activity-top strong').textContent = `${percentage}%`;
      card.querySelector('.activity-count').textContent = kind === 'reading'
        ? `Página ${current} de ${total}` : `${current} de ${total} minutos`;
      card.querySelector('.activity-track span').style.width = `${percentage}%`;
    });
  }

  const search = document.querySelector('.search-bar input[name="busca"]');
  if (search && !document.querySelector('.collection-grid, .recommendation-grid')) {
    search.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      const query = search.value.trim();
      if (query) location.href = `../Discover/index.html?q=${encodeURIComponent(query)}`;
    });
  }

  const placeholderLinks = [...document.querySelectorAll('a[href="#"]')];
  if (placeholderLinks.length) {
    const dialog = document.createElement('dialog');
    dialog.className = 'action-dialog';
    dialog.innerHTML = `
      <div class="action-dialog-form">
        <h2 id="site-notice-title">Em breve</h2>
        <p class="action-dialog-hint"></p>
        <div class="action-dialog-actions"><button type="button" class="dialog-cancel">Entendi</button></div>
      </div>`;
    dialog.setAttribute('aria-labelledby', 'site-notice-title');
    document.body.appendChild(dialog);
    dialog.querySelector('button').addEventListener('click', () => dialog.close());
    placeholderLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        dialog.querySelector('p').textContent = `${link.getAttribute('aria-label') || link.textContent.trim()} ainda não está disponível nesta versão.`;
        dialog.showModal();
      });
    });
  }

  updateStats();
  updateAvatar();
  updateActivity();
  window.addEventListener('estante:change', () => {
    updateStats();
    updateActivity();
  });
})();
