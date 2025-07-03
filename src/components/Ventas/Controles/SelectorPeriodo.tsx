import { useState } from "react";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import * as Select from "@radix-ui/react-select";
import { obtenerPeriodoActual, obtenerPeriodoAnterior, obtenerPeriodoSiguiente } from "@/utils/ventas/ventasUtils";
import { MESES, AÑOS_DISPONIBLES } from "@/types/woocommerce/wooTypes";

interface SelectorPeriodoProps {
  mesSeleccionado: number;
  añoSeleccionado: number;
  onCambiarPeriodo: (mes: number, año: number) => void;
  mostrarNavegacion?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function SelectorPeriodo({
  mesSeleccionado,
  añoSeleccionado,
  onCambiarPeriodo,
  mostrarNavegacion = true,
  disabled = false,
  size = 'md'
}: SelectorPeriodoProps) {

  const [mesAbierto, setMesAbierto] = useState(false);
  const [añoAbierto, setAñoAbierto] = useState(false);

  // Estilos según tamaño
  const getStyles = () => {
    switch (size) {
      case 'sm':
        return {
          trigger: "px-3 py-2 text-sm",
          navigation: "p-1.5",
          icon: "w-3 h-3"
        };
      case 'lg':
        return {
          trigger: "px-5 py-4 text-lg",
          navigation: "p-3",
          icon: "w-6 h-6"
        };
      default:
        return {
          trigger: "px-4 py-3 text-base",
          navigation: "p-2",
          icon: "w-4 h-4"
        };
    }
  };

  const styles = getStyles();
  const periodoActual = obtenerPeriodoActual();

  // Navegación de períodos
  const irAPeriodoAnterior = () => {
    const { mes, año } = obtenerPeriodoAnterior(mesSeleccionado, añoSeleccionado);
    onCambiarPeriodo(mes, año);
  };

  const irAPeriodoSiguiente = () => {
    const { mes, año } = obtenerPeriodoSiguiente(mesSeleccionado, añoSeleccionado);
    onCambiarPeriodo(mes, año);
  };

  const irAPeriodoActual = () => {
    onCambiarPeriodo(periodoActual.mes, periodoActual.año);
  };

  const esPeriodoActual = mesSeleccionado === periodoActual.mes && añoSeleccionado === periodoActual.año;

  return (
    <div className="flex items-center gap-2">
      {/* Navegación anterior */}
      {mostrarNavegacion && (
        <button
          onClick={irAPeriodoAnterior}
          disabled={disabled}
          className={`${styles.navigation} bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
          title="Período anterior"
        >
          <ChevronLeft className={styles.icon} />
        </button>
      )}

      {/* Contenedor principal del selector */}
      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-1">
        {/* Selector de mes */}
        <Select.Root
          value={mesSeleccionado.toString()}
          onValueChange={(value) => onCambiarPeriodo(parseInt(value), añoSeleccionado)}
          disabled={disabled}
          open={mesAbierto}
          onOpenChange={setMesAbierto}
        >
          <Select.Trigger className={`${styles.trigger} bg-transparent border-none text-white hover:bg-white/10 rounded-lg transition-all focus:outline-none focus:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}>
            <Calendar className={styles.icon} />
            <Select.Value />
            <ChevronDown className={`${styles.icon} transition-transform ${mesAbierto ? 'rotate-180' : ''}`} />
          </Select.Trigger>

          <Select.Portal>
            <Select.Content className="bg-[#212026] border border-white/20 rounded-lg shadow-2xl z-50 overflow-hidden">
              <Select.Viewport className="p-1">
                {MESES.map((mes) => (
                  <Select.Item
                    key={mes.value}
                    value={mes.value.toString()}
                    className="px-3 py-2 text-sm text-white hover:bg-white/10 rounded cursor-pointer outline-none select-none data-[highlighted]:bg-white/10"
                  >
                    <Select.ItemText>{mes.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>

        {/* Separador */}
        <div className="w-px h-6 bg-white/20" />

        {/* Selector de año */}
        <Select.Root
          value={añoSeleccionado.toString()}
          onValueChange={(value) => onCambiarPeriodo(mesSeleccionado, parseInt(value))}
          disabled={disabled}
          open={añoAbierto}
          onOpenChange={setAñoAbierto}
        >
          <Select.Trigger className={`${styles.trigger} bg-transparent border-none text-white hover:bg-white/10 rounded-lg transition-all focus:outline-none focus:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}>
            <Select.Value />
            <ChevronDown className={`${styles.icon} transition-transform ${añoAbierto ? 'rotate-180' : ''}`} />
          </Select.Trigger>

          <Select.Portal>
            <Select.Content className="bg-[#212026] border border-white/20 rounded-lg shadow-2xl z-50 overflow-hidden">
              <Select.Viewport className="p-1 max-h-40 overflow-y-auto">
                {AÑOS_DISPONIBLES.map((año) => (
                  <Select.Item
                    key={año}
                    value={año.toString()}
                    className="px-3 py-2 text-sm text-white hover:bg-white/10 rounded cursor-pointer outline-none select-none data-[highlighted]:bg-white/10"
                  >
                    <Select.ItemText>{año}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      {/* Navegación siguiente */}
      {mostrarNavegacion && (
        <button
          onClick={irAPeriodoSiguiente}
          disabled={disabled}
          className={`${styles.navigation} bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
          title="Período siguiente"
        >
          <ChevronRight className={styles.icon} />
        </button>
      )}

      {/* Botón período actual */}
      {mostrarNavegacion && !esPeriodoActual && (
        <button
          onClick={irAPeriodoActual}
          disabled={disabled}
          className={`${styles.trigger} bg-[#51590E]/20 hover:bg-[#51590E]/30 border border-[#51590E]/30 text-[#51590E] rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm`}
        >
          Hoy
        </button>
      )}

      {/* Indicador de período actual */}
      {esPeriodoActual && mostrarNavegacion && (
        <div className="flex items-center gap-1 px-2 py-1 bg-[#51590E]/20 border border-[#51590E]/30 rounded-lg">
          <div className="w-2 h-2 bg-[#51590E] rounded-full animate-pulse" />
          <span className="text-[#51590E] text-xs font-medium">Actual</span>
        </div>
      )}
    </div>
  );
}