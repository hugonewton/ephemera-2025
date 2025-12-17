//Last update: 24/11/2025

///////////////////////////////
/// DATA DISAPPEAR (SHOW MORE BUTTON)
///////////////////////////////


document.addEventListener("DOMContentLoaded", () => {
    const delaySeconds = 1; // ⬅️ change this to the delay you want
  
    setTimeout(() => {
      const oldElements = document.querySelectorAll("[data-disappear-old]");
  
      oldElements.forEach(oldEl => {
        const value = oldEl.getAttribute("data-disappear-old");
  
        // Watch for style changes (including display)
        const observer = new MutationObserver(() => {
          const display = window.getComputedStyle(oldEl).display;
          if (display === "none") {
            const newEl = document.querySelector(`[data-disappear-new="${value}"]`);
            if (newEl) {
              newEl.style.display = "none";
            }
          }
        });
  
        observer.observe(oldEl, { attributes: true, attributeFilter: ["style"] });
      });
    }, delaySeconds * 1000);
  });
  