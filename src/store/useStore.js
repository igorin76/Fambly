import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../utils/supabaseClient';
import { sendPendingTaskNotification, sendPasswordRecoveryEmail } from '../utils/emailService';
import bcrypt from 'bcryptjs';

// Arrays de datos semilla vacíos
const initialTasks = [];
const initialEvents = [];
const initialShoppingItems = [];
const initialClothingLogistics = [];
const initialBudgets = [];
const initialReceipts = [];
const initialProcedures = [];
const initialMembers = [];
const initialWishlist = [];
const initialAnnouncements = [];
const initialRewards = [];
const initialWishlistCategories = [];
const initialTaskCategories = [];

const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  return url && url !== 'https://placeholder-project.supabase.co' && !url.includes('placeholder');
};

export const useStore = create(
  persist(
    (set, get) => ({
      currentUser: '',
      setCurrentUser: (user) => set({ currentUser: user }),
      focusedTaskId: null,
      setFocusedTaskId: (id) => set({ focusedTaskId: id }),

      // ═══ SISTEMA DE AUTENTICACIÓN ═══
      isAuthenticated: false,
      isSuperAdmin: false,
      authenticatedMemberId: null,
      currentWorkspaceId: 'ws-default-1',

      login: async (email, password, isSuperAdminMode = false) => {
        // 1. Caso especial: Superadministrador global en Supabase o fallback local (solo si isSuperAdminMode es verdadero)
        if (isSuperAdminMode) {
          if (isSupabaseConfigured()) {
            try {
              const { data: superAdmin, error: superError } = await supabase
                .from('superadmins')
                .select('*')
                .eq('email', email.trim().toLowerCase())
                .maybeSingle();

              if (!superError && superAdmin) {
                const isValid = await bcrypt.compare(password, superAdmin.password_hash);
                if (!isValid) {
                  throw new Error('Contraseña incorrecta.');
                }
                set({
                  isAuthenticated: true,
                  isSuperAdmin: true,
                  currentUser: 'Superadmin',
                  authenticatedMemberId: 'superadmin',
                  currentWorkspaceId: 'ws-system'
                });
                return { id: 'superadmin', firstName: 'Superadmin', isAdmin: true, isSuperAdmin: true, email: superAdmin.email };
              } else {
                throw new Error('No se encontró ninguna cuenta de superadministrador con ese correo electrónico.');
              }
            } catch (err) {
              if (err.message === 'Contraseña incorrecta.' || err.message.includes('superadministrador')) {
                throw err;
              }
              console.error("Error al autenticar superadmin:", err);
              throw new Error('Error al conectar con la base de datos de superadministración.');
            }
          } else {
            // Fallback local/offline para desarrollo
            if (email.toLowerCase() === 'igorjimenez@gmail.com' && password === 'R@ssini76') {
              set({
                isAuthenticated: true,
                isSuperAdmin: true,
                currentUser: 'Superadmin',
                authenticatedMemberId: 'superadmin',
                currentWorkspaceId: 'ws-system'
              });
              return { id: 'superadmin', firstName: 'Superadmin', isAdmin: true, isSuperAdmin: true };
            }
            throw new Error('Credenciales de superadministrador local incorrectas.');
          }
        }

        // 2. Administradores de familias
        if (isSupabaseConfigured()) {
          const { data: admin, error } = await supabase
            .from('members')
            .select('*')
            .eq('email', email.trim())
            .eq('is_admin', true)
            .maybeSingle();

          if (error) {
            console.error("Error al buscar administrador:", error);
            throw new Error('Error al conectar con la base de datos.');
          }

          if (!admin) {
            throw new Error('No se encontró ningún administrador con ese correo electrónico.');
          }

          const passwordHash = admin.password_hash || '';

          if (!passwordHash || passwordHash === '') {
            // Si no tiene hash, aceptar "12345" por defecto la primera vez
            if (password === '12345') {
              const hash = await bcrypt.hash('12345', 10);
              await supabase.from('members').update({ password_hash: hash }).eq('id', admin.id);
              
              set({
                isAuthenticated: true,
                isSuperAdmin: false,
                authenticatedMemberId: admin.id,
                currentWorkspaceId: admin.workspace_id || 'ws-default-1',
                currentUser: admin.first_name,
              });
              
              // Cargar todos los datos de la familia específica
              await get().fetchInitialData(admin.workspace_id || 'ws-default-1');
              return admin;
            }
            throw new Error('Contraseña incorrecta.');
          }

          const isValid = await bcrypt.compare(password, passwordHash);
          if (!isValid) {
            throw new Error('Contraseña incorrecta.');
          }

          set({
            isAuthenticated: true,
            isSuperAdmin: false,
            authenticatedMemberId: admin.id,
            currentWorkspaceId: admin.workspace_id || 'ws-default-1',
            currentUser: admin.first_name,
          });

          // Cargar todos los datos de la familia específica
          await get().fetchInitialData(admin.workspace_id || 'ws-default-1');
          return admin;
        } else {
          // Fallback desarrollo local / offline
          const members = get().members;
          const admin = members.find(
            (m) => m.isAdmin && m.email && m.email.toLowerCase() === email.toLowerCase()
          );
          if (!admin) {
            throw new Error('No se encontró ningún administrador con ese correo electrónico.');
          }
          if (password === '12345') {
            set({
              isAuthenticated: true,
              isSuperAdmin: false,
              authenticatedMemberId: admin.id,
              currentWorkspaceId: admin.workspaceId || 'ws-default-1',
              currentUser: admin.firstName,
            });
            return admin;
          }
          throw new Error('Contraseña incorrecta.');
        }
      },

      logout: () => {
        set({
          isAuthenticated: false,
          isSuperAdmin: false,
          authenticatedMemberId: null,
          currentUser: '',
          currentWorkspaceId: 'ws-default-1'
        });
        get().resetToDefaultData();
      },

      verifyAdminPassword: async (memberId, password) => {
        const members = get().members;
        const admin = members.find((m) => m.id === memberId);
        if (!admin || !admin.isAdmin) {
          throw new Error('Miembro no encontrado o no es administrador.');
        }
        if (!admin.passwordHash || admin.passwordHash === '') {
          return password === '12345';
        }
        return await bcrypt.compare(password, admin.passwordHash);
      },

      changePassword: async (memberId, oldPassword, newPassword) => {
        const members = get().members;
        const admin = members.find((m) => m.id === memberId);
        if (!admin || !admin.isAdmin) {
          throw new Error('Miembro no encontrado o no es administrador.');
        }
        let isOldValid = false;
        if (!admin.passwordHash || admin.passwordHash === '') {
          isOldValid = oldPassword === '12345';
        } else {
          isOldValid = await bcrypt.compare(oldPassword, admin.passwordHash);
        }
        if (!isOldValid) {
          throw new Error('La contraseña actual es incorrecta.');
        }
        const newHash = await bcrypt.hash(newPassword, 10);
        set((state) => ({
          members: state.members.map((m) =>
            m.id === memberId ? { ...m, passwordHash: newHash } : m
          ),
        }));
        if (isSupabaseConfigured()) {
          await supabase.from('members').update({ password_hash: newHash }).eq('id', memberId);
        }
      },

      resetAdminPassword: async (adminMemberId) => {
        const defaultHash = await bcrypt.hash('12345', 10);
        set((state) => ({
          members: state.members.map((m) =>
            m.id === adminMemberId ? { ...m, passwordHash: defaultHash } : m
          ),
        }));
        if (isSupabaseConfigured()) {
          await supabase.from('members').update({ password_hash: defaultHash }).eq('id', adminMemberId);
        }
      },

      requestPasswordRecovery: async (email, isSuperAdminMode = false) => {
        if (!email || email.trim() === '') {
          throw new Error('El correo electrónico es obligatorio.');
        }

        if (isSupabaseConfigured()) {
          if (isSuperAdminMode) {
            // Buscar en superadmins
            const { data: superAdmin, error: superError } = await supabase
              .from('superadmins')
              .select('*')
              .eq('email', email.trim().toLowerCase())
              .maybeSingle();

            if (superError) throw superError;
            if (!superAdmin) {
              throw new Error('No se encontró ninguna cuenta de superadministrador con ese correo electrónico.');
            }

            // Generar código de 6 dígitos
            const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

            // Guardar en la tabla superadmins
            const { error: updateError } = await supabase
              .from('superadmins')
              .update({
                reset_token: recoveryCode,
                reset_token_expires_at: expiresAt
              })
              .eq('id', superAdmin.id);

            if (updateError) throw updateError;

            // Enviar email
            await sendPasswordRecoveryEmail({
              adminEmail: superAdmin.email,
              adminName: 'Superadministrador',
              recoveryCode: recoveryCode
            });

            return true;
          } else {
            // Buscar miembro administrador con este correo si no es superadmin
            const { data: member, error } = await supabase
              .from('members')
              .select('*')
              .eq('email', email.trim().toLowerCase())
              .eq('is_admin', true)
              .maybeSingle();

            if (error) throw error;
            if (!member) {
              throw new Error('No se encontró ningún administrador con ese correo electrónico.');
            }

            // Generar código de 6 dígitos
            const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutos

            // Guardar en base de datos
            const { error: updateError } = await supabase
              .from('members')
              .update({
                reset_token: recoveryCode,
                reset_token_expires_at: expiresAt
              })
              .eq('id', member.id);

            if (updateError) throw updateError;

            // Enviar email
            await sendPasswordRecoveryEmail({
              adminEmail: member.email,
              adminName: member.first_name,
              recoveryCode: recoveryCode
            });

            return true;
          }
        } else {
          // Modo local/desarrollo para superadmin o miembros
          if (isSuperAdminMode) {
            if (email.trim().toLowerCase() === 'igorjimenez@gmail.com') {
              const recoveryCode = '123456';
              console.log(`[LOCAL SUPERADMIN RECOVERY CODE]: ${recoveryCode}`);
              await sendPasswordRecoveryEmail({
                adminEmail: 'igorjimenez@gmail.com',
                adminName: 'Superadministrador',
                recoveryCode: recoveryCode
              });
              return true;
            }
            throw new Error('No se encontró ningún superadministrador local con ese correo.');
          } else {
            const members = get().members;
            const member = members.find(m => m.isAdmin && m.email && m.email.toLowerCase() === email.trim().toLowerCase());
            if (!member) {
              throw new Error('No se encontró ningún administrador con ese correo electrónico.');
            }
            const recoveryCode = '123456';
            console.log(`[LOCAL RECOVERY CODE] para ${member.firstName}: ${recoveryCode}`);
            await sendPasswordRecoveryEmail({
              adminEmail: member.email || 'correo@prueba.com',
              adminName: member.firstName,
              recoveryCode: recoveryCode
            });
            return true;
          }
        }
      },

      verifyRecoveryCode: async (email, code, isSuperAdminMode = false) => {
        if (!email || !code) {
          throw new Error('El correo y el código son obligatorios.');
        }

        if (isSupabaseConfigured()) {
          if (isSuperAdminMode) {
            // Buscar en superadmins
            const { data: superAdmin, error: superError } = await supabase
              .from('superadmins')
              .select('*')
              .eq('email', email.trim().toLowerCase())
              .eq('reset_token', code.trim())
              .maybeSingle();

            if (superError) throw superError;
            if (!superAdmin) {
              throw new Error('El código de verificación es incorrecto.');
            }

            const expiry = new Date(superAdmin.reset_token_expires_at);
            if (expiry < new Date()) {
              throw new Error('El código de verificación ha expirado.');
            }
            return true;
          } else {
            // Buscar en members
            const { data: member, error } = await supabase
              .from('members')
              .select('*')
              .eq('email', email.trim().toLowerCase())
              .eq('is_admin', true)
              .eq('reset_token', code.trim())
              .maybeSingle();

            if (error) throw error;
            if (!member) {
              throw new Error('El código de verificación es incorrecto.');
            }

            const expiry = new Date(member.reset_token_expires_at);
            if (expiry < new Date()) {
              throw new Error('El código de verificación ha expirado.');
            }

            return true;
          }
        } else {
          if (code.trim() === '123456') {
            return true;
          }
          throw new Error('El código de verificación es incorrecto.');
        }
      },

      resetPasswordWithCode: async (email, code, newPassword, isSuperAdminMode = false) => {
        if (!email || !code || !newPassword) {
          throw new Error('Todos los campos son obligatorios.');
        }

        if (newPassword.length < 4) {
          throw new Error('La contraseña debe tener al menos 4 caracteres.');
        }

        // Validar el código primero
        await get().verifyRecoveryCode(email, code, isSuperAdminMode);

        const newHash = await bcrypt.hash(newPassword, 10);

        if (isSupabaseConfigured()) {
          if (isSuperAdminMode) {
            // Buscar en superadmins
            const { data: superAdmin, error: superError } = await supabase
              .from('superadmins')
              .select('id')
              .eq('email', email.trim().toLowerCase())
              .maybeSingle();

            if (superError) throw superError;
            if (!superAdmin) {
              throw new Error('No se encontró la cuenta de superadministrador.');
            }

            const { error: updateError } = await supabase
              .from('superadmins')
              .update({
                password_hash: newHash,
                reset_token: null,
                reset_token_expires_at: null
              })
              .eq('id', superAdmin.id);

            if (updateError) throw updateError;
            return true; // Éxito con el superadmin
          } else {
            // Buscar en members
            const { data: member, error } = await supabase
              .from('members')
              .select('id')
              .eq('email', email.trim().toLowerCase())
              .eq('is_admin', true)
              .maybeSingle();

            if (error) throw error;
            if (!member) {
              throw new Error('No se encontró la cuenta del administrador.');
            }

            const { error: updateError } = await supabase
              .from('members')
              .update({
                password_hash: newHash,
                reset_token: null,
                reset_token_expires_at: null
              })
              .eq('id', member.id);

            if (updateError) throw updateError;
          }
        } else {
          // Modo local/desarrollo
          if (isSuperAdminMode) {
            console.log(`[LOCAL SUPERADMIN PASSWORD RESET SUCCESS]`);
          }
        }

        // Actualizar el estado local (para miembros familiares)
        if (!isSuperAdminMode) {
          set((state) => ({
            members: state.members.map((m) =>
              m.email && m.email.toLowerCase() === email.trim().toLowerCase()
                ? { ...m, passwordHash: newHash }
                : m
            )
          }));
        }

        return true;
      },

      tasks: initialTasks,
      events: initialEvents,
      shoppingItems: initialShoppingItems,
      clothingLogistics: initialClothingLogistics,
      budgets: initialBudgets,
      receipts: initialReceipts,
      procedures: initialProcedures,
      members: initialMembers,
      wishlist: initialWishlist,
      announcements: initialAnnouncements,
      rewards: initialRewards,
      wishlistCategories: initialWishlistCategories,
      taskCategories: initialTaskCategories,
      familyRoles: [],

      fetchInitialData: async (workspaceIdInput) => {
        const workspaceId = workspaceIdInput || get().currentWorkspaceId || 'ws-default-1';
        if (!isSupabaseConfigured()) return;
        try {
          const [
            { data: dbTasks, error: errTasks },
            { data: dbEvents, error: errEvents },
            { data: dbShopping, error: errShopping },
            { data: dbMembers, error: errMembers },
            { data: dbBudgets, error: errBudgets },
            { data: dbReceipts, error: errReceipts },
            { data: dbProcedures, error: errProcedures },
            { data: dbWishlist, error: errWishlist },
            { data: dbAnnouncements, error: errAnnouncements },
            { data: dbRewards, error: errRewards },
            { data: dbWishlistCategories, error: errWishlistCategories },
            { data: dbRoles, error: errRoles },
            { data: dbTaskCategories, error: errTaskCategories }
          ] = await Promise.all([
            supabase.from('tasks').select('*').eq('workspace_id', workspaceId),
            supabase.from('events').select('*').eq('workspace_id', workspaceId),
            supabase.from('shopping_items').select('*').eq('workspace_id', workspaceId),
            supabase.from('members').select('*').eq('workspace_id', workspaceId),
            supabase.from('budgets').select('*').eq('workspace_id', workspaceId),
            supabase.from('receipts').select('*').eq('workspace_id', workspaceId),
            supabase.from('procedures').select('*').eq('workspace_id', workspaceId),
            supabase.from('wishlist').select('*').eq('workspace_id', workspaceId),
            supabase.from('announcements').select('*').eq('workspace_id', workspaceId),
            supabase.from('rewards').select('*').eq('workspace_id', workspaceId),
            supabase.from('wishlist_categories').select('*').eq('workspace_id', workspaceId),
            supabase.from('family_roles').select('*').eq('workspace_id', workspaceId),
            supabase.from('task_categories').select('*').eq('workspace_id', workspaceId)
          ]);

          if (errTasks) console.error("Error fetching tasks:", errTasks);
          if (errEvents) console.error("Error fetching events:", errEvents);
          if (errShopping) console.error("Error fetching shopping items:", errShopping);
          if (errMembers) console.error("Error fetching members:", errMembers);
          if (errBudgets) console.error("Error fetching budgets:", errBudgets);
          if (errReceipts) console.error("Error fetching receipts:", errReceipts);
          if (errProcedures) console.error("Error fetching procedures:", errProcedures);
          if (errWishlist) console.error("Error fetching wishlist:", errWishlist);
          if (errAnnouncements) console.error("Error fetching announcements:", errAnnouncements);
          if (errRewards) console.error("Error fetching rewards:", errRewards);
          if (errWishlistCategories) console.error("Error fetching wishlist categories:", errWishlistCategories);
          if (errRoles) console.error("Error fetching family roles:", errRoles);
          if (errTaskCategories) console.error("Error fetching task categories:", errTaskCategories);

          let finalTaskCategories = dbTaskCategories;
          if (isSupabaseConfigured() && (!finalTaskCategories || finalTaskCategories.length === 0)) {
            const defaultCats = [
              { id: `tcat-gen-${Date.now()}-1`, workspace_id: workspaceId, name: 'GENERAL' },
              { id: `tcat-col-${Date.now()}-2`, workspace_id: workspaceId, name: 'COLEGIO' },
              { id: `tcat-tra-${Date.now()}-3`, workspace_id: workspaceId, name: 'TRABAJO' },
              { id: `tcat-trm-${Date.now()}-4`, workspace_id: workspaceId, name: 'TRÁMITES' },
              { id: `tcat-cum-${Date.now()}-5`, workspace_id: workspaceId, name: 'CUMPLEAÑOS' },
              { id: `tcat-reg-${Date.now()}-6`, workspace_id: workspaceId, name: 'REGALOS' },
              { id: `tcat-sal-${Date.now()}-7`, workspace_id: workspaceId, name: 'SALUD' }
            ];
            const { error: errInsert } = await supabase.from('task_categories').insert(defaultCats);
            if (!errInsert) {
              finalTaskCategories = defaultCats;
            } else {
              console.error("Error seeding default task categories:", errInsert);
            }
          }

          set({
            tasks: dbTasks ? dbTasks.map(t => {
              const attachments = t.attachments || [];
              const creatorMeta = attachments.find(att => att.type === 'metadata_creator');
              const createdById = creatorMeta ? creatorMeta.createdById : null;
              const cleanAttachments = attachments.filter(att => att.type !== 'metadata_creator');
              
              return {
                id: t.id,
                title: t.title,
                description: t.description,
                scope: t.scope,
                assignee: t.assignee || 'Todos',
                children: t.children || [],
                dueDate: t.due_date,
                completed: t.completed,
                createdAt: t.created_at ? t.created_at.split('T')[0] : null,
                workspaceId: t.workspace_id || 'ws-default-1',
                category: t.category || 'GENERAL',
                priority: t.priority || 'MEDIA',
                assignedMemberIds: t.assigned_member_ids || [],
                isAccepted: t.is_accepted !== false,
                attachments: cleanAttachments,
                createdById: createdById,
                completedSuccessfully: t.completed_successfully !== false,
                completedAt: t.completed_at || null,
                rewardPoints: t.reward_points !== null ? t.reward_points : 10
              };
            }) : get().tasks,

            events: dbEvents ? dbEvents.map(e => ({
              id: e.id,
              title: e.title,
              date: e.date,
              type: e.type,
              target: e.target,
              description: e.description,
              attachments: e.attachments || []
            })) : get().events,

            shoppingItems: dbShopping ? dbShopping.map(i => ({
              id: i.id,
              name: i.name,
              category: i.category,
              completed: i.completed
            })) : get().shoppingItems,

            members: dbMembers ? dbMembers.map(m => ({
              id: m.id,
              workspaceId: m.workspace_id,
              firstName: m.first_name,
              lastName: m.last_name || '',
              gender: m.gender || 'M',
              birthDate: m.birth_date,
              role: m.role,
              confidentialInfo: m.confidential_info || '',
              shoeSize: m.shoe_size || '',
              shirtSize: m.shirt_size || '',
              pantsSize: m.pants_size || '',
              allergies: m.allergies || [],
              bloodType: m.blood_type || '',
              dietaryRestrictions: m.dietary_restrictions || [],
              points: m.points || 0,
              neededItems: m.needed_items || '',
              isAdmin: m.is_admin === true,
              associatedMemberIds: m.associated_member_ids || [],
              email: m.email || '',
              passwordHash: m.password_hash || '',
              isScoringSubject: m.is_scoring_subject === true
            })) : get().members,

            clothingLogistics: dbMembers ? dbMembers.filter(m => m.role === 'Hijo' || m.role === 'Hija').map(m => ({
              id: m.id,
              childName: m.first_name,
              currentSize: `Zapato: ${m.shoe_size || '-'} / Camisa: ${m.shirt_size || '-'} / Pantalón: ${m.pants_size || '-'}`,
              neededItems: m.needed_items || ''
            })) : get().clothingLogistics,

            budgets: dbBudgets ? dbBudgets.map(b => ({
              id: b.id,
              category: b.category,
              limit: Number(b.limit_amount),
              spent: Number(b.spent)
            })) : get().budgets,

            receipts: dbReceipts ? dbReceipts.map(r => ({
              id: r.id,
              name: r.name,
              amount: Number(r.amount),
              period: r.period,
              nextDueDate: r.next_due_date,
              paid: r.paid
            })) : get().receipts,

            procedures: dbProcedures ? dbProcedures.map(p => ({
              id: p.id,
              name: p.name,
              owner: p.owner,
              expiryDate: p.expiry_date,
              completed: p.completed,
              notes: p.notes
            })) : get().procedures,

            wishlist: dbWishlist ? dbWishlist.map(w => ({
              id: w.id,
              workspaceId: w.workspace_id,
              memberId: w.member_id,
              memberIds: w.member_ids || (w.member_id ? [w.member_id] : []),
              title: w.title,
              url: w.url,
              price: Number(w.price || 0),
              photoUrl: w.photo_url,
              category: w.category || '',
              hideFromTarget: w.hide_from_target || false,
              createdBy: w.created_by
            })) : get().wishlist,

            wishlistCategories: dbWishlistCategories ? dbWishlistCategories.map(c => ({
              id: c.id,
              workspaceId: c.workspace_id,
              name: c.name
            })) : get().wishlistCategories,

            taskCategories: finalTaskCategories ? finalTaskCategories.map(c => ({
              id: c.id,
              workspaceId: c.workspace_id,
              name: c.name
            })) : [
              { id: 'default-general', name: 'GENERAL' },
              { id: 'default-colegio', name: 'COLEGIO' },
              { id: 'default-trabajo', name: 'TRABAJO' },
              { id: 'default-tramites', name: 'TRÁMITES' },
              { id: 'default-cumpleanos', name: 'CUMPLEAÑOS' },
              { id: 'default-regalos', name: 'REGALOS' },
              { id: 'default-salud', name: 'SALUD' }
            ],

            announcements: dbAnnouncements ? dbAnnouncements.map(a => ({
              id: a.id,
              workspaceId: a.workspace_id,
              title: a.title,
              description: a.description || '',
              contentType: a.content_type,
              fileUrl: a.file_url,
              textContent: a.text_content,
              isEmergency: a.is_emergency,
              attachments: a.attachments || []
            })) : get().announcements,

            rewards: dbRewards ? dbRewards.map(rew => ({
              id: rew.id,
              workspaceId: rew.workspace_id,
              title: rew.title,
              pointsRequired: rew.points_required
            })) : get().rewards,

            familyRoles: dbRoles && dbRoles.length > 0 ? dbRoles.map(r => ({
              id: r.id,
              name: r.name
            })) : [
              { id: 'role-padre', name: 'Padre' },
              { id: 'role-madre', name: 'Madre' },
              { id: 'role-hijo', name: 'Hijo' },
              { id: 'role-hija', name: 'Hija' },
              { id: 'role-abuelo', name: 'Abuelo' },
              { id: 'role-abuela', name: 'Abuela' },
              { id: 'role-mascota', name: 'Mascota' }
            ]
          });
        } catch (e) {
          console.error("Error al sincronizar con Supabase al iniciar. Usando datos locales.", e);
        }
      },

      // --- MUTACIONES DE MIEMBROS ---
      addMember: async (member) => {
        const newMember = {
          ...member,
          id: `mem-${Date.now()}`,
          workspaceId: get().currentWorkspaceId || 'ws-default-1',
          points: 0,
          neededItems: '',
          shoeSize: member.shoeSize || '',
          shirtSize: member.shirtSize || '',
          pantsSize: member.pantsSize || '',
          allergies: member.allergies || [],
          bloodType: member.bloodType || '',
          dietaryRestrictions: member.dietaryRestrictions || [],
          isAdmin: member.isAdmin || false,
          associatedMemberIds: member.associatedMemberIds || [],
          email: member.email || '',
          isScoringSubject: member.isScoringSubject || false
        };
        set((state) => {
          const updatedMembers = [...state.members, newMember];
          const updatedLogistics = updatedMembers.filter(m => m.role === 'Hijo' || m.role === 'Hija').map(m => ({
            id: m.id,
            childName: m.firstName,
            currentSize: `Zapato: ${m.shoeSize || '-'} / Camisa: ${m.shirtSize || '-'} / Pantalón: ${m.pantsSize || '-'}`,
            neededItems: m.neededItems || ''
          }));
          return { members: updatedMembers, clothingLogistics: updatedLogistics };
        });

        if (isSupabaseConfigured()) {
          await supabase.from('members').insert({
            id: newMember.id,
            workspace_id: newMember.workspaceId,
            first_name: newMember.firstName,
            last_name: newMember.lastName || '',
            gender: newMember.gender || 'M',
            birth_date: newMember.birthDate || null,
            role: newMember.role,
            confidential_info: newMember.confidentialInfo || '',
            shoe_size: newMember.shoeSize || '',
            shirt_size: newMember.shirtSize || '',
            pants_size: newMember.pantsSize || '',
            allergies: newMember.allergies || [],
            blood_type: newMember.bloodType || '',
            dietary_restrictions: newMember.dietaryRestrictions || [],
            points: newMember.points || 0,
            needed_items: '',
            is_admin: newMember.isAdmin || false,
            associated_member_ids: newMember.associatedMemberIds || [],
            email: newMember.email || '',
            password_hash: newMember.passwordHash || '',
            is_scoring_subject: newMember.isScoringSubject || false
          });
        }
      },

      updateMember: async (id, updatedFields) => {
        set((state) => {
          const updatedMembers = state.members.map((m) => (m.id === id ? { ...m, ...updatedFields } : m));
          const updatedLogistics = updatedMembers.filter(m => m.role === 'Hijo' || m.role === 'Hija').map(m => ({
            id: m.id,
            childName: m.firstName,
            currentSize: `Zapato: ${m.shoeSize || '-'} / Camisa: ${m.shirtSize || '-'} / Pantalón: ${m.pantsSize || '-'}`,
            neededItems: m.neededItems || ''
          }));
          return { members: updatedMembers, clothingLogistics: updatedLogistics };
        });

        if (isSupabaseConfigured()) {
          const updatePayload = {};
          if (updatedFields.firstName !== undefined) updatePayload.first_name = updatedFields.firstName;
          if (updatedFields.lastName !== undefined) updatePayload.last_name = updatedFields.lastName;
          if (updatedFields.gender !== undefined) updatePayload.gender = updatedFields.gender;
          if (updatedFields.birthDate !== undefined) updatePayload.birth_date = updatedFields.birthDate;
          if (updatedFields.role !== undefined) updatePayload.role = updatedFields.role;
          if (updatedFields.confidentialInfo !== undefined) updatePayload.confidential_info = updatedFields.confidentialInfo;
          if (updatedFields.shoeSize !== undefined) updatePayload.shoe_size = updatedFields.shoeSize;
          if (updatedFields.shirtSize !== undefined) updatePayload.shirt_size = updatedFields.shirtSize;
          if (updatedFields.pantsSize !== undefined) updatePayload.pants_size = updatedFields.pantsSize;
          if (updatedFields.allergies !== undefined) updatePayload.allergies = updatedFields.allergies;
          if (updatedFields.bloodType !== undefined) updatePayload.blood_type = updatedFields.bloodType;
          if (updatedFields.dietaryRestrictions !== undefined) updatePayload.dietary_restrictions = updatedFields.dietaryRestrictions;
          if (updatedFields.points !== undefined) updatePayload.points = updatedFields.points;
          if (updatedFields.neededItems !== undefined) updatePayload.needed_items = updatedFields.neededItems;
          if (updatedFields.isAdmin !== undefined) updatePayload.is_admin = updatedFields.isAdmin;
          if (updatedFields.associatedMemberIds !== undefined) updatePayload.associated_member_ids = updatedFields.associatedMemberIds;
          if (updatedFields.email !== undefined) updatePayload.email = updatedFields.email;
          if (updatedFields.passwordHash !== undefined) updatePayload.password_hash = updatedFields.passwordHash;
          if (updatedFields.isScoringSubject !== undefined) updatePayload.is_scoring_subject = updatedFields.isScoringSubject;

          await supabase.from('members').update(updatePayload).eq('id', id);
        }
      },

      deleteMember: async (id) => {
        set((state) => {
          const updatedMembers = state.members.filter((m) => m.id !== id);
          const updatedLogistics = updatedMembers.filter(m => m.role === 'Hijo' || m.role === 'Hija').map(m => ({
            id: m.id,
            childName: m.firstName,
            currentSize: `Zapato: ${m.shoeSize || '-'} / Camisa: ${m.shirtSize || '-'} / Pantalón: ${m.pantsSize || '-'}`,
            neededItems: m.neededItems || ''
          }));
          return { members: updatedMembers, clothingLogistics: updatedLogistics };
        });

        if (isSupabaseConfigured()) {
          await supabase.from('members').delete().eq('id', id);
        }
      },

      // --- MUTACIONES DE TAREAS ---
      addTask: async (task) => {
        const activeUser = get().currentUser;
        const membersList = get().members;
        const activeMember = membersList.find(m => m.firstName.toLowerCase() === activeUser.toLowerCase());
        const isCreatorAdmin = activeMember ? activeMember.isAdmin : false;
        
        let defaultAccepted = true;
        if (isCreatorAdmin && task.assignedMemberIds) {
          // Obtener los IDs de otros administradores
          const otherAdminIds = membersList.filter(m => m.isAdmin && m.id !== activeMember?.id).map(m => m.id);
          // Si asigna a otro administrador, requiere aceptación
          const assignsOtherAdmin = task.assignedMemberIds.some(id => otherAdminIds.includes(id));
          
          if (assignsOtherAdmin) {
            defaultAccepted = false;
          }
        }

        // Crear el objeto metadata_creator para Supabase
        const creatorMeta = {
          id: `meta-creator-${Date.now()}`,
          type: 'metadata_creator',
          createdById: activeMember ? activeMember.id : null,
          createdByName: activeMember ? activeMember.firstName : 'Sistema'
        };

        const newTask = {
          ...task,
          id: `task-${Date.now()}`,
          completed: false,
          completedSuccessfully: true,
          completedAt: null,
          createdAt: new Date().toISOString().split('T')[0],
          workspaceId: get().currentWorkspaceId || 'ws-default-1',
          category: task.category || 'GENERAL',
          priority: task.priority || 'MEDIA',
          assignedMemberIds: task.assignedMemberIds || [],
          isAccepted: defaultAccepted,
          createdById: activeMember ? activeMember.id : null,
          attachments: [...(task.attachments || []), creatorMeta],
          assignee: task.assignee || 'Todos',
          children: task.children || [],
          rewardPoints: task.rewardPoints !== undefined ? Number(task.rewardPoints) : 10
        };
        
        // Estado local con attachments limpios
        const localTask = {
          ...newTask,
          attachments: (task.attachments || []).filter(att => att.type !== 'metadata_creator')
        };

        set((state) => ({ tasks: [...state.tasks, localTask] }));

        if (isSupabaseConfigured()) {
          try {
            const { error } = await supabase.from('tasks').insert({
              id: newTask.id,
              title: newTask.title,
              description: newTask.description,
              scope: newTask.scope,
              assignee: newTask.assignee,
              children: newTask.children,
              due_date: newTask.dueDate || null,
              completed: newTask.completed,
              completed_successfully: true,
              completed_at: null,
              workspace_id: newTask.workspaceId,
              category: newTask.category,
              priority: newTask.priority,
              assigned_member_ids: newTask.assignedMemberIds,
              is_accepted: newTask.isAccepted,
              attachments: newTask.attachments,
              reward_points: newTask.rewardPoints
            });
            if (error) {
              console.error("[Supabase Error] Error inserting task:", error);
            }
          } catch (err) {
            console.error("[Supabase Exception] Error inserting task:", err);
          }
        }

        // Notificar por email a los administradores correspondientes si la tarea requiere confirmación (no está aceptada)
        if (!newTask.isAccepted) {
          const assignedAdmins = membersList.filter(m => 
            m.isAdmin && 
            newTask.assignedMemberIds.includes(m.id) && 
            m.id !== (activeMember ? activeMember.id : null)
          );
          
          assignedAdmins.forEach(admin => {
            if (admin.email) {
              // Obtener otras tareas pendientes activas del administrador
              const adminTasks = get().tasks.filter(t => 
                t.assignedMemberIds && 
                t.assignedMemberIds.includes(admin.id) && 
                !t.completed &&
                t.id !== newTask.id
              );
              
              const otherTasksText = adminTasks.length > 0 
                ? adminTasks.map(t => `- ${t.title}${t.dueDate ? ` (Límite: ${t.dueDate})` : ''} [Prioridad: ${t.priority}]`).join('\n')
                : 'No tienes otras tareas pendientes.';

              const taskDescription = newTask.description || 'Sin descripción.';

              const taskAssignees = newTask.assignedMemberIds && newTask.assignedMemberIds.length > 0
                ? newTask.assignedMemberIds.map(id => membersList.find(m => m.id === id)?.firstName || '').filter(Boolean).join(', ')
                : 'Todos';

              const taskAttachments = newTask.attachments && newTask.attachments.length > 0
                ? newTask.attachments.filter(att => att.type !== 'metadata_creator').map((att, idx) => {
                    const type = att.type || 'adjunto';
                    const label = att.label || att.fileName || `Archivo ${idx + 1}`;
                    if (type === 'text') {
                      return `- [Nota]: "${att.textContent || ''}"`;
                    } else if (type === 'url') {
                      return `- [Enlace]: ${label} (${att.fileUrl || att.url || ''})`;
                    } else {
                      const typeStr = type === 'image' ? 'Imagen' : type === 'document' ? 'Documento' : type === 'voice' ? 'Nota de voz' : 'Archivo';
                      const isBase64 = att.fileUrl && att.fileUrl.startsWith('data:');
                      const urlDisplay = isBase64 ? 'Cargado en App' : (att.fileUrl || 'Sin enlace');
                      return `- [${typeStr}]: ${label} (${urlDisplay})`;
                    }
                  }).join('\n')
                : 'Ninguno';

              sendPendingTaskNotification({
                adminEmail: admin.email,
                adminName: admin.firstName,
                taskTitle: newTask.title,
                creatorName: activeMember ? activeMember.firstName : 'Sistema',
                dueDate: newTask.dueDate,
                priority: newTask.priority,
                otherPendingTasks: otherTasksText,
                taskDescription,
                taskAssignees,
                taskAttachments,
                taskCategory: newTask.category || 'GENERAL'
              });
            }
          });
        }
      },

      updateTask: async (taskId, updatedTask) => {
        const activeUser = get().currentUser;
        const membersList = get().members;
        const activeMember = membersList.find(m => m.firstName.toLowerCase() === activeUser.toLowerCase());
        const isCreatorAdmin = activeMember ? activeMember.isAdmin : false;
        
        const oldTask = get().tasks.find(t => t.id === taskId);
        const oldAssigned = oldTask ? oldTask.assignedMemberIds || [] : [];
        
        // Conservamos o inferimos el creador original de la tarea
        const finalCreatedById = oldTask ? oldTask.createdById : (activeMember ? activeMember.id : null);
        const finalCreatedByName = oldTask ? oldTask.createdByName : (activeMember ? activeMember.firstName : 'Sistema');

        let finalAccepted = updatedTask.isAccepted;

        if (finalAccepted === undefined && isCreatorAdmin && updatedTask.assignedMemberIds) {
          const newAssigned = updatedTask.assignedMemberIds;
          
          // Verificar si ha cambiado la asignación
          const assignmentsChanged = JSON.stringify([...oldAssigned].sort()) !== JSON.stringify([...newAssigned].sort());
          
          if (assignmentsChanged) {
            const otherAdminIds = membersList.filter(m => m.isAdmin && m.id !== activeMember?.id).map(m => m.id);
            const assignsOtherAdmin = newAssigned.some(id => otherAdminIds.includes(id));
            
            if (assignsOtherAdmin) {
              finalAccepted = false;
            } else {
              // Si ya no se asigna a otro administrador, se puede activar
              finalAccepted = true;
            }
          } else {
            // Si no ha cambiado la asignación, mantenemos el valor actual
            finalAccepted = oldTask ? oldTask.isAccepted : true;
          }
        }

        // Si finalAccepted se ha definido, lo agregamos a la tarea
        const mergedTask = { ...updatedTask };
        if (finalAccepted !== undefined) {
          mergedTask.isAccepted = finalAccepted;
        }

        // Almacenamos localmente en Zustand con attachments limpios
        const cleanAttachments = (mergedTask.attachments || oldTask?.attachments || []).filter(att => att.type !== 'metadata_creator');
        const localMergedTask = {
          ...mergedTask,
          createdById: finalCreatedById,
          attachments: cleanAttachments
        };

        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === taskId ? { ...task, ...localMergedTask } : task))
        }));

        if (isSupabaseConfigured()) {
          try {
            // Inyectamos el metadato del creador en attachments para Supabase
            const creatorMeta = {
              id: `meta-creator-${Date.now()}`,
              type: 'metadata_creator',
              createdById: finalCreatedById,
              createdByName: finalCreatedByName
            };
            const attachmentsToSave = [...cleanAttachments, creatorMeta];

            const updatePayload = {
              title: mergedTask.title,
              description: mergedTask.description,
              scope: mergedTask.scope,
              assignee: mergedTask.assignee || 'Todos',
              children: mergedTask.children || [],
              due_date: mergedTask.dueDate || null,
              completed: mergedTask.completed
            };

            if (mergedTask.category !== undefined) updatePayload.category = mergedTask.category;
            if (mergedTask.priority !== undefined) updatePayload.priority = mergedTask.priority;
            if (mergedTask.assignedMemberIds !== undefined) updatePayload.assigned_member_ids = mergedTask.assignedMemberIds;
            if (mergedTask.isAccepted !== undefined) updatePayload.is_accepted = mergedTask.isAccepted;
            updatePayload.attachments = attachmentsToSave;
            if (mergedTask.completedSuccessfully !== undefined) updatePayload.completed_successfully = mergedTask.completedSuccessfully;
            if (mergedTask.completedAt !== undefined) updatePayload.completed_at = mergedTask.completedAt;
            if (mergedTask.rewardPoints !== undefined) updatePayload.reward_points = Number(mergedTask.rewardPoints);

            const { error } = await supabase.from('tasks').update(updatePayload).eq('id', taskId);
            if (error) {
              console.error("[Supabase Error] Error updating task:", error);
            }
          } catch (err) {
            console.error("[Supabase Exception] Error updating task:", err);
          }
        }

        // Notificar por email a los administradores si la tarea pasa a requerir confirmación
        const wasAcceptedBefore = oldTask ? oldTask.isAccepted !== false : true;
        const isAcceptedNow = localMergedTask.isAccepted !== false;
        
        if (!isAcceptedNow) {
          const oldAssigned = oldTask ? oldTask.assignedMemberIds || [] : [];
          const newAssigned = localMergedTask.assignedMemberIds || oldAssigned;
          
          const newAssignedAdmins = membersList.filter(m => 
            m.isAdmin && 
            newAssigned.includes(m.id) && 
            m.id !== (activeMember ? activeMember.id : null) &&
            (wasAcceptedBefore || !oldAssigned.includes(m.id))
          );

          newAssignedAdmins.forEach(admin => {
            if (admin.email) {
              // Obtener otras tareas pendientes activas del administrador
              const adminTasks = get().tasks.filter(t => 
                t.assignedMemberIds && 
                t.assignedMemberIds.includes(admin.id) && 
                !t.completed &&
                t.id !== taskId
              );
              
              const otherTasksText = adminTasks.length > 0 
                ? adminTasks.map(t => `- ${t.title}${t.dueDate ? ` (Límite: ${t.dueDate})` : ''} [Prioridad: ${t.priority}]`).join('\n')
                : 'No tienes otras tareas pendientes.';

              const taskDescription = localMergedTask.description || oldTask?.description || 'Sin descripción.';

              const newAssignedList = localMergedTask.assignedMemberIds || oldTask?.assignedMemberIds || [];
              const taskAssignees = newAssignedList.length > 0
                ? newAssignedList.map(id => membersList.find(m => m.id === id)?.firstName || '').filter(Boolean).join(', ')
                : 'Todos';

              const finalAtts = localMergedTask.attachments || oldTask?.attachments || [];
              const taskAttachments = finalAtts.length > 0
                ? finalAtts.filter(att => att.type !== 'metadata_creator').map((att, idx) => {
                    const type = att.type || 'adjunto';
                    const label = att.label || att.fileName || `Archivo ${idx + 1}`;
                    if (type === 'text') {
                      return `- [Nota]: "${att.textContent || ''}"`;
                    } else if (type === 'url') {
                      return `- [Enlace]: ${label} (${att.fileUrl || att.url || ''})`;
                    } else {
                      const typeStr = type === 'image' ? 'Imagen' : type === 'document' ? 'Documento' : type === 'voice' ? 'Nota de voz' : 'Archivo';
                      const isBase64 = att.fileUrl && att.fileUrl.startsWith('data:');
                      const urlDisplay = isBase64 ? 'Cargado en App' : (att.fileUrl || 'Sin enlace');
                      return `- [${typeStr}]: ${label} (${urlDisplay})`;
                    }
                  }).join('\n')
                : 'Ninguno';

              sendPendingTaskNotification({
                adminEmail: admin.email,
                adminName: admin.firstName,
                taskTitle: localMergedTask.title || oldTask?.title || '',
                creatorName: activeMember ? activeMember.firstName : 'Sistema',
                dueDate: localMergedTask.dueDate || oldTask?.dueDate,
                priority: localMergedTask.priority || oldTask?.priority,
                otherPendingTasks: otherTasksText,
                taskDescription,
                taskAssignees,
                taskAttachments,
                taskCategory: localMergedTask.category || oldTask?.category || 'GENERAL'
              });
            }
          });
        }
      },

      deleteTask: async (taskId) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId)
        }));

        if (isSupabaseConfigured()) {
          try {
            const { error } = await supabase.from('tasks').delete().eq('id', taskId);
            if (error) console.error("[Supabase Error] Error deleting task:", error);
          } catch (err) {
            console.error("[Supabase Exception] Error deleting task:", err);
          }
        }
      },

      toggleTaskCompleted: async (taskId, completedSuccessfully = true, isUndoing = false) => {
        let isCompleted = false;
        let finalCompletedSuccessfully = true;
        let finalCompletedAt = null;
        let taskRef = null;
        
        set((state) => {
          const updated = state.tasks.map((task) => {
            if (task.id === taskId) {
              if (isUndoing) {
                isCompleted = false;
                finalCompletedSuccessfully = true;
                finalCompletedAt = null;
              } else {
                isCompleted = true;
                finalCompletedSuccessfully = completedSuccessfully;
                finalCompletedAt = new Date().toISOString();
              }
              taskRef = { 
                ...task, 
                completed: isCompleted,
                completedSuccessfully: finalCompletedSuccessfully,
                completedAt: finalCompletedAt
              };
              return taskRef;
            }
            return task;
          });
          return { tasks: updated };
        });

        if (isSupabaseConfigured()) {
          await supabase.from('tasks').update({ 
            completed: isCompleted,
            completed_successfully: finalCompletedSuccessfully,
            completed_at: finalCompletedAt
          }).eq('id', taskId);
          
          // GAMIFICACIÓN: Si la tarea se completó exitosamente, sumarle puntos a los miembros asignados sujetos a puntuación!
          if (isCompleted && finalCompletedSuccessfully && taskRef && taskRef.assignedMemberIds) {
            const scoringMembers = get().members.filter(m => m.isScoringSubject && taskRef.assignedMemberIds.includes(m.id));
            const pts = taskRef.rewardPoints !== undefined ? Number(taskRef.rewardPoints) : 10;
            if (pts > 0) {
              for (const m of scoringMembers) {
                await get().awardPoints(m.id, pts);
              }
            }
          }
        }
      },

      acceptTask: async (taskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, isAccepted: true } : task
          )
        }));

        if (isSupabaseConfigured()) {
          try {
            const { error } = await supabase.from('tasks').update({ is_accepted: true }).eq('id', taskId);
            if (error) console.error("[Supabase Error] Error accepting task:", error);
          } catch (err) {
            console.error("[Supabase Exception] Error accepting task:", err);
          }
        }
      },

      // --- MUTACIONES DE EVENTOS ---
      addEvent: async (eventOrEvents) => {
        const eventsArray = Array.isArray(eventOrEvents) ? eventOrEvents : [eventOrEvents];
        const newEvents = eventsArray.map((evt, idx) => ({
          ...evt,
          id: evt.id || `evt-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
          title: evt.title,
          date: evt.date,
          type: evt.type,
          target: evt.target,
          description: evt.description || '',
          attachments: evt.attachments || []
        }));

        set((state) => ({ events: [...state.events, ...newEvents] }));

        if (isSupabaseConfigured()) {
          const payload = newEvents.map(e => ({
            id: e.id,
            title: e.title,
            date: e.date,
            type: e.type,
            target: e.target,
            description: e.description || '',
            attachments: e.attachments,
            workspace_id: get().currentWorkspaceId || 'ws-default-1'
          }));
          await supabase.from('events').insert(payload);
        }
      },

      updateEvent: async (eventId, updatedEvent) => {
        set((state) => ({
          events: state.events.map((evt) => (evt.id === eventId ? { ...evt, ...updatedEvent } : evt))
        }));

        if (isSupabaseConfigured()) {
          const updatePayload = {};
          if (updatedEvent.title !== undefined) updatePayload.title = updatedEvent.title;
          if (updatedEvent.date !== undefined) updatePayload.date = updatedEvent.date;
          if (updatedEvent.type !== undefined) updatePayload.type = updatedEvent.type;
          if (updatedEvent.target !== undefined) updatePayload.target = updatedEvent.target;
          if (updatedEvent.description !== undefined) updatePayload.description = updatedEvent.description;
          if (updatedEvent.attachments !== undefined) updatePayload.attachments = updatedEvent.attachments;

          await supabase.from('events').update(updatePayload).eq('id', eventId);
        }
      },

      deleteEvent: async (eventId, deleteAllRecurrences = false) => {
        const isRecurrent = typeof eventId === 'string' && eventId.startsWith('evt-rec-');
        
        if (isRecurrent && deleteAllRecurrences) {
          const parts = eventId.split('-');
          const groupPrefix = parts.slice(0, 3).join('-'); // 'evt-rec-timestamp'
          
          set((state) => ({
            events: state.events.filter((evt) => !evt.id.startsWith(groupPrefix))
          }));

          if (isSupabaseConfigured()) {
            await supabase.from('events').delete().like('id', `${groupPrefix}%`);
          }
        } else {
          set((state) => ({
            events: state.events.filter((evt) => evt.id !== eventId)
          }));

          if (isSupabaseConfigured()) {
            await supabase.from('events').delete().eq('id', eventId);
          }
        }
      },

      // --- MUTACIONES DE COMPRA ---
      addShoppingItem: async (name, category) => {
        const newItem = { id: `shop-${Date.now()}`, name, category, completed: false };
        set((state) => ({ shoppingItems: [...state.shoppingItems, newItem] }));

        if (isSupabaseConfigured()) {
          await supabase.from('shopping_items').insert({
            id: newItem.id,
            name: newItem.name,
            category: newItem.category,
            completed: newItem.completed,
            workspace_id: get().currentWorkspaceId || 'ws-default-1'
          });
        }
      },

      toggleShoppingItem: async (itemId) => {
        let isCompleted = false;
        set((state) => {
          const updated = state.shoppingItems.map((item) => {
            if (item.id === itemId) {
              isCompleted = !item.completed;
              return { ...item, completed: isCompleted };
            }
            return item;
          });
          return { shoppingItems: updated };
        });

        if (isSupabaseConfigured()) {
          await supabase.from('shopping_items').update({ completed: isCompleted }).eq('id', itemId);
        }
      },

      deleteShoppingItem: async (itemId) => {
        set((state) => ({
          shoppingItems: state.shoppingItems.filter((item) => item.id !== itemId)
        }));

        if (isSupabaseConfigured()) {
          await supabase.from('shopping_items').delete().eq('id', itemId);
        }
      },

      clearCompletedShoppingItems: async () => {
        const completedIds = get().shoppingItems.filter(item => item.completed).map(item => item.id);
        set((state) => ({
          shoppingItems: state.shoppingItems.filter((item) => !item.completed)
        }));

        if (isSupabaseConfigured() && completedIds.length > 0) {
          await supabase.from('shopping_items').delete().in('id', completedIds);
        }
      },

      toggleAllShoppingItems: async (completed) => {
        const items = get().shoppingItems;
        set(() => ({
          shoppingItems: items.map(item => ({ ...item, completed }))
        }));

        if (isSupabaseConfigured() && items.length > 0) {
          const ids = items.map(item => item.id);
          await supabase.from('shopping_items').update({ completed }).in('id', ids);
        }
      },

      toggleCategoryShoppingItems: async (category, completed) => {
        const items = get().shoppingItems;
        set(() => ({
          shoppingItems: items.map(item => 
            item.category === category ? { ...item, completed } : item
          )
        }));

        if (isSupabaseConfigured()) {
          const categoryItems = items.filter(item => item.category === category);
          if (categoryItems.length > 0) {
            const ids = categoryItems.map(item => item.id);
            await supabase.from('shopping_items').update({ completed }).in('id', ids);
          }
        }
      },

      // --- LOGÍSTICA ROPA ---
      updateClothingLogistics: async (id, currentSize, neededItems) => {
        set((state) => ({
          clothingLogistics: state.clothingLogistics.map((cloth) =>
            cloth.id === id ? { ...cloth, currentSize, neededItems } : cloth
          ),
          members: state.members.map((m) =>
            m.id === id ? { ...m, neededItems } : m
          )
        }));

        if (isSupabaseConfigured()) {
          await supabase.from('members').update({
            needed_items: neededItems
          }).eq('id', id);
        }
      },

      // --- PRESUPUESTOS ---
      updateBudgetSpent: async (budgetId, amount) => {
        set((state) => ({
          budgets: state.budgets.map((b) => (b.id === budgetId ? { ...b, spent: amount } : b))
        }));

        if (isSupabaseConfigured()) {
          await supabase.from('budgets').update({ spent: amount }).eq('id', budgetId);
        }
      },

      addBudgetItem: async (category, limit) => {
        const newBudget = { id: `bud-${Date.now()}`, category, limit, spent: 0 };
        set((state) => ({ budgets: [...state.budgets, newBudget] }));

        if (isSupabaseConfigured()) {
          await supabase.from('budgets').insert({
            id: newBudget.id,
            category: newBudget.category,
            limit_amount: newBudget.limit,
            spent: newBudget.spent,
            workspace_id: get().currentWorkspaceId || 'ws-default-1'
          });
        }
      },

      deleteBudgetItem: async (budgetId) => {
        set((state) => ({
          budgets: state.budgets.filter((b) => b.id !== budgetId)
        }));

        if (isSupabaseConfigured()) {
          await supabase.from('budgets').delete().eq('id', budgetId);
        }
      },

      // --- RECIBOS ---
      toggleReceiptPaid: async (receiptId) => {
        let isPaid = false;
        set((state) => {
          const updated = state.receipts.map((r) => {
            if (r.id === receiptId) {
              isPaid = !r.paid;
              return { ...r, paid: isPaid };
            }
            return r;
          });
          return { receipts: updated };
        });

        if (isSupabaseConfigured()) {
          await supabase.from('receipts').update({ paid: isPaid }).eq('id', receiptId);
        }
      },

      addReceipt: async (receipt) => {
        const newReceipt = { ...receipt, id: `rec-${Date.now()}`, paid: false };
        set((state) => ({ receipts: [...state.receipts, newReceipt] }));

        if (isSupabaseConfigured()) {
          await supabase.from('receipts').insert({
            id: newReceipt.id,
            name: newReceipt.name,
            amount: newReceipt.amount,
            period: newReceipt.period,
            next_due_date: newReceipt.nextDueDate,
            paid: newReceipt.paid,
            workspace_id: get().currentWorkspaceId || 'ws-default-1'
          });
        }
      },

      deleteReceipt: async (receiptId) => {
        set((state) => ({
          receipts: state.receipts.filter((r) => r.id !== receiptId)
        }));

        if (isSupabaseConfigured()) {
          await supabase.from('receipts').delete().eq('id', receiptId);
        }
      },

      // --- TRÁMITES ---
      toggleProcedureCompleted: async (procId) => {
        let isCompleted = false;
        set((state) => {
          const updated = state.procedures.map((p) => {
            if (p.id === procId) {
              isCompleted = !p.completed;
              return { ...p, completed: isCompleted };
            }
            return p;
          });
          return { procedures: updated };
        });

        if (isSupabaseConfigured()) {
          await supabase.from('procedures').update({ completed: isCompleted }).eq('id', procId);
        }
      },

      addProcedure: async (procedure) => {
        const newProc = { ...procedure, id: `proc-${Date.now()}`, completed: false };
        set((state) => ({ procedures: [...state.procedures, newProc] }));

        if (isSupabaseConfigured()) {
          await supabase.from('procedures').insert({
            id: newProc.id,
            name: newProc.name,
            owner: newProc.owner,
            expiry_date: newProc.expiryDate,
            completed: newProc.completed,
            notes: newProc.notes,
            workspace_id: get().currentWorkspaceId || 'ws-default-1'
          });
        }
      },

      deleteProcedure: async (procId) => {
        set((state) => ({
          procedures: state.procedures.filter((p) => p.id !== procId)
        }));

        if (isSupabaseConfigured()) {
          await supabase.from('procedures').delete().eq('id', procId);
        }
      },

      // --- WISHLIST ---
      addWishlistItem: async (item) => {
        const newItem = {
          ...item,
          id: `wish-${Date.now()}`,
          workspaceId: get().currentWorkspaceId || 'ws-default-1'
        };
        set((state) => ({ wishlist: [...state.wishlist, newItem] }));

        if (isSupabaseConfigured()) {
          const { error } = await supabase.from('wishlist').insert({
            id: newItem.id,
            workspace_id: newItem.workspaceId,
            member_id: newItem.memberId || null,
            member_ids: newItem.memberIds || [],
            title: newItem.title,
            url: newItem.url || '',
            price: Number(newItem.price || 0),
            photo_url: newItem.photoUrl || '',
            category: newItem.category || null,
            hide_from_target: newItem.hideFromTarget || false,
            created_by: newItem.createdBy || null
          });
          if (error) {
            console.error("Error inserting wishlist item into Supabase:", error);
          }
        }
      },

      deleteWishlistItem: async (id) => {
        set((state) => ({
          wishlist: state.wishlist.filter((item) => item.id !== id)
        }));

        if (isSupabaseConfigured()) {
          const { error } = await supabase.from('wishlist').delete().eq('id', id);
          if (error) {
            console.error("Error deleting wishlist item from Supabase:", error);
          }
        }
      },

      updateWishlistItem: async (id, updatedFields) => {
        set((state) => ({
          wishlist: state.wishlist.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
        }));

        if (isSupabaseConfigured()) {
          const updatePayload = {};
          if (updatedFields.title !== undefined) updatePayload.title = updatedFields.title;
          if (updatedFields.url !== undefined) updatePayload.url = updatedFields.url;
          if (updatedFields.price !== undefined) updatePayload.price = Number(updatedFields.price || 0);
          if (updatedFields.photoUrl !== undefined) updatePayload.photo_url = updatedFields.photoUrl;
          if (updatedFields.category !== undefined) updatePayload.category = updatedFields.category || null;
          if (updatedFields.memberIds !== undefined) updatePayload.member_ids = updatedFields.memberIds;
          if (updatedFields.hideFromTarget !== undefined) updatePayload.hide_from_target = updatedFields.hideFromTarget;
          if (updatedFields.createdBy !== undefined) updatePayload.created_by = updatedFields.createdBy;

          const { error } = await supabase.from('wishlist').update(updatePayload).eq('id', id);
          if (error) {
            console.error("Error updating wishlist item in Supabase:", error);
          }
        }
      },

      addWishlistCategory: async (name) => {
        const newCat = {
          id: `cat-${Date.now()}`,
          workspaceId: get().currentWorkspaceId || 'ws-default-1',
          name: name.trim()
        };
        set((state) => ({ wishlistCategories: [...(state.wishlistCategories || []), newCat] }));

        if (isSupabaseConfigured()) {
          const { error } = await supabase.from('wishlist_categories').insert({
            id: newCat.id,
            workspace_id: newCat.workspaceId,
            name: newCat.name
          });
          if (error) {
            console.error("Error adding wishlist category to Supabase:", error);
          }
        }
      },

      deleteWishlistCategory: async (id) => {
        let categoryName = '';
        set((state) => {
          const cat = state.wishlistCategories.find(c => c.id === id);
          if (cat) categoryName = cat.name;
          
          const updatedCategories = (state.wishlistCategories || []).filter(c => c.id !== id);
          const updatedWishlist = state.wishlist.map(item => 
            item.category === categoryName ? { ...item, category: '' } : item
          );
          
          return {
            wishlistCategories: updatedCategories,
            wishlist: updatedWishlist
          };
        });

        if (isSupabaseConfigured()) {
          const { error: errorCat } = await supabase.from('wishlist_categories').delete().eq('id', id);
          if (errorCat) {
            console.error("Error deleting wishlist category from Supabase:", errorCat);
          }
          
          if (categoryName) {
            const { error: errorWish } = await supabase.from('wishlist').update({ category: null }).eq('category', categoryName);
            if (errorWish) {
              console.error("Error clearing category from wishlist items in Supabase:", errorWish);
            }
          }
        }
      },

      addTaskCategory: async (name) => {
        const newCat = {
          id: `tcat-${Date.now()}`,
          workspaceId: get().currentWorkspaceId || 'ws-default-1',
          name: name.trim().toUpperCase()
        };
        set((state) => ({ taskCategories: [...(state.taskCategories || []), newCat] }));

        if (isSupabaseConfigured()) {
          const { error } = await supabase.from('task_categories').insert({
            id: newCat.id,
            workspace_id: newCat.workspaceId,
            name: newCat.name
          });
          if (error) {
            console.error("Error adding task category to Supabase:", error);
          }
        }
      },

      deleteTaskCategory: async (id) => {
        let categoryName = '';
        set((state) => {
          const cat = state.taskCategories.find(c => c.id === id);
          if (cat) categoryName = cat.name;

          const updatedCategories = (state.taskCategories || []).filter(c => c.id !== id);
          const updatedTasks = state.tasks.map(task => 
            task.category === categoryName ? { ...task, category: 'GENERAL' } : task
          );

          return {
            taskCategories: updatedCategories,
            tasks: updatedTasks
          };
        });

        if (isSupabaseConfigured()) {
          const { error: errorCat } = await supabase.from('task_categories').delete().eq('id', id);
          if (errorCat) {
            console.error("Error deleting task category from Supabase:", errorCat);
          }

          if (categoryName) {
            const { error: errorTasks } = await supabase
              .from('tasks')
              .update({ category: 'GENERAL' })
              .eq('category', categoryName)
              .eq('workspace_id', get().currentWorkspaceId);
            if (errorTasks) {
              console.error("Error clearing category from tasks in Supabase:", errorTasks);
            }
          }
        }
      },

      // --- ANNOUNCEMENTS (TABLÓN) ---
      addAnnouncement: async (ann) => {
        const newAnn = {
          ...ann,
          id: `ann-${Date.now()}`,
          workspaceId: get().currentWorkspaceId || 'ws-default-1',
          attachments: ann.attachments || []
        };
        set((state) => ({ announcements: [...state.announcements, newAnn] }));

        if (isSupabaseConfigured()) {
          const firstAtt = newAnn.attachments && newAnn.attachments[0];
          const legacyType = firstAtt ? firstAtt.type : 'text';
          const legacyFileUrl = firstAtt ? (firstAtt.fileUrl || '') : '';
          const legacyTextContent = firstAtt ? (firstAtt.textContent || '') : '';

          const { error } = await supabase.from('announcements').insert({
            id: newAnn.id,
            workspace_id: newAnn.workspaceId,
            title: newAnn.title,
            description: newAnn.description || '',
            content_type: legacyType,
            file_url: legacyFileUrl,
            text_content: legacyTextContent,
            is_emergency: newAnn.isEmergency || false,
            attachments: newAnn.attachments || []
          });
          if (error) {
            console.error("Error inserting announcement into Supabase:", error);
          }
        }
      },

      deleteAnnouncement: async (id) => {
        set((state) => ({
          announcements: state.announcements.filter((a) => a.id !== id)
        }));

        if (isSupabaseConfigured()) {
          const { error } = await supabase.from('announcements').delete().eq('id', id);
          if (error) {
            console.error("Error deleting announcement from Supabase:", error);
          }
        }
      },

      updateAnnouncement: async (id, data) => {
        set((state) => ({
          announcements: state.announcements.map((a) =>
            a.id === id ? { ...a, ...data } : a
          )
        }));

        if (isSupabaseConfigured()) {
          const firstAtt = data.attachments && data.attachments[0];
          const legacyType = firstAtt ? firstAtt.type : 'text';
          const legacyFileUrl = firstAtt ? (firstAtt.fileUrl || '') : '';
          const legacyTextContent = firstAtt ? (firstAtt.textContent || '') : '';

          const { error } = await supabase.from('announcements').update({
            title: data.title,
            description: data.description || '',
            content_type: legacyType,
            file_url: legacyFileUrl,
            text_content: legacyTextContent,
            is_emergency: data.isEmergency || false,
            attachments: data.attachments || []
          }).eq('id', id);
          if (error) {
            console.error("Error updating announcement in Supabase:", error);
          }
        }
      },

      // --- REWARDS (GAMIFICACIÓN) ---
      addReward: async (rew) => {
        const newRew = {
          ...rew,
          id: `rew-${Date.now()}`,
          workspaceId: get().currentWorkspaceId || 'ws-default-1'
        };
        set((state) => ({ rewards: [...state.rewards, newRew] }));

        if (isSupabaseConfigured()) {
          await supabase.from('rewards').insert({
            id: newRew.id,
            workspace_id: newRew.workspaceId,
            title: newRew.title,
            points_required: newRew.pointsRequired
          });
        }
      },

      deleteReward: async (id) => {
        set((state) => ({
          rewards: state.rewards.filter((r) => r.id !== id)
        }));

        if (isSupabaseConfigured()) {
          await supabase.from('rewards').delete().eq('id', id);
        }
      },

      redeemReward: async (memberId, rewardId, pointsRequired) => {
        set((state) => {
          const updatedMembers = state.members.map((m) => {
            if (m.id === memberId) {
              return { ...m, points: Math.max(0, m.points - pointsRequired) };
            }
            return m;
          });
          return { members: updatedMembers };
        });

        if (isSupabaseConfigured()) {
          const { data } = await supabase.from('members').select('points').eq('id', memberId).single();
          if (data) {
            const newPoints = Math.max(0, (data.points || 0) - pointsRequired);
            await supabase.from('members').update({ points: newPoints }).eq('id', memberId);
          }
        }
      },

      awardPoints: async (memberId, amount) => {
        set((state) => {
          const updatedMembers = state.members.map((m) => {
            if (m.id === memberId) {
              return { ...m, points: (m.points || 0) + amount };
            }
            return m;
          });
          return { members: updatedMembers };
        });

        if (isSupabaseConfigured()) {
          const { data } = await supabase.from('members').select('points').eq('id', memberId).single();
          if (data) {
            const newPoints = (data.points || 0) + amount;
            await supabase.from('members').update({ points: newPoints }).eq('id', memberId);
          }
        }
      },

      addFamilyRole: async (name) => {
        const newRole = {
          id: `role-${Date.now()}`,
          name: name.trim()
        };
        set((state) => ({ familyRoles: [...state.familyRoles, newRole] }));

        if (isSupabaseConfigured()) {
          await supabase.from('family_roles').insert({
            id: newRole.id,
            workspace_id: get().currentWorkspaceId || 'ws-default-1',
            name: newRole.name
          });
        }
      },

      deleteFamilyRole: async (id) => {
        set((state) => ({ familyRoles: state.familyRoles.filter(r => r.id !== id) }));

        if (isSupabaseConfigured()) {
          await supabase.from('family_roles').delete().eq('id', id);
        }
      },

      resetToDefaultData: () => set({
        tasks: initialTasks,
        events: initialEvents,
        shoppingItems: initialShoppingItems,
        clothingLogistics: initialClothingLogistics,
        budgets: initialBudgets,
        receipts: initialReceipts,
        procedures: initialProcedures,
        members: initialMembers,
        wishlist: initialWishlist,
        announcements: initialAnnouncements,
        rewards: initialRewards,
        wishlistCategories: initialWishlistCategories,
        taskCategories: initialTaskCategories,
        familyRoles: []
      })
    }),
    {
      name: 'homehub-storage-v2',
    }
  )
);
