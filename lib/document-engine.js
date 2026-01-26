/**
 * Document Composition Engine v2.0
 * Transforms raw proposal data into a structured document model
 * with comprehensive layout, grouping, hierarchy, and flow rules
 */

// ============================================
// BLOCK TYPE DEFINITIONS
// ============================================

/**
 * Block types define the semantic purpose of each document element
 */
export const BlockType = {
    HEADER: 'header',
    CLIENT: 'client',
    SECTION: 'section',
    TIMELINE: 'timeline',
    INVESTMENT: 'investment',
    FOOTER: 'footer',
    TWO_COLUMN: 'two_column',
    GRID: 'grid',
    DIVIDER: 'divider',
    SPACER: 'spacer'
};

/**
 * Content types for semantic classification
 */
export const ContentType = {
    TEXT: 'text',
    LIST: 'list',
    TIMELINE_ITEMS: 'timeline_items',
    GRID_ITEMS: 'grid_items',
    PRICING: 'pricing',
    CONTACT: 'contact',
    BRANDING: 'branding',
    SIGNATURE: 'signature'
};

// ============================================
// LAYOUT RULES
// ============================================

/**
 * Layout hints for rendering engines
 */
export const LayoutHint = {
    FULL_WIDTH: 'full_width',
    HALF_WIDTH: 'half_width',
    THIRD_WIDTH: 'third_width',
    TWO_THIRDS_WIDTH: 'two_thirds_width',
    CENTERED: 'centered',
    PADDED: 'padded',
    TIGHT: 'tight',
    BLEED: 'bleed'
};

/**
 * Layout rule configurations by block type
 */
export const LayoutRules = {
    [BlockType.HEADER]: {
        width: LayoutHint.FULL_WIDTH,
        height: 'auto',
        minHeight: 200,
        maxHeight: 350,
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        alignment: 'center',
        overflow: 'hidden'
    },
    [BlockType.CLIENT]: {
        width: LayoutHint.FULL_WIDTH,
        height: 'auto',
        minHeight: 80,
        padding: { top: 24, right: 32, bottom: 24, left: 32 },
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        alignment: 'left',
        background: 'primary'
    },
    [BlockType.TWO_COLUMN]: {
        width: LayoutHint.FULL_WIDTH,
        columnGap: 20,
        columnWidth: LayoutHint.HALF_WIDTH,
        padding: { top: 24, right: 32, bottom: 24, left: 32 },
        alignment: 'stretch'
    },
    [BlockType.SECTION]: {
        width: LayoutHint.FULL_WIDTH,
        padding: { top: 32, right: 32, bottom: 32, left: 32 },
        alignment: 'left'
    },
    [BlockType.GRID]: {
        width: LayoutHint.FULL_WIDTH,
        columns: 2,
        gap: 16,
        padding: { top: 32, right: 32, bottom: 32, left: 32 }
    },
    [BlockType.TIMELINE]: {
        width: LayoutHint.FULL_WIDTH,
        itemGap: 16,
        markerSize: 12,
        lineWidth: 2,
        padding: { top: 32, right: 32, bottom: 32, left: 32 }
    },
    [BlockType.INVESTMENT]: {
        width: LayoutHint.FULL_WIDTH,
        height: 'auto',
        minHeight: 120,
        padding: { top: 40, right: 40, bottom: 40, left: 40 },
        alignment: 'center',
        background: 'accent'
    },
    [BlockType.FOOTER]: {
        width: LayoutHint.FULL_WIDTH,
        height: 'auto',
        minHeight: 150,
        padding: { top: 32, right: 32, bottom: 24, left: 32 },
        alignment: 'left'
    }
};

/**
 * Apply layout rules to a block
 */
export function applyLayoutRules(block) {
    const rules = LayoutRules[block.type] || LayoutRules[BlockType.SECTION];
    return {
        ...block,
        layoutRules: {
            ...rules,
            computedWidth: computeWidth(rules.width),
            computedPadding: rules.padding || { top: 0, right: 0, bottom: 0, left: 0 }
        }
    };
}

function computeWidth(hint) {
    const widthMap = {
        [LayoutHint.FULL_WIDTH]: '100%',
        [LayoutHint.HALF_WIDTH]: '50%',
        [LayoutHint.THIRD_WIDTH]: '33.333%',
        [LayoutHint.TWO_THIRDS_WIDTH]: '66.666%',
        [LayoutHint.CENTERED]: '80%',
        [LayoutHint.PADDED]: '90%'
    };
    return widthMap[hint] || '100%';
}

// ============================================
// GROUPING RULES
// ============================================

/**
 * Grouping rule types
 */
export const GroupType = {
    HEADER_GROUP: 'header_group',       // Hero + Client
    CONTENT_GROUP: 'content_group',     // Main body sections
    HIGHLIGHT_GROUP: 'highlight_group', // Investment, key callouts
    FOOTER_GROUP: 'footer_group'        // Footer content
};

/**
 * Grouping rule definitions
 */
export const GroupingRules = {
    [GroupType.HEADER_GROUP]: {
        blockTypes: [BlockType.HEADER, BlockType.CLIENT],
        keepTogether: true,
        priority: 1,
        breakBefore: false,
        breakAfter: false
    },
    [GroupType.CONTENT_GROUP]: {
        blockTypes: [BlockType.TWO_COLUMN, BlockType.SECTION, BlockType.GRID, BlockType.TIMELINE],
        keepTogether: false,
        priority: 2,
        minOrphanLines: 3
    },
    [GroupType.HIGHLIGHT_GROUP]: {
        blockTypes: [BlockType.INVESTMENT],
        keepTogether: true,
        priority: 3,
        breakBefore: true,
        breakAfter: false
    },
    [GroupType.FOOTER_GROUP]: {
        blockTypes: [BlockType.FOOTER],
        keepTogether: true,
        priority: 4,
        breakBefore: false,
        anchorToBottom: true
    }
};

/**
 * Apply grouping rules to blocks
 */
export function applyGroupingRules(blocks) {
    return blocks.map(block => {
        const group = findGroupForBlock(block.type);
        return {
            ...block,
            grouping: {
                group: group?.type || GroupType.CONTENT_GROUP,
                keepTogether: group?.keepTogether || false,
                priority: group?.priority || 2,
                breakBefore: group?.breakBefore || false,
                breakAfter: group?.breakAfter || false
            }
        };
    });
}

function findGroupForBlock(blockType) {
    for (const [type, rule] of Object.entries(GroupingRules)) {
        if (rule.blockTypes.includes(blockType)) {
            return { type, ...rule };
        }
    }
    return null;
}

// ============================================
// HIERARCHY RULES
// ============================================

/**
 * Document regions for hierarchical organization
 */
export const DocumentRegion = {
    HEADER: 'header',
    BODY: 'body',
    HIGHLIGHT: 'highlight',
    FOOTER: 'footer'
};

/**
 * Hierarchy level definitions
 */
export const HierarchyLevel = {
    DOCUMENT: 0,
    REGION: 1,
    SECTION: 2,
    BLOCK: 3,
    ITEM: 4
};

/**
 * Hierarchy rules mapping block types to regions
 */
export const HierarchyRules = {
    [BlockType.HEADER]: { region: DocumentRegion.HEADER, level: HierarchyLevel.SECTION },
    [BlockType.CLIENT]: { region: DocumentRegion.HEADER, level: HierarchyLevel.BLOCK },
    [BlockType.TWO_COLUMN]: { region: DocumentRegion.BODY, level: HierarchyLevel.SECTION },
    [BlockType.SECTION]: { region: DocumentRegion.BODY, level: HierarchyLevel.SECTION },
    [BlockType.GRID]: { region: DocumentRegion.BODY, level: HierarchyLevel.SECTION },
    [BlockType.TIMELINE]: { region: DocumentRegion.BODY, level: HierarchyLevel.SECTION },
    [BlockType.INVESTMENT]: { region: DocumentRegion.HIGHLIGHT, level: HierarchyLevel.SECTION },
    [BlockType.FOOTER]: { region: DocumentRegion.FOOTER, level: HierarchyLevel.SECTION }
};

/**
 * Build hierarchy structure from blocks
 */
export function buildHierarchy(blocks) {
    const hierarchy = {
        [DocumentRegion.HEADER]: [],
        [DocumentRegion.BODY]: [],
        [DocumentRegion.HIGHLIGHT]: [],
        [DocumentRegion.FOOTER]: []
    };

    blocks.forEach(block => {
        const rule = HierarchyRules[block.type];
        if (rule) {
            hierarchy[rule.region].push({
                ...block,
                hierarchy: {
                    region: rule.region,
                    level: rule.level,
                    depth: rule.level
                }
            });
        }
    });

    return hierarchy;
}

// ============================================
// FLOW RULES
// ============================================

/**
 * Flow control hints for pagination
 */
export const FlowHint = {
    NORMAL: 'normal',
    BREAK_BEFORE: 'break_before',
    BREAK_AFTER: 'break_after',
    KEEP_WITH_NEXT: 'keep_with_next',
    KEEP_WITH_PREVIOUS: 'keep_with_previous',
    AVOID_BREAK: 'avoid_break'
};

/**
 * Flow rules for pagination control
 */
export const FlowRules = {
    [BlockType.HEADER]: {
        flowHint: FlowHint.AVOID_BREAK,
        minContentHeight: 200,
        orphanLines: 0,
        widowLines: 0
    },
    [BlockType.CLIENT]: {
        flowHint: FlowHint.KEEP_WITH_PREVIOUS,
        minContentHeight: 80
    },
    [BlockType.TWO_COLUMN]: {
        flowHint: FlowHint.NORMAL,
        minContentHeight: 150,
        orphanLines: 2
    },
    [BlockType.SECTION]: {
        flowHint: FlowHint.NORMAL,
        minContentHeight: 100,
        orphanLines: 3,
        widowLines: 2
    },
    [BlockType.GRID]: {
        flowHint: FlowHint.NORMAL,
        minItemsOnPage: 2
    },
    [BlockType.TIMELINE]: {
        flowHint: FlowHint.NORMAL,
        minItemsOnPage: 1
    },
    [BlockType.INVESTMENT]: {
        flowHint: FlowHint.AVOID_BREAK,
        minContentHeight: 120
    },
    [BlockType.FOOTER]: {
        flowHint: FlowHint.AVOID_BREAK,
        anchorToBottom: true
    }
};

/**
 * Apply flow rules to blocks
 */
export function applyFlowRules(blocks) {
    return blocks.map((block, index) => {
        const rules = FlowRules[block.type] || { flowHint: FlowHint.NORMAL };
        const nextBlock = blocks[index + 1];
        const prevBlock = blocks[index - 1];

        return {
            ...block,
            flow: {
                hint: rules.flowHint,
                minContentHeight: rules.minContentHeight || 0,
                orphanLines: rules.orphanLines || 0,
                widowLines: rules.widowLines || 0,
                anchorToBottom: rules.anchorToBottom || false,
                hasNext: !!nextBlock,
                hasPrev: !!prevBlock
            }
        };
    });
}

// ============================================
// VISUAL EMPHASIS
// ============================================

/**
 * Visual emphasis levels
 */
export const Emphasis = {
    HERO: 'hero',
    PRIMARY: 'primary',
    SECONDARY: 'secondary',
    TERTIARY: 'tertiary',
    MUTED: 'muted'
};

// ============================================
// BLOCK FACTORY
// ============================================

let blockCounter = 0;

/**
 * Generate unique block ID
 */
function generateBlockId(type) {
    return `${type}_${++blockCounter}_${Date.now().toString(36)}`;
}

/**
 * Creates a document block with standard structure
 */
function createBlock(type, content, options = {}) {
    return {
        id: generateBlockId(type),
        type,
        contentType: options.contentType || ContentType.TEXT,
        content,
        layout: options.layout || LayoutHint.FULL_WIDTH,
        emphasis: options.emphasis || Emphasis.SECONDARY,
        visible: options.visible !== false,
        order: options.order || 0,
        metadata: options.metadata || {},
        breakBefore: options.breakBefore || false,
        keepTogether: options.keepTogether || false
    };
}

/**
 * Creates a section block with title and body
 */
function createSectionBlock(title, body, options = {}) {
    return createBlock(BlockType.SECTION, {
        title,
        body,
        icon: options.icon || null,
        anchor: options.anchor !== false
    }, {
        contentType: ContentType.TEXT,
        ...options,
        emphasis: options.emphasis || Emphasis.SECONDARY
    });
}

/**
 * Creates a grid item for scope/deliverables
 */
function createGridItem(content, index) {
    return {
        id: `item_${index}_${Date.now().toString(36)}`,
        index: index + 1,
        content: content.trim(),
        marker: true,
        displayIndex: String(index + 1).padStart(2, '0')
    };
}

/**
 * Creates a timeline phase
 */
function createTimelinePhase(content, index) {
    return {
        id: `phase_${index}_${Date.now().toString(36)}`,
        phase: index + 1,
        label: `Phase ${index + 1}`,
        content: content.trim()
    };
}

// ============================================
// DOCUMENT SCHEMA
// ============================================

/**
 * Document schema version
 */
export const SCHEMA_VERSION = '2.0';

/**
 * Create document metadata
 */
function createDocumentMeta(proposalData, blocks) {
    return {
        clientName: proposalData.clientName || 'Client Name',
        clientCompany: proposalData.clientCompany || '',
        projectTitle: proposalData.projectTitle || 'Untitled Proposal',
        blockCount: blocks.length,
        pageCount: 1, // Calculated by renderer
        wordCount: estimateWordCount(blocks),
        hasTimeline: blocks.some(b => b.type === BlockType.TIMELINE),
        hasPricing: blocks.some(b => b.type === BlockType.INVESTMENT)
    };
}

function estimateWordCount(blocks) {
    let count = 0;
    blocks.forEach(block => {
        if (block.content) {
            const text = JSON.stringify(block.content);
            count += text.split(/\s+/).length;
        }
    });
    return count;
}

/**
 * Create document layout configuration
 */
function createDocumentLayout() {
    return {
        format: 'A4',
        orientation: 'portrait',
        width: 794,      // A4 at 96 DPI
        height: 1123,    // A4 at 96 DPI
        margins: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        },
        dpi: 96,
        scaleFactor: 1
    };
}

// ============================================
// COMPOSITION ENGINE
// ============================================

/**
 * Main composition function - transforms proposal data into document model
 * @param {Object} proposalData - Raw proposal form data
 * @returns {Object} Structured document model
 */
export function composeDocument(proposalData) {
    // Reset block counter for consistent IDs
    blockCounter = 0;

    const {
        clientName,
        clientCompany,
        projectTitle,
        problemStatement,
        proposedSolution,
        scopeOfWork,
        timeline,
        pricing,
        terms,
        contactInfo
    } = proposalData;

    const blocks = [];
    let order = 0;

    // ----------------------------------------
    // HEADER BLOCK
    // ----------------------------------------
    blocks.push(createBlock(BlockType.HEADER, {
        brand: 'pitchPDF',
        title: projectTitle || 'Project Proposal',
        subtitle: 'Professional Services Proposal',
        badge: 'PROPOSAL',
        date: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }, {
        order: order++,
        emphasis: Emphasis.HERO,
        layout: LayoutHint.FULL_WIDTH,
        contentType: ContentType.BRANDING,
        keepTogether: true
    }));

    // ----------------------------------------
    // CLIENT BLOCK
    // ----------------------------------------
    blocks.push(createBlock(BlockType.CLIENT, {
        label: 'Prepared For',
        name: clientName || 'Client Name',
        company: clientCompany || 'Company Name'
    }, {
        order: order++,
        emphasis: Emphasis.PRIMARY,
        layout: LayoutHint.PADDED,
        contentType: ContentType.CONTACT,
        keepTogether: true
    }));

    // ----------------------------------------
    // TWO-COLUMN: Challenge + Solution
    // ----------------------------------------
    if (problemStatement || proposedSolution) {
        const columns = [];

        if (problemStatement) {
            columns.push({
                id: 'challenge_col',
                title: 'The Challenge',
                body: problemStatement,
                icon: 'challenge'
            });
        }

        if (proposedSolution) {
            columns.push({
                id: 'solution_col',
                title: 'Our Solution',
                body: proposedSolution,
                icon: 'solution'
            });
        }

        blocks.push(createBlock(BlockType.TWO_COLUMN, {
            columns,
            columnCount: columns.length
        }, {
            order: order++,
            emphasis: Emphasis.SECONDARY,
            layout: LayoutHint.FULL_WIDTH,
            contentType: ContentType.TEXT
        }));
    }

    // ----------------------------------------
    // SCOPE GRID
    // ----------------------------------------
    if (scopeOfWork) {
        const items = scopeOfWork
            .split('\n')
            .filter(line => line.trim())
            .map((item, i) => createGridItem(item, i));

        if (items.length > 0) {
            blocks.push(createBlock(BlockType.GRID, {
                title: 'Scope of Work',
                items,
                columns: Math.min(items.length, 2),
                anchor: true
            }, {
                order: order++,
                emphasis: Emphasis.SECONDARY,
                layout: LayoutHint.FULL_WIDTH,
                contentType: ContentType.GRID_ITEMS,
                metadata: { alternateBackground: true }
            }));
        }
    }

    // ----------------------------------------
    // TIMELINE BLOCK
    // ----------------------------------------
    if (timeline) {
        const phases = timeline
            .split('\n')
            .filter(line => line.trim())
            .map((item, i) => createTimelinePhase(item, i));

        if (phases.length > 0) {
            blocks.push(createBlock(BlockType.TIMELINE, {
                title: 'Timeline',
                phases,
                phaseCount: phases.length,
                anchor: true
            }, {
                order: order++,
                emphasis: Emphasis.SECONDARY,
                layout: LayoutHint.FULL_WIDTH,
                contentType: ContentType.TIMELINE_ITEMS
            }));
        }
    }

    // ----------------------------------------
    // INVESTMENT BLOCK
    // ----------------------------------------
    if (pricing) {
        blocks.push(createBlock(BlockType.INVESTMENT, {
            label: 'Total Investment',
            amount: pricing
        }, {
            order: order++,
            emphasis: Emphasis.PRIMARY,
            layout: LayoutHint.CENTERED,
            contentType: ContentType.PRICING,
            keepTogether: true
        }));
    }

    // ----------------------------------------
    // TERMS SECTION
    // ----------------------------------------
    if (terms) {
        blocks.push(createSectionBlock('Terms & Conditions', terms, {
            order: order++,
            emphasis: Emphasis.TERTIARY,
            contentType: ContentType.TEXT,
            metadata: { alternateBackground: true }
        }));
    }

    // ----------------------------------------
    // FOOTER BLOCK
    // ----------------------------------------
    blocks.push(createBlock(BlockType.FOOTER, {
        preparedBy: {
            label: 'Prepared By',
            contact: contactInfo || 'Your Name\nCompany\ncontact@email.com'
        },
        signature: {
            label: 'Authorized Signature',
            line: true
        },
        branding: {
            mark: 'p',
            text: 'pitchPDF Premium Document'
        }
    }, {
        order: order++,
        emphasis: Emphasis.MUTED,
        layout: LayoutHint.FULL_WIDTH,
        contentType: ContentType.CONTACT,
        keepTogether: true
    }));

    // ----------------------------------------
    // APPLY ALL RULES
    // ----------------------------------------
    const processedBlocks = blocks
        .map(applyLayoutRules)
        .map((block, i, arr) => applyFlowRules([block])[0]);

    const groupedBlocks = applyGroupingRules(processedBlocks);
    const hierarchy = buildHierarchy(groupedBlocks);

    // ----------------------------------------
    // COMPOSE DOCUMENT MODEL
    // ----------------------------------------
    return {
        version: SCHEMA_VERSION,
        type: 'proposal',
        createdAt: new Date().toISOString(),
        meta: createDocumentMeta(proposalData, groupedBlocks),
        layout: createDocumentLayout(),
        blocks: groupedBlocks,
        hierarchy,
        flowRules: {
            pageBreakHints: extractPageBreakHints(groupedBlocks),
            keepTogetherGroups: extractKeepTogetherGroups(groupedBlocks)
        }
    };
}

/**
 * Extract page break hints from blocks
 */
function extractPageBreakHints(blocks) {
    return blocks
        .filter(b => b.breakBefore || b.flow?.hint === FlowHint.BREAK_BEFORE)
        .map(b => ({ blockId: b.id, type: 'before' }));
}

/**
 * Extract keep-together groups
 */
function extractKeepTogetherGroups(blocks) {
    const groups = [];
    let currentGroup = [];

    blocks.forEach((block, index) => {
        if (block.keepTogether || block.grouping?.keepTogether) {
            currentGroup.push(block.id);
        } else if (currentGroup.length > 0) {
            groups.push([...currentGroup]);
            currentGroup = [];
        }
    });

    if (currentGroup.length > 0) {
        groups.push(currentGroup);
    }

    return groups;
}

/**
 * Create a layout-ready representation for rendering
 */
export function createLayoutReadyRepresentation(document) {
    return {
        version: document.version,
        format: document.layout.format,
        dimensions: {
            width: document.layout.width,
            height: document.layout.height
        },
        regions: {
            header: document.hierarchy[DocumentRegion.HEADER].map(blockToRenderNode),
            body: document.hierarchy[DocumentRegion.BODY].map(blockToRenderNode),
            highlight: document.hierarchy[DocumentRegion.HIGHLIGHT].map(blockToRenderNode),
            footer: document.hierarchy[DocumentRegion.FOOTER].map(blockToRenderNode)
        },
        flowHints: document.flowRules,
        meta: document.meta
    };
}

function blockToRenderNode(block) {
    return {
        id: block.id,
        type: block.type,
        content: block.content,
        layout: block.layoutRules,
        emphasis: block.emphasis,
        visible: block.visible
    };
}

// ============================================
// VALIDATION
// ============================================

/**
 * Validates a document model structure
 */
export function validateDocument(doc) {
    const errors = [];
    const warnings = [];

    // Required fields
    if (!doc.version) errors.push('Missing version');
    if (!doc.blocks || !Array.isArray(doc.blocks)) errors.push('Missing blocks array');
    if (!doc.hierarchy) errors.push('Missing hierarchy');
    if (!doc.layout) errors.push('Missing layout configuration');
    if (!doc.meta) errors.push('Missing document metadata');

    // Block validation
    const hasHeader = doc.blocks?.some(b => b.type === BlockType.HEADER);
    const hasFooter = doc.blocks?.some(b => b.type === BlockType.FOOTER);

    if (!hasHeader) errors.push('Missing header block');
    if (!hasFooter) errors.push('Missing footer block');

    // Block structure validation
    doc.blocks?.forEach((block, index) => {
        if (!block.id) errors.push(`Block at index ${index} missing id`);
        if (!block.type) errors.push(`Block at index ${index} missing type`);
        if (block.content === undefined) warnings.push(`Block ${block.id} has no content`);
    });

    // Version check
    if (doc.version && doc.version !== SCHEMA_VERSION) {
        warnings.push(`Document version ${doc.version} differs from current schema ${SCHEMA_VERSION}`);
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

// ============================================
// SERIALIZATION
// ============================================

/**
 * Serializes document model to JSON
 */
export function serializeDocument(doc) {
    return JSON.stringify(doc, null, 2);
}

/**
 * Deserializes JSON to document model
 */
export function deserializeDocument(json) {
    const doc = typeof json === 'string' ? JSON.parse(json) : json;
    return doc;
}

// ============================================
// EXPORTS
// ============================================

export default {
    // Core functions
    composeDocument,
    validateDocument,
    serializeDocument,
    deserializeDocument,
    createLayoutReadyRepresentation,

    // Rule application
    applyLayoutRules,
    applyGroupingRules,
    applyFlowRules,
    buildHierarchy,

    // Types and constants
    BlockType,
    ContentType,
    LayoutHint,
    LayoutRules,
    GroupType,
    GroupingRules,
    DocumentRegion,
    HierarchyLevel,
    HierarchyRules,
    FlowHint,
    FlowRules,
    Emphasis,
    SCHEMA_VERSION
};
