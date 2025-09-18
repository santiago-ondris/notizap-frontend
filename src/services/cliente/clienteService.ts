import api from "@/api/api";
import type {
  ClienteResumenDto,
  ClienteDetalleDto,
  PagedResult,
} from "@/types/cliente/cliente";

export const getAllClientes = async (
  pageNumber: number = 1,
  pageSize: number = 20
): Promise<PagedResult<ClienteResumenDto>> => {
  const res = await api.get("/api/v1/clientes", {
    params: { pageNumber, pageSize }
  });
  return res.data;
};

export const getClienteDetalle = async (id: number): Promise<ClienteDetalleDto> => {
  const res = await api.get(`/api/v1/clientes/${id}`);
  return res.data;
};

export const getRankingClientes = async (
  ordenarPor: "montoTotal" | "cantidadTotal" | "montoCategoria" | "cantidadCategoria" | "fechaReciente" | "fechaAntigua" = "montoTotal",
  top: number = 10,
  filtros?: any
): Promise<ClienteResumenDto[]> => {
  try {
    const params = new URLSearchParams({
      ordenarPor,
      top: top.toString()
    });

    if (filtros) {
      if (filtros.desde) params.append('desde', filtros.desde);
      if (filtros.hasta) params.append('hasta', filtros.hasta);
      if (filtros.canal) params.append('canal', filtros.canal);
      if (filtros.sucursal) params.append('sucursal', filtros.sucursal);
      if (filtros.marca) params.append('marca', filtros.marca);
      if (filtros.categoria) params.append('categoria', filtros.categoria);
      
      if (filtros.modoExclusivoCanal) params.append('modoExclusivoCanal', 'true');
      if (filtros.modoExclusivoSucursal) params.append('modoExclusivoSucursal', 'true');
      if (filtros.modoExclusivoMarca) params.append('modoExclusivoMarca', 'true');
      if (filtros.modoExclusivoCategoria) params.append('modoExclusivoCategoria', 'true');
    }

    const response = await api.get(`/api/v1/clientes/ranking?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error getting ranking clientes:", error);
    throw error;
  }
};
export const buscarClientesPorNombre = async (
  nombre: string
): Promise<ClienteResumenDto[]> => {
  const res = await api.get(`/api/v1/clientes/buscar?nombre=${encodeURIComponent(nombre)}`);
  return res.data;
};

export const filtrarClientes = async (
  params: {
    desde?: string;
    hasta?: string;
    canal?: string;
    sucursal?: string;
    marca?: string;
    categoria?: string;
    modoExclusivoCanal?: boolean;
    modoExclusivoSucursal?: boolean;
    modoExclusivoMarca?: boolean;
    modoExclusivoCategoria?: boolean;
    ordenarPor?: string;
  },
  pageNumber: number = 1,
  pageSize: number = 12
): Promise<PagedResult<ClienteResumenDto>> => {

  const query = new URLSearchParams();
  
  if (params.desde) query.append("desde", params.desde);
  if (params.hasta) query.append("hasta", params.hasta);
  if (params.canal) query.append("canal", params.canal);
  if (params.sucursal) query.append("sucursal", params.sucursal);
  if (params.marca) query.append("marca", params.marca);
  if (params.categoria) query.append("categoria", params.categoria);
  
  if (params.modoExclusivoCanal) query.append("modoExclusivoCanal", "true");
  if (params.modoExclusivoSucursal) query.append("modoExclusivoSucursal", "true");
  if (params.modoExclusivoMarca) query.append("modoExclusivoMarca", "true");
  if (params.modoExclusivoCategoria) query.append("modoExclusivoCategoria", "true");

  if (params.ordenarPor) query.append("ordenarPor", params.ordenarPor);
  
  query.append("pageNumber", pageNumber.toString());
  query.append("pageSize", pageSize.toString());

  const res = await api.get(`/api/v1/clientes/filtrar?${query.toString()}`);
  return res.data;
};

export const getCanalesDisponibles = async (): Promise<string[]> => {
  try {
    const res = await api.get("/api/v1/clientes/filtros/canales");
    return res.data;
  } catch (error) {
    console.warn("Endpoint de canales no disponible, usando fallback");
    throw error;
  }
};

export const getSucursalesDisponibles = async (): Promise<string[]> => {
  try {
    const res = await api.get("/api/v1/clientes/filtros/sucursales");
    return res.data;
  } catch (error) {
    console.warn("Endpoint de sucursales no disponible, usando fallback");
    throw error;
  }
};

export const getMarcasDisponibles = async (): Promise<string[]> => {
  try {
    const res = await api.get("/api/v1/clientes/filtros/marcas");
    return res.data;
  } catch (error) {
    console.warn("Endpoint de marcas no disponible, usando fallback");
    throw error;
  }
};

export const getCategoriasDisponibles = async (): Promise<string[]> => {
  try {
    const res = await api.get("/api/v1/clientes/filtros/categorias");
    return res.data;
  } catch (error) {
    console.warn("Endpoint de categorías no disponible, usando fallback");
    throw error;
  }
};

export const getFilterOptionsHybrid = async () => {
  const options = {
    canales: [] as string[],
    sucursales: [] as string[],
    marcas: [] as string[],
    categorias: [] as string[]
  };

  try {
    const [canales, sucursales, marcas, categorias] = await Promise.allSettled([
      getCanalesDisponibles(),
      getSucursalesDisponibles(), 
      getMarcasDisponibles(),
      getCategoriasDisponibles()
    ]);

    options.canales = canales.status === 'fulfilled' ? canales.value : [];
    options.sucursales = sucursales.status === 'fulfilled' ? sucursales.value : [];
    options.marcas = marcas.status === 'fulfilled' ? marcas.value : [];
    options.categorias = categorias.status === 'fulfilled' ? categorias.value : [];

  } catch (error) {
    console.warn("Endpoints específicos no disponibles, usando fallback con getAllClientes");
  }

  if (options.canales.length === 0 || options.sucursales.length === 0) {
    try {
      const clientesData = await getAllClientes(1, 1000);
      const clientes = clientesData.items;
      
      if (options.canales.length === 0) {
        const canalesSet = new Set<string>();
        clientes.forEach(cliente => {
          if (cliente.canales) {
            cliente.canales.split(',').forEach(canal => {
              const canalLimpio = canal.trim();
              if (canalLimpio) canalesSet.add(canalLimpio);
            });
          }
        });
        options.canales = Array.from(canalesSet).sort();
      }

      if (options.sucursales.length === 0) {
        const sucursalesSet = new Set<string>();
        clientes.forEach(cliente => {
          if (cliente.sucursales) {
            cliente.sucursales.split(',').forEach(sucursal => {
              const sucursalLimpia = sucursal.trim();
              if (sucursalLimpia) sucursalesSet.add(sucursalLimpia);
            });
          }
        });
        options.sucursales = Array.from(sucursalesSet).sort();
      }

    } catch (fallbackError) {
      console.error("Error en fallback también:", fallbackError);
    }
  }

  if (options.canales.length === 0) {
    options.canales = ['KIBOO', 'WOOCOMMERCE', 'MERCADOLIBRE', 'E-COMMERCE'];
  }
  if (options.sucursales.length === 0) {
    options.sucursales = ['Centro', 'Nueva Córdoba', 'General Paz', 'Peatonal', 'Dean Funes'];
  }
  if (options.marcas.length === 0) {
    options.marcas = ['Dean Funes', 'Nueva Córdoba', 'General Paz', 'Peatonal'];
  }
  if (options.categorias.length === 0) {
    options.categorias = ['Calzado', 'Botas', 'Zapatillas', 'Sandalias', 'Accesorios'];
  }

  return options;
};

export const actualizarTelefonoCliente = async (clienteId: number, telefono: string): Promise<void> => {
  await api.patch(`/api/v1/clientes/${clienteId}/telefono`, {
    telefono: telefono
  });
};

export async function exportarClientesExcel(filtros: any): Promise<void> {
  try {
    const params = new URLSearchParams();
    
    if (filtros?.desde) params.append('desde', filtros.desde);
    if (filtros?.hasta) params.append('hasta', filtros.hasta);
    if (filtros?.canal) params.append('canal', filtros.canal);
    if (filtros?.sucursal) params.append('sucursal', filtros.sucursal);
    if (filtros?.marca) params.append('marca', filtros.marca);
    if (filtros?.categoria) params.append('categoria', filtros.categoria);

    if (filtros?.modoExclusivoCanal) params.append('modoExclusivoCanal', 'true');
    if (filtros?.modoExclusivoSucursal) params.append('modoExclusivoSucursal', 'true');
    if (filtros?.modoExclusivoMarca) params.append('modoExclusivoMarca', 'true');
    if (filtros?.modoExclusivoCategoria) params.append('modoExclusivoCategoria', 'true');

    if (filtros?.ordenarPor) params.append('ordenarPor', filtros.ordenarPor);

    const response = await api.get(`/api/v1/clientes/export/excel?${params.toString()}`, {
      responseType: 'blob'
    });

    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    link.download = `clientes_${fecha}.xlsx`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('Excel exportado exitosamente');
  } catch (error) {
    console.error('Error al exportar Excel:', error);
    throw error;
  }
}