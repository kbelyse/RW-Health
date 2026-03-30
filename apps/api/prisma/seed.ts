import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const pass = await bcrypt.hash("DemoRw2026!", 12);
  const patient = await prisma.user.upsert({
    where: { email: "patient@demo.local" },
    update: {},
    create: {
      email: "patient@demo.local",
      passwordHash: pass,
      fullName: "Demo Patient",
      role: UserRole.PATIENT,
      emailVerified: true,
    },
  });
  const clinician = await prisma.user.upsert({
    where: { email: "clinician@demo.local" },
    update: { secondaryRole: UserRole.PATIENT },
    create: {
      email: "clinician@demo.local",
      passwordHash: pass,
      fullName: "Dr. Demo Uwimana",
      role: UserRole.CLINICIAN,
      secondaryRole: UserRole.PATIENT,
      emailVerified: true,
    },
  });
  const lab = await prisma.user.upsert({
    where: { email: "lab@demo.local" },
    update: {},
    create: {
      email: "lab@demo.local",
      passwordHash: pass,
      fullName: "Kigali Lab Services",
      role: UserRole.LAB,
      emailVerified: true,
    },
  });
  await prisma.user.upsert({
    where: { email: "admin@demo.local" },
    update: {},
    create: {
      email: "admin@demo.local",
      passwordHash: pass,
      fullName: "System Admin",
      role: UserRole.ADMIN,
      emailVerified: true,
    },
  });

  await prisma.healthRecord.deleteMany({ where: { patientId: patient.id } });
  await prisma.labResult.deleteMany({ where: { patientId: patient.id } });
  await prisma.appointment.deleteMany({ where: { patientId: patient.id } });

  await prisma.healthRecord.createMany({
    data: [
      {
        patientId: patient.id,
        authorId: clinician.id,
        title: "Hypertension follow-up",
        summary: "BP controlled on medication. Lifestyle counseling reinforced.",
        facilityName: "Gicumbi Health Centre",
        visitDate: new Date("2025-11-12"),
      },
      {
        patientId: patient.id,
        authorId: clinician.id,
        title: "Antenatal visit",
        summary: "Routine ANC; hemoglobin within range. Next visit scheduled.",
        facilityName: "CHUK",
        visitDate: new Date("2025-12-03"),
      },
    ],
  });

  await prisma.labResult.createMany({
    data: [
      {
        patientId: patient.id,
        uploadedById: lab.id,
        testCode: "HBA1C",
        testName: "HbA1c",
        value: "6.1",
        unit: "%",
        referenceRange: "< 6.5%",
        status: "FINAL",
        collectedAt: new Date("2025-11-10"),
      },
    ],
  });

  await prisma.appointment.create({
    data: {
      patientId: patient.id,
      createdById: clinician.id,
      clinicianId: clinician.id,
      title: "Follow-up consultation",
      facilityName: "District Hospital Ruhango",
      scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "SCHEDULED",
      notes: "Scheduled by your care team — visible in your passport.",
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
