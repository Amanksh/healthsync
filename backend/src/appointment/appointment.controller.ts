import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    Query,
    UseGuards,
    ParseUUIDPipe,
    Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto';
import { Roles, RolesGuard } from '../common';
import { Role, AppointmentStatus } from '@prisma/client';

@Controller('appointments')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AppointmentController {
    constructor(private appointmentService: AppointmentService) { }

    @Post()
    @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST)
    create(@Body() dto: CreateAppointmentDto, @Request() req: any) {
        return this.appointmentService.create(dto, req.user.hospitalId);
    }

    @Get()
    @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST)
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('status') status?: AppointmentStatus,
        @Query('providerId') providerId?: string,
        @Query('patientId') patientId?: string,
        @Query('dateFrom') dateFrom?: string,
        @Query('dateTo') dateTo?: string,
        @Query('sortBy') sortBy?: string,
        @Query('sortOrder') sortOrder?: 'asc' | 'desc',
        @Request() req?: any,
    ) {
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

    @Get(':id')
    @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST)
    findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
        return this.appointmentService.findOne(id, req.user.hospitalId);
    }

    @Patch(':id')
    @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST)
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateAppointmentDto,
        @Request() req: any,
    ) {
        return this.appointmentService.update(id, dto, req.user.hospitalId);
    }

    @Patch(':id/cancel')
    @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST)
    cancel(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
        return this.appointmentService.cancel(id, req.user.hospitalId);
    }
}
