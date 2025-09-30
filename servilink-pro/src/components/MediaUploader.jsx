// src/components/MediaUploader.jsx - Upload de fotos y videos
import React, { useState, useRef } from 'react';
import { Camera, X, Upload, Film, Image as ImageIcon } from 'lucide-react';

const MediaUploader = ({ 
  onUpload, 
  maxFiles = 5, 
  acceptVideo = false,
  className = '' 
}) => {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (files.length + selectedFiles.length > maxFiles) {
      alert(`Máximo ${maxFiles} archivos permitidos`);
      return;
    }

    selectedFiles.forEach(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB max
        alert('El archivo es muy grande (máx 10MB)');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => [...prev, {
          url: e.target.result,
          type: file.type.startsWith('video') ? 'video' : 'image',
          file: file
        }]);
      };
      reader.readAsDataURL(file);
    });

    setFiles([...files, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        // Simular upload - aquí iría la llamada real a la API
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              url: URL.createObjectURL(file),
              type: file.type,
              name: file.name
            });
          }, 1000);
        });
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      onUpload(uploadedFiles);
      
      // Limpiar después del upload
      setFiles([]);
      setPreviews([]);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error al subir archivos');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Botones de acción */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="bg-blue-50 border-2 border-blue-200 text-blue-600 py-3 rounded-xl font-medium hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2"
        >
          <Camera className="w-5 h-5" />
          <span>Tomar Foto</span>
        </button>
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="bg-gray-50 border-2 border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
        >
          <Upload className="w-5 h-5" />
          <span>Galería</span>
        </button>
      </div>

      {/* Vista previa de archivos */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {previews.map((preview, index) => (
            <div key={index} className="relative">
              {preview.type === 'video' ? (
                <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                  <Film className="w-8 h-8 text-gray-500" />
                </div>
              ) : (
                <img
                  src={preview.url}
                  alt={`Preview ${index}`}
                  className="w-full aspect-square object-cover rounded-lg"
                />
              )}
              
              <button
                onClick={() => removeFile(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          {previews.length < maxFiles && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors"
            >
              <ImageIcon className="w-8 h-8 mb-1" />
              <span className="text-xs">Agregar</span>
            </button>
          )}
        </div>
      )}

      {/* Botón de upload */}
      {files.length > 0 && (
        <button
          onClick={uploadFiles}
          disabled={uploading}
          className="w-full bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
        >
          {uploading ? 'Subiendo...' : `Subir ${files.length} archivo(s)`}
        </button>
      )}

      {/* Inputs ocultos */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptVideo ? "image/*,video/*" : "image/*"}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Información */}
      <p className="text-xs text-gray-500 text-center">
        Máximo {maxFiles} archivos, 10MB cada uno
        {acceptVideo && ' • Fotos y videos permitidos'}
      </p>
    </div>
  );
};

export default MediaUploader;