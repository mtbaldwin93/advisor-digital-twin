/* Wallace Succession — page effects v4
   flowing-gradient background is pure CSS (#bgwave). This file handles:
   scroll reveals, stat count-up, FAQ accordions, How-it-works step icons +
   arrows, and a distinct mini-graphic for each Outcome panel. */
(function () {
  "use strict";

  function node(html) {
    var d = document.createElement("div");
    d.innerHTML = html.trim();
    return d.firstChild;
  }

  /* ---------- reveal on scroll ---------- */
  function initReveal() {
    if (!("IntersectionObserver" in window)) return;
    var els = document.querySelectorAll(
      ".card,.step,.statcol,.secitem,.faqitem,.heropanel,.ltpanel,.ctabox,.h2c,.subc,.checkrow"
    );
    els.forEach(function (el, i) {
      el.style.opacity = "0";
      el.style.transform = "translateY(16px)";
      el.style.transition = "opacity .6s cubic-bezier(.2,.7,.2,1), transform .6s cubic-bezier(.2,.7,.2,1)";
      el.style.transitionDelay = (Math.min(i % 4, 3) * 0.05) + "s";
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.style.opacity = "1";
          e.target.style.transform = "none";
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- stat count-up ---------- */
  function countUp(el) {
    var raw = el.getAttribute("data-raw") || el.textContent;
    el.setAttribute("data-raw", raw);
    if (/\bto\b/i.test(raw)) return;
    var m = raw.match(/^([^0-9]*)([0-9,.]+)(.*)$/);
    if (!m) return;
    var pre = m[1], numStr = m[2], suf = m[3];
    var hasComma = /,/.test(numStr);
    var clean = numStr.replace(/,/g, "");
    var dec = (clean.split(".")[1] || "").length;
    var target = parseFloat(clean);
    var start = null, dur = 1300;
    function fmt(v) {
      var s = hasComma ? Math.round(v).toLocaleString() : (dec ? v.toFixed(dec) : Math.round(v).toString());
      return pre + s + suf;
    }
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(frame); else el.textContent = raw;
    }
    requestAnimationFrame(frame);
  }
  function initCountUp() {
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { countUp(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    document.querySelectorAll(".statn").forEach(function (el) { io.observe(el); });
  }

  /* ---------- FAQ accordions ---------- */
  function initFaq() {
    document.querySelectorAll(".faqitem").forEach(function (item) {
      var q = item.querySelector(".faqq");
      var a = item.querySelector(".faqa");
      if (!q || !a) return;
      a.style.overflow = "hidden";
      a.style.maxHeight = "0px";
      a.style.opacity = "0";
      a.style.transition = "max-height .3s ease, opacity .3s ease";
      q.style.cursor = "pointer";
      q.style.display = "flex";
      q.style.justifyContent = "space-between";
      q.style.alignItems = "center";
      var caret = document.createElement("span");
      caret.textContent = "+";
      caret.style.cssText = "color:#5468F5;font-size:22px;line-height:1;margin-left:16px;flex:0 0 auto;transition:transform .2s ease";
      q.appendChild(caret);
      q.addEventListener("click", function () {
        var open = a.style.maxHeight && a.style.maxHeight !== "0px";
        if (open) { a.style.maxHeight = "0px"; a.style.opacity = "0"; caret.textContent = "+"; }
        else { a.style.maxHeight = (a.scrollHeight + 40) + "px"; a.style.opacity = "1"; caret.textContent = "–"; }
      });
    });
  }

  /* ---------- SVG mini-graphics ---------- */
  var svgCapture =
    '<svg width="46" height="46" viewBox="0 0 48 48" fill="none"><rect x="8" y="24" width="32" height="16" rx="4" stroke="#5468F5" stroke-width="2"/><path d="M24 7v19" stroke="#8E9CF4" stroke-width="2" stroke-linecap="round"/><path d="M17 20l7 7 7-7" stroke="#8E9CF4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var svgCodify =
    '<svg width="46" height="46" viewBox="0 0 48 48" fill="none"><path d="M13 15l11 18M35 15L24 33M14 14h20" stroke="#5468F5" stroke-width="2" stroke-linecap="round"/><circle cx="13" cy="14" r="4" stroke="#8E9CF4" stroke-width="2"/><circle cx="35" cy="14" r="4" stroke="#8E9CF4" stroke-width="2"/><circle cx="24" cy="34" r="5" fill="rgba(55,78,242,.25)" stroke="#5468F5" stroke-width="2"/></svg>';
  var svgContinue =
    '<svg width="46" height="46" viewBox="0 0 48 48" fill="none"><circle cx="15" cy="24" r="7" stroke="#8E9CF4" stroke-width="2"/><path d="M24 24h16" stroke="#5468F5" stroke-width="2" stroke-linecap="round"/><path d="M34 18l6 6-6 6" stroke="#5468F5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var svgArrow =
    '<svg width="30" height="18" viewBox="0 0 30 18" fill="none"><path d="M2 9h24" stroke="#374EF2" stroke-width="2" stroke-linecap="round"/><path d="M21 4l6 5-6 5" stroke="#374EF2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var svgShield =
    '<svg width="50" height="50" viewBox="0 0 52 52" fill="none"><path d="M26 6l16 6v11c0 11-7 18-16 21-9-3-16-10-16-21V12l16-6z" fill="rgba(55,78,242,.10)" stroke="#5468F5" stroke-width="2"/><path d="M18 29l5-5 4 4 8-9" stroke="#8E9CF4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M32 18h4v4" stroke="#8E9CF4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var svgOrbit =
    '<svg width="50" height="50" viewBox="0 0 52 52" fill="none"><circle cx="26" cy="26" r="7" fill="#374EF2"/><circle cx="26" cy="26" r="18" stroke="#5468F5" stroke-width="2"/><circle cx="26" cy="8" r="3" fill="#8E9CF4"/><circle cx="44" cy="26" r="3" fill="#8E9CF4"/><circle cx="26" cy="44" r="3" fill="#8E9CF4"/><circle cx="8" cy="26" r="3" fill="#8E9CF4"/></svg>';
  var svgDayOne =
    '<svg width="50" height="50" viewBox="0 0 52 52" fill="none"><circle cx="26" cy="26" r="18" stroke="#5468F5" stroke-width="2"/><path d="M23 20l4-2v16" stroke="#8E9CF4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 34h9" stroke="#8E9CF4" stroke-width="2.5" stroke-linecap="round"/></svg>';

  /* ---------- How it works: icons + arrows ---------- */
  function initSteps() {
    var map = { "capture": svgCapture, "codify": svgCodify, "continue": svgContinue };
    var steps = document.querySelectorAll(".step");
    steps.forEach(function (s) {
      var h = s.querySelector(".steph");
      var key = h ? h.textContent.trim().toLowerCase() : "";
      var svg = map[key] || svgCapture;
      s.insertBefore(node('<div class="stepicon">' + svg + "</div>"), s.firstChild);
    });
    var container = document.querySelector(".steps");
    if (container) {
      var cards = container.querySelectorAll(".step");
      for (var i = 0; i < cards.length - 1; i++) {
        container.insertBefore(node('<div class="steparrow">' + svgArrow + "</div>"), cards[i].nextSibling);
      }
    }
  }

  /* ---------- Outcome: one graphic per panel ---------- */
  function initOutcome() {
    var map = {
      "preserve book value": svgShield,
      "keep your clients": svgOrbit,
      "a successor ready on day one": svgDayOne
    };
    document.querySelectorAll(".card").forEach(function (c) {
      var h = c.querySelector(".cardh");
      if (!h) return;
      var svg = map[h.textContent.trim().toLowerCase()];
      if (svg) c.insertBefore(node('<div class="outicon">' + svg + "</div>"), c.firstChild);
    });
  }

  /* ---------- liquid flow-field background (streams with scroll) ---------- */
  function initFlow() {
    var canvas = document.createElement("canvas");
    canvas.id = "bgflow";
    document.body.insertBefore(canvas, document.body.firstChild);
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2), W = 0, H = 0;
    function resize() {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#0A0A0E"; ctx.fillRect(0, 0, W, H);
    }
    window.addEventListener("resize", resize);
    resize();

    var scrollY = window.scrollY || 0, scrollVel = 0;
    window.addEventListener("scroll", function () {
      var ny = window.scrollY || 0;
      scrollVel += (ny - scrollY);
      scrollY = ny;
    }, { passive: true });

    // smooth pseudo-noise angle field (layered sines, no libs)
    function field(x, y, t) {
      return (Math.sin(x * 0.0016 + t * 0.00016)
        + Math.cos(y * 0.0016 - t * 0.00012)
        + Math.sin((x * 0.0009 + y * 0.0011) + t * 0.00009)) * 1.15;
    }

    var N = 200, ps = [];
    function spawn(p) {
      p.x = Math.random() * W;
      p.y = Math.random() * H;
      p.hist = [];
      p.life = 160 + Math.random() * 320;
      p.tone = Math.random() < 0.5;
    }
    for (var i = 0; i < N; i++) { var p = {}; spawn(p); ps.push(p); }

    function tail(p, from, alpha) {
      var h = p.hist;
      if (from < 0) from = 0;
      if (h.length - from < 2) return;
      ctx.strokeStyle = p.tone ? "rgba(150,165,255," + alpha + ")" : "rgba(95,120,255," + alpha + ")";
      ctx.beginPath();
      ctx.moveTo(h[from][0], h[from][1]);
      for (var j = from + 1; j < h.length; j++) ctx.lineTo(h[j][0], h[j][1]);
      ctx.stroke();
    }

    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineJoin = "round"; ctx.lineCap = "round";
      var sv = scrollVel;
      for (var i = 0; i < ps.length; i++) {
        var p = ps[i];
        var a = field(p.x, p.y + scrollY * 0.12, t);
        p.x += Math.cos(a) * 3.0;
        p.y += Math.sin(a) * 3.0 + sv * 0.32;
        p.hist.push([p.x, p.y]);
        if (p.hist.length > 48) p.hist.shift();
        p.life--;
        if (p.hist.length > 1) {
          ctx.lineWidth = 1.7; tail(p, 0, 0.52);
          ctx.lineWidth = 2.4; tail(p, p.hist.length - 16, 0.75);
        }
        if (p.life <= 0 || p.x < -40 || p.x > W + 40 || p.y < -40 || p.y > H + 40) spawn(p);
      }
      scrollVel *= 0.9;
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  function boot() {
    try { initFlow(); } catch (e) {}
    try { initReveal(); } catch (e) {}
    try { initCountUp(); } catch (e) {}
    try { initFaq(); } catch (e) {}
    try { initSteps(); } catch (e) {}
    try { initOutcome(); } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
