import React, { useRef, useState } from "react";
import api from "@/api/api";
import { toast } from "react-toastify";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// --- Types ---
type RotacionItem = {
  producto: string;
  color: string;
  puntoDeVenta: string;
  cantidadComprada: number;
  cantidadVendida: number;
  tasaRotacion: number;
};
type VentasSinComprasItem = {
  producto: string;
  color: string;
  puntoDeVenta: string;
  cantidadVendida: number;
};
type RotacionResult = {
  rotacion: RotacionItem[];
  ventasSinCompras: VentasSinComprasItem[];
};

// --- Componente Formulario modularizado ---
type AnalisisFormProps = {
  onSuccess: (data: RotacionResult) => void;
  loading: boolean;
  setLoading: (b: boolean) => void;
};

const AnalisisRotacionForm: React.FC<AnalisisFormProps> = ({ onSuccess, loading, setLoading }) => {
  const [cabecera, setCabecera] = useState<File | null>(null);
  const [detalle, setDetalle] = useState<File | null>(null);
  const [ventas, setVentas] = useState<File | null>(null);

  // Referencias para los inputs file
  const cabeceraRef = useRef<HTMLInputElement>(null);
  const detalleRef = useRef<HTMLInputElement>(null);
  const ventasRef = useRef<HTMLInputElement>(null);

  const limpiarArchivos = () => {
    setCabecera(null);
    setDetalle(null);
    setVentas(null);
    // Limpiar el input real por si el usuario sube el mismo archivo dos veces
    if (cabeceraRef.current) cabeceraRef.current.value = "";
    if (detalleRef.current) detalleRef.current.value = "";
    if (ventasRef.current) ventasRef.current.value = "";
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    const file = e.target.files?.[0];
    if (file && !file.name.endsWith(".xlsx")) {
      toast.error("Solo se permiten archivos .xlsx");
      e.target.value = "";
      return;
    }
    setter(file || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cabecera || !detalle || !ventas) {
      toast.error("Debes cargar los 3 archivos requeridos.");
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append("ArchivoComprasCabecera", cabecera);
    formData.append("ArchivoComprasDetalles", detalle);
    formData.append("ArchivoVentas", ventas);

    try {
      const res = await api.post(
        "/api/v1/analisis/rotacion",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      toast.success("¡Análisis realizado correctamente!");
      onSuccess(res.data);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Error al procesar el análisis. Intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  // Si los 3 archivos están cargados, mostrar el resumen y el botón de reset
  const archivosCargados = cabecera && detalle && ventas;

  return (
    <Card className="p-8 max-w-2xl mx-auto mb-8 shadow-2xl border border-primary/20">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold text-center mb-2 text-[#D94854]">Subir archivos para análisis</h2>

        {archivosCargados ? (
          <div className="flex flex-col items-center gap-3">
            <ul className="mb-3">
              <li>Cabecera de compras: <span className="font-semibold">{cabecera.name}</span></li>
              <li>Detalle de compras: <span className="font-semibold">{detalle.name}</span></li>
              <li>Ventas: <span className="font-semibold">{ventas.name}</span></li>
            </ul>
            <Button type="button" variant="outline" onClick={limpiarArchivos}>
              Cargar otro archivo
            </Button>
            <Button type="submit" className="w-56" disabled={loading}>
              {loading ? "Procesando..." : "Lanzar análisis"}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <label className="flex-1">
              <span className="block font-semibold mb-1">Cabecera de compras</span>
              <input
                ref={cabeceraRef}
                type="file"
                accept=".xlsx"
                onChange={(e) => handleFileChange(e, setCabecera)}
                className="hidden"
                required
              />
              <Button
                type="button"
                className="w-full"
                variant="outline"
                onClick={() => cabeceraRef.current?.click()}
              >
                {cabecera ? cabecera.name : "Cargar archivo"}
              </Button>
            </label>
            <label className="flex-1">
              <span className="block font-semibold mb-1">Detalle de compras</span>
              <input
                ref={detalleRef}
                type="file"
                accept=".xlsx"
                onChange={(e) => handleFileChange(e, setDetalle)}
                className="hidden"
                required
              />
              <Button
                type="button"
                className="w-full"
                variant="outline"
                onClick={() => detalleRef.current?.click()}
              >
                {detalle ? detalle.name : "Cargar archivo"}
              </Button>
            </label>
            <label className="flex-1">
              <span className="block font-semibold mb-1">Ventas</span>
              <input
                ref={ventasRef}
                type="file"
                accept=".xlsx"
                onChange={(e) => handleFileChange(e, setVentas)}
                className="hidden"
                required
              />
              <Button
                type="button"
                className="w-full"
                variant="outline"
                onClick={() => ventasRef.current?.click()}
              >
                {ventas ? ventas.name : "Cargar archivo"}
              </Button>
            </label>
          </div>
        )}
      </form>
    </Card>
  );
};

export default AnalisisRotacionForm;
