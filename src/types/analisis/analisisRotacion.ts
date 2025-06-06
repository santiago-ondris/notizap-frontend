export type RotacionItem = {
    producto: string;
    color: string;
    puntoDeVenta: string;
    cantidadComprada: number;
    cantidadVendida: number;
    tasaRotacion: number;
    categoria?: string;
  };
  export type VentasSinComprasItem = {
    producto: string;
    color: string;
    puntoDeVenta: string;
    cantidadVendida: number;
  };
  export type RotacionResult = {
    rotacion: RotacionItem[];
    ventasSinCompras: VentasSinComprasItem[];
  };