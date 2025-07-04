import { useState, useEffect } from "react";
import { DollarSign, AlertCircle } from "lucide-react";
import { parsearMonto, formatearParaInput } from "@/services/woocommerce/comisionService";

interface InputMontoProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string | null;
  disabled?: boolean;
  required?: boolean;
  colorTematico?: string;
  emoji?: string;
  descripcion?: string;
}

export default function InputMonto({
  label,
  value,
  onChange,
  placeholder = "0",
  error,
  disabled = false,
  required = false,
  colorTematico = "#D94854",
  emoji = "💰",
  descripcion
}: InputMontoProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  // Sincronizar con prop value cuando cambie externamente
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setInputValue(rawValue);
    
    // Parsear y validar
    const numeroParseado = parsearMonto(rawValue);
    const valorFormateado = numeroParseado.toString();
    
    onChange(valorFormateado);
  };

  const handleBlur = () => {
    setIsFocused(false);
    
    // Formatear al perder el foco si hay un valor válido
    if (inputValue && inputValue.trim() !== '') {
      const numero = parsearMonto(inputValue);
      if (!isNaN(numero) && numero > 0) {
        const valorFormateado = formatearParaInput(numero);
        setInputValue(valorFormateado);
      }
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    
    // Al enfocar, mostrar valor sin formato para edición más fácil
    if (inputValue && inputValue.trim() !== '') {
      const numero = parsearMonto(inputValue);
      if (!isNaN(numero) && numero > 0) {
        setInputValue(numero.toString());
      }
    }
  };

  const hasError = error && error.trim() !== '';

  return (
    <div className="space-y-2">
      {/* Label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{emoji}</span>
          <label className="text-sm font-medium text-white/80">
            {label}
            {required && <span className="text-[#D94854] ml-1">*</span>}
          </label>
        </div>
        {descripcion && (
          <span className="text-xs text-white/50">{descripcion}</span>
        )}
      </div>

      {/* Input Container */}
      <div className="relative">
        <div
          className={`
            relative flex items-center bg-white/5 backdrop-blur-sm border rounded-xl transition-all duration-200
            ${isFocused 
              ? `border-2 shadow-lg` 
              : hasError 
                ? 'border-[#D94854]/50' 
                : 'border-white/10 hover:border-white/20'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          style={{
            borderColor: isFocused && !hasError ? `${colorTematico}50` : undefined,
            boxShadow: isFocused && !hasError ? `0 0 0 3px ${colorTematico}15` : undefined
          }}
        >
          {/* Ícono de moneda */}
          <div className="flex items-center pl-4 pr-2">
            <DollarSign 
              className="w-4 h-4" 
              style={{ color: isFocused && !hasError ? colorTematico : '#ffffff60' }} 
            />
          </div>

          {/* Input */}
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              flex-1 bg-transparent border-none outline-none py-3 pr-4 text-white text-base
              placeholder:text-white/40
              ${disabled ? 'cursor-not-allowed' : ''}
            `}
            autoComplete="off"
          />

          {/* Indicador de error */}
          {hasError && (
            <div className="flex items-center pr-4">
              <AlertCircle className="w-4 h-4 text-[#D94854]" />
            </div>
          )}
        </div>

        {/* Mensaje de error */}
        {hasError && (
          <div className="flex items-center gap-2 mt-2 px-1">
            <AlertCircle className="w-3 h-3 text-[#D94854] flex-shrink-0" />
            <span className="text-xs text-[#D94854]">{error}</span>
          </div>
        )}

        {/* Helper text cuando está enfocado */}
        {isFocused && !hasError && (
          <div className="mt-2 px-1">
            <span className="text-xs text-white/50">
              💡 Ingresa el monto sin símbolos. Ej: 150000 o 150.000
            </span>
          </div>
        )}
      </div>
    </div>
  );
}