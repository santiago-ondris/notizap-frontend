import {
  ArrowRightLeft,
  Gauge,
  PackagePlus,
  Palette,
  Route,
  Tags,
  TriangleAlert,
  Trophy
} from 'lucide-react';

const visuales = {
  'ganadores-sucursal': { icono: Trophy, color: '#B695BF' },
  redistribucion: { icono: ArrowRightLeft, color: '#B695BF' },
  recomprar: { icono: PackagePlus, color: '#8A9624' },
  'rotacion-lenta': { icono: Gauge, color: '#D94854' },
  'talles-colores': { icono: Palette, color: '#38BDF8' },
  'marcas-proveedores': { icono: Tags, color: '#FFD166' },
  'flujo-logistico': { icono: Route, color: '#F23D8A' },
  fallas: { icono: TriangleAlert, color: '#D94854' }
} as const;

export const obtenerVisualSeccion = (codigo: string) =>
  visuales[codigo as keyof typeof visuales] ?? { icono: Gauge, color: '#94A3B8' };
