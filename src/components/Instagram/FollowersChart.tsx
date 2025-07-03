import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Users, Calendar } from 'lucide-react';
import { formatNumber, formatDate } from '@/utils/instagram/formatters';
import type { EvolucionSeguidores } from '@/types/instagram/dashboard';

interface FollowersChartProps {
  data: EvolucionSeguidores[];
  className?: string;
  variant?: 'line' | 'area';
  showGrowth?: boolean;
  height?: number;
}

const FollowersChart: React.FC<FollowersChartProps> = ({
  data,
  className = '',
  variant = 'area',
  showGrowth = true,
  height = 300
}) => {
  /**
   * Procesa y formatea los datos para el gráfico
   */
  const chartData = useMemo(() => {
    return data.map((item, index) => ({
      fecha: formatDate(item.fecha, 'chart'),
      seguidores: item.seguidores,
      crecimiento: item.crecimientoDiario,
      fechaCompleta: formatDate(item.fecha, 'long'),
      // Para smooth line - promedio móvil de 3 días
      seguidoresSmooth: index >= 2 ? 
        Math.round((data[index-2].seguidores + data[index-1].seguidores + item.seguidores) / 3) :
        item.seguidores,
      // Calcular tendencia
      tendencia: index > 0 ? (item.seguidores > data[index-1].seguidores ? 'up' : 
                             item.seguidores < data[index-1].seguidores ? 'down' : 'stable') : 'stable'
    }));
  }, [data]);

  /**
   * Calcula estadísticas del período
   */
  const stats = useMemo(() => {
    if (data.length === 0) return null;

    const inicio = data[0].seguidores;
    const fin = data[data.length - 1].seguidores;
    const crecimientoTotal = fin - inicio;
    const crecimientoPromedio = data.reduce((sum, item) => sum + item.crecimientoDiario, 0) / data.length;
    const mayorCrecimiento = Math.max(...data.map(item => item.crecimientoDiario));
    const menorCrecimiento = Math.min(...data.map(item => item.crecimientoDiario));

    return {
      inicio,
      fin,
      crecimientoTotal,
      crecimientoPromedio: Math.round(crecimientoPromedio * 100) / 100,
      mayorCrecimiento,
      menorCrecimiento,
      porcentajeCrecimiento: inicio > 0 ? ((crecimientoTotal / inicio) * 100) : 0
    };
  }, [data]);

  /**
   * Componente de tooltip customizado
   */
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-[#212026] border border-white/20 rounded-lg p-3 shadow-lg backdrop-blur-sm">
        <div className="text-sm font-medium text-white mb-2">
          📅 {data.fechaCompleta}
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-white/70">Seguidores:</span>
            <span className="text-sm font-semibold text-white">
              {formatNumber(data.seguidores)}
            </span>
          </div>
          
          {showGrowth && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-white/70">Crecimiento:</span>
              <span className={`text-sm font-semibold flex items-center gap-1 ${
                data.crecimiento > 0 ? 'text-[#51590E]' : 
                data.crecimiento < 0 ? 'text-[#D94854]' : 'text-white/60'
              }`}>
                {data.crecimiento > 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : data.crecimiento < 0 ? (
                  <TrendingDown className="w-3 h-3" />
                ) : (
                  <span className="w-3 h-3 block" />
                )}
                {data.crecimiento > 0 ? '+' : ''}{data.crecimiento}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  /**
   * Renderiza estadísticas del header
   */
  const renderStats = () => {
    if (!stats) return null;

    return (
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#B695BF]" />
          <span className="text-sm text-white/70">Total:</span>
          <span className="text-sm font-semibold text-white">
            {formatNumber(stats.fin)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            stats.crecimientoTotal > 0 ? 'bg-[#51590E]' : 
            stats.crecimientoTotal < 0 ? 'bg-[#D94854]' : 'bg-white/40'
          }`} />
          <span className="text-sm text-white/70">Período:</span>
          <span className={`text-sm font-semibold ${
            stats.crecimientoTotal > 0 ? 'text-[#51590E]' : 
            stats.crecimientoTotal < 0 ? 'text-[#D94854]' : 'text-white/60'
          }`}>
            {stats.crecimientoTotal > 0 ? '+' : ''}{formatNumber(stats.crecimientoTotal)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-white/50" />
          <span className="text-sm text-white/70">Promedio:</span>
          <span className="text-sm font-medium text-white/80">
            {stats.crecimientoPromedio > 0 ? '+' : ''}{stats.crecimientoPromedio}/día
          </span>
        </div>
      </div>
    );
  };

  /**
   * Renderiza el gráfico
   */
  const renderChart = () => {
    if (variant === 'area') {
      return (
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="followersGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#B695BF" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#B695BF" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="rgba(255,255,255,0.1)" 
            vertical={false}
          />
          <XAxis 
            dataKey="fecha"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
            tickMargin={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
            tickFormatter={formatNumber}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="seguidores"
            stroke="#B695BF"
            strokeWidth={3}
            fill="url(#followersGradient)"
            dot={{ fill: '#B695BF', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#B695BF', strokeWidth: 2, fill: '#1A1A20' }}
          />
        </AreaChart>
      );
    }

    return (
      <LineChart data={chartData}>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="rgba(255,255,255,0.1)" 
          vertical={false}
        />
        <XAxis 
          dataKey="fecha"
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
          tickMargin={10}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
          tickFormatter={formatNumber}
          width={60}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="seguidores"
          stroke="#B695BF"
          strokeWidth={3}
          dot={{ fill: '#B695BF', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: '#B695BF', strokeWidth: 2, fill: '#1A1A20' }}
        />
        {showGrowth && (
          <Line
            type="monotone"
            dataKey="crecimiento"
            stroke="#51590E"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            yAxisId="growth"
          />
        )}
      </LineChart>
    );
  };

  if (!data || data.length === 0) {
    return (
      <div className={`p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl ${className}`}>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          📈 Evolución de Seguidores
        </h3>
        <div className="h-64 flex items-center justify-center text-white/40">
          <div className="text-center">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No hay datos de seguidores disponibles</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        📈 Evolución de Seguidores
      </h3>

      {renderStats()}

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Insights rápidos */}
      {stats && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="text-center p-2 bg-white/5 rounded-lg">
              <div className="text-white/60">Mejor día</div>
              <div className="text-[#51590E] font-semibold">
                +{stats.mayorCrecimiento}
              </div>
            </div>
            <div className="text-center p-2 bg-white/5 rounded-lg">
              <div className="text-white/60">Crecimiento</div>
              <div className={`font-semibold ${
                stats.porcentajeCrecimiento > 0 ? 'text-[#51590E]' : 'text-[#D94854]'
              }`}>
                {stats.porcentajeCrecimiento > 0 ? '+' : ''}{stats.porcentajeCrecimiento.toFixed(1)}%
              </div>
            </div>
            <div className="text-center p-2 bg-white/5 rounded-lg col-span-2 lg:col-span-1">
              <div className="text-white/60">Promedio/día</div>
              <div className="text-white font-semibold">
                {stats.crecimientoPromedio > 0 ? '+' : ''}{stats.crecimientoPromedio}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowersChart;