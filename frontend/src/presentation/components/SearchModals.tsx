import React, { useState, useEffect } from 'react';
import type { Client, Product } from '../../domain/entities';
import { ClientApi, ProductApi } from '../../infrastructure/api/ApiRepositories';
import { Modal, Pagination } from './Shared';
import { Search, Loader2 } from 'lucide-react';

interface ClientSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (client: Client) => void;
}

export const ClientSearchModal: React.FC<ClientSearchModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchField, setSearchField] = useState('name'); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadClients();
    }
  }, [isOpen, page, search, searchField]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const result = await ClientApi.findAll(page, search, searchField);
      setClients(result.data || []);
      setTotal(result.total || 0);
    } catch (error) {
      console.error("Error loading clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const fieldLabels: Record<string, string> = {
    name: 'Nombre',
    lastName: 'Apellido',
    cedula: 'Cédula/ID'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buscar Cliente">
      <div className="input-group">
        <select value={searchField} onChange={(e) => setSearchField(e.target.value)}>
          <option value="name">Nombre</option>
          <option value="lastName">Apellido</option>
          <option value="cedula">Cédula/ID</option>
        </select>
        <input 
          type="text" 
          placeholder={`Buscar por ${fieldLabels[searchField]}...`} 
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <div style={{ padding: '0 1rem', display: 'flex', alignItems: 'center', background: 'var(--slate-50)' }}>
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} color="var(--slate-600)" />}
        </div>
      </div>

      <table className="modal-table">
        <thead>
          <tr>
            <th>Cédula/ID</th>
            <th>Nombre Completo</th>
            <th className="text-center">Acción</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(c => (
            <tr key={c.id}>
              <td style={{ fontWeight: 600 }}>{c.id}</td>
              <td style={{ fontWeight: 500 }}>{c.name} {c.lastName}</td>
              <td className="text-center">

                <button onClick={() => onSelect(c)} className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                  Seleccionar
                </button>
              </td>
            </tr>
          ))}
          {!loading && clients.length === 0 && (
            <tr>
              <td colSpan={3} className="text-center text-muted" style={{ padding: '2rem' }}>No se encontraron clientes. Verifique que XAMPP esté iniciado.</td>
            </tr>
          )}
        </tbody>
      </table>
      <Pagination currentPage={page} totalItems={total} itemsPerPage={10} onPageChange={setPage} />
    </Modal>
  );
};

interface ProductSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (product: Product) => void;
}

export const ProductSearchModal: React.FC<ProductSearchModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchField, setSearchField] = useState('name');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen, page, search, searchField]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const result = await ProductApi.findAll(page, search, searchField);
      const inStockProducts = (result.data || []).filter((p: Product) => p.stock > 0);
      setProducts(inStockProducts);
      setTotal(result.total || 0); // Note: total might include out of stock items, but it's okay for pagination
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fieldLabels: Record<string, string> = {
    name: 'Nombre',
    id: 'ID'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buscar Producto">
      <div className="input-group">
        <select value={searchField} onChange={(e) => setSearchField(e.target.value)}>
          <option value="name">Nombre</option>
          <option value="id">ID</option>
        </select>
        <input 
          type="text" 
          placeholder={`Buscar por ${fieldLabels[searchField]}...`} 
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <div style={{ padding: '0 1rem', display: 'flex', alignItems: 'center', background: 'var(--slate-50)' }}>
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} color="var(--slate-600)" />}
        </div>
      </div>

      <table className="modal-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Descripción</th>
            <th className="text-right">Precio</th>
            <th className="text-right">Stock</th>
            <th className="text-center">Acción</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>{p.id}</td>
              <td>
                <div style={{ fontWeight: 500 }}>{p.name}</div>
              </td>
              <td className="text-right" style={{ fontWeight: 600 }}>${p.price.toFixed(2)}</td>
              <td className="text-right">
                <span className={`badge ${p.stock > 0 ? 'badge-active' : 'badge-void'}`}>
                  {p.stock} unid.
                </span>
              </td>
              <td className="text-center">
                <button 
                  onClick={() => onSelect(p)} 
                  className="btn-primary"
                  disabled={p.stock <= 0}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                >
                  {p.stock > 0 ? 'Seleccionar' : 'Sin Stock'}
                </button>
              </td>
            </tr>
          ))}
          {!loading && products.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center text-muted" style={{ padding: '2rem' }}>No se encontraron productos.</td>
            </tr>
          )}
        </tbody>
      </table>
      <Pagination currentPage={page} totalItems={total} itemsPerPage={10} onPageChange={setPage} />
    </Modal>
  );
};
