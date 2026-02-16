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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const appointment_service_1 = require("./appointment.service");
const dto_1 = require("./dto");
const common_2 = require("../common");
const client_1 = require("@prisma/client");
let AppointmentController = class AppointmentController {
    appointmentService;
    constructor(appointmentService) {
        this.appointmentService = appointmentService;
    }
    create(dto, req) {
        return this.appointmentService.create(dto, req.user.hospitalId);
    }
    findAll(page, limit, status, providerId, patientId, dateFrom, dateTo, sortBy, sortOrder, req) {
        return this.appointmentService.findAll({
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            status,
            providerId,
            patientId,
            dateFrom,
            dateTo,
            hospitalId: req?.user?.hospitalId,
            sortBy,
            sortOrder,
        });
    }
    findOne(id, req) {
        return this.appointmentService.findOne(id, req.user.hospitalId);
    }
    update(id, dto, req) {
        return this.appointmentService.update(id, dto, req.user.hospitalId);
    }
    cancel(id, req) {
        return this.appointmentService.cancel(id, req.user.hospitalId);
    }
};
exports.AppointmentController = AppointmentController;
__decorate([
    (0, common_1.Post)(),
    (0, common_2.Roles)(client_1.Role.ADMIN, client_1.Role.DOCTOR, client_1.Role.RECEPTIONIST),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateAppointmentDto, Object]),
    __metadata("design:returntype", void 0)
], AppointmentController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_2.Roles)(client_1.Role.ADMIN, client_1.Role.DOCTOR, client_1.Role.RECEPTIONIST),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('providerId')),
    __param(4, (0, common_1.Query)('patientId')),
    __param(5, (0, common_1.Query)('dateFrom')),
    __param(6, (0, common_1.Query)('dateTo')),
    __param(7, (0, common_1.Query)('sortBy')),
    __param(8, (0, common_1.Query)('sortOrder')),
    __param(9, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String, Object]),
    __metadata("design:returntype", void 0)
], AppointmentController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_2.Roles)(client_1.Role.ADMIN, client_1.Role.DOCTOR, client_1.Role.RECEPTIONIST),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AppointmentController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_2.Roles)(client_1.Role.ADMIN, client_1.Role.DOCTOR, client_1.Role.RECEPTIONIST),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateAppointmentDto, Object]),
    __metadata("design:returntype", void 0)
], AppointmentController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    (0, common_2.Roles)(client_1.Role.ADMIN, client_1.Role.DOCTOR, client_1.Role.RECEPTIONIST),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AppointmentController.prototype, "cancel", null);
exports.AppointmentController = AppointmentController = __decorate([
    (0, common_1.Controller)('appointments'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), common_2.RolesGuard),
    __metadata("design:paramtypes", [appointment_service_1.AppointmentService])
], AppointmentController);
//# sourceMappingURL=appointment.controller.js.map