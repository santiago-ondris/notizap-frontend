import { useState } from "react";
import ClienteTable from "@/components/Clientes/ClienteTable";
import ClienteFilters from "@/components/Clientes/ClienteFilters";
import { type ClienteResumenDto, type PagedResult } from "@/types/cliente/cliente";
import { useAuth } from "@/contexts/AuthContext"; 
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Upload, Trophy } from "lucide-react";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<PagedResult<ClienteResumenDto> | null>(null);
  const [activeFilters, setActiveFilters] = useState<any>(null);
  const navigate = useNavigate();
  const { role } = useAuth();

  const handleFiltersApplied = (filters: any) => {
    setActiveFilters(filters);
  };

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
    
    <div className="relative z-10 max-w-4xl mx-auto p-6 pt-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[#D94854] flex items-center gap-2">
          <Users className="text-[#B695BF]" size={28} /> Clientes
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/clientes/ranking")}
            className="flex items-center gap-2"
          >
            <Trophy size={18} className="text-[#B695BF]" />
            Ver ranking
          </Button>
          {role === "superadmin" && (
            <Button
              variant="outline"
              onClick={() => navigate("/clientes/import")}
              className="flex items-center gap-2"
            >
              <Upload size={18} className="text-[#D94854]" />
              Importar desde Excel
            </Button>
          )}
        </div>
      </div>
      <ClienteFilters 
        onResult={setClientes} 
        onFiltersApplied={handleFiltersApplied}
      />
      <ClienteTable 
        clientes={clientes} 
        activeFilters={activeFilters}
      />
    </div>
    </div>
  );
}