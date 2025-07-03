import React, { useState, useEffect } from 'react';
import { Plus, X, Package } from 'lucide-react';

interface MultiProductInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
}

/**
 * Componente para manejar múltiples productos como chips
 * Internamente maneja array, externamente expone string concatenado
 */
export const MultiProductInput: React.FC<MultiProductInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  required = false
}) => {
  const [productos, setProductos] = useState<string[]>([]);
  const [inputActual, setInputActual] = useState('');

  // Convertir string a array al cargar
  useEffect(() => {
    if (value && value.trim()) {
      const productosArray = value.split(' | ').filter(p => p.trim());
      setProductos(productosArray);
    } else {
      setProductos([]);
    }
  }, [value]);

  // Convertir array a string y notificar cambio
  const actualizarProductos = (nuevosProductos: string[]) => {
    setProductos(nuevosProductos);
    const stringConcatenado = nuevosProductos.join(' | ');
    onChange(stringConcatenado);
  };

  // Agregar producto
  const agregarProducto = () => {
    const producto = inputActual.trim();
    if (!producto) return;
    
    // Evitar duplicados
    if (productos.includes(producto)) {
      setInputActual('');
      return;
    }

    const nuevosProductos = [...productos, producto];
    actualizarProductos(nuevosProductos);
    setInputActual('');
  };

  // Eliminar producto
  const eliminarProducto = (index: number) => {
    const nuevosProductos = productos.filter((_, i) => i !== index);
    actualizarProductos(nuevosProductos);
  };

  // Manejar Enter en el input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      agregarProducto();
    }
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="block text-sm font-medium text-white/80">
        {label}
        {required && <span className="text-[#D94854] ml-1">*</span>}
      </label>

      {/* Input para agregar productos */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={inputActual}
            onChange={(e) => setInputActual(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={productos.length === 0 ? placeholder : "Agregar otro producto..."}
            disabled={disabled}
            className={`
              w-full pl-10 pr-4 py-2 bg-white/10 border rounded-lg text-white placeholder-white/50 transition-all
              ${error ? 'border-[#D94854]' : 'border-white/20 focus:border-[#B695BF]'}
              disabled:opacity-50
            `}
          />
        </div>
        <button
          type="button"
          onClick={agregarProducto}
          disabled={disabled || !inputActual.trim()}
          className="px-3 py-2 bg-[#B695BF]/20 border border-[#B695BF]/30 rounded-lg text-[#B695BF] hover:bg-[#B695BF]/30 transition-all disabled:opacity-50"
          title="Agregar producto"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Lista de productos como chips */}
      {productos.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-white/60">
            Productos agregados ({productos.length}):
          </div>
          <div className="flex flex-wrap gap-2">
            {productos.map((producto, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1 bg-[#B695BF]/20 border border-[#B695BF]/30 rounded-lg text-[#B695BF] text-sm"
              >
                <Package className="w-3 h-3" />
                <span>{producto}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => eliminarProducto(index)}
                    className="hover:bg-[#B695BF]/20 rounded p-0.5 transition-colors"
                    title="Eliminar producto"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-[#D94854] flex items-center gap-1">
          <Package className="w-3 h-3" />
          {error}
        </p>
      )}

      {/* Ayuda */}
      <p className="text-xs text-white/50">
        💡 Escribe un producto y presiona Enter o el botón + para agregarlo
      </p>
    </div>
  );
};