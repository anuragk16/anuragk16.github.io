/* Theme switch: Paper (light) <-> Ink (dark). The initial theme is set by the inline head script. */
(function () {
  var root = document.documentElement;
  var KEY = 'ak-theme';
  var media = window.matchMedia('(prefers-color-scheme: dark)');

  function stored() {
    try { var v = localStorage.getItem(KEY); return v === 'light' || v === 'dark' ? v : null; } catch (e) { return null; }
  }

  function apply(t) {
    root.setAttribute('data-theme', t);
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.setAttribute('aria-pressed', String(t === 'dark'));
      btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    }
  }

  var api = {
    get: function () { return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; },
    set: function (t) {
      apply(t);
      try { localStorage.setItem(KEY, t); } catch (e) { /* storage blocked: choice lasts for this page only */ }
    }
  };
  window.akTheme = api;

  apply(api.get());

  var btn = document.getElementById('theme-toggle');
  if (btn) btn.addEventListener('click', function () { api.set(api.get() === 'dark' ? 'light' : 'dark'); });

  var onSystem = function (e) { if (!stored()) apply(e.matches ? 'dark' : 'light'); };
  if (media.addEventListener) media.addEventListener('change', onSystem); else media.addListener(onSystem);
})();
