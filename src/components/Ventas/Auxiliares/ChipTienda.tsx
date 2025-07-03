import { Building2, ShoppingCart, Store } from "lucide-react";

interface ChipTiendaProps {
  tienda: string;
  mostrarIcono?: boolean;
  mostrarTexto?: boolean;
  variant?: 'default' | 'outline' | 'solid' | 'minimal';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  truncate?: boolean;
}

export default function ChipTienda({
  tienda,
  mostrarIcono = true,
  mostrarTexto = true,
  variant = 'default',
  size = 'md',
  onClick,
  className = '',
  truncate = false
}: ChipTiendaProps) {

  // Configuración por tienda
  const getTiendaConfig = (nombreTienda: string) => {
    const tiendaNormalizada = nombreTienda.toUpperCase();
    
    switch (tiendaNormalizada) {
      case 'MONTELLA':
      case 'MONTELLA WOOCOMMERCE':
        return {
          color: "#D94854",
          emoji: "🏢",
          icon: Building2,
          nombre: "MONTELLA",
          descripcion: "Tienda principal Montella"
        };
      case 'ALENKA':
      case 'ALENKA WOOCOMMERCE':
        return {
          color: "#B695BF",
          emoji: "🏪",
          icon: Store,
          nombre: "ALENKA",
          descripcion: "Tienda Alenka"
        };
      case 'MERCADOLIBRE':
        return {
          color: "#4A8C8C",
          emoji: "🛒",
          icon: ShoppingCart,
          nombre: "MERCADOLIBRE",
          descripcion: "Marketplace MercadoLibre"
        };
      default:
        return {
          color: "#B695BF",
          emoji: "🏬",
          icon: Store,
          nombre: tienda,
          descripcion: `Tienda ${tienda}`
        };
    }
  };

  const config = getTiendaConfig(tienda);

  // Estilos según tamaño
  const getSizeStyles = () => {
    switch (size) {
      case 'xs':
        return {
          container: "px-2 py-1 gap-1",
          text: "text-xs",
          icon: "w-3 h-3",
          emoji: "text-xs"
        };
      case 'sm':
        return {
          container: "px-2.5 py-1.5 gap-1.5",
          text: "text-sm",
          icon: "w-3.5 h-3.5",
          emoji: "text-sm"
        };
      case 'lg':
        return {
          container: "px-4 py-2.5 gap-2.5",
          text: "text-lg",
          icon: "w-5 h-5",
          emoji: "text-lg"
        };
      default: // md
        return {
          container: "px-3 py-2 gap-2",
          text: "text-sm",
          icon: "w-4 h-4",
          emoji: "text-base"
        };
    }
  };

  const styles = getSizeStyles();

  // Estilos según variante
  const getVariantStyles = () => {
    const baseStyles = "inline-flex items-center font-medium rounded-lg transition-all";
    
    switch (variant) {
      case 'outline':
        return `${baseStyles} bg-transparent border-2 hover:bg-white/5`;
      case 'solid':
        return `${baseStyles} border-none text-white`;
      case 'minimal':
        return `${baseStyles} bg-transparent border-none hover:bg-white/5`;
      default: // default
        return `${baseStyles} border hover:bg-white/5`;
    }
  };

  // Colores según variante
  const getVariantColors = () => {
    switch (variant) {
      case 'outline':
        return {
          style: { 
            borderColor: `${config.color}50`,
            color: config.color 
          }
        };
      case 'solid':
        return {
          style: { 
            backgroundColor: config.color,
            color: 'white'
          }
        };
      case 'minimal':
        return {
          style: { 
            color: config.color 
          }
        };
      default: // default
        return {
          style: { 
            backgroundColor: `${config.color}20`,
            borderColor: `${config.color}30`,
            color: config.color 
          }
        };
    }
  };

  const variantStyles = getVariantStyles();
  const variantColors = getVariantColors();

  // Renderizar ícono
  const renderIcono = () => {
    if (!mostrarIcono) return null;

    // Emoji vs ícono de Lucide
    if (size === 'xs' || size === 'sm') {
      return (
        <span className={styles.emoji}>
          {config.emoji}
        </span>
      );
    }

    const IconComponent = config.icon;
    return (
      <IconComponent 
        className={styles.icon}
        style={{ color: variant === 'solid' ? 'white' : config.color }}
      />
    );
  };

  // Texto de la tienda
  const renderTexto = () => {
    if (!mostrarTexto) return null;

    const texto = config.nombre;
    
    return (
      <span 
        className={`${styles.text} ${truncate ? 'truncate max-w-24' : ''}`}
        title={truncate ? config.descripcion : undefined}
      >
        {texto}
      </span>
    );
  };

  // Componente base
  const chipContent = (
    <div
      className={`${variantStyles} ${styles.container} ${onClick ? 'cursor-pointer hover:scale-105' : ''} ${className}`}
      style={variantColors.style}
      title={config.descripcion}
    >
      {renderIcono()}
      {renderTexto()}
    </div>
  );

  // Si es clickeable, envolver en botón
  if (onClick) {
    return (
      <button 
        onClick={onClick}
        className="focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-transparent rounded-lg"
      >
        {chipContent}
      </button>
    );
  }

  return chipContent;
}