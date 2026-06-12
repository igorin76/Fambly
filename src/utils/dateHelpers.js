/**
 * Calcula el estado temporal de una tarea en tiempo real.
 * @param {string} dueDate - Fecha límite en formato YYYY-MM-DD
 * @param {boolean} completed - Si la tarea está completada
 * @returns {'completada' | 'caducada' | 'urgente' | 'pendiente'}
 */
export const getTaskStatus = (dueDate, completed) => {
  if (completed) return 'completada';
  if (!dueDate) return 'pendiente';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const [year, month, day] = dueDate.split('-').map(Number);
  const due = new Date(year, month - 1, day);
  
  const diffTime = due - today;
  // Usamos Math.floor o Math.ceil dependiendo de la diferencia de días exactos
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return 'caducada';
  } else if (diffDays <= 2) {
    return 'urgente'; // Faltan 48 horas o menos (0, 1 o 2 días)
  } else {
    return 'pendiente';
  }
};

/**
 * Calcula los días que faltan para un cumpleaños u otro evento anual recurrente.
 * @param {string} dateString - Fecha del evento en formato YYYY-MM-DD (o MM-DD)
 * @returns {number} - Días restantes
 */
export const getDaysUntilBirthday = (dateString) => {
  if (!dateString) return 999;
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const parts = dateString.split('-');
  let month, day;
  
  if (parts.length === 3) {
    // Formato YYYY-MM-DD
    month = Number(parts[1]);
    day = Number(parts[2]);
  } else if (parts.length === 2) {
    // Formato MM-DD
    month = Number(parts[0]);
    day = Number(parts[1]);
  } else {
    return 999;
  }
  
  // Crear el cumpleaños para el año actual
  let nextBday = new Date(today.getFullYear(), month - 1, day);
  
  // Si ya pasó este año, calcular para el año que viene
  if (nextBday < today) {
    nextBday.setFullYear(today.getFullYear() + 1);
  }
  
  const diffTime = nextBday - today;
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Formatea una fecha de YYYY-MM-DD a un formato legible en español (ej. "25 de May")
 * @param {string} dateString 
 * @returns {string}
 */
export const formatDateSpanish = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];
  return `${day} de ${months[month - 1]}`;
};

/**
 * Devuelve un saludo contextual según la hora actual del día.
 * @returns {{ text: string, emoji: string }}
 */
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 13) return { text: 'Buenos días', emoji: '☀️' };
  if (hour >= 13 && hour < 20) return { text: 'Buenas tardes', emoji: '🌤️' };
  return { text: 'Buenas noches', emoji: '🌙' };
};

/**
 * Formatea una fecha Date a formato largo en español: "Jueves, 12 de Junio de 2026"
 * @param {Date} [date] - Fecha a formatear (por defecto: hoy)
 * @returns {string}
 */
export const formatDateLong = (date = new Date()) => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
};

/**
 * Comprueba si una fecha en formato YYYY-MM-DD corresponde al día de hoy.
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {boolean}
 */
export const isToday = (dateString) => {
  if (!dateString) return false;
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return dateString === today;
};

/**
 * Comprueba si una fecha en formato YYYY-MM-DD cae dentro de la semana actual (Lunes-Domingo).
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {boolean}
 */
export const isThisWeek = (dateString) => {
  if (!dateString) return false;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // Calcular lunes de esta semana
  const dayOfWeek = today.getDay(); // 0=Dom, 1=Lun...
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const [year, month, day] = dateString.split('-').map(Number);
  const target = new Date(year, month - 1, day);
  return target >= monday && target <= sunday;
};

/**
 * Formatea un número como moneda EUR (español): "1.250,50 €"
 * @param {number} amount
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(amount);
};
