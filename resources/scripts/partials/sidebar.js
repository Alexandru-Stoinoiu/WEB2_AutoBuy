export function loadSidebar() {
  fetch('/categories/partials/sidebar.html')
    .then(res => res.text())
    .then(html => {
      document.body.insertAdjacentHTML('afterbegin', html);
      const sidebar = document.querySelector('.sidebar');
      const main = document.querySelector('main');
      if (main) main.classList.add('main-with-sidebar');
      highlightActiveLink();

      const toggleBtn = document.getElementById('sidebar-toggle');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
          sidebar.classList.toggle('sidebar-collapsed');
          if (main) main.classList.toggle('main-with-sidebar');
        });
      }
    });
}

function highlightActiveLink() {
  const path = window.location.pathname;
  document.querySelectorAll('.sidebar nav a').forEach(link => {
    if (link.getAttribute('href') === path) {
      link.classList.add('active');
    }
  });
}