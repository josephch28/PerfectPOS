import { PrismaClient } from '@prisma/client';
import { oracleDb } from './src/infrastructure/database/oracle-connection';

const prisma = new PrismaClient();

async function main() {
  console.log('--- POPULATING SNAPSHOTS ---');

  // 1. MySQL (Prisma)
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
  } catch (err: any) {
    console.error('Error in MySQL migration:', err.message);
  }

  // 2. Oracle
  try {
    console.log('Running Oracle data migration...');
    await oracleDb.raw(`
      UPDATE "Sales" s
      SET 
        "customerName" = (SELECT "name" FROM "Customers" c WHERE c."id" = s."customerId"),
        "customerLastName" = (SELECT "lastName" FROM "Customers" c WHERE c."id" = s."customerId"),
        "customerAddress" = (SELECT "address" FROM "Customers" c WHERE c."id" = s."customerId"),
        "customerPhone" = (SELECT "phone" FROM "Customers" c WHERE c."id" = s."customerId"),
        "customerEmail" = (SELECT "email" FROM "Customers" c WHERE c."id" = s."customerId"),
        "sellerName" = (SELECT "name" || ' ' || "lastName" FROM "Users" u WHERE u."id" = s."userId")
      WHERE "customerName" IS NULL
    `);
    console.log('Oracle updated successfully (note: check DB connection).');
  } catch (err: any) {
    if (err.message.includes('NJS-510')) {
      console.log('Oracle DB is currently unreachable (Timeout). Skipping Oracle migration.');
    } else {
      console.error('Error in Oracle migration:', err.message);
    }
  }

  await prisma.$disconnect();
  try {
    await oracleDb.destroy();
  } catch {}
  
  console.log('--- DONE ---');
}

main();
