import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Award, 
  Gift, 
  Coins, 
  Heart,
  ChevronRight,
  ShieldAlert,
  Save
} from 'lucide-react';

export default function MemberManager() {
  const { 
    members, 
    addMember, 
    updateMember, 
    deleteMember, 
    rewards, 
    addReward, 
    deleteReward,
    awardPoints
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState('perfiles');

  // Modales
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  // Estados Formulario Miembro
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('M');
  const [birthDate, setBirthDate] = useState('');
  const [role, setRole] = useState('Hijo');
  const [confidentialInfo, setConfidentialInfo] = useState('');
  const [shoeSize, setShoSize] = useState('');
  const [shirtSize, setShirtSize] = useState('');
  const [pantsSize, setPantsSize] = useState('');
  const [allergiesText, setAllergiesText] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [dietaryText, setDietaryText] = useState('');

  // Estados Formulario Premio
  const [rewardTitle, setRewardTitle] = useState('');
  const [pointsRequired, setPointsRequired] = useState(10);

  // Estado Ajuste Puntos
  const [adjustingMemberId, setAdjustingMemberId] = useState(null);
  const [adjustPointsVal, setAdjustPointsVal] = useState('');

  const handleOpenCreateMember = () => {
    setEditingMember(null);
    setFirstName('');
    setLastName('');
    setGender('M');
    setBirthDate('');
    setRole('Hijo');
    setConfidentialInfo('');
    setShoSize('');
    setShirtSize('');
    setPantsSize('');
    setAllergiesText('');
    setBloodType('');
    setDietaryText('');
    setIsMemberModalOpen(true);
  };

  const handleOpenEditMember = (member) => {
    setEditingMember(member);
    setFirstName(member.firstName);
    setLastName(member.lastName || '');
    setGender(member.gender || 'M');
    setBirthDate(member.birthDate || '');
    setRole(member.role);
    setConfidentialInfo(member.confidentialInfo || '');
    setShoSize(member.shoeSize || '');
    setShirtSize(member.shirtSize || '');
    setPantsSize(member.pantsSize || '');
    setAllergiesText(member.allergies ? member.allergies.join(', ') : '');
    setBloodType(member.bloodType || '');
    setDietaryText(member.dietaryRestrictions ? member.dietaryRestrictions.join(', ') : '');
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = (e) => {
    e.preventDefault();
    if (!firstName.trim()) return;

    const allergies = allergiesText.split(',').map(s => s.trim()).filter(Boolean);
    const dietaryRestrictions = dietaryText.split(',').map(s => s.trim()).filter(Boolean);

    const memberData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender,
      birthDate: birthDate || null,
      role,
      confidentialInfo: confidentialInfo.trim(),
      shoeSize,
      shirtSize,
      pantsSize,
      allergies,
      bloodType,
      dietaryRestrictions
    };

    if (editingMember) {
      updateMember(editingMember.id, memberData);
    } else {
      addMember(memberData);
    }

    setIsMemberModalOpen(false);
  };

  const handleSaveReward = (e) => {
    e.preventDefault();
    if (!rewardTitle.trim() || !pointsRequired) return;

    addReward({
      title: rewardTitle.trim(),
      pointsRequired: Number(pointsRequired)
    });

    setRewardTitle('');
    setPointsRequired(10);
    setIsRewardModalOpen(false);
  };

  const handleAwardPoints = (memberId) => {
    const val = Number(adjustPointsVal);
    if (isNaN(val)) return;
    awardPoints(memberId, val);
    setAdjustingMemberId(null);
    setAdjustPointsVal('');
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* CABECERA */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Organización del Hogar</h2>
          <p className="text-sm text-slate-500">Administra los perfiles de la familia, tallas de ropa y premios para los niños.</p>
        </div>
      </div>

      {/* SELECTOR SEGMENTADO */}
      <div className="segmented-container max-w-md">
        <button
          onClick={() => setActiveSubTab('perfiles')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'perfiles'
              ? 'segmented-btn-active'
              : 'segmented-btn-inactive'
          }`}
        >
          <Users size={14} />
          Perfiles Familiares
        </button>
        <button
          onClick={() => setActiveSubTab('premios')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'premios'
              ? 'segmented-btn-active'
              : 'segmented-btn-inactive'
          }`}
        >
          <Gift size={14} />
          Premios Niños
        </button>
      </div>

      {/* CONTENIDO PERFILES */}
      {activeSubTab === 'perfiles' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Miembros Registrados ({members.length})</h3>
            <button
              onClick={handleOpenCreateMember}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 text-xs font-bold transition-all"
            >
              <Plus size={14} /> Añadir Miembro
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((m) => {
              const isKid = m.role === 'Hijo' || m.role === 'Hija';
              const isAdult = m.role === 'Padre' || m.role === 'Madre';
              
              const avatarBg = isKid ? 'bg-orange-500' : (m.firstName === 'Igor' ? 'bg-blue-500' : 'bg-purple-500');

              return (
                <div key={m.id} className="flat-card p-5 border border-slate-200/60 bg-white flex flex-col justify-between shadow-sm">
                  
                  {/* Fila principal */}
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`h-11 w-11 rounded-full text-white font-extrabold flex items-center justify-center shadow-sm ${avatarBg}`}>
                        {m.firstName[0]}
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800">{m.firstName} {m.lastName}</h4>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{m.role}</span>
                      </div>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleOpenEditMember(m)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Editar Perfil"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('¿Eliminar a este miembro de la familia? Esto borrará sus asignaciones.')) {
                            deleteMember(m.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Eliminar"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Fila de detalles/tallas/preferencias */}
                  <div className="grid grid-cols-2 gap-3 py-3 text-xs">
                    
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Tallas Ropa</span>
                      <span className="font-bold text-slate-700">
                        {m.shoeSize || m.shirtSize || m.pantsSize
                          ? `Z: ${m.shoeSize || '-'} / T: ${m.shirtSize || '-'} / P: ${m.pantsSize || '-'}`
                          : 'Sin tallas'
                        }
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Alergias</span>
                      <span className="font-semibold text-slate-600 truncate">
                        {m.allergies && m.allergies.length > 0 ? m.allergies.join(', ') : 'Ninguna'}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Restricciones Alim.</span>
                      <span className="font-semibold text-slate-600 truncate">
                        {m.dietaryRestrictions && m.dietaryRestrictions.length > 0 ? m.dietaryRestrictions.join(', ') : 'Ninguna'}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Grupo Sanguíneo</span>
                      <span className="font-bold text-slate-700">{m.bloodType || 'No especificado'}</span>
                    </div>
                  </div>

                  {/* Fila de puntos / gamificación (Solo para niños) */}
                  {isKid && (
                    <div className="mt-2.5 pt-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Award size={15} className="text-amber-500" />
                        <span className="text-[10px] font-bold text-indigo-950 uppercase tracking-wider">Puntuación:</span>
                        <span className="text-xs font-black text-indigo-700">{m.points || 0} ⭐</span>
                      </div>

                      {adjustingMemberId === m.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            placeholder="+/- Puntos"
                            value={adjustPointsVal}
                            onChange={(e) => setAdjustPointsVal(e.target.value)}
                            className="w-16 px-1.5 py-0.5 text-xs border rounded flat-input"
                          />
                          <button
                            onClick={() => handleAwardPoints(m.id)}
                            className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-500 font-bold"
                          >
                            <Save size={10} />
                          </button>
                          <button
                            onClick={() => setAdjustingMemberId(null)}
                            className="p-1 text-slate-400"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setAdjustingMemberId(m.id);
                            setAdjustPointsVal('');
                          }}
                          className="text-[10px] text-blue-600 font-bold hover:underline"
                        >
                          Ajustar Puntos
                        </button>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTENIDO PREMIOS */}
      {activeSubTab === 'premios' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Premios para el Modo Gamificado</h3>
            <button
              onClick={() => setIsRewardModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 text-xs font-bold transition-all"
            >
              <Plus size={14} /> Crear Premio
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rewards.map((rew) => (
              <div key={rew.id} className="flat-card p-4 border border-slate-200/60 bg-white flex flex-col justify-between shadow-sm relative group">
                <div className="flex items-start justify-between gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Gift size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-extrabold text-indigo-950 truncate leading-snug">{rew.title}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Precio: {rew.pointsRequired} estrellas ⭐</p>
                  </div>
                  <button
                    onClick={() => deleteReward(rew.id)}
                    className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}

            {rewards.length === 0 && (
              <div className="col-span-full flat-card p-10 text-center border border-slate-200/50 bg-white">
                <Gift className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-500">No hay premios configurados</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Añade incentivos (ej: tiempo de consola, helados, etc.) que los niños puedan canjear con sus estrellas.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL MIEMBRO (Crear/Editar) / BOTTOM SHEET EN MÓVIL */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full sm:max-w-md bg-white border-t sm:border border-slate-200/60 rounded-t-3xl rounded-b-none sm:rounded-2xl p-6 pb-12 sm:pb-6 shadow-2xl sm:shadow-xl relative overflow-y-auto max-h-[85vh] sm:max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                {editingMember ? 'Editar Miembro' : 'Añadir Miembro'}
              </h3>
              <button onClick={() => setIsMemberModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSaveMember} className="flex flex-col gap-4">
              
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Nombre *</label>
                  <input
                    type="text"
                    required
                    placeholder="Igor"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 flat-input text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Apellidos</label>
                  <input
                    type="text"
                    placeholder="García"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 flat-input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Rol Familiar</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 flat-input text-xs text-slate-600"
                  >
                    <option value="Padre">Padre</option>
                    <option value="Madre">Madre</option>
                    <option value="Hijo">Hijo</option>
                    <option value="Hija">Hija</option>
                    <option value="Abuelo">Abuelo</option>
                    <option value="Abuela">Abuela</option>
                    <option value="Mascota">Mascota</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Fecha Nacimiento</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2 flat-input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Sexo</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 flat-input text-xs text-slate-600"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Grupo Sanguíneo</label>
                  <input
                    type="text"
                    placeholder="A+, O-, AB+"
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-full px-3 py-2 flat-input text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-indigo-950 uppercase tracking-wider mb-2">Tallas de Ropa</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[8px] font-bold text-slate-400 uppercase">Calzado</label>
                    <input
                      type="text"
                      placeholder="Z32"
                      value={shoeSize}
                      onChange={(e) => setShoSize(e.target.value)}
                      className="w-full px-2 py-1.5 flat-input text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[8px] font-bold text-slate-400 uppercase">Camiseta</label>
                    <input
                      type="text"
                      placeholder="T8"
                      value={shirtSize}
                      onChange={(e) => setShirtSize(e.target.value)}
                      className="w-full px-2 py-1.5 flat-input text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[8px] font-bold text-slate-400 uppercase">Pantalón</label>
                    <input
                      type="text"
                      placeholder="T8"
                      value={pantsSize}
                      onChange={(e) => setPantsSize(e.target.value)}
                      className="w-full px-2 py-1.5 flat-input text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Alergias (separadas por comas)</label>
                <input
                  type="text"
                  placeholder="Lactosa, Polvo, Penicilina..."
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                  className="w-full px-3 py-2 flat-input text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Restricciones Alimentarias</label>
                <input
                  type="text"
                  placeholder="Sin gluten, Vegano..."
                  value={dietaryText}
                  onChange={(e) => setDietaryText(e.target.value)}
                  className="w-full px-3 py-2 flat-input text-xs"
                />
              </div>

              <div className="flex flex-col gap-1 bg-red-50/30 border border-red-100/50 p-3 rounded-xl">
                <label className="text-[10px] font-bold text-red-600 uppercase tracking-wide flex items-center gap-1">
                  <ShieldAlert size={12} />
                  Información Confidencial (Oculta en Tablón)
                </label>
                <textarea
                  rows={2}
                  placeholder="DNI: 12345678A / Tarjeta Sanitaria: 281234..."
                  value={confidentialInfo}
                  onChange={(e) => setConfidentialInfo(e.target.value)}
                  className="w-full px-3 py-2 flat-input text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="text-xs font-bold text-slate-400 px-3 py-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  {editingMember ? 'Guardar Cambios' : 'Añadir Miembro'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL NUEVO PREMIO / BOTTOM SHEET EN MÓVIL */}
      {isRewardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full sm:max-w-sm bg-white border-t sm:border border-slate-200/60 rounded-t-3xl rounded-b-none sm:rounded-2xl p-6 pb-12 sm:pb-6 shadow-2xl sm:shadow-xl relative max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Nuevo Premio</h3>
              <button onClick={() => setIsRewardModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveReward} className="flex flex-col gap-4">
              
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Título del Premio *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 30 minutos de consola, Helado gigante..."
                  value={rewardTitle}
                  onChange={(e) => setRewardTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 flat-input text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Estrellas Requeridas *</label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="20"
                  value={pointsRequired}
                  onChange={(e) => setPointsRequired(e.target.value)}
                  className="w-full px-3.5 py-2.5 flat-input text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRewardModalOpen(false)}
                  className="text-xs font-bold text-slate-400 px-3 py-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  Crear Premio
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
