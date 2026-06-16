import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../../store/useStore';
import { getTaskStatus, formatDateSpanish } from '../../utils/dateHelpers';
import { 
  TrendingUp, 
  FileText, 
  Plus, 
  Trash2, 
  Check, 
  X,
  CreditCard,
  Clock
} from 'lucide-react';

export default function FinancePanel() {
  const {
    budgets,
    updateBudgetSpent,
    addBudgetItem,
    deleteBudgetItem,
    receipts,
    toggleReceiptPaid,
    addReceipt,
    deleteReceipt,
    procedures,
    toggleProcedureCompleted,
    addProcedure,
    deleteProcedure
  } = useStore();

  const [activeTab, setActiveTab] = useState('presupuestos'); 
  
  // Modales
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isProcedureModalOpen, setIsProcedureModalOpen] = useState(false);

  // Estados Formulario Presupuesto
  const [budgetCategory, setBudgetCategory] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');

  // Estados Formulario Recibo
  const [receiptName, setReceiptName] = useState('');
  const [receiptAmount, setReceiptAmount] = useState('');
  const [receiptPeriod, setReceiptPeriod] = useState('Mensual');
  const [receiptDueDate, setReceiptDueDate] = useState('');

  // Estados Formulario Trámite
  const [procName, setProcName] = useState('');
  const [procOwner, setProcOwner] = useState('Todos');
  const [procExpiryDate, setProcExpiryDate] = useState('');
  const [procNotes, setProcNotes] = useState('');

  // Inline Spent Edit
  const [editingBudgetId, setEditingBudgetId] = useState(null);
  const [editingSpentVal, setEditingSpentVal] = useState('');

  const handleAddBudget = (e) => {
    e.preventDefault();
    if (!budgetCategory.trim() || !budgetLimit) return;
    addBudgetItem(budgetCategory.trim(), Number(budgetLimit));
    setBudgetCategory('');
    setBudgetLimit('');
    setIsBudgetModalOpen(false);
  };

  const handleAddReceipt = (e) => {
    e.preventDefault();
    if (!receiptName.trim() || !receiptAmount || !receiptDueDate) return;
    addReceipt({
      name: receiptName.trim(),
      amount: Number(receiptAmount),
      period: receiptPeriod,
      nextDueDate: receiptDueDate
    });
    setReceiptName('');
    setReceiptAmount('');
    setReceiptDueDate('');
    setIsReceiptModalOpen(false);
  };

  const handleAddProcedure = (e) => {
    e.preventDefault();
    if (!procName.trim() || !procExpiryDate) return;
    addProcedure({
      name: procName.trim(),
      owner: procOwner,
      expiryDate: procExpiryDate,
      notes: procNotes.trim()
    });
    setProcName('');
    setProcExpiryDate('');
    setProcNotes('');
    setIsProcedureModalOpen(false);
  };

  const handleSaveSpent = (id) => {
    updateBudgetSpent(id, Number(editingSpentVal));
    setEditingBudgetId(null);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* CABECERA */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Finanzas y Trámites</h2>
          <p className="text-sm text-slate-500">Administra el presupuesto mensual, recibos y renovaciones burocráticas.</p>
        </div>
      </div>

      {/* SELECTOR SEGMENTADO */}
      <div className="segmented-container max-w-xl overflow-x-auto pb-1.5 hide-scrollbar snap-x snap-mandatory scroll-smooth w-full lg:pb-0">
        {[
          { id: 'presupuestos', label: 'Presupuestos', mobileLabel: 'Presupuestos', icon: TrendingUp },
          { id: 'recibos', label: 'Recibos recurrentes', mobileLabel: 'Recibos', icon: CreditCard },
          { id: 'tramites', label: 'Certificados y Trámites', mobileLabel: 'Trámites', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`touch-btn flex-1 py-2 px-3 text-center text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shrink-0 snap-start ${
                activeTab === tab.id
                  ? 'segmented-btn-active'
                  : 'segmented-btn-inactive'
              }`}
            >
              <Icon size={15} />
              <span className="hidden min-[360px]:inline">{tab.label}</span>
              <span className="inline min-[360px]:hidden">{tab.mobileLabel}</span>
            </button>
          );
        })}
      </div>

      {/* CONTENIDOS */}
      
      {activeTab === 'presupuestos' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Presupuestos Familiares</h3>
            <button
              onClick={() => setIsBudgetModalOpen(true)}
              className="touch-btn flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              <Plus size={16} /> Nuevo Presupuesto
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgets.map((b) => {
              const percentage = Math.min(100, Math.round((b.spent / b.limit) * 100));
              const isOver = b.spent > b.limit;
              
              const barColor = isOver ? 'bg-red-500' : (percentage >= 85 ? 'bg-amber-500' : 'bg-emerald-500');
              
              return (
                <div key={b.id} className="flat-card p-5 sm:p-5 border border-slate-200/60 bg-white flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <span className="font-extrabold text-slate-700 text-sm">{b.category}</span>
                      <button 
                        onClick={() => deleteBudgetItem(b.id)}
                        className="touch-btn action-btn-mobile text-slate-400 hover:text-rose-500 transition-colors p-1.5"
                        title="Eliminar"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="flex justify-between items-end text-xs mb-2">
                      <span className="text-slate-400 font-bold">Gasto registrado:</span>
                      <span className={`font-black ${isOver ? 'text-red-500' : 'text-slate-700'}`}>
                        {percentage}% ({b.spent}€ / {b.limit}€)
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 border border-slate-200/40 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${barColor}`} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                    {editingBudgetId === b.id ? (
                      <div className="flex items-center gap-1.5 w-full">
                        <input
                          type="number"
                          value={editingSpentVal}
                          onChange={(e) => setEditingSpentVal(e.target.value)}
                          className="w-20 px-2.5 py-1 text-xs flat-input"
                        />
                        <button
                          onClick={() => handleSaveSpent(b.id)}
                          className="touch-btn px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                        >
                          Ok
                        </button>
                        <button
                          onClick={() => setEditingBudgetId(null)}
                          className="touch-btn px-2 py-1 text-slate-400"
                        >
                          X
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-slate-400 font-medium">¿Modificar gasto registrado?</span>
                        <button
                          onClick={() => {
                            setEditingBudgetId(b.id);
                            setEditingSpentVal(b.spent.toString());
                          }}
                          className="touch-btn text-blue-600 hover:text-blue-700 font-bold"
                        >
                          Modificar Gasto
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'recibos' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recibos Mensuales</h3>
            <button
              onClick={() => setIsReceiptModalOpen(true)}
              className="touch-btn flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              <Plus size={16} /> Nuevo Recibo
            </button>
          </div>

          <div className="flat-card border border-slate-200/60 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto scrollbar-none">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="p-4">Servicio</th>
                    <th className="p-4">Importe</th>
                    <th className="p-4">Frecuencia</th>
                    <th className="p-4">Vencimiento</th>
                    <th className="p-4 text-center">Estado</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {receipts.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/20 transition-colors">
                      <td className="p-4 font-bold text-slate-800">{r.name}</td>
                      <td className="p-4 text-slate-700 font-bold">{r.amount}€</td>
                      <td className="p-4">
                        <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-500 font-bold">
                          {r.period}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 font-bold">{formatDateSpanish(r.nextDueDate)}</td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => toggleReceiptPaid(r.id)}
                            className={`touch-btn flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider transition-all ${
                              r.paid
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-800'
                            }`}
                          >
                            <Check size={14} />
                            {r.paid ? 'Pagado' : 'Pendiente'}
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => deleteReceipt(r.id)}
                          className="touch-btn action-btn-mobile text-slate-400 hover:text-red-500 p-1.5"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tramites' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Trámites y Certificados FNMT/DNI</h3>
            <button
              onClick={() => setIsProcedureModalOpen(true)}
              className="touch-btn flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              <Plus size={16} /> Nuevo Trámite
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {procedures.map((p) => {
              const status = getTaskStatus(p.expiryDate, p.completed);
              
              const cardStyles = p.completed
                ? 'border-slate-100 opacity-60'
                : status === 'caducada'
                  ? 'border-red-200 bg-red-50/20'
                  : status === 'urgente'
                    ? 'border-amber-200 bg-amber-50/10'
                    : 'border-slate-200/60';

              return (
                <div key={p.id} className={`flat-card p-5 sm:p-5 border flex flex-col justify-between bg-white shadow-sm ${cardStyles}`}>
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                        p.owner === 'Igor' ? 'badge-igor' :
                        p.owner === 'Diana' ? 'badge-diana' :
                        'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {p.owner}
                      </span>
                      
                      {!p.completed && (
                        <span className={`text-[9px] font-bold uppercase ${
                          status === 'caducada' ? 'text-red-500' :
                          status === 'urgente' ? 'text-amber-600' : 'text-slate-400'
                        }`}>
                          {status === 'caducada' ? 'Expirado' : status === 'urgente' ? 'Urgente' : 'Pendiente'}
                        </span>
                      )}
                    </div>

                    <h4 className={`text-xs sm:text-sm font-extrabold mt-3 leading-snug ${p.completed ? 'line-through text-slate-400 font-medium' : 'text-slate-800'}`}>
                      {p.name}
                    </h4>

                    {p.notes && (
                      <p className={`text-xs mt-1.5 text-slate-400 leading-relaxed ${p.completed && 'line-through'}`}>
                        {p.notes}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                    <span className={`text-[10px] ${
                      p.completed ? 'text-slate-400' : (status === 'caducada' ? 'text-red-500' : 'text-slate-400')
                    }`}>
                      Vencimiento: {formatDateSpanish(p.expiryDate)}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleProcedureCompleted(p.id)}
                        className={`touch-btn h-8 w-8 sm:h-7 sm:w-7 flex items-center justify-center rounded-lg border transition-all ${
                          p.completed
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : 'border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-700'
                        }`}
                      >
                        <Check size={15} />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm('¿Eliminar este trámite?')) deleteProcedure(p.id);
                        }}
                        className="touch-btn action-btn-mobile h-8 w-8 sm:h-7 sm:w-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL NUEVO PRESUPUESTO */}
      {isBudgetModalOpen && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center sm:items-start p-0 sm:p-4 sm:pt-20 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setIsBudgetModalOpen(false); }}
        >
          <form 
            onSubmit={handleAddBudget}
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-0 sm:relative sm:inset-auto w-full h-full sm:h-auto sm:max-w-md bg-white border-t sm:border border-slate-200/60 rounded-none sm:rounded-2xl shadow-2xl sm:flex sm:flex-col overflow-y-auto animate-slideUp sm:animate-none sm:mb-8"
          >
            {/* Cabecera sticky */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-20 shrink-0">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-bold tracking-tight text-slate-800">
                  Nuevo Presupuesto
                </h3>
                <span className="text-[10px] text-slate-400 font-medium">
                  Completa los campos y crea el presupuesto mensual
                </span>
              </div>
              <button 
                type="button"
                onClick={() => setIsBudgetModalOpen(false)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-all border-0 cursor-pointer shrink-0"
              >
                <X size={15} />
              </button>
            </div>

            {/* Cuerpo del Formulario */}
            <div className="px-6 py-5 pb-8 sm:pb-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Concepto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Gasolina, Supermercado..."
                  value={budgetCategory}
                  onChange={(e) => setBudgetCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 flat-input text-xs"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Límite (€) *</label>
                <input
                  type="number"
                  required
                  placeholder="Ej: 300"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                  className="w-full px-3.5 py-2.5 flat-input text-xs"
                />
              </div>
              
              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsBudgetModalOpen(false)} 
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all touch-btn"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/10 touch-btn"
                >
                  Crear Presupuesto
                </button>
              </div>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* MODAL NUEVO RECIBO */}
      {isReceiptModalOpen && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center sm:items-start p-0 sm:p-4 sm:pt-20 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setIsReceiptModalOpen(false); }}
        >
          <form 
            onSubmit={handleAddReceipt}
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-0 sm:relative sm:inset-auto w-full h-full sm:h-auto sm:max-w-md bg-white border-t sm:border border-slate-200/60 rounded-none sm:rounded-2xl shadow-2xl sm:flex sm:flex-col overflow-y-auto animate-slideUp sm:animate-none sm:mb-8"
          >
            {/* Cabecera sticky */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-20 shrink-0">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-bold tracking-tight text-slate-800">
                  Nuevo Recibo
                </h3>
                <span className="text-[10px] text-slate-400 font-medium">
                  Completa los campos y crea el recibo recurrente
                </span>
              </div>
              <button 
                type="button"
                onClick={() => setIsReceiptModalOpen(false)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-all border-0 cursor-pointer shrink-0"
              >
                <X size={15} />
              </button>
            </div>

            {/* Cuerpo del Formulario */}
            <div className="px-6 py-5 pb-8 sm:pb-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Proveedor / Servicio *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Luz (Iberdrola)"
                  value={receiptName}
                  onChange={(e) => setReceiptName(e.target.value)}
                  className="w-full px-3.5 py-2.5 flat-input text-xs"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Importe (€) *</label>
                  <input
                    type="number"
                    required
                    placeholder="Ej: 80"
                    value={receiptAmount}
                    onChange={(e) => setReceiptAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 flat-input text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Frecuencia</label>
                  <select
                    value={receiptPeriod}
                    onChange={(e) => setReceiptPeriod(e.target.value)}
                    className="w-full px-3.5 py-2.5 flat-input text-xs text-slate-600 bg-white cursor-pointer"
                  >
                    <option value="Mensual">Mensual</option>
                    <option value="Bimestral">Bimestral</option>
                    <option value="Anual">Anual</option>
                  </select>
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Vencimiento *</label>
                <input
                  type="date"
                  required
                  value={receiptDueDate}
                  onChange={(e) => setReceiptDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 flat-input text-xs"
                />
              </div>
              
              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsReceiptModalOpen(false)} 
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all touch-btn"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/10 touch-btn"
                >
                  Crear Recibo
                </button>
              </div>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* MODAL NUEVO TRÁMITE */}
      {isProcedureModalOpen && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center sm:items-start p-0 sm:p-4 sm:pt-20 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setIsProcedureModalOpen(false); }}
        >
          <form 
            onSubmit={handleAddProcedure}
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-0 sm:relative sm:inset-auto w-full h-full sm:h-auto sm:max-w-md bg-white border-t sm:border border-slate-200/60 rounded-none sm:rounded-2xl shadow-2xl sm:flex sm:flex-col overflow-y-auto animate-slideUp sm:animate-none sm:mb-8"
          >
            {/* Cabecera sticky */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-20 shrink-0">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-bold tracking-tight text-slate-800">
                  Nuevo Trámite
                </h3>
                <span className="text-[10px] text-slate-400 font-medium">
                  Completa los campos y crea el trámite o certificado
                </span>
              </div>
              <button 
                type="button"
                onClick={() => setIsProcedureModalOpen(false)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-all border-0 cursor-pointer shrink-0"
              >
                <X size={15} />
              </button>
            </div>

            {/* Cuerpo del Formulario */}
            <div className="px-6 py-5 pb-8 sm:pb-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Nombre del Trámite *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Renovar DNI Diana"
                  value={procName}
                  onChange={(e) => setProcName(e.target.value)}
                  className="w-full px-3.5 py-2.5 flat-input text-xs"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Responsable</label>
                  <select
                    value={procOwner}
                    onChange={(e) => setProcOwner(e.target.value)}
                    className="w-full px-3.5 py-2.5 flat-input text-xs text-slate-600 bg-white cursor-pointer"
                  >
                    <option value="Todos">Común / Todos</option>
                    <option value="Igor">Igor</option>
                    <option value="Diana">Diana</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Vencimiento *</label>
                  <input
                    type="date"
                    required
                    value={procExpiryDate}
                    onChange={(e) => setProcExpiryDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 flat-input text-xs"
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Notas</label>
                <textarea
                  rows={2}
                  placeholder="Enlaces o pasos a realizar..."
                  value={procNotes}
                  onChange={(e) => setProcNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 flat-input text-xs"
                />
              </div>
              
              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsProcedureModalOpen(false)} 
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all touch-btn"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/10 touch-btn"
                >
                  Crear Trámite
                </button>
              </div>
            </div>
          </form>
        </div>,
        document.body
      )}
    </div>
  );
}
