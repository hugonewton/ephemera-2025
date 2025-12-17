//LAST UPDATE: 03/12/2025

///////////////////////////////
/// REGISTER GSAP PLUGINS
///////////////////////////////

document.addEventListener("DOMContentLoaded", (event) => {
    gsap.registerPlugin(CustomEase);    
    gsap.registerPlugin(Draggable);
    gsap.registerPlugin(InertiaPlugin);
    gsap.registerPlugin(SplitText);    
    gsap.defaults({
      ease: "power2.out",
      duration: 0.3,
    });
    
    CustomEase.create(
      "customBack",
      "M0,0 C0.126,0.382 0.139,1.139 0.352,1.197 0.668,1.282 0.862,1.11 1,1"
    );
  });


///////////////////////////////
/// PREVENT FLLICKER
///////////////////////////////

Promise.all([
    new Promise(resolve => window.addEventListener("DOMContentLoaded", resolve)),
    document.fonts.ready
  ]).then(() => {
    gsap.set('[data-prevent-flicker="true"]', {
      visibility: "visible"
    });
  });

//////////////////////////////
/// SETUP LENIS
///////////////////////////////

const lerpValue = 0.1; // Set your custom lerp value here
const lenis = new Lenis({ lerp: lerpValue });

lenis.on("scroll", ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

$("[data-lenis-start]").on("click", function () {
  unlockScroll();
});
$("[data-lenis-stop]").on("click", function () {
  lockScroll();
});
$("[data-lenis-toggle]").on("click", function () {
  $(this).toggleClass("stop-scroll");
  if ($(this).hasClass("stop-scroll")) {
    lockScroll();
  } else {
    unlockScroll();
  }
});


///////////////////////////////
/// LOCK SCROLL FUNCTION
///////////////////////////////

// === Scroll lock utilities ===

// Keep references for cleanup
const lockedKeys = new Set([
  "Space", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"
]);

function preventWheel(e)  { e.preventDefault(); }
function preventTouch(e)  { e.preventDefault(); }
function preventKeys(e)   { if (lockedKeys.has(e.code)) e.preventDefault(); }

// Main functions
function lockScroll() {
  // Stop Lenis smooth scroll if present
  lenis.stop();

  // Keep scrollbar visible
  document.documentElement.style.overflowY = "scroll";

  // Block scrolling interactions
  window.addEventListener("wheel", preventWheel, { passive: false });
  window.addEventListener("touchmove", preventTouch, { passive: false });
  window.addEventListener("keydown", preventKeys, { passive: false });
}

function unlockScroll() {
  // Unblock interactions
  window.removeEventListener("wheel", preventWheel, { passive: false });
  window.removeEventListener("touchmove", preventTouch, { passive: false });
  window.removeEventListener("keydown", preventKeys, { passive: false });

  // Restart Lenis
  lenis.start();

  // Restore default scroll behavior
  document.documentElement.style.overflowY = "";
}



///////////////////////////////
/// ANIMATION TO PLAY ON MOUSE ENTER FOR EACH
///////////////////////////////

if (window.matchMedia("(min-width: 768px)").matches) {
  const navLinkWrap = document.querySelectorAll(".nav_link_item_wrap");
  const navLinkTranslate = "-0.66em";

  navLinkWrap.forEach(function (el) {
    let svg = el.querySelector(".nav_link_item_svg_wrap");
    let p = el.querySelector("p");
    let tlNavLink = gsap.timeline({ paused: true });

    tlNavLink
      .from(p, {
        x: navLinkTranslate,
        duration: 0.6,
      })
      .from(
        svg,
        {
          x: navLinkTranslate,
          opacity: 0,
          duration: 0.6,
        },
        "<.1"
      );

    el.addEventListener("mouseenter", function () {
      tlNavLink.play(); // tl_in on mouseenter
    });

    el.addEventListener("mouseleave", function () {
      tlNavLink.reverse(); // tl_out on mouseleave
    });
  });
}



///////////////////////////////
/// TOGGLE ANIMATION
///////////////////////////////

let isTimelinePlaying = false;
let tlHamburger = gsap.timeline({ paused: true });

tlHamburger
  .to(".burger_line.second_line", { scaleX: 0 })

  .to(".burger_line.first_line", { y: 0 }, "<")
  .to(".burger_line.third_line", { y: 0 }, "<")
  
  .to(".burger_line.first_line", { rotate: 45 }, "<.1")
  .to(".burger_line.third_line", { rotate: -45 }, "<")
  
  .set(".nav_menu_wrap", { pointerEvents: "auto", zIndex: 9 }, "<")

  // Astuce: set display puis fade (évite les à-coups)
  .set(".nav_menu_overlay", { display: "block" }, "<")
  .from(".nav_menu_overlay", { opacity: 0 }, "<")

  // Si possible, préfère un fromTo et ne termine pas sur 0% pile
  .fromTo(".nav_menu_layout",
    { clipPath: "inset(0 100% 0 0)" },
    { clipPath: "inset(0 0.1% 0 0)", duration: 0.6, ease: "power2.out" },
    "<"
  )

  .fromTo(".nav_menu_wrap .nav_link_item_wrap",
    { clipPath: "inset(0 100% 0 0)" },
    { clipPath: "inset(0 0.1% 0 0)", stagger: 0.05, duration: 0.6 },
    "<"
  );

// Helpers
const burger   = document.querySelector(".burger_wrap");
const contain  = document.querySelector(".nav_menu_contain");
const layout   = document.querySelector(".nav_menu_layout");

function openMenu() {
  isTimelinePlaying = true;
  tlHamburger.timeScale(1).play();
}
function closeMenu(speed = 2) {
  isTimelinePlaying = false;
  tlHamburger.timeScale(speed).reverse();
}

// Toggle via le burger
burger.addEventListener("click", () => {
  if (!isTimelinePlaying) {
    lockScroll();   // ⬅️ stop smooth scrolling when opening menu
    openMenu();
  } else {
    closeMenu(2);
    unlockScroll();
  }
});

// Fermer si on clique dans .nav_menu_contain MAIS PAS dans .nav_menu_layout
contain.addEventListener("click", (e) => {
  if (!layout.contains(e.target)) {
    closeMenu(2);
    unlockScroll();
  }
});



///////////////////////////////
/// FORM DANS LA NEWSLETTER
///////////////////////////////

document.addEventListener("DOMContentLoaded", function() {
    // Sélectionne tous les boutons "new"
    const newButtons = document.querySelectorAll("[click-new]");
  
    newButtons.forEach(newBtn => {
      newBtn.addEventListener("click", function(e) {
        e.preventDefault(); // Empêche le comportement natif si nécessaire
  
        // Récupère la valeur de l'attribut
        const id = newBtn.getAttribute("click-new");
  
        // Trouve le bouton correspondant avec le même id
        const oldBtn = document.querySelector(`[click-old="${id}"]`);
  
        // S'il existe, on déclenche son clic
        if (oldBtn) {
          oldBtn.click();
        }
      });
    });
  });



///////////////////////////////
/// MAIN CTA
///////////////////////////////

gsap.matchMedia().add("(min-width: 768px)", () => {
  const buttonMainWrap = document.querySelectorAll(".button_main_wrap[data-icon-visibility='true']");
  const buttonArrowTranslate = "1em";
  const buttonArrowTranslateNegative = "-1em";

  buttonMainWrap.forEach(function (el) {
    let firstArrow = el.querySelector(".button_main_svg_wrap.first_icon");
    let secondArrow = el.querySelector(".button_main_svg_wrap:not(.first_icon)");
    let text = el.querySelector(".button_main_text");
    let tlMainButton = gsap.timeline({ paused: true });

    tlMainButton
      .to(secondArrow, { x: buttonArrowTranslate, opacity: 0 }, "<")
      .to(text, { x: buttonArrowTranslate }, "<")
      .from(firstArrow, { x: buttonArrowTranslateNegative }, "<+.1")
      .to(firstArrow, { opacity: 1 }, "<");

    el.addEventListener("mouseenter", () => tlMainButton.play());
    el.addEventListener("mouseleave", () => tlMainButton.reverse());
  });
});

///////////////////////////////
/// IFFRAME RESA
///////////////////////////////

document.addEventListener("DOMContentLoaded", () => {
  const resaBtns = document.querySelectorAll("[data-resa]");
  const iframeResa = document.querySelector(".iframe_resa_embed iframe");
  const iframeWrap = document.querySelector(".iframe_resa_wrap");
  const iframeLayout = document.querySelector(".iframe_resa_layout");
  const closeBtn = document.querySelector(".iframe_resa_close_wrap");
  const iframeContain = document.querySelector(".iframe_resa_contain");
  
  if (resaBtns.length && iframeResa && iframeWrap && iframeLayout && closeBtn && iframeContain) {
    const tlIframeResa = gsap.timeline({ paused: true });
    
    tlIframeResa
    .set(iframeWrap, { display: "block" })
    .fromTo(iframeWrap, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power2.out" })
    .fromTo(iframeLayout, { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" }, "<0.1");
    
    // Clear iframe src after reverse completes
    tlIframeResa.eventCallback("onReverseComplete", () => {
      iframeResa.setAttribute("src", "");
      iframeWrap.style.display = "none"; // Optionally hide the wrap again
    });
    
    resaBtns.forEach(btn => {
      btn.addEventListener("click", e => {
        e.preventDefault();
        const url = btn.getAttribute("data-resa");
        iframeResa.setAttribute("src", url);
        tlIframeResa.play();
        lockScroll();
        console.log("click resa");
      });
    });
    
    closeBtn.addEventListener("click", () => {
      tlIframeResa.reverse();
      unlockScroll();
    });
    
    // Also close if background (iframe_resa_contain) is clicked
    iframeContain.addEventListener("click", (e) => {
      if (e.target === iframeContain) {
        tlIframeResa.reverse();
        unlockScroll();
      }
    });
  }
});

///////////////////////////////
/// UNIVERSAL DRAGGABLE FUNCTION
///////////////////////////////

const initializeDraggableForElements = (
  wrapClass,
  listClass,
  itemClass,
  minBreakpoint,
  maxBreakpoint,
  options = {} // { arrows: { wrap: string, item: string } | false, disableIfFits?: boolean }
) => {
  const wraps = document.querySelectorAll(wrapClass);
  const stateMap = new WeakMap(); // per-wrap state
  const hasArrows = options.arrows && options.arrows.wrap && options.arrows.item;
  const disableIfFits = options.disableIfFits !== false; // default: true

  const getNearestIndex = (snapPoints, x) => {
    let idx = 0, best = Math.abs(x - snapPoints[0]);
    for (let i = 1; i < snapPoints.length; i++) {
      const d = Math.abs(x - snapPoints[i]);
      if (d < best) { best = d; idx = i; }
    }
    return idx;
  };

  const updateArrowDisabled = (wrapState) => {
    if (!hasArrows) return;
    const { listEl, snapPoints, minX, maxX, prevBtn, nextBtn, arrowsWrap } = wrapState;
    if (!prevBtn || !nextBtn) return;

    // If no snapping (disabled state), disable + hide arrows
    if (!snapPoints || !snapPoints.length || (minX === 0 && maxX === 0)) {
      prevBtn.classList.add("is-disabled");
      nextBtn.classList.add("is-disabled");
      prevBtn.style.pointerEvents = "none";
      nextBtn.style.pointerEvents = "none";
      if (arrowsWrap) arrowsWrap.style.display = "none"; // ✅ hide arrow wrap
      return;
    }

    if (arrowsWrap) arrowsWrap.style.display = ""; // ✅ show again when active

    const x = Number(gsap.getProperty(listEl, "x")) || 0;
    const idx = getNearestIndex(snapPoints, x);

    const atFirst = Math.round(snapPoints[idx]) >= Math.round(maxX); // left edge
    const atLast  = Math.round(snapPoints[idx]) <= Math.round(minX); // right edge

    prevBtn.classList.toggle("is-disabled", atFirst);
    nextBtn.classList.toggle("is-disabled", atLast);

    prevBtn.style.pointerEvents = atFirst ? "none" : "";
    nextBtn.style.pointerEvents = atLast ? "none" : "";
  };

  const goToIndex = (wrapState, targetIndex) => {
    const { listEl, snapPoints, minX, maxX } = wrapState;
    if (!listEl || !snapPoints?.length) return;
    const clampedIndex = Math.max(0, Math.min(snapPoints.length - 1, targetIndex));
    const targetX = gsap.utils.clamp(minX, maxX, Math.round(snapPoints[clampedIndex]));
    gsap.to(listEl, {
      x: targetX,
      duration: 0.5,
      ease: "power3.out",
      onUpdate: () => updateArrowDisabled(wrapState)
    });
  };

  const attachArrowHandlers = (wrap, wrapState) => {
    if (!hasArrows) return;
    const arrowsWrap = document.querySelector(options.arrows.wrap);
    if (!arrowsWrap) return;

    const arrowItems = arrowsWrap.querySelectorAll(options.arrows.item);
    const prevBtn = arrowItems[0] || null;
    const nextBtn = arrowItems[1] || null;

    wrapState.prevBtn = prevBtn;
    wrapState.nextBtn = nextBtn;
    wrapState.arrowsWrap = arrowsWrap;

    const onPrev = () => {
      const { listEl, snapPoints } = wrapState;
      if (!listEl || !snapPoints?.length) return;
      const x = Number(gsap.getProperty(listEl, "x")) || 0;
      const idx = getNearestIndex(snapPoints, x);
      goToIndex(wrapState, idx - 1);
    };

    const onNext = () => {
      const { listEl, snapPoints } = wrapState;
      if (!listEl || !snapPoints?.length) return;
      const x = Number(gsap.getProperty(listEl, "x")) || 0;
      const idx = getNearestIndex(snapPoints, x);
      goToIndex(wrapState, idx + 1);
    };

    prevBtn && prevBtn.removeEventListener("click", prevBtn._dragClick);
    nextBtn && nextBtn.removeEventListener("click", nextBtn._dragClick);

    if (prevBtn) {
      prevBtn._dragClick = onPrev;
      prevBtn.addEventListener("click", onPrev);
    }
    if (nextBtn) {
      nextBtn._dragClick = onNext;
      nextBtn.addEventListener("click", onNext);
    }
  };

  const initializeDraggable = (wrap) => {
    const listEl = wrap.querySelector(listClass);
    const items = wrap.querySelectorAll(itemClass);
    if (!listEl || !items.length) return;

    let wrapState = stateMap.get(wrap) || {};
    wrapState.listEl = listEl;
    wrapState.items = items;

    const updateBoundsProcess = () => {
      const currentX = gsap.getProperty(listEl, "x") || 0;
      gsap.set(listEl, { x: 0 }); // measure cleanly

      const wrapRect = wrap.getBoundingClientRect();
      const cs = getComputedStyle(wrap);
      const padL = parseFloat(cs.paddingLeft)  || 0;
      const padR = parseFloat(cs.paddingRight) || 0;

      const listScrollW = listEl.scrollWidth;
      const innerW = wrapRect.width - padL - padR;      


      // ✅ If content fits: kill draggable, reset, disable arrows + hide wrap
      if (disableIfFits && listScrollW <= innerW) {
        Draggable.get(listEl)?.kill();
        gsap.set(listEl, { x: 0 });
        wrapState.minX = 0;
        wrapState.maxX = 0;
        wrapState.snapPoints = [];
        attachArrowHandlers(wrap, wrapState);
        updateArrowDisabled(wrapState);
        return;
      }

      // item rects at x=0
      const itemRects = Array.from(items).map(el => el.getBoundingClientRect());

      // SNAP POINTS: align each item's LEFT to the wrap's inner-left
      const snapPoints = itemRects.map(r => (wrapRect.left + padL) - r.left);

      // EXTREMES
      const rightmostRect = itemRects.reduce((acc, r) => (r.right > acc.right ? r : acc), itemRects[0]);
      const leftmostRect  = itemRects.reduce((acc, r) => (r.left  < acc.left  ? r : acc), itemRects[0]);

      const widthMin      = Math.min(0, innerW - listScrollW);
      const rightAlignMin = (wrapRect.right - padR) - rightmostRect.right;
      const leftAlignMax  = (wrapRect.left + padL) - leftmostRect.left;

      const minX = Math.max(widthMin, rightAlignMin);
      const maxX = leftAlignMax;

            // ... inside updateBoundsProcess, after you've built snapPoints and minX/maxX

      wrapState.minX = minX;
      wrapState.maxX = maxX;
      wrapState.snapPoints = snapPoints;

      // ✅ expose the state on the list element so external code can use it
      listEl._dragState = wrapState;
      // console.log({ listScrollW, innerW, fits: listScrollW <= innerW });

      Draggable.get(listEl)?.kill();
      Draggable.create(listEl, {
        type: "x",
        edgeResistance: 0.85,
        bounds: { minX, maxX },
        inertia: true,
        snap: {
          x: (value) => {
            let closest = snapPoints[0];
            for (let i = 1; i < snapPoints.length; i++) {
              const p = snapPoints[i];
              if (Math.abs(value - p) < Math.abs(value - closest)) closest = p;
            }
            return gsap.utils.clamp(minX, maxX, Math.round(closest));
          }
        },
        onDrag: () => updateArrowDisabled(wrapState),
        onThrowUpdate: () => updateArrowDisabled(wrapState),
        onThrowComplete: () => updateArrowDisabled(wrapState)
      });

      gsap.set(listEl, { x: gsap.utils.clamp(minX, maxX, Number(currentX) || 0) });

      wrapState.minX = minX;
      wrapState.maxX = maxX;
      wrapState.snapPoints = snapPoints;

      attachArrowHandlers(wrap, wrapState);
      updateArrowDisabled(wrapState);
    };

    wrapState.updateBoundsProcess = updateBoundsProcess;
    stateMap.set(wrap, wrapState);

    updateBoundsProcess();

    const onResize = () => updateBoundsProcess();
    if (wrap._draggableResizeHandler) {
      window.removeEventListener('resize', wrap._draggableResizeHandler);
    }
    wrap._draggableResizeHandler = onResize;
    window.addEventListener('resize', onResize);
  };

  const destroyDraggable = (wrap) => {
    const listEl = wrap.querySelector(listClass);
    Draggable.get(listEl)?.kill();
    if (listEl) gsap.set(listEl, { x: 0 });

    if (!hasArrows) return;
    const wrapState = stateMap.get(wrap);
    if (wrapState?.prevBtn) {
      wrapState.prevBtn.removeEventListener("click", wrapState.prevBtn._dragClick);
    }
    if (wrapState?.nextBtn) {
      wrapState.nextBtn.removeEventListener("click", wrapState.nextBtn._dragClick);
    }
    if (wrapState?.arrowsWrap) {
      wrapState.arrowsWrap.style.display = "none"; // hide arrows when destroyed
    }
  };

  const handleScreenResize = () => {
    const ww = window.innerWidth;
    wraps.forEach((wrap) => {
      if (ww >= minBreakpoint && ww <= maxBreakpoint) {
        initializeDraggable(wrap);
      } else {
        destroyDraggable(wrap);
      }
    });
  };

  handleScreenResize();
  window.addEventListener('resize', handleScreenResize);
};



///////////////////////////////
/// TOGGLE ABSOLUTE BOTTOM
///////////////////////////////


//  * Toggle `.u-absolute-bottom` on an item
//  * when its bottom edge reaches the bottom of its container.
//  *
//  * @param {Element|string} item - The element (or selector) to watch
//  * @param {Element|string} container - The container element (or selector)
 
function toggleAbsoluteBottom(item, container) {
  const el = typeof item === "string" ? document.querySelector(item) : item;
  const parent = typeof container === "string" ? document.querySelector(container) : container;

  if (!el || !parent) return;

  ScrollTrigger.create({
    trigger: el,
    start: "bottom bottom",   // when the item's bottom reaches viewport bottom
    end: "bottom bottom",
    trigger: parent,          // set container as the context
    onEnter: () => el.classList.add("u-absolute-bottom"),
    onLeaveBack: () => el.classList.remove("u-absolute-bottom"),
    // markers: true // set true for debugging
  });
}

toggleAbsoluteBottom(".fixed_cta_list_wrap", ".page_main");

toggleAbsoluteBottom(".show_allergen_wrap", ".page_main");

toggleAbsoluteBottom(".main_btn_fixed_wrap", ".page_main");

toggleAbsoluteBottom(".contact_mobile_nav_wrap", ".page_main");





///////////////////////////////
/// UNIVERSAL MODAL
//////////////////////////////

(function () {
  if (!window.gsap) {
    console.warn("[Modal] GSAP not found. Load GSAP before this script.");
    return;
  }

  const STORAGE_PREFIX = "modalShown:";

  document.addEventListener("DOMContentLoaded", () => {
    const modals = document.querySelectorAll('.modal_wrap[data-modal-ref]');

    modals.forEach((modal) => {
      const ref        = modal.getAttribute("data-modal-ref") || "";
      const delayAttr  = modal.getAttribute("data-animation-delay");
      const delayMS    = Number.isFinite(+delayAttr) ? parseInt(delayAttr, 10) : 0;
      const activate   = (modal.getAttribute("data-activate") || "").toLowerCase() === "true";
      const storageKey = STORAGE_PREFIX + ref;

      if (!activate) return;
      if (localStorage.getItem(storageKey)) return;

      const bg       = modal.querySelector(".modal_bg");
      const layout   = modal.querySelector(".modal_layout");
      const closeBtn = modal.querySelector(".button_close_wrap");

      if (!bg || !layout) {
        console.warn(`[Modal "${ref}"] Missing .modal_bg or .modal_layout inside .modal_wrap.`);
        return;
      }

      // Build GSAP timeline
      const tl = gsap.timeline({
        paused: true,
        onStart: () => {
          // Lock scrolling when modal starts opening                  
          lockScroll();
          console.log("lenis stop");
        },
        onReverseComplete: () => {
          // Unlock scrolling when modal fully closed
          unlockScroll();
          gsap.set(modal, { display: "none" });
        }
      });

      // Opening animation
      tl.set(modal, { display: "flex" }, 0)
        .from(bg,     { opacity: 0 }, 0)
        .from(layout, { y: 40, clipPath: "inset(100% 0 0 0)" }, 0);

      // Open after delay
      const openTimer = setTimeout(() => {
        tl.play(0);
        try { localStorage.setItem(storageKey, "1"); } catch (e) {}
      }, Math.max(0, delayMS));

      // Close handlers
      if (closeBtn) {
        closeBtn.addEventListener("click", (e) => {
          e.preventDefault();
          if (tl.isActive()) tl.progress(1);
          tl.reverse();
        });
      }

      modal.addEventListener("click", (e) => {
        const clickedInsideLayout = layout.contains(e.target);
        if (!clickedInsideLayout) {
          if (tl.isActive()) tl.progress(1);
          tl.reverse();
        }
      });

      const observer = new MutationObserver(() => {
        if (!document.body.contains(modal)) {
          clearTimeout(openTimer);
          observer.disconnect();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    });
  });
})();


///////////////////////////////
/// RESTAURANT BADGE OPENED OR CLOSED
//////////////////////////////

(function() {

  // --- EARLY EXIT: if no card exists, do NOTHING ---
  if (!document.querySelector(".restaurant_card_wrap")) {
    return; // 🔥 Prevents all listeners, parsing, setInterval, etc.
  }

  // --- utils ---
  function parseTimeToMinutes(str) {
    const parts = str.split(":");
    const hh = parseInt(parts[0], 10);
    const mm = parts[1] ? parseInt(parts[1], 10) : 0;
    return (hh * 60) + mm;
  }

  function minutesToFrenchHHhMM(total) {
    const hh = Math.floor(total / 60);
    const mm = total % 60;
    return hh + "h" + mm.toString().padStart(2, "0");
  }

  function parseHoursStringToRanges(hoursString) {
    if (!hoursString || hoursString.toLowerCase().includes("fermé")) return [];
    return hoursString.split(" / ").map(rangeStr => {
      const parts = rangeStr.split("–");
      if (parts.length !== 2) return null;
      return {
        start: parseTimeToMinutes(parts[0].trim()),
        end:   parseTimeToMinutes(parts[1].trim())
      };
    }).filter(Boolean);
  }

  function getTodayAttrName(dayIndex) {
    switch(dayIndex) {
      case 0: return "data-hours-sunday";
      case 1: return "data-hours-monday";
      case 2: return "data-hours-tuesday";
      case 3: return "data-hours-wednesday";
      case 4: return "data-hours-thursday";
      case 5: return "data-hours-friday";
      case 6: return "data-hours-saturday";
    }
  }

  function getAttrNameByIndex(dayIndex) {
    return getTodayAttrName(dayIndex);
  }

  function isOpenNowAndNextOpening(rangesToday, nowMins, rangesTomorrow) {
    for (const r of rangesToday) {
      if (nowMins >= r.start && nowMins <= r.end) {
        return { openNow: true, nextOpenMins: null };
      }
    }

    let candidate = null;
    for (const r of rangesToday) {
      if (r.start > nowMins) {
        if (candidate === null || r.start < candidate) {
          candidate = r.start;
        }
      }
    }

    if (candidate === null && rangesTomorrow?.length) {
      candidate = rangesTomorrow[0].start;
    }

    return { openNow: false, nextOpenMins: candidate };
  }

  function updateBadgesForCard(cardEl) {
    const now = new Date();
    const todayIndex = now.getDay();
    const nowMins = now.getHours() * 60 + now.getMinutes();

    const todayAttr = getTodayAttrName(todayIndex);
    const hoursTodayStr = cardEl.getAttribute(todayAttr);

    const tomorrowIndex = (todayIndex + 1) % 7;
    const tomorrowAttr = getAttrNameByIndex(tomorrowIndex);
    const hoursTomorrowStr = cardEl.getAttribute(tomorrowAttr);

    const rangesToday = parseHoursStringToRanges(hoursTodayStr);
    const rangesTomorrow = parseHoursStringToRanges(hoursTomorrowStr);

    const statusInfo = isOpenNowAndNextOpening(rangesToday, nowMins, rangesTomorrow);

    const container = cardEl.closest(".restaurant_card_wrap");
    if (!container) return;

    const openBadge   = container.querySelector('[badge-status="opened"]');
    const closedBadge = container.querySelector('[badge-status="closed"]');
    if (!openBadge || !closedBadge) return;

    if (statusInfo.openNow) {
      openBadge.classList.remove("u-display-none");
      closedBadge.classList.add("u-display-none");
    } else {
      openBadge.classList.add("u-display-none");
      closedBadge.classList.remove("u-display-none");

      const nextTimeEl = closedBadge.querySelector('[data-hours-to-replace]');
      if (nextTimeEl) {
        nextTimeEl.textContent = statusInfo.nextOpenMins != null
          ? minutesToFrenchHHhMM(statusInfo.nextOpenMins)
          : "--h--";
      }
    }
  }

  function run() {
    document.querySelectorAll(".restaurant_card_wrap").forEach(updateBadgesForCard);
  }

  // Run once DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }

  // Refresh every 5 minutes
  setInterval(run, 5 * 60 * 1000);

})();

///////////////////////////////
/// LANG SWITCH
//////////////////////////////


document.addEventListener("DOMContentLoaded", function () {
  const enSwitches = document.querySelectorAll('[data-lang-switch="en"]');
  const frSwitches = document.querySelectorAll('[data-lang-switch="fr"]');

  function getEnUrl(loc) {
    let path = loc.pathname || "/";
    if (!path.startsWith("/")) path = "/" + path;

    // Already on /en/... → on ne change rien
    if (path === "/en" || path.startsWith("/en/")) {
      return loc.origin + path + loc.search + loc.hash;
    }

    // Cas home : "/" -> "/en/"
    if (path === "/") {
      path = "/en/";
    } else {
      path = "/en" + path;
    }

    return loc.origin + path + loc.search + loc.hash;
  }

  function getFrUrl(loc) {
    let path = loc.pathname || "/";
    if (!path.startsWith("/")) path = "/" + path;

    if (path === "/en") {
      path = "/";
    } else if (path.startsWith("/en/")) {
      path = path.slice(3) || "/";
    }

    return loc.origin + path + loc.search + loc.hash;
  }

  enSwitches.forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = getEnUrl(window.location);
    });
  });

  frSwitches.forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = getFrUrl(window.location);
    });
  });
});
