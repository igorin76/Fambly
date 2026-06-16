import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import FamblyLogo from '../Layout/FamblyLogo';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginScreen() {
  const { login, fetchInitialData, members } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Cargar datos al montar (necesitamos los miembros para validar credenciales)
  useEffect(() => {
    const loadData = async () => {
      await fetchInitialData();
      setInitialLoading(false);
    };
    loadData();
  }, [fetchInitialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Introduce tu correo electrónico.');
      return;
    }
    if (!password.trim()) {
      setError('Introduce tu contraseña.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check si hay admins configurados
  const hasAdmins = members.some((m) => m.isAdmin && m.email);

  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-slate-50 relative overflow-hidden selection:bg-blue-100 selection:text-blue-900">
      {/* Fondo decorativo */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-100/60 via-slate-50 to-purple-50/40" />
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-100/30 blur-3xl" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-100/25 blur-3xl" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Card de Login */}
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-3xl shadow-2xl shadow-slate-200/50 p-8 sm:p-10 animate-fadeIn">
          
          {/* Logo y título */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <FamblyLogo className="h-10" />
            </div>
            <p className="text-sm text-slate-500 font-medium mt-2">
              Inicia sesión con tu cuenta de administrador
            </p>
          </div>

          {/* Mensaje si no hay admins */}
          {!initialLoading && !hasAdmins && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200/60 rounded-2xl">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-800">Sin administradores configurados</p>
                  <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
                    No hay administradores con email en esta familia. Contacta al responsable técnico para configurar los perfiles.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="tucorreo@ejemplo.com"
                  className="w-full pl-10 pr-4 py-3 text-sm font-medium text-slate-800 bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-slate-400"
                  autoComplete="email"
                  autoFocus
                  disabled={loading}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 text-sm font-medium text-slate-800 bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-slate-400"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors touch-btn"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200/60 rounded-xl animate-fadeIn">
                <AlertCircle size={14} className="text-red-500 shrink-0" />
                <span className="text-xs font-bold text-red-700">{error}</span>
              </div>
            )}

            {/* Botón de Login */}
            <button
              type="submit"
              disabled={loading || initialLoading}
              className="flex items-center justify-center gap-2 w-full py-3.5 mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed touch-btn"
            >
              {loading || initialLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {initialLoading ? 'Cargando...' : 'Verificando...'}
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Entrar
                </>
              )}
            </button>
          </form>
        </div>

        {/* Branding footer */}
        <p className="text-center text-[10px] text-slate-400 mt-6">
          Fambly — Gestión Familiar Inteligente
        </p>
      </div>
    </div>
  );
}
