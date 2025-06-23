import api from "@/api/api";
import { 
  type PlantillaWhatsAppDto, 
  type CrearPlantillaWhatsAppDto, 
  type ActualizarPlantillaWhatsAppDto,
  type PlantillasPorCategoria 
} from "@/types/whatsapp/plantillas";

// Obtener todas las plantillas activas
export const obtenerPlantillasActivas = async (): Promise<PlantillaWhatsAppDto[]> => {
  const response = await api.get("/api/v1/plantillas-whatsapp");
  return response.data;
};

// Obtener plantillas agrupadas por categoría
export const obtenerPlantillasPorCategoria = async (): Promise<PlantillasPorCategoria> => {
  const response = await api.get("/api/v1/plantillas-whatsapp/categorias");
  return response.data;
};

// Obtener plantilla por ID
export const obtenerPlantillaPorId = async (id: number): Promise<PlantillaWhatsAppDto> => {
  const response = await api.get(`/api/v1/plantillas-whatsapp/${id}`);
  return response.data;
};

// Crear nueva plantilla
export const crearPlantilla = async (plantilla: CrearPlantillaWhatsAppDto): Promise<PlantillaWhatsAppDto> => {
  const response = await api.post("/api/v1/plantillas-whatsapp", plantilla);
  return response.data;
};

// Actualizar plantilla existente
export const actualizarPlantilla = async (id: number, plantilla: ActualizarPlantillaWhatsAppDto): Promise<PlantillaWhatsAppDto> => {
  const response = await api.put(`/api/v1/plantillas-whatsapp/${id}`, plantilla);
  return response.data;
};

// Desactivar plantilla
export const desactivarPlantilla = async (id: number): Promise<void> => {
  await api.delete(`/api/v1/plantillas-whatsapp/${id}`);
};

// Función helper para personalizar mensaje con datos del cliente
export const personalizarMensaje = (plantilla: string, cliente: { nombre: string; telefono?: string }): string => {
  return plantilla
    .replace(/\{nombre\}/g, cliente.nombre)
    .replace(/\{cliente\}/g, cliente.nombre)
    // Puedes agregar más variables aquí según necesites
    .trim();
};

// Función para abrir WhatsApp con mensaje personalizado
export const abrirWhatsAppConMensaje = (telefono: string, mensaje: string): void => {
  // Limpiar el número de teléfono
  const numeroLimpio = telefono.replace(/[^\d+]/g, '');
  
  // Codificar el mensaje para URL
  const mensajeCodificado = encodeURIComponent(mensaje);
  
  // Construir URL de WhatsApp Web con mensaje
  const whatsappUrl = `https://wa.me/${numeroLimpio}?text=${mensajeCodificado}`;
  
  // Abrir en nueva pestaña
  window.open(whatsappUrl, '_blank');
};