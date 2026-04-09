import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Doctor@123", 10);

  await prisma.doctor.upsert({
    where: { email: "doctor@example.com" },
    update: {},
    create: {
      name: "Clinic Doctor",
      email: "doctor@example.com",
      phone: "9999999999",
      specialization: "General Medicine",
      passwordHash,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
