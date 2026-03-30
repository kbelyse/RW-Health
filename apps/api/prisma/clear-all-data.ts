import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    await prisma.auditLog.deleteMany();
    await prisma.healthRecord.deleteMany();
    await prisma.labResult.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.clinicianSlot.deleteMany();
    await prisma.user.deleteMany();
    console.log("All users and related data removed.");
}
main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
