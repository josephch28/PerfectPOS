import React, { useState, useEffect, useCallback } from 'react';
import { ClientApi } from '../../infrastructure/api/ApiRepositories';
import type { Client } from '../../domain/entities';
import { Modal, Pagination } from '../components/Shared';
import { useToast } from '../components/Toast';
import { Plus, Edit2, Trash2, Search, User, Phone, MapPin, Mail, CreditCard } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { showToast } = useToast();

  const [formData, setFormData] = useState<Client>({
    id: '',
    name: '',
    lastName: '',
    phone: '',
    address: '',
    email: '',
    isActive: true
  });

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, total } = await ClientApi.findAll(currentPage, itemsPerPage, search);
      setCustomers(data);
      setTotal(total);
    } catch (error) {
      showToast('Error al cargar clientes', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, search, showToast]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleOpenModal = (customer?: Client) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData(customer);
    } else {
      setEditingCustomer(null);
      setFormData({
        id: '',
        name: '',
        lastName: '',
        phone: '',
        address: '',
        email: '',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await ClientApi.update(editingCustomer.id, formData);
        showToast('Cliente actualizado exitosamente', 'success');
      } else {
        await ClientApi.create(formData);
        showToast('Cliente creado exitosamente', 'success');
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error al guardar cliente', 'error');
    }
  };

  const promptDelete = (id: string) => {
    setCustomerToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (customerToDelete) {
      try {
        await ClientApi.delete(customerToDelete);
        showToast('Cliente procesado exitosamente', 'success');
        fetchCustomers();
      } catch (error) {
        showToast('Error al eliminar cliente', 'error');
      } finally {
        setIsDeleteModalOpen(false);
        setCustomerToDelete(null);
      }
    }
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>Gestión de Clientes</h1>
          <p className="text-muted" style={{ marginTop: '0.5rem' }}>Administre la base de datos de sus clientes</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()} style={{ padding: '0.75rem 1.25rem' }}>
          <Plus size={18} /> Nuevo Cliente
        </button>
      </header>

      <div className="card" style={{ marginBottom: '2rem', padding: '1rem 1.5rem' }}>
        <div style={{ maxWidth: '400px' }}>
          <div className="input-group" style={{ borderRadius: '8px' }}>
            <div style={{ padding: '0.75rem', background: 'var(--slate-50)', borderRight: '1px solid var(--slate-200)', display: 'flex', alignItems: 'center' }}>
              <Search size={18} color="var(--slate-500)" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre o cédula..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="modern-table">
          <thead>
            <tr>
              <th>Cédula/RUC</th>
              <th>Nombre Completo</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="text-center" style={{ padding: '4rem', color: 'var(--slate-300)' }}>Cargando...</td></tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center" style={{ padding: '4rem', color: 'var(--slate-300)' }}>
                  <User size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>No se encontraron clientes</p>
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id}>
                  <td style={{ fontSize: '0.85rem', color: 'var(--slate-600)', fontWeight: 600 }}>{customer.id}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{customer.name} {customer.lastName}</div>
                  </td>
                  <td style={{ color: 'var(--slate-600)' }}>{customer.phone}</td>
                  <td style={{ color: 'var(--slate-600)' }}>{customer.email}</td>
                  <td className="text-right">
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn-secondary" onClick={() => handleOpenModal(customer)} title="Editar" style={{ padding: '0.5rem' }}>
                        <Edit2 size={16} color="var(--primary)" />
                      </button>
                      <button className="btn-secondary" onClick={() => promptDelete(customer.id)} title="Eliminar" style={{ padding: '0.5rem' }}>
                        <Trash2 size={16} color="var(--danger)" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={total}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(limit) => {
          setItemsPerPage(limit);
          setCurrentPage(1);
        }}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
      >
        <form onSubmit={handleSubmit}>
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
                  placeholder="Ej: 1712345678"
                  required
                  disabled={!!editingCustomer}
                  pattern="\d{10}"
                  maxLength={10}
                  title="Debe contener exactamente 10 dígitos numéricos"
                />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--slate-700)', fontSize: '0.9rem' }}>Nombre</label>
              <div className="input-group">
                <div style={{ padding: '0.75rem', background: 'var(--slate-50)', borderRight: '1px solid var(--slate-200)', display: 'flex', alignItems: 'center' }}>
                  <User size={18} color="var(--slate-500)" />
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre"
                  required
                  pattern="[A-Za-zñÑáéíóúÁÉÍÓÚ\s]+"
                  title="Solo letras y espacios permitidos"
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--slate-700)', fontSize: '0.9rem' }}>Apellido</label>
              <div className="input-group">
                <div style={{ padding: '0.75rem', background: 'var(--slate-50)', borderRight: '1px solid var(--slate-200)', display: 'flex', alignItems: 'center' }}>
                  <User size={18} color="var(--slate-500)" />
                </div>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Apellido"
                  required
                  pattern="[A-Za-zñÑáéíóúÁÉÍÓÚ\s]+"
                  title="Solo letras y espacios permitidos"
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
                placeholder="Ej: 0991234567"
                required
                pattern="\d{10}"
                maxLength={10}
                title="Debe contener exactamente 10 dígitos numéricos"
              />
            </div>
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
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)} style={{ padding: '0.75rem 1.5rem' }}>Cancelar</button>
            <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>Guardar Cliente</button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Eliminación"
      >
        <div style={{ padding: '1rem 0' }}>
          <p style={{ color: 'var(--slate-700)', fontSize: '1.05rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            ¿Está seguro que desea eliminar este cliente? <br/><br/>
            <span className="text-muted" style={{ fontSize: '0.9rem' }}>Nota: Si el cliente tiene facturas asociadas, no se borrará de la base de datos, solo será desactivado para mantener el historial.</span>
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
            <button className="btn-primary" style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={handleDelete}>
              Sí, proceder
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
