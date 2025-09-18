import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Package, 
  RotateCcw,
  X,
} from 'lucide-react';
import { 
  type DevolucionesMercadoLibreFiltros as FiltrosType,
} from '@/types/cambios/devolucionesMercadoLibreTypes';

interface DevolucionesMercadoLibreFiltrosProps {
  filtros: FiltrosType;
  onFiltrosChange: (filtros: FiltrosType) => void;
  totalDevoluciones: number;
  devolucionesFiltradas: number;
  cargando?: boolean;
}


export const DevolucionesMercadoLibreFiltros: React.FC<DevolucionesMercadoLibreFiltrosProps> = ({
  filtros,
  onFiltrosChange,
  totalDevoluciones,
  devolucionesFiltradas,
  cargando = false
}) => {
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);
  const [filtrosLocales, setFiltrosLocales] = useState<FiltrosType>(filtros);

  useEffect(() => {
    setFiltrosLocales(filtros);
  }, [filtros]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFiltrosChange(filtrosLocales);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filtrosLocales]); 

  const handleFiltroChange = (campo: keyof FiltrosType, valor: any) => {
    setFiltrosLocales(prev => ({
      ...prev,
      [campo]: valor === '' || valor === 'todos' ? undefined : valor
    }));
  };

  const limpiarFiltros = () => {
    const filtrosVacios: FiltrosType = {};
    setFiltrosLocales(filtrosVacios);
    onFiltrosChange(filtrosVacios);
    setMostrarFiltrosAvanzados(false);
  };

  const hayFiltrosActivos = Object.values(filtrosLocales).some(valor => 
    valor !== undefined && valor !== '' && valor !== 'todos'
  );

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
      
      {/* Header con búsqueda principal */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between gap-4">
          
          {/* Búsqueda principal */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={filtrosLocales.pedido || ''}
                onChange={(e) => handleFiltroChange('pedido', e.target.value)}
                placeholder="Buscar por número de pedido..."
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#B695BF] transition-all"
                disabled={cargando}
              />
            </div>
          </div>

          {/* Controles */}
          <div className="flex items-center gap-3">
            
            {/* Botón filtros avanzados */}
            <button
              onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
              className={`
                flex items-center gap-2 px-4 py-2 border rounded-lg transition-all
                ${mostrarFiltrosAvanzados || hayFiltrosActivos
                  ? 'bg-[#B695BF]/20 border-[#B695BF]/30 text-[#B695BF]'
                  : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/15'
                }
              `}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filtros</span>
              {hayFiltrosActivos && (
                <span className="w-2 h-2 bg-[#B695BF] rounded-full"></span>
              )}
            </button>

            {/* Botón limpiar */}
            {hayFiltrosActivos && (
              <button
                onClick={limpiarFiltros}
                className="flex items-center gap-2 px-4 py-2 bg-[#B695BF]/20 border border-[#B695BF]/30 rounded-lg text-[#B695BF] hover:bg-[#B695BF]/30 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Limpiar</span>
              </button>
            )}
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center gap-4 text-sm text-white/70">
            <span>
              🛒 Mostrando <strong className="text-white">{devolucionesFiltradas}</strong> de{' '}
              <strong className="text-white">{totalDevoluciones}</strong> devoluciones ML
            </span>
            {hayFiltrosActivos && (
              <span className="text-[#B695BF]">
                🔍 Filtros activos
              </span>
            )}
          </div>
          
          {cargando && (
            <div className="flex items-center gap-2 text-[#B695BF] text-sm">
              <div className="w-4 h-4 border-2 border-[#B695BF]/30 border-t-[#B695BF] rounded-full animate-spin"></div>
              <span>Aplicando filtros...</span>
            </div>
          )}
        </div>
      </div>

      {/* Filtros avanzados */}
      {mostrarFiltrosAvanzados && (
        <div className="p-4 bg-white/5 border-t border-white/10">
          <div className="space-y-4">
            
            {/* Fila 1: Cliente, Modelo, Año, Mes */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Cliente */}
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Cliente</label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={filtrosLocales.cliente || ''}
                    onChange={(e) => handleFiltroChange('cliente', e.target.value)}
                    placeholder="Buscar por cliente..."
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#B695BF] transition-all text-sm"
                    disabled={cargando}
                  />
                </div>
              </div>

              {/* Modelo */}
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Modelo</label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={filtrosLocales.modelo || ''}
                    onChange={(e) => handleFiltroChange('modelo', e.target.value)}
                    placeholder="Buscar por modelo..."
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#B695BF] transition-all text-sm"
                    disabled={cargando}
                  />
                </div>
              </div>

            </div>

            {/* Chips de filtros activos */}
            {hayFiltrosActivos && (
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-white/60">Filtros activos:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(filtrosLocales).map(([key, value]) => {
                    if (!value || value === 'todos' || value === '') return null;
                    
                    let label = '';
                    let displayValue = '';
                    
                    switch (key) {
                      case 'cliente':
                        label = 'Cliente';
                        displayValue = value;
                        break;
                      case 'modelo':
                        label = 'Modelo';
                        displayValue = value;
                        break;
                      case 'pedido':
                        label = 'Pedido';
                        displayValue = value;
                        break;  
                      default:
                        return null;
                    }

                    return (
                      <div
                        key={key}
                        className="flex items-center gap-1 px-2 py-1 bg-[#B695BF]/20 border border-[#B695BF]/30 rounded text-[#B695BF] text-xs"
                      >
                        <span>{label}: {displayValue}</span>
                        <button
                          onClick={() => handleFiltroChange(key as keyof FiltrosType, undefined)}
                          className="hover:bg-[#B695BF]/30 rounded p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DevolucionesMercadoLibreFiltros;