import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log('Seeding data...');
    // Clientes
    await prisma.client.createMany({
        data: [
            {
                name: 'Juan',
                lastName: 'Perez',
                phone: '0987654321',
                address: 'Av. Siempre Viva 123',
                email: 'juan.perez@example.com',
            },
            {
                name: 'Maria',
                lastName: 'Garcia',
                phone: '0912345678',
                address: 'Calle Falsa 456',
                email: 'maria.garcia@example.com',
            },
            {
                name: 'Carlos',
                lastName: 'Rodriguez',
                phone: '0998877665',
                address: 'Barrio Central 789',
                email: 'carlos.rod@example.com',
            }
        ],
    });
    // Productos
    await prisma.product.createMany({
        data: [
            {
                name: 'Laptop Gamer',
                price: 1200.00,
                stock: 10,
                appliesIva: true,
            },
            {
                name: 'Mouse Optico',
                price: 25.50,
                stock: 50,
                appliesIva: true,
            },
            {
                name: 'Monitor 24"',
                price: 180.00,
                stock: 15,
                appliesIva: true,
            },
            {
                name: 'Teclado Mecanico',
                price: 85.00,
                stock: 20,
                appliesIva: true,
            },
            {
                name: 'Manzanas (Kg)',
                price: 2.50,
                stock: 100,
                appliesIva: false,
            },
            {
                name: 'Pan Integral',
                price: 1.20,
                stock: 40,
                appliesIva: false,
            }
        ],
    });
    console.log('Seeding finished.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
