import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadModule } from '../upload/upload.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [PrismaModule, UploadModule, ConfigModule],
    controllers: [ReportsController],
    providers: [ReportsService],
})
export class ReportsModule { }
