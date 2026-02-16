import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { PdfModule } from '../pdf/pdf.module';
import { UploadModule } from '../upload/upload.module';
import { PharmacyModule } from '../pharmacy/pharmacy.module';

@Module({
    imports: [PdfModule, UploadModule, PharmacyModule],
    controllers: [BillingController],
    providers: [BillingService],
})
export class BillingModule { }
