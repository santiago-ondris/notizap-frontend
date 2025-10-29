import React, { useState, useEffect } from 'react';
import { Download, FileSpreadsheet, Loader2, Calendar, Building2, Clock, User, ArrowUpDown } from 'lucide-react';
import { comisionesVendedorasService } from '@/services/vendedoras/comisionesVendedorasService';
import { comisionFechas } from '@/utils/vendedoras/comisionHelpers';
import { TURNOS_COMISIONES } from '@/types/vendedoras/comisionFiltersTypes';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import type { 
  ExportarLiquidacionComisionesRequest,
  DatosMaestrosComisiones 
} from '@/types/vendedoras/comisionTypes';

interface Props {
  className?: string;
}

export const ExportarLiquidacionVista: React.FC<Props> = ({ className }) => {
  const [exportando, setExportando] = useState(false);
  const [loadingDatos, setLoadingDatos] = useState(true);
  const [datosMaestros, setDatosMaestros] = useState<DatosMaestrosComisiones | null>(null);

  // Período por defecto: mes anterior
  const rangoMesAnterior = comisionFechas.rangoMesAnterior();
  const [filtros, setFiltros] = useState({
    fechaInicio: rangoMesAnterior.inicio,
    fechaFin: rangoMesAnterior.fin,
    sucursalNombre: '',
    turno: '' as '' | 'Mañana' | 'Tarde',
    vendedorNombre: '',
    orderBy: 'nombre' as 'nombre' | 'monto' | 'dias',
    orderDesc: false
  });

  useEffect(() => {
    cargarDatosMaestros();
  }, []);

  const cargarDatosMaestros = async () => {
    try {
      setLoadingDatos(true);
      const datos = await comisionesVendedorasService.obtenerDatosMaestros();
      setDatosMaestros(datos);
    } catch (error) {
      console.error('Error cargando datos maestros:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoadingDatos(false);
    }
  };

  const handleExportar = async () => {
    try {
      setExportando(true);

      const request: ExportarLiquidacionComisionesRequest = {
        fechaInicio: comisionFechas.formatearParaApi(filtros.fechaInicio),
        fechaFin: comisionFechas.formatearParaApi(filtros.fechaFin),
        sucursalNombre: filtros.sucursalNombre || undefined,
        turno: filtros.turno || undefined,
        vendedorNombre: filtros.vendedorNombre || undefined,
        orderBy: filtros.orderBy,
        orderDesc: filtros.orderDesc
      };

      const blob = await comisionesVendedorasService.exportarLiquidacion(request);

      // Generar nombre del archivo
      const nombreArchivo = `Liquidacion_Comisiones_${comisionFechas.formatearFechaCorta(filtros.fechaInicio)}_${comisionFechas.formatearFechaCorta(filtros.fechaFin)}.xlsx`;

      // Descargar archivo
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nombreArchivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('✅ Liquidación exportada correctamente');
    } catch (error) {
      console.error('Error al exportar liquidación:', error);
      toast.error('❌ Error al exportar la liquidación');
    } finally {
      setExportando(false);
    }
  };

  const handleMesPredefinido = (tipo: 'actual' | 'anterior' | 'antepasado') => {
    const hoy = new Date();
    let inicio: Date, fin: Date;

    switch (tipo) {
      case 'actual':
        inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
        break;
      case 'anterior':
        inicio = comisionFechas.primerDiaMesAnterior();
        fin = comisionFechas.ultimoDiaMesAnterior();
        break;
      case 'antepasado':
        inicio = new Date(hoy.getFullYear(), hoy.getMonth() - 2, 1);
        fin = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 0);
        break;
    }

    setFiltros(prev => ({ ...prev, fechaInicio: inicio, fechaFin: fin }));
  };

  const limpiarFiltros = () => {
    setFiltros(prev => ({
      ...prev,
      sucursalNombre: '',
      turno: '',
      vendedorNombre: ''
    }));
  };

  return (
    <div className={cn("space-y-6", className)}>

      {/* Formulario */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-6">
        
        {/* Período - Botones rápidos */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-3">
            <Calendar className="w-4 h-4 inline mr-2" />
            Seleccionar período
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <button
              onClick={() => handleMesPredefinido('antepasado')}
              className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/80 text-sm transition-all"
            >
              <div className="font-medium">{comisionFechas.nombreMes(new Date().getMonth() - 1 || 12)}</div>
              <div className="text-xs text-white/40">Hace 2 meses</div>
            </button>
            <button
              onClick={() => handleMesPredefinido('anterior')}
              className="px-4 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 rounded-xl text-green-300 text-sm transition-all"
            >
              <div className="font-semibold">{comisionFechas.nombreMes(new Date().getMonth() || 12)}</div>
              <div className="text-xs">✨ Mes anterior (Recomendado)</div>
            </button>
            <button
              onClick={() => handleMesPredefinido('actual')}
              className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/80 text-sm transition-all"
            >
              <div className="font-medium">{comisionFechas.nombreMes(new Date().getMonth() + 1)}</div>
              <div className="text-xs text-white/40">Mes actual</div>
            </button>
          </div>

          {/* Fechas personalizadas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-2">
                Fecha inicio
              </label>
              <input
                type="date"
                value={comisionFechas.formatearParaApi(filtros.fechaInicio)}
                onChange={(e) => setFiltros(prev => ({ ...prev, fechaInicio: new Date(e.target.value) }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500/40"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-2">
                Fecha fin
              </label>
              <input
                type="date"
                value={comisionFechas.formatearParaApi(filtros.fechaFin)}
                onChange={(e) => setFiltros(prev => ({ ...prev, fechaFin: new Date(e.target.value) }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500/40"
              />
            </div>
          </div>
        </div>

        {/* Divisor */}
        <div className="border-t border-white/10"></div>

        {/* Filtros opcionales */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-white/80">
              Filtros opcionales
            </h3>
            <button
              onClick={limpiarFiltros}
              className="text-xs text-white/60 hover:text-white/80 transition-colors underline"
            >
              Limpiar filtros
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sucursal */}
            <div>
              <label className="block text-xs font-medium text-white/60 mb-2">
                <Building2 className="w-3 h-3 inline mr-1" />
                Filtrar por sucursal
              </label>
              <select
                value={filtros.sucursalNombre}
                onChange={(e) => setFiltros(prev => ({ ...prev, sucursalNombre: e.target.value }))}
                disabled={loadingDatos}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500/40 disabled:opacity-50"
              >
                <option value="">Todas las sucursales</option>
                {datosMaestros?.sucursales.map(suc => (
                  <option key={suc} value={suc}>{suc}</option>
                ))}
              </select>
            </div>

            {/* Turno */}
            <div>
              <label className="block text-xs font-medium text-white/60 mb-2">
                <Clock className="w-3 h-3 inline mr-1" />
                Filtrar por turno
              </label>
              <select
                value={filtros.turno}
                onChange={(e) => setFiltros(prev => ({ ...prev, turno: e.target.value as any }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500/40"
              >
                {TURNOS_COMISIONES.map(turno => (
                  <option key={turno.value} value={turno.value}>{turno.label}</option>
                ))}
              </select>
            </div>

            {/* Vendedora */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-white/60 mb-2">
                <User className="w-3 h-3 inline mr-1" />
                Vendedora específica
              </label>
              <select
                value={filtros.vendedorNombre}
                onChange={(e) => setFiltros(prev => ({ ...prev, vendedorNombre: e.target.value }))}
                disabled={loadingDatos}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500/40 disabled:opacity-50"
              >
                <option value="">Todas las vendedoras</option>
                {datosMaestros?.vendedores.map(vend => (
                  <option key={vend} value={vend}>{vend}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Divisor */}
        <div className="border-t border-white/10"></div>

        {/* Ordenamiento */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-3">
            <ArrowUpDown className="w-4 h-4 inline mr-2" />
            Ordenar resultados por
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => setFiltros(prev => ({ ...prev, orderBy: 'nombre', orderDesc: false }))}
              className={`px-4 py-2 border rounded-xl text-sm transition-all ${
                filtros.orderBy === 'nombre'
                  ? 'bg-green-500/20 border-green-500/40 text-green-300 font-medium'
                  : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
              }`}
            >
              Nombre (A-Z)
            </button>
            <button
              onClick={() => setFiltros(prev => ({ ...prev, orderBy: 'monto', orderDesc: true }))}
              className={`px-4 py-2 border rounded-xl text-sm transition-all ${
                filtros.orderBy === 'monto'
                  ? 'bg-green-500/20 border-green-500/40 text-green-300 font-medium'
                  : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
              }`}
            >
              Mayor monto
            </button>
            <button
              onClick={() => setFiltros(prev => ({ ...prev, orderBy: 'dias', orderDesc: true }))}
              className={`px-4 py-2 border rounded-xl text-sm transition-all ${
                filtros.orderBy === 'dias'
                  ? 'bg-green-500/20 border-green-500/40 text-green-300 font-medium'
                  : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
              }`}
            >
              Más días trabajados
            </button>
          </div>
        </div>

        {/* Botón de exportar */}
        <div className="pt-4">
          <button
            onClick={handleExportar}
            disabled={exportando}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-500/40 rounded-xl text-green-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
          >
            {exportando ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generando archivo Excel...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Exportar liquidación
                <FileSpreadsheet className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};