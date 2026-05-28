import PDFDocument from 'pdfkit';
import { Sale } from '../../domain/entities/index';

export class PDFService {
  async generateInvoice(sale: Sale): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ 
        margin: 50,
        size: 'A4'
      });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // --- Estilos y Colores ---
      const primaryColor = '#2563eb';
      const secondaryColor = '#475569';
      const borderColor = '#e2e8f0';

      // --- Encabezado ---
      doc.rect(0, 0, 600, 120).fill('#f8fafc');
      
      doc.fillColor(primaryColor)
         .fontSize(24)
         .font('Helvetica-Bold')
         .text('POS SYSTEM S.A.', 50, 40);
      
      doc.fillColor(secondaryColor)
         .fontSize(10)
         .font('Helvetica')
         .text('RUC: 1792345678001', 50, 70)
         .text('Av. Amazonas y Naciones Unidas, Quito, Ecuador', 50, 85);

      doc.fillColor(primaryColor)
         .fontSize(16)
         .font('Helvetica-Bold')
         .text('FACTURA ELECTRÓNICA', 350, 45, { align: 'right' });
      
      doc.fillColor('#000000')
         .fontSize(12)
         .text(`Nº: ${sale.number}`, 350, 70, { align: 'right' });

      // --- Información de la Factura (Fecha) ---
      let currentY = 140;
      doc.moveTo(50, currentY).lineTo(550, currentY).stroke(borderColor);
      
      currentY += 15;
      doc.fontSize(10).fillColor(secondaryColor).font('Helvetica-Bold');
      doc.text('FECHA Y HORA DE EMISIÓN:', 50, currentY);
      doc.font('Helvetica').fillColor('#000000');
      doc.text(new Date(sale.date).toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'medium' }), 220, currentY);

      // --- Sección de Cliente ---
      currentY += 30;
      doc.rect(50, currentY, 500, 95).stroke(borderColor);
      
      const clientY = currentY + 10;
      doc.fontSize(11).font('Helvetica-Bold').fillColor(primaryColor).text('DATOS DEL ADQUIRIENTE', 65, clientY);
      
      doc.fontSize(10).fillColor('#000000').font('Helvetica');
      const customer = sale.customer || ({} as any);
      
      doc.text(`RAZÓN SOCIAL:`, 65, clientY + 20);
      doc.font('Helvetica-Bold').text(`${customer.name || ''} ${customer.lastName || ''}`, 170, clientY + 20);
      
      doc.font('Helvetica').text(`RUC / CÉDULA:`, 65, clientY + 35);
      doc.text(`${customer.id || sale.customerId || 'N/A'}`, 170, clientY + 35);

      doc.text(`DIRECCIÓN:`, 65, clientY + 50);
      doc.text(`${customer.address || 'N/A'}`, 170, clientY + 50);

      doc.text(`TELÉFONO:`, 65, clientY + 65);
      doc.text(`${customer.phone || 'N/A'}`, 170, clientY + 65);

      doc.text(`EMAIL:`, 350, clientY + 35);
      doc.text(`${customer.email || 'N/A'}`, 350, clientY + 50);

      // --- Tabla de Productos ---
      currentY += 120; // Espacio suficiente para no sobreponerse
      
      // Header de Tabla
      doc.rect(50, currentY, 500, 25).fill(primaryColor);
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#FFFFFF');
      doc.text('CANT.', 40, currentY + 7, { width: 50, align: 'right' });
      doc.text('DESCRIPCIÓN', 110, currentY + 7);
      doc.text('P. UNITARIO', 380, currentY + 7, { width: 80, align: 'right' });
      doc.text('TOTAL', 470, currentY + 7, { width: 70, align: 'right' });

      currentY += 25;
      doc.fillColor('#000000').font('Helvetica');

      // Filas
      sale.details.forEach((item, index) => {
        const itemY = currentY + (index * 25);
        
        // Fondo alternado para filas
        if (index % 2 === 0) {
          doc.rect(50, itemY, 500, 25).fill('#f1f5f9');
          doc.fillColor('#000000');
        }

        doc.text(item.quantity.toString(), 40, itemY + 7, { width: 50, align: 'right' });
        doc.text(item.productName || 'N/A', 110, itemY + 7);
        doc.text(`$${item.price.toFixed(2)}`, 380, itemY + 7, { width: 80, align: 'right' });
        doc.text(`$${item.subtotal.toFixed(2)}`, 470, itemY + 7, { width: 70, align: 'right' });
        
        doc.moveTo(50, itemY + 25).lineTo(550, itemY + 25).stroke(borderColor);
      });

      // --- Resumen de Totales ---
      const tableBottom = currentY + (sale.details.length * 25);
      let totalsY = tableBottom + 20;

      // Asegurar que los totales no se salgan de la página
      if (totalsY > 750) {
        doc.addPage();
        totalsY = 50;
      }

      const totalsX = 350;
      doc.fontSize(10).font('Helvetica');
      
      doc.text('SUBTOTAL:', totalsX, totalsY);
      doc.font('Helvetica-Bold').text(`$${sale.subtotal.toFixed(2)}`, 470, totalsY, { width: 70, align: 'right' });
      
      totalsY += 15;
      doc.font('Helvetica').text('IVA:', totalsX, totalsY);
      doc.font('Helvetica-Bold').text(`$${sale.iva.toFixed(2)}`, 470, totalsY, { width: 70, align: 'right' });
      
      totalsY += 20;
      doc.rect(totalsX - 10, totalsY - 5, 210, 30).fill(primaryColor);
      doc.fontSize(12).fillColor('#FFFFFF').font('Helvetica-Bold');
      doc.text('TOTAL A PAGAR:', totalsX, totalsY + 7);
      doc.text(`$${sale.total.toFixed(2)}`, 470, totalsY + 7, { width: 70, align: 'right' });

      // --- Vendedor ---
      totalsY += 40;
      doc.fontSize(9).fillColor(secondaryColor).font('Helvetica');
      doc.text(`VENDEDOR: ${sale.user ? sale.user.name + ' ' + sale.user.lastName : 'N/A'}`, 50, totalsY);

      // --- Pie de página ---
      doc.fontSize(8).fillColor(secondaryColor).font('Helvetica-Oblique');
      doc.text('Gracias por su compra. Documento generado automáticamente por POS SYSTEM.', 50, 780, { align: 'center' });

      doc.end();
    });
  }
}
