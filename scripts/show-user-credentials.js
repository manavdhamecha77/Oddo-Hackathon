const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('\n📋 User Login Credentials\n');
  console.log('='.repeat(80));
  console.log('\n');

  const users = await prisma.user.findMany({
    include: {
      company: true,
      role: true
    },
    orderBy: {
      company: {
        name: 'asc'
      }
    }
  });

  if (users.length === 0) {
    console.log('❌ No users found in database\n');
    return;
  }

  let currentCompanyId = null;

  users.forEach((user) => {
    // Print company header when it changes
    if (currentCompanyId !== user.company.id) {
      if (currentCompanyId !== null) {
        console.log('');
      }
      console.log(`\n🏢 Company: ${user.company.name}`);
      console.log(`   Company ID: ${user.company.companyId}`);
      console.log(`   ${'─'.repeat(60)}`);
      currentCompanyId = user.company.id;
    }

    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'N/A';
    
    console.log(`\n   👤 ${fullName}`);
    console.log(`      Email: ${user.email}`);
    console.log(`      Role: ${user.role.name}`);
    console.log(`      Company ID: ${user.company.companyId}`);
    console.log(`      Status: ${user.isActive ? '✅ Active' : '❌ Inactive'}`);
  });

  console.log('\n');
  console.log('='.repeat(80));
  console.log(`\nTotal Users: ${users.length}`);
  console.log('\n⚠️  NOTE: Users need to use their NEW Company ID to login!\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
