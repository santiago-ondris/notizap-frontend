import { useEffect, useState } from "react";
import { getRankingClientes } from "@/services/cliente/clienteService";
import { type ClienteResumenDto } from "@/types/cliente/cliente";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Medal, 
  Award, 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  Calendar,
  ArrowLeft,
  Users,
  Eye
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  initialOrdenarPor?: "montoTotal" | "cantidadTotal"; // 🔧 CORREGIDO
  initialTop?: number;
  filtros?: any;
}

export default function ClienteRankingTable({ 
  initialOrdenarPor = "montoTotal", // 🔧 CORREGIDO
  initialTop = 10, 
  filtros 
}: Props) {
  const [ordenarPor, setOrdenarPor] = useState<"montoTotal" | "cantidadTotal">(initialOrdenarPor); // 🔧 CORREGIDO
  const [top, setTop] = useState(initialTop);
  const [clientes, setClientes] = useState<ClienteResumenDto[] | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    
    getRankingClientes(ordenarPor, top, filtros)
      .then(setClientes)
      .finally(() => setLoading(false));
  }, [ordenarPor, top, filtros]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="text-[#D94854]" size={24} />;
      case 2:
        return <Medal className="text-[#B695BF]" size={24} />;
      case 3:
        return <Award className="text-[#51590E]" size={24} />;
      default:
        return <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">{position}</div>;
    }
  };

  const getRankBadgeColor = (position: number) => {
    switch (position) {
      case 1:
        return "bg-gradient-to-r from-[#D94854] to-[#F23D5E]";
      case 2:
        return "bg-gradient-to-r from-[#B695BF] to-[#B695BF]/80";
      case 3:
        return "bg-gradient-to-r from-[#51590E] to-[#51590E]/80";
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-500";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#D94854] p-2 rounded-lg">
              <Trophy className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#D94854]">Ranking de Clientes</h1>
              <p className="text-gray-600">Los mejores clientes de Montella</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/clientes")}
            className="flex items-center gap-2 hover:bg-[#B695BF]/10"
          >
            <ArrowLeft size={18} />
            Ver todos los clientes
          </Button>
        </div>

        {/* Controles */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-[#B695BF]" size={20} />
              <span className="font-medium text-gray-700">Ordenar por:</span>
              <Select value={ordenarPor} onValueChange={(value: "montoTotal" | "cantidadTotal") => setOrdenarPor(value)}> {/* 🔧 CORREGIDO */}
                <SelectTrigger className="w-48 border-gray-200 focus:border-[#B695BF]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="montoTotal">💰 Monto gastado</SelectItem> {/* 🔧 CORREGIDO */}
                  <SelectItem value="cantidadTotal">🛒 Cantidad de compras</SelectItem> {/* 🔧 CORREGIDO */}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <Users className="text-[#D94854]" size={20} />
              <span className="font-medium text-gray-700">Mostrar top:</span>
              <Select value={top.toString()} onValueChange={(value: any) => setTop(Number(value))}>
                <SelectTrigger className="w-20 border-gray-200 focus:border-[#D94854]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Ranking Cards */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : !clientes?.length ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
          <div className="text-6xl mb-4 opacity-20">🏆</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay datos para mostrar</h3>
          <p className="text-gray-500">Intenta ajustar los filtros o importar datos de clientes</p>
        </div>
      ) : (
        <div className="space-y-4">
          {clientes.map((cliente, idx) => {
            const position = idx + 1;
            const isTopThree = position <= 3;
            
            return (
              <div
                key={cliente.id}
                onClick={() => navigate(`/clientes/${cliente.id}`)}
                className={`group bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:border-[#B695BF]/30 transition-all duration-300 cursor-pointer overflow-hidden ${
                  isTopThree ? 'ring-2 ring-offset-2' : ''
                } ${
                  position === 1 ? 'ring-[#D94854]/20' :
                  position === 2 ? 'ring-[#B695BF]/20' :
                  position === 3 ? 'ring-[#51590E]/20' : ''
                }`}
              >
                {/* Header con gradiente para top 3 */}
                <div className={`${getRankBadgeColor(position)} p-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 rounded-full p-2">
                        {getRankIcon(position)}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">
                          #{position} - {cliente.nombre}
                        </h3>
                        <div className="flex items-center gap-2 text-white/80">
                          <Eye size={14} />
                          <span className="text-sm">Ver perfil completo</span>
                        </div>
                      </div>
                    </div>
                    {isTopThree && (
                      <div className="bg-white/20 rounded-full px-3 py-1">
                        <span className="text-white text-sm font-bold">
                          {position === 1 ? '🥇 Oro' : position === 2 ? '🥈 Plata' : '🥉 Bronce'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Compras */}
                    <div className="bg-[#D94854]/10 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ShoppingCart className="text-[#D94854]" size={18} />
                        <span className="text-[#D94854] text-sm font-medium">Compras</span>
                      </div>
                      <div className="text-2xl font-bold text-[#212026]">
                        {cliente.cantidadCompras}
                      </div>
                    </div>

                    {/* Monto */}
                    <div className="bg-[#51590E]/10 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="text-[#51590E]" size={18} />
                        <span className="text-[#51590E] text-sm font-medium">Total Gastado</span>
                      </div>
                      <div className="text-lg font-bold text-[#212026] leading-tight">
                        {formatCurrency(cliente.montoTotalGastado)}
                      </div>
                    </div>

                    {/* Primera Compra */}
                    <div className="bg-[#B695BF]/10 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="text-[#B695BF]" size={18} />
                        <span className="text-[#B695BF] text-sm font-medium">Primera</span>
                      </div>
                      <div className="text-sm font-bold text-[#212026]">
                        {formatDate(cliente.fechaPrimeraCompra)}
                      </div>
                    </div>

                    {/* Última Compra */}
                    <div className="bg-gray-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="text-gray-600" size={18} />
                        <span className="text-gray-600 text-sm font-medium">Última</span>
                      </div>
                      <div className="text-sm font-bold text-[#212026]">
                        {formatDate(cliente.fechaUltimaCompra)}
                      </div>
                    </div>
                  </div>

                  {/* Promedio por compra */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Promedio por compra:</span>
                      <span className="font-bold text-[#D94854]">
                        {formatCurrency(cliente.montoTotalGastado / cliente.cantidadCompras)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#B695BF]/5 to-[#D94854]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            );
          })}
        </div>
      )}

      {/* Footer info */}
      {clientes && clientes.length > 0 && (
        <div className="mt-8 bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="text-[#B695BF]" size={20} />
            <h3 className="font-semibold text-gray-800">Estadísticas del Ranking</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#D94854]">
                {formatCurrency(clientes.reduce((sum, c) => sum + c.montoTotalGastado, 0))}
              </div>
              <div className="text-gray-600">Total facturado</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#B695BF]">
                {clientes.reduce((sum, c) => sum + c.cantidadCompras, 0)}
              </div>
              <div className="text-gray-600">Total de compras</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#51590E]">
                {formatCurrency(
                  clientes.reduce((sum, c) => sum + c.montoTotalGastado, 0) / 
                  clientes.reduce((sum, c) => sum + c.cantidadCompras, 0)
                )}
              </div>
              <div className="text-gray-600">Ticket promedio</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}