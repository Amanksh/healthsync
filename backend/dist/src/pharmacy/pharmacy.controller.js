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
exports.PharmacyController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const common_2 = require("../common");
const client_1 = require("@prisma/client");
const pharmacy_service_1 = require("./pharmacy.service");
const dto_1 = require("./dto");
let PharmacyController = class PharmacyController {
    pharmacyService;
    constructor(pharmacyService) {
        this.pharmacyService = pharmacyService;
    }
    create(dto, req) {
        return this.pharmacyService.create(dto, req.user.hospitalId);
    }
    findAll(page, limit, search, req) {
        return this.pharmacyService.findAll({
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            search,
            hospitalId: req.user.hospitalId,
        });
    }
    getLowStock(req) {
        return this.pharmacyService.checkLowStock(req.user.hospitalId);
    }
    findOne(id, req) {
        return this.pharmacyService.findOne(id, req.user.hospitalId);
    }
    addStock(id, dto, req) {
        return this.pharmacyService.addStock(id, dto, req.user.hospitalId);
    }
};
exports.PharmacyController = PharmacyController;
__decorate([
    (0, common_1.Post)('medicines'),
    (0, common_2.Roles)(client_1.Role.ADMIN, client_1.Role.DOCTOR, client_1.Role.RECEPTIONIST),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateMedicineDto, Object]),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('medicines'),
    (0, common_2.Roles)(client_1.Role.ADMIN, client_1.Role.DOCTOR, client_1.Role.RECEPTIONIST),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('alerts/low-stock'),
    (0, common_2.Roles)(client_1.Role.ADMIN, client_1.Role.DOCTOR, client_1.Role.RECEPTIONIST),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "getLowStock", null);
__decorate([
    (0, common_1.Get)('medicines/:id'),
    (0, common_2.Roles)(client_1.Role.ADMIN, client_1.Role.DOCTOR, client_1.Role.RECEPTIONIST),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('medicines/:id/stock'),
    (0, common_2.Roles)(client_1.Role.ADMIN, client_1.Role.DOCTOR, client_1.Role.RECEPTIONIST),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.AddStockDto, Object]),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "addStock", null);
exports.PharmacyController = PharmacyController = __decorate([
    (0, common_1.Controller)('pharmacy'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), common_2.RolesGuard),
    __metadata("design:paramtypes", [pharmacy_service_1.PharmacyService])
], PharmacyController);
//# sourceMappingURL=pharmacy.controller.js.map