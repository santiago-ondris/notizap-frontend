import React, { useState } from 'react';
import { 
  Edit, 
  Eye, 
  Target,
  Search,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Loader2,
  TrendingUp,
  Users,
  MousePointer,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import type { 
  AdCampaignReadDto,
  CampaignsResponse 
} from '@/types/publicidad/campaigns';
import { 
  isCampaignFromApi, 
  calculateCampaignPerformance 
} from '@/types/publicidad/campaigns';
import { UNIDADES_COLORES, PLATAFORMAS_COLORES } from '@/types/publicidad/dashboard';
import { campaignsService } from '@/services/publicidad/campaignsService';

interface CampaignsTableProps {
  data: CampaignsResponse | null;
  isLoading?: boolean;
  onEdit?: (campaign: AdCampaignReadDto) => void;
  onView?: (campaign: AdCampaignReadDto) => void;
  onPageChange?: (page: number) => void;
}

type SortField = keyof AdCampaignReadDto;
type SortDirection = 'asc' | 'desc';

const CampaignsTable: React.FC<CampaignsTableProps> = ({
  data,
  isLoading = false,
  onEdit,
  onView,
  onPageChange
}) => {
  const [sortField, setSortField] = useState<SortField>('fechaInicio');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');

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
  const processedData = React.useMemo(() => {
    if (!data?.data) return [];
    
    let filtered = [...data.data];

    // Filtro por texto de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.nombre.toLowerCase().includes(term) ||
        c.campaignId.toLowerCase().includes(term) ||
        c.unidadNegocio.toLowerCase().includes(term) ||
        c.plataforma.toLowerCase().includes(term) ||
        c.tipo.toLowerCase().includes(term)
      );
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        // Para fechas en formato ISO string, convertir a Date para comparar
        if (sortField === 'fechaInicio' || sortField === 'fechaFin') {
          const aDate = new Date(aValue);
          const bDate = new Date(bValue);
          comparison = aDate.getTime() - bDate.getTime();
        } else {
          comparison = aValue.localeCompare(bValue);
        }
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [data?.data, sortField, sortDirection, searchTerm]);

  // Componente de header de columna
  const SortableHeader: React.FC<{ 
    field: SortField; 
    children: React.ReactNode; 
    className?: string;
  }> = ({ field, children, className = '' }) => (
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
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-white/60" />
            <p className="text-sm text-white/60">Cargando campañas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.data.length) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No hay campañas disponibles</h3>
          <p className="text-white/60">
            No se encontraron campañas con los filtros aplicados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
      {/* Header con búsqueda */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-[#D94854]" />
            Gestión de Campañas ({data.pagination.totalCount})
          </h3>
          <p className="text-sm text-white/60">
            Página {data.pagination.currentPage} de {data.pagination.totalPages}
          </p>
        </div>

        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Buscar campañas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-80 pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/50 focus:border-[#D94854]/50 focus:outline-none"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <SortableHeader field="campaignId">ID Campaña</SortableHeader>
              <SortableHeader field="nombre">Nombre</SortableHeader>
              <SortableHeader field="unidadNegocio">Unidad</SortableHeader>
              <SortableHeader field="plataforma">Plataforma</SortableHeader>
              <SortableHeader field="tipo">Tipo</SortableHeader>
              <SortableHeader field="montoInvertido">Inversión</SortableHeader>
              <SortableHeader field="valorResultado">Resultados</SortableHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                Métricas
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {processedData.map((campaign) => {
              const isFromApi = isCampaignFromApi(campaign);
              const performance = calculateCampaignPerformance(campaign);

              return (
                <tr 
                  key={campaign.id} 
                  className="hover:bg-white/5 transition-colors"
                >
                  {/* ID Campaña */}
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-white line-clamp-1">
                      {campaign.campaignId}
                    </div>
                  </td>

                  {/* Nombre */}
                  <td className="px-4 py-4">
                    <div className="max-w-48">
                      <div className="text-sm font-medium text-white line-clamp-2">
                        {campaign.nombre}
                      </div>
                      {campaign.resultados && (
                        <div className="text-xs text-white/60 mt-1 line-clamp-1">
                          {campaign.resultados}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Unidad */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ 
                          backgroundColor: UNIDADES_COLORES[campaign.unidadNegocio.toLowerCase() as keyof typeof UNIDADES_COLORES] || '#9CA3AF'
                        }}
                      />
                      <span className="text-sm text-white/80 capitalize">{campaign.unidadNegocio}</span>
                    </div>
                  </td>

                  {/* Plataforma */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ 
                          backgroundColor: PLATAFORMAS_COLORES[campaign.plataforma as keyof typeof PLATAFORMAS_COLORES] || '#9CA3AF'
                        }}
                      />
                      <span className="text-sm text-white/80">{campaign.plataforma}</span>
                    </div>
                  </td>

                  {/* Tipo */}
                  <td className="px-4 py-4">
                    <span className="text-sm text-white/80">{campaign.tipo}</span>
                  </td>

                  {/* Inversión */}
                  <td className="px-4 py-4">
                    <span className="text-sm font-medium text-[#D94854]">
                      {campaignsService.formatCurrency(campaign.montoInvertido)}
                    </span>
                  </td>

                  {/* Resultados */}
                  <td className="px-4 py-4">
                    <div className="max-w-32">
                      {campaign.valorResultado ? (
                        <span className="text-sm text-white/80">
                          {campaign.valorResultado}
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
                    {isFromApi ? (
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-1">
                          <MousePointer className="w-3 h-3 text-white/60" />
                          <span className="text-white/70">{campaignsService.formatNumber(campaign.clicks)} clicks</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-white/60" />
                          <span className="text-white/70">{campaignsService.formatNumber(campaign.reach)} reach</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-green-400" />
                          <span className="text-green-400">{performance.toFixed(1)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-white/60" />
                          <span className="text-white/70">{campaign.followersCount} followers</span>
                        </div>
                        <div className="text-xs text-white/50">Manual</div>
                      </div>
                    )}
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-4">
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
                              onClick={() => onView(campaign)}
                            >
                              <Eye className="w-4 h-4" />
                              Ver detalles
                            </DropdownMenu.Item>
                          )}

                          {onEdit && (
                            <DropdownMenu.Item 
                              className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded-md cursor-pointer"
                              onClick={() => onEdit(campaign)}
                            >
                              <Edit className="w-4 h-4" />
                              Editar campaña
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

      {/* Paginación */}
      {data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
          <div className="text-sm text-white/60">
            Mostrando {((data.pagination.currentPage - 1) * data.pagination.pageSize) + 1} - {Math.min(data.pagination.currentPage * data.pagination.pageSize, data.pagination.totalCount)} de {data.pagination.totalCount} campañas
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(data.pagination.currentPage - 1)}
              disabled={!data.pagination.hasPrevious}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white/80 hover:bg-white/15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            
            <span className="px-3 py-2 text-sm text-white/80">
              {data.pagination.currentPage} de {data.pagination.totalPages}
            </span>
            
            <button
              onClick={() => onPageChange?.(data.pagination.currentPage + 1)}
              disabled={!data.pagination.hasNext}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white/80 hover:bg-white/15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignsTable;