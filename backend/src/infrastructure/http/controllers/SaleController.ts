import { Request, Response } from 'express';
import { CreateSaleUseCase, ListSalesUseCase, UpdateSaleStatusUseCase, GetSaleByIdUseCase } from '../../../application/use-cases/index';
import { PDFService } from '../../pdf/PDFService';
import { SaleStatus } from '../../../domain/entities/index';
import { PrismaClient } from '@prisma/client';

export class SaleController {
  constructor(
    private createSale: CreateSaleUseCase,
    private listSales: ListSalesUseCase,
    private updateStatus: UpdateSaleStatusUseCase,
    private getSale: GetSaleByIdUseCase,
    private pdfService: PDFService
  ) {}

  async getSales(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const searchField = req.query.searchField as string;
    const result = await this.listSales.execute(page, limit, search, searchField);
    res.json(result);
  }

  async postSale(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      
      // Get Default Payment Method (Cash)
      const prisma = new PrismaClient();
      const cashMethod = await prisma.paymentMethod.findFirst({
        where: { name: { contains: 'Cash' } }
      });
      await prisma.$disconnect();

      if (!cashMethod) throw new Error("Método de pago 'Efectivo' (Cash) no encontrado en el sistema.");

      const sale = await this.createSale.execute({ 
        ...req.body, 
        userId, 
        paymentMethodId: cashMethod.id 
      });
      
      res.status(201).json(sale);
    } catch (error: any) {
      console.error("Error creating sale:", error);
      res.status(400).json({ message: error.message });
    }
  }

  async getSalePdf(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      const sale = await this.getSale.execute(id);

      if (!sale) return res.status(404).json({ message: "Venta no encontrada" });

      const pdfBuffer = await this.pdfService.generateInvoice(sale as any);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=sale-${sale.number}.pdf`);
      res.send(pdfBuffer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async cancelSale(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      await this.updateStatus.execute(id, SaleStatus.Cancelled);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async confirmSale(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      await this.updateStatus.execute(id, SaleStatus.Confirmed);
      res.status(200).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
