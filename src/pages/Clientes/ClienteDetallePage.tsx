import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getClienteDetalle } from "@/services/cliente/clienteService";
import { type ClienteDetalleDto } from "@/types/cliente/cliente";
import ClienteCard from "@/components/Clientes/ClienteCard";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Trophy, 
  Upload, 
  Users, 
  Package, 
  Tag, 
  Star,
  ShoppingBag,
  Calendar,
  MapPin,
  TrendingUp,
  Activity
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-toastify";

export default function ClienteDetallePage() {
  const { id } = useParams<{ id: string }>();
  const [cliente, setCliente] = useState<ClienteDetalleDto | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { role } = useAuth();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getClienteDetalle(Number(id))
      .then((cli) => {
        console.log("Cliente recibido:", cli);
        console.log("Top productos ejemplo:", cli.topProductos[0]);
        console.log("Top categorias ejemplo:", cli.topCategorias[0]);
        console.log("Top marcas ejemplo:", cli.topMarcas[0]);
        setCliente({
          ...cli,
          compras: Array.isArray(cli.compras) ? cli.compras : [],
          topProductos: Array.isArray(cli.topProductos) ? cli.topProductos : [],
          topCategorias: Array.isArray(cli.topCategorias) ? cli.topCategorias : [],
          topMarcas: Array.isArray(cli.topMarcas) ? cli.topMarcas : [],
        });
      })
      .catch(() => {
        toast.error("No se pudo cargar el cliente");
        setCliente(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

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

  if (cliente) {
    console.log("DETALLES DE TODAS LAS COMPRAS:", cliente.compras.map(c => ({ id: c.id, detalles: c.detalles })));
  }

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
    
    <div className="relative z-10 max-w-7xl mx-auto p-4 pt-8 lg:p-12">
      {/* Header con navegación */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3 mb-4">
          <Button 
            variant="outline" 
            onClick={() => navigate("/clientes")} 
            className="flex items-center gap-2 hover:bg-[#B695BF]/10"
          >
            <ArrowLeft size={18} /> Volver al listado
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate("/clientes/ranking")} 
            className="flex items-center gap-2 hover:bg-[#B695BF]/10"
          >
            <Trophy size={18} className="text-[#B695BF]" /> Ver ranking
          </Button>
          {role === "superadmin" && (
            <Button 
              variant="outline" 
              onClick={() => navigate("/clientes/import")} 
              className="flex items-center gap-2 hover:bg-[#D94854]/10"
            >
              <Upload size={18} className="text-[#D94854]" /> Importar desde Excel
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-80 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      ) : cliente ? (
        <>
          {/* Card principal del cliente */}
          <div className="mb-8">
            <ClienteCard cliente={cliente} />
          </div>

          {/* Top productos/categorías/marcas mejorado */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Top Productos */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-[#D94854] to-[#F23D5E] p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 rounded-full p-2">
                    <Package className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Top Productos</h3>
                    <p className="text-white/80 text-sm">Más comprados</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                {cliente.topProductos.length ? (
                  <div className="space-y-3">
                    {cliente.topProductos.slice(0, 5).map((prod, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-[#D94854]/10 rounded-xl">
                        <div className="flex-1">
                          <div className="font-medium text-[#212026] text-sm leading-tight">
                            {prod.producto}
                          </div>
                          <div className="text-[#D94854] text-xs">
                            {prod.cantidad} unidades
                          </div>
                        </div>
                        <div className="text-[#212026] font-bold text-sm">
                          {formatCurrency(prod.totalGastado)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package size={32} className="mx-auto mb-2 opacity-50" />
                    <p>Sin productos registrados</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Categorías */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-[#B695BF] to-[#B695BF]/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 rounded-full p-2">
                    <Tag className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Top Categorías</h3>
                    <p className="text-white/80 text-sm">Más populares</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                {cliente.topCategorias.length ? (
                  <div className="space-y-3">
                    {cliente.topCategorias.slice(0, 5).map((cat, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-[#B695BF]/10 rounded-xl">
                        <div className="flex-1">
                          <div className="font-medium text-[#212026] text-sm leading-tight">
                            {cat.categoria}
                          </div>
                          <div className="text-[#B695BF] text-xs">
                            {cat.cantidad} productos
                          </div>
                        </div>
                        <div className="text-[#212026] font-bold text-sm">
                          {formatCurrency(cat.totalGastado)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Tag size={32} className="mx-auto mb-2 opacity-50" />
                    <p>Sin categorías registradas</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Marcas */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-[#51590E] to-[#51590E]/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 rounded-full p-2">
                    <Star className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Top Marcas</h3>
                    <p className="text-white/80 text-sm">Favoritas</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                {cliente.topMarcas.length ? (
                  <div className="space-y-3">
                    {cliente.topMarcas.slice(0, 5).map((marca, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-[#51590E]/10 rounded-xl">
                        <div className="flex-1">
                          <div className="font-medium text-[#212026] text-sm leading-tight">
                            {marca.marca}
                          </div>
                          <div className="text-[#51590E] text-xs">
                            {marca.cantidad} productos
                          </div>
                        </div>
                        <div className="text-[#212026] font-bold text-sm">
                          {formatCurrency(marca.totalGastado)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Star size={32} className="mx-auto mb-2 opacity-50" />
                    <p>Sin marcas registradas</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Historial de compras mejorado */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-[#B695BF] to-[#D94854] p-6">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-2">
                  <Activity className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Historial de Compras</h2>
                  <p className="text-white/80">{cliente.compras.length} compras registradas</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {cliente.compras.length ? (
                <div className="space-y-4">
                  {cliente.compras.map((compra) => (
                    <div key={compra.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                      {/* Header de la compra */}
                      <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
                        <div className="flex items-center gap-4">
                          <div className="bg-[#B695BF]/10 rounded-full p-2">
                            <ShoppingBag className="text-[#B695BF]" size={20} />
                          </div>
                          <div>
                            <div className="font-bold text-[#212026]">
                              {formatCurrency(compra.total)}
                            </div>
                            <div className="text-sm text-gray-600">
                              Compra #{compra.id}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <div className="flex items-center gap-1 bg-[#B695BF]/10 px-3 py-1 rounded-full">
                            <Calendar size={14} className="text-[#B695BF]" />
                            <span className="text-[#212026]">{formatDate(compra.fecha)}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-[#51590E]/10 px-3 py-1 rounded-full">
                            <TrendingUp size={14} className="text-[#51590E]" />
                            <span className="text-[#212026]">{compra.canal}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-[#D94854]/10 px-3 py-1 rounded-full">
                            <MapPin size={14} className="text-[#D94854]" />
                            <span className="text-[#212026]">{compra.sucursal}</span>
                          </div>
                        </div>
                      </div>

                      {/* Productos de la compra */}
                      {Array.isArray(compra.detalles) && compra.detalles.length ? (
                        <div className="bg-white rounded-lg p-4 border border-gray-100">
                          <h4 className="font-medium text-[#212026] mb-3 flex items-center gap-2">
                            <Package size={16} className="text-[#B695BF]" />
                            Productos comprados:
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {compra.detalles.map((detalle) => (
                              <div key={detalle.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 text-sm">
                                    {detalle.producto}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {detalle.marca} • {detalle.categoria}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Cantidad: {detalle.cantidad}
                                  </div>
                                </div>
                                <div className="font-bold text-gray-900">
                                  {formatCurrency(detalle.total)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white rounded-lg p-4 text-center text-gray-500">
                          <Package size={24} className="mx-auto mb-2 opacity-50" />
                          <p>Sin detalles de productos</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    Sin historial de compras
                  </h3>
                  <p className="text-gray-500">
                    Este cliente aún no tiene compras registradas en el sistema.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <Users size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Cliente no encontrado</h3>
          <p className="text-gray-500">El cliente que buscas no existe o no tienes permisos para verlo.</p>
          <Button 
            onClick={() => navigate("/clientes")} 
            className="mt-4 bg-[#D94854] hover:bg-[#F23D5E] text-white"
          >
            Volver al listado
          </Button>
        </div>
      )}
    </div>
    </div>
  );
}