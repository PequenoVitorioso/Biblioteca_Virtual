document.querySelectorAll('.add-button').forEach((button) => {
  button.addEventListener('click', () => {
    const added = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(added));
    button.firstChild.textContent = added ? 'Adicionado à Lista ' : 'Adicionar à Lista ';
    button.querySelector('span').textContent = added ? '✓' : '+';
  });
});

document.querySelectorAll('[data-progress-card]').forEach((card) => {
  const button = card.querySelector('.progress-button');

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
    progress.value = percentage;
    progress.textContent = `${percentage}%`;
    progress.setAttribute('aria-label', `${label}: ${percentage}%`);

    if (current === total) button.disabled = true;
  });
});
