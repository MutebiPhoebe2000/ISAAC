/**
 * ISAAC Summit — Landing Page Logic
 * Handles: countdown timer, scroll animations, animated counters,
 * smooth scroll, contact form validation, navbar scroll effect.
 */
(function () {
  'use strict';

  /* ===== COUNTDOWN TIMER ===== */
  var targetDate = new Date('2026-09-15T08:00:00+03:00').getTime();

  function updateCountdown() {
    var now = Date.now();
    var diff = targetDate - now;

    if (diff <= 0) {
      setCount('daysBox', '00');
      setCount('hoursBox', '00');
      setCount('minsBox', '00');
      setCount('secsBox', '00');
      return;
    }

    var days  = Math.floor(diff / 86400000);
    var hours = Math.floor((diff % 86400000) / 3600000);
    var mins  = Math.floor((diff % 3600000) / 60000);
    var secs  = Math.floor((diff % 60000) / 1000);

    setCount('daysBox',  pad(days));
    setCount('hoursBox', pad(hours));
    setCount('minsBox',  pad(mins));
    setCount('secsBox',  pad(secs));
  }

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function setCount(id, value) {
    var el = document.getElementById(id);
    if (!el) return;
    if (el.textContent !== value) {
      el.textContent = value;
      /* Tick animation */
      el.classList.add('ticking');
      setTimeout(function () { el.classList.remove('ticking'); }, 300);
    }
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();

  /* ===== SCROLL ANIMATIONS (IntersectionObserver) ===== */
  function initScrollAnimations() {
    var animElements = document.querySelectorAll('[data-animate], [data-animate-stagger]');
    if (!animElements.length) return;

    if (!('IntersectionObserver' in window)) {
      /* Fallback: show everything immediately */
      animElements.forEach(function (el) { el.classList.add('animated'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    animElements.forEach(function (el) { observer.observe(el); });
  }

  /* ===== ANIMATED STAT COUNTERS ===== */
  function initCounters() {
    var counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    if (!('IntersectionObserver' in window)) {
      counters.forEach(function (el) { el.textContent = el.getAttribute('data-count'); });
      return;
    }

    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { counterObserver.observe(el); });
  }

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var duration = 1500;
    var start = 0;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      /* Ease out cubic */
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(start + (target - start) * eased);
      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
        el.classList.add('counter-animate');
      }
    }

    requestAnimationFrame(step);
  }

  /* ===== NAVBAR SCROLL EFFECT ===== */
  function initNavScroll() {
    var nav = document.getElementById('mainNav');
    if (!nav) return;

    function checkScroll() {
      if (window.scrollY > 60) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();
  }

  /* ===== SMOOTH SCROLL ===== */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#') return;
        var target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          var offset = 80;
          var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: top, behavior: 'smooth' });

          /* Close mobile nav */
          var navCollapse = document.getElementById('mainSummitNav');
          if (navCollapse && navCollapse.classList.contains('show')) {
            var bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
            if (bsCollapse) bsCollapse.hide();
          }
        }
      });
    });
  }

  /* ===== BUTTON RIPPLE EFFECT ===== */
  function initRipple() {
    document.querySelectorAll('.btn-ripple').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        var rect = btn.getBoundingClientRect();
        var ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        var size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        btn.appendChild(ripple);
        ripple.addEventListener('animationend', function () { ripple.remove(); });
      });
    });
  }

  /* ===== CONTACT FORM (JS-only validation) ===== */
  function initContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var t = window.Translate ? window.Translate.t : function (k) { return k; };

      var name    = (document.getElementById('contactName').value || '').trim();
      var email   = (document.getElementById('contactEmail').value || '').trim();
      var subject = (document.getElementById('contactSubject').value || '').trim();
      var message = (document.getElementById('contactMessage').value || '').trim();

      /* Clear previous validation styles */
      form.querySelectorAll('.form-control').forEach(function (el) {
        el.classList.remove('is-invalid', 'is-valid');
      });

      var errors = [];
      if (!name)    { markInvalid('contactName'); errors.push('name'); }
      else          { markValid('contactName'); }
      if (!email || !isEmail(email)) { markInvalid('contactEmail'); errors.push('email'); }
      else          { markValid('contactEmail'); }
      if (!subject) { markInvalid('contactSubject'); errors.push('subject'); }
      else          { markValid('contactSubject'); }
      if (!message) { markInvalid('contactMessage'); errors.push('message'); }
      else          { markValid('contactMessage'); }

      if (errors.length > 0) {
        Toast.warning(t('val_required'));
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      var ogText = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>' + t('loading');
      }

      window.ISAACApi.request('/api/contact', {
        method: 'POST',
        body: { name: name, email: email, subject: subject, message: message }
      })
        .then(function () {
          Toast.success(t('contact_success'));
          form.reset();
          form.querySelectorAll('.form-control').forEach(function (el) {
            el.classList.remove('is-valid');
          });
        })
        .catch(function (err) {
          Toast.error(err.message || 'Failed to send message');
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = ogText;
          }
        });
    });
  }

  function markInvalid(id) { document.getElementById(id).classList.add('is-invalid'); }
  function markValid(id)   { document.getElementById(id).classList.add('is-valid'); }
  function isEmail(str) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str); }

  /* ===== INITIALIZE ===== */
  function init() {
    initScrollAnimations();
    initCounters();
    initNavScroll();
    initSmoothScroll();
    initRipple();
    initContactForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
