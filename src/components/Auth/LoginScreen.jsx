import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import FamblyLogo from '../Layout/FamblyLogo';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, Loader2, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';

export default function LoginScreen() {
  const { 
    login, 
    fetchInitialData, 
    members,
    requestPasswordRecovery,
    verifyRecoveryCode,
    resetPasswordWithCode
  } = useStore();

  // Estados de la vista de login habitual
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Estado de navegación interna de login
  // 'login' | 'forgot_password' | 'verify_code' | 'reset_password'
  const [loginView, setLoginView] = useState('login'); 
  
  // Estados de recuperación de contraseña
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados comunes de error, éxito y carga
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Comprobar si estamos en modo local (sin variables de Supabase configuradas)
  const isLocalMode = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Cargar datos al montar (necesitamos los miembros para validar credenciales)
  useEffect(() => {
    const loadData = async () => {
      await fetchInitialData();
      setInitialLoading(false);
    };
    loadData();
  }, [fetchInitialData]);

  // Manejar el cambio de vista limpiando errores
  const navigateToView = (view) => {
    setError('');
    setSuccessMessage('');
    setLoginView(view);
  };

  // Enviar formulario de inicio de sesión estándar
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

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

  // Enviar solicitud de código de recuperación
  const handleRequestRecoverySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!recoveryEmail.trim()) {
      setError('Introduce tu correo electrónico.');
      return;
    }

    setLoading(true);
    try {
      await requestPasswordRecovery(recoveryEmail.trim());
      setSuccessMessage('Se ha enviado un código de verificación por correo electrónico.');
      setLoginView('verify_code');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Verificar el código introducido
  const handleVerifyCodeSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!recoveryCode.trim()) {
      setError('Introduce el código de verificación de 6 dígitos.');
      return;
    }

    setLoading(true);
    try {
      await verifyRecoveryCode(recoveryEmail.trim(), recoveryCode.trim());
      setLoginView('reset_password');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Guardar la nueva contraseña con el código verificado
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!newPassword.trim()) {
      setError('Introduce la nueva contraseña.');
      return;
    }
    if (newPassword.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordWithCode(recoveryEmail.trim(), recoveryCode.trim(), newPassword);
      setSuccessMessage('¡Contraseña restablecida correctamente! Ya puedes iniciar sesión con tu nueva contraseña.');
      
      // Preparar transición a login estándar
      setEmail(recoveryEmail);
      setPassword('');
      setRecoveryEmail('');
      setRecoveryCode('');
      setNewPassword('');
      setConfirmPassword('');
      setLoginView('login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Verificar si hay algún administrador con email configurado en el hogar
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
            
            {loginView === 'login' && (
              <p className="text-sm text-slate-500 font-medium mt-2">
                Inicia sesión con tu cuenta de administrador
              </p>
            )}
            {loginView === 'forgot_password' && (
              <p className="text-sm text-slate-500 font-medium mt-2">
                Recuperación de Contraseña
              </p>
            )}
            {loginView === 'verify_code' && (
              <p className="text-sm text-slate-500 font-medium mt-2">
                Introduce el código de verificación
              </p>
            )}
            {loginView === 'reset_password' && (
              <p className="text-sm text-slate-500 font-medium mt-2">
                Establece tu nueva contraseña
              </p>
            )}
          </div>

          {/* Banner de éxito */}
          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200/60 rounded-2xl animate-fadeIn">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-emerald-800 leading-normal">
                  {successMessage}
                </p>
              </div>
            </div>
          )}

          {/* Mensaje de error global */}
          {error && (
            <div className="mb-6 flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200/60 rounded-2xl animate-fadeIn">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <span className="text-xs font-bold text-red-700 leading-normal">{error}</span>
            </div>
          )}

          {/* Mensaje si no hay admins (solo visible en el login estándar) */}
          {loginView === 'login' && !initialLoading && !hasAdmins && (
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

          {/* VISTA 1: INICIO DE SESIÓN ESTÁNDAR */}
          {loginView === 'login' && (
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">
                  Correo electrónico
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="tucorreo@ejemplo.com"
                    className="w-full px-4 py-3 text-sm font-medium text-slate-800 bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-slate-400"
                    autoComplete="email"
                    autoFocus
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <div className="flex items-center justify-between mb-1.5 ml-1">
                  <label className="block text-xs font-bold text-slate-600">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setRecoveryEmail(email);
                      navigateToView('forgot_password');
                    }}
                    className="text-xs text-blue-650 hover:text-blue-700 font-bold hover:underline focus:outline-none transition-all"
                    tabIndex={-1}
                  >
                    ¿Has olvidado tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-12 py-3 text-sm font-medium text-slate-800 bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-slate-400"
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
          )}

          {/* VISTA 2: SOLICITAR CÓDIGO POR EMAIL */}
          {loginView === 'forgot_password' && (
            <form onSubmit={handleRequestRecoverySubmit} className="flex flex-col gap-4">
              <div className="bg-slate-50 p-4 border border-slate-150 rounded-2xl text-xs text-slate-650 leading-relaxed">
                Introduce la dirección de correo electrónico vinculada a tu cuenta de administrador. Te enviaremos un código temporal de 6 dígitos para verificar tu identidad.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">
                  Correo electrónico
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={recoveryEmail}
                    onChange={(e) => { setRecoveryEmail(e.target.value); setError(''); }}
                    placeholder="tucorreo@ejemplo.com"
                    className="w-full px-4 py-3 text-sm font-medium text-slate-800 bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-slate-400"
                    autoFocus
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full py-3.5 mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed touch-btn"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Enviando código...
                  </>
                ) : (
                  <>
                    <Mail size={16} />
                    Enviar código de verificación
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigateToView('login')}
                className="flex items-center justify-center gap-2 w-full py-3 text-xs font-bold text-slate-500 hover:text-slate-700 transition-all focus:outline-none mt-1"
                disabled={loading}
              >
                <ArrowLeft size={14} />
                Volver al inicio de sesión
              </button>
            </form>
          )}

          {/* VISTA 3: INTRODUCIR CÓDIGO DE VERIFICACIÓN */}
          {loginView === 'verify_code' && (
            <form onSubmit={handleVerifyCodeSubmit} className="flex flex-col gap-4">
              <div className="bg-slate-50 p-4 border border-slate-150 rounded-2xl text-xs text-slate-650 leading-relaxed">
                Hemos enviado el código de verificación al correo electrónico: <strong className="text-slate-800 font-extrabold">{recoveryEmail}</strong>. Por favor, compruébalo e introduce los 6 dígitos.
              </div>

              {isLocalMode && (
                <div className="p-3 bg-blue-50/60 border border-blue-150 rounded-xl text-[11px] font-medium text-blue-800 leading-normal">
                  💡 <strong>Modo desarrollo local:</strong> Se ha simulado el correo. Introduce el código de prueba <span className="font-extrabold text-blue-900 bg-blue-100 px-1.5 py-0.5 rounded">123456</span> para continuar.
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">
                  Código de verificación (6 dígitos)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    placeholder="000000"
                    value={recoveryCode}
                    onChange={(e) => { setRecoveryCode(e.target.value.replace(/[^0-9]/g, '')); setError(''); }}
                    className="w-full px-4 py-3 text-center tracking-[0.5em] text-lg font-black text-slate-850 bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-slate-300"
                    autoFocus
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full py-3.5 mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed touch-btn"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <KeyRound size={16} />
                    Verificar código
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigateToView('forgot_password')}
                className="flex items-center justify-center gap-2 w-full py-3 text-xs font-bold text-slate-500 hover:text-slate-700 transition-all focus:outline-none mt-1"
                disabled={loading}
              >
                <ArrowLeft size={14} />
                Corregir correo electrónico
              </button>
            </form>
          )}

          {/* VISTA 4: ESTABLECER NUEVA CONTRASEÑA */}
          {loginView === 'reset_password' && (
            <form onSubmit={handleResetPasswordSubmit} className="flex flex-col gap-4">
              <div className="bg-slate-50 p-4 border border-slate-150 rounded-2xl text-xs text-slate-650 leading-relaxed">
                Código verificado con éxito. Define a continuación tu nueva contraseña de acceso de administrador (mínimo 4 caracteres).
              </div>

              {/* Nueva Contraseña */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-12 py-3 text-sm font-medium text-slate-800 bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-slate-400"
                    disabled={loading}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors touch-btn"
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">
                  Confirmar nueva contraseña
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-12 py-3 text-sm font-medium text-slate-800 bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-slate-400"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors touch-btn"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full py-3.5 mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed touch-btn"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Estableciendo contraseña...
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    Restablecer contraseña
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigateToView('login')}
                className="flex items-center justify-center gap-2 w-full py-3 text-xs font-bold text-slate-500 hover:text-slate-700 transition-all focus:outline-none mt-1"
                disabled={loading}
              >
                Cancelar y volver
              </button>
            </form>
          )}
        </div>

        {/* Branding footer */}
        <p className="text-center text-[10px] text-slate-400 mt-6">
          Fambly — Gestión Familiar Inteligente
        </p>
      </div>
    </div>
  );
}
