import React, { useMemo } from "react";
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  Loader2,
  CalendarDays
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FollowersMetricCard } from "./MetricsCard";
import { 
  calculateFollowerMetrics, 
  formatNumber, 
  formatDateForDisplay,
} from "@/utils/instagram/instagramUtils";
import type { FollowerDayData } from "@/types/instagram/instagramTypes";

interface FollowersSectionProps {
  followersData: FollowerDayData[];
  loading?: boolean;
  error?: string | null;
  className?: string;
}

export const FollowersSection: React.FC<FollowersSectionProps> = ({
  followersData,
  loading = false,
  error = null,
  className = ""
}) => {
  const metrics = useMemo(() => {
    return calculateFollowerMetrics(followersData);
  }, [followersData]);

  const chartData = useMemo(() => {
    return followersData
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(item => ({
        date: formatDateForDisplay(item.date),
        followers: item.value,
        fullDate: item.date
      }));
  }, [followersData]);

  const { highestPoint, lowestPoint } = useMemo(() => {
    if (followersData.length === 0) return { highestPoint: null, lowestPoint: null };
    
    const sorted = [...followersData].sort((a, b) => a.value - b.value);
    return {
      lowestPoint: sorted[0],
      highestPoint: sorted[sorted.length - 1]
    };
  }, [followersData]);

  if (error) {
    return (
      <div className={`p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl ${className}`}>
        <div className="text-center">
          <p className="text-[#D94854] font-medium">⚠️ Error al cargar datos de seguidores: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FollowersMetricCard
          current={metrics.currentFollowers}
          growth={metrics.followersGrowth}
          growthPercentage={metrics.growthPercentage}
          loading={loading}
        />

        {/* Period Card */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white/80">📅 Período Analizado</h3>
            <CalendarDays className="h-4 w-4 text-[#B695BF]" />
          </div>
          
          {loading ? (
            <div className="space-y-3">
              <div className="h-6 bg-white/10 rounded animate-pulse"></div>
              <div className="h-4 bg-white/5 rounded animate-pulse"></div>
            </div>
          ) : followersData.length > 0 ? (
            <div className="space-y-2">
              <div className="text-2xl font-bold text-white/90">
                {chartData.length} días
              </div>
              <p className="text-xs text-white/60">
                {chartData.length > 0 && `${chartData[0].date} - ${chartData[chartData.length - 1].date}`}
              </p>
            </div>
          ) : (
            <div className="text-sm text-white/50">Sin datos</div>
          )}
        </div>

        {/* Daily Variation Card */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white/80">📊 Variación Diaria</h3>
            {metrics.followersGrowth >= 0 ? (
              <TrendingUp className="h-4 w-4 text-[#51590E]" />
            ) : (
              <TrendingDown className="h-4 w-4 text-[#D94854]" />
            )}
          </div>
          
          {loading ? (
            <div className="space-y-3">
              <div className="h-6 bg-white/10 rounded animate-pulse"></div>
              <div className="h-4 bg-white/5 rounded animate-pulse"></div>
            </div>
          ) : followersData.length > 1 ? (
            <div className="space-y-2">
              <div className={`text-2xl font-bold ${metrics.followersGrowth >= 0 ? 'text-[#51590E]' : 'text-[#D94854]'}`}>
                {metrics.followersGrowth >= 0 ? '+' : ''}{formatNumber(Math.round(metrics.followersGrowth / chartData.length))}
              </div>
              <p className="text-xs text-white/60">
                Promedio por día
              </p>
            </div>
          ) : (
            <div className="text-sm text-white/50">Sin datos suficientes</div>
          )}
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#B695BF]/20 rounded-lg">
              <Users className="h-5 w-5 text-[#B695BF]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white/90">👥 Evolución de Seguidores</h2>
              {!loading && followersData.length > 0 && (
                <div className="inline-flex items-center gap-1 mt-1 px-2 py-1 bg-[#B695BF]/20 text-[#B695BF] text-xs rounded-lg">
                  {followersData.length} puntos de datos
                </div>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-80">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#B695BF] mx-auto mb-3" />
              <span className="text-white/70">Cargando datos de seguidores...</span>
            </div>
          </div>
        ) : followersData.length === 0 ? (
          <div className="flex items-center justify-center h-80">
            <div className="text-center">
              <div className="p-4 bg-white/5 rounded-2xl mb-4 inline-block">
                <Users className="h-12 w-12 text-white/40 mx-auto" />
              </div>
              <p className="text-white/60">
                No hay datos de seguidores disponibles en este período
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Chart */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.7)' }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.7)' }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                    tickFormatter={(value) => formatNumber(value)}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatNumber(value), 'Seguidores']}
                    labelFormatter={(label) => `📅 ${label}`}
                    contentStyle={{
                      backgroundColor: '#212026',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(12px)',
                      color: 'rgba(255,255,255,0.9)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="followers" 
                    stroke="#51590E" 
                    strokeWidth={4}
                    dot={{ fill: '#51590E', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#51590E', strokeWidth: 2, fill: '#51590E' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Summary Cards */}
            {highestPoint && lowestPoint && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-white/10">
                <div className="flex items-center gap-4 p-4 bg-[#51590E]/20 backdrop-blur-sm border border-[#51590E]/30 rounded-xl">
                  <div className="p-2 bg-[#51590E]/30 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-[#51590E]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#51590E] mb-1">
                      📈 Pico máximo
                    </p>
                    <p className="text-xs text-white/70">
                      {formatNumber(highestPoint.value)} seguidores el {formatDateForDisplay(highestPoint.date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-[#B695BF]/20 backdrop-blur-sm border border-[#B695BF]/30 rounded-xl">
                  <div className="p-2 bg-[#B695BF]/30 rounded-lg">
                    <TrendingDown className="h-5 w-5 text-[#B695BF]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#B695BF] mb-1">
                      📉 Punto mínimo
                    </p>
                    <p className="text-xs text-white/70">
                      {formatNumber(lowestPoint.value)} seguidores el {formatDateForDisplay(lowestPoint.date)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowersSection;