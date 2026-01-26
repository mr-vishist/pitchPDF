/**
 * Layout Engine Tests
 * Run with: node lib/layout-engine.test.js
 */

import {
    SpacingScale,
    getSpacing,
    getGap,
    TypographyScale,
    getTypography,
    PageDimensions,
    HorizontalAlign,
    VerticalAlign,
    getAlignmentStyles,
    Colors,
    getContainerStyle,
    calculateMargins,
    calculateSectionLayout,
    calculateBlockLayout,
    calculateColumnLayout,
    calculateTwoColumnLayout,
    createLayoutContext,
    applyLayout
} from './layout-engine.js';

import { composeDocument, BlockType } from './document-engine.js';

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

// ============================================
// TEST CASES
// ============================================

console.log('\n📐 Layout Engine Tests\n');
console.log('='.repeat(50));

// Test 1: Spacing scale values
test('Spacing scale returns correct pixel values', () => {
    assertEqual(SpacingScale.none, 0, 'none should be 0');
    assertEqual(SpacingScale.xxs, 4, 'xxs should be 4');
    assertEqual(SpacingScale.xs, 8, 'xs should be 8');
    assertEqual(SpacingScale.md, 16, 'md should be 16');
    assertEqual(SpacingScale.lg, 24, 'lg should be 24');
    assertEqual(SpacingScale.xl, 32, 'xl should be 32');
});

// Test 2: getSpacing function
test('getSpacing returns correct values', () => {
    assertEqual(getSpacing('md'), 16, 'md should return 16');
    assertEqual(getSpacing('lg'), 24, 'lg should return 24');
    assertEqual(getSpacing('unknown'), 16, 'unknown should default to md (16)');
});

// Test 3: Typography scale
test('Typography scale returns complete style objects', () => {
    const heroStyle = getTypography('hero');
    assertTrue(heroStyle.fontSize === 42, 'Hero fontSize should be 42');
    assertTrue(heroStyle.fontWeight === 700, 'Hero fontWeight should be 700');
    assertTrue(heroStyle.lineHeight, 'Should have lineHeight');
    assertTrue(heroStyle.fontFamily, 'Should have fontFamily');

    const bodyStyle = getTypography('body');
    assertEqual(bodyStyle.fontSize, 14, 'Body fontSize should be 14');
});

// Test 4: Page dimensions
test('Page dimensions are correct for A4', () => {
    assertEqual(PageDimensions.A4.width, 794, 'A4 width should be 794');
    assertEqual(PageDimensions.A4.height, 1123, 'A4 height should be 1123');
    assertEqual(PageDimensions.A4.dpi, 96, 'DPI should be 96');
});

// Test 5: Alignment styles
test('Alignment styles are generated correctly', () => {
    const centerMiddle = getAlignmentStyles(HorizontalAlign.CENTER, VerticalAlign.MIDDLE);
    assertEqual(centerMiddle.textAlign, 'center', 'Should be center aligned');
    assertEqual(centerMiddle.justifyContent, 'center', 'Should have center justifyContent');
    assertEqual(centerMiddle.alignItems, 'center', 'Should have center alignItems');

    const leftTop = getAlignmentStyles(HorizontalAlign.LEFT, VerticalAlign.TOP);
    assertEqual(leftTop.textAlign, 'left', 'Should be left aligned');
    assertEqual(leftTop.alignItems, 'flex-start', 'Should align to top');
});

// Test 6: Two-column layout
test('Two-column layout splits correctly', () => {
    const containerWidth = 730; // Padded content width
    const gap = 24;
    const layout = calculateTwoColumnLayout(containerWidth, gap);

    assertEqual(layout.columnCount, 2, 'Should have 2 columns');
    assertEqual(layout.gap, gap, 'Gap should match');
    assertEqual(layout.columns.length, 2, 'Should have 2 column objects');

    const expectedColumnWidth = (containerWidth - gap) / 2;
    assertEqual(layout.columnWidth, expectedColumnWidth, 'Column width should be correct');
    assertEqual(layout.columns[0].x, 0, 'First column at x=0');
    assertEqual(layout.columns[1].x, expectedColumnWidth + gap, 'Second column positioned correctly');
});

// Test 7: Column layout with various counts
test('Column layout calculates correctly for multiple columns', () => {
    const containerWidth = 600;
    const gap = 20;

    const threeCol = calculateColumnLayout(3, containerWidth, gap);
    assertEqual(threeCol.columnCount, 3, 'Should have 3 columns');

    const totalGap = gap * 2; // 2 gaps for 3 columns
    const expectedWidth = (containerWidth - totalGap) / 3;
    assertEqual(threeCol.columnWidth, expectedWidth, 'Column widths should be equal');
});

// Test 8: Visual container styles
test('Visual container styles are returned by block type', () => {
    const headerStyle = getContainerStyle(BlockType.HEADER, {});
    assertTrue(headerStyle.background, 'Header should have background');
    assertTrue(headerStyle.padding, 'Header should have padding');

    const investmentStyle = getContainerStyle(BlockType.INVESTMENT, {});
    assertTrue(investmentStyle.background.includes('gradient'), 'Investment should have gradient');
});

// Test 9: Section layout calculator
test('Section layout calculates dimensions correctly', () => {
    const block = {
        type: BlockType.SECTION,
        layout: 'full_width',
        layoutRules: { minHeight: 100 },
        metadata: {}
    };

    const context = { containerWidth: 794 };
    const layout = calculateSectionLayout(block, context);

    assertEqual(layout.width, 794, 'Width should match container');
    assertTrue(layout.padding, 'Should have padding object');
    assertTrue(layout.margin, 'Should have margin object');
    assertTrue(layout.position, 'Should have position object');
});

// Test 10: Full document layout application
test('applyLayout adds computed layout to all blocks', () => {
    const proposal = {
        clientName: 'Test Client',
        projectTitle: 'Test Project',
        scopeOfWork: 'Item 1\nItem 2',
        pricing: '$5000'
    };

    const document = composeDocument(proposal);
    const layoutDocument = applyLayout(document);

    // Check that all blocks have computed layout
    layoutDocument.blocks.forEach(block => {
        assertTrue(block.computedLayout, `Block ${block.type} should have computedLayout`);
        assertTrue(block.computedLayout.width, 'Should have width');
        assertTrue(block.computedLayout.padding, 'Should have padding');
        assertTrue(block.computedLayout.boxModel, 'Should have boxModel');
    });

    // Check layout meta
    assertTrue(layoutDocument.layoutMeta, 'Should have layoutMeta');
    assertTrue(layoutDocument.layoutMeta.totalHeight > 0, 'Total height should be positive');
    assertTrue(layoutDocument.layoutMeta.pageCount >= 1, 'Should have at least 1 page');
});

// Test 11: Layout context creation
test('Layout context initializes correctly', () => {
    const context = createLayoutContext();

    assertEqual(context.pageWidth, 794, 'Default page width should be A4');
    assertEqual(context.pageHeight, 1123, 'Default page height should be A4');
    assertEqual(context.currentY, 0, 'Should start at y=0');
    assertEqual(context.currentPage, 1, 'Should start at page 1');
    assertTrue(Array.isArray(context.layouts), 'layouts should be array');
});

// Test 12: Colors are defined
test('Color palette is complete', () => {
    assertTrue(Colors.primary, 'Should have primary color');
    assertTrue(Colors.background, 'Should have background');
    assertTrue(Colors.textPrimary, 'Should have textPrimary');
    assertTrue(Colors.border, 'Should have border color');
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
