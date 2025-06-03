export function paginarArray<T>(array: T[], pagina: number, filasPorPagina: number): T[] {
    const inicio = (pagina - 1) * filasPorPagina;
    return array.slice(inicio, inicio + filasPorPagina);
  }
  
  export function calcularTotalPaginas(totalItems: number, filasPorPagina: number): number {
    return Math.ceil(totalItems / filasPorPagina);
  }