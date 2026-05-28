import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Resetting and Seeding data...')

  // Limpiar tablas
  await prisma.errorLog.deleteMany({});
  await prisma.stockMovement.deleteMany({});
  await prisma.saleDetail.deleteMany({});
  await prisma.sale.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.paymentMethod.deleteMany({});

  // Roles
  const adminRole = await prisma.role.create({
    data: { name: 'Administrator', description: 'Acceso total al sistema' }
  });
  const sellerRole = await prisma.role.create({
    data: { name: 'Seller', description: 'Acceso a ventas y consultas' }
  });

  // Admin User
  const hashedAdminPassword = await bcrypt.hash('Admin123!', 10);
  await prisma.user.create({
    data: {
      username: 'admin',
      name: 'Admin',
      lastName: 'System',
      email: 'admin@pos.com',
      password: hashedAdminPassword,
      roleId: adminRole.id
    }
  });

  // Seller User
  const hashedSellerPassword = await bcrypt.hash('Seller123!', 10);
  await prisma.user.create({
    data: {
      username: 'seller',
      name: 'Vendedor',
      lastName: 'Prueba',
      email: 'seller@pos.com',
      password: hashedSellerPassword,
      roleId: sellerRole.id
    }
  });

  // Payment Methods
  await prisma.paymentMethod.create({ data: { name: 'Cash' } });
  const cardPayment = await prisma.paymentMethod.create({ data: { name: 'Credit Card' } });

  console.log('Generating 100,000 Customers...');
  const customers = [];
  for (let i = 1; i <= 100000; i++) {
    customers.push({
      id: `CUST-${i.toString().padStart(6, '0')}`,
      name: `Customer ${i}`,
      lastName: `Lastname ${i}`,
      phone: `09${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      address: `Address ${i}`,
      email: `customer${i}@example.com`
    });
    if (i % 1000 === 0) {
      await prisma.customer.createMany({ data: customers });
      customers.length = 0;
      if (i % 10000 === 0) console.log(`Inserted ${i} customers...`);
    }
  }

  console.log('Generating 100,000 Products...');
  const products = [];
  for (let i = 1; i <= 100000; i++) {
    products.push({
      code: `P-${i.toString().padStart(6, '0')}`,
      name: `Product ${i}`,
      price: parseFloat((Math.random() * 1000 + 1).toFixed(2)),
      stock: Math.floor(Math.random() * 500) + 10,
      appliesIva: Math.random() > 0.2
    });
    if (i % 1000 === 0) {
      await prisma.product.createMany({ data: products });
      products.length = 0;
      if (i % 10000 === 0) console.log(`Inserted ${i} products...`);
    }
  }

  console.log('Seeding finished successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
