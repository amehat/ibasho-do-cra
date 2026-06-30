/* Ibasho CRA - JS minimal : menu mobile + dialogues de confirmation.
   Aucun framework. Tout reste fonctionnel sans interaction avancee. */
(function () {
  // ---- Menu mobile (sidebar repliable) ----
  var body = document.body;
  var menuBtn = document.querySelector('[data-menu-toggle]');
  var scrim = document.querySelector('[data-nav-scrim]');
  function closeNav() { body.classList.remove('nav-open'); if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false'); }
  function toggleNav() {
    var open = body.classList.toggle('nav-open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (menuBtn) menuBtn.addEventListener('click', toggleNav);
  if (scrim) scrim.addEventListener('click', closeNav);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });

  // ---- Dialogues natifs ----
  document.querySelectorAll('[data-open-dialog]').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var dlg = document.getElementById(trigger.getAttribute('data-open-dialog'));
      if (dlg && typeof dlg.showModal === 'function') dlg.showModal();
    });
  });
  document.querySelectorAll('[data-close-dialog]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var dlg = btn.closest('dialog');
      if (dlg) dlg.close();
    });
  });
})();
