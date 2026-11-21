(() => {
  const key = 'deskline-theme';
  let choice;
  try { choice = localStorage.getItem(key); } catch {}
  function apply() {
    const dark = choice !== 'light';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.getElementById('themeSwitch')?.setAttribute('aria-pressed', String(dark));
  }
  apply();
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) { choice = event.newValue; apply(); }
  });
  document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('themeSwitch');
    apply();
    button.addEventListener('click', () => {
      choice = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(key, choice); } catch {}
      apply();
    });
  });
})();