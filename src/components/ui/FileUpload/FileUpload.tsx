// src/components/ui/FileUpload/FileUpload.tsx
import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudArrowUpIcon,
  XMarkIcon,
  DocumentIcon 
} from '@heroicons/react/24/outline';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  accept?: string;
  maxSize?: number; // in bytes
  className?: string;
}

export function FileUpload({
  onFileSelect,
  onFileRemove,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB default
  className = '',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const validateFile = (file: File) => {
    if (!file.type.match(accept.replace('/*', ''))) {
      setError('Invalid file type');
      return false;
    }
    if (file.size > maxSize) {
      setError(`File size must be less than ${maxSize / 1024 / 1024}MB`);
      return false;
    }
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;

    if (validateFile(droppedFile)) {
      setFile(droppedFile);
      onFileSelect(droppedFile);
      setError(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (validateFile(selectedFile)) {
      setFile(selectedFile);
      onFileSelect(selectedFile);
      setError(null);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
    onFileRemove?.();
  };

  return (
    <div className={className}>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative rounded-lg border-2 border-dashed p-6 text-center
          ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'}
          ${error ? 'border-red-300' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleFileSelect}
        />
        
        <div className="text-center">
          <CloudArrowUpIcon
            className="mx-auto h-12 w-12 text-gray-400"
            aria-hidden="true"
          />
          <div className="mt-4 flex text-sm text-gray-600">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
            >
              <span>Upload a file</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                accept={accept}
                onChange={handleFileSelect}
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">
            {accept.split(',').join(', ')} up to {maxSize / 1024 / 1024}MB
          </p>
        </div>

        <AnimatePresence>
          {file && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 flex items-center justify-center"
            >
              <DocumentIcon className="h-6 w-6 text-gray-400" />
              <span className="ml-2 text-sm text-gray-600">{file.name}</span>
              <button
                type="button"
                onClick={handleRemove}
                className="ml-2 text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}