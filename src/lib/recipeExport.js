// src/utils/recipeExport.js
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';

/**
 * Expand scrollable elements inside a root node.
 */
function expandScrollables(root) {
  const scrollables = root.querySelectorAll('*');

  scrollables.forEach((el) => {
    const computed = window.getComputedStyle(el);
    if (
      computed.overflow === 'auto' ||
      computed.overflow === 'scroll' ||
      computed.overflowY === 'auto' ||
      computed.overflowY === 'scroll'
    ) {
      el.style.overflow = 'visible';
      el.style.maxHeight = 'none';
      el.style.height = 'auto';
    }
  });
}

/**
 * Export a card DOM node to PNG and trigger download.
 */
export async function exportCardToPng(cardElement, fileName) {
  if (!cardElement) return;

  await document.fonts.ready;

  // Clone the card
  const clone = cardElement.cloneNode(true);

  // Expand scrollable content
  expandScrollables(clone);

  // Create wrappers
  const outerWrapper = document.createElement('div');
  outerWrapper.style.display = 'flex';
  outerWrapper.style.justifyContent = 'center';
  outerWrapper.style.backgroundColor = '#fcfcfc';
  outerWrapper.style.width = 'fit-content';
  outerWrapper.style.maxWidth = '100%';

  const innerWrapper = document.createElement('div');
  innerWrapper.style.width = '800px';
  innerWrapper.style.maxWidth = '100%';
  innerWrapper.style.padding = '8px';
  innerWrapper.style.backgroundColor = '#fcfcfc';
  innerWrapper.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
  innerWrapper.style.borderRadius = '8px';

  innerWrapper.appendChild(clone);
  outerWrapper.appendChild(innerWrapper);
  document.body.appendChild(outerWrapper);

  try {
    const dataUrl = await htmlToImage.toPng(outerWrapper, {
      pixelRatio: 2,
      backgroundColor: '#fcfcfc',
      cacheBust: true,
    });

    saveAs(dataUrl, fileName);
  } finally {
    // cleanup even if it throws
    document.body.removeChild(outerWrapper);
  }
}

/**
 * Export a card DOM node to PDF and trigger download.
 */
export async function exportCardToPdf(cardElement, fileName) {
  if (!cardElement) return;

  await document.fonts.ready;

  // Measure the live card for PDF size
  const rect = cardElement.getBoundingClientRect();
  const padding = 20;

  const pdfWidth = rect.width + padding * 2;
  const pdfHeight = rect.height + padding * 2;

  // Clone card and expand scroll areas
  const clone = cardElement.cloneNode(true);
  expandScrollables(clone);

  // Wrap clone
  const wrapper = document.createElement('div');
  wrapper.style.padding = '8px';
  wrapper.style.backgroundColor = '#fcfcfc';
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    const dataUrl = await htmlToImage.toPng(wrapper, {
      pixelRatio: 2,
      backgroundColor: '#fcfcfc',
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [pdfWidth, pdfHeight],
    });

    const pageWidth = pdf.internal.pageSize.getWidth();

    const img = new Image();
    img.src = dataUrl;

    await new Promise((res) => (img.onload = res));

    const imgWidth = pageWidth;
    const imgHeight = (img.height / img.width) * imgWidth;

    pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(fileName);
  } finally {
    document.body.removeChild(wrapper);
  }
}
