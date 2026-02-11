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
import { PatientService } from './patient.service';
import { CreatePatientDto, UpdatePatientDto } from './dto';
import { Roles, RolesGuard } from '../common';
import { Role } from '@prisma/client';

@Controller('patients')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PatientController {
    constructor(private patientService: PatientService) { }

    @Post()
    @Roles(Role.ADMIN, Role.RECEPTIONIST)
    create(@Body() dto: CreatePatientDto, @Request() req: any) {
        return this.patientService.create(dto, req.user.hospitalId);
    }

    @Get()
    @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST)
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Request() req?: any,
    ) {
        return this.patientService.findAll({
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            search,
            hospitalId: req?.user?.hospitalId,
        });
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST)
    findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
        return this.patientService.findOne(id, req.user.hospitalId);
    }

    @Patch(':id')
    @Roles(Role.ADMIN, Role.RECEPTIONIST)
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdatePatientDto,
        @Request() req: any,
    ) {
        return this.patientService.update(id, dto, req.user.hospitalId);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
        return this.patientService.softDelete(id, req.user.hospitalId);
    }
}
