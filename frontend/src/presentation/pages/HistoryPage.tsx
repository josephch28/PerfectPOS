import React, { useState, useEffect } from 'react';
import type { Invoice } from '../../domain/entities';
import { InvoiceApi } from '../../infrastructure/api/ApiRepositories';
import { Pagination, Modal } from '../components/Shared';
import { useToast } from '../components/Toast';
import { Search, Eye, XCircle, Printer, FileText } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchField, setSearchField] = useState('number'); 
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Implement Debounce for search to avoid API spam on fast typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400); // 400ms delay
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    setPage(1); // Reset to page 1 on new search
  }, [debouncedSearch, searchField]);

  useEffect(() => {
    loadInvoices();
  }, [page, itemsPerPage, debouncedSearch, searchField]);

  const loadInvoices = async () => {
    try {
      const result = await InvoiceApi.findAll(page, itemsPerPage, debouncedSearch, searchField);
      setInvoices(result.data);
      setTotal(result.total);
    } catch (error) {
      showToast('Error al cargar el historial de facturas', 'error');
    }
  };

  const handleVoid = async (id: number) => {
    if (window.confirm('¿Está seguro de anular esta factura? Esta acción devolverá el stock a los productos.')) {
      try {
        await InvoiceApi.delete(id);
        showToast('Factura anulada correctamente', 'success');
        loadInvoices();
        setSelectedInvoice(null);
      } catch (error) {
        showToast('Error al anular la factura', 'error');
      }
    }
  };

  const handlePrint = async (id: number) => {
    try {
      const blob = await InvoiceApi.getPdf(id);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      showToast('Copia de factura generada', 'info');
    } catch (error) {
      showToast('Error al generar la copia del PDF', 'error');
    }
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>Historial de Facturación</h1>
        <p className="text-muted">Consulte, anule o descargue copias de sus facturas emitidas.</p>
      </header>
      
      <div className="card">
        <div className="input-group" style={{ maxWidth: '600px', marginBottom: '2rem' }}>
          <select value={searchField} onChange={(e) => setSearchField(e.target.value)}>
            <option value="number">Nº Factura</option>
            <option value="client">Cliente</option>
          </select>
          <input 
            type="text" 
            placeholder={`Buscar por ${searchField === 'number' ? 'número de factura' : 'nombre del cliente'}...`} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div style={{ padding: '0 1rem', display: 'flex', alignItems: 'center', background: 'var(--slate-50)' }}>
            <Search size={18} color="var(--slate-600)" />
          </div>
        </div>

        <table className="modern-table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Fecha de Emisión</th>
              <th>Cliente</th>
              <th className="text-right">Total USD</th>
              <th className="text-center">Estado</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id}>
                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{inv.number}</td>
                <td className="text-muted">
                  <div style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{new Date(inv.date).toLocaleDateString()}</div>
                  <div style={{ fontSize: '0.75rem' }}>{new Date(inv.date).toLocaleTimeString()}</div>
                </td>
                <td style={{ fontWeight: 500 }}>{inv.customer ? `${inv.customer.name} ${inv.customer.lastName}` : 'N/A'}</td>
                <td className="text-right" style={{ fontWeight: 700 }}>${inv.total.toFixed(2)}</td>
                <td className="text-center">
                  <span className={`badge ${inv.status === 'Confirmed' ? 'badge-active' : inv.status === 'Cancelled' ? 'badge-void' : 'badge-secondary'}`}>
                    {inv.status === 'Confirmed' ? 'CONFIRMADA' : inv.status === 'Cancelled' ? 'ANULADA' : 'BORRADOR'}
                  </span>
                </td>
                <td className="text-center">
                  <button 
                    onClick={() => setSelectedInvoice(inv)} 
                    className="btn-secondary" 
                    style={{ padding: '0.5rem', borderRadius: '6px' }}
                    title="Ver Detalle"
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    onClick={() => handlePrint(inv.id!)} 
                    className="btn-secondary" 
                    style={{ padding: '0.5rem', borderRadius: '6px', marginLeft: '0.5rem' }}
                    title="Imprimir Copia"
                  >
                    <Printer size={18} />
                  </button>
                  {inv.status === 'Confirmed' && (
                    <button 
                      onClick={() => handleVoid(inv.id!)} 
                      className="btn-secondary" 
                      style={{ padding: '0.5rem', borderRadius: '6px', color: 'var(--danger)', marginLeft: '0.5rem' }}
                      title="Anular Factura"
                    >
                      <XCircle size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <Pagination 
          currentPage={page} 
          totalItems={total} 
          itemsPerPage={itemsPerPage} 
          onPageChange={setPage} 
          onItemsPerPageChange={(limit) => {
            setItemsPerPage(limit);
            setPage(1);
          }}
        />
      </div>

      <Modal 
        isOpen={!!selectedInvoice} 
        onClose={() => setSelectedInvoice(null)} 
        title={`Factura Electrónica #${selectedInvoice?.number}`}
      >
        {selectedInvoice && (
          <div className="invoice-paper" style={{ padding: '1.5rem', boxShadow: 'none', border: '1px solid var(--slate-100)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '2px solid var(--slate-100)', paddingBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FileText size={24} color="var(--primary)" />
                <h2 style={{ margin: 0, fontSize: '1.1rem' }}>POS SYSTEM S.A.</h2>
              </div>
              <div className="text-right">
                <p style={{ margin: 0, fontWeight: 700 }}>
                  ESTADO: {selectedInvoice.status === 'Confirmed' ? 'CONFIRMADA' : selectedInvoice.status === 'Cancelled' ? 'ANULADA' : 'BORRADOR'}
                </p>
                <p className="text-muted" style={{ margin: 0, fontSize: '0.8rem' }}>{new Date(selectedInvoice.date).toLocaleString()}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem', padding: '1rem', background: 'var(--slate-50)', borderRadius: '8px' }}>
              <div>
                <p className="text-muted" style={{ margin: '0 0 0.2rem 0', fontSize: '0.7rem', fontWeight: 700 }}>ADQUIRIENTE</p>
                <p style={{ margin: 0, fontWeight: 600 }}>{selectedInvoice.customer ? `${selectedInvoice.customer.name} ${selectedInvoice.customer.lastName}` : 'N/A'}</p>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>ID: {selectedInvoice.customerId}</p>
              </div>
              <div className="text-right">
                <p className="text-muted" style={{ margin: '0 0 0.2rem 0', fontSize: '0.7rem', fontWeight: 700 }}>DOCUMENTO</p>
                <p style={{ margin: 0, fontWeight: 600 }}>Nº {selectedInvoice.number}</p>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>Moneda: USD</p>
              </div>
            </div>
            
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th className="text-right">P. Unit</th>
                  <th className="text-center">Cant.</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {(selectedInvoice.details || []).map((d, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{d.productName}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--slate-600)' }}>ID: {d.productId}</div>
                    </td>
                    <td className="text-right">${d.price.toFixed(2)}</td>
                    <td className="text-center">{d.quantity}</td>
                    <td className="text-right" style={{ fontWeight: 600 }}>${d.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
                {(!selectedInvoice.details || selectedInvoice.details.length === 0) && (
                  <tr>
                    <td colSpan={4} className="text-center text-muted" style={{ padding: '1rem' }}>
                      No se cargaron los detalles de esta factura.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            <div style={{ marginTop: '2rem', borderTop: '2px solid var(--slate-100)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '200px' }}>
                  <span className="text-muted">Subtotal:</span>
                  <span>${selectedInvoice.subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '200px' }}>
                  <span className="text-muted">IVA (15%):</span>
                  <span>${selectedInvoice.iva.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '200px', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--slate-200)' }}>
                  <span style={{ fontWeight: 800 }}>TOTAL:</span>
                  <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)' }}>${selectedInvoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={() => handlePrint(selectedInvoice.id!)} className="btn-primary">
                <Printer size={18} /> Imprimir Copia PDF
              </button>
              <button onClick={() => setSelectedInvoice(null)} className="btn-secondary">Cerrar</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
