import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileSpreadsheet, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  archivo: File | null;
  onArchivoChange: (archivo: File | null) => void;
  disabled?: boolean;
}

export const DropzoneExcel: React.FC<Props> = ({ archivo, onArchivoChange, disabled }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      onArchivoChange(acceptedFiles[0]);
    }
  }, [onArchivoChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    disabled
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative rounded-xl border-2 border-dashed p-6 text-center transition-colors',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        isDragActive ? 'border-[#F23D5E] bg-[#F23D5E]/10' : 'border-white/20 bg-white/5 hover:bg-white/10',
        archivo && 'border-[#51590E]/50 bg-[#51590E]/10'
      )}
    >
      <input {...getInputProps()} />
      {archivo ? (
        <div className="flex items-center justify-center gap-3">
          <FileSpreadsheet className="w-8 h-8 text-[#51590E]" />
          <div className="text-left">
            <div className="font-medium text-white">{archivo.name}</div>
            <div className="text-xs text-white/50">{(archivo.size / 1024 / 1024).toFixed(2)} MB</div>
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onArchivoChange(null);
            }}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20"
            disabled={disabled}
          >
            <X className="w-4 h-4 text-white/70" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <Upload className="w-10 h-10 mx-auto text-white/50" />
          <div>
            <div className="font-medium text-white">Arrastra un Excel o haz clic para seleccionar</div>
            <div className="text-sm text-white/50">Solo .xlsx, maximo 10MB</div>
          </div>
        </div>
      )}
    </div>
  );
};
