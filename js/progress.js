(function () {
  const cards = [...document.querySelectorAll('[data-progress-card]')];
  if (!cards.length) return;

  const dialog = document.createElement('dialog');
  dialog.className = 'action-dialog';
  dialog.innerHTML = `
    <form class="action-dialog-form">
      <h2 id="progress-dialog-title">Atualizar progresso</h2>
      <label for="progress-value">Valor atual</label>
      <input id="progress-value" type="number" min="0" step="1" required>
      <p class="action-dialog-hint"></p>
      <div class="action-dialog-actions">
        <button type="button" class="dialog-cancel">Cancelar</button>
        <button type="submit" class="dialog-confirm">Salvar progresso</button>
      </div>
    </form>`;
  dialog.setAttribute('aria-labelledby', 'progress-dialog-title');
  document.body.appendChild(dialog);

  const form = dialog.querySelector('form');
  const input = dialog.querySelector('input');
  let activeCard = null;

  function render(card) {
    const kind = card.dataset.progressKey;
    const total = Number(card.dataset.total);
    const current = Math.max(0, Math.min(total, Number(window.Estante.read().progress[kind])));
    const percentage = Math.round(current / total * 100);
    const unit = kind === 'reading' ? 'Pág.' : 'min';
    const count = card.querySelector('.progress-count');
    if (count) count.textContent = kind === 'reading'
      ? `${unit} ${current} de ${total}` : `${current} min de ${total} min`;
    const label = card.querySelector('.progress-label strong');
    if (label) label.textContent = `${percentage}%`;
    const progress = card.querySelector('progress');
    if (progress) {
      progress.value = percentage;
      progress.textContent = `${percentage}%`;
      progress.setAttribute('aria-label', `${kind === 'reading' ? 'Meta de leitura' : 'Progresso do filme'}: ${percentage}%`);
    }
  }

  cards.forEach((card) => {
    render(card);
    card.querySelector('.progress-button')?.addEventListener('click', () => {
      activeCard = card;
      const kind = card.dataset.progressKey;
      const total = Number(card.dataset.total);
      dialog.querySelector('h2').textContent = `Atualizar ${card.querySelector('h3')?.textContent || 'progresso'}`;
      dialog.querySelector('label').textContent = kind === 'reading' ? 'Página atual' : 'Minuto atual';
      dialog.querySelector('.action-dialog-hint').textContent = `Digite um número entre 0 e ${total}.`;
      input.max = String(total);
      input.value = String(window.Estante.read().progress[kind]);
      dialog.showModal();
      input.focus();
      input.select();
    });
  });

  dialog.querySelector('.dialog-cancel').addEventListener('click', () => dialog.close());
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!activeCard || !form.reportValidity()) return;
    window.Estante.setProgress(activeCard.dataset.progressKey, input.valueAsNumber);
    dialog.close();
  });
  window.addEventListener('estante:change', () => cards.forEach(render));
})();
