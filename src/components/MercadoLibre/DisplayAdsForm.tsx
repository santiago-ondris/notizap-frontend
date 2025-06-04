import { useState } from "react";
import { createDisplayAd } from "@/services/mercadolibre/mercadolibreService";
import { toast } from "react-toastify";
import { Button } from "../ui/button";

// Tipado mínimo
type DisplayAnuncio = {
  nombre: string;
  impresiones: number;
  clics: number;
  visitas: number;
  ctr: number;
};

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
  };

  const handleRemoveAnuncio = (idx: number) => {
    setAnuncios(prev => prev.filter((_, i) => i !== idx));
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
    <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl p-6 flex flex-col gap-4 max-w-2xl">
      <h2 className="text-xl font-bold mb-2 text-center">Cargar Campaña Display Ads</h2>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block font-medium mb-1 text-center">Año</label>
          <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} min={2022} max={2100} required
          className="w-full rounded-2xl border-2 border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow transition p-2 text-base placeholder-gray-400 hover:border-violet-400 outline-none"
          />
        </div>
        <div>
          <label className="block font-medium mb-1 text-center">Mes</label>
          <input type="number" value={month} onChange={e => setMonth(Number(e.target.value))} min={1} max={12} required
          className="w-full rounded-2xl border-2 border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow transition p-2 text-base placeholder-gray-400 hover:border-violet-400 outline-none"
          />
        </div>
        <div>
          <label className="block font-medium mb-1 text-center">Nombre Campaña</label>
          <input type="text" value={nombreCampania} onChange={e => setNombreCampania(e.target.value)} required
          className="w-full rounded-2xl border-2 border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow transition p-2 text-base placeholder-gray-400 hover:border-violet-400 outline-none"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block font-medium mb-1 text-center">Inversión ($)</label>
          <input type="number" value={inversion} onChange={e => setInversion(e.target.value)} min={0} step="0.01"
          className="w-full rounded-2xl border-2 border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow transition p-2 text-base placeholder-gray-400 hover:border-violet-400 outline-none"
          />
        </div>
        <div>
          <label className="block font-medium mb-1 text-center">Visitas c/Display</label>
          <input type="number" value={visitasConDisplay} onChange={e => setVisitasConDisplay(e.target.value)} min={0}
          className="w-full rounded-2xl border-2 border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow transition p-2 text-base placeholder-gray-400 hover:border-violet-400 outline-none"
          />
        </div>
        <div>
          <label className="block font-medium mb-1 text-center">Visitas s/Display</label>
          <input type="number" value={visitasSinDisplay} onChange={e => setVisitasSinDisplay(e.target.value)} min={0}
          className="w-full rounded-2xl border-2 border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow transition p-2 text-base placeholder-gray-400 hover:border-violet-400 outline-none"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block font-medium mb-1 text-center">Clics</label>
          <input type="number" value={clics} onChange={e => setClics(e.target.value)} min={0}
          className="w-full rounded-2xl border-2 border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow transition p-2 text-base placeholder-gray-400 hover:border-violet-400 outline-none"
          />
        </div>
        <div>
          <label className="block font-medium mb-1 text-center">Impresiones</label>
          <input type="number" value={impresiones} onChange={e => setImpresiones(e.target.value)} min={0}
          className="w-full rounded-2xl border-2 border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow transition p-2 text-base placeholder-gray-400 hover:border-violet-400 outline-none"
          />
        </div>
        <div>
          <label className="block font-medium mb-1 text-center">Alcance</label>
          <input type="number" value={alcance} onChange={e => setAlcance(e.target.value)} min={0}
          className="w-full rounded-2xl border-2 border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow transition p-2 text-base placeholder-gray-400 hover:border-violet-400 outline-none"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-medium mb-1 text-center">Costo por Visita ($)</label>
          <input type="number" value={costoPorVisita} onChange={e => setCostoPorVisita(e.target.value)} min={0} step="0.01"
          className="w-full rounded-2xl border-2 border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow transition p-2 text-base placeholder-gray-400 hover:border-violet-400 outline-none"
          />
        </div>
      </div>
      {/* Sección de anuncios internos */}
      <div className="mt-4">
        <h3 className="font-semibold mb-2 text-center">Anuncios de la campaña</h3>
        <div className="grid grid-cols-5 gap-2 mb-2">
          <div>
            <label className="block text-xs font-medium mb-1 text-center">Nombre</label>
            <input
              type="text"
              placeholder="Nombre"
              value={anuncio.nombre}
              onChange={e => setAnuncio(a => ({ ...a, nombre: e.target.value }))}
              className="w-full rounded-2xl border-2 border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow transition p-2 text-base placeholder-gray-400 hover:border-violet-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-center">Impresiones</label>
            <input
              type="number"
              placeholder="Impresiones"
              value={anuncio.impresiones}
              onChange={e => setAnuncio(a => ({ ...a, impresiones: Number(e.target.value) }))}
              className="w-full rounded-2xl border-2 border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow transition p-2 text-base placeholder-gray-400 hover:border-violet-400 outline-none"
              min={0}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-center">Clics</label>
            <input
              type="number"
              placeholder="Clics"
              value={anuncio.clics}
              onChange={e => setAnuncio(a => ({ ...a, clics: Number(e.target.value) }))}
              className="w-full rounded-2xl border-2 border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow transition p-2 text-base placeholder-gray-400 hover:border-violet-400 outline-none"
              min={0}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-center">Visitas</label>
            <input
              type="number"
              placeholder="Visitas"
              value={anuncio.visitas}
              onChange={e => setAnuncio(a => ({ ...a, visitas: Number(e.target.value) }))}
              className="w-full rounded-2xl border-2 border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow transition p-2 text-base placeholder-gray-400 hover:border-violet-400 outline-none"
              min={0}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-center">CTR (%)</label>
            <input
              type="number"
              placeholder="CTR (%)"
              value={anuncio.ctr}
              onChange={e => setAnuncio(a => ({ ...a, ctr: Number(e.target.value) }))}
              className="w-full rounded-2xl border-2 border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow transition p-2 text-base placeholder-gray-400 hover:border-violet-400 outline-none"
              min={0}
            />
          </div>
        </div>
        <Button
          type="button"
          onClick={handleAddAnuncio}
          className="bg-[#F23D5E] text-white font-semibold flex items-center gap-2 px-6 py-3 rounded-xl shadow m-2 mx-auto"
        >
          Agregar anuncio
        </Button>
        {/* Lista de anuncios agregados */}
        {anuncios.length > 0 && (
          <table className="min-w-full mt-3 text-sm">
            <thead>
              <tr>
                <th className="px-2 py-1">Nombre</th>
                <th className="px-2 py-1">Impresiones</th>
                <th className="px-2 py-1">Clics</th>
                <th className="px-2 py-1">Visitas</th>
                <th className="px-2 py-1">CTR (%)</th>
                <th className="px-2 py-1"></th>
              </tr>
            </thead>
            <tbody>
              {anuncios.map((a, idx) => (
                <tr key={idx}>
                  <td className="px-2 py-1">{a.nombre}</td>
                  <td className="px-2 py-1">{a.impresiones}</td>
                  <td className="px-2 py-1">{a.clics}</td>
                  <td className="px-2 py-1">{a.visitas}</td>
                  <td className="px-2 py-1">{a.ctr}</td>
                  <td className="px-2 py-1">
                    <button type="button" className="text-red-600" onClick={() => handleRemoveAnuncio(idx)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Button type="submit" disabled={loading}
        className="bg-[#51590E] hover:bg-[#F23D5E] text-white font-semibold flex items-center gap-2 px-6 py-3 rounded-xl shadow m-2"      
      >
        {loading ? "Guardando..." : "Guardar campaña Display Ads"}
      </Button>
    </form>
  );
}
