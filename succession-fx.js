/* Wallace Succession — page effects (subtle, institutional)
   three.js depth-particle background + scroll reveals + stat count-up
   + Outcome attrition bar + FAQ accordions. Loaded after three.js. */
(function () {
  "use strict";

  /* ---------- 1. three.js depth-particle background ---------- */
  function initBackground() {
    if (!window.THREE) return;
    var canvas = document.createElement("canvas");
    canvas.id = "bg3d";
    document.body.insertBefore(canvas, document.body.firstChild);

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 60;

    var N = 1400;
    var positions = new Float32Array(N * 3);
    for (var i = 0; i < N; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 230;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 170;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 170;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    var near = new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0x8E9CF4, size: 0.7, transparent: true, opacity: 0.55, sizeAttenuation: true
    }));
    var far = new THREE.Points(geo.clone(), new THREE.PointsMaterial({
      color: 0x374EF2, size: 1.2, transparent: true, opacity: 0.32, sizeAttenuation: true
    }));
    scene.add(near);
    scene.add(far);

    var mx = 0, my = 0, sy = 0;
    window.addEventListener("mousemove", function (e) {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    });
    window.addEventListener("scroll", function () { sy = window.scrollY || 0; }, { passive: true });

    function resize() {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", resize);
    resize();

    function loop() {
      requestAnimationFrame(loop);
      near.rotation.y += 0.0006;
      near.rotation.x += 0.00018;
      far.rotation.y += 0.0004;
      camera.position.x += (mx * 10 - camera.position.x) * 0.03;
      camera.position.y += ((-my * 8) - (sy * 0.015) - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }
    loop();
  }

  /* ---------- 2. reveal on scroll ---------- */
  function initReveal() {
    var els = document.querySelectorAll(
      ".card,.step,.statcol,.secitem,.faqitem,.heropanel,.ltpanel,.ctabox,.h2c,.subc,.checkrow"
    );
    if (!("IntersectionObserver" in window)) return;
    els.forEach(function (el, i) {
      el.style.opacity = "0";
      el.style.transform = "translateY(16px)";
      el.style.transition = "opacity .6s cubic-bezier(.2,.7,.2,1), transform .6s cubic-bezier(.2,.7,.2,1)";
      el.style.transitionDelay = (Math.min(i % 4, 3) * 0.06) + "s";
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

  /* ---------- 3. stat count-up ---------- */
  function countUp(el) {
    var raw = el.getAttribute("data-raw") || el.textContent;
    el.setAttribute("data-raw", raw);
    if (/\bto\b/i.test(raw)) return; // skip ranges like "35 to 45%"
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

  /* ---------- 4. FAQ accordions ---------- */
  function initFaq() {
    document.querySelectorAll(".faqitem").forEach(function (item) {
      var q = item.querySelector(".faqq");
      var a = item.querySelector(".faqa");
      if (!q || !a) return;
      a.style.overflow = "hidden";
      a.style.maxHeight = "0px";
      a.style.opacity = "0";
      a.style.transition = "max-height .3s ease, opacity .3s ease, margin .3s ease";
      q.style.cursor = "pointer";
      q.style.display = "flex";
      q.style.justifyContent = "space-between";
      q.style.alignItems = "center";
      var caret = document.createElement("span");
      caret.textContent = "+";
      caret.style.color = "#5468F5";
      caret.style.fontSize = "22px";
      caret.style.lineHeight = "1";
      caret.style.marginLeft = "16px";
      caret.style.flex = "0 0 auto";
      caret.style.transition = "transform .2s ease";
      q.appendChild(caret);
      q.addEventListener("click", function () {
        var open = a.style.maxHeight && a.style.maxHeight !== "0px";
        if (open) {
          a.style.maxHeight = "0px"; a.style.opacity = "0"; caret.textContent = "+";
        } else {
          a.style.maxHeight = (a.scrollHeight + 40) + "px"; a.style.opacity = "1"; caret.textContent = "–";
        }
      });
    });
  }

  /* ---------- 5. Outcome attrition bar ---------- */
  function initAttrition() {
    var cards = document.querySelectorAll(".card");
    cards.forEach(function (c) {
      var h = c.querySelector(".cardh");
      if (!h || !/keep your clients/i.test(h.textContent)) return;

      var wrap = document.createElement("div");
      wrap.style.marginTop = "16px";

      var labels = document.createElement("div");
      labels.style.cssText = "display:flex;justify-content:space-between;font-size:12px;color:#9A9DAB;margin-bottom:6px";
      var l1 = document.createElement("span"); l1.textContent = "35 to 45% lost";
      var l2 = document.createElement("span"); l2.textContent = "5 to 8% lost"; l2.style.cssText = "color:#3FB37F;font-weight:700";
      labels.appendChild(l1); labels.appendChild(l2);

      var track = document.createElement("div");
      track.style.cssText = "height:9px;border-radius:6px;background:#161a2e;overflow:hidden";
      var bar = document.createElement("div");
      bar.style.cssText = "height:100%;width:45%;border-radius:6px;background:linear-gradient(90deg,#E0616B,#8E9CF4);transition:width 1.4s cubic-bezier(.2,.7,.2,1)";
      track.appendChild(bar);

      var cap = document.createElement("div");
      cap.style.cssText = "font-size:11.5px;color:#6E7180;margin-top:6px";
      cap.textContent = "Attrition when the successor already runs the book your way.";

      wrap.appendChild(labels); wrap.appendChild(track); wrap.appendChild(cap);
      c.appendChild(wrap);

      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { setTimeout(function () { bar.style.width = "8%"; }, 250); io.unobserve(e.target); }
          });
        }, { threshold: 0.4 });
        io.observe(c);
      } else {
        bar.style.width = "8%";
      }
    });
  }

  /* ---------- 6. How-it-works: animated connector line under header ---------- */
  function initHowLine() {
    var how = document.getElementById("how");
    if (!how) return;
    var head = how.querySelector(".h2c");
    if (!head) return;
    var line = document.createElement("div");
    line.style.cssText = "height:3px;width:0;margin:18px auto 0;border-radius:2px;background:linear-gradient(90deg,#374EF2,#8E9CF4);transition:width 1.1s cubic-bezier(.2,.7,.2,1)";
    head.parentNode.insertBefore(line, head.nextSibling);
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { setTimeout(function () { line.style.width = "180px"; }, 200); io.unobserve(e.target); }
        });
      }, { threshold: 0.5 });
      io.observe(head);
    } else { line.style.width = "180px"; }
  }

  function boot() {
    try { initBackground(); } catch (e) {}
    try { initReveal(); } catch (e) {}
    try { initCountUp(); } catch (e) {}
    try { initFaq(); } catch (e) {}
    try { initAttrition(); } catch (e) {}
    try { initHowLine(); } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
