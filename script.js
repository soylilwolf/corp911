/**
 * Corp911 - Suspension Corporation Tab
 * Interactive logic for status lookup, appointment booking, and tab navigation.
 * Designed to be embedded into an existing website.
 */
(function () {
  "use strict";

  /** Initialize after DOM is ready */
  function init() {
    var root = document.querySelector(".corp911-tab");
    if (!root) return;

    setupTabs(root);
    setupLookup(root);
    setupAppointmentForm(root);
  }

  /* ── Tab Navigation ───────────────────────────────────────────────── */

  function setupTabs(root) {
    var buttons = root.querySelectorAll(".tab-nav button");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = btn.getAttribute("data-tab");
        activateTab(root, target);
      });
    });
  }

  function activateTab(root, tabId) {
    root.querySelectorAll(".tab-nav button").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-tab") === tabId);
    });
    root.querySelectorAll(".tab-panel").forEach(function (p) {
      p.classList.toggle("active", p.id === tabId);
    });
  }

  /* ── Status Lookup ────────────────────────────────────────────────── */

  function setupLookup(root) {
    var form = root.querySelector("#lookup-form");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      performLookup(root, form);
    });
  }

  function performLookup(root, form) {
    var nameInput = form.querySelector("#corp-name");
    var stateSelect = form.querySelector("#corp-state");
    var corpName = nameInput.value.trim();
    var state = stateSelect.value;

    // Validation
    var alert = root.querySelector("#lookup-alert");
    if (!corpName) {
      showAlert(alert, "Please enter a corporation or LLC name.", "error");
      return;
    }
    if (!state) {
      showAlert(alert, "Please select a state.", "error");
      return;
    }
    hideAlert(alert);

    // Show spinner, hide previous results
    var spinner = root.querySelector("#lookup-spinner");
    var resultCard = root.querySelector("#lookup-result");
    spinner.classList.add("visible");
    resultCard.classList.add("hidden");

    // Simulate async lookup (replace with real API call)
    setTimeout(function () {
      spinner.classList.remove("visible");
      displayResult(root, corpName, state);
    }, 1200);
  }

  function displayResult(root, corpName, state) {
    var resultCard = root.querySelector("#lookup-result");
    var statuses = ["suspended", "active"];
    var status = statuses[Math.floor(Math.random() * statuses.length)];

    // Populate card
    resultCard.querySelector(".corp-name-display").textContent = corpName;
    var badge = resultCard.querySelector(".status-badge");
    badge.textContent = status;
    badge.className = "status-badge " + status;

    resultCard.querySelector(".result-state").textContent = state;
    resultCard.querySelector(".result-date").textContent = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Show/hide CTA based on status
    var cta = resultCard.querySelector(".result-cta");
    if (status === "suspended") {
      cta.style.display = "block";
    } else {
      cta.style.display = "none";
    }

    resultCard.classList.remove("hidden");
  }

  /* ── Appointment Form ─────────────────────────────────────────────── */

  function setupAppointmentForm(root) {
    var form = root.querySelector("#appointment-form");
    if (!form) return;

    // Set min date to today
    var dateInput = form.querySelector("#appt-date");
    if (dateInput) {
      dateInput.setAttribute("min", todayISO());
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      submitAppointment(root, form);
    });
  }

  function submitAppointment(root, form) {
    var alert = root.querySelector("#appt-alert");

    // Basic validation
    var fullName = form.querySelector("#appt-name").value.trim();
    var email = form.querySelector("#appt-email").value.trim();
    var phone = form.querySelector("#appt-phone").value.trim();
    var corpName = form.querySelector("#appt-corp").value.trim();
    var date = form.querySelector("#appt-date").value;
    var time = form.querySelector("#appt-time").value;

    if (!fullName || !email || !corpName || !date || !time) {
      showAlert(alert, "Please fill in all required fields.", "error");
      return;
    }
    if (!isValidEmail(email)) {
      showAlert(alert, "Please enter a valid email address.", "error");
      return;
    }
    hideAlert(alert);

    // Simulate submission
    var btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.textContent = "Submitting…";

    setTimeout(function () {
      form.classList.add("hidden");
      var confirmation = root.querySelector("#appt-confirmation");
      confirmation.classList.remove("hidden");
      confirmation.querySelector(".confirm-name").textContent = fullName;
      confirmation.querySelector(".confirm-date").textContent =
        new Date(date + "T00:00:00").toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      confirmation.querySelector(".confirm-time").textContent = time;
    }, 1000);
  }

  /* ── Navigate to appointment tab (from CTA) ──────────────────────── */

  // Expose a helper so the CTA button can switch tabs
  document.addEventListener("click", function (e) {
    if (e.target && e.target.matches("[data-goto-tab]")) {
      var root = document.querySelector(".corp911-tab");
      if (root) {
        activateTab(root, e.target.getAttribute("data-goto-tab"));
      }
    }
  });

  /* ── Utilities ────────────────────────────────────────────────────── */

  function showAlert(el, message, type) {
    el.textContent = message;
    el.className = "alert alert-" + type;
  }

  function hideAlert(el) {
    el.textContent = "";
    el.className = "alert hidden";
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function todayISO() {
    var d = new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function pad(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  /* ── Boot ─────────────────────────────────────────────────────────── */

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
