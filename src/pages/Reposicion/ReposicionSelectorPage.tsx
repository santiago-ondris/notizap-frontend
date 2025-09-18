import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Baby, 
  ArrowRight, 
  Target, 
  MapPin, 
  Settings,
  BarChart3
} from 'lucide-react';

interface OpcionReposicion {
  tipo: 'adultos' | 'ninos';
  titulo: string;
  descripcion: string;
  icono: React.ElementType;
  color: string;
  colorHover: string;
  ruta: string;
  caracteristicas: string[];
  sucursales: string[];
  logica: string;
}

const opciones: OpcionReposicion[] = [
  {
    tipo: 'adultos',
    titulo: 'Productos Adultos',
    descripcion: 'Reposición con curvas de talles personalizables',
    icono: Package,
    color: '#B695BF',
    colorHover: '#A085AF',
    ruta: '/reposicion/adultos',
    caracteristicas: [
      'Curvas de talles configurables',
      'Múltiples sucursales destino',
      'Priorización automática'
    ],
    sucursales: ['DEAN FUNES', 'GENERAL PAZ', '25 DE MAYO', 'ITUZAINGO NVA CBA'],
    logica: 'Curva predefinida: T34(1), T35(1), T36(2), T37(3), T38(3), T39(2), T40(1), T41(1)'
  },
  {
    tipo: 'ninos',
    titulo: 'Productos Niños',
    descripcion: 'Reposición específica para GENERAL PAZ',
    icono: Baby,
    color: '#51590E',
    colorHover: '#41480C',
    ruta: '/reposicion/ninos',
    caracteristicas: [
      'Sin configuración de curvas',
      'Destino único: GENERAL PAZ',
      'Lógica simple y eficiente'
    ],
    sucursales: ['GENERAL PAZ'],
    logica: 'Intentar 2 unidades por talle, si no es posible 1 unidad'
  }
];

export const ReposicionSelectorPage: React.FC = () => {
  const navigate = useNavigate();

  const manejarSeleccion = (ruta: string) => {
    navigate(ruta);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A20] via-[#1A1A20] to-[#2A2A35]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-6">
            <BarChart3 className="w-4 h-4 text-[#B695BF]" />
            <span className="text-sm text-white/80 font-medium">Módulo de Reposición</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Seleccionar Tipo de Reposición
          </h1>
          
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Elige el tipo de productos para analizar y generar la reposición de stock
          </p>
        </div>

        {/* Opciones */}
        <div className="grid md:grid-cols-2 gap-8">
          {opciones.map((opcion) => {
            const Icono = opcion.icono;
            
            return (
              <div
                key={opcion.tipo}
                onClick={() => manejarSeleccion(opcion.ruta)}
                className="group relative cursor-pointer transform transition-all duration-300 hover:scale-105"
              >
                {/* Card principal */}
                <div 
                  className="relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 h-full transition-all duration-300 group-hover:bg-white/10 group-hover:border-white/20"
                  style={{
                    boxShadow: `0 8px 32px ${opcion.color}20`
                  }}
                >
                  {/* Header de la card */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div 
                        className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110"
                        style={{ 
                          backgroundColor: `${opcion.color}20`,
                          border: `1px solid ${opcion.color}30`
                        }}
                      >
                        <Icono 
                          className="w-8 h-8 transition-colors duration-300" 
                          style={{ color: opcion.color }}
                        />
                      </div>
                      
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">
                          {opcion.titulo}
                        </h3>
                        <p className="text-white/60 text-sm">
                          {opcion.descripcion}
                        </p>
                      </div>
                    </div>

                    <ArrowRight 
                      className="w-5 h-5 text-white/40 transition-all duration-300 group-hover:text-white group-hover:translate-x-1" 
                    />
                  </div>

                  {/* Características */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-white/40" />
                      <span className="text-sm text-white/60 font-medium">Características:</span>
                    </div>
                    
                    <ul className="space-y-2 ml-6">
                      {opcion.caracteristicas.map((caracteristica, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-white/70">
                          <div 
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: opcion.color }}
                          />
                          {caracteristica}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Sucursales */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-white/40" />
                      <span className="text-sm text-white/60 font-medium">
                        Sucursales destino:
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 ml-6">
                      {opcion.sucursales.map((sucursal) => (
                        <span
                          key={sucursal}
                          className="px-2 py-1 text-xs rounded-md border transition-colors duration-300"
                          style={{
                            backgroundColor: `${opcion.color}15`,
                            borderColor: `${opcion.color}30`,
                            color: opcion.color
                          }}
                        >
                          {sucursal}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Lógica */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-white/40" />
                      <span className="text-sm text-white/60 font-medium">Lógica:</span>
                    </div>
                    
                    <p className="text-sm text-white/50 ml-6 leading-relaxed">
                      {opcion.logica}
                    </p>
                  </div>

                  {/* Overlay de hover */}
                  <div 
                    className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-10"
                    style={{ backgroundColor: opcion.color }}
                  />
                </div>

                {/* Glow effect */}
                <div 
                  className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-20 -z-10 blur-xl"
                  style={{ backgroundColor: opcion.color }}
                />
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
            <Package className="w-4 h-4 text-white/40" />
            <span className="text-sm text-white/60">
              Ambos módulos procesan archivos Excel desde CASA CENTRAL
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};