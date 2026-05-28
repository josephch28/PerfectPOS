import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button onClick={onClose} className="btn-secondary">X</button>
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
}

export const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalItems, 
  itemsPerPage, 
  onPageChange 
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
    <div className="pagination-container">
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
  );
};
