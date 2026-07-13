import React from 'react';
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { chartTheme } from './ChartTheme';
import type { EventoEvolucionStock } from '@/types/evolucionStock/evolucionStockTypes';

interface Props {
  eventos: EventoEvolucionStock[];
  series?: SerieEvolucion[];
}

export interface SerieEvolucion {
  key: string;
  nombre: string;
  color: string;
  eventos: EventoEvolucionStock[];
  usarDeltaAcumulado?: boolean;
}

export const GraficoEvolucion: React.FC<Props> = ({ eventos, series }) => {
  const seriesActivas = series?.length
    ? series
    : [{ key: 'total', nombre: 'Total', color: chartTheme.compra, eventos }];

  const fechas = Array.from(new Set(seriesActivas.flatMap(serie => serie.eventos.map(evento => evento.fecha.slice(0, 10)))))
    .sort();

  const acumuladosPorSerie = seriesActivas.map(serie => {
    const porFecha = new Map<string, number>();

    if (serie.usarDeltaAcumulado) {
      const deltaPorFecha = new Map<string, number>();
      serie.eventos.forEach(evento => {
        const fecha = evento.fecha.slice(0, 10);
        deltaPorFecha.set(fecha, (deltaPorFecha.get(fecha) ?? 0) + evento.netoDelta);
      });

      let acumulado = 0;
      fechas.forEach(fecha => {
        acumulado += deltaPorFecha.get(fecha) ?? 0;
        porFecha.set(fecha, acumulado);
      });
    } else {
      const valorPorFecha = new Map<string, number>();
      serie.eventos.forEach(evento => {
        valorPorFecha.set(evento.fecha.slice(0, 10), evento.netoAcumulado);
      });

      let ultimoValor = 0;
      fechas.forEach(fecha => {
        if (valorPorFecha.has(fecha)) {
          ultimoValor = valorPorFecha.get(fecha) ?? ultimoValor;
        }
        porFecha.set(fecha, ultimoValor);
      });
    }

    return { ...serie, porFecha };
  });

  const data = fechas.map(fecha => {
    const row: Record<string, string | number> = {
      fecha,
      label: new Date(`${fecha}T00:00:00`).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
    };

    acumuladosPorSerie.forEach(serie => {
      row[serie.key] = serie.porFecha.get(fecha) ?? 0;
    });

    return row;
  });

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 20, bottom: 8, left: 0 }}>
          <CartesianGrid stroke={chartTheme.grid} />
          <XAxis dataKey="label" stroke={chartTheme.axis} tick={{ fill: chartTheme.axis, fontSize: 12 }} />
          <YAxis stroke={chartTheme.axis} tick={{ fill: chartTheme.axis, fontSize: 12 }} />
          <Tooltip contentStyle={chartTheme.tooltip} />
          {seriesActivas.map(serie => (
            <Line
              key={serie.key}
              type="monotone"
              dataKey={serie.key}
              name={serie.nombre}
              stroke={serie.color}
              strokeWidth={serie.key === 'total' ? 3 : 2}
              dot={false}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
