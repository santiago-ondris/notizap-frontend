import { useState } from "react";
import { Phone, Save } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clienteNombre: string;
  onTelefonoGuardado: (telefono: string) => void;
}

export default function AgregarTelefonoModal({ 
  isOpen, 
  onClose, 
  clienteNombre, 
  onTelefonoGuardado 
}: Props) {
  const [telefono, setTelefono] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!telefono.trim()) return;
    
    setLoading(true);
    try {
      await onTelefonoGuardado(telefono.trim());
      setTelefono("");
      onClose();
    } catch (error) {
      console.error("Error al guardar teléfono:", error);
      // Aquí podrías agregar tu sistema de toasts
      alert("Error al guardar el teléfono");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTelefono("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]
                   bg-[#1A1A20]/95 backdrop-blur-lg border border-white/10 shadow-2xl 
                   max-w-md w-full mx-4 rounded-2xl p-6
                   data-[state=open]:animate-in data-[state=closed]:animate-out 
                   data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 
                   data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        
        // ✅ CONFIGURACIONES PARA BLOQUEO:
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={handleClose}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            📱 Agregar Teléfono
          </DialogTitle>
          <p className="text-white/70 text-sm mt-1">
            Para <span className="text-[#B695BF] font-medium">{clienteNombre}</span>
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Número de teléfono
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej: +549111234567 o 1123456789"
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl 
                         text-white placeholder-white/50 focus:border-[#25D366] focus:outline-none 
                         focus:ring-2 focus:ring-[#25D366]/20 transition-all"
                autoFocus
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              className="flex-1 bg-white/10 border-white/20 text-white/70 hover:bg-white/20 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!telefono.trim() || loading}
              className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Guardando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Guardar y enviar
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}