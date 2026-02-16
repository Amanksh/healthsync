import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
    ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles } from '../common';
import { Role } from '@prisma/client';
import { PharmacyService } from './pharmacy.service';
import { CreateMedicineDto, AddStockDto } from './dto';

@Controller('pharmacy')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PharmacyController {
    constructor(private pharmacyService: PharmacyService) { }

    @Post('medicines')
    @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST)
    create(@Body() dto: CreateMedicineDto, @Request() req: any) {
        return this.pharmacyService.create(dto, req.user.hospitalId);
    }

    @Get('medicines')
    @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST)
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Request() req?: any,
    ) {
        return this.pharmacyService.findAll({
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            search,
            hospitalId: req.user.hospitalId,
        });
    }

    @Get('alerts/low-stock')
    @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST)
    getLowStock(@Request() req: any) {
        return this.pharmacyService.checkLowStock(req.user.hospitalId);
    }

    @Get('medicines/:id')
    @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST)
    findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
        return this.pharmacyService.findOne(id, req.user.hospitalId);
    }

    @Post('medicines/:id/stock')
    @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST) // Ideally specialized role, but reuse for now
    addStock(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: AddStockDto,
        @Request() req: any,
    ) {
        return this.pharmacyService.addStock(id, dto, req.user.hospitalId);
    }
}
