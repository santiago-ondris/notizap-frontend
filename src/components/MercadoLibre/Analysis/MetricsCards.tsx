import { 
    DollarSign, 
    TrendingUp, 
    Target, 
    ShoppingCart, 
    Calendar,
    BarChart3
  } from "lucide-react";
  import { type AnalysisMetrics } from "@/types/mercadolibre/ml";
  
  interface MetricsCardsProps {
    metrics: AnalysisMetrics;
    loading?: boolean;
  }
  
  export default function MetricsCards({ metrics, loading = false }: MetricsCardsProps) {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/10 rounded-lg"></div>
                <div className="h-4 bg-white/10 rounded w-24"></div>
              </div>
              <div className="h-8 bg-white/10 rounded w-20 mb-2"></div>
              <div className="h-3 bg-white/10 rounded w-32"></div>
            </div>
          ))}
        </div>
      );
    }
  
    const formatCurrency = (amount: number) => 
      new Intl.NumberFormat('es-AR', { 
        style: 'currency', 
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
  
    const formatPercentage = (value: number) => 
      `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  
    const getRoiColor = (roi: number) => {
      if (roi >= 50) return 'text-[#51590E]';
      if (roi >= 20) return 'text-[#FFD700]';
      if (roi >= 0) return 'text-[#B695BF]';
      return 'text-[#D94854]';
    };
  
    const getRoiIcon = (roi: number) => {
      if (roi >= 0) return <TrendingUp className="w-4 h-4" />;
      return <TrendingUp className="w-4 h-4 rotate-180" />;
    };
  
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Ventas */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all group">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#51590E]/20 p-2 rounded-lg group-hover:bg-[#51590E]/30 transition-all">
              <DollarSign className="w-5 h-5 text-[#51590E]" />
            </div>
            <h3 className="font-medium text-white/80">💰 Facturación Total</h3>
          </div>
          <div className="text-2xl font-bold text-[#51590E] mb-2">
            {formatCurrency(metrics.totalVentas)}
          </div>
          <p className="text-white/60 text-sm">
            Ingresos acumulados de ventas
          </p>
        </div>
  
        {/* Total Inversión */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all group">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#D94854]/20 p-2 rounded-lg group-hover:bg-[#D94854]/30 transition-all">
              <Target className="w-5 h-5 text-[#D94854]" />
            </div>
            <h3 className="font-medium text-white/80">🎯 Inversión Publicitaria</h3>
          </div>
          <div className="text-2xl font-bold text-[#D94854] mb-2">
            {formatCurrency(metrics.totalInversion)}
          </div>
          <p className="text-white/60 text-sm">
            Total invertido en campañas
          </p>
        </div>
  
        {/* ROI */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all group">
          <div className="flex items-center gap-3 mb-4">
            <div className={`
              p-2 rounded-lg transition-all
              ${metrics.roi >= 0 
                ? 'bg-[#51590E]/20 group-hover:bg-[#51590E]/30' 
                : 'bg-[#D94854]/20 group-hover:bg-[#D94854]/30'
              }
            `}>
              <BarChart3 className={`w-5 h-5 ${getRoiColor(metrics.roi)}`} />
            </div>
            <h3 className="font-medium text-white/80">📊 ROI General</h3>
          </div>
          <div className={`text-2xl font-bold mb-2 flex items-center gap-2 ${getRoiColor(metrics.roi)}`}>
            {formatPercentage(metrics.roi)}
            {getRoiIcon(metrics.roi)}
          </div>
          <p className="text-white/60 text-sm">
            Retorno de inversión publicitaria
          </p>
        </div>
  
        {/* Ticket Promedio */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all group">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#B695BF]/20 p-2 rounded-lg group-hover:bg-[#B695BF]/30 transition-all">
              <ShoppingCart className="w-5 h-5 text-[#B695BF]" />
            </div>
            <h3 className="font-medium text-white/80">🛒 Ticket Promedio</h3>
          </div>
          <div className="text-2xl font-bold text-[#B695BF] mb-2">
            {formatCurrency(metrics.ticketPromedio)}
          </div>
          <p className="text-white/60 text-sm">
            Precio promedio por unidad
          </p>
        </div>
  
        {/* Mejor Mes */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all group">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#FFD700]/20 p-2 rounded-lg group-hover:bg-[#FFD700]/30 transition-all">
              <Calendar className="w-5 h-5 text-[#FFD700]" />
            </div>
            <h3 className="font-medium text-white/80">🏆 Mejor Mes</h3>
          </div>
          <div className="text-2xl font-bold text-[#FFD700] mb-2">
            {metrics.mejorMes}
          </div>
          <p className="text-white/60 text-sm">
            Mes de mayor facturación
          </p>
        </div>
  
        {/* Crecimiento Mensual */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all group">
          <div className="flex items-center gap-3 mb-4">
            <div className={`
              p-2 rounded-lg transition-all
              ${metrics.crecimientoMensual >= 0 
                ? 'bg-[#51590E]/20 group-hover:bg-[#51590E]/30' 
                : 'bg-[#D94854]/20 group-hover:bg-[#D94854]/30'
              }
            `}>
              <TrendingUp className={`
                w-5 h-5 
                ${metrics.crecimientoMensual >= 0 ? 'text-[#51590E]' : 'text-[#D94854] rotate-180'}
              `} />
            </div>
            <h3 className="font-medium text-white/80">📈 Crecimiento Promedio</h3>
          </div>
          <div className={`
            text-2xl font-bold mb-2 flex items-center gap-2
            ${metrics.crecimientoMensual >= 0 ? 'text-[#51590E]' : 'text-[#D94854]'}
          `}>
            {formatPercentage(metrics.crecimientoMensual)}
            {metrics.crecimientoMensual >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingUp className="w-4 h-4 rotate-180" />
            )}
          </div>
          <p className="text-white/60 text-sm">
            Crecimiento mensual promedio
          </p>
        </div>
      </div>
    );
  }