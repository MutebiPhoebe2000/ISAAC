/**
 * ISAAC Summit — Admin Dashboard Controller
 * Handles navigation, stats, user management, import/export, and filtering.
 */
(function () {
  'use strict';

  /* ===== STATE ===== */
  var state = {
    page: 1,
    pages: 1,
    search: '',
    status: '',
    selectedUserId: null,
    users: [],
    searchTimer: null
  };

  /* ===== BOOT ===== */
  document.addEventListener('DOMContentLoaded', function () {
    /* Auth guard */
    var sessionUser = ISAACApi.requireRole('admin');
    if (!sessionUser) return;

    initSidebarNavigation();
    initActionHandlers();
    loadUsers();
  });

  /* ===== SIDEBAR NAVIGATION ===== */
  function initSidebarNavigation() {
    var buttons = document.querySelectorAll('.sidebar-menu-item');
    var panels = document.querySelectorAll('.admin-panel-block');
    var headerTitle = document.getElementById('adminHeaderTitle');

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        /* Remove active from all buttons */
        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        /* Hide all panels, show target */
        panels.forEach(function (p) { p.classList.add('d-none'); });
        var targetPanel = document.getElementById(btn.dataset.target);
        if (targetPanel) targetPanel.classList.remove('d-none');

        /* Update header title */
        var label = btn.dataset.label || btn.textContent.trim();
        if (headerTitle) headerTitle.textContent = label;
      });
    });
  }

  /* ===== ACTION HANDLERS ===== */
  function initActionHandlers() {
    /* Debounced search */
    var searchBox = document.getElementById('adminGlobalSearchBox');
    if (searchBox) {
      searchBox.addEventListener('input', function (e) {
        clearTimeout(state.searchTimer);
        state.searchTimer = setTimeout(function () {
          state.search = e.target.value.trim();
          state.page = 1;
          loadUsers();
        }, 350);
      });
    }

    /* Status filter */
    var statusFilter = document.getElementById('adminStatusFilter');
    if (statusFilter) {
      statusFilter.addEventListener('change', function (e) {
        state.status = e.target.value;
        state.page = 1;
        loadUsers();
      });
    }

    /* Pagination */
    var prevBtn = document.getElementById('adminPrevPage');
    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        if (state.page > 1) {
          state.page -= 1;
          loadUsers();
        }
      });
    }

    var nextBtn = document.getElementById('adminNextPage');
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        if (state.page < state.pages) {
          state.page += 1;
          loadUsers();
        }
      });
    }

    /* Export CSV */
    var csvBtn = document.getElementById('adminExportCsvBtn');
    if (csvBtn) {
      csvBtn.addEventListener('click', function () {
        downloadFile('/api/exports/users.csv', 'ayicrip_delegates.csv');
      });
    }

    /* Export PDF */
    var pdfBtn = document.getElementById('adminExportPdfBtn');
    if (pdfBtn) {
      pdfBtn.addEventListener('click', function () {
        downloadFile('/api/exports/summary.pdf', 'ayicrip_summary_report.pdf');
      });
    }

    /* CSV import */
    var importInput = document.getElementById('adminImportCsv');
    if (importInput) {
      importInput.addEventListener('change', handleCsvImport);
    }

    /* Modal approve/reject */
    var approveBtn = document.getElementById('adminApproveBtn');
    if (approveBtn) {
      approveBtn.addEventListener('click', function () {
        updateSelectedUserStatus('Approved');
      });
    }

    var rejectBtn = document.getElementById('adminRejectBtn');
    if (rejectBtn) {
      rejectBtn.addEventListener('click', function () {
        updateSelectedUserStatus('Rejected');
      });
    }

    var deleteBtn = document.getElementById('adminDeleteBtn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', function () {
        if (!state.selectedUserId) return;
        deleteUser(state.selectedUserId, function () {
          var modalEl = document.getElementById('adminDataInspectModal');
          if (modalEl) {
            var instance = bootstrap.Modal.getInstance(modalEl);
            if (instance) instance.hide();
          }
        });
      });
    }

    /* Logout */
    var logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }
  }

  /* ===== LOAD USERS ===== */
  function loadUsers() {
    var params = new URLSearchParams({
      page: state.page,
      limit: 8,
      search: state.search,
      status: state.status
    });

    ISAACApi.request('/api/admin/users?' + params.toString())
      .then(function (payload) {
        state.users = payload.users || [];
        state.page = payload.page || 1;
        state.pages = payload.pages || 1;

        renderUsersTable(state.users);
        renderPagination();
        loadStats();
        loadReportsData();
      })
      .catch(function (err) {
        Toast.error(err.message || 'Could not load users.');
      });
  }

  /* ===== RENDER USERS TABLE ===== */
  function renderUsersTable(users) {
    var tbody = document.getElementById('adminUsersTableBody');
    if (!tbody) return;

    if (!users.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-muted small text-center py-3">No delegates found.</td></tr>';
      return;
    }

    var html = '';
    for (var i = 0; i < users.length; i++) {
      var u = users[i];
      html += '<tr data-user-id="' + escapeAttr(u._id) + '">'
        + '<td>' + esc(u.summitId || '') + '</td>'
        + '<td class="fw-bold">' + esc(u.fullName) + '</td>'
        + '<td>' + esc(u.email) + '</td>'
        + '<td>' + esc(u.country || u.nationality || '') + '</td>'
        + '<td>' + esc(u.applicantType || u.role || '') + '</td>'
        + '<td><span class="badge ' + statusBadge(u.status) + '">' + esc(u.status) + '</span></td>'
        + '<td class="d-flex gap-1 flex-wrap">'
        +   '<button class="btn btn-sm btn-outline-info" data-action="view_dashboard" data-uid="' + escapeAttr(u._id) + '" title="View User Dashboard"><i class="bi bi-box-arrow-up-right"></i> Dashboard</button>'
        +   '<button class="btn btn-sm btn-outline-primary" data-action="review" data-uid="' + escapeAttr(u._id) + '">Review</button>'
        +   '<button class="btn btn-sm btn-outline-success" data-action="approve" data-uid="' + escapeAttr(u._id) + '">Approve</button>'
        +   '<button class="btn btn-sm btn-outline-danger" data-action="reject" data-uid="' + escapeAttr(u._id) + '">Reject</button>'
        +   '<button class="btn btn-sm btn-outline-secondary" data-action="delete" data-uid="' + escapeAttr(u._id) + '" title="Delete Delegate"><i class="bi bi-trash3"></i></button>'
        + '</td>'
        + '</tr>';
    }
    tbody.innerHTML = html;

    /* Bind action buttons */
    tbody.querySelectorAll('button[data-action]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var userId = btn.dataset.uid;
        var action = btn.dataset.action;
        handleRowAction(userId, action);
      });
    });
  }

  /* ===== RENDER PAGINATION ===== */
  function renderPagination() {
    var label = document.getElementById('adminPageLabel');
    var prevBtn = document.getElementById('adminPrevPage');
    var nextBtn = document.getElementById('adminNextPage');

    if (label) label.textContent = 'Page ' + state.page + ' of ' + state.pages;
    if (prevBtn) prevBtn.disabled = state.page <= 1;
    if (nextBtn) nextBtn.disabled = state.page >= state.pages;
  }

  /* ===== ROW ACTIONS ===== */
  function handleRowAction(userId, action) {
    if (action === 'view_dashboard') {
      window.open(ISAACApi.route('/participant/dashboard?impersonate=' + userId), '_blank');
      return;
    }
    if (action === 'approve') {
      patchUser(userId, { status: 'Approved' });
      return;
    }
    if (action === 'reject') {
      patchUser(userId, { status: 'Rejected' });
      return;
    }
    if (action === 'delete') {
      deleteUser(userId);
      return;
    }

    /* Review — open modal */
    var user = findUserById(userId);
    if (!user) return;

    state.selectedUserId = userId;

    var titleEl = document.getElementById('inspectModalNameTitle');
    if (titleEl) titleEl.textContent = 'Reviewing: ' + user.fullName;

    var bodyEl = document.getElementById('inspectModalContentPayload');
    if (bodyEl) {
      bodyEl.innerHTML =
        '<form id="adminEditUserForm" class="row g-3">'
        + '<div class="col-12"><label class="form-label small">Full Name</label>'
        +   '<input class="form-control" name="fullName" value="' + escapeAttr(user.fullName) + '"></div>'
        + '<div class="col-12"><label class="form-label small">Email</label>'
        +   '<input class="form-control" name="email" value="' + escapeAttr(user.email) + '"></div>'
        + '<div class="col-md-6"><label class="form-label small">Country</label>'
        +   '<input class="form-control" name="country" value="' + escapeAttr(user.country || user.nationality || '') + '"></div>'
        + '<div class="col-md-6"><label class="form-label small">Category</label>'
        +   '<input class="form-control" name="applicantType" value="' + escapeAttr(user.applicantType || user.role || '') + '" readonly></div>'
        + '<div class="col-md-6"><label class="form-label small">Phone</label>'
        +   '<input class="form-control" name="phone" value="' + escapeAttr(user.phone || '') + '" readonly></div>'
        + '<div class="col-md-6"><label class="form-label small">Status</label>'
        +   '<select class="form-select" name="status">'
        +     '<option value="Pending"' + (user.status === 'Pending' ? ' selected' : '') + '>Pending</option>'
        +     '<option value="Approved"' + (user.status === 'Approved' ? ' selected' : '') + '>Approved</option>'
        +     '<option value="Rejected"' + (user.status === 'Rejected' ? ' selected' : '') + '>Rejected</option>'
        +   '</select></div>'
        + '</form>';
    }

    var modalEl = document.getElementById('adminDataInspectModal');
    if (modalEl) {
      var modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  /* ===== UPDATE SELECTED USER STATUS (from modal) ===== */
  function updateSelectedUserStatus(newStatus) {
    if (!state.selectedUserId) return;

    var form = document.getElementById('adminEditUserForm');
    var body = {};

    if (form) {
      var formData = new FormData(form);
      formData.forEach(function (value, key) {
        body[key] = value;
      });
    }

    body.status = newStatus;

    patchUser(state.selectedUserId, body, function () {
      var modalEl = document.getElementById('adminDataInspectModal');
      if (modalEl) {
        var instance = bootstrap.Modal.getInstance(modalEl);
        if (instance) instance.hide();
      }
    });
  }

  /* ===== PATCH USER ===== */
  function patchUser(id, body, onSuccess) {
    ISAACApi.request('/api/admin/users/' + id, { method: 'PATCH', body: body })
      .then(function () {
        Toast.success('Delegate updated to "' + (body.status || 'updated') + '".');
        if (typeof onSuccess === 'function') onSuccess();
        loadUsers();
      })
      .catch(function (err) {
        Toast.error(err.message || 'Could not update delegate.');
      });
  }

  /* ===== DELETE USER ===== */
  function deleteUser(id, onSuccess) {
    var user = findUserById(id);
    var label = user ? user.fullName : 'this delegate';
    if (!window.confirm('Delete ' + label + '? This permanently removes their registration and cannot be undone.')) {
      return;
    }

    ISAACApi.request('/api/admin/users/' + id, { method: 'DELETE' })
      .then(function () {
        Toast.success(label + ' was deleted.');
        if (typeof onSuccess === 'function') onSuccess();
        if (state.selectedUserId === id) state.selectedUserId = null;
        loadUsers();
      })
      .catch(function (err) {
        Toast.error(err.message || 'Could not delete delegate.');
      });
  }

  /* ===== LOAD STATS ===== */
  function loadStats() {
    ISAACApi.request('/api/admin/stats')
      .then(function (stats) {
        setText('statTotalUsers', stats.total || 0);
        setText('statApprovedUsers', stats.approved || 0);
        setText('statPendingUsers', stats.pending || 0);
        setText('statCountries', stats.countries || 0);
        setText('statRejected', stats.rejected || 0);

        /* Check-in percentage */
        var checkinPercent = stats.total
          ? Math.round((stats.checkedIn || 0) / stats.total * 100)
          : 0;
        setText('statOccupancy', checkinPercent + '%');

        /* Revenue */
        var revenue = stats.revenue || 0;
        setText('statRevenue', '$' + revenue.toLocaleString());

        /* Flights */
        setText('statBookings', (stats.accommodationPaid || 0) + (stats.accommodationUnpaid || 0));
        setText('adminAccommodationPaid', stats.accommodationPaid || 0);
        setText('adminAccommodationUnpaid', stats.accommodationUnpaid || 0);

        /* Country bar chart */
        renderCountryChart(stats.countryCounts || []);
      })
      .catch(function (err) {
        Toast.error(err.message || 'Could not load stats.');
      });
  }

  /* ===== COUNTRY CHART (CSS bars) ===== */
  function renderCountryChart(countryCounts) {
    var container = document.getElementById('countryMetricsList');
    if (!container) return;

    if (!countryCounts.length) {
      container.innerHTML = '<p class="text-muted small mb-0">No country data yet.</p>';
      return;
    }

    var html = '';
    for (var i = 0; i < countryCounts.length; i++) {
      var item = countryCounts[i];
      var percent = item.percent || 0;
      html += '<div class="small">'
        + esc(item.country) + ' <span class="text-muted">(' + (item.count || 0) + ' delegates)</span>'
        + '<div class="progress progress-thin">'
        +   '<div class="progress-bar bg-navy country-progress" style="width: 0%;" data-percent="' + percent + '"></div>'
        + '</div>'
        + '</div>';
    }
    container.innerHTML = html;

    /* Animate bars */
    requestAnimationFrame(function () {
      container.querySelectorAll('.country-progress').forEach(function (bar) {
        bar.style.width = bar.dataset.percent + '%';
        bar.style.transition = 'width 0.6s ease';
      });
    });
  }

  /* ===== FILTERED TABLES (Approved, Rejected, Kenyan, Intl) ===== */
  function populateFilteredTables(users) {
    var tables = document.querySelectorAll('.slice-filter-table');
    tables.forEach(function (table) {
      var key = table.dataset.filterKey;
      var tbody = table.querySelector('tbody');
      if (!tbody) return;

      var filtered = users.filter(function (u) {
        if (key === 'Kenyan Participant') return String(u.country || u.nationality || '').toLowerCase() === 'kenya';
        if (key === 'International Participant') return String(u.country || u.nationality || '').toLowerCase() !== 'kenya';
        return u.status === key || u.participantCategory === key || u.applicantType === key;
      });

      if (!filtered.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-muted small text-center py-2">No matching delegates.</td></tr>';
        return;
      }

      var html = '';
      for (var i = 0; i < filtered.length; i++) {
        var u = filtered[i];
        html += '<tr>'
          + '<td>' + esc(u.summitId || '') + '</td>'
          + '<td>' + esc(u.fullName) + '</td>'
          + '<td>' + esc(u.country || u.nationality || '') + '</td>'
          + '<td>' + esc(u.status || u.category || u.applicantType || '') + '</td>'
          + '</tr>';
      }
      tbody.innerHTML = html;
    });
  }

  function loadReportsData() {
    ISAACApi.request('/api/admin/reports-data')
      .then(function (report) {
        setText('summaryRegistered', report.totalRegistered || 0);
        setText('summaryApproved', report.totalApproved || 0);
        setText('summaryCountries', report.totalCountries || 0);
        populateFilteredTables(report.allDelegates || []);
        renderCountryReport('registeredByCountryReport', report.registeredByCountry || []);
        renderCountryReport('approvedByCountryReport', report.approvedByCountry || []);
        renderAllDelegatesReport(report.allDelegates || []);
        renderCategoryList('adminSpeakersList', report.speakers || [], 'No registered speakers yet.');
        renderCategoryList('adminSponsorsList', report.sponsors || [], 'No registered sponsors yet.');
        renderPaymentsTable(report.allDelegates || []);
        renderAccommodationTable([].concat(report.accommodationPaid || [], report.accommodationUnpaid || []));
      })
      .catch(function () { /* keep page usable if reports endpoint is unavailable */ });
  }

  function renderPaymentsTable(delegates) {
    var tbody = document.getElementById('adminPaymentsTableBody');
    if (!tbody) return;
    var submitted = delegates.filter(function (u) { return u.paymentMethod; });
    if (!submitted.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-muted small text-center py-2">No bank transfer submissions yet.</td></tr>';
      return;
    }
    tbody.innerHTML = submitted.map(function (u) {
      return '<tr>'
        + '<td>' + esc(u.summitId || '') + '</td>'
        + '<td class="fw-bold">' + esc(u.fullName || '') + '</td>'
        + '<td>' + esc(u.paymentMethod || 'Bank Transfer') + '</td>'
        + '<td>USD 30</td>'
        + '<td><span class="badge bg-warning text-dark">Pending verification</span></td>'
        + '</tr>';
    }).join('');
  }

  function renderAccommodationTable(items) {
    var tbody = document.getElementById('adminAccommodationTableBody');
    if (!tbody) return;
    if (!items.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-muted small text-center py-2">No Sapphire Hotel bookings yet.</td></tr>';
      return;
    }
    tbody.innerHTML = items.map(function (item) {
      return '<tr>'
        + '<td>' + esc(item.summitId || '') + '</td>'
        + '<td class="fw-bold">' + esc(item.fullName || '') + '</td>'
        + '<td>' + esc(item.country || '') + '</td>'
        + '<td>' + esc(item.roomPreference || '') + '</td>'
        + '<td>' + esc(item.nights || '') + '</td>'
        + '<td><span class="badge ' + (item.paid ? 'bg-success' : 'bg-warning text-dark') + '">' + (item.paid ? 'Paid' : 'Unpaid') + '</span></td>'
        + '</tr>';
    }).join('');
  }

  function renderCountryReport(id, items) {
    var container = document.getElementById(id);
    if (!container) return;
    if (!items.length) {
      container.innerHTML = '<div class="list-group-item text-muted">No country totals yet.</div>';
      return;
    }
    container.innerHTML = items.map(function (item) {
      return '<div class="list-group-item d-flex justify-content-between"><span>' + esc(item.country) + '</span><strong>' + esc(item.count) + '</strong></div>';
    }).join('');
  }

  function renderAllDelegatesReport(items) {
    var tbody = document.getElementById('allDelegatesReportBody');
    if (!tbody) return;
    if (!items.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-muted text-center">No delegates registered yet.</td></tr>';
      return;
    }
    tbody.innerHTML = items.map(function (u) {
      return '<tr>'
        + '<td>' + esc(u.summitId || '') + '</td>'
        + '<td>' + esc(u.fullName || '') + '</td>'
        + '<td>' + esc(u.email || '') + '</td>'
        + '<td>' + esc(u.country || '') + '</td>'
        + '<td>' + esc(u.status || '') + '</td>'
        + '</tr>';
    }).join('');
  }

  function renderCategoryList(id, items, emptyText) {
    var container = document.getElementById(id);
    if (!container) return;
    if (!items.length) {
      container.innerHTML = '<div class="text-muted small border rounded p-3">' + esc(emptyText) + '</div>';
      return;
    }
    container.innerHTML = items.map(function (u) {
      return '<div class="p-3 border rounded bg-light">'
        + '<span class="fw-bold text-dark d-block">' + esc(u.fullName || '') + '</span>'
        + '<small class="text-muted">' + esc(u.country || '') + ' | ' + esc(u.email || '') + '</small>'
        + '</div>';
    }).join('');
  }

  /* ===== CSV IMPORT ===== */
  function handleCsvImport(event) {
    var file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      Toast.error('Please select a .csv file.');
      event.target.value = '';
      return;
    }

    file.text().then(function (text) {
      var lines = text.trim().split(/\r?\n/);
      if (lines.length < 2) {
        Toast.warning('The CSV file appears to be empty.');
        return;
      }

      var headerLine = lines[0];
      var headers = headerLine.split(',').map(function (h) { return h.trim().replace(/^"|"$/g, ''); });
      var rows = [];

      for (var i = 1; i < lines.length; i++) {
        var values = lines[i].split(',').map(function (v) { return v.trim().replace(/^"|"$/g, ''); });
        var row = {};
        for (var j = 0; j < headers.length; j++) {
          row[headers[j]] = values[j] || '';
        }
        rows.push(row);
      }

      return ISAACApi.request('/api/admin/import', { method: 'POST', body: { rows: rows } });
    }).then(function (result) {
      if (result) {
        var count = result.imported || result.count || 0;
        Toast.success('Imported ' + count + ' delegate(s) successfully.');
        loadUsers();
      }
    }).catch(function (err) {
      Toast.error(err.message || 'CSV import failed.');
    }).finally(function () {
      event.target.value = '';
    });
  }

  /* ===== EXPORT DOWNLOAD ===== */
  function downloadFile(path, filename) {
    ISAACApi.request(path)
      .then(function (blob) {
        ISAACApi.downloadBlob(blob, filename);
        Toast.success(filename + ' downloaded.');
      })
      .catch(function (err) {
        Toast.error(err.message || 'Download failed.');
      });
  }

  /* ===== LOGOUT ===== */
  function handleLogout() {
    ISAACApi.request('/api/auth/logout', { method: 'POST' })
      .catch(function () { /* ignore logout endpoint errors */ })
      .finally(function () {
        ISAACApi.clearSession();
        window.location.href = ISAACApi.route('/auth?tab=login');
      });
  }

  /* ===== HELPERS ===== */
  function findUserById(id) {
    for (var i = 0; i < state.users.length; i++) {
      if (state.users[i]._id === id) return state.users[i];
    }
    return null;
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function statusBadge(status) {
    if (status === 'Approved') return 'bg-success';
    if (status === 'Rejected') return 'bg-danger';
    return 'bg-warning text-dark';
  }

  function esc(str) {
    var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(str || '').replace(/[&<>"']/g, function (c) { return map[c]; });
  }

  function escapeAttr(str) {
    return esc(str).replace(/"/g, '&quot;');
  }

})();
