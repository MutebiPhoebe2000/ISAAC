/**
 * ISAAC Summit — Accommodation Assistance Contact
 * Single source of truth for the accommodation coordinator's contact
 * details, so the name/position/phone number only ever live in one place
 * even though the card is shown in more than one spot on the site.
 */
(function () {
  'use strict';

  var CONTACT = {
    name: 'Patience Makaji Mwangeka',
    position: 'Accommodation and Hospitality Coordinator',
    phoneDisplay: '+254 714 959811',
    /* E.164, digits only — required by tel: and wa.me links. */
    phoneDigits: '254714959811'
  };

  function cardHtml(variant) {
    var intro = variant === 'compact'
      ? '<p class="fw-bold text-navy mb-2">Need accommodation assistance?</p>'
      : '<h5 class="text-navy fw-bold mb-2"><i class="bi bi-house-heart me-2"></i>Accommodation Assistance</h5>'
        + '<p class="small text-muted mb-1">Need help with accommodation?</p>'
        + '<p class="small text-muted mb-3">For assistance with hotel selection, availability, booking, or other '
        + 'accommodation-related questions, please contact:</p>';

    return intro
      + '<p class="mb-0 fw-bold">' + CONTACT.name + '</p>'
      + '<p class="small text-muted mb-2">' + CONTACT.position + '</p>'
      + '<p class="small mb-3">WhatsApp / Call: <a class="fw-bold text-navy text-decoration-none" href="tel:+' + CONTACT.phoneDigits + '">' + CONTACT.phoneDisplay + '</a></p>'
      + '<div class="d-flex flex-wrap gap-2">'
      +   '<a class="btn btn-success btn-sm" href="https://wa.me/' + CONTACT.phoneDigits + '" target="_blank" rel="noopener"><i class="bi bi-whatsapp me-1"></i>WhatsApp</a>'
      +   '<a class="btn btn-outline-primary btn-sm" href="tel:+' + CONTACT.phoneDigits + '"><i class="bi bi-telephone me-1"></i>Call</a>'
      + '</div>';
  }

  function renderInto(containerId, variant) {
    var el = document.getElementById(containerId);
    if (el) el.innerHTML = cardHtml(variant);
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-accommodation-contact]').forEach(function (el) {
      renderInto(el.id, el.dataset.accommodationContact);
    });
  });

  /* Exposed in case a page needs to render this outside the auto-init pass. */
  window.AccommodationContact = { data: CONTACT, renderInto: renderInto };
})();
