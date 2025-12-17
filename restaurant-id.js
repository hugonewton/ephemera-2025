//Last update: 24/11/2025

initializeDraggableForElements(
    ".all_restaurant_collection_list_wrapper[data-draggable='true']",
    ".all_restaurant_collection_list",
    ".all_restaurant_collection_item",
    0, Infinity, 
    {
      arrows: {
        wrap: ".all_restaurant_arrow_wrap[data-target='all_restaurant']",
        item: ".arrow_item_wrap"
      }
    }
  );

  
///////////////////////////////
/// SLIDER RESTAURANT EN MODE STORY
///////////////////////////////

(function () {
    const DEFAULT_AUTOPLAY_MS = 5000;
    const SLIDE_ANIM_MS = 400;
    const isMobile = () => window.matchMedia('(max-width: 767px)').matches;
  
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('.restaurant_slider_layout').forEach((layout) => {
        const track = layout.querySelector('.restaurant_slider_collection_list');
        const slides = Array.from(layout.querySelectorAll('.restaurant_slider_collection_item'));
        const arrowWrap = layout.querySelector('.restaurant_slider_arrow_wrap');
        const arrows = arrowWrap ? Array.from(arrowWrap.querySelectorAll('.arrow_item_wrap')) : [];
        const barWrap = layout.querySelector('.slider_progress_bar_collection_list');
        const bars = barWrap ? Array.from(barWrap.querySelectorAll('.slider_progress_bar_wrap')) : [];
        const activeBars = bars.map(b => b.querySelector('.slider_progress_bar_active'));
        if (!track || slides.length === 0) return;
  
        const count = slides.length;
        const autoplayMsAttr = parseInt(layout.getAttribute('data-autoplay'), 10);
        const AUTOPLAY_MS = Number.isFinite(autoplayMsAttr) ? autoplayMsAttr : DEFAULT_AUTOPLAY_MS;
        const AUTOPLAY_ENABLED = AUTOPLAY_MS > 0;
  
        let index = 0, timerId = null;
  
        function setTranslateX(i, animate = true) {
          track.style.transition = animate ? `transform ${SLIDE_ANIM_MS}ms ease` : 'none';
          track.style.transform = `translateX(-${i * 100}%)`;
        }
        const normalize = (i) => (i % count + count) % count;
  
        function resetAllBars() {
          activeBars.forEach(bar => { if (bar) { bar.style.transition = 'none'; bar.style.width = '0%'; } });
        }
        function updateBars(i) {
          activeBars.forEach((bar, idx) => {
            if (!bar) return;
            bar.style.transition = 'none';
            if (idx < i) bar.style.width = '100%';
            else if (idx > i) bar.style.width = '0%';
          });
        }
        function animateActiveBar(i) {
          const bar = activeBars[i];
          if (!bar || !AUTOPLAY_ENABLED) return;
          bar.style.transition = 'none';
          bar.style.width = '0%';
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              bar.style.transition = `width ${AUTOPLAY_MS}ms linear`;
              bar.style.width = '100%';
            });
          });
        }
  
        function stopAutoplay() { if (timerId) clearTimeout(timerId); timerId = null; }
        function startAutoplay() {
          if (!AUTOPLAY_ENABLED) return;
          stopAutoplay();
          timerId = setTimeout(() => { goTo(index + 1, true); startAutoplay(); }, AUTOPLAY_MS);
        }
  
        function goTo(targetIndex, animate = true) {
          const newIndex = normalize(targetIndex);
          if (newIndex === 0 && index === count - 1) resetAllBars();
          index = newIndex;
          setTranslateX(index, animate);
          updateBars(index);
          animateActiveBar(index);
        }
  
        // Arrows
        if (arrows[0]) arrows[0].addEventListener('click', () => { stopAutoplay(); goTo(index - 1, true); startAutoplay(); });
        if (arrows[1]) arrows[1].addEventListener('click', () => { stopAutoplay(); goTo(index + 1, true); startAutoplay(); });
  
        // Progress bars
        bars.forEach((barEl, i) => {
          barEl.addEventListener('click', () => { stopAutoplay(); goTo(i, true); startAutoplay(); });
        });
  
        // Swipe (mobile)
        let startX = 0, startY = 0, deltaX = 0, deltaY = 0, swiping = false;
        const SWIPE_THRESHOLD = 40, ANGLE_LOCK = 10;
  
        layout.addEventListener('touchstart', (e) => {
          if (!isMobile()) return;
          const t = e.touches[0];
          startX = t.clientX; startY = t.clientY;
          deltaX = 0; deltaY = 0; swiping = false;
          stopAutoplay();
        }, { passive: true });
  
        layout.addEventListener('touchmove', (e) => {
          if (!isMobile()) return;
          const t = e.touches[0];
          deltaX = t.clientX - startX;
          deltaY = t.clientY - startY;
          if (!swiping && Math.abs(deltaX) > Math.abs(deltaY) + ANGLE_LOCK) swiping = true;
          if (swiping) e.preventDefault();
        }, { passive: false });
  
        layout.addEventListener('touchend', () => {
          if (!isMobile()) return;
          if (swiping && Math.abs(deltaX) > SWIPE_THRESHOLD) goTo(deltaX > 0 ? index - 1 : index + 1, true);
          startAutoplay();
        }, { passive: true });
  
        // Zones (ensure exist, bind like arrows)
        let zoneWrap = layout.querySelector('.restaurant_slider_clickable_zone_wrap');
        if (!zoneWrap) {
          zoneWrap = document.createElement('div');
          zoneWrap.className = 'restaurant_slider_clickable_zone_wrap';
          layout.appendChild(zoneWrap);
        }
  
        if (getComputedStyle(layout).position === 'static') layout.style.position = 'relative';
        Object.assign(zoneWrap.style, { position: 'absolute', inset: '0', zIndex: '30', pointerEvents: 'auto' });
  
        let zones = Array.from(zoneWrap.querySelectorAll('.restaurant_slider_clickable_zone'));
  
        if (zones[0]) zones[0].addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); stopAutoplay(); goTo(index - 1, true); startAutoplay(); });
        if (zones[1]) zones[1].addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); stopAutoplay(); goTo(index + 1, true); startAutoplay(); });
  
        // Hover pause (desktop)
        layout.addEventListener('mouseenter', stopAutoplay);
        layout.addEventListener('mouseleave', startAutoplay);
  
        goTo(0, false);
        startAutoplay();
        window.addEventListener('resize', () => setTranslateX(index, false));
      });
    });
  })();



///////////////////////////////
/// HERO ANIMATION
///////////////////////////////

document.addEventListener('DOMContentLoaded', () => {
    const tracks = document.querySelectorAll('.restaurant_hero_track');
    if (!tracks.length) return; // no matching section on this page → do nothing
  
    tracks.forEach((track) => {
      const video = track.querySelector('.restaurant_hero_video_wrap');
      const logo  = track.querySelector('.restaurant_hero_logo_img');
      const city  = track.querySelector('.restaurant_hero_city_wrap');
      const text  = track.querySelector('.restaurant_hero_text_contain');
  
      if (!video || !logo || !text) return; // required children missing → skip
  
      const tl = gsap.timeline({ paused: true })
        .to(logo,  { y: -200, opacity: 0 })
        .to(city,  { y: -200, opacity: 0 }, "<")
        .to(video, { opacity: 0.2 }, "<")
        .from(text, { y: 200, opacity: 0 }, "<");
  
      ScrollTrigger.create({
        trigger: track,
        start: "10% top",
        animation: tl,
        toggleActions: "play complete play reverse",
        // scrub: true, // uncomment if you want smoothing
        // markers: true,
      });
    });  
  });
  

///////////////////////////////
/// HEAD TO MENU
//////////////////////////////

document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".button_main_wrap[data-menu]");
    if (!buttons.length) return; // Stop if no matching buttons
  
    const currentUrl = window.location.origin; // e.g. https://current-url.com
  
    buttons.forEach(button => {
      const value = button.getAttribute("data-menu");
      const link = button.querySelector("a");
      if (link && value) {
        link.href = `${currentUrl}/menu/${value}`;
      }
    });
  });
  

///////////////////////////////
/// ADD TODAY TO THE TIME
//////////////////////////////


document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".restaurant_horaire_item_wrap");
  if (!items.length) return;

  // getDay() returns 0 for Sunday, 1 for Monday, etc.
  let todayIndex = new Date().getDay(); 

  // Adjust so Monday = 0 ... Sunday = 6
  todayIndex = todayIndex === 0 ? 6 : todayIndex - 1;

  // Add class "today" to the corresponding item
  if (items[todayIndex]) {
    items[todayIndex].classList.add("today");
  }
});