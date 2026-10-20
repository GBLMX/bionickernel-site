/* Hero fluid art: WebGL2 domain-warped noise with pointer influence.
   Palette comes from --art-1..4 on the host element. Degrades to a CSS
   gradient when WebGL2 is unavailable, and renders one still frame for
   prefers-reduced-motion. */
(function () {
  var canvas = document.querySelector("[data-fluid]");
  if (!canvas) return;
  var host = canvas.parentNode;
  var gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  if (!gl) {
    host.classList.add("no-webgl");
    return;
  }

  var vsSrc = "#version 300 es\n" +
    "in vec2 a_pos;\n" +
    "out vec2 v_uv;\n" +
    "void main() {\n" +
    "  v_uv = a_pos * 0.5 + 0.5;\n" +
    "  gl_Position = vec4(a_pos, 0.0, 1.0);\n" +
    "}\n";

  var fsSrc = "#version 300 es\n" +
    "precision highp float;\n" +
    "in vec2 v_uv;\n" +
    "out vec4 outColor;\n" +
    "uniform vec2 u_res;\n" +
    "uniform float u_time;\n" +
    "uniform vec2 u_pointer;\n" +
    "uniform float u_amt;\n" +
    "uniform vec3 u_c1, u_c2, u_c3, u_c4;\n" +
    "\n" +
    "float hash(vec2 p) {\n" +
    "  p = fract(p * vec2(123.34, 345.45));\n" +
    "  p += dot(p, p + 34.345);\n" +
    "  return fract(p.x * p.y);\n" +
    "}\n" +
    "float vnoise(vec2 p) {\n" +
    "  vec2 i = floor(p), f = fract(p);\n" +
    "  f = f * f * (3.0 - 2.0 * f);\n" +
    "  float a = hash(i), b = hash(i + vec2(1.0, 0.0));\n" +
    "  float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));\n" +
    "  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);\n" +
    "}\n" +
    "float fbm(vec2 p) {\n" +
    "  float v = 0.0, a = 0.5;\n" +
    "  for (int i = 0; i < 4; i++) {\n" +
    "    v += a * vnoise(p);\n" +
    "    p = p * 2.03 + vec2(1.7, 9.2);\n" +
    "    a *= 0.5;\n" +
    "  }\n" +
    "  return v;\n" +
    "}\n" +
    "\n" +
    "void main() {\n" +
    "  vec2 uv = gl_FragCoord.xy / u_res;\n" +
    "  float aspect = u_res.x / u_res.y;\n" +
    "  vec2 p = vec2(uv.x * aspect, uv.y) * 1.9;\n" +
    "  float t = u_time * 0.045;\n" +
    "\n" +
    "  vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t));\n" +
    "  vec2 r = vec2(\n" +
    "    fbm(p + 1.8 * q + vec2(1.7, 9.2) + t * 0.7),\n" +
    "    fbm(p + 1.8 * q + vec2(8.3, 2.8) - t * 0.5)\n" +
    "  );\n" +
    "\n" +
    "  vec2 d = uv - u_pointer;\n" +
    "  float infl = exp(-dot(d, d) * 7.0) * u_amt;\n" +
    "  float ang = infl * 2.4;\n" +
    "  vec2 rp = mat2(cos(ang), sin(ang), -sin(ang), cos(ang)) * (r - 0.5) + 0.5;\n" +
    "\n" +
    "  float f = fbm(p * 0.85 + 2.2 * rp);\n" +
    "  float m = smoothstep(0.12, 0.86, f);\n" +
    "  vec3 col = mix(u_c1, u_c2, smoothstep(0.10, 0.60, m));\n" +
    "  col = mix(col, u_c3, smoothstep(0.34, 0.82, rp.y * 0.7 + m * 0.4));\n" +
    "  col = mix(col, u_c4, smoothstep(0.58, 1.0, m * m) * 0.6);\n" +
    "\n" +
    "  outColor = vec4(col, 1.0);\n" +
    "}\n";

  function shader(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(s) || "shader compile failed");
    }
    return s;
  }

  var prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, vsSrc));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, fsSrc));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(prog) || "program link failed");
    }
  } catch (err) {
    host.classList.add("no-webgl");
    return;
  }
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, "a_pos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  var u = {
    res: gl.getUniformLocation(prog, "u_res"),
    time: gl.getUniformLocation(prog, "u_time"),
    pointer: gl.getUniformLocation(prog, "u_pointer"),
    amt: gl.getUniformLocation(prog, "u_amt"),
    c1: gl.getUniformLocation(prog, "u_c1"),
    c2: gl.getUniformLocation(prog, "u_c2"),
    c3: gl.getUniformLocation(prog, "u_c3"),
    c4: gl.getUniformLocation(prog, "u_c4"),
  };

  function rgb(name) {
    var v = getComputedStyle(host).getPropertyValue(name).trim();
    if (v.charAt(0) !== "#") return [1, 1, 1];
    v = v.slice(1);
    if (v.length === 3) v = v.charAt(0) + v.charAt(0) + v.charAt(1) + v.charAt(1) + v.charAt(2) + v.charAt(2);
    return [
      parseInt(v.slice(0, 2), 16) / 255,
      parseInt(v.slice(2, 4), 16) / 255,
      parseInt(v.slice(4, 6), 16) / 255,
    ];
  }

  function paintColors() {
    gl.uniform3fv(u.c1, rgb("--art-1"));
    gl.uniform3fv(u.c2, rgb("--art-2"));
    gl.uniform3fv(u.c3, rgb("--art-3"));
    gl.uniform3fv(u.c4, rgb("--art-4"));
  }

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var pointer = { x: 0.5, y: 0.55, tx: 0.5, ty: 0.55, amt: 0, target: 0 };
  var raf = 0;
  var start = performance.now();
  var onScreen = true;

  function layout() {
    var r = host.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5) * 0.62;
    if (r.width * dpr > 1600) dpr = 1600 / Math.max(1, r.width);
    var w = Math.max(1, Math.round(r.width * dpr));
    var h = Math.max(1, Math.round(r.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    gl.uniform2f(u.res, w, h);
  }

  function draw(time, amt, px, py) {
    gl.uniform1f(u.time, time);
    gl.uniform2f(u.pointer, px, py);
    gl.uniform1f(u.amt, amt);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function still() {
    paintColors();
    draw(6.0, 0, 0.5, 0.55);
  }

  function frame(now) {
    raf = 0;
    if (document.hidden || !onScreen) return;
    pointer.x += (pointer.tx - pointer.x) * 0.07;
    pointer.y += (pointer.ty - pointer.y) * 0.07;
    pointer.amt += (pointer.target - pointer.amt) * 0.06;
    pointer.target *= 0.97;
    draw((now - start) / 1000, pointer.amt, pointer.x, pointer.y);
    raf = requestAnimationFrame(frame);
  }

  function play() {
    if (reduce.matches) {
      still();
      return;
    }
    if (!raf) raf = requestAnimationFrame(frame);
  }

  window.addEventListener(
    "pointermove",
    function (e) {
      var r = host.getBoundingClientRect();
      pointer.tx = (e.clientX - r.left) / Math.max(1, r.width);
      pointer.ty = 1 - (e.clientY - r.top) / Math.max(1, r.height);
      pointer.target = 1;
    },
    { passive: true }
  );

  window.addEventListener("resize", function () {
    layout();
    if (reduce.matches) still();
  });

  var mq = window.matchMedia("(prefers-color-scheme: dark)");
  var onScheme = function () {
    paintColors();
  };
  if (mq.addEventListener) mq.addEventListener("change", onScheme);

  if (reduce.addEventListener) {
    reduce.addEventListener("change", function () {
      if (reduce.matches) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        still();
      } else {
        start = performance.now();
        play();
      }
    });
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      if (onScreen) play();
      else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }).observe(host);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    } else {
      play();
    }
  });

  if (window.ResizeObserver) {
    new ResizeObserver(function () {
      layout();
      if (reduce.matches) still();
    }).observe(host);
  }

  paintColors();
  layout();
  play();
})();
