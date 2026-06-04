const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- ADDING INDEXES ---');
  try {
    await prisma.$executeRawUnsafe(`CREATE INDEX Sale_customerName_idx ON Sale(customerName);`);
    console.log('Added customerName index');
  } catch(e) {
    console.log('Index customerName may already exist', e.message);
  }

  try {
    await prisma.$executeRawUnsafe(`CREATE INDEX Sale_customerLastName_idx ON Sale(customerLastName);`);
    console.log('Added customerLastName index');
  } catch(e) {
    console.log('Index customerLastName may already exist', e.message);
  }
  await prisma.$disconnect();
  console.log('--- DONE ---');
}
main();
