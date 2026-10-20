(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var tip = document.getElementById("ga-tip");
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function svgEl(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function style(el, obj) {
    for (var k in obj) el.style.setProperty(k, obj[k]);
    return el;
  }
  function text(x, y, str, attrs, fill) {
    var t = svgEl("text", attrs || {});
    t.setAttribute("x", x); t.setAttribute("y", y);
    t.textContent = str;
    if (fill) t.style.fill = fill;
    return t;
  }
  function showTip(evt, html) {
    if (!tip) return;
    tip.innerHTML = html;
    tip.classList.add("show");
    moveTip(evt);
  }
  function moveTip(evt) {
    if (!tip) return;
    var pad = 14, w = tip.offsetWidth, h = tip.offsetHeight;
    var x = evt.clientX + pad, y = evt.clientY + pad;
    if (x + w > innerWidth - 8) x = evt.clientX - w - pad;
    if (y + h > innerHeight - 8) y = evt.clientY - h - pad;
    tip.style.left = Math.max(8, x) + "px";
    tip.style.top = Math.max(8, y) + "px";
  }
  function hideTip() { if (tip) tip.classList.remove("show"); }
  function bindTip(node, html) {
    node.addEventListener("pointerenter", function (e) { showTip(e, html); });
    node.addEventListener("pointermove", moveTip);
    node.addEventListener("pointerleave", hideTip);
  }
  function ease(p) { return 1 - Math.pow(1 - p, 3); }
  function animate(dur, fn) {
    if (reduce) { fn(1); return; }
    var t0 = performance.now();
    function step(t) {
      var p = Math.max(0, Math.min(1, (t - t0) / dur));
      fn(ease(p));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------------- overall ---------------- */

  var overall = [
    { label: "记忆", sub: "训练集 · 150", acc: 47.3, lo: 39.1, hi: 55.6, n: 150, k: 71, color: "var(--ga-mem)" },
    { label: "泛化", sub: "GA 留出 · 146", acc: 33.6, lo: 26.0, hi: 41.8, n: 146, k: 49, color: "var(--ga-gen)" },
    { label: "迁移", sub: "张量形式 · 80", acc: 50.0, lo: 38.6, hi: 61.4, n: 80, k: 40, color: "var(--ga-tran)" }
  ];

  function renderOverall() {
    var narrow = innerWidth < 680;
    var W = narrow ? 400 : 760, H = narrow ? 300 : 400;
    var m = narrow ? { l: 34, r: 10, t: 26, b: 64 } : { l: 50, r: 22, t: 34, b: 74 };
    var pw = W - m.l - m.r, ph = H - m.t - m.b, yMax = 70;
    var base = m.t + ph;
    var y = function (v) { return m.t + ph * (1 - v / yMax); };
    var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, "aria-hidden": "true" });

    // grid
    [0, 20, 40, 60].forEach(function (v) {
      var gy = y(v);
      svg.appendChild(svgEl("line", { x1: m.l, x2: W - m.r, y1: gy, y2: gy, "stroke-width": 1 })).style.stroke = "var(--line)";
      svg.appendChild(text(m.l - (narrow ? 7 : 12), gy + 4, v + "%", { "text-anchor": "end", "font-size": narrow ? 10 : 11.5 }, "var(--faint)"));
    });

    // random baseline
    var ry = y(25);
    var rl = svgEl("line", { x1: m.l, x2: W - m.r, y1: ry, y2: ry, "stroke-width": 1.2, "stroke-dasharray": "4 5" });
    rl.style.stroke = "var(--faint)";
    svg.appendChild(rl);

    var slot = pw / 3, bw = narrow ? 58 : 104;
    var bars = [];

    overall.forEach(function (d, i) {
      var cx = m.l + slot * (i + 0.5);
      var x = cx - bw / 2;
      var top = y(d.acc), hiY = y(d.hi), loY = y(d.lo);

      var rect = svgEl("rect", { x: x, y: base, width: bw, height: 0, rx: 5 });
      rect.style.fill = d.color;
      svg.appendChild(rect);

      var whisk = svgEl("g", { opacity: 0 });
      var ln = svgEl("line", { x1: cx, x2: cx, y1: loY, y2: hiY, "stroke-width": 1.4 });
      ln.style.stroke = "var(--fg)";
      whisk.appendChild(ln);
      [loY, hiY].forEach(function (yy) {
        var cap = svgEl("line", { x1: cx - 7, x2: cx + 7, y1: yy, y2: yy, "stroke-width": 1.4 });
        cap.style.stroke = "var(--fg)";
        whisk.appendChild(cap);
      });
      svg.appendChild(whisk);

      var val = text(cx, hiY - (narrow ? 8 : 12), d.acc.toFixed(1) + "%", { "text-anchor": "middle", "font-size": narrow ? 12 : 15, "font-weight": 600 }, "var(--fg)");
      val.style.opacity = 0;
      svg.appendChild(val);

      var lbl = text(cx, base + (narrow ? 22 : 26), d.label, { "text-anchor": "middle", "font-size": narrow ? 11.5 : 13.5, "font-weight": 500 }, "var(--fg)");
      svg.appendChild(lbl);
      var sub = text(cx, base + (narrow ? 37 : 44), d.sub, { "text-anchor": "middle", "font-size": narrow ? 9 : 11 }, "var(--faint)");
      svg.appendChild(sub);

      var hit = svgEl("rect", {
        x: cx - slot / 2, y: m.t, width: slot, height: ph,
        fill: "transparent", tabindex: 0, role: "graphics-symbol",
        "aria-label": d.label + " " + d.acc + "%"
      });
      bindTip(hit, "<b>" + d.label + "</b> " + d.acc.toFixed(1) + "%" +
        "<br><span class='dim'>" + d.k + " / " + d.n + " 正确</span>" +
        "<br><span class='dim'>95% CI " + d.lo.toFixed(1) + "–" + d.hi.toFixed(1) + "%</span>");
      hit.addEventListener("focus", function () {
        var r = hit.getBoundingClientRect();
        showTip({ clientX: r.left + r.width / 2, clientY: r.top + 10 },
          "<b>" + d.label + "</b> " + d.acc.toFixed(1) + "%<br><span class='dim'>" + d.k + " / " + d.n + " 正确</span>");
      });
      hit.addEventListener("blur", hideTip);
      svg.appendChild(hit);

      bars.push(rect);
    });

    var host = document.getElementById("overall");
    host.innerHTML = "";
    host.appendChild(svg);
    animate(760, function (p) {
      overall.forEach(function (d, i) {
        var h = (base - y(d.acc)) * p;
        bars[i].setAttribute("y", base - h);
        bars[i].setAttribute("height", h);
      });
    });
    // labels/CI after bars
    setTimeout(function () {
      svg.querySelectorAll("g[opacity]").forEach(function (g) { g.setAttribute("opacity", 1); });
      svg.querySelectorAll("text").forEach(function (t) {
        if (/%$/.test(t.textContent) && t.getAttribute("font-weight") === "600") t.style.opacity = 1;
      });
    }, reduce ? 0 : 640);
  }

  /* ---------------- category ---------------- */

  var cats = {
    ga: {
      note: "GA 留出集：高维规则外推表现最好，新运算与投影分解最弱。",
      rows: [
        { label: "GA-高维 Cl(5)", short: "高维 Cl(5)", acc: 80, lo: 56, hi: 94, k: 16, n: 20 },
        { label: "线代-行列式", short: "行列式", acc: 60, lo: 36, hi: 81, k: 12, n: 20 },
        { label: "GA-几何积", short: "几何积", acc: 33, lo: 20, hi: 47, k: 17, n: 52 },
        { label: "线代-矩阵求逆", short: "矩阵求逆", acc: 14, lo: 2, hi: 43, k: 2, n: 14 },
        { label: "GA-投影分解", short: "投影分解", acc: 8, lo: 1, hi: 26, k: 2, n: 25 },
        { label: "Cl31-闵可夫斯基", short: "Cl(3,1)", acc: 0, lo: 0, hi: 22, k: 0, n: 15 }
      ]
    },
    tensor: {
      note: "张量迁移：同构的矩阵表示任务很强，未训练过的新运算几乎为零。",
      rows: [
        { label: "张量-二重向量", short: "二重向量", acc: 87, lo: 60, hi: 98, k: 13, n: 15 },
        { label: "张量-张量积", short: "张量积", acc: 83, lo: 52, hi: 98, k: 10, n: 12 },
        { label: "张量-升降指标", short: "升降指标", acc: 60, lo: 32, hi: 84, k: 9, n: 15 },
        { label: "张量-度规内积", short: "度规内积", acc: 33, lo: 12, hi: 62, k: 5, n: 15 },
        { label: "张量-缩并", short: "缩并", acc: 25, lo: 5, hi: 57, k: 3, n: 12 },
        { label: "张量-对称分解", short: "对称分解", acc: 0, lo: 0, hi: 31, k: 0, n: 10 }
      ]
    }
  };

  function band(acc) {
    return acc >= 60 ? "var(--ga-good)" : acc >= 30 ? "var(--ga-mid)" : "var(--ga-bad)";
  }

  var currentKey = "ga";
  function renderCats(key) {
    currentKey = key;
    var data = cats[key];
    var host = document.getElementById("cats");
    host.innerHTML = "";
    document.getElementById("cat-note").textContent = data.note;

    var narrow = innerWidth < 680;
    var W = narrow ? 400 : 760, H = narrow ? 330 : 404;
    var m = narrow ? { l: 94, r: 36, t: 14, b: 38 } : { l: 164, r: 66, t: 18, b: 42 };
    var pw = W - m.l - m.r, ph = H - m.t - m.b;
    var n = data.rows.length, slot = ph / n, bh = narrow ? 20 : 24;
    var x = function (v) { return m.l + pw * v / 100; };
    var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, "aria-hidden": "true" });

    [0, 25, 50, 75, 100].forEach(function (v) {
      var gx = x(v);
      var gl = svgEl("line", { x1: gx, x2: gx, y1: m.t - 4, y2: m.t + ph + 4, "stroke-width": 1 });
      gl.style.stroke = "var(--line)";
      svg.appendChild(gl);
      svg.appendChild(text(gx, H - m.b + (narrow ? 18 : 22), v + "%", { "text-anchor": "middle", "font-size": narrow ? 9.5 : 11 }, "var(--faint)"));
    });

    data.rows.forEach(function (d, i) {
      var cy = m.t + slot * (i + 0.5), by = cy - bh / 2;
      var color = band(d.acc);

      var label = text(m.l - (narrow ? 8 : 14), cy + 4, narrow ? d.short : d.label, { "text-anchor": "end", "font-size": narrow ? 10.5 : 12.5 }, "var(--dim)");
      svg.appendChild(label);

      var bar = svgEl("rect", { x: m.l, y: by, width: 0, height: bh, rx: 4 });
      bar.style.fill = color;
      svg.appendChild(bar);

      var whisk = svgEl("g", { opacity: 0 });
      var ln = svgEl("line", { x1: x(d.lo), x2: x(d.hi), y1: cy, y2: cy, "stroke-width": 1.2 });
      ln.style.stroke = "var(--fg)";
      whisk.appendChild(ln);
      [x(d.lo), x(d.hi)].forEach(function (xx) {
        var cap = svgEl("line", { x1: xx, x2: xx, y1: cy - 5, y2: cy + 5, "stroke-width": 1.2 });
        cap.style.stroke = "var(--fg)";
        whisk.appendChild(cap);
      });
      svg.appendChild(whisk);

      var inside = d.hi > 92;
      var val = text(inside ? x(d.hi) - 4 : x(d.hi) + 6, cy + 4.5, d.acc + "%", {
        "text-anchor": inside ? "end" : "start", "font-size": narrow ? 10.5 : 12, "font-weight": 600
      }, inside ? "#ffffff" : "var(--fg)");
      val.style.opacity = 0;
      svg.appendChild(val);

      animate(560, function (p) {
        bar.setAttribute("width", Math.max(0, (x(d.acc) - m.l) * p));
      });
      setTimeout(function () {
        whisk.setAttribute("opacity", 1);
        val.style.opacity = 1;
      }, reduce ? 0 : 380);

      var hit = svgEl("rect", {
        x: m.l, y: cy - slot / 2, width: pw, height: slot, fill: "transparent",
        tabindex: 0, role: "graphics-symbol", "aria-label": d.label + " " + d.acc + "%"
      });
      bindTip(hit, "<b>" + d.label + "</b> " + d.acc + "%" +
        "<br><span class='dim'>" + d.k + " / " + d.n + " 正确</span>" +
        "<br><span class='dim'>95% CI " + d.lo + "–" + d.hi + "%</span>");
      hit.addEventListener("focus", function () {
        var r = hit.getBoundingClientRect();
        showTip({ clientX: r.left + 180, clientY: r.top + r.height / 2 },
          "<b>" + d.label + "</b> " + d.acc + "%<br><span class='dim'>" + d.k + " / " + d.n + " 正确</span>");
      });
      hit.addEventListener("blur", hideTip);
      svg.appendChild(hit);
    });

    host.appendChild(svg);
  }

  var tabGa = document.getElementById("tab-ga");
  var tabTensor = document.getElementById("tab-tensor");
  if (tabGa && tabTensor) {
    tabGa.addEventListener("click", function () {
      tabGa.setAttribute("aria-pressed", "true");
      tabTensor.setAttribute("aria-pressed", "false");
      renderCats("ga");
    });
    tabTensor.addEventListener("click", function () {
      tabTensor.setAttribute("aria-pressed", "true");
      tabGa.setAttribute("aria-pressed", "false");
      renderCats("tensor");
    });
  }

  /* ---------------- init ---------------- */

  var wasNarrow = innerWidth < 680, rt;
  addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      var n = innerWidth < 680;
      if (n !== wasNarrow) {
        wasNarrow = n;
        renderOverall();
        renderCats(currentKey);
      }
    }, 160);
  });

  if (document.getElementById("overall") && document.getElementById("cats")) {
    renderOverall();
    renderCats("ga");
  }
})();
