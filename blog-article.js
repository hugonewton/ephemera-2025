//Last update: 24/11/2025

///////////////////////////////
/// SHARE ARTICLES ON BLOG
//////////////////////////////

document.addEventListener("DOMContentLoaded", function () {
    const pageUrl = encodeURIComponent(window.location.href);
    const pageTitle = encodeURIComponent(document.title);
  
    document.querySelectorAll("li[data-platform]").forEach(item => {
      const platform = item.getAttribute("data-platform");
      const link = item.querySelector("a");
      if (!link) return;
  
      let shareUrl = "";
  
      switch (platform) {
        case "linkedin":
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`;
          break;
        case "facebook":
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
          break;
        case "x": // Twitter
          shareUrl = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`;
          break;
      }
  
      if (shareUrl) {
        link.setAttribute("href", shareUrl);
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      }
    });
  });