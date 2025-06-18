import React from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  DollarSign, 
  AlertTriangle,
  TrendingUp,
  FileText,
  CreditCard,
  Calculator,
  Calendar
} from 'lucide-react';
import { type DevolucionesEstadisticasData } from '@/types/cambios/devolucionesTypes';

interface DevolucionesEstadisticasProps {
  estadisticas: DevolucionesEstadisticasData | null;
  cargando?: boolean;
}

const StatCard: React.FC<{
  titulo: string;
  valor: string | number;
  descripcion: string;
  icono: React.ReactNode;
  color: string;
  colorFondo?: string;
}> = ({ titulo, valor, descripcion, icono, color, colorFondo }) => (
  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all">
    <div className="flex items-center justify-between mb-3">
      <div 
        className="p-2 rounded-lg border"
        style={{ 
          backgroundColor: colorFondo || `${color}20`,
          borderColor: `${color}30`
        }}
      >
        <div style={{ color }}>{icono}</div>
      </div>
      <div className="text-right">
        <div 
          className="text-2xl font-bold"
          style={{ color }}
        >
          {typeof valor === 'number' ? valor.toLocaleString() : valor}
        </div>
      </div>
    </div>
    <div>
      <h4 className="font-medium text-white text-sm mb-1">{titulo}</h4>
      <p className="text-xs text-white/60">{descripcion}</p>
    </div>
  </div>
);

/**
 * Componente principal de estadísticas de devoluciones
 */
export const DevolucionesEstadisticas: React.FC<DevolucionesEstadisticasProps> = ({
  estadisticas,
  cargando = false
}) => {

  // Estado de carga
  if (cargando) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div 
            key={index}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg animate-pulse"></div>
              <div className="w-16 h-8 bg-white/10 rounded animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <div className="w-24 h-4 bg-white/10 rounded animate-pulse"></div>
              <div className="w-32 h-3 bg-white/5 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Sin datos
  if (!estadisticas) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <AlertTriangle className="w-8 h-8 text-[#FFD700] mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            No hay estadísticas disponibles
          </h3>
          <p className="text-white/60 text-sm">
            Carga algunas devoluciones para ver las estadísticas
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header de estadísticas */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#D94854]/20 border border-[#D94854]/30 rounded-lg">
          <TrendingUp className="w-5 h-5 text-[#D94854]" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">
            📊 Estadísticas de Devoluciones
          </h3>
          <p className="text-white/60 text-sm">
            Resumen general del estado de las devoluciones
          </p>
        </div>
      </div>

      {/* Grid de estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total de devoluciones */}
        <StatCard
          titulo="Total de Devoluciones"
          valor={estadisticas.totalDevoluciones}
          descripcion="Devoluciones registradas en total"
          icono={<Package className="w-5 h-5" />}
          color="#D94854"
        />

        {/* Pendientes de llegada */}
        <StatCard
          titulo="Pendientes Llegada"
          valor={estadisticas.pendientesLlegada}
          descripcion="Esperando que lleguen al depósito"
          icono={<Clock className="w-5 h-5" />}
          color="#FFD700"
        />

        {/* Llegados sin procesar */}
        <StatCard
          titulo="Sin Procesar"
          valor={estadisticas.llegadosSinProcesar}
          descripcion="Llegaron pero falta dinero/nota"
          icono={<AlertTriangle className="w-5 h-5" />}
          color="#e327c4"
        />

        {/* Completados */}
        <StatCard
          titulo="Completados"
          valor={estadisticas.completados}
          descripcion="Proceso totalmente finalizado"
          icono={<CheckCircle className="w-5 h-5" />}
          color="#51590E"
        />

      </div>

      {/* Grid de estadísticas de proceso */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Dinero devuelto */}
        <StatCard
          titulo="Dinero Devuelto"
          valor={estadisticas.dineroDevuelto}
          descripcion="Con reembolso procesado"
          icono={<DollarSign className="w-5 h-5" />}
          color="#51590E"
        />

        {/* Notas de crédito */}
        <StatCard
          titulo="Notas Emitidas"
          valor={estadisticas.notasEmitidas}
          descripcion="Con nota de crédito emitida"
          icono={<FileText className="w-5 h-5" />}
          color="#B695BF"
        />

        {/* Sin procesar */}
        <StatCard
          titulo="Sin Procesar"
          valor={estadisticas.sinProcesar}
          descripcion="Faltan acciones pendientes"
          icono={<AlertTriangle className="w-5 h-5" />}
          color="#D94854"
        />

        {/* Mes actual */}
        <StatCard
          titulo="Este Mes"
          valor={estadisticas.devolucionesMesActual}
          descripcion="Devoluciones del mes actual"
          icono={<Calendar className="w-5 h-5" />}
          color="#B695BF"
        />

      </div>

      {/* Grid de estadísticas monetarias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Monto total devoluciones */}
        <StatCard
          titulo="Monto Total"
          valor={`$${estadisticas.montoTotalDevoluciones.toLocaleString('es-AR')}`}
          descripcion="Total en devoluciones procesadas"
          icono={<DollarSign className="w-5 h-5" />}
          color="#D94854"
        />

        {/* Pago envío total */}
        <StatCard
          titulo="Costos de Envío"
          valor={`$${estadisticas.montoTotalPagosEnvio.toLocaleString('es-AR')}`}
          descripcion="Total pagado en envíos"
          icono={<CreditCard className="w-5 h-5" />}
          color="#FFD700"
        />

        {/* Promedio por devolución */}
        <StatCard
          titulo="Promedio Devolución"
          valor={`$${Math.round(estadisticas.montoPromedioDevolucion).toLocaleString('es-AR')}`}
          descripcion="Monto promedio por devolución"
          icono={<Calculator className="w-5 h-5" />}
          color="#B695BF"
        />

      </div>

      {/* Card resumen de costos */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#D94854]/20 border border-[#D94854]/30 rounded-lg">
              <Calculator className="w-6 h-6 text-[#D94854]" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-1">
                💰 Costo Total de Devoluciones
              </h4>
              <p className="text-white/60 text-sm">
                Suma de devoluciones + costos de envío
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-[#D94854]">
              $
              {(estadisticas.montoTotalDevoluciones + estadisticas.montoTotalPagosEnvio).toLocaleString('es-AR')}
            </div>
            <div className="text-sm text-white/50 mt-1">
              📊 Impacto total
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevolucionesEstadisticas;