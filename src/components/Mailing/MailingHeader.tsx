import React from "react";
import { MailOpen, RefreshCw, Loader2 } from "lucide-react";

interface MailingHeaderProps {
  cuenta: "Montella" | "Alenka";
  setCuenta: (cuenta: "Montella" | "Alenka") => void;
  cuentas: readonly string[];
  puedeSincronizar: boolean;
  onSync: () => void;
  isSyncing: boolean;
}

export const MailingHeader: React.FC<MailingHeaderProps> = ({
  cuenta,
  setCuenta,
  cuentas,
  puedeSincronizar,
  onSync,
  isSyncing
}) => {

  return (
    <div className="mb-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-white/60 text-sm">Módulos</span>
        <span className="text-white/40">/</span>
        <span className="text-[#D94854] text-sm font-medium">Mailing</span>
      </div>

      {/* Main Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D94854] to-[#F23D5E] flex items-center justify-center shadow-lg">
            <MailOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Campañas Mailchimp
            </h1>
            <p className="text-white/60 mt-1">
              Análisis y métricas de campañas de email marketing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Account Selector */}
          <div className="relative">
            <select
              value={cuenta}
              onChange={e => setCuenta(e.target.value as "Montella" | "Alenka")}
              className="appearance-none bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:border-[#D94854] transition-all cursor-pointer pr-10"
            >
              {cuentas.map(opt => (
                <option key={opt} value={opt} className="bg-[#212026] text-white">
                  {opt}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Sync Button */}
          {puedeSincronizar && (
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#D94854] to-[#F23D5E] hover:from-[#F23D5E] hover:to-[#D94854] text-white rounded-xl shadow-lg hover:shadow-[#D94854]/25 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] justify-center"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  <span className="hidden sm:inline">Sincronizando...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  <span className="hidden sm:inline">Sincronizar</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};