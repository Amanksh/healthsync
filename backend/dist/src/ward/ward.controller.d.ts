import { WardService } from './ward.service';
import { CreateWardDto, UpdateWardDto, CreateBedsDto, UpdateBedDto, AdmitPatientDto, DischargePatientDto } from './dto';
import { AdmissionStatus } from '@prisma/client';
export declare class WardController {
    private wardService;
    constructor(wardService: WardService);
    createWard(dto: CreateWardDto, req: any): Promise<{
        _count: {
            beds: number;
        };
        beds: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.BedStatus;
            notes: string | null;
            bedNumber: string;
            wardId: string;
        }[];
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        hospitalId: string;
        name: string;
        description: string | null;
        type: string | null;
        floor: string | null;
    }>;
    findAllWards(req: any): Promise<{
        beds: {
            currentAdmission: {
                patient: {
                    id: string;
                    firstName: string;
                    lastName: string;
                    gender: import("@prisma/client").$Enums.Gender;
                    mrn: string;
                };
                attendingDoctor: {
                    id: string;
                    firstName: string;
                    lastName: string;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                hospitalId: string;
                status: import("@prisma/client").$Enums.AdmissionStatus;
                notes: string | null;
                patientId: string;
                bedId: string;
                admissionDate: Date;
                diagnosis: string | null;
                attendingDoctorId: string | null;
                dischargeDate: Date | null;
            };
            admissions: undefined;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.BedStatus;
            notes: string | null;
            bedNumber: string;
            wardId: string;
        }[];
        _count: {
            beds: number;
        };
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        hospitalId: string;
        name: string;
        description: string | null;
        type: string | null;
        floor: string | null;
    }[]>;
    getWardSummary(req: any): Promise<{
        totalWards: number;
        totalBeds: number;
        occupiedBeds: number;
        availableBeds: number;
        maintenanceBeds: number;
        occupancyRate: number;
        wardBreakdown: {
            wardId: string;
            wardName: string;
            floor: string | null;
            type: string | null;
            total: number;
            occupied: number;
            available: number;
            maintenance: number;
        }[];
    }>;
    findAllAdmissions(page?: string, limit?: string, status?: AdmissionStatus, req?: any): Promise<{
        data: ({
            patient: {
                id: string;
                firstName: string;
                lastName: string;
                gender: import("@prisma/client").$Enums.Gender;
                mrn: string;
            };
            bed: {
                id: string;
                ward: {
                    id: string;
                    name: string;
                };
                bedNumber: string;
            };
            attendingDoctor: {
                id: string;
                firstName: string;
                lastName: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            hospitalId: string;
            status: import("@prisma/client").$Enums.AdmissionStatus;
            notes: string | null;
            patientId: string;
            bedId: string;
            admissionDate: Date;
            diagnosis: string | null;
            attendingDoctorId: string | null;
            dischargeDate: Date | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findAdmission(id: string, req: any): Promise<{
        patient: {
            id: string;
            firstName: string;
            lastName: string;
            phone: string;
            dateOfBirth: Date;
            gender: import("@prisma/client").$Enums.Gender;
            bloodGroup: string | null;
            allergies: string | null;
            mrn: string;
        };
        bed: {
            id: string;
            ward: {
                id: string;
                name: string;
                floor: string | null;
            };
            bedNumber: string;
        };
        attendingDoctor: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hospitalId: string;
        status: import("@prisma/client").$Enums.AdmissionStatus;
        notes: string | null;
        patientId: string;
        bedId: string;
        admissionDate: Date;
        diagnosis: string | null;
        attendingDoctorId: string | null;
        dischargeDate: Date | null;
    }>;
    findWard(id: string, req: any): Promise<{
        beds: {
            currentAdmission: {
                patient: {
                    id: string;
                    firstName: string;
                    lastName: string;
                    phone: string;
                    dateOfBirth: Date;
                    gender: import("@prisma/client").$Enums.Gender;
                    bloodGroup: string | null;
                    mrn: string;
                };
                attendingDoctor: {
                    id: string;
                    firstName: string;
                    lastName: string;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                hospitalId: string;
                status: import("@prisma/client").$Enums.AdmissionStatus;
                notes: string | null;
                patientId: string;
                bedId: string;
                admissionDate: Date;
                diagnosis: string | null;
                attendingDoctorId: string | null;
                dischargeDate: Date | null;
            };
            admissions: undefined;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.BedStatus;
            notes: string | null;
            bedNumber: string;
            wardId: string;
        }[];
        _count: {
            beds: number;
        };
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        hospitalId: string;
        name: string;
        description: string | null;
        type: string | null;
        floor: string | null;
    }>;
    updateWard(id: string, dto: UpdateWardDto, req: any): Promise<{
        _count: {
            beds: number;
        };
        beds: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.BedStatus;
            notes: string | null;
            bedNumber: string;
            wardId: string;
        }[];
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        hospitalId: string;
        name: string;
        description: string | null;
        type: string | null;
        floor: string | null;
    }>;
    deleteWard(id: string, req: any): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        hospitalId: string;
        name: string;
        description: string | null;
        type: string | null;
        floor: string | null;
    }>;
    addBeds(wardId: string, dto: CreateBedsDto, req: any): Promise<{
        beds: {
            currentAdmission: {
                patient: {
                    id: string;
                    firstName: string;
                    lastName: string;
                    phone: string;
                    dateOfBirth: Date;
                    gender: import("@prisma/client").$Enums.Gender;
                    bloodGroup: string | null;
                    mrn: string;
                };
                attendingDoctor: {
                    id: string;
                    firstName: string;
                    lastName: string;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                hospitalId: string;
                status: import("@prisma/client").$Enums.AdmissionStatus;
                notes: string | null;
                patientId: string;
                bedId: string;
                admissionDate: Date;
                diagnosis: string | null;
                attendingDoctorId: string | null;
                dischargeDate: Date | null;
            };
            admissions: undefined;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.BedStatus;
            notes: string | null;
            bedNumber: string;
            wardId: string;
        }[];
        _count: {
            beds: number;
        };
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        hospitalId: string;
        name: string;
        description: string | null;
        type: string | null;
        floor: string | null;
    }>;
    updateBed(wardId: string, bedId: string, dto: UpdateBedDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.BedStatus;
        notes: string | null;
        bedNumber: string;
        wardId: string;
    }>;
    deleteBed(wardId: string, bedId: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.BedStatus;
        notes: string | null;
        bedNumber: string;
        wardId: string;
    }>;
    admitPatient(dto: AdmitPatientDto, req: any): Promise<{
        patient: {
            id: string;
            firstName: string;
            lastName: string;
            gender: import("@prisma/client").$Enums.Gender;
            mrn: string;
        };
        bed: {
            id: string;
            bedNumber: string;
        };
        attendingDoctor: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hospitalId: string;
        status: import("@prisma/client").$Enums.AdmissionStatus;
        notes: string | null;
        patientId: string;
        bedId: string;
        admissionDate: Date;
        diagnosis: string | null;
        attendingDoctorId: string | null;
        dischargeDate: Date | null;
    }>;
    dischargePatient(id: string, dto: DischargePatientDto, req: any): Promise<{
        patient: {
            id: string;
            firstName: string;
            lastName: string;
            gender: import("@prisma/client").$Enums.Gender;
            mrn: string;
        };
        bed: {
            id: string;
            bedNumber: string;
        };
        attendingDoctor: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hospitalId: string;
        status: import("@prisma/client").$Enums.AdmissionStatus;
        notes: string | null;
        patientId: string;
        bedId: string;
        admissionDate: Date;
        diagnosis: string | null;
        attendingDoctorId: string | null;
        dischargeDate: Date | null;
    }>;
}
