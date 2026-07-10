/**
 * ISAAC Summit — Registration & Login Logic
 * Handles the multi-screen wizard, validation, country/language selection,
 * and form submissions for auth.html.
 */
(function () {
  'use strict';

  var currentScreen = 0;
  var totalScreens = 9; /* 0 to 9 */
  var draftKey = 'isaac_reg_draft';
  var uploadedFiles = {}; // Store base64 files

  /* Elements */
  var wizardForm;
  var screens = [];
  var btnNext, btnPrev, btnSubmit;
  var progressBar, stepCurrent, stepTotal;
  var categorySelected = null;

  function init() {
    initTabs();
    initLoginForm();
    initWizard();
    initCountryDropdown();
    initLanguageSelection();
    initCategorySelection();
    initGenderSelection();
    initIdSelection();
    initThemeSelection();
    initSupportToggles();
    initPasswordToggles();
    initFileUploads();
    // loadDraft(); // Disabled to ensure fresh forms
  }

  /* ===== TABS ===== */
  function initTabs() {
    var tabLogin = document.getElementById('tabLogin');
    var tabRegister = document.getElementById('tabRegister');
    var panelLogin = document.getElementById('panelLogin');
    var panelRegister = document.getElementById('panelRegister');

    if (!tabLogin || !tabRegister) return;

    function switchTab(tab) {
      if (tab === 'login') {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        panelLogin.classList.remove('d-none');
        panelRegister.classList.add('d-none');
      } else {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        panelRegister.classList.remove('d-none');
        panelLogin.classList.add('d-none');
      }
    }

    tabLogin.addEventListener('click', function () { switchTab('login'); });
    tabRegister.addEventListener('click', function () { switchTab('register'); });

    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('tab') === 'register') {
      switchTab('register');
    }
  }

  /* ===== LOGIN ===== */
  function initLoginForm() {
    var form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = val('loginEmail');
      var password = val('loginPassword');
      var valid = true;

      clearErrors(form);

      if (!email || email.indexOf('@') === -1) {
        showError('loginEmailError', Translate.t('val_email'));
        valid = false;
      }
      if (!password) {
        showError('loginPasswordError', Translate.t('val_required'));
        valid = false;
      }

      if (!valid) return;

      var btn = document.getElementById('loginSubmitBtn');
      var ogText = btn.innerHTML;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>' + Translate.t('loading');
      btn.disabled = true;

      ISAACApi.request('/api/auth/login', { method: 'POST', body: { email: email, password: password } })
        .then(function (res) {
          ISAACApi.setSession({ token: res.token, user: res.user });
          if (res.user.role === 'admin') {
            window.location.href = '/admin/dashboard.html';
          } else {
            window.location.href = "/participant/dashboard.html";
          }
        })
        .catch(function (err) {
          Toast.error(err.message || 'Login failed');
          btn.innerHTML = ogText;
          btn.disabled = false;
        });
    });
  }

  /* ===== WIZARD NAVIGATION ===== */
  function initWizard() {
    screens = document.querySelectorAll('.wizard-step');
    if (!screens.length) return;

    btnNext = document.getElementById('btnNext');
    btnPrev = document.getElementById('btnPrev');
    btnSubmit = document.getElementById('btnSubmit');
    progressBar = document.getElementById('regProgressBar');
    stepCurrent = document.getElementById('regStepCurrent');
    stepTotal = document.getElementById('regStepTotal');
    
    var btnWelcomeStart = document.getElementById('btnWelcomeStart');
    if (btnWelcomeStart) {
      btnWelcomeStart.addEventListener('click', function () { goToScreen(1); });
    }

    var btnCountryNext = document.getElementById('btnCountryNext');
    if (btnCountryNext) {
      btnCountryNext.addEventListener('click', function () { 
        if (validateScreen(1)) goToScreen(2); 
      });
    }

    var btnLangContinue = document.getElementById('btnLangContinue');
    if (btnLangContinue) {
      btnLangContinue.addEventListener('click', function () { goToScreen(3); });
    }

    if (btnNext) btnNext.addEventListener('click', function () {
      if (validateScreen(currentScreen)) {
        var nextScr = currentScreen + 1;
        /* Skip Org step if individual/student */
        if (nextScr === 7 && (categorySelected === 'individual' || categorySelected === 'student')) {
          nextScr = 8;
        }
        goToScreen(nextScr);
      }
    });

    if (btnPrev) btnPrev.addEventListener('click', function () {
      var prevScr = currentScreen - 1;
      /* Skip Org step if individual/student */
      if (prevScr === 7 && (categorySelected === 'individual' || categorySelected === 'student')) {
        prevScr = 6;
      }
      goToScreen(prevScr);
    });

    if (btnSubmit) btnSubmit.addEventListener('click', submitRegistration);

    /* Age calculation */
    var dobInput = document.getElementById('regDob');
    if (dobInput) {
      dobInput.addEventListener('change', function () {
        var dob = new Date(this.value);
        if (isNaN(dob.getTime())) return;
        var diff = Date.now() - dob.getTime();
        var ageDate = new Date(diff);
        var age = Math.abs(ageDate.getUTCFullYear() - 1970);
        document.getElementById('regAge').value = age;
      });
    }
  }

  function goToScreen(index) {
    if (index < 0 || index >= screens.length) return;
    
    screens.forEach(function (s) { s.classList.remove('active'); });
    screens[index].classList.add('active');
    currentScreen = index;

    var navBar = document.getElementById('wizardNav');
    var progressWrap = document.getElementById('regProgressWrap');

    /* Screens 0,1,2 don't have standard nav or progress bar */
    if (index < 3 || index === screens.length - 1) {
      if (navBar) navBar.style.setProperty('display', 'none', 'important');
      if (progressWrap) progressWrap.classList.add('d-none');
    } else {
      if (navBar) navBar.style.setProperty('display', 'flex', 'important');
      if (progressWrap) progressWrap.classList.remove('d-none');
      
      /* Calculate steps (screen 3 is step 1, screen 9 is step 7) */
      var step = index - 2;
      var total = 7;
      if (stepCurrent) stepCurrent.textContent = step;
      if (progressBar) progressBar.style.width = ((step / total) * 100) + '%';
      
      /* Toggle next vs submit */
      if (index === 9) { /* Review step */
        btnNext.classList.add('d-none');
        btnSubmit.classList.remove('d-none');
      } else {
        btnNext.classList.remove('d-none');
        btnSubmit.classList.add('d-none');
      }
    }

    if (index > 2 && index < screens.length - 1) {
      saveDraft();
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ===== SELECTION CONTROLS ===== */
  var selectedCountryData = null;

  function initCountryDropdown() {
    var select = document.getElementById('countrySelect');
    var display = document.getElementById('selectedCountryDisplay');
    
    if (!select || !AfricanCountries) return;

    /* Populate select options */
    AfricanCountries.list.forEach(function (c) {
      var opt = document.createElement('option');
      opt.value = c.code;
      opt.textContent = c.flag + ' ' + c.name;
      select.appendChild(opt);
    });

    select.addEventListener('change', function () {
      var code = select.value;
      var c = AfricanCountries.findByCode(code);
      if (!c) return;

      selectedCountryData = c;
      display.classList.remove('d-none');
      display.classList.add('d-flex');
      document.getElementById('selectedCountryFlag').textContent = c.flag;
      document.getElementById('selectedCountryName').textContent = c.name;
      document.getElementById('selectedCountryCode').textContent = c.code;
      
      /* Pre-fill other fields */
      var nat = document.getElementById('regNationality');
      if (nat) nat.value = c.name;
      var codeEl = document.getElementById('regPhoneCode');
      if (codeEl) codeEl.value = c.phone;
      var cF = document.getElementById('regCountryField');
      if (cF) cF.value = c.name;

      /* Update language suggestions */
      updateLanguageSuggestions(c.code);
      hideError('countryError');
    });
  }

  function updateLanguageSuggestions(countryCode) {
    var container = document.getElementById('suggestedLangs');
    var label = document.getElementById('suggestedLangsLabel');
    if (!container || !AfricanCountries) return;

    var langs = AfricanCountries.getLanguages(countryCode);
    container.innerHTML = '';
    label.classList.remove('d-none');

    langs.forEach(function (l) {
      var btn = document.createElement('button');
      btn.className = 'btn btn-outline-secondary rounded-pill btn-sm px-3';
      if (l.code === Translate.getLanguage()) {
        btn.classList.replace('btn-outline-secondary', 'btn-summit-primary');
      }
      btn.textContent = l.name;
      btn.addEventListener('click', function () {
        Translate.setLanguage(l.code);
        /* Update buttons visual state */
        Array.from(container.children).forEach(function (b) {
          b.classList.replace('btn-summit-primary', 'btn-outline-secondary');
        });
        btn.classList.replace('btn-outline-secondary', 'btn-summit-primary');
      });
      container.appendChild(btn);
    });
  }

  function initLanguageSelection() {
    /* Handle global setLanguage via Translate if needed */
  }

  function initCategorySelection() {
    var cards = document.querySelectorAll('#categoryGrid .interactive-card');
    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        cards.forEach(function (c) { c.classList.remove('active'); });
        card.classList.add('active');
        categorySelected = card.getAttribute('data-category');
        hideError('categoryError');
        
        /* Toggle conditional sections in step 6 */
        var isSpeaker = categorySelected === 'speaker';
        var isSponsor = categorySelected === 'sponsor';
        var isMedia = categorySelected === 'media';
        
        var spkSec = document.getElementById('speakerSection');
        var spnSec = document.getElementById('sponsorSection');
        var medSec = document.getElementById('mediaSection');
        
        if (spkSec) spkSec.classList.toggle('d-none', !isSpeaker);
        if (spnSec) spnSec.classList.toggle('d-none', !isSponsor);
        if (medSec) medSec.classList.toggle('d-none', !isMedia);
      });
    });
  }

  var genderSelected = null;
  function initGenderSelection() {
    var btns = document.querySelectorAll('[data-gender]');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        genderSelected = btn.getAttribute('data-gender');
        hideError('genderError');
      });
    });
  }

  var idTypeSelected = 'national_id';
  function initIdSelection() {
    var btnYes = document.getElementById('idTypeYes');
    var btnNo = document.getElementById('idTypeNo');
    var natSec = document.getElementById('nationalIdSection');
    var passSec = document.getElementById('passportSection');

    if (!btnYes) return;

    btnYes.addEventListener('click', function () {
      btnYes.classList.add('active');
      btnNo.classList.remove('active');
      idTypeSelected = 'national_id';
      natSec.classList.remove('d-none');
      passSec.classList.add('d-none');
    });

    btnNo.addEventListener('click', function () {
      btnNo.classList.add('active');
      btnYes.classList.remove('active');
      idTypeSelected = 'passport';
      passSec.classList.remove('d-none');
      natSec.classList.add('d-none');
    });
  }

  var themesSelected = [];
  function initThemeSelection() {
    var chips = document.querySelectorAll('.chip-item');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chip.classList.toggle('active');
        var theme = chip.getAttribute('data-theme');
        if (chip.classList.contains('active')) {
          if (themesSelected.indexOf(theme) === -1) themesSelected.push(theme);
        } else {
          themesSelected = themesSelected.filter(function (t) { return t !== theme; });
        }
        hideError('themeError');
      });
    });
  }

  var supportToggles = { pastConference: null, needInvitation: null, needVisa: null };
  function initSupportToggles() {
    var btns = document.querySelectorAll('[data-toggle-field]');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var field = btn.getAttribute('data-toggle-field');
        var val = btn.getAttribute('data-value');
        
        var siblings = btn.parentElement.querySelectorAll('[data-toggle-field="'+field+'"]');
        siblings.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        
        supportToggles[field] = val;
      });
    });
  }

  function initPasswordToggles() {
    var btns = document.querySelectorAll('.toggle-pw');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var targetId = btn.getAttribute('data-target');
        var input = document.getElementById(targetId);
        var icon = btn.querySelector('i');
        if (input.type === 'password') {
          input.type = 'text';
          icon.className = 'bi bi-eye-slash';
        } else {
          input.type = 'password';
          icon.className = 'bi bi-eye';
        }
      });
    });
  }

  /* ===== FILE UPLOADS ===== */
  function initFileUploads() {
    var uploadConfigs = [
      { zoneId: 'idUploadZone', inputId: 'idFileInput', nameId: 'idFileName', key: 'nationalIdFile' },
      { zoneId: 'passportUploadZone', inputId: 'passportFileInput', nameId: 'passportFileName', key: 'passportFile' },
      { zoneId: 'speakerCvZone', inputId: 'speakerCvInput', nameId: 'speakerCvName', key: 'speakerCv' },
      { zoneId: 'speakerPhotoZone', inputId: 'speakerPhotoInput', nameId: 'speakerPhotoName', key: 'speakerPhoto' },
      { zoneId: 'sponsorProposalZone', inputId: 'sponsorProposalInput', nameId: 'sponsorProposalName', key: 'sponsorProposal' },
      { zoneId: 'mediaCredsZone', inputId: 'mediaCredsInput', nameId: 'mediaCredsName', key: 'mediaCreds' }
    ];

    uploadConfigs.forEach(function (cfg) {
      var zone = document.getElementById(cfg.zoneId);
      var input = document.getElementById(cfg.inputId);
      var nameDisplay = document.getElementById(cfg.nameId);
      if (!zone || !input || !nameDisplay) return;

      zone.addEventListener('click', function () {
        input.click();
      });

      input.addEventListener('change', function () {
        var file = input.files[0];
        if (!file) return;

        nameDisplay.textContent = 'File: ' + file.name;
        nameDisplay.classList.remove('d-none');
        nameDisplay.classList.add('text-success', 'fw-bold');
        zone.style.borderColor = 'var(--success)';
        zone.style.backgroundColor = 'rgba(25, 135, 84, 0.1)'; // Light green bg

        var icon = zone.querySelector('i');
        if (icon) {
          icon.className = 'bi bi-check-circle-fill text-success';
        }
        var text = zone.querySelector('p');
        if (text) {
          text.textContent = 'Uploaded Successfully';
          text.classList.remove('text-muted');
          text.classList.add('text-success', 'fw-bold');
        }

        var reader = new FileReader();
        reader.onload = function (e) {
          uploadedFiles[cfg.key] = e.target.result;
        };
        reader.readAsDataURL(file);
      });
    });
  }

  /* ===== VALIDATION ===== */
  function validateScreen(index) {
    var valid = true;
    var t = Translate.t;

    if (index === 1) { /* Country */
      if (!selectedCountryData) {
        showError('countryError', t('val_country'));
        valid = false;
      }
    }
    else if (index === 3) { /* Category */
      if (!categorySelected) {
        showError('categoryError', t('val_select_category'));
        valid = false;
      }
    }
    else if (index === 4) { /* Details */
      var fn = val('regFullName');
      var dob = val('regDob');
      if (!fn) { showError('fullNameError', t('val_required')); markInvalid('regFullName'); valid = false; }
      else { markValid('regFullName'); }
      
      if (!dob) { showError('dobError', t('val_required')); markInvalid('regDob'); valid = false; }
      else { markValid('regDob'); }
      
      if (!genderSelected) { showError('genderError', t('val_select_gender')); valid = false; }
    }
    else if (index === 5) { /* Contact */
      var em = val('regEmail');
      var ph = val('regPhone');
      var add = val('regAddress');
      var city = val('regCity');
      var pw = val('regPassword');
      var pwc = val('regPasswordConfirm');

      if (!em || em.indexOf('@') === -1) { showError('regEmailError', t('val_email')); markInvalid('regEmail'); valid = false; }
      else { markValid('regEmail'); }
      
      if (!ph) { showError('phoneError', t('val_required')); markInvalid('regPhone'); valid = false; }
      else { markValid('regPhone'); }
      
      if (!add) { showError('addressError', t('val_required')); markInvalid('regAddress'); valid = false; }
      else { markValid('regAddress'); }
      
      if (!city) { showError('cityError', t('val_required')); markInvalid('regCity'); valid = false; }
      else { markValid('regCity'); }

      if (!pw || pw.length < 6) { showError('regPasswordError', t('val_password_length')); markInvalid('regPassword'); valid = false; }
      else { markValid('regPassword'); }

      if (pw !== pwc) { showError('regPasswordConfirmError', t('val_password_match')); markInvalid('regPasswordConfirm'); valid = false; }
      else { markValid('regPasswordConfirm'); }
    }
    else if (index === 6) { /* ID */
      if (idTypeSelected === 'national_id') {
        if (!val('regNIN')) { showError('ninError', t('val_required')); markInvalid('regNIN'); valid = false; }
        else { markValid('regNIN'); }
      } else {
        if (!val('regPassportNo')) { showError('passportNoError', t('val_required')); markInvalid('regPassportNo'); valid = false; }
        else { markValid('regPassportNo'); }
        if (!val('regPassportExpiry')) { showError('passportExpiryError', t('val_required')); markInvalid('regPassportExpiry'); valid = false; }
        else { markValid('regPassportExpiry'); }
      }
    }
    else if (index === 7) { /* Org */
      var orgN = val('regOrgName');
      var orgP = val('regOrgPosition');
      var orgY = val('regOrgYears');
      
      if (!orgN) { showError('orgNameError', t('val_required')); markInvalid('regOrgName'); valid = false; }
      else { markValid('regOrgName'); }
      
      if (!orgP) { showError('orgPositionError', t('val_required')); markInvalid('regOrgPosition'); valid = false; }
      else { markValid('regOrgPosition'); }
      
      if (!orgY) { showError('orgYearsError', t('val_required')); markInvalid('regOrgYears'); valid = false; }
      else { markValid('regOrgYears'); }
    }
    else if (index === 8) { /* Participation */
      if (!val('regMotivation')) { showError('motivationError', t('val_motivation')); markInvalid('regMotivation'); valid = false; }
      else { markValid('regMotivation'); }
      
      if (themesSelected.length === 0) { showError('themeError', t('val_select_theme')); valid = false; }
      
      /* Skip validating conditional fields for now unless specifically requested */
    }
    else if (index === 9) { /* Review */
      var chkA = document.getElementById('checkAccuracy');
      var chkC = document.getElementById('checkConduct');
      
      if (!chkA.checked || !chkC.checked) {
        showError('declarationError', t('val_declaration'));
        valid = false;
      }
    }

    if (!valid && index !== 9) {
      Toast.warning(Translate.t('val_required') || 'Please fix the errors to continue.');
    }

    return valid;
  }

  /* ===== SUBMISSION ===== */
  function submitRegistration() {
    if (!validateScreen(9)) return;

    var btn = document.getElementById('btnSubmit');
    var ogText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>' + Translate.t('loading');
    btn.disabled = true;

    var payload = {
      selectedCountry: selectedCountryData.code,
      language: Translate.getLanguage(),
      applicantType: categorySelected,
      participantCategory: categorySelected,
      fullName: val('regFullName'),
      dateOfBirth: val('regDob'),
      nationality: selectedCountryData.name,
      gender: genderSelected,
      email: val('regEmail'),
      password: val('regPassword'),
      phone: val('regPhoneCode') + val('regPhone'),
      whatsapp: val('regWhatsApp'),
      alternativeContact: val('regAltContact'),
      address: val('regAddress'),
      city: val('regCity'),
      country: selectedCountryData.name,
      idType: idTypeSelected,
      nationalIdNumber: val('regNIN'),
      nationalIdFile: uploadedFiles.nationalIdFile ? "[FILE]" : null,
      passportNumber: val('regPassportNo'),
      passportExpiry: val('regPassportExpiry'),
      passportFile: uploadedFiles.passportFile ? "[FILE]" : null,
      organization: {
        name: val('regOrgName'),
        position: val('regOrgPosition'),
        website: val('regOrgWebsite'),
        yearsWithYouth: parseInt(val('regOrgYears') || '0', 10),
        address: val('regOrgAddress')
      },
      motivation: val('regMotivation'),
      thematicInterests: themesSelected,
      supportNeeds: supportToggles
    };

    /* Add Speaker/Sponsor/Media specific fields if applicable */
    if (categorySelected === 'speaker') {
      payload.speakerDetails = {
        title: val('regSpeakerTitle'),
        abstract: val('regSpeakerAbstract'),
        bio: val('regSpeakerBio'),
        cvFile: uploadedFiles.speakerCv ? "[FILE]" : null,
        photoFile: uploadedFiles.speakerPhoto ? "[FILE]" : null
      };
    } else if (categorySelected === 'sponsor') {
      payload.sponsorDetails = {
        tier: val('regSponsorTier'),
        interest: val('regSponsorInterest'),
        proposalFile: uploadedFiles.sponsorProposal ? "[FILE]" : null
      };
    } else if (categorySelected === 'media') {
      payload.mediaDetails = {
        house: val('regMediaHouse'),
        role: val('regMediaRole'),
        credsFile: uploadedFiles.mediaCreds ? "[FILE]" : null
      };
    }

    ISAACApi.request('/api/auth/register', { method: 'POST', body: payload })
      .then(function (res) {
        /* Success */
        localStorage.removeItem(draftKey);
        
        /* Auto-login and go to dashboard */
        ISAACApi.request('/api/auth/login', { method: 'POST', body: { email: payload.email, password: payload.password } })
          .then(function (loginRes) {
            ISAACApi.setSession({ token: loginRes.token, user: loginRes.user });
            window.location.href = "/participant/dashboard.html";
          })
          .catch(function () {
            window.location.href = '/pages/auth.html?tab=login';
          });
      })
      .catch(function (err) {
        Toast.error(err.message || 'Registration failed');
        btn.innerHTML = ogText;
        btn.disabled = false;
      });
  }

  /* ===== UTILS & HELPERS ===== */
  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function markInvalid(id) {
    var el = document.getElementById(id);
    if (el) {
      el.classList.add('is-invalid');
      el.classList.remove('is-valid');
    }
  }

  function markValid(id) {
    var el = document.getElementById(id);
    if (el) {
      el.classList.add('is-valid');
      el.classList.remove('is-invalid');
    }
  }

  function showError(id, msg) {
    var el = document.getElementById(id);
    if (el) {
      el.textContent = msg;
      el.classList.remove('d-none');
    }
  }

  function hideError(id) {
    var el = document.getElementById(id);
    if (el) el.classList.add('d-none');
  }

  function clearErrors(container) {
    var errs = container.querySelectorAll('.validation-msg');
    errs.forEach(function (e) { e.classList.add('d-none'); });
    var inputs = container.querySelectorAll('.is-invalid, .is-valid');
    inputs.forEach(function (i) { 
      i.classList.remove('is-invalid');
      i.classList.remove('is-valid'); 
    });
  }

  /* ===== AUTO SAVE DRAFT ===== */
  function saveDraft() {
    var draft = {
      screen: currentScreen,
      category: categorySelected,
      gender: genderSelected,
      idType: idTypeSelected,
      themes: themesSelected,
      support: supportToggles,
      fields: {}
    };
    
    var inputs = document.querySelectorAll('input:not([type="password"]):not([type="file"]), textarea, select');
    inputs.forEach(function (input) {
      if (input.id) draft.fields[input.id] = input.value;
    });

    try {
      localStorage.setItem(draftKey, JSON.stringify(draft));
    } catch (e) { /* ignore */ }
  }

  function loadDraft() {
    try {
      var saved = localStorage.getItem(draftKey);
      if (!saved) return;
      var draft = JSON.parse(saved);
      
      /* Resume values */
      Object.keys(draft.fields || {}).forEach(function (key) {
        var el = document.getElementById(key);
        if (el) el.value = draft.fields[key];
      });

      /* Restore state vars (but we keep them on screen 0 to force review) */
      /* Full implementation would restore DOM state for category, themes, etc */
      
    } catch (e) { /* ignore */ }
  }

  /* Initialize */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
