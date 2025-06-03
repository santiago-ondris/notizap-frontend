import * as XLSX from "xlsx";
import { type ProductoBase } from "@/types/analisis/analisis";

// Proveedores a excluir
const proveedoresAExcluir = [
  "CRASH",
  "LAKERS CORP. S.A",
  "PAPELERA CUMBRE S.A.",
  "PLAST PLANT",
  "CASA IANODA (SCHWARTMAN)",
  "CHARAVIGLIO",
  "CURTIEMBRE RIO TERCERO SA",
  "VECUER S.A.",
  "ANANDA SRL",
  "SAXS SRL",
  "COMERCIAL BETA S.A.",
  "QUIMICA MAIRLAN SRL",
  "SUCESION DE CASTILLO ELIDA ROSA",
  "DE LA VEGA (ZEUS)",
  "RUIZ HERMANOS SRL",
];

// Palabras clave a excluir en el nombre del producto
const palabrasClaveAExcluir = ["BONIFICACION", "GENERICO", "FABRICACION", "APARADO"];

export const getProductosDeCompras = async (
  archivoDetalles: File
): Promise<ProductoBase[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });

      // Tomamos la primera sheet
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<any>(sheet, { header: 1 });

      // Buscamos la fila de headers
      const headerRow = json.findIndex((row: any[]) =>
        row.some(
          (cell) =>
            typeof cell === "string" &&
            cell.trim().toUpperCase().includes("PRODUCTO")
        )
      );
      if (headerRow === -1) {
        reject("No se encontró columna PRODUCTO en el archivo de compras.");
        return;
      }

      // Indices de columnas
      const productoColIndex = (json[headerRow] as any[]).findIndex(
        (cell) =>
          typeof cell === "string" &&
          cell.trim().toUpperCase().includes("PRODUCTO")
      );
      const proveedorColIndex = (json[headerRow] as any[]).findIndex(
        (cell) =>
          typeof cell === "string" &&
          cell.trim().toUpperCase().includes("PROVEEDOR")
      );
      const cantidadColIndex = (json[headerRow] as any[]).findIndex(
        (cell) =>
          typeof cell === "string" &&
          cell.trim().toUpperCase().includes("CANT.")
      );

      if (proveedorColIndex === -1) {
        reject("No se encontró columna PROVEEDOR en el archivo de compras.");
        return;
      }
      if (cantidadColIndex === -1) {
        reject("No se encontró columna CANTIDAD en el archivo de compras.");
        return;
      }

      // Sets para búsqueda rápida
      const proveedoresExcluidosSet = new Set(
        proveedoresAExcluir.map((p) => p.trim().toUpperCase())
      );
      const palabrasClaveAExcluirArr = palabrasClaveAExcluir.map((p) => p.toUpperCase());

      // Extraemos productos únicos, excluyendo por proveedor, palabras clave y cantidad negativa
      const productosSet = new Set<string>();
      for (let i = headerRow + 1; i < json.length; i++) {
        const row = json[i];
        if (!row || !row[productoColIndex]) continue;

        // Chequeo de proveedor
        const proveedor = String(row[proveedorColIndex]).trim().toUpperCase();
        if (proveedoresExcluidosSet.has(proveedor)) continue;

        // Chequeo de palabras clave en producto
        const nombreProducto = String(row[productoColIndex]).trim();
        const nombreProductoUpper = nombreProducto.toUpperCase();
        if (
          palabrasClaveAExcluirArr.some((palabra) =>
            nombreProductoUpper.includes(palabra)
          )
        ) {
          continue;
        }

        // Chequeo de cantidad negativa
        const cantidad = Number(row[cantidadColIndex]);
        if (isNaN(cantidad) || cantidad < 0) continue;

        if (nombreProducto.length > 0) productosSet.add(nombreProducto);
      }

      const productos: ProductoBase[] = Array.from(productosSet).map((nombre) => ({
        codigo: nombre,
        nombre: nombre,
      }));

      resolve(productos);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(archivoDetalles);
  });
};
