/* Scroll progress, headline split, card reveals, count-up and the journey line. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var bar = document.getElementById('scroll-progress');
  var timeline = document.querySelector('.timeline');
  var line = timeline && timeline.querySelector('.timeline-line');
  var steps = timeline ? timeline.querySelectorAll('.timeline-step') : [];

  // 3. Scroll progress (a position indicator, kept even with reduced motion).
  // 6. Journey line follows the reader down to 60% of the screen.
  var queued = false;
  function update() {
    queued = false;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';
    if (reduce || !timeline) return;
    var mark = window.innerHeight * 0.6;
    var r = timeline.getBoundingClientRect();
    var p = Math.max(0, Math.min(1, (mark - r.top) / r.height));
    if (line) line.style.setProperty('--progress', p.toFixed(3));
    steps.forEach(function (s) { s.classList.toggle('is-on', s.getBoundingClientRect().top < mark); });
  }
  function onScroll() { if (!queued) { queued = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  if (reduce) return;

  // 2. Split the headline into words (screen readers get the whole sentence).
  var h1 = document.querySelector('.hero-title');
  if (h1) {
    var text = h1.textContent.replace(/\s+/g, ' ').trim();
    h1.setAttribute('aria-label', text);
    h1.textContent = '';
    text.split(' ').forEach(function (w, i, all) {
      var span = document.createElement('span');
      span.className = 'word';
      span.setAttribute('aria-hidden', 'true');
      span.style.setProperty('--i', i);
      span.textContent = w;
      h1.appendChild(span);
      if (i < all.length - 1) h1.appendChild(document.createTextNode(' '));
    });
  }

  // 4 + 5. Reveal cards and count numbers up once they come into view.
  // (A position check, not IntersectionObserver: Chrome treats fully clipped cards as not intersecting.)
  function countUp(el) {
    var to = parseInt(el.getAttribute('data-count-to'), 10) || 0;
    var start = performance.now();
    el.textContent = '0';
    (function frame(now) {
      var t = Math.min(1, (now - start) / 1200);
      el.textContent = String(Math.round(to * (1 - Math.pow(1 - t, 3))));
      if (t < 1) requestAnimationFrame(frame);
    })(start);
  }
  var pending = Array.prototype.slice.call(document.querySelectorAll('.reveal, [data-count-to]'));
  function reveal() {
    var limit = window.innerHeight * 0.9;
    pending = pending.filter(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top > limit || r.bottom < 0) return true;
      if (el.classList.contains('reveal')) el.classList.add('is-in');
      if (el.hasAttribute('data-count-to')) countUp(el);
      return false;
    });
    if (!pending.length) window.removeEventListener('scroll', onReveal);
  }
  var revealQueued = false;
  function onReveal() { if (!revealQueued) { revealQueued = true; requestAnimationFrame(function () { revealQueued = false; reveal(); }); } }
  window.addEventListener('scroll', onReveal, { passive: true });
  window.addEventListener('resize', onReveal);
  reveal();
})();
