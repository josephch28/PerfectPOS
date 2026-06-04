import React, { useState, useEffect, useCallback } from 'react';
import { ProductApi } from '../../infrastructure/api/ApiRepositories';
import type { Product } from '../../domain/entities';
import { Modal, Pagination } from '../components/Shared';
import { useToast } from '../components/Toast';
import { Plus, Edit2, Trash2, Search, Package, Hash, DollarSign, Database, Loader2 } from 'lucide-react';
import { allowOnlyNumbers, allowOnlyDecimals } from '../utils/InputValidators';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [searchField, setSearchField] = useState('name');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { showToast } = useToast();

  const [formData, setFormData] = useState<Partial<Product>>({
    code: '',
    name: '',
    price: 0,
    stock: 0,
    appliesIva: true,
    isActive: true
  });

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, total } = await ProductApi.findAll(currentPage, itemsPerPage, search, searchField, true);
      setProducts(data);
      setTotal(total);
    } catch (error) {
      showToast('Error al cargar productos', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, search, searchField, showToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        code: '',
        name: '',
        price: 0,
        stock: 0,
        appliesIva: true,
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingProduct) {
        await ProductApi.update(editingProduct.id, formData);
        showToast('Producto actualizado exitosamente', 'success');
      } else {
        await ProductApi.create(formData);
        showToast('Producto creado exitosamente', 'success');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error al guardar producto', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const promptDelete = (id: string) => {
    setProductToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (productToDelete) {
      try {
        await ProductApi.delete(productToDelete);
        showToast('Producto procesado exitosamente', 'success');
        fetchProducts();
      } catch (error) {
        showToast('Error al eliminar producto', 'error');
      } finally {
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
      }
    }
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>Gestión de Productos</h1>
          <p className="text-muted" style={{ marginTop: '0.5rem' }}>Administre su inventario y precios</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()} style={{ padding: '0.75rem 1.25rem' }}>
          <Plus size={18} /> Nuevo Producto
        </button>
      </header>

      <div className="card" style={{ marginBottom: '2rem', padding: '1rem 1.5rem' }}>
        <div style={{ maxWidth: '600px' }}>
          <div className="input-group" style={{ borderRadius: '8px' }}>
            <select value={searchField} onChange={(e) => setSearchField(e.target.value)}>
              <option value="name">Nombre</option>
              <option value="code">Código</option>
            </select>
            <input
              type="text"
              placeholder={`Buscar por ${searchField === 'name' ? 'nombre' : 'código'}...`}
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
              <th>Código</th>
              <th>Nombre del Producto</th>
              <th className="text-right">Precio</th>
              <th className="text-right">Stock</th>
              <th className="text-center">IVA</th>
              <th className="text-center">Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="text-center" style={{ padding: '4rem', color: 'var(--slate-300)' }}>Cargando...</td></tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center" style={{ padding: '4rem', color: 'var(--slate-300)' }}>
                  <Package size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>No se encontraron productos</p>
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td style={{ fontSize: '0.85rem', color: 'var(--slate-600)', fontWeight: 600 }}>{product.code}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{product.name}</div>
                  </td>
                  <td className="text-right" style={{ color: 'var(--slate-600)', fontWeight: 600 }}>${product.price.toFixed(2)}</td>
                  <td className="text-right">
                    <span style={{ 
                      padding: '0.35rem 0.75rem', 
                      borderRadius: '6px', 
                      background: product.stock <= 5 ? '#fff1f2' : '#f8fafc',
                      color: product.stock <= 5 ? '#be123c' : '#0f172a',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      border: product.stock <= 5 ? '1px solid #ffe4e6' : '1px solid var(--slate-200)'
                    }}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="text-center" style={{ color: 'var(--slate-600)' }}>{product.appliesIva ? '15%' : '0%'}</td>
                  <td className="text-center">
                    <span className={product.isActive ? 'badge badge-active' : 'badge badge-void'}>
                      {product.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="text-right">
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn-secondary" onClick={() => handleOpenModal(product)} title="Editar" style={{ padding: '0.5rem' }}>
                        <Edit2 size={16} color="var(--primary)" />
                      </button>
                      <button className="btn-secondary" onClick={() => promptDelete(product.id)} title="Eliminar" style={{ padding: '0.5rem' }}>
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
        title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--slate-700)', fontSize: '0.9rem' }}>Código de Producto</label>
            <div className="input-group">
              <div style={{ padding: '0.75rem', background: 'var(--slate-50)', borderRight: '1px solid var(--slate-200)', display: 'flex', alignItems: 'center' }}>
                <Hash size={18} color="var(--slate-500)" />
              </div>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Ej: PROD-001"
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--slate-700)', fontSize: '0.9rem' }}>Nombre</label>
            <div className="input-group">
              <div style={{ padding: '0.75rem', background: 'var(--slate-50)', borderRight: '1px solid var(--slate-200)', display: 'flex', alignItems: 'center' }}>
                <Package size={18} color="var(--slate-500)" />
              </div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre descriptivo"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--slate-700)', fontSize: '0.9rem' }}>Precio</label>
              <div className="input-group">
                <div style={{ padding: '0.75rem', background: 'var(--slate-50)', borderRight: '1px solid var(--slate-200)', display: 'flex', alignItems: 'center' }}>
                  <DollarSign size={18} color="var(--slate-500)" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  onKeyDown={(e) => allowOnlyDecimals(e, formData.price?.toString() || '')}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--slate-700)', fontSize: '0.9rem' }}>Stock Inicial</label>
              <div className="input-group">
                <div style={{ padding: '0.75rem', background: 'var(--slate-50)', borderRight: '1px solid var(--slate-200)', display: 'flex', alignItems: 'center' }}>
                  <Database size={18} color="var(--slate-500)" />
                </div>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                  onKeyDown={allowOnlyNumbers}
                  placeholder="0"
                  required
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '2rem', padding: '1.5rem', background: 'var(--slate-50)', borderRadius: '8px', border: '1px solid var(--slate-200)', marginBottom: '2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 600, color: 'var(--slate-800)' }}>
              <input
                type="checkbox"
                checked={formData.appliesIva}
                onChange={(e) => setFormData({ ...formData, appliesIva: e.target.checked })}
                style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--primary)' }}
              />
              Aplica IVA (15%)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 600, color: 'var(--slate-800)' }}>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--primary)' }}
              />
              Producto Activo
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--slate-200)' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)} style={{ padding: '0.75rem 1.5rem' }} disabled={isSaving}>Cancelar</button>
            <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} disabled={isSaving}>
              {isSaving ? <><Loader2 size={18} className="animate-spin" /> Guardando...</> : 'Guardar Producto'}
            </button>
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
            ¿Está seguro que desea eliminar este producto? <br/><br/>
            <span className="text-muted" style={{ fontSize: '0.9rem' }}>Nota: Si el producto tiene transacciones de ventas asociadas, no se borrará de la base de datos, solo será desactivado para mantener el historial intacto.</span>
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
