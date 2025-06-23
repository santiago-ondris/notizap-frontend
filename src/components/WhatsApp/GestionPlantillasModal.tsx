import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Save, FileText, X } from "lucide-react";
import { Button } from "../ui/button";
import {
  obtenerPlantillasActivas,
  crearPlantilla,
  actualizarPlantilla,
  desactivarPlantilla
} from "@/services/cliente/plantillaService";
import {
  type PlantillaWhatsAppDto,
  type CrearPlantillaWhatsAppDto,
  type ActualizarPlantillaWhatsAppDto,
  CATEGORIAS_PLANTILLAS
} from "@/types/whatsapp/plantillas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onPlantillasUpdated: () => void;
}

interface FormularioPlantilla {
  nombre: string;
  mensaje: string;
  descripcion: string;
  categoria: string;
}

export default function GestionPlantillasModal({
  isOpen,
  onClose,
  onPlantillasUpdated
}: Props) {
  const [plantillas, setPlantillas] = useState<PlantillaWhatsAppDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState<number | null>(null);
  const [creando, setCreando] = useState(false);
  const [formulario, setFormulario] = useState<FormularioPlantilla>({
    nombre: "",
    mensaje: "",
    descripcion: "",
    categoria: CATEGORIAS_PLANTILLAS[0]
  });

  // Cargar plantillas cuando el modal se abre
  useEffect(() => {
    if (isOpen) {
      cargarPlantillas();
    }
  }, [isOpen]);

  const cargarPlantillas = async () => {
    try {
      setLoading(true);
      const plantillasData = await obtenerPlantillasActivas();
      setPlantillas(plantillasData);
    } catch (error) {
      console.error("Error al cargar plantillas:", error);
    } finally {
      setLoading(false);
    }
  };

  const iniciarCreacion = () => {
    setCreando(true);
    setEditando(null);
    setFormulario({
      nombre: "",
      mensaje: "",
      descripcion: "",
      categoria: CATEGORIAS_PLANTILLAS[0]
    });
  };

  const iniciarEdicion = (p: PlantillaWhatsAppDto) => {
    setEditando(p.id);
    setCreando(false);
    setFormulario({
      nombre: p.nombre,
      mensaje: p.mensaje,
      descripcion: p.descripcion || "",
      categoria: p.categoria
    });
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setCreando(false);
    setFormulario({
      nombre: "",
      mensaje: "",
      descripcion: "",
      categoria: CATEGORIAS_PLANTILLAS[0]
    });
  };

  const guardarPlantilla = async () => {
    try {
      setLoading(true);
      if (creando) {
        const dto: CrearPlantillaWhatsAppDto = { ...formulario };
        await crearPlantilla(dto);
      } else if (editando !== null) {
        const dto: ActualizarPlantillaWhatsAppDto = {
          ...formulario,
          activa: true
        };
        await actualizarPlantilla(editando, dto);
      }
      cancelarEdicion();
      await cargarPlantillas(); // ✅ Solo recargar después de guardar exitosamente
      onPlantillasUpdated();
    } catch (error) {
      console.error("Error al guardar plantilla:", error);
    } finally {
      setLoading(false);
    }
  };

  const eliminarPlantilla = async (id: number, nombre: string) => {
    if (!confirm(`¿Seguro que quieres desactivar "${nombre}"?`)) return;
    try {
      setLoading(true);
      await desactivarPlantilla(id);
      await cargarPlantillas(); // ✅ Solo recargar después de eliminar exitosamente
      onPlantillasUpdated();
    } catch (error) {
      console.error("Error al desactivar plantilla:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    cancelarEdicion();
    onClose();
  };

  const formValido = formulario.nombre.trim() && formulario.mensaje.trim();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
              <DialogContent 
          className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]
                     bg-[#1A1A20]/95 backdrop-blur-lg border border-white/10 shadow-2xl 
                     max-w-3xl w-full mx-4 rounded-2xl p-0 gap-0 overflow-hidden
                     max-h-[90vh] flex flex-col
                     data-[state=open]:animate-in data-[state=closed]:animate-out 
                     data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 
                     data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={handleClose}
          onWheel={(e) => {
            e.stopPropagation();
          }}
        >
        {/* Header */}
        <DialogHeader className="p-6 border-b border-white/10 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-[#B695BF]/20 rounded-full p-2">
                <FileText className="text-[#B695BF]" size={20} />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white">
                  ⚙️ Gestionar Plantillas
                </DialogTitle>
                <p className="text-white/70 text-sm mt-1">
                  Crea y edita plantillas de mensajes para WhatsApp
                </p>
              </div>
            </div>
            <Button
              onClick={iniciarCreacion}
              disabled={creando || editando !== null || loading}
              className="bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/30 
                       disabled:opacity-50 disabled:cursor-not-allowed"
              size="sm"
            >
              <Plus size={16} />
              Nueva plantilla
            </Button>
          </div>
        </DialogHeader>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 min-h-0 modal-scroll-content">
          <div className="space-y-6"
               onWheel={(e) => {
                 // Permite scroll interno pero evita propagación
                 e.stopPropagation();
               }}
          >
            {/* Formulario de creación/edición */}
            {(creando || editando !== null) && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-[#25D366]/20 rounded-full p-1">
                    {creando ? <Plus size={16} className="text-[#25D366]" /> : <Edit2 size={16} className="text-[#25D366]" />}
                  </div>
                  <h3 className="text-lg font-medium text-white">
                    {creando ? "✨ Nueva Plantilla" : "📝 Editar Plantilla"}
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Nombre */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Nombre de la plantilla
                    </label>
                    <input
                      type="text"
                      value={formulario.nombre}
                      onChange={e => setFormulario({ ...formulario, nombre: e.target.value })}
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-xl 
                               text-white placeholder-white/50 focus:border-[#25D366] focus:outline-none 
                               focus:ring-2 focus:ring-[#25D366]/20 transition-all"
                      placeholder="Ej: Bienvenida nuevos clientes"
                    />
                  </div>

                  {/* Categoría */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Categoría
                    </label>
                    <Select value={formulario.categoria} onValueChange={(value) => setFormulario({ ...formulario, categoria: value })}>
                      <SelectTrigger className="w-full bg-white/10 border-white/20 text-white hover:bg-white/15">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#212026] border-white/20">
                        {CATEGORIAS_PLANTILLAS.map(categoria => (
                          <SelectItem key={categoria} value={categoria} className="text-white hover:bg-white/10">
                            📁 {categoria}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Descripción (opcional)
                    </label>
                    <input
                      type="text"
                      value={formulario.descripcion}
                      onChange={e => setFormulario({ ...formulario, descripcion: e.target.value })}
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-xl 
                               text-white placeholder-white/50 focus:border-[#25D366] focus:outline-none 
                               focus:ring-2 focus:ring-[#25D366]/20 transition-all"
                      placeholder="Breve descripción de cuándo usar esta plantilla"
                    />
                  </div>

                  {/* Mensaje */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Mensaje de la plantilla
                    </label>
                    <textarea
                      value={formulario.mensaje}
                      onChange={e => setFormulario({ ...formulario, mensaje: e.target.value })}
                      className="w-full h-32 p-3 bg-white/10 border border-white/20 rounded-xl 
                               text-white placeholder-white/50 focus:border-[#25D366] focus:outline-none 
                               focus:ring-2 focus:ring-[#25D366]/20 resize-none transition-all
                               scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
                      placeholder="Hola {{nombre}}, bienvenido a nuestro servicio..."
                    />
                    <p className="text-xs text-white/50 mt-1">
                      💡 Usa <code className="bg-white/10 px-1 rounded">{'{{nombre}}'}</code> para el nombre del cliente
                    </p>
                  </div>

                  {/* Botones del formulario */}
                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      onClick={cancelarEdicion}
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white/70 hover:bg-white/20 hover:text-white"
                    >
                      <X size={16} />
                      Cancelar
                    </Button>
                    <Button
                      onClick={guardarPlantilla}
                      disabled={!formValido || loading}
                      className="bg-[#25D366] hover:bg-[#128C7E] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          Guardando...
                        </div>
                      ) : (
                        <>
                          <Save size={16} />
                          {creando ? "Crear plantilla" : "Guardar cambios"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de plantillas existentes */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                📋 Plantillas Existentes
                <span className="text-sm text-white/60 bg-white/10 px-2 py-1 rounded-full">
                  {plantillas.length}
                </span>
              </h3>

              {loading && !creando && !editando ? (
                <div className="text-center text-white/60 py-8">
                  <div className="w-6 h-6 border-2 border-white/20 border-t-[#B695BF] rounded-full animate-spin mx-auto mb-2" />
                  Cargando plantillas...
                </div>
              ) : plantillas.length === 0 ? (
                <div className="text-center text-white/60 py-8 bg-white/5 rounded-xl border border-white/10">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-lg font-medium mb-1">No hay plantillas</p>
                  <p className="text-sm opacity-70">Crea tu primera plantilla usando el botón de arriba</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {plantillas.map(plantilla => (
                    <div 
                      key={plantilla.id} 
                      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 
                               hover:bg-white/10 transition-all duration-200 group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-white leading-tight">
                              {plantilla.nombre}
                            </h4>
                            <span className="text-xs bg-[#B695BF]/20 text-[#B695BF] px-2 py-1 rounded-full shrink-0">
                              {plantilla.categoria}
                            </span>
                          </div>
                          {plantilla.descripcion && (
                            <p className="text-sm text-white/60 mb-2 leading-relaxed">
                              {plantilla.descripcion}
                            </p>
                          )}
                          <div className="text-xs text-white/50 bg-white/5 p-2 rounded-lg">
                            <span className="font-medium">Vista previa:</span> {plantilla.mensaje.substring(0, 100)}
                            {plantilla.mensaje.length > 100 && "..."}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            onClick={() => iniciarEdicion(plantilla)}
                            disabled={creando || editando !== null || loading}
                            size="sm"
                            variant="outline"
                            className="bg-white/10 border-white/20 text-white/70 hover:bg-white/20 hover:text-white
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Edit2 size={14} />
                          </Button>
                          <Button
                            onClick={() => eliminarPlantilla(plantilla.id, plantilla.nombre)}
                            disabled={loading}
                            size="sm"
                            variant="outline"
                            className="bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}