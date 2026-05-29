import React, { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import TaskManager from './components/TaskManager/TaskManager';
import CalendarView from './components/Calendar/CalendarView';
import ShoppingListView from './components/ShoppingList/ShoppingListView';
import FinancePanel from './components/FinancePanel/FinancePanel';
import KidsModeView from './components/KidsMode/KidsModeView';
import AnnouncementBoard from './components/Announcements/AnnouncementBoard';
import MemberManager from './components/Members/MemberManager';
import { Mail, CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { fetchInitialData, currentUser, members = [] } = useStore();
  const [toast, setToast] = useState(null);

  // Cargar datos al iniciar
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Suscribirse a eventos de correo electrónico
  useEffect(() => {
    const handleSimulated = (e) => {
      const { adminEmail, adminName, taskTitle } = e.detail;
      setToast({
        type: 'simulated',
        title: 'Notificación Simulada',
        message: `Se enviaría un correo a ${adminName} (${adminEmail}) sobre la tarea: "${taskTitle}". (Variables de EmailJS no configuradas)`,
      });
    };

    const handleSent = (e) => {
      const { adminEmail, adminName, taskTitle } = e.detail;
      setToast({
        type: 'success',
        title: 'Correo Enviado',
        message: `Notificación enviada con éxito a ${adminName} (${adminEmail}) por la tarea: "${taskTitle}".`,
      });
    };

    const handleError = (e) => {
      const { adminEmail, error } = e.detail;
      setToast({
        type: 'error',
        title: 'Error de Notificación',
        message: `No se pudo enviar el correo a ${adminEmail}: ${error}`,
      });
    };

    window.addEventListener('email-simulated', handleSimulated);
    window.addEventListener('email-sent', handleSent);
    window.addEventListener('email-error', handleError);

    return () => {
      window.removeEventListener('email-simulated', handleSimulated);
      window.removeEventListener('email-sent', handleSent);
      window.removeEventListener('email-error', handleError);
    };
  }, []);

  // Ocultar toast automáticamente tras 6 segundos
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Verificar si el usuario activo es niño
  const activeMember = members.find(m => m.firstName === currentUser);
  const isKidsMode = activeMember && (activeMember.role === 'Hijo' || activeMember.role === 'Hija');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'tasks':
        return <TaskManager />;
      case 'calendar':
        return <CalendarView setActiveTab={setActiveTab} />;
      case 'shopping':
        return <ShoppingListView />;
      case 'finances':
        return <FinancePanel />;
      case 'announcements':
        return <AnnouncementBoard />;
      case 'members':
        return <MemberManager />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  const mainView = isKidsMode ? (
    <KidsModeView member={activeMember} />
  ) : (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );

  return (
    <>
      {mainView}
      
      {/* Toast Notification para emails */}
      {toast && (
        <div className="fixed top-4 right-4 z-[9999] w-[calc(100%-2rem)] sm:w-80 bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-2xl flex items-start gap-3 animate-slideIn select-none">
          <div className={`p-2 rounded-xl shrink-0 ${
            toast.type === 'error' ? 'bg-red-50 text-red-650' :
            toast.type === 'success' ? 'bg-emerald-50 text-emerald-650' :
            'bg-blue-50 text-blue-600'
          }`}>
            {toast.type === 'error' ? <AlertCircle size={16} /> :
             toast.type === 'success' ? <CheckCircle2 size={16} /> :
             <Mail size={16} />}
          </div>
          
          <div className="flex-1 min-w-0">
            <h5 className="text-xs font-extrabold text-slate-800 leading-snug">{toast.title}</h5>
            <p className="text-[10px] text-slate-500 font-bold leading-normal mt-1">{toast.message}</p>
          </div>
          
          <button 
            onClick={() => setToast(null)} 
            className="text-slate-400 hover:text-slate-655 p-1 rounded-lg hover:bg-slate-100/50 transition-all touch-btn shrink-0"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </>
  );
}
