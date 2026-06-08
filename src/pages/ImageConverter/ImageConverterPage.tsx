import React, { useMemo, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Download, FileArchive, ImagePlus, Loader2, RotateCcw, XCircle } from "lucide-react";
import {
  convertImageToWebp,
  downloadConversions,
  formatBytes,
  getSavingsPercent,
  MAX_IMAGE_WIDTH,
  supportsWebpExport,
  WEBP_QUALITY,
  type ImageConversionResult,
  type ImageConversionSuccess,
} from "@/utils/imageConverter";

type ProcessingState = "idle" | "processing" | "completed" | "cancelled";

const ImageConverterPage: React.FC = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const cancelRequestedRef = useRef(false);

  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<ImageConversionResult[]>([]);
  const [state, setState] = useState<ProcessingState>("idle");
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);
  const [processedCount, setProcessedCount] = useState(0);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const webpSupported = useMemo(() => supportsWebpExport(), []);
  const isProcessing = state === "processing";
  const successfulResults = results.filter((result): result is ImageConversionSuccess => result.status === "success");
  const failedResults = results.filter((result) => result.status === "error");
  const totalOriginalSize = results.reduce((total, result) => total + result.originalSize, 0);
  const totalOutputSize = successfulResults.reduce((total, result) => total + result.outputSize, 0);
  const progress = files.length > 0 ? Math.round((processedCount / files.length) * 100) : 0;

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    const imageFiles = selectedFiles.filter((file) => file.type.startsWith("image/"));

    setFiles(imageFiles);
    setResults([]);
    setState("idle");
    setCurrentFileName(null);
    setProcessedCount(0);
    setDownloadError(null);
    cancelRequestedRef.current = false;
  };

  const startConversion = async () => {
    if (!webpSupported || files.length === 0 || isProcessing) return;

    cancelRequestedRef.current = false;
    setResults([]);
    setState("processing");
    setProcessedCount(0);
    setDownloadError(null);

    const nextResults: ImageConversionResult[] = [];

    for (const file of files) {
      if (cancelRequestedRef.current) break;

      setCurrentFileName(file.name);
      const result = await convertImageToWebp(file);
      nextResults.push(result);
      setResults([...nextResults]);
      setProcessedCount(nextResults.length);

      await new Promise((resolve) => window.setTimeout(resolve, 0));
    }

    setCurrentFileName(null);
    setState(cancelRequestedRef.current ? "cancelled" : "completed");
  };

  const cancelConversion = () => {
    cancelRequestedRef.current = true;
  };

  const reset = () => {
    cancelRequestedRef.current = true;
    setFiles([]);
    setResults([]);
    setState("idle");
    setCurrentFileName(null);
    setProcessedCount(0);
    setDownloadError(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const downloadResults = async () => {
    setDownloadError(null);
    setIsDownloading(true);

    try {
      await downloadConversions(successfulResults);
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : "No se pudo preparar la descarga.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A20] px-4 py-6 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#22C55E]/30 bg-[#22C55E]/15">
              <ImagePlus className="h-6 w-6 text-[#4ADE80]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Conversor de Imagenes</h1>
              <p className="text-sm text-white/60">
                Converti imagenes a WebP antes de subirlas a la plataforma.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3 text-center">
            <div>
              <div className="text-xs text-white/45">Ancho maximo</div>
              <div className="text-sm font-semibold text-white">{MAX_IMAGE_WIDTH}px</div>
            </div>
            <div>
              <div className="text-xs text-white/45">Calidad</div>
              <div className="text-sm font-semibold text-white">{Math.round(WEBP_QUALITY * 100)}%</div>
            </div>
            <div>
              <div className="text-xs text-white/45">Proceso</div>
              <div className="text-sm font-semibold text-white">Secuencial</div>
            </div>
          </div>
        </header>

        {!webpSupported && (
          <div className="flex items-start gap-3 rounded-lg border border-[#D94854]/30 bg-[#D94854]/10 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#F87171]" />
            <div>
              <h2 className="font-semibold text-[#F87171]">El navegador no puede exportar WebP</h2>
              <p className="text-sm text-white/70">Proba con una version actual de Chrome, Edge o Firefox.</p>
            </div>
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <label
              className={`flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-all ${
                isProcessing
                  ? "cursor-not-allowed border-white/10 bg-white/[0.03] opacity-70"
                  : "border-white/20 bg-white/[0.05] hover:border-[#4ADE80]/50 hover:bg-[#4ADE80]/10"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                disabled={isProcessing}
                onChange={handleFilesSelected}
                className="sr-only"
              />
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-white/10">
                <ImagePlus className="h-8 w-8 text-white/70" />
              </div>
              <h2 className="text-xl font-semibold text-white">Seleccionar imagenes</h2>
              <p className="mt-2 max-w-md text-sm text-white/60">
                JPG, PNG y otros formatos soportados por el navegador. Las imagenes grandes se escalan proporcionalmente.
              </p>
              {files.length > 0 && (
                <p className="mt-4 rounded-full border border-[#4ADE80]/30 bg-[#4ADE80]/10 px-3 py-1 text-sm font-medium text-[#86EFAC]">
                  {files.length} archivo{files.length === 1 ? "" : "s"} listo{files.length === 1 ? "" : "s"}
                </p>
              )}
            </label>

            {files.length > 0 && (
              <div className="rounded-lg border border-white/10 bg-white/[0.04]">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <h2 className="font-semibold text-white">Cola de procesamiento</h2>
                  <span className="text-sm text-white/50">{formatBytes(files.reduce((total, file) => total + file.size, 0))}</span>
                </div>
                <div className="max-h-72 divide-y divide-white/10 overflow-y-auto">
                  {files.map((file, index) => {
                    const result = results[index];
                    return (
                      <div key={`${file.name}-${file.lastModified}-${index}`} className="flex items-center gap-3 px-4 py-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/10">
                          {result?.status === "success" ? (
                            <CheckCircle2 className="h-5 w-5 text-[#4ADE80]" />
                          ) : result?.status === "error" ? (
                            <XCircle className="h-5 w-5 text-[#F87171]" />
                          ) : currentFileName === file.name ? (
                            <Loader2 className="h-5 w-5 animate-spin text-[#60A5FA]" />
                          ) : (
                            <ImagePlus className="h-5 w-5 text-white/45" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-white">{file.name}</div>
                          <div className="text-xs text-white/45">
                            {formatBytes(file.size)}
                            {result?.status === "success" && ` -> ${formatBytes(result.outputSize)} (${result.width}x${result.height})`}
                            {result?.status === "error" && ` -> ${result.error}`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold text-white">Progreso</h2>
                <span className="text-sm font-semibold text-white">{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-[#4ADE80] transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-3 text-sm text-white/60">
                {processedCount}/{files.length} procesadas
                {currentFileName && <div className="mt-1 truncate text-[#93C5FD]">{currentFileName}</div>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Stat label="Convertidas" value={successfulResults.length.toString()} tone="success" />
              <Stat label="Fallidas" value={failedResults.length.toString()} tone="danger" />
              <Stat label="Original" value={formatBytes(totalOriginalSize)} />
              <Stat label="Final" value={formatBytes(totalOutputSize)} />
            </div>

            {state === "completed" && successfulResults.length > 0 && (
              <div className="rounded-lg border border-[#4ADE80]/30 bg-[#4ADE80]/10 p-4">
                <div className="flex items-center gap-2 text-[#86EFAC]">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-semibold">Conversion completada</span>
                </div>
                <p className="mt-2 text-sm text-white/70">
                  Ahorro estimado: {getSavingsPercent(totalOriginalSize, totalOutputSize)}%.
                </p>
              </div>
            )}

            {state === "cancelled" && (
              <div className="rounded-lg border border-[#F59E0B]/30 bg-[#F59E0B]/10 p-4 text-sm text-[#FCD34D]">
                Procesamiento cancelado. Podes descargar lo convertido hasta ahora.
              </div>
            )}

            {downloadError && (
              <div className="rounded-lg border border-[#D94854]/30 bg-[#D94854]/10 p-4 text-sm text-[#FCA5A5]">
                {downloadError}
              </div>
            )}

            <div className="flex flex-col gap-2">
              {isProcessing ? (
                <button
                  onClick={cancelConversion}
                  className="flex items-center justify-center gap-2 rounded-lg border border-[#D94854]/30 bg-[#D94854]/15 px-4 py-2 font-medium text-[#FCA5A5] transition-colors hover:bg-[#D94854]/25"
                >
                  <XCircle className="h-4 w-4" />
                  Cancelar
                </button>
              ) : (
                <button
                  onClick={startConversion}
                  disabled={!webpSupported || files.length === 0}
                  className="flex items-center justify-center gap-2 rounded-lg border border-[#4ADE80]/30 bg-[#4ADE80]/15 px-4 py-2 font-medium text-[#BBF7D0] transition-colors hover:bg-[#4ADE80]/25 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Convertir a WebP
                </button>
              )}

              <button
                onClick={downloadResults}
                disabled={successfulResults.length === 0 || isDownloading}
                className="flex items-center justify-center gap-2 rounded-lg border border-[#60A5FA]/30 bg-[#60A5FA]/15 px-4 py-2 font-medium text-[#BFDBFE] transition-colors hover:bg-[#60A5FA]/25 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {successfulResults.length > 1 ? <FileArchive className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                {isDownloading ? "Preparando..." : successfulResults.length > 1 ? "Descargar ZIP" : "Descargar WebP"}
              </button>

              <button
                onClick={reset}
                disabled={isProcessing}
                className="flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-4 py-2 font-medium text-white/70 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                Limpiar
              </button>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
};

type StatProps = {
  label: string;
  value: string;
  tone?: "default" | "success" | "danger";
};

const Stat: React.FC<StatProps> = ({ label, value, tone = "default" }) => {
  const valueClass = {
    default: "text-white",
    success: "text-[#86EFAC]",
    danger: "text-[#FCA5A5]",
  }[tone];

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <div className="text-xs text-white/45">{label}</div>
      <div className={`mt-1 text-lg font-semibold ${valueClass}`}>{value}</div>
    </div>
  );
};

export default ImageConverterPage;
