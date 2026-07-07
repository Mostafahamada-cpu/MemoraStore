/* ================================================================
   MEMORA STORE — Main JavaScript
   Store functionality, animations, and interactivity
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initSearch();
  initFilters();
  initParticles();
  initMobileMenu();
});

/* ── Navbar Functionality ── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  window.addEventListener('scroll', () => {
    if (window.scrollY > 0) {
      navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
    } else {
      navbar.style.boxShadow = 'none';
    }
  });
}

/* ── Mobile Menu ── */
function initMobileMenu() {
  const navLinks = document.getElementById('nav-links');
  const links = navLinks ? navLinks.querySelectorAll('a') : [];

  links.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
    });
  });
}

/* ── Search Functionality ──*/
function initSearch() {
  const searchInput = document.getElementById('search-input');
  const templateCards = document.querySelectorAll('.template-card');

  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();

    templateCards.forEach(card => {
      const name = card.getAttribute('data-name') || '';
      const text = card.textContent.toLowerCase();

      if (name.includes(query) || text.includes(query)) {
        card.style.display = '';
        card.style.animation = 'fadeInUp 0.3s ease';
      } else {
        card.style.display = 'none';
      }
    });
  });
}

/* ── Filter Functionality ── */
function initFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const templateCards = document.querySelectorAll('.template-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      templateCards.forEach(card => {
        const category = card.getAttribute('data-category');

        if (filter === 'all' || category === filter) {
          card.style.display = '';
          card.style.animation = 'fadeInUp 0.3s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ── Particle Animation ── */
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const particleCount = 20;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    const size = Math.random() * 3 + 1;

    particle.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: rgba(201, 164, 106, 0.1);
      border-radius: 50%;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      opacity: ${Math.random() * 0.5 + 0.1};
      animation: float ${6 + Math.random() * 4}s ease-in-out infinite;
      animation-delay: ${Math.random() * 3}s;
      pointer-events: none;
    `;

    container.appendChild(particle);
  }
}

/* ── Animations ── */
const style = document.createElement('style');
style.textContent = `
  @keyframes float {
    0%, 100% { transform: translateY(0) translateX(0); }
    50% { transform: translateY(-30px) translateX(20px); }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);

console.log('✨ Memora Store initialized');
