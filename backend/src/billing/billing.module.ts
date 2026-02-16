import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { PdfModule } from '../pdf/pdf.module';
import { UploadModule } from '../upload/upload.module';

@Module({
    imports: [PdfModule, UploadModule],
    controllers: [BillingController],
    providers: [BillingService],
})
export class BillingModule { }
