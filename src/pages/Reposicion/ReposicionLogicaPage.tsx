import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Baby,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';

type TipoModulo = 'adultos' | 'ninos';

export const ReposicionLogicaPage: React.FC = () => {
  const navigate = useNavigate();
  const [moduloActivo, setModuloActivo] = useState<TipoModulo>('adultos');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A20] via-[#1A1A20] to-[#2A2A35]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header con navegación */}
        <div className="mb-12">
          <button
            onClick={() => navigate('/reposicion')}
            className="group flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-300 mb-6"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="text-sm font-medium">Volver a selección</span>
          </button>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <Info className="w-4 h-4 text-[#B695BF]" />
              <span className="text-sm text-white/80 font-medium">Documentación</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Lógica del Módulo de Reposición
            </h1>

            <p className="text-xl text-white/60 max-w-3xl mx-auto">
              Para no olvidar..
            </p>
          </div>
        </div>

        {/* Tabs de selección */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setModuloActivo('adultos')}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl border transition-all duration-300 ${moduloActivo === 'adultos'
                ? 'bg-[#B695BF]/20 border-[#B695BF]/50 text-white'
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              }`}
          >
            <Package className="w-5 h-5" />
            <span className="font-semibold">Productos Adultos</span>
          </button>

          <button
            onClick={() => setModuloActivo('ninos')}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl border transition-all duration-300 ${moduloActivo === 'ninos'
                ? 'bg-[#51590E]/20 border-[#51590E]/50 text-white'
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              }`}
          >
            <Baby className="w-5 h-5" />
            <span className="font-semibold">Productos Niños</span>
          </button>
        </div>

        {/* Contenido según módulo activo */}
        {moduloActivo === 'adultos' ? <ContenidoAdultos /> : <ContenidoNinos />}
      </div>
    </div>
  );
};

// ==================== CONTENIDO ADULTOS ====================
const ContenidoAdultos: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Concepto general */}
      <SeccionCard
        titulo="Concepto General"
        icono={Target}
        color="#B695BF"
      >
        <div className="space-y-4 text-white/70">
          <p className="leading-relaxed">
            El módulo de adultos utiliza <strong className="text-white">curvas de talles personalizables</strong> para
            determinar cuántas unidades de cada talle debe tener cada sucursal.
          </p>

          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-white font-semibold mb-2">Curva predeterminada:</h4>
            <div className="flex flex-wrap gap-2">
              {[
                { talle: '34', cantidad: 1 },
                { talle: '35', cantidad: 1 },
                { talle: '36', cantidad: 2 },
                { talle: '37', cantidad: 3 },
                { talle: '38', cantidad: 3 },
                { talle: '39', cantidad: 2 },
                { talle: '40', cantidad: 1 },
                { talle: '41', cantidad: 1 }
              ].map(({ talle, cantidad }) => (
                <div
                  key={talle}
                  className="px-3 py-1.5 rounded-md bg-[#B695BF]/20 border border-[#B695BF]/30"
                >
                  <span className="text-white/90 text-sm">
                    T{talle}: <strong className="text-[#B695BF]">{cantidad}</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SeccionCard>

      {/* Sistema de prioridades */}
      <SeccionCard
        titulo="Sistema de Prioridades"
        icono={Layers}
        color="#B695BF"
      >
        <div className="space-y-4">
          <p className="text-white/70 leading-relaxed">
            Cuando el stock en CASA CENTRAL es limitado, las sucursales se atienden según su orden de prioridad:
          </p>

          <div className="flex items-center gap-3">
            {['DEAN FUNES', 'GENERAL PAZ', 'BARRIO JARDIN', '25 DE MAYO', 'ITUZAINGO NVA CBA'].map((sucursal, index) => (
              <React.Fragment key={sucursal}>
                <div className="flex-1 bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="text-[#B695BF] text-xs font-semibold mb-1">
                    Prioridad {index + 1}
                  </div>
                  <div className="text-white text-sm font-medium">
                    {sucursal}
                  </div>
                </div>
                {index < 4 && (
                  <ArrowRight className="w-4 h-4 text-white/30 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </SeccionCard>

      {/* Ejemplos */}
      <SeccionCard
        titulo="Ejemplos Prácticos"
        icono={TrendingUp}
        color="#B695BF"
      >
        <div className="space-y-6">
          {/* Ejemplo 1 */}
          <EjemploAdultos
            titulo="Caso 1: Stock suficiente para todos"
            descripcion="Cuando hay stock abundante, todas las sucursales reciben según su curva ideal"
            datos={{
              stockCasaCentral: 20,
              sucursales: [
                { nombre: 'DEAN FUNES', necesita: 3, recibe: 3, estado: 'completo' },
                { nombre: 'GENERAL PAZ', necesita: 3, recibe: 3, estado: 'completo' },
                { nombre: 'BARRIO JARDIN', necesita: 3, recibe: 3, estado: 'completo' },
                { nombre: 'ITUZAINGO', necesita: 3, recibe: 3, estado: 'completo' },
                { nombre: '25 DE MAYO', necesita: 3, recibe: 3, estado: 'completo' }
              ],
              stockRestante: 2
            }}
          />

          {/* Ejemplo 2 */}
          <EjemploAdultos
            titulo="Caso 2: Stock limitado (prioridades en acción)"
            descripcion="Con stock limitado, las sucursales de mayor prioridad se atienden primero"
            datos={{
              stockCasaCentral: 7,
              sucursales: [
                { nombre: 'DEAN FUNES', necesita: 3, recibe: 3, estado: 'completo' },
                { nombre: 'GENERAL PAZ', necesita: 3, recibe: 3, estado: 'completo' },
                { nombre: 'BARRIO JARDIN', necesita: 3, recibe: 1, estado: 'parcial' },
                { nombre: 'ITUZAINGO', necesita: 3, recibe: 0, estado: 'vacio' },
                { nombre: '25 DE MAYO', necesita: 3, recibe: 0, estado: 'vacio' }
              ],
              stockRestante: 0
            }}
          />

          {/* Ejemplo 3 */}
          <EjemploAdultos
            titulo="Caso 3: Stock muy limitado"
            descripcion="Solo las sucursales de mayor prioridad reciben stock"
            datos={{
              stockCasaCentral: 4,
              sucursales: [
                { nombre: 'DEAN FUNES', necesita: 3, recibe: 3, estado: 'completo' },
                { nombre: 'GENERAL PAZ', necesita: 3, recibe: 1, estado: 'parcial' },
                { nombre: 'BARRIO JARDIN', necesita: 3, recibe: 0, estado: 'vacio' },
                { nombre: 'ITUZAINGO', necesita: 3, recibe: 0, estado: 'vacio' },
                { nombre: '25 DE MAYO', necesita: 3, recibe: 0, estado: 'vacio' }
              ],
              stockRestante: 0
            }}
          />
        </div>
      </SeccionCard>
    </div>
  );
};

// ==================== CONTENIDO NIÑOS ====================
const ContenidoNinos: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Concepto general */}
      <SeccionCard
        titulo="Concepto General"
        icono={Target}
        color="#51590E"
      >
        <div className="space-y-4 text-white/70">
          <p className="leading-relaxed">
            El módulo de niños utiliza una <strong className="text-white">lógica de dos pasadas</strong> para
            distribuir el stock de forma equitativa entre las sucursales especializadas.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#51590E]/20 border border-[#51590E]/50 flex items-center justify-center text-[#51590E] text-xs font-bold">
                  1
                </div>
                Stock Objetivo Primario
              </h4>
              <p className="text-sm text-white/60">
                <strong className="text-[#51590E]">2 unidades</strong> por talle (ideal)
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#51590E]/20 border border-[#51590E]/50 flex items-center justify-center text-[#51590E] text-xs font-bold">
                  2
                </div>
                Stock Objetivo Secundario
              </h4>
              <p className="text-sm text-white/60">
                <strong className="text-[#51590E]">1 unidad</strong> por talle (fallback)
              </p>
            </div>
          </div>
        </div>
      </SeccionCard>

      {/* Lógica de dos pasadas */}
      <SeccionCard
        titulo="Lógica de Dos Pasadas"
        icono={Layers}
        color="#51590E"
      >
        <div className="space-y-6">
          {/* Pasada 1 */}
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#51590E]/20 border border-[#51590E]/50 flex items-center justify-center text-[#51590E] font-bold">
                1
              </div>
              <h3 className="text-xl font-bold text-white">Primera Pasada: Garantizar Mínimo</h3>
            </div>

            <p className="text-white/70 mb-4 leading-relaxed">
              Se intenta llevar cada sucursal a <strong className="text-white">1 unidad por talle</strong>.
              Se procesan en orden de prioridad: primero GENERAL PAZ, luego BARRIO JARDIN.
            </p>

            <div className="bg-black/20 rounded-lg p-4">
              <code className="text-sm text-[#51590E] block space-y-1">
                <div>Para cada sucursal (en orden de prioridad):</div>
                <div className="ml-4">Si stockActual {'<'} 1:</div>
                <div className="ml-8">→ Asignar lo necesario para llegar a 1</div>
                <div className="ml-8">→ Reducir stock disponible global</div>
              </code>
            </div>
          </div>

          {/* Pasada 2 */}
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#51590E]/20 border border-[#51590E]/50 flex items-center justify-center text-[#51590E] font-bold">
                2
              </div>
              <h3 className="text-xl font-bold text-white">Segunda Pasada: Completar al Ideal</h3>
            </div>

            <p className="text-white/70 mb-4 leading-relaxed">
              Con el stock restante, se intenta llevar cada sucursal a <strong className="text-white">2 unidades por talle</strong>.
              Nuevamente en orden de prioridad.
            </p>

            <div className="bg-black/20 rounded-lg p-4">
              <code className="text-sm text-[#51590E] block space-y-1">
                <div>Para cada sucursal (en orden de prioridad):</div>
                <div className="ml-4">Si stockFinal {'<'} 2:</div>
                <div className="ml-8">→ Asignar lo necesario para llegar a 2</div>
                <div className="ml-8">→ Reducir stock disponible global</div>
              </code>
            </div>
          </div>
        </div>
      </SeccionCard>

      {/* Sistema de prioridades */}
      <SeccionCard
        titulo="Sistema de Prioridades"
        icono={TrendingUp}
        color="#51590E"
      >
        <div className="space-y-4">
          <p className="text-white/70 leading-relaxed">
            Las sucursales de niños se atienden en este orden:
          </p>

          <div className="flex items-center justify-center gap-4">
            <div className="flex-1 max-w-xs bg-white/5 rounded-lg p-4 border border-[#51590E]/30">
              <div className="text-[#51590E] text-sm font-semibold mb-2">
                🏆 Prioridad 1
              </div>
              <div className="text-white text-lg font-bold">
                GENERAL PAZ
              </div>
              <div className="text-white/50 text-xs mt-1">
                Se atiende primero en ambas pasadas
              </div>
            </div>

            <ArrowRight className="w-6 h-6 text-[#51590E]" />

            <div className="flex-1 max-w-xs bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="text-white/60 text-sm font-semibold mb-2">
                Prioridad 2
              </div>
              <div className="text-white text-lg font-bold">
                BARRIO JARDIN
              </div>
              <div className="text-white/50 text-xs mt-1">
                Recibe el stock restante
              </div>
            </div>
          </div>
        </div>
      </SeccionCard>

      {/* Ejemplos */}
      <SeccionCard
        titulo="Ejemplos Prácticos"
        icono={TrendingUp}
        color="#51590E"
      >
        <div className="space-y-6">
          {/* Ejemplo 1 */}
          <EjemploNinos
            titulo="Caso 1: Stock inicial [0, 0] - Stock disponible: 2"
            descripcion="Ambas sucursales vacías, solo hay 2 unidades disponibles"
            pasos={[
              {
                pasada: 1,
                descripcion: "Garantizar mínimo (1 unidad)",
                acciones: [
                  "GENERAL PAZ: 0 → 1 (asigna 1)",
                  "BARRIO JARDIN: 0 → 1 (asigna 1)",
                  "Stock restante: 0"
                ]
              },
              {
                pasada: 2,
                descripcion: "Completar al ideal (2 unidades)",
                acciones: [
                  "No hay stock disponible",
                  "Ambas se quedan en 1"
                ]
              }
            ]}
            resultado={{
              generalPaz: 1,
              barrioJardin: 1,
              explicacion: "Distribución equitativa del stock limitado"
            }}
          />

          {/* Ejemplo 2 */}
          <EjemploNinos
            titulo="Caso 2: Stock inicial [0, 0] - Stock disponible: 3"
            descripcion="Ambas vacías, hay 3 unidades (prioridad en acción)"
            pasos={[
              {
                pasada: 1,
                descripcion: "Garantizar mínimo (1 unidad)",
                acciones: [
                  "GENERAL PAZ: 0 → 1 (asigna 1)",
                  "BARRIO JARDIN: 0 → 1 (asigna 1)",
                  "Stock restante: 1"
                ]
              },
              {
                pasada: 2,
                descripcion: "Completar al ideal (2 unidades)",
                acciones: [
                  "GENERAL PAZ: 1 → 2 (asigna 1)",
                  "BARRIO JARDIN: queda en 1",
                  "Stock restante: 0"
                ]
              }
            ]}
            resultado={{
              generalPaz: 2,
              barrioJardin: 1,
              explicacion: "GENERAL PAZ alcanza el ideal por su prioridad"
            }}
          />

          {/* Ejemplo 3 */}
          <EjemploNinos
            titulo="Caso 3: Stock inicial [1, 0] - Stock disponible: 1"
            descripcion="GENERAL PAZ ya tiene stock, BARRIO JARDIN vacío"
            pasos={[
              {
                pasada: 1,
                descripcion: "Garantizar mínimo (1 unidad)",
                acciones: [
                  "GENERAL PAZ: ya tiene 1, no necesita",
                  "BARRIO JARDIN: 0 → 1 (asigna 1)",
                  "Stock restante: 0"
                ]
              },
              {
                pasada: 2,
                descripcion: "Completar al ideal (2 unidades)",
                acciones: [
                  "No hay stock disponible",
                  "Ambas se quedan con su stock actual"
                ]
              }
            ]}
            resultado={{
              generalPaz: 1,
              barrioJardin: 1,
              explicacion: "Se prioriza garantizar mínimo en BARRIO JARDIN"
            }}
          />

          {/* Ejemplo 4 */}
          <EjemploNinos
            titulo="Caso 4: Stock inicial [1, 1] - Stock disponible: 2"
            descripcion="Ambas tienen mínimo, hay stock para completar"
            pasos={[
              {
                pasada: 1,
                descripcion: "Garantizar mínimo (1 unidad)",
                acciones: [
                  "GENERAL PAZ: ya tiene 1",
                  "BARRIO JARDIN: ya tiene 1",
                  "Stock restante: 2 (sin cambios)"
                ]
              },
              {
                pasada: 2,
                descripcion: "Completar al ideal (2 unidades)",
                acciones: [
                  "GENERAL PAZ: 1 → 2 (asigna 1)",
                  "BARRIO JARDIN: 1 → 2 (asigna 1)",
                  "Stock restante: 0"
                ]
              }
            ]}
            resultado={{
              generalPaz: 2,
              barrioJardin: 2,
              explicacion: "Ambas alcanzan el stock ideal"
            }}
          />

          {/* Ejemplo 5 */}
          <EjemploNinos
            titulo="Caso 5: Stock inicial [1, 1] - Stock disponible: 1"
            descripcion="Ambas tienen mínimo, stock limitado para completar"
            pasos={[
              {
                pasada: 1,
                descripcion: "Garantizar mínimo (1 unidad)",
                acciones: [
                  "Ambas ya tienen 1",
                  "Stock restante: 1 (sin cambios)"
                ]
              },
              {
                pasada: 2,
                descripcion: "Completar al ideal (2 unidades)",
                acciones: [
                  "GENERAL PAZ: 1 → 2 (asigna 1)",
                  "BARRIO JARDIN: se queda en 1",
                  "Stock restante: 0"
                ]
              }
            ]}
            resultado={{
              generalPaz: 2,
              barrioJardin: 1,
              explicacion: "Prioridad determina quién completa al ideal"
            }}
          />
        </div>
      </SeccionCard>

    </div>
  );
};

// ==================== COMPONENTES AUXILIARES ====================

interface SeccionCardProps {
  titulo: string;
  icono: React.ElementType;
  color: string;
  children: React.ReactNode;
}

const SeccionCard: React.FC<SeccionCardProps> = ({ titulo, icono: Icono, color, children }) => {
  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div
          className="p-2 rounded-lg"
          style={{
            backgroundColor: `${color}20`,
            border: `1px solid ${color}30`
          }}
        >
          <Icono className="w-6 h-6" style={{ color }} />
        </div>
        <h2 className="text-2xl font-bold text-white">{titulo}</h2>
      </div>
      {children}
    </div>
  );
};

interface DatosEjemploAdultos {
  stockCasaCentral: number;
  sucursales: Array<{
    nombre: string;
    necesita: number;
    recibe: number;
    estado: 'completo' | 'parcial' | 'vacio';
  }>;
  stockRestante: number;
}

interface EjemploAdultosProps {
  titulo: string;
  descripcion: string;
  datos: DatosEjemploAdultos;
}

const EjemploAdultos: React.FC<EjemploAdultosProps> = ({ titulo, descripcion, datos }) => {
  const obtenerIconoEstado = (estado: string) => {
    switch (estado) {
      case 'completo':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'parcial':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'vacio':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return null;
    }
  };

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case 'completo':
        return 'border-green-400/30 bg-green-400/10';
      case 'parcial':
        return 'border-yellow-400/30 bg-yellow-400/10';
      case 'vacio':
        return 'border-red-400/30 bg-red-400/10';
      default:
        return 'border-white/10 bg-white/5';
    }
  };

  return (
    <div className="bg-black/20 rounded-lg p-6 border border-white/10">
      <h4 className="text-white font-semibold mb-2">{titulo}</h4>
      <p className="text-white/60 text-sm mb-4">{descripcion}</p>

      <div className="space-y-3">
        {/* Stock inicial */}
        <div className="flex items-center gap-3 text-sm">
          <span className="text-white/50">Stock en CASA CENTRAL:</span>
          <span className="px-3 py-1 rounded-md bg-[#B695BF]/20 border border-[#B695BF]/30 text-[#B695BF] font-semibold">
            {datos.stockCasaCentral} unidades
          </span>
        </div>

        {/* Tabla de distribución */}
        <div className="space-y-2">
          {datos.sucursales.map((sucursal) => (
            <div
              key={sucursal.nombre}
              className={`flex items-center justify-between p-3 rounded-lg border ${obtenerColorEstado(sucursal.estado)}`}
            >
              <div className="flex items-center gap-3">
                {obtenerIconoEstado(sucursal.estado)}
                <span className="text-white font-medium">{sucursal.nombre}</span>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="text-white/50">
                  Necesita: <span className="text-white">{sucursal.necesita}</span>
                </div>
                <div className="text-white/50">
                  Recibe: <span className={
                    sucursal.estado === 'completo' ? 'text-green-400' :
                      sucursal.estado === 'parcial' ? 'text-yellow-400' :
                        'text-red-400'
                  }>{sucursal.recibe}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stock restante */}
        <div className="flex items-center gap-3 text-sm pt-2 border-t border-white/10">
          <span className="text-white/50">Stock restante:</span>
          <span className={`px-3 py-1 rounded-md border font-semibold ${datos.stockRestante > 0
              ? 'bg-[#B695BF]/20 border-[#B695BF]/30 text-[#B695BF]'
              : 'bg-white/5 border-white/10 text-white/50'
            }`}>
            {datos.stockRestante} unidades
          </span>
        </div>
      </div>
    </div>
  );
};

interface PasoEjemploNinos {
  pasada: number;
  descripcion: string;
  acciones: string[];
}

interface ResultadoEjemploNinos {
  generalPaz: number;
  barrioJardin: number;
  explicacion: string;
}

interface EjemploNinosProps {
  titulo: string;
  descripcion: string;
  pasos: PasoEjemploNinos[];
  resultado: ResultadoEjemploNinos;
}

const EjemploNinos: React.FC<EjemploNinosProps> = ({ titulo, descripcion, pasos, resultado }) => {
  return (
    <div className="bg-black/20 rounded-lg p-6 border border-white/10">
      <h4 className="text-white font-semibold mb-2">{titulo}</h4>
      <p className="text-white/60 text-sm mb-4">{descripcion}</p>

      <div className="space-y-4">
        {/* Pasos */}
        {pasos.map((paso) => (
          <div key={paso.pasada} className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-[#51590E]/20 border border-[#51590E]/50 flex items-center justify-center text-[#51590E] text-xs font-bold">
                {paso.pasada}
              </div>
              <span className="text-white font-semibold text-sm">{paso.descripcion}</span>
            </div>

            <ul className="space-y-1.5 ml-8">
              {paso.acciones.map((accion, index) => (
                <li key={index} className="text-white/60 text-sm flex items-start gap-2">
                  <span className="text-[#51590E] mt-1">→</span>
                  <span>{accion}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Resultado final */}
        <div className="bg-[#51590E]/10 rounded-lg p-4 border border-[#51590E]/30">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-[#51590E]" />
            <span className="text-white font-semibold">Resultado Final:</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-white/5 rounded p-3 border border-white/10">
              <div className="text-white/50 text-xs mb-1">GENERAL PAZ</div>
              <div className="text-[#51590E] text-2xl font-bold">{resultado.generalPaz}</div>
            </div>
            <div className="bg-white/5 rounded p-3 border border-white/10">
              <div className="text-white/50 text-xs mb-1">BARRIO JARDIN</div>
              <div className="text-white text-2xl font-bold">{resultado.barrioJardin}</div>
            </div>
          </div>

          <p className="text-white/60 text-sm italic">{resultado.explicacion}</p>
        </div>
      </div>
    </div>
  );
};