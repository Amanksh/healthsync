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
exports.WardController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const ward_service_1 = require("./ward.service");
const dto_1 = require("./dto");
const common_2 = require("../common");
const client_1 = require("@prisma/client");
let WardController = class WardController {
    wardService;
    constructor(wardService) {
        this.wardService = wardService;
    }
    createWard(dto, req) {
        return this.wardService.createWard(dto, req.user.hospitalId);
    }
    findAllWards(req) {
        return this.wardService.findAllWards(req.user.hospitalId);
    }
    getWardSummary(req) {
        return this.wardService.getWardSummary(req.user.hospitalId);
    }
    findAllAdmissions(page, limit, status, req) {
        return this.wardService.findAllAdmissions({
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            status,
            hospitalId: req?.user?.hospitalId,
        });
    }
    findAdmission(id, req) {
        return this.wardService.findAdmissionById(id, req.user.hospitalId);
    }
    findWard(id, req) {
        return this.wardService.findWardById(id, req.user.hospitalId);
    }
    updateWard(id, dto, req) {
        return this.wardService.updateWard(id, dto, req.user.hospitalId);
    }
    deleteWard(id, req) {
        return this.wardService.deleteWard(id, req.user.hospitalId);
    }
    addBeds(wardId, dto, req) {
        return this.wardService.addBeds(wardId, dto, req.user.hospitalId);
    }
    updateBed(wardId, bedId, dto, req) {
        return this.wardService.updateBed(wardId, bedId, dto, req.user.hospitalId);
    }
    deleteBed(wardId, bedId, req) {
        return this.wardService.deleteBed(wardId, bedId, req.user.hospitalId);
    }
    admitPatient(dto, req) {
        return this.wardService.admitPatient(dto, req.user.hospitalId);
    }
    dischargePatient(id, dto, req) {
        return this.wardService.dischargePatient(id, dto, req.user.hospitalId);
    }
};
exports.WardController = WardController;
__decorate([
    (0, common_1.Post)(),
    (0, common_2.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateWardDto, Object]),
    __metadata("design:returntype", void 0)
], WardController.prototype, "createWard", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_2.Roles)(client_1.Role.ADMIN, client_1.Role.DOCTOR, client_1.Role.RECEPTIONIST),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WardController.prototype, "findAllWards", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, common_2.Roles)(client_1.Role.ADMIN, client_1.Role.DOCTOR, client_1.Role.RECEPTIONIST),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WardController.prototype, "getWardSummary", null);
__decorate([
    (0, common_1.Get)('admissions'),
    (0, common_2.Roles)(client_1.Role.ADMIN, client_1.Role.DOCTOR, client_1.Role.RECEPTIONIST),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], WardController.prototype, "findAllAdmissions", null);
__decorate([
    (0, common_1.Get)('admissions/:id'),
    (0, common_2.Roles)(client_1.Role.ADMIN, client_1.Role.DOCTOR, client_1.Role.RECEPTIONIST),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WardController.prototype, "findAdmission", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_2.Roles)(client_1.Role.ADMIN, client_1.Role.DOCTOR, client_1.Role.RECEPTIONIST),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WardController.prototype, "findWard", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_2.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateWardDto, Object]),
    __metadata("design:returntype", void 0)
], WardController.prototype, "updateWard", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_2.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WardController.prototype, "deleteWard", null);
__decorate([
    (0, common_1.Post)(':id/beds'),
    (0, common_2.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateBedsDto, Object]),
    __metadata("design:returntype", void 0)
], WardController.prototype, "addBeds", null);
__decorate([
    (0, common_1.Patch)(':wardId/beds/:bedId'),
    (0, common_2.Roles)(client_1.Role.ADMIN, client_1.Role.DOCTOR),
    __param(0, (0, common_1.Param)('wardId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('bedId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.UpdateBedDto, Object]),
    __metadata("design:returntype", void 0)
], WardController.prototype, "updateBed", null);
__decorate([
    (0, common_1.Delete)(':wardId/beds/:bedId'),
    (0, common_2.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('wardId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('bedId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], WardController.prototype, "deleteBed", null);
__decorate([
    (0, common_1.Post)('admissions'),
    (0, common_2.Roles)(client_1.Role.ADMIN, client_1.Role.DOCTOR, client_1.Role.RECEPTIONIST),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.AdmitPatientDto, Object]),
    __metadata("design:returntype", void 0)
], WardController.prototype, "admitPatient", null);
__decorate([
    (0, common_1.Patch)('admissions/:id/discharge'),
    (0, common_2.Roles)(client_1.Role.ADMIN, client_1.Role.DOCTOR),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.DischargePatientDto, Object]),
    __metadata("design:returntype", void 0)
], WardController.prototype, "dischargePatient", null);
exports.WardController = WardController = __decorate([
    (0, common_1.Controller)('wards'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), common_2.RolesGuard),
    __metadata("design:paramtypes", [ward_service_1.WardService])
], WardController);
//# sourceMappingURL=ward.controller.js.map