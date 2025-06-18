import React from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  AlertTriangle,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { type CambiosEstadisticasData } from '@/types/cambios/cambiosTypes';

interface CambiosEstadisticasProps {
  estadisticas: CambiosEstadisticasData | null;
  cargando?: boolean;
}

/**
 * Componente de card individual para estadísticas
 */
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
 * Componente principal de estadísticas de cambios
 */
export const CambiosEstadisticas: React.FC<CambiosEstadisticasProps> = ({
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
            Carga algunos cambios para ver las estadísticas
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header de estadísticas */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#B695BF]/20 border border-[#B695BF]/30 rounded-lg">
          <TrendingUp className="w-5 h-5 text-[#B695BF]" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">
            📊 Estadísticas de Cambios
          </h3>
          <p className="text-white/60 text-sm">
            Resumen general del estado de los cambios
          </p>
        </div>
      </div>

      {/* Grid de estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total de cambios */}
        <StatCard
          titulo="Total de Cambios"
          valor={estadisticas.totalCambios}
          descripcion="Cambios registrados en total"
          icono={<Package className="w-5 h-5" />}
          color="#e327c4"
        />

        {/* Pendientes de llegada */}
        <StatCard
          titulo="Pendientes Llegada"
          valor={estadisticas.pendientesLlegada}
          descripcion="Esperando que lleguen al depósito"
          icono={<Clock className="w-5 h-5" />}
          color="#FFD700"
        />

        {/* Listos para envío */}
        <StatCard
          titulo="Listos para Envío"
          valor={estadisticas.listosParaEnvio}
          descripcion="Llegaron y están listos para OCA"
          icono={<Truck className="w-5 h-5" />}
          color="#B695BF"
        />

        {/* Enviados */}
        <StatCard
          titulo="Enviados"
          valor={estadisticas.enviados}
          descripcion="Ya fueron despachados"
          icono={<CheckCircle className="w-5 h-5" />}
          color="#51590E"
        />

      </div>

      {/* Grid de estadísticas secundarias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Completados */}
        <StatCard
          titulo="Completados"
          valor={estadisticas.completados}
          descripcion="Proceso totalmente finalizado"
          icono={<CheckCircle className="w-5 h-5" />}
          color="#51590E"
        />

        {/* Sin registrar en sistema */}
        <StatCard
          titulo="Sin Registrar"
          valor={estadisticas.sinRegistrar}
          descripcion="Faltan registrar en el sistema"
          icono={<AlertTriangle className="w-5 h-5" />}
          color="#D94854"
        />

        {/* Diferencia abonada */}
        <StatCard
          titulo="Diferencia Abonada"
          valor={`$${estadisticas.diferenciaAbonada.toLocaleString('es-AR')}`}
          descripcion="Total cobrado por diferencias"
          icono={<DollarSign className="w-5 h-5" />}
          color="#51590E"
        />

        {/* Diferencia a favor */}
        <StatCard
          titulo="Diferencia a Favor"
          valor={`$${estadisticas.diferenciaAFavor.toLocaleString('es-AR')}`}
          descripcion="Total devuelto a clientes"
          icono={<DollarSign className="w-5 h-5" />}
          color="#D94854"
        />

      </div>

      {/* Card de diferencia neta */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="p-3 rounded-lg border"
              style={{ 
                backgroundColor: estadisticas.diferencianNeta >= 0 ? '#51590E20' : '#D9485420',
                borderColor: estadisticas.diferencianNeta >= 0 ? '#51590E30' : '#D9485430'
              }}
            >
              <DollarSign 
                className="w-6 h-6"
                style={{ 
                  color: estadisticas.diferencianNeta >= 0 ? '#51590E' : '#D94854'
                }}
              />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-1">
                💰 Diferencia Neta
              </h4>
              <p className="text-white/60 text-sm">
                {estadisticas.diferencianNeta >= 0 
                  ? 'Ganancia total por diferencias de precio'
                  : 'Pérdida total por diferencias de precio'
                }
              </p>
            </div>
          </div>
          <div className="text-right">
            <div 
              className="text-3xl font-bold"
              style={{ 
                color: estadisticas.diferencianNeta >= 0 ? '#51590E' : '#D94854'
              }}
            >
              {estadisticas.diferencianNeta >= 0 ? '+' : ''}$
              {Math.abs(estadisticas.diferencianNeta).toLocaleString('es-AR')}
            </div>
            <div className="text-sm text-white/50 mt-1">
              {estadisticas.diferencianNeta >= 0 ? '📈 Favorable' : '📉 Desfavorable'}
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Package className="w-5 h-5 text-[#B695BF] mt-0.5" />
          <div className="space-y-2">
            <h4 className="font-medium text-white">💡 Información sobre estados</h4>
            <div className="text-sm text-white/70 space-y-1">
              <p>• <strong style={{ color: '#FFD700' }}>Pendiente llegada:</strong> El producto aún no llegó al depósito</p>
              <p>• <strong style={{ color: '#B695BF' }}>Listo para envío:</strong> Producto llegó, listo para generar etiqueta OCA</p>
              <p>• <strong style={{ color: '#51590E' }}>Enviado:</strong> Ya se despachó al cliente</p>
              <p>• <strong style={{ color: '#51590E' }}>Completado:</strong> Proceso totalmente finalizado</p>
              <p>• <strong style={{ color: '#D94854' }}>Sin registrar:</strong> Falta actualizar en el sistema interno</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CambiosEstadisticas;