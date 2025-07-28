import React, { useState, useMemo } from "react";
import { useMailingCampaigns, useMailingHighlights, useSyncMailingCampaigns } from "@/hooks/mailing/useMailing";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp } from "lucide-react";
import { toast } from "react-toastify";
import { filterByTitle, filterByDateRange } from "@/utils/mailing/filters";
import { useAnalytics } from "@/hooks/useAnalytics";

// Componentes modularizados
import { MailingHeader } from "@/components/Mailing/MailingHeader";
import { MailingHighlights } from "@/components/Mailing/MailingHighlights";
import { MailingFilters } from "@/components/Mailing/MailingFilters";
import { MailingTable } from "@/components/Mailing/MailingTable";
import { MailingPagination } from "@/components/Mailing/MailingPagination";

const CUENTAS = ["Montella", "Alenka"] as const;
const ITEMS_PER_PAGE = 15;

// Función para calcular highlights dinámicos basados en campañas filtradas
function calculateDynamicHighlights(campaigns: any[]) {
  if (!campaigns || campaigns.length === 0) {
    return {
      bestOpenRateCampaign: "Sin datos",
      bestClickRateCampaign: "Sin datos",
      bestConversionCampaign: "Sin datos",
      bestOpenRate: 0,
      bestClickRate: 0,
      bestConversions: 0
    };
  }

  const bestOpen = campaigns.reduce((prev, current) => 
    (prev.openRate > current.openRate) ? prev : current
  );
  
  const bestClick = campaigns.reduce((prev, current) => 
    (prev.clickRate > current.clickRate) ? prev : current
  );
  
  const bestConv = campaigns.reduce((prev, current) => 
    (prev.conversions > current.conversions) ? prev : current
  );

  return {
    bestOpenRateCampaign: bestOpen.title,
    bestOpenRate: bestOpen.openRate,
    bestClickRateCampaign: bestClick.title,
    bestClickRate: bestClick.clickRate,
    bestConversionCampaign: bestConv.title,
    bestConversions: bestConv.conversions
  };
}

const MailingPage: React.FC = () => {
  const [cuenta, setCuenta] = useState<"Montella" | "Alenka">("Montella");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  // Datos y estados
  const { data: campañas, isLoading: loadingCampañas, error: errorCampañas } = useMailingCampaigns(cuenta);
  const { data: highlights, isLoading: loadingHighlights } = useMailingHighlights(cuenta);
  const { role } = useAuth();
  const puedeSincronizar = role === "admin" || role === "superadmin";
  const puedeEditarTitulos = role === "admin" || role === "superadmin";
  const syncMutation = useSyncMailingCampaigns();
  const { trackModuleAction } = useAnalytics('mailing');

  const handleSync = () => {
    const syncStartTime = Date.now();
    
    // Track inicio de sincronización
    trackModuleAction('sync-mailchimp-start', {
      account: cuenta,
      userRole: role || ''
    });

    syncMutation.mutate(cuenta, {
      onSuccess: (resultado) => {
        // Track sync exitoso
        const syncDuration = Date.now() - syncStartTime;
        trackModuleAction('sync-mailchimp-success', {
          account: cuenta,
          duration: syncDuration,
          userRole: role || '',
          nuevasCampañas: resultado.nuevasCampañas,
          campañasActualizadas: resultado.campañasActualizadas,
          totalProcesadas: resultado.totalProcesadas
        });

        // Toast con información detallada
        if (resultado.nuevasCampañas > 0 || resultado.campañasActualizadas > 0) {
          toast.success(
            `✅ Sincronización completada: ${resultado.mensaje}`,
            { 
              autoClose: 4000,
              hideProgressBar: false 
            }
          );
        } else {
          toast.info(resultado.mensaje, { autoClose: 3000 });
        }
      },
      onError: (err) => {
        // Track sync fallido
        const syncDuration = Date.now() - syncStartTime;
        const errorMessage = err instanceof Error ? err.message : "Error al sincronizar campañas";
        
        trackModuleAction('sync-mailchimp-error', {
          account: cuenta,
          duration: syncDuration,
          error: errorMessage,
          userRole: role || ''
        });

        toast.error(`❌ ${errorMessage}`, { autoClose: 5000 });
      },
    });
  };

  // Filtrar campañas y calcular highlights dinámicos
  const { campañasFiltradas, highlightsDinamicos, totalPages, campañasPaginadas } = useMemo(() => {
    let filtered = campañas || [];
    filtered = filterByTitle(filtered, search);
    filtered = filterByDateRange(
      filtered,
      fromDate ? new Date(fromDate) : null,
      toDate ? new Date(toDate + "T23:59:59") : null
    );

    // Calcular highlights basados en campañas filtradas
    const dynamicHighlights = calculateDynamicHighlights(filtered);

    // Calcular paginación
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedCampaigns = filtered.slice(startIndex, endIndex);

    return {
      campañasFiltradas: filtered,
      highlightsDinamicos: dynamicHighlights,
      totalPages,
      campañasPaginadas: paginatedCampaigns
    };
  }, [campañas, search, fromDate, toDate, currentPage]);

  // Resetear página cuando cambien los filtros
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, fromDate, toDate, cuenta]);

  // Determinar qué highlights mostrar: dinámicos si hay filtros activos, estáticos si no
  const hayFiltrosActivos = !!(search || fromDate || toDate);
  const highlightsAMostrar = hayFiltrosActivos ? highlightsDinamicos : highlights;
  const cargandoHighlights = hayFiltrosActivos ? loadingCampañas : loadingHighlights;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#212026] via-[#1a1d22] to-[#2a1f2b]">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px'
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <MailingHeader 
          cuenta={cuenta}
          setCuenta={setCuenta}
          cuentas={CUENTAS}
          puedeSincronizar={puedeSincronizar}
          onSync={handleSync} // 👈 Esta función ya tiene tracking
          isSyncing={syncMutation.isPending}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column - Highlights & Filters */}
          <div className="lg:col-span-4 space-y-6">
            {/* Highlights */}
            <MailingHighlights 
              highlights={highlightsAMostrar}
              isLoading={cargandoHighlights}
              isDynamic={hayFiltrosActivos}
            />

            {/* Filters */}
            <MailingFilters
              search={search}
              setSearch={setSearch}
              fromDate={fromDate}
              setFromDate={setFromDate}
              toDate={toDate}
              setToDate={setToDate}
            />

            {/* Quick Stats */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#B695BF]" />
                Estadísticas rápidas
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">Total campañas</span>
                  <span className="text-white font-semibold">{campañasFiltradas.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">Promedio Open Rate</span>
                  <span className="text-[#D94854] font-semibold">
                    {campañasFiltradas.length > 0 
                      ? `${(campañasFiltradas.reduce((acc, c) => acc + c.openRate, 0) / campañasFiltradas.length * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">Total emails enviados</span>
                  <span className="text-[#B695BF] font-semibold">
                    {campañasFiltradas.reduce((acc, c) => acc + c.emailsSent, 0).toLocaleString()}
                  </span>
                </div>
                {hayFiltrosActivos && (
                  <div className="pt-2 border-t border-white/10">
                    <div className="text-xs text-[#B695BF] text-center">
                      Mostrando resultados filtrados
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Table & Pagination */}
          <div className="lg:col-span-8 space-y-6">
            <MailingTable
              campañas={campañasPaginadas}
              isLoading={loadingCampañas}
              error={errorCampañas}
              totalCampaigns={campañasFiltradas.length}
              currentPage={currentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              canEditTitles={puedeEditarTitulos}
            />

            {/* Paginación */}
            {totalPages > 1 && (
              <MailingPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={campañasFiltradas.length}
                itemsPerPage={ITEMS_PER_PAGE}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MailingPage;