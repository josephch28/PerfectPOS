import React, { useState, useEffect } from 'react';
import type { Client, Product } from '../../domain/entities';
import { ClientApi, ProductApi } from '../../infrastructure/api/ApiRepositories';
import { Modal, Pagination } from './Shared';
import { Search, Loader2, Plus, User, Phone, MapPin, Mail, CreditCard } from 'lucide-react';
import { useToast } from './Toast';
import { allowOnlyNumbers, allowOnlyLetters } from '../utils/InputValidators';

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
  const [searchField, setSearchField] = useState('firstName'); 
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState<Client>({
    id: '', firstName: '', middleName: '', firstLastName: '', secondLastName: '', phone: '', address: '', email: '', isActive: true
  });

  useEffect(() => {
    if (isOpen) {
      loadClients();
    }
  }, [isOpen, page, search, searchField]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const result = await ClientApi.findAll(page, 10, search, searchField);
      setClients(result.data || []);
      setTotal(result.total || 0);
    } catch (error) {
      console.error("Error loading clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const fieldLabels: Record<string, string> = {
    firstName: 'Primer Nombre',
    firstLastName: 'Primer Apellido',
    cedula: 'Cédula/ID'
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const newCustomer = await ClientApi.create(formData);
      showToast('Cliente creado exitosamente', 'success');
      setIsCreating(false);
      onSelect(newCustomer);
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error al guardar cliente', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
    <Modal isOpen={isOpen && !isCreating} onClose={onClose} title="Buscar Cliente">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div className="input-group" style={{ flex: 1, marginRight: '1rem', marginBottom: 0 }}>
          <select value={searchField} onChange={(e) => setSearchField(e.target.value)}>
            <option value="firstName">Primer Nombre</option>
            <option value="firstLastName">Primer Apellido</option>
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
        <button className="btn-primary" onClick={() => setIsCreating(true)} style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Nuevo
        </button>
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
          {clients.map(c => {
            const fullName = `${c.firstName || ''} ${c.middleName || ''} ${c.firstLastName || ''} ${c.secondLastName || ''}`.replace(/\s+/g, ' ').trim();
            return (
            <tr key={c.id}>
              <td style={{ fontWeight: 600 }}>{c.id}</td>
              <td style={{ fontWeight: 500 }}>{fullName}</td>
              <td className="text-center">
                <button onClick={() => onSelect(c)} className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                  Seleccionar
                </button>
              </td>
            </tr>
          )})}
          {!loading && clients.length === 0 && (
            <tr>
              <td colSpan={3} className="text-center text-muted" style={{ padding: '2rem' }}>No se encontraron clientes.</td>
            </tr>
          )}
        </tbody>
      </table>
      <Pagination currentPage={page} totalItems={total} itemsPerPage={10} onPageChange={setPage} />
    </Modal>

    <Modal isOpen={isCreating} onClose={() => setIsCreating(false)} title="Nuevo Cliente">
      <form onSubmit={handleCreateCustomer}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--slate-700)', fontSize: '0.9rem' }}>Cédula/RUC</label>
            <div className="input-group">
              <div style={{ padding: '0.75rem', background: 'var(--slate-50)', borderRight: '1px solid var(--slate-200)', display: 'flex', alignItems: 'center' }}>
                <CreditCard size={18} color="var(--slate-500)" />
              </div>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  onKeyDown={allowOnlyNumbers}
                  placeholder="Ej: 1712345678"
                  required
                  pattern="\d{10}"
                  maxLength={10}
                />
            </div>
            {formData.id && formData.id.length < 10 && (
              <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>La cédula debe tener exactamente 10 dígitos numéricos</span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--slate-700)', fontSize: '0.9rem' }}>Primer Nombre</label>
              <div className="input-group">
                <div style={{ padding: '0.75rem', background: 'var(--slate-50)', borderRight: '1px solid var(--slate-200)', display: 'flex', alignItems: 'center' }}>
                  <User size={18} color="var(--slate-500)" />
                </div>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === ' ') e.preventDefault();
                    allowOnlyLetters(e);
                  }}
                  placeholder="Primer Nombre"
                  required
                  pattern="[A-Za-zñÑáéíóúÁÉÍÓÚ]+"
                  title="Solo letras permitidas, sin espacios"
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--slate-700)', fontSize: '0.9rem' }}>Segundo Nombre</label>
              <div className="input-group">
                <div style={{ padding: '0.75rem', background: 'var(--slate-50)', borderRight: '1px solid var(--slate-200)', display: 'flex', alignItems: 'center' }}>
                  <User size={18} color="var(--slate-500)" />
                </div>
                <input
                  type="text"
                  value={formData.middleName || ''}
                  onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === ' ') e.preventDefault();
                    allowOnlyLetters(e);
                  }}
                  placeholder="Segundo Nombre (Opcional)"
                  pattern="[A-Za-zñÑáéíóúÁÉÍÓÚ]+"
                  title="Solo letras permitidas, sin espacios"
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--slate-700)', fontSize: '0.9rem' }}>Primer Apellido</label>
              <div className="input-group">
                <div style={{ padding: '0.75rem', background: 'var(--slate-50)', borderRight: '1px solid var(--slate-200)', display: 'flex', alignItems: 'center' }}>
                  <User size={18} color="var(--slate-500)" />
                </div>
                <input
                  type="text"
                  value={formData.firstLastName}
                  onChange={(e) => setFormData({ ...formData, firstLastName: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === ' ') e.preventDefault();
                    allowOnlyLetters(e);
                  }}
                  placeholder="Primer Apellido"
                  required
                  pattern="[A-Za-zñÑáéíóúÁÉÍÓÚ]+"
                  title="Solo letras permitidas, sin espacios"
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--slate-700)', fontSize: '0.9rem' }}>Segundo Apellido</label>
              <div className="input-group">
                <div style={{ padding: '0.75rem', background: 'var(--slate-50)', borderRight: '1px solid var(--slate-200)', display: 'flex', alignItems: 'center' }}>
                  <User size={18} color="var(--slate-500)" />
                </div>
                <input
                  type="text"
                  value={formData.secondLastName || ''}
                  onChange={(e) => setFormData({ ...formData, secondLastName: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === ' ') e.preventDefault();
                    allowOnlyLetters(e);
                  }}
                  placeholder="Segundo Apellido (Opcional)"
                  pattern="[A-Za-zñÑáéíóúÁÉÍÓÚ]+"
                  title="Solo letras permitidas, sin espacios"
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--slate-700)', fontSize: '0.9rem' }}>Teléfono</label>
            <div className="input-group">
              <div style={{ padding: '0.75rem', background: 'var(--slate-50)', borderRight: '1px solid var(--slate-200)', display: 'flex', alignItems: 'center' }}>
                <Phone size={18} color="var(--slate-500)" />
              </div>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                onKeyDown={allowOnlyNumbers}
                placeholder="Ej: 0991234567"
                required
                pattern="\d{10}"
                maxLength={10}
              />
            </div>
            {formData.phone && formData.phone.length < 10 && (
              <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>El teléfono debe tener exactamente 10 dígitos numéricos</span>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--slate-700)', fontSize: '0.9rem' }}>Email</label>
            <div className="input-group">
              <div style={{ padding: '0.75rem', background: 'var(--slate-50)', borderRight: '1px solid var(--slate-200)', display: 'flex', alignItems: 'center' }}>
                <Mail size={18} color="var(--slate-500)" />
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="correo@ejemplo.com"
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--slate-700)', fontSize: '0.9rem' }}>Dirección</label>
            <div className="input-group">
              <div style={{ padding: '0.75rem', background: 'var(--slate-50)', borderRight: '1px solid var(--slate-200)', display: 'flex', alignItems: 'center' }}>
                <MapPin size={18} color="var(--slate-500)" />
              </div>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Dirección domiciliaria"
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--slate-200)' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsCreating(false)} style={{ padding: '0.75rem 1.5rem' }} disabled={isSaving}>Cancelar</button>
            <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} disabled={isSaving}>
              {isSaving ? <><Loader2 size={18} className="animate-spin" /> Guardando...</> : 'Guardar y Seleccionar'}
            </button>
          </div>
        </form>
    </Modal>
    </>
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
      const result = await ProductApi.findAll(page, 10, search, searchField);
      setProducts(result.data || []);
      setTotal(result.total || 0);
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
