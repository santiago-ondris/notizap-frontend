import React, { useState, useEffect } from 'react';
import { X, Calendar, Building2, Clock, Users, Calculator, AlertTriangle, CheckCircle2, Loader2, Search, Plus, Minus } from 'lucide-react';
import { comisionesVendedorasService } from '@/services/vendedoras/comisionesVendedorasService';
import { comisionFormato, comisionPreview, comisionVendedoras } from '@/utils/vendedoras/comisionHelpers';
import { toast } from 'react-toastify';
import type { 
  VendedorasDisponiblesResponse,
  VendedoraDisponible,
  CalcularComisionRequest,
  CalcularComisionResponse
} from '@/types/vendedoras/comisionTypes';

interface Props {
  fecha: string;
  sucursalNombre: string;
  turno: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (response: CalcularComisionResponse) => void;
  esRecalculo?: boolean;
}

export const ComisionesCalculadora: React.FC<Props> = ({
  fecha,
  sucursalNombre,
  turno,
  isOpen,
  onClose,
  onSuccess,
  esRecalculo = false
}) => {
  const [loading, setLoading] = useState(false);
  const [calculando, setCalculando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [datosVendedoras, setDatosVendedoras] = useState<VendedorasDisponiblesResponse | null>(null);
  const [vendedorasSeleccionadas, setVendedorasSeleccionadas] = useState<VendedoraDisponible[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarDisponibles, setMostrarDisponibles] = useState(false);

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      cargarDatosVendedoras();
    } else {
      // Reset al cerrar
      setDatosVendedoras(null);
      setVendedorasSeleccionadas([]);
      setBusqueda('');
      setMostrarDisponibles(false);
      setError(null);
    }
  }, [isOpen, fecha, sucursalNombre, turno]);

  const cargarDatosVendedoras = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const datos = await comisionesVendedorasService.obtenerVendedorasDisponibles(
        fecha,
        sucursalNombre,
        turno
      );
      
      setDatosVendedoras(datos);
      
      // Pre-seleccionar vendedoras con ventas
      const preSeleccionadas = datos.vendedorasConVentas.map(v => ({
        ...v,
        estaSeleccionada: true
      }));
      setVendedorasSeleccionadas(preSeleccionadas);
      
    } catch (err) {
      console.error('Error cargando vendedoras:', err);
      setError('Error al cargar datos de vendedoras');
    } finally {
      setLoading(false);
    }
  };

  const toggleVendedora = (vendedora: VendedoraDisponible) => {
    setVendedorasSeleccionadas(prev => {
      const existe = prev.find(v => v.id === vendedora.id);
      
      if (existe) {
        // Remover
        return prev.filter(v => v.id !== vendedora.id);
      } else {
        // Agregar
        return [...prev, { ...vendedora, estaSeleccionada: true }];
      }
    });
  };

  const handleCalcular = async () => {
    if (!datosVendedoras) return;

    // Validaciones UX
    const { esValida, mensaje } = comisionVendedoras.validarSeleccionUX(vendedorasSeleccionadas);
    if (!esValida) {
      toast.error(mensaje);
      return;
    }

    const fechaObj = new Date(fecha);
    const { esValido, mensaje: mensajeValidacion } = comisionPreview.validacionesBasicasUX(
      fechaObj,
      vendedorasSeleccionadas.length
    );
    
    if (!esValido) {
      toast.error(mensajeValidacion);
      return;
    }

    try {
      setCalculando(true);
      setError(null);

      const request: CalcularComisionRequest = {
        fecha,
        sucursalNombre,
        turno: turno as 'Mañana' | 'Tarde',
        vendedorasNombres: vendedorasSeleccionadas.map(v => v.nombre)
      };

      const response = esRecalculo 
        ? await comisionesVendedorasService.recalcularComisiones(request)
        : await comisionesVendedorasService.calcularComisiones(request);

      toast.success(response.mensaje || `Comisiones ${esRecalculo ? 'recalculadas' : 'calculadas'} correctamente`);
      onSuccess?.(response);
      onClose();

    } catch (err: any) {
      console.error('Error calculando comisiones:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Error al calcular comisiones';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setCalculando(false);
    }
  };

  // Filtrar vendedoras disponibles para agregar
  const vendedorasParaAgregar = datosVendedoras?.vendedorasDisponibles.filter(v => {
    const yaSeleccionada = vendedorasSeleccionadas.some(s => s.id === v.id);
    const cumpleBusqueda = !busqueda || v.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return !yaSeleccionada && cumpleBusqueda;
  }) || [];

  // Preview de cálculos
  const previewComision = datosVendedoras 
    ? comisionPreview.previewComisionIndividual(datosVendedoras.montoFacturado, vendedorasSeleccionadas.length)
    : 0;
  
  const previewTotal = datosVendedoras 
    ? comisionPreview.previewComisionTotal(datosVendedoras.montoFacturado)
    : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#1A1A20] border border-white/10 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calculator className="w-6 h-6 text-green-400" />
              <div>
                <h2 className="text-xl font-bold text-white">
                  {esRecalculo ? 'Recalcular' : 'Calcular'} comisiones
                </h2>
                <div className="flex items-center gap-4 mt-1 text-sm text-white/60">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {comisionFormato.formatearFecha(fecha)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {sucursalNombre}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {comisionFormato.formatearTurno(turno)}
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              disabled={calculando}
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>

          {/* Advertencia de recálculo */}
          {esRecalculo && datosVendedoras?.yaExistenComisiones && (
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <div className="flex items-center gap-2 text-yellow-300">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">¡Advertencia!</span>
              </div>
              <p className="text-yellow-300/80 text-sm mt-1">
                Las comisiones para este día ya fueron calculadas. Al recalcular se sobrescribirán los valores existentes.
              </p>
            </div>
          )}
        </div>

        {/* Content */}
        <div 
          className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar"
          onWheel={(e) => {
            e.stopPropagation();
          }}
        >
          
          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-white/60">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Cargando vendedoras...</span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 text-red-300">
                <AlertTriangle className="w-5 h-5" />
                <span>{error}</span>
              </div>
              <button
                onClick={cargarDatosVendedoras}
                className="mt-2 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded text-red-300 text-sm transition-colors"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Contenido principal */}
          {datosVendedoras && !loading && (
            <div className="space-y-6">
              
              {/* Información de ventas */}
              <div className="bg-white/5 rounded-xl p-5">
                <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Información del día
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-white/60">Monto facturado:</span>
                    <div className="font-medium text-white">
                      {comisionFormato.formatearMoneda(datosVendedoras.montoFacturado)}
                    </div>
                  </div>
                  <div>
                    <span className="text-white/60">Vendedoras con ventas:</span>
                    <div className="font-medium text-white">
                      {datosVendedoras.vendedorasConVentas.length}
                    </div>
                  </div>
                  <div>
                    <span className="text-white/60">Total disponibles:</span>
                    <div className="font-medium text-white">
                      {datosVendedoras.vendedorasDisponibles.length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview de cálculos */}
              {vendedorasSeleccionadas.length > 0 && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5">
                  <h3 className="font-medium text-green-300 mb-4">Preview del cálculo</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-green-300/60">Monto sin IVA:</span>
                      <div className="font-medium text-green-300">
                        {comisionFormato.formatearMoneda(
                          comisionPreview.previewMontoSinIva(datosVendedoras.montoFacturado)
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-green-300/60">Comisión total (1%):</span>
                      <div className="font-medium text-green-300">
                        {comisionFormato.formatearMoneda(previewTotal)}
                      </div>
                    </div>
                    <div>
                      <span className="text-green-300/60">Por vendedora:</span>
                      <div className="font-medium text-green-300">
                        {comisionFormato.formatearMoneda(previewComision)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Vendedoras seleccionadas */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    Vendedoras seleccionadas ({vendedorasSeleccionadas.length})
                  </h3>
                </div>

                {vendedorasSeleccionadas.length === 0 ? (
                  <div className="text-center py-8 text-white/60">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-60" />
                    <p>No hay vendedoras seleccionadas</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {vendedorasSeleccionadas.map(vendedora => (
                      <div 
                        key={vendedora.id}
                        className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-white">{vendedora.nombre}</span>
                          {vendedora.tieneVentasEnElDia && (
                            <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/40 rounded text-blue-300 text-xs">
                              Con ventas
                            </span>
                          )}
                        </div>
                        
                        <button
                          onClick={() => toggleVendedora(vendedora)}
                          className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Agregar vendedoras */}
              {vendedorasParaAgregar.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-white">Agregar vendedoras</h3>
                    <button
                      onClick={() => setMostrarDisponibles(!mostrarDisponibles)}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-white text-sm transition-colors"
                    >
                      {mostrarDisponibles ? 'Ocultar' : 'Mostrar'} disponibles
                    </button>
                  </div>

                  {mostrarDisponibles && (
                    <div className="space-y-3">
                      {/* Buscador */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                        <input
                          type="text"
                          placeholder="Buscar vendedora..."
                          value={busqueda}
                          onChange={(e) => setBusqueda(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors"
                        />
                      </div>

                      {/* Lista de disponibles */}
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {vendedorasParaAgregar.map(vendedora => (
                          <div 
                            key={vendedora.id}
                            className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                              <span className="text-white">{vendedora.nombre}</span>
                              {vendedora.tieneVentasEnElDia && (
                                <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/40 rounded text-blue-300 text-xs">
                                  Con ventas
                                </span>
                              )}
                            </div>
                            
                            <button
                              onClick={() => toggleVendedora(vendedora)}
                              className="p-1 text-green-400 hover:bg-green-500/20 rounded transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {datosVendedoras && !loading && (
          <div className="p-6 border-t border-white/10 bg-white/5">
            <div className="flex items-center justify-between">
              <div className="text-xs text-white/60">
                💡 Selecciona las vendedoras que trabajaron en este turno
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors"
                  disabled={calculando}
                >
                  Cancelar
                </button>
                
                <button
                  onClick={handleCalcular}
                  className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 rounded-lg text-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={calculando || vendedorasSeleccionadas.length === 0}
                >
                  {calculando && <Loader2 className="w-4 h-4 animate-spin" />}
                  {esRecalculo ? 'Recalcular' : 'Calcular'} comisiones
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};