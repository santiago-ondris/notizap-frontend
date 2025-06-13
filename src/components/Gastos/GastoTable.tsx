import React from 'react';
import { 
  Edit, 
  Trash2, 
  Star, 
  Repeat, 
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import type { Gasto, GastoFiltros } from '../../types/gastos';
import { CATEGORIA_CONFIG } from '../../types/gastos';
import { GastoService } from '../../services/gastos/gastoService';

interface GastoTableProps {
  gastos: Gasto[];
  totalCount: number;
  totalPages: number;
  filtros: GastoFiltros;
  onFiltrosChange: (filtros: GastoFiltros) => void;
  onEdit?: (gasto: Gasto) => void;
  onDelete?: (id: number) => void;
  isLoading?: boolean;
  userRole?: 'viewer' | 'admin' | 'superadmin';
}

export const GastoTable: React.FC<GastoTableProps> = ({
  gastos,
  totalCount,
  totalPages,
  filtros,
  onFiltrosChange,
  onEdit,
  onDelete,
  isLoading = false,
  userRole = 'viewer'
}) => {

  const canEdit = userRole === 'admin' || userRole === 'superadmin';
  const paginaActual = filtros.pagina || 1;
  const tamañoPagina = filtros.tamañoPagina || 20;

  // Manejar cambio de página
  const handlePageChange = (nuevaPagina: number) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPages) {
      onFiltrosChange({
        ...filtros,
        pagina: nuevaPagina
      });
    }
  };

  // Manejar cambio de ordenamiento
  const handleSort = (campo: 'Fecha' | 'Monto' | 'Nombre' | 'Categoria') => {
    const esElMismoCampo = filtros.ordenarPor === campo;
    const nuevoDescendente = esElMismoCampo ? !filtros.descendente : true;

    onFiltrosChange({
      ...filtros,
      ordenarPor: campo,
      descendente: nuevoDescendente,
      pagina: 1
    });
  };

  // Manejar cambio de tamaño de página
  const handlePageSizeChange = (nuevoTamaño: number) => {
    onFiltrosChange({
      ...filtros,
      tamañoPagina: nuevoTamaño,
      pagina: 1
    });
  };

  // Manejar edición
  const handleEdit = (gasto: Gasto) => {
    if (canEdit && onEdit) {
      onEdit(gasto);
    }
  };

  // Manejar eliminación
  const handleDelete = (gasto: Gasto) => {
    if (canEdit && onDelete && window.confirm(`¿Estás seguro de que quieres eliminar "${gasto.nombre}"?`)) {
      onDelete(gasto.id);
    }
  };

  // Renderizar ícono de ordenamiento
  const renderSortIcon = (campo: string) => {
    if (filtros.ordenarPor !== campo) {
      return <ArrowUpDown className="w-4 h-4 text-white/40" />;
    }
    return filtros.descendente 
      ? <ArrowDown className="w-4 h-4 text-blue-400" />
      : <ArrowUp className="w-4 h-4 text-blue-400" />;
  };

  // Calcular rango de elementos mostrados
  const rangoInicio = (paginaActual - 1) * tamañoPagina + 1;
  const rangoFin = Math.min(paginaActual * tamañoPagina, totalCount);

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-6 bg-white/20 rounded w-48" />
            <div className="h-6 bg-white/20 rounded w-32" />
          </div>
          
          {/* Table skeleton */}
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4">
                <div className="h-4 bg-white/20 rounded" />
                <div className="h-4 bg-white/20 rounded" />
                <div className="h-4 bg-white/20 rounded" />
                <div className="h-4 bg-white/20 rounded" />
                <div className="h-4 bg-white/20 rounded" />
                <div className="h-4 bg-white/20 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (gastos.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-12 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-white mb-2">No se encontraron gastos</h3>
        <p className="text-white/60 mb-6">
          {Object.keys(filtros).some(key => filtros[key as keyof GastoFiltros] && key !== 'pagina' && key !== 'tamañoPagina')
            ? 'Intenta ajustar los filtros de búsqueda'
            : 'Aún no hay gastos registrados en el sistema'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden">
      
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">📊 Lista de Gastos</h3>
            <p className="text-sm text-white/60">
              Mostrando {rangoInicio}-{rangoFin} de {totalCount} resultado{totalCount !== 1 ? 's' : ''}
            </p>
          </div>
          
          {/* Selector de tamaño de página */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/60">Mostrar:</span>
            <select
              value={tamañoPagina}
              onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              {/* Nombre */}
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('Nombre')}
                  className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                  💼 Nombre
                  {renderSortIcon('Nombre')}
                </button>
              </th>

              {/* Categoría */}
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('Categoria')}
                  className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                  🏷️ Categoría
                  {renderSortIcon('Categoria')}
                </button>
              </th>

              {/* Monto */}
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('Monto')}
                  className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                  💰 Monto
                  {renderSortIcon('Monto')}
                </button>
              </th>

              {/* Fecha */}
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('Fecha')}
                  className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                  📅 Fecha
                  {renderSortIcon('Fecha')}
                </button>
              </th>

              {/* Estado */}
              <th className="px-6 py-4 text-left">
                <span className="text-sm font-medium text-white/80">🏷️ Estado</span>
              </th>

              {/* Acciones */}
              {canEdit && (
                <th className="px-6 py-4 text-center">
                  <span className="text-sm font-medium text-white/80">⚙️ Acciones</span>
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-white/10">
            {gastos.map((gasto, index) => {
              const categoriaConfig = CATEGORIA_CONFIG[gasto.categoria as keyof typeof CATEGORIA_CONFIG] || CATEGORIA_CONFIG['Otros'];
              
              return (
                <tr 
                  key={gasto.id} 
                  className={`hover:bg-white/5 transition-colors ${index % 2 === 0 ? 'bg-white/[0.02]' : ''}`}
                >
                  {/* Nombre */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{categoriaConfig.emoji}</span>
                      <div>
                        <div className="font-medium text-white">
                          {gasto.nombre}
                        </div>
                        {gasto.descripcion && (
                          <div className="text-sm text-white/60 truncate max-w-48">
                            {gasto.descripcion}
                          </div>
                        )}
                        {gasto.proveedor && (
                          <div className="text-xs text-white/50">
                            📍 {gasto.proveedor}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Categoría */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: categoriaConfig.color }}
                      />
                      <span className="text-sm text-white/80">
                        {gasto.categoria}
                      </span>
                    </div>
                  </td>

                  {/* Monto */}
                  <td className="px-6 py-4">
                    <div className="font-semibold text-green-400">
                      {GastoService.formatearMonto(gasto.monto)}
                    </div>
                    {gasto.metodoPago && (
                      <div className="text-xs text-white/50">
                        💳 {gasto.metodoPago}
                      </div>
                    )}
                  </td>

                  {/* Fecha */}
                  <td className="px-6 py-4">
                    <div className="text-sm text-white/80">
                      {GastoService.formatearFecha(gasto.fecha)}
                    </div>
                    <div className="text-xs text-white/50">
                      Reg: {GastoService.formatearFecha(gasto.fechaCreacion)}
                    </div>
                  </td>

                  {/* Estado */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {gasto.esImportante && (
                        <div className="flex items-center gap-1 bg-yellow-500/20 border border-yellow-500/30 rounded-md px-2 py-1 w-fit">
                          <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
                          <span className="text-xs text-yellow-400 font-medium">Importante</span>
                        </div>
                      )}
                      
                      {gasto.esRecurrente && (
                        <div className="flex items-center gap-1 bg-blue-500/20 border border-blue-500/30 rounded-md px-2 py-1 w-fit">
                          <Repeat className="w-3 h-3 text-blue-400" />
                          <span className="text-xs text-blue-400 font-medium">
                            {gasto.frecuenciaRecurrencia || 'Recurrente'}
                          </span>
                        </div>
                      )}
                      
                      {!gasto.esImportante && !gasto.esRecurrente && (
                        <span className="text-xs text-white/40">—</span>
                      )}
                    </div>
                  </td>

                  {/* Acciones */}
                  {canEdit && (
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleEdit(gasto)}
                          className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          title="Editar gasto"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(gasto)}
                          className="p-2 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Eliminar gasto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="p-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="text-sm text-white/60">
              Página {paginaActual} de {totalPages}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Primera página */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={paginaActual === 1}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Primera página"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Página anterior */}
              <button
                onClick={() => handlePageChange(paginaActual - 1)}
                disabled={paginaActual === 1}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Números de página */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (paginaActual <= 3) {
                    pageNum = i + 1;
                  } else if (paginaActual >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = paginaActual - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        paginaActual === pageNum
                          ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400 font-medium'
                          : 'text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Página siguiente */}
              <button
                onClick={() => handlePageChange(paginaActual + 1)}
                disabled={paginaActual === totalPages}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Página siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Última página */}
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={paginaActual === totalPages}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Última página"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};