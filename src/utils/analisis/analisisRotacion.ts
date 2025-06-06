import _ from "lodash";
import { type RotacionItem } from "@/types/analisis/analisisRotacion";

// Agrupa y suma por producto + color, devuelve array plano
export function agruparRotacionPorProductoColor(rotacion: RotacionItem[], busqueda: string) {
    const itemsFiltrados = rotacion.filter((r) => {
      const prod = r.producto ? r.producto.toLowerCase() : "";
      const color = r.color ? r.color.toLowerCase() : "";
      const search = busqueda.toLowerCase();
      return prod.includes(search) || color.includes(search);
    });
  
    const agrupado = _.groupBy(itemsFiltrados, (item) => `${item.producto}||${item.color}`);
  
    return Object.entries(agrupado)
      .map(([key, arr]) => {
        const [producto, color] = key.split("||");
        const arrTyped = arr as RotacionItem[];
        const cantidadComprada = arrTyped[0]?.cantidadComprada ?? 0;
        const cantidadVendida = arrTyped.reduce((acc, item) => acc + item.cantidadVendida, 0);
        const tasaRotacion = cantidadComprada > 0 ? cantidadVendida / cantidadComprada : 0;
        const categoria = arrTyped[0]?.categoria || "-";
        return { producto, color, cantidadComprada, cantidadVendida, tasaRotacion, categoria };
      })
      .filter((item) => item.cantidadComprada > 0);
  }
  
  // Filtra por sucursal específica
  export function filtrarRotacionPorSucursal(rotacion: RotacionItem[], busqueda: string, sucursal: string) {
    return rotacion
      .filter((r) => {
        const prod = r.producto ? r.producto.toLowerCase() : "";
        const color = r.color ? r.color.toLowerCase() : "";
        const search = busqueda.toLowerCase();
        return (prod.includes(search) || color.includes(search)) &&
          r.puntoDeVenta === sucursal &&
          r.cantidadComprada > 0;
      })
      .map((r) => ({
        producto: r.producto,
        color: r.color,
        puntoDeVenta: r.puntoDeVenta,
        cantidadComprada: r.cantidadComprada,
        cantidadVendida: r.cantidadVendida,
        tasaRotacion: r.tasaRotacion,
        categoria: r.categoria || "-",
      }));
  }
  
  // Ordena el array de rotación
  export function ordenarRotacion(arr: any[], columna: "comprado" | "vendido" | "rotacion", asc: boolean) {
    return arr.slice().sort((a, b) => {
      let valA, valB;
      if (columna === "comprado") {
        valA = a.cantidadComprada;
        valB = b.cantidadComprada;
      } else if (columna === "vendido") {
        valA = a.cantidadVendida;
        valB = b.cantidadVendida;
      } else {
        valA = a.tasaRotacion;
        valB = b.tasaRotacion;
      }
      return asc ? valA - valB : valB - valA;
    });
  }