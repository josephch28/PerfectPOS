import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Seeding...');

  // 1. Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'Administrator' },
    update: {},
    create: { name: 'Administrator', description: 'Acceso total al sistema' }
  });

  const sellerRole = await prisma.role.upsert({
    where: { name: 'Seller' },
    update: {},
    create: { name: 'Seller', description: 'Solo operaciones de facturación' }
  });

  console.log('✅ Roles creados');

  // 2. Default User (Admin)
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      firstName: 'Admin',
      middleName: null,
      firstLastName: 'Root',
      secondLastName: null,
      email: 'admin@pos.com',
      password: hashedAdminPassword,
      roleId: adminRole.id
    }
  });

  // Seller User
  const hashedSellerPassword = await bcrypt.hash('seller123', 10);
  const sellerUser = await prisma.user.upsert({
    where: { username: 'seller' },
    update: {},
    create: {
      username: 'seller',
      firstName: 'Juan',
      middleName: 'Carlos',
      firstLastName: 'Perez',
      secondLastName: 'Gomez',
      email: 'seller@pos.com',
      password: hashedSellerPassword,
      roleId: sellerRole.id
    }
  });

  console.log('✅ Usuarios por defecto creados');

  // 3. Payment Methods
  const cash = await prisma.paymentMethod.upsert({
    where: { name: 'Efectivo' },
    update: {},
    create: { name: 'Efectivo' }
  });

  const card = await prisma.paymentMethod.upsert({
    where: { name: 'Tarjeta' },
    update: {},
    create: { name: 'Tarjeta' }
  });

  const transfer = await prisma.paymentMethod.upsert({
    where: { name: 'Transferencia' },
    update: {},
    create: { name: 'Transferencia' }
  });

  console.log('✅ Métodos de pago creados');

  // 4. Products (100)
  const productsData = [];
  const categories = ['Computador', 'Teclado', 'Mouse', 'Monitor', 'Cable', 'Audifonos'];
  const brands = ['Logitech', 'Asus', 'HP', 'Dell', 'Sony', 'Samsung'];
  
  for(let i=1; i<=100; i++) {
    const category = categories[i % categories.length];
    const brand = brands[i % brands.length];
    productsData.push({
      code: `PROD-${i.toString().padStart(4, '0')}`,
      name: `${category} ${brand} X${i}`,
      price: parseFloat(((Math.random() * 100) + 10).toFixed(2)),
      stock: Math.floor(Math.random() * 50) + 10,
      appliesIva: i % 5 !== 0 // 20% won't apply IVA
    });
  }

  // Insert using raw loop to avoid conflicts and get IDs back reliably for sales
  const productIds: string[] = [];
  for (const p of productsData) {
    const prod = await prisma.product.upsert({
      where: { code: p.code },
      update: {},
      create: p
    });
    productIds.push(prod.id);
  }
  console.log(`✅ 100 Productos creados`);

  // 5. Customers (100)
  const customersData = [];
  const firstNames = ['Jose', 'Maria', 'Carlos', 'Ana', 'Luis', 'Sofia', 'Pedro', 'Laura', 'Miguel', 'Carmen'];
  const middleNames = ['Alberto', 'Elena', 'Fernando', 'Isabel', 'Antonio', 'Patricia', 'Roberto', 'Victoria', null, null];
  const lastNames = ['Garcia', 'Martinez', 'Rodriguez', 'Lopez', 'Hernandez', 'Gonzalez', 'Perez', 'Sanchez', 'Ramirez', 'Torres'];
  const secondLastNames = ['Ruiz', 'Alvarez', 'Moreno', 'Munoz', 'Romero', 'Alonso', 'Gutierrez', 'Navarro', null, null];

  for(let i=1; i<=100; i++) {
    customersData.push({
      id: `0${100000000 + i}`, // Simulated Cedula
      firstName: firstNames[i % firstNames.length],
      middleName: middleNames[i % middleNames.length],
      firstLastName: lastNames[i % lastNames.length],
      secondLastName: secondLastNames[i % secondLastNames.length],
      phone: `099900${i.toString().padStart(4, '0')}`,
      address: `Av. Siempre Viva ${i}`,
      email: `cliente${i}@correo.com`
    });
  }

  const customerIds: string[] = [];
  for (const c of customersData) {
    const cust = await prisma.customer.upsert({
      where: { email: c.email },
      update: {},
      create: c
    });
    customerIds.push(cust.id);
  }
  console.log(`✅ 100 Clientes creados`);

  // 6. Sales (100)
  const salesMethods = [cash.id, card.id, transfer.id];
  const salesUsers = [adminUser.id, sellerUser.id];
  
  for(let i=1; i<=100; i++) {
    const cId = customerIds[i % customerIds.length];
    const customer = customersData.find(c => c.id === cId)!;
    
    const uId = salesUsers[i % 2];
    const user = uId === adminUser.id ? adminUser : sellerUser;
    
    const paymentMethodId = salesMethods[i % 3];
    
    // Choose 2 random products
    const p1Id = productIds[i % productIds.length];
    const p2Id = productIds[(i+1) % productIds.length];
    
    const p1 = productsData.find(p => p.code === `PROD-${((i % 100) || 100).toString().padStart(4, '0')}`)!;
    const p2 = productsData.find(p => p.code === `PROD-${(((i+1) % 100) || 100).toString().padStart(4, '0')}`)!;
    
    const subtotal = p1.price * 1 + p2.price * 2;
    const iva = (p1.appliesIva ? p1.price * 1 * 0.15 : 0) + (p2.appliesIva ? p2.price * 2 * 0.15 : 0);

    const saleNumber = i.toString().padStart(6, '0');

    await prisma.sale.upsert({
      where: { number: saleNumber },
      update: {},
      create: {
        number: saleNumber,
        status: 'Confirmed',
        customerId: customer.id,
        customerFirstName: customer.firstName,
        customerMiddleName: customer.middleName,
        customerFirstLastName: customer.firstLastName,
        customerSecondLastName: customer.secondLastName,
        customerAddress: customer.address,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        userId: user.id,
        sellerFirstName: user.firstName,
        sellerMiddleName: user.middleName,
        sellerFirstLastName: user.firstLastName,
        sellerSecondLastName: user.secondLastName,
        paymentMethodId,
        subtotal,
        iva,
        total: subtotal + iva,
        details: {
          create: [
            {
              productId: p1Id,
              productCode: p1.code,
              productName: p1.name,
              quantity: 1,
              price: p1.price,
              subtotal: p1.price * 1
            },
            {
              productId: p2Id,
              productCode: p2.code,
              productName: p2.name,
              quantity: 2,
              price: p2.price,
              subtotal: p2.price * 2
            }
          ]
        }
      }
    });
  }
  console.log(`✅ 100 Ventas creadadas`);

  console.log('🎉 Seeding Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
