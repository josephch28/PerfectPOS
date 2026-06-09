import React, { useState, useEffect, useCallback } from 'react';
import { UserApi } from '../../infrastructure/api/ApiRepositories';
import type { User, Role } from '../../domain/entities';
import { Modal, Pagination } from '../components/Shared';
import { useToast } from '../components/Toast';
import { Plus, Edit2, Trash2, Search, User as UserIcon, Shield, Mail, Lock, CreditCard, Loader2 } from 'lucide-react';
import { allowOnlyNumbers, allowOnlyLetters } from '../utils/InputValidators';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [searchField, setSearchField] = useState('username');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { showToast } = useToast();

  const [formData, setFormData] = useState<Partial<User>>({
    username: '',
    firstName: '',
    middleName: '',
    firstLastName: '',
    secondLastName: '',
    cedula: '',
    email: '',
    password: '',
    roleId: '',
    isActive: true
  });

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, total } = await UserApi.findAll(currentPage, itemsPerPage, search, searchField);
      setUsers(data);
      setTotal(total);
    } catch (error) {
      showToast('Error al cargar usuarios', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, search, searchField, showToast]);

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
        middleName: user.middleName || '',
        secondLastName: user.secondLastName || '',
        password: '' // Don't show password
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        firstName: '',
        middleName: '',
        firstLastName: '',
        secondLastName: '',
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
    setIsSaving(true);
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
    } finally {
      setIsSaving(false);
    }
  };

  const promptDelete = (id: string) => {
    setUserToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (userToDelete) {
      try {
        await UserApi.delete(userToDelete);
        showToast('Usuario desactivado exitosamente', 'success');
        fetchUsers();
      } catch (error) {
        showToast('Error al eliminar usuario', 'error');
      } finally {
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
      }
    }
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>Gestión de Usuarios</h1>
          <p className="text-muted" style={{ marginTop: '0.5rem' }}>Administre el acceso de su personal</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()} style={{ padding: '0.75rem 1.25rem' }}>
          <Plus size={18} /> Nuevo Usuario
        </button>
      </header>

      <div className="card" style={{ marginBottom: '2rem', padding: '1rem 1.5rem' }}>
        <div style={{ maxWidth: '600px' }}>
          <div className="input-group" style={{ borderRadius: '8px' }}>
            <select value={searchField} onChange={(e) => setSearchField(e.target.value)}>
              <option value="username">Usuario</option>
              <option value="firstName">Primer Nombre</option>
              <option value="email">Email</option>
            </select>
            <input
              type="text"
              placeholder={`Buscar por ${searchField === 'username' ? 'usuario' : searchField === 'firstName' ? 'primer nombre' : 'email'}...`}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
            <div style={{ padding: '0 1rem', background: 'var(--slate-50)', display: 'flex', alignItems: 'center' }}>
              <Search size={18} color="var(--slate-500)" />
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="modern-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Nombre Completo</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center" style={{ padding: '4rem', color: 'var(--slate-300)' }}>Cargando...</td></tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center" style={{ padding: '4rem', color: 'var(--slate-300)' }}>
                  <UserIcon size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>No se encontraron usuarios</p>
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const fullName = `${user.firstName || ''} ${user.middleName || ''} ${user.firstLastName || ''} ${user.secondLastName || ''}`.replace(/\s+/g, ' ').trim();
                return (
                <tr key={user.id}>
                  <td style={{ fontSize: '0.85rem', color: 'var(--slate-600)', fontWeight: 600 }}>{user.username}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{fullName}</div>
                  </td>
                  <td style={{ color: 'var(--slate-600)' }}>{user.email}</td>
                  <td>
                    <span style={{ 
                      padding: '0.35rem 0.75rem', 
                      borderRadius: '6px', 
                      background: user.role?.name === 'Administrator' ? '#eef2ff' : '#f8fafc',
                      color: user.role?.name === 'Administrator' ? '#4f46e5' : '#475569',
                      fontSize: '0.80rem',
                      fontWeight: 700,
                      border: user.role?.name === 'Administrator' ? '1px solid #e0e7ff' : '1px solid var(--slate-200)'
                    }}>
                      {user.role?.name === 'Administrator' ? 'Administrador' : 'Vendedor'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}>
                      <span style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        background: user.isLocked ? 'var(--warning)' : user.isActive ? 'var(--success)' : 'var(--slate-400)'
                      }}></span>
                      <span style={{ color: user.isLocked ? 'var(--warning)' : user.isActive ? 'var(--success)' : 'var(--slate-600)' }}>
                        {user.isLocked ? 'Bloqueado' : user.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </td>
                  <td className="text-right">
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn-secondary" onClick={() => handleOpenModal(user)} title="Editar" style={{ padding: '0.5rem' }}>
                        <Edit2 size={16} color="var(--primary)" />
                      </button>
                      <button className="btn-secondary" onClick={() => promptDelete(user.id)} title="Eliminar" style={{ padding: '0.5rem' }}>
                        <Trash2 size={16} color="var(--danger)" />
                      </button>
                    </div>
                  </td>
                </tr>
              )})
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
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--slate-700)', fontSize: '0.9rem' }}>Usuario</label>
              <div className="input-group">
                <div style={{ padding: '0.75rem', background: 'var(--slate-50)', borderRight: '1px solid var(--slate-200)', display: 'flex', alignItems: 'center' }}>
                  <UserIcon size={18} color="var(--slate-500)" />
                </div>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="usuario123"
                  required
                  pattern="[A-Za-z0-9_]+"
                  title="Solo letras, números y guión bajo"
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--slate-700)', fontSize: '0.9rem' }}>Cédula</label>
              <div className="input-group">
                <div style={{ padding: '0.75rem', background: 'var(--slate-50)', borderRight: '1px solid var(--slate-200)', display: 'flex', alignItems: 'center' }}>
                  <CreditCard size={18} color="var(--slate-500)" />
                </div>
                <input
                  type="text"
                  value={formData.cedula}
                  onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                  onKeyDown={allowOnlyNumbers}
                  placeholder="Ej: 1712345678"
                  required
                  pattern="\d{10}"
                  maxLength={10}
                />
              </div>
              {formData.cedula && formData.cedula.length < 10 && (
                <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>La cédula debe tener exactamente 10 dígitos numéricos</span>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--slate-700)', fontSize: '0.9rem' }}>Primer Nombre</label>
              <div className="input-group">
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

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--slate-700)', fontSize: '0.9rem' }}>Contraseña {editingUser && '(Dejar en blanco para no cambiar)'}</label>
            <div className="input-group">
              <div style={{ padding: '0.75rem', background: 'var(--slate-50)', borderRight: '1px solid var(--slate-200)', display: 'flex', alignItems: 'center' }}>
                <Lock size={18} color="var(--slate-500)" />
              </div>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,10}$"
                  title="La contraseña debe tener entre 8 y 10 caracteres, una mayúscula, una minúscula, un número y un carácter especial"
                  required={!editingUser}
                />
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--slate-700)', fontSize: '0.9rem' }}>Rol de Usuario</label>
            <div className="input-group">
              <div style={{ padding: '0.75rem', background: 'var(--slate-50)', borderRight: '1px solid var(--slate-200)', display: 'flex', alignItems: 'center' }}>
                <Shield size={18} color="var(--slate-500)" />
              </div>
              <select 
                value={formData.roleId}
                onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                required
                style={{ flex: 1, padding: '0.75rem 1rem', border: 'none', background: 'transparent', outline: 'none', cursor: 'pointer', fontSize: '0.95rem' }}
              >
                <option value="">Seleccione un rol</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.name === 'Administrator' ? 'Administrador' : 'Vendedor'}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '2rem', padding: '1.5rem', background: 'var(--slate-50)', borderRadius: '8px', border: '1px solid var(--slate-200)', marginBottom: '2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 600, color: 'var(--slate-800)' }}>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--primary)' }}
              />
              Usuario Activo
            </label>
            {editingUser && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 600, color: 'var(--slate-800)' }}>
                <input
                  type="checkbox"
                  checked={formData.isLocked}
                  onChange={(e) => setFormData({ ...formData, isLocked: e.target.checked })}
                  style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--danger)' }}
                />
                Bloqueado
              </label>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--slate-200)' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)} style={{ padding: '0.75rem 1.5rem' }} disabled={isSaving}>Cancelar</button>
            <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} disabled={isSaving}>
              {isSaving ? <><Loader2 size={18} className="animate-spin" /> Guardando...</> : 'Guardar Usuario'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Desactivación"
      >
        <div style={{ padding: '1rem 0' }}>
          <p style={{ color: 'var(--slate-700)', fontSize: '1.05rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            ¿Está seguro que desea eliminar este usuario? <br/><br/>
            <span className="text-muted" style={{ fontSize: '0.9rem' }}>Nota: Los usuarios no se borran permanentemente por razones de auditoría, pasarán a estar desactivados.</span>
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
