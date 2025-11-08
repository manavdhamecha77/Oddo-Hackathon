import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/roleGuard";
import { NextResponse } from "next/server";
import { generateRandomPassword } from "@/lib/password";
import { sendWelcomeEmail } from "@/lib/mailer";
import bcrypt from "bcrypt";

// Helper function to parse CSV
function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV file must contain at least a header row and one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  // Validate headers
  if (!headers.includes('name') || !headers.includes('email') || !headers.includes('role')) {
    throw new Error('CSV must contain "name", "email", and "role" columns');
  }

  const nameIndex = headers.indexOf('name');
  const emailIndex = headers.indexOf('email');
  const roleIndex = headers.indexOf('role');

  const users = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    const values = line.split(',').map(v => v.trim());
    const fullName = values[nameIndex];
    const email = values[emailIndex];
    const role = values[roleIndex];

    if (fullName && email && role) {
      // Split name into firstName and lastName
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      users.push({ firstName, lastName, email, role, fullName });
    }
  }

  return users;
}

export async function POST(req) {
  try {
    // Verify user is admin
    const userToken = await getUserFromRequest(req);
    if (!userToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userToken.id },
      include: { role: true, company: true },
    });

    if (!user || user.role.name !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Read file content
    const text = await file.text();
    
    // Parse CSV
    let users;
    try {
      users = parseCSV(text);
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (users.length === 0) {
      return NextResponse.json({ error: "No valid users found in CSV" }, { status: 400 });
    }

    // Get all available roles
    const roles = await prisma.role.findMany();
    const roleMap = {};
    roles.forEach(role => {
      roleMap[role.name.toLowerCase()] = role.id;
      // Also map display names (e.g., "project_manager" -> "project manager")
      roleMap[role.name.toLowerCase().replace(/_/g, ' ')] = role.id;
    });

    // Process each user
    const results = {
      total: users.length,
      successful: 0,
      failed: 0,
      errors: [],
      createdUsers: []
    };

    for (const userData of users) {
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ 
          where: { email: userData.email } 
        });

        if (existingUser) {
          results.failed++;
          results.errors.push(`${userData.email}: User already exists`);
          continue;
        }

        // Get role ID from role name
        const roleName = userData.role.toLowerCase();
        const roleId = roleMap[roleName];

        if (!roleId) {
          results.failed++;
          results.errors.push(`${userData.email}: Invalid role "${userData.role}". Valid roles: project_manager, team_member, sales_finance`);
          continue;
        }

        // Generate random password
        const randomPassword = generateRandomPassword(12);
        const passwordHash = await bcrypt.hash(randomPassword, 10);

        // Create user and invitation in a transaction
        const result = await prisma.$transaction(async (tx) => {
          // Create the user
          const newUser = await tx.user.create({
            data: {
              email: userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              passwordHash,
              companyId: user.companyId,
              roleId: roleId,
            },
            include: {
              role: true,
              company: true,
            },
          });

          // Create invitation record for tracking
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 7);

          await tx.invitation.create({
            data: {
              email: userData.email,
              companyId: user.companyId,
              roleId: roleId,
              invitedBy: user.id,
              expiresAt,
              status: "accepted",
              acceptedAt: new Date(),
            },
          });

          return { newUser, password: randomPassword };
        });

        // Send welcome email with credentials
        const emailResult = await sendWelcomeEmail({
          to: result.newUser.email,
          companyId: result.newUser.company.companyId,
          companyName: result.newUser.company.name,
          email: result.newUser.email,
          password: result.password,
          role: result.newUser.role.name,
        });

        results.successful++;
        results.createdUsers.push({
          email: userData.email,
          name: userData.fullName,
          emailSent: emailResult.success
        });

      } catch (error) {
        results.failed++;
        results.errors.push(`${userData.email}: ${error.message}`);
        console.error(`Error creating user ${userData.email}:`, error);
      }
    }

    return NextResponse.json({
      message: `Processed ${results.total} users: ${results.successful} successful, ${results.failed} failed`,
      ...results
    });

  } catch (error) {
    console.error("Bulk invite error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
