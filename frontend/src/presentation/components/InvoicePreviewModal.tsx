import React from 'react';
import { Modal } from './Shared';
import { CheckCircle } from 'lucide-react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
  data: {
    client: any;
    details: any[];
    subtotal: number;
    iva: number;
    total: number;
  };
}

export const InvoicePreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, onConfirm, isSubmitting, data }) => {
  if (!data.client) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Previsualización de Factura">
      <div style={{ padding: '1rem', border: '1px solid var(--slate-200)', borderRadius: '8px', background: '#fff' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '1px dashed var(--slate-300)', paddingBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>POS SYSTEM S.A.</h3>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--slate-600)' }}>RUC: 1792345678001</p>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--slate-600)' }}>Documento Proforma (Previa)</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          <div>
            <strong>Cliente:</strong> {data.client.name} {data.client.lastName}<br />
            <strong>RUC/CI:</strong> {data.client.id}
          </div>
          <div className="text-right">
            <strong>Fecha:</strong> {new Date().toLocaleDateString()}<br />
            <strong>Hora:</strong> {new Date().toLocaleTimeString()}<br />
            <strong>Estado:</strong> BORRADOR
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--slate-200)' }}>
              <th className="text-right" style={{ padding: '0.5rem', textAlign: 'right' }}>Cant.</th>
              <th className="text-left" style={{ padding: '0.5rem', textAlign: 'left' }}>Descripción</th>
              <th className="text-right" style={{ padding: '0.5rem', textAlign: 'right' }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {data.details.filter(d => d.quantity > 0).map((d, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--slate-100)' }}>
                <td className="text-right" style={{ padding: '0.5rem', textAlign: 'right' }}>{d.quantity}</td>
                <td style={{ padding: '0.5rem', textAlign: 'left' }}>{d.productName}</td>
                <td className="text-right" style={{ padding: '0.5rem', textAlign: 'right' }}>${d.subtotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', borderTop: '2px solid var(--slate-200)', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', gap: '2rem', color: 'var(--slate-600)' }}>
            <span>Subtotal:</span>
            <strong>${data.subtotal.toFixed(2)}</strong>
          </div>
          <div style={{ display: 'flex', gap: '2rem', color: 'var(--slate-600)' }}>
            <span>IVA (15%):</span>
            <strong>${data.iva.toFixed(2)}</strong>
          </div>
          <div style={{ display: 'flex', gap: '2rem', fontSize: '1.2rem', color: 'var(--primary)', marginTop: '0.5rem' }}>
            <span>TOTAL:</span>
            <strong>${data.total.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
        <button onClick={onClose} className="btn-secondary" disabled={isSubmitting}>
          Regresar a Editar
        </button>
        <button onClick={onConfirm} className="btn-primary" style={{ background: isSubmitting ? 'var(--slate-400)' : 'var(--success)', cursor: isSubmitting ? 'not-allowed' : 'pointer' }} disabled={isSubmitting}>
          {isSubmitting ? 'Procesando...' : <><CheckCircle size={18} /> Emitir y Guardar (Generar PDF)</>}
        </button>
      </div>
    </Modal>
  );
};
