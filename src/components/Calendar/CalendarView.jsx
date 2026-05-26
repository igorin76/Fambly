import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { getDaysUntilBirthday, formatDateSpanish } from '../../utils/dateHelpers';
import { 
  Cake, 
  Calendar as CalendarIcon, 
  GraduationCap, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  X,
  Clock,
  CheckSquare,
  Sparkles,
  Trophy,
  ChevronDown,
  Edit2,
  Eye,
  Download,
  Volume2,
  Link,
  FileText,
  UploadCloud,
  ImageIcon,
  Paperclip,
  Square,
  Mic,
  ExternalLink
} from 'lucide-react';

export default function CalendarView({ setActiveTab }) {
  const { events, addEvent, updateEvent, deleteEvent, tasks = [], members = [], setFocusedTaskId } = useStore();
  
  const handleEventClick = (evt) => {
    if (evt.type === 'tarea') {
      const taskId = evt.id.replace('task-evt-', '');
      setFocusedTaskId(taskId);
      setActiveTab('tasks');
    }
  };
  
  // Crear eventos de cumpleaños virtuales a partir de los cumpleaños de los miembros
  const virtualBirthdayEvents = members
    .filter(m => m.birthDate)
    .map(m => ({
      id: `bday-${m.id}`,
      title: `Cumpleaños de ${m.firstName}`,
      date: m.birthDate,
      type: 'cumpleanos',
      target: m.firstName,
      description: `🎂 ¡Felicidades, ${m.firstName}!`,
      isVirtual: true
    }));

  // Crear eventos de tareas virtuales a partir de su fecha límite
  const virtualTaskEvents = tasks
    .filter(t => t.dueDate && !t.completed)
    .map(t => ({
      id: `task-evt-${t.id}`,
      title: `Tarea: ${t.title}`,
      date: t.dueDate,
      type: 'tarea',
      target: t.assignee || 'Todos',
      description: t.description || '',
      isVirtual: true
    }));

  const allEvents = [...events, ...virtualBirthdayEvents, ...virtualTaskEvents];
  
  const baseDate = new Date(2026, 4, 25);
  const [currentYear, setCurrentYear] = useState(baseDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(baseDate.getMonth()); 
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Pestaña de agenda activa en móviles
  const [mobileAgendaTab, setMobileAgendaTab] = useState('cumpleanos');

  // Estado del evento en edición
  const [editingEvent, setEditingEvent] = useState(null);

  // Estados Formulario Evento
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('escolar'); // 'escolar', 'cumpleanos', 'hito', 'extraescolar'
  const [eventDescription, setEventDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]); // Array de nombres
  const [birthYear, setBirthYear] = useState(''); // Opcional para calcular la edad en cumpleaños
  const [birthdayLabel, setBirthdayLabel] = useState(''); // Etiqueta personalizada para mostrar en el combo

  // Estados Lógica de Periodicidad
  const [isRecurrent, setIsRecurrent] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState('daily'); // 'daily', 'weekly_days', 'biweekly', 'monthly', 'quarterly', 'yearly'
  const [selectedDays, setSelectedDays] = useState([]); // 0=Domingo, 1=Lunes...
  const [endDate, setEndDate] = useState('');
  const [recurrenceError, setRecurrenceError] = useState('');

  // Estados para Modal de Confirmación de Borrado Recurrente
  const [eventToDelete, setEventToDelete] = useState(null);
  const [showDeleteRecurrentModal, setShowDeleteRecurrentModal] = useState(false);

  // Filtro de Categorías del Calendario: 'all', 'tarea', 'cumpleanos', 'escolar', 'extraescolar', 'hito'
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Estado para Cumpleaños seleccionado en el Combo
  const [selectedBirthdayId, setSelectedBirthdayId] = useState('');

  // Limpiar el cumpleaños seleccionado al cambiar de mes o año
  useEffect(() => {
    setSelectedBirthdayId('');
  }, [currentMonth, currentYear]);

  // Estados de adjuntos
  const [attachmentsList, setAttachmentsList] = useState([]);
  const [contentType, setContentType] = useState(''); // '', 'text', 'document', 'image', 'voice', 'url'
  const [fileUrl, setFileUrl] = useState('');
  const [textContent, setTextContent] = useState('');
  const [tempUrl, setTempUrl] = useState('');
  const [tempUrlLabel, setTempUrlLabel] = useState('');

  // Estados de carga de archivos locales
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileSize, setSelectedFileSize] = useState(0);
  const [fileErrorMsg, setFileErrorMsg] = useState('');

  // Estados Grabadora de Audio
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState('');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingTimer, setRecordingTimer] = useState(null);
  const [voiceInputMode, setVoiceInputMode] = useState('record'); // 'record' o 'upload'
  const [voiceFileErrorMsg, setVoiceFileErrorMsg] = useState('');

  // Visores interactivos
  const [activeImagePreview, setActiveImagePreview] = useState(null);
  const [activeDocumentPreview, setActiveDocumentPreview] = useState(null);

  // Limpieza de intervalos al desmontar
  useEffect(() => {
    return () => {
      if (recordingTimer) clearInterval(recordingTimer);
    };
  }, [recordingTimer]);

  // Manejo de la subida de archivos (PDF/Documento, Imagen)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFileErrorMsg("El archivo supera el límite de 5 MB. Selecciona uno más pequeño.");
      setFileUrl('');
      setSelectedFileName('');
      setSelectedFileSize(0);
      return;
    }

    setFileErrorMsg('');
    setSelectedFileName(file.name);
    setSelectedFileSize(file.size);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setFileUrl(reader.result); // Base64 Data URL
    };
  };

  // Manejo de la subida de notas de voz desde el dispositivo
  const handleVoiceFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setVoiceFileErrorMsg("El archivo de audio supera el límite de 8 MB.");
      setFileUrl('');
      setRecordedAudioUrl('');
      setSelectedFileName('');
      setSelectedFileSize(0);
      return;
    }

    setVoiceFileErrorMsg('');
    setSelectedFileName(file.name);
    setSelectedFileSize(file.size);

    const audioUrl = URL.createObjectURL(file);
    setRecordedAudioUrl(audioUrl);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setFileUrl(reader.result); // Data URL Base64
    };
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      let chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
        
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setFileUrl(reader.result);
        };
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingSeconds(0);
      setRecordedAudioUrl('');

      const interval = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
      setRecordingTimer(interval);
    } catch (err) {
      alert("No se pudo acceder al micrófono. Por favor, concede los permisos de audio en tu navegador.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (recordingTimer) {
        clearInterval(recordingTimer);
        setRecordingTimer(null);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getExtensionFromMime = (mimeType) => {
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('image/png')) return 'png';
    if (mimeType.includes('image/jpeg') || mimeType.includes('image/jpg')) return 'jpg';
    if (mimeType.includes('image/gif')) return 'gif';
    if (mimeType.includes('image/webp')) return 'webp';
    if (mimeType.includes('text/plain')) return 'txt';
    if (mimeType.includes('wordprocessingml.document') || mimeType.includes('msword')) return 'docx';
    if (mimeType.includes('spreadsheetml.sheet') || mimeType.includes('excel')) return 'xlsx';
    if (mimeType.includes('csv')) return 'csv';
    if (mimeType.includes('audio/webm') || mimeType.includes('audio/ogg')) return 'webm';
    if (mimeType.includes('audio/mpeg') || mimeType.includes('audio/mp3')) return 'mp3';
    if (mimeType.includes('audio/wav')) return 'wav';
    if (mimeType.includes('audio/x-m4a') || mimeType.includes('audio/aac')) return 'm4a';
    return 'bin';
  };

  const handleDownloadFile = (itemOrFile) => {
    const base64Data = itemOrFile.fileUrl;
    if (!base64Data) return;

    try {
      const link = document.createElement('a');
      link.href = base64Data;

      const match = base64Data.match(/^data:(.*);base64,/);
      const mimeType = match ? match[1] : '';
      const ext = getExtensionFromMime(mimeType);

      const safeName = itemOrFile.title.toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .substring(0, 40);

      link.download = `${safeName}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      alert("Error al descargar el archivo. Es posible que el formato no sea compatible.");
    }
  };

  const handleOpenFile = (itemOrFile) => {
    const base64Data = itemOrFile.fileUrl;
    if (!base64Data) return;

    const match = base64Data.match(/^data:(.*);base64,/);
    const mimeType = match ? match[1] : '';

    if (mimeType.includes('pdf')) {
      try {
        const parts = base64Data.split(',');
        const byteCharacters = atob(parts[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(blob);
        window.open(fileURL);
      } catch (e) {
        window.open(base64Data);
      }
    } else if (mimeType.includes('text/plain')) {
      try {
        const parts = base64Data.split(',');
        const decodedText = decodeURIComponent(escape(atob(parts[1])));
        setActiveDocumentPreview({
          title: itemOrFile.title,
          content: decodedText,
          type: 'text'
        });
      } catch (e) {
        alert("No se pudo previsualizar el archivo de texto. Inténtalo descargándolo.");
      }
    } else {
      handleDownloadFile(itemOrFile);
    }
  };

  const getFormatLabel = (fileUrl) => {
    if (!fileUrl) return 'Archivo';
    const match = fileUrl.match(/^data:(.*);base64,/);
    const mimeType = match ? match[1] : '';
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('text/plain')) return 'TXT';
    if (mimeType.includes('wordprocessingml.document') || mimeType.includes('msword')) return 'Word';
    if (mimeType.includes('spreadsheetml.sheet') || mimeType.includes('excel')) return 'Excel';
    return 'Documento';
  };

  const renderAttachmentsList = (attachmentsList, eventTitle) => {
    if (!attachmentsList || attachmentsList.length === 0) return null;
    return (
      <div className="mt-3.5 flex flex-col gap-3">
        {attachmentsList.map((att, index) => {
          const type = att.type || att.contentType;
          if (!type) return null;
          
          return (
            <div key={att.id || index} className="bg-slate-50 border border-slate-200/50 rounded-xl p-3.5 max-w-md">
              <div className="flex items-center gap-2 border-b border-slate-200/50 pb-2 mb-2">
                <span className={`p-1.5 rounded-lg text-xs ${
                  type === 'document' ? 'bg-red-50 text-red-600' :
                  type === 'image' ? 'bg-emerald-50 text-emerald-600' :
                  type === 'voice' ? 'bg-indigo-50 text-indigo-600' :
                  type === 'url' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  {type === 'document' ? <FileText size={12} /> :
                   type === 'image' ? <ImageIcon size={12} /> :
                   type === 'voice' ? <Volume2 size={12} /> :
                   type === 'url' ? <Link size={12} /> : <Paperclip size={12} />}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Adjunto: {
                    type === 'text' ? 'Texto / Nota' :
                    type === 'document' ? 'Documento' :
                    type === 'image' ? 'Imagen' :
                    type === 'voice' ? 'Nota de Voz' : 'Enlace Web'
                  }
                </span>
              </div>

              {type === 'text' && (
                <p className="text-xs text-slate-500 whitespace-pre-line leading-relaxed max-h-32 overflow-y-auto pr-1">
                  {att.textContent}
                </p>
              )}

              {type === 'voice' && (
                <div className="flex flex-col gap-1.5">
                  <audio src={att.fileUrl} controls className="w-full h-8 mt-1" />
                </div>
              )}

              {type === 'image' && (
                <div 
                  className="rounded-lg border border-slate-200/50 overflow-hidden bg-white p-1 flex items-center justify-center min-h-[80px] max-h-40 cursor-pointer relative group/img"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImagePreview({ title: eventTitle, fileUrl: att.fileUrl });
                  }}
                >
                  <img src={att.fileUrl} alt={eventTitle} className="max-h-36 object-contain rounded" />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="p-1.5 rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition-colors">
                      <Eye size={12} />
                    </span>
                    <span 
                      className="p-1.5 rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadFile({ title: eventTitle, fileUrl: att.fileUrl });
                      }}
                    >
                      <Download size={12} />
                    </span>
                  </div>
                </div>
              )}

              {type === 'document' && (
                <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded shrink-0">
                      {getFormatLabel(att.fileUrl)}
                    </span>
                    <span className="text-xs font-bold text-slate-700 truncate">
                      {att.fileName || eventTitle}
                    </span>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenFile({ title: att.fileName || eventTitle, fileUrl: att.fileUrl });
                      }}
                      className="p-1.5 rounded bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors"
                      title="Ver archivo"
                    >
                      <Eye size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadFile({ title: att.fileName || eventTitle, fileUrl: att.fileUrl });
                      }}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-900 text-white transition-colors"
                      title="Descargar"
                    >
                      <Download size={12} />
                    </button>
                  </div>
                </div>
              )}

              {type === 'url' && (
                <a 
                  href={att.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl border border-blue-100 transition-colors w-fit"
                >
                  <ExternalLink size={12} />
                  <span className="font-bold text-xs truncate max-w-[200px]">{att.label || att.url}</span>
                </a>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push({ day: null, dateString: null });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateString = `${currentYear}-${formattedMonth}-${formattedDay}`;
    calendarCells.push({ day, dateString });
  }

  const getEventsForDay = (dateString) => {
    if (!dateString) return [];
    const [y, m, d] = dateString.split('-');
    
    return allEvents.filter(e => {
      // Filtrado por categoría seleccionada
      if (categoryFilter !== 'all' && e.type !== categoryFilter) return false;
      
      const [ey, em, ed] = e.date.split('-');
      if (e.type === 'cumpleanos') {
        return em === m && ed === d;
      }
      return ey === y && em === m && ed === d;
    });
  };

  // Helper para validar si un evento corresponde al mes en curso
  const isEventInCurrentMonth = (evt) => {
    const [ey, em] = evt.date.split('-');
    const targetMonthStr = String(currentMonth + 1).padStart(2, '0');
    
    if (evt.type === 'cumpleanos') {
      return em === targetMonthStr;
    }
    return ey === String(currentYear) && em === targetMonthStr;
  };

  // Manejador del cambio de fecha de inicio para premarcar el día de la semana
  const handleDateChange = (newDateStr) => {
    setDate(newDateStr);
    if (newDateStr) {
      const dateObj = new Date(newDateStr);
      const dayOfWeek = dateObj.getDay(); // 0 = Domingo, 1 = Lunes, etc.
      setSelectedDays([dayOfWeek]);
    }
  };

  // Algoritmo generador de fechas recurrentes
  const generateRecurrentDates = (startDateStr, endDateStr, type, days = []) => {
    const dates = [];
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return [startDateStr];
    }

    let current = new Date(start);
    let limit = 0; // Límite de seguridad de 100 elementos
    const hasDaysSelected = days.length > 0;

    if (type === 'daily') {
      while (current <= end && limit < 100) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
        limit++;
      }
    } else if (type === 'weekly_days') {
      if (hasDaysSelected) {
        while (current <= end && limit < 100) {
          const dayOfWeek = current.getDay();
          if (days.includes(dayOfWeek)) {
            dates.push(current.toISOString().split('T')[0]);
            limit++;
          }
          current.setDate(current.getDate() + 1);
        }
      } else {
        while (current <= end && limit < 100) {
          dates.push(current.toISOString().split('T')[0]);
          current.setDate(current.getDate() + 7);
          limit++;
        }
      }
    } else if (type === 'biweekly') {
      if (hasDaysSelected) {
        const startDay = start.getDay();
        const mondayOffset = startDay === 0 ? -6 : 1 - startDay;
        const startMonday = new Date(start);
        startMonday.setDate(startMonday.getDate() + mondayOffset);

        while (current <= end && limit < 100) {
          const dayOfWeek = current.getDay();
          if (days.includes(dayOfWeek)) {
            const diffTime = current.getTime() - startMonday.getTime();
            const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
            
            if (diffWeeks % 2 === 0) {
              dates.push(current.toISOString().split('T')[0]);
              limit++;
            }
          }
          current.setDate(current.getDate() + 1);
        }
      } else {
        while (current <= end && limit < 100) {
          dates.push(current.toISOString().split('T')[0]);
          current.setDate(current.getDate() + 14);
          limit++;
        }
      }
    } else if (type === 'monthly') {
      while (current <= end && limit < 100) {
        dates.push(current.toISOString().split('T')[0]);
        current.setMonth(current.getMonth() + 1);
        limit++;
      }
    } else if (type === 'quarterly') {
      while (current <= end && limit < 100) {
        dates.push(current.toISOString().split('T')[0]);
        current.setMonth(current.getMonth() + 3);
        limit++;
      }
    } else if (type === 'yearly') {
      while (current <= end && limit < 100) {
        dates.push(current.toISOString().split('T')[0]);
        current.setFullYear(current.getFullYear() + 1);
        limit++;
      }
    } else {
      dates.push(startDateStr);
    }

    return dates;
  };

  // Helper para calcular la edad que cumple en el año seleccionado
  const getAgeToCelebrate = (evt, targetYear) => {
    let birthYearNum = null;
    if (evt.isVirtual) {
      if (evt.date) {
        const parts = evt.date.split('-');
        if (parts.length > 0) {
          birthYearNum = parseInt(parts[0]);
        }
      }
    } else {
      if (evt.type === 'cumpleanos' && evt.description) {
        // Puede venir estructurado como "2018|Abuelo Jesús" o solo "2018"
        const yearPart = evt.description.includes('|') 
          ? evt.description.split('|')[0] 
          : evt.description;
        const parsed = parseInt(yearPart);
        if (!isNaN(parsed) && parsed > 1900) {
          birthYearNum = parsed;
        }
      }
    }

    if (birthYearNum) {
      const age = targetYear - birthYearNum;
      if (age > 0) return age;
    }
    return null;
  };

  // Helper para obtener el nombre a mostrar para el cumpleaños
  const getBirthdayDisplayName = (bday) => {
    if (bday.isVirtual) {
      return bday.target; // Igor, Valentina, etc.
    }
    
    // Si es manual, intentamos extraer la etiqueta de la descripción (yearStr|labelStr)
    if (bday.description && bday.description.includes('|')) {
      const [, label] = bday.description.split('|');
      if (label && label.trim()) {
        return label.trim();
      }
    } else if (bday.description && isNaN(parseInt(bday.description))) {
      // Compatibilidad si la descripción se guardó directamente como etiqueta anteriormente
      return bday.description;
    }

    // Fallback: limpiamos el título del cumpleaños quitando palabras comunes
    let name = bday.title || '';
    name = name.replace(/^cumpleaños de\s+/i, '');
    name = name.replace(/^cumpleaños\s+/i, '');
    name = name.replace(/^cumple\s+/i, '');
    return name || bday.target || 'Cumpleaños';
  };

  const handleCloseModal = () => {
    if (isRecording) {
      stopRecording();
    }
    setIsModalOpen(false);
    setEditingEvent(null);
    setTitle('');
    setDate('');
    setSelectedMembers([]);
    setIsRecurrent(false);
    setRecurrenceType('daily');
    setSelectedDays([]);
    setEndDate('');
    setRecurrenceError('');
    setBirthYear('');
    setBirthdayLabel('');
    setEventDescription('');
    
    // Adjuntos
    setAttachmentsList([]);
    setContentType('');
    setFileUrl('');
    setTextContent('');
    setSelectedFileName('');
    setSelectedFileSize(0);
    setFileErrorMsg('');
    setVoiceInputMode('record');
    setVoiceFileErrorMsg('');
    setRecordedAudioUrl('');
    setRecordingSeconds(0);
    setTempUrl('');
    setTempUrlLabel('');
    if (recordingTimer) {
      clearInterval(recordingTimer);
      setRecordingTimer(null);
    }
  };

  const handleOpenEdit = (evt) => {
    setEditingEvent(evt);
    setTitle(evt.title);
    setDate(evt.date);
    setType(evt.type);
    
    if (evt.type === 'cumpleanos') {
      setEventDescription('');
      if (evt.description && evt.description.includes('|')) {
        const [by, bl] = evt.description.split('|');
        setBirthYear(by || '');
        setBirthdayLabel(bl || '');
      } else if (evt.description && !isNaN(parseInt(evt.description))) {
        setBirthYear(evt.description);
        setBirthdayLabel('');
      } else {
        setBirthYear('');
        setBirthdayLabel(evt.description || '');
      }
    } else {
      setEventDescription(evt.description || '');
      setBirthYear('');
      setBirthdayLabel('');
    }

    if (evt.target === 'TODOS' || evt.target === 'Comun') {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(evt.target.split(', ').filter(Boolean));
    }

    setAttachmentsList(evt.attachments || []);
    setIsRecurrent(false);
    setEndDate('');
    setIsModalOpen(true);
  };

  const handleSaveEvent = (e) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    const targetString = selectedMembers.length > 0 ? selectedMembers.join(', ') : 'TODOS';
    const finalDescription = type === 'cumpleanos' ? `${birthYear}|${birthdayLabel}` : eventDescription.trim();

    if (editingEvent) {
      updateEvent(editingEvent.id, {
        title,
        date,
        type,
        target: targetString,
        description: finalDescription,
        attachments: attachmentsList
      });
    } else if (isRecurrent) {
      if (!endDate) {
        setRecurrenceError("Por favor, selecciona una fecha límite.");
        return;
      }

      const start = new Date(date);
      const end = new Date(endDate);
      
      if (end < start) {
        setRecurrenceError("La fecha de fin debe ser posterior a la de inicio.");
        return;
      }

      // Plazo límite: 1 año
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
      if (diffDays > 53) {
        setRecurrenceError("La periodicidad no puede exceder el plazo máximo de 1 año.");
        return;
      }

      const eventDates = generateRecurrentDates(date, endDate, recurrenceType, selectedDays);
      
      if (eventDates.length === 0) {
        setRecurrenceError("Ninguna fecha coincide con el criterio en el rango establecido.");
        return;
      }

      const groupTimestamp = Date.now();
      const eventsToCreate = eventDates.map((evtDate, idx) => ({
        id: `evt-rec-${groupTimestamp}-${idx}`,
        title,
        date: evtDate,
        type,
        target: targetString,
        description: finalDescription,
        attachments: attachmentsList
      }));

      addEvent(eventsToCreate);
    } else {
      addEvent({
        id: `evt-${Date.now()}`,
        title,
        date,
        type,
        target: targetString,
        description: finalDescription,
        attachments: attachmentsList
      });
    }

    // Resetear formulario
    handleCloseModal();
  };

  // Controlador al hacer clic en el botón de borrar
  const handleDeleteEventClick = (evt) => {
    if (evt.id.startsWith('evt-rec-')) {
      setEventToDelete(evt);
      setShowDeleteRecurrentModal(true);
    } else {
      deleteEvent(evt.id);
    }
  };

  const confirmDeleteEvent = (deleteAllRecurrences) => {
    if (eventToDelete) {
      deleteEvent(eventToDelete.id, deleteAllRecurrences);
      setShowDeleteRecurrentModal(false);
      setEventToDelete(null);
    }
  };

  // Filtros dinámicos de la columna derecha para el mes en curso
  const birthdaysCurrentMonth = allEvents
    .filter(e => e.type === 'cumpleanos' && isEventInCurrentMonth(e))
    .map(e => ({
      ...e,
      daysLeft: getDaysUntilBirthday(e.date)
    }))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const schoolEventsCurrentMonth = allEvents.filter(
    e => e.type === 'escolar' && isEventInCurrentMonth(e)
  );

  const extraEventsCurrentMonth = allEvents.filter(
    e => e.type === 'extraescolar' && isEventInCurrentMonth(e)
  );

  const hitosEventsCurrentMonth = allEvents.filter(
    e => e.type === 'hito' && isEventInCurrentMonth(e)
  );

  const selectedDateEvents = selectedDate ? getEventsForDay(selectedDate) : [];

  return (
    <div className="flex flex-col gap-6">
      
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Calendario</h2>
          <p className="text-sm text-slate-500">Planifica las fechas clave del hogar y sigue la cuenta atrás de cumpleaños.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/10 hover:scale-[1.02] shrink-0 self-start sm:self-center"
        >
          <Plus size={15} />
          Nuevo Evento
        </button>
      </div>

      {/* FILTROS DE CATEGORÍA (PILLS) */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-slate-100">
        {[
          { id: 'all', label: 'Todos los eventos', count: allEvents.length, colorClass: 'border-slate-200 text-slate-600 bg-slate-50' },
          { id: 'cumpleanos', label: 'Cumpleaños', count: allEvents.filter(e => e.type === 'cumpleanos').length, colorClass: 'border-orange-200 text-orange-600 bg-orange-50/50' },
          { id: 'tarea', label: 'Tareas pendientes', count: allEvents.filter(e => e.type === 'tarea').length, colorClass: 'border-indigo-200 text-indigo-600 bg-indigo-50/50' },
          { id: 'escolar', label: 'Colegio', count: allEvents.filter(e => e.type === 'escolar').length, colorClass: 'border-blue-200 text-blue-600 bg-blue-50/50' },
          { id: 'extraescolar', label: 'Extraescolar', count: allEvents.filter(e => e.type === 'extraescolar').length, colorClass: 'border-purple-200 text-purple-600 bg-purple-50/50' },
          { id: 'hito', label: 'Hitos', count: allEvents.filter(e => e.type === 'hito').length, colorClass: 'border-emerald-200 text-emerald-600 bg-emerald-50/50' }
        ].map((filt) => {
          const isActive = categoryFilter === filt.id;
          return (
            <button
              key={filt.id}
              onClick={() => setCategoryFilter(filt.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-slate-800 border-slate-800 text-white shadow shadow-slate-800/10 scale-105' 
                  : `${filt.colorClass} hover:scale-[1.02]`
              }`}
            >
              <span>{filt.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-200/50 text-slate-600'
              }`}>
                {filt.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CALENDARIO */}
        <div className="lg:col-span-2 flat-card p-5 flex flex-col gap-4 border border-slate-200/60 bg-white">
          
          {/* Cabecera mes */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <CalendarIcon className="text-blue-500 h-4 w-4" /> 
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <div className="flex items-center gap-1">
              <button 
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Grilla */}
          <div className="grid grid-cols-7 gap-1 text-center mt-2">
            {daysOfWeek.map(d => (
              <div key={d} className="text-xs font-bold text-slate-400 py-1">{d}</div>
            ))}

            {calendarCells.map((cell, index) => {
              const dayEvents = getEventsForDay(cell.dateString);
              const isToday = cell.dateString === '2026-05-25'; 
              const isSelected = selectedDate === cell.dateString;
              const hasEvents = dayEvents.length > 0;

              return (
                <div
                  key={index}
                  onClick={() => cell.dateString && setSelectedDate(cell.dateString)}
                  className={`min-h-[50px] sm:min-h-[60px] p-1.5 rounded-xl border flex flex-col justify-between transition-all cursor-pointer ${
                    !cell.day 
                      ? 'bg-transparent border-transparent cursor-default' 
                      : isSelected
                        ? 'bg-blue-50 border-blue-200 text-blue-600'
                        : isToday
                          ? 'bg-blue-50/50 border-blue-500 text-blue-600 font-extrabold'
                          : 'bg-white border-slate-100 text-slate-700 hover:bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <span className="text-xs font-bold self-start">{cell.day}</span>
                  
                  {hasEvents && (
                    <div className="flex gap-1 justify-center pb-0.5 flex-wrap max-w-full">
                      {dayEvents.map((evt, idx) => (
                        <span 
                          key={idx} 
                          className={`h-1.5 w-1.5 rounded-full ${
                            evt.type === 'cumpleanos' ? 'bg-orange-500' :
                            evt.type === 'tarea' ? 'bg-indigo-500' :
                            evt.type === 'extraescolar' ? 'bg-purple-500 animate-pulse' :
                            evt.type === 'escolar' ? 'bg-blue-500' : 'bg-emerald-500'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Eventos seleccionados */}
          {selectedDate && (
            <div className="mt-2 p-4 bg-slate-50 border border-slate-200 rounded-xl animate-fadeIn">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Eventos para el {formatDateSpanish(selectedDate)}
                </h4>
                <button 
                  onClick={() => setSelectedDate(null)}
                  className="text-xs font-bold text-blue-600"
                >
                  Ocultar
                </button>
              </div>
              {selectedDateEvents.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {selectedDateEvents.map(evt => {
                    const isTask = evt.type === 'tarea';
                    const age = evt.type === 'cumpleanos' ? getAgeToCelebrate(evt, currentYear) : null;
                    return (
                      <div 
                        key={evt.id} 
                        onClick={() => isTask && handleEventClick(evt)}
                        className={`flex items-center justify-between p-3 bg-white border border-slate-200/60 rounded-xl text-xs font-bold text-slate-700 transition-all ${
                          isTask ? 'cursor-pointer hover:bg-indigo-50/50 hover:border-indigo-300/50 hover:scale-[1.01]' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`p-1.5 rounded-lg ${
                            evt.type === 'cumpleanos' ? 'bg-orange-100 text-orange-600' :
                            evt.type === 'tarea' ? 'bg-indigo-100 text-indigo-600' :
                            evt.type === 'extraescolar' ? 'bg-purple-100 text-purple-600' :
                            evt.type === 'hito' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {evt.type === 'cumpleanos' ? <Cake size={13} /> :
                             evt.type === 'tarea' ? <CheckSquare size={13} /> :
                             evt.type === 'extraescolar' ? <Sparkles size={13} /> :
                             evt.type === 'hito' ? <Trophy size={13} /> : <GraduationCap size={13} />}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="text-slate-800 truncate">{evt.title}</p>
                              {age !== null && (
                                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-orange-100 text-orange-600 border border-orange-200">
                                  ¡Cumple {age} años! 🥳
                                </span>
                              )}
                            </div>
                            {evt.type !== 'cumpleanos' && evt.description && (
                              <p className="text-[10px] text-slate-500 font-normal mt-1 leading-normal break-words italic">
                                {evt.description}
                              </p>
                            )}
                            <p className="text-[10px] text-slate-400 font-normal mt-0.5 truncate">
                              Afecta: {evt.target === 'Comun' || evt.target === 'TODOS' ? 'TODOS' : evt.target}
                            </p>
                            {renderAttachmentsList(evt.attachments, evt.title)}
                          </div>
                        </div>
                        {!evt.isVirtual && (
                          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleOpenEdit(evt)}
                              className="text-slate-400 hover:text-blue-500 p-1 bg-transparent border-0 cursor-pointer transition-colors"
                              title="Editar Evento"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteEventClick(evt)}
                              className="text-slate-400 hover:text-red-500 p-1 bg-transparent border-0 cursor-pointer transition-colors"
                              title="Eliminar Evento"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-2">No hay eventos planificados que coincidan.</p>
              )}
            </div>
          )}

        </div>

        {/* COLUMNA DERECHA (AGENDAS DEL MES EN CURSO) */}
        <div className="flex flex-col gap-6">
          
          {/* SELECTOR DE PESTAÑAS PARA MÓVIL */}
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-1 mb-2 border-b border-slate-100">
            {[
              { id: 'cumpleanos', label: 'Cumples', count: birthdaysCurrentMonth.length, icon: Cake, colorActive: 'bg-orange-500 border-orange-500 text-white shadow-orange-500/10' },
              { id: 'hito', label: 'Hitos', count: hitosEventsCurrentMonth.length, icon: Trophy, colorActive: 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/10' },
              { id: 'escolar', label: 'Colegio', count: schoolEventsCurrentMonth.length, icon: GraduationCap, colorActive: 'bg-blue-500 border-blue-500 text-white shadow-blue-500/10' },
              { id: 'extraescolar', label: 'Extra', count: extraEventsCurrentMonth.length, icon: Sparkles, colorActive: 'bg-purple-500 border-purple-500 text-white shadow-purple-500/10' }
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = mobileAgendaTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMobileAgendaTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                    isActive 
                      ? `${tab.colorActive} shadow scale-[1.02]` 
                      : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <TabIcon size={12} />
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* CUMPLEANOS (SELECCIÓN POR COMBO) */}
          <div className={`flat-card p-5 flex flex-col gap-4 border border-slate-200/60 bg-white shadow-sm ${mobileAgendaTab === 'cumpleanos' ? 'block animate-fadeIn' : 'hidden lg:flex'}`}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Cake className="text-orange-500 h-4.5 w-4.5 shrink-0" />
                Cumpleaños de {monthNames[currentMonth]}
              </h3>
              <span className="text-[10px] bg-orange-100 px-2 py-0.5 rounded text-orange-600 font-bold uppercase">
                {birthdaysCurrentMonth.length} en total
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <select
                 value={selectedBirthdayId}
                 onChange={(e) => setSelectedBirthdayId(e.target.value)}
                 disabled={birthdaysCurrentMonth.length === 0}
                 className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white focus:outline-none focus:border-orange-300 disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer transition-colors"
              >
                {birthdaysCurrentMonth.length === 0 ? (
                  <option value="">No hay cumpleaños este mes</option>
                ) : (
                  <>
                    <option value="">Selecciona un cumpleaños...</option>
                    {birthdaysCurrentMonth.map((bday) => (
                      <option key={bday.id} value={bday.id}>
                        {getBirthdayDisplayName(bday)} ({bday.date.split('-').slice(1).reverse().join('/')})
                      </option>
                    ))}
                  </>
                )}
              </select>

              {/* Información del cumpleaños seleccionado */}
              {selectedBirthdayId && (() => {
                const bday = birthdaysCurrentMonth.find(b => b.id === selectedBirthdayId);
                if (!bday) return null;
                const isKid = ['Valentina', 'Rodrigo', 'Martin'].includes(bday.target);
                const age = getAgeToCelebrate(bday, currentYear);
                return (
                  <div 
                    className={`p-3 rounded-xl border flex flex-col justify-between transition-all animate-fadeIn ${
                      isKid ? 'border-orange-200 bg-orange-50/20' : 'border-slate-100 bg-white shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800">{getBirthdayDisplayName(bday)}</span>
                        {isKid && (
                          <span className="text-[7px] px-1 rounded bg-orange-100 text-orange-600 font-bold uppercase tracking-wider">
                            Hijo/a
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {formatDateSpanish(bday.date)}
                      </span>
                    </div>

                    {age !== null && (
                      <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-200/40 flex items-center justify-between shadow-sm">
                        <span className="text-[10px] font-bold text-orange-700">Cumple en {currentYear}:</span>
                        <span className="text-xs font-black text-orange-600 bg-white px-2 py-0.5 rounded-full border border-orange-200 shadow-sm animate-pulse">
                          ¡{age} años! 🎈
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2.5">
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 font-bold">
                        <Clock size={11} className="text-slate-350" />
                        {bday.daysLeft === 0 ? '¡HOY! 🎂' : `Faltan ${bday.daysLeft} días`}
                      </span>

                      {bday.daysLeft <= 30 && isKid && (
                        <span className="text-[8px] text-orange-600 font-extrabold bg-orange-100 px-1.5 py-0.5 rounded">
                          Organizar Fiesta
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* HITOS DEL HOGAR DEL MES */}
          <div className={`flat-card p-5 flex flex-col gap-3 border border-slate-200/60 bg-white ${mobileAgendaTab === 'hito' ? 'block animate-fadeIn' : 'hidden lg:flex'}`}>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Trophy size={14} className="text-emerald-500" /> Hitos de {monthNames[currentMonth]}
            </h3>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              {hitosEventsCurrentMonth.map(evt => (
                <div key={evt.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-slate-700 truncate pr-2">{evt.title}</p>
                    <button 
                      onClick={() => handleDeleteEventClick(evt)}
                      className="text-slate-400 hover:text-red-500 shrink-0 bg-transparent border-0 cursor-pointer transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">
                    Fecha: {formatDateSpanish(evt.date)} • Afecta: {evt.target === 'Comun' || evt.target === 'TODOS' ? 'TODOS' : evt.target}
                  </p>
                  {evt.description && (
                    <p className="text-[10px] text-slate-500 font-normal mt-1.5 leading-normal italic bg-white/50 p-1.5 rounded border border-slate-100/50 break-words">
                      {evt.description}
                    </p>
                  )}
                </div>
              ))}
              {hitosEventsCurrentMonth.length === 0 && (
                <p className="text-[10px] text-slate-400 font-bold text-center py-2">No hay hitos este mes.</p>
              )}
            </div>
          </div>

          {/* HITOS COLEGIO DEL MES */}
          <div className={`flat-card p-5 flex flex-col gap-3 border border-slate-200/60 bg-white ${mobileAgendaTab === 'escolar' ? 'block animate-fadeIn' : 'hidden lg:flex'}`}>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <GraduationCap size={14} className="text-blue-500" /> Colegio en {monthNames[currentMonth]}
            </h3>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              {schoolEventsCurrentMonth.map(evt => (
                <div key={evt.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-slate-700 truncate pr-2">{evt.title}</p>
                    <button 
                      onClick={() => handleDeleteEventClick(evt)}
                      className="text-slate-400 hover:text-red-500 shrink-0 bg-transparent border-0 cursor-pointer transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">
                    Fecha: {formatDateSpanish(evt.date)} • Afecta: {evt.target === 'Comun' || evt.target === 'TODOS' ? 'TODOS' : evt.target}
                  </p>
                  {evt.description && (
                    <p className="text-[10px] text-slate-500 font-normal mt-1.5 leading-normal italic bg-white/50 p-1.5 rounded border border-slate-100/50 break-words">
                      {evt.description}
                    </p>
                  )}
                </div>
              ))}
              {schoolEventsCurrentMonth.length === 0 && (
                <p className="text-[10px] text-slate-400 font-bold text-center py-2">No hay fechas escolares.</p>
              )}
            </div>
          </div>

          {/* ACTIVIDADES EXTRAESCOLARES DEL MES */}
          <div className={`flat-card p-5 flex flex-col gap-3 border border-slate-200/60 bg-white ${mobileAgendaTab === 'extraescolar' ? 'block animate-fadeIn' : 'hidden lg:flex'}`}>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles size={14} className="text-purple-500" /> Extraescolares en {monthNames[currentMonth]}
            </h3>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              {extraEventsCurrentMonth.map(evt => (
                <div key={evt.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-slate-700 truncate pr-2">{evt.title}</p>
                    <button 
                      onClick={() => handleDeleteEventClick(evt)}
                      className="text-slate-400 hover:text-red-500 shrink-0 bg-transparent border-0 cursor-pointer transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">
                    Fecha: {formatDateSpanish(evt.date)} • Afecta: {evt.target === 'Comun' || evt.target === 'TODOS' ? 'TODOS' : evt.target}
                  </p>
                  {evt.description && (
                    <p className="text-[10px] text-slate-500 font-normal mt-1.5 leading-normal italic bg-white/50 p-1.5 rounded border border-slate-100/50 break-words">
                      {evt.description}
                    </p>
                  )}
                </div>
              ))}
              {extraEventsCurrentMonth.length === 0 && (
                <p className="text-[10px] text-slate-400 font-bold text-center py-2">No hay actividades este mes.</p>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* MODAL NUEVO EVENTO / BOTTOM SHEET EN MÓVIL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full sm:max-w-sm bg-white border-t sm:border border-slate-200/60 rounded-t-3xl rounded-b-none sm:rounded-2xl p-6 pb-12 sm:pb-6 shadow-2xl sm:shadow-xl relative max-h-[85vh] sm:max-h-[90vh] overflow-y-auto animate-slideUp sm:animate-fadeIn">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                {editingEvent ? 'Editar Evento' : 'Nuevo Evento'}
              </h3>
              <button 
                type="button"
                onClick={handleCloseModal} 
                className="text-slate-400 hover:text-slate-700 bg-transparent border-0 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="flex flex-col gap-4">
              
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Título del Evento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Cerámica"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 flat-input text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Fecha de Inicio *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 flat-input text-xs"
                />
              </div>

              {/* ASIGNACIÓN MÚLTIPLE DE MIEMBROS */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Miembros Asignados *
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedMembers([])}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                      selectedMembers.length === 0
                        ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm font-black'
                        : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    TODOS
                  </button>
                  {members.map((m) => {
                    const isSelected = selectedMembers.includes(m.firstName);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedMembers(selectedMembers.filter(name => name !== m.firstName));
                          } else {
                            setSelectedMembers([...selectedMembers, m.firstName]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm font-black'
                            : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {m.firstName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CHECKBOX PERIODICIDAD - Oculto en Edición */}
              {!editingEvent && (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="checkbox"
                    id="recurrent-check"
                    checked={isRecurrent}
                    onChange={(e) => {
                      setIsRecurrent(e.target.checked);
                      setRecurrenceError('');
                      if (e.target.checked && date) {
                        const dateObj = new Date(date);
                        setSelectedDays([dateObj.getDay()]);
                      }
                    }}
                    className="rounded text-blue-600 focus:ring-blue-500 border-slate-300 h-4 w-4 cursor-pointer"
                  />
                  <label htmlFor="recurrent-check" className="text-xs font-bold text-slate-700 cursor-pointer">
                    ¿Hacer este evento periódico/recurrente?
                  </label>
                </div>
              )}

              {isRecurrent && (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col gap-3.5 animate-fadeIn">
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Repetir cada</label>
                    <select
                      value={recurrenceType}
                      onChange={(e) => {
                        setRecurrenceType(e.target.value);
                        setRecurrenceError('');
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-600 bg-white"
                    >
                      <option value="daily">Todos los días</option>
                      <option value="weekly_days">Cada semana</option>
                      <option value="biweekly">Cada 2 semanas</option>
                      <option value="monthly">Cada mes</option>
                      <option value="quarterly">Cada trimestre</option>
                      <option value="yearly">Cada año</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide flex items-center justify-between">
                      <span>Días de la semana</span>
                      <span className="text-[8px] text-slate-400 font-bold">Opcional</span>
                    </label>
                    <div className="flex justify-between gap-1">
                      {[
                        { key: 1, label: 'L' },
                        { key: 2, label: 'M' },
                        { key: 3, label: 'X' },
                        { key: 4, label: 'J' },
                        { key: 5, label: 'V' },
                        { key: 6, label: 'S' },
                        { key: 0, label: 'D' }
                      ].map((day) => {
                        const isSelected = selectedDays.includes(day.key);
                        return (
                          <button
                            key={day.key}
                            type="button"
                            onClick={() => {
                              setRecurrenceError('');
                              if (isSelected) {
                                setSelectedDays(selectedDays.filter(d => d !== day.key));
                              } else {
                                setSelectedDays([...selectedDays, day.key]);
                              }
                            }}
                            className={`h-7 w-7 rounded-full text-[10px] font-black transition-all ${
                              isSelected
                                ? 'bg-blue-600 text-white font-extrabold shadow shadow-blue-500/20'
                                : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'
                            }`}
                          >
                            {day.label}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[8px] text-slate-400 font-bold mt-0.5 leading-normal">
                      * Selecciona los días para repetición semanal/quincenal. Si se deja vacío, se repetirá estrictamente en el mismo día de la fecha de inicio.
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Repetir hasta *</label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setRecurrenceError('');
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-600"
                    />
                  </div>

                  {recurrenceError && (
                    <p className="text-[9px] text-red-500 font-extrabold leading-snug">{recurrenceError}</p>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Tipo de Evento</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'escolar', label: 'Escolar' },
                    { id: 'extraescolar', label: 'Extraescolar' },
                    { id: 'cumpleanos', label: 'Cumpleaños' },
                    { id: 'hito', label: 'Hito' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setType(item.id);
                        if (item.id !== 'cumpleanos') {
                          setBirthYear('');
                          setBirthdayLabel('');
                        }
                      }}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        type === item.id
                          ? 'bg-blue-50 border-blue-200 text-blue-600'
                          : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {type !== 'cumpleanos' && (
                <div className="flex flex-col gap-1 animate-fadeIn">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    Descripción / Notas
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Detalles o notas adicionales..."
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 flat-input text-xs"
                  />
                </div>
              )}

              {type === 'cumpleanos' && (
                <div className="flex flex-col gap-3.5 animate-fadeIn">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Nombre / Etiqueta del Homenajeado (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Abuelo Jesús"
                      value={birthdayLabel}
                      onChange={(e) => setBirthdayLabel(e.target.value)}
                      className="w-full px-3.5 py-2.5 flat-input text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Año de Nacimiento (Opcional)
                    </label>
                    <input
                      type="number"
                      min="1900"
                      max={currentYear}
                      placeholder="Ej: 2018 (para calcular edad)"
                      value={birthYear}
                      onChange={(e) => setBirthYear(e.target.value)}
                      className="w-full px-3.5 py-2.5 flat-input text-xs"
                    />
                  </div>
                </div>
              )}

              {/* LISTADO DE ADJUNTOS ACTUALES */}
              {attachmentsList.length > 0 && (
                <div className="flex flex-col gap-2 bg-blue-50/20 p-3 rounded-xl border border-blue-100/50">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Adjuntos de este Evento ({attachmentsList.length})</span>
                  <div className="flex flex-col gap-1.5">
                    {attachmentsList.map((att, idx) => (
                      <div key={att.id || idx} className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-lg border border-slate-100 text-xs shadow-sm">
                        <span className="font-semibold text-slate-700 truncate max-w-[240px]">
                          {att.type === 'text' && `📝 Nota: ${att.textContent.substring(0, 30)}${att.textContent.length > 30 ? '...' : ''}`}
                          {att.type === 'document' && `📄 Doc: ${att.fileName || 'Archivo'}`}
                          {att.type === 'image' && `🖼️ Imagen`}
                          {att.type === 'voice' && `🎤 Nota de Voz`}
                          {att.type === 'url' && `🔗 Web: ${att.label || att.url}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => setAttachmentsList(attachmentsList.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-slate-50 transition-colors bg-transparent border-0 cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECCIÓN AÑADIR ADJUNTOS */}
              <div className="flex flex-col gap-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Añadir Adjuntos
                </label>
                
                <div className="grid grid-cols-3 gap-1 mb-2">
                  {[
                    { id: 'text', label: 'Texto/Nota' },
                    { id: 'document', label: 'PDF/Doc' },
                    { id: 'image', label: 'Imagen' },
                    { id: 'voice', label: 'Voz' },
                    { id: 'url', label: 'Enlace URL' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setContentType(contentType === item.id ? '' : item.id);
                        setFileUrl('');
                        setTextContent('');
                        setRecordedAudioUrl('');
                        setSelectedFileName('');
                        setSelectedFileSize(0);
                        setFileErrorMsg('');
                        setVoiceInputMode('record');
                        setVoiceFileErrorMsg('');
                        setTempUrl('');
                        setTempUrlLabel('');
                        if (isRecording) stopRecording();
                      }}
                      className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        contentType === item.id
                          ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm font-bold'
                          : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {contentType === 'text' && (
                  <div className="flex flex-col gap-1.5 mt-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Nota Adjunta *</label>
                    <textarea
                      rows={3}
                      placeholder="Escribe el contenido de la nota aquí..."
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={!textContent.trim()}
                      onClick={() => {
                        const newAtt = {
                          id: `att-${Date.now()}`,
                          type: 'text',
                          textContent: textContent
                        };
                        setAttachmentsList([...attachmentsList, newAtt]);
                        setTextContent('');
                        setContentType('');
                      }}
                      className="mt-1 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-0"
                    >
                      Insertar Nota
                    </button>
                  </div>
                )}

                {(contentType === 'document' || contentType === 'image') && (
                  <div className="flex flex-col gap-2 mt-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                      {contentType === 'image' ? 'Seleccionar Imagen *' : 'Seleccionar Documento *'}
                    </label>
                    
                    <div className="relative border border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-4 transition-colors bg-white flex flex-col items-center justify-center text-center group cursor-pointer">
                      <input
                        type="file"
                        accept={contentType === 'image' ? 'image/*' : '.pdf,.txt,.doc,.docx,.xls,.xlsx,.rtf'}
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      
                      {fileUrl ? (
                        <div className="flex flex-col items-center gap-1.5 w-full">
                          {contentType === 'image' ? (
                            <img src={fileUrl} alt="Preview" className="max-h-20 object-contain rounded border border-slate-100 p-0.5 bg-slate-50" />
                          ) : (
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                              <FileText size={20} />
                            </div>
                          )}
                          <div className="text-[10px] font-bold text-slate-700 truncate max-w-[180px]">
                            {selectedFileName || 'Archivo cargado'}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setFileUrl('');
                              setSelectedFileName('');
                              setSelectedFileSize(0);
                            }}
                            className="text-[9px] text-red-500 font-bold hover:underline bg-transparent border-0 cursor-pointer"
                          >
                            Quitar archivo
                          </button>
                        </div>
                      ) : (
                        <>
                          <UploadCloud size={20} className="text-slate-400 group-hover:scale-110 transition-transform shadow-sm mb-1" />
                          <p className="text-[10px] font-bold text-slate-600">Subir {contentType === 'image' ? 'imagen' : 'documento'}</p>
                          <p className="text-[8px] text-slate-400 font-bold">Máx. 5MB</p>
                        </>
                      )}
                    </div>
                    
                    {fileErrorMsg && (
                      <p className="text-[9px] text-red-500 font-bold text-center">{fileErrorMsg}</p>
                    )}

                    <button
                      type="button"
                      disabled={!fileUrl}
                      onClick={() => {
                        const newAtt = {
                          id: `att-${Date.now()}`,
                          type: contentType,
                          fileUrl: fileUrl,
                          fileName: selectedFileName || (contentType === 'image' ? 'Imagen' : 'Documento')
                        };
                        setAttachmentsList([...attachmentsList, newAtt]);
                        setFileUrl('');
                        setSelectedFileName('');
                        setSelectedFileSize(0);
                        setContentType('');
                      }}
                      className="mt-1 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-0"
                    >
                      Insertar Archivo
                    </button>
                  </div>
                )}

                {contentType === 'voice' && (
                  <div className="flex flex-col gap-2.5 bg-white border border-slate-200/50 p-3 rounded-xl mt-1 text-center">
                    <div className="flex bg-slate-100 p-0.5 rounded-lg gap-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setVoiceInputMode('record');
                          setFileUrl('');
                          setRecordedAudioUrl('');
                          setSelectedFileName('');
                          setSelectedFileSize(0);
                          setVoiceFileErrorMsg('');
                        }}
                        className={`flex-1 py-1 rounded text-[9px] font-bold transition-all cursor-pointer border-0 ${
                          voiceInputMode === 'record'
                            ? 'bg-white text-slate-800 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 bg-transparent'
                        }`}
                      >
                        Grabar Micrófono
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setVoiceInputMode('upload');
                          setFileUrl('');
                          setRecordedAudioUrl('');
                          setSelectedFileName('');
                          setSelectedFileSize(0);
                          setVoiceFileErrorMsg('');
                          if (isRecording) stopRecording();
                        }}
                        className={`flex-1 py-1 rounded text-[9px] font-bold transition-all cursor-pointer border-0 ${
                          voiceInputMode === 'upload'
                            ? 'bg-white text-slate-800 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 bg-transparent'
                        }`}
                      >
                        Cargar Audio
                      </button>
                    </div>

                    {voiceInputMode === 'record' ? (
                      <div className="flex flex-col items-center gap-2 py-1.5">
                        {isRecording ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] font-bold text-red-500 animate-pulse">Grabando... {formatTime(recordingSeconds)}</span>
                            <button
                              type="button"
                              onClick={stopRecording}
                              className="h-9 w-9 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow shadow-red-500/20 border-0 cursor-pointer"
                            >
                              <Square size={16} fill="white" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[9px] text-slate-400 font-bold">Pulsa para empezar a grabar</span>
                            <button
                              type="button"
                              onClick={startRecording}
                              className="h-9 w-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow shadow-blue-500/20 border-0 cursor-pointer"
                            >
                              <Mic size={16} />
                            </button>
                          </div>
                        )}

                        {recordedAudioUrl && (
                          <div className="w-full flex flex-col gap-1 mt-1 border-t border-slate-100 pt-2">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-left">Preescucha de Grabación:</span>
                            <audio src={recordedAudioUrl} controls className="w-full h-8" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 py-1">
                        <div className="relative border border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-4 transition-colors bg-white flex flex-col items-center justify-center text-center group cursor-pointer">
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={handleVoiceFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          
                          {fileUrl ? (
                            <div className="flex flex-col items-center gap-1.5 w-full">
                              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-full">
                                <Volume2 size={18} />
                              </div>
                              <div className="text-[10px] font-bold text-slate-700 truncate max-w-[180px]">
                                {selectedFileName || 'Audio cargado'}
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setFileUrl('');
                                  setRecordedAudioUrl('');
                                  setSelectedFileName('');
                                  setSelectedFileSize(0);
                                }}
                                className="text-[9px] text-red-500 font-bold hover:underline bg-transparent border-0 cursor-pointer"
                              >
                                Quitar audio
                              </button>
                            </div>
                          ) : (
                            <>
                              <UploadCloud size={20} className="text-slate-400 group-hover:scale-110 transition-transform shadow-sm mb-1" />
                              <p className="text-[10px] font-bold text-slate-600">Subir archivo de audio</p>
                              <p className="text-[8px] text-slate-400 font-bold">Formatos: MP3, WAV, WebM (Máx. 8MB)</p>
                            </>
                          )}
                        </div>

                        {recordedAudioUrl && (
                          <div className="w-full mt-1.5 text-left bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span className="text-[9px] font-bold text-slate-400 block mb-1">Preescucha del archivo:</span>
                            <audio src={recordedAudioUrl} controls className="w-full h-8" />
                          </div>
                        )}

                        {voiceFileErrorMsg && (
                          <p className="text-[9px] text-red-500 font-bold text-center mt-1">{voiceFileErrorMsg}</p>
                        )}
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={!fileUrl}
                      onClick={() => {
                        const newAtt = {
                          id: `att-${Date.now()}`,
                          type: 'voice',
                          fileUrl: fileUrl,
                          fileName: selectedFileName || 'Nota de voz'
                        };
                        setAttachmentsList([...attachmentsList, newAtt]);
                        setFileUrl('');
                        setRecordedAudioUrl('');
                        setSelectedFileName('');
                        setSelectedFileSize(0);
                        setContentType('');
                      }}
                      className="mt-1 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-0"
                    >
                      Insertar Nota de Voz
                    </button>
                  </div>
                )}

                {contentType === 'url' && (
                  <div className="flex flex-col gap-2 mt-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Dirección Web (URL) *</label>
                    <input
                      type="text"
                      placeholder="Ej: https://colegio.com/boletin"
                      value={tempUrl}
                      onChange={(e) => setTempUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:outline-none"
                    />
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Etiqueta del enlace</label>
                    <input
                      type="text"
                      placeholder="Ej: Portal Escolar"
                      value={tempUrlLabel}
                      onChange={(e) => setTempUrlLabel(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={!tempUrl.trim()}
                      onClick={() => {
                        let formattedUrl = tempUrl.trim();
                        if (!/^https?:\/\//i.test(formattedUrl)) {
                          formattedUrl = 'https://' + formattedUrl;
                        }
                        const newAtt = {
                          id: `att-${Date.now()}`,
                          type: 'url',
                          url: formattedUrl,
                          label: tempUrlLabel.trim() || tempUrl.trim()
                        };
                        setAttachmentsList([...attachmentsList, newAtt]);
                        setTempUrl('');
                        setTempUrlLabel('');
                        setContentType('');
                      }}
                      className="mt-1 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-0"
                    >
                      Insertar Enlace URL
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="text-xs font-bold text-slate-400 px-3 py-2 cursor-pointer bg-transparent border-0"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/10 cursor-pointer border-0"
                >
                  {editingEvent ? 'Guardar Cambios' : 'Añadir Evento'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL CONFIRMACIÓN BORRAR EVENTO RECURRENTE */}
      {showDeleteRecurrentModal && eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-xl relative text-center">
            <div className="h-12 w-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3 animate-bounce">
              <Trash2 size={20} />
            </div>
            
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-1">
              Eliminar Evento Periódico
            </h3>
            <p className="text-[10px] text-slate-400 font-bold mb-5 leading-normal">
              El evento "{eventToDelete.title}" es periódico.<br />¿Cómo deseas eliminarlo del Calendario?
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => confirmDeleteEvent(false)}
                className="w-full py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors shadow-sm"
              >
                Eliminar sólo esta fecha
              </button>
              <button
                onClick={() => confirmDeleteEvent(true)}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-sm"
              >
                Eliminar todas las repeticiones
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteRecurrentModal(false);
                  setEventToDelete(null);
                }}
                className="text-xs font-bold text-slate-400 px-3 py-2 mt-2 hover:underline"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VISOR LIGHTBOX IMÁGENES (PANTALLA COMPLETA) */}
      {activeImagePreview && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn cursor-zoom-out"
          onClick={() => setActiveImagePreview(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] flex flex-col items-center gap-4">
            <button 
              onClick={() => setActiveImagePreview(null)}
              className="absolute -top-10 right-0 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border-0 cursor-pointer"
            >
              <X size={20} />
            </button>
            
            <img 
              src={activeImagePreview.fileUrl} 
              alt={activeImagePreview.title} 
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl cursor-default"
              onClick={(e) => e.stopPropagation()}
            />
            
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadFile({ title: activeImagePreview.title, fileUrl: activeImagePreview.fileUrl });
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow border-0 cursor-pointer"
              >
                <Download size={12} />
                Descargar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VISOR TEXTO PLANO ADJUNTO INLINE */}
      {activeDocumentPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-xl relative flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 truncate pr-4">
                Visor de texto: {activeDocumentPreview.title}
              </h3>
              <button 
                onClick={() => setActiveDocumentPreview(null)} 
                className="text-slate-400 hover:text-slate-700 bg-transparent border-0 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 border border-slate-100 rounded-xl mb-4 text-slate-700 text-xs font-mono whitespace-pre-wrap leading-relaxed">
              {activeDocumentPreview.content}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 shrink-0">
              <button
                onClick={() => setActiveDocumentPreview(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer bg-white transition-colors"
              >
                Cerrar Visor
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
