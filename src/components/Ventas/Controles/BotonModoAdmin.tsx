import { useState } from "react";
import { Settings, Eye, Users, Shield, Lock } from "lucide-react";
import * as Switch from "@radix-ui/react-switch";

interface BotonModoAdminProps {
  modoAdmin: boolean;
  onCambiarModo: (modoAdmin: boolean) => void;
  userRole?: string;
  disabled?: boolean;
  mostrarTooltip?: boolean;
  variant?: 'default' | 'compact' | 'pill';
}

export default function BotonModoAdmin({
  modoAdmin,
  onCambiarModo,
  userRole = 'viewer',
  disabled = false,
  mostrarTooltip = true,
  variant = 'default'
}: BotonModoAdminProps) {

  const [hovering, setHovering] = useState(false);

  // Verificar permisos
  const puedeAdmin = userRole === 'admin' || userRole === 'superadmin';
  const isDisabled = disabled || !puedeAdmin;

  // Estilos según variante
  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          container: "flex items-center gap-2 px-3 py-2 rounded-lg",
          text: "text-sm",
          icon: "w-4 h-4"
        };
      case 'pill':
        return {
          container: "flex items-center gap-3 px-4 py-2 rounded-full",
          text: "text-sm font-medium",
          icon: "w-4 h-4"
        };
      default:
        return {
          container: "flex items-center gap-3 px-4 py-3 rounded-xl",
          text: "text-base font-medium",
          icon: "w-5 h-5"
        };
    }
  };

  const styles = getVariantStyles();

  // Colores y estados
  const getStateColors = () => {
    if (isDisabled) {
      return {
        bg: "bg-white/5",
        border: "border-white/10",
        text: "text-white/40",
        icon: "text-white/30"
      };
    }

    if (modoAdmin) {
      return {
        bg: "bg-[#D94854]/20 hover:bg-[#D94854]/30",
        border: "border-[#D94854]/30",
        text: "text-[#D94854]",
        icon: "text-[#D94854]"
      };
    }

    return {
      bg: "bg-white/10 hover:bg-white/20",
      border: "border-white/20",
      text: "text-white/80 hover:text-white",
      icon: "text-white/60"
    };
  };

  const colors = getStateColors();

  // Contenido del tooltip
  const getTooltipContent = () => {
    if (!puedeAdmin) {
      return "⚠️ Requiere permisos de admin o superadmin";
    }
    return modoAdmin 
      ? "🔧 Cambiar a vista básica" 
      : "⚙️ Cambiar a modo administración";
  };

  if (!puedeAdmin && variant === 'compact') {
    // Mostrar botón bloqueado en modo compacto
    return (
      <div 
        className="relative"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <div className={`${styles.container} ${colors.bg} ${colors.border} border transition-all cursor-not-allowed opacity-50`}>
          <Lock className={`${styles.icon} ${colors.icon}`} />
          <span className={`${styles.text} ${colors.text}`}>
            Admin
          </span>
        </div>

        {/* Tooltip */}
        {mostrarTooltip && hovering && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-[#212026] border border-white/20 rounded-lg shadow-2xl z-50">
            <div className="text-xs text-white/80 whitespace-nowrap">
              {getTooltipContent()}
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#212026]" />
          </div>
        )}
      </div>
    );
  }

  if (!puedeAdmin) {
    return null; // No mostrar nada si no tiene permisos
  }

  return (
    <div 
      className="relative"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <button
        onClick={() => onCambiarModo(!modoAdmin)}
        disabled={isDisabled}
        className={`${styles.container} ${colors.bg} ${colors.border} border transition-all disabled:cursor-not-allowed`}
      >
        {/* Icono principal */}
        <div className={`${colors.icon} transition-colors`}>
          {modoAdmin ? (
            <Settings className={`${styles.icon} animate-pulse`} />
          ) : (
            <Eye className={styles.icon} />
          )}
        </div>

        {/* Texto */}
        <span className={`${styles.text} ${colors.text} transition-colors`}>
          {modoAdmin ? 'Modo Admin' : 'Vista Básica'}
        </span>

        {/* Switch visual (solo en variant default) */}
        {variant === 'default' && (
          <Switch.Root
            checked={modoAdmin}
            disabled={isDisabled}
            className="w-11 h-6 bg-white/20 rounded-full relative data-[state=checked]:bg-[#D94854]/50 transition-colors"
          >
            <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[22px]" />
          </Switch.Root>
        )}

        {/* Indicador de rol (solo superadmin) */}
        {userRole === 'superadmin' && (
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-[#51590E]" />
            <span className="text-xs text-[#51590E] font-medium">Super</span>
          </div>
        )}

        {/* Badge de estado */}
        {modoAdmin && (
          <div className="w-2 h-2 bg-[#D94854] rounded-full animate-pulse" />
        )}
      </button>

      {/* Tooltip */}
      {mostrarTooltip && hovering && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-[#212026] border border-white/20 rounded-lg shadow-2xl z-50">
          <div className="text-xs text-white/80 whitespace-nowrap">
            {getTooltipContent()}
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#212026]" />
        </div>
      )}

      {/* Información adicional de rol */}
      {variant === 'default' && hovering && userRole && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-[#212026] border border-white/20 rounded-lg shadow-2xl z-50">
          <div className="flex items-center gap-2 text-xs text-white/80 whitespace-nowrap">
            <Users className="w-3 h-3" />
            <span>Rol: {userRole}</span>
            {userRole === 'superadmin' && <Shield className="w-3 h-3 text-[#51590E]" />}
          </div>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-[#212026]" />
        </div>
      )}
    </div>
  );
}