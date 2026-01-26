/**
 * Flow Engine Tests
 * Run with: node lib/flow-engine.test.js
 */

import {
    PAGE_HEIGHT,
    FlowConstraint,
    FlowGroupType,
    calculateBlockHeight,
    createFlowGroups,
    stackBlocks,
    getTotalStackHeight,
    checkOverflow,
    findBreakPoint,
    getFlowConstraints,
    canBreakBefore,
    applyFlow,
    createFlowReadyRepresentation
} from './flow-engine.js';

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

function assertFalse(value, message = '') {
    if (value) {
        throw new Error(`${message} Expected falsy value, got ${value}`);
    }
}

// ============================================
// TEST CASES
// ============================================

console.log('\n🌊 Flow Engine Tests\n');
console.log('='.repeat(50));

// Test 1: Height calculation
test('calculateBlockHeight returns positive values', () => {
    const block = { type: BlockType.HEADER };
    const height = calculateBlockHeight(block);
    assertTrue(height > 0, 'Height should be positive');
    assertTrue(height >= 200, 'Header should be at least 200px');
});

// Test 2: Height varies by block type
test('Different block types have different heights', () => {
    const headerHeight = calculateBlockHeight({ type: BlockType.HEADER });
    const clientHeight = calculateBlockHeight({ type: BlockType.CLIENT });
    const footerHeight = calculateBlockHeight({ type: BlockType.FOOTER });

    assertTrue(headerHeight !== clientHeight, 'Header and Client should differ');
    assertTrue(headerHeight > clientHeight, 'Header should be taller than Client');
});

// Test 3: Block stacking
test('stackBlocks assigns y positions', () => {
    const blocks = [
        { type: BlockType.HEADER, flowHeight: 280 },
        { type: BlockType.CLIENT, flowHeight: 100 },
        { type: BlockType.FOOTER, flowHeight: 180 }
    ];

    const stacked = stackBlocks(blocks, 0);

    assertEqual(stacked[0].flowPosition.y, 0, 'First block at y=0');
    assertEqual(stacked[1].flowPosition.y, 280, 'Second block at y=280');
    assertEqual(stacked[2].flowPosition.y, 380, 'Third block at y=380');
});

// Test 4: Total stack height
test('getTotalStackHeight sums correctly', () => {
    const blocks = [
        { flowHeight: 100 },
        { flowHeight: 200 },
        { flowHeight: 150 }
    ];

    const total = getTotalStackHeight(blocks);
    assertEqual(total, 450, 'Total should be 450');
});

// Test 5: Flow groups creation
test('createFlowGroups creates appropriate groups', () => {
    const document = composeDocument({
        clientName: 'Test',
        pricing: '$5000'
    });

    // Add flow heights
    const blocksWithHeight = document.blocks.map(b => ({
        ...b,
        flowHeight: calculateBlockHeight(b)
    }));

    const groups = createFlowGroups(blocksWithHeight);

    assertTrue(groups.length > 0, 'Should create groups');

    // Check for header group
    const headerGroup = groups.find(g => g.type === FlowGroupType.HEADER_GROUP);
    assertTrue(headerGroup, 'Should have header group');

    // Check for footer group
    const footerGroup = groups.find(g => g.type === FlowGroupType.FOOTER_GROUP);
    assertTrue(footerGroup, 'Should have footer group');
});

// Test 6: Overflow detection
test('checkOverflow detects when block exceeds space', () => {
    assertTrue(checkOverflow(500, 400), 'Should detect overflow');
    assertFalse(checkOverflow(300, 400), 'Should not overflow');
    assertFalse(checkOverflow(400, 400), 'Exact fit should not overflow');
});

// Test 7: Flow constraints
test('getFlowConstraints returns correct constraints', () => {
    const headerConstraints = getFlowConstraints({ type: BlockType.HEADER });
    assertTrue(headerConstraints.keepTogether, 'Header should keepTogether');

    const footerConstraints = getFlowConstraints({ type: BlockType.FOOTER });
    assertTrue(footerConstraints.anchorBottom, 'Footer should anchorBottom');

    const clientConstraints = getFlowConstraints({ type: BlockType.CLIENT });
    assertTrue(clientConstraints.keepWithPrevious, 'Client should keepWithPrevious');
});

// Test 8: Break permission
test('canBreakBefore respects constraints', () => {
    const header = { type: BlockType.HEADER };
    const client = { type: BlockType.CLIENT };
    const section = { type: BlockType.SECTION };

    assertFalse(canBreakBefore(client, header), 'Cannot break before Client after Header');
    assertTrue(canBreakBefore(section, client), 'Can break before Section');
});

// Test 9: Find break point
test('findBreakPoint finds valid break location', () => {
    const blocks = [
        { type: BlockType.SECTION, flowHeight: 100 },
        { type: BlockType.SECTION, flowHeight: 100 },
        { type: BlockType.SECTION, flowHeight: 100 }
    ];

    const result = findBreakPoint(blocks, 250);
    assertEqual(result.breakIndex, 1, 'Should break after second block');
    assertEqual(result.fitsCount, 2, 'Two blocks should fit');
});

// Test 10: Apply flow to document
test('applyFlow adds flow metadata to document', () => {
    const document = composeDocument({
        clientName: 'Test',
        scopeOfWork: 'Item 1\nItem 2',
        pricing: '$5000'
    });

    const flowDoc = applyFlow(document);

    assertTrue(flowDoc.flowMeta, 'Should have flowMeta');
    assertTrue(flowDoc.flowMeta.totalHeight > 0, 'Should have positive totalHeight');
    assertTrue(flowDoc.flowMeta.pageCount >= 1, 'Should have at least 1 page');
    assertTrue(flowDoc.flowMeta.groups, 'Should have groups');

    // Check blocks have flow positions
    flowDoc.blocks.forEach(block => {
        assertTrue(block.flowPosition, `Block ${block.type} should have flowPosition`);
        assertTrue(block.flowHeight >= 0, 'Should have flowHeight');
    });
});

// Test 11: Flow ready representation
test('createFlowReadyRepresentation produces clean output', () => {
    const document = composeDocument({ clientName: 'Test' });
    const flowReady = createFlowReadyRepresentation(document);

    assertTrue(flowReady.blocks, 'Should have blocks');
    assertTrue(flowReady.groups, 'Should have groups');
    assertTrue(flowReady.meta, 'Should have meta');
    assertTrue(flowReady.meta.totalHeight > 0, 'Should have totalHeight');
});

// Test 12: Groups preserve integrity
test('Flow groups preserve block integrity', () => {
    const document = composeDocument({
        clientName: 'Test',
        pricing: '$10000'
    });

    const flowDoc = applyFlow(document);

    flowDoc.flowMeta.groups.forEach(group => {
        assertTrue(group.blockCount > 0, 'Groups should have blocks');
        assertTrue(group.totalHeight >= 0, 'Groups should have height');

        if (group.type === FlowGroupType.HEADER_GROUP) {
            assertTrue(group.keepTogether, 'Header group should keepTogether');
        }

        if (group.type === FlowGroupType.FOOTER_GROUP) {
            assertTrue(group.anchorBottom, 'Footer group should anchor bottom');
        }
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
