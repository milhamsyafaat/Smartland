(function () {
  'use strict';

  // ----- HAMBURGER MORPH + OVERLAY MENU -----
  var toggle = document.getElementById('menu-toggle');
  var overlay = document.getElementById('nav-overlay');

  if (toggle && overlay) {
    toggle.addEventListener('click', function () {
      var isOpen = toggle.classList.toggle('open');
      overlay.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        toggle.classList.remove('open');
        overlay.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  // ----- INTERSECTION OBSERVER — SCROLL REVEAL -----
  var revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length > 0 && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: reveal all immediately
    revealElements.forEach(function (el) {
      el.classList.add('revealed');
    });
  }

  // ----- TOAST NOTIFICATION -----
  window.showToast = function (message, type) {
    type = type || 'success';
    var container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    var icons = { success: '&#10003;', error: '&#10007;', info: '&#8505;' };
    var el = document.createElement('div');
    el.className = 'toast toast-' + type;
    el.innerHTML =
      '<span class="toast-icon">' + (icons[type] || '') + '</span>' +
      '<span class="toast-message">' + message + '</span>' +
      '<button class="toast-close">&times;</button>';
    el.querySelector('.toast-close').addEventListener('click', function () {
      dismissToast(el);
    });
    container.appendChild(el);
    setTimeout(function () { dismissToast(el); }, 3500);
  };
  window.dismissToast = function (el) {
    if (!el || el.classList.contains('toast-out')) return;
    el.classList.add('toast-out');
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 300);
  };

  // ----- ACTIVE NAV LINK DETECTION -----
  var links = document.querySelectorAll('.navbar-link[data-page], .nav-overlay-link[data-page]');
  var page = location.pathname.split('/').pop() || 'index.html';
  links.forEach(function (l) {
    if (l.getAttribute('href') === page) {
      l.classList.add('active');
    }
  });
})();
