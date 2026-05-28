import React, { useState, useEffect, useCallback } from 'react';
import { UserApi } from '../../infrastructure/api/ApiRepositories';
import type { User, Role } from '../../domain/entities';
import { Modal, Pagination } from '../components/Shared';
import { useToast } from '../components/Toast';
import { Plus, Edit2, Trash2, Search, User as UserIcon, Shield, Mail, Lock, CreditCard } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { showToast } = useToast();

  const [formData, setFormData] = useState<Partial<User>>({
    username: '',
    name: '',
    lastName: '',
    cedula: '',
    email: '',
    password: '',
    roleId: '',
    isActive: true
  });

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, total } = await UserApi.findAll(currentPage, search);
      setUsers(data);
      setTotal(total);
    } catch (error) {
      showToast('Error al cargar usuarios', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, search, showToast]);

  const fetchRoles = useCallback(async () => {
    try {
      const rolesData = await UserApi.getRoles();
      setRoles(rolesData);
    } catch (error) {
      showToast('Error al cargar roles', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        ...user,
        password: '' // Don't show password
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        name: '',
        lastName: '',
        cedula: '',
        email: '',
        password: '',
        roleId: roles[0]?.id || '',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // If password is empty, don't send it
        const dataToSend = { ...formData };
        if (!dataToSend.password) delete dataToSend.password;
        
        await UserApi.update(editingUser.id, dataToSend);
        showToast('Usuario actualizado exitosamente', 'success');
      } else {
        await UserApi.create(formData);
        showToast('Usuario creado exitosamente', 'success');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error al guardar usuario', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este usuario?')) {
      try {
        await UserApi.delete(id);
        showToast('Usuario eliminado exitosamente', 'success');
        fetchUsers();
      } catch (error) {
        showToast('Error al eliminar usuario', 'error');
      }
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Gestión de Usuarios</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Administre el acceso de su personal</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Plus size={20} /> Nuevo Usuario
        </button>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            className="input"
            style={{ paddingLeft: '40px' }}
            placeholder="Buscar por nombre o usuario..."
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
              <th>Usuario</th>
              <th>Nombre Completo</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Cargando...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No se encontraron usuarios</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td style={{ fontWeight: '500' }}>{user.username}</td>
                  <td>{user.name} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px', 
                      background: user.role?.name === 'Administrator' ? '#e0e7ff' : '#f3f4f6',
                      color: user.role?.name === 'Administrator' ? '#3730a3' : '#374151',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}>
                      {user.role?.name === 'Administrator' ? 'Administrador' : 'Vendedor'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        background: user.isActive ? '#10b981' : '#ef4444' 
                      }}></span>
                      {user.isLocked ? 'Bloqueado' : user.isActive ? 'Activo' : 'Inactivo'}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-secondary" onClick={() => handleOpenModal(user)} title="Editar">
                        <Edit2 size={16} />
                      </button>
                      <button className="btn btn-danger" onClick={() => handleDelete(user.id)} title="Eliminar">
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
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Usuario</label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  className="input"
                  style={{ paddingLeft: '40px' }}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="usuario123"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Cédula</label>
              <div style={{ position: 'relative' }}>
                <CreditCard size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  className="input"
                  style={{ paddingLeft: '40px' }}
                  value={formData.cedula}
                  onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                  placeholder="1712345678"
                  required
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre"
                required
              />
            </div>
            <div className="form-group">
              <label>Apellido</label>
              <input
                type="text"
                className="input"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Apellido"
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
            <label>Contraseña {editingUser && '(Dejar en blanco para no cambiar)'}</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="password"
                className="input"
                style={{ paddingLeft: '40px' }}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required={!editingUser}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Rol de Usuario</label>
            <div style={{ position: 'relative' }}>
              <Shield size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <select 
                className="input" 
                style={{ paddingLeft: '40px' }}
                value={formData.roleId}
                onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                required
              >
                <option value="">Seleccione un rol</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.name === 'Administrator' ? 'Administrador' : 'Vendedor'}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              Usuario Activo
            </label>
            {editingUser && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isLocked}
                  onChange={(e) => setFormData({ ...formData, isLocked: e.target.checked })}
                />
                Bloqueado
              </label>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Guardar Usuario</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
