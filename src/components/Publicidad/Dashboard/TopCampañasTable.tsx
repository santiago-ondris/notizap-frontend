import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  Target, 
  ChevronDown,
  ChevronUp,
  Search,
  Loader2,
  BarChart3
} from 'lucide-react';
import type { TopCampañaDto } from '@/types/publicidad/dashboard';
import { UNIDADES_COLORES, PLATAFORMAS_COLORES } from '@/types/publicidad/dashboard';
import { dashboardService } from '@/services/publicidad/dashboardService';

interface TopCampañasTableProps {
  data: TopCampañaDto[];
  isLoading?: boolean;
  title?: string;
  maxRows?: number;
  showFilters?: boolean;
  onCampañaClick?: (campaña: TopCampañaDto) => void;
}

type SortField = keyof TopCampañaDto;
type SortDirection = 'asc' | 'desc';
type FilterType = 'all' | 'automatico' | 'manual';

const TopCampañasTable: React.FC<TopCampañasTableProps> = ({
  data,
  isLoading = false,
  title = "Lista de Campañas",
  maxRows = 10,
  showFilters = true,
}) => {
  const [sortField, setSortField] = useState<SortField>('performance');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnidades, setSelectedUnidades] = useState<string[]>([]);
  const [selectedPlataformas, setSelectedPlataformas] = useState<string[]>([]);

  // Funciones de ordenamiento
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Datos filtrados y ordenados
  const processedData = useMemo(() => {
    let filtered = [...data];

    // Filtro por tipo de fuente
    if (filterType !== 'all') {
      filtered = filtered.filter(c => c.tipoFuente === filterType);
    }

    // Filtro por texto
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.nombre.toLowerCase().includes(term) ||
        c.campaignId.toLowerCase().includes(term) ||
        c.unidadNegocio.toLowerCase().includes(term) ||
        c.plataforma.toLowerCase().includes(term)
      );
    }

    // Filtro por unidades
    if (selectedUnidades.length > 0) {
      filtered = filtered.filter(c => selectedUnidades.includes(c.unidadNegocio));
    }

    // Filtro por plataformas
    if (selectedPlataformas.length > 0) {
      filtered = filtered.filter(c => selectedPlataformas.includes(c.plataforma));
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

    return filtered.slice(0, maxRows);
  }, [data, sortField, sortDirection, filterType, searchTerm, selectedUnidades, selectedPlataformas, maxRows]);

  // Obtener unidades y plataformas únicas
  const unidadesUnicas = [...new Set(data.map(c => c.unidadNegocio))];
  const plataformasUnicas = [...new Set(data.map(c => c.plataforma))];

  // Componente de header de columna
  const SortableHeader: React.FC<{ field: SortField; children: React.ReactNode; className?: string }> = ({ 
    field, 
    children, 
    className = '' 
  }) => (
    <th 
      className={`px-4 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:text-white transition-colors ${className}`}
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
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-5 h-5 text-white/60" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-white/60" />
            <p className="text-sm text-white/60">Cargando campañas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-5 h-5 text-white/60" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <p className="text-sm text-white/60">No hay campañas disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-5 h-5 text-white/60" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <span className="text-sm text-white/60">({processedData.length} de {data.length})</span>
        </div>

        {/* Estadísticas rápidas */}
        <div className="flex items-center gap-4 text-xs text-white/60">
          <div className="flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            <span>Promedio: {data.length > 0 ? (data.reduce((sum, c) => sum + c.performance, 0) / data.length).toFixed(1) : 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            <span>Total: {dashboardService.formatCurrency(data.reduce((sum, c) => sum + c.montoInvertido, 0))}</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="space-y-4 mb-6">
          {/* Barra de búsqueda y filtros principales */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Buscar por nombre, ID, unidad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/50 focus:border-violet-500/50 focus:outline-none"
              />
            </div>

            {/* Filtro por tipo */}
            <div className="flex bg-white/5 border border-white/10 rounded-lg p-1">
              {(['all', 'automatico', 'manual'] as FilterType[]).map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    filterType === type
                      ? 'bg-white/20 text-white'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  {type === 'all' ? 'Todas' : type === 'automatico' ? 'Auto' : 'Manual'}
                </button>
              ))}
            </div>
          </div>

          {/* Filtros por chips */}
          <div className="flex flex-wrap gap-2">
            {/* Unidades */}
            {unidadesUnicas.map(unidad => (
              <button
                key={unidad}
                onClick={() => setSelectedUnidades(prev => 
                  prev.includes(unidad) 
                    ? prev.filter(u => u !== unidad)
                    : [...prev, unidad]
                )}
                className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  selectedUnidades.includes(unidad)
                    ? 'border border-white/30'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
                style={selectedUnidades.includes(unidad) ? {
                  backgroundColor: `${UNIDADES_COLORES[unidad as keyof typeof UNIDADES_COLORES]}20`,
                  color: UNIDADES_COLORES[unidad as keyof typeof UNIDADES_COLORES],
                  borderColor: `${UNIDADES_COLORES[unidad as keyof typeof UNIDADES_COLORES]}30`
                } : {}}
              >
                <span className="capitalize">{unidad}</span>
              </button>
            ))}

            {/* Plataformas */}
            {plataformasUnicas.map(plataforma => (
              <button
                key={plataforma}
                onClick={() => setSelectedPlataformas(prev => 
                  prev.includes(plataforma) 
                    ? prev.filter(p => p !== plataforma)
                    : [...prev, plataforma]
                )}
                className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  selectedPlataformas.includes(plataforma)
                    ? 'border border-white/30'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
                style={selectedPlataformas.includes(plataforma) ? {
                  backgroundColor: `${PLATAFORMAS_COLORES[plataforma as keyof typeof PLATAFORMAS_COLORES]}20`,
                  color: PLATAFORMAS_COLORES[plataforma as keyof typeof PLATAFORMAS_COLORES],
                  borderColor: `${PLATAFORMAS_COLORES[plataforma as keyof typeof PLATAFORMAS_COLORES]}30`
                } : {}}
              >
                <span>{plataforma}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                #
              </th>
              <SortableHeader field="nombre">Campaña</SortableHeader>
              <SortableHeader field="unidadNegocio">Unidad</SortableHeader>
              <SortableHeader field="plataforma">Plataforma</SortableHeader>
              <SortableHeader field="montoInvertido">Inversión</SortableHeader>
              <SortableHeader field="valorResultado">Resultados</SortableHeader>
              <SortableHeader field="clicks">Métricas</SortableHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {processedData.map((campaña, index) => (
              <tr 
                key={campaña.campaignId} 
                className="hover:bg-white/5 transition-colors"
              >
                {/* Ranking */}
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    {index < 3 ? (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                        index === 1 ? 'bg-gray-400/20 text-gray-300' :
                        'bg-amber-600/20 text-amber-400'
                      }`}>
                        {index + 1}
                      </div>
                    ) : (
                      <span className="text-xs text-white/60 font-medium">{index + 1}</span>
                    )}
                  </div>
                </td>

                {/* Nombre de campaña */}
                <td className="px-4 py-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-white line-clamp-1">
                      {campaña.nombre}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/60 font-mono">
                        {campaña.campaignId}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Unidad */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: UNIDADES_COLORES[campaña.unidadNegocio as keyof typeof UNIDADES_COLORES] }}
                    />
                    <span className="text-sm text-white/80 capitalize">{campaña.unidadNegocio}</span>
                  </div>
                </td>

                {/* Plataforma */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: PLATAFORMAS_COLORES[campaña.plataforma as keyof typeof PLATAFORMAS_COLORES] }}
                    />
                    <span className="text-sm text-white/80">{campaña.plataforma}</span>
                  </div>
                </td>

                {/* Inversión */}
                <td className="px-4 py-4">
                  <span className="text-sm font-medium text-white">
                    {dashboardService.formatCurrency(campaña.montoInvertido)}
                  </span>
                </td>

                {/* Resultados */}
                <td className="px-4 py-4">
                  <div className="max-w-32">
                    {campaña.valorResultado ? (
                      <span className="text-sm text-white/80">
                        {campaña.valorResultado}
                      </span>
                    ) : (
                      <span className="text-xs text-white/50 italic">
                        Sin resultados
                      </span>
                    )}
                  </div>
                </td>

                {/* Métricas */}
                <td className="px-4 py-4">
                  <div className="text-xs space-y-1">
                    {campaña.clicks > 0 && (
                      <div className="flex justify-between">
                        <span className="text-white/60">Clicks:</span>
                        <span className="text-white/80">{dashboardService.formatNumber(campaña.clicks)}</span>
                      </div>
                    )}
                    {campaña.reach > 0 && (
                      <div className="flex justify-between">
                        <span className="text-white/60">Reach:</span>
                        <span className="text-white/80">{dashboardService.formatNumber(campaña.reach)}</span>
                      </div>
                    )}
                    {campaña.ctr > 0 && (
                      <div className="flex justify-between">
                        <span className="text-white/60">CTR:</span>
                        <span className="text-white/80">{campaña.ctr.toFixed(2)}%</span>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer con información */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10 text-xs text-white/50">
        <div>
          💡 Haz clic en las columnas para ordenar
        </div>
        <div>
          Mostrando {processedData.length} de {data.length} campañas
        </div>
      </div>
    </div>
  );
};

export default TopCampañasTable;