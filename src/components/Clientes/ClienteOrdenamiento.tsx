import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ArrowUpDown, TrendingUp, Hash, Calendar, Clock } from "lucide-react";
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

interface Props {
  ordenarPor: string;
  onOrdenarPorChange: (ordenarPor: string) => void;
  tieneCategoriasSeleccionadas: boolean;
}

const opcionesOrdenamiento = [
  {
    value: "montoTotal",
    label: "Mayor monto gastado total",
    description: "Ordenar por el monto total gastado por el cliente",
    icon: TrendingUp,
    color: "#D94854",
    category: "general"
  },
  {
    value: "cantidadTotal",
    label: "Mayor cantidad de compras total",
    description: "Ordenar por la cantidad total de compras realizadas",
    icon: Hash,
    color: "#D94854",
    category: "general"
  },
  {
    value: "fechareciente",
    label: "Compra más reciente",
    description: "Mostrar primero los que compraron más recientemente",
    icon: Calendar,
    color: "#B695BF",
    category: "fechas"
  },
  {
    value: "fechaantigua",
    label: "Cliente más antiguo",
    description: "Mostrar primero los clientes más antiguos",
    icon: Clock,
    color: "#B695BF",
    category: "fechas"
  },
  {
    value: "montoCategoria",
    label: "Mayor monto en categorías seleccionadas",
    description: "Ordenar por el monto gastado solo en las categorías filtradas",
    icon: TrendingUp,
    color: "#51590E",
    category: "categoria",
    requiresCategoria: true
  },
  {
    value: "cantidadCategoria", 
    label: "Mayor cantidad en categorías seleccionadas",
    description: "Ordenar por la cantidad comprada solo en las categorías filtradas",
    icon: Hash,
    color: "#51590E",
    category: "categoria",
    requiresCategoria: true
  }
];

export default function ClienteOrdenamiento({ 
  ordenarPor, 
  onOrdenarPorChange, 
  tieneCategoriasSeleccionadas 
}: Props) {
  const [open, setOpen] = useState(false);

  const opcionesDisponibles = opcionesOrdenamiento.filter(opcion => 
    !opcion.requiresCategoria || tieneCategoriasSeleccionadas
  );

  const opcionSeleccionada = opcionesOrdenamiento.find(op => op.value === ordenarPor);

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-white/80">
        <ArrowUpDown size={16} className="text-[#51590E]" />
        Ordenar resultados por
      </label>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-11 bg-white/10 border-white/20 backdrop-blur-sm text-black hover:bg-white/15"
          >
            <div className="flex items-center gap-2 text-left">
              {opcionSeleccionada && (
                <>
                  <opcionSeleccionada.icon 
                    size={16} 
                    style={{ color: opcionSeleccionada.color }} 
                  />
                  <span className="text-sm font-medium">
                    {opcionSeleccionada.label}
                  </span>
                </>
              )}
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-full p-0 bg-[#212026] border-white/20 backdrop-blur-xl" 
          align="start"
        >
          <Command className="bg-transparent">
            <CommandInput 
              placeholder="Buscar tipo de ordenamiento..." 
              className="text-white placeholder-white/50"
            />
            <CommandEmpty className="text-white/70 text-center py-4">
              No se encontraron opciones.
            </CommandEmpty>
            
            {/* Grupo General */}
            <CommandGroup 
              heading="Ordenamiento General" 
              className="text-white/60 text-xs font-medium px-2 py-1"
            >
              {opcionesDisponibles
                .filter(op => op.category === "general")
                .map((opcion) => (
                <CommandItem
                  key={opcion.value}
                  onSelect={() => {
                    onOrdenarPorChange(opcion.value);
                    setOpen(false);
                  }}
                  className="cursor-pointer text-white/80 hover:bg-white/10 hover:text-white"
                >
                  <div className="flex items-start gap-3 w-full">
                    <opcion.icon 
                      size={16} 
                      style={{ color: opcion.color }}
                      className="mt-0.5 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-white">
                        {opcion.label}
                      </div>
                      <div className="text-xs text-white/60 mt-0.5">
                        {opcion.description}
                      </div>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>

            {/* Grupo Fechas */}
            <CommandGroup 
              heading="Por Fechas" 
              className="text-white/60 text-xs font-medium px-2 py-1"
            >
              {opcionesDisponibles
                .filter(op => op.category === "fechas")
                .map((opcion) => (
                <CommandItem
                  key={opcion.value}
                  onSelect={() => {
                    onOrdenarPorChange(opcion.value);
                    setOpen(false);
                  }}
                  className="cursor-pointer text-white/80 hover:bg-white/10 hover:text-white"
                >
                  <div className="flex items-start gap-3 w-full">
                    <opcion.icon 
                      size={16} 
                      style={{ color: opcion.color }}
                      className="mt-0.5 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-white">
                        {opcion.label}
                      </div>
                      <div className="text-xs text-white/60 mt-0.5">
                        {opcion.description}
                      </div>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>

            {/* Grupo Categorías Específicas */}
            {tieneCategoriasSeleccionadas && (
              <CommandGroup 
                heading="Por Categorías Seleccionadas" 
                className="text-white/60 text-xs font-medium px-2 py-1"
              >
                {opcionesDisponibles
                  .filter(op => op.category === "categoria")
                  .map((opcion) => (
                  <CommandItem
                    key={opcion.value}
                    onSelect={() => {
                      onOrdenarPorChange(opcion.value);
                      setOpen(false);
                    }}
                    className="cursor-pointer text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    <div className="flex items-start gap-3 w-full">
                      <opcion.icon 
                        size={16} 
                        style={{ color: opcion.color }}
                        className="mt-0.5 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-white">
                          {opcion.label}
                        </div>
                        <div className="text-xs text-white/60 mt-0.5">
                          {opcion.description}
                        </div>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </Command>
        </PopoverContent>
      </Popover>

      {/* Indicador de que hay opciones específicas disponibles */}
      {!tieneCategoriasSeleccionadas && (
        <div className="text-xs text-white/50 mt-1">
          💡 Selecciona categorías o marcas para ver más opciones de ordenamiento
        </div>
      )}
    </div>
  );
}