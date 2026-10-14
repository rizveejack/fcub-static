/* ============================================================
 * FCUB — vanilla JavaScript for the static export
 * No dependencies. Every interaction from the Next.js app,
 * ported to plain DOM APIs.
 * ============================================================ */
(function () {
  "use strict";

  /* ── 1. Header scroll state ─────────────────────────────
     Transparent over the page hero; .is-solid after 40px. */
  var onScroll = function () {
    document.body.classList.toggle("is-solid", window.scrollY > 40);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ── 2. Mobile drawer ─────────────────────────────────── */
  var menu = document.getElementById("mobile-menu");
  var openBtn = document.getElementById("menu-open");
  var closeBtn = document.getElementById("menu-close");

  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", open ? "false" : "true");
    openBtn.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("menu-locked", open);
    if (open) {
      /* reset any open accordion when the drawer opens */
      menu.querySelectorAll("[aria-expanded='true']").forEach(function (b) {
        if (b.classList.contains("acc-trigger"))
          b.setAttribute("aria-expanded", "false");
      });
    }
  }
  if (openBtn)
    openBtn.addEventListener("click", function () {
      setMenu(true);
    });
  if (closeBtn)
    closeBtn.addEventListener("click", function () {
      setMenu(false);
    });
  if (menu) {
    menu
      .querySelector(".mobile-overlay")
      .addEventListener("click", function () {
        setMenu(false);
      });
    /* close after choosing any real link */
    menu.querySelectorAll("a[href]").forEach(function (a) {
      a.addEventListener("click", function () {
        setMenu(false);
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open"))
        setMenu(false);
    });
  }

  /* ── 3. Accordion disclosures (mobile drawer + page FAQs) ── */
  document.querySelectorAll(".acc-trigger").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var expanded = btn.getAttribute("aria-expanded") === "true";
      /* exclusive behaviour when the group opts in */
      var group = btn.closest("[data-acc-group]");
      if (group && !expanded) {
        group
          .querySelectorAll("[aria-expanded='true']")
          .forEach(function (other) {
            other.setAttribute("aria-expanded", "false");
          });
      }
      btn.setAttribute("aria-expanded", expanded ? "false" : "true");
    });
  });

  /* ── 4. Scroll reveal ─────────────────────────────────── */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -80px 0px" },
    );
    reveals.forEach(function (el) {
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ── 5. Notices department filter (home board + notices page) ── */
  document.querySelectorAll("[data-filter-group]").forEach(function (group) {
    var board = document.querySelector(group.getAttribute("data-filter-group"));
    if (!board) return;
    var chips = group.querySelectorAll(".filter-chip");
    var rows = board.querySelectorAll("[data-dept-row]");
    var countEl = board.querySelector("[data-count]");
    var totalEl = board.querySelector("[data-total]");
    var emptyEl = board.querySelector("[data-empty]");
    var labelEl = board.querySelector("[data-filter-label]");

    function apply(filter) {
      var list = board.querySelector("[data-list]");
      var max = list ? parseInt(list.getAttribute("data-max") || "0", 10) : 0;
      var matching = 0;
      var shown = 0;
      rows.forEach(function (row) {
        var hit =
          filter === "all" || row.getAttribute("data-dept-row") === filter;
        if (hit) matching++;
        var visible = hit && (max === 0 || shown < max);
        row.hidden = !visible;
        if (visible) shown++;
      });
      chips.forEach(function (chip) {
        chip.setAttribute(
          "aria-pressed",
          chip.getAttribute("data-filter") === filter ? "true" : "false",
        );
      });
      if (countEl) countEl.textContent = String(shown);
      if (totalEl) totalEl.textContent = String(matching);
      if (emptyEl) emptyEl.hidden = shown !== 0;
      if (list) list.hidden = shown === 0;
      if (labelEl) {
        var chip = group.querySelector(
          ".filter-chip[data-filter='" + filter + "']",
        );
        labelEl.textContent = chip
          ? chip.getAttribute("data-label") || chip.textContent.trim()
          : "the board";
      }
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        apply(chip.getAttribute("data-filter"));
      });
    });
  });

  /* ── 6. Certificate verification (result page) ────────── */
  var verifyForm = document.getElementById("verify-form");
  if (verifyForm) {
    var data = window.FCUB_DATA || {};
    var results = data.results || [];
    var rollInput = document.getElementById("roll-input");
    var area = document.getElementById("result-area");
    var idleTpl = document.getElementById("result-idle");

    var norm = function (s) {
      return String(s || "")
        .trim()
        .replace(/\s+/g, "")
        .toUpperCase();
    };
    var esc = function (s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[c];
      });
    };

    function showIdle() {
      area.innerHTML = "";
      if (idleTpl) {
        area.appendChild(idleTpl.content.cloneNode(true));
        area.querySelectorAll(".reveal").forEach(function (el) {
          el.classList.add("is-visible");
        });
      }
    }

    function showLoading(roll) {
      area.innerHTML =
        '<div class="flex animate-fade-up flex-col items-center border border-ink/10 bg-card px-8 py-16 text-center">' +
        '<svg class="h-8 w-8 animate-spin text-brass" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>' +
        '<p class="eyebrow mt-6 text-[0.62rem] text-clay">Consulting the Register</p>' +
        '<p class="mt-2 font-display text-xl text-forest">Checking roll&nbsp;<span class="tracking-[0.1em]">' +
        esc(roll) +
        "</span>&nbsp;…</p>" +
        "</div>";
    }

    function showMissing(roll) {
      area.innerHTML =
        '<div class="flex animate-fade-up flex-col items-center border border-dashed border-ink/25 bg-card px-8 py-16 text-center">' +
        '<span class="flex h-16 w-16 items-center justify-center border border-brass/40 bg-brass-pale/40">' +
        '<svg class="h-7 w-7 text-brass" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m13.5 8.5-5 5"/><path d="m8.5 8.5 5 5"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></span>' +
        '<p class="eyebrow mt-6 text-[0.62rem] text-clay">No Matching Record</p>' +
        '<p class="mt-3 max-w-lg font-display text-2xl leading-snug text-forest">This roll number has no record on file.</p>' +
        '<p class="mt-3 max-w-md text-sm leading-relaxed text-ink/60">No verified record matches this roll number. Check the roll and try again.</p>' +
        '<div class="mt-8 flex flex-wrap items-center justify-center gap-3">' +
        '<button type="button" data-reset class="inline-flex min-h-11 items-center gap-2 bg-forest px-6 text-[0.7rem] font-semibold tracking-widest text-paper uppercase transition-colors duration-300 hover:bg-forest-deep">' +
        '<svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>' +
        "Search again</button>" +
        '<a href="mailto:info@fcub.edu.bd" class="inline-flex min-h-11 items-center gap-2 border border-ink/15 px-6 text-[0.7rem] font-semibold tracking-widest text-forest uppercase transition-colors duration-300 hover:border-brass hover:text-brass">Contact the Controller</a>' +
        "</div></div>";
      area.querySelector("[data-reset]").addEventListener("click", reset);
    }

    function cell(label, valueHtml) {
      return (
        '<div class="bg-card px-6 py-5">' +
        '<p class="eyebrow text-[0.55rem] text-clay">' +
        label +
        "</p>" +
        '<div class="mt-2 font-display text-[1.05rem] leading-snug text-forest">' +
        valueHtml +
        "</div></div>"
      );
    }

    function showFound(r) {
      var stamp = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Dhaka",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(new Date());

      area.innerHTML =
        '<article class="relative animate-fade-up border border-ink/15 bg-card shadow-[0_30px_80px_rgba(8,33,26,0.14)]" aria-label="Verified academic record">' +
        '<div aria-hidden="true" class="pointer-events-none absolute inset-2.5 border border-brass/30"></div>' +
        '<div aria-hidden="true" class="pointer-events-none absolute -top-px -left-px h-5 w-5 border-t-2 border-l-2 border-brass"></div>' +
        '<div aria-hidden="true" class="pointer-events-none absolute -top-px -right-px h-5 w-5 border-t-2 border-r-2 border-brass"></div>' +
        '<div aria-hidden="true" class="pointer-events-none absolute -bottom-px -left-px h-5 w-5 border-b-2 border-l-2 border-brass"></div>' +
        '<div aria-hidden="true" class="pointer-events-none absolute -right-px -bottom-px h-5 w-5 border-r-2 border-b-2 border-brass"></div>' +
        '<div class="relative flex flex-wrap items-center justify-between gap-2 bg-forest px-6 py-3.5 sm:px-10">' +
        '<p class="flex items-center gap-2.5 text-[0.7rem] font-bold tracking-[0.2em] text-paper uppercase">' +
        '<svg class="h-4.5 w-4.5 text-brass-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>' +
        "Record verified — authentic</p>" +
        '<p class="text-[0.65rem] tracking-wider text-paper/60 uppercase">Checked ' +
        stamp +
        " (Dhaka)</p></div>" +
        '<div class="relative px-6 pt-12 pb-8 text-center sm:px-10">' +
        '<svg viewBox="0 0 64 72" fill="none" aria-hidden="true" class="mx-auto h-16 w-auto text-forest">' +
        '<path d="M32 2 L58 11 V38 C58 54 47 63 32 70 C17 63 6 54 6 38 V11 Z" fill="currentColor" opacity="0.08"/>' +
        '<path d="M32 2 L58 11 V38 C58 54 47 63 32 70 C17 63 6 54 6 38 V11 Z" stroke="currentColor" stroke-width="2"/>' +
        '<path d="M32 7 L54 15 V37.5 C54 51 44.5 59 32 65.5 C19.5 59 10 51 10 37.5 V15 Z" stroke="currentColor" stroke-width="0.75" opacity="0.55"/>' +
        '<text x="32" y="36" text-anchor="middle" fill="currentColor" style="font-family:Fraunces,Georgia,serif;font-size:15px;font-weight:600;letter-spacing:1px">FCUB</text>' +
        '<path d="M20 44 H44" stroke="currentColor" stroke-width="1.25" opacity="0.8"/>' +
        '<path d="M26 49 H38" stroke="currentColor" stroke-width="1" opacity="0.5"/>' +
        '<text x="32" y="58" text-anchor="middle" fill="currentColor" opacity="0.75" style="font-family:Inter,sans-serif;font-size:5px;letter-spacing:2px">CHUADANGA</text></svg>' +
        '<p class="eyebrow mt-5 text-[0.6rem] text-clay">First Capital University of Bangladesh</p>' +
        '<h3 class="mt-2 font-display text-2xl font-medium tracking-tight text-forest sm:text-3xl">Verified Academic Record</h3>' +
        '<div class="mt-4 flex items-center justify-center gap-3" aria-hidden="true"><span class="h-px w-14 bg-brass/50"></span>' +
        '<svg class="h-4 w-4 text-brass" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3.072"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m6.69 16.479 1.29 4.88a.5.5 0 0 1-.698.591l-1.843-.849a1 1 0 0 0-.88.001l-1.846.85a.5.5 0 0 1-.693-.593l1.29-4.88"/><circle cx="5" cy="14" r="3"/></svg>' +
        '<span class="h-px w-14 bg-brass/50"></span></div>' +
        '<p class="mt-6 font-display text-3xl leading-tight text-forest italic sm:text-4xl">' +
        esc(r.name) +
        "</p></div>" +
        '<div class="relative mx-6 mb-6 grid grid-cols-1 gap-px sm:mx-10 sm:grid-cols-3">' +
        cell(
          "Examination Roll",
          '<span class="font-mono text-[0.95rem] tracking-[0.08em]">' +
            esc(r.roll) +
            "</span>",
        ) +
        cell("Certificate No.", esc(r.certificateNo)) +
        cell("Session", esc(r.session)) +
        cell("Programme", esc(r.program)).replace(
          "bg-card px-6 py-5",
          "bg-card px-6 py-5 sm:col-span-3",
        ) +
        cell("Department", esc(r.department)) +
        cell("Faculty", esc(r.faculty)) +
        cell("Final Examination", esc(r.examHeld)) +
        cell("Result Declared", esc(r.resultClass)) +
        cell(
          "CGPA",
          '<span class="text-2xl">' +
            Number(r.cgpa).toFixed(2) +
            '</span><span class="ml-1 font-sans text-sm text-clay">/ 4.00</span>',
        ) +
        cell("Year of Passing", esc(r.passingYear)) +
        "</div>" +
        '<div class="relative flex flex-col items-center justify-between gap-4 border-t border-ink/10 bg-paper-deep/60 px-6 py-5 sm:flex-row sm:px-10">' +
        '<p class="max-w-md text-[0.7rem] leading-relaxed text-clay">Generated live from the examination register of First Capital University of Bangladesh. For a sealed, signed verification letter, write to ' +
        '<a href="mailto:info@fcub.edu.bd" class="text-forest underline decoration-brass/50 underline-offset-2 hover:text-brass">info@fcub.edu.bd</a>.</p>' +
        '<div class="flex shrink-0 items-center gap-2">' +
        '<button type="button" data-print class="inline-flex min-h-11 items-center gap-2 border border-ink/15 px-4 py-2 text-[0.68rem] font-semibold tracking-widest text-forest uppercase transition-colors duration-300 hover:border-brass hover:text-brass">' +
        '<svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>' +
        "Print</button>" +
        '<button type="button" data-reset class="inline-flex min-h-11 items-center gap-2 bg-forest px-4 py-2 text-[0.68rem] font-semibold tracking-widest text-paper uppercase transition-colors duration-300 hover:bg-forest-deep">' +
        '<svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>' +
        "Verify another</button></div></div></article>";

      area.querySelector("[data-print]").addEventListener("click", function () {
        window.print();
      });
      area.querySelector("[data-reset]").addEventListener("click", reset);
    }

    function reset() {
      if (rollInput) rollInput.value = "";
      showIdle();
      if (rollInput) rollInput.focus();
    }

    var loadingTimer = null;
    function lookup(value) {
      var q = String(value || "").trim();
      if (!q) return;
      showLoading(q);
      /* a deliberate pause so the register lookup still feels considered */
      if (loadingTimer) window.clearTimeout(loadingTimer);
      loadingTimer = window.setTimeout(function () {
        var hit = null;
        for (var i = 0; i < results.length; i++) {
          if (norm(results[i].roll) === norm(q)) {
            hit = results[i];
            break;
          }
        }
        if (hit) showFound(hit);
        else showMissing(q);
      }, 700);
    }

    verifyForm.addEventListener("submit", function (e) {
      e.preventDefault();
      lookup(rollInput ? rollInput.value : "");
    });
    if (rollInput) {
      rollInput.addEventListener("input", function () {
        rollInput.value = rollInput.value.toUpperCase();
      });
    }
    document.querySelectorAll("[data-sample-roll]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (rollInput) rollInput.value = btn.getAttribute("data-sample-roll");
        lookup(btn.getAttribute("data-sample-roll"));
      });
    });
  }

  /* ── 7. Contact form — static demo (no backend) ───────── */
  var contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }
      var success = document.getElementById("contact-success");
      contactForm.hidden = true;
      if (success) {
        success.hidden = false;
        success.classList.add("animate-fade-up");
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
    var again = document.getElementById("contact-again");
    if (again) {
      again.addEventListener("click", function () {
        contactForm.reset();
        contactForm.hidden = false;
        var success = document.getElementById("contact-success");
        if (success) success.hidden = true;
      });
    }
  }

  /* ── 8. Footer year ───────────────────────────────────── */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
