//Last update: 24/11/2025

///////////////////////////////
/// SLIDER EVENT ITEMS
//////////////////////////////


/**
 * GSAP Slider (percent-based)
 * - NO JS-assigned widths. We only animate xPercent.
 * - Expects CSS to make each slide 100% of the wrapper width.
 * - Arrows, swipe, autoplay, dots supported.
 */
(function () {
    if (typeof gsap === "undefined") { console.warn("[Slider] GSAP not found."); return; }
  
    const DEFAULTS = {
      // Selectors
      wrapperSel: ".event_item_wrap",
      trackSel: ".event_item_slider_collection_list",
      slideSel: ".event_item_slider_collection_item",
      arrowsWrapSel: ".event_img_slider_arrow_list_wrap",
      arrowSel: ".arrow_item_wrap",   // first = prev, second = next
  
      // Dots (optional)
      dotsWrapSel: null,              // e.g., ".slider_dot_list_layout"
      dotSel: ".slider_dot",
  
      // Behavior
      duration: 0.6,
      ease: "power3.inOut",
      loop: true,
  
      // Swipe
      swipe: true,
      swipeThreshold: 0.18, // fraction of wrapper width
  
      // Autoplay
      autoplay: false,
      autoplayDelay: 3000,
      autoplayPauseOnHover: true,
      autoplayPauseOnFocus: true,
      autoplayPauseOnInteraction: true
    };
  
    const clampLoop = (i, total) => (i % total + total) % total;
    const clamp = (i, min, max) => Math.min(Math.max(i, min), max);
    const debounce = (fn, wait) => { let t; return function(){ clearTimeout(t); t=setTimeout(()=>fn.apply(this, arguments), wait); }; };
  
    function Slider(root, cfg) {
      this.cfg = Object.assign({}, DEFAULTS, cfg || {});
      this.root = root;
  
      this.track = root.querySelector(this.cfg.trackSel);
      this.slides = Array.from(root.querySelectorAll(this.cfg.slideSel));
  
      this.arrowsWrap = root.querySelector(this.cfg.arrowsWrapSel);
      this.arrows = this.arrowsWrap ? this.arrowsWrap.querySelectorAll(this.cfg.arrowSel) : null;
      this.prevBtn = this.arrows?.[0] || null;
      this.nextBtn = this.arrows?.[1] || null;
  
      this.dotsWrap = this.cfg.dotsWrapSel ? root.querySelector(this.cfg.dotsWrapSel) : null;
      this.dotTemplate = this.dotsWrap ? this.dotsWrap.querySelector(this.cfg.dotSel) : null;
      this.dotItems = [];
  
      this.total = this.slides.length;
      this.index = 0;
      this.widthPx = 0;        // only used to compute swipe thresholds (we never set widths)
      this.anim = null;
  
      this.autoTm = null;
      this.isAutoPlaying = false;
      this.isHoveredOrFocused = false;
  
      if (!this.track || this.total === 0) return;
      this._init();
    }
  
    Slider.prototype._init = function () {
      const c = this.cfg;
  
      // We only touch transform; layout is owned by CSS.
      this.track.style.willChange = "transform";
  
      if (this.total < 2 && this.arrowsWrap) this.arrowsWrap.style.display = "none";
  
      if (this.prevBtn) this.prevHandler = this.prev.bind(this), this.prevBtn.addEventListener("click", this.prevHandler);
      if (this.nextBtn) this.nextHandler = this.next.bind(this), this.nextBtn.addEventListener("click", this.nextHandler);
  
      this._buildDots();
  
      // Width is only read, never written
      this.measure = this.measure.bind(this);
      if ("ResizeObserver" in window) {
        this.ro = new ResizeObserver(this.measure);
        this.ro.observe(this.root);
      } else {
        this._resizeHandler = debounce(this.measure, 120);
        window.addEventListener("resize", this._resizeHandler);
      }
  
      if (c.swipe) this._setupSwipe();
      if (c.autoplay && this.total > 1) this._setupAutoplay();
  
      this._visHandler = () => { if (document.hidden) this.pause(); else this.play(); };
      document.addEventListener("visibilitychange", this._visHandler);
  
      // Initial position
      gsap.set(this.track, { xPercent: -this.index * 100 });
      this.measure();
      this._updateUI();
    };
  
    // Dots
    Slider.prototype._buildDots = function () {
      if (!this.dotsWrap || !this.dotTemplate) return;
  
      const existing = Array.from(this.dotsWrap.querySelectorAll(this.cfg.dotSel));
      existing.slice(1).forEach(n => n.remove());
  
      this.dotTemplate.classList.remove("active");
      this.dotTemplate.setAttribute("aria-selected", "false");
  
      this.dotItems = [];
      for (let i = 0; i < this.total; i++) {
        const dot = i === 0 ? this.dotTemplate : this.dotTemplate.cloneNode(true);
        dot.setAttribute("role", "button");
        dot.setAttribute("tabindex", "0");
        dot.dataset.index = String(i);
        dot.addEventListener("click", () => this.goTo(i));
        if (i !== 0) this.dotsWrap.appendChild(dot);
        this.dotItems.push(dot);
      }
    };
  
    // Measure (read-only)
    Slider.prototype.measure = function () {
      // Read wrapper width to compute swipe thresholds; do NOT set any widths.
      const w = this.root.getBoundingClientRect().width;
      if (Number.isFinite(w) && w > 0) {
        this.widthPx = Math.round(w);
      }
      // Keep the track aligned to index in case layout changed
      gsap.set(this.track, { xPercent: -this.index * 100 });
    };
  
    // Navigation
    Slider.prototype._toIndex = function (toIdx) {
      const c = this.cfg;
      const tgt = c.loop ? clampLoop(toIdx, this.total) : clamp(toIdx, 0, this.total - 1);
      if (!c.loop && tgt === this.index) return;
  
      this.index = tgt;
      this._updateUI();
  
      if (this.anim) this.anim.kill();
      this.anim = gsap.to(this.track, {
        xPercent: -this.index * 100,
        duration: c.duration,
        ease: c.ease
      });
    };
    Slider.prototype.next = function () { this._toIndex(this.index + 1); this._kickAutoplay(); };
    Slider.prototype.prev = function () { this._toIndex(this.index - 1); this._kickAutoplay(); };
    Slider.prototype.goTo = function (i) { this._toIndex(i); this._kickAutoplay(); };
  
    // UI
    Slider.prototype._updateUI = function () {
      this.slides.forEach((s, i) => s.setAttribute("aria-hidden", i === this.index ? "false" : "true"));
      if (this.dotItems?.length) {
        this.dotItems.forEach((d, i) => {
          if (i === this.index) { d.classList.add("active"); d.setAttribute("aria-selected", "true"); }
          else { d.classList.remove("active"); d.setAttribute("aria-selected", "false"); }
        });
      }
    };
  
    // Swipe (percent-based)
    Slider.prototype._setupSwipe = function () {
      const c = this.cfg;
      let dragging = false, startX = 0, startPercent = 0;
  
      const onDown = (e) => {
        const p = e.touches ? e.touches[0] : e;
        dragging = true;
        startX = p.clientX;
        startPercent = -this.index * 100;
        if (this.anim) this.anim.kill();
        this.track.style.cursor = "grabbing";
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp, { once: true });
        window.addEventListener("touchmove", onMove, { passive: false });
        window.addEventListener("touchend", onUp, { once: true });
        if (c.autoplay && c.autoplayPauseOnInteraction) this.pause();
      };
  
      const onMove = (e) => {
        if (!dragging) return;
        const p = e.touches ? e.touches[0] : e;
        if (e.cancelable) e.preventDefault();
  
        // Convert pixel delta to percent delta relative to wrapper width
        const dx = p.clientX - startX;
        const w = this.widthPx || this.root.getBoundingClientRect().width || 1;
        const deltaPercent = (dx / w) * 100;
        let xp = startPercent + deltaPercent;
  
        if (!c.loop) {
          const min = -(this.total - 1) * 100, max = 0;
          if (xp < min) xp = min + (xp - min) * 0.35;
          if (xp > max) xp = max + (xp - max) * 0.35;
        }
        gsap.set(this.track, { xPercent: xp });
      };
  
      const onUp = (e) => {
        dragging = false;
        this.track.style.cursor = "";
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("touchmove", onMove);
  
        const p = e.changedTouches ? e.changedTouches[0] : e;
        const dx = p.clientX - startX;
        const w = this.widthPx || this.root.getBoundingClientRect().width || 1;
        const passed = Math.abs(dx) > w * this.cfg.swipeThreshold;
  
        if (passed) (dx < 0 ? this.next() : this.prev());
        else gsap.to(this.track, { xPercent: -this.index * 100, duration: this.cfg.duration, ease: this.cfg.ease });
  
        if (c.autoplay && c.autoplayPauseOnInteraction) this.play();
      };
  
      this._swipeDown = onDown;
      this.track.addEventListener("pointerdown", onDown);
      this.track.addEventListener("touchstart", (e) => { if (e.touches?.length === 1) onDown(e); }, { passive: true });
    };
  
    // Autoplay
    Slider.prototype._setupAutoplay = function () {
      const c = this.cfg;
      const enter = () => { this.isHoveredOrFocused = true; this.pause(); };
      const leave = () => { this.isHoveredOrFocused = false; this.play(); };
  
      if (c.autoplayPauseOnHover) {
        this.root.addEventListener("mouseenter", enter);
        this.root.addEventListener("mouseleave", leave);
        this._hoverHandlers = { enter, leave };
      }
      if (c.autoplayPauseOnFocus) {
        this.root.addEventListener("focusin", enter);
        this.root.addEventListener("focusout", leave);
        this._focusHandlers = { enter, leave };
      }
  
      this.play();
    };
    Slider.prototype._tick = function () {
      const delay = Math.max(200, Number(this.cfg.autoplayDelay) || 0) / 1000;
      this.autoTm = gsap.delayedCall(delay, () => { this.next(); this._tick(); });
    };
    Slider.prototype.play = function () {
      if (!this.cfg.autoplay || this.total < 2) return;
      if (this.isHoveredOrFocused) return;
      if (this.isAutoPlaying) return;
      this.isAutoPlaying = true;
      this._clearAuto();
      this._tick();
    };
    Slider.prototype.pause = function () { this.isAutoPlaying = false; this._clearAuto(); };
    Slider.prototype._kickAutoplay = function () {
      if (!this.cfg.autoplay) return;
      this._clearAuto();
      if (!this.isHoveredOrFocused) this._tick();
    };
    Slider.prototype._clearAuto = function () { if (this.autoTm) { this.autoTm.kill(); this.autoTm = null; } };
  
    // Cleanup
    Slider.prototype.destroy = function () {
      if (this.prevBtn && this.prevHandler) this.prevBtn.removeEventListener("click", this.prevHandler);
      if (this.nextBtn && this.nextHandler) this.nextBtn.removeEventListener("click", this.nextHandler);
      if (this.ro) this.ro.disconnect();
      if (this._resizeHandler) window.removeEventListener("resize", this._resizeHandler);
      if (this._swipeDown) {
        this.track.removeEventListener("pointerdown", this._swipeDown);
        this.track.removeEventListener("touchstart", this._swipeDown);
      }
      if (this._hoverHandlers) {
        this.root.removeEventListener("mouseenter", this._hoverHandlers.enter);
        this.root.removeEventListener("mouseleave", this._hoverHandlers.leave);
      }
      if (this._focusHandlers) {
        this.root.removeEventListener("focusin", this._focusHandlers.enter);
        this.root.removeEventListener("focusout", this._focusHandlers.leave);
      }
      if (this._visHandler) document.removeEventListener("visibilitychange", this._visHandler);
      this.pause();
      if (this.anim) this.anim.kill();
    };
  
    // Public API
    window.GsapSlider = {
      create(root, config) {
        if (!root || root._gsapSlider) return root?._gsapSlider || null;
        const inst = new Slider(root, config);
        root._gsapSlider = inst;
        return inst;
      },
      initAll(config) {
        const cfg = Object.assign({}, DEFAULTS, config || {});
        const wrappers = document.querySelectorAll(cfg.wrapperSel);
        const out = [];
        wrappers.forEach(w => { if (!w._gsapSlider) out.push(this.create(w, cfg)); });
        return out;
      }
    };
  
    // Auto-init
    const kick = () => { window.GsapSlider.initAll(); };
    if (window.Webflow && Array.isArray(window.Webflow.push)) { window.Webflow.push(kick); }
    else if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", kick, { once: true }); }
    else { kick(); }
  })();
  
  
  
  
  
  
  GsapSlider.initAll({
    wrapperSel: ".event_item_wrap",
    trackSel: ".event_item_slider_collection_list",
    slideSel: ".event_item_slider_collection_item",
    arrowsWrapSel: ".event_img_slider_arrow_list_wrap",
    arrowSel: ".arrow_item_wrap",
  
    // turn on dots:
    dotsWrapSel: null, // the container inside each .event_item_wrap
    dotSel: ".slider_dot",                  // a single template dot inside that container
  
    // autoplay example:
    autoplay: false,
    autoplayDelay: 4000,
  
    loop: true,
    swipe: true,
    duration: 0.5
  });
  
  GsapSlider.initAll({
    wrapperSel: ".event_recap_slider_wrap",
    trackSel: ".event_recap_slider_collection_list",
    slideSel: ".event_recap_slider_collection_item",
    arrowsWrapSel: ".event_img_slider_arrow_list_wrap",
    arrowSel: ".arrow_item_wrap",
  
    // turn on dots:
    dotsWrapSel: ".slider_dot_list_layout", // the container inside each .event_item_wrap
    dotSel: ".slider_dot",                  // a single template dot inside that container
  
    // autoplay example:
    autoplay: true,
    autoplayDelay: 5000,
  
    loop: true,
    swipe: true,
    duration: 0.5
  });
  

  




///////////////////////////////
/// OPEN EVENT RECAP
//////////////////////////////


/* Minimal GSAP modal controller
   - Trigger:  [data-event-trigger="value"]
   - Target:   [data-event-destination="value"]
   - Animates: .event_recap_item_wrap (wrapper), .event_recap_item_bg (bg), .event_recap_item_layout (modal)
*/
(function () {
    if (typeof gsap === "undefined") { console.warn("[Modal] GSAP missing"); return; }
  
    const SEL = {
      triggerAttr: "data-event-trigger",
      destAttr: "data-event-destination",
      wrap: ".event_recap_item_wrap",
      bg: ".event_recap_item_bg",
      modal: ".event_recap_item_layout",
      closeBtn: ".button_close_wrap"
    };
  
    const timelines = new WeakMap(); // dest -> tl
    const openSet = new Set();
  
    function $(root, sel) { return root ? root.querySelector(sel) : null; }
    function getDest(val) { return document.querySelector(`[${SEL.destAttr}="${val}"]`); }
  
    function getTL(dest) {
      let tl = timelines.get(dest);
      if (tl) return tl;
  
      const wrap  = $(dest, SEL.wrap)  || dest;
      const bg    = $(dest, SEL.bg);
      const modal = $(dest, SEL.modal);
  
      // gsap.set(wrap,  { display: "none" });
      // if (bg)   gsap.set(bg,   { autoAlpha: 0 });
      // if (modal)gsap.set(modal,{ autoAlpha: 0, y: 24, scale: 0.98 });
  
      tl = gsap.timeline({
        paused: true,
        onStart: () => { gsap.set(wrap, { display: "block" }); openSet.add(dest); },
        onReverseComplete: () => { gsap.set(wrap, { display: "none" }); openSet.delete(dest); }
      })
      .from(bg || {},    { autoAlpha: 0, duration: 0.3, ease: "power2.out" }, 0)
      .from(modal || {}, { clipPath: "inset(100% 0 0 0)", y:100, duration: 0.5, ease: "power3.out" },"<");
  
      timelines.set(dest, tl);
      return tl;
    }
  
    function openDest(dest)   { getTL(dest).play(0); }
    function closeDest(dest)  { getTL(dest).reverse(); }
  
    // --- Event delegation (clicks) ---
    document.addEventListener("click", (e) => {
      const trg = e.target;
  
      // 1) Open on trigger
      const btn = trg.closest?.(`[${SEL.triggerAttr}]`);
      if (btn) {
        e.preventDefault();
        const val = btn.getAttribute(SEL.triggerAttr);
        const dest = getDest(val);
        if (dest) openDest(dest);
        lockScroll();
        return;
      }
  
      // 2) Close on close button inside any open destination
      const close = trg.closest?.(SEL.closeBtn);
      if (close) {
        const dest = close.closest?.(`[${SEL.destAttr}]`);
        if (dest && openSet.has(dest)) { e.preventDefault(); closeDest(dest); }
        unlockScroll();
        return;
      }
  
      // 3) Click outside modal closes (on the wrapper/backdrop)
      const dest = trg.closest?.(`[${SEL.destAttr}]`);
      if (dest && openSet.has(dest)) {
        const modal = $(dest, SEL.modal);
        const clickedInside = modal && (trg === modal || modal.contains(trg));
        if (!clickedInside) closeDest(dest);
        unlockScroll();
      }
    });
  
    // --- Esc to close the most recently opened modal ---
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      // close the last opened (simple LIFO)
      const last = Array.from(openSet).pop();
      if (last) { e.preventDefault(); closeDest(last); }
    });
  
    // Optional public API
    window.GsapModal = {
      open: (value)  => { const d = getDest(value); if (d) openDest(d); },
      close: (value) => { const d = getDest(value); if (d) closeDest(d); }
    };
  })();
  