/**
 * Document Engine Tests
 * Run with: node lib/document-engine.test.js
 */

import {
    composeDocument,
    validateDocument,
    serializeDocument,
    deserializeDocument,
    createLayoutReadyRepresentation,
    BlockType,
    LayoutHint,
    Emphasis,
    SCHEMA_VERSION
} from './document-engine.js';

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

console.log('\n📄 Document Composition Engine Tests\n');
console.log('='.repeat(50));

// Test 1: Empty proposal creates valid document
test('Empty proposal creates valid document with defaults', () => {
    const doc = composeDocument({});
    const validation = validateDocument(doc);

    assertTrue(validation.valid, 'Document should be valid');
    assertEqual(doc.version, SCHEMA_VERSION, 'Version mismatch');
    assertEqual(doc.type, 'proposal', 'Type should be proposal');
    assertTrue(doc.blocks.length >= 2, 'Should have at least header and footer');
});

// Test 2: Full proposal creates all blocks
test('Full proposal creates all expected blocks', () => {
    const fullProposal = {
        clientName: 'John Doe',
        clientCompany: 'Acme Corp',
        projectTitle: 'Website Redesign',
        problemStatement: 'Current website is outdated',
        proposedSolution: 'Modern responsive design',
        scopeOfWork: 'Design\nDevelopment\nTesting',
        timeline: 'Week 1\nWeek 2\nWeek 3',
        pricing: '$10,000',
        terms: 'Payment on completion',
        contactInfo: 'contact@example.com'
    };

    const doc = composeDocument(fullProposal);
    const validation = validateDocument(doc);

    assertTrue(validation.valid, 'Full proposal should be valid');

    // Check all block types are present
    const blockTypes = doc.blocks.map(b => b.type);
    assertTrue(blockTypes.includes(BlockType.HEADER), 'Missing HEADER');
    assertTrue(blockTypes.includes(BlockType.CLIENT), 'Missing CLIENT');
    assertTrue(blockTypes.includes(BlockType.TWO_COLUMN), 'Missing TWO_COLUMN');
    assertTrue(blockTypes.includes(BlockType.GRID), 'Missing GRID');
    assertTrue(blockTypes.includes(BlockType.TIMELINE), 'Missing TIMELINE');
    assertTrue(blockTypes.includes(BlockType.INVESTMENT), 'Missing INVESTMENT');
    assertTrue(blockTypes.includes(BlockType.SECTION), 'Missing SECTION (terms)');
    assertTrue(blockTypes.includes(BlockType.FOOTER), 'Missing FOOTER');
});

// Test 3: Partial data creates conditional blocks only
test('Partial data omits empty blocks', () => {
    const partialProposal = {
        clientName: 'Jane Smith',
        projectTitle: 'Quick Project'
        // No scope, timeline, pricing, terms
    };

    const doc = composeDocument(partialProposal);
    const blockTypes = doc.blocks.map(b => b.type);

    assertTrue(blockTypes.includes(BlockType.HEADER), 'Should have HEADER');
    assertTrue(blockTypes.includes(BlockType.CLIENT), 'Should have CLIENT');
    assertTrue(blockTypes.includes(BlockType.FOOTER), 'Should have FOOTER');
    assertFalse(blockTypes.includes(BlockType.GRID), 'Should NOT have GRID');
    assertFalse(blockTypes.includes(BlockType.TIMELINE), 'Should NOT have TIMELINE');
    assertFalse(blockTypes.includes(BlockType.INVESTMENT), 'Should NOT have INVESTMENT');
});

// Test 4: Schema validation works
test('Schema validation catches missing required elements', () => {
    const invalidDoc = {
        type: 'proposal',
        blocks: []
        // Missing version, hierarchy, layout, meta
    };

    const validation = validateDocument(invalidDoc);

    assertFalse(validation.valid, 'Should be invalid');
    assertTrue(validation.errors.length > 0, 'Should have errors');
    assertTrue(validation.errors.includes('Missing version'), 'Should report missing version');
    assertTrue(validation.errors.includes('Missing header block'), 'Should report missing header');
    assertTrue(validation.errors.includes('Missing footer block'), 'Should report missing footer');
});

// Test 5: Hierarchy is correctly organized
test('Hierarchy correctly organizes blocks by region', () => {
    const doc = composeDocument({
        clientName: 'Test',
        pricing: '$1000'
    });

    assertTrue(doc.hierarchy.header.length > 0, 'Header region should have blocks');
    assertTrue(doc.hierarchy.footer.length > 0, 'Footer region should have blocks');
    assertTrue(doc.hierarchy.highlight.length > 0, 'Highlight region should have investment');
});

// Test 6: Layout rules are applied
test('Layout rules are applied to blocks', () => {
    const doc = composeDocument({ clientName: 'Test' });

    const headerBlock = doc.blocks.find(b => b.type === BlockType.HEADER);
    assertTrue(headerBlock.layoutRules, 'Header should have layoutRules');
    assertTrue(headerBlock.layoutRules.computedWidth, 'Should have computedWidth');
    assertTrue(headerBlock.layoutRules.computedPadding, 'Should have computedPadding');
});

// Test 7: Flow rules are applied
test('Flow rules are applied to blocks', () => {
    const doc = composeDocument({ clientName: 'Test' });

    const footerBlock = doc.blocks.find(b => b.type === BlockType.FOOTER);
    assertTrue(footerBlock.flow, 'Footer should have flow rules');
    assertTrue(footerBlock.flow.anchorToBottom, 'Footer should anchor to bottom');
});

// Test 8: Grouping rules are applied
test('Grouping rules are applied to blocks', () => {
    const doc = composeDocument({ clientName: 'Test' });

    doc.blocks.forEach(block => {
        assertTrue(block.grouping, `Block ${block.type} should have grouping`);
        assertTrue(block.grouping.group, `Block ${block.type} should have group assignment`);
    });
});

// Test 9: Serialization roundtrip
test('Serialization and deserialization roundtrip works', () => {
    const doc = composeDocument({ clientName: 'Roundtrip Test' });
    const json = serializeDocument(doc);
    const restored = deserializeDocument(json);

    assertEqual(restored.version, doc.version, 'Version should match');
    assertEqual(restored.blocks.length, doc.blocks.length, 'Block count should match');
    assertEqual(restored.meta.clientName, doc.meta.clientName, 'Meta should match');
});

// Test 10: Layout-ready representation
test('Layout-ready representation is created correctly', () => {
    const doc = composeDocument({
        clientName: 'Layout Test',
        scopeOfWork: 'Item 1\nItem 2'
    });

    const layoutReady = createLayoutReadyRepresentation(doc);

    assertTrue(layoutReady.version, 'Should have version');
    assertTrue(layoutReady.format, 'Should have format');
    assertTrue(layoutReady.dimensions, 'Should have dimensions');
    assertTrue(layoutReady.regions, 'Should have regions');
    assertTrue(layoutReady.regions.header, 'Should have header region');
    assertTrue(layoutReady.regions.body, 'Should have body region');
    assertTrue(layoutReady.regions.footer, 'Should have footer region');
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
