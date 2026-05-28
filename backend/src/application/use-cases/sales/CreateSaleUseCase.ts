import { ISaleRepository, IProductRepository } from '../../../domain/repositories/index';
import { Sale, SaleStatus, SaleDetail } from '../../../domain/entities/index';

export class CreateSaleUseCase {
  constructor(
    private saleRepo: ISaleRepository,
    private productRepo: IProductRepository
  ) {}

  async execute(saleData: Omit<Sale, 'number' | 'date'>) {
    // 1. Validation: No duplicates
    const productIds = saleData.details.map(d => d.productId);
    const uniqueProductIds = new Set(productIds);
    if (productIds.length !== uniqueProductIds.size) {
      throw new Error("No se permiten productos duplicados en la misma venta.");
    }

    // 2. Validation: Stock (only if Confirmed)
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

    // 3. Generate Number
    const lastNumber = await this.saleRepo.getLastNumber();
    const nextNumber = (lastNumber + 1).toString().padStart(6, '0');

    // 4. Enrich details with historical data and calculate taxes
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

    // 5. Build final Sale object
    const sale: Sale = {
      ...saleData,
      number: nextNumber,
      date: new Date(),
      status: saleData.status || SaleStatus.Confirmed, // Default to Confirmed for POS
      details: enrichedDetails,
      subtotal,
      iva: totalIva,
      total: subtotal + totalIva
    };

    return this.saleRepo.create(sale);
  }
}
