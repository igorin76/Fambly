/**
 * Servicio para enviar notificaciones de correo electrónico a los administradores del hogar.
 */

// Obtener las variables de entorno para EmailJS si existen
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
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
  otherPendingTasks
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
De: HomeHub Sistema de Notificaciones <noreply@homehub.family>
Asunto: ⚠️ Tarea pendiente de confirmación: "${taskTitle}"

Hola ${adminName},

${creatorName} ha asignado una tarea en HomeHub que requiere tu aceptación:
- Tarea: "${taskTitle}"
- Fecha límite: ${dueDate || 'Sin fecha asignada'}
- Prioridad: ${priority || 'MEDIA'}

-----------------------------------------
📋 RECORDATORIO DE TUS TAREAS ACTIVAS PENDIENTES:
${otherPendingTasks || 'No tienes otras tareas pendientes.'}
-----------------------------------------

Por favor, entra en HomeHub para confirmar la tarea en tu panel de "Tareas por Aceptar".
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
      emailData: { adminEmail, adminName, taskTitle, creatorName, dueDate, priority, otherPendingTasks } 
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
          other_pending_tasks: otherPendingTasks || 'No tienes otras tareas pendientes.'
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
