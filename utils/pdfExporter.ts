import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { ContentPlanItem, WeeklyReport, MonthlyReport, QuarterlyReport } from '../types';
import { ContentLibraryCategory } from '../data/contentLibraryData';

const getFormatBadge = (format: string) => {
  switch (format) {
    case 'reel':
      return { label: '🎬 فيديو Reel', bg: '#F3E8FF', text: '#6B21A8', border: '#D8B4FE' };
    case 'design':
      return { label: '🎨 تصميم Carousel', bg: '#E0F2FE', text: '#0369A1', border: '#7DD3FC' };
    case 'story':
      return { label: '⏳ ستوري Story', bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' };
    default:
      return { label: '📝 منشور Post', bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' };
  }
};

const getStatusBadge = (item: ContentPlanItem) => {
  if (item.isExecuted || item.status === 'published') {
    return { label: '✅ تم النشر', bg: '#DCFCE7', text: '#166534', border: '#86EFAC' };
  }
  return { label: '⏳ قيد التنفيذ', bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' };
};

const formatPlatformName = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'facebook':
      return 'فيسبوك (Facebook)';
    case 'instagram':
      return 'انستجرام (Instagram)';
    case 'tiktok':
      return 'تيك توك (TikTok)';
    case 'youtube':
      return 'يوتيوب (YouTube)';
    case 'linkedin':
      return 'لينكد إن (LinkedIn)';
    case 'x':
    case 'twitter':
      return 'منصة إكس (X)';
    default:
      return platform;
  }
};

/**
 * Creates a DOM host element attached to document.body for accurate CSS height measurements
 */
function createPdfStagingHost(): HTMLElement {
  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.left = '-9999px';
  host.style.top = '0px';
  host.style.width = '794px';
  host.style.zIndex = '-9999';
  document.body.appendChild(host);
  return host;
}

export interface ElementPdfOptions {
  filename: string;
  backgroundColor?: string;
  marginMm?: number;
}

const waitForImages = async (root: HTMLElement) => {
  const pendingImages = Array.from(root.querySelectorAll('img')).filter(image => !image.complete);
  await Promise.all(
    pendingImages.map(
      image =>
        new Promise<void>(resolve => {
          const timeout = window.setTimeout(resolve, 5000);
          const finish = () => {
            window.clearTimeout(timeout);
            resolve();
          };
          image.addEventListener('load', finish, { once: true });
          image.addEventListener('error', finish, { once: true });
        })
    )
  );
};

const getSmartPageBreaks = (root: HTMLElement, canvasScale: number) => {
  const rootTop = root.getBoundingClientRect().top;
  const candidates = new Set<number>();
  const selector = [
    '[data-pdf-block]',
    'section',
    'article',
    'blockquote',
    'h1',
    'h2',
    'h3',
    'h4',
    '.rounded-xl',
    '.rounded-2xl',
    '.rounded-3xl'
  ].join(',');

  root.querySelectorAll<HTMLElement>(selector).forEach(element => {
    const rect = element.getBoundingClientRect();
    if (rect.height > 0) {
      const isHeading = /^H[1-4]$/.test(element.tagName);
      const breakPosition = isHeading ? rect.top : rect.bottom;
      candidates.add(Math.round((breakPosition - rootTop) * canvasScale));
    }
  });

  return Array.from(candidates).sort((a, b) => a - b);
};

/**
 * Downloads an existing screen report as a real PDF without opening the print dialog.
 * The content is rendered off-screen at a stable desktop width, then split close to
 * card and heading boundaries so report blocks are less likely to be cut in half.
 */
export async function exportElementToPDF(element: HTMLElement, options: ElementPdfOptions) {
  const host = createPdfStagingHost();
  const backgroundColor = options.backgroundColor || '#ffffff';
  const marginMm = options.marginMm ?? 10;

  try {
    const clone = element.cloneNode(true) as HTMLElement;
    clone.removeAttribute('id');
    clone.classList.remove('hidden', 'print:block');
    clone.querySelectorAll('[data-pdf-hide], .no-print').forEach(node => node.remove());
    clone.querySelectorAll<HTMLElement>('*').forEach(node => {
      node.style.maxHeight = 'none';
      node.style.overflow = 'visible';
      node.style.overflowY = 'visible';
    });

    Object.assign(clone.style, {
      display: 'block',
      width: '730px',
      maxWidth: '730px',
      maxHeight: 'none',
      overflow: 'visible',
      boxSizing: 'border-box',
      backgroundColor,
      padding: '24px',
      margin: '0',
      direction: 'rtl'
    });

    host.style.width = '730px';
    host.style.backgroundColor = backgroundColor;
    host.appendChild(clone);

    if (document.fonts) await document.fonts.ready;
    await waitForImages(clone);
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const renderScale = 2;
    const smartBreaks = getSmartPageBreaks(clone, renderScale);
    const canvas = await html2canvas(clone, {
      scale: renderScale,
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor,
      imageTimeout: 15000,
      windowWidth: 1200,
      scrollX: 0,
      scrollY: 0
    });

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidthMm = 210;
    const pageHeightMm = 297;
    const contentWidthMm = pageWidthMm - marginMm * 2;
    const contentHeightMm = pageHeightMm - marginMm * 2;
    const mmPerCanvasPixel = contentWidthMm / canvas.width;
    const maxSliceHeight = Math.floor(contentHeightMm / mmPerCanvasPixel);
    const minimumUsefulSlice = Math.floor(maxSliceHeight * 0.55);
    let sourceY = 0;
    let pageIndex = 0;

    while (sourceY < canvas.height) {
      const remaining = canvas.height - sourceY;
      let sliceHeight = Math.min(maxSliceHeight, remaining);
      const naturalTail = remaining - maxSliceHeight;
      const shouldMergeSmallTail = naturalTail > 0 && naturalTail < maxSliceHeight * 0.18;

      if (shouldMergeSmallTail) {
        sliceHeight = remaining;
      } else if (remaining > maxSliceHeight) {
        const targetEnd = sourceY + maxSliceHeight;
        const smartEnd = smartBreaks
          .filter(point => point <= targetEnd && point >= sourceY + minimumUsefulSlice)
          .pop();
        const wouldLeaveTinyLastPage = smartEnd && canvas.height - smartEnd < maxSliceHeight * 0.25;
        if (smartEnd && !wouldLeaveTinyLastPage) sliceHeight = smartEnd - sourceY;
      }

      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;
      const context = pageCanvas.getContext('2d');
      if (!context) throw new Error('تعذر تجهيز صفحة ملف PDF.');
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      context.drawImage(
        canvas,
        0,
        sourceY,
        canvas.width,
        sliceHeight,
        0,
        0,
        canvas.width,
        sliceHeight
      );

      if (pageIndex > 0) pdf.addPage();
      const naturalImageHeightMm = sliceHeight * mmPerCanvasPixel;
      const fitScale = Math.min(1, contentHeightMm / naturalImageHeightMm);
      const imageWidthMm = contentWidthMm * fitScale;
      const imageHeightMm = naturalImageHeightMm * fitScale;
      const imageX = marginMm + (contentWidthMm - imageWidthMm) / 2;
      pdf.addImage(
        pageCanvas.toDataURL('image/png'),
        'PNG',
        imageX,
        marginMm,
        imageWidthMm,
        imageHeightMm,
        undefined,
        'FAST'
      );

      sourceY += sliceHeight;
      pageIndex += 1;
    }

    const filename = options.filename.toLowerCase().endsWith('.pdf')
      ? options.filename
      : `${options.filename}.pdf`;
    pdf.save(filename.replace(/[\\/:*?\"<>|]+/g, '_'));
  } finally {
    host.remove();
  }
}

/**
 * Core helper: Renders array of A4 HTML Page elements sequentially into jsPDF
 */
async function renderPagesToPDF(host: HTMLElement, pageElements: HTMLElement[], filename: string) {
  try {
    if (document.fonts) {
      await document.fonts.ready;
    }
    // Give browser layout engine a short tick to stabilize font metrics & rendering
    await new Promise((resolve) => setTimeout(resolve, 300));

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    for (let i = 0; i < pageElements.length; i++) {
      const pageEl = pageElements[i];
      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      if (i > 0) {
        pdf.addPage();
      }

      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
    }

    pdf.save(filename);
  } finally {
    if (document.body.contains(host)) {
      document.body.removeChild(host);
    }
  }
}

/**
 * Factory for exact A4 Page DOM Node (794px x 1123px)
 */
function createA4PageNode(
  brandName: string,
  docTitle: string
): { page: HTMLElement; body: HTMLElement } {
  const page = document.createElement('div');
  page.dir = 'rtl';
  page.style.width = '794px';
  page.style.minHeight = '1123px';
  page.style.padding = '28px 32px';
  page.style.boxSizing = 'border-box';
  page.style.backgroundColor = '#ffffff';
  page.style.fontFamily = "'Cairo', 'IBM Plex Sans Arabic', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  page.style.color = '#1f2937';
  page.style.display = 'flex';
  page.style.flexDirection = 'column';
  page.style.justifyContent = 'space-between';
  page.style.position = 'relative';

  const todayFormatted = new Date().toISOString().split('T')[0];

  // Top Header Banner
  const headerHtml = `
    <div style="border-bottom: 2.5px solid #5A5A40; padding-bottom: 10px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-end;">
      <div>
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
          <span style="background-color: #5A5A40; color: #ffffff; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 6px;">
            البراند: ${brandName || 'العميل'}
          </span>
          <span style="font-size: 11px; font-weight: 700; color: #8E8E85;">Growth OS Strategy</span>
        </div>
        <h1 style="margin: 0; font-size: 17px; font-weight: 800; color: #2D2D2A; font-family: 'Cairo', sans-serif;">
          ${docTitle}
        </h1>
      </div>
      <div style="text-align: left; font-size: 10px; color: #78786E; font-weight: 700;">
        <div style="color: #2D2D2A; font-weight: 800;">نظام إدارة استراتيجية المحتوى</div>
        <div style="color: #5A5A40; font-weight: 800; margin-top: 2px;">📅 ${todayFormatted}</div>
      </div>
    </div>
  `;

  // Footer Banner
  const footerHtml = `
    <div style="border-top: 1.5px solid #E5E5E0; padding-top: 8px; margin-top: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #78786E; font-weight: 700;">
      <div>Growth OS — التقرير المعتمد لتنفيذ استراتيجية المحتوى التسويقية</div>
      <div style="background-color: #F9F8F6; border: 1px solid #E5E5E0; padding: 3px 12px; border-radius: 8px; color: #2D2D2A; font-weight: 800;" class="page-number-text">
        صفحة 1
      </div>
    </div>
  `;

  const headerDiv = document.createElement('div');
  headerDiv.innerHTML = headerHtml;
  page.appendChild(headerDiv);

  const body = document.createElement('div');
  body.className = 'page-body-container';
  body.style.flex = '1';
  body.style.display = 'flex';
  body.style.flexDirection = 'column';
  body.style.gap = '10px';
  page.appendChild(body);

  const footerDiv = document.createElement('div');
  footerDiv.innerHTML = footerHtml;
  page.appendChild(footerDiv);

  return { page, body };
}

/**
 * Update Page numbers across generated page elements
 */
function updatePageNumbers(pages: HTMLElement[]) {
  const total = pages.length;
  pages.forEach((p, idx) => {
    const pageNumEl = p.querySelector('.page-number-text');
    if (pageNumEl) {
      pageNumEl.textContent = `صفحة ${idx + 1} من ${total}`;
    }
  });
}

/**
 * Helper to safely append a DOM block node into pages array.
 */
function appendBlockToPages(
  pages: HTMLElement[],
  createNewPageFn: () => { page: HTMLElement; body: HTMLElement },
  blockNode: HTMLElement
) {
  if (pages.length === 0) {
    const first = createNewPageFn();
    pages.push(first.page);
  }

  let currentPageObj = {
    page: pages[pages.length - 1],
    body: pages[pages.length - 1].querySelector('.page-body-container') as HTMLElement,
  };

  currentPageObj.body.appendChild(blockNode);

  // Check if body overflows 890px (safe A4 body height threshold) and has more than 1 child
  if (currentPageObj.body.scrollHeight > 890 && currentPageObj.body.children.length > 1) {
    currentPageObj.body.removeChild(blockNode);

    const newPageObj = createNewPageFn();
    newPageObj.body.appendChild(blockNode);
    pages.push(newPageObj.page);
  }
}

/**
 * Smart helper that appends a Day Header along with its items to pages array.
 * GUARANTEES that a Day Header is NEVER left orphaned alone at the bottom of a page!
 */
function appendDayGroupToPages(
  pages: HTMLElement[],
  createNewPageFn: () => { page: HTMLElement; body: HTMLElement },
  dayHeaderNode: HTMLElement,
  cardNodes: HTMLElement[],
  dateStr: string,
  dayNumber: number
) {
  if (pages.length === 0) {
    const first = createNewPageFn();
    pages.push(first.page);
  }

  // If there are no cards for this day, append dayHeader safely
  if (cardNodes.length === 0) {
    appendBlockToPages(pages, createNewPageFn, dayHeaderNode);
    return;
  }

  let currentPageObj = {
    page: pages[pages.length - 1],
    body: pages[pages.length - 1].querySelector('.page-body-container') as HTMLElement,
  };

  // 1. Try appending BOTH dayHeaderNode AND cardNodes[0] to current page
  currentPageObj.body.appendChild(dayHeaderNode);
  currentPageObj.body.appendChild(cardNodes[0]);

  // If scrollHeight exceeds 890px AND there were already other elements on this page (children > 2),
  // then dayHeader + first card do not fit together on the current page. Move BOTH to a new page!
  if (currentPageObj.body.scrollHeight > 890 && currentPageObj.body.children.length > 2) {
    currentPageObj.body.removeChild(cardNodes[0]);
    currentPageObj.body.removeChild(dayHeaderNode);

    const newPageObj = createNewPageFn();
    newPageObj.body.appendChild(dayHeaderNode);
    newPageObj.body.appendChild(cardNodes[0]);
    pages.push(newPageObj.page);
  }

  // 2. Process remaining cards (from index 1 onwards)
  for (let i = 1; i < cardNodes.length; i++) {
    const card = cardNodes[i];
    let curBody = pages[pages.length - 1].querySelector('.page-body-container') as HTMLElement;

    curBody.appendChild(card);

    // Check if this card caused an overflow
    if (curBody.scrollHeight > 890 && curBody.children.length > 1) {
      curBody.removeChild(card);

      // Create new page and add a continuation badge so the day context is preserved
      const newPageObj = createNewPageFn();

      const contHeader = document.createElement('div');
      contHeader.style.backgroundColor = '#78786E';
      contHeader.style.color = '#ffffff';
      contHeader.style.padding = '5px 12px';
      contHeader.style.borderRadius = '6px';
      contHeader.style.fontSize = '11px';
      contHeader.style.fontWeight = '800';
      contHeader.style.marginBottom = '4px';
      contHeader.innerHTML = `📅 تابع اليوم (${dayNumber}): ${dateStr}`;

      newPageObj.body.appendChild(contHeader);
      newPageObj.body.appendChild(card);
      pages.push(newPageObj.page);
    }
  }
}

/**
 * EXPORT SELECTED CALENDAR DAYS TO PDF
 */
export async function exportSelectedCalendarDaysToPDF(
  selectedDaysWithItems: { dateStr: string; items: ContentPlanItem[] }[],
  brandName: string,
  customTitle?: string
) {
  const host = createPdfStagingHost();
  const sortedDays = [...selectedDaysWithItems].sort((a, b) =>
    a.dateStr.localeCompare(b.dateStr)
  );

  const docTitle = customTitle || 'جدول ومحتوى استراتيجية المحتوى (Content Strategy Calendar Collection)';
  const pages: HTMLElement[] = [];

  const createPage = () => {
    const { page, body } = createA4PageNode(brandName, docTitle);
    host.appendChild(page);
    return { page, body };
  };

  if (sortedDays.length === 0) {
    const { page, body } = createPage();
    body.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; background-color: #F9F8F6; border: 1px dashed #E5E5E0; border-radius: 16px; color: #78786E; margin-top: 40px;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 800; color: #2D2D2A;">لا يوجد محتوى في الأيام المحددة</h3>
        <p style="margin: 0; font-size: 13px;">يرجى تحديد أيام تحتوي على منشورات لتصديرها.</p>
      </div>
    `;
    pages.push(page);
  } else {
    sortedDays.forEach((dayGroup, dayIdx) => {
      const items = dayGroup.items;

      // 1. Create Day Header Banner
      const dayHeader = document.createElement('div');
      dayHeader.style.backgroundColor = '#5A5A40';
      dayHeader.style.color = '#ffffff';
      dayHeader.style.padding = '8px 14px';
      dayHeader.style.borderRadius = '8px';
      dayHeader.style.display = 'flex';
      dayHeader.style.justifyContent = 'space-between';
      dayHeader.style.alignItems = 'center';
      dayHeader.style.marginTop = '4px';

      dayHeader.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 13px; font-weight: 800; font-family: 'Cairo', sans-serif;">
            📅 اليوم (${dayIdx + 1}): ${dayGroup.dateStr}
          </span>
        </div>
        <span style="font-size: 11px; font-weight: 800; background-color: rgba(255,255,255,0.25); padding: 3px 12px; border-radius: 20px;">
          إجمالي المنشورات: ${items.length}
        </span>
      `;

      // 2. Prepare card DOM nodes
      const cardNodes: HTMLElement[] = items.map((item, itemIdx) => {
        const formatBadge = getFormatBadge(item.format);
        const statusBadge = getStatusBadge(item);

        const platformsList = item.platforms && item.platforms.length > 0
          ? item.platforms.map(p => formatPlatformName(p)).join(' • ')
          : 'جميع المنصات';

        const card = document.createElement('div');
        card.style.backgroundColor = '#F9F8F6';
        card.style.border = '1px solid #E5E5E0';
        card.style.borderRight = '5px solid #5A5A40';
        card.style.borderRadius = '10px';
        card.style.padding = '12px 14px';
        card.style.boxSizing = 'border-box';
        card.style.marginBottom = '4px';

        card.innerHTML = `
          <!-- Top Title Bar -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid #E5E5E0; padding-bottom: 6px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 11px; font-weight: 800; background-color: #5A5A40; color: #ffffff; width: 22px; height: 22px; border-radius: 50%; text-align: center; line-height: 22px; display: inline-block;">
                ${itemIdx + 1}
              </span>
              <strong style="font-size: 13px; font-weight: 800; color: #2D2D2A; font-family: 'Cairo', sans-serif;">${item.title || 'منشور بدون عنوان'}</strong>
            </div>
            <div style="display: flex; gap: 6px; align-items: center;">
              <span style="font-size: 10px; font-weight: 800; background-color: ${formatBadge.bg}; color: ${formatBadge.text}; border: 1px solid ${formatBadge.border}; padding: 3px 8px; border-radius: 6px; display: inline-block;">
                ${formatBadge.label}
              </span>
              <span style="font-size: 10px; font-weight: 800; background-color: ${statusBadge.bg}; color: ${statusBadge.text}; border: 1px solid ${statusBadge.border}; padding: 3px 8px; border-radius: 6px; display: inline-block;">
                ${statusBadge.label}
              </span>
            </div>
          </div>

          <!-- Metadata Attributes Table (Uses HTML Table for 100% stable html2canvas rendering) -->
          <table style="width: 100%; border-collapse: collapse; font-size: 11px; color: #374151; background-color: #ffffff; padding: 6px 10px; border-radius: 8px; border: 1px solid #E5E7EB; margin-bottom: 8px; direction: rtl;">
            <tr>
              <td style="width: 50%; padding: 4px 6px; vertical-align: top;"><strong style="color: #5A5A40;">📱 المنصات:</strong> <span>${platformsList}</span></td>
              <td style="width: 50%; padding: 4px 6px; vertical-align: top;"><strong style="color: #5A5A40;">📂 التصنيف:</strong> <span>${item.category || 'عام'}</span></td>
            </tr>
            ${(item.goal || item.idea) ? `
              <tr>
                <td style="width: 50%; padding: 4px 6px; vertical-align: top;">${item.goal ? `<strong style="color: #5A5A40;">🎯 الهدف التسويقي:</strong> <span>${item.goal}</span>` : ''}</td>
                <td style="width: 50%; padding: 4px 6px; vertical-align: top;">${item.idea ? `<strong style="color: #5A5A40;">💡 اسم الفكرة:</strong> <span>${item.idea}</span>` : ''}</td>
              </tr>
            ` : ''}
            ${item.ideaDescription ? `
              <tr>
                <td colspan="2" style="padding: 6px 6px 4px 6px; vertical-align: top; border-top: 1px dashed #E5E7EB;"><strong style="color: #5A5A40;">📝 شرح الفكرة:</strong> <span>${item.ideaDescription}</span></td>
              </tr>
            ` : ''}
          </table>

          <!-- Script / Details Body -->
          ${item.details ? `
            <div style="font-size: 11px; color: #1F2937; background-color: #ffffff; padding: 10px 12px; border-radius: 8px; border: 1px solid #E5E5E0; line-height: 1.5; margin-bottom: 6px;">
              <strong style="color: #5A5A40; display: block; margin-bottom: 4px; font-size: 11px; border-bottom: 1px solid #F3F4F6; padding-bottom: 4px;">
                ✍️ صياغة وسكريبت المحتوى:
              </strong>
              <div style="white-space: pre-wrap; word-break: break-word;">${item.details}</div>
            </div>
          ` : ''}

          <!-- Notes -->
          ${item.notes ? `
            <div style="font-size: 10px; color: #92400E; background-color: #FEF3C7; padding: 6px 10px; border-radius: 6px; border: 1px solid #FDE68A;">
              <strong>💡 ملاحظات وتنفيذ:</strong> ${item.notes}
            </div>
          ` : ''}
        `;
        return card;
      });

      // Append Day Group safely
      appendDayGroupToPages(pages, createPage, dayHeader, cardNodes, dayGroup.dateStr, dayIdx + 1);
    });
  }

  updatePageNumbers(pages);
  const safeBrand = (brandName || 'Brand').replace(/[^a-zA-Z0-9أ-ي]/g, '_');
  await renderPagesToPDF(host, pages, `Content_Plan_${safeBrand}.pdf`);
}

/**
 * EXPORT CONTENT LIBRARY TO PDF
 */
export async function exportContentLibraryToPDF(
  categories: ContentLibraryCategory[],
  brandName: string,
  filterTitle?: string
) {
  const host = createPdfStagingHost();
  const docTitle = `مكتبة المحتوى والأفكار الاستراتيجية (Content Library)${filterTitle ? ` - ${filterTitle}` : ''}`;
  const pages: HTMLElement[] = [];

  const createPage = () => {
    const { page, body } = createA4PageNode(brandName, docTitle);
    host.appendChild(page);
    return { page, body };
  };

  if (categories.length === 0) {
    const { page, body } = createPage();
    body.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; background-color: #F9F8F6; border: 1px dashed #E5E5E0; border-radius: 16px; color: #78786E; margin-top: 40px;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 800; color: #2D2D2A;">لا توجد أفكار في مكتبة المحتوى</h3>
        <p style="margin: 0; font-size: 13px;">يرجى إلغاء التصفية لاستعراض وحفظ كل أفكار مكتبة المحتوى.</p>
      </div>
    `;
    pages.push(page);
  } else {
    categories.forEach((cat, catIdx) => {
      // 1. Category Header Banner
      const catHeader = document.createElement('div');
      catHeader.style.backgroundColor = '#D97706';
      catHeader.style.color = '#ffffff';
      catHeader.style.padding = '10px 14px';
      catHeader.style.borderRadius = '8px';
      catHeader.style.marginTop = '4px';

      catHeader.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 13px; font-weight: 800; font-family: 'Cairo', sans-serif;">
            📂 تصنيف ${catIdx + 1}: ${cat.title}
          </span>
          <span style="font-size: 10px; font-weight: 800; background-color: rgba(255,255,255,0.25); padding: 3px 10px; border-radius: 12px;">
            ${cat.ideas.length} أفكار
          </span>
        </div>
        ${cat.goal ? `
          <div style="font-size: 11px; opacity: 0.95; margin-top: 4px; font-weight: 600; border-top: 1px solid rgba(255,255,255,0.25); padding-top: 4px;">
            🎯 الهدف التسويقي: ${cat.goal}
          </div>
        ` : ''}
      `;

      // 2. Prepare Idea Cards
      const ideaCardNodes: HTMLElement[] = cat.ideas.map((idea, ideaIdx) => {
        const card = document.createElement('div');
        card.style.backgroundColor = '#F9F8F6';
        card.style.border = '1px solid #E5E5E0';
        card.style.borderRight = '4px solid #D97706';
        card.style.borderRadius = '8px';
        card.style.padding = '10px 14px';
        card.style.boxSizing = 'border-box';

        card.innerHTML = `
          <div style="font-size: 13px; font-weight: 800; color: #2D2D2A; margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
            <span style="background-color: #FEF3C7; color: #92400E; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 6px; border: 1px solid #FDE68A;">
              فكرة ${ideaIdx + 1}
            </span>
            <span>💡 ${idea.name}</span>
          </div>
          ${idea.description ? `
            <div style="font-size: 11px; color: #374151; white-space: pre-wrap; word-break: break-word; background-color: #ffffff; padding: 8px 12px; border-radius: 6px; border: 1px solid #E5E7EB; line-height: 1.5;">
              ${idea.description}
            </div>
          ` : ''}
        `;
        return card;
      });

      // Append category header + idea cards atomically
      if (ideaCardNodes.length === 0) {
        appendBlockToPages(pages, createPage, catHeader);
      } else {
        if (pages.length === 0) pages.push(createPage().page);
        let curPageObj = {
          page: pages[pages.length - 1],
          body: pages[pages.length - 1].querySelector('.page-body-container') as HTMLElement,
        };

        curPageObj.body.appendChild(catHeader);
        curPageObj.body.appendChild(ideaCardNodes[0]);

        if (curPageObj.body.scrollHeight > 890 && curPageObj.body.children.length > 2) {
          curPageObj.body.removeChild(ideaCardNodes[0]);
          curPageObj.body.removeChild(catHeader);

          const newPageObj = createPage();
          newPageObj.body.appendChild(catHeader);
          newPageObj.body.appendChild(ideaCardNodes[0]);
          pages.push(newPageObj.page);
        }

        for (let i = 1; i < ideaCardNodes.length; i++) {
          appendBlockToPages(pages, createPage, ideaCardNodes[i]);
        }
      }
    });
  }

  updatePageNumbers(pages);
  const safeBrand = (brandName || 'Brand').replace(/[^a-zA-Z0-9أ-ي]/g, '_');
  await renderPagesToPDF(host, pages, `Content_Library_${safeBrand}_Full.pdf`);
}

/**
 * EXPORT WEEKLY REPORT TO PDF DIRECTLY
 */
export async function exportWeeklyReportToPDF(
  rep: WeeklyReport,
  brandName: string
) {
  const host = createPdfStagingHost();
  const displayBrand = brandName || 'البراند';
  const periodText = `من ${rep.weekStartDate || ''}${rep.weekEndDate ? ` إلى ${rep.weekEndDate}` : ''}`;
  const docTitle = rep.title ? `${rep.title} (${periodText})` : `التقرير الأسبوعي الشامل - ${periodText}`;

  const pages: HTMLElement[] = [];
  const createPage = () => {
    const { page, body } = createA4PageNode(displayBrand, docTitle);
    host.appendChild(page);
    return { page, body };
  };

  const revenueVal = rep.totalRevenue || rep.salesValue || 0;
  const ordersVal = rep.totalOrders || rep.totalConversions || 0;

  // 1. ملخص الأداء | Weekly Performance
  const statsBlock = document.createElement('div');
  statsBlock.style.marginBottom = '12px';
  statsBlock.innerHTML = `
    <div style="background-color: rgba(90, 90, 64, 0.1); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(90, 90, 64, 0.2); font-weight: 800; font-size: 12px; color: #2D2D2A; margin-bottom: 8px; font-family: 'Cairo', sans-serif;">
      📊 1. ملخص الأداء | Weekly Performance
    </div>
    <table style="width: 100%; border-collapse: separate; border-spacing: 6px; margin-bottom: 6px; direction: rtl;">
      <tr>
        <td style="width: 25%; background-color: #F9F8F6; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; text-align: center; vertical-align: top;">
          <span style="font-size: 9px; color: #8E8E85; font-weight: 700; display: block; margin-bottom: 2px;">إجمالي الإنفاق (EGP)</span>
          <div style="font-size: 12px; font-weight: 900; color: #be123c;">${(rep.totalSpent || 0).toLocaleString()} EGP</div>
        </td>
        <td style="width: 25%; background-color: #F9F8F6; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; text-align: center; vertical-align: top;">
          <span style="font-size: 9px; color: #8E8E85; font-weight: 700; display: block; margin-bottom: 2px;">إجمالي الطلبات</span>
          <div style="font-size: 12px; font-weight: 900; color: #5A5A40;">${ordersVal} طلب</div>
        </td>
        <td style="width: 25%; background-color: #F9F8F6; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; text-align: center; vertical-align: top;">
          <span style="font-size: 9px; color: #8E8E85; font-weight: 700; display: block; margin-bottom: 2px;">إجمالي المبيعات (EGP)</span>
          <div style="font-size: 12px; font-weight: 900; color: #047857;">${revenueVal.toLocaleString()} EGP</div>
        </td>
        <td style="width: 25%; background-color: #F9F8F6; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; text-align: center; vertical-align: top;">
          <span style="font-size: 9px; color: #8E8E85; font-weight: 700; display: block; margin-bottom: 2px;">العائد (ROAS)</span>
          <div style="font-size: 12px; font-weight: 900; color: #92400e;">${rep.roas || 0}x</div>
        </td>
      </tr>
    </table>
    <table style="width: 100%; border-collapse: separate; border-spacing: 6px; margin-bottom: 6px; direction: rtl;">
      <tr>
        <td style="width: 33.33%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; text-align: center; vertical-align: top;">
          <span style="font-size: 9px; color: #8E8E85; font-weight: 700; display: block; margin-bottom: 2px;">تكلفة الطلب (CPA)</span>
          <div style="font-size: 11px; font-weight: 800; color: #2D2D2A;">${rep.cpa || '-'}</div>
        </td>
        <td style="width: 33.33%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; text-align: center; vertical-align: top;">
          <span style="font-size: 9px; color: #8E8E85; font-weight: 700; display: block; margin-bottom: 2px;">متوسط قيمة الطلب (AOV)</span>
          <div style="font-size: 11px; font-weight: 800; color: #2D2D2A;">${rep.aov || '-'}</div>
        </td>
        <td style="width: 33.33%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; text-align: center; vertical-align: top;">
          <span style="font-size: 9px; color: #8E8E85; font-weight: 700; display: block; margin-bottom: 2px;">معدل التحويل (Conversion Rate)</span>
          <div style="font-size: 11px; font-weight: 800; color: #4338ca;">${rep.conversionRate || '-'}</div>
        </td>
      </tr>
    </table>
  `;
  appendBlockToPages(pages, createPage, statsBlock);

  // 2. مقارنة بالأسبوع السابق | Week-over-Week
  if (rep.spendChange || rep.ordersChange || rep.revenueChange || rep.roasChange || rep.cpaChange || rep.aovChange) {
    const wowBlock = document.createElement('div');
    wowBlock.style.marginBottom = '12px';
    wowBlock.innerHTML = `
      <div style="background-color: rgba(59, 130, 246, 0.1); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(59, 130, 246, 0.2); font-weight: 800; font-size: 12px; color: #1e40af; margin-bottom: 8px; font-family: 'Cairo', sans-serif;">
        📈 2. مقارنة بالأسبوع السابق | Week-over-Week
      </div>
      <table style="width: 100%; border-collapse: separate; border-spacing: 6px; font-size: 10px; direction: rtl;">
        <tr>
          ${rep.spendChange ? `
            <td style="width: 33.33%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
              <span style="font-weight: 800; color: #8E8E85; display: block; margin-bottom: 2px;">تغير الإنفاق:</span>
              <p style="font-weight: 800; color: #2D2D2A; margin: 0;">${rep.spendChange}</p>
            </td>
          ` : '<td style="width: 33.33%;"></td>'}
          ${rep.ordersChange ? `
            <td style="width: 33.33%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
              <span style="font-weight: 800; color: #8E8E85; display: block; margin-bottom: 2px;">تغير عدد الطلبات:</span>
              <p style="font-weight: 800; color: #2D2D2A; margin: 0;">${rep.ordersChange}</p>
            </td>
          ` : '<td style="width: 33.33%;"></td>'}
          ${rep.revenueChange ? `
            <td style="width: 33.33%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
              <span style="font-weight: 800; color: #8E8E85; display: block; margin-bottom: 2px;">تغير المبيعات:</span>
              <p style="font-weight: 800; color: #2D2D2A; margin: 0;">${rep.revenueChange}</p>
            </td>
          ` : '<td style="width: 33.33%;"></td>'}
        </tr>
        <tr>
          ${rep.roasChange ? `
            <td style="width: 33.33%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
              <span style="font-weight: 800; color: #8E8E85; display: block; margin-bottom: 2px;">تغير ROAS:</span>
              <p style="font-weight: 800; color: #2D2D2A; margin: 0;">${rep.roasChange}</p>
            </td>
          ` : '<td style="width: 33.33%;"></td>'}
          ${rep.cpaChange ? `
            <td style="width: 33.33%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
              <span style="font-weight: 800; color: #8E8E85; display: block; margin-bottom: 2px;">تغير CPA:</span>
              <p style="font-weight: 800; color: #2D2D2A; margin: 0;">${rep.cpaChange}</p>
            </td>
          ` : '<td style="width: 33.33%;"></td>'}
          ${rep.aovChange ? `
            <td style="width: 33.33%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
              <span style="font-weight: 800; color: #8E8E85; display: block; margin-bottom: 2px;">تغير AOV:</span>
              <p style="font-weight: 800; color: #2D2D2A; margin: 0;">${rep.aovChange}</p>
            </td>
          ` : '<td style="width: 33.33%;"></td>'}
        </tr>
      </table>
    `;
    appendBlockToPages(pages, createPage, wowBlock);
  }

  // 3. أداء الحملات | Campaign Performance
  if (rep.bestCampaign || rep.weakestCampaign || rep.improvingCampaigns || rep.decliningCampaigns || rep.scalingCampaigns || rep.optimizationPauseCampaigns) {
    const campaignBlock = document.createElement('div');
    campaignBlock.style.marginBottom = '12px';
    campaignBlock.innerHTML = `
      <div style="background-color: rgba(16, 185, 129, 0.1); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.2); font-weight: 800; font-size: 12px; color: #065f46; margin-bottom: 8px; font-family: 'Cairo', sans-serif;">
        🎯 3. أداء الحملات | Campaign Performance
      </div>
      <table style="width: 100%; border-collapse: separate; border-spacing: 6px; font-size: 10px; direction: rtl;">
        ${(rep.bestCampaign || rep.weakestCampaign) ? `
          <tr>
            ${rep.bestCampaign ? `
              <td style="width: 50%; background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #065f46; display: block; margin-bottom: 3px;">🟢 أفضل حملة وسبب النجاح:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.bestCampaign}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
            ${rep.weakestCampaign ? `
              <td style="width: 50%; background-color: #fff1f2; border: 1px solid #fecdd3; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #9f1239; display: block; margin-bottom: 3px;">🔴 أضعف حملة وسبب الضعف:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.weakestCampaign}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
          </tr>
        ` : ''}
        ${(rep.improvingCampaigns || rep.decliningCampaigns) ? `
          <tr>
            ${rep.improvingCampaigns ? `
              <td style="width: 50%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
                <span style="font-weight: 800; color: #047857; display: block; margin-bottom: 3px;">الحملات التي تحسنت:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.improvingCampaigns}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
            ${rep.decliningCampaigns ? `
              <td style="width: 50%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
                <span style="font-weight: 800; color: #b45309; display: block; margin-bottom: 3px;">الحملات التي تراجعت:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.decliningCampaigns}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
          </tr>
        ` : ''}
        ${(rep.scalingCampaigns || rep.optimizationPauseCampaigns) ? `
          <tr>
            ${rep.scalingCampaigns ? `
              <td style="width: 50%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
                <span style="font-weight: 800; color: #1e40af; display: block; margin-bottom: 3px;">الحملات التي تحتاج Scaling:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.scalingCampaigns}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
            ${rep.optimizationPauseCampaigns ? `
              <td style="width: 50%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
                <span style="font-weight: 800; color: #be123c; display: block; margin-bottom: 3px;">الحملات التي تحتاج Optimization / Pause:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.optimizationPauseCampaigns}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
          </tr>
        ` : ''}
      </table>
    `;
    appendBlockToPages(pages, createPage, campaignBlock);
  }

  // 4. التحليل الأسبوعي | Weekly Analysis
  if (rep.whatWorkedWell || rep.whatNeedsImprovement || rep.keyChanges || rep.keyInsight || rep.salesAndLeadNotes || rep.whatChangedFromLastWeek || rep.dailyClientDataNotes) {
    const analysisBlock = document.createElement('div');
    analysisBlock.style.marginBottom = '12px';
    analysisBlock.innerHTML = `
      <div style="background-color: rgba(245, 158, 11, 0.1); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(245, 158, 11, 0.2); font-weight: 800; font-size: 12px; color: #92400e; margin-bottom: 8px; font-family: 'Cairo', sans-serif;">
        💡 4. التحليل الأسبوعي | Weekly Analysis
      </div>
      <table style="width: 100%; border-collapse: separate; border-spacing: 6px; font-size: 10px; direction: rtl;">
        <tr>
          ${rep.whatWorkedWell ? `
            <td style="width: 50%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
              <span style="font-weight: 800; color: #065f46; display: block; margin-bottom: 3px;">إيه اللي اشتغل كويس؟</span>
              <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.whatWorkedWell}</p>
            </td>
          ` : '<td style="width: 50%;"></td>'}
          ${rep.whatNeedsImprovement ? `
            <td style="width: 50%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
              <span style="font-weight: 800; color: #92400e; display: block; margin-bottom: 3px;">إيه اللي محتاج يتحسن؟</span>
              <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.whatNeedsImprovement}</p>
            </td>
          ` : '<td style="width: 50%;"></td>'}
        </tr>
        ${((rep.keyChanges || rep.whatChangedFromLastWeek) || rep.keyInsight) ? `
          <tr>
            ${(rep.keyChanges || rep.whatChangedFromLastWeek) ? `
              <td style="width: 50%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
                <span style="font-weight: 800; color: #5A5A40; display: block; margin-bottom: 3px;">أهم التغييرات هذا الأسبوع:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.keyChanges || rep.whatChangedFromLastWeek}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
            ${rep.keyInsight ? `
              <td style="width: 50%; background-color: #fdf4ff; border: 1px solid #f5d0fe; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #86198f; display: block; margin-bottom: 3px;">💡 أهم Insight من بيانات الأسبوع:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.keyInsight}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
          </tr>
        ` : ''}
        ${(rep.salesAndLeadNotes || rep.dailyClientDataNotes) ? `
          <tr>
            <td colspan="2" style="background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
              <span style="font-weight: 800; color: #1e40af; display: block; margin-bottom: 3px;">ملاحظات بيانات المبيعات والعملاء:</span>
              <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.salesAndLeadNotes || rep.dailyClientDataNotes}</p>
            </td>
          </tr>
        ` : ''}
      </table>
    `;
    appendBlockToPages(pages, createPage, analysisBlock);
  }

  // 5. خطة الأسبوع القادم | Next Week Action Plan
  if (rep.nextWeekGoal || rep.topPriorities || rep.campaignAdjustments || rep.newTests || rep.clientRequiredAction || rep.campaignAdjustmentsNextWeek || rep.newTestsNextWeek || rep.clientRequiredActionNextWeek) {
    const planBlock = document.createElement('div');
    planBlock.style.marginBottom = '12px';
    planBlock.innerHTML = `
      <div style="background-color: rgba(200, 102, 43, 0.1); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(200, 102, 43, 0.2); font-weight: 800; font-size: 12px; color: #C8662B; margin-bottom: 8px; font-family: 'Cairo', sans-serif;">
        🎯 5. خطة الأسبوع القادم | Next Week Action Plan
      </div>
      <table style="width: 100%; border-collapse: separate; border-spacing: 6px; font-size: 10px; direction: rtl;">
        ${rep.nextWeekGoal ? `
          <tr>
            <td colspan="2" style="background-color: #fff7ed; border: 1px solid #fed7aa; padding: 8px; border-radius: 8px; vertical-align: top;">
              <span style="font-weight: 800; color: #C8662B; display: block; margin-bottom: 3px;">🎯 الهدف الرئيسي:</span>
              <p style="color: #2D2D2A; font-weight: 800; margin: 0; line-height: 1.4;">${rep.nextWeekGoal}</p>
            </td>
          </tr>
        ` : ''}
        ${(rep.topPriorities || (rep.campaignAdjustments || rep.campaignAdjustmentsNextWeek)) ? `
          <tr>
            ${rep.topPriorities ? `
              <td style="width: 50%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
                <span style="font-weight: 800; color: #5A5A40; display: block; margin-bottom: 3px;">أهم الأولويات:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.topPriorities}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
            ${(rep.campaignAdjustments || rep.campaignAdjustmentsNextWeek) ? `
              <td style="width: 50%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
                <span style="font-weight: 800; color: #5A5A40; display: block; margin-bottom: 3px;">تعديلات الحملات:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.campaignAdjustments || rep.campaignAdjustmentsNextWeek}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
          </tr>
        ` : ''}
        ${((rep.newTests || rep.newTestsNextWeek) || (rep.clientRequiredAction || rep.clientRequiredActionNextWeek)) ? `
          <tr>
            ${(rep.newTests || rep.newTestsNextWeek) ? `
              <td style="width: 50%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
                <span style="font-weight: 800; color: #065f46; display: block; margin-bottom: 3px;">الاختبارات الجديدة (A/B Tests):</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.newTests || rep.newTestsNextWeek}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
            ${(rep.clientRequiredAction || rep.clientRequiredActionNextWeek) ? `
              <td style="width: 50%; background-color: #faf5ff; border: 1px solid #e9d5ff; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #6b21a8; display: block; margin-bottom: 3px;">المطلوب من العميل:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.clientRequiredAction || rep.clientRequiredActionNextWeek}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
          </tr>
        ` : ''}
      </table>
    `;
    appendBlockToPages(pages, createPage, planBlock);
  }

  // 6. ملخص القرار | Weekly Decision Summary
  if (rep.decisionSummary) {
    const decisionBlock = document.createElement('div');
    decisionBlock.style.marginBottom = '12px';
    decisionBlock.innerHTML = `
      <div style="background-color: rgba(147, 51, 234, 0.1); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(147, 51, 234, 0.2); font-weight: 800; font-size: 12px; color: #6b21a8; margin-bottom: 8px; font-family: 'Cairo', sans-serif;">
        📝 6. ملخص القرار | Weekly Decision Summary
      </div>
      <table style="width: 100%; border-collapse: separate; border-spacing: 6px; font-size: 10px; direction: rtl;">
        <tr>
          <td style="background-color: #faf5ff; border: 1px solid #e9d5ff; padding: 10px; border-radius: 8px; vertical-align: top;">
            <span style="font-weight: 800; color: #6b21a8; display: block; margin-bottom: 4px;">ملخص ما حدث، أهم الاستنتاجات، وقرارات وتعديلات الأسبوع القادم:</span>
            <p style="color: #2D2D2A; margin: 0; line-height: 1.5; white-space: pre-wrap; font-weight: 600;">${rep.decisionSummary}</p>
          </td>
        </tr>
      </table>
    `;
    appendBlockToPages(pages, createPage, decisionBlock);
  }

  // 7. أسئلة وملاحظات إضافية مخصصة
  const customQuestions = rep.questionsList?.filter((qa) => !qa.standardKey && qa.answer) || [];
  if (customQuestions.length > 0) {
    const customBlock = document.createElement('div');
    customBlock.style.marginBottom = '12px';
    customBlock.innerHTML = `
      <div style="background-color: rgba(90, 90, 64, 0.1); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(90, 90, 64, 0.2); font-weight: 800; font-size: 12px; color: #5A5A40; margin-bottom: 8px; font-family: 'Cairo', sans-serif;">
        ✨ أسئلة وملاحظات إضافية مخصصة
      </div>
      <table style="width: 100%; border-collapse: separate; border-spacing: 6px; font-size: 10px; direction: rtl;">
        ${customQuestions.map((qa) => `
          <tr>
            <td style="background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
              <span style="font-weight: 800; color: #5A5A40; display: block; margin-bottom: 3px;">${qa.question}:</span>
              <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${qa.answer}</p>
            </td>
          </tr>
        `).join('')}
      </table>
    `;
    appendBlockToPages(pages, createPage, customBlock);
  }

  updatePageNumbers(pages);
  const safeBrand = (displayBrand || 'Brand').replace(/[^a-zA-Z0-9أ-ي]/g, '_');
  const dateStr = rep.weekStartDate || 'Report';
  await renderPagesToPDF(host, pages, `Weekly_Report_${safeBrand}_${dateStr}.pdf`);
}

/**
 * EXPORT MONTHLY REPORT TO PDF DIRECTLY
 */
export async function exportMonthlyReportToPDF(
  rep: MonthlyReport,
  brandName: string
) {
  const host = createPdfStagingHost();
  const displayBrand = brandName || 'البراند';
  const periodText = rep.month ? `شهر ${rep.month}` : (rep.startDate ? `من ${rep.startDate} إلى ${rep.endDate || ''}` : 'التقرير الشهري');
  const docTitle = rep.title ? `${rep.title} (${periodText})` : `التقرير الشهري الشامل - ${periodText}`;

  const pages: HTMLElement[] = [];
  const createPage = () => {
    const { page, body } = createA4PageNode(displayBrand, docTitle);
    host.appendChild(page);
    return { page, body };
  };

  const revenueVal = rep.totalRevenue || 0;
  const ordersVal = rep.totalOrders || 0;

  // 1. ملخص الأداء | Monthly Performance
  const statsBlock = document.createElement('div');
  statsBlock.style.marginBottom = '12px';
  statsBlock.innerHTML = `
    <div style="background-color: rgba(90, 90, 64, 0.1); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(90, 90, 64, 0.2); font-weight: 800; font-size: 12px; color: #2D2D2A; margin-bottom: 8px; font-family: 'Cairo', sans-serif;">
      📊 1. ملخص الأداء | Monthly Performance
    </div>
    <table style="width: 100%; border-collapse: separate; border-spacing: 6px; margin-bottom: 6px; direction: rtl;">
      <tr>
        <td style="width: 25%; background-color: #F9F8F6; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; text-align: center; vertical-align: top;">
          <span style="font-size: 9px; color: #8E8E85; font-weight: 700; display: block; margin-bottom: 2px;">إجمالي الإنفاق (EGP)</span>
          <div style="font-size: 12px; font-weight: 900; color: #be123c;">${(rep.totalSpent || 0).toLocaleString()} EGP</div>
        </td>
        <td style="width: 25%; background-color: #F9F8F6; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; text-align: center; vertical-align: top;">
          <span style="font-size: 9px; color: #8E8E85; font-weight: 700; display: block; margin-bottom: 2px;">إجمالي الطلبات</span>
          <div style="font-size: 12px; font-weight: 900; color: #5A5A40;">${ordersVal} طلب</div>
        </td>
        <td style="width: 25%; background-color: #F9F8F6; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; text-align: center; vertical-align: top;">
          <span style="font-size: 9px; color: #8E8E85; font-weight: 700; display: block; margin-bottom: 2px;">إجمالي المبيعات (EGP)</span>
          <div style="font-size: 12px; font-weight: 900; color: #047857;">${revenueVal.toLocaleString()} EGP</div>
        </td>
        <td style="width: 25%; background-color: #F9F8F6; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; text-align: center; vertical-align: top;">
          <span style="font-size: 9px; color: #8E8E85; font-weight: 700; display: block; margin-bottom: 2px;">العائد (ROAS)</span>
          <div style="font-size: 12px; font-weight: 900; color: #92400e;">${rep.roas || 0}x</div>
        </td>
      </tr>
    </table>
    <table style="width: 100%; border-collapse: separate; border-spacing: 6px; margin-bottom: 6px; direction: rtl;">
      <tr>
        <td style="width: 33.33%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; text-align: center; vertical-align: top;">
          <span style="font-size: 9px; color: #8E8E85; font-weight: 700; display: block; margin-bottom: 2px;">تكلفة الطلب (CPA)</span>
          <div style="font-size: 11px; font-weight: 800; color: #2D2D2A;">${rep.cpa || '-'}</div>
        </td>
        <td style="width: 33.33%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; text-align: center; vertical-align: top;">
          <span style="font-size: 9px; color: #8E8E85; font-weight: 700; display: block; margin-bottom: 2px;">متوسط قيمة الطلب (AOV)</span>
          <div style="font-size: 11px; font-weight: 800; color: #2D2D2A;">${rep.aov || '-'}</div>
        </td>
        <td style="width: 33.33%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; text-align: center; vertical-align: top;">
          <span style="font-size: 9px; color: #8E8E85; font-weight: 700; display: block; margin-bottom: 2px;">معدل التحويل (Conversion Rate)</span>
          <div style="font-size: 11px; font-weight: 800; color: #4338ca;">${rep.conversionRate || '-'}</div>
        </td>
      </tr>
    </table>
  `;
  appendBlockToPages(pages, createPage, statsBlock);

  // 2. مقارنة بالشهر السابق | Month-over-Month
  if (rep.spendChange || rep.ordersChange || rep.revenueChange || rep.roasChange || rep.cpaChange || rep.aovChange) {
    const momBlock = document.createElement('div');
    momBlock.style.marginBottom = '12px';
    momBlock.innerHTML = `
      <div style="background-color: rgba(59, 130, 246, 0.1); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(59, 130, 246, 0.2); font-weight: 800; font-size: 12px; color: #1e40af; margin-bottom: 8px; font-family: 'Cairo', sans-serif;">
        📈 2. مقارنة بالشهر السابق | Month-over-Month
      </div>
      <table style="width: 100%; border-collapse: separate; border-spacing: 6px; font-size: 10px; direction: rtl;">
        <tr>
          ${rep.spendChange ? `
            <td style="width: 33.33%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
              <span style="font-weight: 800; color: #8E8E85; display: block; margin-bottom: 2px;">مقارنة الإنفاق:</span>
              <p style="font-weight: 800; color: #2D2D2A; margin: 0;">${rep.spendChange}</p>
            </td>
          ` : '<td style="width: 33.33%;"></td>'}
          ${rep.ordersChange ? `
            <td style="width: 33.33%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
              <span style="font-weight: 800; color: #8E8E85; display: block; margin-bottom: 2px;">مقارنة الطلبات:</span>
              <p style="font-weight: 800; color: #2D2D2A; margin: 0;">${rep.ordersChange}</p>
            </td>
          ` : '<td style="width: 33.33%;"></td>'}
          ${rep.revenueChange ? `
            <td style="width: 33.33%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
              <span style="font-weight: 800; color: #8E8E85; display: block; margin-bottom: 2px;">مقارنة المبيعات:</span>
              <p style="font-weight: 800; color: #2D2D2A; margin: 0;">${rep.revenueChange}</p>
            </td>
          ` : '<td style="width: 33.33%;"></td>'}
        </tr>
        <tr>
          ${rep.roasChange ? `
            <td style="width: 33.33%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
              <span style="font-weight: 800; color: #8E8E85; display: block; margin-bottom: 2px;">مقارنة ROAS:</span>
              <p style="font-weight: 800; color: #2D2D2A; margin: 0;">${rep.roasChange}</p>
            </td>
          ` : '<td style="width: 33.33%;"></td>'}
          ${rep.cpaChange ? `
            <td style="width: 33.33%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
              <span style="font-weight: 800; color: #8E8E85; display: block; margin-bottom: 2px;">مقارنة CPA:</span>
              <p style="font-weight: 800; color: #2D2D2A; margin: 0;">${rep.cpaChange}</p>
            </td>
          ` : '<td style="width: 33.33%;"></td>'}
          ${rep.aovChange ? `
            <td style="width: 33.33%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
              <span style="font-weight: 800; color: #8E8E85; display: block; margin-bottom: 2px;">مقارنة AOV:</span>
              <p style="font-weight: 800; color: #2D2D2A; margin: 0;">${rep.aovChange}</p>
            </td>
          ` : '<td style="width: 33.33%;"></td>'}
        </tr>
      </table>
    `;
    appendBlockToPages(pages, createPage, momBlock);
  }

  // 3. أداء الحملات | Campaign Performance
  if (rep.bestCampaign || rep.weakestCampaign || rep.improvingCampaigns || rep.decliningCampaigns) {
    const campaignBlock = document.createElement('div');
    campaignBlock.style.marginBottom = '12px';
    campaignBlock.innerHTML = `
      <div style="background-color: rgba(16, 185, 129, 0.1); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.2); font-weight: 800; font-size: 12px; color: #065f46; margin-bottom: 8px; font-family: 'Cairo', sans-serif;">
        🎯 3. أداء الحملات | Campaign Performance
      </div>
      <table style="width: 100%; border-collapse: separate; border-spacing: 6px; font-size: 10px; direction: rtl;">
        ${(rep.bestCampaign || rep.weakestCampaign) ? `
          <tr>
            ${rep.bestCampaign ? `
              <td style="width: 50%; background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #065f46; display: block; margin-bottom: 3px;">🟢 أفضل حملة وسبب النجاح:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.bestCampaign}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
            ${rep.weakestCampaign ? `
              <td style="width: 50%; background-color: #fff1f2; border: 1px solid #fecdd3; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #9f1239; display: block; margin-bottom: 3px;">🔴 أضعف حملة وسبب الضعف:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.weakestCampaign}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
          </tr>
        ` : ''}
        ${(rep.improvingCampaigns || rep.decliningCampaigns) ? `
          <tr>
            ${rep.improvingCampaigns ? `
              <td style="width: 50%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
                <span style="font-weight: 800; color: #047857; display: block; margin-bottom: 3px;">الحملات التي تحسنت:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.improvingCampaigns}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
            ${rep.decliningCampaigns ? `
              <td style="width: 50%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
                <span style="font-weight: 800; color: #b45309; display: block; margin-bottom: 3px;">الحملات التي تراجعت:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.decliningCampaigns}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
          </tr>
        ` : ''}
      </table>
    `;
    appendBlockToPages(pages, createPage, campaignBlock);
  }

  // 4. أداء المحتوى والإعلانات | Creative Performance
  if (rep.bestCreative || rep.bestHook || rep.bestMarketingAngle || rep.bestContentFormat || rep.creativesNeedRefresh) {
    const creativeBlock = document.createElement('div');
    creativeBlock.style.marginBottom = '12px';
    creativeBlock.innerHTML = `
      <div style="background-color: rgba(147, 51, 234, 0.1); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(147, 51, 234, 0.2); font-weight: 800; font-size: 12px; color: #6b21a8; margin-bottom: 8px; font-family: 'Cairo', sans-serif;">
        🎨 4. أداء المحتوى والإعلانات | Creative Performance
      </div>
      <table style="width: 100%; border-collapse: separate; border-spacing: 6px; font-size: 10px; direction: rtl;">
        ${(rep.bestCreative || rep.bestHook) ? `
          <tr>
            ${rep.bestCreative ? `
              <td style="width: 50%; background-color: #faf5ff; border: 1px solid #e9d5ff; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #6b21a8; display: block; margin-bottom: 3px;">🌟 أفضل إعلان حقق نتائج:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.bestCreative}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
            ${rep.bestHook ? `
              <td style="width: 50%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
                <span style="font-weight: 800; color: #5A5A40; display: block; margin-bottom: 3px;">🪝 أفضل هوك (Hook):</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.bestHook}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
          </tr>
        ` : ''}
        ${(rep.bestMarketingAngle || rep.bestContentFormat) ? `
          <tr>
            ${rep.bestMarketingAngle ? `
              <td style="width: 50%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
                <span style="font-weight: 800; color: #5A5A40; display: block; margin-bottom: 3px;">📐 أفضل زاوية تسويقية:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.bestMarketingAngle}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
            ${rep.bestContentFormat ? `
              <td style="width: 50%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
                <span style="font-weight: 800; color: #5A5A40; display: block; margin-bottom: 3px;">📱 أفضل فورمات محتوى:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.bestContentFormat}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
          </tr>
        ` : ''}
        ${rep.creativesNeedRefresh ? `
          <tr>
            <td colspan="2" style="background-color: #fff1f2; border: 1px solid #fecdd3; padding: 8px; border-radius: 8px; vertical-align: top;">
              <span style="font-weight: 800; color: #9f1239; display: block; margin-bottom: 3px;">🔄 إعلانات محتاجة تغيير (Refresh):</span>
              <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.creativesNeedRefresh}</p>
            </td>
          </tr>
        ` : ''}
      </table>
    `;
    appendBlockToPages(pages, createPage, creativeBlock);
  }

  // 5. أداء المنتجات | Product Performance
  if (rep.topPerformingProducts || rep.lowPerformingProducts || rep.growthOpportunityProducts) {
    const productBlock = document.createElement('div');
    productBlock.style.marginBottom = '12px';
    productBlock.innerHTML = `
      <div style="background-color: rgba(234, 88, 12, 0.1); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(234, 88, 12, 0.2); font-weight: 800; font-size: 12px; color: #c2410c; margin-bottom: 8px; font-family: 'Cairo', sans-serif;">
        📦 5. أداء المنتجات | Product Performance
      </div>
      <table style="width: 100%; border-collapse: separate; border-spacing: 6px; font-size: 10px; direction: rtl;">
        <tr>
          ${rep.topPerformingProducts ? `
            <td style="width: 33.33%; background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 8px; border-radius: 8px; vertical-align: top;">
              <span style="font-weight: 800; color: #065f46; display: block; margin-bottom: 3px;">🏆 أفضل المنتجات مبيعاً:</span>
              <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.topPerformingProducts}</p>
            </td>
          ` : '<td style="width: 33.33%;"></td>'}
          ${rep.lowPerformingProducts ? `
            <td style="width: 33.33%; background-color: #fff1f2; border: 1px solid #fecdd3; padding: 8px; border-radius: 8px; vertical-align: top;">
              <span style="font-weight: 800; color: #9f1239; display: block; margin-bottom: 3px;">⚠️ منتجات أداؤها ضعيف:</span>
              <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.lowPerformingProducts}</p>
            </td>
          ` : '<td style="width: 33.33%;"></td>'}
          ${rep.growthOpportunityProducts ? `
            <td style="width: 33.33%; background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 8px; border-radius: 8px; vertical-align: top;">
              <span style="font-weight: 800; color: #1e40af; display: block; margin-bottom: 3px;">🚀 منتجات فيها فرصة نمو:</span>
              <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.growthOpportunityProducts}</p>
            </td>
          ` : '<td style="width: 33.33%;"></td>'}
        </tr>
      </table>
    `;
    appendBlockToPages(pages, createPage, productBlock);
  }

  // 6. ملاحظات العملاء والمبيعات | Customer & Sales Insights
  if (rep.topCustomerObjections || rep.keySalesInsights || rep.pricingShippingStockIssues) {
    const customerBlock = document.createElement('div');
    customerBlock.style.marginBottom = '12px';
    customerBlock.innerHTML = `
      <div style="background-color: rgba(14, 165, 233, 0.1); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(14, 165, 233, 0.2); font-weight: 800; font-size: 12px; color: #0369a1; margin-bottom: 8px; font-family: 'Cairo', sans-serif;">
        💬 6. ملاحظات العملاء والمبيعات | Customer & Sales Insights
      </div>
      <table style="width: 100%; border-collapse: separate; border-spacing: 6px; font-size: 10px; direction: rtl;">
        ${(rep.topCustomerObjections || rep.keySalesInsights) ? `
          <tr>
            ${rep.topCustomerObjections ? `
              <td style="width: 50%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
                <span style="font-weight: 800; color: #be123c; display: block; margin-bottom: 3px;">🚫 أهم اعتراضات العملاء:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.topCustomerObjections}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
            ${rep.keySalesInsights ? `
              <td style="width: 50%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
                <span style="font-weight: 800; color: #047857; display: block; margin-bottom: 3px;">📞 ملاحظات فريق المبيعات:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.keySalesInsights}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
          </tr>
        ` : ''}
        ${rep.pricingShippingStockIssues ? `
          <tr>
            <td colspan="2" style="background-color: #fff7ed; border: 1px solid #fed7aa; padding: 8px; border-radius: 8px; vertical-align: top;">
              <span style="font-weight: 800; color: #c2410c; display: block; margin-bottom: 3px;">📦 مشاكل التسعير / الشحن / المخزون:</span>
              <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.pricingShippingStockIssues}</p>
            </td>
          </tr>
        ` : ''}
      </table>
    `;
    appendBlockToPages(pages, createPage, customerBlock);
  }

  // 7. أهم ما تعلمناه | Key Learnings
  if (rep.whatWorked || rep.whatDidntWork || rep.keyInsight) {
    const learningsBlock = document.createElement('div');
    learningsBlock.style.marginBottom = '12px';
    learningsBlock.innerHTML = `
      <div style="background-color: rgba(245, 158, 11, 0.1); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(245, 158, 11, 0.2); font-weight: 800; font-size: 12px; color: #92400e; margin-bottom: 8px; font-family: 'Cairo', sans-serif;">
        🧠 7. أهم ما تعلمناه هذا الشهر | Key Learnings
      </div>
      <table style="width: 100%; border-collapse: separate; border-spacing: 6px; font-size: 10px; direction: rtl;">
        <tr>
          ${rep.whatWorked ? `
            <td style="width: 50%; background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 8px; border-radius: 8px; vertical-align: top;">
              <span style="font-weight: 800; color: #065f46; display: block; margin-bottom: 3px;">✅ إيه اللي اشتغل كويس؟</span>
              <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.whatWorked}</p>
            </td>
          ` : '<td style="width: 50%;"></td>'}
          ${rep.whatDidntWork ? `
            <td style="width: 50%; background-color: #fff1f2; border: 1px solid #fecdd3; padding: 8px; border-radius: 8px; vertical-align: top;">
              <span style="font-weight: 800; color: #9f1239; display: block; margin-bottom: 3px;">❌ إيه اللي منفعش؟</span>
              <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.whatDidntWork}</p>
            </td>
          ` : '<td style="width: 50%;"></td>'}
        </tr>
        ${rep.keyInsight ? `
          <tr>
            <td colspan="2" style="background-color: #fdf4ff; border: 1px solid #f5d0fe; padding: 8px; border-radius: 8px; vertical-align: top;">
              <span style="font-weight: 800; color: #86198f; display: block; margin-bottom: 3px;">💡 أهم استنتاج من بيانات الشهر:</span>
              <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.keyInsight}</p>
            </td>
          </tr>
        ` : ''}
      </table>
    `;
    appendBlockToPages(pages, createPage, learningsBlock);
  }

  // 8. فرص النمو | Growth Opportunities
  if (rep.biggestGrowthOpportunity || rep.biggestGrowthChallenge || rep.salesGrowthOpportunity) {
    const growthBlock = document.createElement('div');
    growthBlock.style.marginBottom = '12px';
    growthBlock.innerHTML = `
      <div style="background-color: rgba(16, 185, 129, 0.1); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.2); font-weight: 800; font-size: 12px; color: #065f46; margin-bottom: 8px; font-family: 'Cairo', sans-serif;">
        🚀 8. فرص النمو | Growth Opportunities
      </div>
      <table style="width: 100%; border-collapse: separate; border-spacing: 6px; font-size: 10px; direction: rtl;">
        <tr>
          ${rep.biggestGrowthOpportunity ? `
            <td style="width: 33.33%; background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 8px; border-radius: 8px; vertical-align: top;">
              <span style="font-weight: 800; color: #065f46; display: block; margin-bottom: 3px;">🌟 أكبر فرصة لزيادة المبيعات:</span>
              <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.biggestGrowthOpportunity}</p>
            </td>
          ` : '<td style="width: 33.33%;"></td>'}
          ${rep.biggestGrowthChallenge ? `
            <td style="width: 33.33%; background-color: #fff1f2; border: 1px solid #fecdd3; padding: 8px; border-radius: 8px; vertical-align: top;">
              <span style="font-weight: 800; color: #9f1239; display: block; margin-bottom: 3px;">🚧 أكبر معوق للنمو حالياً:</span>
              <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.biggestGrowthChallenge}</p>
            </td>
          ` : '<td style="width: 33.33%;"></td>'}
          ${rep.salesGrowthOpportunity ? `
            <td style="width: 33.33%; background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 8px; border-radius: 8px; vertical-align: top;">
              <span style="font-weight: 800; color: #1e40af; display: block; margin-bottom: 3px;">📈 فرصة التوسع والمبيعات:</span>
              <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.salesGrowthOpportunity}</p>
            </td>
          ` : '<td style="width: 33.33%;"></td>'}
        </tr>
      </table>
    `;
    appendBlockToPages(pages, createPage, growthBlock);
  }

  // 9. خطة الشهر القادم | Next Month Strategy
  if (rep.mainGoal || rep.targetRevenueOrders || rep.targetCpaRoas || rep.advertisingStrategy || rep.contentStrategy || rep.newTests || rep.clientActionRequired) {
    const strategyBlock = document.createElement('div');
    strategyBlock.style.marginBottom = '12px';
    strategyBlock.innerHTML = `
      <div style="background-color: rgba(200, 102, 43, 0.1); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(200, 102, 43, 0.2); font-weight: 800; font-size: 12px; color: #C8662B; margin-bottom: 8px; font-family: 'Cairo', sans-serif;">
        🎯 9. خطة الشهر القادم | Next Month Strategy
      </div>
      <table style="width: 100%; border-collapse: separate; border-spacing: 6px; font-size: 10px; direction: rtl;">
        ${rep.mainGoal ? `
          <tr>
            <td colspan="2" style="background-color: #fff7ed; border: 1px solid #fed7aa; padding: 8px; border-radius: 8px; vertical-align: top;">
              <span style="font-weight: 800; color: #C8662B; display: block; margin-bottom: 3px;">🎯 الهدف الرئيسي للشهر القادم:</span>
              <p style="color: #2D2D2A; font-weight: 800; margin: 0; line-height: 1.4;">${rep.mainGoal}</p>
            </td>
          </tr>
        ` : ''}
        ${(rep.targetRevenueOrders || rep.targetCpaRoas) ? `
          <tr>
            ${rep.targetRevenueOrders ? `
              <td style="width: 50%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
                <span style="font-weight: 800; color: #5A5A40; display: block; margin-bottom: 3px;">المستهدف الرقمي (مبيعات / طلبات):</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.targetRevenueOrders}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
            ${rep.targetCpaRoas ? `
              <td style="width: 50%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
                <span style="font-weight: 800; color: #5A5A40; display: block; margin-bottom: 3px;">مستهدف CPA و ROAS:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.targetCpaRoas}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
          </tr>
        ` : ''}
        ${(rep.advertisingStrategy || rep.contentStrategy) ? `
          <tr>
            ${rep.advertisingStrategy ? `
              <td style="width: 50%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
                <span style="font-weight: 800; color: #1e40af; display: block; margin-bottom: 3px;">استراتيجية الحملات الإعلانية:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.advertisingStrategy}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
            ${rep.contentStrategy ? `
              <td style="width: 50%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
                <span style="font-weight: 800; color: #6b21a8; display: block; margin-bottom: 3px;">استراتيجية المحتوى:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.contentStrategy}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
          </tr>
        ` : ''}
        ${(rep.newTests || rep.clientActionRequired) ? `
          <tr>
            ${rep.newTests ? `
              <td style="width: 50%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
                <span style="font-weight: 800; color: #065f46; display: block; margin-bottom: 3px;">اختبارات جديدة مقترحة:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.newTests}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
            ${rep.clientActionRequired ? `
              <td style="width: 50%; background-color: #faf5ff; border: 1px solid #e9d5ff; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #6b21a8; display: block; margin-bottom: 3px;">المطلوب من العميل:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.clientActionRequired}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
          </tr>
        ` : ''}
      </table>
    `;
    appendBlockToPages(pages, createPage, strategyBlock);
  }

  // 10. التقييم الشهري | Monthly Growth Summary
  if (rep.monthlyGrowthSummary) {
    const growthSummaryBlock = document.createElement('div');
    growthSummaryBlock.style.marginBottom = '12px';
    growthSummaryBlock.innerHTML = `
      <div style="background-color: rgba(147, 51, 234, 0.1); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(147, 51, 234, 0.2); font-weight: 800; font-size: 12px; color: #6b21a8; margin-bottom: 8px; font-family: 'Cairo', sans-serif;">
        📊 10. التقييم الشهري | Monthly Growth Summary
      </div>
      <table style="width: 100%; border-collapse: separate; border-spacing: 6px; font-size: 10px; direction: rtl;">
        <tr>
          <td style="background-color: #faf5ff; border: 1px solid #e9d5ff; padding: 10px; border-radius: 8px; vertical-align: top;">
            <span style="font-weight: 800; color: #6b21a8; display: block; margin-bottom: 4px;">ملخص مسار وتطور البراند (أين كان في البداية، ماذا تغير، وأهم القرارات للشهر القادم):</span>
            <p style="color: #2D2D2A; margin: 0; line-height: 1.5; white-space: pre-wrap; font-weight: 600;">${rep.monthlyGrowthSummary}</p>
          </td>
        </tr>
      </table>
    `;
    appendBlockToPages(pages, createPage, growthSummaryBlock);
  }

  updatePageNumbers(pages);
  const safeBrand = (displayBrand || 'Brand').replace(/[^a-zA-Z0-9أ-ي]/g, '_');
  const monthStr = rep.month || rep.startDate || 'Monthly';
  await renderPagesToPDF(host, pages, `Monthly_Report_${safeBrand}_${monthStr}.pdf`);
}

/**
 * Exports a comprehensive 12-Section Quarterly Report to PDF
 */
export async function exportQuarterlyReportToPDF(rep: QuarterlyReport, displayBrand?: string) {
  const host = createPdfStagingHost();
  const pages: HTMLElement[] = [];
  const brandTitle = displayBrand || 'البراند';
  const periodText = rep.quarter ? `الربع ${rep.quarter} ${rep.year || ''}` : (rep.startDate ? `من ${rep.startDate} إلى ${rep.endDate || ''}` : 'التقرير الربع سنوي');
  const docTitle = rep.title ? `${rep.title} (${periodText})` : `التقرير الربع سنوي الشامل - ${periodText}`;

  const createPage = () => {
    const { page, body } = createA4PageNode(brandTitle, docTitle);
    host.appendChild(page);
    return { page, body };
  };

  // 1. ملخص الأداء | Quarterly Performance
  const perfBlock = document.createElement('div');
  perfBlock.style.marginBottom = '14px';
  perfBlock.innerHTML = `
    <div style="background-color: rgba(90, 90, 64, 0.08); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(90, 90, 64, 0.2); font-weight: 800; font-size: 12px; color: #5A5A40; margin-bottom: 8px;">
      📊 1. ملخص الأداء | Quarterly Performance
    </div>
    <table style="width: 100%; border-collapse: separate; border-spacing: 5px; font-size: 10px; direction: rtl; text-align: center;">
      <tr>
        <td style="background-color: #F9F8F6; border: 1px solid #E5E5E0; padding: 7px; border-radius: 8px;">
          <span style="color: #8E8E85; font-size: 9px; display: block;">إجمالي الإنفاق</span>
          <strong style="color: #be123c; font-size: 12px;">${(rep.totalSpent || 0).toLocaleString()} EGP</strong>
        </td>
        <td style="background-color: #F9F8F6; border: 1px solid #E5E5E0; padding: 7px; border-radius: 8px;">
          <span style="color: #8E8E85; font-size: 9px; display: block;">إجمالي الطلبات</span>
          <strong style="color: #5A5A40; font-size: 12px;">${rep.totalOrders || 0} طلب</strong>
        </td>
        <td style="background-color: #F9F8F6; border: 1px solid #E5E5E0; padding: 7px; border-radius: 8px;">
          <span style="color: #8E8E85; font-size: 9px; display: block;">إجمالي المبيعات</span>
          <strong style="color: #15803d; font-size: 12px;">${(rep.totalRevenue || 0).toLocaleString()} EGP</strong>
        </td>
        <td style="background-color: #F9F8F6; border: 1px solid #E5E5E0; padding: 7px; border-radius: 8px;">
          <span style="color: #8E8E85; font-size: 9px; display: block;">العائد الإعلاني ROAS</span>
          <strong style="color: #b45309; font-size: 12px;">${rep.roas || 0}x</strong>
        </td>
        <td style="background-color: #F9F8F6; border: 1px solid #E5E5E0; padding: 7px; border-radius: 8px;">
          <span style="color: #8E8E85; font-size: 9px; display: block;">تكلفة الطلب CPA</span>
          <strong style="color: #2D2D2A; font-size: 11px;">${rep.cpa || '-'}</strong>
        </td>
        <td style="background-color: #F9F8F6; border: 1px solid #E5E5E0; padding: 7px; border-radius: 8px;">
          <span style="color: #8E8E85; font-size: 9px; display: block;">متوسط السلة AOV</span>
          <strong style="color: #2D2D2A; font-size: 11px;">${rep.aov || '-'}</strong>
        </td>
        <td style="background-color: #F9F8F6; border: 1px solid #E5E5E0; padding: 7px; border-radius: 8px;">
          <span style="color: #8E8E85; font-size: 9px; display: block;">معدل التحويل CR</span>
          <strong style="color: #4338ca; font-size: 11px;">${rep.conversionRate || '-'}</strong>
        </td>
      </tr>
    </table>
  `;
  appendBlockToPages(pages, createPage, perfBlock);

  // 2. مقارنة بالربع السابق | Quarter-over-Quarter
  if (rep.spendChange || rep.ordersChange || rep.revenueChange || rep.roasChange || rep.cpaChange || rep.aovChange) {
    const qoqBlock = document.createElement('div');
    qoqBlock.style.marginBottom = '12px';
    qoqBlock.innerHTML = `
      <div style="background-color: rgba(30, 64, 175, 0.08); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(30, 64, 175, 0.2); font-weight: 800; font-size: 12px; color: #1e40af; margin-bottom: 8px;">
        📈 2. مقارنة بالربع السابق | Quarter-over-Quarter (QoQ)
      </div>
      <table style="width: 100%; border-collapse: separate; border-spacing: 5px; font-size: 10px; direction: rtl; text-align: center;">
        <tr>
          ${rep.spendChange ? `
            <td style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 6px; border-radius: 8px;">
              <span style="color: #1e40af; font-size: 9px; display: block;">تغير الإنفاق:</span>
              <strong style="font-size: 11px;">${rep.spendChange}</strong>
            </td>
          ` : ''}
          ${rep.ordersChange ? `
            <td style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 6px; border-radius: 8px;">
              <span style="color: #1e40af; font-size: 9px; display: block;">تغير الطلبات:</span>
              <strong style="font-size: 11px;">${rep.ordersChange}</strong>
            </td>
          ` : ''}
          ${rep.revenueChange ? `
            <td style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 6px; border-radius: 8px;">
              <span style="color: #1e40af; font-size: 9px; display: block;">تغير المبيعات:</span>
              <strong style="font-size: 11px;">${rep.revenueChange}</strong>
            </td>
          ` : ''}
          ${rep.roasChange ? `
            <td style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 6px; border-radius: 8px;">
              <span style="color: #1e40af; font-size: 9px; display: block;">تغير ROAS:</span>
              <strong style="font-size: 11px;">${rep.roasChange}</strong>
            </td>
          ` : ''}
          ${rep.cpaChange ? `
            <td style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 6px; border-radius: 8px;">
              <span style="color: #1e40af; font-size: 9px; display: block;">تغير CPA:</span>
              <strong style="font-size: 11px;">${rep.cpaChange}</strong>
            </td>
          ` : ''}
          ${rep.aovChange ? `
            <td style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 6px; border-radius: 8px;">
              <span style="color: #1e40af; font-size: 9px; display: block;">تغير AOV:</span>
              <strong style="font-size: 11px;">${rep.aovChange}</strong>
            </td>
          ` : ''}
        </tr>
      </table>
    `;
    appendBlockToPages(pages, createPage, qoqBlock);
  }

  // 3. أداء الحملات | Campaign Performance
  if (rep.topPerformingCampaigns || rep.weakestCampaigns || rep.highestGrowthCampaigns || rep.pausedCampaignsReasons || rep.keyCampaignLearnings) {
    const campBlock = document.createElement('div');
    campBlock.style.marginBottom = '12px';
    campBlock.innerHTML = `
      <div style="background-color: rgba(5, 150, 105, 0.08); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(5, 150, 105, 0.2); font-weight: 800; font-size: 12px; color: #047857; margin-bottom: 8px;">
        📢 3. أداء الحملات | Campaign Performance
      </div>
      <table style="width: 100%; border-collapse: separate; border-spacing: 6px; font-size: 10px; direction: rtl;">
        ${(rep.topPerformingCampaigns || rep.weakestCampaigns) ? `
          <tr>
            ${rep.topPerformingCampaigns ? `
              <td style="width: 50%; background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #065f46; display: block; margin-bottom: 3px;">أفضل الحملات خلال الربع:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.topPerformingCampaigns}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
            ${rep.weakestCampaigns ? `
              <td style="width: 50%; background-color: #fff1f2; border: 1px solid #fecdd3; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #9f1239; display: block; margin-bottom: 3px;">أضعف الحملات:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.weakestCampaigns}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
          </tr>
        ` : ''}
        ${(rep.highestGrowthCampaigns || rep.pausedCampaignsReasons) ? `
          <tr>
            ${rep.highestGrowthCampaigns ? `
              <td style="width: 50%; background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #1e40af; display: block; margin-bottom: 3px;">الحملات التي حققت أكبر نمو:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.highestGrowthCampaigns}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
            ${rep.pausedCampaignsReasons ? `
              <td style="width: 50%; background-color: #fff7ed; border: 1px solid #ffedd5; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #9a3412; display: block; margin-bottom: 3px;">الحملات التي تم إيقافها ولماذا:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.pausedCampaignsReasons}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
          </tr>
        ` : ''}
        ${rep.keyCampaignLearnings ? `
          <tr>
            <td colspan="2" style="background-color: #f5f3ff; border: 1px solid #ddd6fe; padding: 8px; border-radius: 8px; vertical-align: top;">
              <span style="font-weight: 800; color: #5b21b6; display: block; margin-bottom: 3px;">أهم نتائج واختبارات الحملات:</span>
              <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.keyCampaignLearnings}</p>
            </td>
          </tr>
        ` : ''}
      </table>
    `;
    appendBlockToPages(pages, createPage, campBlock);
  }

  // 4. أداء الإعلانات والمحتوى | Creative Performance
  if (rep.topPerformingCreatives || rep.topPerformingHooks || rep.bestMarketingAngles || rep.bestContentFormats || rep.creativesNeedRefresh || rep.keyCreativeLearnings) {
    const creatBlock = document.createElement('div');
    creatBlock.style.marginBottom = '12px';
    creatBlock.innerHTML = `
      <div style="background-color: rgba(147, 51, 234, 0.08); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(147, 51, 234, 0.2); font-weight: 800; font-size: 12px; color: #7e22ce; margin-bottom: 8px;">
        ✨ 4. أداء الإعلانات والمحتوى | Creative Performance
      </div>
      <table style="width: 100%; border-collapse: separate; border-spacing: 6px; font-size: 10px; direction: rtl;">
        ${(rep.topPerformingCreatives || rep.topPerformingHooks) ? `
          <tr>
            ${rep.topPerformingCreatives ? `
              <td style="width: 50%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
                <span style="font-weight: 800; color: #065f46; display: block; margin-bottom: 3px;">أفضل الإعلانات | Top Creatives:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.topPerformingCreatives}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
            ${rep.topPerformingHooks ? `
              <td style="width: 50%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
                <span style="font-weight: 800; color: #1e40af; display: block; margin-bottom: 3px;">أفضل الـ Hooks:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.topPerformingHooks}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
          </tr>
        ` : ''}
        ${(rep.bestMarketingAngles || rep.bestContentFormats) ? `
          <tr>
            ${rep.bestMarketingAngles ? `
              <td style="width: 50%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
                <span style="font-weight: 800; color: #5A5A40; display: block; margin-bottom: 3px;">أفضل الزوايا التسويقية:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.bestMarketingAngles}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
            ${rep.bestContentFormats ? `
              <td style="width: 50%; background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #E5E5E0; vertical-align: top;">
                <span style="font-weight: 800; color: #7e22ce; display: block; margin-bottom: 3px;">أفضل أنواع وفورمات المحتوى:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.bestContentFormats}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
          </tr>
        ` : ''}
        ${(rep.creativesNeedRefresh || rep.keyCreativeLearnings) ? `
          <tr>
            ${rep.creativesNeedRefresh ? `
              <td style="width: 50%; background-color: #fff1f2; border: 1px solid #fecdd3; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #be123c; display: block; margin-bottom: 3px;">إعلانات تحتاج إلى تحديث:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.creativesNeedRefresh}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
            ${rep.keyCreativeLearnings ? `
              <td style="width: 50%; background-color: #faf5ff; border: 1px solid #e9d5ff; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #6b21a8; display: block; margin-bottom: 3px;">أهم الـ Creative Learnings:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.keyCreativeLearnings}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
          </tr>
        ` : ''}
      </table>
    `;
    appendBlockToPages(pages, createPage, creatBlock);
  }

  // 5. أداء المنتجات والعروض | Product & Offer Performance
  if (rep.topPerformingProducts || rep.lowPerformingProducts || rep.productGrowthOpportunities || rep.offerPerformance || rep.upsellCrossSellOpportunities) {
    const prodBlock = document.createElement('div');
    prodBlock.style.marginBottom = '12px';
    prodBlock.innerHTML = `
      <div style="background-color: rgba(234, 88, 12, 0.08); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(234, 88, 12, 0.2); font-weight: 800; font-size: 12px; color: #c2410c; margin-bottom: 8px;">
        📦 5. أداء المنتجات والعروض | Product & Offer Performance
      </div>
      <table style="width: 100%; border-collapse: separate; border-spacing: 6px; font-size: 10px; direction: rtl;">
        ${(rep.topPerformingProducts || rep.lowPerformingProducts) ? `
          <tr>
            ${rep.topPerformingProducts ? `
              <td style="width: 50%; background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #065f46; display: block; margin-bottom: 3px;">أفضل المنتجات مبيعاً:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.topPerformingProducts}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
            ${rep.lowPerformingProducts ? `
              <td style="width: 50%; background-color: #fff1f2; border: 1px solid #fecdd3; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #9f1239; display: block; margin-bottom: 3px;">أضعف المنتجات أداءً:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.lowPerformingProducts}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
          </tr>
        ` : ''}
        ${(rep.productGrowthOpportunities || rep.offerPerformance) ? `
          <tr>
            ${rep.productGrowthOpportunities ? `
              <td style="width: 50%; background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #1e40af; display: block; margin-bottom: 3px;">منتجات ذات فرص نمو واعدة:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.productGrowthOpportunities}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
            ${rep.offerPerformance ? `
              <td style="width: 50%; background-color: #fff7ed; border: 1px solid #ffedd5; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #9a3412; display: block; margin-bottom: 3px;">أداء العروض الترويجية:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.offerPerformance}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
          </tr>
        ` : ''}
        ${rep.upsellCrossSellOpportunities ? `
          <tr>
            <td colspan="2" style="background-color: #faf5ff; border: 1px solid #e9d5ff; padding: 8px; border-radius: 8px; vertical-align: top;">
              <span style="font-weight: 800; color: #6b21a8; display: block; margin-bottom: 3px;">فرص الـ Upsell / Cross-Sell:</span>
              <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.upsellCrossSellOpportunities}</p>
            </td>
          </tr>
        ` : ''}
      </table>
    `;
    appendBlockToPages(pages, createPage, prodBlock);
  }

  // 6. سلوك العملاء والمبيعات | Customer & Sales Insights
  if (rep.topCustomerObjections || rep.keySalesInsights || rep.pricingShippingStockIssues || rep.customerBehaviorChanges) {
    const custBlock = document.createElement('div');
    custBlock.style.marginBottom = '12px';
    custBlock.innerHTML = `
      <div style="background-color: rgba(2, 132, 199, 0.08); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(2, 132, 199, 0.2); font-weight: 800; font-size: 12px; color: #0369a1; margin-bottom: 8px;">
        💬 6. سلوك العملاء والمبيعات | Customer & Sales Insights
      </div>
      <table style="width: 100%; border-collapse: separate; border-spacing: 6px; font-size: 10px; direction: rtl;">
        ${(rep.topCustomerObjections || rep.keySalesInsights) ? `
          <tr>
            ${rep.topCustomerObjections ? `
              <td style="width: 50%; background-color: #ffffff; border: 1px solid #E5E5E0; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #be123c; display: block; margin-bottom: 3px;">أكثر اعتراضات العملاء تكراراً:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.topCustomerObjections}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
            ${rep.keySalesInsights ? `
              <td style="width: 50%; background-color: #ffffff; border: 1px solid #E5E5E0; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #065f46; display: block; margin-bottom: 3px;">أهم ملاحظات فريق المبيعات:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.keySalesInsights}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
          </tr>
        ` : ''}
        ${(rep.pricingShippingStockIssues || rep.customerBehaviorChanges) ? `
          <tr>
            ${rep.pricingShippingStockIssues ? `
              <td style="width: 50%; background-color: #fffbeb; border: 1px solid #fde68a; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #92400e; display: block; margin-bottom: 3px;">مشاكل السعر أو الشحن أو المخزون:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.pricingShippingStockIssues}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
            ${rep.customerBehaviorChanges ? `
              <td style="width: 50%; background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #1e40af; display: block; margin-bottom: 3px;">أهم التغيرات في سلوك العملاء:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.customerBehaviorChanges}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
          </tr>
        ` : ''}
      </table>
    `;
    appendBlockToPages(pages, createPage, custBlock);
  }

  // 7. أهم النتائج والتعلم | Key Learnings
  if (rep.biggestWin || rep.biggestChallenge || rep.keyLearnings || rep.keyStrategicInsight) {
    const learnBlock = document.createElement('div');
    learnBlock.style.marginBottom = '12px';
    learnBlock.innerHTML = `
      <div style="background-color: rgba(217, 119, 6, 0.08); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(217, 119, 6, 0.2); font-weight: 800; font-size: 12px; color: #b45309; margin-bottom: 8px;">
        💡 7. أهم النتائج والتعلم | Key Learnings
      </div>
      <table style="width: 100%; border-collapse: separate; border-spacing: 6px; font-size: 10px; direction: rtl;">
        ${(rep.biggestWin || rep.biggestChallenge) ? `
          <tr>
            ${rep.biggestWin ? `
              <td style="width: 50%; background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #065f46; display: block; margin-bottom: 3px;">🏆 أكبر نجاح خلال الربع (Biggest Win):</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.biggestWin}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
            ${rep.biggestChallenge ? `
              <td style="width: 50%; background-color: #fff1f2; border: 1px solid #fecdd3; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #be123c; display: block; margin-bottom: 3px;">⚠️ أكبر مشكلة وتحدي (Biggest Challenge):</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.biggestChallenge}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
          </tr>
        ` : ''}
        ${(rep.keyLearnings || rep.keyStrategicInsight) ? `
          <tr>
            ${rep.keyLearnings ? `
              <td style="width: 50%; background-color: #fefce8; border: 1px solid #fef08a; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #854d0e; display: block; margin-bottom: 3px;">أهم ما تعلمناه:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.keyLearnings}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
            ${rep.keyStrategicInsight ? `
              <td style="width: 50%; background-color: #faf5ff; border: 1px solid #e9d5ff; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #6b21a8; display: block; margin-bottom: 3px;">أهم Insight استراتيجي:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.keyStrategicInsight}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
          </tr>
        ` : ''}
      </table>
    `;
    appendBlockToPages(pages, createPage, learnBlock);
  }

  // 8. فرص النمو | Growth Opportunities
  if (rep.biggestGrowthOpportunity || rep.salesGrowthOpportunity || rep.productOfferOpportunities || rep.scalingOpportunities) {
    const oppBlock = document.createElement('div');
    oppBlock.style.marginBottom = '12px';
    oppBlock.innerHTML = `
      <div style="background-color: rgba(13, 148, 136, 0.08); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(13, 148, 136, 0.2); font-weight: 800; font-size: 12px; color: #0f766e; margin-bottom: 8px;">
        🚀 8. فرص النمو | Growth Opportunities
      </div>
      <table style="width: 100%; border-collapse: separate; border-spacing: 6px; font-size: 10px; direction: rtl;">
        ${(rep.biggestGrowthOpportunity || rep.salesGrowthOpportunity) ? `
          <tr>
            ${rep.biggestGrowthOpportunity ? `
              <td style="width: 50%; background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #065f46; display: block; margin-bottom: 3px;">أكبر فرصة للنمو:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.biggestGrowthOpportunity}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
            ${rep.salesGrowthOpportunity ? `
              <td style="width: 50%; background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #1e40af; display: block; margin-bottom: 3px;">أكبر فرصة لزيادة المبيعات:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.salesGrowthOpportunity}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
          </tr>
        ` : ''}
        ${(rep.productOfferOpportunities || rep.scalingOpportunities) ? `
          <tr>
            ${rep.productOfferOpportunities ? `
              <td style="width: 50%; background-color: #fff7ed; border: 1px solid #ffedd5; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #9a3412; display: block; margin-bottom: 3px;">فرص تحسين العروض والمنتجات:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.productOfferOpportunities}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
            ${rep.scalingOpportunities ? `
              <td style="width: 50%; background-color: #faf5ff; border: 1px solid #e9d5ff; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #6b21a8; display: block; margin-bottom: 3px;">فرص التوسع في الإعلانات:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.scalingOpportunities}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
          </tr>
        ` : ''}
      </table>
    `;
    appendBlockToPages(pages, createPage, oppBlock);
  }

  // 9. التقييم الاستراتيجي | Strategic Review
  if (rep.whatChanged || rep.isGrowthSustainable || rep.keyGrowthBarriers || rep.whatShouldContinue || rep.whatShouldChange) {
    const revBlock = document.createElement('div');
    revBlock.style.marginBottom = '12px';
    revBlock.innerHTML = `
      <div style="background-color: rgba(59, 130, 246, 0.08); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(59, 130, 246, 0.2); font-weight: 800; font-size: 12px; color: #1d4ed8; margin-bottom: 8px;">
        🔍 9. التقييم الاستراتيجي | Strategic Review
      </div>
      <table style="width: 100%; border-collapse: separate; border-spacing: 6px; font-size: 10px; direction: rtl;">
        ${(rep.whatChanged || rep.isGrowthSustainable) ? `
          <tr>
            ${rep.whatChanged ? `
              <td style="width: 50%; background-color: #ffffff; border: 1px solid #E5E5E0; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #1e40af; display: block; margin-bottom: 3px;">ما الذي تغير في البراند خلال الربع؟:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.whatChanged}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
            ${rep.isGrowthSustainable ? `
              <td style="width: 50%; background-color: #ffffff; border: 1px solid #E5E5E0; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #065f46; display: block; margin-bottom: 3px;">هل الأداء يتحسن بشكل مستدام؟:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.isGrowthSustainable}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
          </tr>
        ` : ''}
        ${rep.keyGrowthBarriers ? `
          <tr>
            <td colspan="2" style="background-color: #fff1f2; border: 1px solid #fecdd3; padding: 8px; border-radius: 8px; vertical-align: top;">
              <span style="font-weight: 800; color: #be123c; display: block; margin-bottom: 3px;">ما أهم المشاكل التي تمنع التوسع؟ (Growth Barriers):</span>
              <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.keyGrowthBarriers}</p>
            </td>
          </tr>
        ` : ''}
        ${(rep.whatShouldContinue || rep.whatShouldChange) ? `
          <tr>
            ${rep.whatShouldContinue ? `
              <td style="width: 50%; background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #065f46; display: block; margin-bottom: 3px;">ما الذي يجب الاستمرار فيه؟:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.whatShouldContinue}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
            ${rep.whatShouldChange ? `
              <td style="width: 50%; background-color: #fffbeb; border: 1px solid #fde68a; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #92400e; display: block; margin-bottom: 3px;">ما الذي يجب تغييره؟:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.whatShouldChange}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
          </tr>
        ` : ''}
      </table>
    `;
    appendBlockToPages(pages, createPage, revBlock);
  }

  // 10. خطة الربع القادم | Next Quarter Strategy
  if (rep.mainGoal || rep.revenueOrderTargets || rep.targetCpaRoas || rep.advertisingStrategy || rep.contentStrategy || rep.productOfferStrategy || rep.newTests || rep.nextQuarterScalingOpportunities || rep.clientActionRequired) {
    const nextQBlock = document.createElement('div');
    nextQBlock.style.marginBottom = '12px';
    nextQBlock.innerHTML = `
      <div style="background-color: rgba(200, 102, 43, 0.08); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(200, 102, 43, 0.2); font-weight: 800; font-size: 12px; color: #c2410c; margin-bottom: 8px;">
        🎯 10. خطة الربع القادم | Next Quarter Strategy
      </div>
      ${rep.mainGoal ? `
        <div style="background-color: #fff7ed; border: 1px solid #ffedd5; padding: 8px 12px; border-radius: 8px; margin-bottom: 6px;">
          <strong style="color: #c2410c; font-size: 11px; display: block;">الهدف الرئيسي (Main Goal):</strong>
          <span style="font-size: 11px; font-weight: 800; color: #2D2D2A;">${rep.mainGoal}</span>
        </div>
      ` : ''}
      <table style="width: 100%; border-collapse: separate; border-spacing: 6px; font-size: 10px; direction: rtl;">
        ${(rep.revenueOrderTargets || rep.targetCpaRoas) ? `
          <tr>
            ${rep.revenueOrderTargets ? `
              <td style="width: 50%; background-color: #ffffff; border: 1px solid #E5E5E0; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #5A5A40; display: block; margin-bottom: 3px;">أهداف المبيعات والطلبات:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.revenueOrderTargets}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
            ${rep.targetCpaRoas ? `
              <td style="width: 50%; background-color: #ffffff; border: 1px solid #E5E5E0; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #5A5A40; display: block; margin-bottom: 3px;">Target CPA / Target ROAS:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.targetCpaRoas}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
          </tr>
        ` : ''}
        ${(rep.advertisingStrategy || rep.contentStrategy) ? `
          <tr>
            ${rep.advertisingStrategy ? `
              <td style="width: 50%; background-color: #ffffff; border: 1px solid #E5E5E0; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #1e40af; display: block; margin-bottom: 3px;">استراتيجية الإعلانات:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.advertisingStrategy}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
            ${rep.contentStrategy ? `
              <td style="width: 50%; background-color: #ffffff; border: 1px solid #E5E5E0; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #7e22ce; display: block; margin-bottom: 3px;">استراتيجية المحتوى:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.contentStrategy}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
          </tr>
        ` : ''}
        ${(rep.productOfferStrategy || rep.newTests) ? `
          <tr>
            ${rep.productOfferStrategy ? `
              <td style="width: 50%; background-color: #ffffff; border: 1px solid #E5E5E0; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #9a3412; display: block; margin-bottom: 3px;">استراتيجية المنتجات والعروض:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.productOfferStrategy}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
            ${rep.newTests ? `
              <td style="width: 50%; background-color: #ffffff; border: 1px solid #E5E5E0; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #065f46; display: block; margin-bottom: 3px;">الاختبارات الجديدة:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.newTests}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
          </tr>
        ` : ''}
        ${(rep.nextQuarterScalingOpportunities || rep.clientActionRequired) ? `
          <tr>
            ${rep.nextQuarterScalingOpportunities ? `
              <td style="width: 50%; background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #1e40af; display: block; margin-bottom: 3px;">فرص التوسع:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.nextQuarterScalingOpportunities}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
            ${rep.clientActionRequired ? `
              <td style="width: 50%; background-color: #faf5ff; border: 1px solid #e9d5ff; padding: 8px; border-radius: 8px; vertical-align: top;">
                <span style="font-weight: 800; color: #6b21a8; display: block; margin-bottom: 3px;">المطلوب من العميل:</span>
                <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.clientActionRequired}</p>
              </td>
            ` : '<td style="width: 50%;"></td>'}
          </tr>
        ` : ''}
      </table>
    `;
    appendBlockToPages(pages, createPage, nextQBlock);
  }

  // 11. خطة الـ90 يوم | 90-Day Growth Plan
  if (rep.month1Plan || rep.month2Plan || rep.month3Plan) {
    const planBlock = document.createElement('div');
    planBlock.style.marginBottom = '12px';
    planBlock.innerHTML = `
      <div style="background-color: rgba(90, 90, 64, 0.08); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(90, 90, 64, 0.2); font-weight: 800; font-size: 12px; color: #5A5A40; margin-bottom: 8px;">
        🗓️ 11. خطة الـ90 يوم | 90-Day Growth Plan
      </div>
      <table style="width: 100%; border-collapse: separate; border-spacing: 6px; font-size: 10px; direction: rtl;">
        <tr>
          ${rep.month1Plan ? `
            <td style="width: 33.33%; background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 8px; border-radius: 8px; vertical-align: top;">
              <span style="font-weight: 800; color: #166534; display: block; margin-bottom: 3px;">${rep.month1Name ? `خطة شهر ${rep.month1Name}` : 'الشهر الأول (Optimize)'}:</span>
              <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.month1Plan}</p>
            </td>
          ` : '<td style="width: 33.33%;"></td>'}
          ${rep.month2Plan ? `
            <td style="width: 33.33%; background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 8px; border-radius: 8px; vertical-align: top;">
              <span style="font-weight: 800; color: #1e40af; display: block; margin-bottom: 3px;">${rep.month2Name ? `خطة شهر ${rep.month2Name}` : 'الشهر الثاني (Test & Scale)'}:</span>
              <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.month2Plan}</p>
            </td>
          ` : '<td style="width: 33.33%;"></td>'}
          ${rep.month3Plan ? `
            <td style="width: 33.33%; background-color: #faf5ff; border: 1px solid #e9d5ff; padding: 8px; border-radius: 8px; vertical-align: top;">
              <span style="font-weight: 800; color: #6b21a8; display: block; margin-bottom: 3px;">${rep.month3Name ? `خطة شهر ${rep.month3Name}` : 'الشهر الثالث (Scale & Expand)'}:</span>
              <p style="color: #2D2D2A; margin: 0; line-height: 1.4; white-space: pre-wrap;">${rep.month3Plan}</p>
            </td>
          ` : '<td style="width: 33.33%;"></td>'}
        </tr>
      </table>
    `;
    appendBlockToPages(pages, createPage, planBlock);
  }

  // 12. ملخص النمو | Quarterly Growth Summary
  if (rep.quarterlyGrowthSummary) {
    const summaryBlock = document.createElement('div');
    summaryBlock.style.marginBottom = '12px';
    summaryBlock.innerHTML = `
      <div style="background-color: rgba(147, 51, 234, 0.1); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(147, 51, 234, 0.2); font-weight: 800; font-size: 12px; color: #6b21a8; margin-bottom: 8px;">
        🌟 12. ملخص النمو | Quarterly Growth Summary
      </div>
      <table style="width: 100%; border-collapse: separate; border-spacing: 6px; font-size: 10px; direction: rtl;">
        <tr>
          <td style="background-color: #faf5ff; border: 1px solid #e9d5ff; padding: 10px; border-radius: 8px; vertical-align: top;">
            <span style="font-weight: 800; color: #6b21a8; display: block; margin-bottom: 4px;">الملخص الاستراتيجي للنمو (تطور البراند خلال الربع، أهم النتائج والتحديات، وتركيز الـ90 يوماً القادمة):</span>
            <p style="color: #2D2D2A; margin: 0; line-height: 1.5; white-space: pre-wrap; font-weight: 600;">${rep.quarterlyGrowthSummary}</p>
          </td>
        </tr>
      </table>
    `;
    appendBlockToPages(pages, createPage, summaryBlock);
  }

  updatePageNumbers(pages);
  const safeBrand = (displayBrand || 'Brand').replace(/[^a-zA-Z0-9أ-ي]/g, '_');
  const quarterStr = (rep.quarter || 'Quarterly').replace(/[^a-zA-Z0-9أ-ي]/g, '_');
  await renderPagesToPDF(host, pages, `Quarterly_Report_${safeBrand}_${quarterStr}.pdf`);
}


