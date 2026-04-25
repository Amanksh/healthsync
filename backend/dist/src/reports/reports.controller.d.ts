import { ReportType } from '@prisma/client';
import { CreateReportDto } from './dto';
import { ReportsService } from './reports.service';
export declare class ReportsController {
    private reportsService;
    constructor(reportsService: ReportsService);
    create(dto: CreateReportDto, file: any, req: any): Promise<{
        hospital: {
            id: string;
            name: string;
        };
        patient: {
            id: string;
            firstName: string;
            lastName: string;
            phone: string;
            mrn: string;
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
        notes: string | null;
        patientId: string;
        s3Key: string | null;
        title: string;
        type: import("@prisma/client").$Enums.ReportType;
        reportDate: Date;
        fileUrl: string;
        aiSummary: string | null;
        deliveryStatus: import("@prisma/client").$Enums.ReportDeliveryStatus;
        deliveredAt: Date | null;
        deliveryError: string | null;
        uploadedById: string | null;
    }>;
    findAll(page?: string, limit?: string, search?: string, type?: ReportType, patientId?: string, req?: any): Promise<{
        data: ({
            hospital: {
                id: string;
                name: string;
            };
            patient: {
                id: string;
                firstName: string;
                lastName: string;
                phone: string;
                mrn: string;
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
            notes: string | null;
            patientId: string;
            s3Key: string | null;
            title: string;
            type: import("@prisma/client").$Enums.ReportType;
            reportDate: Date;
            fileUrl: string;
            aiSummary: string | null;
            deliveryStatus: import("@prisma/client").$Enums.ReportDeliveryStatus;
            deliveredAt: Date | null;
            deliveryError: string | null;
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
        hospital: {
            id: string;
            name: string;
        };
        patient: {
            id: string;
            firstName: string;
            lastName: string;
            phone: string;
            mrn: string;
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
        notes: string | null;
        patientId: string;
        s3Key: string | null;
        title: string;
        type: import("@prisma/client").$Enums.ReportType;
        reportDate: Date;
        fileUrl: string;
        aiSummary: string | null;
        deliveryStatus: import("@prisma/client").$Enums.ReportDeliveryStatus;
        deliveredAt: Date | null;
        deliveryError: string | null;
        uploadedById: string | null;
    }>;
    send(id: string, req: any): Promise<{
        hospital: {
            id: string;
            name: string;
        };
        patient: {
            id: string;
            firstName: string;
            lastName: string;
            phone: string;
            mrn: string;
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
        notes: string | null;
        patientId: string;
        s3Key: string | null;
        title: string;
        type: import("@prisma/client").$Enums.ReportType;
        reportDate: Date;
        fileUrl: string;
        aiSummary: string | null;
        deliveryStatus: import("@prisma/client").$Enums.ReportDeliveryStatus;
        deliveredAt: Date | null;
        deliveryError: string | null;
        uploadedById: string | null;
    }>;
}
