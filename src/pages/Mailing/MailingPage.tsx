import React, { useState } from "react";
import { useMailingCampaigns, useMailingHighlights, useSyncMailingCampaigns } from "@/hooks/mailing/useMailing";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp } from "lucide-react";
import { toast } from "react-toastify";
import { filterByTitle, filterByDateRange } from "@/utils/mailing/filters";

// Componentes modularizados
import { MailingHeader } from "@/components/Mailing/MailingHeader";
import { MailingHighlights } from "@/components/Mailing/MailingHighlights";
import { MailingFilters } from "@/components/Mailing/MailingFilters";
import { MailingTable } from "@/components/Mailing/MailingTable";

const CUENTAS = ["Montella", "Alenka"] as const;

const MailingPage: React.FC = () => {
  const [cuenta, setCuenta] = useState<"Montella" | "Alenka">("Montella");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // Datos y estados
  const { data: campañas, isLoading: loadingCampañas, error: errorCampañas } = useMailingCampaigns(cuenta);
  const { data: highlights, isLoading: loadingHighlights } = useMailingHighlights(cuenta);
  const { role } = useAuth();
  const puedeSincronizar = role === "admin" || role === "superadmin";
  const syncMutation = useSyncMailingCampaigns();

  const handleSync = () => {
    syncMutation.mutate(cuenta, {
      onSuccess: (msg) => toast.success(msg),
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Error al sincronizar campañas"),
    });
  };

  // Filtrar campañas
  let campañasFiltradas = campañas || [];
  campañasFiltradas = filterByTitle(campañasFiltradas, search);
  campañasFiltradas = filterByDateRange(
    campañasFiltradas,
    fromDate ? new Date(fromDate) : null,
    toDate ? new Date(toDate + "T23:59:59") : null
  );

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
          onSync={handleSync}
          isSyncing={syncMutation.isPending}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column - Highlights & Filters */}
          <div className="lg:col-span-4 space-y-6">
            {/* Highlights */}
            <MailingHighlights 
              highlights={highlights}
              isLoading={loadingHighlights}
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
              </div>
            </div>
          </div>

          {/* Right Column - Table */}
          <div className="lg:col-span-8">
            <MailingTable
              campañas={campañasFiltradas}
              isLoading={loadingCampañas}
              error={errorCampañas}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MailingPage;