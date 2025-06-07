import React from "react";
import { Button } from "@/components/ui/button";

interface Props {
  onUpload: (fileVentas: File, fileCabecera: File, fileDetalles: File) => void;
  loading: boolean;
}

export const VentasUploadForm: React.FC<Props> = ({ onUpload, loading }) => {
  const [fileVentas, setFileVentas] = React.useState<File | null>(null);
  const [fileCabecera, setFileCabecera] = React.useState<File | null>(null);
  const [fileDetalles, setFileDetalles] = React.useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fileVentas && fileCabecera && fileDetalles) {
      onUpload(fileVentas, fileCabecera, fileDetalles);
    }
  };

  return (
    <form
      className="bg-white p-6 rounded-2xl shadow-xl max-w-xl mx-auto flex flex-col gap-5"
      onSubmit={handleSubmit}
      autoComplete="off"
    >
      <h2 className="text-xl font-semibold text-[#D94854] mb-2">Subí los archivos para analizar ventas</h2>
      
      <div>
        <label className="block text-base text-[#51590E] mb-1 font-medium">
          Archivo de <span className="font-bold">ventas</span> (.xlsx)
        </label>
        <input
          type="file"
          accept=".xlsx"
          onChange={e => setFileVentas(e.target.files?.[0] || null)}
          disabled={loading}
          className="block w-full text-base file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-base file:bg-[#F9F6F2] file:text-[#51590E] hover:file:bg-[#F3ECE6]"
        />
        {fileVentas && (
          <span className="text-sm text-[#51590E]">Seleccionado: <b>{fileVentas.name}</b></span>
        )}
      </div>

      <div>
        <label className="block text-base text-[#51590E] mb-1 font-medium">
          Archivo de <span className="font-bold">compras (cabecera)</span> (.xlsx)
        </label>
        <input
          type="file"
          accept=".xlsx"
          onChange={e => setFileCabecera(e.target.files?.[0] || null)}
          disabled={loading}
          className="block w-full text-base file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-base file:bg-[#F9F6F2] file:text-[#51590E] hover:file:bg-[#F3ECE6]"
        />
        {fileCabecera && (
          <span className="text-sm text-[#51590E]">Seleccionado: <b>{fileCabecera.name}</b></span>
        )}
      </div>

      <div>
        <label className="block text-base text-[#51590E] mb-1 font-medium">
          Archivo de <span className="font-bold">compras (detalle)</span> (.xlsx)
        </label>
        <input
          type="file"
          accept=".xlsx"
          onChange={e => setFileDetalles(e.target.files?.[0] || null)}
          disabled={loading}
          className="block w-full text-base file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-base file:bg-[#F9F6F2] file:text-[#51590E] hover:file:bg-[#F3ECE6]"
        />
        {fileDetalles && (
          <span className="text-sm text-[#51590E]">Seleccionado: <b>{fileDetalles.name}</b></span>
        )}
      </div>

      <Button
        type="submit"
        className="bg-[#D94854] hover:bg-[#F23D5E] text-white font-bold py-3 px-6 rounded-xl mt-2 shadow"
        disabled={loading || !fileVentas || !fileCabecera || !fileDetalles}
      >
        {loading ? "Procesando..." : "Subir archivos y analizar"}
      </Button>
    </form>
  );
};
