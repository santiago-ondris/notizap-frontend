import React, { useState } from 'react';
import * as Select from '@radix-ui/react-select';
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Phone, 
  FileText, 
  RotateCcw,
  ChevronDown,
  X,
  Check
} from 'lucide-react';
import { 
  type CambiosFiltros as FiltrosType,
  type EstadoCambioFiltro,
  MOTIVOS_CAMBIO,
  LABELS_ESTADO,
  COLORES_ESTADO
} from '@/types/cambios/cambiosTypes';

interface CambiosFiltrosProps {
  filtros: FiltrosType;
  onFiltrosChange: (filtros: FiltrosType) => void;
  totalCambios: number;
  cambiosFiltrados: number;
  cargando?: boolean;
}

const RadixDropdown: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; color?: string }>;
  placeholder: string;
  icon: React.ReactNode;
}> = ({ label, value, onChange, options, placeholder, icon }) => {
  
  const safeValue = value || options[0]?.value || 'todos';

  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-white/60">{label}</label>
      
      <Select.Root value={safeValue} onValueChange={onChange}>
        <Select.Trigger className="w-full flex items-center justify-between px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm hover:bg-white/15 transition-all focus:outline-none focus:border-[#B695BF] data-[state=open]:border-[#B695BF]">
          <div className="flex items-center gap-2">
            {icon}
            <Select.Value placeholder={placeholder} />
          </div>
          <Select.Icon>
            <ChevronDown className="w-4 h-4" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content 
            className="bg-[#212026] border border-white/20 rounded-lg shadow-2xl z-[9999] overflow-hidden"
            position="popper"
            sideOffset={4}
          >
            <Select.ScrollUpButton className="flex items-center justify-center h-6 bg-[#212026] text-white cursor-default">
              <ChevronDown className="w-4 h-4 rotate-180" />
            </Select.ScrollUpButton>
            
            <Select.Viewport className="p-1 max-h-60">
              {options.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  className="relative flex items-center px-3 py-2 text-sm text-white/80 cursor-pointer hover:bg-white/10 focus:bg-white/15 focus:outline-none rounded data-[state=checked]:bg-white/20 data-[state=checked]:text-white"
                >
                  <div className="flex items-center gap-2 flex-1">
                    {option.color && (
                      <div 
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: option.color }}
                      />
                    )}
                    <Select.ItemText>{option.label}</Select.ItemText>
                  </div>
                  <Select.ItemIndicator className="ml-2">
                    <Check className="w-4 h-4 text-[#B695BF]" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
            
            <Select.ScrollDownButton className="flex items-center justify-center h-6 bg-[#212026] text-white cursor-default">
              <ChevronDown className="w-4 h-4" />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
};

export const CambiosFiltros: React.FC<CambiosFiltrosProps> = ({
  filtros,
  onFiltrosChange,
  totalCambios,
  cambiosFiltrados,
  cargando = false
}) => {
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);

  // Manejar cambio de filtro
  const handleFiltroChange = (campo: keyof FiltrosType, valor: any) => {
    
    const nuevosFiltros = {
      ...filtros,
      [campo]: valor === '' || valor === 'todos' || valor === 'todos_motivos' ? undefined : valor
    };
    
    onFiltrosChange(nuevosFiltros);
  };

  // Limpiar todos los filtros
  const limpiarFiltros = () => {
    onFiltrosChange({});
    setMostrarFiltrosAvanzados(false);
  };

  const hayFiltrosActivos = Object.values(filtros).some(valor => 
    valor !== undefined && valor !== '' && valor !== 'todos'
  );

  const opcionesEstado: Array<{ value: string; label: string; color?: string }> = [
    { value: 'todos', label: LABELS_ESTADO.todos },
    { value: 'pendiente_llegada', label: LABELS_ESTADO.pendiente_llegada, color: COLORES_ESTADO.pendiente_llegada },
    { value: 'listo_envio', label: LABELS_ESTADO.listo_envio, color: COLORES_ESTADO.listo_envio },
    { value: 'enviado', label: LABELS_ESTADO.enviado, color: COLORES_ESTADO.enviado },
    { value: 'completado', label: LABELS_ESTADO.completado, color: COLORES_ESTADO.completado },
    { value: 'sin_registrar', label: LABELS_ESTADO.sin_registrar, color: COLORES_ESTADO.sin_registrar }
  ];

  const opcionesMotivo = [
    { value: 'todos_motivos', label: 'Todos los motivos' }, // Cambié de '' a 'todos_motivos'
    ...MOTIVOS_CAMBIO.map(motivo => ({ value: motivo, label: motivo }))
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
                value={filtros.pedido || ''}
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
                className="flex items-center gap-2 px-4 py-2 bg-[#D94854]/20 border border-[#D94854]/30 rounded-lg text-[#D94854] hover:bg-[#D94854]/30 transition-all"
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
              📋 Mostrando <strong className="text-white">{cambiosFiltrados}</strong> de{' '}
              <strong className="text-white">{totalCambios}</strong> cambios
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
            
            {/* Fila 1: Búsquedas de texto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Cliente */}
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Cliente</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={filtros.nombre || ''}
                    onChange={(e) => handleFiltroChange('nombre', e.target.value)}
                    placeholder="Buscar por nombre..."
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#B695BF] transition-all text-sm"
                    disabled={cargando}
                  />
                </div>
              </div>

              {/* Celular */}
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Celular</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={filtros.celular || ''}
                    onChange={(e) => handleFiltroChange('celular', e.target.value)}
                    placeholder="Buscar por celular..."
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#B695BF] transition-all text-sm"
                    disabled={cargando}
                  />
                </div>
              </div>
            </div>

            {/* Fila 2: Dropdowns con Radix UI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Estado del Cambio */}
              <RadixDropdown
                label="Estado del Cambio"
                value={filtros.estado || 'todos'}
                onChange={(value) => handleFiltroChange('estado', value)}
                options={opcionesEstado}
                placeholder="Seleccionar estado"
                icon={<Filter className="w-4 h-4 text-white/40" />}
              />

              {/* Motivo del Cambio */}
              <RadixDropdown
                label="Motivo del Cambio"
                value={filtros.motivo || 'todos_motivos'}
                onChange={(value) => handleFiltroChange('motivo', value === 'todos_motivos' ? '' : value)}
                options={opcionesMotivo}
                placeholder="Seleccionar motivo"
                icon={<FileText className="w-4 h-4 text-white/40" />}
              />
            </div>

            {/* Fila 3: Rango de fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Fecha desde */}
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Fecha desde</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="date"
                    value={filtros.fechaDesde || ''}
                    onChange={(e) => handleFiltroChange('fechaDesde', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#B695BF] transition-all text-sm"
                    disabled={cargando}
                  />
                </div>
              </div>

              {/* Fecha hasta */}
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Fecha hasta</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="date"
                    value={filtros.fechaHasta || ''}
                    onChange={(e) => handleFiltroChange('fechaHasta', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#B695BF] transition-all text-sm"
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
                  {Object.entries(filtros).map(([key, value]) => {
                    if (!value || value === 'todos' || value === '') return null;
                    
                    let label = '';
                    let displayValue = '';
                    
                    switch (key) {
                      case 'pedido':
                        label = 'Pedido';
                        displayValue = value;
                        break;
                      case 'nombre':
                        label = 'Cliente';
                        displayValue = value;
                        break;
                      case 'celular':
                        label = 'Celular';
                        displayValue = value;
                        break;
                      case 'estado':
                        label = 'Estado';
                        displayValue = LABELS_ESTADO[value as EstadoCambioFiltro];
                        break;
                      case 'motivo':
                        label = 'Motivo';
                        displayValue = value;
                        break;
                      case 'fechaDesde':
                        label = 'Desde';
                        displayValue = new Date(value).toLocaleDateString('es-AR');
                        break;
                      case 'fechaHasta':
                        label = 'Hasta';
                        displayValue = new Date(value).toLocaleDateString('es-AR');
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

export default CambiosFiltros;