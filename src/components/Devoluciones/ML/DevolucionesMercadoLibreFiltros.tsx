import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, 
  Filter, 
  Calendar, 
  Package, 
  RotateCcw,
  ChevronDown,
  X,
  FileText
} from 'lucide-react';
import { 
  type DevolucionesMercadoLibreFiltros as FiltrosType,
  LABELS_FILTRO_NOTA_CREDITO,
  COLORES_NOTA_CREDITO,
  obtenerOpcionesAño,
  OPCIONES_MES
} from '@/types/cambios/devolucionesMercadoLibreTypes';

interface DevolucionesMercadoLibreFiltrosProps {
  filtros: FiltrosType;
  onFiltrosChange: (filtros: FiltrosType) => void;
  totalDevoluciones: number;
  devolucionesFiltradas: number;
  cargando?: boolean;
}

/**
 * Componente de filtro desplegable
 */
const FilterDropdown: React.FC<{
  label: string;
  value: string | number | undefined;
  onChange: (value: any) => void;
  options: Array<{ value: any; label: string; color?: string }>;
  placeholder: string;
  icon: React.ReactNode;
}> = ({ label, value, onChange, options, placeholder, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number; openUp: boolean } | null>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const openUp = spaceBelow < 250 && spaceAbove > 200;
      
      setDropdownPosition({
        top: openUp ? rect.top - 10 : rect.bottom + 10,
        left: rect.left,
        width: rect.width,
        openUp
      });
    } else {
      setDropdownPosition(null);
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setDropdownPosition(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <label className="block text-xs font-medium text-white/60 mb-1">{label}</label>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm hover:bg-white/15 transition-all"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className={selectedOption ? 'text-white' : 'text-white/50'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && dropdownPosition && createPortal(
        <div 
          className={`
            fixed bg-[#212026] border border-white/20 rounded-lg shadow-2xl z-[9999] overflow-y-auto
          `}
          style={{ 
            top: dropdownPosition.openUp ? 'auto' : dropdownPosition.top,
            bottom: dropdownPosition.openUp ? window.innerHeight - dropdownPosition.top : 'auto',
            left: dropdownPosition.left,
            width: Math.max(dropdownPosition.width, 200),
            maxHeight: '240px'
          }}
          onWheel={(e) => e.stopPropagation()}
        >
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
                setDropdownPosition(null);
              }}
              className={`
                w-full text-left px-3 py-2 text-sm transition-colors
                ${value === option.value ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10'}
              `}
            >
              <div className="flex items-center gap-2">
                {option.color && (
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: option.color }}
                  />
                )}
                {option.label}
              </div>
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};

/**
 * Componente principal de filtros de devoluciones de MercadoLibre
 */
export const DevolucionesMercadoLibreFiltros: React.FC<DevolucionesMercadoLibreFiltrosProps> = ({
  filtros,
  onFiltrosChange,
  totalDevoluciones,
  devolucionesFiltradas,
  cargando = false
}) => {
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);
  const [filtrosLocales, setFiltrosLocales] = useState<FiltrosType>(filtros);

  // Sincronizar con props
  useEffect(() => {
    setFiltrosLocales(filtros);
  }, [filtros]);

  // Actualizar filtros con debounce para campos de texto
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFiltrosChange(filtrosLocales);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filtrosLocales, onFiltrosChange]);

  // Manejar cambio de filtro
  const handleFiltroChange = (campo: keyof FiltrosType, valor: any) => {
    setFiltrosLocales(prev => ({
      ...prev,
      [campo]: valor === '' || valor === 'todos' ? undefined : valor
    }));
  };

  // Limpiar todos los filtros
  const limpiarFiltros = () => {
    const filtrosVacios: FiltrosType = {};
    setFiltrosLocales(filtrosVacios);
    onFiltrosChange(filtrosVacios);
    setMostrarFiltrosAvanzados(false);
  };

  // Verificar si hay filtros activos
  const hayFiltrosActivos = Object.values(filtrosLocales).some(valor => 
    valor !== undefined && valor !== '' && valor !== 'todos'
  );

  // Opciones para el dropdown de año
  const opcionesAño = [
    { value: undefined, label: 'Todos los años' },
    ...obtenerOpcionesAño().map(opt => ({ value: opt.value, label: opt.label }))
  ];

  // Opciones para el dropdown de mes
  const opcionesMes = [
    { value: undefined, label: 'Todos los meses' },
    ...OPCIONES_MES.map(opt => ({ value: opt.value, label: opt.label }))
  ];

  // Opciones para el dropdown de nota de crédito
  const opcionesNotaCredito = [
    { value: undefined, label: LABELS_FILTRO_NOTA_CREDITO.todos },
    { value: true, label: LABELS_FILTRO_NOTA_CREDITO.emitidas, color: COLORES_NOTA_CREDITO.emitida },
    { value: false, label: LABELS_FILTRO_NOTA_CREDITO.pendientes, color: COLORES_NOTA_CREDITO.pendiente }
  ];

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
                placeholder="Buscar por número de pedido........"
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
            
            {/* Fila 1: Modelo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
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

              {/* Año */}
              <FilterDropdown
                label="Año"
                value={filtrosLocales.año}
                onChange={(value) => handleFiltroChange('año', value)}
                options={opcionesAño}
                placeholder="Seleccionar año"
                icon={<Calendar className="w-4 h-4 text-white/40" />}
              />

              {/* Mes */}
              <FilterDropdown
                label="Mes"
                value={filtrosLocales.mes}
                onChange={(value) => handleFiltroChange('mes', value)}
                options={opcionesMes}
                placeholder="Seleccionar mes"
                icon={<Calendar className="w-4 h-4 text-white/40" />}
              />
            </div>

            {/* Fila 2: Estado de Nota de Crédito */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Estado de Nota de Crédito */}
              <FilterDropdown
                label="Estado de Nota de Crédito"
                value={filtrosLocales.notaCreditoEmitida ? 'true' : 'false'}
                onChange={(value) => handleFiltroChange('notaCreditoEmitida', value)}
                options={opcionesNotaCredito}
                placeholder="Seleccionar estado"
                icon={<FileText className="w-4 h-4 text-white/40" />}
              />

              {/* Espacio vacío para mantener el diseño */}
              <div></div>
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
                      case 'año':
                        label = 'Año';
                        displayValue = value.toString();
                        break;
                      case 'mes':
                        label = 'Mes';
                        displayValue = OPCIONES_MES.find(m => m.value === value)?.label || value.toString();
                        break;
                      case 'notaCreditoEmitida':
                        label = 'Nota de Crédito';
                        displayValue = value ? 'Emitida' : 'Pendiente';
                        break;
                      default:
                        return null;
                    }

                    return (
                      <div
                        key={key}
                        className="flex items-center gap-2 px-3 py-1 bg-[#B695BF]/20 border border-[#B695BF]/30 rounded-lg text-[#B695BF] text-xs"
                      >
                        <span>
                          <strong>{label}:</strong> {displayValue}
                        </span>
                        <button
                          onClick={() => handleFiltroChange(key as keyof FiltrosType, undefined)}
                          className="hover:bg-[#B695BF]/20 rounded p-0.5 transition-colors"
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