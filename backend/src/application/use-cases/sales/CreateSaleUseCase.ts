import { ISaleRepository, IProductRepository, ICustomerRepository, IUserRepository } from '../../../domain/repositories/index';
import { Sale, SaleStatus, SaleDetail } from '../../../domain/entities/index';

export class CreateSaleUseCase {
  constructor(
    private saleRepo: ISaleRepository,
    private productRepo: IProductRepository,
    private customerRepo: ICustomerRepository,
    private userRepo: IUserRepository
  ) {}

  async execute(saleData: Omit<Sale, 'number' | 'date'>) {
    // 1. Validation: No duplicates
    const productIds = saleData.details.map(d => d.productId);
    const uniqueProductIds = new Set(productIds);
    if (productIds.length !== uniqueProductIds.size) {
      throw new Error("No se permiten productos duplicados en la misma venta.");
    }

    // 2. Fetch Customer and User for Snapshotting
    const customer = await this.customerRepo.findById(saleData.customerId);
    if (!customer) throw new Error(`Cliente ${saleData.customerId} no encontrado.`);
    
    const user = await this.userRepo.findById(saleData.userId);
    if (!user) throw new Error(`Usuario ${saleData.userId} no encontrado.`);

    // 3. Validation: Stock (only if Confirmed)
    if (saleData.status === SaleStatus.Confirmed) {
      for (const detail of saleData.details) {
        const product = await this.productRepo.findById(detail.productId);
        if (!product) throw new Error(`Producto ${detail.productId} no encontrado.`);
        if (!product.isActive) throw new Error(`Producto ${product.name} está inactivo.`);
        if (product.stock < detail.quantity) {
          throw new Error(`Stock insuficiente para ${product.name}. Disponible: ${product.stock}, Solicitado: ${detail.quantity}`);
        }
      }
    }

    // 4. Generate Number
    const lastNumber = await this.saleRepo.getLastNumber();
    const nextNumber = (lastNumber + 1).toString().padStart(6, '0');

    // 5. Enrich details with historical data and calculate taxes
    let subtotal = 0;
    let totalIva = 0;

    const enrichedDetails: SaleDetail[] = await Promise.all(
      saleData.details.map(async d => {
        const product = await this.productRepo.findById(d.productId);
        if (!product) throw new Error(`Producto ${d.productId} no encontrado.`);
        
        const detailSubtotal = product.price * d.quantity;
        const detailIva = product.appliesIva ? (detailSubtotal * 0.15) : 0;
        
        subtotal += detailSubtotal;
        totalIva += detailIva;

        return {
          ...d,
          productName: product.name,
          productCode: product.code,
          price: product.price,
          subtotal: detailSubtotal
        };
      })
    );

    // 6. Build final Sale object with Snapshots
    const sale: Sale = {
      ...saleData,
      number: nextNumber,
      date: new Date(),
      status: saleData.status || SaleStatus.Confirmed, // Default to Confirmed for POS
      details: enrichedDetails,
      customerFirstName: customer.firstName,
      customerMiddleName: customer.middleName,
      customerFirstLastName: customer.firstLastName,
      customerSecondLastName: customer.secondLastName,
      customerAddress: customer.address,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      sellerFirstName: user.firstName,
      sellerMiddleName: user.middleName,
      sellerFirstLastName: user.firstLastName,
      sellerSecondLastName: user.secondLastName,
      subtotal,
      iva: totalIva,
      total: subtotal + totalIva
    };

    return this.saleRepo.create(sale);
  }
}
