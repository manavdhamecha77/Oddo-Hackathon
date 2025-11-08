/**
 * Generate a random, user-friendly company ID
 * Format: XXX-XXXXX (e.g., ABC-12345)
 * - First 3 characters: Uppercase letters
 * - Last 5 characters: Numbers
 * @returns {string} Generated company ID
 */
export function generateCompanyId() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  
  // Generate 3 random letters
  let prefix = '';
  for (let i = 0; i < 3; i++) {
    prefix += letters[Math.floor(Math.random() * letters.length)];
  }
  
  // Generate 5 random numbers
  let suffix = '';
  for (let i = 0; i < 5; i++) {
    suffix += numbers[Math.floor(Math.random() * numbers.length)];
  }
  
  return `${prefix}-${suffix}`;
}

/**
 * Generate a unique company ID that doesn't exist in database
 * @param {PrismaClient} prisma - Prisma client instance
 * @returns {Promise<string>} Unique company ID
 */
export async function generateUniqueCompanyId(prisma) {
  let companyId;
  let exists = true;
  let attempts = 0;
  const maxAttempts = 10;
  
  while (exists && attempts < maxAttempts) {
    companyId = generateCompanyId();
    
    // Check if this ID already exists
    const existing = await prisma.company.findUnique({
      where: { companyId }
    });
    
    exists = !!existing;
    attempts++;
  }
  
  if (attempts >= maxAttempts) {
    throw new Error('Failed to generate unique company ID after multiple attempts');
  }
  
  return companyId;
}
