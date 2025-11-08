import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const roles = [
    { name: "Admin", description: "Full access" },
    { name: "User", description: "Basic user access" },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  console.log("✅ Default roles seeded");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
