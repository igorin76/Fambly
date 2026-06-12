import React, { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import {
  getTaskStatus,
  getDaysUntilBirthday,
  formatDateSpanish,
  getGreeting,
  formatDateLong,
  isToday,
  isThisWeek,
  formatCurrency
} from '../../utils/dateHelpers';
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  Download,
  AlertTriangle,
  Clock,
  Cake,
  ShoppingCart,
  ChevronRight,
  Wallet,
  TrendingUp,
  Users,
  Star,
  Shield,
  Zap,
  Sun,
  ListChecks,
  Receipt,
  Target,
  Trophy,
  Package,
  ArrowRight,
  Bell,
  CircleDot,
  BarChart3
} from 'lucide-react';

export default function Dashboard({ setActiveTab }) {
  const {
    tasks,
    events,
    shoppingItems,
    clothingLogistics = [],
    members = [],
    budgets = [],
    receipts = [],
    procedures = [],
    announcements = [],
    currentUser
  } = useStore();

  // ═══════════════════════════════════════════════════
  // DATOS COMPUTADOS
  // ═══════════════════════════════════════════════════

  const activeMember = members.find(m => m.firstName === currentUser) || {};
  const greeting = getGreeting();
  const todayLong = formatDateLong();

  // Crear eventos de cumpleaños virtuales a partir de los cumpleaños de los miembros
  const virtualBirthdayEvents = members
    .filter(m => m.birthDate)
    .map(m => ({
      id: `bday-${m.id}`,
      title: `🎂 Cumpleaños de ${m.firstName}`,
      date: m.birthDate,
      type: 'cumpleanos',
      target: m.firstName,
      description: `¡Felicidades, ${m.firstName}!`,
      isVirtual: true
    }));

  const allEvents = [...events, ...virtualBirthdayEvents];

  // — Datos derivados con useMemo para rendimiento —
  const derivedData = useMemo(() => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // ──── AGENDA DEL DÍA ────
    const todayEvents = allEvents
      .filter(e => {
        if (!e.date) return false;
        // Para cumpleaños, comparar solo mes y día
        if (e.type === 'cumpleanos') {
          const parts = e.date.split('-');
          const eventMonth = parts.length === 3 ? parts[1] : parts[0];
          const eventDay = parts.length === 3 ? parts[2] : parts[1];
          return eventMonth === String(now.getMonth() + 1).padStart(2, '0') &&
                 eventDay === String(now.getDate()).padStart(2, '0');
        }
        return e.date === todayStr;
      });

    const todayTasks = tasks.filter(t => !t.completed && t.dueDate === todayStr);
    const todayReceipts = receipts.filter(r => !r.paid && r.nextDueDate === todayStr);

    // ──── ALERTAS CRÍTICAS ────
    const expiredTasks = tasks.filter(t => !t.completed && getTaskStatus(t.dueDate, t.completed) === 'caducada');
    const pendingAcceptanceTasks = tasks.filter(t => !t.isAccepted && !t.completed);
    const overdueReceipts = receipts.filter(r => {
      if (r.paid || !r.nextDueDate) return false;
      return r.nextDueDate < todayStr;
    });
    const urgentHighPriorityTasks = tasks.filter(t => {
      if (t.completed) return false;
      const status = getTaskStatus(t.dueDate, t.completed);
      return status === 'urgente' && t.priority === 'ALTA';
    });

    const totalAlerts = expiredTasks.length + pendingAcceptanceTasks.length + overdueReceipts.length + urgentHighPriorityTasks.length;

    // ──── PRÓXIMOS EVENTOS ────
    const upcomingEvents = allEvents
      .filter(e => e.date && e.date >= todayStr)
      .map(e => ({ ...e, daysLeft: getDaysUntilBirthday(e.date) }))
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);

    // ──── ESTADO POR MIEMBRO ────
    const memberStats = members.map(m => {
      const memberTasks = tasks.filter(t =>
        (t.assignedMemberIds && t.assignedMemberIds.includes(m.id)) ||
        t.assignee === m.firstName
      );
      const activeTasks = memberTasks.filter(t => !t.completed).length;
      const completedThisWeek = memberTasks.filter(t => t.completed && t.completedAt && isThisWeek(t.completedAt.split('T')[0])).length;
      const totalThisWeek = memberTasks.filter(t => t.createdAt && isThisWeek(t.createdAt)).length;
      const pendingAcceptance = tasks.filter(t =>
        !t.isAccepted && !t.completed &&
        t.assignedMemberIds && t.assignedMemberIds.includes(m.id)
      ).length;

      const daysUntilBday = m.birthDate ? getDaysUntilBirthday(m.birthDate) : null;

      return {
        ...m,
        activeTasks,
        completedThisWeek,
        totalThisWeek,
        pendingAcceptance,
        daysUntilBday
      };
    });

    // ──── FINANZAS ────
    const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
    const totalBudgetSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const budgetPercentage = totalBudgetLimit > 0 ? Math.round((totalBudgetSpent / totalBudgetLimit) * 100) : 0;

    const upcomingReceipts = receipts
      .filter(r => !r.paid && r.nextDueDate && r.nextDueDate >= todayStr)
      .sort((a, b) => a.nextDueDate.localeCompare(b.nextDueDate))
      .slice(0, 3);

    const paidReceiptsCount = receipts.filter(r => r.paid).length;
    const unpaidReceiptsCount = receipts.filter(r => !r.paid).length;

    // ──── COMPRA ────
    const totalShoppingItems = shoppingItems.length;
    const completedShoppingItems = shoppingItems.filter(i => i.completed).length;
    const pendingShoppingItems = totalShoppingItems - completedShoppingItems;
    const shoppingProgress = totalShoppingItems > 0 ? Math.round((completedShoppingItems / totalShoppingItems) * 100) : 0;

    // Categorías con más ítems pendientes
    const categoryMap = {};
    shoppingItems.filter(i => !i.completed).forEach(i => {
      const cat = i.category || 'Sin categoría';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    const topCategories = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    // ──── RENDIMIENTO SEMANAL ────
    const weekTasks = tasks.filter(t => t.createdAt && isThisWeek(t.createdAt));
    const weekCompleted = weekTasks.filter(t => t.completed).length;
    const weekCompletionRate = weekTasks.length > 0 ? Math.round((weekCompleted / weekTasks.length) * 100) : 0;

    const totalCompleted = tasks.filter(t => t.completed).length;
    const totalPending = tasks.filter(t => !t.completed).length;

    // Distribución por ámbito para donut
    const igorTasks = tasks.filter(t => t.scope === 'individual' && t.assignee === 'Igor').length;
    const dianaTasks = tasks.filter(t => t.scope === 'individual' && t.assignee === 'Diana').length;
    const matrimonialTasks = tasks.filter(t => t.scope === 'matrimonial').length;
    const ninosTasks = tasks.filter(t => t.scope === 'ninos').length;
    const totalTaskCount = tasks.length;

    // Barras de progreso por miembro
    const barData = [
      { name: 'Igor', total: tasks.filter(t => t.assignee === 'Igor').length, done: tasks.filter(t => t.assignee === 'Igor' && t.completed).length, color: '#3b82f6' },
      { name: 'Diana', total: tasks.filter(t => t.assignee === 'Diana').length, done: tasks.filter(t => t.assignee === 'Diana' && t.completed).length, color: '#a855f7' },
      { name: 'Niños', total: tasks.filter(t => t.scope === 'ninos').length, done: tasks.filter(t => t.scope === 'ninos' && t.completed).length, color: '#f97316' },
      { name: 'Común', total: tasks.filter(t => t.scope === 'matrimonial').length, done: tasks.filter(t => t.scope === 'matrimonial' && t.completed).length, color: '#10b981' }
    ];

    // Resumen inline para cabecera
    const pendingTasksCount = tasks.filter(t => !t.completed).length;
    const todayEventsCount = todayEvents.length;
    const unpaidReceiptsTotal = unpaidReceiptsCount;

    return {
      todayEvents, todayTasks, todayReceipts,
      expiredTasks, pendingAcceptanceTasks, overdueReceipts, urgentHighPriorityTasks, totalAlerts,
      upcomingEvents, memberStats,
      totalBudgetLimit, totalBudgetSpent, budgetPercentage, upcomingReceipts, paidReceiptsCount, unpaidReceiptsCount,
      totalShoppingItems, completedShoppingItems, pendingShoppingItems, shoppingProgress, topCategories,
      weekTasks, weekCompleted, weekCompletionRate, totalCompleted, totalPending,
      igorTasks, dianaTasks, matrimonialTasks, ninosTasks, totalTaskCount, barData,
      pendingTasksCount, todayEventsCount, unpaidReceiptsTotal
    };
  }, [tasks, events, shoppingItems, members, budgets, receipts, allEvents]);

  // ═══════════════════════════════════════════════════
  // GRÁFICO DONUT SVG
  // ═══════════════════════════════════════════════════
  const chartSegments = [
    { name: 'Igor', count: derivedData.igorTasks, color: '#3b82f6', pct: derivedData.totalTaskCount > 0 ? Math.round((derivedData.igorTasks / derivedData.totalTaskCount) * 100) : 0 },
    { name: 'Diana', count: derivedData.dianaTasks, color: '#a855f7', pct: derivedData.totalTaskCount > 0 ? Math.round((derivedData.dianaTasks / derivedData.totalTaskCount) * 100) : 0 },
    { name: 'Matrimonial', count: derivedData.matrimonialTasks, color: '#10b981', pct: derivedData.totalTaskCount > 0 ? Math.round((derivedData.matrimonialTasks / derivedData.totalTaskCount) * 100) : 0 },
    { name: 'Niños', count: derivedData.ninosTasks, color: '#f97316', pct: derivedData.totalTaskCount > 0 ? Math.round((derivedData.ninosTasks / derivedData.totalTaskCount) * 100) : 0 }
  ].filter(s => s.count > 0);

  let accumulatedPercentage = 0;
  const donutData = chartSegments.map(seg => {
    const strokeDash = `${(seg.count / derivedData.totalTaskCount) * 188.5} 188.5`;
    const strokeOffset = 188.5 - (accumulatedPercentage / 100) * 188.5;
    accumulatedPercentage += (seg.count / derivedData.totalTaskCount) * 100;
    return { ...seg, strokeDash, strokeOffset };
  });

  // Exportar informe
  const handleExportData = () => {
    const backup = { tasks, events, shoppingItems, budgets, receipts, members };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Fambly_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // ═══════════════════════════════════════════════════
  // HELPERS DE RENDERIZADO
  // ═══════════════════════════════════════════════════

  const getMemberColor = (member) => {
    if (!member) return { bg: 'bg-slate-500', light: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' };
    const isKid = member.role === 'Hijo' || member.role === 'Hija';
    if (isKid) return { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' };
    if (member.firstName === 'Diana') return { bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' };
    return { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' };
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'ALTA': return { label: 'Alta', cls: 'bg-red-100 text-red-700 border-red-200' };
      case 'MEDIA': return { label: 'Media', cls: 'bg-amber-100 text-amber-700 border-amber-200' };
      case 'BAJA': return { label: 'Baja', cls: 'bg-green-100 text-green-700 border-green-200' };
      default: return { label: 'Normal', cls: 'bg-slate-100 text-slate-600 border-slate-200' };
    }
  };

  // ═══════════════════════════════════════════════════
  // RENDERIZADO
  // ═══════════════════════════════════════════════════

  return (
    <div className="flex flex-col gap-5 sm:gap-6">

      {/* ════════════════════════════════════════════════
          WIDGET 1: SALUDO CONTEXTUAL + RESUMEN DEL DÍA
          ════════════════════════════════════════════════ */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-800 flex items-center gap-2">
            {greeting.text}, {currentUser} <span className="text-lg">{greeting.emoji}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-semibold">
            {todayLong}
          </p>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {derivedData.pendingTasksCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                <ListChecks size={12} className="text-blue-500" />
                {derivedData.pendingTasksCount} tareas pendientes
              </span>
            )}
            {derivedData.unpaidReceiptsTotal > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                <Receipt size={12} className="text-amber-500" />
                {derivedData.unpaidReceiptsTotal} recibos por pagar
              </span>
            )}
            {derivedData.todayEventsCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                <Calendar size={12} className="text-emerald-500" />
                {derivedData.todayEventsCount} eventos hoy
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleExportData}
          className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition-all self-start touch-btn"
        >
          <Download size={14} />
          Exportar
        </button>
      </div>


      {/* ════════════════════════════════════════════════
          WIDGET 2: "QUÉ HAY HOY" — AGENDA DEL DÍA
          ════════════════════════════════════════════════ */}
      <div className="flat-card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Sun size={14} className="text-amber-500" /> Qué Hay Hoy
          </h3>
          <button
            onClick={() => setActiveTab('calendar')}
            className="text-[10px] sm:text-xs font-bold text-blue-600 touch-btn px-2 py-1 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Ver calendario →
          </button>
        </div>

        {(derivedData.todayEvents.length > 0 || derivedData.todayTasks.length > 0 || derivedData.todayReceipts.length > 0) ? (
          <div className="flex flex-col gap-2">
            {/* Eventos de hoy */}
            {derivedData.todayEvents.map(evt => (
              <button
                key={evt.id}
                onClick={() => setActiveTab('calendar')}
                className="w-full text-left p-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50/50 flex items-center gap-3 transition-all touch-btn group"
              >
                <div className={`p-2 rounded-lg shrink-0 ${evt.type === 'cumpleanos' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                  {evt.type === 'cumpleanos' ? <Cake size={16} /> : <Calendar size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">{evt.title}</p>
                  {evt.description && <p className="text-[10px] text-slate-400 mt-0.5 truncate">{evt.description}</p>}
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 shrink-0">Hoy</span>
              </button>
            ))}

            {/* Tareas con vencimiento hoy */}
            {derivedData.todayTasks.map(task => {
              const priority = getPriorityBadge(task.priority);
              return (
                <button
                  key={task.id}
                  onClick={() => setActiveTab('tasks')}
                  className="w-full text-left p-3 rounded-xl border border-amber-100 bg-amber-50/30 hover:bg-amber-50/60 flex items-center gap-3 transition-all touch-btn group"
                >
                  <div className="p-2 rounded-lg shrink-0 bg-amber-100 text-amber-600">
                    <Clock size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">{task.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {task.assignee} {task.category !== 'GENERAL' && `• ${task.category}`}
                    </p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${priority.cls}`}>{priority.label}</span>
                </button>
              );
            })}

            {/* Recibos que vencen hoy */}
            {derivedData.todayReceipts.map(receipt => (
              <button
                key={receipt.id}
                onClick={() => setActiveTab('finances')}
                className="w-full text-left p-3 rounded-xl border border-red-100 bg-red-50/30 hover:bg-red-50/60 flex items-center gap-3 transition-all touch-btn group"
              >
                <div className="p-2 rounded-lg shrink-0 bg-red-100 text-red-600">
                  <Receipt size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">{receipt.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Vence hoy</p>
                </div>
                <span className="text-xs font-black text-red-600 shrink-0">{formatCurrency(receipt.amount)}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-3 bg-emerald-50 rounded-2xl mb-3">
              <Sparkles size={28} className="text-emerald-500" />
            </div>
            <p className="text-sm font-bold text-slate-700">¡Día libre!</p>
            <p className="text-[11px] text-slate-400 mt-1">No hay eventos, tareas ni recibos para hoy. Disfruta de tu familia. 🎉</p>
          </div>
        )}
      </div>


      {/* ════════════════════════════════════════════════
          WIDGET 3: "ATENCIÓN REQUERIDA" — ALERTAS CRÍTICAS
          ════════════════════════════════════════════════ */}
      <div className={`flat-card p-4 sm:p-5 transition-all ${derivedData.totalAlerts > 0 ? 'ring-1 ring-red-200/50 border-red-100' : ''}`}>
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Bell size={14} className={derivedData.totalAlerts > 0 ? 'text-red-500 animate-pulse' : 'text-slate-400'} />
            Atención Requerida
            {derivedData.totalAlerts > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                {derivedData.totalAlerts}
              </span>
            )}
          </h3>
        </div>

        {derivedData.totalAlerts > 0 ? (
          <div className="flex flex-col gap-2">
            {/* Tareas caducadas */}
            {derivedData.expiredTasks.slice(0, 3).map(task => (
              <button
                key={task.id}
                onClick={() => setActiveTab('tasks')}
                className="w-full text-left p-3 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-50 flex items-center gap-3 transition-all touch-btn"
              >
                <div className="p-2 rounded-lg shrink-0 bg-red-100 text-red-600">
                  <AlertTriangle size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{task.title}</p>
                  <p className="text-[10px] text-red-500 font-semibold mt-0.5">
                    Caducada · Límite: {formatDateSpanish(task.dueDate)}
                  </p>
                </div>
                <ChevronRight size={14} className="text-slate-300 shrink-0" />
              </button>
            ))}
            {derivedData.expiredTasks.length > 3 && (
              <button onClick={() => setActiveTab('tasks')} className="text-[10px] text-red-600 font-bold text-center py-1 touch-btn hover:underline">
                +{derivedData.expiredTasks.length - 3} tareas caducadas más →
              </button>
            )}

            {/* Tareas pendientes de aceptación */}
            {derivedData.pendingAcceptanceTasks.slice(0, 2).map(task => (
              <button
                key={`accept-${task.id}`}
                onClick={() => setActiveTab('tasks')}
                className="w-full text-left p-3 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 flex items-center gap-3 transition-all touch-btn"
              >
                <div className="p-2 rounded-lg shrink-0 bg-amber-100 text-amber-600">
                  <Shield size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{task.title}</p>
                  <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Pendiente de aceptación</p>
                </div>
                <ChevronRight size={14} className="text-slate-300 shrink-0" />
              </button>
            ))}

            {/* Recibos vencidos */}
            {derivedData.overdueReceipts.slice(0, 2).map(receipt => (
              <button
                key={`receipt-${receipt.id}`}
                onClick={() => setActiveTab('finances')}
                className="w-full text-left p-3 rounded-xl border border-red-200 bg-red-50/30 hover:bg-red-50 flex items-center gap-3 transition-all touch-btn"
              >
                <div className="p-2 rounded-lg shrink-0 bg-red-100 text-red-600">
                  <Receipt size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{receipt.name}</p>
                  <p className="text-[10px] text-red-500 font-semibold mt-0.5">
                    Recibo vencido · {formatCurrency(receipt.amount)}
                  </p>
                </div>
                <ChevronRight size={14} className="text-slate-300 shrink-0" />
              </button>
            ))}

            {/* Tareas urgentes de alta prioridad */}
            {derivedData.urgentHighPriorityTasks.slice(0, 2).map(task => (
              <button
                key={`urgent-${task.id}`}
                onClick={() => setActiveTab('tasks')}
                className="w-full text-left p-3 rounded-xl border border-orange-200 bg-orange-50/40 hover:bg-orange-50 flex items-center gap-3 transition-all touch-btn"
              >
                <div className="p-2 rounded-lg shrink-0 bg-orange-100 text-orange-600">
                  <Zap size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{task.title}</p>
                  <p className="text-[10px] text-orange-600 font-semibold mt-0.5">
                    Alta prioridad · Vence: {formatDateSpanish(task.dueDate)}
                  </p>
                </div>
                <ChevronRight size={14} className="text-slate-300 shrink-0" />
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-3 bg-emerald-50 rounded-2xl mb-3">
              <CheckCircle2 size={28} className="text-emerald-500" />
            </div>
            <p className="text-sm font-bold text-slate-700">¡Todo bajo control!</p>
            <p className="text-[11px] text-slate-400 mt-1">No hay alertas que requieran tu atención.</p>
          </div>
        )}
      </div>


      {/* ════════════════════════════════════════════════
          GRID DE 2 COLUMNAS: MIEMBROS + FINANZAS
          ════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">

        {/* ════════════════════════════════════════════════
            WIDGET 4: "ESTADO DE LA FAMILIA"
            ════════════════════════════════════════════════ */}
        <div className="flat-card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Users size={14} className="text-blue-500" /> Estado de la Familia
            </h3>
            <button
              onClick={() => setActiveTab('members')}
              className="text-[10px] sm:text-xs font-bold text-blue-600 touch-btn px-2 py-1 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Ver miembros →
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            {derivedData.memberStats.map(member => {
              const colors = getMemberColor(member);
              const isKid = member.role === 'Hijo' || member.role === 'Hija';
              const logistics = clothingLogistics.find(c => c.childName === member.firstName);

              return (
                <div
                  key={member.id}
                  className={`p-3 rounded-xl border ${colors.border} ${colors.light} transition-all`}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm ${colors.bg}`}>
                      {member.firstName[0]}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs sm:text-sm font-black text-slate-800 truncate">{member.firstName}</p>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{member.role}</span>
                        {member.isAdmin && (
                          <span className="text-[8px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded border border-blue-200">Admin</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {/* Tareas activas */}
                        <span className="text-[10px] font-bold text-slate-500">
                          {member.activeTasks} {member.activeTasks === 1 ? 'tarea' : 'tareas'} activas
                        </span>

                        {/* Pendientes de aceptar */}
                        {member.pendingAcceptance > 0 && member.isAdmin && (
                          <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">
                            {member.pendingAcceptance} por aceptar
                          </span>
                        )}

                        {/* Progreso semanal */}
                        {member.completedThisWeek > 0 && (
                          <span className="text-[9px] font-bold text-emerald-600">
                            ✓ {member.completedThisWeek} esta semana
                          </span>
                        )}
                      </div>

                      {/* Cumpleaños countdown (solo hijos) */}
                      {isKid && member.daysUntilBday !== null && member.daysUntilBday <= 60 && (
                        <div className="flex items-center gap-1 mt-1.5">
                          <Cake size={11} className="text-orange-500" />
                          <span className="text-[9px] font-bold text-orange-600">
                            {member.daysUntilBday === 0 ? '¡Cumpleaños HOY! 🎉' : `Cumple en ${member.daysUntilBday} días`}
                          </span>
                        </div>
                      )}

                      {/* Tallas (solo hijos con datos) */}
                      {isKid && logistics && logistics.currentSize && !logistics.currentSize.includes('Zapato: - / Camisa: - / Pantalón: -') && (
                        <p className="text-[9px] text-slate-400 mt-1 truncate">
                          📏 {logistics.currentSize}
                        </p>
                      )}

                      {/* Puntos (hijos con gamificación) */}
                      {isKid && member.points > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star size={10} className="text-amber-500" />
                          <span className="text-[9px] font-bold text-amber-600">{member.points} puntos</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {derivedData.memberStats.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">Añade miembros en la sección "Miembros".</p>
            )}
          </div>
        </div>


        {/* ════════════════════════════════════════════════
            WIDGET 5: "FINANZAS RÁPIDAS"
            ════════════════════════════════════════════════ */}
        <div className="flat-card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Wallet size={14} className="text-emerald-500" /> Finanzas Rápidas
            </h3>
            <button
              onClick={() => setActiveTab('finances')}
              className="text-[10px] sm:text-xs font-bold text-blue-600 touch-btn px-2 py-1 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Ver finanzas →
            </button>
          </div>

          {/* Presupuesto global */}
          {budgets.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Presupuesto Global</span>
                <span className={`text-xs font-black ${derivedData.budgetPercentage > 90 ? 'text-red-600' : derivedData.budgetPercentage > 70 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {derivedData.budgetPercentage}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-lg h-2.5 overflow-hidden border border-slate-200/50">
                <div
                  className={`h-full rounded-lg transition-all duration-700 ${derivedData.budgetPercentage > 90 ? 'bg-red-500' : derivedData.budgetPercentage > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(derivedData.budgetPercentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] text-slate-400 font-semibold">
                <span>Gastado: {formatCurrency(derivedData.totalBudgetSpent)}</span>
                <span>Límite: {formatCurrency(derivedData.totalBudgetLimit)}</span>
              </div>

              {/* Mini barras por categoría */}
              <div className="mt-3 flex flex-col gap-1.5">
                {budgets.slice(0, 4).map(b => {
                  const pct = b.limit > 0 ? Math.round((b.spent / b.limit) * 100) : 0;
                  return (
                    <div key={b.id} className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-slate-500 w-20 truncate">{b.category}</span>
                      <div className="flex-1 bg-slate-100 rounded h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded transition-all ${pct > 90 ? 'bg-red-400' : pct > 70 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 w-8 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recibos próximos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Próximos Recibos</span>
              <div className="flex items-center gap-1.5 text-[9px] font-bold">
                <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  {derivedData.paidReceiptsCount} pagados
                </span>
                <span className="text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                  {derivedData.unpaidReceiptsCount} pendientes
                </span>
              </div>
            </div>

            {derivedData.upcomingReceipts.length > 0 ? (
              <div className="flex flex-col gap-2">
                {derivedData.upcomingReceipts.map(receipt => (
                  <div
                    key={receipt.id}
                    className="p-2.5 rounded-xl bg-white border border-slate-100 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <CircleDot size={10} className="text-amber-500 shrink-0" />
                      <span className="text-xs font-bold text-slate-700 truncate">{receipt.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-slate-400 font-semibold">{formatDateSpanish(receipt.nextDueDate)}</span>
                      <span className="text-xs font-black text-slate-800">{formatCurrency(receipt.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 text-center py-4">No hay recibos pendientes próximos.</p>
            )}

            {budgets.length === 0 && receipts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Wallet size={24} className="text-slate-300 mb-2" />
                <p className="text-xs text-slate-400">Configura presupuestos y recibos en "Finanzas".</p>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* ════════════════════════════════════════════════
          GRID DE 2 COLUMNAS: COMPRA + RENDIMIENTO
          ════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">

        {/* ════════════════════════════════════════════════
            WIDGET 6: "LISTA DE LA COMPRA"
            ════════════════════════════════════════════════ */}
        <div className="flat-card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <ShoppingCart size={14} className="text-emerald-500" /> Lista de la Compra
            </h3>
            <button
              onClick={() => setActiveTab('shopping')}
              className="text-[10px] sm:text-xs font-bold text-blue-600 touch-btn px-2 py-1 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Ir a compras →
            </button>
          </div>

          {derivedData.totalShoppingItems > 0 ? (
            <>
              {/* Progreso global */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-600">
                      {derivedData.completedShoppingItems} de {derivedData.totalShoppingItems} productos
                    </span>
                    <span className={`text-xs font-black ${derivedData.shoppingProgress === 100 ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {derivedData.shoppingProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-lg h-3 overflow-hidden border border-slate-200/50">
                    <div
                      className={`h-full rounded-lg transition-all duration-700 ${derivedData.shoppingProgress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                      style={{ width: `${derivedData.shoppingProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Top categorías pendientes */}
              {derivedData.topCategories.length > 0 && (
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Categorías pendientes</span>
                  <div className="flex flex-col gap-1.5 mt-2">
                    {derivedData.topCategories.map(([cat, count], idx) => (
                      <div key={cat} className="flex items-center justify-between px-2.5 py-2 rounded-lg bg-white border border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full shrink-0 ${idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-purple-500' : 'bg-emerald-500'}`} />
                          <span className="text-xs font-bold text-slate-700">{cat}</span>
                        </div>
                        <span className="text-[10px] font-black text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                          {count} {count === 1 ? 'producto' : 'productos'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {derivedData.shoppingProgress === 100 && (
                <div className="flex items-center gap-2 mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span className="text-[11px] font-bold text-emerald-700">¡Lista de la compra completada! 🎉</span>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ShoppingCart size={24} className="text-slate-300 mb-2" />
              <p className="text-xs text-slate-400">No hay productos en la lista.</p>
              <button
                onClick={() => setActiveTab('shopping')}
                className="text-[10px] font-bold text-blue-600 mt-2 touch-btn hover:underline"
              >
                Añadir productos →
              </button>
            </div>
          )}
        </div>


        {/* ════════════════════════════════════════════════
            WIDGET 7: "RENDIMIENTO SEMANAL"
            ════════════════════════════════════════════════ */}
        <div className="flat-card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <BarChart3 size={14} className="text-purple-500" /> Rendimiento Semanal
            </h3>
          </div>

          {/* KPIs rápidos */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center p-2.5 rounded-xl bg-blue-50/60 border border-blue-100">
              <p className="text-lg sm:text-xl font-black text-blue-600">{derivedData.totalCompleted}</p>
              <p className="text-[8px] sm:text-[9px] font-bold text-blue-400 uppercase tracking-wider">Completadas</p>
            </div>
            <div className="text-center p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
              <p className="text-lg sm:text-xl font-black text-amber-600">{derivedData.totalPending}</p>
              <p className="text-[8px] sm:text-[9px] font-bold text-amber-400 uppercase tracking-wider">Pendientes</p>
            </div>
            <div className="text-center p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <p className="text-lg sm:text-xl font-black text-emerald-600">{derivedData.weekCompletionRate}%</p>
              <p className="text-[8px] sm:text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Semanal</p>
            </div>
          </div>

          {/* Donut + Leyenda */}
          <div className="flex flex-col sm:flex-row items-center gap-4 py-2">
            {derivedData.totalTaskCount > 0 ? (
              <div className="relative h-28 w-28 sm:h-32 sm:w-32 shrink-0">
                <svg viewBox="0 0 100 100" className="h-full w-full">
                  {donutData.map((seg, idx) => (
                    <circle
                      key={idx}
                      cx="50"
                      cy="50"
                      r="30"
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth="14"
                      strokeDasharray={seg.strokeDash}
                      strokeDashoffset={seg.strokeOffset}
                      transform="rotate(-90 50 50)"
                      className="transition-all duration-500"
                    />
                  ))}
                  <circle cx="50" cy="50" r="23" fill="#ffffff" />
                  <text x="50" y="47" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#94a3b8" className="font-sans">Total</text>
                  <text x="50" y="59" textAnchor="middle" fontSize="12" fontWeight="900" fill="#1e293b" className="font-sans">{derivedData.totalTaskCount}</text>
                </svg>
              </div>
            ) : (
              <div className="h-28 w-28 rounded-full border-8 border-slate-100 flex items-center justify-center shrink-0">
                <span className="text-[10px] text-slate-400 font-bold">Sin datos</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5 w-full">
              {chartSegments.map((seg, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-md shrink-0" style={{ backgroundColor: seg.color }} />
                    <span>{seg.name}</span>
                  </div>
                  <span className="text-slate-400 font-semibold text-[10px]">{seg.count} ({seg.pct}%)</span>
                </div>
              ))}
              {chartSegments.length === 0 && (
                <p className="text-[11px] text-slate-400 text-center">Registra tareas para ver estadísticas.</p>
              )}
            </div>
          </div>

          {/* Barras de progreso por miembro */}
          <div className="mt-3 border-t border-slate-100 pt-3">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Progreso por Responsable</span>
            <div className="flex flex-col gap-2 mt-2">
              {derivedData.barData.map((bar) => {
                const pct = bar.total > 0 ? Math.round((bar.done / bar.total) * 100) : 0;
                return (
                  <div key={bar.name} className="flex flex-col gap-0.5">
                    <div className="flex justify-between text-[10px] font-bold text-slate-600">
                      <span>{bar.name}</span>
                      <span className="text-slate-400">{bar.done}/{bar.total} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-lg h-2 overflow-hidden border border-slate-200/50">
                      <div
                        className="h-full rounded-lg transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: bar.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
