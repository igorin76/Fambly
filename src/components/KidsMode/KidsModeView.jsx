import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { 
  Sparkles, 
  CheckCircle2, 
  Award, 
  Tv, 
  Gift, 
  Check, 
  ArrowLeft,
  Calendar,
  Gamepad2,
  Trash2,
  Plus
} from 'lucide-react';

export default function KidsModeView({ member }) {
  const { 
    tasks, 
    rewards, 
    redeemReward, 
    toggleTaskCompleted,
    members,
    setCurrentUser
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState('misiones');
  const [successModal, setSuccessModal] = useState(null); // 'mission' or 'reward'
  const [redeemedName, setRedeemedName] = useState('');

  // Filtrar misiones del niño
  const myMissions = tasks.filter(t => 
    t.scope === 'ninos' && 
    t.assignedMemberIds && 
    t.assignedMemberIds.includes(member.id) &&
    !t.completed &&
    t.isAccepted
  );

  const handleCompleteMission = async (taskId, title) => {
    // Marcar como completada en Zustand (y Supabase)
    await toggleTaskCompleted(taskId);
    setRedeemedName(title);
    setSuccessModal('mission');
  };

  const handleRedeemReward = async (rew) => {
    if ((member.points || 0) < rew.pointsRequired) return;
    await redeemReward(member.id, rew.id, rew.pointsRequired);
    setRedeemedName(rew.title);
    setSuccessModal('reward');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-indigo-100 text-slate-800 p-4 sm:p-6 pb-24 font-sans select-none animate-fadeIn">
      
      {/* CABECERA MODO NIÑO (Premium, Colorida) */}
      <header className="max-w-2xl mx-auto bg-white rounded-3xl p-5 shadow-xl border border-sky-200/50 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
            <span className="text-2xl font-black">{member.firstName[0]}</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xl font-black text-indigo-900 tracking-tight">¡Hola, {member.firstName}!</h2>
              <Sparkles className="text-amber-500 animate-pulse h-5 w-5" />
            </div>
            <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider">Modo Misiones Activo</p>
          </div>
        </div>

        {/* CONTADOR DE ESTRELLAS GIGANTE */}
        <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200/80 px-5 py-2.5 rounded-2xl shadow-sm">
          <div className="h-9 w-9 rounded-full bg-amber-400 flex items-center justify-center text-white shadow-inner animate-bounce">
            <span className="text-lg font-bold">⭐</span>
          </div>
          <div className="text-left">
            <p className="text-[9px] font-bold text-amber-600 uppercase tracking-wide">Mis Estrellas</p>
            <p className="text-lg font-black text-amber-700">{member.points || 0}</p>
          </div>
        </div>
      </header>

      {/* TABS DE JUEGO */}
      <div className="max-w-2xl mx-auto flex gap-4 mb-6">
        <button
          onClick={() => setActiveSubTab('misiones')}
          className={`flex-1 py-4 text-center rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 border-2 ${
            activeSubTab === 'misiones'
              ? 'bg-indigo-600 border-indigo-700 text-white shadow-lg shadow-indigo-600/20 scale-[1.02]'
              : 'bg-white border-sky-100 text-indigo-700 hover:bg-sky-50'
          }`}
        >
          <Gamepad2 size={18} />
          Misiones ({myMissions.length})
        </button>
        <button
          onClick={() => setActiveSubTab('premios')}
          className={`flex-1 py-4 text-center rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 border-2 ${
            activeSubTab === 'premios'
              ? 'bg-emerald-600 border-emerald-700 text-white shadow-lg shadow-emerald-600/20 scale-[1.02]'
              : 'bg-white border-sky-100 text-emerald-700 hover:bg-sky-50'
          }`}
        >
          <Gift size={18} />
          Canjear Premios
        </button>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-2xl mx-auto">
        
        {activeSubTab === 'misiones' && (
          <div className="flex flex-col gap-4">
            {myMissions.length > 0 ? (
              myMissions.map((task) => (
                <div 
                  key={task.id} 
                  className="bg-white border-2 border-sky-200/40 rounded-3xl p-5 shadow-md hover:shadow-lg transition-all flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
                    <div className="h-12 w-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                      <Award size={24} />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-indigo-950">{task.title}</h4>
                      {task.description && (
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{task.description}</p>
                      )}
                      {task.dueDate && (
                        <span className="inline-block mt-2 text-[9px] bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded-md font-bold">
                          Terminar antes de: {task.dueDate}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleCompleteMission(task.id, task.title)}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-500/10 flex items-center justify-center gap-2 hover:scale-[1.03] transition-all"
                  >
                    <Check size={16} className="stroke-[3]" />
                    ¡Completar! (+10 ⭐)
                  </button>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-3xl p-10 text-center border-2 border-sky-100 shadow-md flex flex-col items-center justify-center">
                <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-3 animate-pulse">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-lg font-black text-slate-700">¡Todo al día!</h3>
                <p className="text-xs text-slate-400 font-bold mt-1 max-w-[280px]">No tienes misiones pendientes de realizar hoy. ¡A descansar!</p>
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'premios' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rewards.length > 0 ? (
              rewards.map((rew) => {
                const canAfford = (member.points || 0) >= rew.pointsRequired;
                
                return (
                  <div 
                    key={rew.id} 
                    className="bg-white border-2 border-sky-200/40 rounded-3xl p-5 shadow-md flex flex-col justify-between min-h-[170px]"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                          <Gift size={20} />
                        </div>
                        <span className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-100">
                          {rew.pointsRequired} ⭐
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-indigo-950 leading-snug">{rew.title}</h4>
                    </div>

                    <button
                      disabled={!canAfford}
                      onClick={() => handleRedeemReward(rew)}
                      className={`w-full py-2.5 rounded-xl font-black text-xs transition-all ${
                        canAfford 
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/10 hover:scale-[1.02]' 
                          : 'bg-slate-100 text-slate-400 border border-slate-200/50 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? '¡Canjear Premio!' : `Faltan ${rew.pointsRequired - (member.points || 0)} estrellas`}
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full bg-white rounded-3xl p-10 text-center border-2 border-sky-100 shadow-md">
                <Gift className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-black text-slate-600">No hay premios disponibles</h3>
                <p className="text-xs text-slate-400 mt-1">Tus padres aún no han añadido premios canjeables. ¡Pídeles que configuren algunos!</p>
              </div>
            )}
          </div>
        )}

      </main>

      {/* BOTÓN INFERIOR DE ACCESO A PADRES */}
      <footer className="fixed bottom-4 left-0 right-0 flex justify-center z-40 px-4">
        <button
          onClick={() => {
            // Cambiar de vuelta al perfil del primer adulto disponible (o Igor/Diana)
            const parent = members.find(m => m.role === 'Padre' || m.role === 'Madre') || { firstName: 'Igor' };
            setCurrentUser(parent.firstName);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border-2 border-sky-200/60 shadow-lg text-xs font-black text-indigo-900 hover:bg-sky-50 transition-all"
        >
          <ArrowLeft size={14} className="stroke-[3]" />
          Área de Padres
        </button>
      </footer>

      {/* MODAL DE ÉXITO GIGANTE (Gamificación) */}
      {successModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white border-4 border-amber-400 rounded-3xl p-6 text-center shadow-2xl relative animate-scaleUp">
            <div className="h-20 w-20 bg-amber-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 animate-bounce">
              {successModal === 'mission' ? '🎉' : '🎁'}
            </div>
            
            <h3 className="text-xl font-black text-indigo-900 leading-tight">
              {successModal === 'mission' ? '¡Misión Cumplida!' : '¡Premio Canjeado!'}
            </h3>
            
            <p className="text-xs text-slate-600 font-bold mt-2.5 leading-relaxed bg-slate-50 border border-slate-100 p-3 rounded-2xl">
              {successModal === 'mission' 
                ? `Has completado "${redeemedName}" y has ganado +10 estrellas. ¡Buen trabajo!` 
                : `Has canjeado "${redeemedName}". Pídele a tus padres tu premio.`
              }
            </p>

            <button
              onClick={() => setSuccessModal(null)}
              className="mt-5 w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md"
            >
              ¡Genial! 👍
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
