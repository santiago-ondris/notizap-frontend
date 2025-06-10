import ClienteRankingTable from "@/components/Clientes/ClienteRankingTable";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Trophy, Users, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function ClientesRankingPage() {
  const navigate = useNavigate();
  const { role } = useAuth();

  return (
    <div className="max-w-4xl mx-auto p-6 mt-6">
      {/* Botones de navegación arriba */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button variant="outline" onClick={() => navigate("/clientes")} className="flex items-center gap-2">
          <Users size={18} /> Volver al listado
        </Button>
        {role === "superadmin" && (
          <Button variant="outline" onClick={() => navigate("/clientes/import")} className="flex items-center gap-2">
            <Upload size={18} className="text-[#D94854]" /> Importar desde Excel
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Trophy size={28} className="text-[#B695BF]" />
        <h1 className="text-2xl font-bold text-[#B695BF]">Ranking de clientes</h1>
      </div>

      <ClienteRankingTable initialOrdenarPor="monto" initialTop={10} />
    </div>
  );
}