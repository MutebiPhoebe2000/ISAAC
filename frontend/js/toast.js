/**
 * ISAAC Summit — Toast Notification System
 * Modern, accessible, stackable toast notifications.
 * Replaces all alert() calls across the platform.
 */
(function () {
  'use strict';

  let container = null;

  /** Ensure the toast container exists in the DOM */
  function ensureContainer() {
    if (container) return container;
    container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'false');
    document.body.appendChild(container);
    return container;
  }

  /** Icon map for each toast type */
  const ICONS = {
    success: 'bi-check-circle-fill',
    error:   'bi-exclamation-triangle-fill',
    warning: 'bi-exclamation-circle-fill',
    info:    'bi-info-circle-fill'
  };

  /** Default titles */
  const TITLES = {
    success: 'Success',
    error:   'Error',
    warning: 'Attention',
    info:    'Notice'
  };

  /**
   * Show a toast notification.
   * @param {string} message  - The message body
   * @param {string} [type]   - 'success' | 'error' | 'warning' | 'info'
   * @param {Object} [opts]   - Optional config: { title, duration, persistent }
   */
  function show(message, type, opts) {
    type = type || 'info';
    opts = opts || {};
    var duration = opts.duration !== undefined ? opts.duration : 5000;
    var title = opts.title || TITLES[type] || 'Notice';
    var persistent = opts.persistent || false;

    ensureContainer();

    var el = document.createElement('div');
    el.className = 'toast-item toast-' + type;
    el.setAttribute('role', 'alert');

    el.innerHTML =
      '<i class="bi ' + ICONS[type] + ' toast-icon"></i>' +
      '<div class="toast-body">' +
        '<div class="toast-title">' + escapeHtml(title) + '</div>' +
        '<div class="toast-message">' + escapeHtml(message) + '</div>' +
      '</div>' +
      '<button class="toast-close" aria-label="Close notification">&times;</button>' +
      (persistent ? '' : '<div class="toast-progress" style="width:100%"></div>');

    container.appendChild(el);

    /* Close button */
    el.querySelector('.toast-close').addEventListener('click', function () {
      removeToast(el);
    });

    /* Auto-dismiss with progress animation */
    if (!persistent && duration > 0) {
      var progressBar = el.querySelector('.toast-progress');
      /* Force reflow before starting transition */
      void progressBar.offsetWidth;
      progressBar.style.transitionDuration = duration + 'ms';
      progressBar.style.width = '0%';

      var timer = setTimeout(function () {
        removeToast(el);
      }, duration);

      /* Pause on hover */
      el.addEventListener('mouseenter', function () {
        clearTimeout(timer);
        progressBar.style.transitionDuration = '0ms';
        var currentWidth = progressBar.getBoundingClientRect().width;
        var parentWidth = el.getBoundingClientRect().width;
        var percent = (currentWidth / parentWidth) * 100;
        progressBar.style.width = percent + '%';
      });

      el.addEventListener('mouseleave', function () {
        var currentWidth = parseFloat(progressBar.style.width);
        var remaining = (currentWidth / 100) * duration;
        progressBar.style.transitionDuration = remaining + 'ms';
        progressBar.style.width = '0%';
        timer = setTimeout(function () {
          removeToast(el);
        }, remaining);
      });
    }

    /* Limit visible toasts */
    var all = container.querySelectorAll('.toast-item:not(.removing)');
    if (all.length > 5) {
      removeToast(all[0]);
    }

    return el;
  }

  /** Animate and remove a toast */
  function removeToast(el) {
    if (!el || el.classList.contains('removing')) return;
    el.classList.add('removing');
    el.addEventListener('animationend', function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    });
    /* Fallback removal */
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 400);
  }

  /** Escape HTML to prevent XSS in toast content */
  function escapeHtml(str) {
    var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(str || '').replace(/[&<>"']/g, function (c) { return map[c]; });
  }

  /* Convenience methods */
  function success(msg, opts) { return show(msg, 'success', opts); }
  function error(msg, opts)   { return show(msg, 'error', opts); }
  function warning(msg, opts) { return show(msg, 'warning', opts); }
  function info(msg, opts)    { return show(msg, 'info', opts); }

  /* Expose globally */
  window.Toast = { show: show, success: success, error: error, warning: warning, info: info };
})();
