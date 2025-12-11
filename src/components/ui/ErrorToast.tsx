import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface ErrorToastProps {
  traceId: string;
}

const ErrorToast = ({ traceId }: ErrorToastProps) => {
  const [copiado, setCopiado] = useState(false);

  const copiarCodigo = async () => {
    try {
      await navigator.clipboard.writeText(traceId);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  return (
    <div>
      <p className="font-medium">Ocurrió un error en la app</p>
      <p className="text-sm mt-1 opacity-90">
        Avisar con el código de error:
      </p>
      <div className="flex items-center gap-2 mt-1">
        <code className="text-xs bg-black/20 px-2 py-1 rounded break-all flex-1">
          {traceId}
        </code>
        <button
          onClick={copiarCodigo}
          className="p-1 hover:bg-black/20 rounded transition-colors"
          title="Copiar código"
        >
          {copiado ? (
            <Check size={14} className="text-green-300" />
          ) : (
            <Copy size={14} />
          )}
        </button>
      </div>
    </div>
  );
};

export default ErrorToast;