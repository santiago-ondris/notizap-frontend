import React, { useState } from "react";
import { Navbar } from "@/components/Landing/Navbar";
import { EvolucionStockForm } from "@/components/Analisis/grafico/EvolucionStockForm";
import { EvolucionStockCharts } from "@/components/Analisis/grafico/EvolucionStockCharts";
import { fetchEvolucionStock } from "@/services/analisis/analisisService";
import { type EvolucionStockRequest, type EvolucionStockPorPuntoDeVenta } from "@/types/analisis/analisis";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { NotepadTextDashed } from "lucide-react";
import { useNavigate } from "react-router-dom";

const GraficoEvolucionPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [chartsData, setChartsData] = useState<EvolucionStockPorPuntoDeVenta[] | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (data: EvolucionStockRequest) => {
    setLoading(true);
    setChartsData(null);
    try {
      const res = await fetchEvolucionStock(data);
      setChartsData(res);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "No se pudo procesar la evolución de stock. Verifica los archivos y el producto."
      );
    }
    setLoading(false);
  };

  return (
    <div className="bg-[#212026] min-h-screen w-full">
      <Navbar onLoginClick={function (): void {
              throw new Error("Function not implemented.");
          } } />
      <main className="max-w-6xl mx-auto px-4 pt-8 pb-8">
        <h1 className="text-4xl font-bold text-[#D94854] mb-10 text-center">
          Gráfico de evolución de stock
        </h1>

        <div className="flex justify-center mb-8">
          <Button
            className="bg-[#D94854] hover:bg-[#F23D5E] text-white font-semibold flex items-center gap-2 px-6 py-3 rounded-xl shadow"
            onClick={() => navigate("/analisis")}
          >
            <NotepadTextDashed className="w-5 h-5" />
            Volver a tasa de rotación
          </Button>
        </div>

        <EvolucionStockForm onSubmit={handleSubmit} loading={loading} />
        {chartsData && <EvolucionStockCharts data={chartsData} />}
      </main>
    </div>
  );
};

export default GraficoEvolucionPage;
