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
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      const { data, total } = await ClientApi.findAll(currentPage, search);
      setCustomers(data);
      setTotal(total);
    } catch (error) {
      showToast('Error al cargar clientes', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, search, showToast]);

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

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este cliente?')) {
      try {
        await ClientApi.delete(id);
        showToast('Cliente eliminado exitosamente', 'success');
        fetchCustomers();
      } catch (error) {
        showToast('Error al eliminar cliente', 'error');
      }
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Gestión de Clientes</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Administre la base de datos de sus clientes</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Plus size={20} /> Nuevo Cliente
        </button>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            className="input"
            style={{ paddingLeft: '40px' }}
            placeholder="Buscar por nombre o cédula..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Cédula/RUC</th>
              <th>Nombre Completo</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Cargando...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No se encontraron clientes</td></tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id}>
                  <td style={{ fontWeight: '500' }}>{customer.id}</td>
                  <td>{customer.name} {customer.lastName}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.email}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-secondary" onClick={() => handleOpenModal(customer)} title="Editar">
                        <Edit2 size={16} />
                      </button>
                      <button className="btn btn-danger" onClick={() => handleDelete(customer.id)} title="Eliminar">
                        <Trash2 size={16} />
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
        itemsPerPage={10}
        onPageChange={setCurrentPage}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Cédula/RUC</label>
            <div style={{ position: 'relative' }}>
              <CreditCard size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                className="input"
                style={{ paddingLeft: '40px' }}
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                placeholder="Ej: 1712345678"
                required
                disabled={!!editingCustomer}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Nombre</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  className="input"
                  style={{ paddingLeft: '40px' }}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Apellido</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  className="input"
                  style={{ paddingLeft: '40px' }}
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Apellido"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Teléfono</label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                className="input"
                style={{ paddingLeft: '40px' }}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Ej: 0991234567"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="email"
                className="input"
                style={{ paddingLeft: '40px' }}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="correo@ejemplo.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Dirección</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                className="input"
                style={{ paddingLeft: '40px' }}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Dirección domiciliaria"
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Guardar Cliente</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
