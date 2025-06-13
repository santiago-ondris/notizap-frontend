import { useState } from "react";
import { createDisplayAd } from "@/services/mercadolibre/mercadolibreService";
import { toast } from "react-toastify";
import { Button } from "../ui/button";
import { 
  Calendar, 
  Target, 
  DollarSign, 
  MousePointer, 
  TrendingUp, 
  Eye, 
  Users, 
  Plus, 
  X, 
  Monitor,
  Loader2
} from "lucide-react";

// Tipado mínimo
type DisplayAnuncio = {
  nombre: string;
  impresiones: number;
  clics: number;
  visitas: number;
  ctr: number;
};

// Componente para agregar anuncios individuales
function AnuncioForm({ 
  anuncio, 
  setAnuncio, 
  onAdd 
}: { 
  anuncio: DisplayAnuncio; 
  setAnuncio: (anuncio: DisplayAnuncio) => void; 
  onAdd: () => void; 
}) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Plus className="w-4 h-4 text-[#B695BF]" />
        <h4 className="text-sm font-medium text-white">➕ Agregar Anuncio</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div>
          <label className="block text-xs font-medium text-white/80 mb-1">Nombre</label>
          <input
            type="text"
            placeholder="Nombre del anuncio"
            value={anuncio.nombre}
            onChange={e => setAnuncio({ ...anuncio, nombre: e.target.value })}
            className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:border-[#B695BF]/50 focus:outline-none transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-white/80 mb-1">Impresiones</label>
          <input
            type="number"
            placeholder="0"
            value={anuncio.impresiones}
            onChange={e => setAnuncio({ ...anuncio, impresiones: Number(e.target.value) })}
            className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:border-[#B695BF]/50 focus:outline-none transition-all text-sm"
            min={0}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-white/80 mb-1">Clics</label>
          <input
            type="number"
            placeholder="0"
            value={anuncio.clics}
            onChange={e => setAnuncio({ ...anuncio, clics: Number(e.target.value) })}
            className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:border-[#B695BF]/50 focus:outline-none transition-all text-sm"
            min={0}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-white/80 mb-1">Visitas</label>
          <input
            type="number"
            placeholder="0"
            value={anuncio.visitas}
            onChange={e => setAnuncio({ ...anuncio, visitas: Number(e.target.value) })}
            className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:border-[#B695BF]/50 focus:outline-none transition-all text-sm"
            min={0}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-white/80 mb-1">CTR (%)</label>
          <input
            type="number"
            placeholder="0"
            value={anuncio.ctr}
            onChange={e => setAnuncio({ ...anuncio, ctr: Number(e.target.value) })}
            className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:border-[#B695BF]/50 focus:outline-none transition-all text-sm"
            min={0}
            step="0.01"
          />
        </div>
      </div>
      
      <div className="flex justify-center">
        <Button
          type="button"
          onClick={onAdd}
          className="bg-[#B695BF]/20 hover:bg-[#B695BF]/30 border border-[#B695BF]/30 text-[#B695BF] font-medium px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Agregar anuncio
        </Button>
      </div>
    </div>
  );
}

// Componente para la tabla de anuncios agregados
function AnunciosTable({ 
  anuncios, 
  onRemove 
}: { 
  anuncios: DisplayAnuncio[]; 
  onRemove: (idx: number) => void; 
}) {
  if (anuncios.length === 0) return null;

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
      <div className="bg-white/10 px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-[#B695BF]" />
          <h4 className="text-sm font-medium text-white">📺 Anuncios Agregados ({anuncios.length})</h4>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="px-4 py-3 text-left text-xs font-medium text-white/80">Nombre</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-white/80">Impresiones</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-white/80">Clics</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-white/80">Visitas</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-white/80">CTR (%)</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-white/80">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {anuncios.map((a, idx) => (
              <tr key={idx} className="hover:bg-white/5 transition-all group">
                <td className="px-4 py-3 text-white font-medium">{a.nombre}</td>
                <td className="px-4 py-3 text-center text-white/80">{a.impresiones.toLocaleString()}</td>
                <td className="px-4 py-3 text-center text-white/80">{a.clics.toLocaleString()}</td>
                <td className="px-4 py-3 text-center text-white/80">{a.visitas.toLocaleString()}</td>
                <td className="px-4 py-3 text-center text-[#51590E] font-medium">{a.ctr}%</td>
                <td className="px-4 py-3 text-center">
                  <button
                    type="button"
                    onClick={() => onRemove(idx)}
                    className="text-[#D94854] hover:bg-[#D94854]/20 p-1 rounded-lg transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Componente principal
export default function DisplayAdsForm() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [nombreCampania, setNombreCampania] = useState("");
  const [inversion, setInversion] = useState("");
  const [visitasConDisplay, setVisitasConDisplay] = useState("");
  const [visitasSinDisplay, setVisitasSinDisplay] = useState("");
  const [clics, setClics] = useState("");
  const [impresiones, setImpresiones] = useState("");
  const [alcance, setAlcance] = useState("");
  const [costoPorVisita, setCostoPorVisita] = useState("");
  
  // Anuncios internos
  const [anuncios, setAnuncios] = useState<DisplayAnuncio[]>([]);
  const [anuncio, setAnuncio] = useState<DisplayAnuncio>({
    nombre: "",
    impresiones: 0,
    clics: 0,
    visitas: 0,
    ctr: 0
  });
  const [loading, setLoading] = useState(false);

  // Handlers para los anuncios
  const handleAddAnuncio = () => {
    if (!anuncio.nombre) return toast.error("El anuncio debe tener nombre");
    setAnuncios(prev => [...prev, anuncio]);
    setAnuncio({ nombre: "", impresiones: 0, clics: 0, visitas: 0, ctr: 0 });
    toast.success("Anuncio agregado a la campaña");
  };

  const handleRemoveAnuncio = (idx: number) => {
    setAnuncios(prev => prev.filter((_, i) => i !== idx));
    toast.info("Anuncio eliminado");
  };

  // Enviar formulario principal
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (anuncios.length === 0) return toast.error("Agregá al menos un anuncio a la campaña");
    setLoading(true);
    try {
      await createDisplayAd({
        year,
        month,
        nombreCampania,
        inversion: Number(inversion),
        visitasConDisplay: Number(visitasConDisplay),
        visitasSinDisplay: Number(visitasSinDisplay),
        clics: Number(clics),
        impresiones: Number(impresiones),
        alcance: Number(alcance),
        costoPorVisita: Number(costoPorVisita),
        anuncios
      });
      toast.success("Reporte Display Ads guardado");
      // Limpiar
      setNombreCampania("");
      setInversion(""); setVisitasConDisplay(""); setVisitasSinDisplay("");
      setClics(""); setImpresiones(""); setAlcance(""); setCostoPorVisita("");
      setAnuncios([]);
    } catch {
      toast.error("Error al guardar el reporte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-center gap-2 mb-6">
        <Monitor className="w-5 h-5 text-[#B695BF]" />
        <h2 className="text-xl font-semibold text-white">📺 Cargar Campaña Display Ads</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica de la campaña */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
              <Calendar className="w-4 h-4" />
              Año
            </label>
            <input 
              type="number" 
              value={year} 
              onChange={e => setYear(Number(e.target.value))} 
              min={2022} 
              max={2100} 
              required
              className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:border-[#B695BF]/50 focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
              <Calendar className="w-4 h-4" />
              Mes
            </label>
            <input 
              type="number" 
              value={month} 
              onChange={e => setMonth(Number(e.target.value))} 
              min={1} 
              max={12} 
              required
              className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:border-[#B695BF]/50 focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
              <Target className="w-4 h-4" />
              Nombre Campaña
            </label>
            <input 
              type="text" 
              value={nombreCampania} 
              onChange={e => setNombreCampania(e.target.value)} 
              required
              placeholder="Nombre de la campaña"
              className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:border-[#B695BF]/50 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Métricas de inversión y visitas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
              <DollarSign className="w-4 h-4" />
              Inversión ($)
            </label>
            <input 
              type="number" 
              value={inversion} 
              onChange={e => setInversion(e.target.value)} 
              min={0} 
              step="0.01"
              placeholder="0.00"
              className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:border-[#B695BF]/50 focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
              <Eye className="w-4 h-4" />
              Visitas c/Display
            </label>
            <input 
              type="number" 
              value={visitasConDisplay} 
              onChange={e => setVisitasConDisplay(e.target.value)} 
              min={0}
              placeholder="0"
              className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:border-[#B695BF]/50 focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
              <Eye className="w-4 h-4" />
              Visitas s/Display
            </label>
            <input 
              type="number" 
              value={visitasSinDisplay} 
              onChange={e => setVisitasSinDisplay(e.target.value)} 
              min={0}
              placeholder="0"
              className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:border-[#B695BF]/50 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Métricas de engagement */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
              <MousePointer className="w-4 h-4" />
              Clics
            </label>
            <input 
              type="number" 
              value={clics} 
              onChange={e => setClics(e.target.value)} 
              min={0}
              placeholder="0"
              className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:border-[#B695BF]/50 focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
              <TrendingUp className="w-4 h-4" />
              Impresiones
            </label>
            <input 
              type="number" 
              value={impresiones} 
              onChange={e => setImpresiones(e.target.value)} 
              min={0}
              placeholder="0"
              className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:border-[#B695BF]/50 focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
              <Users className="w-4 h-4" />
              Alcance
            </label>
            <input 
              type="number" 
              value={alcance} 
              onChange={e => setAlcance(e.target.value)} 
              min={0}
              placeholder="0"
              className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:border-[#B695BF]/50 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Costo por visita */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
              <DollarSign className="w-4 h-4" />
              Costo por Visita ($)
            </label>
            <input 
              type="number" 
              value={costoPorVisita} 
              onChange={e => setCostoPorVisita(e.target.value)} 
              min={0} 
              step="0.01"
              placeholder="0.00"
              className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:border-[#B695BF]/50 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Sección de anuncios */}
        <div className="space-y-4">
          <AnuncioForm 
            anuncio={anuncio}
            setAnuncio={setAnuncio}
            onAdd={handleAddAnuncio}
          />
          
          <AnunciosTable 
            anuncios={anuncios}
            onRemove={handleRemoveAnuncio}
          />
        </div>

        {/* Botón submit */}
        <div className="flex justify-center pt-4">
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-[#51590E]/20 hover:bg-[#51590E]/30 border border-[#51590E]/30 text-[#51590E] font-semibold px-6 py-3 rounded-xl transition-all flex items-center gap-2 min-w-[220px] justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Monitor className="w-4 h-4" />
                Guardar campaña Display Ads
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}