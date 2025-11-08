const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log(" Starting seed...");

  // Roles (align with schema.prisma)
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin", description: "Administrator" },
  });
  const pmRole = await prisma.role.upsert({
    where: { name: "project_manager" },
    update: {},
    create: { name: "project_manager", description: "Project Manager" },
  });
  const memberRole = await prisma.role.upsert({
    where: { name: "team_member" },
    update: {},
    create: { name: "team_member", description: "Team Member" },
  });
  const salesRole = await prisma.role.upsert({
    where: { name: "sales_finance" },
    update: {},
    create: { name: "sales_finance", description: "Sales/Finance" },
  });

  // Users (fields must match User model: name?, email, password, roleId)
  const admin = await prisma.user.upsert({
    where: { email: "admin@oneflow.com" },
    update: {},
    create: {
      email: "admin@oneflow.com",
      password: await bcrypt.hash("admin123", 10),
      name: "Admin User",
      role: { connect: { id: adminRole.id } },
    },
  });

  const projectManager = await prisma.user.upsert({
    where: { email: "pm@oneflow.com" },
    update: {},
    create: {
      email: "pm@oneflow.com",
      password: await bcrypt.hash("pm123", 10),
      name: "John Manager",
      role: { connect: { id: pmRole.id } },
    },
  });

  const developer1 = await prisma.user.upsert({
    where: { email: "dev1@oneflow.com" },
    update: {},
    create: {
      email: "dev1@oneflow.com",
      password: await bcrypt.hash("dev123", 10),
      name: "Alice Developer",
      role: { connect: { id: memberRole.id } },
    },
  });

  const developer2 = await prisma.user.upsert({
    where: { email: "dev2@oneflow.com" },
    update: {},
    create: {
      email: "dev2@oneflow.com",
      password: await bcrypt.hash("dev123", 10),
      name: "Bob Developer",
      role: { connect: { id: memberRole.id } },
    },
  });

  const salesPerson = await prisma.user.upsert({
    where: { email: "sales@oneflow.com" },
    update: {},
    create: {
      email: "sales@oneflow.com",
      password: await bcrypt.hash("sales123", 10),
      name: "Sarah Sales",
      role: { connect: { id: salesRole.id } },
    },
  });

  console.log(" Roles and users created");

  console.log("\n Seed completed successfully!\n");
  console.log(" Test Accounts:");
  console.log("   Admin: admin@oneflow.com / admin123");
  console.log("   PM: pm@oneflow.com / pm123");
  console.log("   Dev: dev1@oneflow.com / dev123");
  console.log("   Dev: dev2@oneflow.com / dev123");
  console.log("   Sales: sales@oneflow.com / sales123\n");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(" Seed failed:", e);
    prisma.$disconnect();
    process.exit(1);
  });
