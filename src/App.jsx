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

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { fetchInitialData, currentUser, members = [] } = useStore();

  // Cargar datos al iniciar
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Verificar si el usuario activo es niño
  const activeMember = members.find(m => m.firstName === currentUser);
  const isKidsMode = activeMember && (activeMember.role === 'Hijo' || activeMember.role === 'Hija');

  if (isKidsMode) {
    return <KidsModeView member={activeMember} />;
  }

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

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}
