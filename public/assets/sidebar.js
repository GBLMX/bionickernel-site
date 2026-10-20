/* Sidebar: collapse toggle (persisted) and in-page scrollspy. */
(function () {
  var root = document.documentElement;
  var KEY = "bn-sidebar";
  var toggle = document.querySelector("[data-sidebar-toggle]");

  function syncToggle() {
    if (!toggle) return;
    var collapsed = root.classList.contains("sb-collapsed");
    toggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
    toggle.setAttribute("aria-label", collapsed ? "展开侧栏" : "收起侧栏");
  }

  if (toggle) {
    syncToggle();
    toggle.addEventListener("click", function () {
      root.classList.toggle("sb-collapsed");
      try {
        localStorage.setItem(KEY, root.classList.contains("sb-collapsed") ? "collapsed" : "expanded");
      } catch (e) {}
      syncToggle();
    });
  }

  var links = Array.prototype.slice.call(document.querySelectorAll(".sb-nav a"));
  var home = null;
  var bySection = {};
  links.forEach(function (link) {
    var href = link.getAttribute("href") || "";
    if (href === "/" || href === "./") home = link;
    if (href.charAt(0) === "#" && href.length > 1) bySection[href.slice(1)] = link;
  });

  var ids = Object.keys(bySection);
  if (!ids.length) return;

  var sections = ids
    .map(function (id) {
      return document.getElementById(id);
    })
    .filter(Boolean)
    .sort(function (a, b) {
      return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
    });
  if (!sections.length) return;

  var current = null;

  function setActive(id) {
    if (id === current) return;
    current = id;
    links.forEach(function (link) {
      if (link.getAttribute("aria-current") === "location") link.removeAttribute("aria-current");
    });
    if (id && bySection[id]) {
      bySection[id].setAttribute("aria-current", "location");
      if (home) home.removeAttribute("aria-current");
    } else if (home) {
      home.setAttribute("aria-current", "page");
    }
  }

  function update() {
    var limit = window.scrollY + window.innerHeight * 0.72;
    var active = null;
    sections.forEach(function (section) {
      if (section.getBoundingClientRect().top + window.scrollY <= limit) active = section.id;
    });
    var last = sections[sections.length - 1];
    var lastBox = last.getBoundingClientRect();
    var atBottom =
      window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
    if (atBottom || lastBox.top < window.innerHeight * 0.85) {
      active = last.id;
    }
    if (window.scrollY < 80) active = null;
    setActive(active);
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      update();
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
})();
