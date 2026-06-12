// Test simulation of email attachment formatting
const attachments = [
  {
    id: "att-1",
    type: "text",
    textContent: "Esta es una nota adjunta importante."
  },
  {
    id: "att-2",
    type: "image",
    fileUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    fileName: "captura.png"
  }
];

const formatAttachments = (atts) => {
  return atts && atts.length > 0
    ? atts.filter(att => att.type !== 'metadata_creator').map((att, idx) => {
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
};

console.log("Formatted Attachments output:");
console.log(formatAttachments(attachments));
