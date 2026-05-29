import { oracleDb } from './src/infrastructure/database/oracle-connection';
import bcrypt from 'bcryptjs';

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function main() {
  console.log('Testing Oracle Connection...');
  await oracleDb.raw('SELECT 1 FROM DUAL');
  console.log('Connected to Oracle Successfully.');

  console.log('Resetting and Seeding data...');

  // Limpiar tablas (ignorar errores si no hay datos)
  try {
    await oracleDb('ErrorLogs').del();
    await oracleDb('StockMovements').del();
    await oracleDb('SaleDetails').del();
    await oracleDb('Sales').del();
    await oracleDb('Products').del();
    await oracleDb('Customers').del();
    await oracleDb('Users').del();
    await oracleDb('Roles').del();
    await oracleDb('PaymentMethods').del();
  } catch(e) {
    console.log("Some tables were already empty or could not be truncated.");
  }

  // Roles
  const adminRoleId = generateUUID();
  const sellerRoleId = generateUUID();
  await oracleDb('Roles').insert([
    { id: adminRoleId, name: 'Administrator', description: 'Acceso total al sistema', createdAt: new Date(), updatedAt: new Date() },
    { id: sellerRoleId, name: 'Seller', description: 'Acceso a ventas y consultas', createdAt: new Date(), updatedAt: new Date() }
  ]);

  // Admin User
  const hashedAdminPassword = await bcrypt.hash('Admin123!', 10);
  await oracleDb('Users').insert({
    id: generateUUID(),
    username: 'admin',
    name: 'Admin',
    lastName: 'System',
    cedula: '0000000000',
    email: 'admin@pos.com',
    password: hashedAdminPassword,
    roleId: adminRoleId,
    isActive: 1,
    loginAttempts: 0,
    isLocked: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Seller User
  const sellerId = generateUUID();
  const hashedSellerPassword = await bcrypt.hash('Seller123!', 10);
  await oracleDb('Users').insert({
    id: sellerId,
    username: 'seller',
    name: 'Vendedor',
    lastName: 'Prueba',
    cedula: '1111111111',
    email: 'seller@pos.com',
    password: hashedSellerPassword,
    roleId: sellerRoleId,
    isActive: 1,
    loginAttempts: 0,
    isLocked: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Payment Methods
  const cashMethodId = generateUUID();
  const cardMethodId = generateUUID();
  await oracleDb('PaymentMethods').insert([
    { id: cashMethodId, name: 'Cash', isActive: 1, createdAt: new Date(), updatedAt: new Date() },
    { id: cardMethodId, name: 'Credit Card', isActive: 1, createdAt: new Date(), updatedAt: new Date() }
  ]);

  console.log('Generating 100,000 Customers...');
  let customers = [];
  for (let i = 1; i <= 100000; i++) {
    customers.push({
      id: `CUST-${i.toString().padStart(6, '0')}`,
      name: `Customer ${i}`,
      lastName: `Lastname ${i}`,
      phone: `09${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      address: `Address ${i}`,
      email: `customer${i}@example.com`,
      isActive: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    if (i % 1000 === 0) {
      await oracleDb.batchInsert('Customers', customers, 1000);
      customers = [];
      if (i % 10000 === 0) console.log(`Inserted ${i} customers...`);
    }
  }

  console.log('Generating 100,000 Products...');
  let products = [];
  const productIds = []; // Guardamos info para usarlos en las facturas
  for (let i = 1; i <= 100000; i++) {
    const id = generateUUID();
    const price = parseFloat((Math.random() * 1000 + 1).toFixed(2));
    const appliesIva = Math.random() > 0.2 ? 1 : 0;
    
    productIds.push({ id, price, appliesIva, code: `P-${i.toString().padStart(6, '0')}`, name: `Product ${i}` });
    
    products.push({
      id,
      code: `P-${i.toString().padStart(6, '0')}`,
      name: `Product ${i}`,
      price,
      stock: Math.floor(Math.random() * 500) + 10,
      appliesIva,
      isActive: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    if (i % 1000 === 0) {
      await oracleDb.batchInsert('Products', products, 1000);
      products = [];
      if (i % 10000 === 0) console.log(`Inserted ${i} products...`);
    }
  }

  console.log('Generating 100,000 Sales with Details...');
  let sales = [];
  let saleDetails = [];
  
  for (let i = 1; i <= 100000; i++) {
    const customerId = `CUST-${Math.floor(Math.random() * 100000 + 1).toString().padStart(6, '0')}`;
    const paymentMethodId = Math.random() > 0.5 ? cashMethodId : cardMethodId;
    
    // Generar entre 1 y 3 detalles por factura
    const numDetails = Math.floor(Math.random() * 3) + 1;
    let subtotal = 0;
    let iva = 0;
    
    for (let d = 0; d < numDetails; d++) {
      const product = productIds[Math.floor(Math.random() * productIds.length)];
      const quantity = Math.floor(Math.random() * 5) + 1;
      const detailSubtotal = product.price * quantity;
      subtotal += detailSubtotal;
      if (product.appliesIva) iva += detailSubtotal * 0.15; // Asumiendo IVA 15%
      
      saleDetails.push({
        id: generateUUID(),
        saleId: i, // ID secuencial
        productId: product.id,
        productName: product.name,
        productCode: product.code,
        quantity,
        price: product.price,
        subtotal: parseFloat(detailSubtotal.toFixed(2)),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    sales.push({
      id: i, // ID explícito para asegurar coherencia con los detalles (aunque usa IDENTITY)
      number: i.toString().padStart(6, '0'),
      date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)), // Fecha aleatoria en los últimos meses
      status: 'Confirmed',
      customerId,
      userId: sellerId,
      paymentMethodId,
      subtotal: parseFloat(subtotal.toFixed(2)),
      iva: parseFloat(iva.toFixed(2)),
      total: parseFloat((subtotal + iva).toFixed(2)),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    if (i % 1000 === 0) {
      await oracleDb.batchInsert('Sales', sales, 1000);
      await oracleDb.batchInsert('SaleDetails', saleDetails, 1000);
      sales = [];
      saleDetails = [];
      if (i % 10000 === 0) console.log(`Inserted ${i} sales and details...`);
    }
  }

  console.log('Oracle Seeding finished successfully. Have fun with 100,000 Sales!');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await oracleDb.destroy();
  });
