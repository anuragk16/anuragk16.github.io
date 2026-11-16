/* Card expand/collapse, skill <-> project linking, and "Show more" for earlier work. */
(function () {
  // Project cards: collapsed by default when JS runs (fully open without JS).
  document.querySelectorAll('.project-toggle').forEach(function (btn) {
    var details = document.getElementById(btn.getAttribute('aria-controls'));
    if (!details) return;
    function setOpen(open) {
      btn.setAttribute('aria-expanded', String(open));
      details.hidden = !open;
    }
    setOpen(false);
    btn.addEventListener('click', function () { setOpen(btn.getAttribute('aria-expanded') !== 'true'); });
  });

  // Skills: hover or focus highlights the projects that prove them.
  var projects = document.querySelectorAll('.project[data-project]');
  function link(skill, on) {
    var ids = on ? (skill.getAttribute('data-projects') || '').split(/\s+/) : [];
    skill.classList.toggle('is-active', on);
    projects.forEach(function (p) { p.classList.toggle('is-linked', ids.indexOf(p.getAttribute('data-project')) > -1); });
  }
  document.querySelectorAll('.skill').forEach(function (skill) {
    skill.addEventListener('mouseenter', function () { link(skill, true); });
    skill.addEventListener('mouseleave', function () { link(skill, false); });
    skill.addEventListener('focus', function () { link(skill, true); });
    skill.addEventListener('blur', function () { link(skill, false); });
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
