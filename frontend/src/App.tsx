import React, { useState } from 'react';
import { LoginPage } from './presentation/pages/LoginPage';
import { InvoicePage } from './presentation/pages/InvoicePage';
import { HistoryPage } from './presentation/pages/HistoryPage';
import { CustomersPage } from './presentation/pages/CustomersPage';
import { ProductsPage } from './presentation/pages/ProductsPage';
import { UsersPage } from './presentation/pages/UsersPage';
import { ErrorLogsPage } from './presentation/pages/ErrorLogsPage';
import { AuthProvider, useAuth } from './presentation/context/AuthContext';
import { ToastProvider } from './presentation/components/Toast';
import { UnsavedChangesProvider, useUnsavedChanges } from './presentation/context/UnsavedChangesContext';
import { UnsavedChangesModal } from './presentation/components/UnsavedChangesModal';
import { LogOut, FileText, History, Users, Package, Settings, AlertTriangle } from 'lucide-react';
import './presentation/styles/global.css';

type Page = 'invoice' | 'history' | 'customers' | 'products' | 'users' | 'errorlogs';

const AppContent: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('invoice');
  const { isDirty, setDirty, triggerSave } = useUnsavedChanges();
  
  const [pendingPage, setPendingPage] = useState<Page | null>(null);
  const [showNavWarning, setShowNavWarning] = useState(false);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const navItems = [
    { id: 'invoice', label: 'Nueva Factura', icon: <FileText size={20} />, roles: ['Administrator', 'Seller'] },
    { id: 'history', label: 'Historial', icon: <History size={20} />, roles: ['Administrator', 'Seller'] },
    { id: 'customers', label: 'Clientes', icon: <Users size={20} />, roles: ['Administrator'] },
    { id: 'products', label: 'Productos', icon: <Package size={20} />, roles: ['Administrator'] },
    { id: 'users', label: 'Usuarios', icon: <Settings size={20} />, roles: ['Administrator'] },
    { id: 'errorlogs', label: 'Errores', icon: <AlertTriangle size={20} />, roles: ['Administrator'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(user?.role?.name || '') || 
    (user as any)?.roleName && item.roles.includes((user as any).roleName)
  );

  const renderPage = () => {
    switch (currentPage) {
      case 'invoice': return <InvoicePage />;
      case 'history': return <HistoryPage />;
      case 'customers': return <CustomersPage />;
      case 'products': return <ProductsPage />;
      case 'users': return <UsersPage />;
      case 'errorlogs': return <ErrorLogsPage />;
      default: return <InvoicePage />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: '#1e293b', color: 'white', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px', padding: '0 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={24} />
              <span>PerfectPOS</span>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '2rem' }} className="desktop-menu">
              {filteredNavItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (isDirty) {
                      setPendingPage(item.id as Page);
                      setShowNavWarning(true);
                    } else {
                      setCurrentPage(item.id as Page);
                    }
                  }}
                  style={{
                    background: currentPage === item.id ? '#334155' : 'transparent',
                    border: 'none',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                    fontWeight: currentPage === item.id ? '600' : '400'
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ textAlign: 'right', display: 'none' }} className="desktop-user-info">
              <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{`${user?.firstName || ''} ${user?.middleName || ''} ${user?.firstLastName || ''} ${user?.secondLastName || ''}`.replace(/\s+/g, ' ').trim()}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{user?.role?.name || (user as any)?.roleName}</div>
            </div>
            <button 
              onClick={logout} 
              style={{ 
                background: '#ef4444', 
                border: 'none', 
                color: 'white', 
                width: '36px', 
                height: '36px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Cerrar Sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      <main style={{ flex: 1, background: '#f8fafc' }}>
        {renderPage()}
      </main>

      <footer style={{ padding: '2rem 0', textAlign: 'center', color: '#64748b', fontSize: '0.875rem', borderTop: '1px solid #e2e8f0' }}>
        &copy; 2026 PerfectPOS - Sistema de Punto de Venta. Todos los derechos reservados.
      </footer>

      <UnsavedChangesModal
        isOpen={showNavWarning}
        message="Tiene una factura en curso con cambios sin guardar. ¿Desea generarla antes de salir?"
        onCancel={() => {
          setShowNavWarning(false);
          setPendingPage(null);
        }}
        onDiscard={() => {
          setDirty(false);
          setShowNavWarning(false);
          if (pendingPage) setCurrentPage(pendingPage);
          setPendingPage(null);
        }}
        onSave={async () => {
          setShowNavWarning(false);
          const success = await triggerSave();
          if (success) {
            setDirty(false);
            if (pendingPage) setCurrentPage(pendingPage);
          }
          setPendingPage(null);
        }}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <UnsavedChangesProvider>
          <AppContent />
        </UnsavedChangesProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
