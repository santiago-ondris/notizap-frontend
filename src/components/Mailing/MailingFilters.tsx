import React from "react";
import { Search, Calendar, Filter } from "lucide-react";

interface MailingFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  fromDate: string;
  setFromDate: (value: string) => void;
  toDate: string;
  setToDate: (value: string) => void;
}

export const MailingFilters: React.FC<MailingFiltersProps> = ({
  search,
  setSearch,
  fromDate,
  setFromDate,
  toDate,
  setToDate
}) => {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Filter className="w-5 h-5 text-[#B695BF]" />
        Filtros
      </h3>
      
      <div className="space-y-4">
        {/* Search Input */}
        <div>
          <label className="block text-white/70 text-sm font-medium mb-2">
            Buscar campaña
          </label>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por título..."
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 pl-10 text-white placeholder-white/50 focus:outline-none focus:border-[#D94854] transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="text-white/70 text-sm font-medium mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Rango de fechas
          </label>
          <div className="space-y-3">
            <div>
              <label className="block text-white/50 text-xs mb-1">Desde</label>
              <input
                type="date"
                value={fromDate}
                max={toDate || undefined}
                onChange={e => setFromDate(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#B695BF] transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-white/50 text-xs mb-1">Hasta</label>
              <input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={e => setToDate(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#B695BF] transition-all text-sm"
              />
            </div>
          </div>
        </div>

        {/* Clear Filters */}
        {(search || fromDate || toDate) && (
          <button
            onClick={() => {
              setSearch("");
              setFromDate("");
              setToDate("");
            }}
            className="w-full px-3 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm border border-white/20 hover:border-white/40"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
};