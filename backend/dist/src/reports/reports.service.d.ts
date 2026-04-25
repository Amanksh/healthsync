import { ConfigService } from '@nestjs/config';
import { ReportType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { CreateReportDto } from './dto';
export declare class ReportsService {
    private prisma;
    private uploadService;
    private configService;
    constructor(prisma: PrismaService, uploadService: UploadService, configService: ConfigService);
    create(dto: CreateReportDto, file: any, hospitalId?: string, uploadedById?: string): Promise<{
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
    findAll(params: {
        page?: number;
        limit?: number;
        search?: string;
        type?: ReportType;
        patientId?: string;
        hospitalId?: string | null;
    }): Promise<{
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
    findOne(id: string, hospitalId?: string | null): Promise<{
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
    sendToPatient(id: string, hospitalId?: string | null): Promise<{
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
    private buildPatientMessage;
    private getFileExtension;
    private defaultInclude;
}
