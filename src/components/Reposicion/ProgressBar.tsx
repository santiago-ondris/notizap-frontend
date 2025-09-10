import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProgressBarProps {
  progreso: number;
  mensaje?: string;
  mostrarPorcentaje?: boolean;
  animado?: boolean;
  color?: string;
  altura?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progreso,
  mensaje,
  mostrarPorcentaje = true,
  animado = true,
  color = '#51590E',
  altura = 'md'
}) => {
  const progresoNormalizado = Math.max(0, Math.min(100, progreso));
  
  const alturas = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  return (
    <div className="w-full">
      {(mensaje || mostrarPorcentaje) && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {animado && progreso > 0 && progreso < 100 && (
              <Loader2 className="w-4 h-4 text-white/70 animate-spin" />
            )}
            <span className="text-sm text-white/80">
              {mensaje || 'Procesando...'}
            </span>
          </div>
          
          {mostrarPorcentaje && (
            <span className="text-sm font-medium text-white">
              {Math.round(progresoNormalizado)}%
            </span>
          )}
        </div>
      )}
      
      <div className={`w-full bg-white/10 rounded-full overflow-hidden ${alturas[altura]}`}>
        <div
          className={`${alturas[altura]} transition-all duration-300 ease-out rounded-full relative overflow-hidden`}
          style={{
            width: `${progresoNormalizado}%`,
            backgroundColor: color
          }}
        >
          {animado && progresoNormalizado > 0 && progresoNormalizado < 100 && (
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"
              style={{
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s infinite'
              }}
            />
          )}
        </div>
      </div>
      
      <style>
        {`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        `}
      </style>
    </div>
  );
};