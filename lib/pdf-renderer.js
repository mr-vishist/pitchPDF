/**
 * PDF Renderer v1.0
 * Consumes composed document model and produces render-ready output
 */

import { composeDocument, BlockType, Emphasis } from './document-engine.js';
import { applyLayout, Colors, TypographyScale, SpacingScale, BorderRadius, Shadows } from './layout-engine.js';
import { applyFlow } from './flow-engine.js';
import { createMultiPageLayout, PAGE_WIDTH, PAGE_HEIGHT } from './pagination-engine.js';

// ============================================
// RENDER PIPELINE
// ============================================

/**
 * Complete render pipeline - from raw data to render-ready output
 */
export function renderDocument(proposalData) {
    // Step 1: Compose document model
    const document = composeDocument(proposalData);

    // Step 2: Apply layout rules
    const layoutDocument = applyLayout(document);

    // Step 3: Apply flow rules
    const flowDocument = applyFlow(layoutDocument);

    // Step 4: Paginate
    const multiPageLayout = createMultiPageLayout(flowDocument);

    // Step 5: Render each page
    const renderedPages = multiPageLayout.pages.map(page => renderPage(page, flowDocument));

    return {
        version: '1.0',
        meta: {
            clientName: proposalData.clientName || 'Client Name',
            projectTitle: proposalData.projectTitle || 'Proposal',
            pageCount: multiPageLayout.pageCount,
            generatedAt: new Date().toISOString()
        },
        pageSize: {
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT,
            format: 'A4'
        },
        pages: renderedPages,
        styles: getGlobalStyles()
    };
}

// ============================================
// PAGE RENDERER
// ============================================

/**
 * Render a single page
 */
export function renderPage(page, document) {
    const renderedBlocks = page.blocks.map(block => {
        // Find full block data from document
        const fullBlock = document.blocks.find(b => b.id === block.id) || block;
        return renderBlock(fullBlock);
    });

    return {
        number: page.number,
        isFirst: page.isFirst,
        isLast: page.isLast,
        dimensions: {
            width: page.dimensions?.width ?? PAGE_WIDTH,
            height: page.dimensions?.height ?? PAGE_HEIGHT
        },
        blocks: renderedBlocks
    };
}

// ============================================
// BLOCK RENDERERS
// ============================================

/**
 * Main block renderer - dispatches to specific renderers
 */
export function renderBlock(block) {
    const renderers = {
        [BlockType.HEADER]: renderHeader,
        [BlockType.CLIENT]: renderClient,
        [BlockType.TWO_COLUMN]: renderTwoColumn,
        [BlockType.SECTION]: renderSection,
        [BlockType.GRID]: renderGrid,
        [BlockType.TIMELINE]: renderTimeline,
        [BlockType.INVESTMENT]: renderInvestment,
        [BlockType.FOOTER]: renderFooter
    };

    const renderer = renderers[block.type] || renderGenericBlock;
    return {
        id: block.id,
        type: block.type,
        ...renderer(block)
    };
}

/**
 * Render header block
 */
function renderHeader(block) {
    const content = block.content || {};
    return {
        html: `
            <div class="block-header">
                <div class="header-overlay"></div>
                <div class="header-content">
                    <div class="header-brand">
                        <span class="brand-dot"></span>
                        <span class="brand-name">pitchPDF</span>
                    </div>
                    <h1 class="header-title">${escapeHtml(content.title || 'Project Proposal')}</h1>
                    <p class="header-subtitle">${escapeHtml(content.subtitle || '')}</p>
                    <div class="header-meta">
                        <span class="header-badge">${escapeHtml(content.badge || 'PROPOSAL')}</span>
                        <span class="header-date">${escapeHtml(content.date || '')}</span>
                    </div>
                </div>
                <div class="header-shape"></div>
            </div>
        `,
        styles: getHeaderStyles()
    };
}

/**
 * Render client block
 */
function renderClient(block) {
    const content = block.content || {};
    return {
        html: `
            <div class="block-client">
                <div class="client-card">
                    <span class="client-label">${escapeHtml(content.label || 'Prepared For')}</span>
                    <h3 class="client-name">${escapeHtml(content.name || 'Client Name')}</h3>
                    <p class="client-company">${escapeHtml(content.company || '')}</p>
                </div>
            </div>
        `,
        styles: getClientStyles()
    };
}

/**
 * Render two-column block
 */
function renderTwoColumn(block) {
    const content = block.content || {};
    const columns = content.columns || [];

    const columnsHtml = columns.map(col => `
        <div class="column-card">
            <div class="column-header">
                <div class="column-icon"><span class="icon-dot"></span></div>
                <h2 class="column-title">${escapeHtml(col.title || '')}</h2>
            </div>
            <p class="column-body">${escapeHtml(col.body || '')}</p>
        </div>
    `).join('');

    return {
        html: `
            <div class="block-two-column">
                <div class="two-column-grid">
                    ${columnsHtml}
                </div>
            </div>
        `,
        styles: getTwoColumnStyles()
    };
}

/**
 * Render section block
 */
function renderSection(block) {
    const content = block.content || {};
    const altBg = block.metadata?.alternateBackground ? 'alt-bg' : '';

    return {
        html: `
            <div class="block-section ${altBg}">
                <div class="section-header">
                    <div class="section-anchor"></div>
                    <h2 class="section-title">${escapeHtml(content.title || '')}</h2>
                </div>
                <p class="section-body">${escapeHtml(content.body || '')}</p>
            </div>
        `,
        styles: getSectionStyles()
    };
}

/**
 * Render grid block
 */
function renderGrid(block) {
    const content = block.content || {};
    const items = content.items || [];
    const altBg = block.metadata?.alternateBackground ? 'alt-bg' : '';

    const itemsHtml = items.map(item => `
        <div class="grid-item">
            <div class="grid-item-header">
                <span class="grid-dot"></span>
                <span class="grid-index">${item.displayIndex || String(item.index).padStart(2, '0')}</span>
            </div>
            <p class="grid-content">${escapeHtml(item.content || '')}</p>
        </div>
    `).join('');

    return {
        html: `
            <div class="block-grid ${altBg}">
                <div class="grid-header">
                    <div class="grid-anchor"></div>
                    <h2 class="grid-title">${escapeHtml(content.title || '')}</h2>
                </div>
                <div class="grid-container">
                    ${itemsHtml}
                </div>
            </div>
        `,
        styles: getGridStyles()
    };
}

/**
 * Render timeline block
 */
function renderTimeline(block) {
    const content = block.content || {};
    const phases = content.phases || [];

    const phasesHtml = phases.map(phase => `
        <div class="timeline-item">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
                <span class="timeline-phase">${escapeHtml(phase.label || '')}</span>
                <p class="timeline-text">${escapeHtml(phase.content || '')}</p>
            </div>
        </div>
    `).join('');

    return {
        html: `
            <div class="block-timeline">
                <div class="timeline-header">
                    <div class="timeline-anchor"></div>
                    <h2 class="timeline-title">${escapeHtml(content.title || 'Timeline')}</h2>
                </div>
                <div class="timeline-container">
                    <div class="timeline-line"></div>
                    ${phasesHtml}
                </div>
            </div>
        `,
        styles: getTimelineStyles()
    };
}

/**
 * Render investment block
 */
function renderInvestment(block) {
    const content = block.content || {};
    return {
        html: `
            <div class="block-investment">
                <div class="investment-overlay"></div>
                <div class="investment-bg"></div>
                <div class="investment-content">
                    <span class="investment-label">${escapeHtml(content.label || 'Total Investment')}</span>
                    <p class="investment-amount">${escapeHtml(content.amount || '')}</p>
                </div>
            </div>
        `,
        styles: getInvestmentStyles()
    };
}

/**
 * Render footer block
 */
function renderFooter(block) {
    const content = block.content || {};
    const preparedBy = content.preparedBy || {};
    const signature = content.signature || {};
    const branding = content.branding || {};

    return {
        html: `
            <div class="block-footer">
                <div class="footer-brand-strip"></div>
                <div class="footer-content">
                    <div class="footer-left">
                        <span class="footer-label">${escapeHtml(preparedBy.label || 'Prepared By')}</span>
                        <p class="footer-contact">${escapeHtml(preparedBy.contact || '').replace(/\n/g, '<br>')}</p>
                    </div>
                    <div class="footer-right">
                        <div class="signature-box">
                            <div class="signature-line"></div>
                            <span class="signature-label">${escapeHtml(signature.label || 'Authorized Signature')}</span>
                        </div>
                    </div>
                </div>
                <div class="footer-bottom">
                    <span class="footer-logo-mark">p</span>
                    <span class="footer-brand-text">pitchPDF Premium Document</span>
                </div>
            </div>
        `,
        styles: getFooterStyles()
    };
}

/**
 * Generic block renderer fallback
 */
function renderGenericBlock(block) {
    return {
        html: `<div class="block-generic" data-type="${block.type}"></div>`,
        styles: ''
    };
}

// ============================================
// STYLES
// ============================================

function getGlobalStyles() {
    return `
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: system-ui, -apple-system, sans-serif; color: ${Colors.textPrimary}; }
        .page { width: ${PAGE_WIDTH}px; background: ${Colors.background}; position: relative; }
    `;
}

function getHeaderStyles() {
    return `
        .block-header { position: relative; min-height: 280px; background: linear-gradient(135deg, ${Colors.backgroundDark} 0%, #2d2d44 100%); overflow: hidden; display: flex; align-items: center; justify-content: center; }
        .header-overlay { position: absolute; inset: 0; background: radial-gradient(circle at 30% 50%, rgba(99, 102, 241, 0.15), transparent 50%); }
        .header-content { position: relative; z-index: 2; text-align: center; padding: ${SpacingScale.xl}px; }
        .header-brand { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: ${SpacingScale.lg}px; }
        .brand-dot { width: 8px; height: 8px; background: ${Colors.primary}; border-radius: 50%; }
        .brand-name { font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.7); letter-spacing: 0.05em; }
        .header-title { font-size: 42px; font-weight: 700; color: #fff; line-height: 1.1; margin-bottom: 12px; }
        .header-subtitle { font-size: 16px; color: rgba(255,255,255,0.7); margin-bottom: ${SpacingScale.lg}px; }
        .header-meta { display: flex; align-items: center; justify-content: center; gap: 16px; }
        .header-badge { font-size: 10px; font-weight: 700; color: #fff; background: ${Colors.primary}; padding: 4px 12px; border-radius: 4px; letter-spacing: 0.1em; }
        .header-date { font-size: 13px; color: rgba(255,255,255,0.6); }
        .header-shape { position: absolute; bottom: -50%; right: -10%; width: 60%; height: 200%; background: rgba(99, 102, 241, 0.08); border-radius: 50%; }
    `;
}

function getClientStyles() {
    return `
        .block-client { background: ${Colors.backgroundAlt}; padding: ${SpacingScale.lg}px ${SpacingScale.xl}px; }
        .client-card { }
        .client-label { font-size: 11px; font-weight: 600; color: ${Colors.textMuted}; text-transform: uppercase; letter-spacing: 0.05em; }
        .client-name { font-size: 24px; font-weight: 600; color: ${Colors.textPrimary}; margin-top: 8px; }
        .client-company { font-size: 14px; color: ${Colors.textSecondary}; margin-top: 4px; }
    `;
}

function getTwoColumnStyles() {
    return `
        .block-two-column { padding: ${SpacingScale.lg}px ${SpacingScale.xl}px; }
        .two-column-grid { display: grid; grid-template-columns: 1fr 1fr; gap: ${SpacingScale.lg}px; }
        .column-card { background: ${Colors.background}; border: 1px solid ${Colors.border}; border-radius: ${BorderRadius.lg}px; padding: ${SpacingScale.lg}px; }
        .column-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .column-icon { width: 32px; height: 32px; background: ${Colors.backgroundAlt}; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .icon-dot { width: 8px; height: 8px; background: ${Colors.primary}; border-radius: 50%; }
        .column-title { font-size: 18px; font-weight: 600; color: ${Colors.textPrimary}; }
        .column-body { font-size: 14px; line-height: 1.6; color: ${Colors.textSecondary}; }
    `;
}

function getSectionStyles() {
    return `
        .block-section { padding: ${SpacingScale.xl}px; }
        .block-section.alt-bg { background: ${Colors.backgroundAlt}; }
        .section-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .section-anchor { width: 4px; height: 24px; background: ${Colors.primary}; border-radius: 2px; }
        .section-title { font-size: 20px; font-weight: 600; color: ${Colors.textPrimary}; }
        .section-body { font-size: 14px; line-height: 1.6; color: ${Colors.textSecondary}; }
    `;
}

function getGridStyles() {
    return `
        .block-grid { padding: ${SpacingScale.xl}px; }
        .block-grid.alt-bg { background: ${Colors.backgroundAlt}; }
        .grid-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .grid-anchor { width: 4px; height: 24px; background: ${Colors.primary}; border-radius: 2px; }
        .grid-title { font-size: 20px; font-weight: 600; color: ${Colors.textPrimary}; }
        .grid-container { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .grid-item { background: ${Colors.background}; border: 1px solid ${Colors.border}; border-radius: ${BorderRadius.md}px; padding: 16px; }
        .grid-item-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .grid-dot { width: 6px; height: 6px; background: ${Colors.primary}; border-radius: 50%; }
        .grid-index { font-size: 12px; font-weight: 600; color: ${Colors.textMuted}; }
        .grid-content { font-size: 14px; line-height: 1.5; color: ${Colors.textSecondary}; }
    `;
}

function getTimelineStyles() {
    return `
        .block-timeline { padding: ${SpacingScale.xl}px; }
        .timeline-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .timeline-anchor { width: 4px; height: 24px; background: ${Colors.primary}; border-radius: 2px; }
        .timeline-title { font-size: 20px; font-weight: 600; color: ${Colors.textPrimary}; }
        .timeline-container { position: relative; padding-left: 24px; }
        .timeline-line { position: absolute; left: 5px; top: 8px; bottom: 8px; width: 2px; background: ${Colors.border}; }
        .timeline-item { position: relative; padding-bottom: 16px; }
        .timeline-item:last-child { padding-bottom: 0; }
        .timeline-marker { position: absolute; left: -24px; top: 4px; width: 12px; height: 12px; background: ${Colors.primary}; border-radius: 50%; border: 2px solid ${Colors.background}; }
        .timeline-content { }
        .timeline-phase { font-size: 11px; font-weight: 600; color: ${Colors.primary}; text-transform: uppercase; letter-spacing: 0.05em; }
        .timeline-text { font-size: 14px; line-height: 1.5; color: ${Colors.textSecondary}; margin-top: 4px; }
    `;
}

function getInvestmentStyles() {
    return `
        .block-investment { position: relative; min-height: 120px; background: linear-gradient(135deg, ${Colors.primary} 0%, ${Colors.primaryDark} 100%); display: flex; align-items: center; justify-content: center; margin: ${SpacingScale.lg}px ${SpacingScale.xl}px; border-radius: ${BorderRadius.lg}px; overflow: hidden; }
        .investment-overlay { position: absolute; inset: 0; background: radial-gradient(circle at 70% 50%, rgba(255,255,255,0.1), transparent 50%); }
        .investment-content { position: relative; z-index: 2; text-align: center; padding: ${SpacingScale.xl}px; }
        .investment-label { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 0.1em; }
        .investment-amount { font-size: 32px; font-weight: 700; color: #fff; margin-top: 8px; }
    `;
}

function getFooterStyles() {
    return `
        .block-footer { padding: 0 32px 24px 32px; margin-top: 16px; border-top: 1px solid ${Colors.border}; }
        .footer-brand-strip { height: 3px; background: linear-gradient(90deg, ${Colors.primary}, ${Colors.accent}); margin: 0 -32px 24px; }
        .footer-content { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; }
        .footer-left { }
        .footer-label { font-size: 10px; font-weight: 700; color: ${Colors.textMuted}; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 6px; }
        .footer-contact { font-size: 13px; line-height: 1.5; color: ${Colors.textPrimary}; font-weight: 500; }
        .footer-right { }
        .signature-box { width: 180px; }
        .signature-line { height: 1px; background: ${Colors.border}; margin-bottom: 8px; }
        .signature-label { font-size: 10px; font-weight: 600; color: ${Colors.textMuted}; text-transform: uppercase; letter-spacing: 0.05em; display: block; }
        .footer-bottom { display: flex; align-items: center; justify-content: center; gap: 8px; padding-top: 16px; border-top: 1px solid ${Colors.borderLight}; }
        .footer-logo-mark { width: 18px; height: 18px; background: ${Colors.backgroundDark}; color: #fff; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; border-radius: 4px; }
        .footer-brand-text { font-size: 11px; font-weight: 500; color: ${Colors.textMuted}; letter-spacing: 0.02em; }
    `;
}

// ============================================
// UTILITIES
// ============================================

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    if (!text) return '';
    const str = String(text);
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Combine all styles for a rendered document
 */
export function combineStyles(renderOutput) {
    const allStyles = [renderOutput.styles];

    renderOutput.pages.forEach(page => {
        page.blocks.forEach(block => {
            if (block.styles) {
                allStyles.push(block.styles);
            }
        });
    });

    // Deduplicate
    return [...new Set(allStyles)].join('\n');
}

/**
 * Generate complete HTML document for PDF rendering
 */
export function generateHtmlDocument(renderOutput) {
    const styles = combineStyles(renderOutput);

    const pagesHtml = renderOutput.pages.map(page => {
        const blocksHtml = page.blocks.map(b => b.html).join('\n');
        return `<div class="page" data-page="${page.number}">${blocksHtml}</div>`;
    }).join('\n');

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(renderOutput.meta.projectTitle)}</title>
    <style>${styles}</style>
</head>
<body>
    ${pagesHtml}
</body>
</html>`;
}

// ============================================
// EXPORTS
// ============================================

export default {
    // Main pipeline
    renderDocument,

    // Renderers
    renderPage,
    renderBlock,

    // Utilities
    combineStyles,
    generateHtmlDocument
};
