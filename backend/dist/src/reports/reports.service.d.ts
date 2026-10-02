import { ConfigService } from '@nestjs/config';
import { ReportType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { CreateReportDto } from './dto';
export declare class ReportsService {
    private prisma;
    private uploadService;
    private configService;
    private whatsAppService;
    private readonly logger;
    constructor(prisma: PrismaService, uploadService: UploadService, configService: ConfigService, whatsAppService: WhatsAppService);
    create(dto: CreateReportDto, file: any, hospitalId?: string, uploadedById?: string): Promise<{
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
    findAll(params: {
        page?: number;
        limit?: number;
        search?: string;
        type?: ReportType;
        patientId?: string;
        hospitalId?: string | null;
    }): Promise<{
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
    findOne(id: string, hospitalId?: string | null): Promise<{
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
    sendToPatient(id: string, hospitalId?: string | null): Promise<{
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
    private buildPatientMessage;
    private getFileExtension;
    private defaultInclude;
}
