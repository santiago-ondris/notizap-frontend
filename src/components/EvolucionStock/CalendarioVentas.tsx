import React from 'react';
import { CalendarioBase } from './CalendarioBase';

interface Props {
  mesActual: Date;
  onMesChange: (fecha: Date) => void;
}

export const CalendarioVentas: React.FC<Props> = ({ mesActual, onMesChange }) => {
  return (
    <CalendarioBase
      tipo="ventas"
      titulo="Ventas"
      mesActual={mesActual}
      onMesChange={onMesChange}
    />
  );
};
