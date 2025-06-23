import { useState, useEffect } from "react";
import { MessageCircle, Send, Settings, Search, FileText } from "lucide-react";
import { Button } from "../ui/button";
import { type ClienteResumenDto } from "@/types/cliente/cliente";
import {
  obtenerPlantillasPorCategoria,
  personalizarMensaje,
  abrirWhatsAppConMensaje
} from "@/services/cliente/plantillaService";
import { type PlantillaWhatsAppDto, type PlantillasPorCategoria } from "@/types/whatsapp/plantillas";
import { useAuth } from "@/contexts/AuthContext";
import GestionPlantillasModal from "./GestionPlantillasModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cliente: ClienteResumenDto;
}

export default function PlantillaWhatsAppModal({ isOpen, onClose, cliente }: Props) {
  const [plantillasPorCategoria, setPlantillasPorCategoria] = useState<PlantillasPorCategoria>({});
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState<PlantillaWhatsAppDto | null>(null);
  const [mensajePersonalizado, setMensajePersonalizado] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(false);
  const [showGestion, setShowGestion] = useState(false);
  const { role } = useAuth();
  const puedeGestionar = role === "admin" || role === "superadmin";

  // Cargar plantillas cuando el modal se abre
  useEffect(() => {
    if (isOpen) {
      cargarPlantillas();
    }
  }, [isOpen]);

  const cargarPlantillas = async () => {
    try {
      setLoading(true);
      const datos = await obtenerPlantillasPorCategoria();
      setPlantillasPorCategoria(datos);
    } catch (error) {
      console.error("Error al cargar plantillas:", error);
    } finally {
      setLoading(false);
    }
  };

  const seleccionarPlantilla = (p: PlantillaWhatsAppDto) => {
    setPlantillaSeleccionada(p);
    setMensajePersonalizado(
      personalizarMensaje(p.mensaje, {
        nombre: cliente.nombre,
        telefono: cliente.telefono
      })
    );
  };

  const enviarWhatsApp = () => {
    if (!cliente.telefono?.trim()) {
      alert("El cliente no tiene teléfono registrado");
      return;
    }
    if (!mensajePersonalizado.trim()) {
      alert("Debes escribir un mensaje");
      return;
    }
    abrirWhatsAppConMensaje(cliente.telefono, mensajePersonalizado);
    onClose();
  };

  const handleClose = () => {
    setPlantillaSeleccionada(null);
    setBusqueda("");
    setMensajePersonalizado("");
    onClose();
  };

  // Filtrar plantillas por búsqueda
  const plantillasFiltradas = Object.entries(plantillasPorCategoria).reduce((acc, [categoria, plantillas]) => {
    if (!busqueda.trim()) {
      acc[categoria] = plantillas;
    } else {
      const filtradas = plantillas.filter(p => 
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
      );
      if (filtradas.length > 0) {
        acc[categoria] = filtradas;
      }
    }
    return acc;
  }, {} as PlantillasPorCategoria);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent
          className="
          fixed left-[50%] top-[50%] z-50
          translate-x-[-50%] translate-y-[-50%]
          bg-[#1A1A20]/95 backdrop-blur-lg
          border border-white/10 shadow-2xl

          max-w-none           
          w-[95vw]            
          mx-auto            

          max-h-[95vh]       
          flex flex-col p-0 gap-0 overflow-hidden

          data-[state=open]:animate-in data-[state=closed]:animate-out
          data-[state=closed]:fade-out-0    data-[state=open]:fade-in-0
          data-[state=closed]:zoom-out-95   data-[state=open]:zoom-in-95"
          
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
                <div className="bg-[#25D366]/20 rounded-full p-2">
                  <MessageCircle className="text-[#25D366]" size={20} />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-white">
                    💬 Enviar WhatsApp
                  </DialogTitle>
                  <p className="text-white/70 text-sm mt-1">
                    Para <span className="text-[#B695BF] font-medium">{cliente.nombre}</span>
                  </p>
                </div>
              </div>
              {puedeGestionar && (
                <Button
                  onClick={() => setShowGestion(true)}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  size="sm"
                >
                  <Settings size={16} />
                </Button>
              )}
            </div>
          </DialogHeader>

          {/* Cuerpo dividido en dos paneles */}
          <div className="flex flex-1 min-h-0"
               onWheel={(e) => {
                 e.stopPropagation();
               }}
          >
            {/* Panel izquierdo - Plantillas */}
            <div className="w-2/5 border-r border-white/10 flex flex-col">
              {/* Buscador */}
              <div className="p-4 border-b border-white/10 shrink-0">
                <div className="relative">
                  <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    placeholder="Buscar plantillas..."
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl 
                             text-white placeholder-white/50 focus:border-[#25D366] focus:outline-none 
                             focus:ring-2 focus:ring-[#25D366]/20 transition-all"
                  />
                </div>
              </div>

              {/* Lista de plantillas con scroll */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 modal-scroll-content">
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center text-white/60 py-8">
                      <div className="w-6 h-6 border-2 border-white/20 border-t-[#25D366] rounded-full animate-spin mx-auto mb-2" />
                      Cargando plantillas...
                    </div>
                  ) : Object.entries(plantillasFiltradas).length === 0 ? (
                    <div className="text-center text-white/60 py-8">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      {busqueda ? "No se encontraron plantillas" : "No hay plantillas disponibles"}
                    </div>
                  ) : (
                    Object.entries(plantillasFiltradas).map(([categoria, plantillas]) => (
                      <div key={categoria}>
                        <h3 className="text-sm font-medium text-white/80 mb-3 uppercase tracking-wide flex items-center gap-2">
                          📁 {categoria}
                        </h3>
                        <div className="space-y-2">
                          {plantillas.map(plantilla => (
                            <button
                              key={plantilla.id}
                              onClick={() => seleccionarPlantilla(plantilla)}
                              className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                                plantillaSeleccionada?.id === plantilla.id
                                  ? "bg-[#25D366]/20 text-white border-[#25D366]/40 shadow-lg"
                                  : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20"
                              }`}
                            >
                              <div className="font-medium text-sm leading-tight mb-1">
                                {plantilla.nombre}
                              </div>
                              {plantilla.descripcion && (
                                <div className="text-xs text-white/60 leading-relaxed">
                                  {plantilla.descripcion}
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Panel derecho - Editor de mensaje */}
            <div className="w-3/5 flex flex-col min-h-0">
              {/* Header del editor */}
              <div className="p-4 border-b border-white/10 shrink-0">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  ✏️ {plantillaSeleccionada ? "Personalizar mensaje" : "Selecciona una plantilla"}
                </h3>
                {plantillaSeleccionada && (
                  <p className="text-sm text-white/60 mt-1">
                    Plantilla: <span className="text-[#25D366]">{plantillaSeleccionada.nombre}</span>
                  </p>
                )}
              </div>

              {/* Área de edición */}
              <div className="flex-1 p-4 min-h-0 overflow-y-auto modal-scroll-content">
                {plantillaSeleccionada ? (
                  <div className="h-full flex flex-col gap-4">
                    {/* Textarea con scroll interno */}
                    <div className="flex-1 min-h-0">
                      <textarea
                        value={mensajePersonalizado}
                        onChange={e => setMensajePersonalizado(e.target.value)}
                        placeholder="Escribe tu mensaje aquí..."
                        className="w-full h-full p-3 bg-white/10 border border-white/20 rounded-xl 
                                 text-white placeholder-white/50 focus:border-[#25D366] focus:outline-none 
                                 focus:ring-2 focus:ring-[#25D366]/20 resize-none transition-all
                                 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
                        maxLength={1000}
                        onWheel={(e) => {
                          // Permite scroll interno del textarea
                          e.stopPropagation();
                        }}
                      />
                    </div>
                    
                    {/* Footer con contador y botón */}
                    <div className="flex items-center justify-between shrink-0">
                      <div className="text-xs text-white/50">
                        {mensajePersonalizado.length}/1000 caracteres
                      </div>
                      <Button
                        onClick={enviarWhatsApp}
                        disabled={!mensajePersonalizado.trim()}
                        className="bg-[#25D366] hover:bg-[#128C7E] text-white disabled:opacity-50 
                                 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Send size={16} />
                        Enviar WhatsApp
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-white/50">
                    <div className="text-center">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>Selecciona una plantilla del panel izquierdo</p>
                      <p className="text-xs mt-1 opacity-70">para empezar a personalizar tu mensaje</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de gestión de plantillas */}
      <GestionPlantillasModal
        isOpen={showGestion}
        onClose={() => setShowGestion(false)}
        onPlantillasUpdated={cargarPlantillas}
      />
    </>
  );
}