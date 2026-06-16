import React, { useState } from 'react';
import ReactDOM from 'react-dom';
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
  Save,
  Key,
  Lock,
  Eye,
  EyeOff
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
    awardPoints,
    familyRoles = [],
    addFamilyRole,
    deleteFamilyRole,
    authenticatedMemberId,
    changePassword,
    resetAdminPassword,
    currentUser
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState('perfiles');

  // Modales
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  // Cambio de contraseña
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [changingPasswordMemberId, setChangingPasswordMemberId] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Estado Formulario Rol
  const [newRoleName, setNewRoleName] = useState('');

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [associatedMemberIds, setAssociatedMemberIds] = useState([]);
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');

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
    setRole(familyRoles[0]?.name || 'Hijo');
    setConfidentialInfo('');
    setShoSize('');
    setShirtSize('');
    setPantsSize('');
    setAllergiesText('');
    setBloodType('');
    setDietaryText('');
    setIsAdmin(false);
    setAssociatedMemberIds([]);
    setEmail('');
    setFormError('');
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
    setIsAdmin(member.isAdmin || false);
    setAssociatedMemberIds(member.associatedMemberIds || []);
    setEmail(member.email || '');
    setFormError('');
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = (e) => {
    e.preventDefault();
    if (!firstName.trim()) return;

    if (isAdmin && !email.trim()) {
      setFormError('La dirección de correo electrónico es obligatoria para los administradores.');
      return;
    }

    if (email.trim() && !/\S+@\S+\.\S+/.test(email)) {
      setFormError('Por favor, introduce una dirección de correo electrónico válida.');
      return;
    }

    setFormError('');

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
      dietaryRestrictions,
      isAdmin,
      associatedMemberIds,
      email: email.trim()
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

  const handleOpenChangePassword = (memberId) => {
    setChangingPasswordMemberId(memberId);
    setOldPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setPasswordError('');
    setPasswordSuccess('');
    setIsChangePasswordModalOpen(true);
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setPasswordError('Todos los campos son obligatorios.');
      return;
    }
    if (newPassword.length < 4) {
      setPasswordError('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Las nuevas contraseñas no coinciden.');
      return;
    }
    setIsSubmittingPassword(true);
    setPasswordError('');
    setPasswordSuccess('');
    try {
      await changePassword(changingPasswordMemberId, oldPassword, newPassword);
      setPasswordSuccess('Contraseña actualizada correctamente.');
      setTimeout(() => {
        setIsChangePasswordModalOpen(false);
      }, 1500);
    } catch (err) {
      setPasswordError(err.message || 'Error al cambiar la contraseña.');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleResetPassword = async (memberId, memberName) => {
    if (confirm(`¿Seguro que quieres restablecer la contraseña de ${memberName} a "12345"?`)) {
      try {
        await resetAdminPassword(memberId);
        alert('Contraseña restablecida con éxito a "12345".');
      } catch (err) {
        alert(err.message || 'Error al restablecer la contraseña.');
      }
    }
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
          className={`flex-1 py-2.5 text-center text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 touch-btn ${
            activeSubTab === 'perfiles'
              ? 'segmented-btn-active'
              : 'segmented-btn-inactive'
          }`}
        >
          <Users size={14} />
          <span className="hidden min-[360px]:inline">Perfiles Familiares</span>
          <span className="inline min-[360px]:hidden">Perfiles</span>
        </button>
        <button
          onClick={() => setActiveSubTab('premios')}
          className={`flex-1 py-2.5 text-center text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 touch-btn ${
            activeSubTab === 'premios'
              ? 'segmented-btn-active'
              : 'segmented-btn-inactive'
          }`}
        >
          <Gift size={14} />
          <span className="hidden min-[360px]:inline">Premios Niños</span>
          <span className="inline min-[360px]:hidden">Premios</span>
        </button>
      </div>

      {/* CONTENIDO PERFILES */}
      {activeSubTab === 'perfiles' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Miembros Registrados ({members.length})</h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsRolesModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-655 border border-slate-200 hover:bg-slate-200 text-xs font-bold transition-all touch-btn"
              >
                Gestionar Roles
              </button>
              <button
                type="button"
                onClick={handleOpenCreateMember}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold transition-all shadow-md shadow-blue-500/10 touch-btn"
              >
                <Plus size={14} /> Añadir Miembro
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...members].sort((a, b) => {
              // 1. Administradores primero
              if (a.isAdmin && !b.isAdmin) return -1;
              if (!a.isAdmin && b.isAdmin) return 1;

              // 2. Ordenar por edad (nacimiento ascendente: mayor a menor)
              if (a.birthDate && b.birthDate) {
                return new Date(a.birthDate) - new Date(b.birthDate);
              }
              if (a.birthDate && !b.birthDate) return -1;
              if (!a.birthDate && b.birthDate) return 1;

              // Fallback
              return a.firstName.localeCompare(b.firstName);
            }).map((m) => {
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
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{m.role}</span>
                          {m.isAdmin && (
                            <span className="text-[8px] bg-blue-50 border border-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                              🛡️ Admin
                            </span>
                          )}
                          {m.isAdmin && m.associatedMemberIds && m.associatedMemberIds.length > 0 && (
                            <span className="text-[8px] bg-slate-50 border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-bold" title={`${m.associatedMemberIds.length} miembros asociados`}>
                              👥 {m.associatedMemberIds.length} asociados
                            </span>
                          )}
                        </div>
                        {m.email && (
                          <div className="text-[10px] text-slate-500 font-medium mt-1 truncate max-w-[180px]" title={m.email}>
                            ✉️ {m.email}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1.5">
                      {m.isAdmin && m.firstName === currentUser && (
                        <button
                          onClick={() => handleOpenChangePassword(m.id)}
                          className="p-2 text-slate-500 hover:text-indigo-650 hover:bg-indigo-50 rounded-lg transition-all touch-btn"
                          title="Cambiar Contraseña"
                        >
                          <Key size={15} />
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenEditMember(m)}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all touch-btn"
                        title="Editar Perfil"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('¿Eliminar a este miembro de la familia? Esto borrará sus asignaciones.')) {
                            deleteMember(m.id);
                          }
                        }}
                        className="p-2 text-slate-550 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all touch-btn"
                        title="Eliminar"
                      >
                        <Trash2 size={15} />
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
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 text-xs font-bold transition-all touch-btn"
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
                    className="text-slate-500 hover:text-red-650 action-btn-mobile transition-all p-1.5 shrink-0 touch-btn"
                  >
                    <Trash2 size={15} />
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

      {/* MODAL MIEMBRO (Crear/Editar) / ESTILO TAREAS */}
      {isMemberModalOpen && ReactDOM.createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center sm:items-start p-0 sm:p-4 sm:pt-20 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setIsMemberModalOpen(false); }}
        >
          <form 
            onSubmit={handleSaveMember}
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-0 sm:relative sm:inset-auto w-full h-full sm:h-auto sm:max-w-xl bg-white border-t sm:border border-slate-200/60 rounded-none sm:rounded-2xl shadow-2xl flex flex-col overflow-y-auto animate-slideUp sm:animate-none sm:mb-8"
          >
            {/* Cabecera sticky */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-20 shrink-0">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-bold tracking-tight text-slate-800">
                  {editingMember ? 'Editar Miembro' : 'Añadir Miembro'}
                </h3>
                <span className="text-[10px] text-slate-400 font-medium">
                  {editingMember ? 'Modifica los datos del perfil familiar' : 'Crea un nuevo perfil para la familia'}
                </span>
              </div>
              <button 
                type="button"
                onClick={() => setIsMemberModalOpen(false)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-all border-0 cursor-pointer shrink-0"
              >
                <X size={15} />
              </button>
            </div>
            
            {/* Cuerpo */}
            <div className="px-6 py-5 pb-8 sm:pb-6 flex flex-col gap-4 overflow-y-auto">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-650 rounded-xl text-xs font-semibold leading-relaxed animate-fadeIn">
                  {formError}
                </div>
              )}

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

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Correo Electrónico {isAdmin ? '*' : '(Opcional)'}
                </label>
                <input
                  type="text"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 flat-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Rol Familiar</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 flat-input text-xs text-slate-600"
                  >
                    {familyRoles.map(r => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                    {familyRoles.length === 0 && (
                      <>
                        <option value="Padre">Padre</option>
                        <option value="Madre">Madre</option>
                        <option value="Hijo">Hijo</option>
                        <option value="Hija">Hija</option>
                        <option value="Abuelo">Abuelo</option>
                        <option value="Abuela">Abuela</option>
                        <option value="Mascota">Mascota</option>
                      </>
                    )}
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

              {/* ROL ADMINISTRADOR Y MIEMBROS ASOCIADOS */}
              <div className="flex flex-col gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isAdminCheckbox"
                    checked={isAdmin}
                    onChange={(e) => {
                      setIsAdmin(e.target.checked);
                      if (!e.target.checked) setAssociatedMemberIds([]);
                    }}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="isAdminCheckbox" className="text-xs font-bold text-slate-700 select-none cursor-pointer">
                    ¿Es Administrador del Hogar? (ej. Padre/Madre)
                  </label>
                </div>

                {isAdmin && (
                  <div className="flex flex-col gap-1.5 border-t border-slate-200/50 pt-2.5">
                    <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wide">
                      Miembros del Hogar Asociados a este Perfil
                    </span>
                    <p className="text-[9px] text-slate-400 leading-normal">
                      Este administrador verá y gestionará las tareas de los perfiles asociados marcados abajo.
                    </p>
                    <div className="flex flex-col gap-1 max-h-36 overflow-y-auto pr-1 mt-1 bg-white p-2 rounded-lg border border-slate-200/50">
                      {members
                        .filter(m => !editingMember || m.id !== editingMember.id)
                        .map(m => {
                          const isChecked = associatedMemberIds.includes(m.id);
                          return (
                            <label key={m.id} className="flex items-center gap-2 px-2 py-1 hover:bg-slate-50 rounded cursor-pointer select-none text-xs">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setAssociatedMemberIds(associatedMemberIds.filter(id => id !== m.id));
                                  } else {
                                    setAssociatedMemberIds([...associatedMemberIds, m.id]);
                                  }
                                }}
                                className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="font-semibold text-slate-700">{m.firstName} {m.lastName}</span>
                              <span className="text-[8px] bg-slate-100 border border-slate-200/60 text-slate-500 px-1 rounded uppercase tracking-wider font-bold">{m.role}</span>
                            </label>
                          );
                        })}
                      {members.filter(m => !editingMember || m.id !== editingMember.id).length === 0 && (
                        <p className="text-[9px] text-slate-400 italic">No hay otros miembros creados para asociar.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1 bg-red-50/30 border border-red-100/50 p-3 rounded-xl">
                <label className="text-[10px] font-bold text-red-655 uppercase tracking-wide flex items-center gap-1">
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
            </div>

            {/* Footer sticky */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-white sticky bottom-0 z-20 shrink-0 mt-auto">
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
        </div>,
        document.body
      )}

      {/* MODAL NUEVO PREMIO / ESTILO TAREAS */}
      {isRewardModalOpen && ReactDOM.createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center sm:items-start p-0 sm:p-4 sm:pt-20 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setIsRewardModalOpen(false); }}
        >
          <form 
            onSubmit={handleSaveReward}
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-0 sm:relative sm:inset-auto w-full h-full sm:h-auto sm:max-w-md bg-white border-t sm:border border-slate-200/60 rounded-none sm:rounded-2xl shadow-2xl flex flex-col overflow-y-auto animate-slideUp sm:animate-none sm:mb-8"
          >
            {/* Cabecera sticky */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-20 shrink-0">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-bold tracking-tight text-slate-800">Nuevo Premio</h3>
                <span className="text-[10px] text-slate-400 font-medium">Crea un incentivo para canjear con estrellas</span>
              </div>
              <button 
                type="button"
                onClick={() => setIsRewardModalOpen(false)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-all border-0 cursor-pointer shrink-0"
              >
                <X size={15} />
              </button>
            </div>

            {/* Cuerpo */}
            <div className="px-6 py-5 pb-8 sm:pb-6 flex flex-col gap-4 overflow-y-auto">
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
            </div>

            {/* Footer sticky */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-white sticky bottom-0 z-20 shrink-0 mt-auto">
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
        </div>,
        document.body
      )}

      {/* MODAL GESTIONAR ROLES FAMILIARES / ESTILO TAREAS */}
      {isRolesModalOpen && ReactDOM.createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center sm:items-start p-0 sm:p-4 sm:pt-20 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setIsRolesModalOpen(false); }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-0 sm:relative sm:inset-auto w-full h-full sm:h-auto sm:max-w-md bg-white border-t sm:border border-slate-200/60 rounded-none sm:rounded-2xl shadow-2xl flex flex-col overflow-y-auto animate-slideUp sm:animate-none sm:mb-8"
          >
            {/* Cabecera sticky */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-20 shrink-0">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-bold tracking-tight text-slate-800">Gestionar Roles</h3>
                <span className="text-[10px] text-slate-400 font-medium">Añade o elimina roles del hogar</span>
              </div>
              <button 
                type="button"
                onClick={() => setIsRolesModalOpen(false)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-all border-0 cursor-pointer shrink-0"
              >
                <X size={15} />
              </button>
            </div>

            {/* Cuerpo */}
            <div className="px-6 py-5 pb-8 sm:pb-6 flex flex-col gap-4 overflow-y-auto">
              {/* Formulario Añadir Rol */}
              <div className="flex flex-col gap-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100 shrink-0">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Nuevo Rol Familiar</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ej: Tío, Tía, Primo..."
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    className="flex-1 px-3 py-2 flat-input text-xs"
                  />
                  <button
                    type="button"
                    disabled={!newRoleName.trim()}
                    onClick={async () => {
                      await addFamilyRole(newRoleName);
                      setNewRoleName('');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs disabled:opacity-55 disabled:cursor-not-allowed transition-all"
                  >
                    Añadir
                  </button>
                </div>
              </div>

              {/* Lista de Roles */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Roles Disponibles ({familyRoles.length})</span>
                <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto pr-1 bg-white p-1 rounded-xl border border-slate-100">
                  {familyRoles.map((role) => (
                    <div key={role.id} className="flex items-center justify-between px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200/50 hover:bg-slate-100/50 transition-colors">
                      <span className="text-xs font-bold text-slate-700">{role.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`¿Eliminar el rol "${role.name}"? Los miembros existentes con este rol no se eliminarán.`)) {
                            deleteFamilyRole(role.id);
                          }
                        }}
                        className="text-slate-450 hover:text-red-650 p-1 rounded transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {familyRoles.length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-4">No hay roles familiares creados.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer sticky */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 bg-white sticky bottom-0 z-20 shrink-0 mt-auto">
              <button
                type="button"
                onClick={() => setIsRolesModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL CAMBIAR CONTRASEÑA / ESTILO TAREAS */}
      {isChangePasswordModalOpen && ReactDOM.createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center sm:items-start p-0 sm:p-4 sm:pt-20 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setIsChangePasswordModalOpen(false); }}
        >
          <form 
            onSubmit={handleChangePasswordSubmit}
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-0 sm:relative sm:inset-auto w-full h-full sm:h-auto sm:max-w-md bg-white border-t sm:border border-slate-200/60 rounded-none sm:rounded-2xl shadow-2xl flex flex-col overflow-y-auto animate-slideUp sm:animate-none sm:mb-8"
          >
            {/* Cabecera sticky */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-20 shrink-0">
              <div className="flex flex-col gap-0.5 flex-1 pr-4">
                <h3 className="text-sm font-bold tracking-tight text-slate-800 flex items-center gap-1.5">
                  <Key size={16} className="text-indigo-650 shrink-0" />
                  Cambiar Contraseña
                </h3>
                <span className="text-[10px] text-slate-400 font-medium">Actualiza tu clave de acceso</span>
              </div>
              <button 
                type="button"
                onClick={() => setIsChangePasswordModalOpen(false)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-all border-0 cursor-pointer shrink-0"
              >
                <X size={15} />
              </button>
            </div>

            {/* Cuerpo */}
            <div className="px-6 py-5 pb-8 sm:pb-6 flex flex-col gap-4 overflow-y-auto">
              {passwordError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-655 rounded-xl text-xs font-semibold leading-relaxed animate-fadeIn">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-655 rounded-xl text-xs font-semibold leading-relaxed animate-fadeIn">
                  {passwordSuccess}
                </div>
              )}

              {/* Contraseña Actual */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Contraseña Actual</label>
                <div className="relative">
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 pr-10 py-2.5 flat-input text-xs"
                    disabled={isSubmittingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 touch-btn"
                    disabled={isSubmittingPassword}
                  >
                    {showOldPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Nueva Contraseña */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Nueva Contraseña</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="Mínimo 4 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 pr-10 py-2.5 flat-input text-xs"
                    disabled={isSubmittingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 touch-btn"
                    disabled={isSubmittingPassword}
                  >
                    {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirmar Nueva Contraseña */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Confirmar Nueva Contraseña</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Repite la contraseña"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full px-4 pr-10 py-2.5 flat-input text-xs"
                    disabled={isSubmittingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 touch-btn"
                    disabled={isSubmittingPassword}
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer sticky */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-white sticky bottom-0 z-20 shrink-0 mt-auto">
              <button
                type="button"
                onClick={() => setIsChangePasswordModalOpen(false)}
                className="text-xs font-bold text-slate-400 px-3 py-2"
                disabled={isSubmittingPassword}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5"
                disabled={isSubmittingPassword}
              >
                {isSubmittingPassword ? 'Actualizando...' : 'Cambiar Contraseña'}
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

    </div>
  );
}
