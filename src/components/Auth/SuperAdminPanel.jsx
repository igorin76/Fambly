import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import FamblyLogo from '../Layout/FamblyLogo';
import { supabase } from '../../utils/supabaseClient';
import bcrypt from 'bcryptjs';
import { 
  Users, 
  Plus, 
  Trash2, 
  Key, 
  Mail, 
  User, 
  Home, 
  LogOut, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Lock,
  Eye,
  EyeOff,
  Edit2
} from 'lucide-react';

export default function SuperAdminPanel() {
  const logout = useStore((state) => state.logout);
  const [families, setFamilies] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  // Estados Formulario Creación
  const [familyName, setFamilyName] = useState('');
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados Modal Edición de Familia
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFamily, setEditingFamily] = useState(null);
  const [updatedFamilyName, setUpdatedFamilyName] = useState('');
  const [selectedAdminId, setSelectedAdminId] = useState('');
  const [selectedAdminEmail, setSelectedAdminEmail] = useState('');
  const [updatedAdminPassword, setUpdatedAdminPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editError, setEditError] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const handleOpenEditFamily = (family) => {
    setEditingFamily(family);
    setUpdatedFamilyName(family.familyName);
    const currentAdmin = family.allAdmins.find(a => a.email === family.email) || family.allAdmins[0];
    setSelectedAdminId(currentAdmin ? currentAdmin.id : '');
    setSelectedAdminEmail(currentAdmin ? currentAdmin.email : '');
    setUpdatedAdminPassword('');
    setShowEditPassword(false);
    setEditError('');
    setIsEditModalOpen(true);
  };

  const handleSaveEditFamily = async (e) => {
    e.preventDefault();
    if (!updatedFamilyName.trim() || !selectedAdminId || !selectedAdminEmail.trim()) {
      setEditError('El nombre de la familia y el correo del administrador son obligatorios.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(selectedAdminEmail)) {
      setEditError('Por favor, introduce una dirección de correo electrónico válida.');
      return;
    }

    if (updatedAdminPassword && updatedAdminPassword.length < 4) {
      setEditError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    setIsSavingEdit(true);
    setEditError('');

    try {
      // 1. Verificar si ya existe otro miembro con el mismo email (excepto el propio administrador actual que se edita)
      const { data: existingMember, error: checkError } = await supabase
        .from('members')
        .select('id')
        .eq('email', selectedAdminEmail.trim().toLowerCase())
        .neq('id', selectedAdminId)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existingMember) {
        throw new Error('El correo electrónico ya está registrado en otra cuenta.');
      }

      // 2. Actualizar nombre del workspace en Supabase
      const { error: wsError } = await supabase
        .from('workspaces')
        .update({ name: updatedFamilyName.trim() })
        .eq('id', editingFamily.workspaceId);

      if (wsError) throw wsError;

      // 3. Desmarcar todos los administradores como principales
      const { error: resetError } = await supabase
        .from('members')
        .update({ is_primary_admin: false })
        .eq('workspace_id', editingFamily.workspaceId);

      if (resetError) throw resetError;

      // 4. Preparar actualizaciones del miembro administrador
      const adminUpdates = {
        is_primary_admin: true,
        email: selectedAdminEmail.trim().toLowerCase()
      };

      if (updatedAdminPassword) {
        const hashedPassword = await bcrypt.hash(updatedAdminPassword, 10);
        adminUpdates.password_hash = hashedPassword;
      }

      // 5. Aplicar cambios al administrador principal
      const { error: setPrimaryError } = await supabase
        .from('members')
        .update(adminUpdates)
        .eq('id', selectedAdminId);

      if (setPrimaryError) throw setPrimaryError;

      setIsEditModalOpen(false);
      setEditingFamily(null);
      setUpdatedAdminPassword('');
      fetchFamilies();
    } catch (err) {
      setEditError(err.message || 'Error al guardar los cambios.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Cargar administradores de familias existentes
  const fetchFamilies = async () => {
    setIsLoadingList(true);
    try {
      const { data: members, error: membersError } = await supabase
        .from('members')
        .select('*')
        .eq('is_admin', true);

      if (membersError) throw membersError;

      const { data: workspaces, error: wsError } = await supabase
        .from('workspaces')
        .select('*');

      if (wsError) throw wsError;

      const wsMap = workspaces.reduce((acc, ws) => {
        acc[ws.id] = ws.name;
        return acc;
      }, {});

      // Agrupar administradores por workspace_id
      const groupedByWorkspace = members.reduce((acc, m) => {
        if (!acc[m.workspace_id]) {
          acc[m.workspace_id] = [];
        }
        acc[m.workspace_id].push(m);
        return acc;
      }, {});

      const processedFamilies = Object.keys(groupedByWorkspace).map(wsId => {
        const admins = groupedByWorkspace[wsId];
        let primaryAdmin = admins.find(a => a.is_primary_admin === true);
        if (!primaryAdmin) {
          primaryAdmin = admins[0];
        }

        return {
          id: primaryAdmin.id,
          adminName: `${primaryAdmin.first_name} ${primaryAdmin.last_name || ''}`.trim(),
          email: primaryAdmin.email,
          workspaceId: wsId,
          familyName: wsMap[wsId] || 'Hogar Sin Nombre',
          createdAt: primaryAdmin.created_at ? new Date(primaryAdmin.created_at).toLocaleDateString('es-ES') : 'Desconocida',
          allAdmins: admins
        };
      });

      setFamilies(processedFamilies);
    } catch (err) {
      console.error("Error al cargar familias:", err);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchFamilies();
  }, []);

  const handleCreateFamily = async (e) => {
    e.preventDefault();
    if (!familyName.trim() || !adminFirstName.trim() || !adminEmail.trim() || !adminPassword.trim()) {
      setFormError('Todos los campos obligatorios (*) deben ser completados.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(adminEmail)) {
      setFormError('Por favor, introduce una dirección de correo electrónico válida.');
      return;
    }

    if (adminPassword.length < 4) {
      setFormError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    setFormSuccess('');

    try {
      // 1. Verificar si ya existe un administrador con ese email
      const { data: existingAdmin, error: checkError } = await supabase
        .from('members')
        .select('id')
        .eq('email', adminEmail.trim())
        .maybeSingle();

      if (checkError) throw checkError;
      if (existingAdmin) {
        throw new Error('Ya existe una cuenta familiar registrada con este correo electrónico.');
      }

      const workspaceId = `ws-family-${Date.now()}`;
      const memberId = `mem-admin-${Date.now()}`;

      // 2. Crear el workspace
      const { error: wsError } = await supabase
        .from('workspaces')
        .insert({
          id: workspaceId,
          name: familyName.trim()
        });

      if (wsError) throw wsError;

      // 3. Hashear la contraseña
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      // 4. Crear el miembro administrador principal
      const { error: memberError } = await supabase
        .from('members')
        .insert({
          id: memberId,
          workspace_id: workspaceId,
          first_name: adminFirstName.trim(),
          last_name: adminLastName.trim(),
          role: 'Padre',
          is_admin: true,
          email: adminEmail.trim().toLowerCase(),
          password_hash: hashedPassword,
          points: 0
        });

      if (memberError) throw memberError;

      // 5. Crear los roles familiares por defecto en la tabla family_roles para el nuevo workspace
      const defaultRoles = [
        { id: `role-padre-${Date.now()}`, workspace_id: workspaceId, name: 'Padre' },
        { id: `role-madre-${Date.now()}`, workspace_id: workspaceId, name: 'Madre' },
        { id: `role-hijo-${Date.now()}`, workspace_id: workspaceId, name: 'Hijo' },
        { id: `role-hija-${Date.now()}`, workspace_id: workspaceId, name: 'Hija' },
        { id: `role-abuelo-${Date.now()}`, workspace_id: workspaceId, name: 'Abuelo' },
        { id: `role-abuela-${Date.now()}`, workspace_id: workspaceId, name: 'Abuela' },
        { id: `role-mascota-${Date.now()}`, workspace_id: workspaceId, name: 'Mascota' }
      ];

      const { error: rolesError } = await supabase
        .from('family_roles')
        .insert(defaultRoles);

      if (rolesError) {
        console.error("Error no crítico al crear roles familiares por defecto:", rolesError);
      }

      setFormSuccess(`¡Familia "${familyName}" y administrador "${adminFirstName}" creados con éxito!`);
      
      // Limpiar formulario
      setFamilyName('');
      setAdminFirstName('');
      setAdminLastName('');
      setAdminEmail('');
      setAdminPassword('');
      
      // Recargar lista
      fetchFamilies();
    } catch (err) {
      setFormError(err.message || 'Ocurrió un error al crear la familia.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFamily = async (workspaceId, adminId, familyName) => {
    if (confirm(`¿Estás completamente seguro de que quieres eliminar a la familia "${familyName}"? Esto borrará el hogar, todos sus miembros, tareas y datos relacionados de forma permanente.`)) {
      try {
        // En Supabase, al tener ON DELETE CASCADE en la clave foránea workspace_id en las tablas miembros, tareas, wishlist, etc.,
        // eliminar el workspace de la tabla workspaces eliminará automáticamente todo lo demás.
        const { error: deleteError } = await supabase
          .from('workspaces')
          .delete()
          .eq('id', workspaceId);

        if (deleteError) throw deleteError;

        alert(`Familia "${familyName}" eliminada con éxito.`);
        fetchFamilies();
      } catch (err) {
        alert(err.message || 'Error al eliminar la familia.');
      }
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-slate-50 text-slate-800 relative selection:bg-indigo-100 selection:text-indigo-900">
      {/* Fondo decorativo sutil */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/50 via-slate-50/30 to-slate-100/60 pointer-events-none" />

      {/* HEADER */}
      <header className="relative z-10 w-full border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <FamblyLogo className="h-8" />
            <span className="text-[10px] uppercase font-black tracking-widest bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md">
              Superadmin
            </span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-red-650 hover:bg-red-50 hover:border-red-100 border border-transparent transition-all touch-btn"
          >
            <LogOut size={14} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA FORMULARIO: REGISTRAR NUEVA FAMILIA */}
          <div className="lg:col-span-1">
            <div className="flat-card p-6 bg-white border border-slate-200/80 shadow-md flex flex-col gap-5 sticky top-24">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Plus size={18} className="text-indigo-600" />
                  Alta de Nueva Familia
                </h2>
                <p className="text-xs text-slate-500 mt-1">Crea un espacio de trabajo privado y su administrador correspondiente.</p>
              </div>

              <form onSubmit={handleCreateFamily} className="flex flex-col gap-4">
                
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-655 rounded-xl text-xs font-semibold flex items-start gap-2 animate-fadeIn">
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                {formSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-655 rounded-xl text-xs font-semibold flex items-start gap-2 animate-fadeIn">
                    <CheckCircle size={15} className="shrink-0 mt-0.5" />
                    <span>{formSuccess}</span>
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nombre de la Familia *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Familia López"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    className="w-full px-3 py-2.5 flat-input text-xs"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="border-t border-slate-100 my-1 pt-3">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Administrador Principal</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nombre *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Ana"
                      value={adminFirstName}
                      onChange={(e) => setAdminFirstName(e.target.value)}
                      className="w-full px-3 py-2.5 flat-input text-xs"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Apellidos</label>
                    <input
                      type="text"
                      placeholder="Ej: Gómez"
                      value={adminLastName}
                      onChange={(e) => setAdminLastName(e.target.value)}
                      className="w-full px-3 py-2.5 flat-input text-xs"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    placeholder="ejemplo@correo.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full px-3 py-2.5 flat-input text-xs"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contraseña de Acceso *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Mínimo 4 caracteres"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full pl-3 pr-10 py-2.5 flat-input text-xs"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 touch-btn"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-500/10 disabled:opacity-55 disabled:cursor-not-allowed touch-btn"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Registrando...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      <span>Crear Familia</span>
                    </>
                  )}
                </button>

              </form>
            </div>
          </div>

          {/* COLUMNA TABLA: LISTADO DE FAMILIAS CREADAS */}
          <div className="lg:col-span-2">
            <div className="flat-card p-6 bg-white border border-slate-200/80 shadow-md flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Users size={18} className="text-indigo-650" />
                    Familias Registradas
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Supervisa y administra las cuentas familiares activas en la aplicación.</p>
                </div>
                <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold">
                  {families.length} familias
                </span>
              </div>

              {isLoadingList ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
                  <Loader2 size={24} className="animate-spin text-indigo-500" />
                  <span className="text-xs font-bold">Cargando base de datos...</span>
                </div>
              ) : families.length === 0 ? (
                <div className="text-center py-16 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                  <Home size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-bold">No hay familias registradas todavía</p>
                  <p className="text-[10px] text-slate-450 mt-0.5">Utiliza el formulario de la izquierda para dar de alta la primera familia.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-450 tracking-wider">
                        <th className="pb-3 pl-2">Familia / Hogar</th>
                        <th className="pb-3">Administrador Principal</th>
                        <th className="pb-3">Correo Electrónico</th>
                        <th className="pb-3">ID Workspace</th>
                        <th className="pb-3 text-right pr-2">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {families.map((f) => (
                        <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 pl-2 font-extrabold text-slate-800 flex items-center gap-2">
                            <span className="h-6 w-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                              {f.familyName[0]}
                            </span>
                            {f.familyName}
                          </td>
                          <td className="py-3.5 font-semibold text-slate-700">{f.adminName}</td>
                          <td className="py-3.5 text-slate-500 font-medium">{f.email}</td>
                          <td className="py-3.5 font-mono text-[9px] text-slate-400 tracking-tight" title={f.workspaceId}>
                            {f.workspaceId.substring(0, 16)}...
                          </td>
                          <td className="py-3.5 text-right pr-2 flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditFamily(f)}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all touch-btn"
                              title="Editar Familia"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteFamily(f.workspaceId, f.id, f.familyName)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all touch-btn"
                              title="Eliminar Familia"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>

      </main>

      {/* Modal de Edición de Familia */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsEditModalOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative z-10 w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-premium p-6 flex flex-col gap-5 animate-scaleIn">
            <div>
              <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-1.5">
                <Edit2 size={18} className="text-indigo-600" />
                Editar Familia / Hogar
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Modifica el nombre del hogar o cambia el administrador principal.
              </p>
            </div>

            {editError && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-655 rounded-xl text-xs font-semibold flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditFamily} className="flex flex-col gap-4">
              {/* Nombre de la familia */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nombre de la Familia / Hogar *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Familia López"
                  value={updatedFamilyName}
                  onChange={(e) => setUpdatedFamilyName(e.target.value)}
                  className="w-full px-3 py-2.5 flat-input text-xs"
                  disabled={isSavingEdit}
                />
              </div>

              {/* Selector de Administrador Principal */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Administrador Principal *</label>
                <select
                  value={selectedAdminId}
                  onChange={(e) => {
                    const adminId = e.target.value;
                    setSelectedAdminId(adminId);
                    const selected = editingFamily?.allAdmins?.find(a => a.id === adminId);
                    setSelectedAdminEmail(selected ? selected.email : '');
                    setUpdatedAdminPassword('');
                  }}
                  className="w-full px-3 py-2.5 flat-input text-xs bg-white cursor-pointer"
                  disabled={isSavingEdit}
                >
                  {editingFamily?.allAdmins?.map(admin => (
                    <option key={admin.id} value={admin.id}>
                      {`${admin.first_name} ${admin.last_name || ''}`.trim()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Correo Electrónico */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  value={selectedAdminEmail}
                  onChange={(e) => setSelectedAdminEmail(e.target.value)}
                  className="w-full px-3 py-2.5 flat-input text-xs"
                  disabled={isSavingEdit}
                />
              </div>

              {/* Nueva Contraseña (Opcional) */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nueva Contraseña (Opcional)</label>
                <div className="relative">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    placeholder="Dejar en blanco para mantener actual"
                    value={updatedAdminPassword}
                    onChange={(e) => setUpdatedAdminPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2.5 flat-input text-xs"
                    disabled={isSavingEdit}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 touch-btn"
                  >
                    {showEditPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSavingEdit}
                  className="px-4 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all rounded-xl touch-btn"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 text-white bg-indigo-650 hover:bg-indigo-700 font-bold text-xs flex items-center gap-1.5 transition-all rounded-xl shadow-md shadow-indigo-500/10 disabled:opacity-55 disabled:cursor-not-allowed touch-btn"
                >
                  {isSavingEdit ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar Cambios</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
