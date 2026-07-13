import React from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EstadoDiaChip, normalizarEstadoDia } from './EstadoDiaChip';
import { useCalendarioEvolucionStock } from '@/hooks/evolucionStock/useCargaArchivos';
import type { DiaCalendarioUi, TipoCalendarioStock } from '@/types/evolucionStock/evolucionStockTypes';

interface Props {
  tipo: TipoCalendarioStock;
  titulo: string;
  interactivo?: boolean;
  onDiaClick?: (dia: DiaCalendarioUi) => void;
  mesActual: Date;
  onMesChange: (fecha: Date) => void;
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const CalendarioBase: React.FC<Props> = ({
  tipo,
  titulo,
  interactivo = false,
  onDiaClick,
  mesActual,
  onMesChange
}) => {
  const anio = mesActual.getFullYear();
  const mes = mesActual.getMonth() + 1;
  const { data = [], isLoading, isFetching } = useCalendarioEvolucionStock(tipo, anio, mes);

  const dias = React.useMemo(() => {
    const porFecha = new Map(data.map(dia => [dia.fecha.slice(0, 10), dia]));
    const primerDia = new Date(anio, mes - 1, 1);
    const ultimoDia = new Date(anio, mes, 0);
    const offsetLunes = (primerDia.getDay() + 6) % 7;
    const inicio = new Date(anio, mes - 1, 1 - offsetLunes);
    const totalCeldas = Math.ceil((offsetLunes + ultimoDia.getDate()) / 7) * 7;
    const hoyKey = toDateKey(new Date());

    return Array.from({ length: totalCeldas }, (_, index): DiaCalendarioUi => {
      const fecha = new Date(inicio);
      fecha.setDate(inicio.getDate() + index);
      const key = toDateKey(fecha);
      const backend = porFecha.get(key);

      return {
        fecha: backend?.fecha ?? key,
        estado: backend?.estado ?? 'Futuro',
        cargaArchivoId: backend?.cargaArchivoId ?? null,
        dia: fecha.getDate(),
        esDelMes: fecha.getMonth() === mes - 1,
        esHoy: key === hoyKey
      };
    });
  }, [data, anio, mes]);

  const cambiarMes = (delta: number) => {
    onMesChange(new Date(anio, mes - 1 + delta, 1));
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">{titulo}</h2>
          <p className="text-sm text-white/50">{MESES[mes - 1]} {anio}</p>
        </div>
        <div className="flex items-center gap-2">
          {isFetching && <Loader2 className="w-4 h-4 animate-spin text-white/50" />}
          <button
            onClick={() => cambiarMes(-1)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10"
            disabled={isLoading}
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => cambiarMes(1)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10"
            disabled={isLoading}
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'].map(dia => (
          <div key={dia} className="py-2 text-center text-xs font-medium text-white/50">{dia}</div>
        ))}

        {dias.map(dia => {
          const estado = normalizarEstadoDia(dia.estado);
          const clickable = interactivo && dia.esDelMes && estado !== 'Futuro';

          return (
            <button
              key={dia.fecha}
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onDiaClick?.(dia)}
              className={cn(
                'relative aspect-square rounded-lg border p-1 text-sm transition-colors',
                'flex items-center justify-center',
                dia.esDelMes ? 'border-white/15 text-white' : 'border-white/5 text-white/25',
                dia.esHoy && 'ring-2 ring-[#B695BF]',
                clickable ? 'hover:bg-white/10 cursor-pointer' : 'cursor-default',
                estado === 'Pendiente' && dia.esDelMes && 'bg-[#FFD700]/10',
                estado === 'Cargado' && dia.esDelMes && 'bg-[#22C55E]/15'
              )}
            >
              <span className={cn('font-medium', dia.esHoy && 'text-[#B695BF]')}>{dia.dia}</span>
              {dia.esDelMes && (
                <EstadoDiaChip
                  estado={dia.estado}
                  showText={false}
                  size="sm"
                  className="absolute right-1 top-1 h-5 w-5 justify-center px-0"
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 text-xs">
        <Legend estado="Cargado" texto="Cargado" />
        <Legend estado="SinMovimientos" texto="Sin movimientos" />
        <Legend estado="Pendiente" texto="Pendiente" />
        <Legend estado="Futuro" texto="Futuro" />
      </div>
    </div>
  );
};

const Legend = ({ estado, texto }: { estado: 'Cargado' | 'SinMovimientos' | 'Pendiente' | 'Futuro'; texto: string }) => (
  <div className="flex items-center gap-2">
    <EstadoDiaChip estado={estado} showText={false} size="sm" />
    <span className="text-white/50">{texto}</span>
  </div>
);

const toDateKey = (fecha: Date) => {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
