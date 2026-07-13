import React from 'react';
import { Circle, CheckCircle2, MinusCircle, Clock3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EstadoDiaCarga } from '@/types/evolucionStock/evolucionStockTypes';

interface Props {
  estado: EstadoDiaCarga | number;
  showText?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const normalizarEstadoDia = (estado: EstadoDiaCarga | number): EstadoDiaCarga => {
  if (typeof estado === 'string') return estado;

  return ['Cargado', 'SinMovimientos', 'Pendiente', 'Futuro'][estado] as EstadoDiaCarga ?? 'Pendiente';
};

export const EstadoDiaChip: React.FC<Props> = ({ estado, showText = true, size = 'md', className }) => {
  const estadoNormalizado = normalizarEstadoDia(estado);
  const Icon = {
    Cargado: CheckCircle2,
    SinMovimientos: MinusCircle,
    Pendiente: Clock3,
    Futuro: Circle
  }[estadoNormalizado];

  const label = {
    Cargado: 'Cargado',
    SinMovimientos: 'Sin movimientos',
    Pendiente: 'Pendiente',
    Futuro: 'Futuro'
  }[estadoNormalizado];

  const color = {
    Cargado: 'bg-[#51590E]/20 border-[#51590E]/40 text-[#DDE8A2]',
    SinMovimientos: 'bg-white/10 border-white/20 text-white/60',
    Pendiente: 'bg-[#FFD700]/15 border-[#FFD700]/40 text-[#FFD700]',
    Futuro: 'bg-white/5 border-white/10 text-white/35'
  }[estadoNormalizado];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg border font-medium',
        size === 'sm' ? 'gap-1 px-1.5 py-1 text-[10px]' : 'gap-2 px-3 py-1.5 text-xs',
        color,
        className
      )}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
      {showText && <span>{label}</span>}
    </span>
  );
};
