import React, { useState, useEffect } from 'react';
import type { Client, Product, InvoiceDetail } from '../../domain/entities';
import { InvoiceApi } from '../../infrastructure/api/ApiRepositories';
import { ClientSearchModal, ProductSearchModal } from '../components/SearchModals';
import { InvoicePreviewModal } from '../components/InvoicePreviewModal';
import { ConcurrencyModal, type ConcurrencyIssue } from '../components/ConcurrencyModal';
import { useToast } from '../components/Toast';
import { Modal } from '../components/Shared';
import { User, Package, FileText, Trash2, Plus, Info, Eye } from 'lucide-react';

export const InvoicePage: React.FC = () => {
  const { showToast } = useToast();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [details, setDetails] = useState<InvoiceDetail[]>([]);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  
  const [concurrencyIssues, setConcurrencyIssues] = useState<ConcurrencyIssue[]>([]);
  const [isConcurrencyModalOpen, setIsConcurrencyModalOpen] = useState(false);

  const [subtotal, setSubtotal] = useState(0);
  const [iva, setIva] = useState(0);
  const [total, setTotal] = useState(0);



  useEffect(() => {
    const totalSub = details.reduce((acc, d) => acc + d.subtotal, 0);
    const totalIva = details.reduce((acc, d) => acc + ((d as any).ivaAmount || 0), 0);
    setSubtotal(totalSub);
    setIva(totalIva);
    setTotal(totalSub + totalIva);
  }, [details]);

  const removeItem = (productId: string) => {
    setDetails(details.filter(d => d.productId !== productId));
    showToast('Producto eliminado de la factura', 'info');
  };

  const updateQuantity = (productId: string, value: string) => {
    // Si el valor está vacío, permitimos borrar para mejorar la UX
    if (value === '' || value === '0') {
      setDetails(details.map(d => d.productId === productId ? { ...d, quantity: 0, subtotal: 0, ivaAmount: 0 } as any : d));
      return;
    }

    const quantity = Math.max(1, parseInt(value) || 1);

    setDetails(details.map(d => {
      if (d.productId === productId) {
        const maxStock = (d as any).maxStock;

        // No permitir más del stock disponible
        if (quantity > maxStock) {
          showToast(`Solo hay ${maxStock} unidades disponibles para este producto.`, 'warning');
          return d;
        }

        const sub = d.price * quantity;
        const ivaAmt = (d as any).ivaAmountOriginal > 0 ? (sub * 0.15) : 0;
        return { ...d, quantity, subtotal: sub, ivaAmount: ivaAmt };
      }
      return d;
    }));
  };

  const addProduct = (product: Product) => {
    const existing = details.find(d => d.productId === product.id);
    if (existing) {
      if (existing.quantity + 1 > product.stock) {
        showToast('No hay más stock disponible para este producto.', 'error');
        return;
      }
      updateQuantity(product.id, (existing.quantity + 1).toString());
    } else {
      const ivaAmountOriginal = product.appliesIva ? (product.price * 0.15) : 0;
      setDetails([...details, {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: 1,
        subtotal: product.price,
        ivaAmount: ivaAmountOriginal,
        ivaAmountOriginal,
        maxStock: product.stock // guardamos el stock máximo
      } as any]);
      showToast('Producto añadido a la factura', 'success');
    }
    setIsProductModalOpen(false);
  };

  const handleFacturar = async () => {
    const validDetails = details.filter(d => d.quantity > 0);
    if (!selectedClient || validDetails.length === 0) {
      showToast('La factura debe tener al menos un producto con cantidad mayor a 0', 'warning');
      return;
    }
    try {
      const invoiceData = {
        customerId: selectedClient.id,
        subtotal,
        iva,
        total,
        details: validDetails.map(d => ({
          productId: d.productId,
          quantity: d.quantity,
          price: d.price,
          subtotal: d.subtotal
        }))
      };
      setIsSubmitting(true);
      const sale = await InvoiceApi.create(invoiceData);

      // Ahora obtenemos el PDF usando el ID de la venta creada
      const blob = await InvoiceApi.getPdf(sale.id);

      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');

      setSelectedClient(null);
      setDetails([]);
      setIsPreviewModalOpen(false);
      showToast('Factura generada con éxito', 'success');
    } catch (error: any) {
      console.error(error);
      let errorMessage = 'Error al generar la factura. Verifique el stock disponible.';
      
      if (error.response && error.response.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const json = JSON.parse(text);
          if (json.message) {
            try {
              const nestedObj = JSON.parse(json.message);
              if (nestedObj.type === 'CONCURRENCY_ERROR') {
                setConcurrencyIssues(nestedObj.issues);
                setIsConcurrencyModalOpen(true);
                setIsPreviewModalOpen(false);
                return; // Do not show generic error toast
              } else {
                errorMessage = json.message;
              }
            } catch (e) {
              errorMessage = json.message;
            }
          }
        } catch (e) {
          console.error("Error parsing error blob", e);
        }
      } else if (error.response && error.response.data && error.response.data.message) {
        try {
          const nestedObj = JSON.parse(error.response.data.message);
          if (nestedObj.type === 'CONCURRENCY_ERROR') {
            setConcurrencyIssues(nestedObj.issues);
            setIsConcurrencyModalOpen(true);
            setIsPreviewModalOpen(false);
            return;
          } else {
            errorMessage = error.response.data.message;
          }
        } catch(e) {
          errorMessage = error.response.data.message;
        }
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            Nueva Factura
          </h1>
          <p className="text-muted" style={{ marginTop: '0.5rem' }}>Complete los datos para generar un nuevo comprobante electrónico.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setIsClientModalOpen(true)} className="btn-secondary" style={{ padding: '0.75rem 1.25rem' }}>
            <User size={18} /> {selectedClient ? 'Cambiar Cliente' : 'Seleccionar Cliente'}
          </button>
          <button onClick={() => setIsProductModalOpen(true)} className="btn-primary" style={{ padding: '0.75rem 1.25rem' }}>
            <Plus size={18} /> Agregar Producto
          </button>
        </div>
      </header>

      <main className="main-layout">
        <section className="invoice-paper">
          {/* Invoice Header Simulation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '2px solid var(--slate-100)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'var(--primary)', color: 'white', padding: '1rem', borderRadius: '12px' }}>
                <FileText size={32} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>POS SYSTEM S.A.</h2>
                <p className="text-muted" style={{ margin: 0 }}>RUC: 1792345678001</p>
              </div>
            </div>
            <div className="text-right">
              <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '1rem' }}>FACTURA ELECTRÓNICA</h3>
              <p style={{ margin: '0.25rem 0', fontWeight: 600 }}>Nº: Auto-generado</p>
              <p className="text-muted" style={{ margin: 0 }}>Fecha: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Client Information Section */}
          <div style={{ background: 'var(--slate-50)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--slate-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--slate-600)' }}>
              <Info size={16} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Información del Adquiriente</span>
            </div>
            {selectedClient ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <p className="text-muted" style={{ margin: '0 0 0.25rem 0' }}>Nombre / Razón Social</p>
                  <p style={{ margin: 0, fontWeight: 600 }}>{`${selectedClient.firstName || ''} ${selectedClient.middleName || ''} ${selectedClient.firstLastName || ''} ${selectedClient.secondLastName || ''}`.replace(/\s+/g, ' ').trim()}</p>
                </div>
                <div>
                  <p className="text-muted" style={{ margin: '0 0 0.25rem 0' }}>Cédula / RUC</p>
                  <p style={{ margin: 0, fontWeight: 600 }}>{selectedClient.id}</p>
                </div>
                <div>
                  <p className="text-muted" style={{ margin: '0 0 0.25rem 0' }}>Teléfono</p>
                  <p style={{ margin: 0, fontWeight: 600 }}>{selectedClient.phone}</p>
                </div>
                <div>
                  <p className="text-muted" style={{ margin: '0 0 0.25rem 0' }}>Correo Electrónico</p>
                  <p style={{ margin: 0, fontWeight: 600 }}>{selectedClient.email}</p>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <p className="text-muted" style={{ margin: '0 0 0.25rem 0' }}>Dirección</p>
                  <p style={{ margin: 0, fontWeight: 600 }}>{selectedClient.address}</p>
                </div>
              </div>
            ) : (
              <div className="text-center" style={{ padding: '1rem', color: 'var(--danger)', fontWeight: 500 }}>
                ⚠️ Por favor, seleccione un cliente para continuar.
              </div>
            )}
          </div>

          {/* Products Table */}
          <table className="modern-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Descripción</th>
                <th className="text-right" style={{ width: '80px', textAlign: 'right' }}>Stock</th>
                <th className="text-right" style={{ width: '80px', textAlign: 'right' }}>Cant.</th>
                <th className="text-right" style={{ width: '120px', textAlign: 'right' }}>P. Unitario</th>
                <th className="text-right" style={{ width: '120px', textAlign: 'right' }}>Total</th>
                <th style={{ width: '50px' }}></th>
              </tr>
            </thead>
            <tbody>
              {details.map(d => (
                <tr key={d.productId}>
                  <td style={{ fontSize: '0.85rem', color: 'var(--slate-600)', fontWeight: 600 }}>{d.productId}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{d.productName}</div>
                  </td>
                  <td className="text-right" style={{ color: 'var(--slate-600)', fontWeight: 500, textAlign: 'right' }}>{(d as any).maxStock}</td>
                  <td className="text-right" style={{ textAlign: 'right' }}>
                    <input 
                      type="number" 
                      value={d.quantity || ''} 
                      onChange={(e) => updateQuantity(d.productId, e.target.value)}
                      onKeyDown={(e) => {
                        if (['-', '+', 'e', 'E'].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.value === '' || e.target.value === '0') {
                          setItemToDelete(d.productId);
                        }
                      }}
                      style={{ width: '100%', textAlign: 'right', border: '1px solid var(--slate-200)', borderRadius: '6px', padding: '0.4rem', fontWeight: 700 }}
                      min="1"
                    />
                  </td>
                  <td className="text-right" style={{ color: 'var(--slate-600)', textAlign: 'right' }}>${d.price.toFixed(2)}</td>
                  <td className="text-right" style={{ fontWeight: 700, textAlign: 'right' }}>${d.subtotal.toFixed(2)}</td>
                  <td className="text-center">
                    <button 
                      onClick={() => setItemToDelete(d.productId)} 
                      style={{ background: 'none', color: 'var(--danger)', padding: '0.5rem', borderRadius: '50%' }}
                      title="Eliminar item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {details.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center" style={{ padding: '4rem', color: 'var(--slate-300)' }}>
                    <Package size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>No hay productos en la factura</p>
                    <button onClick={() => setIsProductModalOpen(true)} className="btn-secondary" style={{ marginTop: '1rem' }}>
                      Explorar Productos
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

        </section>

        <aside style={{ position: 'sticky', top: '2rem' }}>
          <div className="card" style={{ padding: '2rem', border: '2px solid var(--slate-900)' }}>
            <h3 style={{ margin: '0 0 2rem 0', fontSize: '1.25rem', fontWeight: 800 }}>Resumen de Venta</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--slate-600)' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 600 }}>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--slate-600)' }}>
                <span>IVA (15%)</span>
                <span style={{ fontWeight: 600 }}>${iva.toFixed(2)}</span>
              </div>

              <div style={{ margin: '0.5rem 0', height: '1px', background: 'var(--slate-200)' }}></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <span style={{ fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total a Pagar</span>
                <span style={{ fontWeight: 900, fontSize: '2rem', color: 'var(--primary)', lineHeight: 1 }}>${total.toFixed(2)}</span>
              </div>

              <button
                onClick={() => setIsPreviewModalOpen(true)}
                className="btn-primary"
                style={{ width: '100%', marginTop: '1.5rem', padding: '1.25rem', fontSize: '1.1rem', borderRadius: '12px' }}
                disabled={!selectedClient || details.length === 0}
              >
                <Eye size={18} style={{ marginRight: '0.5rem' }} /> Previsualizar Factura
              </button>

              {!selectedClient && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#fff7ed', padding: '0.75rem', borderRadius: '8px', border: '1px solid #fed7aa', marginTop: '0.5rem' }}>
                  <Info size={16} color="var(--warning)" />
                  <span style={{ fontSize: '0.75rem', color: '#9a3412', fontWeight: 500 }}>Seleccione un cliente para habilitar el pago.</span>
                </div>
              )}
            </div>
          </div>

          <div className="text-center" style={{ marginTop: '1.5rem' }}>
            <p className="text-muted">¿Necesita ayuda? Contacte a soporte técnico.</p>
          </div>
        </aside>
      </main>

      <ClientSearchModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSelect={(c) => { setSelectedClient(c); setIsClientModalOpen(false); }}
      />

      <ProductSearchModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSelect={addProduct}
      />

      <InvoicePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        onConfirm={handleFacturar}
        isSubmitting={isSubmitting}
        data={{
          client: selectedClient,
          details,
          subtotal,
          iva,
          total
        }}
      />

      <Modal isOpen={!!itemToDelete} onClose={() => {
        // Si el usuario cancela y la cantidad era 0, restauramos a 1
        if (itemToDelete) {
          const item = details.find(d => d.productId === itemToDelete);
          if (item && item.quantity === 0) {
            updateQuantity(itemToDelete, '1');
          }
        }
        setItemToDelete(null);
      }} title="Confirmar Eliminación">
        <p style={{ margin: '0 0 1.5rem 0', color: 'var(--slate-700)' }}>¿Está seguro que desea eliminar este producto de la factura?</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button onClick={() => {
            if (itemToDelete) {
              const item = details.find(d => d.productId === itemToDelete);
              if (item && item.quantity === 0) {
                updateQuantity(itemToDelete, '1');
              }
            }
            setItemToDelete(null);
          }} className="btn-secondary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>Cancelar</button>
          <button onClick={() => { if(itemToDelete) removeItem(itemToDelete); setItemToDelete(null); }} className="btn-primary" style={{ background: 'var(--danger)', borderColor: 'var(--danger)', padding: '0.75rem 1.5rem', fontSize: '1rem' }}>Eliminar</button>
        </div>
      </Modal>
      <ConcurrencyModal
        isOpen={isConcurrencyModalOpen}
        issues={concurrencyIssues}
        onClose={() => setIsConcurrencyModalOpen(false)}
        onRemoveItem={(productId) => {
          removeItem(productId);
          setConcurrencyIssues(concurrencyIssues.filter(i => i.productId !== productId));
          if (concurrencyIssues.length <= 1) setIsConcurrencyModalOpen(false);
        }}
        onAdjustQuantity={(productId, newQuantity) => {
          updateQuantity(productId, newQuantity.toString());
          setConcurrencyIssues(concurrencyIssues.filter(i => i.productId !== productId));
          if (concurrencyIssues.length <= 1) setIsConcurrencyModalOpen(false);
        }}
      />

    </div>
  );
};
