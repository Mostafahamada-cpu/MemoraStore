/* ================================================================
   DEMO TOOLBAR — JavaScript Controller
   ================================================================ */

class DemoToolbar {
  constructor(themeName) {
    this.themeName = themeName;
    this.currentView = 'desktop';
    this.init();
  }

  init() {
    this.createToolbar();
    this.attachEvents();
  }

  createToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'demo-toolbar';
    toolbar.innerHTML = `
      <div class="demo-toolbar-left">
        <a href="../../index.html" class="demo-logo">
          <span class="demo-logo-icon">💍</span>
          <span>Memora</span>
        </a>
        <div class="demo-theme-name">${this.formatThemeName(this.themeName)}</div>
      </div>

      <div class="demo-toolbar-center">
        <button class="demo-view-btn active" data-view="desktop" title="Desktop view">
          🖥️
        </button>
        <button class="demo-view-btn" data-view="tablet" title="Tablet view">
          📱
        </button>
        <button class="demo-view-btn" data-view="mobile" title="Mobile view">
          📲
        </button>
      </div>

      <div class="demo-toolbar-right">
        <button class="demo-btn" id="buy-now-btn">
          <span>💳</span> Buy Now
        </button>
        <a href="../../index.html" class="demo-btn">
          ← Back
        </a>
      </div>
    `;

    document.body.insertBefore(toolbar, document.body.firstChild);
    document.body.classList.add('has-demo-toolbar');
  }

  attachEvents() {
    document.querySelectorAll('.demo-view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setView(e.target.closest('button').getAttribute('data-view'));
      });
    });

    document.getElementById('buy-now-btn').addEventListener('click', () => {
      alert('Thank you for your interest! Purchase functionality coming soon.');
    });
  }

  formatThemeName(name) {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  setView(view) {
    this.currentView = view;

    // Update button states
    document.querySelectorAll('.demo-view-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`.demo-view-btn[data-view="${view}"]`).classList.add('active');

    // Apply viewport constraints
    const body = document.body;
    body.style.maxWidth = this.getViewportWidth(view);
    body.style.margin = '0 auto';

    const views = {
      desktop: { width: '100%', transition: 'max-width 0.3s ease' },
      tablet: { width: '768px', transition: 'max-width 0.3s ease' },
      mobile: { width: '375px', transition: 'max-width 0.3s ease' }
    };

    Object.assign(body.style, views[view]);
  }

  getViewportWidth(view) {
    const widths = {
      desktop: '100%',
      tablet: '768px',
      mobile: '375px'
    };
    return widths[view];
  }
}

// Initialize toolbar when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const themeName = document.body.getAttribute('data-theme') || 'template';
    new DemoToolbar(themeName);
  });
} else {
  const themeName = document.body.getAttribute('data-theme') || 'template';
  new DemoToolbar(themeName);
}
