import { zipSync } from "fflate";

export const MAX_IMAGE_WIDTH = 1920;
export const WEBP_QUALITY = 0.92;

export type ImageConversionSuccess = {
  status: "success";
  originalName: string;
  outputName: string;
  originalSize: number;
  outputSize: number;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  blob: Blob;
};

export type ImageConversionFailure = {
  status: "error";
  originalName: string;
  originalSize: number;
  error: string;
};

export type ImageConversionResult = ImageConversionSuccess | ImageConversionFailure;

const canvas = document.createElement("canvas");

export const supportsWebpExport = (): boolean => {
  try {
    return canvas.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    return false;
  }
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** unitIndex;

  return `${value >= 10 || unitIndex === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`;
};

export const getSavingsPercent = (originalSize: number, outputSize: number): number => {
  if (originalSize <= 0) return 0;
  return Math.round(((originalSize - outputSize) / originalSize) * 100);
};

export const convertImageToWebp = async (file: File): Promise<ImageConversionResult> => {
  if (!file.type.startsWith("image/")) {
    return {
      status: "error",
      originalName: file.name,
      originalSize: file.size,
      error: "El archivo no es una imagen.",
    };
  }

  let bitmap: ImageBitmap | null = null;

  try {
    bitmap = await createImageBitmap(file);
    const scale = bitmap.width > MAX_IMAGE_WIDTH ? MAX_IMAGE_WIDTH / bitmap.width : 1;
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", {
      alpha: true,
      willReadFrequently: false,
    });

    if (!context) {
      throw new Error("No se pudo inicializar Canvas.");
    }

    context.clearRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (!result) {
            reject(new Error("El navegador no pudo generar el archivo WebP."));
            return;
          }

          resolve(result);
        },
        "image/webp",
        WEBP_QUALITY,
      );
    });

    return {
      status: "success",
      originalName: file.name,
      outputName: getWebpFileName(file.name),
      originalSize: file.size,
      outputSize: blob.size,
      width,
      height,
      originalWidth: bitmap.width,
      originalHeight: bitmap.height,
      blob,
    };
  } catch (error) {
    return {
      status: "error",
      originalName: file.name,
      originalSize: file.size,
      error: error instanceof Error ? error.message : "No se pudo convertir la imagen.",
    };
  } finally {
    bitmap?.close();
    canvas.width = 0;
    canvas.height = 0;
  }
};

export const downloadBlob = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const downloadConversions = async (successfulResults: ImageConversionSuccess[]): Promise<void> => {
  if (successfulResults.length === 0) return;

  if (successfulResults.length === 1) {
    const [result] = successfulResults;
    downloadBlob(result.blob, result.outputName);
    return;
  }

  const files: Record<string, Uint8Array> = {};

  for (const [index, result] of successfulResults.entries()) {
    const uniqueName = getUniqueZipName(result.outputName, index, files);
    files[uniqueName] = new Uint8Array(await result.blob.arrayBuffer());
  }

  const zipData = zipSync(files, { level: 6 });
  const zipBlob = new Blob([zipData], { type: "application/zip" });
  downloadBlob(zipBlob, `imagenes-webp-${new Date().toISOString().slice(0, 10)}.zip`);
};

const getWebpFileName = (fileName: string): string => {
  const cleanName = fileName.replace(/\.[^.]+$/, "").trim() || "imagen";
  return `${sanitizeFileName(cleanName)}.webp`;
};

const sanitizeFileName = (fileName: string): string =>
  fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

const getUniqueZipName = (
  fileName: string,
  index: number,
  existingFiles: Record<string, Uint8Array>,
): string => {
  if (!existingFiles[fileName]) return fileName;

  const baseName = fileName.replace(/\.webp$/, "");
  return `${baseName}-${index + 1}.webp`;
};
