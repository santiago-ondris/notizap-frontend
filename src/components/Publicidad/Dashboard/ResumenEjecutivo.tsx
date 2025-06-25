import React from 'react';
import { 
  DollarSign, 
  Target, 
  MousePointer, 
  Eye, 
  BarChart3,
  Zap,
  AlertCircle,
} from 'lucide-react';
import MetricCard from './MetricCard';
import type { 
  PublicidadDashboardDto, 
  MetricCardProps 
} from '@/types/publicidad/dashboard';

interface ResumenEjecutivoProps {
  data: PublicidadDashboardDto | null;
  isLoading?: boolean;
  compact?: boolean;
}

const ResumenEjecutivo: React.FC<ResumenEjecutivoProps> = ({
  data,
  isLoading = false,
  compact = false
}) => {
  if (!data && !isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <p className="text-sm text-white/60">No hay datos disponibles para el resumen ejecutivo</p>
          <p className="text-xs text-white/40 mt-2">Verifica los filtros o el período seleccionado</p>
        </div>
      </div>
    );
  }

  // Preparar datos para las métricas principales
  const resumenGeneral = data?.resumenGeneral;

  // Configuración de las métricas principales
  const metricas: MetricCardProps[] = [
    {
      title: 'Gasto Total',
      value: resumenGeneral?.gastoTotalActual || 0,
      previousValue: resumenGeneral?.gastoTotalAnterior,
      format: 'currency',
      icon: DollarSign,
      color: '#D94854'
    },
    {
      title: 'Campañas en el mes',
      value: resumenGeneral?.totalCampañasActivas || 0,
      format: 'number',
      icon: Target,
      color: '#B695BF'
    },
    {
      title: 'CTR Promedio',
      value: resumenGeneral?.ctrPromedio || 0,
      format: 'percentage',
      icon: MousePointer,
      color: '#51590E'
    },
    {
      title: 'Alcance Total',
      value: resumenGeneral?.totalReach || 0,
      format: 'number',
      icon: Eye,
      color: '#e327c4'
    }
  ];

  // Métricas adicionales para vista completa
  const metricasAdicionales: MetricCardProps[] = [
    {
      title: 'Total Clicks',
      value: resumenGeneral?.totalClicks || 0,
      format: 'number',
      icon: MousePointer,
      color: '#51590E'
    },
    {
      title: 'Costo por Click',
      value: resumenGeneral?.costoPromedioPorClick || 0,
      format: 'currency',
      icon: Zap,
      color: '#F23D5E'
    },
    {
      title: 'Impresiones',
      value: resumenGeneral?.totalImpressions || 0,
      format: 'number',
      icon: BarChart3,
      color: '#B695BF'
    },
  ];

  return (
    <div className="space-y-6">

      {/* Grid de métricas principales */}
      <div className={`grid grid-cols-1 ${compact ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 xl:grid-cols-4'} gap-4`}>
        {metricas.map((metrica, index) => (
          <MetricCard
            key={index}
            {...metrica}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Métricas adicionales (solo en vista completa) */}
      {!compact && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {metricasAdicionales.map((metrica, index) => (
            <MetricCard
              key={`adicional-${index}`}
              {...metrica}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}

      {/* Footer con timestamp */}
      {!isLoading && (
        <div className="text-center">
          <p className="text-xs text-white/40">
            💡 Datos actualizados al {new Date().toLocaleDateString('es-AR', {
              day: '2-digit',
              month: '2-digit', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      )}
    </div>
  );
};

export default ResumenEjecutivo;