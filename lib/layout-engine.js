/**
 * Layout Engine v1.0
 * Computes precise positioning, sizing, and styling for document elements
 */

import { BlockType, LayoutHint, Emphasis, DocumentRegion } from './document-engine.js';

// ============================================
// SPACING SYSTEM
// ============================================

/**
 * Base unit for spacing calculations (4px)
 */
export const SPACING_UNIT = 4;

/**
 * Spacing scale using 8-point grid system
 * Each level doubles or follows harmonic progression
 */
export const SpacingScale = {
    none: 0,
    xxs: SPACING_UNIT,           // 4px
    xs: SPACING_UNIT * 2,        // 8px
    sm: SPACING_UNIT * 3,        // 12px
    md: SPACING_UNIT * 4,        // 16px
    lg: SPACING_UNIT * 6,        // 24px
    xl: SPACING_UNIT * 8,        // 32px
    xxl: SPACING_UNIT * 10,      // 40px
    xxxl: SPACING_UNIT * 12,     // 48px
    section: SPACING_UNIT * 16,  // 64px
    hero: SPACING_UNIT * 20      // 80px
};

/**
 * Get spacing value by size name
 */
export function getSpacing(size) {
    return SpacingScale[size] ?? SpacingScale.md;
}

/**
 * Get gap value for flexbox/grid layouts
 */
export function getGap(size) {
    const gapMap = {
        tight: SpacingScale.xs,
        normal: SpacingScale.md,
        relaxed: SpacingScale.lg,
        loose: SpacingScale.xl
    };
    return gapMap[size] ?? gapMap.normal;
}

// ============================================
// TYPOGRAPHY HIERARCHY
// ============================================

/**
 * Typography scale with semantic levels
 */
export const TypographyScale = {
    hero: {
        fontSize: 42,
        fontWeight: 700,
        lineHeight: 1.1,
        letterSpacing: -0.02,
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        color: '#ffffff'
    },
    h1: {
        fontSize: 32,
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: -0.01,
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        color: '#1a1a2e'
    },
    h2: {
        fontSize: 24,
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: -0.005,
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        color: '#1a1a2e'
    },
    h3: {
        fontSize: 20,
        fontWeight: 600,
        lineHeight: 1.4,
        letterSpacing: 0,
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        color: '#1a1a2e'
    },
    h4: {
        fontSize: 16,
        fontWeight: 600,
        lineHeight: 1.4,
        letterSpacing: 0,
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        color: '#1a1a2e'
    },
    body: {
        fontSize: 14,
        fontWeight: 400,
        lineHeight: 1.6,
        letterSpacing: 0,
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        color: '#4a4a6a'
    },
    bodyLarge: {
        fontSize: 16,
        fontWeight: 400,
        lineHeight: 1.6,
        letterSpacing: 0,
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        color: '#4a4a6a'
    },
    caption: {
        fontSize: 12,
        fontWeight: 500,
        lineHeight: 1.4,
        letterSpacing: 0.02,
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        color: '#8a8aaa',
        textTransform: 'uppercase'
    },
    label: {
        fontSize: 11,
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: 0.05,
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        color: '#6a6a8a',
        textTransform: 'uppercase'
    },
    badge: {
        fontSize: 10,
        fontWeight: 700,
        lineHeight: 1,
        letterSpacing: 0.1,
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        color: '#ffffff',
        textTransform: 'uppercase'
    }
};

/**
 * Get typography styles by level
 */
export function getTypography(level) {
    return TypographyScale[level] ?? TypographyScale.body;
}

/**
 * Typography mapping by block type and emphasis
 */
export const BlockTypography = {
    [BlockType.HEADER]: {
        title: 'hero',
        subtitle: 'bodyLarge',
        badge: 'badge'
    },
    [BlockType.CLIENT]: {
        label: 'label',
        name: 'h2',
        company: 'body'
    },
    [BlockType.SECTION]: {
        title: 'h2',
        body: 'body'
    },
    [BlockType.TWO_COLUMN]: {
        title: 'h3',
        body: 'body'
    },
    [BlockType.GRID]: {
        title: 'h2',
        index: 'caption',
        content: 'body'
    },
    [BlockType.TIMELINE]: {
        title: 'h2',
        phase: 'label',
        content: 'body'
    },
    [BlockType.INVESTMENT]: {
        label: 'label',
        amount: 'h1'
    },
    [BlockType.FOOTER]: {
        label: 'label',
        contact: 'body',
        brand: 'caption'
    }
};

// ============================================
// LAYOUT DIMENSIONS
// ============================================

/**
 * Page dimensions (A4 at 96 DPI)
 */
export const PageDimensions = {
    A4: {
        width: 794,
        height: 1123,
        dpi: 96
    }
};

/**
 * Container dimensions with margins
 */
export const ContainerDimensions = {
    full: {
        width: 794,
        paddingLeft: 0,
        paddingRight: 0
    },
    padded: {
        width: 794,
        paddingLeft: 32,
        paddingRight: 32,
        contentWidth: 730
    },
    centered: {
        width: 794,
        paddingLeft: 64,
        paddingRight: 64,
        contentWidth: 666
    }
};

// ============================================
// ALIGNMENT SYSTEM
// ============================================

/**
 * Horizontal alignment options
 */
export const HorizontalAlign = {
    LEFT: 'left',
    CENTER: 'center',
    RIGHT: 'right',
    STRETCH: 'stretch'
};

/**
 * Vertical alignment options
 */
export const VerticalAlign = {
    TOP: 'top',
    MIDDLE: 'middle',
    BOTTOM: 'bottom',
    BASELINE: 'baseline'
};

/**
 * Get alignment CSS properties
 */
export function getAlignmentStyles(horizontal, vertical) {
    const styles = {};

    // Horizontal alignment
    switch (horizontal) {
        case HorizontalAlign.LEFT:
            styles.textAlign = 'left';
            styles.justifyContent = 'flex-start';
            break;
        case HorizontalAlign.CENTER:
            styles.textAlign = 'center';
            styles.justifyContent = 'center';
            break;
        case HorizontalAlign.RIGHT:
            styles.textAlign = 'right';
            styles.justifyContent = 'flex-end';
            break;
        case HorizontalAlign.STRETCH:
            styles.textAlign = 'left';
            styles.justifyContent = 'stretch';
            break;
    }

    // Vertical alignment
    switch (vertical) {
        case VerticalAlign.TOP:
            styles.alignItems = 'flex-start';
            break;
        case VerticalAlign.MIDDLE:
            styles.alignItems = 'center';
            break;
        case VerticalAlign.BOTTOM:
            styles.alignItems = 'flex-end';
            break;
        case VerticalAlign.BASELINE:
            styles.alignItems = 'baseline';
            break;
    }

    return styles;
}

// ============================================
// VISUAL STYLING
// ============================================

/**
 * Color palette
 */
export const Colors = {
    // Primary
    primary: '#6366f1',
    primaryDark: '#4f46e5',
    primaryLight: '#818cf8',

    // Accent
    accent: '#10b981',
    accentDark: '#059669',

    // Neutrals
    background: '#ffffff',
    backgroundAlt: '#f8fafc',
    backgroundDark: '#1a1a2e',

    // Text
    textPrimary: '#1a1a2e',
    textSecondary: '#4a4a6a',
    textMuted: '#8a8aaa',
    textInverse: '#ffffff',

    // Borders
    border: '#e2e8f0',
    borderLight: '#f1f5f9'
};

/**
 * Shadow definitions
 */
export const Shadows = {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)'
};

/**
 * Border radius values
 */
export const BorderRadius = {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999
};

// ============================================
// VISUAL GROUPING
// ============================================

/**
 * Visual container styles by type
 */
export const VisualContainers = {
    card: {
        background: Colors.background,
        borderRadius: BorderRadius.lg,
        shadow: Shadows.md,
        padding: SpacingScale.lg
    },
    panel: {
        background: Colors.backgroundAlt,
        borderRadius: BorderRadius.md,
        shadow: Shadows.none,
        padding: SpacingScale.lg
    },
    highlight: {
        background: `linear-gradient(135deg, ${Colors.primary} 0%, ${Colors.primaryDark} 100%)`,
        borderRadius: BorderRadius.lg,
        shadow: Shadows.lg,
        padding: SpacingScale.xl
    },
    hero: {
        background: `linear-gradient(135deg, ${Colors.backgroundDark} 0%, #2d2d44 100%)`,
        borderRadius: BorderRadius.none,
        shadow: Shadows.none,
        padding: SpacingScale.hero
    },
    section: {
        background: 'transparent',
        borderRadius: BorderRadius.none,
        shadow: Shadows.none,
        padding: SpacingScale.lg
    },
    sectionAlt: {
        background: Colors.backgroundAlt,
        borderRadius: BorderRadius.none,
        shadow: Shadows.none,
        padding: SpacingScale.lg
    }
};

/**
 * Get visual container style by block type
 */
export function getContainerStyle(blockType, metadata = {}) {
    const containerMap = {
        [BlockType.HEADER]: VisualContainers.hero,
        [BlockType.CLIENT]: VisualContainers.panel,
        [BlockType.TWO_COLUMN]: VisualContainers.section,
        [BlockType.SECTION]: metadata.alternateBackground ? VisualContainers.sectionAlt : VisualContainers.section,
        [BlockType.GRID]: metadata.alternateBackground ? VisualContainers.sectionAlt : VisualContainers.section,
        [BlockType.TIMELINE]: VisualContainers.section,
        [BlockType.INVESTMENT]: VisualContainers.highlight,
        [BlockType.FOOTER]: VisualContainers.section
    };

    return containerMap[blockType] ?? VisualContainers.section;
}

// ============================================
// MARGIN CALCULATOR
// ============================================

/**
 * Block margin configurations
 */
const BlockMargins = {
    [BlockType.HEADER]: { top: 0, right: 0, bottom: 0, left: 0 },
    [BlockType.CLIENT]: { top: 0, right: 0, bottom: 0, left: 0 },
    [BlockType.TWO_COLUMN]: { top: SpacingScale.lg, right: 0, bottom: SpacingScale.lg, left: 0 },
    [BlockType.SECTION]: { top: 0, right: 0, bottom: 0, left: 0 },
    [BlockType.GRID]: { top: 0, right: 0, bottom: 0, left: 0 },
    [BlockType.TIMELINE]: { top: 0, right: 0, bottom: 0, left: 0 },
    [BlockType.INVESTMENT]: { top: SpacingScale.lg, right: SpacingScale.xl, bottom: SpacingScale.lg, left: SpacingScale.xl },
    [BlockType.FOOTER]: { top: 0, right: 0, bottom: 0, left: 0 }
};

/**
 * Calculate margins for a block
 */
export function calculateMargins(block, context = {}) {
    const baseMargins = BlockMargins[block.type] ?? { top: 0, right: 0, bottom: 0, left: 0 };

    // Apply margin collapse logic
    if (context.previousBlock) {
        // Collapse top margin with previous block's bottom margin
        const prevBottomMargin = BlockMargins[context.previousBlock.type]?.bottom ?? 0;
        baseMargins.top = Math.max(baseMargins.top - prevBottomMargin, 0);
    }

    return baseMargins;
}

// ============================================
// SECTION LAYOUT CALCULATOR
// ============================================

/**
 * Calculate section layout
 */
export function calculateSectionLayout(block, context = {}) {
    const containerWidth = context.containerWidth ?? PageDimensions.A4.width;
    const containerStyle = getContainerStyle(block.type, block.metadata);
    const margins = calculateMargins(block, context);

    // Determine content width based on layout hint
    let contentWidth = containerWidth;
    let paddingLeft = containerStyle.padding;
    let paddingRight = containerStyle.padding;

    if (block.layout === LayoutHint.PADDED) {
        paddingLeft = SpacingScale.xl;
        paddingRight = SpacingScale.xl;
        contentWidth = containerWidth - paddingLeft - paddingRight;
    } else if (block.layout === LayoutHint.CENTERED) {
        paddingLeft = SpacingScale.section;
        paddingRight = SpacingScale.section;
        contentWidth = containerWidth - paddingLeft - paddingRight;
    }

    return {
        width: containerWidth,
        contentWidth,
        minHeight: block.layoutRules?.minHeight ?? 0,
        maxHeight: block.layoutRules?.maxHeight ?? null,
        padding: {
            top: containerStyle.padding,
            right: paddingRight,
            bottom: containerStyle.padding,
            left: paddingLeft
        },
        margin: margins,
        position: {
            x: 0,
            y: context.currentY ?? 0
        }
    };
}

// ============================================
// BLOCK LAYOUT CALCULATOR
// ============================================

/**
 * Calculate block layout (box model)
 */
export function calculateBlockLayout(block, context = {}) {
    const sectionLayout = calculateSectionLayout(block, context);
    const containerStyle = getContainerStyle(block.type, block.metadata);

    return {
        ...sectionLayout,
        boxModel: {
            width: sectionLayout.width,
            contentWidth: sectionLayout.contentWidth,
            padding: sectionLayout.padding,
            margin: sectionLayout.margin,
            borderRadius: containerStyle.borderRadius,
            background: containerStyle.background,
            shadow: containerStyle.shadow
        },
        typography: BlockTypography[block.type] ?? BlockTypography[BlockType.SECTION]
    };
}

// ============================================
// COLUMN LAYOUT CALCULATOR
// ============================================

/**
 * Calculate column layout for multi-column blocks
 */
export function calculateColumnLayout(columnCount, containerWidth, gap = SpacingScale.lg) {
    const totalGap = gap * (columnCount - 1);
    const columnWidth = (containerWidth - totalGap) / columnCount;

    const columns = [];
    let currentX = 0;

    for (let i = 0; i < columnCount; i++) {
        columns.push({
            index: i,
            x: currentX,
            width: columnWidth,
            gap: i < columnCount - 1 ? gap : 0
        });
        currentX += columnWidth + gap;
    }

    return {
        columnCount,
        columnWidth,
        gap,
        totalWidth: containerWidth,
        columns
    };
}

/**
 * Calculate two-column layout (commonly used)
 */
export function calculateTwoColumnLayout(containerWidth, gap = SpacingScale.lg) {
    return calculateColumnLayout(2, containerWidth, gap);
}

// ============================================
// LAYOUT CONTEXT
// ============================================

/**
 * Create a new layout context
 */
export function createLayoutContext(options = {}) {
    return {
        // Viewport
        pageWidth: options.pageWidth ?? PageDimensions.A4.width,
        pageHeight: options.pageHeight ?? PageDimensions.A4.height,

        // Current position
        currentY: 0,
        currentPage: 1,

        // Container
        containerWidth: options.containerWidth ?? PageDimensions.A4.width,
        contentWidth: options.contentWidth ?? PageDimensions.A4.width,

        // Previous block reference
        previousBlock: null,

        // Accumulated layout data
        layouts: [],
        totalHeight: 0
    };
}

/**
 * Update layout context after processing a block
 */
export function updateLayoutContext(context, block, blockLayout) {
    const blockHeight = blockLayout.minHeight +
        blockLayout.padding.top +
        blockLayout.padding.bottom +
        blockLayout.margin.top +
        blockLayout.margin.bottom;

    return {
        ...context,
        currentY: context.currentY + blockHeight,
        previousBlock: block,
        layouts: [...context.layouts, { blockId: block.id, layout: blockLayout }],
        totalHeight: context.totalHeight + blockHeight
    };
}

// ============================================
// APPLY LAYOUT TO DOCUMENT
// ============================================

/**
 * Apply layout calculations to entire document
 */
export function applyLayout(document) {
    let context = createLayoutContext({
        pageWidth: document.layout?.width ?? PageDimensions.A4.width,
        pageHeight: document.layout?.height ?? PageDimensions.A4.height
    });

    const layoutBlocks = document.blocks.map(block => {
        const blockLayout = calculateBlockLayout(block, context);
        context = updateLayoutContext(context, block, blockLayout);

        return {
            ...block,
            computedLayout: blockLayout
        };
    });

    return {
        ...document,
        blocks: layoutBlocks,
        layoutMeta: {
            totalHeight: context.totalHeight,
            pageCount: Math.ceil(context.totalHeight / context.pageHeight) || 1,
            context: {
                pageWidth: context.pageWidth,
                pageHeight: context.pageHeight
            }
        }
    };
}

// ============================================
// EXPORTS
// ============================================

export default {
    // Spacing
    SPACING_UNIT,
    SpacingScale,
    getSpacing,
    getGap,

    // Typography
    TypographyScale,
    getTypography,
    BlockTypography,

    // Dimensions
    PageDimensions,
    ContainerDimensions,

    // Alignment
    HorizontalAlign,
    VerticalAlign,
    getAlignmentStyles,

    // Visual
    Colors,
    Shadows,
    BorderRadius,
    VisualContainers,
    getContainerStyle,

    // Calculators
    calculateMargins,
    calculateSectionLayout,
    calculateBlockLayout,
    calculateColumnLayout,
    calculateTwoColumnLayout,

    // Context
    createLayoutContext,
    updateLayoutContext,

    // Main function
    applyLayout
};
