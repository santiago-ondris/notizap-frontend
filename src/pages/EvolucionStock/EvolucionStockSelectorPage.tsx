import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, FileSpreadsheet, LineChart, PackageSearch, Scale, ArrowRight } from 'lucide-react';
import { ProductoSearch } from '@/components/EvolucionStock/ProductoSearch';

const opciones = [
  { titulo: 'Cargar datos del ERP', descripcion: 'Subi compras y ventas antes de analizar decisiones.', icono: FileSpreadsheet, ruta: '/evolucion-stock/carga', color: '#F23D5E' },
  { titulo: 'Decidir recompras', descripcion: 'Ordena productos por rotacion, velocidad y unidades vendidas.', icono: BarChart3, ruta: '/evolucion-stock/ranking', color: '#B695BF' },
  { titulo: 'Evaluar proveedores', descripcion: 'Compara marcas y proveedores por comprado, vendido y rotacion.', icono: Scale, ruta: '/evolucion-stock/rotacion', color: '#51590E' }
];

export const EvolucionStockSelectorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1A1A20] px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-sm text-white/50">
            <LineChart className="h-4 w-4 text-[#F23D5E]" />
            Evolucion de stock
          </div>
          <h1 className="mt-2 text-3xl font-bold text-white">Compras: que rota, donde rota y que recomprar</h1>
          <p className="mt-3 max-w-3xl text-sm text-white/55">
            Usa este modulo para cruzar lo comprado contra lo vendido. Primero busca un producto puntual, o entra al ranking para detectar oportunidades y problemas de rotacion.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2 text-white">
            <PackageSearch className="h-5 w-5 text-[#B695BF]" />
            <h2 className="text-lg font-semibold">Analizar un producto puntual</h2>
          </div>
          <p className="mb-4 text-sm text-white/50">
            Busca por codigo o nombre para ver evolucion, color, talle y sucursal.
          </p>
          <ProductoSearch />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {opciones.map(opcion => {
            const Icon = opcion.icono;
            return (
              <button
                key={opcion.ruta}
                onClick={() => navigate(opcion.ruta)}
                className="group rounded-2xl border border-white/10 bg-white/5 p-6 text-left transition-all hover:-translate-y-1 hover:bg-white/10"
              >
                <div className="mb-5 flex items-start justify-between">
                  <div className="rounded-xl border p-3" style={{ borderColor: `${opcion.color}55`, backgroundColor: `${opcion.color}22` }}>
                    <Icon className="h-7 w-7" style={{ color: opcion.color }} />
                  </div>
                  <ArrowRight className="h-5 w-5 text-white/35 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">{opcion.titulo}</h3>
                <p className="mt-2 text-sm text-white/55">{opcion.descripcion}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EvolucionStockSelectorPage;
