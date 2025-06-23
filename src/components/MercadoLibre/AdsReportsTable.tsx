import { useState, useEffect } from "react";
import { getAllAds } from "@/services/mercadolibre/mercadolibreService";
import { toast } from "react-toastify";
import { Calendar, Target, DollarSign, Package, TrendingUp, Monitor, Filter, Loader2 } from "lucide-react";

export default function AdsReportsTable() {
  const [allData, setAllData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [availableMonths, setAvailableMonths] = useState<{month: number, year: number, count: number}[]>([]);

  // Cargar datos inicial
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getAllAds();
        setAllData(response.data);
        
        // Calcular meses disponibles
        const monthsMap = new Map<string, {month: number, year: number, count: number}>();
        response.data.forEach((item: any) => {
          const key = `${item.year}-${item.month}`;
          if (monthsMap.has(key)) {
            monthsMap.get(key)!.count++;
          } else {
            monthsMap.set(key, { month: item.month, year: item.year, count: 1 });
          }
        });
        
        const months = Array.from(monthsMap.values())
          .sort((a, b) => b.year !== a.year ? b.year - a.year : b.month - a.month);
        setAvailableMonths(months);
        
        // Auto-seleccionar el mes más reciente si hay datos
        if (months.length > 0) {
          setSelectedYear(months[0].year);
          setSelectedMonth(months[0].month);
        }
      } catch (error) {
        toast.error("Error al cargar las campañas publicitarias");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar datos cuando cambia la selección
  useEffect(() => {
    const filtered = allData.filter(item => 
      item.year === selectedYear && item.month === selectedMonth
    );
    setFilteredData(filtered);
  }, [allData, selectedYear, selectedMonth]);

  // Función para obtener el tipo formateado
  const getTypeInfo = (tipo: string) => {
    const tipoLower = tipo.toLowerCase();
    
    if (tipoLower.includes('product')) {
      return {
        label: 'Product Ads',
        icon: <Package className="w-3 h-3" />,
        colorClass: 'bg-[#D94854]/20 text-[#D94854] border border-[#D94854]/30'
      };
    } else if (tipoLower.includes('brand')) {
      return {
        label: 'Brand Ads',
        icon: <Target className="w-3 h-3" />,
        colorClass: 'bg-[#B695BF]/20 text-[#B695BF] border border-[#B695BF]/30'
      };
    } else if (tipoLower.includes('display')) {
      return {
        label: 'Display Ads',
        icon: <Monitor className="w-3 h-3" />,
        colorClass: 'bg-[#51590E]/20 text-[#51590E] border border-[#51590E]/30'
      };
    } else {
      return {
        label: tipo,
        icon: <TrendingUp className="w-3 h-3" />,
        colorClass: 'bg-white/20 text-white border border-white/30'
      };
    }
  };

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Función para obtener el nombre del mes
  const getMonthName = (month: number) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1];
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-white/60 animate-spin" />
          <p className="text-white/70 text-sm">📊 Cargando campañas publicitarias...</p>
        </div>
      </div>
    );
  }

  if (allData.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <TrendingUp className="w-8 h-8 text-white/40" />
          <p className="text-white/60 text-sm">📊 No hay campañas cargadas aún.</p>
          <p className="text-white/50 text-xs">Los reportes aparecerán aquí una vez que agregues campañas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
      {/* Header de la tabla con filtro */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/10 px-6 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#D94854]" />
            <h3 className="text-lg font-semibold text-white">📊 Campañas Publicitarias</h3>
            <span className="bg-[#D94854]/20 text-[#D94854] px-3 py-1 rounded-lg text-sm font-medium">
              {filteredData.length} campañas
            </span>
          </div>
          
          {/* Selector de mes */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-white/60" />
              <span className="text-white/60 text-sm">Filtrar por mes:</span>
            </div>
            
            <select
              value={`${selectedYear}-${selectedMonth}`}
              onChange={(e) => {
                const [year, month] = e.target.value.split('-');
                setSelectedYear(parseInt(year));
                setSelectedMonth(parseInt(month));
              }}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm backdrop-blur-sm focus:border-[#D94854] focus:outline-none min-w-[160px]"
            >
              {availableMonths.map(({ month, year, count }) => (
                <option 
                  key={`${year}-${month}`} 
                  value={`${year}-${month}`}
                  className="bg-[#212026] text-white"
                >
                  {getMonthName(month)} {year} ({count})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      {filteredData.length === 0 ? (
        <div className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <Calendar className="w-8 h-8 text-white/40" />
            <p className="text-white/60 text-sm">
              📅 No hay campañas para {getMonthName(selectedMonth)} {selectedYear}
            </p>
            <p className="text-white/50 text-xs">
              Selecciona otro mes o agrega nuevas campañas
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                      <Calendar className="w-4 h-4" />
                      Año
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                      <Calendar className="w-4 h-4" />
                      Mes
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                      <Target className="w-4 h-4" />
                      Campaña
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                      <Package className="w-4 h-4" />
                      Tipo
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 text-sm font-medium text-white/80">
                      <DollarSign className="w-4 h-4" />
                      Inversión
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredData.map((r, idx) => {
                  const typeInfo = getTypeInfo(r.tipo || '');
                  
                  return (
                    <tr 
                      key={r.id || idx} 
                      className="hover:bg-white/5 transition-all duration-200 group"
                    >
                      <td className="px-6 py-4">
                        <span className="text-white/80 font-medium">{r.year}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white/80 font-medium">{r.month}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white font-medium group-hover:text-[#D94854] transition-colors">
                          {r.nombreCampania || 'Sin nombre'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`
                          inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium
                          ${typeInfo.colorClass}
                        `}>
                          {typeInfo.icon}
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-[#51590E] font-semibold">
                          {formatCurrency(r.inversion || 0)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer con estadísticas */}
          <div className="bg-white/5 backdrop-blur-sm border-t border-white/10 px-6 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm">
              <div className="flex items-center gap-4">
                <span className="text-white/60">
                  📅 Mostrando: <span className="text-white font-medium">
                    {getMonthName(selectedMonth)} {selectedYear}
                  </span>
                </span>
                <span className="text-white/60">
                  Campañas: <span className="text-white font-medium">{filteredData.length}</span>
                </span>
                <span className="text-white/60">
                  Tipos únicos: <span className="text-white font-medium">
                    {new Set(filteredData.map(r => r.tipo)).size}
                  </span>
                </span>
              </div>
              <span className="text-white/60">
                Inversión del mes: <span className="text-[#51590E] font-semibold">
                  {formatCurrency(filteredData.reduce((sum, r) => sum + (r.inversion || 0), 0))}
                </span>
              </span>
            </div>
          </div>
        </>
      )}

      {/* Información sobre total de campañas */}
      {allData.length > filteredData.length && (
        <div className="bg-white/5 backdrop-blur-sm border-t border-white/10 px-6 py-3">
          <div className="flex items-center justify-center gap-2 text-xs text-white/60">
            <Calendar className="w-3 h-3" />
            💡 Total de campañas en sistema: <span className="text-white font-medium">{allData.length}</span>
            • Disponibles en {availableMonths.length} mes{availableMonths.length !== 1 ? 'es' : ''}
          </div>
        </div>
      )}
    </div>
  );
}