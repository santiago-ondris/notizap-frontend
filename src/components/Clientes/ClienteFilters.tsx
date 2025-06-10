import { useState, useEffect } from "react";
import { filtrarClientes, getFilterOptionsHybrid } from "@/services/cliente/clienteService";
import { type ClienteResumenDto, type PagedResult } from "@/types/cliente/cliente";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { Calendar, MapPin, Tag, Store, Filter, X, ChevronDown, Check } from "lucide-react";
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

interface Props {
  onResult: (resultado: PagedResult<ClienteResumenDto> | null) => void;
  onFiltersApplied: (filters: any) => void; // Para comunicar los filtros aplicados
}

// Tipos para las opciones de filtro
interface FilterOptions {
  canales: string[];
  sucursales: string[];
  marcas: string[];
  categorias: string[];
}

export default function ClienteFilters({ onResult, onFiltersApplied }: Props) {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [canalesSeleccionados, setCanalesSeleccionados] = useState<string[]>([]);
  const [sucursalesSeleccionadas, setSucursalesSeleccionadas] = useState<string[]>([]);
  const [marcasSeleccionadas, setMarcasSeleccionadas] = useState<string[]>([]);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);

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
        
        // Usar la función híbrida que intenta los endpoints específicos primero
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Verificar que al menos un filtro esté seleccionado
      const hasFilters = desde || hasta || 
        canalesSeleccionados.length > 0 || 
        sucursalesSeleccionadas.length > 0 || 
        marcasSeleccionadas.length > 0 || 
        categoriasSeleccionadas.length > 0;

      if (!hasFilters) {
        toast.warning("Selecciona al menos un filtro para buscar");
        setLoading(false);
        return;
      }

      const filtrosAplicados = {
        desde: desde || undefined,
        hasta: hasta || undefined,
        canal: canalesSeleccionados.length > 0 ? canalesSeleccionados.join(',') : undefined,
        sucursal: sucursalesSeleccionadas.length > 0 ? sucursalesSeleccionadas.join(',') : undefined,
        marca: marcasSeleccionadas.length > 0 ? marcasSeleccionadas.join(',') : undefined,
        categoria: categoriasSeleccionadas.length > 0 ? categoriasSeleccionadas.join(',') : undefined,
      };

      // Usar la nueva función con paginación
      const resultadoPaginado = await filtrarClientes(filtrosAplicados, 1, 12);
      
      onResult(resultadoPaginado);
      onFiltersApplied(filtrosAplicados); // Comunicar los filtros aplicados

      if (resultadoPaginado.items.length === 0) {
        toast.info("No se encontraron clientes con esos filtros");
      } else {
        toast.success(`Se encontraron ${resultadoPaginado.totalRecords || resultadoPaginado.items.length} clientes`);
      }
    } catch (error: any) {
      console.error("Error al filtrar clientes:", error);
      
      // Mostrar mensaje de error más específico
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

  const handleReset = () => {
    setDesde("");
    setHasta("");
    setCanalesSeleccionados([]);
    setSucursalesSeleccionadas([]);
    setMarcasSeleccionadas([]);
    setCategoriasSeleccionadas([]);
    onResult(null);
    onFiltersApplied(null); // Limpiar filtros aplicados
    toast.info("Filtros limpiados");
  };

  const hasActiveFilters = desde || hasta || 
    canalesSeleccionados.length > 0 || 
    sucursalesSeleccionadas.length > 0 || 
    marcasSeleccionadas.length > 0 || 
    categoriasSeleccionadas.length > 0;

  // Componente reutilizable para multi-select
  const MultiSelectFilter = ({ 
    title, 
    icon, 
    selectedValues, 
    onSelectionChange, 
    options, 
    placeholder,
    open,
    onOpenChange,
    color = "#B695BF"
  }: {
    title: string;
    icon: React.ReactNode;
    selectedValues: string[];
    onSelectionChange: (values: string[]) => void;
    options: string[];
    placeholder: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    color?: string;
  }) => {
    const toggleSelection = (value: string) => {
      if (selectedValues.includes(value)) {
        onSelectionChange(selectedValues.filter(v => v !== value));
      } else {
        onSelectionChange([...selectedValues, value]);
      }
    };

    const removeSelection = (value: string) => {
      onSelectionChange(selectedValues.filter(v => v !== value));
    };

    return (
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
              className={cn(
                "w-full justify-between h-11 border-gray-200",
                `focus:border-[${color}] focus:ring-[${color}]/20`
              )}
            >
              {selectedValues.length === 0 ? (
                <span className="text-gray-500">{placeholder}</span>
              ) : (
                <span className="text-sm">
                  {selectedValues.length} seleccionado{selectedValues.length > 1 ? 's' : ''}
                </span>
              )}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder={`Buscar ${title.toLowerCase()}...`} />
              <CommandEmpty>No se encontraron opciones.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {options.map((option) => (
                  <CommandItem
                    key={option}
                    onSelect={() => toggleSelection(option)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedValues.includes(option) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        
        {/* Badges de seleccionados */}
        {selectedValues.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {selectedValues.map((value) => (
              <Badge 
                key={value} 
                variant="secondary" 
                className="text-xs"
                style={{ backgroundColor: `${color}15`, color: color }}
              >
                {value}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    removeSelection(value);
                  }}
                  className="ml-1 hover:bg-gray-200 rounded-full w-4 h-4 flex items-center justify-center"
                >
                  <X size={10} />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loadingOptions) {
    return (
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-6 mb-8 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#B695BF] p-2 rounded-lg">
            <Filter className="text-white" size={20} />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Cargando filtros...</h2>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-11 bg-gray-200 rounded"></div>
            <div className="h-11 bg-gray-200 rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-11 bg-gray-200 rounded"></div>
            <div className="h-11 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-6 mb-8 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#B695BF] p-2 rounded-lg">
          <Filter className="text-white" size={20} />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">Filtros de búsqueda</h2>
        {hasActiveFilters && (
          <span className="bg-[#D94854] text-white px-2 py-1 rounded-full text-xs font-medium">
            Filtros activos
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Calendar size={16} className="text-[#B695BF]" />
              Fecha desde
            </label>
            <Input 
              type="date" 
              value={desde} 
              onChange={e => setDesde(e.target.value)}
              className="h-11 border-gray-200 focus:border-[#B695BF] focus:ring-[#B695BF]/20"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Calendar size={16} className="text-[#B695BF]" />
              Fecha hasta
            </label>
            <Input 
              type="date" 
              value={hasta} 
              onChange={e => setHasta(e.target.value)}
              className="h-11 border-gray-200 focus:border-[#B695BF] focus:ring-[#B695BF]/20"
            />
          </div>
        </div>

        {/* Multi-selects */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MultiSelectFilter
            title="Canales de venta"
            icon={<Tag size={16} className="text-[#D94854]" />}
            selectedValues={canalesSeleccionados}
            onSelectionChange={setCanalesSeleccionados}
            options={filterOptions.canales}
            placeholder="Seleccionar canales..."
            open={openCanales}
            onOpenChange={setOpenCanales}
            color="#D94854"
          />
          
          <MultiSelectFilter
            title="Sucursales"
            icon={<MapPin size={16} className="text-[#D94854]" />}
            selectedValues={sucursalesSeleccionadas}
            onSelectionChange={setSucursalesSeleccionadas}
            options={filterOptions.sucursales}
            placeholder="Seleccionar sucursales..."
            open={openSucursales}
            onOpenChange={setOpenSucursales}
            color="#D94854"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MultiSelectFilter
            title="Marcas"
            icon={<Store size={16} className="text-[#B695BF]" />}
            selectedValues={marcasSeleccionadas}
            onSelectionChange={setMarcasSeleccionadas}
            options={filterOptions.marcas}
            placeholder="Seleccionar marcas..."
            open={openMarcas}
            onOpenChange={setOpenMarcas}
            color="#B695BF"
          />
          
          <MultiSelectFilter
            title="Categorías"
            icon={<Tag size={16} className="text-[#B695BF]" />}
            selectedValues={categoriasSeleccionadas}
            onSelectionChange={setCategoriasSeleccionadas}
            options={filterOptions.categorias}
            placeholder="Seleccionar categorías..."
            open={openCategorias}
            onOpenChange={setOpenCategorias}
            color="#B695BF"
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
            variant="outline" 
            onClick={handleReset}
            className="h-11 px-6 border-gray-300 hover:bg-gray-50 transition-colors duration-200"
            disabled={!hasActiveFilters}
          >
            <div className="flex items-center gap-2">
              <X size={16} />
              Limpiar filtros
            </div>
          </Button>
        </div>
      </form>
    </div>
  );
}