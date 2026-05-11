import { BedStatus } from '@prisma/client';
export declare class SingleBedDto {
    bedNumber: string;
    status?: BedStatus;
    notes?: string;
}
export declare class CreateBedsDto {
    beds: SingleBedDto[];
}
