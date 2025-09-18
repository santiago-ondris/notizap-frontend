import React from 'react';
import { 
  ShoppingCart, 
  FileText, 
  Clock, 
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Package
} from 'lucide-react';
import { type DevolucionesMercadoLibreEstadisticas } from '@/types/cambios/devolucionesMercadoLibreTypes';

interface DevolucionesMercadoLibreEstadisticasProps {
  estadisticas: DevolucionesMercadoLibreEstadisticas | null;
  cargando?: boolean;
}

const StatCard: React.FC<{
  titulo: string;
  valor: string | number;
  descripcion: string;
  icono: React.ReactNode;
  color: string;
  colorFondo?: string;
  destacado?: boolean;
}> = ({ titulo, valor, descripcion, icono, color, colorFondo, destacado = false }) => (
  <div className={`
    bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 transition-all
    ${destacado ? 'bg-white/10 border-white/20' : 'hover:bg-white/10'}
  `}>
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
          className={`text-2xl font-bold ${destacado ? 'text-3xl' : ''}`}
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

const ProgressBar: React.FC<{
  titulo: string;
  valor: number;
  maximo: number;
  color: string;
  mostrarPorcentaje?: boolean;
}> = ({ titulo, valor, maximo, color, mostrarPorcentaje = true }) => {
  const porcentaje = maximo > 0 ? (valor / maximo) * 100 : 0;
  
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-white">{titulo}</h4>
        <span className="text-sm font-bold" style={{ color }}>
          {mostrarPorcentaje ? `${Math.round(porcentaje)}%` : `${valor}/${maximo}`}
        </span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2">
        <div 
          className="h-2 rounded-full transition-all duration-500"
          style={{ 
            backgroundColor: color,
            width: `${Math.min(porcentaje, 100)}%`
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-white/50 mt-1">
        <span>{valor} procesadas</span>
        <span>{maximo - valor} pendientes</span>
      </div>
    </div>
  );
};

const MiniChart: React.FC<{
  datos: Array<{ mes: string; valor: number; emitidas: number }>;
}> = ({ datos }) => {
  const maxValor = Math.max(...datos.map(d => d.valor));
  
  if (datos.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
        <BarChart3 className="w-8 h-8 text-white/40 mx-auto mb-2" />
        <p className="text-white/60 text-sm">Sin datos para mostrar</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <h4 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
        <BarChart3 className="w-4 h-4" />
        📊 Últimos 6 meses
      </h4>
      <div className="flex items-end justify-between gap-2 h-24">
        {datos.slice(0, 6).map((dato, index) => {
          const altura = maxValor > 0 ? (dato.valor / maxValor) * 100 : 0;
          const porcentajeEmitidas = dato.valor > 0 ? (dato.emitidas / dato.valor) * 100 : 0;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-white/10 rounded-t relative" style={{ height: '60px' }}>
                {/* Barra total */}
                <div 
                  className="w-full bg-[#B695BF]/30 rounded-t absolute bottom-0 transition-all duration-500"
                  style={{ height: `${altura}%` }}
                />
                {/* Barra de emitidas */}
                <div 
                  className="w-full bg-[#51590E] rounded-t absolute bottom-0 transition-all duration-700"
                  style={{ height: `${(altura * porcentajeEmitidas) / 100}%` }}
                />
              </div>
              <div className="text-xs text-white/60 mt-2 text-center">
                <div className="font-medium">{dato.mes}</div>
                <div className="text-white/40">{dato.valor}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-[#B695BF]/30 rounded"></div>
          <span className="text-white/60">Total</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-[#51590E] rounded"></div>
          <span className="text-white/60">Emitidas</span>
        </div>
      </div>
    </div>
  );
};

export const DevolucionesMercadoLibreEstadisticasComp: React.FC<DevolucionesMercadoLibreEstadisticasProps> = ({
  estadisticas,
  cargando = false
}) => {

  // Estado de carga
  if (cargando) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
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
            Carga algunas devoluciones de MercadoLibre para ver las estadísticas
          </p>
        </div>
      </div>
    );
  }

  // Preparar datos para el mini chart
  const datosChart = estadisticas.estadisticasPorMes.map(e => ({
    mes: e.nombreMes.substring(0, 3),
    valor: e.totalDevoluciones,
    emitidas: e.notasCreditoEmitidas
  }));

  return (
    <div className="space-y-6">
      {/* Header de estadísticas */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#B695BF]/20 border border-[#B695BF]/30 rounded-lg">
          <TrendingUp className="w-5 h-5 text-[#B695BF]" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">
            📊 Estadísticas MercadoLibre
          </h3>
          <p className="text-white/60 text-sm">
            Resumen de devoluciones y notas de crédito
          </p>
        </div>
      </div>

      {/* Grid de estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total de devoluciones */}
        <StatCard
          titulo="Total Devoluciones ML"
          valor={estadisticas.totalDevoluciones}
          descripcion="Devoluciones registradas en total"
          icono={<ShoppingCart className="w-5 h-5" />}
          color="#B695BF"
          destacado
        />

        {/* Notas de crédito emitidas */}
        <StatCard
          titulo="Notas Emitidas"
          valor={estadisticas.notasCreditoEmitidas}
          descripcion="Notas de crédito procesadas"
          icono={<CheckCircle className="w-5 h-5" />}
          color="#51590E"
        />

        {/* Notas de crédito pendientes */}
        <StatCard
          titulo="Notas Pendientes"
          valor={estadisticas.notasCreditoPendientes}
          descripcion="Esperando procesamiento"
          icono={<Clock className="w-5 h-5" />}
          color="#D94854"
        />

        {/* Devoluciones del mes actual */}
        <StatCard
          titulo="Este Mes"
          valor={estadisticas.devolucionesMesActual}
          descripcion="Devoluciones del mes actual"
          icono={<Calendar className="w-5 h-5" />}
          color="#FFD700"
        />

      </div>

      {/* Grid de progreso y tendencias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Barra de progreso de notas de crédito */}
        <div className="space-y-4">
          <ProgressBar
            titulo="🧾 Progreso de Notas de Crédito"
            valor={estadisticas.notasCreditoEmitidas}
            maximo={estadisticas.totalDevoluciones}
            color="#51590E"
          />
          
          {/* Card de porcentaje destacado */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#51590E]/20 border border-[#51590E]/30 rounded-lg">
                  <FileText className="w-5 h-5 text-[#51590E]" />
                </div>
                <div>
                  <h4 className="font-medium text-white">Tasa de Completitud</h4>
                  <p className="text-xs text-white/60">Porcentaje de notas emitidas</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#51590E]">
                  {estadisticas.porcentajeNotasEmitidas}%
                </div>
                <div className="text-xs text-white/50">
                  {estadisticas.totalDevoluciones > 0 ? 'maestro gringo' : 'Sin datos'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mini chart de tendencias */}
        <MiniChart datos={datosChart} />

      </div>

      {/* Resumen ejecutivo */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#B695BF]/20 border border-[#B695BF]/30 rounded-lg">
              <Package className="w-6 h-6 text-[#B695BF]" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-1">
                🛒 Resumen MercadoLibre
              </h4>
              <p className="text-white/60 text-sm">
                {estadisticas.totalDevoluciones > 0 ? (
                  <>
                    De {estadisticas.totalDevoluciones} devoluciones, {estadisticas.notasCreditoEmitidas} tienen nota emitida
                    {estadisticas.notasCreditoPendientes > 0 && (
                      <> y {estadisticas.notasCreditoPendientes} están pendientes</>
                    )}
                  </>
                ) : (
                  'Aún no hay devoluciones de MercadoLibre registradas'
                )}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-[#B695BF]">
              {estadisticas.totalDevoluciones > 0 ? (
                <span>{estadisticas.porcentajeNotasEmitidas}%</span>
              ) : (
                <span>--</span>
              )}
            </div>
            <div className="text-sm text-white/50 mt-1">
              📈 Completitud general
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevolucionesMercadoLibreEstadisticasComp;