const loginForm = document.querySelector('#local-login-form');
const loginStatus = document.querySelector('.login-status');
const profileKey = 'minha-estante-profile-v1';

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!loginForm.reportValidity()) return;

  const name = loginForm.querySelector('#name').value.trim();
  const remember = loginForm.querySelector('#remember').checked;

  try {
    const target = remember ? localStorage : sessionStorage;
    const previous = JSON.parse(target.getItem(profileKey) || localStorage.getItem(profileKey) || '{}');
    target.setItem(profileKey, JSON.stringify({
      name,
      bio: typeof previous.bio === 'string' ? previous.bio : '',
      interests: Array.isArray(previous.interests) ? previous.interests : []
    }));
    if (remember) sessionStorage.removeItem(profileKey);
    location.href = '../Profile/index.html';
  } catch {
    loginStatus.textContent = 'Não foi possível salvar o perfil neste navegador. Tente ajustar as permissões de armazenamento.';
  }
});
