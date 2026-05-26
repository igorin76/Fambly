import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { 
  FileText, 
  Image as ImageIcon, 
  Lock, 
  Unlock, 
  Plus, 
  Trash2, 
  Edit2,
  AlertTriangle,
  X,
  FileCheck,
  ShieldCheck,
  Mic,
  Square,
  Volume2,
  Download,
  Eye,
  UploadCloud,
  FileDown,
  FileCode,
  ChevronDown,
  ChevronUp,
  Link,
  ExternalLink,
  Paperclip
} from 'lucide-react';

export default function AnnouncementBoard() {
  const { 
    announcements, 
    addAnnouncement, 
    updateAnnouncement,
    deleteAnnouncement, 
    members 
  } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [expandedAnnouncementIds, setExpandedAnnouncementIds] = useState([]);

  const toggleExpandAnnouncement = (annId) => {
    setExpandedAnnouncementIds(prev => 
      prev.includes(annId) ? prev.filter(id => id !== annId) : [...prev, annId]
    );
  };
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState(''); // '', 'text', 'document', 'image', 'voice', 'url'
  const [fileUrl, setFileUrl] = useState('');
  const [textContent, setTextContent] = useState('');
  const [attachmentsList, setAttachmentsList] = useState([]);
  const [tempUrl, setTempUrl] = useState('');
  const [tempUrlLabel, setTempUrlLabel] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);

  // Estados de carga de archivos locales
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileSize, setSelectedFileSize] = useState(0);
  const [fileErrorMsg, setFileErrorMsg] = useState('');

  // Estados del PIN de seguridad para datos confidenciales
  const [pinInput, setPinInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  // Estados Grabadora de Audio
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState('');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingTimer, setRecordingTimer] = useState(null);
  
  // Selección del modo de nota de voz: 'record' (Grabar) o 'upload' (Subir archivo)
  const [voiceInputMode, setVoiceInputMode] = useState('record');
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

  const handleSaveAnnouncement = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const annData = {
      title,
      description,
      attachments: attachmentsList,
      isEmergency
    };

    if (editingAnnouncement) {
      updateAnnouncement(editingAnnouncement.id, annData);
    } else {
      addAnnouncement(annData);
    }

    handleCloseModal();
  };

  const handleOpenEdit = (ann) => {
    setEditingAnnouncement(ann);
    setTitle(ann.title || '');
    setDescription(ann.description || '');
    setIsEmergency(ann.isEmergency || false);

    // Cargar adjuntos con normalización
    const rawAtts = ann.attachments || [];
    const normalized = rawAtts.map(att => ({
      id: att.id || `att-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      type: att.type || att.contentType,
      fileUrl: att.fileUrl || '',
      textContent: att.textContent || '',
      fileName: att.fileName || '',
      url: att.url || '',
      label: att.label || ''
    })).filter(att => att.type);

    setAttachmentsList(normalized);
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

  const handleCloseModal = () => {
    if (isRecording) {
      stopRecording();
    }
    setIsModalOpen(false);
    setEditingAnnouncement(null);
    setTitle('');
    setDescription('');
    setContentType('');
    setFileUrl('');
    setTextContent('');
    setAttachmentsList([]);
    setIsEmergency(false);
    setRecordedAudioUrl('');
    setRecordingSeconds(0);
    setSelectedFileName('');
    setSelectedFileSize(0);
    setFileErrorMsg('');
    setVoiceInputMode('record');
    setVoiceFileErrorMsg('');
    setTempUrl('');
    setTempUrlLabel('');
    if (recordingTimer) {
      clearInterval(recordingTimer);
      setRecordingTimer(null);
    }
  };

  // Manejo de la subida de archivos (PDF/Documento, Imagen)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validación de tamaño (Máximo 5MB)
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

    // Validación de tamaño (Máximo 8MB para archivos de audio)
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

    // Generar Blob URL local para preescucha
    const audioUrl = URL.createObjectURL(file);
    setRecordedAudioUrl(audioUrl);

    // Convertir a Base64 para almacenar
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
        
        // Convertir a Base64 para almacenar en la base de datos (Supabase)
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setFileUrl(reader.result); // Guardar el Data URL en base64
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

  const handleUnlockPin = (e) => {
    e.preventDefault();
    if (pinInput === '1234') {
      setIsUnlocked(true);
      setPinError(false);
      setShowPinModal(false);
      setPinInput('');
      
      setTimeout(() => {
        setIsUnlocked(false);
      }, 60000);
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  // Obtener extensión del archivo basada en el tipo MIME del Base64
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

  // Descargar archivo decodificando el Base64
  const handleDownloadFile = (ann) => {
    const base64Data = ann.fileUrl;
    if (!base64Data) return;

    try {
      const link = document.createElement('a');
      link.href = base64Data;

      const match = base64Data.match(/^data:(.*);base64,/);
      const mimeType = match ? match[1] : '';
      const ext = getExtensionFromMime(mimeType);

      const safeName = ann.title.toLowerCase()
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

  // Abrir o previsualizar un archivo
  const handleOpenFile = (ann) => {
    const base64Data = ann.fileUrl;
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
          title: ann.title,
          content: decodedText,
          type: 'text'
        });
      } catch (e) {
        alert("No se pudo previsualizar el archivo de texto. Inténtalo descargándolo.");
      }
    } else {
      // Descargar de forma predeterminada para otros formatos como Word o Excel
      handleDownloadFile(ann);
    }
  };

  // Deducir formato legible
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

  const renderAnnouncementAttachments = (ann) => {
    const rawAtts = ann.attachments || [];
    const normalized = rawAtts.length > 0
      ? rawAtts.map(att => ({ ...att, type: att.type || att.contentType }))
      : (ann.contentType && (ann.fileUrl || ann.textContent)
          ? [{
              id: `legacy-${ann.contentType}`,
              type: ann.contentType,
              fileUrl: ann.fileUrl,
              textContent: ann.textContent,
              fileName: ann.contentType === 'document' ? 'Archivo' : ann.contentType === 'voice' ? 'Nota de voz' : ''
            }]
          : []);

    if (normalized.length === 0) return null;

    return (
      <div className="mt-3 flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
        {normalized.map((att, index) => {
          const type = att.type;
          if (!type) return null;

          return (
            <div key={att.id || index} className="bg-slate-50 border border-slate-200/40 rounded-xl p-3 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1.5 mb-0.5">
                <span className={`p-1.5 rounded text-xs ${
                  type === 'document' ? 'bg-red-55 text-red-600' :
                  type === 'image' ? 'bg-emerald-50 text-emerald-600' :
                  type === 'voice' ? 'bg-indigo-50 text-indigo-600' :
                  type === 'url' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  {type === 'document' ? <FileText size={12} /> :
                   type === 'image' ? <ImageIcon size={12} /> :
                   type === 'voice' ? <Volume2 size={12} /> :
                   type === 'url' ? <Link size={12} /> : <FileCheck size={12} />}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  {
                    type === 'text' ? 'Texto / Nota' :
                    type === 'document' ? 'Documento' :
                    type === 'image' ? 'Imagen' :
                    type === 'voice' ? 'Nota de Voz' : 'Enlace Web'
                  }
                </span>
              </div>

              {type === 'text' && (
                <p className="text-xs text-slate-500 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto pr-1">
                  {att.textContent}
                </p>
              )}

              {type === 'voice' && (
                <audio src={att.fileUrl} controls className="w-full h-8 mt-0.5" />
              )}

              {type === 'image' && (
                <div 
                  className="rounded-lg border border-slate-200/50 overflow-hidden bg-white p-1 flex items-center justify-center min-h-[80px] max-h-40 cursor-pointer relative group/img"
                  onClick={() => setActiveImagePreview({ title: ann.title, fileUrl: att.fileUrl })}
                >
                  <img src={att.fileUrl} alt={ann.title} className="max-h-36 object-contain rounded" />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="p-1.5 rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition-colors">
                      <Eye size={12} />
                    </span>
                    <span 
                      className="p-1.5 rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadFile({ title: ann.title, fileUrl: att.fileUrl });
                      }}
                    >
                      <Download size={12} />
                    </span>
                  </div>
                </div>
              )}

              {type === 'document' && (
                <div className="flex items-center justify-between gap-3 bg-white p-2 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded shrink-0">
                      {getFormatLabel(att.fileUrl)}
                    </span>
                    <span className="text-xs font-bold text-slate-700 truncate">
                      {att.fileName || ann.title}
                    </span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenFile({ title: att.fileName || ann.title, fileUrl: att.fileUrl })}
                      className="p-1 rounded bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors"
                      title="Ver archivo"
                    >
                      <Eye size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadFile({ title: att.fileName || ann.title, fileUrl: att.fileUrl })}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-900 text-white transition-colors"
                      title="Descargar"
                    >
                      <Download size={11} />
                    </button>
                  </div>
                </div>
              )}

              {type === 'url' && (
                <a 
                  href={att.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl border border-blue-100 transition-colors w-fit"
                >
                  <ExternalLink size={12} />
                  <span className="font-bold text-xs truncate max-w-[160px]">{att.label || att.url}</span>
                </a>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Tablón de Anuncios</h2>
          <p className="text-sm text-slate-500">Documentación de uso recurrente: notas de voz, documentos de interés, imágenes y notas de texto.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/10 hover:scale-[1.02] touch-btn shrink-0 self-start sm:self-center"
        >
          <Plus size={15} />
          Añadir Anuncio
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LISTADO DE ANUNCIOS GENERALES */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Pizarra de la Nevera Digital</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {announcements.filter(a => !a.isEmergency).map((ann) => {
              const isExpanded = expandedAnnouncementIds.includes(ann.id);
              const rawAtts = ann.attachments || [];
              const normalizedCount = rawAtts.length > 0
                ? rawAtts.length
                : (ann.contentType && (ann.fileUrl || ann.textContent) ? 1 : 0);

              return (
                <div 
                  key={ann.id} 
                  onClick={() => toggleExpandAnnouncement(ann.id)}
                  className="flat-card p-5 border border-slate-200/60 bg-white flex flex-col justify-between shadow-sm relative group cursor-pointer hover:bg-slate-50/30 transition-all select-none"
                >
                  <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                    {(() => {
                      const firstAtt = rawAtts[0];
                      const resolvedType = firstAtt ? (firstAtt.type || firstAtt.contentType) : (ann.contentType || 'text');
                      
                      return (
                        <span className={`p-2 rounded-lg ${
                          resolvedType === 'pdf' || resolvedType === 'document' ? 'bg-red-50 text-red-600' :
                          resolvedType === 'image' ? 'bg-emerald-50 text-emerald-600' :
                          resolvedType === 'voice' ? 'bg-indigo-50 text-indigo-600' :
                          resolvedType === 'url' ? 'bg-blue-50 text-blue-700' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {resolvedType === 'pdf' || resolvedType === 'document' ? <FileText size={16} /> :
                           resolvedType === 'image' ? <ImageIcon size={16} /> :
                           resolvedType === 'voice' ? <Volume2 size={16} /> :
                           resolvedType === 'url' ? <Link size={16} /> : <FileCheck size={16} />}
                        </span>
                      );
                    })()}
                    
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(ann);
                        }}
                        className="text-slate-500 hover:text-blue-600 action-btn-mobile transition-all p-2 rounded-lg touch-btn"
                        title="Editar"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('¿Eliminar este anuncio?')) deleteAnnouncement(ann.id);
                        }}
                        className="text-slate-555 hover:text-red-600 action-btn-mobile transition-all p-2 rounded-lg touch-btn"
                        title="Eliminar"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 leading-snug">{ann.title}</h4>
                    {!isExpanded && normalizedCount > 0 && (
                      <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 flex items-center gap-0.5 font-bold shrink-0">
                        <Paperclip size={10} />
                        {normalizedCount}
                      </span>
                    )}
                  </div>
                  {ann.description && (
                    <p className={`text-xs mt-1 text-slate-400 ${ann.description.length > 80 && !isExpanded ? 'line-clamp-2' : ''}`}>{ann.description}</p>
                  )}
                  
                  {isExpanded && renderAnnouncementAttachments(ann)}
                  
                  <div className="mt-4 pt-2.5 border-t border-slate-100 text-[10px] text-slate-400 font-bold flex justify-between">
                    <span>Subido el: {new Date(parseInt(ann.id.split('-')[1]) || Date.now()).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>
              );
            })}

            {announcements.filter(a => !a.isEmergency).length === 0 && (
              <div className="col-span-full flat-card p-10 text-center border border-slate-200/50 bg-white">
                <FileCheck className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-500">Tablón vacío</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Graba notas de voz, sube circulares PDF o imágenes.</p>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: WIDGET DE EMERGENCIA PROTEGIDO */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">🔐 Widget de Emergencia</h3>
          
          <div className="flat-card p-5 border-2 border-red-100 bg-red-50/15 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-red-100/50 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-red-500 h-5 w-5" />
                <span className="font-extrabold text-xs uppercase tracking-wider text-slate-700">Fichas de Identidad</span>
              </div>
              <button
                onClick={() => {
                  if (isUnlocked) {
                    setIsUnlocked(false);
                  } else {
                    setShowPinModal(true);
                  }
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide border transition-all ${
                  isUnlocked 
                    ? 'bg-red-50 text-red-600 border-red-200' 
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {isUnlocked ? (
                  <>
                    <Lock size={12} />
                    Bloquear
                  </>
                ) : (
                  <>
                    <Unlock size={12} />
                    Desbloquear
                  </>
                )}
              </button>
            </div>

            {/* Listado de miembros con DNI y SS ocultos o mostrados */}
            <div className="flex flex-col gap-3">
              {members.map((member) => (
                <div key={member.id} className="p-3 bg-white border border-slate-200/60 rounded-xl shadow-sm flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-indigo-950">{member.firstName} {member.lastName}</span>
                    <span className="text-[9px] font-bold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-500">
                      {member.role}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-1 text-[11px] text-slate-500 mt-1 border-t border-slate-50 pt-1.5">
                    <div className="flex justify-between">
                      <span className="font-bold">DNI/Documento:</span>
                      <span className={`font-mono font-bold ${isUnlocked ? 'text-slate-800' : 'text-slate-300 select-none'}`}>
                        {isUnlocked 
                          ? (member.confidentialInfo?.split('/')[0]?.replace('DNI:', '')?.trim() || 'No asignado') 
                          : '•••••••••'
                        }
                      </span>
                    </div>
                    {member.confidentialInfo?.includes('SS:') && (
                      <div className="flex justify-between">
                        <span className="font-bold">Nº Seg. Social:</span>
                        <span className={`font-mono font-bold ${isUnlocked ? 'text-slate-800' : 'text-slate-300 select-none'}`}>
                          {isUnlocked 
                            ? (member.confidentialInfo?.split('SS:')[1]?.trim() || 'No asignado') 
                            : '••••••••••••'
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {!isUnlocked && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-[10px] text-amber-700 font-bold leading-relaxed">
                <AlertTriangle size={16} className="shrink-0 text-amber-500" />
                <span>Por privacidad, la visualización de documentos oficiales requiere el código PIN familiar.</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* MODAL SOLICITUD PIN */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xs bg-white border border-slate-200 rounded-2xl p-6 shadow-xl relative text-center">
            <div className="h-12 w-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Lock size={20} />
            </div>
            
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-1">Confirmación de Seguridad</h3>
            <p className="text-[10px] text-slate-400 font-bold mb-4">Ingresa el PIN de seguridad familiar para ver datos oficiales</p>

            <form onSubmit={handleUnlockPin} className="flex flex-col gap-3">
              <input
                type="password"
                maxLength={4}
                required
                placeholder="PIN familiar (Defecto: 1234)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full px-3 py-2 flat-input text-center text-sm font-bold tracking-widest"
                autoFocus
              />
              
              {pinError && (
                <p className="text-[10px] text-red-500 font-bold">PIN incorrecto. Inténtalo de nuevo (1234).</p>
              )}

              <div className="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowPinModal(false);
                    setPinInput('');
                    setPinError(false);
                  }}
                  className="text-xs font-bold text-slate-400 px-3 py-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                >
                  Confirmar PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREAR ANUNCIO / BOTTOM SHEET EN MÓVIL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div 
            className="w-full sm:max-w-md bg-white border-t sm:border border-slate-200/60 rounded-t-3xl rounded-b-none sm:rounded-2xl p-6 pb-12 sm:pb-6 shadow-2xl sm:shadow-xl relative overflow-y-auto max-h-[85vh] sm:max-h-[90vh] animate-slideUp sm:animate-fadeIn"
            style={{ paddingBottom: 'calc(max(env(safe-area-inset-bottom, 0px), 16px) + 16px)' }}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{editingAnnouncement ? 'Editar Anuncio' : 'Nuevo Anuncio'}</h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-700 p-2.5 touch-btn">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSaveAnnouncement} className="flex flex-col gap-4">
              
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Título *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Menú escolar Mayo"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 flat-input text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Descripción</label>
                <textarea
                  rows={2}
                  placeholder="Detalles adicionales del anuncio..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 flat-input text-xs"
                />
              </div>

              {/* LISTADO DE ADJUNTOS ACTUALES */}
              {attachmentsList.length > 0 && (
                <div className="flex flex-col gap-2 bg-blue-50/20 p-3 rounded-xl border border-blue-100/50">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Adjuntos de este Anuncio ({attachmentsList.length})</span>
                  <div className="flex flex-col gap-1.5">
                    {attachmentsList.map((att, idx) => (
                      <div key={att.id || idx} className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-lg border border-slate-100 text-xs shadow-sm">
                        <span className="font-semibold text-slate-700 truncate max-w-[200px]">
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
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-left">Preescucha:</span>
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
                            <span className="text-[9px] font-bold text-slate-400 block mb-1">Preescucha:</span>
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

              <div className="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="text-xs font-bold text-slate-400 px-3 py-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/10"
                >
                  {editingAnnouncement ? 'Guardar Cambios' : 'Publicar Anuncio'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* LIGHTBOX DE IMAGEN A PANTALLA COMPLETA */}
      {activeImagePreview && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-fadeIn"
             onClick={() => setActiveImagePreview(null)}>
          <div className="relative max-w-4xl max-h-[80vh] flex flex-col items-center"
               onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setActiveImagePreview(null)}
              className="absolute -top-12 right-0 text-white hover:text-slate-300 bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-sm transition-colors"
            >
              <X size={20} />
            </button>
            <img 
              src={activeImagePreview.fileUrl} 
              alt={activeImagePreview.title} 
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/10 bg-slate-900"
            />
            <div className="mt-4 flex items-center justify-between w-full px-2 text-white">
              <span className="text-sm font-black tracking-wide">{activeImagePreview.title}</span>
              <button
                onClick={() => handleDownloadFile(activeImagePreview)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-black transition-colors"
              >
                <Download size={13} />
                Descargar Imagen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VISOR DE DOCUMENTO TXT INTERNO */}
      {activeDocumentPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
             onClick={() => setActiveDocumentPreview(null)}>
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-xl relative"
               onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <FileCode className="text-blue-600 h-5 w-5" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{activeDocumentPreview.title}</h3>
              </div>
              <button onClick={() => setActiveDocumentPreview(null)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 overflow-y-auto max-h-[350px] font-mono text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
              {activeDocumentPreview.content}
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => setActiveDocumentPreview(null)}
                className="text-xs font-bold text-slate-400 px-3 py-2"
              >
                Cerrar Visor
              </button>
              <button
                onClick={() => {
                  const ann = announcements.find(a => a.title === activeDocumentPreview.title);
                  if (ann) handleDownloadFile(ann);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors"
              >
                <Download size={13} />
                Descargar Archivo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
