/* Card expand/collapse, skill <-> project linking, and "Show more" for earlier work. */
(function () {
  // Project cards: collapsed by default when JS runs (fully open without JS).
  // Side cards share one panel row, so only one of their panels is open at a time.
  var toggles = Array.prototype.slice.call(document.querySelectorAll('.project-toggle'));
  function target(btn) { return document.getElementById(btn.getAttribute('aria-controls')); }
  function setOpen(btn, open) {
    var details = target(btn);
    if (!details) return;
    btn.setAttribute('aria-expanded', String(open));
    details.hidden = !open;
  }
  toggles.forEach(function (btn) {
    setOpen(btn, false);
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      var details = target(btn);
      if (open && details && details.classList.contains('project-panel')) {
        toggles.forEach(function (other) {
          var d = target(other);
          if (other !== btn && d && d.classList.contains('project-panel')) setOpen(other, false);
        });
      }
      setOpen(btn, open);
    });
  });

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
