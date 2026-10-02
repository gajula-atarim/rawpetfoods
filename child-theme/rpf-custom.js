/* Raw Petfoods – review slider for the "Difference you can see" section. */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.rpf-reviews').forEach(function (section) {
    var track = section.querySelector('.rpf-review-track');
    if (!track) return;
    var cards = Array.prototype.slice.call(track.querySelectorAll(':scope > .rpf-review'));
    if (!cards.length) return;
    var current = 0;
    var show = function (i) {
      current = (i + cards.length) % cards.length;
      cards.forEach(function (c, idx) { c.classList.toggle('is-active', idx === current); });
    };
    show(0);
    if (cards.length < 2) section.classList.add('rpf-single');
    [['.rpf-review-prev', -1], ['.rpf-review-next', 1]].forEach(function (pair) {
      var btn = section.querySelector(pair[0]);
      if (!btn) return;
      btn.setAttribute('role', 'button');
      btn.setAttribute('aria-label', pair[1] < 0 ? 'Previous review' : 'Next review');
      btn.addEventListener('click', function (e) { e.preventDefault(); show(current + pair[1]); });
    });
  });
});
