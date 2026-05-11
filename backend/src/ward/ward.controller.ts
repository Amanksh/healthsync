import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    ParseUUIDPipe,
    Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WardService } from './ward.service';
import {
    CreateWardDto,
    UpdateWardDto,
    CreateBedsDto,
    UpdateBedDto,
    AdmitPatientDto,
    DischargePatientDto,
} from './dto';
import { Roles, RolesGuard } from '../common';
import { Role, AdmissionStatus } from '@prisma/client';

@Controller('wards')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class WardController {
    constructor(private wardService: WardService) { }

    // ─── Ward CRUD ───────────────────────────────────────────────────────────

    @Post()
    @Roles(Role.ADMIN)
    createWard(@Body() dto: CreateWardDto, @Request() req: any) {
        return this.wardService.createWard(dto, req.user.hospitalId);
    }

    @Get()
    @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST)
    findAllWards(@Request() req: any) {
        return this.wardService.findAllWards(req.user.hospitalId);
    }

    @Get('summary')
    @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST)
    getWardSummary(@Request() req: any) {
        return this.wardService.getWardSummary(req.user.hospitalId);
    }

    @Get('admissions')
    @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST)
    findAllAdmissions(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('status') status?: AdmissionStatus,
        @Request() req?: any,
    ) {
        return this.wardService.findAllAdmissions({
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            status,
            hospitalId: req?.user?.hospitalId,
        });
    }

    @Get('admissions/:id')
    @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST)
    findAdmission(
        @Param('id', ParseUUIDPipe) id: string,
        @Request() req: any,
    ) {
        return this.wardService.findAdmissionById(id, req.user.hospitalId);
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST)
    findWard(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
        return this.wardService.findWardById(id, req.user.hospitalId);
    }

    @Patch(':id')
    @Roles(Role.ADMIN)
    updateWard(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateWardDto,
        @Request() req: any,
    ) {
        return this.wardService.updateWard(id, dto, req.user.hospitalId);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    deleteWard(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
        return this.wardService.deleteWard(id, req.user.hospitalId);
    }

    // ─── Bed Management ──────────────────────────────────────────────────────

    @Post(':id/beds')
    @Roles(Role.ADMIN)
    addBeds(
        @Param('id', ParseUUIDPipe) wardId: string,
        @Body() dto: CreateBedsDto,
        @Request() req: any,
    ) {
        return this.wardService.addBeds(wardId, dto, req.user.hospitalId);
    }

    @Patch(':wardId/beds/:bedId')
    @Roles(Role.ADMIN, Role.DOCTOR)
    updateBed(
        @Param('wardId', ParseUUIDPipe) wardId: string,
        @Param('bedId', ParseUUIDPipe) bedId: string,
        @Body() dto: UpdateBedDto,
        @Request() req: any,
    ) {
        return this.wardService.updateBed(
            wardId,
            bedId,
            dto,
            req.user.hospitalId,
        );
    }

    @Delete(':wardId/beds/:bedId')
    @Roles(Role.ADMIN)
    deleteBed(
        @Param('wardId', ParseUUIDPipe) wardId: string,
        @Param('bedId', ParseUUIDPipe) bedId: string,
        @Request() req: any,
    ) {
        return this.wardService.deleteBed(wardId, bedId, req.user.hospitalId);
    }

    // ─── Admission / Discharge ───────────────────────────────────────────────

    @Post('admissions')
    @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST)
    admitPatient(@Body() dto: AdmitPatientDto, @Request() req: any) {
        return this.wardService.admitPatient(dto, req.user.hospitalId);
    }

    @Patch('admissions/:id/discharge')
    @Roles(Role.ADMIN, Role.DOCTOR)
    dischargePatient(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: DischargePatientDto,
        @Request() req: any,
    ) {
        return this.wardService.dischargePatient(
            id,
            dto,
            req.user.hospitalId,
        );
    }
}
