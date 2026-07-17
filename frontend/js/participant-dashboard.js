document.addEventListener("DOMContentLoaded", async () => {
  const sessionUser = ISAACApi.requireRole("delegate");
  if (!sessionUser) return;
  initPortalNavigation();
  initStageTwoForm();
  initProfileForm();
  initDocumentButtons();
  initSessionButtons();
  await loadDelegate();
});

let currentDelegate = null;

function initPortalNavigation() {
  document.querySelectorAll(".sidebar-menu-item").forEach((button) => {
    button.addEventListener("click", () => routeToTargetPanel(button.dataset.target));
  });
  document.getElementById("stageTwoShortcutBtn").addEventListener("click", () => routeToTargetPanel("p-stage2"));
}

function routeToTargetPanel(panelId) {
  const button = document.querySelector(`.sidebar-menu-item[data-target='${panelId}']`);
  if (!button) return;
  document.querySelectorAll(".sidebar-menu-item").forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
  document.querySelectorAll(".portal-panel-block").forEach((panel) => panel.classList.add("d-none"));
  document.getElementById(panelId).classList.remove("d-none");
  
  const titleEl = document.getElementById("panelHeaderTitle");
  if (titleEl) {
    if (panelId === 'p-home' && currentDelegate && currentDelegate.fullName) {
      const firstName = currentDelegate.fullName.split(' ')[0];
      titleEl.textContent = `${firstName}'s Dashboard`;
    } else {
      titleEl.textContent = button.textContent.trim();
    }
  }
}

async function loadDelegate() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const impersonateId = urlParams.get('impersonate');
    const sessionUser = ISAACApi.user();
    
    if (impersonateId && sessionUser && sessionUser.role === 'admin') {
      const payload = await ISAACApi.request("/api/admin/users/" + impersonateId);
      currentDelegate = payload.user;
      
      // Add a view mode banner
      const banner = document.createElement('div');
      banner.className = 'bg-warning text-dark text-center fw-bold py-2 shadow-sm';
      banner.style.position = 'sticky';
      banner.style.top = '0';
      banner.style.zIndex = '1050';
      banner.textContent = `SUPPORT VIEW MODE: Viewing ${currentDelegate.fullName}'s Dashboard`;
      document.body.insertBefore(banner, document.body.firstChild);
    } else {
      const payload = await ISAACApi.request("/api/auth/me");
      currentDelegate = payload.user;
    }
    renderDelegate();
  } catch (err) {
    console.error("Failed to load delegate profile", err);
    // If it fails, they are probably unauthorized or token expired
    window.location.href = ISAACApi.route("/auth?tab=login");
  }
}

function renderDelegate() {
  const firstName = currentDelegate.fullName ? currentDelegate.fullName.split(' ')[0] : 'Delegate';
  setText("panelHeaderTitle", `${firstName}'s Dashboard`);
  setText("delegateWelcomeLine", `Welcome back, ${currentDelegate.fullName} (AU ID: ${currentDelegate.summitId})`);
  setText("delegateStatusText", currentDelegate.status);
  setText("delegatePaymentText", currentDelegate.stageTwo && currentDelegate.stageTwo.paymentMethod ? "Submitted" : "Pending Deposit");
  setText("delegateHotelText", currentDelegate.stageTwo && currentDelegate.stageTwo.hotelSelection ? currentDelegate.stageTwo.hotelSelection : "Unassigned Allocation");
  setText("badgeName", currentDelegate.fullName);
  setText("badgeCountry", currentDelegate.country || currentDelegate.nationality || "Africa-wide");
  setText("badgeId", currentDelegate.summitId);
  setText("badgeRole", currentDelegate.applicantType || "Delegate");
  setText("sessionTokenText", "Vetted Session Token: active");

  field("profileFullName").value = currentDelegate.fullName || "";
  field("profileEmail").value = currentDelegate.email || "";
  field("profilePhone").value = currentDelegate.phone || "";
  field("profileCountry").value = currentDelegate.country || "";

  field("stage2SummitId").value = currentDelegate.summitId || "";
  field("stage2FullName").value = currentDelegate.fullName || "";
  field("stage2Email").value = currentDelegate.email || "";
  field("stage2Country").value = currentDelegate.country || currentDelegate.nationality || "";

  const notifications = (currentDelegate.notifications || []).slice(-5).reverse();
  const notifList = document.getElementById("notificationsList");
  if (notifList) {
    notifList.innerHTML = notifications.map((item) => `<li>${escapeHtml(item.message)}</li>`).join("") || "<li>No notifications yet.</li>";
  }
}

function initStageTwoForm() {
  bindCardValueSelectionToHiddenStore("[data-hotel]", "stage2HotelSelection");
  bindCardValueSelectionToHiddenStore("[data-room]", "stage2RoomPreference");
  bindCardValueSelectionToHiddenStore("[data-pay]", "stage2PaymentMethod");
  bindCardValueSelectionToHiddenStore("[data-lang]", "stage2LanguageSelection");

  const airportSwitch = field("stage2AirportTransferSwitch");
  const airportFields = document.getElementById("stage2AirportFields");
  if (airportSwitch && airportFields) {
    airportSwitch.addEventListener("change", (event) => {
      airportFields.classList.toggle("d-none", !event.target.checked);
    });
  }

  const zone = document.getElementById("paymentProofDropzone");
  const fileInput = document.getElementById("paymentFileInput");
  const filePreviewLabel = document.getElementById("paymentFilePreview");
  if(zone && fileInput && filePreviewLabel) {
    zone.addEventListener("click", () => fileInput.click());
    zone.addEventListener("dragover", (event) => {
      event.preventDefault();
      zone.classList.add("dragging");
    });
    zone.addEventListener("dragleave", () => zone.classList.remove("dragging"));
    zone.addEventListener("drop", (event) => {
      event.preventDefault();
      zone.classList.remove("dragging");
      if (event.dataTransfer.files.length) {
        fileInput.files = event.dataTransfer.files;
        handleFilePreview(fileInput.files[0], filePreviewLabel);
      }
    });
    fileInput.addEventListener("change", () => {
      if (fileInput.files.length) handleFilePreview(fileInput.files[0], filePreviewLabel);
    });
  }

  document.querySelectorAll("[data-lang]").forEach((card) => {
    card.addEventListener("click", () => {
      const langMap = { "English": "en", "French": "fr", "Portuguese": "pt", "Arabic": "ar" };
      const langCode = langMap[card.dataset.lang];
      if (langCode && window.Translate) {
        window.Translate.setLanguage(langCode);
      }
    });
  });

  document.getElementById("stageTwoCoreProcessingForm").addEventListener("submit", submitStageTwo);
}

function handleFilePreview(file, labelElement) {
  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      labelElement.innerHTML = `<img src="${e.target.result}" style="max-height:100px; border-radius:4px; margin-top:8px; border:2px solid var(--turquoise);">`;
    };
    reader.readAsDataURL(file);
  } else {
    labelElement.textContent = `Attached: ${file.name}`;
  }
}

function bindCardValueSelectionToHiddenStore(selectorPattern, targetHiddenFieldId) {
  const nodes = document.querySelectorAll(selectorPattern);
  const target = field(targetHiddenFieldId);
  if (!nodes.length || !target) return;
  nodes.forEach((node) => {
    node.addEventListener("click", () => {
      nodes.forEach((item) => item.classList.remove("selected"));
      node.classList.add("selected");
      const attributeKey = Object.keys(node.dataset)[0];
      target.value = node.dataset[attributeKey];
    });
  });
}

async function submitStageTwo(event) {
  event.preventDefault();
  const required = ["stage2HotelSelection", "stage2RoomPreference", "stage2PaymentMethod"];
  if (required.some((id) => !field(id) || !field(id).value)) return alert("Please complete hotel, room, and payment selections.");

  await ISAACApi.request("/api/participant/stage-two", {
    method: "POST",
    body: {
      packageSelection: "Sapphire Hotel Accommodation",
      hotelSelection: field("stage2HotelSelection").value,
      roomPreference: field("stage2RoomPreference").value,
      nights: field("stage2Nights").value,
      checkIn: field("stage2CheckIn").value,
      checkOut: field("stage2CheckOut").value,
      airportTransfer: false,
      flightNo: "",
      pickupDate: "",
      pickupTime: "",
      paymentMethod: field("stage2PaymentMethod").value,
      paymentProofName: "",
      apparelSize: "",
      language: field("stage2LanguageSelection") ? field("stage2LanguageSelection").value : "English"
    }
  });
  alert("Stage Two package submitted.");
  await loadDelegate();
  routeToTargetPanel("p-home");
}

function initProfileForm() {
  document.getElementById("delegateProfileForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    await ISAACApi.request("/api/participant/profile", {
      method: "PATCH",
      body: {
        fullName: field("profileFullName").value,
        phone: field("profilePhone").value,
        country: field("profileCountry").value
      }
    });
    alert("Profile updated.");
    await loadDelegate();
  });
}

function initDocumentButtons() {
  document.querySelectorAll("[data-doc-type]").forEach((button) => {
    button.addEventListener("click", async () => {
      const type = button.dataset.docType;
      const blob = await ISAACApi.request(`/api/participant/documents/${type}`);
      ISAACApi.downloadBlob(blob, `${type}_${currentDelegate.summitId}.pdf`);
    });
  });
  
  const notifBtn = document.getElementById("notificationBellBtn");
  if (notifBtn) {
    notifBtn.addEventListener("click", () => {
      alert((currentDelegate.notifications || []).slice(-5).map((item) => item.message).join("\n") || "No notifications yet.");
    });
  }
}

function initSessionButtons() {
  document.getElementById("checkInBtn").addEventListener("click", () => attendanceAction("/api/participant/check-in", "Checked in."));
  document.getElementById("checkOutBtn").addEventListener("click", () => attendanceAction("/api/participant/check-out", "Checked out."));
  document.getElementById("delegateLogoutBtn").addEventListener("click", logout);
}

async function attendanceAction(path, message) {
  await ISAACApi.request(path, { method: "POST" });
  alert(message);
  await loadDelegate();
}

async function logout() {
  await ISAACApi.request("/api/auth/logout", { method: "POST" }).catch(() => {});
  ISAACApi.clearSession();
  window.location.href = ISAACApi.route("/auth?tab=login");
}

function field(id) {
  return document.getElementById(id);
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}
