import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
    Query,
    Request,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { Role, ReportType } from '@prisma/client';
import { Roles, RolesGuard } from '../common';
import { CreateReportDto } from './dto';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ReportsController {
    constructor(private reportsService: ReportsService) { }

    @Post()
    @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST)
    @UseInterceptors(FileInterceptor('file'))
    create(
        @Body() dto: CreateReportDto,
        @UploadedFile() file: any,
        @Request() req: any,
    ) {
        return this.reportsService.create(dto, file, req.user.hospitalId, req.user.id);
    }

    @Get()
    @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST)
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Query('type') type?: ReportType,
        @Query('patientId') patientId?: string,
        @Request() req?: any,
    ) {
        return this.reportsService.findAll({
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            search,
            type,
            patientId,
            hospitalId: req?.user?.hospitalId,
        });
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST)
    findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
        return this.reportsService.findOne(id, req.user.hospitalId);
    }

    @Post(':id/send')
    @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST)
    send(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
        return this.reportsService.sendToPatient(id, req.user.hospitalId);
    }
}
