import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const BUILTIN_PRESETS = [
  { label: "3 oz", oz: 3 },
  { label: "5 oz", oz: 5 },
  { label: "8 oz", oz: 8 },
  { label: "10 oz", oz: 10 },
  { label: "12 oz", oz: 12 },
];

async function createUserWithPresets(
  username: string,
  password: string,
  role: Role,
) {
  // Keep hashing inline so Docker runtime can seed without copying src/
  const passwordHash = await bcrypt.hash(password, 12);
  return prisma.user.create({
    data: {
      username,
      passwordHash,
      role,
      presets: {
        create: BUILTIN_PRESETS.map((preset) => ({
          ...preset,
          builtin: true,
        })),
      },
    },
  });
}

async function main() {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    throw new Error(
      "ADMIN_USERNAME and ADMIN_PASSWORD must be set to seed the initial admin.",
    );
  }

  const existingAdmin = await prisma.user.findFirst({
    where: { role: Role.ADMIN },
  });

  if (!existingAdmin) {
    await createUserWithPresets(adminUsername, adminPassword, Role.ADMIN);
    console.log(`Seeded admin user: ${adminUsername}`);
  } else {
    console.log("Admin user already exists; skipping admin seed.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
