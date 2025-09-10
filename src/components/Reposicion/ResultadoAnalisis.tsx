import React, { useState } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  TrendingUp, 
  Building2, 
  Package, 
  Clock,
  CheckCircle,
  AlertCircle,
  Users
} from 'lucide-react';
import type { ResultadoAnalisisReposicion } from '../../types/reposicion/reposicionTypes';
import { SucursalCard } from './SucursalCard';
import { agruparItemsPorProductoColor, calcularEstadisticasReposicion, formatearDuracion } from '../../utils/reposicionUtils';

interface ResultadoAnalisisProps {
  resultado: ResultadoAnalisisReposicion;
  onDescargar: () => void;
  descargando?: boolean;
  tiempoEjecucion?: number;
  nombreArchivo?: string;
}

export const ResultadoAnalisis: React.FC<ResultadoAnalisisProps> = ({
  resultado,
  onDescargar,
  descargando = false,
  tiempoEjecucion,
  nombreArchivo
}) => {
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string | null>(null);
  
  const estadisticas = calcularEstadisticasReposicion(resultado.reposicionesPorSucursal);
  const hayReposiciones = resultado.reposicionesPorSucursal.some(r => r.items.length > 0);
  const sucursalActiva = sucursalSeleccionada 
    ? resultado.reposicionesPorSucursal.find(r => r.nombreSucursal === sucursalSeleccionada)
    : null;

  return (
    <div className="space-y-6">
      {/* Header con resumen ejecutivo */}
      <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#51590E]/20 border border-[#51590E]/30 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#51590E]" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Análisis de Reposición Completado
              </h2>
              <p className="text-white/70 mb-4">
                {hayReposiciones 
                  ? `${estadisticas.totalItems} ítems únicos, ${estadisticas.totalUnidades} unidades totales para ${estadisticas.totalSucursales} sucursales`
                  : 'No se encontraron ítems que requieran reposición'
                }
              </p>
              
              <div className="flex items-center gap-6 text-sm text-white/60">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Analizado por: {resultado.usuarioAnalisis}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    {new Date(resultado.fechaAnalisis).toLocaleString('es-AR')}
                    {tiempoEjecucion && ` • ${formatearDuracion(tiempoEjecucion)}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {hayReposiciones && (
            <button
              onClick={onDescargar}
              disabled={descargando}
              className="flex items-center gap-3 px-6 py-3 rounded-xl bg-[#51590E]/20 hover:bg-[#51590E]/30 border border-[#51590E]/30 text-[#51590E] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {descargando ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#51590E]" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              <span className="font-medium">
                {descargando ? 'Generando...' : 'Descargar Excel'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Estadísticas generales */}
      {hayReposiciones && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl bg-[#D94854]/10 backdrop-blur-sm border border-[#D94854]/30 p-4">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-[#D94854]" />
              <div>
                <p className="text-sm text-white/70">Total Ítems</p>
                <p className="text-xl font-bold text-white">{estadisticas.totalItems}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-[#B695BF]/10 backdrop-blur-sm border border-[#B695BF]/30 p-4">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-6 h-6 text-[#B695BF]" />
              <div>
                <p className="text-sm text-white/70">Total Unidades</p>
                <p className="text-xl font-bold text-white">{estadisticas.totalUnidades}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-[#51590E]/10 backdrop-blur-sm border border-[#51590E]/30 p-4">
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6 text-[#51590E]" />
              <div>
                <p className="text-sm text-white/70">Sucursales</p>
                <p className="text-xl font-bold text-white">{estadisticas.totalSucursales}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-[#e327c4]/10 backdrop-blur-sm border border-[#e327c4]/30 p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-[#e327c4]" />
              <div>
                <p className="text-sm text-white/70">Promedio/Sucursal</p>
                <p className="text-xl font-bold text-white">{estadisticas.promedioUnidadesPorSucursal}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensajes informativos */}
      {resultado.mensajesInformativos.length > 0 && (
        <div className="rounded-xl bg-[#FFD700]/10 backdrop-blur-sm border border-[#FFD700]/30 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#FFD700] mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-[#FFD700]">Información del análisis</h4>
              <ul className="space-y-1">
                {resultado.mensajesInformativos.map((mensaje, i) => (
                  <li key={i} className="text-sm text-white/80">{mensaje}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Grid de sucursales */}
      {hayReposiciones ? (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Reposición por Sucursal</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resultado.reposicionesPorSucursal.map(reposicion => (
              <SucursalCard
                key={reposicion.nombreSucursal}
                reposicion={reposicion}
                onClick={() => setSucursalSeleccionada(
                  sucursalSeleccionada === reposicion.nombreSucursal 
                    ? null 
                    : reposicion.nombreSucursal
                )}
                seleccionada={sucursalSeleccionada === reposicion.nombreSucursal}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#51590E]/20 border border-[#51590E]/30 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-[#51590E]" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            ¡Todo está en orden!
          </h3>
          <p className="text-white/70 max-w-md mx-auto">
            No se encontraron productos que requieran reposición. 
            Todas las sucursales tienen stock suficiente según la curva de talles configurada.
          </p>
        </div>
      )}

      {/* Sucursales sin reposición */}
      {resultado.sucursalesSinReposicion.length > 0 && (
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-[#51590E] mt-0.5" />
            <div>
              <h4 className="font-medium text-white mb-2">Sucursales sin reposición necesaria</h4>
              <div className="flex flex-wrap gap-2">
                {resultado.sucursalesSinReposicion.map(sucursal => (
                  <span 
                    key={sucursal}
                    className="px-3 py-1 rounded-lg bg-[#51590E]/10 border border-[#51590E]/30 text-[#51590E] text-sm"
                  >
                    {sucursal}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detalles de la sucursal seleccionada */}
      {sucursalActiva && (
        <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">
              Detalle: {sucursalActiva.nombreSucursal}
            </h4>
            <button
              onClick={() => setSucursalSeleccionada(null)}
              className="text-white/70 hover:text-white"
            >
              <span className="sr-only">Cerrar</span>
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 rounded-lg bg-white/5">
              <p className="text-2xl font-bold text-white">{sucursalActiva.totalItems}</p>
              <p className="text-sm text-white/70">Ítems únicos</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/5">
              <p className="text-2xl font-bold text-white">{sucursalActiva.totalUnidades}</p>
              <p className="text-sm text-white/70">Unidades totales</p>
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="font-medium text-white">Productos a reponer:</h5>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {Object.entries(agruparItemsPorProductoColor(sucursalActiva.items)).map(([producto, items]) => (
                <div key={producto} className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white text-sm">{producto}</span>
                    <span className="text-white/70 text-sm">
                      {items.reduce((sum, item) => sum + item.cantidadAReponer, 0)} unidades
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {items.sort((a, b) => a.talle - b.talle).map(item => (
                      <span 
                        key={`${item.talle}`}
                        className="px-2 py-1 rounded bg-white/10 text-xs text-white/80"
                      >
                        T{item.talle}: {item.cantidadAReponer}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Información del archivo de salida */}
      {hayReposiciones && nombreArchivo && (
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-5 h-5 text-[#B695BF]" />
            <div>
              <p className="text-sm text-white/70">Archivo de salida:</p>
              <p className="font-medium text-white">{nombreArchivo}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};