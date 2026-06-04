const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- POPULATING SNAPSHOTS ---');
  try {
    console.log('Running MySQL data migration...');
    const result = await prisma.$executeRaw`
      UPDATE Sale s
      JOIN Customer c ON s.customerId = c.id
      JOIN User u ON s.userId = u.id
      SET 
        s.customerName = c.name,
        s.customerLastName = c.lastName,
        s.customerAddress = c.address,
        s.customerPhone = c.phone,
        s.customerEmail = c.email,
        s.sellerName = CONCAT(u.name, ' ', u.lastName)
      WHERE s.customerName IS NULL;
    `;
    console.log(`MySQL updated ${result} rows.`);
  } catch (err) {
    console.error('Error in MySQL migration:', err.message);
  }
  await prisma.$disconnect();
  console.log('--- DONE ---');
}
main();
