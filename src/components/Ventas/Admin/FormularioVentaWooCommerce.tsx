import { useState, useEffect } from "react";
import { Save, X, Plus, Trash2, AlertTriangle, Package, DollarSign, Calendar, Building2 } from "lucide-react";
import { toast } from "react-toastify";
import { createVenta, updateVenta, existeVenta } from "@/services/woocommerce/wooService";
import { formatearMonedaArg, formatearNumeroArg, esPeriodoValido } from "@/utils/ventas/ventasUtils";
import type { VentaWooCommerce, CreateVentaWooCommerce, UpdateVentaWooCommerce } from "@/types/woocommerce/wooTypes";
import { TIENDAS_WOOCOMMERCE, MESES, AÑOS_DISPONIBLES } from "@/types/woocommerce/wooTypes";

interface FormularioVentaWooCommerceProps {
  modo: 'crear' | 'editar';
  ventaExistente?: VentaWooCommerce;
  mesInicial?: number;
  añoInicial?: number;
  onExito: () => void;
  onCancelar: () => void;
}

export default function FormularioVentaWooCommerce({
  modo,
  ventaExistente,
  mesInicial,
  añoInicial,
  onExito,
  onCancelar
}: FormularioVentaWooCommerceProps) {
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    tienda: ventaExistente?.tienda || 'MONTELLA',
    mes: ventaExistente?.mes || mesInicial || new Date().getMonth() + 1,
    año: ventaExistente?.año || añoInicial || new Date().getFullYear(),
    montoFacturado: ventaExistente?.montoFacturado || 0,
    unidadesVendidas: ventaExistente?.unidadesVendidas || 0,
    topProductos: ventaExistente?.topProductos || [],
    topCategorias: ventaExistente?.topCategorias || []
  });

  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [existeDuplicado, setExisteDuplicado] = useState(false);

  // Estados para agregar productos/categorías
  const [nuevoProducto, setNuevoProducto] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState('');

  // Verificar duplicados al cambiar tienda, mes o año (solo en modo crear)
  useEffect(() => {
    if (modo === 'crear') {
      verificarDuplicado();
    }
  }, [formData.tienda, formData.mes, formData.año, modo]);

  const verificarDuplicado = async () => {
    if (!esPeriodoValido(formData.mes, formData.año)) return;
    
    try {
      const existe = await existeVenta(formData.tienda, formData.mes, formData.año);
      setExisteDuplicado(existe);
    } catch (error) {
      console.warn("Error verificando duplicado:", error);
    }
  };

  // Validaciones
  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (!formData.tienda.trim()) {
      nuevosErrores.tienda = "La tienda es requerida";
    }

    if (!esPeriodoValido(formData.mes, formData.año)) {
      nuevosErrores.periodo = "Período inválido";
    }

    if (formData.montoFacturado < 0) {
      nuevosErrores.montoFacturado = "El monto no puede ser negativo";
    }

    if (formData.unidadesVendidas < 0) {
      nuevosErrores.unidadesVendidas = "Las unidades no pueden ser negativas";
    }

    if (modo === 'crear' && existeDuplicado) {
      nuevosErrores.duplicado = "Ya existe un registro para esta tienda y período";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Handlers para productos y categorías
  const agregarProducto = () => {
    if (nuevoProducto.trim() && !formData.topProductos.includes(nuevoProducto.trim())) {
      setFormData(prev => ({
        ...prev,
        topProductos: [...prev.topProductos, nuevoProducto.trim()]
      }));
      setNuevoProducto('');
    }
  };

  const eliminarProducto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      topProductos: prev.topProductos.filter((_, i) => i !== index)
    }));
  };

  const agregarCategoria = () => {
    if (nuevaCategoria.trim() && !formData.topCategorias.includes(nuevaCategoria.trim())) {
      setFormData(prev => ({
        ...prev,
        topCategorias: [...prev.topCategorias, nuevaCategoria.trim()]
      }));
      setNuevaCategoria('');
    }
  };

  const eliminarCategoria = (index: number) => {
    setFormData(prev => ({
      ...prev,
      topCategorias: prev.topCategorias.filter((_, i) => i !== index)
    }));
  };

  // Submit del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      toast.error("Por favor corrige los errores en el formulario");
      return;
    }

    setLoading(true);
    
    try {
      if (modo === 'crear') {
        const nuevaVenta: CreateVentaWooCommerce = {
          tienda: formData.tienda,
          mes: formData.mes,
          año: formData.año,
          montoFacturado: formData.montoFacturado,
          unidadesVendidas: formData.unidadesVendidas,
          topProductos: formData.topProductos,
          topCategorias: formData.topCategorias
        };
        
        await createVenta(nuevaVenta);
        toast.success("✅ Venta creada exitosamente");
      } else {
        const ventaActualizada: UpdateVentaWooCommerce = {
          id: ventaExistente!.id,
          tienda: formData.tienda,
          mes: formData.mes,
          año: formData.año,
          montoFacturado: formData.montoFacturado,
          unidadesVendidas: formData.unidadesVendidas,
          topProductos: formData.topProductos,
          topCategorias: formData.topCategorias
        };
        
        await updateVenta(ventaActualizada);
        toast.success("✅ Venta actualizada exitosamente");
      }
      
      onExito();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar la venta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información básica */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tienda */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            <Building2 className="w-4 h-4 inline mr-2" />
            Tienda
          </label>
          <select
            value={formData.tienda}
            onChange={(e) => setFormData(prev => ({ ...prev, tienda: e.target.value }))}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#D94854]/50 focus:bg-white/15 transition-all"
            disabled={modo === 'editar'}
          >
            {TIENDAS_WOOCOMMERCE.map(tienda => (
              <option key={tienda} value={tienda} className="bg-[#212026] text-white">
                {tienda}
              </option>
            ))}
          </select>
          {errores.tienda && (
            <p className="text-[#D94854] text-xs mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {errores.tienda}
            </p>
          )}
        </div>

        {/* Período */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Período
          </label>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={formData.mes}
              onChange={(e) => setFormData(prev => ({ ...prev, mes: parseInt(e.target.value) }))}
              className="px-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#D94854]/50 focus:bg-white/15 transition-all"
              disabled={modo === 'editar'}
            >
              {MESES.map(mes => (
                <option key={mes.value} value={mes.value} className="bg-[#212026] text-white">
                  {mes.label}
                </option>
              ))}
            </select>
            <select
              value={formData.año}
              onChange={(e) => setFormData(prev => ({ ...prev, año: parseInt(e.target.value) }))}
              className="px-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#D94854]/50 focus:bg-white/15 transition-all"
              disabled={modo === 'editar'}
            >
              {AÑOS_DISPONIBLES.map(año => (
                <option key={año} value={año} className="bg-[#212026] text-white">
                  {año}
                </option>
              ))}
            </select>
          </div>
          {errores.periodo && (
            <p className="text-[#D94854] text-xs mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {errores.periodo}
            </p>
          )}
          {existeDuplicado && modo === 'crear' && (
            <p className="text-[#D94854] text-xs mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Ya existe un registro para este período
            </p>
          )}
        </div>
      </div>

      {/* Métricas de ventas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monto facturado */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            <DollarSign className="w-4 h-4 inline mr-2" />
            Monto Facturado
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.montoFacturado}
            onChange={(e) => setFormData(prev => ({ ...prev, montoFacturado: parseFloat(e.target.value) || 0 }))}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#51590E]/50 focus:bg-white/15 transition-all"
            placeholder="0.00"
          />
          {formData.montoFacturado > 0 && (
            <p className="text-[#51590E] text-xs mt-1">
              💰 {formatearMonedaArg(formData.montoFacturado)}
            </p>
          )}
          {errores.montoFacturado && (
            <p className="text-[#D94854] text-xs mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {errores.montoFacturado}
            </p>
          )}
        </div>

        {/* Unidades vendidas */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            <Package className="w-4 h-4 inline mr-2" />
            Unidades Vendidas
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={formData.unidadesVendidas}
            onChange={(e) => setFormData(prev => ({ ...prev, unidadesVendidas: parseInt(e.target.value) || 0 }))}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#D94854]/50 focus:bg-white/15 transition-all"
            placeholder="0"
          />
          {formData.unidadesVendidas > 0 && (
            <p className="text-[#D94854] text-xs mt-1">
              📦 {formatearNumeroArg(formData.unidadesVendidas)} unidades
            </p>
          )}
          {errores.unidadesVendidas && (
            <p className="text-[#D94854] text-xs mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {errores.unidadesVendidas}
            </p>
          )}
        </div>
      </div>

      {/* Ticket promedio (calculado) */}
      {formData.montoFacturado > 0 && formData.unidadesVendidas > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-white/80">
            <span>💡 Ticket Promedio:</span>
            <span className="font-bold text-[#B695BF]">
              {formatearMonedaArg(formData.montoFacturado / formData.unidadesVendidas)}
            </span>
          </div>
        </div>
      )}

      {/* Top productos */}
      <div>
        <label className="block text-sm font-medium text-white/80 mb-3">
          📦 Top Productos (opcional)
        </label>
        
        {/* Lista de productos */}
        <div className="space-y-2 mb-3">
          {formData.topProductos.map((producto, index) => (
            <div key={index} className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg p-3">
              <span className="flex-1 text-white text-sm">{producto}</span>
              <button
                type="button"
                onClick={() => eliminarProducto(index)}
                className="p-1 text-[#D94854] hover:bg-[#D94854]/20 rounded transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Agregar producto */}
        <div className="flex gap-2">
          <input
            type="text"
            value={nuevoProducto}
            onChange={(e) => setNuevoProducto(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarProducto())}
            className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#D94854]/50 focus:bg-white/15 transition-all"
            placeholder="Nombre del producto"
          />
          <button
            type="button"
            onClick={agregarProducto}
            disabled={!nuevoProducto.trim()}
            className="px-4 py-2 bg-[#D94854]/20 hover:bg-[#D94854]/30 border border-[#D94854]/30 text-[#D94854] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top categorías */}
      <div>
        <label className="block text-sm font-medium text-white/80 mb-3">
          🎨 Top Categorías (opcional)
        </label>
        
        {/* Lista de categorías */}
        <div className="space-y-2 mb-3">
          {formData.topCategorias.map((categoria, index) => (
            <div key={index} className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg p-3">
              <span className="flex-1 text-white text-sm">{categoria}</span>
              <button
                type="button"
                onClick={() => eliminarCategoria(index)}
                className="p-1 text-[#D94854] hover:bg-[#D94854]/20 rounded transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Agregar categoría */}
        <div className="flex gap-2">
          <input
            type="text"
            value={nuevaCategoria}
            onChange={(e) => setNuevaCategoria(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarCategoria())}
            className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#B695BF]/50 focus:bg-white/15 transition-all"
            placeholder="Nombre de la categoría"
          />
          <button
            type="button"
            onClick={agregarCategoria}
            disabled={!nuevaCategoria.trim()}
            className="px-4 py-2 bg-[#B695BF]/20 hover:bg-[#B695BF]/30 border border-[#B695BF]/30 text-[#B695BF] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
        <button
          type="button"
          onClick={onCancelar}
          disabled={loading}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Cancelar
        </button>
        
        <button
          type="submit"
          disabled={loading || (modo === 'crear' && existeDuplicado) || Object.keys(errores).length > 0}
          className="px-6 py-3 bg-[#51590E]/20 hover:bg-[#51590E]/30 border border-[#51590E]/30 text-[#51590E] rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-[#51590E]/30 border-t-[#51590E] rounded-full animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {modo === 'crear' ? 'Crear Venta' : 'Actualizar Venta'}
            </>
          )}
        </button>
      </div>

      {/* Información adicional */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm">
          <div className="flex items-center gap-4 text-white/60">
            <span>📋 Modo: <span className="text-white font-medium">{modo === 'crear' ? 'Creación' : 'Edición'}</span></span>
            {ventaExistente && (
              <span>🆔 ID: <span className="text-white font-medium">{ventaExistente.id}</span></span>
            )}
          </div>
          <div className="flex items-center gap-2 text-white/50 text-xs">
            <span>💡 Los campos de productos y categorías son opcionales</span>
          </div>
        </div>
      </div>
    </form>
  );
}