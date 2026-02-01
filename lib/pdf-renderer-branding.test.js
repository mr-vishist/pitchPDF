/**
 * PDF Renderer Branding Tests
 * Verifies that the branding elements (Header Brand and Footer Bottom) are correctly rendered.
 * Run with: node lib/pdf-renderer-branding.test.js
 */

import {
    renderDocument,
    renderBlock,
    generateHtmlDocument
} from './pdf-renderer.js';

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

function assertTrue(value, message = '') {
    if (!value) {
        throw new Error(`${message} Expected truthy value, got ${value}`);
    }
}

// ============================================
// TEST CASES
// ============================================

console.log('\n🎨 PDF Renderer Branding Tests\n');
console.log('='.repeat(50));

// Test 1: Header Brand
test('Header renders with "pitchPDF" brand', () => {
    const document = composeDocument({ projectTitle: 'My Project' });
    const headerBlock = document.blocks.find(b => b.type === BlockType.HEADER);
    const rendered = renderBlock(headerBlock);

    // Check for specific structure
    assertTrue(rendered.html.includes('class="header-brand"'), 'Should include header-brand class');
    assertTrue(rendered.html.includes('class="brand-dot"'), 'Should include brand-dot class');
    assertTrue(rendered.html.includes('class="brand-name"'), 'Should include brand-name class');
    assertTrue(rendered.html.includes('pitchPDF'), 'Should include brand name text "pitchPDF"');
});

// Test 2: Footer Bottom Brand
test('Footer renders with "pitchPDF Premium Document" brand', () => {
    const document = composeDocument({
        projectTitle: 'My Project',
        contactInfo: 'Test Contact'
    });
    const footerBlock = document.blocks.find(b => b.type === BlockType.FOOTER);
    const rendered = renderBlock(footerBlock);

    // Check for specific structure
    assertTrue(rendered.html.includes('class="footer-bottom"'), 'Should include footer-bottom class');
    assertTrue(rendered.html.includes('class="footer-logo-mark"'), 'Should include footer-logo-mark class');
    assertTrue(rendered.html.includes('class="footer-brand-text"'), 'Should include footer-brand-text class');
    assertTrue(rendered.html.includes('pitchPDF Premium Document'), 'Should include footer brand text');
});

// Test 3: Full HTML Generation
test('Generated HTML contains branding elements', () => {
    const result = renderDocument({
        clientName: 'Test Client',
        projectTitle: 'Test Project'
    });
    const html = generateHtmlDocument(result);

    // Header checks
    assertTrue(html.includes('header-brand'), 'HTML should contain header-brand');
    assertTrue(html.includes('brand-name">pitchPDF'), 'HTML should contain pitchPDF in header');

    // Footer checks
    assertTrue(html.includes('footer-bottom'), 'HTML should contain footer-bottom');
    assertTrue(html.includes('footer-brand-text">pitchPDF Premium Document'), 'HTML should contain footer text');
});

// ============================================
// SUMMARY
// ============================================

console.log('\n' + '='.repeat(50));
console.log(`\nTests: ${passCount}/${testCount} passed`);

if (passCount === testCount) {
    console.log('✅ All branding tests passed!\n');
    process.exit(0);
} else {
    console.log(`❌ ${testCount - passCount} tests failed\n`);
    process.exit(1);
}
