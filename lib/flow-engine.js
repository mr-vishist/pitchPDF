/**
 * Flow Engine v1.0
 * Manages vertical document flow, block stacking, and page break logic
 */

import { BlockType, DocumentRegion } from './document-engine.js';
import { SpacingScale, PageDimensions, TypographyScale } from './layout-engine.js';

// ============================================
// FLOW CONSTANTS
// ============================================

/**
 * Default page height (A4)
 */
export const PAGE_HEIGHT = PageDimensions.A4.height;

/**
 * Flow constraint types
 */
export const FlowConstraint = {
    NORMAL: 'normal',
    KEEP_TOGETHER: 'keep_together',
    KEEP_WITH_NEXT: 'keep_with_next',
    KEEP_WITH_PREVIOUS: 'keep_with_previous',
    AVOID_ORPHAN: 'avoid_orphan',
    ANCHOR_BOTTOM: 'anchor_bottom'
};

/**
 * Break preference
 */
export const BreakPreference = {
    AUTO: 'auto',
    AVOID: 'avoid',
    FORCE_BEFORE: 'force_before',
    FORCE_AFTER: 'force_after'
};

// ============================================
// HEIGHT ESTIMATION
// ============================================

/**
 * Base heights for block types (in pixels)
 */
const BaseBlockHeights = {
    [BlockType.HEADER]: 280,
    [BlockType.CLIENT]: 100,
    [BlockType.TWO_COLUMN]: 180,
    [BlockType.SECTION]: 120,
    [BlockType.GRID]: 150,
    [BlockType.TIMELINE]: 120,
    [BlockType.INVESTMENT]: 140,
    [BlockType.FOOTER]: 120
};

/**
 * Estimate text height based on content
 */
function estimateTextHeight(text, fontSize = 14, lineHeight = 1.6, containerWidth = 700) {
    if (!text) return 0;

    // Approximate characters per line
    const avgCharWidth = fontSize * 0.5;
    const charsPerLine = Math.floor(containerWidth / avgCharWidth);

    // Count lines
    const lines = text.split('\n');
    let totalLines = 0;

    lines.forEach(line => {
        const lineCount = Math.ceil(line.length / charsPerLine) || 1;
        totalLines += lineCount;
    });

    return totalLines * fontSize * lineHeight;
}

/**
 * Calculate height for a specific block
 */
export function calculateBlockHeight(block, context = {}) {
    const baseHeight = BaseBlockHeights[block.type] ?? 100;
    const containerWidth = context.containerWidth ?? 700;
    let contentHeight = 0;

    switch (block.type) {
        case BlockType.HEADER:
            contentHeight = baseHeight;
            break;

        case BlockType.CLIENT:
            contentHeight = baseHeight;
            break;

        case BlockType.TWO_COLUMN:
            if (block.content?.columns) {
                const columnHeights = block.content.columns.map(col => {
                    const titleHeight = 30;
                    const bodyHeight = estimateTextHeight(col.body, 14, 1.6, containerWidth / 2 - 20);
                    return titleHeight + bodyHeight + SpacingScale.lg;
                });
                contentHeight = Math.max(...columnHeights, 100) + SpacingScale.xl * 2;
            } else {
                contentHeight = baseHeight;
            }
            break;

        case BlockType.SECTION:
            const titleHeight = 30;
            const bodyHeight = estimateTextHeight(block.content?.body, 14, 1.6, containerWidth);
            contentHeight = titleHeight + bodyHeight + SpacingScale.xl * 2;
            break;

        case BlockType.GRID:
            if (block.content?.items) {
                const itemsPerRow = block.content.columns ?? 2;
                const rows = Math.ceil(block.content.items.length / itemsPerRow);
                const itemHeight = 80; // Estimated height per grid item
                contentHeight = (rows * itemHeight) + SpacingScale.xl * 2 + 30; // + title
            } else {
                contentHeight = baseHeight;
            }
            break;

        case BlockType.TIMELINE:
            if (block.content?.phases) {
                const phaseHeight = 60; // Estimated height per phase
                contentHeight = (block.content.phases.length * phaseHeight) + SpacingScale.xl * 2 + 30;
            } else {
                contentHeight = baseHeight;
            }
            break;

        case BlockType.INVESTMENT:
            contentHeight = baseHeight;
            break;

        case BlockType.FOOTER:
            contentHeight = baseHeight;
            break;

        default:
            contentHeight = baseHeight;
    }

    // Apply min/max constraints from layout rules
    const minHeight = block.layoutRules?.minHeight ?? 0;
    const maxHeight = block.layoutRules?.maxHeight ?? Infinity;

    return Math.min(Math.max(contentHeight, minHeight), maxHeight);
}

// ============================================
// FLOW GROUPS
// ============================================

/**
 * Flow group types
 */
export const FlowGroupType = {
    HEADER_GROUP: 'header_group',
    CONTENT_GROUP: 'content_group',
    HIGHLIGHT_GROUP: 'highlight_group',
    FOOTER_GROUP: 'footer_group'
};

/**
 * Create a flow group
 */
function createFlowGroup(type, blocks, options = {}) {
    const totalHeight = blocks.reduce((sum, b) => sum + (b.flowHeight ?? 0), 0);

    return {
        id: `group_${type}_${Date.now().toString(36)}`,
        type,
        blocks,
        blockCount: blocks.length,
        totalHeight,
        keepTogether: options.keepTogether ?? true,
        breakBefore: options.breakBefore ?? false,
        breakAfter: options.breakAfter ?? false,
        anchorBottom: options.anchorBottom ?? false
    };
}

/**
 * Group blocks into flow groups
 */
export function createFlowGroups(blocks) {
    const groups = [];
    let currentContentBlocks = [];

    blocks.forEach((block, index) => {
        switch (block.type) {
            case BlockType.HEADER:
            case BlockType.CLIENT:
                // Header and Client form a group
                if (block.type === BlockType.HEADER) {
                    currentContentBlocks = []; // Reset
                }
                // Will be grouped with next block if CLIENT follows HEADER
                if (block.type === BlockType.CLIENT) {
                    const headerBlock = blocks[index - 1];
                    if (headerBlock?.type === BlockType.HEADER) {
                        groups.push(createFlowGroup(FlowGroupType.HEADER_GROUP, [headerBlock, block], {
                            keepTogether: true
                        }));
                    } else {
                        groups.push(createFlowGroup(FlowGroupType.HEADER_GROUP, [block], {
                            keepTogether: true
                        }));
                    }
                }
                break;

            case BlockType.INVESTMENT:
                // Flush content blocks first
                if (currentContentBlocks.length > 0) {
                    groups.push(createFlowGroup(FlowGroupType.CONTENT_GROUP, [...currentContentBlocks], {
                        keepTogether: false
                    }));
                    currentContentBlocks = [];
                }
                // Investment is its own highlight group
                groups.push(createFlowGroup(FlowGroupType.HIGHLIGHT_GROUP, [block], {
                    keepTogether: true,
                    breakBefore: false
                }));
                break;

            case BlockType.FOOTER:
                // Flush content blocks first
                if (currentContentBlocks.length > 0) {
                    groups.push(createFlowGroup(FlowGroupType.CONTENT_GROUP, [...currentContentBlocks], {
                        keepTogether: false
                    }));
                    currentContentBlocks = [];
                }
                // Footer is its own group, anchored to bottom
                groups.push(createFlowGroup(FlowGroupType.FOOTER_GROUP, [block], {
                    keepTogether: true,
                    anchorBottom: true
                }));
                break;

            default:
                // Content blocks accumulate
                if (block.type !== BlockType.HEADER) {
                    currentContentBlocks.push(block);
                }
                break;
        }
    });

    // Flush remaining content blocks
    if (currentContentBlocks.length > 0) {
        groups.push(createFlowGroup(FlowGroupType.CONTENT_GROUP, [...currentContentBlocks], {
            keepTogether: false
        }));
    }

    return groups;
}

// ============================================
// BLOCK STACKING
// ============================================

/**
 * Stack blocks vertically with calculated positions
 */
export function stackBlocks(blocks, startY = 0) {
    let currentY = startY;

    return blocks.map(block => {
        const height = block.flowHeight ?? calculateBlockHeight(block);
        const positionedBlock = {
            ...block,
            flowPosition: {
                y: currentY,
                height
            }
        };
        currentY += height;
        return positionedBlock;
    });
}

/**
 * Get total height of stacked blocks
 */
export function getTotalStackHeight(blocks) {
    return blocks.reduce((sum, block) => {
        return sum + (block.flowHeight ?? block.flowPosition?.height ?? calculateBlockHeight(block));
    }, 0);
}

// ============================================
// OVERFLOW HANDLING
// ============================================

/**
 * Check if a block would overflow the available space
 */
export function checkOverflow(blockHeight, availableSpace) {
    return blockHeight > availableSpace;
}

/**
 * Check if a group would overflow
 */
export function checkGroupOverflow(group, availableSpace) {
    return group.totalHeight > availableSpace;
}

/**
 * Find the best break point within a group of blocks
 */
export function findBreakPoint(blocks, availableSpace, context = {}) {
    let accumulatedHeight = 0;
    let breakIndex = -1;

    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const blockHeight = block.flowHeight ?? calculateBlockHeight(block, context);

        // Check if this block has constraints
        const keepWithNext = block.keepTogether || block.flow?.hint === 'keep_with_next';
        const keepWithPrev = block.flow?.hint === 'keep_with_previous';

        if (accumulatedHeight + blockHeight <= availableSpace) {
            accumulatedHeight += blockHeight;
            // This block fits, but check if it should stay with next
            if (!keepWithNext || i === blocks.length - 1) {
                breakIndex = i;
            }
        } else {
            // This block doesn't fit
            break;
        }
    }

    return {
        breakIndex,
        fitsCount: breakIndex + 1,
        remainingCount: blocks.length - breakIndex - 1
    };
}

// ============================================
// FLOW CONSTRAINTS
// ============================================

/**
 * Get flow constraints for a block
 */
export function getFlowConstraints(block) {
    const constraints = {
        keepTogether: false,
        keepWithNext: false,
        keepWithPrevious: false,
        avoidOrphan: false,
        minLinesOnPage: 2,
        anchorBottom: false
    };

    // Block-level constraints
    if (block.keepTogether) {
        constraints.keepTogether = true;
    }

    // Type-based constraints
    switch (block.type) {
        case BlockType.HEADER:
        case BlockType.INVESTMENT:
            constraints.keepTogether = true;
            break;
        case BlockType.CLIENT:
            constraints.keepWithPrevious = true;
            break;
        case BlockType.FOOTER:
            constraints.keepTogether = true;
            constraints.anchorBottom = true;
            break;
        case BlockType.SECTION:
        case BlockType.GRID:
        case BlockType.TIMELINE:
            constraints.avoidOrphan = true;
            constraints.minLinesOnPage = 3;
            break;
    }

    // Flow rule overrides
    if (block.flow) {
        if (block.flow.hint === 'keep_with_next') {
            constraints.keepWithNext = true;
        }
        if (block.flow.hint === 'keep_with_previous') {
            constraints.keepWithPrevious = true;
        }
        if (block.flow.anchorToBottom) {
            constraints.anchorBottom = true;
        }
    }

    return constraints;
}

/**
 * Check if a break is allowed before this block
 */
export function canBreakBefore(block, previousBlock) {
    const constraints = getFlowConstraints(block);

    // Cannot break if this block should stay with previous
    if (constraints.keepWithPrevious) {
        return false;
    }

    // Cannot break if previous block should stay with next
    if (previousBlock) {
        const prevConstraints = getFlowConstraints(previousBlock);
        if (prevConstraints.keepWithNext) {
            return false;
        }
    }

    return true;
}

// ============================================
// FLOW APPLICATION
// ============================================

/**
 * Apply flow calculations to blocks
 */
function applyFlowToBlocks(blocks, context = {}) {
    return blocks.map((block, index) => {
        const height = calculateBlockHeight(block, context);
        const constraints = getFlowConstraints(block);

        return {
            ...block,
            flowHeight: height,
            flowConstraints: constraints
        };
    });
}

/**
 * Main flow application function
 */
export function applyFlow(document) {
    const context = {
        pageHeight: document.layout?.height ?? PAGE_HEIGHT,
        containerWidth: document.layout?.width ?? PageDimensions.A4.width
    };

    // Step 1: Calculate heights for all blocks
    const blocksWithHeight = applyFlowToBlocks(document.blocks, context);

    // Step 2: Stack blocks with positions
    const stackedBlocks = stackBlocks(blocksWithHeight, 0);

    // Step 3: Create flow groups
    const flowGroups = createFlowGroups(stackedBlocks);

    // Step 4: Calculate total document height
    const totalHeight = getTotalStackHeight(stackedBlocks);

    // Step 5: Determine if single page or multi-page
    const pageCount = Math.ceil(totalHeight / context.pageHeight) || 1;
    const isSinglePage = pageCount === 1;

    return {
        ...document,
        blocks: stackedBlocks,
        flowMeta: {
            totalHeight,
            pageHeight: context.pageHeight,
            pageCount,
            isSinglePage,
            groups: flowGroups,
            groupCount: flowGroups.length
        }
    };
}

/**
 * Get flow-ready representation for rendering
 */
export function createFlowReadyRepresentation(document) {
    const flowDoc = document.flowMeta ? document : applyFlow(document);

    return {
        blocks: flowDoc.blocks.map(block => ({
            id: block.id,
            type: block.type,
            content: block.content,
            position: block.flowPosition,
            constraints: block.flowConstraints
        })),
        groups: flowDoc.flowMeta.groups,
        meta: {
            totalHeight: flowDoc.flowMeta.totalHeight,
            pageCount: flowDoc.flowMeta.pageCount,
            isSinglePage: flowDoc.flowMeta.isSinglePage
        }
    };
}

// ============================================
// EXPORTS
// ============================================

export default {
    // Constants
    PAGE_HEIGHT,
    FlowConstraint,
    BreakPreference,
    FlowGroupType,

    // Height calculation
    calculateBlockHeight,

    // Flow groups
    createFlowGroups,

    // Block stacking
    stackBlocks,
    getTotalStackHeight,

    // Overflow
    checkOverflow,
    checkGroupOverflow,
    findBreakPoint,

    // Constraints
    getFlowConstraints,
    canBreakBefore,

    // Main functions
    applyFlow,
    createFlowReadyRepresentation
};
