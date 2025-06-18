import { X } from 'lucide-react';
import {
  LABELS_ESTADO_DEVOLUCION,
  type EstadoDevolucionFiltro,
  MOTIVOS_DEVOLUCION
} from '@/types/cambios/devolucionesTypes';

interface FiltrosModalProps {
  isOpen: boolean;
  filtros: {
    estado?: EstadoDevolucionFiltro;
    motivo?: string;
  };
  onChange: (filtros: { estado?: EstadoDevolucionFiltro; motivo?: string }) => void;
  onClose: () => void;
}

export function FiltrosModal({ isOpen, filtros, onChange, onClose }: FiltrosModalProps) {
  if (!isOpen) return null;

  const opcionesEstado: Array<{ value: EstadoDevolucionFiltro; label: string }> = [
    { value: 'todos', label: LABELS_ESTADO_DEVOLUCION.todos },
    { value: 'pendiente_llegada', label: LABELS_ESTADO_DEVOLUCION.pendiente_llegada },
    { value: 'llegado_sin_procesar', label: LABELS_ESTADO_DEVOLUCION.llegado_sin_procesar },
    { value: 'dinero_devuelto', label: LABELS_ESTADO_DEVOLUCION.dinero_devuelto },
    { value: 'nota_emitida',   label: LABELS_ESTADO_DEVOLUCION.nota_emitida },
    { value: 'completado',      label: LABELS_ESTADO_DEVOLUCION.completado },
    { value: 'sin_llegar',      label: LABELS_ESTADO_DEVOLUCION.sin_llegar }
  ];

  const opcionesMotivo = [
    { value: '', label: 'Todos los motivos' },
    ...MOTIVOS_DEVOLUCION.map(m => ({ value: m, label: m }))
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-[#212026] rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
          
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-white/20">
            <h2 className="text-lg font-semibold text-white">Filtros de Devoluciones</h2>
            <button onClick={onClose}>
              <X className="w-5 h-5 text-white/60 hover:text-white" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4 overflow-y-auto space-y-6">
            
            {/* Estado */}
            <section>
              <h3 className="text-sm font-medium text-white/70 mb-2">Estado de la devolución</h3>
              <div className="space-y-1">
                {opcionesEstado.map(o => (
                  <label key={o.value} className="flex items-center gap-2 text-white">
                    <input
                      type="radio"
                      name="estado"
                      value={o.value}
                      checked={filtros.estado === o.value}
                      onChange={() => onChange({ ...filtros, estado: o.value })}
                      className="form-radio h-4 w-4 text-[#D94854] focus:ring-[#D94854]/50"
                    />
                    <span>{o.label}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* Motivo */}
            <section>
              <h3 className="text-sm font-medium text-white/70 mb-2">Motivo de la devolución</h3>
              <div className="space-y-1">
                {opcionesMotivo.map(o => (
                  <label key={o.value || 'todos'} className="flex items-center gap-2 text-white">
                    <input
                      type="radio"
                      name="motivo"
                      value={o.value}
                      checked={filtros.motivo === o.value}
                      onChange={() => onChange({ ...filtros, motivo: o.value })}
                      className="form-radio h-4 w-4 text-[#D94854] focus:ring-[#D94854]/50"
                    />
                    <span>{o.label}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* Aquí podrías agregar más secciones: rango de fechas, celular, etc. */}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 px-6 py-4 border-t border-white/20">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/15 transition"
            >
              Cancelar
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#D94854] rounded-lg text-white hover:bg-[#D94854]/80 transition"
            >
              Aplicar
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
