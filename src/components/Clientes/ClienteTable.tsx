import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { filtrarClientes, getAllClientes } from "@/services/cliente/clienteService";
import { type ClienteResumenDto, type PagedResult } from "@/types/cliente/cliente";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-toastify";
import ClienteCard from "@/components/Clientes/ClienteCard";
import { 
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface Props {
  clientes?: PagedResult<ClienteResumenDto> | null;
  activeFilters?: any;
}

export default function ClienteTable({ clientes, activeFilters }: Props) {
  const [data, setData] = useState<PagedResult<ClienteResumenDto> | null>(clientes ?? null);
  const [loading, setLoading] = useState(!clientes);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const navigate = useNavigate();

  useEffect(() => {
    if (clientes && !activeFilters) {
      setPage(1);
    }
  }, [clientes, activeFilters]);

  useEffect(() => {
    if (activeFilters) {
      setLoading(true);
      filtrarClientes(activeFilters, page, pageSize)
        .then(setData)
        .catch(() => {
          setData(null);
          toast.error("Error al cargar los clientes filtrados");
        })
        .finally(() => setLoading(false));
      return;
    }

    if (clientes) {
      setData(clientes);
      setLoading(false);
      return;
    }

    setLoading(true);
    getAllClientes(page, pageSize)
      .then(setData)
      .catch(() => {
        setData(null);
        toast.error("Error al cargar los clientes");
      })
      .finally(() => setLoading(false));
  }, [page, pageSize, clientes, activeFilters]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center mt-6">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <Skeleton className="h-6 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (!data || !data.items.length) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center mt-6">
        <div className="text-6xl mb-4 opacity-20">👥</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay clientes para mostrar</h3>
        <p className="text-gray-500">Intenta ajustar los filtros o importar nuevos clientes</p>
      </div>
    );
  }

  const handleClienteUpdated = (clienteActualizado: ClienteResumenDto) => {
    setData(prevData => {
      if (!prevData) return prevData;
      return {
        ...prevData,
        items: prevData.items.map(cliente => 
          cliente.id === clienteActualizado.id ? clienteActualizado : cliente
        )
      };
    });
  };

  return (
    <div className="mt-6">
      {/* Grid optimizado de Cards */}
      <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
        {data.items.map((cliente) => (
          <ClienteCard
            key={cliente.id}
            cliente={cliente}
            onClienteUpdated={handleClienteUpdated}
            onVerDetalles={() => navigate(`/clientes/${cliente.id}`)} // ✅ CAMBIO: onCardClick → onVerDetalles
          />
        ))}
      </div>

      {/* Paginador mejorado */}
      {data && (
        <div className="flex justify-between items-center mt-8 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft size={16} />
            Anterior
          </button>
          
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              Página <span className="font-bold text-[#D94854]">{data.pageNumber}</span> de{' '}
              <span className="font-bold text-[#B695BF]">{data.totalPages}</span>
            </span>
            <div className="text-sm text-gray-500">
              {data.items.length} de {data.totalRecords} {activeFilters ? 'resultados filtrados' : 'clientes'}
            </div>
          </div>
          
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
          >
            Siguiente
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}