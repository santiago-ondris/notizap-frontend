import { useState, useEffect } from "react";

interface DecimalInputProps {
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  required?: boolean;
}

export default function DecimalInput({
  value,
  onChange,
  placeholder = "0,00",
  className = "",
  min = 0,
  max,
  disabled = false,
  required = false
}: DecimalInputProps) {
  const [displayValue, setDisplayValue] = useState("");

  // Convertir valor numérico a string con coma para mostrar
  const formatForDisplay = (val: string | number): string => {
    if (val === "" || val === null || val === undefined) return "";
    
    const numStr = String(val);
    
    // Si ya tiene coma, lo dejamos como está
    if (numStr.includes(",")) return numStr;
    
    // Si tiene punto, lo convertimos a coma
    if (numStr.includes(".")) return numStr.replace(".", ",");
    
    return numStr;
  };

  // Convertir string con coma a formato numérico (con punto)
  const parseForValue = (val: string): string => {
    if (!val) return "";
    
    // Reemplazar coma por punto para el valor numérico
    const normalized = val.replace(",", ".");
    
    // Validar que sea un número válido
    const num = parseFloat(normalized);
    if (isNaN(num)) return "";
    
    // Aplicar restricciones de min/max
    let finalNum = num;
    if (min !== undefined && finalNum < min) finalNum = min;
    if (max !== undefined && finalNum > max) finalNum = max;
    
    return String(finalNum);
  };

  // Sincronizar displayValue cuando cambia el value prop
  useEffect(() => {
    setDisplayValue(formatForDisplay(value));
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Permitir solo números, comas y puntos
    const sanitized = inputValue.replace(/[^0-9,.-]/g, "");
    
    // Permitir solo una coma o punto
    let formatted = sanitized;
    const commaCount = (sanitized.match(/,/g) || []).length;
    const dotCount = (sanitized.match(/\./g) || []).length;
    
    if (commaCount > 1) {
      formatted = sanitized.replace(/,/g, "").replace(/^/, sanitized.split(",")[0] + ",");
    }
    
    if (dotCount > 1) {
      formatted = sanitized.replace(/\./g, "").replace(/^/, sanitized.split(".")[0] + ".");
    }
    
    // No permitir coma y punto al mismo tiempo
    if (formatted.includes(",") && formatted.includes(".")) {
      // Preferir la coma (más común en Argentina)
      formatted = formatted.replace(/\./g, "");
    }
    
    setDisplayValue(formatted);
    
    // Enviar el valor parseado al parent
    const parsedValue = parseForValue(formatted);
    onChange(parsedValue);
  };

  const handleBlur = () => {
    // Al perder el foco, formatear bien el valor
    if (displayValue) {
      const parsedValue = parseForValue(displayValue);
      if (parsedValue) {
        const formatted = formatForDisplay(parsedValue);
        setDisplayValue(formatted);
      }
    }
  };

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleInputChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      required={required}
      inputMode="decimal"
    />
  );
}