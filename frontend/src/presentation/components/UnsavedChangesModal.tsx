import React from 'react';
import { Modal } from './Shared';
import { AlertCircle } from 'lucide-react';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
  message?: string;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  onSave,
  onDiscard,
  onCancel,
  message = "¿Desea guardar los cambios antes de salir?"
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Cambios sin guardar">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ color: 'var(--warning)', background: '#fffbeb', padding: '0.75rem', borderRadius: '50%' }}>
          <AlertCircle size={32} />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '1.05rem', color: 'var(--slate-700)', fontWeight: 500 }}>
            Hay cambios sin guardar.
          </p>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--slate-500)' }}>
            {message}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
        <button onClick={onCancel} className="btn-secondary">
          Cancelar
        </button>
        <button onClick={onDiscard} className="btn-secondary" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
          Salir sin guardar
        </button>
        <button onClick={onSave} className="btn-primary">
          Guardar cambios
        </button>
      </div>
    </Modal>
  );
};
