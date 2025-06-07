import React from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useArchivosAnalisis } from "@/store/useArchivosAnalisis";
import api from "@/api/api";

type AnalisisFormProps = {
  onSuccess: (data: any) => void;
  loading: boolean;
  setLoading: (b: boolean) => void;
};

const AnalisisRotacionForm: React.FC<AnalisisFormProps> = ({
  onSuccess,
  loading,
  setLoading,
}) => {
  const { archivos, setArchivo, limpiarArchivos } = useArchivosAnalisis();

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
      const res = await api.post(
        "/api/v1/analisis/rotacion",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
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

  // Los archivos como estado local para preview visual
  const fileCabecera = archivos.cabecera || null;
  const fileDetalle = archivos.detalle || null;
  const fileVentas = archivos.ventas || null;

  return (
    <Card className="bg-white p-6 rounded-2xl shadow-xl max-w-xl mx-auto mb-8 border border-primary/20">
      <form
        onSubmit={handleSubmit}
        autoComplete="off"
        className="flex flex-col gap-5"
      >
        <h2 className="text-xl font-semibold text-[#D94854] mb-2">
          Subí los archivos para análisis de rotación
        </h2>

        {/* Ventas */}
        <div>
          <label className="block text-base text-[#51590E] mb-1 font-medium">
            Archivo de <span className="font-bold">ventas</span> (.xlsx)
          </label>
          <input
            type="file"
            accept=".xlsx"
            onChange={e => handleFileChange(e, "ventas")}
            disabled={loading}
            className="block w-full text-base file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-base file:bg-[#F9F6F2] file:text-[#51590E] hover:file:bg-[#F3ECE6]"
          />
          {fileVentas && (
            <span className="text-sm text-[#51590E]">
              Seleccionado: <b>{fileVentas.name}</b>
            </span>
          )}
        </div>

        {/* Cabecera compras */}
        <div>
          <label className="block text-base text-[#51590E] mb-1 font-medium">
            Archivo de <span className="font-bold">compras (cabecera)</span> (.xlsx)
          </label>
          <input
            type="file"
            accept=".xlsx"
            onChange={e => handleFileChange(e, "cabecera")}
            disabled={loading}
            className="block w-full text-base file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-base file:bg-[#F9F6F2] file:text-[#51590E] hover:file:bg-[#F3ECE6]"
          />
          {fileCabecera && (
            <span className="text-sm text-[#51590E]">
              Seleccionado: <b>{fileCabecera.name}</b>
            </span>
          )}
        </div>

        {/* Detalle compras */}
        <div>
          <label className="block text-base text-[#51590E] mb-1 font-medium">
            Archivo de <span className="font-bold">compras (detalle)</span> (.xlsx)
          </label>
          <input
            type="file"
            accept=".xlsx"
            onChange={e => handleFileChange(e, "detalle")}
            disabled={loading}
            className="block w-full text-base file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-base file:bg-[#F9F6F2] file:text-[#51590E] hover:file:bg-[#F3ECE6]"
          />
          {fileDetalle && (
            <span className="text-sm text-[#51590E]">
              Seleccionado: <b>{fileDetalle.name}</b>
            </span>
          )}
        </div>

        <Button
          type="submit"
          className="bg-[#D94854] hover:bg-[#F23D5E] text-white font-bold py-3 px-6 rounded-xl mt-2 shadow"
          disabled={loading || !fileCabecera || !fileDetalle || !fileVentas}
        >
          {loading ? "Procesando..." : "Subir archivos y analizar"}
        </Button>
      </form>
      {fileCabecera || fileDetalle || fileVentas ? (
        <div className="flex flex-col items-center mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={limpiarArchivos}
            disabled={loading}
          >
            Limpiar selección
          </Button>
        </div>
      ) : null}
    </Card>
  );
};

export default AnalisisRotacionForm;
