import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.SEED_MENTOR_EMAIL ?? "mentor@example.com")
    .trim()
    .toLowerCase();
  const password = process.env.SEED_MENTOR_PASSWORD ?? "Mentor@12345";
  const name = process.env.SEED_MENTOR_NAME ?? "Head Mentor";

  const passwordHash = await bcrypt.hash(password, 12);

  const mentor = await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, role: "MENTOR" },
    create: { name, email, passwordHash, role: "MENTOR" },
    select: { id: true, email: true, role: true },
  });

  console.log("Mentor ready:", mentor);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
