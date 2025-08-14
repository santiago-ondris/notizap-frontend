import React from 'react';
import { cn } from '@/lib/utils';
import type { EstadoDia } from '@/types/vendedoras/comisionTypes';
import { comisionEstados } from '@/utils/vendedoras/comisionHelpers';

interface Props {
  estado: EstadoDia;
  showText?: boolean;
  showEmoji?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ComisionEstadoChip: React.FC<Props> = ({
  estado,
  showText = true,
  showEmoji = true,
  size = 'md',
  className
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-sm';
      default:
        return 'px-3 py-1.5 text-xs';
    }
  };

  const getContent = () => {
    const emoji = showEmoji ? comisionEstados.emojiEstado(estado) : '';
    const text = showText ? comisionEstados.textoEstado(estado).replace(/^[^a-zA-Z]*/, '') : '';
    
    if (showEmoji && showText) {
      return `${emoji} ${text}`;
    }
    
    return emoji || text;
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg border font-medium transition-colors',
        getSizeClasses(),
        comisionEstados.colorEstado(estado),
        className
      )}
    >
      {getContent()}
    </span>
  );
};