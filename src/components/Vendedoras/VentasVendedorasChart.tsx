import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { ResponsivePie } from '@nivo/pie';
import { 
  TrendingUp,
  Users,
  Building2,
  Clock,
  ChevronDown
} from 'lucide-react';
import type {
  VentaPorDia,
  VentaPorVendedora,
  VentaPorSucursal,
  VentaPorTurno,
} from '@/types/vendedoras/ventaVendedoraTypes';
import { dateHelpers } from '@/utils/vendedoras/dateHelpers';
import { estadisticasHelpers } from '@/utils/vendedoras/estadisticasHelpers';
import { turnoHelpers } from '@/utils/vendedoras/turnoHelpers';

interface Props {
  ventasPorDia: VentaPorDia[];
  todasVendedoras: VentaPorVendedora[];
  ventasPorSucursal: VentaPorSucursal[];
  ventasPorTurno: VentaPorTurno[];
  loading?: boolean;
}

type TipoGrafico = 'tendencia' | 'vendedoras' | 'sucursales' | 'turnos';

const coloresTematicos = [
  '#FF6384', '#36A2EB', '#4BC0C0', '#FFCE56', '#9966FF',
  '#FF9F40', '#5A68A5', '#8AD07D', '#FF6F61', '#4C4B63'
];

export const VentasVendedorasChart: React.FC<Props> = ({
  ventasPorDia,
  todasVendedoras,
  ventasPorSucursal,
  ventasPorTurno,
  loading = false
}) => {
  const [tipoGrafico, setTipoGrafico] = useState<TipoGrafico>('vendedoras');

  // Tooltip personalizado para Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#212026] border border-white/20 rounded-lg p-3 shadow-lg">
          <p className="text-white/80 font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-white/70">{entry.dataKey}:</span>
              <span className="text-white font-medium">
                {entry.dataKey.includes('monto') || entry.dataKey.includes('Total') || entry.dataKey.includes('Promedio')
                  ? estadisticasHelpers.formatearMoneda(entry.value)
                  : estadisticasHelpers.formatearNumero(entry.value)
                }
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderTendenciaChart = () => {
    const datosFormateados = ventasPorDia.map(dia => ({
      fecha: dateHelpers.formatearFechaCorta(dia.fecha),
      fechaCompleta: dateHelpers.formatearFechaCompleta(dia.fecha),
      emoji: dateHelpers.obtenerEmojiDia(dia.fecha),
      'Monto Total': dia.montoTotal,
      'Cantidad': dia.cantidadTotal,
      'Ventas': dia.totalVentas,
      esDomingo: dia.esDomingo
    }));

    return (
      <ResponsiveContainer width="100%" aspect={2}>
        <LineChart data={datosFormateados}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="fecha" 
            stroke="rgba(255,255,255,0.7)"
            fontSize={12}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.7)"
            fontSize={12}
            tickFormatter={(value) => estadisticasHelpers.formatearMonedaCompacta(value)}
          />
          <RechartsTooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="Monto Total" 
            stroke="#51590E" 
            strokeWidth={4}
            dot={{ fill: '#51590E', strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8, stroke: '#51590E', strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="Ventas" 
            stroke="#D94854" 
            strokeWidth={3}
            dot={{ fill: '#D94854', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderVendedorasChart = () => {
    // Formateo para Nivo Pie
    const datosNivo = todasVendedoras.map((v, i) => ({
      id: v.vendedorNombre,
      label: v.vendedorNombre.split(' ')[0],
      value: v.montoTotal,
      color: coloresTematicos[i % coloresTematicos.length]
    }));
    const totalMonto = datosNivo.reduce((sum, d) => sum + d.value, 0);

    return (
      <div className="flex flex-col items-center">
        <h3 className="text-2xl font-bold text-white mb-4">Top Vendedoras</h3>
        <p className="text-lg font-semibold text-white mb-4">
          Total vendido: <span className="text-white/80">{estadisticasHelpers.formatearMoneda(totalMonto)}</span>
        </p>
        <div style={{ width: "100%", maxWidth: 600, height: 400 }}>
          <ResponsivePie
            data={datosNivo}
            margin={{ top: 30, right: 110, bottom: 60, left: 30 }}
            innerRadius={0.62}
            padAngle={1.5}
            cornerRadius={6}
            activeOuterRadiusOffset={12}
            colors={coloresTematicos}
            borderWidth={2}
            borderColor={{ from: 'color', modifiers: [ [ 'darker', 1.2 ] ] }}
            enableArcLabels={true}
            arcLabelsSkipAngle={15}
            arcLabelsTextColor="#fff"
            arcLabel={e => `${e.label} ${((e.value / totalMonto) * 100).toFixed(0)}%`}
            tooltip={({ datum }) => (
              <div className="bg-[#191921] border border-white/20 rounded-lg p-3 shadow-lg">
                <p className="text-lg font-bold text-white">{datum.id}</p>
                <p className="text-white/70 mb-1">{estadisticasHelpers.formatearMoneda(datum.value)}</p>
                <p className="text-white/60 text-xs">
                  {((datum.value / totalMonto) * 100).toFixed(1)}% del total
                </p>
              </div>
            )}
            legends={[
              {
                anchor: 'bottom',
                direction: 'row',
                justify: false,
                translateY: 56,
                itemWidth: 90,
                itemHeight: 18,
                itemTextColor: '#fff',
                symbolSize: 15,
                symbolShape: 'circle',
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemTextColor: '#ffd700',
                    },
                  },
                ],
              },
            ]}
            theme={{
              background: 'transparent',
              text: {
                color: '#fff',
              },
              tooltip: {
                container: {
                  background: '#1a1a22',
                  color: '#fff'
                }
              }
            }}
          />
        </div>
      </div>
    );
  };

  const renderSucursalesChart = () => {
    const datosBarras = ventasPorSucursal.map((sucursal, index) => ({
      nombre: sucursal.sucursalNombre,
      'Monto Total': sucursal.montoTotal,
      'Total Ventas': sucursal.totalVentas,
      color: coloresTematicos[index % coloresTematicos.length],
      abreSabadoTarde: sucursal.abreSabadoTarde
    }));

    const datosPie = ventasPorSucursal.map((sucursal, index) => ({
      id: sucursal.sucursalNombre,
      label: sucursal.sucursalNombre.split(' ')[0],
      value: sucursal.montoTotal,
      color: coloresTematicos[index % coloresTematicos.length]
    }));
    const totalMonto = datosPie.reduce((sum, d) => sum + d.value, 0);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras */}
        <div style={{ minHeight: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={datosBarras}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="nombre" 
                stroke="rgba(255,255,255,0.7)"
                fontSize={10}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.7)"
                fontSize={12}
                tickFormatter={(value) => estadisticasHelpers.formatearMonedaCompacta(value)}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="Monto Total" 
                fill="#B695BF"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Gráfico de torta Nivo */}
        <div style={{ minHeight: 350 }}>
          <ResponsivePie
            data={datosPie}
            margin={{ top: 30, right: 10, bottom: 60, left: 10 }}
            innerRadius={0.6}
            padAngle={1.5}
            cornerRadius={6}
            activeOuterRadiusOffset={10}
            colors={coloresTematicos}
            borderWidth={2}
            borderColor={{ from: 'color', modifiers: [ [ 'darker', 1.2 ] ] }}
            enableArcLabels={true}
            arcLabelsSkipAngle={15}
            arcLabelsTextColor="#fff"
            arcLabel={e => `${e.label} ${((e.value / totalMonto) * 100).toFixed(0)}%`}
            tooltip={({ datum }) => (
              <div className="bg-[#191921] border border-white/20 rounded-lg p-3 shadow-lg">
                <p className="text-lg font-bold text-white">{datum.id}</p>
                <p className="text-white/70 mb-1">{estadisticasHelpers.formatearMoneda(datum.value)}</p>
                <p className="text-white/60 text-xs">
                  {((datum.value / totalMonto) * 100).toFixed(1)}% del total
                </p>
              </div>
            )}
            legends={[
              {
                anchor: 'bottom',
                direction: 'row',
                justify: false,
                translateY: 56,
                itemWidth: 90,
                itemHeight: 18,
                itemTextColor: '#fff',
                symbolSize: 15,
                symbolShape: 'circle',
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemTextColor: '#ffd700',
                    },
                  },
                ],
              },
            ]}
            theme={{
              background: 'transparent',
              text: {
                color: '#fff',
              },
              tooltip: {
                container: {
                  background: '#1a1a22',
                  color: '#fff'
                }
              }
            }}
          />
          <div className="text-center mb-5">
            <span className="text-white/70 font-medium text-lg">
              <span className="text-white font-bold">Total vendido:</span>{" "}
              {estadisticasHelpers.formatearMoneda(totalMonto)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderTurnosChart = () => {
    const datosFormateados = ventasPorTurno.map(turno => {
      const info = turnoHelpers.obtenerInfoTurno(turno.turno as any);
      return {
        turno: `${info.emoji} ${turno.turno}`,
        'Monto Total': turno.montoTotal,
        'Total Ventas': turno.totalVentas,
        'Cantidad': turno.cantidadTotal,
        color: info.color,
        horario: info.horario
      };
    });

    const comparacion = turnoHelpers.compararTurnos(
      ventasPorTurno.filter(t => t.turno === 'Mañana'),
      ventasPorTurno.filter(t => t.turno === 'Tarde')
    );

    return (
      <div className="space-y-6">
        {/* Gráfico de comparación */}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={datosFormateados} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="turno" 
              stroke="rgba(255,255,255,0.7)"
              fontSize={14}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.7)"
              fontSize={12}
              tickFormatter={(value) => estadisticasHelpers.formatearMonedaCompacta(value)}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="Monto Total"
              fill="#D94854"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        {/* Análisis de comparación */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <h4 className="font-medium text-white mb-3">📊 Análisis de Turnos</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <p className="text-2xl">{comparacion.mañana.emoji}</p>
              <p className="text-lg font-bold text-white">
                {estadisticasHelpers.formatearPorcentaje(comparacion.mañana.porcentaje)}
              </p>
              <p className="text-xs text-white/60">Mañana</p>
            </div>
            <div className="space-y-2">
              <p className="text-2xl">⚔️</p>
              <p className="text-lg font-bold text-white">
                {estadisticasHelpers.formatearMonedaCompacta(comparacion.diferencia)}
              </p>
              <p className="text-xs text-white/60">Diferencia</p>
            </div>
            <div className="space-y-2">
              <p className="text-2xl">{comparacion.tarde.emoji}</p>
              <p className="text-lg font-bold text-white">
                {estadisticasHelpers.formatearPorcentaje(comparacion.tarde.porcentaje)}
              </p>
              <p className="text-xs text-white/60">Tarde</p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-white/80">
              🏆 <strong>Turno {comparacion.mejorTurno}</strong> lidera por{' '}
              <strong>{estadisticasHelpers.formatearPorcentaje(comparacion.diferenciaPorc)}</strong>
            </p>
          </div>
        </div>
      </div>
    );
  };

  const opcionesGrafico = [
    { 
      value: 'tendencia', 
      label: '📈 Tendencia por Días', 
      icono: TrendingUp,
      descripcion: 'Evolución de ventas en el tiempo'
    },
    { 
      value: 'vendedoras', 
      label: '👥 Top Vendedoras', 
      icono: Users,
      descripcion: 'Ranking por monto total'
    },
    { 
      value: 'sucursales', 
      label: '🏢 Por Sucursales', 
      icono: Building2,
      descripcion: 'Distribución por ubicación'
    },
    { 
      value: 'turnos', 
      label: '⏰ Por Turnos', 
      icono: Clock,
      descripcion: 'Comparación mañana vs tarde'
    }
  ];

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">📊 Gráficos de Análisis</h3>
            <p className="text-sm text-white/60">Cargando visualizaciones...</p>
          </div>
        </div>
        <div className=" bg-white/5 rounded-xl animate-pulse flex items-center justify-center">
          <TrendingUp className="w-12 h-12 text-white/20" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
      {/* Header con selector */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">📊 Gráficos de Análisis</h3>
            <p className="text-sm text-white/60">Visualización interactiva de datos</p>
          </div>
        </div>
        {/* Selector de tipo de gráfico */}
        <div className="relative">
          <select
            value={tipoGrafico}
            onChange={(e) => setTipoGrafico(e.target.value as TipoGrafico)}
            className="appearance-none bg-white/10 border border-white/20 rounded-xl px-4 py-2 pr-10 text-white focus:border-green-400 focus:ring-1 focus:ring-green-400/20"
          >
            {opcionesGrafico.map(opcion => (
              <option key={opcion.value} value={opcion.value} className="bg-gray-900">
                {opcion.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none" />
        </div>
      </div>
      {/* Descripción del gráfico actual */}
      <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center gap-2">
          {React.createElement(
            opcionesGrafico.find(o => o.value === tipoGrafico)?.icono || TrendingUp,
            { className: "w-5 h-5 text-green-400" }
          )}
          <h4 className="font-medium text-white">
            {opcionesGrafico.find(o => o.value === tipoGrafico)?.label}
          </h4>
        </div>
        <p className="text-sm text-white/70 mt-1">
          {opcionesGrafico.find(o => o.value === tipoGrafico)?.descripcion}
        </p>
      </div>
      {/* Renderizado del gráfico */}
      <div>
        {tipoGrafico === 'tendencia' && renderTendenciaChart()}
        {tipoGrafico === 'vendedoras' && renderVendedorasChart()}
        {tipoGrafico === 'sucursales' && renderSucursalesChart()}
        {tipoGrafico === 'turnos' && renderTurnosChart()}
      </div>
      {/* Información adicional según el tipo */}
      {tipoGrafico === 'tendencia' && ventasPorDia.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {(() => {
            const analisis = estadisticasHelpers.analizarTendenciaSemanal(ventasPorDia);
            return (
              <>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-lg">{analisis.emoji}</p>
                  <p className="text-sm font-medium text-white">
                    Tendencia {analisis.tendencia}
                  </p>
                  <p className="text-xs text-white/60">Análisis general</p>
                </div>
                {analisis.mejorDia && (
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <p className="text-lg">🏆</p>
                    <p className="text-sm font-medium text-white">
                      {dateHelpers.formatearFechaCorta(analisis.mejorDia.fecha)}
                    </p>
                    <p className="text-xs text-white/60">Mejor día</p>
                  </div>
                )}
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-lg">📊</p>
                  <p className="text-sm font-medium text-white">
                    {ventasPorDia.length} días
                  </p>
                  <p className="text-xs text-white/60">Con datos</p>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};
