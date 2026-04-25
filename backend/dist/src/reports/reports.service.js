"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const upload_service_1 = require("../upload/upload.service");
const REPORT_TYPE_LABELS = {
    BLOOD_REPORT: 'Blood report',
    ECG: 'ECG report',
    ULTRASOUND: 'Ultrasound report',
    XRAY: 'X-ray report',
    OTHER: 'Medical report',
};
let ReportsService = class ReportsService {
    prisma;
    uploadService;
    configService;
    constructor(prisma, uploadService, configService) {
        this.prisma = prisma;
        this.uploadService = uploadService;
        this.configService = configService;
    }
    async create(dto, file, hospitalId, uploadedById) {
        if (!hospitalId) {
            throw new common_1.ForbiddenException('Hospital context is required to create reports');
        }
        if (!file) {
            throw new common_1.BadRequestException('A report file is required');
        }
        const patient = await this.prisma.patient.findFirst({
            where: { id: dto.patientId, hospitalId, deletedAt: null },
            select: { id: true },
        });
        if (!patient) {
            throw new common_1.NotFoundException('Patient not found');
        }
        const ext = this.getFileExtension(file.originalname);
        const uniquePart = (0, crypto_1.randomBytes)(6).toString('hex');
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
    async findAll(params) {
        const { page = 1, limit = 20, search, type, patientId, hospitalId } = params;
        const skip = (page - 1) * limit;
        const where = {};
        if (hospitalId)
            where.hospitalId = hospitalId;
        if (type)
            where.type = type;
        if (patientId)
            where.patientId = patientId;
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
    async findOne(id, hospitalId) {
        const where = { id };
        if (hospitalId)
            where.hospitalId = hospitalId;
        const report = await this.prisma.medicalReport.findFirst({
            where,
            include: this.defaultInclude(),
        });
        if (!report) {
            throw new common_1.NotFoundException('Report not found');
        }
        return report;
    }
    async sendToPatient(id, hospitalId) {
        const report = await this.findOne(id, hospitalId);
        if (!report.patient.phone) {
            throw new common_1.BadRequestException('Patient does not have a phone number');
        }
        const message = this.buildPatientMessage(report);
        const webhookUrl = this.configService.get('REPORT_MESSAGE_WEBHOOK_URL');
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
                    deliveryStatus: client_1.ReportDeliveryStatus.SENT,
                    deliveredAt: new Date(),
                    deliveryError,
                },
                include: this.defaultInclude(),
            });
        }
        catch (error) {
            return this.prisma.medicalReport.update({
                where: { id },
                data: {
                    deliveryStatus: client_1.ReportDeliveryStatus.FAILED,
                    deliveryError: error instanceof Error ? error.message : 'Failed to send report',
                },
                include: this.defaultInclude(),
            });
        }
    }
    buildPatientMessage(report) {
        const typeLabel = REPORT_TYPE_LABELS[report.type] || 'medical report';
        return `Hello ${report.patient.firstName}, your ${typeLabel} from ${report.hospital.name} is ready: ${report.fileUrl}`;
    }
    getFileExtension(fileName) {
        if (!fileName || !fileName.includes('.'))
            return '';
        const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
        return ext.replace(/[^a-z0-9.]/g, '');
    }
    defaultInclude() {
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
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        upload_service_1.UploadService,
        config_1.ConfigService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map