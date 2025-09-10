import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Package, 
  Hash, 
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import type { ReposicionPorSucursal } from '../../types/reposicion/reposicionTypes';
import { obtenerColorSucursal, agruparItemsPorProductoColor } from '../../utils/reposicionUtils';

interface TablaReposicionProps {
  reposicion: ReposicionPorSucursal;
  mostrarSucursal?: boolean;
  compacta?: boolean;
  maxHeight?: string;
}

type OrdenColumna = 'producto' | 'color' | 'talle' | 'cantidad' | 'stockActual' | 'stockIdeal';
type DireccionOrden = 'asc' | 'desc';

export const TablaReposicion: React.FC<TablaReposicionProps> = ({
  reposicion,
  mostrarSucursal = false,
  compacta = false,
  maxHeight = '400px'
}) => {
  const [productosExpandidos, setProductosExpandidos] = useState<Set<string>>(new Set());
  const [ordenColumna, setOrdenColumna] = useState<OrdenColumna>('producto');
  const [direccionOrden, setDireccionOrden] = useState<DireccionOrden>('asc');
  
  const color = obtenerColorSucursal(reposicion.nombreSucursal);
  
  const itemsOrdenados = useMemo(() => {
    const items = [...reposicion.items];
    
    return items.sort((a, b) => {
      let comparacion = 0;
      
      switch (ordenColumna) {
        case 'producto':
          comparacion = a.producto.localeCompare(b.producto);
          break;
        case 'color':
          comparacion = a.color.localeCompare(b.color);
          break;
        case 'talle':
          comparacion = a.talle - b.talle;
          break;
        case 'cantidad':
          comparacion = a.cantidadAReponer - b.cantidadAReponer;
          break;
        case 'stockActual':
          comparacion = a.stockActual - b.stockActual;
          break;
        case 'stockIdeal':
          comparacion = a.stockIdeal - b.stockIdeal;
          break;
      }
      
      return direccionOrden === 'asc' ? comparacion : -comparacion;
    });
  }, [reposicion.items, ordenColumna, direccionOrden]);

  const productosAgrupados = useMemo(() => {
    return agruparItemsPorProductoColor(itemsOrdenados);
  }, [itemsOrdenados]);

  const manejarOrdenamiento = (columna: OrdenColumna) => {
    if (ordenColumna === columna) {
      setDireccionOrden(direccionOrden === 'asc' ? 'desc' : 'asc');
    } else {
      setOrdenColumna(columna);
      setDireccionOrden('asc');
    }
  };

  const alternarExpansion = (claveProducto: string) => {
    const nuevosExpandidos = new Set(productosExpandidos);
    if (nuevosExpandidos.has(claveProducto)) {
      nuevosExpandidos.delete(claveProducto);
    } else {
      nuevosExpandidos.add(claveProducto);
    }
    setProductosExpandidos(nuevosExpandidos);
  };

  const expandirTodos = () => {
    setProductosExpandidos(new Set(Object.keys(productosAgrupados)));
  };

  const contraerTodos = () => {
    setProductosExpandidos(new Set());
  };

  const IconoOrden = ({ columna }: { columna: OrdenColumna }) => {
    if (ordenColumna !== columna) {
      return <ArrowUpDown className="w-4 h-4 text-white/30" />;
    }
    return direccionOrden === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-white/70" />
      : <ArrowDown className="w-4 h-4 text-white/70" />;
  };

  if (reposicion.items.length === 0) {
    return (
      <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 text-center">
        <Package className="w-12 h-12 mx-auto mb-4 text-white/30" />
        <h3 className="text-lg font-medium text-white mb-2">Sin items para reponer</h3>
        <p className="text-white/60">
          {mostrarSucursal ? reposicion.nombreSucursal : 'Esta sucursal'} no requiere reposición
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con información de la sucursal */}
      {mostrarSucursal && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: color + '40', border: `2px solid ${color}` }}
            >
              {reposicion.nombreSucursal.substring(0, 2)}
            </div>
            <div>
              <h3 className="font-semibold text-white">{reposicion.nombreSucursal}</h3>
              <p className="text-white/60 text-sm">
                {reposicion.totalItems} items • {reposicion.totalUnidades} unidades
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={expandirTodos}
              className="px-3 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white/70 hover:text-white transition-all"
            >
              Expandir todo
            </button>
            <button
              onClick={contraerTodos}
              className="px-3 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white/70 hover:text-white transition-all"
            >
              Contraer todo
            </button>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <div style={{ maxHeight }} className="overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-white/10 backdrop-blur-sm border-b border-white/20">
                <tr>
                  <th className="text-left p-3 font-medium text-white/80 w-12"></th>
                  <th 
                    className="text-left p-3 font-medium text-white/80 cursor-pointer hover:text-white transition-colors"
                    onClick={() => manejarOrdenamiento('producto')}
                  >
                    <div className="flex items-center gap-2">
                      <span>Producto</span>
                      <IconoOrden columna="producto" />
                    </div>
                  </th>
                  <th 
                    className="text-left p-3 font-medium text-white/80 cursor-pointer hover:text-white transition-colors"
                    onClick={() => manejarOrdenamiento('color')}
                  >
                    <div className="flex items-center gap-2">
                      <span>Color</span>
                      <IconoOrden columna="color" />
                    </div>
                  </th>
                  <th 
                    className="text-center p-3 font-medium text-white/80 cursor-pointer hover:text-white transition-colors"
                    onClick={() => manejarOrdenamiento('talle')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>Talle</span>
                      <IconoOrden columna="talle" />
                    </div>
                  </th>
                  <th 
                    className="text-center p-3 font-medium text-white/80 cursor-pointer hover:text-white transition-colors"
                    onClick={() => manejarOrdenamiento('cantidad')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>A Reponer</span>
                      <IconoOrden columna="cantidad" />
                    </div>
                  </th>
                  {!compacta && (
                    <>
                      <th 
                        className="text-center p-3 font-medium text-white/80 cursor-pointer hover:text-white transition-colors"
                        onClick={() => manejarOrdenamiento('stockActual')}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span>Stock Actual</span>
                          <IconoOrden columna="stockActual" />
                        </div>
                      </th>
                      <th 
                        className="text-center p-3 font-medium text-white/80 cursor-pointer hover:text-white transition-colors"
                        onClick={() => manejarOrdenamiento('stockIdeal')}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span>Stock Ideal</span>
                          <IconoOrden columna="stockIdeal" />
                        </div>
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {Object.entries(productosAgrupados).map(([claveProducto, items], index) => {
                  const estaExpandido = productosExpandidos.has(claveProducto);
                  const primerItem = items[0];
                  const totalUnidadesProducto = items.reduce((sum, item) => sum + item.cantidadAReponer, 0);
                  
                  return (
                    <React.Fragment key={claveProducto}>
                      {/* Fila de grupo de producto */}
                      <tr 
                        className={`
                          border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors
                          ${index % 2 === 0 ? 'bg-white/2' : ''}
                        `}
                        onClick={() => alternarExpansion(claveProducto)}
                      >
                        <td className="p-3">
                          {estaExpandido ? (
                            <ChevronDown className="w-4 h-4 text-white/70" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-white/70" />
                          )}
                        </td>
                        <td className="p-3 font-medium text-white">
                          {primerItem.producto}
                        </td>
                        <td className="p-3 text-white/80">
                          {primerItem.color}
                        </td>
                        <td className="p-3 text-center text-white/60">
                          <div className="flex items-center justify-center gap-1">
                            <Hash className="w-3 h-3" />
                            <span className="text-xs">{items.length}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span 
                            className="inline-flex items-center px-2 py-1 rounded-lg text-white font-semibold text-sm"
                            style={{ backgroundColor: color + '40', border: `1px solid ${color}` }}
                          >
                            {totalUnidadesProducto}
                          </span>
                        </td>
                        {!compacta && (
                          <>
                            <td className="p-3 text-center text-white/60">
                              {items.reduce((sum, item) => sum + item.stockActual, 0)}
                            </td>
                            <td className="p-3 text-center text-white/60">
                              {items.reduce((sum, item) => sum + item.stockIdeal, 0)}
                            </td>
                          </>
                        )}
                      </tr>
                      
                      {/* Filas expandidas de talles */}
                      {estaExpandido && items.sort((a, b) => a.talle - b.talle).map((item, itemIndex) => (
                        <tr 
                          key={`${claveProducto}-${item.talle}`}
                          className={`
                            border-b border-white/5 bg-white/5
                            ${itemIndex === items.length - 1 ? 'border-b-white/10' : ''}
                          `}
                        >
                          <td className="p-3 pl-8"></td>
                          <td className="p-3 text-white/60 text-sm pl-8">
                            └ Talle {item.talle}
                          </td>
                          <td className="p-3 text-white/40 text-sm">-</td>
                          <td className="p-3 text-center">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-white/10 text-white text-xs">
                              {item.talle}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="inline-flex items-center px-2 py-1 rounded bg-white/10 text-white font-medium text-sm">
                              {item.cantidadAReponer}
                            </span>
                          </td>
                          {!compacta && (
                            <>
                              <td className="p-3 text-center text-white/60 text-sm">
                                {item.stockActual}
                              </td>
                              <td className="p-3 text-center text-white/60 text-sm">
                                {item.stockIdeal}
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer con totales */}
      <div className="flex items-center justify-between text-sm text-white/70 px-3">
        <span>
          {Object.keys(productosAgrupados).length} productos • {reposicion.totalItems} variantes
        </span>
        <span className="font-medium">
          Total: {reposicion.totalUnidades} unidades
        </span>
      </div>
    </div>
  );
};