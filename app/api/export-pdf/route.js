import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { renderDocument, generateHtmlDocument } from '../../../lib/pdf-renderer';

export async function POST(request) {
    try {
        const { formData, uid } = await request.json();

        // 0. Verify Entitlement
        if (!uid) {
            return NextResponse.json({ error: 'User ID required' }, { status: 401 });
        }

        const { getUserEntitlement, consumeCredit } = await import('@/services/userService');
        const entitlement = await getUserEntitlement(uid);

        if (!entitlement.allowed) {
            if (entitlement.reason === 'error') {
                return NextResponse.json({ error: 'System error: ' + (entitlement.details || 'Unknown error') }, { status: 500 });
            }
            return NextResponse.json({ error: 'Payment required' }, { status: 403 });
        }

        // If using credits, consume one NOW
        if (entitlement.reason === 'credits') {
            const success = await consumeCredit(uid);
            if (!success) {
                return NextResponse.json({ error: 'Failed to consume credit' }, { status: 500 });
            }
        }

        // 1. Run the data through our new document-layout-flow-render pipeline
        const renderResult = renderDocument(formData);

        // 2. Generate the full HTML for the PDF
        const htmlContent = generateHtmlDocument(renderResult);

        // 3. Launch Puppeteer to render the HTML to PDF
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: 'new'
        });

        const page = await browser.newPage();

        // Set content and wait for network idle to ensure fonts/images load
        await page.setContent(htmlContent, {
            waitUntil: 'networkidle0'
        });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0px',
                right: '0px',
                bottom: '0px',
                left: '0px'
            }
        });

        await browser.close();

        // 4. Return the PDF
        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="proposal.pdf"`
            }
        });

    } catch (error) {
        console.error('PDF Generation Error:', error);
        return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
    }
}
