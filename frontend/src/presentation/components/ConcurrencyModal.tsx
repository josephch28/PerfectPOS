import React from 'react';
import { Modal } from './Shared';
import { AlertTriangle, Trash2, Edit2 } from 'lucide-react';

export interface ConcurrencyIssue {
  productId: string;
  productName: string;
  available: number;
  requested: number;
  message: string;
}

interface ConcurrencyModalProps {
  isOpen: boolean;
  issues: ConcurrencyIssue[];
  onClose: () => void;
  onRemoveItem: (productId: string) => void;
  onAdjustQuantity: (productId: string, newQuantity: number) => void;
}

export const ConcurrencyModal: React.FC<ConcurrencyModalProps> = ({
  isOpen,
  issues,
  onClose,
  onRemoveItem,
  onAdjustQuantity
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Problemas de Concurrencia (Stock Modificado)">
      <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <AlertTriangle color="#d97706" style={{ flexShrink: 0 }} />
        <p style={{ margin: 0, color: '#92400e', fontSize: '0.95rem' }}>
          <strong>¡Atención!</strong> El inventario de algunos productos cambió mientras preparabas esta factura. Por favor, resuelve los conflictos antes de proceder.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
        {issues.map((issue) => (
          <div key={issue.productId} style={{ border: '1px solid var(--slate-200)', borderRadius: '8px', padding: '1rem', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--slate-800)' }}>{issue.productName}</h4>
              <span style={{ background: '#fee2e2', color: '#991b1b', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                Stock Insuficiente
              </span>
            </div>
            
            <p style={{ margin: '0 0 1rem 0', color: 'var(--slate-600)', fontSize: '0.9rem' }}>
              Solicitaste <strong>{issue.requested}</strong> pero solo quedan <strong>{issue.available}</strong> disponibles.
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button 
                className="btn-secondary" 
                onClick={() => onRemoveItem(issue.productId)}
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
              >
                <Trash2 size={14} style={{ marginRight: '0.25rem' }} /> Eliminar de factura
              </button>
              
              {issue.available > 0 && (
                <button 
                  className="btn-primary" 
                  onClick={() => onAdjustQuantity(issue.productId, issue.available)}
                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                >
                  <Edit2 size={14} style={{ marginRight: '0.25rem' }} /> Ajustar a {issue.available}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-secondary" onClick={onClose}>Cerrar para revisar</button>
      </div>
    </Modal>
  );
};
