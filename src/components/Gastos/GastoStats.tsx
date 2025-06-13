import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Hash, Target, Calendar } from 'lucide-react';
import type { GastoResumen } from '../../types/gastos';
import { GastoService } from '../../services/gastos/gastoService';

interface GastoStatsProps {
  resumen: GastoResumen;
  isLoading?: boolean;
}

export const GastoStats: React.FC<GastoStatsProps> = ({ 
  resumen, 
  isLoading = false 
}) => {
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 animate-pulse">
            <div className="h-4 bg-white/20 rounded mb-4" />
            <div className="h-8 bg-white/20 rounded mb-2" />
            <div className="h-3 bg-white/20 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  // Determinar si el cambio es positivo o negativo
  const isPositiveChange = resumen.porcentajeCambio >= 0;
  const changeIcon = isPositiveChange ? TrendingUp : TrendingDown;
  const changeColor = isPositiveChange ? 'text-red-400' : 'text-green-400'; // Rojo = más gasto (malo), Verde = menos gasto (bueno)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      {/* Total del mes */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white/80">💰 Total del Mes</h3>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-3xl font-bold text-green-400">
            {GastoService.formatearMonto(resumen.totalMes)}
          </p>
          
          <div className="flex items-center gap-2">
            {React.createElement(changeIcon, { 
              className: `w-4 h-4 ${changeColor}` 
            })}
            <span className={`text-sm font-medium ${changeColor}`}>
              {Math.abs(resumen.porcentajeCambio).toFixed(1)}%
            </span>
            <span className="text-xs text-white/60">vs mes anterior</span>
          </div>
        </div>
      </div>

      {/* Cantidad de gastos */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-xl">
              <Hash className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white/80">📊 Cantidad de Gastos</h3>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-3xl font-bold text-blue-400">
            {resumen.cantidadGastos}
          </p>
          
          <p className="text-xs text-white/60">
            gastos registrados este mes
          </p>
        </div>
      </div>

      {/* Categoría más gastada */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 border border-purple-500/30 rounded-xl">
              <Target className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white/80">🎯 Categoría Top</h3>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-lg font-bold text-purple-400 truncate">
            {resumen.categoriaMasGastada}
          </p>
          
          <p className="text-sm text-white/70">
            {GastoService.formatearMonto(resumen.montoCategoriaMasGastada)}
          </p>
          
          <p className="text-xs text-white/60">
            categoría con mayor gasto
          </p>
        </div>
      </div>

      {/* Promedio mensual */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500/20 border border-orange-500/30 rounded-xl">
              <Calendar className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white/80">📅 Promedio Mensual</h3>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-2xl font-bold text-orange-400">
            {GastoService.formatearMonto(resumen.promedioMensual)}
          </p>
          
          <p className="text-xs text-white/60">
            promedio últimos 12 meses
          </p>
        </div>
      </div>

      {/* Comparación mes anterior */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${isPositiveChange ? 'bg-red-500/20 border border-red-500/30' : 'bg-green-500/20 border border-green-500/30'}`}>
              {React.createElement(changeIcon, { 
                className: `w-6 h-6 ${isPositiveChange ? 'text-red-400' : 'text-green-400'}` 
              })}
            </div>
            <div>
              <h3 className="text-sm font-medium text-white/80">📈 Mes Anterior</h3>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-2xl font-bold text-white/80">
            {GastoService.formatearMonto(resumen.totalMesAnterior)}
          </p>
          
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${changeColor}`}>
              {isPositiveChange ? '+' : ''}{resumen.porcentajeCambio.toFixed(1)}%
            </span>
            <span className="text-xs text-white/60">
              {isPositiveChange ? 'más que antes' : 'menos que antes'}
            </span>
          </div>
        </div>
      </div>

      {/* Indicador de tendencia */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${isPositiveChange ? 'bg-red-500/20 border border-red-500/30' : 'bg-green-500/20 border border-green-500/30'}`}>
              {React.createElement(changeIcon, { 
                className: `w-6 h-6 ${isPositiveChange ? 'text-red-400' : 'text-green-400'}` 
              })}
            </div>
            <div>
              <h3 className="text-sm font-medium text-white/80">📊 Tendencia</h3>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className={`text-lg font-bold ${changeColor}`}>
            {isPositiveChange ? 'Aumentando' : 'Disminuyendo'}
          </p>
          
          <p className="text-xs text-white/60">
            {isPositiveChange 
              ? 'Los gastos están por encima del promedio' 
              : 'Los gastos están controlados'
            }
          </p>
        </div>
      </div>

    </div>
  );
};