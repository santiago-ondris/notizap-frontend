import { useState, useEffect } from "react";
import ClienteTable from "@/components/Clientes/ClienteTable";
import ClienteFilters from "@/components/Clientes/ClienteFilters";
import { type ClienteResumenDto, type PagedResult } from "@/types/cliente/cliente";
import { useAuth } from "@/contexts/AuthContext"; 
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Upload, Trophy, Filter, RotateCcw } from "lucide-react";
import { useClienteFiltersStore, useHasActiveClienteFilters } from "@/store/useClienteFiltersStore";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<PagedResult<ClienteResumenDto> | null>(null);
  const [activeFilters, setActiveFilters] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const navigate = useNavigate();
  const { role } = useAuth();
  
  const { 
    lastAppliedFilters, 
    clearFilters  } = useClienteFiltersStore();
  
  const hasActiveFiltersHook = useHasActiveClienteFilters();

  useEffect(() => {
    if (lastAppliedFilters) {
      setActiveFilters(lastAppliedFilters);
      setShowFilters(true); 
    }
  }, [lastAppliedFilters]);

  useEffect(() => {
    if (hasActiveFiltersHook && !showFilters) {
      setShowFilters(true);
    }
  }, [hasActiveFiltersHook]);

  const handleFiltersApplied = (filters: any) => {
    setActiveFilters(filters);
    if (filters) {
      setShowFilters(true);
    }
  };

  const handleClearFilters = () => {
    clearFilters(); 
    setActiveFilters(null);
    setClientes(null);
    setShowFilters(false);
  };

  const contarFiltrosActivos = () => {
    if (!activeFilters) return 0;
    
    let count = 0;
    if (activeFilters.desde || activeFilters.hasta) count++;
    if (activeFilters.canal) count++;
    if (activeFilters.sucursal) count++;
    if (activeFilters.marca) count++;
    if (activeFilters.categoria) count++;
    
    return count;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#212026] via-[#1a1d22] to-[#2a1f2b]">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px'
        }}
      />
      
      <div className="relative z-10 max-w-7xl mx-auto p-6 pt-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#D94854] p-3 rounded-xl">
              <Users className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Gestión de Clientes</h1>
              <p className="text-gray-300">
                {activeFilters ? 'Listado filtrado' : 'Listado completo de clientes'}
              </p>
            </div>
          </div>

          {/* Botones de navegación */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/clientes/ranking")}
              className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Trophy size={18} className="text-[#B695BF]" />
              Ver ranking
            </Button>
            {role === "superadmin" && (
              <Button
                variant="outline"
                onClick={() => navigate("/clientes/import")}
                className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Upload size={18} className="text-[#D94854]" />
                Importar
              </Button>
            )}
          </div>
        </div>

        {/* Toggle de filtros */}
        <div className="mb-6">
          <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <div className="flex items-center gap-3">
              <Filter className="text-[#B695BF]" size={20} />
              <span className="text-white font-medium">
                {showFilters ? 'Ocultar filtros' : 'Mostrar filtros avanzados'}
              </span>
              {contarFiltrosActivos() > 0 && (
                <Badge className="bg-[#D94854] text-white">
                  {contarFiltrosActivos()} filtro{contarFiltrosActivos() > 1 ? 's' : ''} activo{contarFiltrosActivos() > 1 ? 's' : ''}
                </Badge>
              )}
              {hasActiveFiltersHook && (
                <Badge variant="secondary" className="bg-[#B695BF]/20 text-[#B695BF] border-[#B695BF]/30">
                  Sesión activa
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {activeFilters && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-white hover:bg-white/20"
                >
                  <RotateCcw size={14} className="mr-1" />
                  Limpiar filtros
                </Button>
              )}
              <Button 
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                {showFilters ? 'Ocultar' : 'Filtrar'}
              </Button>
            </div>
          </div>

          {/* Resumen de filtros aplicados */}
          {activeFilters && (
            <div className="mt-4 p-4 bg-[#B695BF]/10 backdrop-blur-sm rounded-xl border border-[#B695BF]/20">
              <div className="flex items-start gap-3">
                <Filter className="text-[#B695BF] mt-1" size={16} />
                <div>
                  <p className="text-white text-sm font-medium mb-2">Filtros aplicados al listado:</p>
                  <div className="flex flex-wrap gap-2">
                    {/* Fechas */}
                    {(activeFilters.desde || activeFilters.hasta) && (
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        📅 {activeFilters.desde && activeFilters.hasta 
                          ? `${activeFilters.desde} a ${activeFilters.hasta}`
                          : activeFilters.desde 
                            ? `Desde ${activeFilters.desde}`
                            : `Hasta ${activeFilters.hasta}`
                        }
                      </Badge>
                    )}
                    
                    {/* Canales */}
                    {activeFilters.canal && (
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        🏪 {activeFilters.canal.split(',').length > 1 
                          ? `${activeFilters.canal.split(',').length} canales`
                          : activeFilters.canal.split(',')[0]
                        }
                      </Badge>
                    )}
                    
                    {/* Sucursales */}
                    {activeFilters.sucursal && (
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        📍 {activeFilters.sucursal.split(',').length > 1 
                          ? `${activeFilters.sucursal.split(',').length} sucursales`
                          : activeFilters.sucursal.split(',')[0]
                        }
                      </Badge>
                    )}
                    
                    {/* Marcas */}
                    {activeFilters.marca && (
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        🏷️ {activeFilters.marca.split(',').length > 1 
                          ? `${activeFilters.marca.split(',').length} marcas`
                          : activeFilters.marca.split(',')[0]
                        }
                      </Badge>
                    )}
                    
                    {/* Categorías */}
                    {activeFilters.categoria && (
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        📦 {activeFilters.categoria.split(',').length > 1 
                          ? `${activeFilters.categoria.split(',').length} categorías`
                          : activeFilters.categoria.split(',')[0]
                        }
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sección de filtros colapsable */}
        {showFilters && (
          <div className="mb-8">
            <ClienteFilters 
              onResult={setClientes} 
              onFiltersApplied={handleFiltersApplied}
            />
          </div>
        )}

        {/* Tabla de clientes */}
        <ClienteTable 
          clientes={clientes} 
          activeFilters={activeFilters}
        />
      </div>
    </div>
  );
}