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
      const changedColor = '#d97706'; // Amber for audit changes

      // --- Helper: Detect if data changed and render accordingly ---
      const renderField = (label: string, snapshotValue: string, currentValue: string | undefined, x: number, y: number, labelWidth = 105) => {
        doc.fontSize(10).font('Helvetica').fillColor('#000000');
        doc.text(label, x, y);

        const valueX = x + labelWidth;
        const snapshot = snapshotValue || 'N/A';

        if (currentValue && currentValue !== snapshotValue) {
          // Snapshot value in bold
          doc.font('Helvetica-Bold').fillColor('#000000').text(snapshot, valueX, y, { continued: true });
          // Current value in amber parentheses
          doc.font('Helvetica').fillColor(changedColor).text(` (Actual: ${currentValue})`, { continued: false });
        } else {
          doc.font('Helvetica-Bold').fillColor('#000000').text(snapshot, valueX, y);
        }
      };

      // --- Detect changes for audit banner ---
      const customerChanged = sale.customer && (
        (sale.customerName && sale.customer.name !== sale.customerName) ||
        (sale.customerLastName && sale.customer.lastName !== sale.customerLastName) ||
        (sale.customerAddress && sale.customer.address !== sale.customerAddress) ||
        (sale.customerPhone && sale.customer.phone !== sale.customerPhone) ||
        (sale.customerEmail && sale.customer.email !== sale.customerEmail)
      );

      const sellerChanged = sale.user && sale.sellerName && 
        `${sale.user.name} ${sale.user.lastName}`.trim() !== sale.sellerName;

      const productsChanged = sale.details.some(d => 
        d.product && d.product.name !== d.productName
      );

      const hasChanges = customerChanged || sellerChanged || productsChanged || sale.modifiedByName;

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

      // --- Banner de Auditoría (si hay cambios) ---
      let currentY = 130;
      if (hasChanges) {
        doc.rect(50, currentY, 500, 20).fill('#fef3c7');
        doc.fontSize(8).font('Helvetica-Bold').fillColor('#92400e');
        doc.text('⚠ DATOS MODIFICADOS DESPUÉS DE LA EMISIÓN — DOCUMENTO DE AUDITORÍA', 60, currentY + 5, { width: 480, align: 'center' });
        currentY += 30;
      } else {
        currentY += 10;
      }

      // --- Información de la Factura (Fecha) ---
      doc.moveTo(50, currentY).lineTo(550, currentY).stroke(borderColor);
      
      currentY += 15;
      doc.fontSize(10).fillColor(secondaryColor).font('Helvetica-Bold');
      doc.text('FECHA Y HORA DE EMISIÓN:', 50, currentY);
      doc.font('Helvetica').fillColor('#000000');
      doc.text(new Date(sale.date).toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'medium' }), 220, currentY);

      // --- Sección de Cliente (con comparación snapshot vs actual) ---
      currentY += 30;
      const clientBoxHeight = customerChanged ? 110 : 95;
      doc.rect(50, currentY, 500, clientBoxHeight).stroke(borderColor);
      
      const clientY = currentY + 10;
      doc.fontSize(11).font('Helvetica-Bold').fillColor(primaryColor).text('DATOS DEL ADQUIRIENTE', 65, clientY);
      
      // Nombre del cliente: snapshot vs actual
      const snapshotFullName = `${sale.customerName || ''} ${sale.customerLastName || ''}`.trim();
      const currentFullName = sale.customer ? `${sale.customer.name} ${sale.customer.lastName}`.trim() : undefined;
      renderField('RAZÓN SOCIAL:', snapshotFullName, currentFullName, 65, clientY + 20);

      doc.fontSize(10).font('Helvetica').fillColor('#000000');
      doc.text('RUC / CÉDULA:', 65, clientY + 35);
      doc.text(`${sale.customerId || 'N/A'}`, 170, clientY + 35);

      // Dirección: snapshot vs actual
      renderField('DIRECCIÓN:', sale.customerAddress || 'N/A', sale.customer?.address, 65, clientY + 50);

      // Teléfono: snapshot vs actual
      renderField('TELÉFONO:', sale.customerPhone || 'N/A', sale.customer?.phone, 65, clientY + 65);

      // Email: snapshot vs actual
      renderField('EMAIL:', sale.customerEmail || 'N/A', sale.customer?.email, 350, clientY + 35, 55);

      // --- Tabla de Productos ---
      currentY += clientBoxHeight + 25;
      
      // Header de Tabla
      doc.rect(50, currentY, 500, 25).fill(primaryColor);
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#FFFFFF');
      doc.text('CANT.', 40, currentY + 7, { width: 50, align: 'right' });
      doc.text('DESCRIPCIÓN', 110, currentY + 7);
      doc.text('P. UNITARIO', 380, currentY + 7, { width: 80, align: 'right' });
      doc.text('TOTAL', 470, currentY + 7, { width: 70, align: 'right' });

      currentY += 25;
      doc.fillColor('#000000').font('Helvetica');

      // Filas (con comparación de nombre de producto)
      let rowHeight = 25;
      sale.details.forEach((item, index) => {
        const productNameChanged = item.product && item.product.name !== item.productName;
        const thisRowHeight = productNameChanged ? 35 : 25;
        const itemY = currentY;
        
        // Fondo alternado para filas
        if (index % 2 === 0) {
          doc.rect(50, itemY, 500, thisRowHeight).fill('#f1f5f9');
          doc.fillColor('#000000');
        }

        doc.font('Helvetica').fillColor('#000000');
        doc.text(item.quantity.toString(), 40, itemY + 7, { width: 50, align: 'right' });
        
        // Product name: snapshot vs actual
        if (productNameChanged) {
          doc.font('Helvetica-Bold').fillColor('#000000')
             .text(item.productName || 'N/A', 110, itemY + 4);
          doc.font('Helvetica').fontSize(8).fillColor(changedColor)
             .text(`(Actual: ${item.product!.name})`, 110, itemY + 18);
          doc.fontSize(10);
        } else {
          doc.text(item.productName || 'N/A', 110, itemY + 7);
        }

        doc.font('Helvetica').fillColor('#000000');
        doc.text(`$${item.price.toFixed(2)}`, 380, itemY + 7, { width: 80, align: 'right' });
        doc.text(`$${item.subtotal.toFixed(2)}`, 470, itemY + 7, { width: 70, align: 'right' });
        
        doc.moveTo(50, itemY + thisRowHeight).lineTo(550, itemY + thisRowHeight).stroke(borderColor);
        currentY += thisRowHeight;
      });

      // --- Resumen de Totales ---
      let totalsY = currentY + 20;

      // Asegurar que los totales no se salgan de la página
      if (totalsY > 700) {
        doc.addPage();
        totalsY = 50;
      }

      const totalsX = 350;
      doc.fontSize(10).font('Helvetica').fillColor('#000000');
      
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

      // --- Vendedor (con comparación snapshot vs actual) ---
      totalsY += 40;
      doc.fontSize(9).fillColor(secondaryColor).font('Helvetica');
      const sellerSnapshot = sale.sellerName || 'N/A';
      const sellerCurrent = sale.user ? `${sale.user.name} ${sale.user.lastName}`.trim() : undefined;
      
      if (sellerCurrent && sellerCurrent !== sellerSnapshot) {
        doc.font('Helvetica').fillColor(secondaryColor).text('VENDEDOR: ', 50, totalsY, { continued: true });
        doc.font('Helvetica-Bold').fillColor('#000000').text(sellerSnapshot, { continued: true });
        doc.font('Helvetica').fillColor(changedColor).text(` (Actual: ${sellerCurrent})`);
      } else {
        doc.text(`VENDEDOR: ${sellerSnapshot}`, 50, totalsY);
      }

      // --- Modificado por ---
      if (sale.modifiedByName) {
        totalsY += 15;
        doc.fontSize(9).fillColor(changedColor).font('Helvetica-Bold');
        doc.text(`MODIFICADO POR: ${sale.modifiedByName}`, 50, totalsY);
        doc.fillColor(secondaryColor).font('Helvetica');
      }

      // --- Pie de página ---
      doc.fontSize(8).fillColor(secondaryColor).font('Helvetica-Oblique');
      doc.text('Gracias por su compra. Documento generado automáticamente por POS SYSTEM.', 50, 780, { align: 'center' });

      doc.end();
    });
  }
}
