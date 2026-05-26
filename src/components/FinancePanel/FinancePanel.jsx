import React, { useState } from 'react';
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
      <div className="segmented-container max-w-xl">
        {[
          { id: 'presupuestos', label: 'Presupuestos', icon: TrendingUp },
          { id: 'recibos', label: 'Recibos recurrentes', icon: CreditCard },
          { id: 'tramites', label: 'Certificados y Trámites', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === tab.id
                  ? 'segmented-btn-active'
                  : 'segmented-btn-inactive'
              }`}
            >
              <Icon size={14} />
              {tab.label}
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
              className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              <Plus size={14} /> Nuevo Presupuesto
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgets.map((b) => {
              const percentage = Math.min(100, Math.round((b.spent / b.limit) * 100));
              const isOver = b.spent > b.limit;
              
              const barColor = isOver ? 'bg-red-500' : (percentage >= 85 ? 'bg-amber-500' : 'bg-emerald-500');
              
              return (
                <div key={b.id} className="flat-card p-5 border border-slate-200/60 bg-white flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <span className="font-extrabold text-slate-700 text-sm">{b.category}</span>
                      <button 
                        onClick={() => deleteBudgetItem(b.id)}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-0.5"
                        title="Eliminar"
                      >
                        <Trash2 size={13} />
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
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                        >
                          Ok
                        </button>
                        <button
                          onClick={() => setEditingBudgetId(null)}
                          className="px-2 py-1 text-slate-400"
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
                          className="text-blue-600 hover:text-blue-700 font-bold"
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
              className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              <Plus size={14} /> Nuevo Recibo
            </button>
          </div>

          <div className="flat-card border border-slate-200/60 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
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
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider transition-all ${
                              r.paid
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-800'
                            }`}
                          >
                            <Check size={12} />
                            {r.paid ? 'Pagado' : 'Pendiente'}
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => deleteReceipt(r.id)}
                          className="text-slate-400 hover:text-red-500 p-1"
                        >
                          <Trash2 size={13} />
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
              className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              <Plus size={14} /> Nuevo Trámite
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
                <div key={p.id} className={`flat-card p-5 border flex flex-col justify-between bg-white shadow-sm ${cardStyles}`}>
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
                        className={`h-7 w-7 flex items-center justify-center rounded-lg border transition-all ${
                          p.completed
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : 'border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-700'
                        }`}
                      >
                        <Check size={13} />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm('¿Eliminar este trámite?')) deleteProcedure(p.id);
                        }}
                        className="h-7 w-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 size={12} />
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
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-xl relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Nuevo Presupuesto</h3>
              <button onClick={() => setIsBudgetModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddBudget} className="flex flex-col gap-4">
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
              <div className="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsBudgetModalOpen(false)} className="text-xs font-bold text-slate-400 px-3 py-2">Cancelar</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NUEVO RECIBO */}
      {isReceiptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-xl relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Nuevo Recibo</h3>
              <button onClick={() => setIsReceiptModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddReceipt} className="flex flex-col gap-4">
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
                    className="w-full px-3.5 py-2.5 flat-input text-xs text-slate-600"
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
              <div className="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsReceiptModalOpen(false)} className="text-xs font-bold text-slate-400 px-3 py-2">Cancelar</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NUEVO TRÁMITE */}
      {isProcedureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-xl relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Nuevo Trámite</h3>
              <button onClick={() => setIsProcedureModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddProcedure} className="flex flex-col gap-4">
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
                    className="w-full px-3.5 py-2.5 flat-input text-xs text-slate-600"
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
              <div className="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsProcedureModalOpen(false)} className="text-xs font-bold text-slate-400 px-3 py-2">Cancelar</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
