import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useStore } from '../../store/useStore';
import { getTaskStatus, formatDateSpanish } from '../../utils/dateHelpers';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  User, 
  Clock, 
  X,
  FileText,
  AlertTriangle,
  Info,
  Calendar,
  CheckSquare,
  Paperclip,
  ThumbsUp,
  Image as ImageIcon,
  Volume2,
  Mic,
  Square,
  Download,
  Eye,
  UploadCloud,
  FileCheck,
  FileDown,
  ChevronDown,
  ChevronUp,
  Link,
  ExternalLink
} from 'lucide-react';

export default function TaskManager() {
  const { 
    tasks, 
    addTask, 
    updateTask, 
    deleteTask, 
    toggleTaskCompleted, 
    acceptTask,
    currentUser,
    members = [],
    focusedTaskId,
    setFocusedTaskId
  } = useStore();

  const [expandedTaskIds, setExpandedTaskIds] = useState([]);

  const toggleExpandTask = (taskId) => {
    setExpandedTaskIds(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  // Desplazar a la tarea seleccionada y resaltar
  useEffect(() => {
    if (focusedTaskId) {
      setExpandedTaskIds(prev => prev.includes(focusedTaskId) ? prev : [...prev, focusedTaskId]);
      const timerScroll = setTimeout(() => {
        const element = document.getElementById(`task-card-${focusedTaskId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);

      const timerClear = setTimeout(() => {
        setFocusedTaskId(null);
      }, 4000);

      return () => {
        clearTimeout(timerScroll);
        clearTimeout(timerClear);
      };
    }
  }, [focusedTaskId, setFocusedTaskId]);

  const [activeTab, setActiveTab] = useState('todos'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [resolvingTaskId, setResolvingTaskId] = useState(null);

  // Estados Formulario
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scope, setScope] = useState('individual'); 
  const [assignedMemberIds, setAssignedMemberIds] = useState([]);
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [priority, setPriority] = useState('MEDIA');
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

  const activeMember = members.find(m => m.firstName === currentUser) || { id: 'mem-igor', firstName: 'Igor', role: 'Padre' };

  // Limpieza de intervalos al desmontar
  useEffect(() => {
    return () => {
      if (recordingTimer) clearInterval(recordingTimer);
    };
  }, [recordingTimer]);

  // Bloquear scroll del body al abrir el modal para mejorar la usabilidad (solo en PC)
  useEffect(() => {
    const isMobile = window.innerWidth < 640;
    if (isModalOpen && !isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

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

  const handleDownloadFile = (taskOrFile) => {
    const base64Data = taskOrFile.fileUrl;
    if (!base64Data) return;

    try {
      const link = document.createElement('a');
      link.href = base64Data;

      const match = base64Data.match(/^data:(.*);base64,/);
      const mimeType = match ? match[1] : '';
      const ext = getExtensionFromMime(mimeType);

      const safeName = taskOrFile.title.toLowerCase()
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

  const handleOpenFile = (taskOrFile) => {
    const base64Data = taskOrFile.fileUrl;
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
          title: taskOrFile.title,
          content: decodedText,
          type: 'text'
        });
      } catch (e) {
        alert("No se pudo previsualizar el archivo de texto. Inténtalo descargándolo.");
      }
    } else {
      handleDownloadFile(taskOrFile);
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

  const renderAttachmentsList = (attachmentsList, taskTitle) => {
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
                    setActiveImagePreview({ title: taskTitle, fileUrl: att.fileUrl });
                  }}
                >
                  <img src={att.fileUrl} alt={taskTitle} className="max-h-36 object-contain rounded" />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="p-1.5 rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition-colors">
                      <Eye size={12} />
                    </span>
                    <span 
                      className="p-1.5 rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadFile({ title: taskTitle, fileUrl: att.fileUrl });
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
                      {att.fileName || taskTitle}
                    </span>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenFile({ title: att.fileName || taskTitle, fileUrl: att.fileUrl });
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
                        handleDownloadFile({ title: att.fileName || taskTitle, fileUrl: att.fileUrl });
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

  const handleCloseModal = () => {
    if (isRecording) {
      stopRecording();
    }
    setIsModalOpen(false);
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setScope('individual');
    setAssignedMemberIds([activeMember.id]);
    setDueDate('');
    setCategory('GENERAL');
    setPriority('MEDIA');
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

  const handleOpenCreate = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setScope('individual');
    setAssignedMemberIds([activeMember.id]); 
    setDueDate('');
    setCategory('GENERAL');
    setPriority('MEDIA');
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
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setScope(task.scope || 'individual');
    setAssignedMemberIds(task.assignedMemberIds || []);
    setDueDate(task.dueDate || '');
    setCategory(task.category || 'GENERAL');
    setPriority(task.priority || 'MEDIA');
    
    // Cargar contenido adjunto con compatibilidad legacy
    const rawAtts = task.attachments || [];
    const normalized = rawAtts.map(att => {
      const resolvedType = att.type || att.contentType;
      return {
        id: att.id || `att-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        type: resolvedType,
        fileUrl: att.fileUrl || '',
        textContent: att.textContent || att.content || '',
        fileName: att.fileName || (resolvedType === 'document' ? 'Archivo cargado' : resolvedType === 'voice' ? 'Nota de voz' : ''),
        url: att.url || '',
        label: att.label || ''
      };
    }).filter(att => att.type);
    
    setAttachmentsList(normalized);
    setContentType('');
    setFileUrl('');
    setTextContent('');
    setSelectedFileName('');
    setSelectedFileSize(0);
    setFileErrorMsg('');
    setVoiceInputMode('record');
    setVoiceFileErrorMsg('');
    
    const firstVoice = normalized.find(att => att.type === 'voice');
    setRecordedAudioUrl(firstVoice ? firstVoice.fileUrl || '' : '');
    setRecordingSeconds(0);
    setTempUrl('');
    setTempUrlLabel('');
    setIsModalOpen(true);
  };

  const handleSaveTask = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Auto-guardar adjuntos que se hayan rellenado pero no insertado con el botón pequeño
    let finalAttachments = [...attachmentsList];
    if (textContent.trim()) {
      finalAttachments.push({
        id: `att-text-${Date.now()}`,
        type: 'text',
        textContent: textContent.trim()
      });
    }
    if (fileUrl) {
      const resolvedType = (contentType === 'image' || contentType === 'voice' || contentType === 'document')
        ? contentType
        : (fileUrl.startsWith('data:image/') ? 'image' : fileUrl.startsWith('data:audio/') ? 'voice' : 'document');
      
      finalAttachments.push({
        id: `att-file-${Date.now()}`,
        type: resolvedType,
        fileUrl: fileUrl,
        fileName: selectedFileName || (resolvedType === 'image' ? 'Imagen' : resolvedType === 'voice' ? 'Nota de voz' : 'Documento')
      });
    }
    if (tempUrl.trim()) {
      let formattedUrl = tempUrl.trim();
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = 'https://' + formattedUrl;
      }
      finalAttachments.push({
        id: `att-url-${Date.now()}`,
        type: 'url',
        url: formattedUrl,
        label: tempUrlLabel.trim() || tempUrl.trim()
      });
    }

    // Corregir la consistencia de ámbito (scope) al guardar/editar
    let resolvedScope = 'individual';
    if (assignedMemberIds.length > 1) {
      resolvedScope = 'matrimonial';
    } else if (assignedMemberIds.length === 1) {
      const assigned = members.find(m => m.id === assignedMemberIds[0]);
      if (assigned && (assigned.role === 'Hijo' || assigned.role === 'Hija')) {
        resolvedScope = 'ninos';
      }
    }

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      scope: resolvedScope,
      assignedMemberIds,
      dueDate,
      category,
      priority,
      attachments: finalAttachments,
      assignee: assignedMemberIds.map(id => members.find(m => m.id === id)?.firstName || '').join(', ') || 'Todos',
      children: assignedMemberIds.map(id => members.find(m => m.id === id)?.firstName || '')
    };

    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
    
    handleCloseModal();
  };

  const handleMemberToggle = (id) => {
    if (id === 'todos') {
      // Si ya están todos seleccionados, deseleccionar todos
      if (assignedMemberIds.length === members.length) {
        setAssignedMemberIds([]);
      } else {
        setAssignedMemberIds(members.map(m => m.id));
      }
      return;
    }
    if (assignedMemberIds.includes(id)) {
      setAssignedMemberIds(assignedMemberIds.filter(mid => mid !== id));
    } else {
      setAssignedMemberIds([...assignedMemberIds, id]);
    }
  };

  // --- MATRIZ DE CRITICIDAD VISUAL ---
  const getCriticality = (dueDate, priority, completed, completedSuccessfully = true) => {
    if (completed) {
      return completedSuccessfully
        ? { level: 'completada', label: 'Completada', color: 'bg-emerald-50 text-emerald-700 border-emerald-100/50' }
        : { level: 'completada', label: 'No completada', color: 'bg-rose-50 text-rose-700 border-rose-100/50' };
    }
    if (!dueDate) return { level: 'tiempo', label: 'En tiempo', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const limit = new Date(dueDate);
    limit.setHours(0, 0, 0, 0);
    const diffTime = limit.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { level: 'critica', label: 'Rojo Crítico (Vencido)', color: 'bg-red-50 text-red-700 border-red-200 border-2' };
    }
    
    // Cruce de Prioridad y Plazo
    if (priority === 'ALTA') {
      if (diffDays <= 2) {
        return { level: 'critica', label: 'Rojo Crítico (Menos de 48h)', color: 'bg-red-50 text-red-700 border-red-200 border-2 animate-pulse' };
      } else if (diffDays <= 7) {
        return { level: 'advertencia', label: 'Naranja Advertencia (Semana)', color: 'bg-orange-50 text-orange-700 border-orange-200' };
      }
    } else if (priority === 'MEDIA') {
      if (diffDays <= 3) {
        return { level: 'advertencia', label: 'Naranja Advertencia (Plazo Corto)', color: 'bg-orange-50 text-orange-700 border-orange-200' };
      }
    }
    
    return { level: 'tiempo', label: 'Verde En tiempo', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
  };

  const getTasksCountForTab = (tabId) => {
    return tasks.filter(task => {
      const isAssignee = task.assignedMemberIds && task.assignedMemberIds.includes(activeMember.id);
      const isGlobal = !task.assignedMemberIds || task.assignedMemberIds.length === 0;

      // Obtener los otros administradores de la familia
      const otherAdminIds = members.filter(m => m.isAdmin && m.id !== activeMember.id).map(m => m.id);
      const involvesOtherAdmins = task.assignedMemberIds && task.assignedMemberIds.some(id => otherAdminIds.includes(id));
      const involvesActiveMember = task.assignedMemberIds && task.assignedMemberIds.includes(activeMember.id);

      // Si la tarea involucra a otros administradores y el activo no está implicado, y no es el creador, NUNCA es visible
      if (involvesOtherAdmins && !involvesActiveMember && task.createdById !== activeMember.id) {
        return false;
      }

      if (tabId === 'individual') {
        return task.assignedMemberIds && task.assignedMemberIds.length === 1 && involvesActiveMember;
      }
      
      if (tabId === 'aceptacion') {
        return task.isAccepted === false && activeMember.isAdmin && involvesActiveMember && task.createdById !== activeMember.id;
      }
      
      if (tabId === 'matrimonial') {
        return involvesActiveMember && task.assignedMemberIds && task.assignedMemberIds.length > 1;
      }
      
      if (tabId === 'ninos') {
        const childMemberIds = members.filter(m => m.role === 'Hijo' || m.role === 'Hija').map(m => m.id);
        const involvesChildren = task.assignedMemberIds && task.assignedMemberIds.some(id => childMemberIds.includes(id));
        
        if (activeMember.isAdmin) {
          const associatedIds = activeMember.associatedMemberIds || [];
          const involvesAssociatedChildren = task.assignedMemberIds && task.assignedMemberIds.some(id => associatedIds.includes(id) && childMemberIds.includes(id));
          return task.scope === 'ninos' || involvesAssociatedChildren;
        }
        return (task.scope === 'ninos' || involvesChildren) && involvesActiveMember;
      }

      // Por defecto 'todos' (Todas)
      if (activeMember.isAdmin) {
        const associatedIds = activeMember.associatedMemberIds || [];
        const involvesAssociated = task.assignedMemberIds && task.assignedMemberIds.some(id => associatedIds.includes(id));
        return involvesActiveMember || involvesAssociated || isGlobal;
      } else {
        return involvesActiveMember || isGlobal;
      }
    }).length;
  };

  const filteredTasks = tasks.filter(task => {
    const isAssignee = task.assignedMemberIds && task.assignedMemberIds.includes(activeMember.id);
    const isGlobal = !task.assignedMemberIds || task.assignedMemberIds.length === 0;

    // Obtener los otros administradores de la familia
    const otherAdminIds = members.filter(m => m.isAdmin && m.id !== activeMember.id).map(m => m.id);
    const involvesOtherAdmins = task.assignedMemberIds && task.assignedMemberIds.some(id => otherAdminIds.includes(id));
    const involvesActiveMember = task.assignedMemberIds && task.assignedMemberIds.includes(activeMember.id);

    // Si la tarea involucra a otros administradores y el activo no está implicado, y no es el creador, NUNCA es visible
    if (involvesOtherAdmins && !involvesActiveMember && task.createdById !== activeMember.id) {
      return false;
    }

    if (activeTab === 'individual') {
      // Solo el usuario activo
      return task.assignedMemberIds && task.assignedMemberIds.length === 1 && involvesActiveMember;
    }
    
    if (activeTab === 'aceptacion') {
      return involvesActiveMember && !task.isAccepted && activeMember.isAdmin && task.createdById !== activeMember.id;
    }
    
    if (activeTab === 'matrimonial') {
      // El usuario activo y otra persona (longitud > 1)
      return involvesActiveMember && task.assignedMemberIds && task.assignedMemberIds.length > 1;
    }
    
    if (activeTab === 'ninos') {
      // El filtro Hijos afecta a todos los catalogados como hijos (Hijo o Hija)
      const childMemberIds = members.filter(m => m.role === 'Hijo' || m.role === 'Hija').map(m => m.id);
      const involvesChildren = task.assignedMemberIds && task.assignedMemberIds.some(id => childMemberIds.includes(id));
      
      if (activeMember.isAdmin) {
        const associatedIds = activeMember.associatedMemberIds || [];
        const involvesAssociatedChildren = task.assignedMemberIds && task.assignedMemberIds.some(id => associatedIds.includes(id) && childMemberIds.includes(id));
        return task.scope === 'ninos' || involvesAssociatedChildren;
      }
      return (task.scope === 'ninos' || involvesChildren) && involvesActiveMember;
    }

    // Por defecto activeTab === 'todos' (Todas)
    if (activeMember.isAdmin) {
      // Administrador ve:
      // 1. Sus propias tareas
      // 2. Las tareas de sus asociados
      // 3. Tareas globales
      const associatedIds = activeMember.associatedMemberIds || [];
      const involvesAssociated = task.assignedMemberIds && task.assignedMemberIds.some(id => associatedIds.includes(id));
      
      return involvesActiveMember || involvesAssociated || isGlobal;
    } else {
      // No administrador solo ve sus propias tareas o las globales donde esté implicado
      return involvesActiveMember || isGlobal;
    }
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // 1. Ordenar por completadas vs pendientes (pendientes primero)
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    
    // Si ambas están pendientes:
    if (!a.completed && !b.completed) {
      // Si ambas tienen fecha límite:
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      // Si solo una tiene fecha límite, la que tiene va primero
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      
      // Si ninguna tiene fecha límite, ordenamos por prioridad
      const priorityWeight = { ALTA: 0, MEDIA: 1, BAJA: 2 };
      return (priorityWeight[a.priority] || 1) - (priorityWeight[b.priority] || 1);
    }
    
    // Si ambas están completadas, mostrar las resueltas más recientemente primero (orden descendente por completedAt)
    if (a.completedAt && b.completedAt) {
      return new Date(b.completedAt) - new Date(a.completedAt);
    }
    if (a.completedAt && !b.completedAt) return -1;
    if (!a.completedAt && b.completedAt) return 1;
    
    return 0;
  });

  // Contador de pendientes de aceptar
  const pendingAcceptanceCount = tasks.filter(t => 
    !t.isAccepted && 
    activeMember && 
    activeMember.isAdmin && 
    t.assignedMemberIds && 
    t.assignedMemberIds.includes(activeMember.id) && 
    t.createdById !== activeMember.id
  ).length;

  // Renderizado optimizado y modular de cada tarjeta de tarea
  const renderTaskCard = (task) => {
    const criticality = getCriticality(task.dueDate, task.priority, task.completed, task.completedSuccessfully);
    const needsAcceptance = !task.isAccepted && 
      activeMember && 
      activeMember.isAdmin && 
      task.assignedMemberIds && 
      task.assignedMemberIds.includes(activeMember.id) && 
      task.createdById !== activeMember.id;
    
    const scopeNames = task.assignedMemberIds && task.assignedMemberIds.length > 0 
      ? task.assignedMemberIds.map(mid => members.find(m => m.id === mid)?.firstName).join(', ')
      : 'Todos';

    // Administradores pendientes de aceptación (excluyendo el creador)
    const pendingAdmins = members.filter(m => 
      m.isAdmin && 
      task.assignedMemberIds && 
      task.assignedMemberIds.includes(m.id) && 
      m.id !== task.createdById
    );
    const pendingAcceptanceNames = pendingAdmins.length > 0 
      ? pendingAdmins.map(m => m.firstName).join(', ')
      : 'Administradores';

    const isFocused = task.id === focusedTaskId;
    
    // Clases CSS dinámicas para la tarjeta
    let cardClasses = "";
    if (task.completed) {
      cardClasses = task.completedSuccessfully
        ? 'bg-emerald-50/20 border-l-4 border-l-emerald-500'
        : 'bg-rose-50/20 border-l-4 border-l-rose-500';
    } else if (isFocused) {
      cardClasses = 'bg-indigo-50/80 border-2 border-indigo-500 shadow-md ring-2 ring-indigo-500/20 scale-[1.01]';
    } else if (!task.isAccepted) {
      // Diseño para tareas pendientes de aceptar
      cardClasses = 'bg-amber-50/30 border-l-4 border-l-amber-500 border border-amber-200/50 hover:bg-amber-50/50 animate-pulse';
    } else {
      cardClasses = 'hover:bg-slate-50/10';
    }

    const isExpanded = expandedTaskIds.includes(task.id);
    
    return (
      <div 
        key={task.id}
        id={`task-card-${task.id}`}
        onClick={() => toggleExpandTask(task.id)}
        className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 cursor-pointer hover:bg-slate-50/40 select-none ${cardClasses}`}
      >
        
        {/* LADO IZQUIERDO: CHECKBOX Y TEXTOS */}
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <button
            disabled={!task.isAccepted} // No se puede completar si no se ha aceptado
            onClick={(e) => { 
              e.stopPropagation(); 
              if (task.completed) {
                toggleTaskCompleted(task.id, null, true);
              } else {
                setResolvingTaskId(task.id);
              }
            }}
            className={`h-7 w-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all mt-0.5 touch-btn ${
              task.completed 
                ? task.completedSuccessfully
                  ? 'bg-emerald-600 border-emerald-600 text-white' 
                  : 'bg-rose-600 border-rose-600 text-white'
                : !task.isAccepted 
                  ? 'border-amber-300 bg-amber-50 text-amber-500 cursor-not-allowed'
                  : 'border-slate-300 hover:border-blue-500'
            }`}
          >
            {task.completed && (
              task.completedSuccessfully 
                ? <Check size={15} className="stroke-[3]" /> 
                : <X size={15} className="stroke-[3]" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className={`text-sm font-bold truncate ${task.completed ? 'line-through text-slate-400 font-medium' : 'text-slate-800'}`}>
                {task.title}
              </p>
              
              {/* Indicador de adjuntos colapsado */}
              {!isExpanded && task.attachments && task.attachments.length > 0 && (
                <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 flex items-center gap-0.5 font-bold" title={`${task.attachments.length} adjuntos`}>
                  <Paperclip size={10} />
                  {task.attachments.length}
                </span>
              )}

              {/* Categoría Badge - Siempre visible */}
              <span className="text-[8px] bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded text-slate-500 font-bold uppercase tracking-wider">
                {task.category}
              </span>
              
              {/* Ámbito/Asignados - Siempre visible */}
              <span className="text-[9px] text-slate-400 font-bold">
                👤 {scopeNames}
              </span>
            </div>
            {task.description && (
              <p className={`text-xs mt-1 text-slate-400 ${task.completed && 'line-through'}`}>
                {task.description}
              </p>
            )}
            {task.completed && task.completedAt && (
              <p className={`text-[10px] font-bold mt-1.5 flex items-center gap-1.5 ${
                task.completedSuccessfully ? 'text-emerald-700' : 'text-rose-700'
              }`}>
                <Clock size={11} className="shrink-0" />
                {task.completedSuccessfully 
                  ? `Completada el ${formatDateSpanish(task.completedAt.split('T')[0])} a las ${new Date(task.completedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
                  : `Marcada como no completada el ${formatDateSpanish(task.completedAt.split('T')[0])} a las ${new Date(task.completedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
                }
              </p>
            )}
            {/* Contenido Adjunto Múltiple (Estilo Tablón) */}
            {isExpanded && renderAttachmentsList(task.attachments, task.title)}

            {/* Alerta de Aceptación */}
            {!task.isAccepted && (
              <div className="mt-2.5 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {needsAcceptance ? (
                  <>
                    <span className="text-[10px] text-amber-600 font-black uppercase tracking-wider bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                      Delegada - Pendiente de aceptar
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); acceptTask(task.id); }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-amber-500 hover:bg-amber-600 text-white text-[9px] font-black uppercase tracking-wider shadow-sm transition-all hover:scale-[1.02] touch-btn"
                    >
                      <ThumbsUp size={11} />
                      Aceptar Tarea
                    </button>
                  </>
                ) : (
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                    <Clock size={10} />
                    Espera de aceptación por {pendingAcceptanceNames}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* LADO DERECHO: CRITICIDAD Y ACCIONES */}
        <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0 border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0">
          
          {/* Badge de Matriz de Criticidad - Siempre visible */}
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1 whitespace-nowrap ${criticality.color}`}>
            {criticality.level === 'critica' && <AlertTriangle size={11} className="shrink-0" />}
            {criticality.level === 'advertencia' && <Info size={11} className="shrink-0" />}
            {task.dueDate ? formatDateSpanish(task.dueDate) : 'Sin fecha'}
          </span>

          {/* Acciones */}
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); handleOpenEdit(task); }}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all touch-btn"
              title="Editar"
            >
              <Edit2 size={15} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('¿Eliminar esta tarea?')) deleteTask(task.id);
              }}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all touch-btn"
              title="Eliminar"
            >
              <Trash2 size={15} />
            </button>
            
            {/* Indicador Chevron de Expansión */}
            <span className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors ml-1 touch-btn">
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </span>
          </div>

        </div>
      </div>
    );
  };

  // Dividir tareas filtradas en activas/completadas y pendientes de aceptar
  const activeAndCompletedTasks = sortedTasks.filter(t => t.isAccepted !== false);
  const tasksToAccept = sortedTasks.filter(t => t.isAccepted === false);

  return (
    <div className="flex flex-col gap-6">
      
      {/* CABECERA */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Listado de Tareas</h2>
          <p className="text-sm text-slate-500">Organiza y supervisa los objetivos diarios y semanales de la familia.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/10 hover:scale-[1.02] touch-btn"
        >
          <Plus size={15} />
          Nueva Tarea
        </button>
      </div>

      {/* TABS DE ÁMBITO (Segmented Control y Filtro Independiente) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 w-full">
        
        {/* FILTROS PRINCIPALES (Segmented Control) */}
        <div className="segmented-container max-w-2xl overflow-x-auto pb-1 hide-scrollbar snap-x snap-mandatory scroll-smooth flex-1 flex gap-1 bg-slate-100/80 p-1 rounded-xl">
          {[
            { id: 'todos', label: 'Todas' },
            { id: 'individual', label: 'Mis Tareas' },
            { id: 'matrimonial', label: 'Conjuntas' },
            { id: 'ninos', label: 'Hijos' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const count = getTasksCountForTab(tab.id);
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-3 text-center text-xs font-bold rounded-lg transition-all shrink-0 touch-btn snap-start flex items-center justify-center gap-1.5 ${
                  isActive
                    ? 'segmented-btn-active'
                    : 'segmented-btn-inactive'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black transition-colors ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-800'
                    : 'bg-slate-200/80 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* FILTRO INDEPENDIENTE: POR ACEPTAR */}
        <div className="flex shrink-0">
          <button
            onClick={() => setActiveTab('aceptacion')}
            className={`w-full md:w-auto py-2.5 px-4 text-center text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm border ${
              activeTab === 'aceptacion'
                ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/10'
                : pendingAcceptanceCount > 0
                  ? 'bg-amber-50 hover:bg-amber-100/80 text-amber-700 border-amber-200/60 animate-pulse'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            <span>Por Aceptar</span>
            <span className={`flex items-center justify-center text-[10px] w-5 h-5 rounded-full font-black transition-all ${
              activeTab === 'aceptacion'
                ? 'bg-amber-600 text-white'
                : pendingAcceptanceCount > 0
                  ? 'bg-amber-200 text-amber-800'
                  : 'bg-slate-100 text-slate-500'
            }`}>
              {pendingAcceptanceCount}
            </span>
            {pendingAcceptanceCount > 0 && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
            )}
          </button>
        </div>

      </div>

      {/* LISTADO DE TAREAS */}
      {sortedTasks.length > 0 ? (
        <div className="flex flex-col gap-4">
          
          {/* Bloque de Tareas Activas / Completadas */}
          {activeAndCompletedTasks.length > 0 && (
            <div className="flat-card divide-y divide-slate-100 overflow-hidden border border-slate-200/50 bg-white">
              {activeAndCompletedTasks.map((task) => renderTaskCard(task))}
            </div>
          )}

          {/* Separador y Cabecera de Tareas Pendientes de Aceptar en listado general */}
          {activeTab !== 'aceptacion' && tasksToAccept.length > 0 && (
            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-600">
                    Tareas Pendientes de Aceptar (Sin Iniciar)
                  </h4>
                  <span className="text-[10px] bg-amber-50 border border-amber-200/50 text-amber-700 font-bold px-2 py-0.5 rounded-full">
                    {tasksToAccept.length}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block">
                  Requieren confirmación entre administradores
                </p>
              </div>
              
              <div className="flat-card divide-y divide-slate-100 overflow-hidden border border-amber-200/60 bg-amber-50/5">
                {tasksToAccept.map((task) => renderTaskCard(task))}
              </div>
            </div>
          )}

          {/* En la pestaña de aceptación, renderizamos directamente las tareas a aceptar sin cabecera extra */}
          {activeTab === 'aceptacion' && tasksToAccept.length > 0 && (
            <div className="flat-card divide-y divide-slate-100 overflow-hidden border border-amber-200/60 bg-white">
              {tasksToAccept.map((task) => renderTaskCard(task))}
            </div>
          )}

        </div>
      ) : (
        <div className="flat-card p-12 text-center flex flex-col items-center justify-center border border-slate-200/50">
          <FileText className="h-10 w-10 text-slate-300 mb-2.5" />
          <h3 className="text-sm font-bold text-slate-600">No hay tareas</h3>
          <p className="text-xs text-slate-400 mt-1">Todas las tareas están completadas o no hay tareas en este filtro.</p>
        </div>
      )}

      {/* MODAL CREAR/EDITAR TAREA / PANTALLA COMPLETA EN MÓVIL Y GRID 2 COLUMNAS EN PC */}
      {isModalOpen && ReactDOM.createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center sm:items-start p-0 sm:p-4 sm:pt-20 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}
        >
          <form 
            onSubmit={handleSaveTask}
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-0 sm:relative sm:inset-auto w-full h-full sm:h-auto sm:max-w-4xl bg-white border-t sm:border border-slate-200/60 rounded-none sm:rounded-2xl shadow-2xl sm:flex sm:flex-col overflow-y-auto animate-slideUp sm:animate-none sm:mb-8"
          >
            
            {/* Cabecera sticky */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-20 shrink-0">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-bold tracking-tight text-slate-800">
                  {editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
                </h3>
                <span className="text-[10px] text-slate-400 font-medium">
                  {editingTask ? 'Modifica los detalles y guarda' : 'Completa los campos y crea la tarea'}
                </span>
              </div>
              <button 
                type="button"
                onClick={handleCloseModal} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-all border-0 cursor-pointer shrink-0"
              >
                <X size={15} />
              </button>
            </div>

            {/* Cuerpo con grid de dos columnas */}
            <div className="px-6 py-5 pb-8 sm:pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Columna Izquierda: Información básica de la Tarea */}
                <div className="flex flex-col gap-4">
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Título *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Reunión escolar Rodrigo"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 flat-input text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Descripción</label>
                    <textarea
                      rows={3}
                      placeholder="Detalles adicionales..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3.5 py-2.5 flat-input text-xs"
                    />
                  </div>

                  {/* Categoría y Prioridad */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Categoría</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2.5 flat-input text-xs text-slate-600"
                      >
                        <option value="GENERAL">General</option>
                        <option value="COLEGIO">Colegio 🏫</option>
                        <option value="TRABAJO">Trabajo 💼</option>
                        <option value="TRÁMITES">Trámites 📄</option>
                        <option value="CUMPLEAÑOS">Cumpleaños 🎂</option>
                        <option value="REGALOS">Regalos 🎁</option>
                        <option value="SALUD">Salud 🏥</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Prioridad</label>
                      <div className="grid grid-cols-3 gap-1 h-[38px]">
                        {['BAJA', 'MEDIA', 'ALTA'].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPriority(p)}
                            className={`text-[9px] font-bold rounded-xl border transition-all ${
                              priority === p
                                ? p === 'ALTA' ? 'bg-red-50 border-red-200 text-red-600' :
                                  p === 'MEDIA' ? 'bg-amber-50 border-amber-200 text-amber-600' :
                                  'bg-emerald-50 border-emerald-200 text-emerald-600'
                                : 'bg-white border-slate-200 text-slate-500'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Asignación de Miembros */}
                  <div className="flex flex-col gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Asignar a Miembros del Hogar</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleMemberToggle('todos')}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1 shrink-0 ${
                          assignedMemberIds.length === members.length
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        Todos
                      </button>
                      {members.map((m) => {
                        const isSelected = assignedMemberIds.includes(m.id);
                        const isKid = m.role === 'Hijo' || m.role === 'Hija';
                        const pillBg = isSelected 
                          ? isKid ? 'bg-orange-500 border-orange-500 text-white' : 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300';

                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => handleMemberToggle(m.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1 shrink-0 ${pillBg}`}
                          >
                            {m.firstName}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Fecha de Límite</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 flat-input text-xs"
                    />
                  </div>

                </div>

                {/* Columna Derecha: Gestión de Archivos y Adjuntos */}
                <div className="flex flex-col gap-4">
                  
                  {/* LISTADO DE ADJUNTOS ACTUALES */}
                  {attachmentsList.length > 0 && (
                    <div className="flex flex-col gap-2 bg-blue-50/20 p-3 rounded-xl border border-blue-100/50">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Adjuntos de esta Tarea ({attachmentsList.length})</span>
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
                              className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-slate-50 transition-colors"
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
                            if (isRecording) stopRecording();
                          }}
                          className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                            contentType === item.id
                              ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm'
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
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700"
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
                          className="mt-1 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
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
                                className="text-[9px] text-red-500 font-bold hover:underline"
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
                          className="mt-1 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
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
                            className={`flex-1 py-1 rounded text-[9px] font-bold transition-all ${
                              voiceInputMode === 'record'
                                ? 'bg-white text-slate-800 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
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
                            className={`flex-1 py-1 rounded text-[9px] font-bold transition-all ${
                              voiceInputMode === 'upload'
                                ? 'bg-white text-slate-800 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
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
                                  className="h-9 w-9 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow shadow-red-500/20"
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
                                  className="h-9 w-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow shadow-blue-500/20"
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
                                    className="text-[9px] text-red-500 font-bold hover:underline"
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
                          className="mt-1 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
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
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700"
                        />
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Etiqueta del enlace</label>
                        <input
                          type="text"
                          placeholder="Ej: Portal Escolar"
                          value={tempUrlLabel}
                          onChange={(e) => setTempUrlLabel(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700"
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
                          className="mt-1 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Insertar Enlace URL
                        </button>
                      </div>
                    )}
                  </div>

                </div> {/* Cierre Columna Derecha */}
              </div> {/* Cierre Grid 2 Columnas */}
            </div> {/* Cierre Cuerpo Scroll */}

            {/* Footer sticky en PC / Normal en Móvil */}
            <div 
              className="flex items-center gap-3 px-5 sm:px-6 pt-3 pb-3 sm:py-4 border-t border-slate-100 bg-white sm:sticky sm:bottom-0 z-20 shrink-0"
              style={{ paddingBottom: 'calc(max(env(safe-area-inset-bottom, 0px), 12px))' }}
            >
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 py-2.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm sm:text-xs transition-all border-0 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.97] text-white font-bold text-sm sm:text-xs shadow-md shadow-blue-500/20 transition-all border-0 cursor-pointer"
                style={{ flexGrow: 2 }}
              >
                {editingTask ? 'Guardar Cambios' : '+ Crear Tarea'}
              </button>
            </div>

          </form>
        </div>,
        document.body
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
            
            <div className="bg-slate-900/60 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 flex items-center gap-4 text-white text-xs font-bold shadow-xl cursor-default"
                 onClick={(e) => e.stopPropagation()}>
              <span className="truncate max-w-[200px]">{activeImagePreview.title}</span>
              <span className="h-4 w-px bg-white/20" />
              <button
                onClick={() => handleDownloadFile(activeImagePreview)}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-white hover:bg-slate-100 text-slate-900 border-0 font-bold text-[10px] tracking-wide uppercase transition-all shadow shadow-white/10"
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
      {/* DIÁLOGO / BOTTOM SHEET DE RESOLUCIÓN DE TAREA */}
      {resolvingTaskId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div 
            className="w-full sm:max-w-xs bg-white border-t sm:border border-slate-200/60 rounded-t-3xl rounded-b-none sm:rounded-2xl p-6 pb-10 sm:pb-6 shadow-2xl sm:shadow-xl relative animate-slideUp sm:animate-fadeIn"
            style={{ paddingBottom: 'calc(max(env(safe-area-inset-bottom, 0px), 16px) + 16px)' }}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Resolver Tarea
              </h3>
              <button 
                type="button"
                onClick={() => setResolvingTaskId(null)} 
                className="text-slate-400 hover:text-slate-700 bg-transparent border-0 p-1.5 cursor-pointer touch-btn"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              ¿Cómo quieres registrar esta tarea en el historial familiar?
            </p>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  toggleTaskCompleted(resolvingTaskId, true);
                  setResolvingTaskId(null);
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] touch-btn"
              >
                <Check size={16} className="stroke-[3]" />
                Completada exitosamente
              </button>

              <button
                type="button"
                onClick={() => {
                  toggleTaskCompleted(resolvingTaskId, false);
                  setResolvingTaskId(null);
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-500/10 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] touch-btn"
              >
                <X size={16} className="stroke-[3]" />
                Cerrar sin completar
              </button>

              <button
                type="button"
                onClick={() => setResolvingTaskId(null)}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center transition-all touch-btn"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
