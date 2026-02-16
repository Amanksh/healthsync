import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PdfService {
    private readonly logger = new Logger(PdfService.name);

    async generateInvoicePdf(data: any): Promise<Buffer> {
        try {
            const templatePath = path.join(process.cwd(), 'src', 'pdf', 'templates', 'invoice.hbs');
            const templateHtml = fs.readFileSync(templatePath, 'utf8');
            const template = handlebars.compile(templateHtml);
            const html = template(data);

            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });

            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'networkidle0' });

            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '20px',
                    right: '20px',
                    bottom: '20px',
                    left: '20px',
                },
            });

            await browser.close();

            // Convert Uint8Array to Buffer
            return Buffer.from(pdfBuffer);
        } catch (error) {
            this.logger.error(`Failed to generate PDF: ${error}`);
            throw error;
        }
    }
}
