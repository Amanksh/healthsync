import { BedStatus } from '@prisma/client';
export declare class UpdateBedDto {
    bedNumber?: string;
    status?: BedStatus;
    notes?: string;
}
