import { ReportType } from '@prisma/client';
import { CreateReportDto } from './dto';
import { ReportsService } from './reports.service';
export declare class ReportsController {
    private reportsService;
    constructor(reportsService: ReportsService);
    create(dto: CreateReportDto, file: any, req: any): Promise<{
        patient: {
            id: string;
            mrn: string;
            firstName: string;
            lastName: string;
            phone: string;
        };
        hospital: {
            id: string;
            name: string;
        };
        uploadedBy: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hospitalId: string;
        title: string;
        type: import("@prisma/client").$Enums.ReportType;
        reportDate: Date;
        notes: string | null;
        fileUrl: string;
        s3Key: string | null;
        aiSummary: string | null;
        deliveryStatus: import("@prisma/client").$Enums.ReportDeliveryStatus;
        deliveredAt: Date | null;
        deliveryError: string | null;
        patientId: string;
        uploadedById: string | null;
    }>;
    findAll(page?: string, limit?: string, search?: string, type?: ReportType, patientId?: string, req?: any): Promise<{
        data: ({
            patient: {
                id: string;
                mrn: string;
                firstName: string;
                lastName: string;
                phone: string;
            };
            hospital: {
                id: string;
                name: string;
            };
            uploadedBy: {
                id: string;
                firstName: string;
                lastName: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            hospitalId: string;
            title: string;
            type: import("@prisma/client").$Enums.ReportType;
            reportDate: Date;
            notes: string | null;
            fileUrl: string;
            s3Key: string | null;
            aiSummary: string | null;
            deliveryStatus: import("@prisma/client").$Enums.ReportDeliveryStatus;
            deliveredAt: Date | null;
            deliveryError: string | null;
            patientId: string;
            uploadedById: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, req: any): Promise<{
        patient: {
            id: string;
            mrn: string;
            firstName: string;
            lastName: string;
            phone: string;
        };
        hospital: {
            id: string;
            name: string;
        };
        uploadedBy: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hospitalId: string;
        title: string;
        type: import("@prisma/client").$Enums.ReportType;
        reportDate: Date;
        notes: string | null;
        fileUrl: string;
        s3Key: string | null;
        aiSummary: string | null;
        deliveryStatus: import("@prisma/client").$Enums.ReportDeliveryStatus;
        deliveredAt: Date | null;
        deliveryError: string | null;
        patientId: string;
        uploadedById: string | null;
    }>;
    send(id: string, req: any): Promise<{
        patient: {
            id: string;
            mrn: string;
            firstName: string;
            lastName: string;
            phone: string;
        };
        hospital: {
            id: string;
            name: string;
        };
        uploadedBy: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hospitalId: string;
        title: string;
        type: import("@prisma/client").$Enums.ReportType;
        reportDate: Date;
        notes: string | null;
        fileUrl: string;
        s3Key: string | null;
        aiSummary: string | null;
        deliveryStatus: import("@prisma/client").$Enums.ReportDeliveryStatus;
        deliveredAt: Date | null;
        deliveryError: string | null;
        patientId: string;
        uploadedById: string | null;
    }>;
}
