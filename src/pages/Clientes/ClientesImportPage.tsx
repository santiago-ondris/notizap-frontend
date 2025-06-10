import ClienteImportForm from "@/components/Clientes/ClienteImportForm";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users, Trophy } from "lucide-react";

export default function ClientesImportPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto p-6 mt-6">
      {/* Navegación entre páginas */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button variant="outline" onClick={() => navigate("/clientes")} className="flex items-center gap-2">
          <Users size={18} /> Volver al listado
        </Button>
        <Button variant="outline" onClick={() => navigate("/clientes/ranking")} className="flex items-center gap-2">
          <Trophy size={18} className="text-[#B695BF]" /> Ver ranking
        </Button>
      </div>

      <h1 className="text-2xl font-bold text-[#D94854] mb-6 flex items-center gap-2">
        Importar clientes desde Excel
      </h1>

      <ClienteImportForm />
    </div>
  );
}
