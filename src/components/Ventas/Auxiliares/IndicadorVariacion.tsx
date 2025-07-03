import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import { formatearVariacion } from "@/utils/ventas/ventasUtils";

interface IndicadorVariacionProps {
  variacion: number | null | undefined;
  mostrarTexto?: boolean;
  mostrarIcono?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  colorPersonalizado?: {
    positivo?: string;
    negativo?: string;
    neutro?: string;
    indefinido?: string;
  };
}

export default function IndicadorVariacion({
  variacion,
  mostrarTexto = true,
  mostrarIcono = true,
  size = 'md',
  className = '',
  colorPersonalizado
}: IndicadorVariacionProps) {

  // Formatear variación usando utils
  const variacionFormateada = formatearVariacion(variacion ?? null);

  // Estilos según tamaño
  const getSizeStyles = () => {
    switch (size) {
      case 'xs':
        return {
          container: "gap-1",
          icon: "w-2.5 h-2.5",
          text: "text-xs"
        };
      case 'sm':
        return {
          container: "gap-1",
          icon: "w-3 h-3",
          text: "text-sm"
        };
      case 'lg':
        return {
          container: "gap-2",
          icon: "w-5 h-5",
          text: "text-lg"
        };
      default: // md
        return {
          container: "gap-1.5",
          icon: "w-4 h-4",
          text: "text-base"
        };
    }
  };

  const styles = getSizeStyles();

  // Colores (personalizados o por defecto)
  const getColor = () => {
    if (colorPersonalizado) {
      switch (variacionFormateada.icono) {
        case 'up':
          return colorPersonalizado.positivo || "text-[#4A8C8C]";
        case 'down':
          return colorPersonalizado.negativo || "text-[#4A8C8C]";
        case 'neutral':
          return colorPersonalizado.neutro || "text-white/60";
        default:
          return colorPersonalizado.indefinido || "text-white/40";
      }
    }
    return variacionFormateada.color;
  };

  // Renderizar ícono según el tipo
  const renderIcono = () => {
    if (!mostrarIcono) return null;

    const iconClass = `${styles.icon} ${getColor()}`;

    switch (variacionFormateada.icono) {
      case 'up':
        return <TrendingUp className={iconClass} />;
      case 'down':
        return <TrendingDown className={iconClass} />;
      case 'neutral':
        return <Minus className={iconClass} />;
      case 'none':
        return <AlertTriangle className={`${iconClass} opacity-50`} />;
      default:
        return null;
    }
  };

  // Obtener contexto visual adicional
  const getContextualInfo = () => {
    if (variacion === null || variacion === undefined) {
      return {
        title: "Sin datos para comparar",
        description: "No hay período anterior disponible"
      };
    }

    const absVariacion = Math.abs(variacion);
    
    if (absVariacion === 0) {
      return {
        title: "Sin cambios",
        description: "Mismo valor que el período anterior"
      };
    }

    if (absVariacion < 5) {
      return {
        title: "Cambio mínimo",
        description: `Variación menor al 5%`
      };
    }

    if (absVariacion >= 50) {
      return {
        title: "Cambio significativo",
        description: `Variación mayor al 50%`
      };
    }

    return {
      title: variacion > 0 ? "Crecimiento" : "Disminución",
      description: `${absVariacion.toFixed(1)}% respecto al período anterior`
    };
  };

  const contextInfo = getContextualInfo();

  return (
    <div 
      className={`flex items-center ${styles.container} font-semibold ${className}`}
      title={`${contextInfo.title}: ${contextInfo.description}`}
    >
      {renderIcono()}
      
      {mostrarTexto && (
        <span className={`${styles.text} ${getColor()}`}>
          {variacionFormateada.texto}
        </span>
      )}
    </div>
  );
}