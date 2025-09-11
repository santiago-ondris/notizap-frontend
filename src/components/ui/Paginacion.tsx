import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginacionProps {
  paginaActual: number;
  totalPaginas: number;
  totalElementos: number;
  elementosPorPagina: number;
  onCambioPagina: (pagina: number) => void;
  className?: string;
  mostrarInfo?: boolean;
  mostrarBotonesExtremidades?: boolean;
}

/**
 * Componente reutilizable de paginación
 * Diseñado para ser consistente con el sistema de diseño de Notizap
 */
export const Paginacion: React.FC<PaginacionProps> = ({
  paginaActual,
  totalPaginas,
  totalElementos,
  elementosPorPagina,
  onCambioPagina,
  className = '',
  mostrarInfo = true,
  mostrarBotonesExtremidades = true
}) => {
  
  // No mostrar paginación si hay 1 página o menos
  if (totalPaginas <= 1) {
    return null;
  }

  // Calcular rango de elementos mostrados
  const elementoInicio = (paginaActual - 1) * elementosPorPagina + 1;
  const elementoFin = Math.min(paginaActual * elementosPorPagina, totalElementos);

  // Generar números de página a mostrar
  const generarNumerosPagina = (): number[] => {
    const numeros: number[] = [];
    const rango = 2; // Mostrar 2 páginas a cada lado de la actual

    // Calcular inicio y fin del rango
    let inicio = Math.max(1, paginaActual - rango);
    let fin = Math.min(totalPaginas, paginaActual + rango);

    // Ajustar si estamos cerca del inicio o fin
    if (paginaActual <= rango + 1) {
      fin = Math.min(totalPaginas, rango * 2 + 1);
    }
    if (paginaActual >= totalPaginas - rango) {
      inicio = Math.max(1, totalPaginas - rango * 2);
    }

    for (let i = inicio; i <= fin; i++) {
      numeros.push(i);
    }

    return numeros;
  };

  const numerosPagina = generarNumerosPagina();
  const puedeRetroceder = paginaActual > 1;
  const puedeAvanzar = paginaActual < totalPaginas;

  // Estilos base para botones
  const estilosBotonBase = `
    flex items-center justify-center p-2 border border-white/20 rounded-lg 
    transition-all duration-200 min-w-[40px] h-[40px]
  `;

  const estilosBotonInactivo = `
    ${estilosBotonBase}
    bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/80
  `;

  const estilosBotonDeshabilitado = `
    ${estilosBotonBase}
    bg-white/5 border-white/10 text-white/30 cursor-not-allowed
  `;

  const estilosBotonNumero = `
    ${estilosBotonBase}
    bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-medium
  `;

  const estilosBotonNumeroActual = `
    ${estilosBotonBase}
    bg-[#B695BF]/20 border-[#B695BF]/40 text-[#B695BF] font-semibold cursor-default
  `;

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      
      {/* Información de elementos */}
      {mostrarInfo && (
        <div className="flex items-center justify-between text-sm text-white/60">
          <span>
            Mostrando <span className="font-medium text-white/80">{elementoInicio}</span> a{' '}
            <span className="font-medium text-white/80">{elementoFin}</span> de{' '}
            <span className="font-medium text-white/80">{totalElementos}</span> resultados
          </span>
          <span className="text-white/40">
            Página {paginaActual} de {totalPaginas}
          </span>
        </div>
      )}

      {/* Controles de paginación */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        
        {/* Botón primera página */}
        {mostrarBotonesExtremidades && (
          <button
            onClick={() => onCambioPagina(1)}
            disabled={!puedeRetroceder}
            className={puedeRetroceder ? estilosBotonInactivo : estilosBotonDeshabilitado}
            title="Primera página"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
        )}

        {/* Botón página anterior */}
        <button
          onClick={() => onCambioPagina(paginaActual - 1)}
          disabled={!puedeRetroceder}
          className={puedeRetroceder ? estilosBotonInactivo : estilosBotonDeshabilitado}
          title="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Números de página */}
        {numerosPagina.map((numero) => (
          <button
            key={numero}
            onClick={() => onCambioPagina(numero)}
            className={
              numero === paginaActual ? estilosBotonNumeroActual : estilosBotonNumero
            }
          >
            {numero}
          </button>
        ))}

        {/* Botón página siguiente */}
        <button
          onClick={() => onCambioPagina(paginaActual + 1)}
          disabled={!puedeAvanzar}
          className={puedeAvanzar ? estilosBotonInactivo : estilosBotonDeshabilitado}
          title="Página siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Botón última página */}
        {mostrarBotonesExtremidades && (
          <button
            onClick={() => onCambioPagina(totalPaginas)}
            disabled={!puedeAvanzar}
            className={puedeAvanzar ? estilosBotonInactivo : estilosBotonDeshabilitado}
            title="Última página"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Paginacion;