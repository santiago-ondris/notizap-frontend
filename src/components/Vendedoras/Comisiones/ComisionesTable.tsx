import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Calendar, User, Building2, DollarSign, Loader2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { comisionFormato } from '@/utils/vendedoras/comisionHelpers';
import { PAGE_SIZE_COMISIONES } from '@/types/vendedoras/comisionFiltersTypes';
import type { 
  ComisionesResponse,
} from '@/types/vendedoras/comisionTypes';
import type { 
  ComisionVendedoraFilters 
} from '@/types/vendedoras/comisionFiltersTypes';

interface Props {
  data: ComisionesResponse;
  filtros: ComisionVendedoraFilters;
  onFiltrosChange: (filtros: Partial<ComisionVendedoraFilters>) => void;
  loading?: boolean;
  showVendedorColumn?: boolean;
  showSucursalColumn?: boolean;
  showTurnoColumn?: boolean;
  showPagination?: boolean;
  className?: string;
}

export const ComisionesTable: React.FC<Props> = ({
  data,
  filtros,
  onFiltrosChange,
  loading = false,
  showVendedorColumn = true,
  showSucursalColumn = true,
  showTurnoColumn = true,
  showPagination = true,
  className
}) => {
  const handleOrdenarPor = (campo: ComisionVendedoraFilters['orderBy']) => {
    const nuevaDireccion = 
      filtros.orderBy === campo && filtros.orderDesc ? false : true;
    
    onFiltrosChange({
      orderBy: campo,
      orderDesc: nuevaDireccion,
      page: 1
    });
  };

  const handleCambiarPagina = (nuevaPagina: number) => {
    onFiltrosChange({ page: nuevaPagina });
  };

  const handleCambiarTamaño = (nuevoTamaño: number) => {
    onFiltrosChange({ 
      pageSize: nuevoTamaño,
      page: 1 
    });
  };

  const getIconoOrdenamiento = (campo: ComisionVendedoraFilters['orderBy']) => {
    if (filtros.orderBy !== campo) {
      return <div className="w-4 h-4" />; // Espacio en blanco
    }
    
    return filtros.orderDesc ? 
      <ChevronDown className="w-4 h-4" /> : 
      <ChevronUp className="w-4 h-4" />;
  };

  const calcularRangoPagina = () => {
    const inicio = (filtros.page - 1) * filtros.pageSize + 1;
    const fin = Math.min(filtros.page * filtros.pageSize, data.totalRegistros);
    return { inicio, fin };
  };

  const rango = calcularRangoPagina();

  if (loading && data.data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-white/60">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Cargando comisiones...</span>
        </div>
      </div>
    );
  }

  if (!loading && data.data.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-white/40 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white/80 mb-2">Sin comisiones</h3>
        <p className="text-white/60">
          No se encontraron comisiones con los filtros aplicados.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      
      {/* Header con información */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-sm text-white/60">
          <span>
            Mostrando {comisionFormato.formatearNumero(rango.inicio)} - {comisionFormato.formatearNumero(rango.fin)} de {comisionFormato.formatearNumero(data.totalRegistros)} comisiones
          </span>
          {loading && (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Actualizando...</span>
            </div>
          )}
        </div>

        {/* Selector de tamaño de página */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/60">Mostrar:</span>
          <select
            value={filtros.pageSize}
            onChange={(e) => handleCambiarTamaño(Number(e.target.value))}
            className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-blue-400 transition-colors"
            disabled={loading}
          >
            {PAGE_SIZE_COMISIONES.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto border border-white/10 rounded-xl">
        <table className="w-full">
          <thead className="bg-white/10">
            <tr>
              {/* Fecha */}
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleOrdenarPor('fecha')}
                  className="flex items-center gap-2 text-white/80 hover:text-white transition-colors font-medium"
                  disabled={loading}
                >
                  <Calendar className="w-4 h-4" />
                  Fecha
                  {getIconoOrdenamiento('fecha')}
                </button>
              </th>

              {/* Vendedora */}
              {showVendedorColumn && (
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleOrdenarPor('vendedor')}
                    className="flex items-center gap-2 text-white/80 hover:text-white transition-colors font-medium"
                    disabled={loading}
                  >
                    <User className="w-4 h-4" />
                    Vendedora
                    {getIconoOrdenamiento('vendedor')}
                  </button>
                </th>
              )}

              {/* Sucursal */}
              {showSucursalColumn && (
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleOrdenarPor('sucursal')}
                    className="flex items-center gap-2 text-white/80 hover:text-white transition-colors font-medium"
                    disabled={loading}
                  >
                    <Building2 className="w-4 h-4" />
                    Sucursal
                    {getIconoOrdenamiento('sucursal')}
                  </button>
                </th>
              )}

              {/* Turno */}
              {showTurnoColumn && (
                <th className="px-4 py-3 text-left">
                  <span className="flex items-center gap-2 text-white/80 font-medium">
                    <Clock className="w-4 h-4" />
                    Turno
                  </span>
                </th>
              )}

              {/* Monto Facturado */}
              <th className="px-4 py-3 text-right">
                <button
                  onClick={() => handleOrdenarPor('montoFacturado')}
                  className="flex items-center gap-2 text-white/80 hover:text-white transition-colors font-medium ml-auto"
                  disabled={loading}
                >
                  Facturado
                  {getIconoOrdenamiento('montoFacturado')}
                </button>
              </th>

              {/* Comisión */}
              <th className="px-4 py-3 text-right">
                <button
                  onClick={() => handleOrdenarPor('comision')}
                  className="flex items-center gap-2 text-white/80 hover:text-white transition-colors font-medium ml-auto"
                  disabled={loading}
                >
                  <DollarSign className="w-4 h-4" />
                  Comisión
                  {getIconoOrdenamiento('comision')}
                </button>
              </th>

              {/* Vendedoras */}
              <th className="px-4 py-3 text-center">
                <span className="flex items-center gap-2 text-white/80 font-medium justify-center">
                  <User className="w-4 h-4" />
                  Vendedoras
                </span>
              </th>

              {/* Calculado */}
              <th className="px-4 py-3 text-left">
                <span className="flex items-center gap-2 text-white/80 font-medium">
                  Calculado
                </span>
              </th>
            </tr>
          </thead>
          
          <tbody>
            {data.data.map((comision, index) => (
              <tr 
                key={comision.id}
                className={cn(
                  'border-t border-white/10 hover:bg-white/5 transition-colors',
                  index % 2 === 0 ? 'bg-white/2' : 'bg-transparent'
                )}
              >
                {/* Fecha */}
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-white font-medium">
                      {comisionFormato.formatearFecha(comision.fecha)}
                    </span>
                    <span className="text-white/60 text-xs">
                      {new Date(comision.fecha).toLocaleDateString('es-AR', { weekday: 'short' })}
                    </span>
                  </div>
                </td>

                {/* Vendedora */}
                {showVendedorColumn && (
                  <td className="px-4 py-3">
                    <span className="text-white">{comision.vendedorNombre}</span>
                  </td>
                )}

                {/* Sucursal */}
                {showSucursalColumn && (
                  <td className="px-4 py-3">
                    <span className="text-white">{comision.sucursalNombre}</span>
                  </td>
                )}

                {/* Turno */}
                {showTurnoColumn && (
                  <td className="px-4 py-3">
                    <span className="text-white/80">
                      {comisionFormato.formatearTurno(comision.turno)}
                    </span>
                  </td>
                )}

                {/* Monto Facturado */}
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-white font-medium">
                      {comisionFormato.formatearMoneda(comision.montoFacturado)}
                    </span>
                    <span className="text-white/60 text-xs">
                      Sin IVA: {comisionFormato.formatearMoneda(comision.montoSinIva)}
                    </span>
                  </div>
                </td>

                {/* Comisión */}
                <td className="px-4 py-3 text-right">
                  <span className="text-green-300 font-bold">
                    {comisionFormato.formatearMoneda(comision.montoComision)}
                  </span>
                </td>

                {/* Total Vendedoras */}
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-500/20 border border-blue-500/40 rounded-full text-blue-300 text-sm font-medium">
                    {comision.totalVendedoras}
                  </span>
                </td>

                {/* Calculado */}
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-white/80 text-sm">
                      {comisionFormato.formatearFechaHora(comision.fechaCalculado)}
                    </span>
                    <span className="text-white/60 text-xs">
                      por {comision.calculadoPorNombre}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {showPagination && data.totalPaginas > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Info de páginas */}
          <div className="text-sm text-white/60">
            Página {filtros.page} de {data.totalPaginas}
          </div>

          {/* Controles de paginación */}
          <div className="flex items-center gap-2">
            
            {/* Primera página */}
            <button
              onClick={() => handleCambiarPagina(1)}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={filtros.page === 1 || loading}
            >
              Primera
            </button>

            {/* Página anterior */}
            <button
              onClick={() => handleCambiarPagina(filtros.page - 1)}
              className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={filtros.page === 1 || loading}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Páginas numeradas (mostrar hasta 5) */}
            {(() => {
              const totalPaginas = data.totalPaginas;
              const paginaActual = filtros.page;
              const maxPaginas = 5;
              
              let inicio = Math.max(1, paginaActual - Math.floor(maxPaginas / 2));
              let fin = Math.min(totalPaginas, inicio + maxPaginas - 1);
              
              if (fin - inicio + 1 < maxPaginas) {
                inicio = Math.max(1, fin - maxPaginas + 1);
              }

              const paginas = [];
              for (let i = inicio; i <= fin; i++) {
                paginas.push(
                  <button
                    key={i}
                    onClick={() => handleCambiarPagina(i)}
                    className={cn(
                      'px-3 py-2 border rounded-lg text-sm transition-colors',
                      i === paginaActual
                        ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                        : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                    )}
                    disabled={loading}
                  >
                    {i}
                  </button>
                );
              }
              
              return paginas;
            })()}

            {/* Página siguiente */}
            <button
              onClick={() => handleCambiarPagina(filtros.page + 1)}
              className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={filtros.page === data.totalPaginas || loading}
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Última página */}
            <button
              onClick={() => handleCambiarPagina(data.totalPaginas)}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={filtros.page === data.totalPaginas || loading}
            >
              Última
            </button>
          </div>
        </div>
      )}
    </div>
  );
};