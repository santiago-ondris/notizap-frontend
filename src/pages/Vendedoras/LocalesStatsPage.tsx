import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocalesStatsTablaDias } from '@/components/Vendedoras/LocalesStatsTablaDias';
import { LocalesStatsVendedorasResumen } from '@/components/Vendedoras/LocalesStatsVendedorasResumen';
import { rendimientoLocalesService } from '@/services/vendedoras/rendimientoLocalesService';
import { dateHelpers } from '@/utils/vendedoras/dateHelpers';
import { TURNOS_OPTIONS } from '@/types/vendedoras/filtrosTypes';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, BarChart3, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RendimientoLocalesFilters } from '@/types/vendedoras/rendimientoLocalesTypes';
import { ventasVendedorasService } from '@/services/vendedoras/ventasVendedorasService';

const HOY = new Date();
const HACE_UN_MES = new Date();
HACE_UN_MES.setDate(HOY.getDate() - 30);

export default function LocalesStatsPage() {
  const navigate = useNavigate();
  
  const [filtros, setFiltros] = useState<RendimientoLocalesFilters>({
    fechaInicio: dateHelpers.formatearParaInput(HACE_UN_MES),
    fechaFin: dateHelpers.formatearParaInput(HOY),
    sucursalNombre: '',
    turno: '',
    metricaComparar: 'monto',
    page: 1,
    pageSize: 31,
    excluirDomingos: true
  });
  const [sucursales, setSucursales] = useState<string[]>([]);
  const [data, setData] = useState<any>(null); // RendimientoLocalesResponse
  const [, setLoading] = useState(false);

  useEffect(() => {
    ventasVendedorasService
      .obtenerSucursales()
      .then(setSucursales)
      .catch(() => setSucursales([]));
  }, []);

  useEffect(() => {
    if (!filtros.sucursalNombre) return;
    setLoading(true);
    rendimientoLocalesService
      .obtenerResumenLocales(filtros)
      .then((data) => {
        setData(data);
      })
      .finally(() => setLoading(false));
  }, [JSON.stringify(filtros)]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFiltros(f => ({
      ...f,
      [name]: value,
      page: 1,
    }));
  }

  function handleDateChange(name: string, value: string) {
    setFiltros(f => ({
      ...f,
      [name]: value,
      page: 1,
    }));
  }

  function handleMetricaClick(metrica: 'monto' | 'cantidad') {
    setFiltros(f => ({
      ...f,
      metricaComparar: metrica,
      page: 1,
    }));
  }

  function handlePageChange(nuevaPagina: number) {
    setFiltros(f => ({
      ...f,
      page: nuevaPagina,
    }));
  }

  return (
    <div className="min-h-screen bg-[#1A1A20] py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Botón Volver */}
                <button
                  onClick={() => navigate('/vendedoras')}
                  className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white/80 transition-all hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver
                </button>
                
                <div className="bg-[#B695BF]/20 p-3 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-[#B695BF]" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    🏢 Rendimiento de Locales y Vendedoras
                  </h1>
                  <p className="text-white/60 text-sm">
                    Análisis diario y comparativo entre vendedoras y sucursales
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FILTROS */}
        <section className="mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex flex-wrap gap-6 items-end">
              <div>
                <label className="block text-white/70 text-sm mb-1">Sucursal</label>
                <select
                  className="bg-transparent border border-white/20 rounded-lg px-3 py-1 text-white"
                  name="sucursalNombre"
                  value={filtros.sucursalNombre}
                  onChange={handleInputChange}
                >
                  <option value="">Seleccionar...</option>
                  {sucursales.map((suc) => (
                    <option value={suc} key={suc}>{suc}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">Desde</label>
                <input
                  type="date"
                  name="fechaInicio"
                  value={filtros.fechaInicio}
                  onChange={e => handleDateChange('fechaInicio', e.target.value)}
                  className="bg-transparent border border-white/20 rounded-lg px-3 py-1 text-white"
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">Hasta</label>
                <input
                  type="date"
                  name="fechaFin"
                  value={filtros.fechaFin}
                  onChange={e => handleDateChange('fechaFin', e.target.value)}
                  className="bg-transparent border border-white/20 rounded-lg px-3 py-1 text-white"
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">Turno</label>
                <select
                  name="turno"
                  value={filtros.turno}
                  onChange={handleInputChange}
                  className="bg-transparent border border-white/20 rounded-lg px-3 py-1 text-white"
                >
                  {TURNOS_OPTIONS.map(opt => (
                    <option value={opt.value} key={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">Métrica</label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={filtros.metricaComparar === 'monto' ? 'default' : 'secondary'}
                    className={cn(
                      'rounded-lg px-4 py-1 text-sm font-bold',
                      filtros.metricaComparar === 'monto' && 'bg-[#51590E]/20 text-[#51590E] border-[#51590E]/30'
                    )}
                    onClick={() => handleMetricaClick('monto')}
                  >
                    $ Monto
                  </Button>
                  <Button
                    type="button"
                    variant={filtros.metricaComparar === 'cantidad' ? 'default' : 'secondary'}
                    className={cn(
                      'rounded-lg px-4 py-1 text-sm font-bold',
                      filtros.metricaComparar === 'cantidad' && 'bg-[#B695BF]/20 text-[#B695BF] border-[#B695BF]/30'
                    )}
                    onClick={() => handleMetricaClick('cantidad')}
                  >
                    Pares
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TABLA DETALLE */}
        <section className="mb-12">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#51590E]/20 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-[#51590E]" />
              </div>
              <h2 className="text-xl font-bold text-white">📅 Detalle diario por turno</h2>
            </div>
            <LocalesStatsTablaDias
              dias={data?.dias ?? []}
              metricaComparar={filtros.metricaComparar as 'monto' | 'cantidad'}
            />
          </div>
        </section>

        {/* RANKING VENDEDORES */}
        <section className="mb-12">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#B695BF]/20 p-2 rounded-lg">
                <Users className="w-5 h-5 text-[#B695BF]" />
              </div>
              <h2 className="text-xl font-bold text-white">🏅 Ranking de cumplimiento por vendedora</h2>
            </div>
            <LocalesStatsVendedorasResumen
              resumenVendedoras={data?.resumenVendedoras ?? []}
              metricaComparar={filtros.metricaComparar as 'monto' | 'cantidad'}
            />
          </div>
        </section>

        {/* Paginación */}
        {data?.totalPaginas > 1 && (
          <div className="flex gap-2 justify-center items-center mt-8">
            {Array.from({ length: data.totalPaginas }).map((_, idx) => (
              <Button
                key={idx}
                variant={data.pagina === idx + 1 ? 'default' : 'secondary'}
                className={cn(
                  'rounded-full w-9 h-9 flex items-center justify-center',
                  data.pagina === idx + 1
                    ? 'bg-[#51590E]/30 text-white'
                    : 'bg-white/10 text-white/70'
                )}
                onClick={() => handlePageChange(idx + 1)}
              >
                {idx + 1}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
