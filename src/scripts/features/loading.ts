export function initializeLoading() {
  const root = document.documentElement;

  window.addEventListener('DOMContentLoaded', () => {
    root.classList.add('domloaded');
  });

  window.addEventListener('load', () => {
    root.classList.add('loaded');
  });
}
