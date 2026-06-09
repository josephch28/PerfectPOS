import React, { useState, useEffect, useCallback } from 'react';
import { ErrorLogApi } from '../../infrastructure/api/ApiRepositories';
import { Pagination } from '../components/Shared';
import { useToast } from '../components/Toast';
import { AlertTriangle } from 'lucide-react';

export const ErrorLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, total } = await ErrorLogApi.findAll(currentPage, itemsPerPage);
      setLogs(data);
      setTotal(total);
    } catch (error) {
      showToast('Error al cargar logs de sistema', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, showToast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="container">
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>Logs del Sistema</h1>
          <p className="text-muted" style={{ marginTop: '0.5rem' }}>Registro de errores y excepciones del sistema</p>
        </div>
      </header>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="modern-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Mensaje</th>
              <th>Tipo de Excepción</th>
              <th>Origen</th>
              <th>ID de Usuario</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="text-center" style={{ padding: '4rem', color: 'var(--slate-300)' }}>Cargando...</td></tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center" style={{ padding: '4rem', color: 'var(--slate-300)' }}>
                  <AlertTriangle size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>No hay errores registrados</p>
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: '0.85rem', color: 'var(--slate-600)', fontWeight: 600 }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td>
                    <div style={{ color: 'var(--danger)', fontWeight: 600 }}>{log.message}</div>
                  </td>
                  <td>
                    <span style={{ 
                      padding: '0.35rem 0.75rem', 
                      borderRadius: '6px', 
                      background: '#fef2f2',
                      color: '#b91c1c',
                      fontSize: '0.80rem',
                      fontWeight: 700,
                      border: '1px solid #fecaca'
                    }}>
                      {log.exceptionType || 'Unknown'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--slate-600)' }}>{log.source || '-'}</td>
                  <td style={{ color: 'var(--slate-600)' }}>{log.userId || '-'}</td>
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
    </div>
  );
};
