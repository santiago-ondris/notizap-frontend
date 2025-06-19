import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EnviosSelectorMesProps {
  año: number;
  mes: number;
  onCambioFecha: (año: number, mes: number) => void;
  cargando?: boolean;
}

// Constantes para los meses
const MESES = [
  { valor: 1, nombre: 'Enero' },
  { valor: 2, nombre: 'Febrero' },
  { valor: 3, nombre: 'Marzo' },
  { valor: 4, nombre: 'Abril' },
  { valor: 5, nombre: 'Mayo' },
  { valor: 6, nombre: 'Junio' },
  { valor: 7, nombre: 'Julio' },
  { valor: 8, nombre: 'Agosto' },
  { valor: 9, nombre: 'Septiembre' },
  { valor: 10, nombre: 'Octubre' },
  { valor: 11, nombre: 'Noviembre' },
  { valor: 12, nombre: 'Diciembre' }
];

// Generar años (desde 2020 hasta 2030)
const AÑOS = Array.from({ length: 11 }, (_, i) => 2020 + i);

export const EnviosSelectorMes: React.FC<EnviosSelectorMesProps> = ({
  año,
  mes,
  onCambioFecha,
  cargando = false
}) => {
  const handleCambioAño = (nuevoAño: string) => {
    onCambioFecha(parseInt(nuevoAño), mes);
  };

  const handleCambioMes = (nuevoMes: string) => {
    onCambioFecha(año, parseInt(nuevoMes));
  };

  const mesActual = MESES.find(m => m.valor === mes);

  return (
    <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
      {/* Ícono y título */}
      <div className="flex items-center gap-2">
        <Calendar className="w-5 h-5 text-[#B695BF]" />
        <span className="text-sm font-medium text-white/80">
          📅 Período:
        </span>
      </div>

      {/* Selector de Mes */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-white/70">
          Mes
        </label>
        <Select
          value={mes.toString()}
          onValueChange={handleCambioMes}
          disabled={cargando}
        >
          <SelectTrigger className="w-36 bg-white/10 border-white/20 text-white hover:bg-white/15 focus:border-[#B695BF] transition-all">
            <SelectValue placeholder="Mes" />
            <ChevronDown className="w-4 h-4 text-white/60" />
          </SelectTrigger>
          <SelectContent className="bg-[#212026] border-white/20 shadow-2xl z-50">
            {MESES.map((mesItem) => (
              <SelectItem
                key={mesItem.valor}
                value={mesItem.valor.toString()}
                className="text-white hover:bg-white/10 focus:bg-[#B695BF]/20 focus:text-[#B695BF] cursor-pointer"
              >
                {mesItem.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Selector de Año */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-white/70">
          Año
        </label>
        <Select
          value={año.toString()}
          onValueChange={handleCambioAño}
          disabled={cargando}
        >
          <SelectTrigger className="w-29 bg-white/10 border-white/20 text-white hover:bg-white/15 focus:border-[#B695BF] transition-all">
            <SelectValue placeholder="Año" />
            <ChevronDown className="w-4 h-4 text-white/60" />
          </SelectTrigger>
          <SelectContent className="bg-[#212026] border-white/20 shadow-2xl z-50">
            {AÑOS.map((añoItem) => (
              <SelectItem
                key={añoItem}
                value={añoItem.toString()}
                className="text-white hover:bg-white/10 focus:bg-[#B695BF]/20 focus:text-[#B695BF] cursor-pointer"
              >
                {añoItem}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Indicador de mes/año actual */}
      <div className="flex items-center gap-2 ml-4 px-4 py-1 bg-[#B695BF]/20 border border-[#B695BF]/30 rounded-lg">
        <span className="text-sm font-medium text-[#B695BF]">
          {mesActual?.nombre} {año}
        </span>
      </div>

      {/* Indicador de carga */}
      {cargando && (
        <div className="flex items-center gap-2 text-white/60">
          <div className="w-4 h-4 border-2 border-white/20 border-t-[#B695BF] rounded-full animate-spin" />
          <span className="text-xs">Cargando...</span>
        </div>
      )}
    </div>
  );
};

export default EnviosSelectorMes;