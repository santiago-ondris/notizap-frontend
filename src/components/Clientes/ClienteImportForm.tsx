import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-toastify";
import api from "@/api/api";
import { Loader2, FileUp, CheckCircle2, AlertTriangle } from "lucide-react";

interface ImportResponse {
  nombreArchivo: string;
  fechaImportacion: string;
  cantidadClientesNuevos: number;
  cantidadComprasNuevas: number;
}

export default function ClienteImportForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [validando, setValidando] = useState(false);
  const [importando, setImportando] = useState(false);
  const [errores, setErrores] = useState<string[] | null>(null);
  const [importResult, setImportResult] = useState<ImportResponse | null>(null);

  const handleValidar = async () => {
    if (!archivo) {
      toast.info("Seleccioná un archivo Excel para validar");
      return;
    }
    setValidando(true);
    setErrores(null);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append("archivo", archivo);
      const { data } = await api.post<string[]>("/api/v1/clientes/import/validar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setErrores(data);
      if (!data.length) toast.success("¡El archivo está listo para importar!");
      else toast.warn("Hay errores en el archivo");
    } catch {
      toast.error("Error validando el archivo");
    } finally {
      setValidando(false);
    }
  };

  const handleImportar = async () => {
    if (!archivo) {
      toast.info("Seleccioná un archivo Excel para importar");
      return;
    }
    setImportando(true);
    setErrores(null);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append("archivo", archivo);
      const { data } = await api.post<ImportResponse>("/api/v1/clientes/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImportResult(data);
      toast.success("Importación realizada correctamente");
    } catch {
      toast.error("Error importando el archivo");
    } finally {
      setImportando(false);
    }
  };

  const handleReset = () => {
    setArchivo(null);
    setErrores(null);
    setImportResult(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <Card className="max-w-xl mx-auto rounded-2xl shadow-lg mb-8">
      <CardHeader>
        <CardTitle className="flex gap-2 items-center">
          <FileUp className="text-[#B695BF]" /> Importar clientes desde Excel
        </CardTitle>
        <div className="text-xs mt-2 text-gray-500">
          Solo archivos exportados del ERP. Se validan duplicados y montos automáticamente.<br />
          <span className="text-[#D94854] font-medium">* Solo usuarios superadmin</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3 items-center mb-4">
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={e => setArchivo(e.target.files?.[0] || null)}
            className="block w-full max-w-xs text-sm file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0
            file:text-sm file:font-semibold file:bg-[#B695BF]/10 file:text-[#B695BF]
            hover:file:bg-[#B695BF]/20 transition"
            disabled={validando || importando}
          />
          <Button
            type="button"
            onClick={handleValidar}
            disabled={!archivo || validando || importando}
            variant="outline"
            className="min-w-[120px]"
          >
            {validando ? <Loader2 className="animate-spin mr-2" size={18} /> : <AlertTriangle className="mr-2" size={18} />}
            Validar
          </Button>
          <Button
            type="button"
            onClick={handleImportar}
            disabled={!archivo || !!errores?.length || importando || validando}
            className="min-w-[120px] bg-[#D94854] text-white"
          >
            {importando ? <Loader2 className="animate-spin mr-2" size={18} /> : <CheckCircle2 className="mr-2" size={18} />}
            Importar
          </Button>
          <Button type="button" variant="ghost" onClick={handleReset}>
            Limpiar
          </Button>
        </div>

        {errores && errores.length > 0 && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded mb-4 text-sm text-yellow-900">
            <b>Errores encontrados:</b>
            <ul className="list-disc ml-5 mt-1">
              {errores.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {importResult && (
          <div className="bg-green-100 border-l-4 border-green-600 p-3 rounded mb-4 text-sm text-green-900">
            <b>Archivo importado:</b> {importResult.nombreArchivo} <br />
            <b>Fecha:</b> {new Date(importResult.fechaImportacion).toLocaleString()} <br />
            <b>Clientes nuevos:</b> {importResult.cantidadClientesNuevos} <br />
            <b>Compras nuevas:</b> {importResult.cantidadComprasNuevas}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
