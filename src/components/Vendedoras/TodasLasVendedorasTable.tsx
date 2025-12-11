import React, { useState } from 'react';
import { 
  Users, 
  ChevronDown, 
  Building2, 
  TrendingUp,
  Search,
  ArrowUp,
  ArrowDown,
  ArrowUpDown
} from 'lucide-react';
import type { VentaPorVendedora } from '@/types/vendedoras/ventaVendedoraTypes';
import { estadisticasHelpers } from '@/utils/vendedoras/estadisticasHelpers';

interface Props {
  vendedoras: VentaPorVendedora[];
  loading?: boolean;
}

type OrdenPor = 'nombre' | 'montoTotal' | 'totalVentas' | 'promedio' | 'sucursales';
type DireccionOrden = 'asc' | 'desc';

export const TodasLasVendedorasTable: React.FC<Props> = ({ 
  vendedoras = [], 
  loading = false 
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [ordenPor, setOrdenPor] = useState<OrdenPor>('montoTotal');
  const [direccion, setDireccion] = useState<DireccionOrden>('desc');
  const [mostrandoTodas, setMostrandoTodas] = useState(false);

  // Filtrar por búsqueda
  const vendedorasFiltradas = vendedoras.filter(vendedora =>
    vendedora.vendedorNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    vendedora.sucursalesQueTrabaja.some(sucursal => 
      sucursal.toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  // Ordenar vendedoras
  const vendedorasOrdenadas = [...vendedorasFiltradas].sort((a, b) => {
    let valorA: any, valorB: any;
    
    switch (ordenPor) {
      case 'nombre':
        valorA = a.vendedorNombre.toLowerCase();
        valorB = b.vendedorNombre.toLowerCase();
        break;
      case 'montoTotal':
        valorA = a.montoTotal;
        valorB = b.montoTotal;
        break;
      case 'totalVentas':
        valorA = a.totalVentas;
        valorB = b.totalVentas;
        break;
      case 'promedio':
        valorA = a.promedio;
        valorB = b.promedio;
        break;
      case 'sucursales':
        valorA = a.sucursalesQueTrabaja.length;
        valorB = b.sucursalesQueTrabaja.length;
        break;
      default:
        valorA = a.montoTotal;
        valorB = b.montoTotal;
    }

    if (direccion === 'asc') {
      return valorA > valorB ? 1 : -1;
    } else {
      return valorA < valorB ? 1 : -1;
    }
  });

  // Controlar cuántas mostrar
  const vendedorasParaMostrar = mostrandoTodas 
    ? vendedorasOrdenadas 
    : vendedorasOrdenadas.slice(0, 10);

  const handleOrdenar = (campo: OrdenPor) => {
    if (ordenPor === campo) {
      setDireccion(direccion === 'asc' ? 'desc' : 'asc');
    } else {
      setOrdenPor(campo);
      setDireccion('desc');
    }
  };

  const getSortIcon = (campo: OrdenPor) => {
    if (ordenPor !== campo) {
      return <ArrowUpDown className="w-4 h-4 text-white/40" />;
    }
    return direccion === 'desc' 
      ? <ArrowDown className="w-4 h-4 text-yellow-400" />
      : <ArrowUp className="w-4 h-4 text-yellow-400" />;
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-yellow-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">👥 Todas las Vendedoras</h3>
            <p className="text-sm text-white/60">Cargando datos...</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (vendedoras.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">👥 Todas las Vendedoras</h3>
            <p className="text-sm text-white/60">Sin datos en el período seleccionado</p>
          </div>
        </div>
        
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/60">No hay vendedoras con ventas en este período</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">👥 Todas las Vendedoras</h3>
              <p className="text-sm text-white/60">
                {vendedorasFiltradas.length} vendedoras encontradas
              </p>
            </div>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            placeholder="Buscar por nombre o sucursal..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleOrdenar('nombre')}
                  className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors group"
                >
                  👤 Vendedora
                  {getSortIcon('nombre')}
                </button>
              </th>
              
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleOrdenar('sucursales')}
                  className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors group"
                >
                  <Building2 className="w-4 h-4" />
                  Sucursales
                  {getSortIcon('sucursales')}
                </button>
              </th>

              <th className="px-6 py-4 text-right">
                <button
                  onClick={() => handleOrdenar('montoTotal')}
                  className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors ml-auto group"
                >
                  💰 Monto Total
                  {getSortIcon('montoTotal')}
                </button>
              </th>

              <th className="px-6 py-4 text-right">
                <button
                  onClick={() => handleOrdenar('totalVentas')}
                  className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors ml-auto group"
                >
                  📊 Ventas
                  {getSortIcon('totalVentas')}
                </button>
              </th>

              <th className="px-6 py-4 text-right">
                <button
                  onClick={() => handleOrdenar('promedio')}
                  className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors ml-auto group"
                >
                  <TrendingUp className="w-4 h-4" />
                  Promedio
                  {getSortIcon('promedio')}
                </button>
              </th>
            </tr>
          </thead>

          <tbody>
            {vendedorasParaMostrar.map((vendedora) => {
              const posicion = vendedorasOrdenadas.findIndex(v => v.vendedorNombre === vendedora.vendedorNombre) + 1;
              const emojiPosicion = estadisticasHelpers.obtenerEmojiPosicion(posicion);
              return (
                <tr 
                  key={vendedora.vendedorNombre}
                  className="border-b border-white/10 hover:bg-white/5 transition-colors group"
                >
                  {/* Vendedora */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{emojiPosicion}</span>
                      <div>
                        <p className="font-medium text-white">{vendedora.vendedorNombre}</p>
                        <p className="text-xs text-white/60">Posición #{posicion}</p>
                      </div>
                    </div>
                  </td>

                  {/* Sucursales */}
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {vendedora.sucursalesQueTrabaja.map((sucursal, idx) => (
                        <span 
                          key={idx}
                          className="inline-block px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs mr-1"
                        >
                          {sucursal}
                        </span>
                      ))}
                      {vendedora.sucursalesQueTrabaja.length > 2 && (
                        <span className="text-xs text-white/60">
                          +{vendedora.sucursalesQueTrabaja.length - 2} más
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Monto Total */}
                  <td className="px-6 py-4 text-right">
                    <p className="font-bold text-green-400">
                      {estadisticasHelpers.formatearMoneda(vendedora.montoTotal)}
                    </p>
                    <p className="text-xs text-white/60">
                      {estadisticasHelpers.formatearMonedaCompacta(vendedora.montoTotal)}
                    </p>
                  </td>

                  {/* Total Ventas */}
                  <td className="px-6 py-4 text-right">
                    <p className="font-medium text-white">
                      {estadisticasHelpers.formatearNumero(vendedora.totalVentas)}
                    </p>
                    <p className="text-xs text-white/60">productos netos</p>
                  </td>

                  {/* Promedio */}
                  <td className="px-6 py-4 text-right">
                    <p className="font-medium text-blue-400">
                      {estadisticasHelpers.formatearMoneda(vendedora.promedio)}
                    </p>
                    <p className="text-xs text-white/60">por venta</p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer con botón para mostrar todas */}
      {vendedorasOrdenadas.length > 10 && (
        <div className="p-4 border-t border-white/10 text-center">
          <button
            onClick={() => setMostrandoTodas(!mostrandoTodas)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white/80 transition-all mx-auto"
          >
            {mostrandoTodas ? (
              <>
                Mostrar solo top 10
                <ChevronDown className="w-4 h-4 rotate-180" />
              </>
            ) : (
              <>
                Ver todas las {vendedorasOrdenadas.length} vendedoras
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Resumen */}
      <div className="p-4 bg-white/5 border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-white">
              {vendedorasFiltradas.length}
            </p>
            <p className="text-xs text-white/60">Vendedoras activas</p>
          </div>
          <div>
            <p className="text-lg font-bold text-green-400">
              {estadisticasHelpers.formatearMonedaCompacta(
                vendedorasFiltradas.reduce((sum, v) => sum + v.montoTotal, 0)
              )}
            </p>
            <p className="text-xs text-white/60">Total conjunto</p>
          </div>
          <div>
            <p className="text-lg font-bold text-blue-400">
              {estadisticasHelpers.formatearMoneda(
                vendedorasFiltradas.length > 0 
                  ? vendedorasFiltradas.reduce((sum, v) => sum + v.promedio, 0) / vendedorasFiltradas.length
                  : 0
              )}
            </p>
            <p className="text-xs text-white/60">Promedio general</p>
          </div>
        </div>
      </div>
    </div>
  );
};