/**
 * Reset Script – Clears all data except the SUPER_ADMIN user.
 *
 * Usage (from backend/):
 *   npx ts-node --compiler-options '{"module":"commonjs"}' prisma/reset-data.ts
 */

import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Starting data reset...\n');

    // 1 ── Delete invoice items (child of invoices)
    const deletedItems = await prisma.invoiceItem.deleteMany();
    console.log(`   Deleted ${deletedItems.count} invoice items`);

    // 2 ── Delete invoices
    const deletedInvoices = await prisma.invoice.deleteMany();
    console.log(`   Deleted ${deletedInvoices.count} invoices`);

    // 3 ── Delete appointments
    const deletedAppointments = await prisma.appointment.deleteMany();
    console.log(`   Deleted ${deletedAppointments.count} appointments`);

    // 4 ── Delete patients
    const deletedPatients = await prisma.patient.deleteMany();
    console.log(`   Deleted ${deletedPatients.count} patients`);

    // 5 ── Delete all users EXCEPT the SUPER_ADMIN
    const deletedUsers = await prisma.user.deleteMany({
        where: { role: { not: Role.SUPER_ADMIN } },
    });
    console.log(`   Deleted ${deletedUsers.count} users (kept SUPER_ADMIN)`);

    // 6 ── Delete all hospitals (SUPER_ADMIN has hospitalId = null, so no FK issue)
    const deletedHospitals = await prisma.hospital.deleteMany();
    console.log(`   Deleted ${deletedHospitals.count} hospitals`);

    // ── Summary
    const remainingUsers = await prisma.user.findMany({
        select: { email: true, role: true, firstName: true, lastName: true },
    });
    console.log('\n✅ Reset complete. Remaining users:');
    remainingUsers.forEach((u) =>
        console.log(`   ${u.role} — ${u.firstName} ${u.lastName} (${u.email})`),
    );
}

main()
    .catch((e) => {
        console.error('❌ Reset failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
