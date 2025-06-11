// ClienteRankingPage.tsx - Versión mejorada con filtros
import { useState } from "react";
import ClienteRankingTable from "@/components/Clientes/ClienteRankingTable";
import ClienteFilters from "@/components/Clientes/ClienteFilters";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Trophy, Users, Upload, Filter, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

export default function ClientesRankingPage() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [filtrosAplicados, setFiltrosAplicados] = useState<any>(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const handleFiltersApplied = (filters: any) => {
    setFiltrosAplicados(filters);
  };

  const limpiarFiltros = () => {
    setFiltrosAplicados(null);
  };

  const contarFiltrosActivos = () => {
    if (!filtrosAplicados) return 0;
    
    let count = 0;
    if (filtrosAplicados.desde || filtrosAplicados.hasta) count++;
    if (filtrosAplicados.canal) count++;
    if (filtrosAplicados.sucursal) count++;
    if (filtrosAplicados.marca) count++;
    if (filtrosAplicados.categoria) count++;
    
    return count;
  };

  const obtenerResumenFiltros = () => {
    if (!filtrosAplicados) return [];
    
    const resumen = [];
    
    if (filtrosAplicados.desde && filtrosAplicados.hasta) {
      resumen.push(`📅 ${filtrosAplicados.desde} a ${filtrosAplicados.hasta}`);
    } else if (filtrosAplicados.desde) {
      resumen.push(`📅 Desde ${filtrosAplicados.desde}`);
    } else if (filtrosAplicados.hasta) {
      resumen.push(`📅 Hasta ${filtrosAplicados.hasta}`);
    }
    
    if (filtrosAplicados.canal) {
      const canales = filtrosAplicados.canal.split(',');
      resumen.push(`🏪 ${canales.length > 1 ? `${canales.length} canales` : canales[0]}`);
    }
    
    if (filtrosAplicados.sucursal) {
      const sucursales = filtrosAplicados.sucursal.split(',');
      resumen.push(`📍 ${sucursales.length > 1 ? `${sucursales.length} sucursales` : sucursales[0]}`);
    }
    
    if (filtrosAplicados.marca) {
      const marcas = filtrosAplicados.marca.split(',');
      resumen.push(`🏷️ ${marcas.length > 1 ? `${marcas.length} marcas` : marcas[0]}`);
    }
    
    if (filtrosAplicados.categoria) {
      const categorias = filtrosAplicados.categoria.split(',');
      resumen.push(`📦 ${categorias.length > 1 ? `${categorias.length} categorías` : categorias[0]}`);
    }
    
    return resumen;
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
      
      <div className="relative z-10 max-w-6xl mx-auto p-6 pt-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#D94854] p-3 rounded-xl">
              <Trophy className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Ranking de Clientes</h1>
              <p className="text-gray-300">
                {filtrosAplicados ? 'Ranking filtrado' : 'Análisis global de rendimiento'}
              </p>
            </div>
          </div>

          {/* Botones de navegación */}
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate("/clientes")} 
              className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Users size={18} /> Ver listado
            </Button>
            {role === "superadmin" && (
              <Button 
                variant="outline" 
                onClick={() => navigate("/clientes/import")} 
                className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Upload size={18} className="text-[#D94854]" /> Importar
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
                {mostrarFiltros ? 'Ocultar filtros' : 'Mostrar filtros avanzados'}
              </span>
              {contarFiltrosActivos() > 0 && (
                <Badge className="bg-[#D94854] text-white">
                  {contarFiltrosActivos()} filtro{contarFiltrosActivos() > 1 ? 's' : ''} activo{contarFiltrosActivos() > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {filtrosAplicados && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={limpiarFiltros}
                  className="text-white hover:bg-white/20"
                >
                  Limpiar filtros
                </Button>
              )}
              <Button 
                variant="outline"
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                {mostrarFiltros ? 'Ocultar' : 'Filtrar'}
              </Button>
            </div>
          </div>

          {/* Resumen de filtros aplicados */}
          {filtrosAplicados && (
            <div className="mt-4 p-4 bg-[#B695BF]/10 backdrop-blur-sm rounded-xl border border-[#B695BF]/20">
              <div className="flex items-start gap-3">
                <BarChart3 className="text-[#B695BF] mt-1" size={16} />
                <div>
                  <p className="text-white text-sm font-medium mb-2">Filtros aplicados al ranking:</p>
                  <div className="flex flex-wrap gap-2">
                    {obtenerResumenFiltros().map((filtro, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="bg-white/20 text-white border-white/30"
                      >
                        {filtro}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sección de filtros colapsable */}
        {mostrarFiltros && (
          <div className="mb-8">
            <ClienteFilters 
              onResult={() => {}} // No necesitamos el resultado aquí
              onFiltersApplied={handleFiltersApplied}
            />
          </div>
        )}

        {/* Tabla de ranking */}
        <ClienteRankingTable 
          initialOrdenarPor="monto" 
          initialTop={10}
          filtros={filtrosAplicados} // Pasamos los filtros al componente
        />
      </div>
    </div>
  );
}