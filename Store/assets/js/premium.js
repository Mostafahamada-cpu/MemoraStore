/* ================================================================
   MEMORA — Premium Marketplace JavaScript
   Modular, Well-Organized, Production-Ready
   ================================================================ */

// ── Store Module ── //
const Store = (() => {
  const WHATSAPP_NUMBER = '201099885633';

  const state = {
    selectedCategory: 'all',
    searchQuery: '',
    selectedProduct: null,
    cart: JSON.parse(localStorage.getItem('memora-cart')) || [],
    favorites: JSON.parse(localStorage.getItem('memora-favorites')) || [],
  };

  const products = {
    standard: [
      {
        id: 'modern-minimal',
        name: 'Modern Minimal',
        category: 'standard',
        price: 500,
        image: 'images/demo_modern_minimal.png',
        demo: 'https://modern-minimal-delta.vercel.app/',
        features: ['Minimalist Design', 'Responsive Layout', 'Music Support', 'RSVP System'],
        description: 'Clean design with powerful animations and responsive experience',
        bestseller: true,
        new: false,
      },
    ],
    premium: [
      {
        id: 'luxury-bloom',
        name: 'Luxury Bloom',
        category: 'premium',
        price: 800,
        image: 'images/demo_luxury_bloom.png',
        demo: 'https://luxury-bloom-demo.vercel.app/',
        features: ['Gold Accents', 'Advanced Animations', 'Full Customization', 'Premium Support'],
        description: 'Elegance meets luxury with animated gold accents and premium features',
        bestseller: false,
        new: false,
      },
      {
        id: 'authentic',
        name: 'Authentic',
        category: 'premium',
        price: 800,
        image: 'images/demo_royal_gold.png',
        demo: 'https://authentic-demo-chi.vercel.app/',
        features: ['Timeless Layout', 'Photo Gallery', 'Couple Story', 'RSVP System'],
        description: 'Elegant authentic wedding invitation with timeless design and refined details.',
        bestseller: false,
        new: true,
      },
    ],
  };

  const bundles = [
    {
      id: 'memora-essential',
      name: 'Memora Essential',
      price: 950,
      image: 'images/demo_modern_minimal.png',
      demo: 'https://modern-minimal-delta.vercel.app/',
      includes: ['Modern Minimal', 'Love Card'],
      description: 'Modern Minimal invitation plus the bundled Love Card experience.',
      featured: true,
    },
    {
      id: 'memora-signature',
      name: 'Memora Signature',
      price: 1250,
      image: 'images/demo_luxury_bloom.png',
      demo: 'https://luxury-bloom-demo.vercel.app/',
      includes: ['Luxury Bloom', 'Love Card'],
      description: 'Luxury Bloom invitation plus the bundled Love Card experience.',
      featured: true,
    },
  ];

  const getAll = () => Object.values(products).flat();
  
  const getByCategory = (category) => {
    if (category === 'all') return getAll();
    if (category === 'standard') return products.standard;
    if (category === 'premium') return products.premium;
    return [];
  };

  const search = (query) => {
    const q = query.toLowerCase();
    return getAll().filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.features.some(f => f.toLowerCase().includes(q))
    );
  };

  const setState = (updates) => {
    Object.assign(state, updates);
    localStorage.setItem('memora-cart', JSON.stringify(state.cart));
    localStorage.setItem('memora-favorites', JSON.stringify(state.favorites));
  };

  const addToCart = (productId) => {
    if (!state.cart.includes(productId)) {
      state.cart.push(productId);
      setState({ cart: state.cart });
      UI.showNotification('Added to cart!', 'success');
    }
  };

  const buyNow = (name) => {
    const message = `Hi! I'm interested in purchasing:\n${name}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  const removeFromCart = (productId) => {
    state.cart = state.cart.filter(id => id !== productId);
    setState({ cart: state.cart });
  };

  const toggleFavorite = (productId) => {
    if (state.favorites.includes(productId)) {
      state.favorites = state.favorites.filter(id => id !== productId);
    } else {
      state.favorites.push(productId);
    }
    setState({ favorites: state.favorites });
  };

  const getProduct = (id) => getAll().find(p => p.id === id);

  return {
    state,
    products,
    bundles,
    WHATSAPP_NUMBER,
    getAll,
    getByCategory,
    search,
    setState,
    addToCart,
    buyNow,
    removeFromCart,
    toggleFavorite,
    getProduct,
  };
})();

// ── UI Module ── //
const UI = (() => {
  let notificationTimeout;

  const showNotification = (message, type = 'info') => {
    clearTimeout(notificationTimeout);
    
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('visible'), 0);
    
    notificationTimeout = setTimeout(() => {
      notification.classList.remove('visible');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  const renderProducts = (products, container) => {
    if (!container) return;
    
    container.innerHTML = '';
    
    if (products.length === 0) {
      container.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">No products found</p>';
      return;
    }

    products.forEach((product, index) => {
      const card = document.createElement('div');
      card.className = 'card animate-on-scroll';
      card.style.animationDelay = `${index * 50}ms`;
      
      card.innerHTML = `
        <div class="card-image">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
          ${product.bestseller ? '<span class="card-badge bestseller">Bestseller</span>' : ''}
          ${product.new ? '<span class="card-badge new">New</span>' : ''}
          ${product.category === 'premium' ? '<span class="card-badge premium">Premium</span>' : ''}
        </div>
        <div class="card-content">
          <h3 class="card-title">${product.name}</h3>
          <p class="card-description">${product.description}</p>
          <div class="card-meta">
            <div>
              <div class="card-price">EGP ${product.price}</div>
              <div class="card-price-label">one-time</div>
            </div>
          </div>
          <div class="card-actions">
            <a href="${product.demo}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Live Demo</a>
            <button class="btn btn-primary btn-sm" onclick="Store.buyNow('${product.name.replace(/'/g, "\\'")}')">Buy Now</button>
          </div>
        </div>
      `;
      
      container.appendChild(card);
    });

    // Trigger scroll animations for new cards
    initScrollAnimations();
  };

  const addToCart = (productId) => {
    const product = Store.getProduct(productId);
    Store.addToCart(productId);
  };

  return {
    showNotification,
    renderProducts,
    addToCart,
  };
})();

// ── Navigation Module ── //
const Nav = (() => {
  const init = () => {
    const toggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');

    if (!toggle || !navLinks) return;

    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      toggle.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        toggle.classList.remove('active');
      });
    });

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY;
      
      if (currentScroll > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      
      lastScroll = currentScroll;
    });
  };

  return { init };
})();

// ── Animations Module ── //
const Animations = (() => {
  const initScrollAnimations = () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });
  };

  const initParticles = () => {
    const container = document.getElementById('hero-particles');
    if (!container) return;

    const particleCount = window.innerWidth > 768 ? 40 : 20;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'hero-particle';
      
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 8 + 's';
      particle.style.animationDuration = (6 + Math.random() * 6) + 's';
      particle.style.width = (2 + Math.random() * 3) + 'px';
      particle.style.height = particle.style.width;
      
      container.appendChild(particle);
    }
  };

  const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  };

  return {
    initScrollAnimations,
    initParticles,
    initSmoothScroll,
  };
})();

// ── Search & Filter Module ── //
const SearchFilter = (() => {
  const init = () => {
    const searchInput = document.getElementById('search-input');
    const filterButtons = document.querySelectorAll('[data-filter]');
    const productsContainer = document.getElementById('products-grid');

    if (!searchInput && !filterButtons.length) return;

    const updateDisplay = () => {
      let products = Store.getByCategory(Store.state.selectedCategory);
      
      if (Store.state.searchQuery) {
        products = Store.search(Store.state.searchQuery);
      }

      UI.renderProducts(products, productsContainer);
    };

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        Store.setState({ searchQuery: e.target.value });
        updateDisplay();
      });
    }

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        Store.setState({ selectedCategory: btn.getAttribute('data-filter') });
        updateDisplay();
      });
    });

    // Initial render
    updateDisplay();
  };

  return { init };
})();

// ── Form Module ── //
const Form = (() => {
  const init = () => {
    const form = document.getElementById('order-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      // Validation
      if (!data.fullName || !data.email || !data.phone) {
        UI.showNotification('Please fill in all required fields', 'error');
        return;
      }

      // Store form data
      localStorage.setItem('memora-order', JSON.stringify(data));
      
      // Show success
      UI.showNotification('Order saved! Redirecting to checkout...', 'success');
      
      setTimeout(() => {
        window.location.href = 'checkout.html';
      }, 1500);
    });

    // Dynamic field visibility based on product selection
    const productSelect = form.querySelector('select[name="product"]');
    if (productSelect) {
      productSelect.addEventListener('change', (e) => {
        updateProductFields(e.target.value);
      });
    }
  };

  const updateProductFields = (productType) => {
    const bundleFields = document.getElementById('bundle-fields');
    const standardFields = document.getElementById('standard-fields');
    const premiumFields = document.getElementById('premium-fields');
    const loveCardFields = document.getElementById('lovecard-fields');

    // Hide all first
    if (bundleFields) bundleFields.classList.add('hidden');
    if (standardFields) standardFields.classList.add('hidden');
    if (premiumFields) premiumFields.classList.add('hidden');
    if (loveCardFields) loveCardFields.classList.add('hidden');

    // Show relevant fields
    if (productType === 'bundle' && bundleFields) bundleFields.classList.remove('hidden');
    else if (productType === 'standard' && standardFields) standardFields.classList.remove('hidden');
    else if (productType === 'premium' && premiumFields) premiumFields.classList.remove('hidden');
    else if (productType === 'lovecard' && loveCardFields) loveCardFields.classList.remove('hidden');
  };

  return { init, updateProductFields };
})();

// ── SmoothScroll Helper ── //
function initScrollAnimations() {
  Animations.initScrollAnimations();
}

// ── Initialize ── //
document.addEventListener('DOMContentLoaded', () => {
  Nav.init();
  Animations.initParticles();
  Animations.initScrollAnimations();
  Animations.initSmoothScroll();
  SearchFilter.init();
  Form.init();
});
