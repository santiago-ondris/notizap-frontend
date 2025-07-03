import React, { useMemo, type ReactNode } from 'react';
import { Clock, TrendingUp, Sunrise, Sun, Sunset, Moon, Target, Calendar } from 'lucide-react';
import { TIME_FRAMES } from '@/utils/instagram/constants';
import type { HorarioPerformance } from '@/types/instagram/analytics';

interface BestTimesProps {
  horarios?: HorarioPerformance[];
  className?: string;
  variant?: 'compact' | 'detailed' | 'heatmap';
  showRecommendations?: boolean;
  maxItems?: number;
}

const BestTimes: React.FC<BestTimesProps> = ({
  horarios = [],
  className = '',
  variant = 'compact',
  showRecommendations = true,
  maxItems = 5
}) => {
  /**
   * Procesa y agrupa los horarios por franjas
   */
  const analysis = useMemo(() => {
    if (horarios.length === 0) return null;

    // Agrupar por franjas horarias
    const franjas: {
      [key: string]: {
        rango: ReactNode;
        label: ReactNode;
        horarios: HorarioPerformance[];
        engagement: number;
      };
    } = {
      madrugada: {
          ...TIME_FRAMES.madrugada, horarios: [], engagement: 0,
          rango: undefined
      },
      mañana: {
          ...TIME_FRAMES.mañana, horarios: [], engagement: 0,
          rango: undefined
      },
      tarde: {
          ...TIME_FRAMES.tarde, horarios: [], engagement: 0,
          rango: undefined
      },
      noche: {
          ...TIME_FRAMES.noche, horarios: [], engagement: 0,
          rango: undefined
      }
    };

    horarios.forEach(h => {
      if (h.hora >= 0 && h.hora < 6) {
        franjas.madrugada.horarios.push(h);
      } else if (h.hora >= 6 && h.hora < 12) {
        franjas.mañana.horarios.push(h);
      } else if (h.hora >= 12 && h.hora < 18) {
        franjas.tarde.horarios.push(h);
      } else {
        franjas.noche.horarios.push(h);
      }
    });

    // Calcular engagement promedio por franja
    Object.values(franjas).forEach(franja => {
      if (franja.horarios.length > 0) {
        franja.engagement = franja.horarios.reduce((sum, h) => sum + h.engagementPromedio, 0) / franja.horarios.length;
      }
    });

    // Top horarios
    const topHorarios = [...horarios]
      .sort((a, b) => b.engagementPromedio - a.engagementPromedio)
      .slice(0, maxItems);

    // Mejores franjas
    const mejoresFranjas = Object.entries(franjas)
      .filter(([_, franja]) => franja.horarios.length > 0)
      .sort(([_, a], [__, b]) => b.engagement - a.engagement);

    return {
      topHorarios,
      franjas,
      mejoresFranjas,
      promedioGeneral: horarios.reduce((sum, h) => sum + h.engagementPromedio, 0) / horarios.length
    };
  }, [horarios, maxItems]);

  /**
   * Obtiene el ícono de la franja horaria
   */
  const getTimeIcon = (franja: string) => {
    switch (franja) {
      case 'madrugada': return <Moon className="w-4 h-4" />;
      case 'mañana': return <Sunrise className="w-4 h-4" />;
      case 'tarde': return <Sun className="w-4 h-4" />;
      case 'noche': return <Sunset className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  /**
   * Obtiene el color de performance basado en engagement
   */
  const getPerformanceColor = (engagement: number, promedio: number) => {
    const ratio = engagement / promedio;
    if (ratio >= 1.2) return '#51590E'; // Verde oliva - Excelente
    if (ratio >= 1.0) return '#B695BF'; // Violeta - Bueno
    if (ratio >= 0.8) return '#FFD700'; // Dorado - Promedio
    return '#D94854'; // Rojo - Bajo
  };

  /**
   * Renderiza vista compacta
   */
  const renderCompactView = () => {
    if (!analysis) return null;

    return (
      <div className="space-y-4">
        {/* Top 3 horarios */}
        <div className="grid grid-cols-3 gap-3">
          {analysis.topHorarios.slice(0, 3).map((horario, index) => {
            const color = getPerformanceColor(horario.engagementPromedio, analysis.promedioGeneral);
            
            return (
              <div
                key={horario.hora}
                className="text-center p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg"
              >
                <div className="flex items-center justify-center gap-1 mb-2">
                  {index === 0 && <Target className="w-3 h-3 text-[#FFD700]" />}
                  <Clock className="w-4 h-4 text-white/60" />
                </div>
                <div className="text-lg font-bold text-white mb-1">
                  {horario.hora.toString().padStart(2, '0')}:00
                </div>
                <div 
                  className="text-sm font-semibold"
                  style={{ color }}
                >
                  {horario.engagementPromedio.toFixed(1)}%
                </div>
                <div className="text-xs text-white/60 mt-1">
                  {horario.totalPublicaciones} posts
                </div>
              </div>
            );
          })}
        </div>

        {/* Mejores franjas */}
        <div className="grid grid-cols-2 gap-3">
          {analysis.mejoresFranjas.slice(0, 2).map(([nombre, franja]) => {
            const color = getPerformanceColor(franja.engagement, analysis.promedioGeneral);
            
            return (
              <div 
                key={nombre}
                className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg"
              >
                <div style={{ color }}>
                  {getTimeIcon(nombre)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white capitalize">
                    {franja.label}
                  </div>
                  <div className="text-xs text-white/60">
                    {franja.rango}
                  </div>
                </div>
                <div 
                  className="text-sm font-semibold"
                  style={{ color }}
                >
                  {franja.engagement.toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /**
   * Renderiza vista detallada
   */
  const renderDetailedView = () => {
    if (!analysis) return null;

    return (
      <div className="space-y-6">
        {/* Top horarios con barras */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-white/80 flex items-center gap-2">
            🎯 Mejores horarios
          </h4>
          {analysis.topHorarios.map((horario, index) => {
            const color = getPerformanceColor(horario.engagementPromedio, analysis.promedioGeneral);
            const percentage = (horario.engagementPromedio / Math.max(...analysis.topHorarios.map(h => h.engagementPromedio))) * 100;
            
            return (
              <div 
                key={horario.hora}
                className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10">
                  <span className="text-xs font-semibold text-white">#{index + 1}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">
                      {horario.rangoHorario}
                    </span>
                    <span 
                      className="text-sm font-semibold"
                      style={{ color }}
                    >
                      {horario.engagementPromedio.toFixed(1)}%
                    </span>
                  </div>
                  
                  {/* Barra de progreso */}
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-500 rounded-full"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: color
                      }}
                    />
                  </div>
                  
                  <div className="text-xs text-white/60 mt-1">
                    {horario.totalPublicaciones} publicaciones
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Análisis por franjas */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-white/80 flex items-center gap-2">
            ⏰ Análisis por franjas
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {analysis.mejoresFranjas.map(([nombre, franja]) => {
              const color = getPerformanceColor(franja.engagement, analysis.promedioGeneral);
              
              return (
                <div 
                  key={nombre}
                  className="p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div style={{ color }}>
                      {getTimeIcon(nombre)}
                    </div>
                    <span className="text-sm font-medium text-white capitalize">
                      {franja.label}
                    </span>
                  </div>
                  
                  <div className="text-xs text-white/60 mb-2">
                    {franja.rango}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span 
                      className="text-lg font-bold"
                      style={{ color }}
                    >
                      {franja.engagement.toFixed(1)}%
                    </span>
                    <span className="text-xs text-white/60">
                      {franja.horarios.length} horarios
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Renderiza recomendaciones
   */
  const renderRecommendations = () => {
    if (!showRecommendations || !analysis) return null;

    const mejorHorario = analysis.topHorarios[0];
    const mejorFranja = analysis.mejoresFranjas[0];

    return (
      <div className="mt-4 pt-4 border-t border-white/10">
        <h5 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
          💡 Recomendaciones
        </h5>
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2 p-2 bg-[#51590E]/20 rounded-lg border border-[#51590E]/30">
            <TrendingUp className="w-3 h-3 text-[#51590E] mt-0.5 flex-shrink-0" />
            <span className="text-white/80">
              <strong>Mejor horario:</strong> {mejorHorario.rangoHorario} con {mejorHorario.engagementPromedio.toFixed(1)}% de engagement
            </span>
          </div>
          
          {mejorFranja && (
            <div className="flex items-start gap-2 p-2 bg-[#B695BF]/20 rounded-lg border border-[#B695BF]/30">
              <Calendar className="w-3 h-3 text-[#B695BF] mt-0.5 flex-shrink-0" />
              <span className="text-white/80">
                <strong>Mejor período:</strong> {mejorFranja[1].label} ({mejorFranja[1].rango})
              </span>
            </div>
          )}
          
          <div className="flex items-start gap-2 p-2 bg-white/10 rounded-lg">
            <Target className="w-3 h-3 text-white/60 mt-0.5 flex-shrink-0" />
            <span className="text-white/70">
              Publicar en los horarios destacados puede mejorar el engagement hasta un{' '}
              {Math.round(((mejorHorario.engagementPromedio / analysis.promedioGeneral) - 1) * 100)}%
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (!horarios.length || !analysis) {
    return (
      <div className={`p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl ${className}`}>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          ⏰ Mejores Horarios
        </h3>
        <div className="h-48 flex items-center justify-center text-white/40">
          <div className="text-center">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No hay datos de horarios disponibles</p>
            <p className="text-xs mt-1">Necesitas más publicaciones para generar insights</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        ⏰ Mejores Horarios
      </h3>

      {variant === 'compact' && renderCompactView()}
      {variant === 'detailed' && renderDetailedView()}

      {renderRecommendations()}
    </div>
  );
};

export default BestTimes;