//Last update: 24/11/2025

// Usage
initializeDraggableForElements(
    ".contact_mobile_nav_contain",
    ".contact_mobile_nav_layout",
    ".button_main_wrap",
    0, 767,
    {
      arrows: false
    }
  );


  


///////////////////////////////
/// FAQ CREATE LINKS TO SECTION
//////////////////////////////

(function () {
    "use strict";
    
    function slugify(text) {
      return (text || "")
      .toString()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    }
    
    function makeUniqueSlug(base, existingSet) {
      let slug = base || "section";
      let i = 2;
      while (existingSet.has(slug)) {
        slug = `${base}-${i++}`;
      }
      existingSet.add(slug);
      return slug;
    }
    
    function ready(fn) {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", fn);
      } else {
        fn();
      }
    }
    
    ready(function () {
      const categorySelector = ".faq_category_wrap";
      const titleSelector = ".main_h2_text";
      const anchorClass = "anchor_link";
      const buttonListSelector = ".faq_btn_list_1_collection_list";
      const buttonItemSelector = ".button_main_wrap";
      const buttonLinkSelector = "a";
      
      const categories = Array.from(document.querySelectorAll(categorySelector));
      const buttonList = document.querySelector(buttonListSelector);
      const buttons = buttonList
      ? Array.from(buttonList.querySelectorAll(buttonItemSelector))
      : [];
      
      const existingIds = new Set(
        Array.from(document.querySelectorAll("[id]")).map((el) => el.id)
      );
      const slugs = [];
      
      categories.forEach((catEl, idx) => {
        const titleEl = catEl.querySelector(titleSelector);
        const raw = titleEl ? titleEl.textContent : "";
        const baseSlug = slugify(raw) || `section-${idx + 1}`;
        const uniqueSlug = makeUniqueSlug(baseSlug, existingIds);
        slugs.push(uniqueSlug);
        
        const anchor = document.createElement("div");
        anchor.className = anchorClass;
        anchor.id = uniqueSlug;
        
        if (catEl.firstChild) {
          catEl.insertBefore(anchor, catEl.firstChild);
        } else {
          catEl.appendChild(anchor);
        }
      });
      
      const pairsCount = Math.min(buttons.length, slugs.length);
      
      for (let i = 0; i < pairsCount; i++) {
        const btnWrap = buttons[i];
        const link = btnWrap.querySelector(buttonLinkSelector);
        const targetSlug = slugs[i];
        if (!link) continue;
        link.setAttribute("href", `#${targetSlug}`);
      }
    });
  })();
  

///////////////////////////////
/// FAQ DRAGGABLE ITEMS
//////////////////////////////


initializeDraggableForElements(
    ".faq_btn_list_wrap",
    ".faq_btn_list_1_collection_list",
    ".faq_btn_list_1_collection_item",
    0, 767, 
    {
      arrows: false
    }
  );
  

///////////////////////////////
/// TOGGLE FAQ BTN LIST WRAP
//////////////////////////////

ScrollTrigger.create({
    trigger: ".faq_btn_list_wrap",      // element that triggers
    start: "top-=56px top",     // when top of .target hits center of viewport
    endTrigger: "footer",           // different element for end
    end: "bottom+=200px bottom",               // when top of .footer hits bottom of viewport
    toggleClass: { 
      targets: ".faq_btn_list_wrap",    // element(s) to apply the class on
      className: "active" 
    },
    // markers: true // remove when done, just to debug
  });
  

///////////////////////////////
/// CONTACT MOBILE ONLY SNAPPING
//////////////////////////////


// ----- Mobile-only automatic nav snapping to the left-aligned button -----
(() => {
    // set your mobile breakpoint (adjust if you want)
    const MOBILE_MAX = 767; // <= Webflow tablet breakpoint by default
    const isMobile = window.innerWidth <= MOBILE_MAX;
    if (!isMobile) return;
  
    const wrap = document.querySelector(".faq_btn_list_wrap");
    const listEl = wrap?.querySelector(".faq_btn_list_1_collection_list");
    if (!wrap || !listEl) return;
  
    // helper that uses the state exposed by the draggable initializer
    const goToIndexMobile = (index) => {
      const st = listEl._dragState; // set by the helper tweak above
      if (!st) return;
  
      // if draggable is disabled (fits), do nothing
      if ((st.minX === 0 && st.maxX === 0) || !st.snapPoints?.length) return;
  
      const target = gsap.utils.clamp(st.minX, st.maxX, Math.round(st.snapPoints[index] || 0));
      gsap.to(listEl, { x: target, duration: 0.45, ease: "power3.out" });
    };
  
    // Create a ScrollTrigger for each content block (same order as buttons)
    const sections = gsap.utils.toArray(".faq_category_wrap");
    sections.forEach((section, i) => {
      ScrollTrigger.create({
        trigger: section,
        start: "top 33%",
        end: "bottom 66%",
        onEnter: () => goToIndexMobile(i),
        onEnterBack: () => goToIndexMobile(i),
        // markers: true,
      });
    });
  
    // after dynamic layout changes, ensure triggers are correct
    ScrollTrigger.refresh();
  })();
  



///////////////////////////////
/// FORM
//////////////////////////////
document.addEventListener("DOMContentLoaded", () => {
    if (typeof gsap === "undefined") {
      console.warn("[contact-select] GSAP not found, aborting script.");
      return;
    }
  
    // --- Hidden inputs (already in HTML) ---
    const realCategory   = document.getElementById("realCategory");
    const realRestaurant = document.getElementById("realRestaurant");
    const realStoreId    = document.getElementById("realStoreId");
  
    // Helper: toggle requirement/disabled for the (hidden) restaurant select
    const setRestaurantRequired = (shouldRequire) => {
      if (!realRestaurant) return;
  
      if (shouldRequire) {
        realRestaurant.disabled = false;
        realRestaurant.required = true;
        realRestaurant.setAttribute("aria-hidden", "false");
        console.log("[contact-select] Restaurant is now required/enabled.");
      } else {
        realRestaurant.required = false;
        realRestaurant.disabled = true;
        realRestaurant.setAttribute("aria-hidden", "true");
        // Clear values when not required / not used
        realRestaurant.value = "";
        realRestaurant.dispatchEvent(new Event("change", { bubbles: true }));
        if (realStoreId) {
          realStoreId.value = "";
          realStoreId.dispatchEvent(new Event("change", { bubbles: true }));
        }
        console.log("[contact-select] Restaurant disabled + cleared (no longer required).");
      }
    };
  
    // --- Reset hidden values at start ---
    if (realCategory) realCategory.value = "";
    if (realRestaurant) realRestaurant.value = "";
    if (realStoreId) {
      realStoreId.value = "";
      realStoreId.dispatchEvent(new Event("change", { bubbles: true }));
    }
    // Start with restaurant NOT required (since UI is hidden)
    setRestaurantRequired(false);
  
    const setHumanReadable = (el, label) => {
      if (!el) return;
      if (el.tagName === "SELECT") {
        let opt = el.querySelector(`option[value="${CSS.escape(label)}"]`);
        if (!opt) {
          opt = document.createElement("option");
          opt.value = label;
          opt.textContent = label;
          el.appendChild(opt);
        } else if (opt.textContent !== label) {
          opt.textContent = label;
        }
        el.value = label;
        el.dispatchEvent(new Event("change", { bubbles: true }));
      } else {
        el.value = label || "";
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }
    };
  
    const instances = [];
    const isActivateYes = (val) =>
      val && ["yes", "true", "1"].includes(String(val).trim().toLowerCase());
  
    // Hide restaurant-choice at start
    const restaurantChoiceWraps = gsap.utils.toArray('[data-list-type="restaurant-choice"]');
    restaurantChoiceWraps.forEach((el) => el.classList.remove("isVisible"));
  
    gsap.utils.toArray(".contact_form_select_wrap").forEach((wrap) => {
      const toggle      = wrap.querySelector(".select_toggle_wrap");
      const toggleLabel = toggle?.querySelector("p");
      const icon        = toggle?.querySelector(".select_toggle_icon_wrap");
      const list        = wrap.querySelector(".select_list_wrap");
      const options     = wrap.querySelectorAll(".select_collection_item");
      if (!toggle || !list) return;
  
      const isCategorySelect =
        wrap.matches('[data-list-wrap="category"]') ||
        !!wrap.querySelector("[data-activate-choice]");
  
      gsap.set(list, { height: 0, opacity: 0, overflow: "hidden" });
  
      const tl = gsap.timeline({
        paused: true,
        defaults: { duration: 0.25, ease: "power2.out" }
      });
      tl.to(list, { height: "auto", opacity: 1 }, 0);
      if (icon) tl.to(icon, { rotate: 180 }, 0);
  
      const inst = {
        wrap,
        toggle,
        tl,
        isOpen: false,
        open() {
          this.toggle.classList.add("opened");
          this.tl.play(0);
          this.isOpen = true;
        },
        close() {
          this.tl.reverse();
        }
      };
  
      tl.eventCallback("onReverseComplete", () => {
        inst.toggle.classList.remove("opened");
        inst.isOpen = false;
      });
  
      // Toggle click
      toggle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        inst.isOpen ? inst.close() : inst.open();
      });
  
      // Option click — update category / restaurant / storeId
      options.forEach((opt) => {
        opt.addEventListener("click", (e) => {
          e.stopPropagation();
          const label =
            opt.querySelector("p")?.textContent?.trim() ||
            opt.textContent?.trim() ||
            "";
  
          if (label && toggleLabel) toggleLabel.textContent = label;
  
          if (isCategorySelect) {
            // --- CATEGORY SELECT ---
            setHumanReadable(realCategory, label);
  
            // Does this category require a restaurant?
            const host = opt.matches("[data-activate-choice]")
              ? opt
              : opt.querySelector("[data-activate-choice]");
            const raw = host?.getAttribute?.("data-activate-choice");
            const needsRestaurant = raw != null ? isActivateYes(raw) : false;
  
            // Show/hide the restaurant-choice UI
            restaurantChoiceWraps.forEach((el) =>
              el.classList.toggle("isVisible", needsRestaurant)
            );
  
            // Reset restaurant + store, and toggle required state accordingly
            setHumanReadable(realRestaurant, "");
            if (realStoreId) {
              realStoreId.value = "";
              realStoreId.dispatchEvent(
                new Event("change", { bubbles: true })
              );
            }
            setRestaurantRequired(needsRestaurant);
          } else {
            // --- RESTAURANT SELECT ---
            // User picked a restaurant -> set readable name + store UUID
            setHumanReadable(realRestaurant, label);
  
            if (realStoreId) {
              const storeUuid = opt.getAttribute("data-store-id") || "";
              realStoreId.value = storeUuid;
              realStoreId.dispatchEvent(
                new Event("change", { bubbles: true })
              );
              console.log("[contact-select] realStoreId set to:", storeUuid);
            }
  
            // IMPORTANT:
            // Do NOT call setRestaurantRequired(false) here.
            // That helper clears and disables the field, which was wiping the value.
            // If you ever want to relax validation after a valid choice, do it without clearing:
            // if (realRestaurant) realRestaurant.required = false;
          }
  
          inst.close();
        });
      });
  
      instances.push(inst);
    });
  
    // Extra safety: before submit, if restaurant select is disabled, make sure it's not required
    const form = document.querySelector("form");
    if (form) {
      form.addEventListener("submit", () => {
        if (realRestaurant && realRestaurant.disabled) {
          realRestaurant.required = false;
        }
      });
    }
  
    // Close dropdowns on outside click / ESC
    document.addEventListener("click", () => {
      instances.forEach((inst) => inst.isOpen && inst.close());
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        instances.forEach((inst) => inst.isOpen && inst.close());
      }
    });
  });
  
  



///////////////////////////////
/// FORM WEBHOOK
//////////////////////////////


document.addEventListener("DOMContentLoaded", () => {
    // Adjust this selector if you have multiple forms; using the webhook domain is convenient:
    const form = document.querySelector('form[action^="https://hook.eu2.make.com/0244f37n8e6o91kc78udcm1z2kzizop6"]');
    if (!form) return;
  
    const wrap = form.closest(".w-form") || form.parentElement;
    const successEl = wrap?.querySelector(".contact_form_success_wrap");
    const failEl = wrap?.querySelector(".contact_form_fail_wrap");
    const submitBtn = form.querySelector('[type="submit"]');
  
    form.addEventListener("submit", async (e) => {
      // Let the browser show native "Please fill out this field" messages
      if (!form.checkValidity()) {
        e.preventDefault();
        form.reportValidity();
        return;
      }
  
      e.preventDefault(); // stop the redirect
      if (submitBtn) submitBtn.disabled = true;
  
      try {
        // Send as application/x-www-form-urlencoded (Make parses this nicely)
        const body = new URLSearchParams(new FormData(form));
        const method = (form.getAttribute("method") || "POST").toUpperCase();
  
        const resp = await fetch(form.action, {
          method,
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body
        });
  
        if (!resp.ok) throw new Error(`Webhook responded ${resp.status} ${resp.statusText}`);
  
        // Success: hide form, show Webflow success state
        if (failEl) failEl.style.display = "none";
        if (successEl) successEl.style.display = "block";
        form.style.display = "none";
  
        // Optional: reset the form (and your custom UI if you want)
        form.reset();
        // TODO: if you want, also reset your fake selects / GSAP UI here.
  
      } catch (err) {
        console.error("Submit failed:", err);
        if (successEl) successEl.style.display = "none";
        if (failEl) failEl.style.display = "block";
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  });
  
  
  ///////////////////////////////
  /// OPEN CONTACT FORM
  //////////////////////////////
  
  document.addEventListener("DOMContentLoaded", () => {
    if (typeof gsap === "undefined") return;
  
    const wrap   = document.querySelector(".contact_form_wrap");
    const bg     = document.querySelector(".contact_form_bg");
    const layout = document.querySelector(".contact_form_layout");
  
    if (!wrap || !bg || !layout) {
      console.warn("[contact-form] Missing one of .contact_from_wrap / .contact_form_bg / .contact_form_layout");
      return;
    }
  
    // Master timeline (paused; start reversed so .play() = open, .reverse() = close)
    const tl = gsap.timeline({ paused: true});
  
    // TODO: add your own animations here
    tl
      // Make wrapper interactive/visible
      .set(wrap, { autoAlpha: 1, pointerEvents: "auto" }, 0)
      // Background animation (example placeholders—replace with your values)
      .fromTo(bg, { autoAlpha: 0 }, { autoAlpha: 1 }, 0)
  
      // Layout animation (example placeholders—replace with your values)
      .fromTo(layout, { xPercent: 100, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1 }, 0)
    ;
  
    // Start reversed so first toggle opens
    tl.pause(0).reversed(true); // no motion, but now tl.play() = open, tl.reverse() = close
  
    // Helpers
    const openForm  = () => { if (tl.reversed()) tl.play(); };
    const closeForm = () => { if (!tl.reversed()) tl.reverse(); };
  
    // Open triggers (many on the page)
    document.querySelectorAll('[data-action="open-contact-form"]').forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation(); // don’t let the outside-click handler fire
        openForm();
        lockScroll();
      });
    });
  
    // Close trigger button
    document.querySelectorAll('[data-action="close-contact-form"]').forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeForm();
        unlockScroll();
      });
    });
  
    // Click outside: reverse timeline if click is not inside the layout
    document.addEventListener("click", (e) => {
      if (tl.reversed()) return; // already closed
      if (layout.contains(e.target)) return; // clicked inside the form—ignore
      closeForm();
      unlockScroll();
    });
  
    // Optional: ESC to close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeForm();
      unlockScroll();
    });
  
    // Expose for debugging (optional)
    window.__contactFormTL__ = tl;
  });
  
  

///////////////////////////////
/// FORM CONTACT DISPLAY
//////////////////////////////


document.addEventListener("DOMContentLoaded", () => {
  // Adjust this selector if you have multiple forms; using the webhook domain is convenient:
  const form = document.querySelector('form[action^="https://send-to-clickup.communication-ddb.workers.dev/"]');
  if (!form) return;

  const wrap = form.closest(".w-form") || form.parentElement;
  const successEl = wrap?.querySelector(".w-form-done");
  const failEl = wrap?.querySelector(".w-form-fail");
  const submitBtn = form.querySelector('[type="submit"]');

  form.addEventListener("submit", async (e) => {
    // Let the browser show native "Please fill out this field" messages
    if (!form.checkValidity()) {
      e.preventDefault();
      form.reportValidity();
      return;
    }

    e.preventDefault(); // stop the redirect
    if (submitBtn) submitBtn.disabled = true;

    try {
      // Send as application/x-www-form-urlencoded (Make parses this nicely)
      const body = new URLSearchParams(new FormData(form));
      const method = (form.getAttribute("method") || "POST").toUpperCase();

      const resp = await fetch(form.action, {
        method,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body
      });

      if (!resp.ok) throw new Error(`Webhook responded ${resp.status} ${resp.statusText}`);

      // Success: hide form, show Webflow success state
      if (failEl) failEl.style.display = "none";
      if (successEl) successEl.style.display = "block";
      form.style.display = "none";

      // Optional: reset the form (and your custom UI if you want)
      form.reset();
      // TODO: if you want, also reset your fake selects / GSAP UI here.

    } catch (err) {
      console.error("Submit failed:", err);
      if (successEl) successEl.style.display = "none";
      if (failEl) failEl.style.display = "block";
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
});