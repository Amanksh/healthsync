import { ReportType } from '@prisma/client';
export declare class CreateReportDto {
    patientId: string;
    title: string;
    type: ReportType;
    reportDate?: string;
    notes?: string;
}
