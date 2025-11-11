import { useState, useRef } from 'react';
import { validarArchivo, formatFileSize } from '../utils/imageUtils';
import './ImageUploader.css';

interface ImageUploaderProps {
  onUpload: (file: File) => Promise<void>;
  disabled?: boolean;
}

export default function ImageUploader({ onUpload, disabled = false }: ImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    // Limpiar errores anteriores
    setValidationError(null);
    setUploadError(null);

    // Validar archivo
    const validation = validarArchivo(file);
    if (!validation.valido) {
      setValidationError(validation.errores.join(', '));
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    // Establecer archivo y preview
    setSelectedFile(file);

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);
      await onUpload(selectedFile);
      
      // Limpiar después de subir exitosamente
      setSelectedFile(null);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      setUploadError(error.message || 'Error al subir la imagen');
      console.error('Error al subir imagen:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(null);
    setValidationError(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (!file) {
      return;
    }

    // Limpiar errores anteriores
    setValidationError(null);
    setUploadError(null);

    // Validar archivo
    const validation = validarArchivo(file);
    if (!validation.valido) {
      setValidationError(validation.errores.join(', '));
      return;
    }

    // Establecer archivo y preview
    setSelectedFile(file);

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="image-uploader">
      <div
        className={`upload-area ${preview ? 'has-preview' : ''} ${disabled ? 'disabled' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {preview ? (
          <div className="preview-container">
            <img src={preview} alt="Preview" className="preview-image" />
            <div className="preview-info">
              <p className="preview-filename">{selectedFile?.name}</p>
              <p className="preview-size">{selectedFile ? formatFileSize(selectedFile.size) : ''}</p>
            </div>
            <button
              type="button"
              className="btn-remove-preview"
              onClick={handleCancel}
              disabled={disabled || uploading}
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="upload-placeholder">
            <div className="upload-icon">📷</div>
            <p className="upload-text">Arrastra una imagen aquí o haz clic para seleccionar</p>
            <p className="upload-hint">JPG, PNG, GIF, WEBP (máx. 10MB)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              disabled={disabled || uploading}
              className="file-input"
            />
          </div>
        )}
      </div>

      {validationError && (
        <div className="upload-error">
          <span className="error-icon">⚠️</span>
          {validationError}
        </div>
      )}

      {uploadError && (
        <div className="upload-error">
          <span className="error-icon">❌</span>
          {uploadError}
        </div>
      )}

      {selectedFile && !validationError && (
        <div className="upload-actions">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleUpload}
            disabled={disabled || uploading}
          >
            {uploading ? 'Subiendo...' : 'Subir Imagen'}
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleCancel}
            disabled={disabled || uploading}
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}

