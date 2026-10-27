const profileForm = document.querySelector('#profile-form');
const nameInput = document.querySelector('#display-name');
const bioInput = document.querySelector('#profile-bio');
const interestInputs = [...document.querySelectorAll('input[name="interests"]')];
const saveStatus = document.querySelector('.save-status');
const storageKey = 'minha-estante-profile-v1';

function initialsFrom(name) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 'PV';
  if (words.length === 1) return Array.from(words[0]).slice(0, 2).join('').toUpperCase();
  return (Array.from(words[0])[0] + Array.from(words.at(-1))[0]).toUpperCase();
}

function showProfile(name, bio) {
  document.querySelector('[data-display-name]').textContent = name || 'Seu perfil';
  document.querySelector('[data-display-bio]').textContent = bio ||
    'Um lugar para reunir as histórias que fazem parte da sua jornada.';

  const initials = initialsFrom(name);
  document.querySelector('.profile-avatar').textContent = initials;
  document.querySelector('.avatar-wrapper span').textContent = initials;
}

try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
  if (saved && typeof saved === 'object') {
    nameInput.value = typeof saved.name === 'string' ? saved.name.slice(0, 50) : '';
    bioInput.value = typeof saved.bio === 'string' ? saved.bio.slice(0, 160) : '';
    const interests = Array.isArray(saved.interests) ? saved.interests : [];
    interestInputs.forEach((input) => { input.checked = interests.includes(input.value); });
    showProfile(nameInput.value, bioInput.value);
  }
} catch {
  // O formulário continua utilizável quando o navegador bloqueia o armazenamento local.
}

profileForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const bio = bioInput.value.trim();
  const interests = interestInputs.filter((input) => input.checked).map((input) => input.value);

  showProfile(name, bio);

  try {
    localStorage.setItem(storageKey, JSON.stringify({ name, bio, interests }));
    saveStatus.textContent = 'Perfil salvo neste navegador.';
  } catch {
    saveStatus.textContent = 'Perfil atualizado nesta página, mas o navegador não permitiu salvar.';
  }
});
