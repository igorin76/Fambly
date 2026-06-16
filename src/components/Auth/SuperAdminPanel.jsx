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
  EyeOff
} from 'lucide-react';

export default function SuperAdminPanel() {
  const logout = useStore((state) => state.logout);
  const [families, setFamilies] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  // Estados Formulario
  const [familyName, setFamilyName] = useState('');
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar administradores de familias existentes
  const fetchFamilies = async () => {
    setIsLoadingList(true);
    try {
      // Obtener todos los miembros que son administradores (is_admin = true)
      // También traemos la información del workspace si existe
      const { data: members, error: membersError } = await supabase
        .from('members')
        .select('*')
        .eq('is_admin', true);

      if (membersError) throw membersError;

      // Obtener todos los workspaces para cruzar nombres
      const { data: workspaces, error: wsError } = await supabase
        .from('workspaces')
        .select('*');

      if (wsError) throw wsError;

      const wsMap = workspaces.reduce((acc, ws) => {
        acc[ws.id] = ws.name;
        return acc;
      }, {});

      const processedFamilies = members.map(m => ({
        id: m.id,
        adminName: `${m.first_name} ${m.last_name || ''}`.trim(),
        email: m.email,
        workspaceId: m.workspace_id,
        familyName: wsMap[m.workspace_id] || 'Hogar Sin Nombre',
        createdAt: m.created_at ? new Date(m.created_at).toLocaleDateString('es-ES') : 'Desconocida'
      }));

      // Filtrar al superadmin (que es virtual, pero por si acaso estuviese en la base de datos)
      setFamilies(processedFamilies.filter(f => f.email.toLowerCase() !== 'igorjimenez@gmail.com'));
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
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Home size={15} />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Familia López"
                      value={familyName}
                      onChange={(e) => setFamilyName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 flat-input text-xs"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 my-1 pt-3">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Administrador Principal</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nombre *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <User size={14} />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Ana"
                        value={adminFirstName}
                        onChange={(e) => setAdminFirstName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 flat-input text-xs"
                        disabled={isSubmitting}
                      />
                    </div>
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
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Mail size={15} />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="ejemplo@correo.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 flat-input text-xs"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contraseña de Acceso *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Lock size={15} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Mínimo 4 caracteres"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 flat-input text-xs"
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
                          <td className="py-3.5 text-right pr-2">
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
    </div>
  );
}
