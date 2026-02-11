"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🏥 Seeding Hospital Management System...\n');
    const hospital = await prisma.hospital.create({
        data: {
            name: 'City General Hospital',
            branch: 'Main Campus',
            address: '123 Medical Boulevard',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            phone: '+912234567890',
            managerName: 'Dr. Rajesh Kapoor',
        },
    });
    console.log(`✅ Hospital created: ${hospital.name} (${hospital.id})`);
    const hashedPassword = await bcrypt.hash('Admin@123', 12);
    const superAdmin = await prisma.user.create({
        data: {
            email: 'admin@hospital.com',
            password: hashedPassword,
            firstName: 'System',
            lastName: 'Admin',
            role: client_1.Role.SUPER_ADMIN,
            phone: '+919999999999',
            hospitalId: null,
        },
    });
    const doctorPatel = await prisma.user.create({
        data: {
            email: 'dr.patel@hospital.com',
            password: hashedPassword,
            firstName: 'Priya',
            lastName: 'Patel',
            role: client_1.Role.DOCTOR,
            phone: '+919876543201',
            hospitalId: hospital.id,
        },
    });
    const doctorSharma = await prisma.user.create({
        data: {
            email: 'dr.sharma@hospital.com',
            password: hashedPassword,
            firstName: 'Vikram',
            lastName: 'Sharma',
            role: client_1.Role.DOCTOR,
            phone: '+919876543202',
            hospitalId: hospital.id,
        },
    });
    const receptionist = await prisma.user.create({
        data: {
            email: 'reception@hospital.com',
            password: hashedPassword,
            firstName: 'Anita',
            lastName: 'Desai',
            role: client_1.Role.RECEPTIONIST,
            phone: '+919876543203',
            hospitalId: hospital.id,
        },
    });
    console.log('✅ Users created:');
    console.log(`   Super Admin: admin@hospital.com / Admin@123`);
    console.log(`   Doctor 1:    dr.patel@hospital.com / Admin@123`);
    console.log(`   Doctor 2:    dr.sharma@hospital.com / Admin@123`);
    console.log(`   Reception:   reception@hospital.com / Admin@123`);
    const patient1 = await prisma.patient.create({
        data: {
            mrn: 'MRN-20260101-SEED',
            firstName: 'Amit',
            lastName: 'Kumar',
            dateOfBirth: new Date('1985-06-15'),
            gender: client_1.Gender.MALE,
            phone: '+919876543210',
            email: 'amit.kumar@email.com',
            address: '45 MG Road',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400002',
            bloodGroup: 'O+',
            allergies: 'Penicillin',
            hospitalId: hospital.id,
        },
    });
    const patient2 = await prisma.patient.create({
        data: {
            mrn: 'MRN-20260102-SEED',
            firstName: 'Meera',
            lastName: 'Joshi',
            dateOfBirth: new Date('1992-03-22'),
            gender: client_1.Gender.FEMALE,
            phone: '+919876543220',
            email: 'meera.joshi@email.com',
            address: '78 Nehru Street',
            city: 'Delhi',
            state: 'Delhi',
            zipCode: '110001',
            bloodGroup: 'A+',
            hospitalId: hospital.id,
        },
    });
    console.log(`✅ Patients created: ${patient1.firstName} ${patient1.lastName}, ${patient2.firstName} ${patient2.lastName}`);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    dayAfter.setHours(14, 0, 0, 0);
    const appointments = await Promise.all([
        prisma.appointment.create({
            data: {
                patientId: patient1.id,
                providerId: doctorSharma.id,
                appointmentDate: tomorrow,
                durationMinutes: 30,
                status: client_1.AppointmentStatus.SCHEDULED,
                reason: 'General checkup',
                hospitalId: hospital.id,
            },
        }),
        prisma.appointment.create({
            data: {
                patientId: patient1.id,
                providerId: doctorSharma.id,
                appointmentDate: tomorrow,
                durationMinutes: 30,
                status: client_1.AppointmentStatus.SCHEDULED,
                reason: 'Follow-up visit',
                hospitalId: hospital.id,
            },
        }),
        prisma.appointment.create({
            data: {
                patientId: patient2.id,
                providerId: doctorPatel.id,
                appointmentDate: dayAfter,
                durationMinutes: 45,
                status: client_1.AppointmentStatus.SCHEDULED,
                reason: 'Consultation',
                hospitalId: hospital.id,
            },
        }),
        prisma.appointment.create({
            data: {
                patientId: patient2.id,
                providerId: doctorPatel.id,
                appointmentDate: dayAfter,
                durationMinutes: 45,
                status: client_1.AppointmentStatus.SCHEDULED,
                reason: 'Lab results review',
                hospitalId: hospital.id,
            },
        }),
    ]);
    console.log(`✅ Appointments created: ${appointments.length}`);
    const invoice = await prisma.invoice.create({
        data: {
            invoiceNumber: 'INV-20260101-SEED',
            appointmentId: appointments[0].id,
            patientId: patient1.id,
            subtotalCents: 250000,
            taxRate: 0.18,
            taxAmountCents: 45000,
            discountCents: 0,
            totalCents: 295000,
            paymentStatus: client_1.PaymentStatus.PAID,
            hospitalId: hospital.id,
            items: {
                create: [
                    {
                        description: 'General Consultation',
                        category: client_1.InvoiceItemCategory.CONSULTATION,
                        unitPriceCents: 150000,
                        quantity: 1,
                        totalCents: 150000,
                    },
                    {
                        description: 'Blood Panel',
                        category: client_1.InvoiceItemCategory.LAB_TEST,
                        unitPriceCents: 100000,
                        quantity: 1,
                        totalCents: 100000,
                    },
                ],
            },
        },
    });
    console.log(`✅ Invoice created: ${invoice.invoiceNumber}`);
    console.log('\n🎉 Seed completed successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map