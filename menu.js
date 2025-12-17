//Last update: 24/11/2025

///////////////////////////////
/// MENU IMMERSIF
///////////////////////////////

document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll('[data-menu-immersif-block]').forEach(block => {
      if (block.querySelector('.w-dyn-empty')) {
        block.remove();
      }
    });
  });
  
  ///////////////////////////////
  /// DO NOT DISPLAY TAG LIST IF EMPTY
  ///////////////////////////////
  
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".menu_tag_list_wrap").forEach(el => {
      // hide only if completely empty (no children)
      if (el.children.length === 0) {
        el.style.display = "none";
      }
    });
  });
  
  ///////////////////////////////
  /// DO NOT DISPLAY WINE YEAR IF EMPTY
  ///////////////////////////////
  
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".menu_item_wine_tag").forEach(el => {    
      const hasText = el.textContent.trim().length > 0;
  
      if (!hasText) {
        el.style.display = "none";
      }
    });
  });


///////////////////////////////
/// DO NOT DISPLAY DESCRIPTION IF EMPTY
///////////////////////////////
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".menu_item_desccription_wrap").forEach(wrap => {
      const rich = wrap.querySelector(".plat_description_rich_text");
      if (!rich) return;
  
      // Get text content WITHOUT counting empty tags, <br>, spaces, etc.
      const text = rich.textContent.trim();
  
      if (text.length === 0) {
        wrap.style.display = "none";
      }
    });
  });
  
  

///////////////////////////////
/// CREATE ALL THE BUTTONS WITH RIGHT ID
//////////////////////////////

document.addEventListener("DOMContentLoaded", () => {
    const contentWrap = document.querySelector(".menu_content_wrap");
    const blockWraps = contentWrap ? contentWrap.querySelectorAll(".menu_block_wrap:not([data-avoid-block='true']):not([data-availability='no'])") : [];
    const navLayout = document.querySelector(".menu_nav_list_layout");
    const buttonTemplate = navLayout ? navLayout.querySelector(".button_main_wrap") : null;
  
    if (!contentWrap || !blockWraps.length || !navLayout || !buttonTemplate) return;
  
    const slugify = (text) =>
      text.toString().toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
        .replace(/\-\-+/g, "-");
  
    blockWraps.forEach((block, index) => {
      const h2 = block.querySelector(".main_h2_text");
      const h2Text = h2 ? h2.textContent.trim() : `block-${index + 1}`;
      const slug = slugify(h2Text);
  
      const anchor = document.createElement("div");
      anchor.classList.add("anchor_link");
      anchor.id = slug;
      block.insertBefore(anchor, block.firstChild);
  
      const newButton = buttonTemplate.cloneNode(true);
  
      const btnText = newButton.querySelector(".button_main_text");
      if (btnText) btnText.textContent = h2Text;
  
      const clickable = newButton.querySelector(".clickable_link");
      if (clickable) clickable.setAttribute("href", `#${slug}`);
  
      navLayout.appendChild(newButton);
    });
  
    buttonTemplate.remove();
  
    initializeDraggableForElements(
      ".menu_nav_list_inner_contain[data-draggable='true']",
      ".menu_nav_list_layout",
      ".button_main_wrap",
      0,
      Infinity,
      {
        arrows: {
          wrap: ".menu_nav_list_arrow_wrap",
          item: ".menu_nav_list_arrow_item"
        }
      }
    );
  });
  
  
  
  // ----- Mobile-only automatic nav snapping to the left-aligned button -----
  (() => {
    // set your mobile breakpoint (adjust if you want)
    const MOBILE_MAX = 991; // <= Webflow tablet breakpoint by default
    const isMobile = window.innerWidth <= MOBILE_MAX;
    if (!isMobile) return;
  
    const wrap = document.querySelector(".menu_nav_list_inner_contain[data-draggable='true']");
    const listEl = wrap?.querySelector(".menu_nav_list_layout");
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
    const sections = gsap.utils.toArray(".menu_block_wrap:not([data-avoid-block='true'])");
    sections.forEach((section, i) => {
      ScrollTrigger.create({
        trigger: section,
        start: "top center",
        end: "bottom center",
        onEnter: () => goToIndexMobile(i),
        onEnterBack: () => goToIndexMobile(i),
        // markers: true,
      });
    });
  
    // after dynamic layout changes, ensure triggers are correct
    ScrollTrigger.refresh();
  })();
  


///////////////////////////////
/// MONTRER LES ALLERGENES
//////////////////////////////

document.addEventListener("DOMContentLoaded", () => {
    // 1) PRUNE EMPTY ALLERGEN WRAPPERS
    const wraps = Array.from(document.querySelectorAll(".menu_item_allergenes_wrap"));
  
    // Helper: is a node "meaningfully empty"?
    const hasMeaningfulText = (el) => {
      // remove whitespace incl. non-breaking space \u00A0
      const strip = (s) => s.replace(/[\s\u00A0]+/g, "");
      // Look at text of the whole wrapper, but you can restrict to <p> if you prefer.
      const text = strip(el.textContent || "");
      // If you ONLY want to consider <p>, uncomment below:
      // const text = strip(Array.from(el.querySelectorAll("p"))
      //   .map(p => p.textContent || "")
      //   .join(" "));
      return text.length > 0;
    };
  
    wraps.forEach((wrap) => {
      if (!hasMeaningfulText(wrap)) {
        // Option A (recommended): remove from DOM to avoid layout flicker later
        wrap.remove();
        // Option B: hide instead (if you must keep nodes)
        // wrap.dataset.allergenPruned = "true";
        // wrap.style.display = "none";
      } else {
        wrap.dataset.allergenPruned = "false";
      }
    });
  
    // 2) TOGGLE LOGIC (handles multiple buttons + ScrollTrigger refresh)
    const buttons = Array.from(document.querySelectorAll("[data-show-allergen='true']"));
    if (!buttons.length) return;
  
    const lang = (document.documentElement.getAttribute("lang") || "fr").toLowerCase();
    const toggleText = lang === "en" ? "Hide allergens" : "Cacher les allergènes";
  
    const getBtnTextEl = (btn) => btn.querySelector(".button_main_text");
    const originals = new Map(
      buttons.map((btn) => [btn, (getBtnTextEl(btn)?.textContent || "").trim()])
    );
  
    let allergensVisible = false; // shared state
  
    const refreshScrollTriggers = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (window.ScrollTrigger && typeof ScrollTrigger.refresh === "function") {
            ScrollTrigger.refresh();
          }
        });
      });
    };
  
    const applyState = (visible) => {
      // Only target remaining (non-removed) wrappers
      const liveWraps = document.querySelectorAll(".menu_item_allergenes_wrap");
      liveWraps.forEach((el) => {
        el.style.display = visible ? "block" : "none";
      });
  
      buttons.forEach((btn) => {
        const textEl = getBtnTextEl(btn);
        if (textEl) textEl.textContent = visible ? toggleText : (originals.get(btn) || "");
        btn.classList.toggle("is-active", visible);
        btn.setAttribute("aria-pressed", String(visible));
      });
  
      refreshScrollTriggers();
    };
  
    // Initialize (hidden by default)
    applyState(allergensVisible);
  
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        allergensVisible = !allergensVisible;
        applyState(allergensVisible);
      });
    });
  });
  



///////////////////////////////
/// ACCORD METS/VINS
//////////////////////////////
const accordItems = document.querySelectorAll('.menu_item_accord_met_vin_wrap');

if (accordItems.length > 0) {
  accordItems.forEach((item) => {
    // --- 1. Update link destinations ---
    const clickableWraps = item.querySelectorAll('.clickable_wrap');
    clickableWraps.forEach((wrap) => {
      const destination = wrap.getAttribute('data-link-destination');
      const link = wrap.querySelector('a');
      if (destination && link) {
        link.setAttribute('href', `#${destination}`);
      }
    });

    // // --- 2. Hide if paragraph is empty ---
    // const textWrap = item.querySelector('.accord_met_vin_text_wrap p');
    // if (textWrap && textWrap.textContent.trim() === '') {
    //   item.style.setProperty('display', 'none', 'important');
    // }
  });
}


// Helper: preserve the original case style when replacing (e.g., Show -> Hide, MONTRER -> CACHER)
function preserveCase(replacement, match) {
  if (match === match.toUpperCase()) return replacement.toUpperCase();
  if (match[0] === match[0].toUpperCase()) return replacement[0].toUpperCase() + replacement.slice(1);
  return replacement.toLowerCase();
}

// Helper: swap words using a map (case-insensitive, word-boundary safe)
function swapWords(str, map) {
  let out = str;
  for (const [from, to] of Object.entries(map)) {
    const re = new RegExp(`\\b${from}\\b`, 'gi');
    out = out.replace(re, (m) => preserveCase(to, m));
  }
  return out;
}

const accordButtons = document.querySelectorAll('.button_main_wrap[data-action="accord-met-vin"]');

if (accordButtons.length > 0) {
  accordButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const layout = btn.closest('.menu_block_layout');
      if (!layout) return;

      const items = layout.querySelectorAll('.menu_item_accord_met_vin_wrap');
      const isNowActive = !btn.classList.contains('is-active'); // toggling to this state

      // Toggle state on button
      btn.classList.toggle('is-active', isNowActive);
      btn.setAttribute('aria-expanded', String(isNowActive));

      // Toggle active class on all accord items in this layout
      items.forEach((it) => it.classList.toggle('active', isNowActive));

      // Update the button label
      const labelEl = btn.querySelector('.button_main_text') || btn;
      const currentText = labelEl.textContent || '';

      const newText = isNowActive
        ? swapWords(currentText, { montrer: 'cacher', show: 'hide' })
        : swapWords(currentText, { cacher: 'montrer', hide: 'show' });

      labelEl.textContent = newText;
    });
  });
}
