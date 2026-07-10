import React from 'react';
import { ChevronUp, ChevronDown, MapPin, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import type { ConfiguracionIgualacion } from '../../types/reposicion/igualacionTypes';

interface Props {
  configuracion: ConfiguracionIgualacion;
  sucursalesEncontradas: string[];
  onChange: (nueva: ConfiguracionIgualacion) => void;
}

type ListaTipo = 'receptora' | 'donante';

const ListaPrioridad: React.FC<{
  titulo: string;
  subtitulo: string;
  icono: React.ReactNode;
  color: string;
  sucursales: string[];
  onMover: (sucursal: string, dir: 'arriba' | 'abajo') => void;
}> = ({ titulo, subtitulo, icono, color, sucursales, onMover }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      <span style={{ color }}>{icono}</span>
      <div>
        <h4 className="text-sm font-semibold text-white">{titulo}</h4>
        <p className="text-xs text-white/40">{subtitulo}</p>
      </div>
    </div>

    <div className="space-y-1.5">
      {sucursales.map((sucursal, idx) => (
        <div
          key={sucursal}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10"
        >
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: `${color}20`, border: `1px solid ${color}30`, color }}
          >
            {idx + 1}
          </span>

          <span className="flex-1 text-sm text-white/90">{sucursal}</span>

          <div className="flex gap-0.5">
            <button
              onClick={() => onMover(sucursal, 'arriba')}
              disabled={idx === 0}
              className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white/60 hover:text-white transition-colors"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onMover(sucursal, 'abajo')}
              disabled={idx === sucursales.length - 1}
              className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white/60 hover:text-white transition-colors"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const ConfiguracionPrioridad: React.FC<Props> = ({
  configuracion,
  sucursalesEncontradas,
  onChange,
}) => {
  const sucursalesDisponibles = sucursalesEncontradas.filter(
    (s) => s.toUpperCase() !== 'CASA CENTRAL'
  );

  const toggleParticipacion = (sucursal: string) => {
    const participa = configuracion.sucursalesParticipantes.includes(sucursal);
    const nuevasParticipantes = participa
      ? configuracion.sucursalesParticipantes.filter((s) => s !== sucursal)
      : [...configuracion.sucursalesParticipantes, sucursal];

    const nuevaPrioridad = configuracion.ordenPrioridad.filter((s) =>
      nuevasParticipantes.includes(s)
    );
    if (!participa && !nuevaPrioridad.includes(sucursal)) nuevaPrioridad.push(sucursal);

    const nuevaPrioridadDonante = configuracion.ordenPrioridadDonante.filter((s) =>
      nuevasParticipantes.includes(s)
    );
    if (!participa && !nuevaPrioridadDonante.includes(sucursal)) nuevaPrioridadDonante.push(sucursal);

    onChange({
      sucursalesParticipantes: nuevasParticipantes,
      ordenPrioridad: nuevaPrioridad,
      ordenPrioridadDonante: nuevaPrioridadDonante,
    });
  };

  const mover = (tipo: ListaTipo, sucursal: string, dir: 'arriba' | 'abajo') => {
    const lista =
      tipo === 'receptora' ? [...configuracion.ordenPrioridad] : [...configuracion.ordenPrioridadDonante];
    const idx = lista.indexOf(sucursal);
    if (idx === -1) return;
    const destino = dir === 'arriba' ? idx - 1 : idx + 1;
    if (destino < 0 || destino >= lista.length) return;
    [lista[idx], lista[destino]] = [lista[destino], lista[idx]];

    onChange(
      tipo === 'receptora'
        ? { ...configuracion, ordenPrioridad: lista }
        : { ...configuracion, ordenPrioridadDonante: lista }
    );
  };

  const participantes = configuracion.sucursalesParticipantes;
  const noParticipantes = sucursalesDisponibles.filter((s) => !participantes.includes(s));

  // Filtrar las listas de prioridad a solo las que participan
  const receptoras = configuracion.ordenPrioridad.filter((s) => participantes.includes(s));
  const donantes = configuracion.ordenPrioridadDonante.filter((s) => participantes.includes(s));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MapPin className="w-5 h-5 text-[#B695BF]" />
        <h3 className="text-lg font-semibold text-white">Sucursales y prioridades</h3>
      </div>

      {/* Participantes / excluidas */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-white/50 uppercase tracking-wider">Sucursales participantes</p>
        {sucursalesDisponibles.map((sucursal) => {
          const participa = participantes.includes(sucursal);
          return (
            <div
              key={sucursal}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-colors ${
                participa
                  ? 'bg-white/5 border-white/10'
                  : 'bg-white/[0.02] border-white/5 opacity-50'
              }`}
            >
              <span className={`text-sm font-medium ${participa ? 'text-white' : 'text-white/40 line-through'}`}>
                {sucursal}
              </span>
              <button
                onClick={() => toggleParticipacion(sucursal)}
                className={`ml-auto text-xs px-2.5 py-1 rounded border transition-colors ${
                  participa
                    ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                    : 'border-[#B695BF]/30 text-[#B695BF] hover:bg-[#B695BF]/10'
                }`}
              >
                {participa ? 'Excluir' : 'Incluir'}
              </button>
            </div>
          );
        })}
      </div>

      {participantes.length < 2 && (
        <p className="text-sm text-amber-400/80 bg-amber-400/10 border border-amber-400/20 rounded-lg px-4 py-3">
          Se necesitan al menos 2 sucursales participantes para igualar stock.
        </p>
      )}

      {/* Dos listas de prioridad en columnas */}
      {participantes.length >= 2 && (
        <div className="grid md:grid-cols-2 gap-6 pt-2">
          <ListaPrioridad
            titulo="Prioridad receptora"
            subtitulo="¿A quién darle primero cuando el stock no alcanza?"
            icono={<ArrowDownToLine className="w-4 h-4" />}
            color="#B695BF"
            sucursales={receptoras}
            onMover={(s, d) => mover('receptora', s, d)}
          />

          <ListaPrioridad
            titulo="Prioridad donante"
            subtitulo="¿A quién sacarle primero cuando varias tienen excedente?"
            icono={<ArrowUpFromLine className="w-4 h-4" />}
            color="#F59E0B"
            sucursales={donantes}
            onMover={(s, d) => mover('donante', s, d)}
          />
        </div>
      )}
    </div>
  );
};
