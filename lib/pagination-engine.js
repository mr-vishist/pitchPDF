/**
 * Pagination Engine v1.0
 * Distributes document blocks across pages respecting no-split rules
 */

import { BlockType } from './document-engine.js';
import { PageDimensions } from './layout-engine.js';
import { calculateBlockHeight, createFlowGroups, FlowGroupType } from './flow-engine.js';

// ============================================
// CONSTANTS
// ============================================

/**
 * Default page dimensions
 */
export const PAGE_HEIGHT = PageDimensions.A4.height;
export const PAGE_WIDTH = PageDimensions.A4.width;

/**
 * Block types that must never be split
 */
export const NO_SPLIT_BLOCKS = [
    BlockType.HEADER,
    BlockType.CLIENT,
    BlockType.INVESTMENT,
    BlockType.TIMELINE,
    BlockType.FOOTER,
    BlockType.TWO_COLUMN,
    BlockType.GRID
];

// ============================================
// PAGE MODEL
// ============================================

/**
 * Create a new page
 */
export function createPage(pageNumber, options = {}) {
    return {
        id: `page_${pageNumber}_${Date.now().toString(36)}`,
        number: pageNumber,
        width: options.width ?? PAGE_WIDTH,
        height: options.height ?? PAGE_HEIGHT,
        blocks: [],
        usedHeight: 0,
        availableHeight: options.height ?? PAGE_HEIGHT,
        isFirst: pageNumber === 1,
        isLast: false
    };
}

/**
 * Add a block to a page
 */
export function addBlockToPage(page, block, blockHeight) {
    const updatedBlocks = [...page.blocks, {
        ...block,
        pageNumber: page.number,
        pageY: page.usedHeight
    }];

    return {
        ...page,
        blocks: updatedBlocks,
        usedHeight: page.usedHeight + blockHeight,
        availableHeight: page.height - page.usedHeight - blockHeight
    };
}

// ============================================
// PAGE BREAK RULES
// ============================================

/**
 * Check if a block can be split
 */
export function canSplitBlock(block) {
    // These block types must never be split
    if (NO_SPLIT_BLOCKS.includes(block.type)) {
        return false;
    }

    // Check flow constraints
    if (block.flowConstraints?.keepTogether) {
        return false;
    }

    // Regular sections could theoretically be split, but we avoid it
    return false; // For now, never split any block
}

/**
 * Check if we can break before this block
 */
export function canBreakBefore(block, previousBlock) {
    // Cannot break before first block
    if (!previousBlock) {
        return false;
    }

    // Cannot break before CLIENT (it follows HEADER)
    if (block.type === BlockType.CLIENT) {
        return false;
    }

    // Cannot break if previous block wants to stay with next
    if (previousBlock.flowConstraints?.keepWithNext) {
        return false;
    }

    // Cannot break if this block wants to stay with previous
    if (block.flowConstraints?.keepWithPrevious) {
        return false;
    }

    // Can break between sections
    return true;
}

/**
 * Check if a block fits on the current page
 */
export function blockFitsOnPage(blockHeight, availableHeight) {
    return blockHeight <= availableHeight;
}

// ============================================
// PAGINATION ALGORITHM
// ============================================

/**
 * Main pagination function - distributes blocks across pages
 */
export function paginateDocument(document, options = {}) {
    const pageHeight = options.pageHeight ?? PAGE_HEIGHT;
    const pageWidth = options.pageWidth ?? PAGE_WIDTH;

    // Ensure blocks have flow heights
    const blocks = document.blocks.map(block => ({
        ...block,
        flowHeight: block.flowHeight ?? calculateBlockHeight(block)
    }));

    const pages = [];
    let currentPage = createPage(1, { width: pageWidth, height: pageHeight });
    let previousBlock = null;

    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const blockHeight = block.flowHeight;

        // Check if block fits on current page
        if (blockFitsOnPage(blockHeight, currentPage.availableHeight)) {
            // Block fits, add to current page
            currentPage = addBlockToPage(currentPage, block, blockHeight);
        } else {
            // Block doesn't fit
            // Can we break here?
            if (canBreakBefore(block, previousBlock)) {
                // Start a new page
                pages.push(currentPage);
                currentPage = createPage(pages.length + 1, { width: pageWidth, height: pageHeight });
                currentPage = addBlockToPage(currentPage, block, blockHeight);
            } else {
                // Cannot break here - we have to keep with previous
                // This is a constraint violation, but we'll handle it by
                // moving both blocks to a new page if possible
                if (previousBlock && currentPage.blocks.length > 1) {
                    // Remove the previous block from current page and start new page
                    const prevBlockHeight = previousBlock.flowHeight;
                    const blocksWithoutPrev = currentPage.blocks.slice(0, -1);
                    const usedWithoutPrev = currentPage.usedHeight - prevBlockHeight;

                    currentPage = {
                        ...currentPage,
                        blocks: blocksWithoutPrev,
                        usedHeight: usedWithoutPrev,
                        availableHeight: currentPage.height - usedWithoutPrev
                    };

                    pages.push(currentPage);
                    currentPage = createPage(pages.length + 1, { width: pageWidth, height: pageHeight });
                    currentPage = addBlockToPage(currentPage, previousBlock, prevBlockHeight);
                    currentPage = addBlockToPage(currentPage, block, blockHeight);
                } else {
                    // Force add to current page (overflow situation)
                    currentPage = addBlockToPage(currentPage, block, blockHeight);
                }
            }
        }

        previousBlock = block;
    }

    // Add the last page
    if (currentPage.blocks.length > 0) {
        currentPage.isLast = true;
        pages.push(currentPage);
    }

    // Mark first page's isLast if it's the only page
    if (pages.length === 1) {
        pages[0].isLast = true;
    }

    return {
        pages,
        pageCount: pages.length,
        totalBlocks: blocks.length,
        isSinglePage: pages.length === 1
    };
}

/**
 * Paginate using flow groups (respects group integrity)
 */
export function paginateByGroups(document, options = {}) {
    const pageHeight = options.pageHeight ?? PAGE_HEIGHT;
    const pageWidth = options.pageWidth ?? PAGE_WIDTH;

    // Get blocks with heights
    const blocks = document.blocks.map(block => ({
        ...block,
        flowHeight: block.flowHeight ?? calculateBlockHeight(block)
    }));

    // Create flow groups
    const groups = createFlowGroups(blocks);

    const pages = [];
    let currentPage = createPage(1, { width: pageWidth, height: pageHeight });

    for (const group of groups) {
        const groupHeight = group.totalHeight;

        // Check if entire group fits
        if (blockFitsOnPage(groupHeight, currentPage.availableHeight)) {
            // Add all blocks in group to current page
            for (const block of group.blocks) {
                currentPage = addBlockToPage(currentPage, block, block.flowHeight);
            }
        } else {
            // Group doesn't fit
            if (group.keepTogether) {
                // Start new page for this group
                if (currentPage.blocks.length > 0) {
                    pages.push(currentPage);
                    currentPage = createPage(pages.length + 1, { width: pageWidth, height: pageHeight });
                }
            }

            // Add blocks to current page
            for (const block of group.blocks) {
                if (!blockFitsOnPage(block.flowHeight, currentPage.availableHeight)) {
                    // Need new page
                    if (currentPage.blocks.length > 0) {
                        pages.push(currentPage);
                        currentPage = createPage(pages.length + 1, { width: pageWidth, height: pageHeight });
                    }
                }
                currentPage = addBlockToPage(currentPage, block, block.flowHeight);
            }
        }
    }

    // Add last page
    if (currentPage.blocks.length > 0) {
        currentPage.isLast = true;
        pages.push(currentPage);
    }

    if (pages.length === 1) {
        pages[0].isLast = true;
    }

    return {
        pages,
        pageCount: pages.length,
        groups: groups.length,
        isSinglePage: pages.length === 1
    };
}

// ============================================
// MULTI-PAGE LAYOUT MODEL
// ============================================

/**
 * Create multi-page layout model for rendering
 */
export function createMultiPageLayout(document) {
    const paginationResult = paginateByGroups(document);

    return {
        version: '1.0',
        documentId: document.meta?.clientName ?? 'document',
        pageCount: paginationResult.pageCount,
        isSinglePage: paginationResult.isSinglePage,
        pageSize: {
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT
        },
        pages: paginationResult.pages.map(page => ({
            number: page.number,
            isFirst: page.isFirst,
            isLast: page.isLast,
            dimensions: {
                width: page.width,
                height: page.height
            },
            usedHeight: page.usedHeight,
            blocks: page.blocks.map(block => ({
                id: block.id,
                type: block.type,
                content: block.content,
                position: {
                    y: block.pageY,
                    height: block.flowHeight
                },
                emphasis: block.emphasis
            }))
        }))
    };
}

/**
 * Get page for a specific block by ID
 */
export function getPageForBlock(multiPageLayout, blockId) {
    for (const page of multiPageLayout.pages) {
        const block = page.blocks.find(b => b.id === blockId);
        if (block) {
            return page.number;
        }
    }
    return null;
}

// ============================================
// EXPORTS
// ============================================

export default {
    // Constants
    PAGE_HEIGHT,
    PAGE_WIDTH,
    NO_SPLIT_BLOCKS,

    // Page model
    createPage,
    addBlockToPage,

    // Break rules
    canSplitBlock,
    canBreakBefore,
    blockFitsOnPage,

    // Pagination
    paginateDocument,
    paginateByGroups,

    // Multi-page layout
    createMultiPageLayout,
    getPageForBlock
};
