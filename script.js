'use strict';

const pipelineAnimation = document.getElementById('pipeline-animation');
if (pipelineAnimation) {
  window.addEventListener('message', (event) => {
    if (event.source !== pipelineAnimation.contentWindow || event.data?.type !== 'vlm-pipeline-height') return;
    const height = event.data.height;
    if (typeof height !== 'number' || !Number.isFinite(height) || height <= 0 || height > 5000) return;
    const nextHeight = Math.max(300, Math.ceil(height));
    if (Math.abs(pipelineAnimation.getBoundingClientRect().height - nextHeight) > 1) {
      pipelineAnimation.style.height = nextHeight + 'px';
    }
  });
}

const figureDialog = document.getElementById('figure-dialog');
const dialogImage = document.getElementById('dialog-image');
let figureTrigger = null;

document.querySelectorAll('.figure-zoom').forEach((button) => {
  button.addEventListener('click', () => {
    const image = button.querySelector('img');
    figureTrigger = button;
    document.getElementById('dialog-title').textContent = button.dataset.title;
    dialogImage.src = image.currentSrc || image.src;
    dialogImage.alt = image.alt;
    document.getElementById('dialog-pdf').href = button.dataset.pdf;
    figureDialog.showModal();
    document.body.classList.add('dialog-open');
  });
});

document.getElementById('close-figure').addEventListener('click', () => figureDialog.close());
figureDialog.addEventListener('click', (event) => {
  if (event.target === figureDialog) {
    const rect = figureDialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) figureDialog.close();
  }
});
figureDialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  figureTrigger?.focus({ preventScroll: true });
});

document.getElementById('copy-citation').addEventListener('click', async () => {
  const citation = document.getElementById('citation');
  const status = document.getElementById('copy-status');
  try {
    if (!navigator.clipboard) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(citation.textContent);
    status.textContent = 'BibTeX copied.';
  } catch {
    const range = document.createRange();
    range.selectNodeContents(citation);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    status.textContent = 'Citation selected. Press Ctrl+C or ⌘C to copy.';
  }
});

const caseTabs = document.getElementById('case-tabs');
const casesSection = document.getElementById('cases');
if (caseTabs && casesSection) {
  const tabs = Array.from(caseTabs.querySelectorAll('.case-tab[role="tab"]'));
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));

  // Keep every example readable if the tab markup is incomplete.
  if (tabs.length && panels.every((panel) => panel?.matches('.case-panel[role="tabpanel"]'))) {
    const activateCase = (index, moveFocus = false) => {
      tabs.forEach((tab, tabIndex) => {
        const selected = tabIndex === index;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        panels[tabIndex].hidden = !selected;
      });
      if (moveFocus) tabs[index].focus();
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activateCase(index));
      tab.addEventListener('keydown', (event) => {
        let nextIndex;
        switch (event.key) {
          case 'ArrowRight':
          case 'ArrowDown':
            nextIndex = (index + 1) % tabs.length;
            break;
          case 'ArrowLeft':
          case 'ArrowUp':
            nextIndex = (index - 1 + tabs.length) % tabs.length;
            break;
          case 'Home':
            nextIndex = 0;
            break;
          case 'End':
            nextIndex = tabs.length - 1;
            break;
          default:
            return;
        }
        event.preventDefault();
        activateCase(nextIndex, true);
      });
    });

    activateCase(0);
    casesSection.classList.add('cases-enhanced');
  }
}
