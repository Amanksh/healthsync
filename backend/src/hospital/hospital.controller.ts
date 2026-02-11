import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { HospitalService } from './hospital.service';
import { CreateHospitalDto, UpdateHospitalDto } from './dto/hospital.dto';
import { Roles, RolesGuard } from '../common';

@Controller('hospitals')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.SUPER_ADMIN)
export class HospitalController {
    constructor(private hospitalService: HospitalService) { }

    @Post()
    create(@Body() dto: CreateHospitalDto) {
        return this.hospitalService.create(dto);
    }

    @Get()
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
    ) {
        return this.hospitalService.findAll({
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            search,
        });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.hospitalService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateHospitalDto) {
        return this.hospitalService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.hospitalService.remove(id);
    }
}
