import { ISaleRepository, IProductRepository } from '../../../domain/repositories/index';
import { SaleStatus } from '../../../domain/entities/index';

export class UpdateSaleStatusUseCase {
  constructor(
    private saleRepo: ISaleRepository,
    private productRepo: IProductRepository
  ) {}

  async execute(id: number, status: SaleStatus, modifiedByName?: string) {
    const sale = await this.saleRepo.findById(id);
    if (!sale) throw new Error("Venta no encontrada.");

    if (sale.status === SaleStatus.Cancelled) {
      throw new Error("No se puede modificar una venta ya anulada.");
    }

    if (status === SaleStatus.Confirmed) {
      // Validate stock before confirming
      for (const detail of sale.details) {
        const product = await this.productRepo.findById(detail.productId);
        if (!product || product.stock < detail.quantity) {
          throw new Error(`Stock insuficiente para ${detail.productName} para confirmar la venta.`);
        }
      }
    }

    return this.saleRepo.updateStatus(id, status, modifiedByName);
  }
}
