import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function main() {
  console.log('Testing MySQL Connection...');
  await prisma.$connect();
  console.log('Connected to MySQL Successfully.');

  console.log('Resetting Data...');
  try {
    await prisma.stockMovement.deleteMany({});
    await prisma.saleDetail.deleteMany({});
    await prisma.sale.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.customer.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.role.deleteMany({});
    await prisma.paymentMethod.deleteMany({});
  } catch (e) {
    console.log("Could not clear some tables or they were already empty.");
  }

  // Roles
  const adminRole = await prisma.role.create({
    data: { name: 'Administrator', description: 'Acceso total al sistema' }
  });
  const sellerRole = await prisma.role.create({
    data: { name: 'Seller', description: 'Acceso a ventas' }
  });

  // Users
  const hashedAdminPassword = await bcrypt.hash('Admin123!', 10);
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      name: 'Admin',
      lastName: 'System',
      cedula: '0000000000',
      email: 'admin@pos.com',
      password: hashedAdminPassword,
      roleId: adminRole.id
    }
  });

  const hashedSellerPassword = await bcrypt.hash('Seller123!', 10);
  const sellerUser = await prisma.user.create({
    data: {
      username: 'seller',
      name: 'Vendedor',
      lastName: 'Prueba',
      cedula: '1111111111',
      email: 'seller@pos.com',
      password: hashedSellerPassword,
      roleId: sellerRole.id
    }
  });

  // Payment Methods
  const cashMethod = await prisma.paymentMethod.create({ data: { name: 'Cash' } });
  const cardMethod = await prisma.paymentMethod.create({ data: { name: 'Credit Card' } });

  console.log('Generating 100,000 Customers...');
  let customersToInsert = [];
  for (let i = 1; i <= 100000; i++) {
    customersToInsert.push({
      id: `CUST-${i.toString().padStart(6, '0')}`,
      name: `Customer ${i}`,
      lastName: `Lastname ${i}`,
      phone: `09${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      address: `Address ${i}`,
      email: `customer${i}@example.com`,
    });
    
    if (customersToInsert.length === 1000) {
      await prisma.customer.createMany({ data: customersToInsert });
      customersToInsert = [];
      console.log(`Inserted ${i} customers...`);
    }
  }

  console.log('Generating 100,000 Products...');
  let productsToInsert = [];
  const productIds = []; // Cache for sales
  for (let i = 1; i <= 100000; i++) {
    const id = generateUUID();
    const price = parseFloat((Math.random() * 1000 + 1).toFixed(2));
    const appliesIva = Math.random() > 0.2;
    const code = `P-${i.toString().padStart(6, '0')}`;
    const name = `Product ${i}`;
    
    productIds.push({ id, price, appliesIva, code, name });
    
    productsToInsert.push({
      id,
      code,
      name,
      price,
      stock: Math.floor(Math.random() * 500) + 10,
      appliesIva,
    });
    
    if (productsToInsert.length === 1000) {
      await prisma.product.createMany({ data: productsToInsert });
      productsToInsert = [];
      console.log(`Inserted ${i} products...`);
    }
  }

  console.log('Generating 100,000 Sales with Details...');
  let salesToInsert = [];
  let saleDetailsToInsert = [];
  
  for (let i = 1; i <= 100000; i++) {
    const customerId = `CUST-${Math.floor(Math.random() * 100000 + 1).toString().padStart(6, '0')}`;
    const paymentMethodId = Math.random() > 0.5 ? cashMethod.id : cardMethod.id;
    
    const numDetails = Math.floor(Math.random() * 3) + 1;
    let subtotal = 0;
    let iva = 0;
    
    for (let d = 0; d < numDetails; d++) {
      const product = productIds[Math.floor(Math.random() * productIds.length)];
      const quantity = Math.floor(Math.random() * 5) + 1;
      const detailSubtotal = product.price * quantity;
      subtotal += detailSubtotal;
      if (product.appliesIva) iva += detailSubtotal * 0.15;
      
      saleDetailsToInsert.push({
        saleId: i,
        productId: product.id,
        productName: product.name,
        productCode: product.code,
        quantity,
        price: product.price,
        subtotal: parseFloat(detailSubtotal.toFixed(2)),
      });
    }

    salesToInsert.push({
      id: i,
      number: i.toString().padStart(6, '0'),
      date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
      status: 'Confirmed',
      customerId,
      userId: sellerUser.id,
      paymentMethodId,
      subtotal: parseFloat(subtotal.toFixed(2)),
      iva: parseFloat(iva.toFixed(2)),
      total: parseFloat((subtotal + iva).toFixed(2)),
    });

    if (salesToInsert.length === 500) {
      await prisma.sale.createMany({ data: salesToInsert });
      
      // Detalle puede ser más grande (1 a 3 por factura = ~1500 records), así que lo dividimos más si es necesario
      await prisma.saleDetail.createMany({ data: saleDetailsToInsert });
      
      salesToInsert = [];
      saleDetailsToInsert = [];
      console.log(`Inserted ${i} sales and details...`);
    }
  }

  console.log('MySQL Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  });
