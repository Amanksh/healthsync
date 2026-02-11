import { PrismaClient, Role, Gender, AppointmentStatus, PaymentStatus, InvoiceItemCategory } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🏥 Seeding Hospital Management System...\n');

    // ─── Create Default Hospital ────────────────────────────────────────────────
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

    // ─── Create Users ───────────────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash('Admin@123', 12);

    const superAdmin = await prisma.user.create({
        data: {
            email: 'admin@hospital.com',
            password: hashedPassword,
            firstName: 'System',
            lastName: 'Admin',
            role: Role.SUPER_ADMIN,
            phone: '+919999999999',
            hospitalId: null, // SUPER_ADMIN is not tied to any hospital
        },
    });

    const doctorPatel = await prisma.user.create({
        data: {
            email: 'dr.patel@hospital.com',
            password: hashedPassword,
            firstName: 'Priya',
            lastName: 'Patel',
            role: Role.DOCTOR,
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
            role: Role.DOCTOR,
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
            role: Role.RECEPTIONIST,
            phone: '+919876543203',
            hospitalId: hospital.id,
        },
    });

    console.log('✅ Users created:');
    console.log(`   Super Admin: admin@hospital.com / Admin@123`);
    console.log(`   Doctor 1:    dr.patel@hospital.com / Admin@123`);
    console.log(`   Doctor 2:    dr.sharma@hospital.com / Admin@123`);
    console.log(`   Reception:   reception@hospital.com / Admin@123`);

    // ─── Create Patients ────────────────────────────────────────────────────────
    const patient1 = await prisma.patient.create({
        data: {
            mrn: 'MRN-20260101-SEED',
            firstName: 'Amit',
            lastName: 'Kumar',
            dateOfBirth: new Date('1985-06-15'),
            gender: Gender.MALE,
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
            gender: Gender.FEMALE,
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

    // ─── Create Appointments ────────────────────────────────────────────────────
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
                status: AppointmentStatus.SCHEDULED,
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
                status: AppointmentStatus.SCHEDULED,
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
                status: AppointmentStatus.SCHEDULED,
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
                status: AppointmentStatus.SCHEDULED,
                reason: 'Lab results review',
                hospitalId: hospital.id,
            },
        }),
    ]);

    console.log(`✅ Appointments created: ${appointments.length}`);

    // ─── Create Invoice ─────────────────────────────────────────────────────────
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
            paymentStatus: PaymentStatus.PAID,
            hospitalId: hospital.id,
            items: {
                create: [
                    {
                        description: 'General Consultation',
                        category: InvoiceItemCategory.CONSULTATION,
                        unitPriceCents: 150000,
                        quantity: 1,
                        totalCents: 150000,
                    },
                    {
                        description: 'Blood Panel',
                        category: InvoiceItemCategory.LAB_TEST,
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
