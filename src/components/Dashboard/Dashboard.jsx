import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { getTaskStatus, getDaysUntilBirthday, formatDateSpanish } from '../../utils/dateHelpers';
import { 
  Search, 
  AlertCircle, 
  Cake, 
  ShoppingCart, 
  Clock, 
  ChevronRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  Download
} from 'lucide-react';

export default function Dashboard({ setActiveTab }) {
  const { 
    tasks, 
    events, 
    shoppingItems, 
    clothingLogistics = [],
    members = [],
    currentUser 
  } = useStore();

  // Crear eventos de cumpleaños virtuales a partir de los cumpleaños de los miembros
  const virtualBirthdayEvents = members
    .filter(m => m.birthDate)
    .map(m => ({
      id: `bday-${m.id}`,
      title: `Cumpleaños de ${m.firstName}`,
      date: m.birthDate,
      type: 'cumpleanos',
      target: m.firstName,
      description: `🎂 ¡Felicidades, ${m.firstName}!`,
      isVirtual: true
    }));

  const allEvents = [...events, ...virtualBirthdayEvents];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState('Todos');

  // Integrantes y sus colores planos (Gama de azules, violetas, verdes, naranjas)
  const membersList = [
    { name: 'Todos', color: 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700' },
    { name: 'Igor', color: 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100' },
    { name: 'Diana', color: 'bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100' },
    { name: 'Familiar', color: 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100' },
    { name: 'Valentina', color: 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100' },
    { name: 'Rodrigo', color: 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100' },
    { name: 'Martin', color: 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100' }
  ];

  // 1. Filtrar Tareas por miembro y buscador
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = searchQuery === '' || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (!matchesSearch) return false;

    if (selectedMember === 'Todos') return true;
    if (selectedMember === 'Familiar') return task.scope === 'matrimonial';
    if (selectedMember === 'Igor' || selectedMember === 'Diana') {
      return task.assignee === selectedMember || (task.scope === 'individual' && task.assignee === selectedMember);
    }
    if (['Valentina', 'Rodrigo', 'Martin'].includes(selectedMember)) {
      return task.scope === 'ninos' && task.children.includes(selectedMember);
    }
    return true;
  });

  // 2. Contadores rápidos
  const expiredTasksCount = tasks.filter(t => getTaskStatus(t.dueDate, t.completed) === 'caducada').length;
  const pendingShoppingCount = shoppingItems.filter(i => !i.completed).length;

  // Siguiente cumpleaños
  const kidsBirthdays = allEvents
    .filter(e => e.type === 'cumpleanos' && ['Valentina', 'Rodrigo', 'Martin'].includes(e.target))
    .map(e => ({
      ...e,
      daysLeft: getDaysUntilBirthday(e.date)
    }))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const nextBirthday = kidsBirthdays[0];

  // Tareas urgentes
  const urgentTasks = tasks
    .filter(t => {
      const status = getTaskStatus(t.dueDate, t.completed);
      return status === 'caducada' || status === 'urgente';
    })
    .map(t => ({
      ...t,
      status: getTaskStatus(t.dueDate, t.completed)
    }))
    .sort((a, b) => {
      if (a.status === 'caducada' && b.status !== 'caducada') return -1;
      if (a.status !== 'caducada' && b.status === 'caducada') return 1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    })
    .slice(0, 4);

  // Agenda escolar / Eventos
  const upcomingEvents = allEvents
    .map(e => ({
      ...e,
      daysLeft: getDaysUntilBirthday(e.date)
    }))
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 3);

  // 3. DATOS DE LOS GRÁFICOS SVG (Implementación inspirada en la imagen del usuario)
  const totalTasks = tasks.length;
  const igorTasks = tasks.filter(t => t.scope === 'individual' && t.assignee === 'Igor').length;
  const dianaTasks = tasks.filter(t => t.scope === 'individual' && t.assignee === 'Diana').length;
  const matrimonialTasks = tasks.filter(t => t.scope === 'matrimonial').length;
  const ninosTasks = tasks.filter(t => t.scope === 'ninos').length;

  // Porcentajes
  const pIgor = totalTasks > 0 ? Math.round((igorTasks / totalTasks) * 100) : 0;
  const pDiana = totalTasks > 0 ? Math.round((dianaTasks / totalTasks) * 100) : 0;
  const pMatrimonial = totalTasks > 0 ? Math.round((matrimonialTasks / totalTasks) * 100) : 0;
  const pNinos = totalTasks > 0 ? Math.round((ninosTasks / totalTasks) * 100) : 0;

  // Segmentos del Donut SVG (R=30, Circunferencia ~188.5)
  const chartSegments = [
    { name: 'Igor', count: igorTasks, color: '#1e88e5', pct: pIgor },
    { name: 'Diana', count: dianaTasks, color: '#9c27b0', pct: pDiana },
    { name: 'Matrimonial', count: matrimonialTasks, color: '#10b981', pct: pMatrimonial },
    { name: 'Niños', count: ninosTasks, color: '#f97316', pct: pNinos }
  ].filter(s => s.count > 0);

  let accumulatedPercentage = 0;
  const donutData = chartSegments.map(seg => {
    const strokeDash = `${(seg.count / totalTasks) * 188.5} 188.5`;
    const strokeOffset = 188.5 - (accumulatedPercentage / 100) * 188.5;
    accumulatedPercentage += (seg.count / totalTasks) * 100;
    return { ...seg, strokeDash, strokeOffset };
  });

  // Datos para gráfico de barras finalizadas vs total
  const barData = [
    { name: 'Igor', total: tasks.filter(t => t.assignee === 'Igor').length, done: tasks.filter(t => t.assignee === 'Igor' && t.completed).length, color: 'bg-blue-500' },
    { name: 'Diana', total: tasks.filter(t => t.assignee === 'Diana').length, done: tasks.filter(t => t.assignee === 'Diana' && t.completed).length, color: 'bg-purple-500' },
    { name: 'Niños', total: tasks.filter(t => t.scope === 'ninos').length, done: tasks.filter(t => t.scope === 'ninos' && t.completed).length, color: 'bg-orange-500' },
    { name: 'Común', total: tasks.filter(t => t.scope === 'matrimonial').length, done: tasks.filter(t => t.scope === 'matrimonial' && t.completed).length, color: 'bg-emerald-500' }
  ];

  // Función para exportar datos en formato JSON (Opción de exportación de la captura)
  const handleExportData = () => {
    const backup = {
      tasks,
      events,
      shoppingItems
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `HomeHub_Report_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* SECCIÓN DE BIENVENIDA */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            Panel de Control <Sparkles className="text-blue-500 h-5 w-5" />
          </h2>
          <p className="text-sm text-slate-500">
            Resumen visual del estado actual de tu hogar.
          </p>
        </div>
        <button
          onClick={handleExportData}
          className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition-all self-start md:self-auto touch-btn"
        >
          <Download size={16} />
          Exportar Informe
        </button>
      </div>

      {/* KPI'S DE UN VISTAZO (Cajas Planas Estilo Captura) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        
        {/* KPI: TAREAS CADUCADAS */}
        <button 
          onClick={() => setActiveTab('tasks')}
          className={`flat-card p-5 flex items-center justify-between transition-all group touch-btn ${
            expiredTasksCount > 0 
              ? 'border-red-100 bg-red-50/50' 
              : 'hover:bg-slate-50/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${expiredTasksCount > 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
              <AlertCircle size={22} />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tareas Caducadas</p>
              <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{expiredTasksCount}</h3>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400 group-hover:text-slate-800 transition-colors" />
        </button>

        {/* KPI: CUMPLEAÑOS INFANTIL */}
        <button 
          onClick={() => setActiveTab('calendar')}
          className="flat-card p-5 flex items-center justify-between hover:bg-slate-50/40 transition-all group touch-btn"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
              <Cake size={22} />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Próximo Cumpleaños</p>
              {nextBirthday ? (
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 truncate max-w-[160px]">
                    {nextBirthday.target}
                  </h3>
                  <p className="text-[10px] text-orange-600 font-bold">Faltan {nextBirthday.daysLeft} días</p>
                </div>
              ) : (
                <h3 className="text-sm font-extrabold text-slate-800">No programado</h3>
              )}
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400 group-hover:text-slate-800 transition-colors" />
        </button>

        {/* KPI: LISTA DE LA COMPRA */}
        <button 
          onClick={() => setActiveTab('shopping')}
          className="flat-card p-5 flex items-center justify-between hover:bg-slate-50/40 transition-all group touch-btn"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
              <ShoppingCart size={22} />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lista de la Compra</p>
              <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{pendingShoppingCount} pendientes</h3>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400 group-hover:text-slate-800 transition-colors" />
        </button>

      </div>

      {/* INFORMES DE OBJETIVOS Y GRÁFICOS (Estilo Primera y Segunda Capturas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* GRÁFICO CIRCULAR (Segmentación de Tareas por Ámbito) */}
        <div className="flat-card p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Distribución de Tareas</h3>
            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold uppercase">Ámbitos</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
            
            {/* SVG DONUT CHART */}
            {totalTasks > 0 ? (
              <div className="relative h-32 w-32 shrink-0">
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
                    />
                  ))}
                  <circle cx="50" cy="50" r="23" fill="#ffffff" />
                  
                  {/* Textos Centrales del Donut */}
                  <text x="50" y="47" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#94a3b8" className="font-sans">Total</text>
                  <text x="50" y="59" textAnchor="middle" fontSize="12" fontWeight="black" fill="#1e293b" className="font-sans">{totalTasks}</text>
                </svg>
              </div>
            ) : (
              <div className="h-32 w-32 rounded-full border-8 border-slate-100 flex items-center justify-center shrink-0">
                <span className="text-[10px] text-slate-400 font-bold">Sin datos</span>
              </div>
            )}

            {/* Leyenda */}
            <div className="flex flex-col gap-2 w-full max-w-[160px]">
              {chartSegments.map((seg, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-md shrink-0" style={{ backgroundColor: seg.color }}></span>
                    <span>{seg.name}</span>
                  </div>
                  <span className="text-slate-400 font-normal">({seg.pct}%)</span>
                </div>
              ))}
              {chartSegments.length === 0 && (
                <p className="text-[11px] text-slate-400 text-center">Registra tareas para generar estadísticas.</p>
              )}
            </div>

          </div>
        </div>

        {/* GRÁFICO DE BARRAS DE OBJETIVOS COMPLETADOS (Estilo Segunda Captura) */}
        <div className="flat-card p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Informe de Tareas Completadas</h3>
            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold uppercase">Objetivos</span>
          </div>

          <div className="flex flex-col gap-3 py-1">
            {barData.map((bar) => {
              const pct = bar.total > 0 ? Math.round((bar.done / bar.total) * 100) : 0;
              return (
                <div key={bar.name} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>{bar.name}</span>
                    <span className="text-slate-400">{bar.done} de {bar.total} ({pct}%)</span>
                  </div>
                  
                  {/* Barra de progreso plana */}
                  <div className="w-full bg-slate-100 rounded-lg h-3 overflow-hidden border border-slate-200/50">
                    <div 
                      className={`h-full rounded-lg transition-all duration-500 ${bar.color}`} 
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* FILTROS Y BUSCADOR */}
      <div className="flex flex-col gap-4 mt-2">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Buscar tareas, notas o eventos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 flat-input text-xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none w-full">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">Filtrar:</span>
          {membersList.map((member) => (
            <button
              key={member.name}
              onClick={() => setSelectedMember(member.name)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all shrink-0 touch-btn ${
                selectedMember === member.name
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm scale-105'
                  : 'bg-white border-slate-200/60 text-slate-500 hover:border-slate-300 hover:text-slate-800'
              }`}
            >
              {member.name}
            </button>
          ))}
        </div>
      </div>

      {/* RESULTADOS O TABLA CRÍTICA */}
      {selectedMember !== 'Todos' || searchQuery !== '' ? (
        
        /* RESULTADOS DE FILTRADO */
        <div className="flat-card p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
            Resultados del Filtro ({filteredTasks.length})
          </h3>
          
          {filteredTasks.length > 0 ? (
            <div className="flex flex-col divide-y divide-slate-100">
              {filteredTasks.map(task => {
                const status = getTaskStatus(task.dueDate, task.completed);
                return (
                  <div key={task.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                    <div>
                      <p className={`text-sm font-bold ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {task.title}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                        Asignado: {task.assignee} • Ámbito: {task.scope} {task.dueDate && `• Límite: ${formatDateSpanish(task.dueDate)}`}
                      </p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('tasks')}
                      className="text-xs text-blue-600 font-bold px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100 touch-btn"
                    >
                      Ver
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">No se encontraron tareas.</p>
          )}
        </div>

      ) : (

        /* DASHBOARD PRINCIPAL */
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          
          {/* TAREAS CRÍTICAS */}
          <div className="flat-card p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Clock className="text-red-500 h-4 w-4" /> Tareas Urgentes y Caducadas
              </h3>
              <button 
                onClick={() => setActiveTab('tasks')}
                className="text-xs font-bold text-blue-600 touch-btn px-2 py-1"
              >
                Ver todas
              </button>
            </div>

            {urgentTasks.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {urgentTasks.map((task) => (
                  <div 
                    key={task.id}
                    className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                      task.status === 'caducada' 
                        ? 'border-red-200 bg-red-50/30' 
                        : 'border-slate-200 bg-white shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-xs font-bold text-slate-800">{task.title}</h4>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                        task.status === 'caducada' 
                          ? 'bg-red-100 text-red-600 border border-red-200' 
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        {task.status === 'caducada' ? 'Caducada' : 'Urgente'}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{task.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-2.5 text-[9px] text-slate-400 font-bold border-t border-slate-100 pt-2">
                      <span>Responsable: {task.assignee}</span>
                      <span>Límite: {formatDateSpanish(task.dueDate)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-2" />
                <p className="text-xs font-bold">¡Todo cubierto!</p>
                <p className="text-[10px] text-slate-400 mt-0.5">No hay tareas urgentes o caducadas.</p>
              </div>
            )}
          </div>

          {/* EVENTOS ESCOLARES Y CUMPLES */}
          <div className="flat-card p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Calendar className="text-blue-500 h-4 w-4" /> Agenda y Fechas Clave
              </h3>
              <button 
                onClick={() => setActiveTab('calendar')}
                className="text-xs font-bold text-blue-600 touch-btn px-2 py-1"
              >
                Calendario
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {upcomingEvents.map((evt) => (
                <div 
                  key={evt.id}
                  className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-between gap-3 shadow-sm hover:border-slate-200 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg shrink-0 ${
                      evt.type === 'cumpleanos' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {evt.type === 'cumpleanos' ? <Cake size={16} /> : <Calendar size={16} />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{evt.title}</h4>
                      <p className="text-[9px] text-slate-400 font-bold mt-0.5">{formatDateSpanish(evt.date)}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {evt.daysLeft === 0 ? '¡Hoy!' : `${evt.daysLeft} d.`}
                  </span>
                </div>
              ))}
            </div>

            {/* SECCIÓN TALLAS */}
            <div className="mt-1 border-t border-slate-100 pt-3">
              <h4 className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Tallas de Niños</h4>
              <div className="flex flex-col gap-2">
                {['Valentina', 'Rodrigo', 'Martin'].map(child => {
                  const info = clothingLogistics.find(c => c.childName === child);
                  let sizeText = 'Sin definir';
                  if (info && info.currentSize && !info.currentSize.includes('Zapato: - / Camisa: - / Pantalón: -')) {
                    sizeText = info.currentSize;
                  }
                  return (
                    <div key={child} className="bg-slate-50 px-3 py-2 rounded-xl flex items-center justify-between border border-slate-100 text-xs">
                      <span className="font-extrabold text-slate-600">{child}</span>
                      <span className="font-bold text-slate-500 text-[10px] truncate max-w-[200px]">{sizeText}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
