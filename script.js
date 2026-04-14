/**
 * Corp911 - Suspension Corporation Tab
 * Interactive logic for status lookup, appointment booking, and tab navigation.
 * Designed to be embedded into an existing website.
 *
 * Configuration (set before script loads):
 *   window.Corp911 = {
 *     apiBase: "https://your-backend.example.com/api" // optional backend URL
 *   };
 *
 * When apiBase is set the lookup calls GET {apiBase}/lookup?name={name}&state={state}
 * and expects JSON: { status, entityNumber, filingDate, entityType, registeredAgent, … }
 *
 * When apiBase is NOT set the widget directs users to the state's official
 * Secretary of State / business entity search portal.
 */
(function () {
  "use strict";

  /* ── State Registry: official business-entity search portals ────── */

  var STATE_REGISTRY = {
    "Alabama":        { name: "Alabama Secretary of State",           url: "https://www.sos.alabama.gov/government-records/business-entity-records" },
    "Alaska":         { name: "Alaska Division of Corporations",      url: "https://www.commerce.alaska.gov/cbp/Main/Search/Entities" },
    "Arizona":        { name: "Arizona Corporation Commission",       url: "https://ecorp.azcc.gov/EntitySearch/Index" },
    "Arkansas":       { name: "Arkansas Secretary of State",          url: "https://www.sos.arkansas.gov/corps/search_all.php" },
    "California":     { name: "California Secretary of State",        url: "https://bizfileonline.sos.ca.gov/search/business" },
    "Colorado":       { name: "Colorado Secretary of State",          url: "https://www.sos.state.co.us/biz/BusinessEntityCriteriaExt.do" },
    "Connecticut":    { name: "Connecticut Secretary of State",       url: "https://service.ct.gov/business/s/onlinebusinesssearch" },
    "Delaware":       { name: "Delaware Division of Corporations",    url: "https://icis.corp.delaware.gov/ecorp/entitysearch/namesearch.aspx" },
    "Florida":        { name: "Florida Division of Corporations",     url: "https://search.sunbiz.org/Inquiry/CorporationSearch/ByName" },
    "Georgia":        { name: "Georgia Secretary of State",           url: "https://ecorp.sos.ga.gov/BusinessSearch" },
    "Hawaii":         { name: "Hawaii BREG",                          url: "https://hbe.ehawaii.gov/documents/search.html" },
    "Idaho":          { name: "Idaho Secretary of State",             url: "https://sosbiz.idaho.gov/search/business" },
    "Illinois":       { name: "Illinois Secretary of State",          url: "https://www.ilsos.gov/corporatellc/CorporateLlcController" },
    "Indiana":        { name: "Indiana Secretary of State",           url: "https://bsd.sos.in.gov/publicbusinesssearch" },
    "Iowa":           { name: "Iowa Secretary of State",              url: "https://sos.iowa.gov/search/business/(S(0))/search.aspx" },
    "Kansas":         { name: "Kansas Secretary of State",            url: "https://www.kansas.gov/bess/flow/main?execution=e1s1" },
    "Kentucky":       { name: "Kentucky Secretary of State",          url: "https://web.sos.ky.gov/bussearchnprofile/(S(0))/search.aspx" },
    "Louisiana":      { name: "Louisiana Secretary of State",         url: "https://coraweb.sos.la.gov/CommercialSearch/CommercialSearch.aspx" },
    "Maine":          { name: "Maine Secretary of State",             url: "https://icrs.informe.org/nei-sos-icrs/ICRS?MainPage=x" },
    "Maryland":       { name: "Maryland SDAT",                        url: "https://egov.maryland.gov/BusinessExpress/EntitySearch" },
    "Massachusetts":  { name: "Massachusetts Secretary of the Commonwealth", url: "https://corp.sec.state.ma.us/corpweb/CorpSearch/CorpSearch.aspx" },
    "Michigan":       { name: "Michigan LARA",                        url: "https://cofs.lara.state.mi.us/CorpWeb/CorpSearch/CorpSearch.aspx" },
    "Minnesota":      { name: "Minnesota Secretary of State",         url: "https://mblsportal.sos.state.mn.us/Business/Search" },
    "Mississippi":    { name: "Mississippi Secretary of State",        url: "https://corp.sos.ms.gov/corp/portal/c/page/corpBusinessIdSearch/portal.aspx" },
    "Missouri":       { name: "Missouri Secretary of State",          url: "https://bsd.sos.mo.gov/BusinessEntity/BESearch.aspx" },
    "Montana":        { name: "Montana Secretary of State",           url: "https://biz.sosmt.gov/search" },
    "Nebraska":       { name: "Nebraska Secretary of State",          url: "https://www.nebraska.gov/sos/corp/corpsearch.cgi" },
    "Nevada":         { name: "Nevada Secretary of State",            url: "https://esos.nv.gov/EntitySearch/OnlineEntitySearch" },
    "New Hampshire":  { name: "New Hampshire Secretary of State",     url: "https://quickstart.sos.nh.gov/online/BusinessInquire" },
    "New Jersey":     { name: "New Jersey DORES",                     url: "https://www.njportal.com/DOR/BusinessNameSearch" },
    "New Mexico":     { name: "New Mexico Secretary of State",        url: "https://portal.sos.state.nm.us/BFS/online/CorporationBusinessSearch" },
    "New York":       { name: "New York Division of Corporations",    url: "https://appext20.dos.ny.gov/corp_public/CORPSEARCH.ENTITY_SEARCH_ENTRY" },
    "North Carolina": { name: "North Carolina Secretary of State",    url: "https://www.sosnc.gov/online_services/search/by_title/_Business_Registration" },
    "North Dakota":   { name: "North Dakota Secretary of State",      url: "https://firststop.sos.nd.gov/search/business" },
    "Ohio":           { name: "Ohio Secretary of State",              url: "https://businesssearch.ohiosos.gov/" },
    "Oklahoma":       { name: "Oklahoma Secretary of State",          url: "https://www.sos.ok.gov/corp/corpInquiryFind.aspx" },
    "Oregon":         { name: "Oregon Secretary of State",            url: "https://sos.oregon.gov/business/Pages/find.aspx" },
    "Pennsylvania":   { name: "Pennsylvania Department of State",     url: "https://www.corporations.pa.gov/search/corpsearch" },
    "Rhode Island":   { name: "Rhode Island Secretary of State",      url: "https://business.sos.ri.gov/CorpWeb/CorpSearch/CorpSearch.aspx" },
    "South Carolina": { name: "South Carolina Secretary of State",    url: "https://businessfilings.sc.gov/BusinessFiling/Entity/Search" },
    "South Dakota":   { name: "South Dakota Secretary of State",      url: "https://sosenterprise.sd.gov/BusinessServices/Business/FilingSearch.aspx" },
    "Tennessee":      { name: "Tennessee Secretary of State",         url: "https://tnbear.tn.gov/Ecommerce/FilingSearch.aspx" },
    "Texas":          { name: "Texas Secretary of State",             url: "https://www.sos.state.tx.us/corp/sosda/index.shtml" },
    "Utah":           { name: "Utah Division of Corporations",        url: "https://secure.utah.gov/bes/" },
    "Vermont":        { name: "Vermont Secretary of State",           url: "https://bizfilings.vermont.gov/online/BusinessInquire" },
    "Virginia":       { name: "Virginia SCC",                         url: "https://cis.scc.virginia.gov/EntitySearch/Index" },
    "Washington":     { name: "Washington Secretary of State",        url: "https://ccfs.sos.wa.gov/#/" },
    "West Virginia":  { name: "West Virginia Secretary of State",     url: "https://apps.wv.gov/SOS/BusinessEntity/" },
    "Wisconsin":      { name: "Wisconsin DFI",                        url: "https://www.wdfi.org/apps/CorpSearch/Search.aspx" },
    "Wyoming":        { name: "Wyoming Secretary of State",           url: "https://wyobiz.wyo.gov/Business/FilingSearch.aspx" }
  };

  /** Read optional configuration from the host page */
  var config = (typeof window.Corp911 === "object" && window.Corp911) || {};
  var API_BASE = config.apiBase || null;

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
    var alertEl = root.querySelector("#lookup-alert");
    if (!corpName) {
      showAlert(alertEl, "Please enter a corporation or LLC name.", "error");
      return;
    }
    if (!state) {
      showAlert(alertEl, "Please select a state.", "error");
      return;
    }
    hideAlert(alertEl);

    // Show spinner, hide previous results
    var spinner = root.querySelector("#lookup-spinner");
    var resultCard = root.querySelector("#lookup-result");
    var portalCard = root.querySelector("#lookup-portal");
    spinner.classList.add("visible");
    resultCard.classList.add("hidden");
    if (portalCard) portalCard.classList.add("hidden");

    if (API_BASE) {
      // ── Real backend API call ──────────────────────────────────────
      fetchStatus(corpName, state)
        .then(function (data) {
          spinner.classList.remove("visible");
          displayResult(root, corpName, state, data);
        })
        .catch(function (err) {
          spinner.classList.remove("visible");
          // On API error, fall back to state portal redirect
          showPortalFallback(root, corpName, state, err.message);
        });
    } else {
      // ── No backend configured – direct to state portal ─────────────
      // Brief delay so the UI feels intentional
      setTimeout(function () {
        spinner.classList.remove("visible");
        showPortalFallback(root, corpName, state, null);
      }, 600);
    }
  }

  /**
   * Call the backend lookup API.
   * Expected response JSON:
   *   {
   *     status: "suspended" | "active" | "dissolved" | "unknown",
   *     entityNumber: "C1234567",
   *     entityType: "Corporation",
   *     filingDate: "2015-03-12",
   *     registeredAgent: "Agent Name",
   *     suspensionDate: "2023-01-15",     // optional
   *     suspensionReason: "Tax default"   // optional
   *   }
   */
  function fetchStatus(corpName, state) {
    var url =
      API_BASE.replace(/\/+$/, "") +
      "/lookup?name=" +
      encodeURIComponent(corpName) +
      "&state=" +
      encodeURIComponent(state);

    return fetch(url).then(function (res) {
      if (!res.ok) {
        throw new Error("Server returned " + res.status);
      }
      return res.json();
    });
  }

  /**
   * Display results returned from the backend API.
   */
  function displayResult(root, corpName, state, data) {
    var resultCard = root.querySelector("#lookup-result");
    var status = (data.status || "unknown").toLowerCase();

    // Corporation name & badge
    resultCard.querySelector(".corp-name-display").textContent = corpName;
    var badge = resultCard.querySelector(".status-badge");
    badge.textContent = status;
    badge.className = "status-badge " + status;

    // Basic details
    resultCard.querySelector(".result-state").textContent = state;
    resultCard.querySelector(".result-date").textContent = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Extended details from state records
    setField(resultCard, ".result-entity-number", data.entityNumber);
    setField(resultCard, ".result-entity-type", data.entityType);
    setField(resultCard, ".result-filing-date", data.filingDate ? formatDate(data.filingDate) : null);
    setField(resultCard, ".result-agent", data.registeredAgent);
    setField(resultCard, ".result-suspension-date", data.suspensionDate ? formatDate(data.suspensionDate) : null);
    setField(resultCard, ".result-suspension-reason", data.suspensionReason);

    // State portal link
    var registry = STATE_REGISTRY[state];
    var portalLink = resultCard.querySelector(".result-source-link");
    if (portalLink && registry) {
      portalLink.href = registry.url;
      portalLink.textContent = "Verify on " + registry.name + " →";
      portalLink.parentElement.classList.remove("hidden");
    }

    // Show/hide CTA based on status
    var cta = resultCard.querySelector(".result-cta");
    cta.style.display = (status === "suspended") ? "block" : "none";

    resultCard.classList.remove("hidden");
  }

  /**
   * When no backend is configured or the API errors, show a card directing
   * the user to the correct state's official search portal.
   */
  function showPortalFallback(root, corpName, state, errorMessage) {
    var portalCard = root.querySelector("#lookup-portal");
    if (!portalCard) return;

    var registry = STATE_REGISTRY[state];
    if (!registry) {
      var alertEl = root.querySelector("#lookup-alert");
      showAlert(alertEl, "No records source found for " + state + ".", "error");
      return;
    }

    // Populate the portal card
    portalCard.querySelectorAll(".portal-state-name").forEach(function (el) {
      el.textContent = state;
    });
    portalCard.querySelector(".portal-source-name").textContent = registry.name;
    portalCard.querySelector(".portal-corp-name").textContent = corpName;

    var link = portalCard.querySelector(".portal-link");
    link.href = registry.url;
    link.textContent = "Search on " + registry.name + " →";

    // Show or hide the error note
    var errorNote = portalCard.querySelector(".portal-error");
    if (errorMessage) {
      errorNote.textContent = "Automatic lookup unavailable (" + errorMessage + "). Please search manually:";
      errorNote.classList.remove("hidden");
    } else {
      errorNote.classList.add("hidden");
    }

    portalCard.classList.remove("hidden");
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

  /** Set a text field inside a card; hide its row when value is empty. */
  function setField(card, selector, value) {
    var el = card.querySelector(selector);
    if (!el) return;
    var row = el.closest(".detail-row");
    if (value) {
      el.textContent = value;
      if (row) row.classList.remove("hidden");
    } else {
      el.textContent = "—";
      if (row) row.classList.add("hidden");
    }
  }

  /** Format an ISO date string for display. */
  function formatDate(iso) {
    var d = new Date(iso + "T00:00:00");
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }

  /* ── Boot ─────────────────────────────────────────────────────────── */

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
