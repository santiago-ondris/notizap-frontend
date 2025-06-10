import api from "@/api/api";
import type {
  ClienteResumenDto,
  ClienteDetalleDto,
  PagedResult,
} from "@/types/cliente/cliente";

// Obtener todos los clientes (listado paginado)
export const getAllClientes = async (
  pageNumber: number = 1,
  pageSize: number = 20
): Promise<PagedResult<ClienteResumenDto>> => {
  const res = await api.get("/api/v1/clientes", {
    params: { pageNumber, pageSize }
  });
  return res.data;
};

// Obtener el detalle de un cliente por ID
export const getClienteDetalle = async (id: number): Promise<ClienteDetalleDto> => {
  const res = await api.get(`/api/v1/clientes/${id}`);
  return res.data;
};

// Obtener ranking de clientes (por monto o cantidad)
export const getRankingClientes = async (
  ordenarPor: "monto" | "cantidad" = "monto",
  top: number = 10
): Promise<ClienteResumenDto[]> => {
  const res = await api.get(`/api/v1/clientes/ranking?ordenarPor=${ordenarPor}&top=${top}`);
  return res.data;
};

// Buscar clientes por nombre
export const buscarClientesPorNombre = async (
  nombre: string
): Promise<ClienteResumenDto[]> => {
  const res = await api.get(`/api/v1/clientes/buscar?nombre=${encodeURIComponent(nombre)}`);
  return res.data;
};

// Filtrar clientes por criterios avanzados - AHORA CON PAGINACIÓN
export const filtrarClientes = async (
  params: {
    desde?: string;
    hasta?: string;
    canal?: string;
    sucursal?: string;
    marca?: string;
    categoria?: string;
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
  
  // Agregar parámetros de paginación
  query.append("pageNumber", pageNumber.toString());
  query.append("pageSize", pageSize.toString());

  const res = await api.get(`/api/v1/clientes/filtrar?${query.toString()}`);
  return res.data;
};

// ====== NUEVOS ENDPOINTS PARA FILTROS ======

// Obtener canales disponibles
export const getCanalesDisponibles = async (): Promise<string[]> => {
  try {
    const res = await api.get("/api/v1/clientes/filtros/canales");
    return res.data;
  } catch (error) {
    console.warn("Endpoint de canales no disponible, usando fallback");
    throw error;
  }
};

// Obtener sucursales disponibles
export const getSucursalesDisponibles = async (): Promise<string[]> => {
  try {
    const res = await api.get("/api/v1/clientes/filtros/sucursales");
    return res.data;
  } catch (error) {
    console.warn("Endpoint de sucursales no disponible, usando fallback");
    throw error;
  }
};

// Obtener marcas disponibles
export const getMarcasDisponibles = async (): Promise<string[]> => {
  try {
    const res = await api.get("/api/v1/clientes/filtros/marcas");
    return res.data;
  } catch (error) {
    console.warn("Endpoint de marcas no disponible, usando fallback");
    throw error;
  }
};

// Obtener categorías disponibles
export const getCategoriasDisponibles = async (): Promise<string[]> => {
  try {
    const res = await api.get("/api/v1/clientes/filtros/categorias");
    return res.data;
  } catch (error) {
    console.warn("Endpoint de categorías no disponible, usando fallback");
    throw error;
  }
};

// Función híbrida que intenta usar los endpoints específicos, pero hace fallback
export const getFilterOptionsHybrid = async () => {
  const options = {
    canales: [] as string[],
    sucursales: [] as string[],
    marcas: [] as string[],
    categorias: [] as string[]
  };

  try {
    // Intentar endpoints específicos primero
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

  // Si algunos fallaron, hacer fallback usando getAllClientes
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

  // Valores por defecto si todo falla
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