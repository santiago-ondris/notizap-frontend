import { useState, useEffect } from "react";
import { filtrarClientes, getFilterOptionsHybrid, exportarClientesExcel } from "@/services/cliente/clienteService";
import { type ClienteResumenDto, type PagedResult } from "@/types/cliente/cliente";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import ClienteOrdenamiento from "./ClienteOrdenamiento";
import { Calendar, MapPin, Tag, Store, Filter, X, ChevronDown, Check, Download, RotateCcw } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useClienteFiltersStore, useHasActiveClienteFilters } from "@/store/useClienteFiltersStore";

interface Props {
  onResult: (resultado: PagedResult<ClienteResumenDto> | null) => void;
  onFiltersApplied: (filters: any) => void;
}

// Tipos para las opciones de filtro
interface FilterOptions {
  canales: string[];
  sucursales: string[];
  marcas: string[];
  categorias: string[];
}

export default function ClienteFilters({ onResult, onFiltersApplied }: Props) {
  // Estado del store de filtros
  const {
    filters,
    setDesde,
    setHasta,
    setCanalesSeleccionados,
    setSucursalesSeleccionadas,
    setMarcasSeleccionadas,
    setCategoriasSeleccionadas,
    setOrdenarPor,
    setModoExclusivoCanal,
    setModoExclusivoSucursal,
    setModoExclusivoMarca,
    setModoExclusivoCategoria,
    applyFilters,
    clearFilters,
    checkHasActiveFilters,
    lastAppliedFilters,
  } = useClienteFiltersStore();

  const hasActiveFilters = useHasActiveClienteFilters();

  // Estados locales para UI
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);

  // Estados para los popover
  const [openCanales, setOpenCanales] = useState(false);
  const [openSucursales, setOpenSucursales] = useState(false);
  const [openMarcas, setOpenMarcas] = useState(false);
  const [openCategorias, setOpenCategorias] = useState(false);

  // Opciones disponibles
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    canales: [],
    sucursales: [],
    marcas: [],
    categorias: []
  });

  // Cargar opciones al montar el componente
  useEffect(() => {
    const cargarOpciones = async () => {
      try {
        setLoadingOptions(true);
        
        const options = await getFilterOptionsHybrid();
        setFilterOptions(options);

        console.log('Opciones cargadas desde endpoints:', options);

      } catch (error) {
        console.error("Error cargando opciones:", error);
        
        // Valores por defecto en caso de error total
        setFilterOptions({
          canales: ['KIBOO', 'WOOCOMMERCE', 'MERCADOLIBRE', 'E-COMMERCE'],
          sucursales: ['Centro', 'Nueva Córdoba', 'General Paz', 'Peatonal', 'Dean Funes'],
          marcas: ['Dean Funes', 'Nueva Córdoba', 'General Paz', 'Peatonal'],
          categorias: ['Calzado', 'Botas', 'Zapatillas', 'Sandalias', 'Accesorios']
        });
        
        toast.error("Error al cargar opciones de filtro. Usando valores por defecto.");
      } finally {
        setLoadingOptions(false);
      }
    };

    cargarOpciones();
  }, []);

  // Aplicar filtros automáticamente si hay filtros guardados
  useEffect(() => {
    if (lastAppliedFilters && !loading) {
      // Solo aplicar automáticamente si hay resultados guardados
      handleAutoApplyFilters();
    }
  }, [lastAppliedFilters, loadingOptions]);

  // Actualizar el estado de filtros activos cuando cambian los filtros
  useEffect(() => {
    checkHasActiveFilters();
  }, [filters, checkHasActiveFilters]);

  const handleAutoApplyFilters = async () => {
    if (!lastAppliedFilters) return;
    
    try {
      setLoading(true);
      const resultadoPaginado = await filtrarClientes(lastAppliedFilters, 1, 12);
      
      onResult(resultadoPaginado);
      onFiltersApplied(lastAppliedFilters);

      // Toast más sutil para auto-aplicación
      console.log(`Filtros restaurados: ${resultadoPaginado.totalRecords || resultadoPaginado.items.length} clientes`);
    } catch (error) {
      console.error("Error al auto-aplicar filtros:", error);
      // En caso de error, limpiar los filtros guardados
      clearFilters();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Verificar si hay filtros
      const hasFilters = filters.desde || filters.hasta || 
        filters.canalesSeleccionados.length > 0 || 
        filters.sucursalesSeleccionadas.length > 0 || 
        filters.marcasSeleccionadas.length > 0 || 
        filters.categoriasSeleccionadas.length > 0;
  
      if (!hasFilters) {
        toast.warning("Selecciona al menos un filtro para buscar");
        setLoading(false);
        return;
      }
  
      // Aplicar filtros usando el store
      const filtrosAplicados = applyFilters();
  
      const resultadoPaginado = await filtrarClientes(filtrosAplicados, 1, 12);
      
      onResult(resultadoPaginado);
      onFiltersApplied(filtrosAplicados);
  
      if (resultadoPaginado.items.length === 0) {
        toast.info("No se encontraron clientes con esos filtros");
      } else {
        toast.success(`Se encontraron ${resultadoPaginado.totalRecords || resultadoPaginado.items.length} clientes`);
      }
    } catch (error: any) {
      console.error("Error al filtrar clientes:", error);
      
      if (error.response?.status === 400) {
        toast.error("Error en los filtros aplicados. Verifica los valores seleccionados.");
      } else if (error.response?.status === 500) {
        toast.error("Error interno del servidor. Contacta al administrador.");
      } else {
        toast.error("Error al filtrar clientes. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!hasActiveFilters || !lastAppliedFilters) {
      toast.warning("Primero aplica algunos filtros para exportar");
      return;
    }

    setExportLoading(true);
    try {
      await exportarClientesExcel(lastAppliedFilters);
      toast.success("Excel exportado exitosamente");
    } catch (error) {
      console.error("Error al exportar:", error);
      toast.error("Error al exportar el archivo Excel");
    } finally {
      setExportLoading(false);
    }
  };

  const handleClearFilters = () => {
    clearFilters();
    onResult(null);
    onFiltersApplied(null);
    toast.info("Filtros limpiados");
  };

  // Componente para un filtro multi-select
  const MultiSelectFilter = ({ 
    title, 
    icon, 
    selectedValues, 
    onSelectionChange, 
    options, 
    placeholder, 
    open, 
    onOpenChange, 
    color,
    modoExclusivo,
    onModoExclusivoChange 
  }: {
    title: string;
    icon: React.ReactNode;
    selectedValues: string[];
    onSelectionChange: (values: string[]) => void;
    options: string[];
    placeholder: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    color: string;
    modoExclusivo: boolean;
    onModoExclusivoChange: (modo: boolean) => void;
  }) => (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        {icon}
        {title}
      </label>
      
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-10 bg-white border-gray-200 hover:bg-gray-50"
          >
            <span className="truncate">
              {selectedValues.length === 0 ? (
                <span className="text-gray-500">{placeholder}</span>
              ) : selectedValues.length === 1 ? (
                selectedValues[0]
              ) : (
                `${selectedValues.length} seleccionados`
              )}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder={`Buscar ${title.toLowerCase()}...`} />
            <CommandEmpty>No se encontraron opciones.</CommandEmpty>
            <CommandGroup 
              className="max-h-64 overflow-auto"
              onWheel={(e) => {
                e.stopPropagation();
                const container = e.currentTarget;
                const scrollTop = container.scrollTop;
                const scrollHeight = container.scrollHeight;
                const height = container.clientHeight;
                const wheelDelta = e.deltaY;
                
                if (
                  (wheelDelta > 0 && scrollTop + height >= scrollHeight) ||
                  (wheelDelta < 0 && scrollTop <= 0)
                ) {
                  e.preventDefault();
                }
              }}
            >
              {/* Modo exclusivo toggle */}
              <div className="px-2 py-1 border-b border-gray-100">
                <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modoExclusivo}
                    onChange={(e) => onModoExclusivoChange(e.target.checked)}
                    className="rounded text-xs"
                  />
                  Modo exclusivo (solo estos valores)
                </label>
              </div>
              
              {options.map((option) => (
                <CommandItem
                  key={option}
                  onSelect={() => {
                    const newSelection = selectedValues.includes(option)
                      ? selectedValues.filter(item => item !== option)
                      : [...selectedValues, option];
                    onSelectionChange(newSelection);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedValues.includes(option) ? "opacity-100" : "opacity-0"
                    )}
                    style={{ color }}
                  />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Badges para valores seleccionados */}
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedValues.map((value) => (
            <Badge
              key={value}
              variant="secondary"
              className="text-xs px-2 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              {value}
              <X
                className="ml-1 h-3 w-3 cursor-pointer hover:text-red-600"
                onClick={() => {
                  const newSelection = selectedValues.filter(item => item !== value);
                  onSelectionChange(newSelection);
                }}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );

  const tieneCategoriasSeleccionadas = filters.categoriasSeleccionadas.length > 0;

  if (loadingOptions) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-5 h-5 border-2 border-[#D94854] border-t-transparent rounded-full animate-spin"></div>
            Cargando opciones de filtro...
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Filter className="text-[#D94854]" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">Filtros de Clientes</h3>
          {hasActiveFilters && (
            <Badge variant="secondary" className="bg-[#D94854]/10 text-[#D94854]">
              Filtros aplicados
            </Badge>
          )}
        </div>
        
        {hasActiveFilters && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="text-gray-600 hover:text-red-600 hover:border-red-300"
          >
            <RotateCcw size={14} className="mr-1" />
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Filtros de fecha */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Calendar size={16} className="text-[#D94854]" />
            Fecha desde
          </label>
          <Input
            type="date"
            value={filters.desde}
            onChange={(e) => setDesde(e.target.value)}
            className="h-10"
          />
        </div>
        
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Calendar size={16} className="text-[#D94854]" />
            Fecha hasta
          </label>
          <Input
            type="date"
            value={filters.hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="h-10"
          />
        </div>
      </div>

      {/* Filtros multi-select */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MultiSelectFilter
          title="Canales"
          icon={<MapPin size={16} className="text-[#B695BF]" />}
          selectedValues={filters.canalesSeleccionados}
          onSelectionChange={setCanalesSeleccionados}
          options={filterOptions.canales}
          placeholder="Seleccionar canales..."
          open={openCanales}
          onOpenChange={setOpenCanales}
          color="#B695BF"
          modoExclusivo={filters.modoExclusivoCanal}
          onModoExclusivoChange={setModoExclusivoCanal}
        />
        
        <MultiSelectFilter
          title="Sucursales"
          icon={<Store size={16} className="text-[#B695BF]" />}
          selectedValues={filters.sucursalesSeleccionadas}
          onSelectionChange={setSucursalesSeleccionadas}
          options={filterOptions.sucursales}
          placeholder="Seleccionar sucursales..."
          open={openSucursales}
          onOpenChange={setOpenSucursales}
          color="#B695BF"
          modoExclusivo={filters.modoExclusivoSucursal}
          onModoExclusivoChange={setModoExclusivoSucursal}
        />
        
        <MultiSelectFilter
          title="Marcas"
          icon={<Store size={16} className="text-[#B695BF]" />}
          selectedValues={filters.marcasSeleccionadas}
          onSelectionChange={setMarcasSeleccionadas}
          options={filterOptions.marcas}
          placeholder="Seleccionar marcas..."
          open={openMarcas}
          onOpenChange={setOpenMarcas}
          color="#B695BF"
          modoExclusivo={filters.modoExclusivoMarca}
          onModoExclusivoChange={setModoExclusivoMarca}
        />
        
        <MultiSelectFilter
          title="Categorías"
          icon={<Tag size={16} className="text-[#B695BF]" />}
          selectedValues={filters.categoriasSeleccionadas}
          onSelectionChange={setCategoriasSeleccionadas}
          options={filterOptions.categorias}
          placeholder="Seleccionar categorías..."
          open={openCategorias}
          onOpenChange={setOpenCategorias}
          color="#B695BF"
          modoExclusivo={filters.modoExclusivoCategoria}
          onModoExclusivoChange={setModoExclusivoCategoria}
        />
      </div>

      {/* Ordenamiento */}
      <div className="pt-4 border-t border-gray-200">
        <ClienteOrdenamiento
          ordenarPor={filters.ordenarPor}
          onOrdenarPorChange={setOrdenarPor}
          tieneCategoriasSeleccionadas={tieneCategoriasSeleccionadas}
        />
      </div>

      {/* Botones */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
        <Button 
          type="submit" 
          disabled={loading} 
          className="bg-gradient-to-r from-[#D94854] to-[#F23D5E] hover:from-[#F23D5E] hover:to-[#D94854] text-white h-11 px-8 font-medium shadow-lg transition-all duration-200"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Buscando...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Filter size={16} />
              Aplicar filtros
            </div>
          )}
        </Button>

        <Button 
          type="button"
          onClick={handleExport}
          disabled={exportLoading || !hasActiveFilters}
          className="bg-[#51590E] hover:bg-[#465005] text-white h-11 px-6 font-medium transition-all duration-200"
        >
          {exportLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Exportando...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Download size={16} />
              Exportar Excel
            </div>
          )}
        </Button>
      </div>
    </form>
  );
}