//LAST UPDATE ON 24/11/2025


///////////////////////////////
/// HERO SECTION
///////////////////////////////

// Cache DOM
const homeHeroTrack  = document.querySelector('.hero_track');
if (homeHeroTrack) {

  const homeHeroVideo  = homeHeroTrack.querySelector('.hero_video_wrap');
  const homeHeroMask   = homeHeroTrack.querySelector('.hero_mask_wrap');
  const homeHeroText1  = homeHeroTrack.querySelector('.hero_text_item:nth-of-type(1)');
  const homeHeroText2  = homeHeroTrack.querySelector('.hero_text_item:nth-of-type(2)');
  const claimTextEl    = homeHeroTrack.querySelector('.hero_claim_richtext p');
  
  // Wait for fonts to be fully ready before splitting (prevents bad line breaks)
  document.fonts.ready.then(() => {
    // Split & mask lines using the latest SplitText API
    // (mask accepts "lines", "words", or "chars" — here we want line masks)
    const claimTextSplit = new SplitText(claimTextEl, {
      type: "lines,words",
      mask: "lines",
      linesClass: "st-line",
      wordsClass: "st-word"
    });
    
    const claimTextHighlight    = homeHeroTrack.querySelectorAll('em .st-word');
    // === TIMELINE 1 ===
    let tlHomeHero = gsap.timeline({ paused: true });
        // convert viewport width into pixels
      const vwToPx = window.innerWidth * 0.75; // 50vw in px
  
      // pick whichever is larger (in absolute terms)
      const xValue = Math.max(vwToPx, 300);
  
    tlHomeHero
      .to(homeHeroMask, {
        scale: 23,
        rotate: -50,
        ease: "none"
      })
      .to(homeHeroText1, {
        x: xValue * -1,
        ease: "none"
      }, "<")
      .to(homeHeroText2, {
        x: xValue,
        ease: "none"
      }, "<")
      .set(homeHeroMask, {        
        display: "none"
      }, ">")
      ;
  
    ScrollTrigger.create({
      trigger: homeHeroTrack,
      start: "top top",
      end: "50% 50%",
      animation: tlHomeHero,
      scrub: true,
      toggleActions: "play complete play reverse",
      // markers: true,
    });
  
    // === TIMELINE 2 ===
    let tlHomeHero2 = gsap.timeline({ paused: true });
  
    tlHomeHero2
    .from(claimTextSplit.lines, {
      y: 200,
      rotate: 15,
      stagger: .05,
    })
    .to(homeHeroVideo, {
      opacity: .3,  
    }, "<")
    // .to(claimTextHighlight, {
    //   // opacity: .3, 
    //   color: "#f7e9d4",
    //   stagger: .05,
    // },)
    // .to(claimTextHighlight, {        
    //   "-webkit-text-stroke-width": "0px",
    //   // "--stroke-width": "0px",
    //   stagger: .05,
    // },"<")
  
  
    // Add any follow-up animations here...
  
    ScrollTrigger.create({
      trigger: homeHeroTrack,
      start: "65% 50%",
      end: "bottom bottom",
      animation: tlHomeHero2,
      toggleActions: "play complete play reverse",
      // markers: true
      // scrub: true,
    });
  
    // After splitting text, refresh ScrollTrigger so measurements are correct
    ScrollTrigger.refresh();
  });
}



///////////////////////////////
/// PRESS ARTICLES
///////////////////////////////

// ==== CONFIG ====
const SELECTORS = {
    list: ".presse_article_collection_list",
    article: ".presse_article_collection_item",
    btnList: ".presse_btn_collection_list",
    btn: ".presse_btn_collection_item",
    btnLogo: ".presse_btn_logo_wrap",
    btnProgressActive: ".presse_btn_progress_active",
    arrowWrap: ".presse_arrow_contain",
    arrow: ".arrow_item_wrap",
  };
  
  const AUTOPLAY_MS = 5000; // ms
  
  // Eases & durations tuned for snap quickness
  const DUR = {
    autoplay: 0.6,     // keep autoplay buttery
    userMin: 0.16,     // fastest user snap
    userMax: 0.35,     // slowest user snap
    nearSnap: 0.14,    // tiny corrections feel instant
    nearPx: 24         // distance threshold for near snap
  };
  const EASES = {
    autoplay: "power3.inOut",
    user: "power2.out"
  };
  
  // ==== UTIL ====
  function q(sel, ctx){ return (ctx || document).querySelector(sel); }
  function qa(sel, ctx){ return Array.from((ctx || document).querySelectorAll(sel)); }
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  
  // ====== LAZY INIT WITH INTERSECTIONOBSERVER ======
  document.addEventListener("DOMContentLoaded", () => {
    const listEl = q(SELECTORS.list);
    if (!listEl) return;
  
    let initialized = false;
    let api = null;
  
    const observer = new IntersectionObserver((entries) => {
      const inView = entries.some(e => e.isIntersecting);
      if (!initialized && inView) {
        initialized = true;
        api = initPressSlider();
      }
      if (initialized && api) {
        if (inView) api.resume?.();
        else api.pause?.();
      }
    }, {
      root: null,
      rootMargin: "0px 0px -20% 0px",
      threshold: 0.1
    });
  
    observer.observe(listEl);
  });
  
  // ====== MAIN SLIDER FUNCTION ======
  function initPressSlider() {
    const listEl = q(SELECTORS.list);
    const articles = qa(SELECTORS.article, listEl);
    const btnListEl = q(SELECTORS.btnList);
    const btns = qa(SELECTORS.btn, btnListEl);
  
    if (!listEl || articles.length === 0 || btns.length !== articles.length) {
      console.warn("[Press Slider] Setup issue: check selectors and matching counts.", {
        hasList: !!listEl, articleCount: articles.length, btnCount: btns.length
      });
      return {};
    }
    if (typeof gsap === "undefined") {
      console.error("[Press Slider] GSAP is required.");
      return {};
    }
  
    // ---- State ----
    let index = 0;
    let isAnimating = false;
    let offsets = [];
  
    let autoplayTimer = null;
    let autoplayVersion = 0;
    let pausedByIO = false;
  
    // ---- Layout helpers ----
    const computeOffsets = () => {
      const base = articles[0].getBoundingClientRect().left;
      offsets = articles.map(a => a.getBoundingClientRect().left - base);
    };
    const getX = () => +gsap.getProperty(listEl, "x") || 0;
    const alignToIndex = () => { gsap.set(listEl, { x: -(offsets[index] || 0) }); };
  
    computeOffsets();
    alignToIndex();
  
    const onLoad = () => { computeOffsets(); alignToIndex(); };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad);
  
    let resizeRaf = null;
    window.addEventListener("resize", () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => { computeOffsets(); alignToIndex(); });
    });
  
    // ---- Classes / visuals ----
    const setActiveArticle = (i) => {
      articles.forEach(a => a.classList.remove("is-active"));
      articles[i].classList.add("is-active");
    };
  
    const updateBtnLogos = (activeIndex) => {
      btns.forEach((b, i) => {
        const logo = q(SELECTORS.btnLogo, b);
        if (!logo) return;
        if (i <= activeIndex) logo.classList.add("is-active");
        else logo.classList.remove("is-active");
      });
    };
  
    const killProgressAnimations = () => {
      btns.forEach((b) => {
        const bar = q(SELECTORS.btnProgressActive, b);
        if (!bar) return;
        gsap.killTweensOf(bar);
      });
    };
  
    const updateProgressBars = (activeIndex, animateCurrent = true) => {
      killProgressAnimations();
      btns.forEach((b, i) => {
        const bar = q(SELECTORS.btnProgressActive, b);
        if (!bar) return;
  
        if (i < activeIndex) {
          gsap.set(bar, { width: "100%" });
        } else if (i === activeIndex) {
          gsap.set(bar, { width: "0%" });
          if (animateCurrent) {
            gsap.to(bar, {
              width: "100%",
              duration: AUTOPLAY_MS / 1000,
              ease: "linear"
            });
          }
        } else {
          gsap.set(bar, { width: "0%" });
        }
      });
    };
  
    // ---- Autoplay ----
    const stopAutoplay = () => {
      autoplayVersion++;
      if (autoplayTimer) { clearTimeout(autoplayTimer); autoplayTimer = null; }
    };
  
    const startAutoplay = () => {
      if (pausedByIO) return;
      stopAutoplay();
      const myVersion = autoplayVersion;
      autoplayTimer = setTimeout(() => {
        if (myVersion !== autoplayVersion) return;
        slideTo(index + 1, { source: "autoplay" });
      }, AUTOPLAY_MS);
    };
  
    // ---- Adaptive duration ----
    function snapDurationUser({ targetX, velocity }) {
      const currentOffset = -getX();
      const dist = Math.abs(targetX - currentOffset);
      if (dist <= DUR.nearPx) return DUR.nearSnap;
  
      const k1 = 0.0012;
      const k2 = 0.22;
      const v = Math.abs(velocity || 0);
      const adaptive = (k1 * dist) + (k2 / (v + 0.001));
      return clamp(adaptive, DUR.userMin, DUR.userMax);
    }
  
    // ---- Core nav ----
    const slideTo = (targetIndex, opts = { source: "user", velocity: 0 }) => {
      if (isAnimating) return;
      isAnimating = true;
  
      const { source = "user", velocity = 0 } = opts;
      stopAutoplay();
  
      const count = articles.length;
      const newIndex = ((targetIndex % count) + count) % count;
      const targetX = offsets[newIndex] || 0;
      const currentOffset = -getX();
      const dist = Math.abs(targetX - currentOffset);
  
      const duration = (source === "autoplay")
        ? DUR.autoplay
        : (dist <= DUR.nearPx ? DUR.nearSnap : snapDurationUser({ targetX, velocity }));
      const ease = (source === "autoplay") ? EASES.autoplay : EASES.user;
  
      setActiveArticle(newIndex);
      updateBtnLogos(newIndex);
      gsap.killTweensOf(listEl);
  
      if (source === "autoplay") {
        updateProgressBars(newIndex, true);
        startAutoplay();
      } else {
        updateProgressBars(newIndex, false);
      }
  
      gsap.to(listEl, {
        x: -targetX,
        duration,
        ease,
        overwrite: "auto",
        onComplete: () => {
          index = newIndex;
          isAnimating = false;
  
          if (source !== "autoplay") {
            updateProgressBars(index, true);
            startAutoplay();
          }
        }
      });
    };
  
    // ---- Clicks (pills) ----
    btns.forEach((b, i) => {
      b.addEventListener("click", (e) => {
        e.preventDefault();
        if (isAnimating) return;
        if (i === index) {
          updateProgressBars(index, true);
          startAutoplay();
          return;
        }
        slideTo(i, { source: "user", velocity: 0 });
      });
    });
  
    // ---- Arrows (prev/next) ----
    const arrowWrap = q(SELECTORS.arrowWrap);
    if (arrowWrap) {
      const arrows = qa(SELECTORS.arrow, arrowWrap);
      const prev = arrows[0];
      const next = arrows[1];
  
      const onPrev = (e) => {
        e.preventDefault();
        if (isAnimating) return;
        slideTo(index - 1, { source: "user", velocity: 0 });
      };
      const onNext = (e) => {
        e.preventDefault();
        if (isAnimating) return;
        slideTo(index + 1, { source: "user", velocity: 0 });
      };
  
      prev?.addEventListener("click", onPrev, { passive: false });
      next?.addEventListener("click", onNext, { passive: false });
  
      // Optional: pause autoplay while interacting with arrows
      ["mouseenter", "focusin"].forEach(evt => arrowWrap.addEventListener(evt, () => {
        stopAutoplay();
        killProgressAnimations();
      }));
      ["mouseleave", "focusout"].forEach(evt => arrowWrap.addEventListener(evt, () => {
        updateProgressBars(index, true);
        startAutoplay();
      }));
  
      // Optional: keyboard support
      if (!arrowWrap.hasAttribute("tabindex")) arrowWrap.setAttribute("tabindex", "0");
      arrowWrap.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") { e.preventDefault(); onPrev(e); }
        if (e.key === "ArrowRight") { e.preventDefault(); onNext(e); }
      });
    }
  
    // ---- Drag / Swipe (mobile) ----
    let dragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragBaseX = 0;
    let dragMoved = false;
    let dragLock = null;
    let lastPX = 0;
    let lastT = 0;
    let velocityX = 0;
  
    const minX = () => -(offsets[offsets.length - 1] || 0);
    const maxX = () => 0;
  
    function attachDrag() {
      listEl.style.touchAction = "pan-y";
  
      const supportsPointer = "onpointerdown" in window;
      const pointerDownEvt = supportsPointer ? "pointerdown" : "touchstart";
      const pointerMoveEvt = supportsPointer ? "pointermove" : "touchmove";
      const pointerUpEvt   = supportsPointer ? "pointerup"   : "touchend";
  
      // mobile only; set to true to enable on desktop too
      const enableDrag = window.matchMedia("(pointer: coarse)").matches;
      if (!enableDrag) return;
  
      listEl.addEventListener(pointerDownEvt, onDown, { passive: true });
  
      function onDown(e) {
        if (isAnimating) return;
        const p = getPoint(e);
        dragging = true;
        dragMoved = false;
        dragLock = null;
        dragStartX = p.x;
        dragStartY = p.y;
        dragBaseX  = getX();
        lastPX = p.x;
        lastT = performance.now();
        velocityX = 0;
  
        stopAutoplay();
        killProgressAnimations();
  
        window.addEventListener(pointerMoveEvt, onMove, { passive: false });
        window.addEventListener(pointerUpEvt, onUp, { passive: true });
      }
  
      function onMove(e) {
        if (!dragging) return;
  
        const p = getPoint(e);
        const dx = p.x - dragStartX;
        const dy = p.y - dragStartY;
  
        if (!dragLock) {
          if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
            dragLock = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
          }
        }
        if (dragLock === "y") return;
  
        e.preventDefault();
        dragMoved = true;
  
        const x = clamp(dragBaseX + dx, minX(), maxX());
        gsap.set(listEl, { x });
  
        const now = performance.now();
        const dt = Math.max(1, now - lastT);
        velocityX = (p.x - lastPX) / dt;
        lastPX = p.x;
        lastT = now;
      }
  
      function onUp() {
        if (!dragging) return;
        dragging = false;
        window.removeEventListener(pointerMoveEvt, onMove);
        window.removeEventListener(pointerUpEvt, onUp);
  
        if (!dragMoved || dragLock === "y") {
          updateProgressBars(index, true);
          startAutoplay();
          return;
        }
  
        const x = getX();
        const currentOffset = -x;
        const nearest = nearestIndex(currentOffset);
  
        const swipeThresholdPX = listEl.clientWidth * 0.15;
        const dxTotal = x - dragBaseX;
        let target = nearest;
  
        if (Math.abs(velocityX) > 0.6 || Math.abs(dxTotal) > swipeThresholdPX) {
          target = index + (dxTotal < 0 ? 1 : -1);
        }
  
        slideTo(target, { source: "user", velocity: velocityX });
      }
  
      function getPoint(e) {
        if (e.touches && e.touches[0]) {
          return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
      }
    }
  
    function nearestIndex(currentOffsetPx) {
      let best = 0;
      let bestDist = Infinity;
      for (let i = 0; i < offsets.length; i++) {
        const dist = Math.abs(offsets[i] - currentOffsetPx);
        if (dist < bestDist) { bestDist = dist; best = i; }
      }
      return best;
    }
  
    // ---- INIT ----
    listEl.style.willChange = "transform";
    gsap.set(listEl, { x: 0 });
    setActiveArticle(0);
    updateBtnLogos(0);
    updateProgressBars(0, true);
    attachDrag();
    startAutoplay();
  
    // Expose pause/resume for IO
    return {
      pause() {
        if (pausedByIO) return;
        pausedByIO = true;
        stopAutoplay();
        killProgressAnimations();
      },
      resume() {
        if (!pausedByIO) return;
        pausedByIO = false;
        updateProgressBars(index, true);
        startAutoplay();
      }
    };
  }
  
  
  ///////////////////////////////
/// NOS RESTAURANTS HORIZONTAL SCROLL
///////////////////////////////

function initHorizontalScroll({ 
    listClass, 
    containerClass, 
    triggerClass, 
    minPixel = 0, 
    maxPixel = Infinity,
    markers = false
  }) {
  
    const run = () => {
      const mq = `(min-width: ${minPixel}px)` + (Number.isFinite(maxPixel) ? ` and (max-width: ${maxPixel}px)` : "");
      ScrollTrigger.matchMedia({
        [mq]: () => {
          const list = document.querySelector(listClass);
          const container = document.querySelector(containerClass);
          const triggerEl = document.querySelector(triggerClass) || triggerClass;
          if (!list || !container) return;
  
          const dist = () => -(list.scrollWidth - container.offsetWidth);
          const tl = gsap.fromTo(list, { x: 0 }, { x: dist(), ease: "none", immediateRender: false });
  
          const st = ScrollTrigger.create({
            trigger: triggerEl,
            start: "top top",
            end: "bottom bottom",
            animation: tl,
            scrub: 1,
            invalidateOnRefresh: true,
            markers,
            onRefresh: self => { tl.vars.x = dist(); tl.invalidate(); tl.progress(self.progress).pause(); }
          });
  
          return () => { st.kill(); tl.kill(); };
        }
      });
    };
  
    // Run after layout is fully settled (handles images/fonts); also safe on normal loads.
    window.addEventListener("load", () => { run(); ScrollTrigger.refresh(); });
  }
  
  
  
  initHorizontalScroll({
    listClass: '.all_restaurant_collection_list[horizontal-scroll="true"]',
    containerClass: '.all_restaurant_collection_list_wrapper',
    triggerClass: '.all_restaurant_wrap',
    minPixel: 767,
    maxPixel: Infinity,
    // markers: true
  });




///////////////////////////////
/// QU EST CE QU ON MANGE
///////////////////////////////

(() => {
    const AUTOPLAY_MS = 40000; // ms
    const AUTOPLAY_S = AUTOPLAY_MS / 1000;
  
    const wrap = document.querySelector('.on_mange_quoi_wrap');
    if (!wrap) return;
  
    const btnItems = Array.from(wrap.querySelectorAll('.on_mange_quoi_btn_collection_item'));
    const slides   = Array.from(wrap.querySelectorAll('.on_mange_quoi_content_collection_item'));
    if (btnItems.length !== slides.length || !slides.length) return;
  
    // (Optional) arrows container
    const arrowsContain = wrap.querySelector('.on_mange_quoi_arrow_contain');
    const arrows = arrowsContain ? Array.from(arrowsContain.querySelectorAll('.arrow_item_wrap')) : [];
  
    let current = 0;
    let inView = false;
    let slideAnimation = null;
    let progressAnimation = null;
  
    // drag state
    let dragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragMoved = false;
    let dragLock = null; // null | 'x' | 'y'
    let lastX = 0;
    let lastT = 0;
    let velocityX = 0;
    let dragDir = 0; // -1 prev, 1 next
    let dragPreparedIndex = null; // neighbor index prepared during drag
  
    // index elements
    btnItems.forEach((el, i) => el.dataset.index = i);
    slides.forEach((el, i) => el.dataset.index = i);
  
    // initial positions: current at 0, others off-screen to left (-100)
    slides.forEach((s, i) => gsap.set(s, { xPercent: i === 0 ? 0 : -100 }));
  
    // helpers for rings
    const ringOf = (idx) => btnItems[idx].querySelector('.on_mange_quoi_btn_item_contain');
    const setRingValue = (idx, value) => ringOf(idx)?.style.setProperty('--p', value);
    const killProgressAnimation = () => { if (progressAnimation) { progressAnimation.kill(); progressAnimation = null; } };
    const killSlideAnimation    = () => { if (slideAnimation)    { slideAnimation.kill();    slideAnimation    = null; } };
  
    function startProgressAnimation(idx, durationSec) {
      killProgressAnimation();
      const el = ringOf(idx);
      if (!el) return;
  
      const currentP = parseFloat(getComputedStyle(el).getPropertyValue('--p')) || 0;
      const remaining = Math.max(0, 100 - currentP);
      const dur = durationSec * (remaining / 100);
  
      progressAnimation = gsap.to({}, {
        duration: dur,
        ease: 'linear',
        onUpdate() {
          const val = currentP + remaining * this.ratio;
          el.style.setProperty('--p', val);
        },
        onComplete() {
          el.style.setProperty('--p', '100');
          if (inView) goTo((current + 1) % slides.length);
        }
      });
    }
  
    function updateRingsForTarget(targetIdx, { animateActive = true } = {}) {
      for (let i = 0; i < btnItems.length; i++) {
        if (i < targetIdx)       setRingValue(i, '100');
        else if (i > targetIdx)  setRingValue(i, '0');
      }
      if (!animateActive) setRingValue(targetIdx, '0');
      if (animateActive && inView) startProgressAnimation(targetIdx, AUTOPLAY_S);
    }
  
    function goTo(targetIdx) {
      if (targetIdx === current || slideAnimation) {
        if (targetIdx === current && inView && !progressAnimation) startProgressAnimation(targetIdx, AUTOPLAY_S);
        return;
      }
  
      const dir = targetIdx > current ? 1 : -1;
      const from = slides[current];
      const to   = slides[targetIdx];
  
      killSlideAnimation();
      killProgressAnimation();
  
      // prepare "to" on correct side
      gsap.set(to, { xPercent: dir === 1 ? 100 : -100 });
  
      slideAnimation = gsap.timeline({
        defaults: { ease: 'power2.inOut', duration: 0.6 },
        onComplete: () => {
          slideAnimation = null;
          current = targetIdx;
          if (inView) startProgressAnimation(current, AUTOPLAY_S);
        }
      });
  
      slideAnimation
        .to(from, { xPercent: dir === 1 ? -100 : 100 }, 0)
        .to(to,   { xPercent: 0 }, 0);
  
      updateRingsForTarget(targetIdx, { animateActive: false });
      setRingValue(targetIdx, '0');
    }
  
    function nextIdx() { return (current + 1) % slides.length; }
    function prevIdx() { return (current - 1 + slides.length) % slides.length; }
  
    // button clicks (dots)
    btnItems.forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        if (!Number.isNaN(idx)) goTo(idx);
      });
    });
  
    // ---- DESKTOP ARROWS (≥ 992px) ----
    const mqDesktop = window.matchMedia('(min-width: 992px)');
    let arrowsBound = false;
  
    function bindArrowsIfNeeded() {
      if (!arrowsContain || arrows.length < 2) return;
      if (mqDesktop.matches && !arrowsBound) {
        arrowsBound = true;
        arrows[0].addEventListener('click', onArrowPrev);
        arrows[1].addEventListener('click', onArrowNext);
      } else if (!mqDesktop.matches && arrowsBound) {
        arrowsBound = false;
        arrows[0].removeEventListener('click', onArrowPrev);
        arrows[1].removeEventListener('click', onArrowNext);
      }
    }
    function onArrowPrev(e){ e.preventDefault(); goTo(prevIdx()); }
    function onArrowNext(e){ e.preventDefault(); goTo(nextIdx()); }
    bindArrowsIfNeeded();
    mqDesktop.addEventListener?.('change', bindArrowsIfNeeded);
  
    // ---- MOBILE DRAG / SWIPE ----
    function attachDrag() {
      // Only enable on touch/coarse pointers (mobile)
      const enableDrag = window.matchMedia('(pointer: coarse)').matches;
      if (!enableDrag) return;
  
      wrap.style.touchAction = 'pan-y'; // keep vertical scroll
  
      const supportsPointer = 'onpointerdown' in window;
      const downEvt = supportsPointer ? 'pointerdown' : 'touchstart';
      const moveEvt = supportsPointer ? 'pointermove' : 'touchmove';
      const upEvt   = supportsPointer ? 'pointerup'   : 'touchend';
  
      wrap.addEventListener(downEvt, onDown, { passive: true });
  
      function onDown(e) {
        if (slideAnimation) return;
        const p = getPoint(e);
        dragging = true;
        dragMoved = false;
        dragLock = null;
        dragDir = 0;
        dragPreparedIndex = null;
        dragStartX = p.x;
        dragStartY = p.y;
        lastX = p.x;
        lastT = performance.now();
        velocityX = 0;
  
        killProgressAnimation(); // pause autoplay during drag
  
        window.addEventListener(moveEvt, onMove, { passive: false });
        window.addEventListener(upEvt, onUp, { passive: true });
      }
  
      function onMove(e) {
        if (!dragging) return;
  
        const p = getPoint(e);
        const dx = p.x - dragStartX;
        const dy = p.y - dragStartY;
  
        // decide axis lock
        if (!dragLock) {
          if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
            dragLock = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
          }
        }
        if (dragLock === 'y') return; // let page scroll
        e.preventDefault();
  
        dragMoved = true;
  
        // determine direction and prepare neighbor slide once
        const width = wrap.clientWidth || 1;
        if (!dragDir) {
          dragDir = dx < 0 ? 1 : -1; // swipe left -> go next (dir=1)
          dragPreparedIndex = dragDir === 1 ? nextIdx() : prevIdx();
          const to = slides[dragPreparedIndex];
          gsap.set(to, { xPercent: dragDir === 1 ? 100 : -100 });
        }
  
        const pAbs = Math.min(1, Math.max(0, Math.abs(dx) / width)); // 0..1
        const from = slides[current];
        const to = slides[dragPreparedIndex];
  
        if (dragDir === 1) {
          // moving to next: from 0 -> -100, to 100 -> 0
          gsap.set(from, { xPercent: -pAbs * 100 });
          gsap.set(to,   { xPercent: 100 - pAbs * 100 });
        } else {
          // moving to prev: from 0 -> 100, to -100 -> 0
          gsap.set(from, { xPercent: pAbs * 100 });
          gsap.set(to,   { xPercent: -100 + pAbs * 100 });
        }
  
        // velocity
        const now = performance.now();
        const dt = Math.max(1, now - lastT);
        velocityX = (p.x - lastX) / dt; // px/ms
        lastX = p.x;
        lastT = now;
      }
  
      function onUp() {
        if (!dragging) return;
        dragging = false;
        window.removeEventListener(moveEvt, onMove);
        window.removeEventListener(upEvt, onUp);
  
        if (!dragMoved || dragLock === 'y' || !dragPreparedIndex) {
          // snap back if no horizontal drag happened
          animateBackToCurrent();
          return;
        }
  
        const width = wrap.clientWidth || 1;
        const travel = Math.min(1, Math.max(0, Math.abs(lastX - dragStartX) / width)); // 0..1
        const passDist = travel > 0.15;                 // distance threshold
        const passVel  = Math.abs(velocityX) > 0.6;     // velocity threshold
        const accept = passDist || passVel;
  
        if (accept) {
          // finish to neighbor (quick)
          finishToNeighbor();
        } else {
          // revert to current
          animateBackToCurrent();
        }
      }
  
      function getPoint(e) {
        if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        return { x: e.clientX, y: e.clientY };
      }
  
      function animateBackToCurrent() {
        if (dragPreparedIndex == null) {
          // no neighbor prepared (e.g., tap) -> just resume autoplay
          if (inView) startProgressAnimation(current, AUTOPLAY_S);
          return;
        }
        const from = slides[current];
        const to   = slides[dragPreparedIndex];
        killSlideAnimation();
        slideAnimation = gsap.timeline({
          defaults: { ease: 'power2.out', duration: 0.25 },
          onComplete: () => {
            slideAnimation = null;
            // ensure positions
            gsap.set(from, { xPercent: 0 });
            gsap.set(to,   { xPercent: dragDir === 1 ? 100 : -100 });
            if (inView) startProgressAnimation(current, AUTOPLAY_S);
            dragPreparedIndex = null;
          }
        });
        // revert both to their original sides
        slideAnimation
          .to(from, { xPercent: 0 }, 0)
          .to(to,   { xPercent: dragDir === 1 ? 100 : -100 }, 0);
      }
  
      function finishToNeighbor() {
        const target = dragPreparedIndex;
        const from = slides[current];
        const to   = slides[target];
      
        // 👉 move ring update BEFORE the tween, and don't animate it yet
        updateRingsForTarget(target, { animateActive: false });
        setRingValue(target, '0');
      
        killSlideAnimation();
        slideAnimation = gsap.timeline({
          defaults: { ease: 'power2.out', duration: 0.28 },
          onComplete: () => {
            slideAnimation = null;
            current = target;
            dragPreparedIndex = null;
      
            // 👉 start active ring progress only after the slide lands
            if (inView) startProgressAnimation(current, AUTOPLAY_S);
          }
        });
      
        if (dragDir === 1) {
          // next
          slideAnimation
            .to(from, { xPercent: -100 }, 0)
            .to(to,   { xPercent: 0 }, 0);
        } else {
          // prev
          slideAnimation
            .to(from, { xPercent: 100 }, 0)
            .to(to,   { xPercent: 0 }, 0);
        }
      }
      
    }
    attachDrag();
  
    // observer: start/stop autoplay
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target !== wrap) continue;
        if (entry.isIntersecting) {
          inView = true;
          startProgressAnimation(current, AUTOPLAY_S);
        } else {
          inView = false;
          killProgressAnimation();
        }
      }
    }, { threshold: 0.25 });
    io.observe(wrap);
  
    // init
    updateRingsForTarget(0, { animateActive: true });
  })();


  ///////////////////////////////
/// TELEPHONE SECTION
///////////////////////////////

(() => {
    let mm = gsap.matchMedia();
  
    mm.add("(min-width: 768px)", () => {
      const cards = gsap.utils.toArray(".communaute_tel_wrap");
  
      if (cards.length < 3) return;
  
      const OVERLAP = 0.5; // start next at 50% of the previous tween's duration
  
      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut", duration: 1 },
        scrollTrigger: {
          trigger: ".communaute_wrap",
          start: "top bottom",
          end: "bottom bottom",
          scrub: 1,
          anticipatePin: 1,
          // markers: true,
        }
      });
  
      // 1) first tween
      const t1 = tl
        .from(cards[0], { y: "50vw", scale: 0.9, rotate: 0 })
        .from(cards[0].querySelector(".communaute_image_wrap"), { 
          yPercent: -25, 
          ease: "power4.in" 
        }, "<");
  
      // 2) second starts 50% before t1 ends
      const t2 = tl
        .from(cards[1], { y: "100vw", scale: 0.9, opacity: 0.4, rotate: -8 }, `>-=${t1.duration() * OVERLAP}`)
        .from(cards[1].querySelector(".communaute_image_wrap"), { 
          yPercent: -25, 
          ease: "power4.in" 
        }, "<");
  
      // 3) third starts 50% before t2 ends
      const t3 = tl
        .from(cards[2], { y: "100vw", scale: 0.9, opacity: 0.4, rotate: 9 }, `>-=${t2.duration() * OVERLAP}`)
        .from(cards[2].querySelector(".communaute_image_wrap"), { 
          yPercent: -25, 
          ease: "power4.in" 
        }, "<");
    });
  })();
  

///////////////////////////////
/// JOB ELEMENTS LIST
///////////////////////////////


document.addEventListener("DOMContentLoaded", () => {
    const list = document.querySelector('.job_img_collection_list');
    if (!list) return;
  
    const items = Array.from(list.children);
    const clones = items.map(item => item.cloneNode(true));
  
    clones.forEach(clone => {
      list.appendChild(clone);
    });
  });