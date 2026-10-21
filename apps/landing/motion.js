/* motion.js — GSAP + ScrollTrigger choreography (self-hosted GSAP 3.15, no-charge standard license).
 * Rules followed (gsap-core / scrolltrigger / timeline / performance skills):
 * - gsap.matchMedia() gates everything on prefers-reduced-motion: no-preference; reduced motion = static page.
 * - transforms + autoAlpha only; ScrollTriggers only on top-level tweens/timelines, created top-to-bottom.
 * - scrub for scroll-linked scenes, toggleActions/once for reveals; no markers; off-screen loops paused.
 */
(function () {
  'use strict';
  var root = document.documentElement;
  function done() { root.classList.remove('motion-pending'); }
  if (!window.gsap || !window.ScrollTrigger) { done(); return; }
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  gsap.defaults({ duration: 0.8, ease: 'power3.out' });

  // Header glass state (cheap, always on)
  var topbar = document.getElementById('topbar');
  ST.create({ start: 24, end: 'max', onToggle: function (self) { topbar && topbar.classList.toggle('scrolled', self.isActive); } });

  // Split hero title into masked words (walks text nodes so inline <span class="hl"> survives)
  function splitWords(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (node) {
      var frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var w = document.createElement('span'); w.className = 'w'; w.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.08em;margin-bottom:-.08em';
        var i = document.createElement('span'); i.className = 'wi'; i.style.display = 'inline-block'; i.textContent = part;
        w.appendChild(i); frag.appendChild(w);
      });
      node.parentNode.replaceChild(frag, node);
    });
    return el.querySelectorAll('.wi');
  }

  function countUp(el, delay) {
    var to = Number(el.getAttribute('data-to')), kind = el.getAttribute('data-format'), o = { v: 0 };
    return gsap.to(o, { v: to, duration: 1.6, delay: delay || 0, ease: 'power2.out',
      onUpdate: function () { el.textContent = window.RR.fmt(Math.round(o.v), kind); } });
  }

  var mm = gsap.matchMedia();
  mm.add({ motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 960px)', fine: '(hover: hover) and (pointer: fine)' }, function (ctx) {
    var c = ctx.conditions;
    if (!c.motion) { done(); return; }

    // ---------- 1. Hero intro timeline ----------
    var title = document.getElementById('heroTitle');
    var words = title ? splitWords(title) : [];
    var intro = gsap.timeline({ defaults: { duration: 0.9, ease: 'power4.out' } });
    intro.set('[data-hero]', { opacity: 1 })
      .from('.hero .overline', { y: 16, autoAlpha: 0, duration: 0.6 }, 0)
      .from(words, { yPercent: 110, stagger: 0.05 }, 0.08)
      .from('.hero .lead', { y: 24, autoAlpha: 0 }, 0.35)
      .from('.hero-actions .btn', { y: 20, autoAlpha: 0, stagger: 0.08 }, 0.45)
      .from('.hero .chip', { y: 12, autoAlpha: 0, stagger: 0.06, duration: 0.6 }, 0.55)
      .from('.house-card', { y: 40, scale: 0.96, autoAlpha: 0, duration: 1.1 }, 0.2)
      .from('.hud', { y: 16, autoAlpha: 0, stagger: 0.12, duration: 0.6 }, 0.8);
    done();

    // ambient loops (paused when hero offscreen)
    var smoke = gsap.to('.house .smoke circle', { y: -14, autoAlpha: 0.25, duration: 2.4, stagger: { each: 0.4, repeat: -1, yoyo: true }, ease: 'sine.inOut' });
    var snow = gsap.to('.house .snow circle', { y: 18, duration: 3.5, stagger: { each: 0.3, repeat: -1, yoyo: true }, ease: 'sine.inOut' });
    var fan = gsap.to('.house .fan', { rotation: 360, svgOrigin: '405 351', duration: 1.6, repeat: -1, ease: 'none', paused: true });
    ST.create({ trigger: '#hero', start: 'top bottom', end: 'bottom top', onToggle: function (s) { [smoke, snow].forEach(function (t) { s.isActive ? t.play() : t.pause(); }); if (!s.isActive) fan.pause(); } });

    // ---------- 2. Hero "house upgrades" scene (scrubbed) ----------
    gsap.set('.house .hp', { autoAlpha: 0, x: 40 });
    gsap.set('.house .insul', { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set('.house .leaf', { autoAlpha: 0, scale: 0.4, transformOrigin: '50% 50%' });
    var counter = document.getElementById('heroCount'), cObj = { v: 0 };
    counter.textContent = window.RR.fmt(0, 'cad');
    var rows = document.querySelectorAll('.hud-steps .row');
    function mark(i, on) { rows[i] && rows[i].classList.toggle('done', on); }
    var upgrade = gsap.timeline({
      defaults: { ease: 'none', duration: 1 },
      scrollTrigger: c.desktop
        ? { trigger: '#hero', start: 'top top', end: '+=900', scrub: 0.8, pin: true, anticipatePin: 1 }
        : { trigger: '#houseCard', start: 'top 65%', end: 'bottom 15%', scrub: 0.6 },
    });
    upgrade
      .addLabel('eval')
      .call(function () { mark(0, upgrade.scrollTrigger ? upgrade.scrollTrigger.direction > 0 : true); }, null, 'eval+=0.1')
      .to('.house .drafts path', { autoAlpha: 0, scale: 0.6, transformOrigin: '50% 50%', stagger: 0.15 }, 'eval')
      .to('.house .insul', { scaleY: 1 }, 'eval+=0.2')
      .addLabel('seal')
      .call(function () { mark(1, upgrade.scrollTrigger.direction > 0); }, null, 'seal')
      .to('.house .glow', { opacity: 0.85, stagger: 0.15 }, 'seal')
      .to('.house .smoke', { autoAlpha: 0 }, 'seal')
      .addLabel('hp')
      .call(function () { mark(2, upgrade.scrollTrigger.direction > 0); }, null, 'hp')
      .to('.house .hp', { autoAlpha: 1, x: 0, ease: 'back.out(1.6)' }, 'hp')
      .to('.house .leaf', { autoAlpha: 1, scale: 1, ease: 'back.out(2)' }, 'hp+=0.3')
      .to(cObj, { v: Number(counter.getAttribute('data-to')), duration: 2.4, onUpdate: function () { counter.textContent = window.RR.fmt(Math.round(cObj.v / 10) * 10, 'cad'); } }, 'eval')
      .call(function () { fan.play(); }, null, 'hp+=0.5');

    // ---------- 3. Marquee ----------
    var track = document.getElementById('marquee');
    if (track) {
      var mq = gsap.to(track, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
      ST.create({ trigger: '.band', start: 'top bottom', end: 'bottom top', onToggle: function (s) { s.isActive ? mq.play() : mq.pause(); } });
    }

    // ---------- 4. Problem timeline: progress line scrubbed + cards reveal ----------
    gsap.fromTo('#timeline .progress', { scaleY: 0 }, { scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '#timeline', start: 'top 70%', end: 'bottom 60%', scrub: true } });
    ST.batch('#timeline .t-card', { start: 'top 85%', once: true,
      onEnter: function (els) { gsap.fromTo(els, { x: 40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, stagger: 0.12, overwrite: true }); } });

    // ---------- 5. How it works: pinned sequence (desktop) / reveal (mobile) ----------
    var steps = gsap.utils.toArray('#steps .step');
    if (c.desktop) {
      var panels = gsap.utils.toArray('.how-visual .panel');
      gsap.set(panels.slice(1), { autoAlpha: 0, y: 30 });
      var how = gsap.timeline({ defaults: { duration: 1, ease: 'power2.inOut' },
        scrollTrigger: { trigger: '#how', start: 'top top', end: '+=' + (steps.length * 420), scrub: 0.6, pin: true,
          snap: { snapTo: 1 / (steps.length - 1), duration: 0.35, ease: 'power1.inOut' },
          onUpdate: function (s) { var idx = Math.round(s.progress * (steps.length - 1)); steps.forEach(function (st, i) { st.classList.toggle('active', i === idx); }); } } });
      for (var i = 1; i < panels.length; i++) {
        how.to(panels[i - 1], { autoAlpha: 0, y: -30, scale: 0.96 }).to(panels[i], { autoAlpha: 1, y: 0, scale: 1 }, '<0.2');
      }
    } else {
      ST.batch(steps, { start: 'top 88%', once: true,
        onEnter: function (els) { gsap.fromTo(els, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.1, overwrite: true }); } });
      steps.forEach(function (st) { ST.create({ trigger: st, start: 'top 60%', end: 'bottom 40%', toggleClass: 'active' }); });
      steps[0] && steps[0].classList.remove('active');
    }

    // ---------- 6. Phone mockup: items cascade + screen carousel (paused off-screen) ----------
    var dots = document.querySelectorAll('.screen-dots span');
    gsap.set('#scr2', { autoAlpha: 0, xPercent: 20 });
    var phone = gsap.timeline({ repeat: -1, repeatDelay: 0.6, paused: true, defaults: { duration: 0.6 } });
    phone.from('#scr1 .pi', { y: 24, autoAlpha: 0, stagger: 0.12 })
      .to({}, { duration: 2.4 })
      .to('#scr1', { autoAlpha: 0, xPercent: -20 })
      .call(function () { dots[0].classList.remove('on'); dots[1].classList.add('on'); })
      .to('#scr2', { autoAlpha: 1, xPercent: 0 }, '<')
      .from('#scr2 .ci', { x: 20, autoAlpha: 0, stagger: 0.12 }, '<0.2')
      .to({}, { duration: 2.6 })
      .to('#scr2', { autoAlpha: 0, xPercent: 20 })
      .call(function () { dots[1].classList.remove('on'); dots[0].classList.add('on'); })
      .to('#scr1', { autoAlpha: 1, xPercent: 0 }, '<');
    ST.create({ trigger: '.phone', start: 'top 85%', end: 'bottom 10%', onToggle: function (s) { s.isActive ? phone.play() : phone.pause(); } });
    gsap.fromTo('.phone', { y: 60, rotation: -4 }, { y: -20, rotation: 2, ease: 'none', scrollTrigger: { trigger: '.phone-stage', start: 'top bottom', end: 'bottom top', scrub: 1 } });
    gsap.fromTo('.ft-1', { y: 40 }, { y: -40, ease: 'none', scrollTrigger: { trigger: '.phone-stage', start: 'top bottom', end: 'bottom top', scrub: 1.2 } });
    gsap.fromTo('.ft-2', { y: -30 }, { y: 50, ease: 'none', scrollTrigger: { trigger: '.phone-stage', start: 'top bottom', end: 'bottom top', scrub: 1.2 } });

    // ---------- 7. Number counters ----------
    gsap.utils.toArray('.numbers .count').forEach(function (el) {
      el.textContent = window.RR.fmt(0, el.getAttribute('data-format'));
      ST.create({ trigger: el, start: 'top 90%', once: true, onEnter: function () { countUp(el); } });
    });

    // ---------- 8. Generic reveals (everything else marked data-reveal) ----------
    var handled = new Set(gsap.utils.toArray('#timeline .t-card, #steps .step'));
    var generic = gsap.utils.toArray('[data-reveal]').filter(function (el) { return !handled.has(el); });
    ST.batch(generic, { start: 'top 88%', once: true,
      onEnter: function (els) { gsap.fromTo(els, { y: 36, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.08, overwrite: true }); } });

    // ---------- 9. Magnetic buttons (fine pointers only) ----------
    if (c.fine) {
      gsap.utils.toArray('.magnetic').forEach(function (btn) {
        var xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3' }), yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3' });
        btn.addEventListener('pointermove', function (e) { var r = btn.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * 0.25); yTo((e.clientY - r.top - r.height / 2) * 0.35); });
        btn.addEventListener('pointerleave', function () { xTo(0); yTo(0); });
      });
    }

    // fonts can shift layout: refresh once when loaded
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });

    return function () { /* matchMedia reverts all tweens/ScrollTriggers created above */ };
  });
})();
