import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { DollarSign, Package, Target, Monitor } from "lucide-react";

interface InvestmentItem {
  tipo: string;
  inversion: number;
  porcentaje: number;
}

interface InvestmentDistributionProps {
  data: InvestmentItem[];
  loading?: boolean;
}

export default function InvestmentDistribution({ data, loading = false }: InvestmentDistributionProps) {
  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-white/10 rounded w-48 mb-4"></div>
          <div className="h-80 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <DollarSign className="w-8 h-8 text-white/40" />
          <p className="text-white/60 text-sm">💰 No hay datos de inversión para mostrar.</p>
        </div>
      </div>
    );
  }

  const colors = ['#D94854', '#B695BF', '#51590E', '#FFD700', '#F23D5E'];

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('es-AR', { 
      style: 'currency', 
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: value >= 1000000 ? 'compact' : 'standard'
    }).format(value);

  const getTypeIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'productads':
      case 'product':
        return <Package className="w-4 h-4" />;
      case 'brandads':
      case 'brand':
        return <Target className="w-4 h-4" />;
      case 'displayads':
      case 'display':
        return <Monitor className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'productads':
      case 'product':
        return '📦 Product Ads';
      case 'brandads':
      case 'brand':
        return '🎯 Brand Ads';
      case 'displayads':
      case 'display':
        return '📺 Display Ads';
      default:
        return tipo;
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#212026] border border-white/20 rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            {getTypeIcon(data.tipo)}
            <p className="text-white font-medium">{getTypeLabel(data.tipo)}</p>
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-white/80">
              <strong>Inversión:</strong> {formatCurrency(data.inversion)}
            </p>
            <p className="text-white/80">
              <strong>Porcentaje:</strong> {data.porcentaje.toFixed(1)}%
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const totalInversion = data.reduce((sum, item) => sum + item.inversion, 0);

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
              <DollarSign className="w-7 h-7 text-[#D94854]" />
              💰 Distribución de Inversión Publicitaria
            </h2>
            <p className="text-white/60">
              Análisis de distribución del presupuesto por tipo de campaña
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-[#D94854]">
              {formatCurrency(totalInversion)}
            </div>
            <div className="text-white/60 text-sm">Inversión Total</div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* Gráfico de pie */}
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4 text-center">
            📊 Distribución Visual
          </h3>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="inversion"
                  label={({ porcentaje }) => `${porcentaje.toFixed(1)}%`}
                  labelLine={false}
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detalles y estadísticas */}
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4">
            📋 Detalles por Tipo
          </h3>
          
          <div className="space-y-4 flex-1">
            {data.map((item, index) => (
              <div 
                key={index} 
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                    <div className="flex items-center gap-2">
                      {getTypeIcon(item.tipo)}
                      <span className="font-medium text-white">{getTypeLabel(item.tipo)}</span>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-white">
                    {item.porcentaje.toFixed(1)}%
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Inversión:</span>
                    <span className="text-white font-medium">{formatCurrency(item.inversion)}</span>
                  </div>
                  
                  {/* Barra de progreso */}
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${item.porcentaje}%`,
                        backgroundColor: colors[index % colors.length]
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Insights */}
          <div className="mt-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <h4 className="font-medium text-white mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#FFD700]" />
              💡 Insights de Inversión
            </h4>
            <div className="space-y-2 text-sm text-white/70">
              {data.length > 0 && (
                <>
                  <p>
                    • <strong className="text-white">Tipo dominante:</strong> {getTypeLabel(data[0].tipo)} ({data[0].porcentaje.toFixed(1)}%)
                  </p>
                  {data.length > 1 && (
                    <p>
                      • <strong className="text-white">Diversificación:</strong> {
                        data.length === 1 ? 'Concentrada en un tipo' :
                        data.length === 2 ? 'Distribuida en 2 tipos' :
                        `Diversificada en ${data.length} tipos`
                      }
                    </p>
                  )}
                  <p>
                    • <strong className="text-white">Recomendación:</strong> {
                      data[0].porcentaje > 70 ? 'Considerar diversificar' :
                      data[0].porcentaje > 50 ? 'Distribución balanceada' :
                      'Excelente diversificación'
                    }
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-white/5 border-t border-white/10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm">
          <div className="flex items-center gap-4">
            <span className="text-white/60">
              📊 Tipos de campaña: <span className="text-white font-medium">{data.length}</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-white/60">
              💰 Presupuesto total: <span className="text-[#D94854] font-semibold">
                {formatCurrency(totalInversion)}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}