import { filtrarClientes } from "./clienteService";

export interface FilterOptions {
  canales: string[];
  sucursales: string[];
  marcas: string[];
  categorias: string[];
}

let cachedOptions: FilterOptions | null = null;

export const getFilterOptions = async (): Promise<FilterOptions> => {
  // Si ya tenemos las opciones en caché, devolverlas
  if (cachedOptions) {
    return cachedOptions;
  }

  try {
    // Obtener todos los clientes sin filtros para extraer las opciones
    const todosLosClientes = await filtrarClientes({});
    
    const canalesSet = new Set<string>();
    const sucursalesSet = new Set<string>();
    const marcasSet = new Set<string>();
    const categoriasSet = new Set<string>();

    todosLosClientes.forEach(cliente => {
      // Procesar canales
      if (cliente.canales) {
        cliente.canales.split(',').forEach(canal => {
          const canalLimpio = canal.trim();
          if (canalLimpio) canalesSet.add(canalLimpio);
        });
      }

      // Procesar sucursales
      if (cliente.sucursales) {
        cliente.sucursales.split(',').forEach(sucursal => {
          const sucursalLimpia = sucursal.trim();
          if (sucursalLimpia) sucursalesSet.add(sucursalLimpia);
        });
      }
    });

    // Para marcas y categorías necesitaríamos acceso a las compras
    // Por ahora usamos valores comunes basados en lo que veo en tus datos
    const marcasComunes = [
      'Dean Funes', 'Nueva Córdoba', 'General Paz', 'Peatonal'
    ];
    
    const categoriasComunes = [
      'Calzado', 'Botas', 'Zapatillas', 'Sandalias', 'Accesorios'
    ];

    marcasComunes.forEach(marca => marcasSet.add(marca));
    categoriasComunes.forEach(categoria => categoriasSet.add(categoria));

    const options: FilterOptions = {
      canales: Array.from(canalesSet).sort(),
      sucursales: Array.from(sucursalesSet).sort(),
      marcas: Array.from(marcasSet).sort(),
      categorias: Array.from(categoriasSet).sort()
    };

    // Guardar en caché
    cachedOptions = options;
    
    return options;
  } catch (error) {
    console.error('Error obteniendo opciones de filtro:', error);
    
    // Valores por defecto en caso de error
    return {
      canales: ['KIBOO', 'WOOCOMMERCE', 'MERCADOLIBRE', 'E-COMMERCE'],
      sucursales: ['Centro', 'Nueva Córdoba', 'General Paz', 'Peatonal', 'Dean Funes'],
      marcas: ['Dean Funes', 'Nueva Córdoba', 'General Paz', 'Peatonal'],
      categorias: ['Calzado', 'Botas', 'Zapatillas', 'Sandalias', 'Accesorios']
    };
  }
};

// Función para limpiar el caché si es necesario
export const clearFilterOptionsCache = () => {
  cachedOptions = null;
};