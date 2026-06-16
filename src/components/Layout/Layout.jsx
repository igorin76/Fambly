import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import FamblyLogo from './FamblyLogo';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  ShoppingCart, 
  Wallet,
  Clipboard,
  Users,
  MoreHorizontal,
  X,
  LogOut,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function Layout({ children, activeTab, setActiveTab }) {
  const { currentUser, setCurrentUser, members = [], logout, verifyAdminPassword, authenticatedMemberId } = useStore();
  const [showProfileSheet, setShowProfileSheet] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Estado para el modal de verificación de contraseña de admin
  const [adminPasswordModal, setAdminPasswordModal] = useState({ show: false, member: null });
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState('');
  const [adminPasswordLoading, setAdminPasswordLoading] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const handleUserChange = (member) => {
    // Si el miembro destino es admin y NO es el perfil activo actual, pedir contraseña
    if (member.isAdmin && member.firstName !== currentUser) {
      setAdminPasswordModal({ show: true, member });
      setAdminPassword('');
      setAdminPasswordError('');
      setShowAdminPassword(false);
      return;
    }
    setCurrentUser(member.firstName);
  };

  const handleAdminPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!adminPassword.trim()) {
      setAdminPasswordError('Introduce la contraseña.');
      return;
    }
    setAdminPasswordLoading(true);
    try {
      const isValid = await verifyAdminPassword(adminPasswordModal.member.id, adminPassword);
      if (isValid) {
        setCurrentUser(adminPasswordModal.member.firstName);
        setAdminPasswordModal({ show: false, member: null });
        setShowProfileSheet(false);
      } else {
        setAdminPasswordError('Contraseña incorrecta.');
      }
    } catch {
      setAdminPasswordError('Contraseña incorrecta.');
    } finally {
      setAdminPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Fallback para miembros si aún no están cargados
  const displayMembers = members.length > 0 ? members : [
    { id: 'mem-igor', firstName: 'Igor', role: 'Padre' },
    { id: 'mem-diana', firstName: 'Diana', role: 'Madre' }
  ];

  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tareas', icon: CheckSquare },
    { id: 'calendar', label: 'Calendario', icon: Calendar },
    { id: 'shopping', label: 'Compras', icon: ShoppingCart },
    { id: 'finances', label: 'Finanzas', icon: Wallet },
    { id: 'announcements', label: 'Tablón', icon: Clipboard },
    { id: 'members', label: 'Miembros', icon: Users },
  ];

  const activeMember = displayMembers.find(m => m.firstName === currentUser) || displayMembers[0];

  const mobilePrimaryNavItems = navItems.slice(0, 4); // Inicio, Tareas, Calendario, Compras
  const mobileSecondaryNavItems = navItems.slice(4); // Finanzas, Tablón, Miembros

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-slate-50 text-slate-800 relative selection:bg-blue-100 selection:text-blue-900">
      {/* Patrón de fondo opcional sutil */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/40 via-slate-50/20 to-slate-100/50 pointer-events-none" />
      
      {/* HEADER DE APLICACIÓN */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/60 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-14 md:h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* LOGO */}
          <div className="flex items-center gap-2">
            <FamblyLogo className="h-7 md:h-8" />
          </div>

          {/* SELECTOR DE USUARIO ACTIVO DINÁMICO */}
          <div className="flex items-center gap-2">
            {/* Inline en pantallas medianas/grandes */}
            <div className="hidden sm:flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200/50 overflow-x-auto scrollbar-none">
              {displayMembers.map((m) => {
                const isActive = currentUser === m.firstName;
                const isKid = m.role === 'Hijo' || m.role === 'Hija';
                
                let dotColor = 'bg-blue-500';
                let textColor = 'text-blue-600';
                if (isKid) {
                  dotColor = 'bg-orange-500';
                  textColor = 'text-orange-600';
                } else if (m.firstName === 'Diana') {
                  dotColor = 'bg-purple-500';
                  textColor = 'text-purple-600';
                }

                return (
                  <button
                    key={m.id}
                    onClick={() => handleUserChange(m)}
                    className={`relative z-10 flex h-8 px-3.5 items-center gap-1.5 rounded-lg text-xs font-bold tracking-wide transition-all shrink-0 touch-btn ${
                      isActive 
                        ? `bg-white ${textColor} shadow-sm border border-slate-200/30` 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full transition-all ${
                      isActive ? `${dotColor} scale-110` : 'bg-slate-300'
                    }`} />
                    {m.firstName}
                    {m.isAdmin && <ShieldCheck size={10} className="opacity-50" />}
                  </button>
                );
              })}
            </div>

            {/* Avatar compacto en móviles (pantallas < sm) */}
            <button
              onClick={() => setShowProfileSheet(true)}
              className="flex sm:hidden items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/60 hover:bg-slate-100 transition-colors shadow-sm select-none touch-btn"
            >
              <span className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-black text-white ${
                activeMember.role === 'Padre' ? 'bg-blue-600' :
                activeMember.role === 'Madre' ? 'bg-purple-600' : 'bg-orange-500'
              }`}>
                {activeMember.firstName[0]}
              </span>
              <span className="text-sm font-bold text-slate-700">{activeMember.firstName}</span>
            </button>

            {/* Botón de Cerrar Sesión Siempre Visible */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center p-2 rounded-xl border border-slate-200/50 bg-slate-50 text-slate-500 hover:text-red-655 hover:bg-red-50 hover:border-red-100 transition-all touch-btn"
              title="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="relative mx-auto flex w-full max-w-7xl flex-1 px-3 py-4 sm:px-6 sm:py-6 lg:px-8 pb-24 md:pb-6">
        
        {/* SIDEBAR ESCRITORIO (md+) */}
        <aside className="hidden md:flex w-64 flex-col gap-2 pr-6">
          <div className="flat-card p-4 flex flex-col gap-1.5 border border-slate-200/60 bg-white">
            <div className="mb-3 px-3 py-2 flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full text-white font-bold text-sm shadow-sm ${
                activeMember.role === 'Padre' ? 'bg-blue-500' : 'bg-purple-500'
              }`}>
                {activeMember.firstName[0]}
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perfil Activo</p>
                <p className="text-sm font-extrabold text-slate-800">{activeMember.firstName}</p>
              </div>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              const activeStyles = activeMember.role === 'Padre'
                ? 'bg-blue-50 text-blue-600 border border-blue-100/50'
                : 'bg-purple-50/70 text-purple-600 border border-purple-100/50';

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all border touch-btn ${
                    isActive 
                      ? activeStyles 
                      : 'text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'scale-110' : 'opacity-70'} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </aside>

        {/* CONTENIDO MAIN */}
        <main className="flex-1 min-w-0">
          <div className="animate-fadeIn">
            {children}
          </div>
        </main>
      </div>

      {/* ═══════════════════════════════════════════════════
          BOTTOM NAV PARA MÓVIL — Diseño Premium Floating
          ═══════════════════════════════════════════════════ */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden pointer-events-none flex justify-center pb-safe"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)' }}
      >
        <div className="mx-3 w-full max-w-sm bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-[24px] shadow-premium pointer-events-auto px-1.5 py-1">
          <div className="flex justify-around items-center">
            {mobilePrimaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              const activeColor = activeMember.role === 'Padre' 
                ? 'text-blue-600' 
                : 'text-purple-600';

              const activeBg = activeMember.role === 'Padre' 
                ? 'bg-blue-50/80' 
                : 'bg-purple-50/80';

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className="flex-1 flex flex-col items-center justify-center py-1.5 rounded-xl transition-all touch-btn min-h-[44px]"
                >
                  <div className={`p-1.5 rounded-[12px] transition-all duration-350 ${
                    isActive 
                      ? `${activeBg} ${activeColor} shadow-sm border border-slate-100` 
                      : 'text-slate-400 hover:text-slate-650'
                  }`}>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                  </div>
                  <span className={`text-[9px] font-bold mt-0.5 tracking-wide transition-colors hidden min-[360px]:block ${
                    isActive ? activeColor : 'text-slate-400'
                  }`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
            
            {/* Botón MÁS para móvil */}
            {(() => {
              const isSecondaryActive = mobileSecondaryNavItems.some(item => activeTab === item.id);
              const activeColor = activeMember.role === 'Padre' 
                ? 'text-blue-600' 
                : 'text-purple-600';
              const activeBg = activeMember.role === 'Padre' 
                ? 'bg-blue-50/80' 
                : 'bg-purple-50/80';

              return (
                <button
                  onClick={() => setShowMoreMenu(true)}
                  className="flex-1 flex flex-col items-center justify-center py-1.5 rounded-xl transition-all touch-btn min-h-[44px]"
                >
                  <div className={`p-1.5 rounded-[12px] transition-all duration-350 ${
                    isSecondaryActive ? `${activeBg} ${activeColor} shadow-sm border border-slate-100` : 'text-slate-400 hover:text-slate-650'
                  }`}>
                    <MoreHorizontal size={20} strokeWidth={isSecondaryActive ? 2.5 : 2} className={`transition-transform duration-300 ${isSecondaryActive ? 'scale-110' : ''}`} />
                  </div>
                  <span className={`text-[9px] font-bold mt-0.5 tracking-wide transition-colors hidden min-[360px]:block ${
                    isSecondaryActive ? activeColor : 'text-slate-400'
                  }`}>
                    Más
                  </span>
                </button>
              );
            })()}
          </div>
        </div>
      </nav>

      {/* DETALLES DE PERFIL BOTTOM SHEET PARA MÓVIL */}
      {showProfileSheet && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn" 
          onClick={() => setShowProfileSheet(false)}
        >
          <div 
            className="w-full bg-white rounded-t-3xl p-6 shadow-2xl animate-slideUp max-h-[80vh] overflow-y-auto border-t border-slate-200/50"
            style={{ paddingBottom: 'calc(max(env(safe-area-inset-bottom, 0px), 16px) + 16px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-5" />
            <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Cambiar Perfil Familiar</h3>
              <button onClick={() => setShowProfileSheet(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors border-none bg-transparent cursor-pointer touch-btn">
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {displayMembers.map((m) => {
                const isSelected = currentUser === m.firstName;
                const isKid = m.role === 'Hijo' || m.role === 'Hija';
                
                let bgClass = 'bg-slate-50 border-slate-100 text-slate-700';
                if (isSelected) {
                  bgClass = isKid 
                    ? 'bg-orange-50 border-orange-200 text-orange-700 ring-1 ring-orange-200/50' 
                    : m.firstName === 'Diana'
                      ? 'bg-purple-50 border-purple-200 text-purple-700 ring-1 ring-purple-200/50'
                      : 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200/50';
                }

                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      handleUserChange(m);
                      if (!m.isAdmin || m.firstName === currentUser) {
                        setShowProfileSheet(false);
                      }
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left font-bold transition-all ${bgClass} cursor-pointer touch-btn`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm ${
                        m.role === 'Padre' ? 'bg-blue-600' :
                        m.role === 'Madre' ? 'bg-purple-600' : 'bg-orange-500'
                      }`}>
                        {m.firstName[0]}
                      </span>
                      <div>
                        <p className="text-sm font-black text-slate-800 leading-tight flex items-center gap-1.5">
                          {m.firstName}
                          {m.isAdmin && <ShieldCheck size={12} className="text-blue-500" />}
                        </p>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">
                          {m.role}{m.isAdmin && ' · Admin'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {m.isAdmin && !isSelected && (
                        <Lock size={14} className="text-slate-400" />
                      )}
                      {isSelected && (
                        <span className={`h-2.5 w-2.5 rounded-full ${
                          isKid ? 'bg-orange-500' : m.firstName === 'Diana' ? 'bg-purple-500' : 'bg-blue-600'
                        }`} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Botón de Cerrar Sesión en el sheet de perfiles */}
            <button
              onClick={handleLogout}
              className="w-full mt-4 flex items-center justify-center gap-2 p-3.5 rounded-2xl border border-red-200/60 bg-red-50/50 text-red-600 font-bold text-sm transition-all hover:bg-red-100 touch-btn"
            >
              <LogOut size={16} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}

      {/* MENÚ MÁS BOTTOM SHEET PARA MÓVIL */}
      {showMoreMenu && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn" 
          onClick={() => setShowMoreMenu(false)}
        >
          <div 
            className="w-full bg-white rounded-t-3xl p-6 shadow-2xl animate-slideUp max-h-[80vh] overflow-y-auto border-t border-slate-200/50"
            style={{ paddingBottom: 'calc(max(env(safe-area-inset-bottom, 0px), 16px) + 16px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-5" />
            <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Más Secciones</h3>
              <button onClick={() => setShowMoreMenu(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors border-none bg-transparent cursor-pointer touch-btn">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {mobileSecondaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const activeColor = activeMember.role === 'Padre' 
                  ? 'text-blue-600 bg-blue-50 border-blue-150 shadow-sm shadow-blue-500/5' 
                  : 'text-purple-600 bg-purple-50 border-purple-150 shadow-sm shadow-purple-500/5';

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setShowMoreMenu(false);
                    }}
                    className={`flex flex-col items-center justify-center p-5 rounded-2xl border text-center transition-all cursor-pointer touch-btn ${
                      isActive 
                        ? activeColor 
                        : 'bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-650'
                    }`}
                  >
                    <div className="p-3 rounded-xl bg-white shadow-sm border border-slate-200/40 mb-2.5">
                      <Icon size={22} className={isActive ? 'scale-110' : 'opacity-80'} />
                    </div>
                    <span className="text-[10px] font-black tracking-wider uppercase leading-none">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONTRASEÑA DE ADMIN */}
      {adminPasswordModal.show && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fadeIn p-4" 
          onClick={() => setAdminPasswordModal({ show: false, member: null })}
        >
          <div 
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-xl bg-blue-50">
                <Lock size={18} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800">Acceso de Administrador</h3>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Introduce la contraseña de <span className="font-bold">{adminPasswordModal.member?.firstName}</span>
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleAdminPasswordSubmit}>
              <div className="relative mb-3">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  value={adminPassword}
                  onChange={(e) => { setAdminPassword(e.target.value); setAdminPasswordError(''); }}
                  placeholder="Contraseña"
                  className="w-full pl-10 pr-12 py-3 text-sm font-medium text-slate-800 bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-slate-400"
                  autoFocus
                  disabled={adminPasswordLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors touch-btn"
                  tabIndex={-1}
                >
                  {showAdminPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {/* Error */}
              {adminPasswordError && (
                <div className="flex items-center gap-2 px-3 py-2 mb-3 bg-red-50 border border-red-200/60 rounded-xl animate-fadeIn">
                  <AlertCircle size={12} className="text-red-500 shrink-0" />
                  <span className="text-[11px] font-bold text-red-700">{adminPasswordError}</span>
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAdminPasswordModal({ show: false, member: null })}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all touch-btn"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={adminPasswordLoading}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-sm disabled:opacity-50 touch-btn"
                >
                  {adminPasswordLoading ? 'Verificando...' : 'Entrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
    </div>
  );
}
