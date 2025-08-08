import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';
import { getUIText } from '../../utils/hebrewUtils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, selectedFile }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
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
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2 hebrew-content">
        קובץ אודיו
      </label>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        {selectedFile ? (
          <div className="flex items-center justify-center space-x-2">
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
              תומך ב-MP3, WAV, M4A, AAC, OGG
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload; 