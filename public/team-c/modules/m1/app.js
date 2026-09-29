// MediSphere shared UI behavior.
// API integration lives in script.js so each page has one integration entry point.

(() => {
  const appSidebar = document.getElementById('appSidebar');
  const appOverlay = document.getElementById('appOverlay');
  const appHamburger = document.getElementById('appHamburger');

  appHamburger?.addEventListener('click', () => {
    appSidebar?.classList.toggle('open');
    appOverlay?.classList.toggle('show');
  });

  appOverlay?.addEventListener('click', () => {
    appSidebar?.classList.remove('open');
    appOverlay?.classList.remove('show');
  });

  const bellBtn = document.getElementById('appBellBtn');
  const bellDropdown = document.getElementById('appBellDropdown');
  const profileBtn = document.getElementById('appProfileBtn');
  const profileDropdown = document.getElementById('appProfileDropdown');

  bellBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    bellDropdown?.classList.toggle('show');
    profileDropdown?.classList.remove('show');
  });

  profileBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    profileDropdown?.classList.toggle('show');
    bellDropdown?.classList.remove('show');
  });

  document.addEventListener('click', (e) => {
    if (bellDropdown && !bellDropdown.contains(e.target) && e.target !== bellBtn && !bellBtn?.contains(e.target)) {
      bellDropdown.classList.remove('show');
    }
    if (profileDropdown && !profileDropdown.contains(e.target) && e.target !== profileBtn && !profileBtn?.contains(e.target)) {
      profileDropdown.classList.remove('show');
    }
  });

  document.querySelectorAll('[data-search-input]').forEach(input => {
    const targetSelector = input.getAttribute('data-search-input');
    input.addEventListener('input', function () {
      const term = this.value.toLowerCase().trim();
      document.querySelectorAll(targetSelector).forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none';
      });
    });
  });

  document.querySelectorAll('.upload-file-input').forEach(input => {
    input.addEventListener('change', function () {
      const label = document.querySelector(this.getAttribute('data-label-target'));
      if (label) label.textContent = this.files.length ? this.files[0].name : 'No file chosen';
    });
  });
})();

function renderDonut(canvasId, data, colors) {
  const el = document.getElementById(canvasId);
  if (!el || typeof Chart === 'undefined') return;

  const existing = Chart.getChart(el);
  existing?.destroy();

  new Chart(el, {
    type: 'doughnut',
    data: { datasets: [{ data, backgroundColor: colors, borderWidth: 0, cutout: '72%' }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: true } }
    }
  });
}

window.renderDonut = renderDonut;
