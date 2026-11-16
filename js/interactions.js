/* Card expand/collapse, skill <-> project linking, and "Show more" for earlier work. */
(function () {
  // Case study: each card opens into a focused view that grows out of the card
  // and shrinks back into it. Closes with the cross, Escape, or a click on the blurred area.
  var dialog = document.getElementById('case-study');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE = 'cubic-bezier(.2, .8, .2, 1)';
  var activeCard = null;
  var closing = false;

  function fill(card) {
    dialog.querySelector('.case-meta').textContent = card.querySelector('.project-meta').textContent;
    dialog.querySelector('.case-title').textContent = card.querySelector('h3').textContent;
    dialog.querySelector('.case-sub').textContent = card.querySelector('.project-sub').textContent;
    var steps = dialog.querySelector('.case-steps');
    steps.textContent = '';
    card.querySelectorAll('.project-details p').forEach(function (p, i, all) {
      var label = p.querySelector('strong').textContent;
      var text = p.textContent.replace(label, '').trim();
      var step = document.createElement('div');
      step.className = 'case-step' + (i === all.length - 1 ? ' is-result' : '');
      step.innerHTML = '<p class="case-step-label"><span class="case-step-num"></span><span></span></p><p></p>';
      step.querySelector('.case-step-num').textContent = String(i + 1);
      step.querySelector('.case-step-label span:last-child').textContent = label;
      step.querySelector('p:last-child').textContent = text;
      steps.appendChild(step);
    });
  }

  // Transform that places the dialog exactly over the card (dialog is laid out at its final spot).
  function overCard(card) {
    var from = card.getBoundingClientRect();
    var to = dialog.getBoundingClientRect();
    return 'translate(' + (from.left - to.left) + 'px, ' + (from.top - to.top) + 'px) scale(' +
      (from.width / to.width) + ', ' + (from.height / to.height) + ')';
  }
  function fadeBackdrop(from, to, ms) {
    try { dialog.animate({ opacity: [from, to] }, { duration: ms, easing: 'ease', pseudoElement: '::backdrop', fill: 'forwards' }); } catch (e) { /* older browsers: no backdrop fade */ }
  }

  function openCase(card) {
    if (!dialog || dialog.open) return;
    activeCard = card;
    fill(card);
    dialog.showModal();
    document.documentElement.classList.add('case-open');
    if (reduce || !dialog.animate) return;
    var inner = dialog.querySelector('.case-inner');
    dialog.animate([{ transform: overCard(card), transformOrigin: '0 0' }, { transform: 'none', transformOrigin: '0 0' }], { duration: 480, easing: EASE });
    inner.animate([{ opacity: 0 }, { opacity: 0, offset: 0.35 }, { opacity: 1 }], { duration: 480, easing: 'ease' });
    fadeBackdrop(0, 1, 380);
  }

  function finishClose() {
    dialog.close();
    document.documentElement.classList.remove('case-open');
    closing = false;
    var btn = activeCard && activeCard.querySelector('.project-open');
    if (btn) btn.focus({ preventScroll: true });
  }

  function closeCase() {
    if (!dialog || !dialog.open || closing) return;
    closing = true;
    if (reduce || !dialog.animate || !activeCard) { finishClose(); return; }
    var inner = dialog.querySelector('.case-inner');
    inner.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: 'ease', fill: 'forwards' });
    fadeBackdrop(1, 0, 420);
    var anim = dialog.animate([{ transform: 'none', transformOrigin: '0 0' }, { transform: overCard(activeCard), transformOrigin: '0 0' }], { duration: 420, easing: EASE, fill: 'forwards' });
    anim.onfinish = function () {
      finishClose();
      dialog.getAnimations({ subtree: true }).forEach(function (a) { a.cancel(); });
    };
  }

  if (dialog) {
    document.querySelectorAll('.project').forEach(function (card) {
      card.addEventListener('click', function (e) {
        if (e.target.closest('a')) return;
        openCase(card);
      });
    });
    dialog.querySelector('.case-close').addEventListener('click', closeCase);
    dialog.addEventListener('cancel', function (e) { e.preventDefault(); closeCase(); });
    // The dialog fills its own box, so a click whose target is the dialog itself landed on the backdrop.
    dialog.addEventListener('click', function (e) {
      if (e.target !== dialog) return;
      var r = dialog.getBoundingClientRect();
      var inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside) closeCase();
    });
  }

  // Skills: hover or focus highlights the projects that prove them; click jumps to the first one.
  var projects = document.querySelectorAll('.project[data-project]');
  var pinned = null;
  var pinTimer = 0;
  var smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function link(skill, on) {
    var active = on ? skill : pinned;
    var ids = active ? (active.getAttribute('data-projects') || '').split(/\s+/) : [];
    document.querySelectorAll('.skill').forEach(function (s) { s.classList.toggle('is-active', s === active); });
    projects.forEach(function (p) { p.classList.toggle('is-linked', ids.indexOf(p.getAttribute('data-project')) > -1); });
  }
  document.querySelectorAll('.skill').forEach(function (skill) {
    skill.addEventListener('mouseenter', function () { link(skill, true); });
    skill.addEventListener('mouseleave', function () { link(skill, false); });
    skill.addEventListener('focus', function () { link(skill, true); });
    skill.addEventListener('blur', function () { link(skill, false); });
    skill.addEventListener('click', function () {
      var first = document.getElementById('project-' + (skill.getAttribute('data-projects') || '').split(/\s+/)[0]);
      pinned = skill;
      link(skill, true);
      clearTimeout(pinTimer);
      pinTimer = setTimeout(function () { pinned = null; link(null, false); }, 4000);
      if (first) first.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'center' });
    });
  });

  // Earlier work: first three cards, then "Show more".
  var more = document.getElementById('earlier-toggle');
  var list = document.getElementById('earlier-list');
  if (more && list) {
    function setMore(open) {
      list.classList.toggle('is-open', open);
      more.setAttribute('aria-expanded', String(open));
      more.textContent = open ? 'Show less' : 'Show more';
    }
    setMore(false);
    more.addEventListener('click', function () { setMore(!list.classList.contains('is-open')); });
  }
})();
