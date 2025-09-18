import api from "@/api/api";
import { 
  type PlantillaWhatsAppDto, 
  type CrearPlantillaWhatsAppDto, 
  type ActualizarPlantillaWhatsAppDto,
  type PlantillasPorCategoria 
} from "@/types/whatsapp/plantillas";

export const obtenerPlantillasActivas = async (): Promise<PlantillaWhatsAppDto[]> => {
  const response = await api.get("/api/v1/plantillas-whatsapp");
  return response.data;
};

export const obtenerPlantillasPorCategoria = async (): Promise<PlantillasPorCategoria> => {
  const response = await api.get("/api/v1/plantillas-whatsapp/categorias");
  return response.data;
};

export const obtenerPlantillaPorId = async (id: number): Promise<PlantillaWhatsAppDto> => {
  const response = await api.get(`/api/v1/plantillas-whatsapp/${id}`);
  return response.data;
};

export const crearPlantilla = async (plantilla: CrearPlantillaWhatsAppDto): Promise<PlantillaWhatsAppDto> => {
  const response = await api.post("/api/v1/plantillas-whatsapp", plantilla);
  return response.data;
};

export const actualizarPlantilla = async (id: number, plantilla: ActualizarPlantillaWhatsAppDto): Promise<PlantillaWhatsAppDto> => {
  const response = await api.put(`/api/v1/plantillas-whatsapp/${id}`, plantilla);
  return response.data;
};

export const desactivarPlantilla = async (id: number): Promise<void> => {
  await api.delete(`/api/v1/plantillas-whatsapp/${id}`);
};

export const personalizarMensaje = (plantilla: string, cliente: { nombre: string; telefono?: string }): string => {
  return plantilla
    .replace(/\{nombre\}/g, cliente.nombre)
    .replace(/\{cliente\}/g, cliente.nombre)
    .trim();
};

export const abrirWhatsAppConMensaje = (telefono: string, mensaje: string): void => {
  const numeroLimpio = telefono.replace(/[^\d+]/g, '');
  
  const mensajeCodificado = encodeURIComponent(mensaje);
  
  const whatsappUrl = `https://wa.me/${numeroLimpio}?text=${mensajeCodificado}`;
  
  window.open(whatsappUrl, '_blank');
};