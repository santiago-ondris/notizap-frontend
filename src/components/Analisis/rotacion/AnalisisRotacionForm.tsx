import React, { useRef } from "react";
import { toast } from "react-toastify";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useArchivosAnalisis } from "@/store/useArchivosAnalisis";
import api from "@/api/api";

type AnalisisFormProps = {
  onSuccess: (data: any) => void;
  loading: boolean;
  setLoading: (b: boolean) => void;
};

const AnalisisRotacionForm: React.FC<AnalisisFormProps> = ({ onSuccess, loading, setLoading }) => {
  const { archivos, setArchivo, limpiarArchivos } = useArchivosAnalisis();

  const cabeceraRef = useRef<HTMLInputElement>(null);
  const detalleRef = useRef<HTMLInputElement>(null);
  const ventasRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    tipo: "cabecera" | "detalle" | "ventas"
  ) => {
    const file = e.target.files?.[0];
    if (file && !file.name.endsWith(".xlsx")) {
      toast.error("Solo se permiten archivos .xlsx");
      e.target.value = "";
      return;
    }
    if (file) setArchivo(tipo, file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archivos.cabecera || !archivos.detalle || !archivos.ventas) {
      toast.error("Debes cargar los 3 archivos requeridos.");
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append("ArchivoComprasCabecera", archivos.cabecera);
    formData.append("ArchivoComprasDetalles", archivos.detalle);
    formData.append("ArchivoVentas", archivos.ventas);

    try {
      // Usa tu lógica original para enviar formData
      const res = await api.post(
        "/api/v1/analisis/rotacion",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success("¡Análisis realizado correctamente!");
      onSuccess(res.data);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Error al procesar el análisis. Intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const archivosCargados = archivos.cabecera && archivos.detalle && archivos.ventas;

  return (
    <Card className="p-8 max-w-2xl mx-auto mb-8 shadow-2xl border border-primary/20">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold text-center mb-2 text-[#D94854]">
          Subir archivos para análisis
        </h2>
        {archivosCargados ? (
          <div className="flex flex-col items-center gap-3">
            <ul className="mb-3">
              <li>Cabecera de compras: <span className="font-semibold">{archivos.cabecera?.name}</span></li>
              <li>Detalle de compras: <span className="font-semibold">{archivos.detalle?.name}</span></li>
              <li>Ventas: <span className="font-semibold">{archivos.ventas?.name}</span></li>
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
                onChange={(e) => handleFileChange(e, "cabecera")}
                className="hidden"
                required
              />
              <Button
                type="button"
                className="w-full"
                variant="outline"
                onClick={() => cabeceraRef.current?.click()}
              >
                {archivos.cabecera ? archivos.cabecera.name : "Cargar archivo"}
              </Button>
            </label>
            <label className="flex-1">
              <span className="block font-semibold mb-1">Detalle de compras</span>
              <input
                ref={detalleRef}
                type="file"
                accept=".xlsx"
                onChange={(e) => handleFileChange(e, "detalle")}
                className="hidden"
                required
              />
              <Button
                type="button"
                className="w-full"
                variant="outline"
                onClick={() => detalleRef.current?.click()}
              >
                {archivos.detalle ? archivos.detalle.name : "Cargar archivo"}
              </Button>
            </label>
            <label className="flex-1">
              <span className="block font-semibold mb-1">Ventas</span>
              <input
                ref={ventasRef}
                type="file"
                accept=".xlsx"
                onChange={(e) => handleFileChange(e, "ventas")}
                className="hidden"
                required
              />
              <Button
                type="button"
                className="w-full"
                variant="outline"
                onClick={() => ventasRef.current?.click()}
              >
                {archivos.ventas ? archivos.ventas.name : "Cargar archivo"}
              </Button>
            </label>
          </div>
        )}
      </form>
    </Card>
  );
};

export default AnalisisRotacionForm;
