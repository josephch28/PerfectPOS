import React, { useState } from 'react';
import { AuthApi } from '../../infrastructure/api/ApiRepositories';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { LogIn, Mail, Lock, AlertCircle, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { token, user } = await AuthApi.login(email, password);
      login(token, user);
      showToast('Bienvenido al sistema', 'success');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al iniciar sesión';
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'grid',
      gridTemplateColumns: '1fr 1.2fr',
      background: 'white'
    }}>
      {/* Left Side: Branding/Hero */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '4rem',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            background: 'rgba(255,255,255,0.1)', 
            padding: '0.5rem 1rem', 
            borderRadius: '100px',
            marginBottom: '2rem',
            fontSize: '0.875rem',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <ShieldCheck size={18} color="#10b981" />
            <span style={{ fontWeight: 600 }}>Sistema Seguro v1.0</span>
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem' }}>
            Perfect<span style={{ color: 'var(--primary)' }}>POS</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '480px', lineHeight: 1.6 }}>
            Gestione sus ventas, inventario y facturación de forma profesional con nuestra arquitectura limpia y segura.
          </p>
          
          <div style={{ marginTop: '4rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <h4 style={{ color: 'white', margin: '0 0 0.5rem 0' }}>Seguridad JWT</h4>
              <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>Autenticación robusta y control de acceso por roles.</p>
            </div>
            <div>
              <h4 style={{ color: 'white', margin: '0 0 0.5rem 0' }}>Clean Architecture</h4>
              <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>Código escalable, mantenible y fácil de testear.</p>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div style={{ 
          position: 'absolute', 
          bottom: '-10%', 
          right: '-10%', 
          width: '400px', 
          height: '400px', 
          background: 'var(--primary)', 
          filter: 'blur(150px)', 
          opacity: 0.2,
          borderRadius: '50%'
        }}></div>
      </div>

      {/* Right Side: Login Form */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '4rem',
        background: '#f8fafc'
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>Bienvenido de nuevo</h2>
            <p style={{ color: '#64748b' }}>Ingrese sus credenciales para acceder al panel.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem', color: '#1e293b' }}>Correo Electrónico</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="email"
                  className="input"
                  style={{ 
                    paddingLeft: '42px', 
                    width: '100%', 
                    height: '48px', 
                    borderRadius: '10px', 
                    border: '1px solid #e2e8f0',
                    background: 'white',
                    fontSize: '0.95rem'
                  }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@pos.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1e293b' }}>Contraseña</label>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="password"
                  className="input"
                  style={{ 
                    paddingLeft: '42px', 
                    width: '100%', 
                    height: '48px', 
                    borderRadius: '10px', 
                    border: '1px solid #e2e8f0',
                    background: 'white',
                    fontSize: '0.95rem'
                  }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ 
                width: '100%', 
                height: '52px', 
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 700,
                marginTop: '1rem',
                boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.25)'
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="spinner"></div> Autenticando...
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  Iniciar Sesión <LogIn size={20} />
                </div>
              )}
            </button>
          </form>

          <div style={{ 
            marginTop: '2.5rem', 
            padding: '1.25rem', 
            background: 'white', 
            borderRadius: '12px', 
            border: '1px solid #e2e8f0',
            fontSize: '0.875rem'
          }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <AlertCircle size={18} style={{ marginTop: '2px', flexShrink: 0, color: 'var(--warning)' }} />
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>Seguridad de cuenta</p>
                <p style={{ margin: 0, color: '#64748b', lineHeight: 1.5 }}>Tras 3 intentos fallidos la cuenta será bloqueada automáticamente.</p>
              </div>
            </div>
          </div>
          
          <style>{`
            .spinner {
              width: 18px;
              height: 18px;
              border: 2px solid rgba(255,255,255,0.3);
              border-top-color: white;
              border-radius: 50%;
              animation: spin 0.8s linear infinite;
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            .input:focus {
              border-color: var(--primary) !important;
              box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1) !important;
              outline: none;
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};
