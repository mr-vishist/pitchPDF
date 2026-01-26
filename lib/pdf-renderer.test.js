/**
 * PDF Renderer Tests
 * Run with: node lib/pdf-renderer.test.js
 */

import {
    renderDocument,
    renderPage,
    renderBlock,
    combineStyles,
    generateHtmlDocument
} from './pdf-renderer.js';

import { composeDocument, BlockType } from './document-engine.js';
import { applyFlow } from './flow-engine.js';
import { createMultiPageLayout } from './pagination-engine.js';

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

console.log('\n🎨 PDF Renderer Tests\n');
console.log('='.repeat(50));

// Test 1: Render document pipeline
test('renderDocument produces complete output', () => {
    const result = renderDocument({ clientName: 'Test Client' });

    assertTrue(result.version, 'Should have version');
    assertTrue(result.meta, 'Should have meta');
    assertTrue(result.pageSize, 'Should have pageSize');
    assertTrue(result.pages, 'Should have pages');
    assertTrue(result.styles, 'Should have styles');
});

// Test 2: Meta data
test('renderDocument captures meta data', () => {
    const result = renderDocument({
        clientName: 'Acme Corp',
        projectTitle: 'Website Redesign'
    });

    assertEqual(result.meta.clientName, 'Acme Corp', 'Client name should match');
    assertEqual(result.meta.projectTitle, 'Website Redesign', 'Project title should match');
    assertTrue(result.meta.pageCount >= 1, 'Should have page count');
    assertTrue(result.meta.generatedAt, 'Should have timestamp');
});

// Test 3: Page structure
test('renderDocument produces valid page structure', () => {
    const result = renderDocument({ clientName: 'Test' });

    result.pages.forEach(page => {
        assertTrue(page.number, 'Page should have number');
        assertTrue(page.dimensions, 'Page should have dimensions');
        assertTrue(Array.isArray(page.blocks), 'Page should have blocks array');
    });
});

// Test 4: Block rendering
test('renderBlock produces html and styles', () => {
    const document = composeDocument({ clientName: 'Test' });
    const headerBlock = document.blocks.find(b => b.type === BlockType.HEADER);

    const rendered = renderBlock(headerBlock);

    assertTrue(rendered.id, 'Should have id');
    assertTrue(rendered.type, 'Should have type');
    assertTrue(rendered.html, 'Should have html');
    assertTrue(rendered.styles, 'Should have styles');
});

// Test 5: All block types render
test('All block types can be rendered', () => {
    const document = composeDocument({
        clientName: 'Test',
        problemStatement: 'Problem',
        proposedSolution: 'Solution',
        scopeOfWork: 'Item 1\nItem 2',
        timeline: 'Phase 1\nPhase 2',
        pricing: '$5000',
        terms: 'Terms here'
    });

    document.blocks.forEach(block => {
        const rendered = renderBlock(block);
        assertTrue(rendered.html, `${block.type} should produce html`);
    });
});

// Test 6: Header renders with content
test('Header block renders with correct content', () => {
    const document = composeDocument({ projectTitle: 'My Project' });
    const headerBlock = document.blocks.find(b => b.type === BlockType.HEADER);
    const rendered = renderBlock(headerBlock);

    assertTrue(rendered.html.includes('My Project'), 'Should include project title');
    assertTrue(rendered.html.includes('PROPOSAL'), 'Should include badge');
});

// Test 7: Investment block renders
test('Investment block renders amount', () => {
    const document = composeDocument({ pricing: '$10,000' });
    const investmentBlock = document.blocks.find(b => b.type === BlockType.INVESTMENT);
    const rendered = renderBlock(investmentBlock);

    assertTrue(rendered.html.includes('$10,000'), 'Should include pricing');
    assertTrue(rendered.html.includes('Total Investment'), 'Should include label');
});

// Test 8: Combine styles
test('combineStyles aggregates all styles', () => {
    const result = renderDocument({ clientName: 'Test' });
    const combined = combineStyles(result);

    assertTrue(combined.length > 0, 'Should have combined styles');
    assertTrue(combined.includes('block-header'), 'Should include header styles');
});

// Test 9: Generate HTML document
test('generateHtmlDocument produces valid HTML', () => {
    const result = renderDocument({
        clientName: 'Test',
        projectTitle: 'Test Project'
    });
    const html = generateHtmlDocument(result);

    assertTrue(html.includes('<!DOCTYPE html>'), 'Should have doctype');
    assertTrue(html.includes('<html>'), 'Should have html tag');
    assertTrue(html.includes('<head>'), 'Should have head');
    assertTrue(html.includes('<body>'), 'Should have body');
    assertTrue(html.includes('<style>'), 'Should have styles');
    assertTrue(html.includes('Test Project'), 'Should include title');
});

// Test 10: Page size is correct
test('Page size matches A4 dimensions', () => {
    const result = renderDocument({ clientName: 'Test' });

    assertEqual(result.pageSize.width, 794, 'Width should be 794');
    assertEqual(result.pageSize.height, 1123, 'Height should be 1123');
    assertEqual(result.pageSize.format, 'A4', 'Format should be A4');
});

// Test 11: Escapes HTML
test('Content is properly escaped', () => {
    const result = renderDocument({
        clientName: '<script>alert("xss")</script>'
    });
    const html = generateHtmlDocument(result);

    assertTrue(!html.includes('<script>alert'), 'Should escape script tags');
    assertTrue(html.includes('&lt;script&gt;'), 'Should show escaped version');
});

// Test 12: Full pipeline integration
test('Full pipeline produces multi-page ready output', () => {
    const result = renderDocument({
        clientName: 'Enterprise Client',
        clientCompany: 'Big Corp',
        projectTitle: 'Digital Transformation',
        problemStatement: 'Legacy systems are outdated',
        proposedSolution: 'Modern cloud architecture',
        scopeOfWork: 'Analysis\nDesign\nImplementation\nTesting\nDeployment',
        timeline: 'Q1 Discovery\nQ2 Development\nQ3 Testing\nQ4 Launch',
        pricing: '$250,000',
        terms: 'Net 30 payment terms',
        contactInfo: 'John Doe\nConsulting Inc\njohn@example.com'
    });

    assertTrue(result.pages.length >= 1, 'Should have pages');
    assertTrue(result.meta.pageCount >= 1, 'Should track page count');

    // Verify all blocks are accounted for
    let totalBlocks = 0;
    result.pages.forEach(page => {
        totalBlocks += page.blocks.length;
    });
    assertTrue(totalBlocks > 0, 'Should have rendered blocks');
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
