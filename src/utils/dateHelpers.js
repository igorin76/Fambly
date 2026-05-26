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
