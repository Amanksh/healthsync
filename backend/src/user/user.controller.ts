import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { Roles, RolesGuard } from '../common';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
export class UserController {
    constructor(private userService: UserService) { }

    @Post()
    create(@Body() dto: CreateUserDto, @Request() req: any) {
        const hospitalId = req.user.hospitalId;
        // ADMIN must have a hospitalId; SUPER_ADMIN can pass hospitalId in body
        if (!hospitalId) {
            // SUPER_ADMIN — require hospitalId to be provided somehow
            // For now, SUPER_ADMIN creates users through the hospital admin flow
            throw new Error('Hospital context required. Use hospital admin to create users.');
        }
        return this.userService.create(dto, hospitalId);
    }

    @Get()
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Request() req?: any,
    ) {
        return this.userService.findAll(req.user.hospitalId || null, {
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            search,
        });
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateUserDto,
        @Request() req: any,
    ) {
        return this.userService.update(id, dto, req.user.hospitalId || null);
    }

    @Patch(':id/toggle-active')
    toggleActive(@Param('id') id: string, @Request() req: any) {
        return this.userService.toggleActive(id, req.user.hospitalId || null);
    }
}
