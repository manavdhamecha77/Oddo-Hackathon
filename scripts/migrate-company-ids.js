const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function generateCompanyId() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  
  let prefix = '';
  for (let i = 0; i < 3; i++) {
    prefix += letters[Math.floor(Math.random() * letters.length)];
  }
  
  let suffix = '';
  for (let i = 0; i < 5; i++) {
    suffix += numbers[Math.floor(Math.random() * numbers.length)];
  }
  
  return `${prefix}-${suffix}`;
}

async function generateUniqueCompanyId() {
  let companyId;
  let exists = true;
  let attempts = 0;
  
  while (exists && attempts < 10) {
    companyId = generateCompanyId();
    const existing = await prisma.company.findUnique({
      where: { companyId }
    });
    exists = !!existing;
    attempts++;
  }
  
  if (attempts >= 10) {
    throw new Error('Failed to generate unique company ID');
  }
  
  return companyId;
}

async function main() {
  console.log('\n🔄 Migrating Company IDs...\n');

  const companies = await prisma.company.findMany();

  // Filter companies with old CUID format (contains lowercase letters and longer than 10 chars)
  const oldCompanies = companies.filter(c => 
    c.companyId.length > 10 || c.companyId.includes('cmh') || !c.companyId.includes('-')
  );

  if (oldCompanies.length === 0) {
    console.log('✅ All companies already have new format IDs\n');
    return;
  }

  console.log(`Found ${oldCompanies.length} companies with old format IDs:\n`);

  for (const company of oldCompanies) {
    const oldId = company.companyId;
    const newId = await generateUniqueCompanyId();
    
    try {
      await prisma.company.update({
        where: { id: company.id },
        data: { companyId: newId }
      });
      
      console.log(`✅ Updated "${company.name}"`);
      console.log(`   Old: ${oldId}`);
      console.log(`   New: ${newId}`);
      console.log('');
    } catch (error) {
      console.error(`❌ Failed to update ${company.name}:`, error.message);
    }
  }

  console.log('✅ Migration complete!\n');
  console.log('⚠️  IMPORTANT: Notify users of their new Company IDs!\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
