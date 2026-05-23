/* =======================================================================
   HERO SECTION INIT — ts-hero-init.js
   Place in: assets/js/ts-hero-init.js

   Add at the bottom of your <body> OR call initTsHero() after loadSections():
     <script src="./assets/js/ts-hero-init.js"></script>

   In your existing boot/initExtras(), add:
     initTsHero();
   ======================================================================= */

(function () {
  'use strict';

  /* ── Entry point ───────────────────────────────────────────────────── */
  function initTsHero () {
    injectSvgDefs();
    initGridCanvas();
    initTypewriter();
    initMagnetic();
    initMouseParallax();
    startPerfRing();
  }

  /* ── 1. SVG gradient defs for the performance ring ─────────────────── */
  function injectSvgDefs () {
    if (document.getElementById('ts-ring-grad')) return;
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.style.position = 'absolute';
    svg.innerHTML = '<defs>'
      + '<linearGradient id="ts-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">'
      + '<stop offset="0%" stop-color="#7c3aed"/>'
      + '<stop offset="100%" stop-color="#06b6d4"/>'
      + '</linearGradient>'
      + '</defs>';
    document.body.insertBefore(svg, document.body.firstChild);
  }

  /* ── 2. Animated grid canvas ─────────────────────────────────────────
     Draws a perspective-receding dot grid that gently pulses.
     ──────────────────────────────────────────────────────────────────── */
  function initGridCanvas () {
    var canvas = document.getElementById('ts-hero-grid');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var raf;
    var t = 0;

    function resize () {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    function draw () {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.008;

      var cols = 28;
      var rows = 18;
      var cw = canvas.width;
      var ch = canvas.height;
      var cellW = cw / cols;
      var cellH = ch / rows;

      for (var r = 0; r <= rows; r++) {
        for (var c = 0; c <= cols; c++) {
          var x = c * cellW;
          var y = r * cellH;

          /* Subtle wave offset */
          var wave = Math.sin(t + (c + r) * 0.25) * 0.5 + 0.5;

          /* Radial fade from centre */
          var dx = (x / cw) - 0.5;
          var dy = (y / ch) - 0.5;
          var dist = Math.sqrt(dx * dx + dy * dy);
          var fade = Math.max(0, 1 - dist * 2.2);

          var alpha = 0.04 + wave * 0.06 * fade;
          var radius = 1 + wave * 0.8 * fade;

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(148, 163, 184, ' + alpha + ')';
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    draw();

    /* Clean up if section removed */
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { cancelAnimationFrame(raf); }
      else { draw(); }
    });
  }

  /* ── 3. Typewriter ───────────────────────────────────────────────────*/
  function initTypewriter () {
    var el = document.getElementById('ts-typed-text');
    if (!el || window.__tsTypingStarted) return;
    window.__tsTypingStarted = true;

    /* ↓ Customise strings here */
    var strings = [
      'MERN Stack Engineer',
      'SaaS Builder',
      'UI Motion Specialist',
      'Full Stack Developer'
    ];

    var si = 0;
    var ch = 0;
    var deleting = false;
    var pauseTicks = 0;
    var PAUSE_AFTER  = 28;
    var PAUSE_BEFORE = 6;
    var TYPE_SPEED   = 85;

    setInterval(function () {
      if (pauseTicks > 0) { pauseTicks--; return; }

      var str = strings[si];
      if (!deleting) {
        if (ch < str.length) {
          ch++;
          el.textContent = str.slice(0, ch);
        } else {
          pauseTicks = PAUSE_AFTER;
          deleting = true;
        }
      } else {
        if (ch > 0) {
          ch--;
          el.textContent = str.slice(0, ch);
        } else {
          deleting = false;
          si = (si + 1) % strings.length;
          pauseTicks = PAUSE_BEFORE;
        }
      }
    }, TYPE_SPEED);
  }

  /* ── 4. Magnetic button effect ───────────────────────────────────────*/
  function initMagnetic () {
    document.querySelectorAll('.ts-magnetic').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        var x = (e.clientX - rect.left - rect.width  / 2) * 0.28;
        var y = (e.clientY - rect.top  - rect.height / 2) * 0.28;
        el.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transform = '';
      });
    });
  }

  /* ── 5. Mouse parallax — right panel cards move on mousemove ─────────*/
  function initMouseParallax () {
    var rightPanel = document.querySelector('.ts-hero__right');
    if (!rightPanel) return;

    var cards = rightPanel.querySelectorAll('.ts-card');

    window.addEventListener('mousemove', function (e) {
      var cx = window.innerWidth  / 2;
      var cy = window.innerHeight / 2;
      var nx = (e.clientX - cx) / cx; /* -1 .. 1 */
      var ny = (e.clientY - cy) / cy;

      cards.forEach(function (card, i) {
        var depth = 0.5 + (i % 3) * 0.4; /* layer depth varies per card */
        var tx = nx * 10 * depth;
        var ty = ny * 8  * depth;
        card.style.transform = 'translate(' + tx + 'px, ' + ty + 'px)';
      });

      /* Subtle aurora orb parallax */
      var orbs = document.querySelectorAll('.ts-aurora__orb');
      orbs.forEach(function (orb, i) {
        var s = (i + 1) * 1.5;
        orb.style.transform = 'translate(' + nx * s + '%, ' + ny * s + '%) scale(1.04)';
      });
    });
  }

  /* ── 6. Trigger perf ring animation on scroll-into-view ─────────────*/
  function startPerfRing () {
    var ring = document.getElementById('ts-perf-ring');
    if (!ring) return;

    /* Already handled by CSS animation with animation-delay — but we
       also reset & replay when card enters viewport for polish.        */
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        ring.style.animation = 'none';
        /* Force reflow */
        void ring.offsetWidth;
        ring.style.animation = '';
        io.disconnect();
      });
    }, { threshold: 0.5 });

    var perfCard = document.querySelector('.ts-card--perf');
    if (perfCard) io.observe(perfCard);
  }

  /* ─────────────────────────────────────────────────────────────────────
     HOW TO ADD MORE FLOATING CARDS
     ─────────────────────────────────────────────────────────────────────
     1. Copy a .ts-card block from hero.html into .ts-hero__right.
     2. Assign an absolute position via inline style or a new modifier class.
     3. Give it ts-float with custom --float-dur / --float-amp / --float-delay.
     4. Example:

       <div class="ts-card ts-card--custom ts-float"
            style="--float-dur:6.5s;--float-amp:-11px;--float-delay:-2.5s;">
         <!-- your content -->
       </div>

       .ts-card--custom {
         bottom: 60px;
         right: 30%;
         width: 180px;
         padding: 14px;
       }
     ─────────────────────────────────────────────────────────────────────*/

  /* ─────────────────────────────────────────────────────────────────────
     Auto-init: if called from your existing initExtras(), just add
       initTsHero();
     OR for standalone usage this fires on DOMContentLoaded:
     ─────────────────────────────────────────────────────────────────────*/
  if (typeof window !== 'undefined') {
    window.initTsHero = initTsHero;

    /* Standalone auto-boot (safe to keep even if called manually) */
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initTsHero);
    } else {
      initTsHero();
    }
  }
})();