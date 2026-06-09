import React from 'react';
import { Modal } from './Shared';
import { AlertCircle } from 'lucide-react';

interface DuplicateProductModalProps {
  isOpen: boolean;
  productName: string;
  existingStock: number;
  onAddStock: () => void;
  onChangeName: () => void;
}

export const DuplicateProductModal: React.FC<DuplicateProductModalProps> = ({
  isOpen,
  productName,
  existingStock,
  onAddStock,
  onChangeName,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onChangeName} title="Producto Duplicado" zIndex={10001}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ color: 'var(--warning)', background: '#fffbeb', padding: '0.75rem', borderRadius: '50%' }}>
          <AlertCircle size={32} />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '1.05rem', color: 'var(--slate-700)', fontWeight: 500 }}>
            Ya existe un producto con el nombre "{productName}".
          </p>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--slate-500)' }}>
            Actualmente este producto tiene <strong>{existingStock}</strong> unidades en stock. ¿Desea sumar la nueva cantidad al inventario de este producto existente, o prefiere regresar y cambiar el nombre del producto nuevo?
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
        <button onClick={onChangeName} className="btn-secondary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
          Cambiar nombre
        </button>
        <button onClick={onAddStock} className="btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
          Sumar stock al existente
        </button>
      </div>
    </Modal>
  );
};
