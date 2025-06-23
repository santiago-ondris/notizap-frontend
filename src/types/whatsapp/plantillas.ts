export interface PlantillaWhatsAppDto {
    id: number;
    nombre: string;
    mensaje: string;
    descripcion?: string;
    categoria: string;
    fechaCreacion: string;
    creadoPor: string;
    activa: boolean;
  }
  
  export interface CrearPlantillaWhatsAppDto {
    nombre: string;
    mensaje: string;
    descripcion?: string;
    categoria: string;
  }
  
  export interface ActualizarPlantillaWhatsAppDto {
    nombre: string;
    mensaje: string;
    descripcion?: string;
    categoria: string;
    activa: boolean;
  }
  
  export interface PlantillasPorCategoria {
    [categoria: string]: PlantillaWhatsAppDto[];
  }
  
  // Categorías predefinidas para el frontend
  export const CATEGORIAS_PLANTILLAS = [
    "General",
    "Seguimiento", 
    "Oferta",
    "Consulta",
    "Recordatorio",
    "Agradecimiento"
  ] as const;
  
  export type CategoriaPlantilla = typeof CATEGORIAS_PLANTILLAS[number];