import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon, MusicalNoteIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, selectedFile }) => {
  const [fileWarning, setFileWarning] = useState<string | null>(null);
  
  const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
  const LARGE_FILE_THRESHOLD = 25 * 1024 * 1024; // 25MB (Whisper limit)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        setFileWarning(`File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 500MB.`);
        return;
      }
      
      // Warn about large files that will need chunking
      if (file.size > LARGE_FILE_THRESHOLD) {
        setFileWarning(`Large file detected (${(file.size / 1024 / 1024).toFixed(1)}MB). This file will be automatically split into smaller chunks for transcription, which may take longer.`);
      } else {
        setFileWarning(null);
      }
      
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.aac', '.ogg']
    },
    multiple: false
  });

  return (
    <div className="rtl-form">
      <label className="block text-sm font-medium text-gray-700 mb-2 hebrew-content">
        קובץ אודיו
      </label>
      
      {/* File size warning */}
      {fileWarning && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
            <p className="text-sm text-yellow-800 hebrew-content">{fileWarning}</p>
          </div>
        </div>
      )}
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors rtl-card ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        {selectedFile ? (
          <div className="flex items-center justify-center space-x-2 rtl-space-x-reverse">
            <MusicalNoteIcon className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm font-medium text-gray-900 hebrew-content">{selectedFile.name}</p>
              <p className="text-xs text-gray-500 hebrew-content">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        ) : (
          <div>
            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600 hebrew-content">
              {isDragActive
                ? 'שחרר את קובץ האודיו כאן'
                : 'גרור ושחרר קובץ אודיו, או לחץ לבחירה'}
            </p>
            <p className="text-xs text-gray-500 mt-1 hebrew-content">
              תומך ב-MP3, WAV, M4A, AAC, OGG (עד 500MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload; 