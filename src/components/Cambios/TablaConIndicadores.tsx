import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TablaConIndicadoresProps {
  children: React.ReactNode;
  minWidth: string; // ej: "1620px"
  className?: string;
  onScrollStateChange?: (hasScroll: boolean) => void; // ← NUEVA PROP
}

export const TablaConIndicadores: React.FC<TablaConIndicadoresProps> = ({
  children,
  minWidth,
  className = '',
  onScrollStateChange // ← NUEVA PROP
}) => {
  const [mostrarIndicadorIzquierdo, setMostrarIndicadorIzquierdo] = useState(false);
  const [mostrarIndicadorDerecho, setMostrarIndicadorDerecho] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Verificar si hay scroll y actualizar indicadores
  const verificarScroll = () => {
    if (!scrollRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    
    // Mostrar indicador izquierdo si no estamos al inicio
    setMostrarIndicadorIzquierdo(scrollLeft > 10);
    
    // Mostrar indicador derecho si no estamos al final
    setMostrarIndicadorDerecho(scrollLeft < scrollWidth - clientWidth - 10);
    
    // Notificar al componente padre si hay scroll disponible
    const hasScroll = scrollWidth > clientWidth;
    onScrollStateChange?.(hasScroll);
  };

  // Verificar al montar y cuando cambie el contenido
  useEffect(() => {
    verificarScroll();
    
    // Observer para detectar cambios en el contenido
    const observer = new ResizeObserver(() => {
      verificarScroll();
    });

    if (scrollRef.current) {
      observer.observe(scrollRef.current);
    }

    return () => observer.disconnect();
  }, [children]);

  // Scroll suave hacia la dirección indicada
  const scrollHacia = (direccion: 'izquierda' | 'derecha') => {
    if (!scrollRef.current) return;

    const scrollAmount = 300; // Cantidad de scroll en px
    const currentScroll = scrollRef.current.scrollLeft;
    const targetScroll = direccion === 'izquierda' 
      ? currentScroll - scrollAmount 
      : currentScroll + scrollAmount;

    scrollRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

  return (
    <div className={`relative ${className}`}>
      
      {/* Indicador izquierdo */}
      {mostrarIndicadorIzquierdo && (
        <div className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none">
          {/* Gradiente de sombra */}
          <div className="w-8 h-full bg-gradient-to-r from-[#1a1a2e]/80 to-transparent" />
          
          {/* Botón de scroll */}
          <button
            onClick={() => scrollHacia('izquierda')}
            className="absolute top-1/2 left-2 -translate-y-1/2 pointer-events-auto
                       w-6 h-6 bg-white/20 hover:bg-white/30 rounded-full 
                       flex items-center justify-center transition-all
                       border border-white/30 hover:border-white/50"
            title="Scroll hacia la izquierda"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
        </div>
      )}

      {/* Indicador derecho */}
      {mostrarIndicadorDerecho && (
        <div className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none">
          {/* Gradiente de sombra */}
          <div className="w-8 h-full bg-gradient-to-l from-[#1a1a2e]/80 to-transparent" />
          
          {/* Botón de scroll */}
          <button
            onClick={() => scrollHacia('derecha')}
            className="absolute top-1/2 right-2 -translate-y-1/2 pointer-events-auto
                       w-6 h-6 bg-white/20 hover:bg-white/30 rounded-full 
                       flex items-center justify-center transition-all
                       border border-white/30 hover:border-white/50"
            title="Scroll hacia la derecha"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      )}

      {/* Tabla con scroll */}
      <div 
        ref={scrollRef}
        className="overflow-x-auto custom-scrollbar"
        onScroll={verificarScroll}
        style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.3) transparent'
        }}
      >
        <table className={`w-full ${minWidth.startsWith('min-w-') ? minWidth : `min-w-[${minWidth}]`}`}>
          {children}
        </table>
      </div>
    </div>
  );
};

export default TablaConIndicadores;