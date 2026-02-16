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
import { BillingService } from './billing.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto';
import { Roles, RolesGuard } from '../common';
import { Role } from '@prisma/client';

@Controller('invoices')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class BillingController {
    constructor(private billingService: BillingService) { }

    @Post()
    @Roles(Role.ADMIN, Role.RECEPTIONIST)
    create(@Body() dto: CreateInvoiceDto, @Request() req: any) {
        return this.billingService.create(dto, req.user.hospitalId);
    }

    @Get()
    @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.PHARMACIST)
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('paymentStatus') paymentStatus?: string,
        @Query('search') search?: string,
        @Request() req?: any,
    ) {
        return this.billingService.findAll({
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            paymentStatus,
            search,
            hospitalId: req?.user?.hospitalId,
        });
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.PHARMACIST)
    findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
        return this.billingService.findOne(id, req.user.hospitalId);
    }

    @Patch(':id')
    @Roles(Role.ADMIN, Role.PHARMACIST)
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateInvoiceDto,
        @Request() req: any,
    ) {
        return this.billingService.update(id, dto, req.user.hospitalId);
    }
}
