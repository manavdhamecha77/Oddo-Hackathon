const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('\n📊 Checking Companies and Users...\n');

  const companies = await prisma.company.findMany({
    include: {
      users: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        }
      }
    }
  });

  if (companies.length === 0) {
    console.log('❌ No companies found in database\n');
    return;
  }

  companies.forEach((company, index) => {
    console.log(`Company ${index + 1}:`);
    console.log(`  ID (internal): ${company.id}`);
    console.log(`  Company ID: ${company.companyId}`);
    console.log(`  Name: ${company.name}`);
    console.log(`  Users: ${company.users.length}`);
    company.users.forEach(user => {
      console.log(`    - ${user.email} (${user.firstName} ${user.lastName})`);
    });
    console.log('');
  });

  console.log('✅ Check complete\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
