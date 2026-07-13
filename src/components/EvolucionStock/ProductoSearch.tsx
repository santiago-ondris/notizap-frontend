import React from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBuscarProductosStock } from '@/hooks/evolucionStock/useCargaArchivos';

export const ProductoSearch: React.FC = () => {
  const navigate = useNavigate();
  const [q, setQ] = React.useState('');
  const { data = [], isFetching } = useBuscarProductosStock(q);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Buscar producto por codigo o nombre"
          className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white outline-none placeholder:text-white/35 focus:border-[#B695BF]/60"
        />
      </div>
      {q.length >= 2 && (
        <div className="absolute z-20 mt-2 max-h-80 w-full overflow-auto rounded-xl border border-white/10 bg-[#212026] shadow-2xl">
          {isFetching && <div className="px-4 py-3 text-sm text-white/50">Buscando...</div>}
          {!isFetching && data.length === 0 && <div className="px-4 py-3 text-sm text-white/50">Sin resultados</div>}
          {data.map(producto => (
            <button
              key={producto.codigoProducto}
              onClick={() => navigate(`/evolucion-stock/producto/${producto.codigoProducto}`)}
              className="block w-full border-b border-white/5 px-4 py-3 text-left hover:bg-white/5"
            >
              <div className="font-medium text-white">{producto.codigoProducto}</div>
              <div className="text-sm text-white/60">{producto.nombreProducto}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
