import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { ReportDeliveryStatus, ReportType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { CreateReportDto } from './dto';

const REPORT_TYPE_LABELS: Record<ReportType, string> = {
    BLOOD_REPORT: 'Blood report',
    ECG: 'ECG report',
    ULTRASOUND: 'Ultrasound report',
    XRAY: 'X-ray report',
    OTHER: 'Medical report',
};

@Injectable()
export class ReportsService {
    constructor(
        private prisma: PrismaService,
        private uploadService: UploadService,
        private configService: ConfigService,
    ) { }

    async create(dto: CreateReportDto, file: any, hospitalId?: string, uploadedById?: string) {
        if (!hospitalId) {
            throw new ForbiddenException('Hospital context is required to create reports');
        }

        if (!file) {
            throw new BadRequestException('A report file is required');
        }

        const patient = await this.prisma.patient.findFirst({
            where: { id: dto.patientId, hospitalId, deletedAt: null },
            select: { id: true },
        });

        if (!patient) {
            throw new NotFoundException('Patient not found');
        }

        const ext = this.getFileExtension(file.originalname);
        const uniquePart = randomBytes(6).toString('hex');
        const s3Key = `reports/${hospitalId}/${dto.patientId}/${Date.now()}-${uniquePart}${ext}`;
        const fileUrl = await this.uploadService.uploadFile(s3Key, file.buffer, file.mimetype);

        return this.prisma.medicalReport.create({
            data: {
                patientId: dto.patientId,
                hospitalId,
                uploadedById,
                title: dto.title,
                type: dto.type,
                reportDate: dto.reportDate ? new Date(dto.reportDate) : new Date(),
                notes: dto.notes,
                fileUrl,
                s3Key,
            },
            include: this.defaultInclude(),
        });
    }

    async findAll(params: {
        page?: number;
        limit?: number;
        search?: string;
        type?: ReportType;
        patientId?: string;
        hospitalId?: string | null;
    }) {
        const { page = 1, limit = 20, search, type, patientId, hospitalId } = params;
        const skip = (page - 1) * limit;
        const where: any = {};

        if (hospitalId) where.hospitalId = hospitalId;
        if (type) where.type = type;
        if (patientId) where.patientId = patientId;

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { notes: { contains: search, mode: 'insensitive' } },
                { patient: { firstName: { contains: search, mode: 'insensitive' } } },
                { patient: { lastName: { contains: search, mode: 'insensitive' } } },
                { patient: { mrn: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const [reports, total] = await Promise.all([
            this.prisma.medicalReport.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: this.defaultInclude(),
            }),
            this.prisma.medicalReport.count({ where }),
        ]);

        return {
            data: reports,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string, hospitalId?: string | null) {
        const where: any = { id };
        if (hospitalId) where.hospitalId = hospitalId;

        const report = await this.prisma.medicalReport.findFirst({
            where,
            include: this.defaultInclude(),
        });

        if (!report) {
            throw new NotFoundException('Report not found');
        }

        return report;
    }

    async sendToPatient(id: string, hospitalId?: string | null) {
        const report = await this.findOne(id, hospitalId);

        if (!report.patient.phone) {
            throw new BadRequestException('Patient does not have a phone number');
        }

        const message = this.buildPatientMessage(report);
        const webhookUrl = this.configService.get<string>('REPORT_MESSAGE_WEBHOOK_URL');

        try {
            if (webhookUrl) {
                const response = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: report.patient.phone,
                        patientId: report.patient.id,
                        reportId: report.id,
                        reportType: report.type,
                        fileUrl: report.fileUrl,
                        message,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Messaging provider returned ${response.status}`);
                }
            }

            const deliveryError = webhookUrl ? null : 'Dry run: REPORT_MESSAGE_WEBHOOK_URL is not configured';

            return this.prisma.medicalReport.update({
                where: { id },
                data: {
                    deliveryStatus: ReportDeliveryStatus.SENT,
                    deliveredAt: new Date(),
                    deliveryError,
                },
                include: this.defaultInclude(),
            });
        } catch (error) {
            return this.prisma.medicalReport.update({
                where: { id },
                data: {
                    deliveryStatus: ReportDeliveryStatus.FAILED,
                    deliveryError: error instanceof Error ? error.message : 'Failed to send report',
                },
                include: this.defaultInclude(),
            });
        }
    }

    private buildPatientMessage(report: {
        type: ReportType;
        fileUrl: string;
        patient: { firstName: string };
        hospital: { name: string };
    }) {
        const typeLabel = REPORT_TYPE_LABELS[report.type] || 'medical report';
        return `Hello ${report.patient.firstName}, your ${typeLabel} from ${report.hospital.name} is ready: ${report.fileUrl}`;
    }

    private getFileExtension(fileName?: string) {
        if (!fileName || !fileName.includes('.')) return '';
        const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
        return ext.replace(/[^a-z0-9.]/g, '');
    }

    private defaultInclude() {
        return {
            patient: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    mrn: true,
                    phone: true,
                },
            },
            hospital: {
                select: {
                    id: true,
                    name: true,
                },
            },
            uploadedBy: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                },
            },
        };
    }
}
