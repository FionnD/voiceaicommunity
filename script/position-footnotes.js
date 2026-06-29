function positionFootnotes() {
  const anchors = document.querySelectorAll('[data-footnote-ref]');
  anchors.forEach(anchor => {
    const footnoteId = anchor.getAttribute('data-footnote-ref');
    const footnote = document.querySelector(`#${footnoteId}`);
    if (footnote) {
      const anchorRect = anchor.getBoundingClientRect();
      const containerRect = document.querySelector('.chapter-row').getBoundingClientRect();
      const offsetTop = anchorRect.top - containerRect.top;
      footnote.style.top = offsetTop + 'px';
    }
  });
}
window.addEventListener('load', positionFootnotes);
window.addEventListener('resize', positionFootnotes); 