import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandInput, CommandItem, CommandList, CommandEmpty } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Check } from "lucide-react";

interface Props {
  productos: string[];
  productoSeleccionado: string;
  setProducto: (prod: string) => void;
  sucursales: string[];
  sucursalSeleccionada: string;
  setSucursal: (suc: string) => void;
}

export const VentasProductSelector: React.FC<Props> = ({
  productos,
  productoSeleccionado,
  setProducto,
  sucursales,
  sucursalSeleccionada,
  setSucursal,
}) => {
  // PRODUCTO
  const [openProd, setOpenProd] = React.useState(false);
  // SUCURSAL
  const [openSuc, setOpenSuc] = React.useState(false);

  return (
    <div className="flex flex-col gap-4">
      {/* --- Selector de producto --- */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Producto</label>
        <Popover open={openProd} onOpenChange={setOpenProd}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openProd}
              className="w-full justify-between"
            >
              {productoSeleccionado || "Elegir producto..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput placeholder="Buscar producto..." />
              <CommandList>
                <CommandEmpty>No hay productos</CommandEmpty>
                {productos.map((prod) => (
                  <CommandItem
                    key={prod}
                    value={prod}
                    onSelect={() => {
                      setProducto(prod);
                      setOpenProd(false);
                    }}
                  >
                    <Check
                      className={
                        "mr-2 h-4 w-4 " +
                        (productoSeleccionado === prod ? "opacity-100" : "opacity-0")
                      }
                    />
                    {prod}
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* --- Selector de sucursal --- */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Sucursal</label>
        <Popover open={openSuc} onOpenChange={setOpenSuc}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openSuc}
              className="w-full justify-between"
            >
              {sucursalSeleccionada || "Elegir sucursal..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0">
            <Command>
              <CommandInput placeholder="Buscar sucursal..." />
              <CommandList>
                <CommandEmpty>No hay sucursales</CommandEmpty>
                {sucursales.map((suc) => (
                  <CommandItem
                    key={suc}
                    value={suc}
                    onSelect={() => {
                      setSucursal(suc);
                      setOpenSuc(false);
                    }}
                  >
                    <Check
                      className={
                        "mr-2 h-4 w-4 " +
                        (sucursalSeleccionada === suc ? "opacity-100" : "opacity-0")
                      }
                    />
                    {suc}
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
