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

  // ----- CONFIRM MODAL -----
  window.showConfirm = function (message, cb) {
    var existing = document.querySelector('.confirm-modal');
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.className = 'confirm-modal';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);padding:1rem;';

    var box = document.createElement('div');
    box.style.cssText = 'background:var(--card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:1.5rem;max-width:360px;width:100%;text-align:center;';

    var msg = document.createElement('p');
    msg.style.cssText = 'color:var(--text);font-size:0.95rem;margin-bottom:1.25rem;';
    msg.textContent = message;

    var actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:0.75rem;justify-content:center;';

    var btnYa = document.createElement('button');
    btnYa.textContent = 'Ya';
    btnYa.style.cssText = 'background:var(--accent);color:#fff;border:none;padding:0.5rem 1.5rem;border-radius:9999px;font-size:0.85rem;font-weight:600;cursor:pointer;';

    var btnBatal = document.createElement('button');
    btnBatal.textContent = 'Batal';
    btnBatal.style.cssText = 'background:var(--surface-glass);color:var(--text-secondary);border:none;padding:0.5rem 1.5rem;border-radius:9999px;font-size:0.85rem;cursor:pointer;';

    actions.appendChild(btnYa);
    actions.appendChild(btnBatal);
    box.appendChild(msg);
    box.appendChild(actions);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    btnYa.addEventListener('click', function () {
      overlay.remove();
      if (cb) cb(true);
    });
    btnBatal.addEventListener('click', function () {
      overlay.remove();
      if (cb) cb(false);
    });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) { overlay.remove(); if (cb) cb(false); }
    });
  };

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

  // ----- AUTH SYSTEM -----
  window.getCurrentUser = function () {
    var raw = localStorage.getItem('smartland_user');
    return raw ? JSON.parse(raw) : null;
  };
  window.isLoggedIn = function () {
    return !!localStorage.getItem('smartland_user');
  };
  window.logout = function () {
    localStorage.removeItem('smartland_user');
    window.location.href = 'index.html';
  };

  function injectAuthUI() {
    var user = window.getCurrentUser();
    var navLinks = document.querySelector('.navbar-links');
    var navOverlay = document.querySelector('.nav-overlay');

    if (user) {
      var btnUser = document.createElement('span');
      btnUser.className = 'navbar-link navbar-user';
      btnUser.textContent = user.nama || user.username;
      btnUser.style.cssText = 'cursor:default;opacity:0.7;font-size:0.8rem;';

      var btnLogout = document.createElement('a');
      btnLogout.href = '#';
      btnLogout.className = 'navbar-link';
      btnLogout.textContent = 'Keluar';
      btnLogout.addEventListener('click', function (e) {
        e.preventDefault();
        window.logout();
      });

      if (navLinks) {
        navLinks.insertBefore(btnLogout, navLinks.lastElementChild);
        navLinks.insertBefore(btnUser, navLinks.lastElementChild);
      }

      var overlayUser = document.createElement('span');
      overlayUser.className = 'nav-overlay-link';
      overlayUser.textContent = user.nama || user.username;
      overlayUser.style.cssText = 'cursor:default;opacity:0.5;font-size:0.8rem;';

      var overlayLogout = document.createElement('a');
      overlayLogout.href = '#';
      overlayLogout.className = 'nav-overlay-link';
      overlayLogout.textContent = 'Keluar';
      overlayLogout.style.color = 'var(--accent)';
      overlayLogout.addEventListener('click', function (e) {
        e.preventDefault();
        window.logout();
      });

      if (navOverlay) {
        navOverlay.insertBefore(overlayLogout, navOverlay.lastElementChild);
        navOverlay.insertBefore(overlayUser, navOverlay.lastElementChild);
      }
    } else {
      var btnLogin = document.createElement('a');
      btnLogin.href = 'login.html';
      btnLogin.className = 'navbar-link';
      btnLogin.textContent = 'Masuk';

      if (navLinks) {
        navLinks.insertBefore(btnLogin, navLinks.lastElementChild);
      }

      var overlayLogin = document.createElement('a');
      overlayLogin.href = 'login.html';
      overlayLogin.className = 'nav-overlay-link';
      overlayLogin.textContent = 'Masuk';
      overlayLogin.style.color = 'var(--primary)';

      if (navOverlay) {
        navOverlay.insertBefore(overlayLogin, navOverlay.lastElementChild);
      }
    }
  }

  // Skip auth UI on pages that manage their own auth (admin pages, login, daftar)
  var currentPage = location.pathname.split('/').pop();
  var adminPages = ['login.html', 'daftar.html'];
  if (!location.pathname.includes('/admin/') && adminPages.indexOf(currentPage) === -1) {
    injectAuthUI();
  }
})();
