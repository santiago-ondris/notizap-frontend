import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  X, 
  Search, 
  Calendar, 
  DollarSign, 
  Tag, 
  Star, 
  Repeat, 
  RotateCcw,
  ChevronDown
} from 'lucide-react';
import type { GastoFiltros } from '../../types/gastos';
import { CATEGORIAS_PREDEFINIDAS } from '../../types/gastos';

interface GastoFiltersProps {
  filtros: GastoFiltros;
  onFiltrosChange: (filtros: GastoFiltros) => void;
  categorias?: string[]; // Categorías dinámicas del backend
  isLoading?: boolean;
  totalResultados?: number;
}

export const GastoFilters: React.FC<GastoFiltersProps> = ({
  filtros,
  onFiltrosChange,
  categorias = [],
  isLoading = false,
  totalResultados = 0
}) => {
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [filtrosLocales, setFiltrosLocales] = useState<GastoFiltros>(filtros);

  // Sincronizar filtros locales cuando cambien los props
  useEffect(() => {
    setFiltrosLocales(filtros);
  }, [filtros]);

  // Contar filtros activos
  const filtrosActivos = Object.entries(filtros).filter(([key, value]) => {
    if (key === 'pagina' || key === 'tamañoPagina' || key === 'ordenarPor' || key === 'descendente') return false;
    return value !== undefined && value !== null && value !== '';
  }).length;

  // Todas las categorías disponibles (predefinidas + dinámicas)
  const todasCategorias = Array.from(new Set([...CATEGORIAS_PREDEFINIDAS, ...categorias])).sort();

  // Períodos rápidos predefinidos
  const periodosRapidos = [
    { label: '📅 Este mes', value: 'este-mes' },
    { label: '📅 Mes anterior', value: 'mes-anterior' },
    { label: '📅 Último trimestre', value: 'trimestre' },
    { label: '📅 Este año', value: 'año' }
  ];

  // Rangos de monto predefinidos
  const rangosMonto = [
    { label: '💰 Hasta $1,000', min: 0, max: 1000 },
    { label: '💰 $1,000 - $5,000', min: 1000, max: 5000 },
    { label: '💰 $5,000 - $20,000', min: 5000, max: 20000 },
    { label: '💰 Más de $20,000', min: 20000, max: undefined }
  ];

  // Manejar cambio de filtro
  const handleFiltroChange = (campo: keyof GastoFiltros, valor: any) => {
    const nuevosFiltros = {
      ...filtrosLocales,
      [campo]: valor,
      pagina: 1 // Reset página al cambiar filtros
    };
    
    setFiltrosLocales(nuevosFiltros);
    onFiltrosChange(nuevosFiltros);
  };

  // Aplicar período rápido
  const aplicarPeriodoRapido = (periodo: string) => {
    const hoy = new Date();
    let fechaDesde: string, fechaHasta: string;

    switch (periodo) {
      case 'este-mes':
        fechaDesde = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
        fechaHasta = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0];
        break;
      case 'mes-anterior':
        fechaDesde = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1).toISOString().split('T')[0];
        fechaHasta = new Date(hoy.getFullYear(), hoy.getMonth(), 0).toISOString().split('T')[0];
        break;
      case 'trimestre':
        const inicioTrimestre = new Date(hoy.getFullYear(), Math.floor(hoy.getMonth() / 3) * 3, 1);
        fechaDesde = inicioTrimestre.toISOString().split('T')[0];
        fechaHasta = hoy.toISOString().split('T')[0];
        break;
      case 'año':
        fechaDesde = new Date(hoy.getFullYear(), 0, 1).toISOString().split('T')[0];
        fechaHasta = hoy.toISOString().split('T')[0];
        break;
      default:
        return;
    }

    const nuevosFiltros = {
      ...filtrosLocales,
      fechaDesde,
      fechaHasta,
      pagina: 1
    };
    
    setFiltrosLocales(nuevosFiltros);
    onFiltrosChange(nuevosFiltros);
  };

  // Aplicar rango de monto
  const aplicarRangoMonto = (rango: { min: number; max?: number }) => {
    const nuevosFiltros = {
      ...filtrosLocales,
      montoMinimo: rango.min,
      montoMaximo: rango.max,
      pagina: 1
    };
    
    setFiltrosLocales(nuevosFiltros);
    onFiltrosChange(nuevosFiltros);
  };

  // Limpiar todos los filtros
  const limpiarFiltros = () => {
    const filtrosLimpios: GastoFiltros = {
      ordenarPor: 'Fecha',
      descendente: true,
      pagina: 1,
      tamañoPagina: filtros.tamañoPagina || 20
    };
    
    setFiltrosLocales(filtrosLimpios);
    onFiltrosChange(filtrosLimpios);
  };

  // Remover filtro específico
  const removerFiltro = (campo: keyof GastoFiltros) => {
    const nuevosFiltros = { ...filtrosLocales };
    delete nuevosFiltros[campo];
    nuevosFiltros.pagina = 1;
    
    setFiltrosLocales(nuevosFiltros);
    onFiltrosChange(nuevosFiltros);
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <Filter className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">🔍 Filtros de Búsqueda</h3>
            <p className="text-sm text-white/60">
              {totalResultados} resultado{totalResultados !== 1 ? 's' : ''} encontrado{totalResultados !== 1 ? 's' : ''}
              {filtrosActivos > 0 && ` • ${filtrosActivos} filtro${filtrosActivos !== 1 ? 's' : ''} activo${filtrosActivos !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {filtrosActivos > 0 && (
            <button
              onClick={limpiarFiltros}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Limpiar
            </button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-3 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <span className="text-sm">{isExpanded ? 'Menos' : 'Más'} filtros</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Búsqueda rápida */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
          <input
            type="text"
            value={filtrosLocales.busqueda || ''}
            onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
            placeholder="🔍 Buscar por nombre, descripción o proveedor..."
            className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Filtros rápidos (siempre visibles) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        
        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            🏷️ Categoría
          </label>
          <select
            value={filtrosLocales.categoria || ''}
            onChange={(e) => handleFiltroChange('categoria', e.target.value || undefined)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
            disabled={isLoading}
          >
            <option value="">Todas las categorías</option>
            {todasCategorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Período rápido */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            📅 Período
          </label>
          <select
            onChange={(e) => e.target.value && aplicarPeriodoRapido(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
            disabled={isLoading}
            value=""
          >
            <option value="">Seleccionar período</option>
            {periodosRapidos.map(periodo => (
              <option key={periodo.value} value={periodo.value}>{periodo.label}</option>
            ))}
          </select>
        </div>

        {/* Rango de monto */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            💰 Rango de Monto
          </label>
          <select
            onChange={(e) => {
              if (e.target.value) {
                const rango = rangosMonto.find(r => r.label === e.target.value);
                if (rango) aplicarRangoMonto(rango);
              }
            }}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
            disabled={isLoading}
            value=""
          >
            <option value="">Cualquier monto</option>
            {rangosMonto.map(rango => (
              <option key={rango.label} value={rango.label}>{rango.label}</option>
            ))}
          </select>
        </div>

        {/* Ordenamiento */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            📊 Ordenar por
          </label>
          <select
            value={`${filtrosLocales.ordenarPor || 'Fecha'}-${filtrosLocales.descendente ? 'desc' : 'asc'}`}
            onChange={(e) => {
              const [campo, orden] = e.target.value.split('-');
              handleFiltroChange('ordenarPor', campo);
              handleFiltroChange('descendente', orden === 'desc');
            }}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
            disabled={isLoading}
          >
            <option value="Fecha-desc">📅 Fecha (más reciente)</option>
            <option value="Fecha-asc">📅 Fecha (más antigua)</option>
            <option value="Monto-desc">💰 Monto (mayor a menor)</option>
            <option value="Monto-asc">💰 Monto (menor a mayor)</option>
            <option value="Nombre-asc">🔤 Nombre (A-Z)</option>
            <option value="Nombre-desc">🔤 Nombre (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Filtros expandidos */}
      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-white/10">
          
          {/* Rango de fechas personalizado */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-3">
              📅 Rango de Fechas Personalizado
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/60 mb-1">Desde</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                  <input
                    type="date"
                    value={filtrosLocales.fechaDesde || ''}
                    onChange={(e) => handleFiltroChange('fechaDesde', e.target.value || undefined)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Hasta</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                  <input
                    type="date"
                    value={filtrosLocales.fechaHasta || ''}
                    onChange={(e) => handleFiltroChange('fechaHasta', e.target.value || undefined)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rango de monto personalizado */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-3">
              💰 Rango de Monto Personalizado
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/60 mb-1">Monto mínimo</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={filtrosLocales.montoMinimo || ''}
                    onChange={(e) => handleFiltroChange('montoMinimo', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Monto máximo</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={filtrosLocales.montoMaximo || ''}
                    onChange={(e) => handleFiltroChange('montoMaximo', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="Sin límite"
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Filtros adicionales */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-3">
              ⚙️ Filtros Adicionales
            </label>
            <div className="flex flex-wrap gap-4">
              
              {/* Gastos importantes */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filtrosLocales.esImportante || false}
                  onChange={(e) => handleFiltroChange('esImportante', e.target.checked || undefined)}
                  className="w-4 h-4 text-yellow-400 bg-white/10 border border-white/20 rounded focus:ring-yellow-400 focus:ring-1"
                  disabled={isLoading}
                />
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-white/80">Solo gastos importantes</span>
              </label>

              {/* Gastos recurrentes */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filtrosLocales.esRecurrente || false}
                  onChange={(e) => handleFiltroChange('esRecurrente', e.target.checked || undefined)}
                  className="w-4 h-4 text-blue-400 bg-white/10 border border-white/20 rounded focus:ring-blue-400 focus:ring-1"
                  disabled={isLoading}
                />
                <Repeat className="w-4 h-4 text-blue-400" />
                <span className="text-white/80">Solo gastos recurrentes</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Chips de filtros activos */}
      {filtrosActivos > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-white/60" />
            <span className="text-sm font-medium text-white/80">Filtros activos:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {filtrosLocales.categoria && (
              <div className="flex items-center gap-1 bg-purple-500/20 border border-purple-500/30 rounded-lg px-3 py-1">
                <span className="text-sm text-purple-400">🏷️ {filtrosLocales.categoria}</span>
                <button
                  onClick={() => removerFiltro('categoria')}
                  className="text-purple-400 hover:text-purple-300"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {filtrosLocales.fechaDesde && (
              <div className="flex items-center gap-1 bg-blue-500/20 border border-blue-500/30 rounded-lg px-3 py-1">
                <span className="text-sm text-blue-400">📅 Desde {filtrosLocales.fechaDesde}</span>
                <button
                  onClick={() => removerFiltro('fechaDesde')}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {filtrosLocales.fechaHasta && (
              <div className="flex items-center gap-1 bg-blue-500/20 border border-blue-500/30 rounded-lg px-3 py-1">
                <span className="text-sm text-blue-400">📅 Hasta {filtrosLocales.fechaHasta}</span>
                <button
                  onClick={() => removerFiltro('fechaHasta')}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {filtrosLocales.montoMinimo && (
              <div className="flex items-center gap-1 bg-green-500/20 border border-green-500/30 rounded-lg px-3 py-1">
                <span className="text-sm text-green-400">💰 Min ${filtrosLocales.montoMinimo}</span>
                <button
                  onClick={() => removerFiltro('montoMinimo')}
                  className="text-green-400 hover:text-green-300"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {filtrosLocales.montoMaximo && (
              <div className="flex items-center gap-1 bg-green-500/20 border border-green-500/30 rounded-lg px-3 py-1">
                <span className="text-sm text-green-400">💰 Max ${filtrosLocales.montoMaximo}</span>
                <button
                  onClick={() => removerFiltro('montoMaximo')}
                  className="text-green-400 hover:text-green-300"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {filtrosLocales.esImportante && (
              <div className="flex items-center gap-1 bg-yellow-500/20 border border-yellow-500/30 rounded-lg px-3 py-1">
                <span className="text-sm text-yellow-400">⭐ Importantes</span>
                <button
                  onClick={() => removerFiltro('esImportante')}
                  className="text-yellow-400 hover:text-yellow-300"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {filtrosLocales.esRecurrente && (
              <div className="flex items-center gap-1 bg-blue-500/20 border border-blue-500/30 rounded-lg px-3 py-1">
                <span className="text-sm text-blue-400">🔄 Recurrentes</span>
                <button
                  onClick={() => removerFiltro('esRecurrente')}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {filtrosLocales.busqueda && (
              <div className="flex items-center gap-1 bg-gray-500/20 border border-gray-500/30 rounded-lg px-3 py-1">
                <span className="text-sm text-gray-400">🔍 "{filtrosLocales.busqueda}"</span>
                <button
                  onClick={() => removerFiltro('busqueda')}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};