import React, { useState, useEffect, useCallback } from 'react';
import { ProductApi } from '../../infrastructure/api/ApiRepositories';
import type { Product } from '../../domain/entities';
import { Modal, Pagination } from '../components/Shared';
import { useToast } from '../components/Toast';
import { Plus, Edit2, Trash2, Search, Package, Hash, DollarSign, Database } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
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
      const { data, total } = await ProductApi.findAll(currentPage, search, 'name', true);
      setProducts(data);
      setTotal(total);
    } catch (error) {
      showToast('Error al cargar productos', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, search, showToast]);

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
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este producto?')) {
      try {
        await ProductApi.delete(id);
        showToast('Producto eliminado exitosamente', 'success');
        fetchProducts();
      } catch (error) {
        showToast('Error al eliminar producto', 'error');
      }
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Gestión de Productos</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Administre su inventario y precios</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Plus size={20} /> Nuevo Producto
        </button>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            className="input"
            style={{ paddingLeft: '40px' }}
            placeholder="Buscar por nombre o código..."
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
              <th>Código</th>
              <th>Nombre del Producto</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>IVA</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Cargando...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>No se encontraron productos</td></tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td style={{ fontWeight: '500' }}>{product.code}</td>
                  <td>{product.name}</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px', 
                      background: product.stock <= 5 ? '#fee2e2' : '#f0fdf4',
                      color: product.stock <= 5 ? '#991b1b' : '#166534',
                      fontWeight: 'bold'
                    }}>
                      {product.stock}
                    </span>
                  </td>
                  <td>{product.appliesIva ? 'Sí' : 'No'}</td>
                  <td>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px', 
                      background: product.isActive ? '#f0fdf4' : '#f1f5f9',
                      color: product.isActive ? '#166534' : '#64748b',
                      fontSize: '0.875rem'
                    }}>
                      {product.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-secondary" onClick={() => handleOpenModal(product)} title="Editar">
                        <Edit2 size={16} />
                      </button>
                      <button className="btn btn-danger" onClick={() => handleDelete(product.id)} title="Eliminar">
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
        title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Código de Producto</label>
            <div style={{ position: 'relative' }}>
              <Hash size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                className="input"
                style={{ paddingLeft: '40px' }}
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Ej: PROD-001"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Nombre</label>
            <div style={{ position: 'relative' }}>
              <Package size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                className="input"
                style={{ paddingLeft: '40px' }}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre descriptivo"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Precio</label>
              <div style={{ position: 'relative' }}>
                <DollarSign size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  style={{ paddingLeft: '40px' }}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Stock Inicial</label>
              <div style={{ position: 'relative' }}>
                <Database size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="number"
                  className="input"
                  style={{ paddingLeft: '40px' }}
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                  placeholder="0"
                  required
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.appliesIva}
                onChange={(e) => setFormData({ ...formData, appliesIva: e.target.checked })}
              />
              Aplica IVA (15%)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              Producto Activo
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Guardar Producto</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
