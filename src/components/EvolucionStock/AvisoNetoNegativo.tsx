import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const AvisoNetoNegativo: React.FC = () => (
  <div className="flex items-start gap-3 rounded-2xl border border-[#FFD700]/30 bg-[#FFD700]/10 p-4">
    <AlertTriangle className="mt-0.5 h-5 w-5 text-[#FFD700]" />
    <p className="text-sm text-white/75">
      Las ventas superan las compras cargadas: probablemente existia stock previo al inicio del registro en este modulo.
    </p>
  </div>
);
