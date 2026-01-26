/**
 * Pagination Engine Tests
 * Run with: node lib/pagination-engine.test.js
 */

import {
    PAGE_HEIGHT,
    PAGE_WIDTH,
    NO_SPLIT_BLOCKS,
    createPage,
    addBlockToPage,
    canSplitBlock,
    canBreakBefore,
    blockFitsOnPage,
    paginateDocument,
    paginateByGroups,
    createMultiPageLayout,
    getPageForBlock
} from './pagination-engine.js';

import { composeDocument, BlockType } from './document-engine.js';
import { applyFlow } from './flow-engine.js';

// Test utilities
let testCount = 0;
let passCount = 0;

function test(name, fn) {
    testCount++;
    try {
        fn();
        passCount++;
        console.log(`✓ ${name}`);
    } catch (error) {
        console.log(`✗ ${name}`);
        console.log(`  Error: ${error.message}`);
    }
}

function assertEqual(actual, expected, message = '') {
    if (actual !== expected) {
        throw new Error(`${message} Expected ${expected}, got ${actual}`);
    }
}

function assertTrue(value, message = '') {
    if (!value) {
        throw new Error(`${message} Expected truthy value, got ${value}`);
    }
}

function assertFalse(value, message = '') {
    if (value) {
        throw new Error(`${message} Expected falsy value, got ${value}`);
    }
}

// ============================================
// TEST CASES
// ============================================

console.log('\n📄 Pagination Engine Tests\n');
console.log('='.repeat(50));

// Test 1: Page constants
test('Page constants are defined correctly', () => {
    assertEqual(PAGE_WIDTH, 794, 'Page width should be 794');
    assertEqual(PAGE_HEIGHT, 1123, 'Page height should be 1123');
    assertTrue(NO_SPLIT_BLOCKS.length > 0, 'Should have no-split blocks');
});

// Test 2: Create page
test('createPage creates valid page structure', () => {
    const page = createPage(1);

    assertEqual(page.number, 1, 'Page number should be 1');
    assertEqual(page.width, PAGE_WIDTH, 'Width should match');
    assertEqual(page.height, PAGE_HEIGHT, 'Height should match');
    assertTrue(Array.isArray(page.blocks), 'Blocks should be array');
    assertEqual(page.usedHeight, 0, 'Used height should start at 0');
    assertTrue(page.isFirst, 'First page should be marked');
});

// Test 3: Add block to page
test('addBlockToPage updates page correctly', () => {
    let page = createPage(1);
    const block = { id: 'test', type: BlockType.SECTION };

    page = addBlockToPage(page, block, 200);

    assertEqual(page.blocks.length, 1, 'Should have 1 block');
    assertEqual(page.usedHeight, 200, 'Used height should be 200');
    assertEqual(page.availableHeight, PAGE_HEIGHT - 200, 'Available should decrease');
    assertEqual(page.blocks[0].pageNumber, 1, 'Block should have page number');
});

// Test 4: Block split rules
test('canSplitBlock respects no-split rules', () => {
    assertFalse(canSplitBlock({ type: BlockType.HEADER }), 'Cannot split HEADER');
    assertFalse(canSplitBlock({ type: BlockType.INVESTMENT }), 'Cannot split INVESTMENT');
    assertFalse(canSplitBlock({ type: BlockType.TIMELINE }), 'Cannot split TIMELINE');
    assertFalse(canSplitBlock({ type: BlockType.FOOTER }), 'Cannot split FOOTER');
});

// Test 5: Break before rules
test('canBreakBefore respects constraints', () => {
    const header = { type: BlockType.HEADER };
    const client = { type: BlockType.CLIENT };
    const section = { type: BlockType.SECTION };

    assertFalse(canBreakBefore(client, header), 'Cannot break before CLIENT after HEADER');
    assertTrue(canBreakBefore(section, client), 'Can break before SECTION after CLIENT');
    assertFalse(canBreakBefore(header, null), 'Cannot break before first block');
});

// Test 6: Block fits check
test('blockFitsOnPage correctly determines fit', () => {
    assertTrue(blockFitsOnPage(100, 200), '100 fits in 200');
    assertTrue(blockFitsOnPage(200, 200), '200 fits in 200 (exact)');
    assertFalse(blockFitsOnPage(300, 200), '300 does not fit in 200');
});

// Test 7: Single page pagination
test('paginateDocument creates single page for small doc', () => {
    const doc = composeDocument({ clientName: 'Test' });
    const flowDoc = applyFlow(doc);
    const result = paginateDocument(flowDoc);

    assertTrue(result.isSinglePage, 'Should be single page');
    assertEqual(result.pageCount, 1, 'Should have 1 page');
    assertTrue(result.pages[0].isFirst, 'Should be first page');
    assertTrue(result.pages[0].isLast, 'Should be last page');
});

// Test 8: Paginate by groups
test('paginateByGroups respects group integrity', () => {
    const doc = composeDocument({ clientName: 'Test', pricing: '$5000' });
    const flowDoc = applyFlow(doc);
    const result = paginateByGroups(flowDoc);

    assertTrue(result.pages.length >= 1, 'Should have at least 1 page');
    assertTrue(result.groups > 0, 'Should track groups');
});

// Test 9: Multi-page layout model
test('createMultiPageLayout produces complete model', () => {
    const doc = composeDocument({ clientName: 'Test', scopeOfWork: 'Item 1' });
    const flowDoc = applyFlow(doc);
    const layout = createMultiPageLayout(flowDoc);

    assertTrue(layout.version, 'Should have version');
    assertTrue(layout.pageCount >= 1, 'Should have page count');
    assertTrue(layout.pageSize, 'Should have page size');
    assertTrue(layout.pages.length >= 1, 'Should have pages');

    layout.pages.forEach(page => {
        assertTrue(page.number, 'Page should have number');
        assertTrue(page.dimensions, 'Page should have dimensions');
        assertTrue(Array.isArray(page.blocks), 'Page should have blocks');
    });
});

// Test 10: Get page for block
test('getPageForBlock finds correct page', () => {
    const doc = composeDocument({ clientName: 'Test' });
    const flowDoc = applyFlow(doc);
    const layout = createMultiPageLayout(flowDoc);

    const firstBlockId = layout.pages[0].blocks[0]?.id;
    if (firstBlockId) {
        const pageNum = getPageForBlock(layout, firstBlockId);
        assertEqual(pageNum, 1, 'First block should be on page 1');
    }

    const notFound = getPageForBlock(layout, 'nonexistent');
    assertEqual(notFound, null, 'Should return null for missing block');
});

// Test 11: All blocks have positions
test('Paginated blocks have page positions', () => {
    const doc = composeDocument({
        clientName: 'Test',
        scopeOfWork: 'A\nB\nC',
        pricing: '$1000'
    });
    const flowDoc = applyFlow(doc);
    const result = paginateDocument(flowDoc);

    result.pages.forEach(page => {
        page.blocks.forEach(block => {
            assertTrue(block.pageNumber !== undefined, 'Block should have pageNumber');
            assertTrue(block.pageY !== undefined, 'Block should have pageY');
        });
    });
});

// Test 12: No blocks split internally
test('No blocks are split between pages', () => {
    const doc = composeDocument({
        clientName: 'Test',
        problemStatement: 'Problem',
        proposedSolution: 'Solution',
        scopeOfWork: 'Item 1\nItem 2',
        timeline: 'Phase 1\nPhase 2',
        pricing: '$5000',
        terms: 'Terms here'
    });
    const flowDoc = applyFlow(doc);
    const layout = createMultiPageLayout(flowDoc);

    // Each block ID should appear only once across all pages
    const allBlockIds = [];
    layout.pages.forEach(page => {
        page.blocks.forEach(block => {
            assertFalse(allBlockIds.includes(block.id), 'Block should not be duplicated');
            allBlockIds.push(block.id);
        });
    });
});

// ============================================
// SUMMARY
// ============================================

console.log('\n' + '='.repeat(50));
console.log(`\nTests: ${passCount}/${testCount} passed`);

if (passCount === testCount) {
    console.log('✅ All tests passed!\n');
    process.exit(0);
} else {
    console.log(`❌ ${testCount - passCount} tests failed\n`);
    process.exit(1);
}
