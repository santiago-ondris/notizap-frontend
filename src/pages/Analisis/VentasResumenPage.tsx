import React, { useState } from "react";
import { Upload, RotateCcw, Building2, TrendingUp } from "lucide-react";
import { VentasResumenChart } from "@/components/Analisis/ventas/VentasResumenChart";
import { VentasDiariasChart } from "@/components/Analisis/ventas/VentasDiariasChart";
import { VentasSucursalSelector } from "@/components/Analisis/ventas/VentasSucursalSelector";
import { fetchEvolucionVentasResumen } from "@/services/analisis/analisisService";
import { AnalisisNavigation } from "@/components/Analisis/AnalisisNavigation";

// Función para filtrar días sin ventas (para acumulado)
const filtrarDiasSinVentasAcumulado = (fechas: string[], sucursales: any[]) => {
  const indicesConVentas: number[] = [];
  
  fechas.forEach((_, index) => {
    const hayVentas = sucursales.some(sucursal => 
      sucursal.sucursal !== "GLOBAL" && 
      (sucursal.serie[index] > 0 || (index > 0 && sucursal.serie[index] > sucursal.serie[index - 1]))
    );
    
    if (hayVentas) {
      indicesConVentas.push(index);
    }
  });

  return {
    fechas: indicesConVentas.map(i => fechas[i]),
    sucursales: sucursales.map(sucursal => ({
      ...sucursal,
      serie: indicesConVentas.map(i => sucursal.serie[i])
    }))
  };
};

// Función para filtrar días sin ventas (para diario)
const filtrarDiasSinVentasDiario = (fechas: string[], sucursales: any[]) => {
  // Primero convertir a ventas diarias
  const sucursalesSinGlobal = sucursales.filter(s => s.sucursal !== "GLOBAL");
  const sucursalesDiarias = sucursalesSinGlobal.map(sucursal => {
    const ventasDiarias = sucursal.serie.map((valorAcumulado: number, index: number) => {
      if (index === 0) return valorAcumulado;
      return Math.max(0, valorAcumulado - sucursal.serie[index - 1]);
    });
    return { ...sucursal, serie: ventasDiarias };
  });

  // Luego filtrar días donde todas las sucursales tienen 0 ventas diarias
  const indicesConVentas: number[] = [];
  
  fechas.forEach((_, index) => {
    const hayVentas = sucursalesDiarias.some(sucursal => sucursal.serie[index] > 0);
    if (hayVentas) {
      indicesConVentas.push(index);
    }
  });

  return {
    fechas: indicesConVentas.map(i => fechas[i]),
    sucursales: sucursales.map(sucursal => ({
      ...sucursal,
      serie: indicesConVentas.map(i => sucursal.serie[i])
    }))
  };
};

const VentasResumenPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [, setArchivo] = useState<File | null>(null);
  const [sucursalesSeleccionadas, setSucursalesSeleccionadas] = useState<string[]>([]);
  const [tipoVista, setTipoVista] = useState<'cantidad' | 'facturacion'>('cantidad');

  const handleUpload = async (file: File) => {
    setLoading(true);
    try {
      const resultado = await fetchEvolucionVentasResumen(file);
      console.log('Resultado completo:', resultado);
      setData(resultado);
      setArchivo(file);
      
      // Auto-seleccionar todas las sucursales al cargar (excepto GLOBAL y Sin Sucursal)
      const sucursalesDisponibles = (resultado.cantidad?.sucursales || [])
        .filter((s: any) => 
          s.sucursal !== "GLOBAL" && 
          s.sucursal !== "Sin Sucursal" &&
          !s.sucursal.toLowerCase().includes("sin sucursal")
        )
        .map((s: any) => s.sucursal);
      setSucursalesSeleccionadas(sucursalesDisponibles);
    } catch (err) {
      console.error('Error:', err);
      alert("Error procesando el archivo. Verifica que sea un Excel válido.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setData(null);
    setArchivo(null);
    setSucursalesSeleccionadas([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
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

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-center">
          <AnalisisNavigation />
        </div>

        {/* Nuevo analisis */}
        <div className="flex justify-center mb-4">
          {data && (
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all flex items-center gap-2 text-white/80 hover:text-white"
              >
                <RotateCcw className="w-4 h-4" />
                Nuevo análisis
              </button>
            </div>
          )}
        </div>  

        {/* Content */}
        {!data ? (
          /* Upload Form */
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-[#D94854]/20 rounded-2xl flex items-center justify-center mx-auto">
                <Upload className="w-10 h-10 text-[#D94854]" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  Cargar Archivo de Ventas
                </h2>
                <p className="text-white/60 max-w-md mx-auto">
                  Sube tu archivo Excel de ventas para ver el resumen agregado por sucursal
                </p>
              </div>

              <div className="max-w-sm mx-auto">
                <label className="block">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    disabled={loading}
                    className="hidden"
                  />
                  <div className="w-full p-4 bg-[#D94854]/20 hover:bg-[#D94854]/30 border-2 border-dashed border-[#D94854]/40 hover:border-[#D94854]/60 rounded-xl transition-all cursor-pointer group">
                    {loading ? (
                      <div className="flex items-center justify-center gap-3 text-[#D94854]">
                        <div className="w-5 h-5 border-2 border-[#D94854] border-t-transparent rounded-full animate-spin"></div>
                        <span className="font-medium">Procesando...</span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-[#D94854] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                        <div className="text-[#D94854] font-medium group-hover:text-[#F23D5E]">
                          Seleccionar archivo Excel
                        </div>
                        <div className="text-white/50 text-sm mt-1">
                          Solo archivos .xlsx y .xls
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              <div className="text-white/50 text-sm">
                💡 El archivo debe contener las columnas: FECHA, NRO, PRODUCTO, CANT, TOTAL
              </div>
            </div>
          </div>
        ) : (
          /* Results */
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 text-center">
                <div className="text-2xl font-bold text-[#D94854] mb-1">
                  {(data.cantidad?.sucursales?.length || 0) - 1}
                </div>
                <div className="text-white/60 text-sm">Sucursales</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 text-center">
                <div className="text-2xl font-bold text-[#B695BF] mb-1">
                  {data.fechas?.length || 0}
                </div>
                <div className="text-white/60 text-sm">Días con ventas</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 text-center">
                <div className="text-2xl font-bold text-[#51590E] mb-1">
                  {(() => {
                    const sucursalesActuales = tipoVista === 'cantidad' ? data.cantidad?.sucursales : data.facturacion?.sucursales;
                    const globalSucursal = sucursalesActuales?.find((s: any) => s.sucursal === "GLOBAL");
                    const totalVentas = globalSucursal?.serie[globalSucursal.serie.length - 1] || 0;
                    return tipoVista === 'cantidad' 
                      ? totalVentas.toLocaleString()
                      : `$${totalVentas.toLocaleString()}`;
                  })()}
                </div>
                <div className="text-white/60 text-sm">
                  {tipoVista === 'cantidad' ? 'Unidades Totales' : 'Facturación Total'}
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 text-center">
                <div className="text-2xl font-bold text-[#FFD700] mb-1">
                  {data.fechas?.[0]?.slice(8) + '-' + data.fechas?.[0]?.slice(5, 7)} - {data.fechas?.[data.fechas.length - 1]?.slice(8) + '-' + data.fechas?.[data.fechas.length - 1]?.slice(5, 7)}
                </div>
                <div className="text-white/60 text-sm">Período</div>
              </div>
            </div>

            {/* Switcher Cantidad/Facturación */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#D94854]" />
                Tipo de análisis
              </h3>
              
              <div className="flex items-center gap-4">
                <div className="flex bg-white/10 rounded-lg p-1 border border-white/20">
                  <button
                    onClick={() => setTipoVista('cantidad')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      tipoVista === 'cantidad'
                        ? 'bg-[#51590E] text-white shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    📦 Por Cantidad
                  </button>
                  <button
                    onClick={() => setTipoVista('facturacion')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      tipoVista === 'facturacion'
                        ? 'bg-[#B695BF] text-white shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    💰 Por Facturación
                  </button>
                </div>
                
                <div className="text-white/60 text-sm">
                  {tipoVista === 'cantidad' 
                    ? 'Análisis basado en unidades vendidas' 
                    : 'Análisis basado en montos facturados'
                  }
                </div>
              </div>
            </div>    
            
            {/* Selector de sucursales */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-white font-semibold mb-4">Seleccionar sucursales</h3>
              <VentasSucursalSelector
                sucursales={tipoVista === 'cantidad' ? data.cantidad?.sucursales || [] : data.facturacion?.sucursales || []}
                sucursalesSeleccionadas={sucursalesSeleccionadas}
                setSucursalesSeleccionadas={setSucursalesSeleccionadas}
                tipoVista={tipoVista}
              />
            </div>

            {/* Charts */}
            <div className="space-y-8">
              {(() => {
                const sucursalesActuales = tipoVista === 'cantidad' ? data.cantidad?.sucursales || [] : data.facturacion?.sucursales || [];
                const datosAcumulado = filtrarDiasSinVentasAcumulado(data.fechas || [], sucursalesActuales);
                const datosDiario = filtrarDiasSinVentasDiario(data.fechas || [], sucursalesActuales);
                return (
                  <>
                    {/* Gráfico 1: Ventas Acumuladas */}
                    <VentasResumenChart 
                      fechas={datosAcumulado.fechas}
                      sucursales={datosAcumulado.sucursales}
                      sucursalesSeleccionadas={sucursalesSeleccionadas}
                      tipoVista={tipoVista}
                    />
                    
                    {/* Gráfico 2: Ventas Diarias */}
                    <VentasDiariasChart 
                      fechas={datosDiario.fechas}
                      sucursales={datosDiario.sucursales}
                      sucursalesSeleccionadas={sucursalesSeleccionadas}
                      tipoVista={tipoVista}
                    />
                  </>
                );
              })()}
            </div>

            {/* Sucursales List */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#B695BF]" />
                Detalle por Sucursal
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(tipoVista === 'cantidad' ? data.cantidad?.sucursales || [] : data.facturacion?.sucursales || []).map((sucursal: any, index: number) => {
                  const ventasFinales = sucursal.serie?.[sucursal.serie.length - 1] || 0;
                  const ventasIniciales = sucursal.serie?.[0] || 0;
                  const crecimiento = ventasIniciales > 0 
                    ? ((ventasFinales - ventasIniciales) / ventasIniciales * 100)
                    : 0;
                  
                  return (
                    <div key={`${sucursal.sucursal}-${tipoVista}-${index}`} className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex items-center gap-3 mb-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: sucursal.color }}
                        />
                        <span className="text-white font-medium">
                          {sucursal.sucursal === "GLOBAL" ? "🌍 Global" : `🏢 ${sucursal.sucursal}`}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Total:</span>
                          <span className="text-white font-medium">
                            {tipoVista === 'cantidad' 
                              ? ventasFinales.toLocaleString() 
                              : `$${ventasFinales.toLocaleString()}`
                            }
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Crecimiento:</span>
                          <span className={`font-medium ${crecimiento >= 0 ? 'text-[#51590E]' : 'text-[#D94854]'}`}>
                            {crecimiento >= 0 ? '+' : ''}{crecimiento.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VentasResumenPage;