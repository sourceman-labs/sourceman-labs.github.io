// Keeps glossary and citation tooltips inside the viewport.
// The tooltip is centered on its trigger by CSS. This script shifts it
// sideways, or flips it below the trigger, when it would be cut off.
(function() {
  const MARGIN = 8;
  const triggers = document.querySelectorAll('.post-content .glossary-term, .post-content sup.cite');

  function position(trigger) {
    const tip = trigger.querySelector('.glossary-tip');
    if (!tip) return;

    // Reset to the CSS default before measuring.
    tip.style.setProperty('--tip-shift', '0px');
    tip.classList.remove('tip-below');

    const rect = tip.getBoundingClientRect();
    if (rect.left < MARGIN) {
      tip.style.setProperty('--tip-shift', (MARGIN - rect.left) + 'px');
    } else if (rect.right > window.innerWidth - MARGIN) {
      tip.style.setProperty('--tip-shift', (window.innerWidth - MARGIN - rect.right) + 'px');
    }

    if (rect.top < MARGIN) {
      tip.classList.add('tip-below');
    }
  }

  triggers.forEach(function(trigger) {
    trigger.addEventListener('mouseenter', function() { position(trigger); });
    trigger.addEventListener('focusin', function() { position(trigger); });
  });
})();
