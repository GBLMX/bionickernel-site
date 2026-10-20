/* Books page: topic filter + text search over the list. No build step;
   without JS every entry stays visible. */
(function () {
  var list = document.getElementById("book-list");
  if (!list) return;
  var books = Array.prototype.slice.call(list.querySelectorAll(".book"));
  var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
  var search = document.getElementById("book-search");
  var status = document.getElementById("book-status");
  var empty = document.getElementById("book-empty");
  var active = "all";

  function apply() {
    var q = search ? search.value.trim().toLowerCase() : "";
    var shown = 0;

    books.forEach(function (book) {
      var topics = (book.getAttribute("data-topics") || "").split(" ");
      var byTopic = active === "all" || topics.indexOf(active) !== -1;
      var byText = !q || book.textContent.toLowerCase().indexOf(q) !== -1;
      var visible = byTopic && byText;
      book.hidden = !visible;
      if (visible) shown += 1;
    });

    chips.forEach(function (chip) {
      chip.setAttribute("aria-pressed", chip.getAttribute("data-filter") === active ? "true" : "false");
    });

    if (status) status.textContent = "显示 " + shown + " / " + books.length + " 本";
    if (empty) empty.hidden = shown !== 0;
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      active = chip.getAttribute("data-filter") || "all";
      apply();
    });
  });

  if (search) {
    search.addEventListener("input", apply);
    search.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && search.value) {
        search.value = "";
        apply();
      }
    });
  }

  apply();
})();
