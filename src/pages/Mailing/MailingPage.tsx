import React, { useState } from "react";
import { useMailingCampaigns, useMailingHighlights, useSyncMailingCampaigns } from "@/hooks/mailing/useMailing";
import { useAuth } from "@/contexts/AuthContext"; // Asegurate de tener este hook/contexto
import { Loader2, RefreshCw, MailOpen, Search } from "lucide-react"; // Lucide icons
import { toast } from "react-toastify";
import { filterByTitle, filterByDateRange } from "@/utils/mailing/filters";

const CUENTAS = ["Montella", "Alenka"] as const;

const MailingPage: React.FC = () => {
  // Estado local para la cuenta seleccionada
  const [cuenta, setCuenta] = useState<"Montella" | "Alenka">("Montella");

  // Datos y estados
  const { data: campañas, isLoading: loadingCampañas, error: errorCampañas } = useMailingCampaigns(cuenta);
  const { data: highlights, isLoading: loadingHighlights } = useMailingHighlights(cuenta);

  // AuthContext (para roles)
  const { role } = useAuth();
  const puedeSincronizar = role === "admin" || role === "superadmin";

  // Sincronizar campañas
  const syncMutation = useSyncMailingCampaigns();

  // Función para manejar el sync y mostrar feedback
  const handleSync = () => {
    syncMutation.mutate(cuenta, {
      onSuccess: (msg) => toast.success(msg),
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Error al sincronizar campañas"),
    });
  };

  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState<string>(""); // formato yyyy-mm-dd
  const [toDate, setToDate] = useState<string>("");

  // Filtrar campañas
  let campañasFiltradas = campañas || [];
  campañasFiltradas = filterByTitle(campañasFiltradas, search);
  campañasFiltradas = filterByDateRange(
    campañasFiltradas,
    fromDate ? new Date(fromDate) : null,
    toDate ? new Date(toDate + "T23:59:59") : null // Asegura incluir todo el día 'to'
  );

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-[#D94854] flex items-center gap-2">
          <MailOpen className="w-7 h-7" /> Mailing – Campañas Mailchimp
        </h1>
        <div>
          <select
            value={cuenta}
            onChange={e => setCuenta(e.target.value as "Montella" | "Alenka")}
            className="rounded-lg border border-gray-300 p-2 bg-white shadow text-base font-semibold text-[#212026] focus:outline-none"
          >
            {CUENTAS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Botón de sincronizar */}
      {puedeSincronizar && (
        <button
          onClick={handleSync}
          disabled={syncMutation.isPending}
          className="flex items-center gap-2 mb-6 px-4 py-2 bg-[#D94854] hover:bg-[#F23D5E] text-white rounded-xl shadow transition font-semibold"
        >
          {syncMutation.isPending ? <Loader2 className="animate-spin w-5 h-5" /> : <RefreshCw className="w-5 h-5" />}
          Sincronizar campañas
        </button>
      )}

      {/* Highlights */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-2 text-[#B695BF]">Resumen destacado</h2>
        {loadingHighlights ? (
          <div className="flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin" /> Cargando...</div>
        ) : highlights ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white shadow p-4 rounded-2xl">
              <div className="text-gray-500 text-sm">Mejor Open Rate</div>
              <div className="text-2xl font-bold text-[#D94854]">{highlights.bestOpenRateCampaign}</div>
              <div className="text-lg">{(highlights.bestOpenRate * 100).toFixed(1)}%</div>
            </div>
            <div className="bg-white shadow p-4 rounded-2xl">
              <div className="text-gray-500 text-sm">Mejor Click Rate</div>
              <div className="text-2xl font-bold text-[#F23D5E]">{highlights.bestClickRateCampaign}</div>
              <div className="text-lg">{(highlights.bestClickRate * 100).toFixed(1)}%</div>
            </div>
            <div className="bg-white shadow p-4 rounded-2xl">
              <div className="text-gray-500 text-sm">Más Conversiones</div>
              <div className="text-2xl font-bold text-[#51590E]">{highlights.bestConversionCampaign}</div>
              <div className="text-lg">{highlights.bestConversions}</div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 text-sm">No hay datos destacados</div>
        )}
      </section>

            {/* Filtros */}
            <section className="mb-4 flex flex-col md:flex-row gap-2 md:gap-4 items-start md:items-center">
        {/* Buscador */}
        <div className="flex items-center w-full md:w-1/2">
          <label htmlFor="search" className="sr-only">Buscar campaña</label>
          <div className="relative w-full">
            <input
              id="search"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar campaña por título..."
              className="w-full rounded-xl border border-gray-300 px-4 py-2 pr-10 shadow-sm focus:outline-none focus:border-[#D94854] transition text-[#212026] bg-white"
            />
            <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B695BF]" />
          </div>
        </div>
        {/* Selector de rango de fechas */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-sm text-gray-600">Desde:</label>
          <input
            type="date"
            value={fromDate}
            max={toDate || undefined}
            onChange={e => setFromDate(e.target.value)}
            className="rounded-xl border border-gray-300 px-2 py-2 shadow-sm focus:outline-none focus:border-[#B695BF] text-[#212026] bg-white"
          />
          <label className="text-sm text-gray-600">Hasta:</label>
          <input
            type="date"
            value={toDate}
            min={fromDate || undefined}
            onChange={e => setToDate(e.target.value)}
            className="rounded-xl border border-gray-300 px-2 py-2 shadow-sm focus:outline-none focus:border-[#B695BF] text-[#212026] bg-white"
          />
        </div>
      </section>

      {/* Listado de campañas */}
      <section>
        <h2 className="text-xl font-bold mb-2 text-[#B695BF]">Campañas enviadas</h2>
        {loadingCampañas ? (
          <div className="flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin" /> Cargando...</div>
        ) : errorCampañas ? (
          <div className="text-red-600">Error al cargar campañas: {errorCampañas.message}</div>
        ) : !campañasFiltradas || campañasFiltradas.length === 0 ? (
          <div className="text-gray-500">No hay campañas para mostrar.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-2xl shadow mt-2">
              <thead>
                <tr className="bg-[#F23D5E]/20 text-[#212026]">
                  <th className="px-3 py-2 text-left font-semibold">Título</th>
                  <th className="px-3 py-2 text-left">Fecha envío</th>
                  <th className="px-3 py-2 text-center">Emails</th>
                  <th className="px-3 py-2 text-center">Open Rate</th>
                  <th className="px-3 py-2 text-center">Click Rate</th>
                  <th className="px-3 py-2 text-center">Conversions</th>
                </tr>
              </thead>
              <tbody>
                {campañasFiltradas.map(campaña => (
                  <tr key={campaña.campaignId} className="border-b last:border-b-0 hover:bg-[#B695BF]/10 transition">
                    <td className="px-3 py-2">{campaña.title}</td>
                    <td className="px-3 py-2">{new Date(campaña.sendTime).toLocaleString()}</td>
                    <td className="px-3 py-2 text-center">{campaña.emailsSent}</td>
                    <td className="px-3 py-2 text-center">{(campaña.openRate * 100).toFixed(1)}%</td>
                    <td className="px-3 py-2 text-center">{(campaña.clickRate * 100).toFixed(1)}%</td>
                    <td className="px-3 py-2 text-center">{campaña.conversions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default MailingPage;
