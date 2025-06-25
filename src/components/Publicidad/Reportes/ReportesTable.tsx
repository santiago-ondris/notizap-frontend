import React, { useState, useMemo } from 'react';
import { 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  Target,
  Search,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Download,
  Loader2
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { toast } from 'react-toastify';
import { reportesService } from '@/services/publicidad/reportesService';
import type { 
  AdReportDto,
  ReporteTableRow 
} from '@/types/publicidad/reportes';
import { UNIDADES_COLORES, PLATAFORMAS_COLORES } from '@/types/publicidad/dashboard';

interface ReportesTableProps {
  reportes: AdReportDto[];
  isLoading?: boolean;
  onEdit?: (reporte: AdReportDto) => void;
  onDelete?: (reporte: AdReportDto) => void;
  onView?: (reporte: AdReportDto) => void;
}

type SortField = keyof ReporteTableRow;
type SortDirection = 'asc' | 'desc';

const ReportesTable: React.FC<ReportesTableProps> = ({
  reportes,
  isLoading = false,
  onEdit,
  onDelete,
  onView,
}) => {
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterUnidad, setFilterUnidad] = useState<string>('');
  const [filterPlataforma, setFilterPlataforma] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  // Transformar datos para la tabla
  const tableData = useMemo(() => {
    return reportesService.transformToTableRows(reportes);
  }, [reportes]);

  // Obtener opciones únicas para filtros
  const unidadesUnicas = [...new Set(tableData.map(r => r.unidadNegocio))];
  const plataformasUnicas = [...new Set(tableData.map(r => r.plataforma))];

  // Datos filtrados y ordenados
  const processedData = useMemo(() => {
    let filtered = [...tableData];

    // Filtros
    if (filterUnidad) {
      filtered = filtered.filter(r => r.unidadNegocio === filterUnidad);
    }
    if (filterPlataforma) {
      filtered = filtered.filter(r => r.plataforma === filterPlataforma);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.unidadNegocio.toLowerCase().includes(term) ||
        r.plataforma.toLowerCase().includes(term) ||
        r.periodo.toLowerCase().includes(term)
      );
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [tableData, sortField, sortDirection, filterUnidad, filterPlataforma, searchTerm]);

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSelectRow = (id: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === processedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(processedData.map(r => r.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedRows.size === 0) {
      toast.warning('Selecciona al menos un reporte');
      return;
    }
    
    if (window.confirm(`¿Eliminar ${selectedRows.size} reportes seleccionados?`)) {
      selectedRows.forEach(id => {
        const reporte = reportes.find(r => r.id === id);
        if (reporte && onDelete) {
          onDelete(reporte);
        }
      });
      setSelectedRows(new Set());
    }
  };

  const handleExportSelected = () => {
    if (selectedRows.size === 0) {
      toast.warning('Selecciona al menos un reporte');
      return;
    }
    
    toast.info('Preparando exportación...');
    // Aquí implementarías la lógica de exportación
  };

  // Componente de header de columna
  const SortableHeader: React.FC<{ 
    field: SortField; 
    children: React.ReactNode; 
    className?: string;
  }> = ({ field, children, className = '' }) => (
    <th 
      className={`px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:text-white transition-colors ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortField === field && (
          sortDirection === 'asc' ? 
            <ChevronUp className="w-3 h-3" /> : 
            <ChevronDown className="w-3 h-3" />
        )}
      </div>
    </th>
  );


  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-white/60" />
            <p className="text-sm text-white/60">Cargando reportes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!reportes || reportes.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8">
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No hay reportes disponibles</h3>
          <p className="text-white/60 mb-6">
            Aún no se han creado reportes. Comienza creando tu primer reporte manual.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-[#D94854]" />
            Reportes de Campañas ({processedData.length})
          </h3>
          <p className="text-sm text-white/60">
            Gestiona todos los reportes manuales de publicidad
          </p>
        </div>

        {/* Acciones bulk */}
        {selectedRows.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/70">
              {selectedRows.size} seleccionados
            </span>
            <button
              onClick={handleExportSelected}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Exportar</span>
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm">Eliminar</span>
            </button>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Búsqueda */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Buscar por unidad, plataforma o período..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/50 focus:border-[#D94854]/50 focus:outline-none"
          />
        </div>

        {/* Filtro unidad */}
        <select
          value={filterUnidad}
          onChange={(e) => setFilterUnidad(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:border-[#D94854]/50 focus:outline-none"
        >
          <option value="">Todas las unidades</option>
          {unidadesUnicas.map(unidad => (
            <option key={unidad} value={unidad} className="bg-[#212026] text-white">
              {unidad}
            </option>
          ))}
        </select>

        {/* Filtro plataforma */}
        <select
          value={filterPlataforma}
          onChange={(e) => setFilterPlataforma(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:border-[#D94854]/50 focus:outline-none"
        >
          <option value="">Todas las plataformas</option>
          {plataformasUnicas.map(plataforma => (
            <option key={plataforma} value={plataforma} className="bg-[#212026] text-white">
              {plataforma}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.size === processedData.length && processedData.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border border-white/30 bg-white/10 checked:bg-[#D94854] checked:border-[#D94854]"
                />
              </th>
              <SortableHeader field="id">#</SortableHeader>
              <SortableHeader field="unidadNegocio">Unidad</SortableHeader>
              <SortableHeader field="plataforma">Plataforma</SortableHeader>
              <SortableHeader field="periodo">Período</SortableHeader>
              <SortableHeader field="totalCampañas">Campañas</SortableHeader>
              <SortableHeader field="gastoTotal">Gasto Total</SortableHeader>
              <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {processedData.map((row) => {
              const reporte = reportes.find(r => r.id === row.id);
              if (!reporte) return null;

              return (
                <tr 
                  key={row.id} 
                  className={`hover:bg-white/5 transition-colors ${
                    selectedRows.has(row.id) ? 'bg-[#D94854]/10' : ''
                  }`}
                >
                  {/* Checkbox */}
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(row.id)}
                      onChange={() => handleSelectRow(row.id)}
                      className="w-4 h-4 rounded border border-white/30 bg-white/10 checked:bg-[#D94854] checked:border-[#D94854]"
                    />
                  </td>

                  {/* ID */}
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-white/80">#{row.id}</span>
                  </td>

                  {/* Unidad */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ 
                          backgroundColor: UNIDADES_COLORES[row.unidadNegocio.toLowerCase() as keyof typeof UNIDADES_COLORES] || '#9CA3AF'
                        }}
                      />
                      <span className="text-sm text-white/80 capitalize">{row.unidadNegocio}</span>
                    </div>
                  </td>

                  {/* Plataforma */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ 
                          backgroundColor: PLATAFORMAS_COLORES[row.plataforma as keyof typeof PLATAFORMAS_COLORES] || '#9CA3AF'
                        }}
                      />
                      <span className="text-sm text-white/80">{row.plataforma}</span>
                    </div>
                  </td>

                  {/* Período */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-white/60" />
                      <span className="text-sm text-white/80">{row.periodo}</span>
                    </div>
                  </td>

                  {/* Campañas */}
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-white">{row.totalCampañas}</span>
                  </td>

                  {/* Gasto Total */}
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-[#D94854]">
                      {reportesService.formatCurrency(row.gastoTotal)}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="px-6 py-4">
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4 text-white/60" />
                        </button>
                      </DropdownMenu.Trigger>

                      <DropdownMenu.Portal>
                        <DropdownMenu.Content 
                          className="bg-[#212026] border border-white/20 rounded-lg p-2 shadow-2xl z-50 min-w-[160px]"
                          sideOffset={8}
                        >
                          {onView && (
                            <DropdownMenu.Item 
                              className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded-md cursor-pointer"
                              onClick={() => onView(reporte)}
                            >
                              <Eye className="w-4 h-4" />
                              Ver detalles
                            </DropdownMenu.Item>
                          )}

                          {onEdit && (
                            <DropdownMenu.Item 
                              className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded-md cursor-pointer"
                              onClick={() => onEdit(reporte)}
                            >
                              <Edit className="w-4 h-4" />
                              Editar
                            </DropdownMenu.Item>
                          )}

                          <DropdownMenu.Separator className="my-1 h-px bg-white/10" />

                          {onDelete && (
                            <DropdownMenu.Item 
                              className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 rounded-md cursor-pointer"
                              onClick={() => {
                                if (window.confirm('¿Estás seguro de eliminar este reporte?')) {
                                  onDelete(reporte);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                              Eliminar
                            </DropdownMenu.Item>
                          )}
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportesTable;