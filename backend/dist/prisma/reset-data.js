"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🧹 Starting data reset...\n');
    const deletedItems = await prisma.invoiceItem.deleteMany();
    console.log(`   Deleted ${deletedItems.count} invoice items`);
    const deletedInvoices = await prisma.invoice.deleteMany();
    console.log(`   Deleted ${deletedInvoices.count} invoices`);
    const deletedAppointments = await prisma.appointment.deleteMany();
    console.log(`   Deleted ${deletedAppointments.count} appointments`);
    const deletedPatients = await prisma.patient.deleteMany();
    console.log(`   Deleted ${deletedPatients.count} patients`);
    const deletedUsers = await prisma.user.deleteMany({
        where: { role: { not: client_1.Role.SUPER_ADMIN } },
    });
    console.log(`   Deleted ${deletedUsers.count} users (kept SUPER_ADMIN)`);
    const deletedHospitals = await prisma.hospital.deleteMany();
    console.log(`   Deleted ${deletedHospitals.count} hospitals`);
    const remainingUsers = await prisma.user.findMany({
        select: { email: true, role: true, firstName: true, lastName: true },
    });
    console.log('\n✅ Reset complete. Remaining users:');
    remainingUsers.forEach((u) => console.log(`   ${u.role} — ${u.firstName} ${u.lastName} (${u.email})`));
}
main()
    .catch((e) => {
    console.error('❌ Reset failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=reset-data.js.map