const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProjects() {
  try {
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
      },
    });

    console.log('\n=== Projects in Database ===\n');
    
    if (projects.length === 0) {
      console.log('No projects found in the database.');
      console.log('\nYou need to create a project first!');
      console.log('Visit: http://localhost:3000/dashboard/projects and click "Create Project"');
    } else {
      projects.forEach((project) => {
        console.log(`ID: ${project.id}`);
        console.log(`Name: ${project.name}`);
        console.log(`Description: ${project.description || 'N/A'}`);
        console.log(`Status: ${project.status}`);
        console.log(`URL: http://localhost:3000/dashboard/projects/${project.id}`);
        console.log('---');
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProjects();
