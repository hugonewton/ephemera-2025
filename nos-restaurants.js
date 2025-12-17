//Last update: 24/11/2025

///////////////////////////////
/// AJOUTER LE CHAMP TOUS PAGE NOS RESTAURANTS
///////////////////////////////

document.addEventListener("DOMContentLoaded", function () {
    // Vérifie que la page a le composant restaurants
    const firstItem = document.querySelector(
      ".nos_restaurants_filter_collection_list .nos_restaurants_filter_collection_item"
    );
  
    if (!firstItem) return; // <-- STOP si la page n'a pas ce bloc
  
    const input = firstItem.querySelector("input");
    if (input) {
      input.setAttribute("fs-cmsfilter-element", "clear");
    }
  });
  
  
  document.addEventListener("DOMContentLoaded", function () {
    const radios = document.querySelectorAll(".form_main_radio_label");
  
    if (radios.length === 0) return; // <-- STOP si pas de radios
  
    radios[0].classList.add("active");
  
    radios.forEach(function (radio) {
      radio.addEventListener("click", function () {
        radios.forEach(r => r.classList.remove("active"));
        this.classList.add("active");
      });
    });
  });


///////////////////////////////
/// INITIALIZZE DRAGGABLE FOR NOS RESTAURANTS
///////////////////////////////
  // Usage
initializeDraggableForElements(
    ".nos_restaurants_contain",
    ".nos_restaurants_filter_collection_list",
    ".nos_restaurants_filter_collection_item",
    0, 767,
    {
      arrows: false
    }
  );