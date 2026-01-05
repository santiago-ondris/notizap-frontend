import React, { useState, useEffect } from 'react';
import { X, Calendar, Building2, Clock, Calculator, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { ComisionEstadoChip } from './ComisionEstadoChip';
import { comisionesVendedorasService } from '@/services/vendedoras/comisionesVendedorasService';
import { comisionFormato } from '@/utils/vendedoras/comisionHelpers';
import { calendarioDetalle } from '@/utils/vendedoras/calendarioHelpers';
import type {
  DiaCalendario,
  EstadoCalculoComision,
  VendedorasDisponiblesResponse
} from '@/types/vendedoras/comisionTypes';

interface Props {
  dia: DiaCalendario;
  isOpen: boolean;
  onClose: () => void;
  onCalcularClick?: (fecha: string, sucursal: string, turno: string) => void;
  onRecalcularClick?: (fecha: string, sucursal: string, turno: string) => void;
  onRefreshReady?: (refrescar: () => void) => void;
}

export const ComisionDiaModal: React.FC<Props> = ({
  dia,
  isOpen,
  onClose,
  onCalcularClick,
  onRecalcularClick,
  onRefreshReady
}) => {
  const [loading, setLoading] = useState(false);
  const [vendedorasData, setVendedorasData] = useState<Map<string, VendedorasDisponiblesResponse>>(new Map());
  const [error, setError] = useState<string | null>(null);

  // Cargar datos detallados cuando se abre el modal
  useEffect(() => {
    if (isOpen && dia.estadosPorSucursalTurno.length > 0) {
      cargarDetallesVendedoras();
    }
  }, [isOpen, dia]);

  useEffect(() => {
    if (onRefreshReady) {
      onRefreshReady(cargarDetallesVendedoras);
    }
  }, [onRefreshReady]);

  const cargarDetallesVendedoras = async () => {
    if (!dia.estadosPorSucursalTurno.length) return;

    try {
      setLoading(true);
      setError(null);

      const vendedorasDisponibles = await comisionesVendedorasService.obtenerDetalleDia(dia.fecha);

      const nuevasVendedoras = new Map<string, VendedorasDisponiblesResponse>();

      vendedorasDisponibles.forEach(vendedora => {
        const key = `${vendedora.sucursalNombre}-${vendedora.turno}`;
        nuevasVendedoras.set(key, vendedora);
      });

      setVendedorasData(nuevasVendedoras);
    } catch (err) {
      console.error('Error cargando detalles:', err);
      setError('Error al cargar detalles del día');
    } finally {
      setLoading(false);
    }
  };

  const handleCalcularClick = (estado: EstadoCalculoComision) => {
    onCalcularClick?.(dia.fecha, estado.sucursalNombre, estado.turno);
  };

  const handleRecalcularClick = (estado: EstadoCalculoComision) => {
    onRecalcularClick?.(dia.fecha, estado.sucursalNombre, estado.turno);
  };

  if (!isOpen) return null;

  const resumen = calendarioDetalle.resumenDia(dia);
  const totalesPorSucursal = calendarioDetalle.totalesPorSucursal(dia.estadosPorSucursalTurno);
  const estadosConVentas = dia.estadosPorSucursalTurno.filter(e => e.tieneVentas);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#1A1A20] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-blue-400" />
              <div>
                <h2 className="text-xl font-bold text-white">
                  {comisionFormato.formatearFechaCompleta(dia.fecha)}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <ComisionEstadoChip estado={dia.estado} />
                  {dia.esHoy && (
                    <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/40 rounded text-blue-300 text-xs">
                      HOY
                    </span>
                  )}
                  {dia.esDomingo && (
                    <span className="px-2 py-1 bg-red-500/20 border border-red-500/40 rounded text-red-300 text-xs">
                      DOMINGO
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar"
          onWheel={(e) => {
            e.stopPropagation();
          }}
        >

          {/* Sin datos */}
          {estadosConVentas.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white/80 mb-2">Sin datos de ventas</h3>
              <p className="text-white/60">
                No hay información de ventas registrada para este día.
              </p>
            </div>
          )}

          {/* Resumen general */}
          {estadosConVentas.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{resumen.totalSucursales}</div>
                <div className="text-xs text-white/60">Sucursales</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{resumen.totalTurnos}</div>
                <div className="text-xs text-white/60">Turnos con ventas</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-300">{resumen.turnosCompletos}</div>
                <div className="text-xs text-white/60">Comisiones calculadas</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-yellow-300">
                  {resumen.totalTurnos - resumen.turnosCompletos}
                </div>
                <div className="text-xs text-white/60">Pendientes</div>
              </div>
            </div>
          )}

          {/* Error de carga */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 text-red-300">
                <AlertTriangle className="w-5 h-5" />
                <span>{error}</span>
              </div>
              <button
                onClick={cargarDetallesVendedoras}
                className="mt-2 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded text-red-300 text-sm transition-colors"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3 text-white/60">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Cargando detalles...</span>
              </div>
            </div>
          )}

          {/* Detalles por sucursal */}
          {totalesPorSucursal.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Detalle por sucursal
              </h3>

              {totalesPorSucursal.map(total => {
                const estadosSucursal = dia.estadosPorSucursalTurno.filter(
                  e => e.sucursalNombre === total.sucursal && e.tieneVentas
                );

                return (
                  <div key={total.sucursal} className="bg-white/5 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-white">{total.sucursal}</h4>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">
                          {comisionFormato.formatearMoneda(total.montoTotal)}
                        </div>
                        <div className="text-xs text-white/60">Facturado total</div>
                      </div>
                    </div>

                    {/* Turnos de la sucursal */}
                    <div className="space-y-3">
                      {estadosSucursal.map(estado => {
                        const key = `${estado.sucursalNombre}-${estado.turno}`;
                        const vendedorasInfo = vendedorasData.get(key);

                        return (
                          <div key={estado.turno} className="bg-white/5 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <Clock className="w-4 h-4 text-white/60" />
                                <span className="font-medium text-white">
                                  {comisionFormato.formatearTurno(estado.turno)}
                                </span>
                                <ComisionEstadoChip
                                  estado={estado.tieneComisionesCalculadas ? 'completo' : 'pendiente'}
                                  size="sm"
                                />
                              </div>

                              <div className="text-right">
                                <div className="font-medium text-white">
                                  {comisionFormato.formatearMoneda(estado.montoFacturado)}
                                </div>
                                <div className="text-xs text-white/60">
                                  {estado.vendedorasConVentas} vendedoras
                                </div>
                              </div>
                            </div>

                            {/* Información adicional */}
                            {vendedorasInfo && (
                              <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                                <div>
                                  <span className="text-white/60">Vendedoras con ventas: </span>
                                  <span className="text-white">{vendedorasInfo.vendedorasConVentas.length}</span>
                                </div>
                                <div>
                                  <span className="text-white/60">Total disponibles: </span>
                                  <span className="text-white">{vendedorasInfo.vendedorasDisponibles.length}</span>
                                </div>
                              </div>
                            )}

                            {/* Acciones */}
                            <div className="flex gap-2">
                              {estado.tieneComisionesCalculadas ? (
                                <button
                                  onClick={() => handleRecalcularClick(estado)}
                                  className="flex items-center gap-2 px-3 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/40 rounded-lg text-yellow-300 text-sm transition-colors"
                                >
                                  <Calculator className="w-4 h-4" />
                                  Recalcular
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleCalcularClick(estado)}
                                  className="flex items-center gap-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 rounded-lg text-green-300 text-sm transition-colors"
                                >
                                  <Calculator className="w-4 h-4" />
                                  Calcular comisiones
                                </button>
                              )}

                              {vendedorasInfo && vendedorasInfo.yaExistenComisiones && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 border border-blue-500/40 rounded-lg text-blue-300 text-sm">
                                  <CheckCircle2 className="w-4 h-4" />
                                  Ya calculadas
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-white/5">
          <div className="flex items-center justify-between">
            <div className="text-xs text-white/60">
              💡 Haz clic en "Calcular comisiones" para configurar las vendedoras
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};