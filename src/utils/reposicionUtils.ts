import { 
    type CurvaTalles, 
    type ConfiguracionAnalisis, 
    type ReposicionPorSucursal,
    type ItemReposicion,
    CURVA_TALLES_DEFECTO,
    SUCURSALES_OBJETIVO,
    ORDEN_PRIORIDAD_DEFECTO,
    COLORES_SUCURSAL,
    type TalleDisponible,
    TALLES_DISPONIBLES
  } from '../types/reposicion/reposicionTypes';
  
  export const crearConfiguracionDefecto = (): ConfiguracionAnalisis => {
    const curvasPorSucursal: Record<string, CurvaTalles> = {};
    
    SUCURSALES_OBJETIVO.forEach(sucursal => {
      curvasPorSucursal[sucursal] = { ...CURVA_TALLES_DEFECTO };
    });
  
    return {
      curvasPorSucursal,
      sucursalesObjetivo: [...SUCURSALES_OBJETIVO],
      ordenPrioridad: [...ORDEN_PRIORIDAD_DEFECTO],
      sucursalesFaltantes: [],
      continuarConSucursalesFaltantes: true
    };
  };
  
  export const clonarCurvaTalles = (curva: CurvaTalles): CurvaTalles => {
    return {
      talle34: curva.talle34,
      talle35: curva.talle35,
      talle36: curva.talle36,
      talle37: curva.talle37,
      talle38: curva.talle38,
      talle39: curva.talle39,
      talle40: curva.talle40,
      talle41: curva.talle41
    };
  };
  
  export const obtenerCantidadPorTalle = (curva: CurvaTalles, talle: number): number => {
    switch (talle) {
      case 34: return curva.talle34;
      case 35: return curva.talle35;
      case 36: return curva.talle36;
      case 37: return curva.talle37;
      case 38: return curva.talle38;
      case 39: return curva.talle39;
      case 40: return curva.talle40;
      case 41: return curva.talle41;
      default: return 0;
    }
  };
  
  export const establecerCantidadPorTalle = (
    curva: CurvaTalles, 
    talle: number, 
    cantidad: number
  ): CurvaTalles => {
    const nuevaCurva = clonarCurvaTalles(curva);
    
    switch (talle) {
      case 34: nuevaCurva.talle34 = cantidad; break;
      case 35: nuevaCurva.talle35 = cantidad; break;
      case 36: nuevaCurva.talle36 = cantidad; break;
      case 37: nuevaCurva.talle37 = cantidad; break;
      case 38: nuevaCurva.talle38 = cantidad; break;
      case 39: nuevaCurva.talle39 = cantidad; break;
      case 40: nuevaCurva.talle40 = cantidad; break;
      case 41: nuevaCurva.talle41 = cantidad; break;
    }
    
    return nuevaCurva;
  };
  
  export const obtenerTodosLosTalles = (curva: CurvaTalles): Record<number, number> => {
    return {
      34: curva.talle34,
      35: curva.talle35,
      36: curva.talle36,
      37: curva.talle37,
      38: curva.talle38,
      39: curva.talle39,
      40: curva.talle40,
      41: curva.talle41
    };
  };
  
  export const calcularTotalUnidadesCurva = (curva: CurvaTalles): number => {
    return Object.values(obtenerTodosLosTalles(curva)).reduce((sum, cantidad) => sum + cantidad, 0);
  };
  
  export const agruparItemsPorProducto = (items: ItemReposicion[]): Record<string, ItemReposicion[]> => {
    return items.reduce((acc, item) => {
      if (!acc[item.producto]) {
        acc[item.producto] = [];
      }
      acc[item.producto].push(item);
      return acc;
    }, {} as Record<string, ItemReposicion[]>);
  };
  
  export const agruparItemsPorProductoColor = (items: ItemReposicion[]): Record<string, ItemReposicion[]> => {
    return items.reduce((acc, item) => {
      const clave = `${item.producto} - ${item.color}`;
      if (!acc[clave]) {
        acc[clave] = [];
      }
      acc[clave].push(item);
      return acc;
    }, {} as Record<string, ItemReposicion[]>);
  };
  
  export const ordenarItemsPorTalle = (items: ItemReposicion[]): ItemReposicion[] => {
    return [...items].sort((a, b) => a.talle - b.talle);
  };
  
  export const calcularEstadisticasReposicion = (reposiciones: ReposicionPorSucursal[]) => {
    const totalSucursales = reposiciones.length;
    const totalItems = reposiciones.reduce((sum, r) => sum + r.totalItems, 0);
    const totalUnidades = reposiciones.reduce((sum, r) => sum + r.totalUnidades, 0);
    
    const sucursalConMasItems = reposiciones.reduce((max, r) => 
      r.totalItems > max.totalItems ? r : max, reposiciones[0] || { nombreSucursal: '', totalItems: 0 });
    
    const sucursalConMasUnidades = reposiciones.reduce((max, r) => 
      r.totalUnidades > max.totalUnidades ? r : max, reposiciones[0] || { nombreSucursal: '', totalUnidades: 0 });
  
    return {
      totalSucursales,
      totalItems,
      totalUnidades,
      promedioItemsPorSucursal: totalSucursales > 0 ? Math.round(totalItems / totalSucursales) : 0,
      promedioUnidadesPorSucursal: totalSucursales > 0 ? Math.round(totalUnidades / totalSucursales) : 0,
      sucursalConMasItems: sucursalConMasItems.nombreSucursal,
      sucursalConMasUnidades: sucursalConMasUnidades.nombreSucursal
    };
  };
  
  export const obtenerColorSucursal = (nombreSucursal: string): string => {
    return COLORES_SUCURSAL[nombreSucursal] || '#FFFFFF';
  };
  
  export const formatearNombreSucursal = (nombreSucursal: string): string => {
    return nombreSucursal
      .split(' ')
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
      .join(' ');
  };
  
  export const abreviarNombreSucursal = (nombreSucursal: string): string => {
    const abreviaciones: Record<string, string> = {
      "DEAN FUNES": "DF",
      "GENERAL PAZ": "GP",
      "25 DE MAYO": "25M",
      "ITUZAINGO NVA CBA": "INC",
      "CASA CENTRAL": "CC"
    };
    
    return abreviaciones[nombreSucursal] || nombreSucursal.substring(0, 3);
  };
  
  export const validarTalle = (talle: number): boolean => {
    return TALLES_DISPONIBLES.includes(talle as TalleDisponible);
  };
  
  export const formatearTalle = (talle: number): string => {
    return `Talle ${talle}`;
  };
  
  export const obtenerRangoTalles = (): { min: number; max: number } => {
    return {
      min: Math.min(...TALLES_DISPONIBLES),
      max: Math.max(...TALLES_DISPONIBLES)
    };
  };
  
  export const generarResumenTexto = (reposiciones: ReposicionPorSucursal[]): string => {
    if (!reposiciones.length) {
      return "No se encontraron ítems para reponer";
    }
  
    const stats = calcularEstadisticasReposicion(reposiciones);
    
    return `${stats.totalItems} ítems únicos, ${stats.totalUnidades} unidades totales para ${stats.totalSucursales} sucursales`;
  };
  
  export const filtrarTallesConStock = (curva: CurvaTalles): number[] => {
    const talles = obtenerTodosLosTalles(curva);
    return Object.entries(talles)
      .filter(([_, cantidad]) => cantidad > 0)
      .map(([talle, _]) => parseInt(talle));
  };
  
  export const compararCurvas = (curva1: CurvaTalles, curva2: CurvaTalles): boolean => {
    const talles1 = obtenerTodosLosTalles(curva1);
    const talles2 = obtenerTodosLosTalles(curva2);
    
    return Object.keys(talles1).every(talle => 
      talles1[parseInt(talle)] === talles2[parseInt(talle)]
    );
  };
  
  export const normalizarNombreArchivo = (nombre: string): string => {
    return nombre
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  };
  
  export const extraerNombreArchivoSinExtension = (nombreCompleto: string): string => {
    return nombreCompleto.replace(/\.[^/.]+$/, '');
  };
  
  export const esArchivoExcel = (archivo: File): boolean => {
    const extension = archivo.name.split('.').pop()?.toLowerCase();
    return extension === 'xlsx' || extension === 'xls';
  };
  
  export const formatearDuracion = (milisegundos: number): string => {
    if (milisegundos < 1000) {
      return `${milisegundos}ms`;
    } else if (milisegundos < 60000) {
      return `${(milisegundos / 1000).toFixed(1)}s`;
    } else {
      const minutos = Math.floor(milisegundos / 60000);
      const segundos = ((milisegundos % 60000) / 1000).toFixed(0);
      return `${minutos}m ${segundos}s`;
    }
  };