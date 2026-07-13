import React from 'react';
import { CalendarioBase } from './CalendarioBase';
import type { DiaCalendarioUi } from '@/types/evolucionStock/evolucionStockTypes';

interface Props {
  mesActual: Date;
  onMesChange: (fecha: Date) => void;
  onDiaClick: (dia: DiaCalendarioUi) => void;
}

export const CalendarioCompras: React.FC<Props> = ({ mesActual, onMesChange, onDiaClick }) => {
  return (
    <CalendarioBase
      tipo="compras"
      titulo="Compras"
      interactivo
      mesActual={mesActual}
      onMesChange={onMesChange}
      onDiaClick={onDiaClick}
    />
  );
};
