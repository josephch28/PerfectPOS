import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: (reason?: 'close-button' | 'backdrop') => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose('backdrop'); }}>
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button onClick={() => onClose('close-button')} className="btn-secondary">X</button>
        </div>
        {children}
      </div>
    </div>
  );
};

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (limit: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalItems, 
  itemsPerPage, 
  onPageChange,
  onItemsPerPageChange
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  if (totalPages <= 1) return null;

  const renderPageButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      buttons.push(
        <button key={1} onClick={() => onPageChange(1)} className="pagination-button">1</button>
      );
      if (startPage > 2) {
        buttons.push(<span key="start-ellipsis" className="pagination-ellipsis">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button 
          key={i} 
          onClick={() => onPageChange(i)} 
          className={`pagination-button ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="end-ellipsis" className="pagination-ellipsis">...</span>);
      }
      buttons.push(
        <button key={totalPages} onClick={() => onPageChange(totalPages)} className="pagination-button">{totalPages}</button>
      );
    }

    return buttons;
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--slate-100)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--slate-600)', fontWeight: 500 }}>Filas por página:</span>
        <select 
          className="input-group" 
          style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid var(--slate-200)', background: 'white', cursor: 'pointer', outline: 'none' }}
          value={itemsPerPage}
          onChange={(e) => {
            if (onItemsPerPageChange) {
              onItemsPerPageChange(Number(e.target.value));
            }
          }}
          disabled={!onItemsPerPageChange}
        >
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={20}>20</option>
          <option value={30}>30</option>
        </select>
        <span style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginLeft: '1rem' }}>
          Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems}
        </span>
      </div>

      <div className="pagination-container" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
        <button 
          disabled={currentPage === 1} 
          onClick={() => onPageChange(currentPage - 1)}
          className="pagination-button"
          title="Anterior"
        >
          <ChevronLeft size={20} />
        </button>
        
        {renderPageButtons()}

        <button 
          disabled={currentPage === totalPages} 
          onClick={() => onPageChange(currentPage + 1)}
          className="pagination-button"
          title="Siguiente"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};
