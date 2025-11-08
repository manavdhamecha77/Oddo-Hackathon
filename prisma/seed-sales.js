const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Seeding sales data...')

    // Create sample customers
    const customers = await Promise.all([
        prisma.partner.upsert({
            where: { id: 1 },
            update: {},
            create: {
                name: 'Acme Corporation',
                type: 'customer',
                email: 'contact@acme.com',
                phone: '+1-555-0100',
                address: '123 Business St, New York, NY 10001',
            },
        }),
        prisma.partner.upsert({
            where: { id: 2 },
            update: {},
            create: {
                name: 'TechStart Inc',
                type: 'customer',
                email: 'info@techstart.com',
                phone: '+1-555-0200',
                address: '456 Innovation Ave, San Francisco, CA 94102',
            },
        }),
        prisma.partner.upsert({
            where: { id: 3 },
            update: {},
            create: {
                name: 'Global Solutions Ltd',
                type: 'both',
                email: 'sales@globalsolutions.com',
                phone: '+1-555-0300',
                address: '789 Commerce Blvd, Chicago, IL 60601',
            },
        }),
    ])

    console.log(`Created ${customers.length} customers`)

    // Create sample products
    const products = await Promise.all([
        prisma.product.upsert({
            where: { id: 1 },
            update: {},
            create: {
                name: 'Web Development Service',
                description: 'Custom web application development',
                unitPrice: 150.00,
                costPrice: 80.00,
                isService: true,
            },
        }),
        prisma.product.upsert({
            where: { id: 2 },
            update: {},
            create: {
                name: 'Mobile App Development',
                description: 'iOS and Android app development',
                unitPrice: 180.00,
                costPrice: 100.00,
                isService: true,
            },
        }),
        prisma.product.upsert({
            where: { id: 3 },
            update: {},
            create: {
                name: 'UI/UX Design',
                description: 'User interface and experience design',
                unitPrice: 120.00,
                costPrice: 60.00,
                isService: true,
            },
        }),
        prisma.product.upsert({
            where: { id: 4 },
            update: {},
            create: {
                name: 'Consulting Hours',
                description: 'Technical consulting and advisory',
                unitPrice: 200.00,
                costPrice: 120.00,
                isService: true,
            },
        }),
        prisma.product.upsert({
            where: { id: 5 },
            update: {},
            create: {
                name: 'Software License',
                description: 'Annual software license',
                unitPrice: 999.00,
                costPrice: 500.00,
                isService: false,
            },
        }),
    ])

    console.log(`Created ${products.length} products`)
    console.log('Seeding completed!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
