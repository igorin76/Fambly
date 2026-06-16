/**
 * Servicio para enviar notificaciones de correo electrónico a los administradores del hogar.
 */

// Obtener las variables de entorno para EmailJS si existen
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_RECOVERY_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_RECOVERY_TEMPLATE_ID || import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

/**
 * Envía un correo de notificación a un administrador sobre una tarea pendiente de aceptar.
 */
export async function sendPendingTaskNotification({
  adminEmail,
  adminName,
  taskTitle,
  creatorName,
  dueDate,
  priority,
  otherPendingTasks,
  taskDescription,
  taskAssignees,
  taskAttachments,
  taskCategory
}) {
  if (!adminEmail) {
    console.warn("[emailService] No admin email provided, skipping notification.");
    return { success: false, reason: 'no_email' };
  }

  // 1. Simulación si no están configuradas las variables de entorno
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    const logMsg = `
=========================================
[SIMULACIÓN DE NOTIFICACIÓN POR EMAIL]
Para: ${adminName} <${adminEmail}>
De: Fambly Sistema de Notificaciones <noreply@fambly.family>
Asunto: ⚠️ Tarea pendiente de confirmación: "${taskTitle}"

Hola ${adminName},

${creatorName} ha asignado una tarea en Fambly que requiere tu aceptación:
- Tarea: "${taskTitle}"
- Categoría: "${taskCategory || 'GENERAL'}"
- Descripción: "${taskDescription || 'Sin descripción.'}"
- Miembros asignados: ${taskAssignees || 'Todos'}
- Fecha límite: ${dueDate || 'Sin fecha asignada'}
- Prioridad: ${priority || 'MEDIA'}

📎 ADJUNTOS DE LA TAREA:
${taskAttachments || 'Ninguno'}

-----------------------------------------
📋 RECORDATORIO DE TUS TAREAS ACTIVAS PENDIENTES:
${otherPendingTasks || 'No tienes otras tareas pendientes.'}
-----------------------------------------

Por favor, entra en Fambly para confirmar la tarea en tu panel de "Tareas por Aceptar".
=========================================
`;
    console.log(logMsg);
    
    // Crear un evento personalizado para mostrar un aviso visual en la aplicación
    const event = new CustomEvent('email-simulated', {
      detail: { adminEmail, adminName, taskTitle, creatorName, dueDate, priority }
    });
    window.dispatchEvent(event);

    return { 
      success: true, 
      simulated: true, 
      emailData: { adminEmail, adminName, taskTitle, creatorName, dueDate, priority, otherPendingTasks, taskDescription, taskAssignees, taskAttachments, taskCategory } 
    };
  }

  // 2. Envío real con EmailJS REST API
  try {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: adminEmail,
          to_name: adminName,
          task_title: taskTitle,
          creator_name: creatorName,
          due_date: dueDate || 'Sin fecha asignada',
          priority: priority || 'MEDIA',
          other_pending_tasks: otherPendingTasks || 'No tienes otras tareas pendientes.',
          task_description: taskDescription || 'Sin descripción.',
          task_assignees: taskAssignees || 'Todos',
          task_attachments: taskAttachments || 'Ninguno',
          task_category: taskCategory || 'GENERAL'
        }
      })
    });

    if (response.ok) {
      console.log(`[emailService] Correo real enviado con éxito a ${adminEmail}`);
      
      const event = new CustomEvent('email-sent', {
        detail: { adminEmail, adminName, taskTitle, creatorName }
      });
      window.dispatchEvent(event);

      return { success: true };
    } else {
      const errorText = await response.text();
      console.error(`[emailService] Error al enviar correo con EmailJS: ${errorText}`);
      
      const event = new CustomEvent('email-error', {
        detail: { adminEmail, error: errorText }
      });
      window.dispatchEvent(event);

      return { success: false, reason: errorText };
    }
  } catch (error) {
    console.error(`[emailService] Excepción enviando correo con EmailJS:`, error);
    
    const event = new CustomEvent('email-error', {
      detail: { adminEmail, error: error.message }
    });
    window.dispatchEvent(event);

    return { success: false, reason: error.message };
  }
}

/**
 * Envía un correo electrónico con el código de recuperación de contraseña.
 */
export async function sendPasswordRecoveryEmail({ adminEmail, adminName, recoveryCode }) {
  if (!adminEmail) {
    console.warn("[emailService] No admin email provided, skipping password recovery.");
    return { success: false, reason: 'no_email' };
  }

  // 1. Simulación si no están configuradas las variables de entorno
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    const logMsg = `
=========================================
[SIMULACIÓN DE RECUPERACIÓN DE CONTRASEÑA]
Para: ${adminName} <${adminEmail}>
De: Fambly Soporte <support@fambly.family>
Asunto: Código de recuperación de contraseña: ${recoveryCode}

Hola ${adminName},

Has solicitado restablecer tu contraseña en Fambly.
Tu código de verificación de 6 dígitos es:

🔑 ${recoveryCode}

Este código expira en 15 minutos y es de un solo uso.
=========================================
`;
    console.log(logMsg);
    
    // Crear un evento personalizado para mostrar un aviso visual en la aplicación
    const event = new CustomEvent('email-simulated', {
      detail: { 
        adminEmail, 
        adminName, 
        taskTitle: `Restablecer Contraseña (CÓDIGO: ${recoveryCode})`, 
        creatorName: 'Sistema de Seguridad'
      }
    });
    window.dispatchEvent(event);

    return { success: true, simulated: true };
  }

  // 2. Envío real con EmailJS REST API
  try {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_RECOVERY_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: adminEmail,
          to_name: adminName,
          // Si reutiliza la plantilla de tareas, vaciamos campos para que no vengan "demasiadas cosas" y solo aparezca el código
          task_title: recoveryCode,
          creator_name: '',
          task_description: `Código: ${recoveryCode}`,
          due_date: '',
          priority: '',
          other_pending_tasks: '',
          // Campos directos por si el usuario configura una plantilla limpia dedicada
          recovery_code: recoveryCode,
          code: recoveryCode
        }
      })
    });

    if (response.ok) {
      console.log(`[emailService] Correo de recuperación enviado con éxito a ${adminEmail}`);
      
      const event = new CustomEvent('email-sent', {
        detail: { adminEmail, adminName, taskTitle: 'Código de recuperación', creatorName: 'Seguridad' }
      });
      window.dispatchEvent(event);

      return { success: true };
    } else {
      const errorText = await response.text();
      console.error(`[emailService] Error al enviar correo de recuperación con EmailJS: ${errorText}`);
      
      const event = new CustomEvent('email-error', {
        detail: { adminEmail, error: errorText }
      });
      window.dispatchEvent(event);

      return { success: false, reason: errorText };
    }
  } catch (error) {
    console.error(`[emailService] Excepción enviando correo de recuperación con EmailJS:`, error);
    
    const event = new CustomEvent('email-error', {
      detail: { adminEmail, error: error.message }
    });
    window.dispatchEvent(event);

    return { success: false, reason: error.message };
  }
}

