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
  X
} from 'lucide-react';

export default function Layout({ children, activeTab, setActiveTab }) {
  const { currentUser, setCurrentUser, members = [] } = useStore();
  const [showProfileSheet, setShowProfileSheet] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const handleUserChange = (user) => {
    setCurrentUser(user);
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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 transition-colors duration-300">
      
      {/* HEADER DE APLICACIÓN */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/60 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* LOGO */}
          <div className="flex items-center gap-2">
            <FamblyLogo className="h-8" />
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
                    onClick={() => handleUserChange(m.firstName)}
                    className={`relative z-10 flex h-8 px-3.5 items-center gap-1.5 rounded-lg text-xs font-bold tracking-wide transition-all shrink-0 ${
                      isActive 
                        ? `bg-white ${textColor} shadow-sm border border-slate-200/30` 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full transition-all ${
                      isActive ? `${dotColor} scale-110` : 'bg-slate-300'
                    }`} />
                    {m.firstName}
                  </button>
                );
              })}
            </div>

            {/* Avatar compacto en móviles (pantallas < sm) */}
            <button
              onClick={() => setShowProfileSheet(true)}
              className="flex sm:hidden items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/60 hover:bg-slate-100 transition-colors shadow-sm select-none"
            >
              <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black text-white ${
                activeMember.role === 'Padre' ? 'bg-blue-600' :
                activeMember.role === 'Madre' ? 'bg-purple-600' : 'bg-orange-500'
              }`}>
                {activeMember.firstName[0]}
              </span>
              <span className="text-xs font-bold text-slate-700">{activeMember.firstName}</span>
            </button>
          </div>
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 pb-24 md:pb-6">
        
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all border ${
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

      {/* BOTTOM NAV PARA MÓVIL (md-) */}
      <nav className="fixed bottom-4 left-4 right-4 z-50 md:hidden border border-slate-200/60 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg">
        <div className="flex justify-around items-center max-w-lg mx-auto gap-2">
          {mobilePrimaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            const activeColor = activeMember.role === 'Padre' 
              ? 'text-blue-600 bg-blue-50' 
              : 'text-purple-600 bg-purple-50';

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all"
              >
                <div className={`p-2 rounded-xl transition-all ${
                  isActive ? activeColor : 'text-slate-400'
                }`}>
                  <Icon size={18} className={isActive ? 'scale-110' : 'opacity-75'} />
                </div>
                <span className="text-[9px] font-bold mt-1 tracking-wider uppercase">{item.label}</span>
              </button>
            );
          })}
          
          {/* Botón MÁS para móvil */}
          {(() => {
            const isSecondaryActive = mobileSecondaryNavItems.some(item => activeTab === item.id);
            const activeColor = activeMember.role === 'Padre' 
              ? 'text-blue-600 bg-blue-50' 
              : 'text-purple-600 bg-purple-50';

            return (
              <button
                onClick={() => setShowMoreMenu(true)}
                className="flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all"
              >
                <div className={`p-2 rounded-xl transition-all ${
                  isSecondaryActive ? activeColor : 'text-slate-400'
                }`}>
                  <MoreHorizontal size={18} />
                </div>
                <span className="text-[9px] font-bold mt-1 tracking-wider uppercase">Más</span>
              </button>
            );
          })()}
        </div>
      </nav>

      {/* DETALLES DE PERFIL BOTTOM SHEET PARA MÓVIL */}
      {showProfileSheet && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn" 
          onClick={() => setShowProfileSheet(false)}
        >
          <div 
            className="w-full bg-white rounded-t-3xl p-6 shadow-2xl animate-slideUp max-h-[80vh] overflow-y-auto border-t border-slate-200/50 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />
            <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Cambiar Perfil Familiar</h3>
              <button onClick={() => setShowProfileSheet(false)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors border-none bg-transparent cursor-pointer">
                <X size={18} />
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
                      handleUserChange(m.firstName);
                      setShowProfileSheet(false);
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left font-bold transition-all ${bgClass} cursor-pointer`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${
                        m.role === 'Padre' ? 'bg-blue-600' :
                        m.role === 'Madre' ? 'bg-purple-600' : 'bg-orange-500'
                      }`}>
                        {m.firstName[0]}
                      </span>
                      <div>
                        <p className="text-xs font-black text-slate-800 leading-tight">{m.firstName}</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{m.role}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <span className={`h-2 w-2 rounded-full ${
                        isKid ? 'bg-orange-500' : m.firstName === 'Diana' ? 'bg-purple-500' : 'bg-blue-600'
                      }`} />
                    )}
                  </button>
                );
              })}
            </div>
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
            className="w-full bg-white rounded-t-3xl p-6 shadow-2xl animate-slideUp max-h-[80vh] overflow-y-auto border-t border-slate-200/50 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />
            <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 font-black">Más Secciones</h3>
              <button onClick={() => setShowMoreMenu(false)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors border-none bg-transparent cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3.5">
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
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                      isActive 
                        ? activeColor 
                        : 'bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-650'
                    }`}
                  >
                    <div className="p-2.5 rounded-xl bg-white shadow-sm border border-slate-200/40 mb-2">
                      <Icon size={20} className={isActive ? 'scale-110' : 'opacity-80'} />
                    </div>
                    <span className="text-[9px] font-black tracking-wider uppercase leading-none">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
