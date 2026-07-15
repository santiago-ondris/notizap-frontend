export interface ResumenEjecutivoFiltros {
  desde?: string;
  hasta?: string;
}

export interface InsightResumen {
  frase: string;
  codigoProducto?: number | null;
  nombreProducto?: string | null;
  valores: Record<string, number>;
  contexto: Record<string, string>;
}

export interface SeccionResumen {
  codigo: string;
  titulo: string;
  requiereRemitos: boolean;
  datosSuficientes: boolean;
  mensaje?: string | null;
  insights: InsightResumen[];
}

export interface ResumenEjecutivo {
  desde?: string | null;
  hasta?: string | null;
  generadoEn: string;
  tieneDatosRemitos: boolean;
  secciones: SeccionResumen[];
}
