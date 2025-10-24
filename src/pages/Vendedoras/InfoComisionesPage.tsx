import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calculator, 
  Info, 
  TrendingUp, 
  Users, 
  DollarSign,
  Percent
} from 'lucide-react';

export const InfoComisionesPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [montoFacturado, setMontoFacturado] = useState<string>('100000');
  const [numVendedoras, setNumVendedoras] = useState<string>('3');

  const PORCENTAJE_IVA = 21;
  const PORCENTAJE_COMISION = 1;

  const calcularMontoSinIva = (monto: number): number => {
    if (monto <= 0) return 0;
    return monto - (monto * PORCENTAJE_IVA / 100);
  };

  const calcularComisionTotal = (montoSinIva: number): number => {
    if (montoSinIva <= 0) return 0;
    return montoSinIva * PORCENTAJE_COMISION / 100;
  };

  const calcularComisionIndividual = (comisionTotal: number, vendedoras: number): number => {
    if (vendedoras <= 0 || comisionTotal <= 0) return 0;
    return comisionTotal / vendedoras;
  };

  const monto = parseFloat(montoFacturado) || 0;
  const vendedoras = parseInt(numVendedoras) || 1;
  const montoSinIva = calcularMontoSinIva(monto);
  const comisionTotal = calcularComisionTotal(montoSinIva);
  const comisionIndividual = calcularComisionIndividual(comisionTotal, vendedoras);

  const formatearMoneda = (valor: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor);
  };

  const ejemplosPracticos = [
    { monto: 50000, vendedoras: 1 },
    { monto: 100000, vendedoras: 2 },
    { monto: 200000, vendedoras: 3 },
    { monto: 150000, vendedoras: 4 }
  ];

  return (
    <div className="min-h-screen bg-[#1A1A20] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/vendedoras/comisioneslocales')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 
                         bg-white/5 hover:bg-white/10 transition-all text-white/80"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </button>
              
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Info className="w-8 h-8 text-violet-400" />
                  Información de Comisiones
                </h1>
                <p className="text-white/60 mt-1">
                  Cómo se calculan las comisiones de las vendedoras
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Porcentajes actuales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-violet-500/10 backdrop-blur-sm border border-violet-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-violet-500/20 rounded-xl">
                <Percent className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">IVA</h3>
                <p className="text-sm text-white/60">Impuesto sobre el valor agregado</p>
              </div>
            </div>
            <div className="text-center py-4">
              <div className="text-5xl font-bold text-violet-400">{PORCENTAJE_IVA}%</div>
              <p className="text-white/60 mt-2">Se descuenta del monto facturado</p>
            </div>
          </div>

          <div className="bg-green-500/10 backdrop-blur-sm border border-[#51590E]/40 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[#51590E]/30 rounded-xl">
                <TrendingUp className="w-6 h-6 text-[#51590E]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Comisión</h3>
                <p className="text-sm text-white/60">Porcentaje sobre monto sin IVA</p>
              </div>
            </div>
            <div className="text-center py-4">
              <div className="text-5xl font-bold text-[#51590E]">{PORCENTAJE_COMISION}%</div>
              <p className="text-white/60 mt-2">Se divide entre todas las vendedoras</p>
            </div>
          </div>
        </div>

        {/* Fórmula paso a paso */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Calculator className="w-6 h-6 text-violet-400" />
            <h2 className="text-2xl font-bold text-white">Fórmula de Cálculo</h2>
          </div>

          <div className="space-y-4">
            {/* Paso 1 */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-violet-400">1</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Calcular Monto sin IVA
                  </h3>
                  <div className="bg-[#1A1A20] rounded-lg p-4 font-mono text-sm">
                    <p className="text-white/80">
                      Monto sin IVA = Monto Facturado - (Monto Facturado × {PORCENTAJE_IVA}%)
                    </p>
                  </div>
                  <p className="text-white/60 text-sm mt-2">
                    Primero se resta el IVA del monto total facturado
                  </p>
                </div>
              </div>
            </div>

            {/* Paso 2 */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#51590E]/40 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-[#51590E]">2</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Calcular Comisión Total del Día
                  </h3>
                  <div className="bg-[#1A1A20] rounded-lg p-4 font-mono text-sm">
                    <p className="text-white/80">
                      Comisión Total = Monto sin IVA × {PORCENTAJE_COMISION}%
                    </p>
                  </div>
                  <p className="text-white/60 text-sm mt-2">
                    Se aplica el porcentaje de comisión sobre el monto sin IVA
                  </p>
                </div>
              </div>
            </div>

            {/* Paso 3 */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-blue-400">3</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Dividir entre Vendedoras
                  </h3>
                  <div className="bg-[#1A1A20] rounded-lg p-4 font-mono text-sm">
                    <p className="text-white/80">
                      Comisión Individual = Comisión Total ÷ N° de Vendedoras
                    </p>
                  </div>
                  <p className="text-white/60 text-sm mt-2">
                    La comisión total se divide en partes iguales entre todas las vendedoras
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calculadora interactiva */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white">Calculadora Interactiva</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Monto Facturado ($)
                </label>
                <input
                  type="number"
                  value={montoFacturado}
                  onChange={(e) => setMontoFacturado(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl 
                           text-white placeholder-white/50 focus:outline-none focus:border-violet-400/50
                           transition-colors"
                  placeholder="Ej: 100000"
                  min="0"
                  step="1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Número de Vendedoras
                </label>
                <input
                  type="number"
                  value={numVendedoras}
                  onChange={(e) => setNumVendedoras(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl 
                           text-white placeholder-white/50 focus:outline-none focus:border-violet-400/50
                           transition-colors"
                  placeholder="Ej: 3"
                  min="1"
                  max="20"
                />
              </div>
            </div>

            {/* Resultados */}
            <div className="space-y-3">
              <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4">
                <p className="text-sm text-white/60 mb-1">Monto sin IVA</p>
                <p className="text-2xl font-bold text-violet-400">
                  {formatearMoneda(montoSinIva)}
                </p>
              </div>

              <div className="bg-[#51590E]/20 border border-[#51590E]/40 rounded-xl p-4">
                <p className="text-sm text-white/60 mb-1">Comisión Total</p>
                <p className="text-2xl font-bold text-[#51590E]">
                  {formatearMoneda(comisionTotal)}
                </p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60 mb-1">Comisión por Vendedora</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {formatearMoneda(comisionIndividual)}
                    </p>
                  </div>
                  <Users className="w-6 h-6 text-blue-400/60" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ejemplos prácticos */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-orange-400" />
            <h2 className="text-2xl font-bold text-white">Ejemplos Prácticos</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ejemplosPracticos.map((ejemplo, index) => {
              const sinIva = calcularMontoSinIva(ejemplo.monto);
              const totalComision = calcularComisionTotal(sinIva);
              const porVendedora = calcularComisionIndividual(totalComision, ejemplo.vendedoras);

              return (
                <div 
                  key={index}
                  className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 
                           transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-400" />
                      <span className="text-lg font-semibold text-white">
                        {formatearMoneda(ejemplo.monto)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Users className="w-4 h-4" />
                      {ejemplo.vendedoras} vendedora{ejemplo.vendedoras > 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Sin IVA:</span>
                      <span className="text-white font-medium">{formatearMoneda(sinIva)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Comisión total:</span>
                      <span className="text-white font-medium">{formatearMoneda(totalComision)}</span>
                    </div>
                    <div className="border-t border-white/10 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-white/80 font-medium">Por vendedora:</span>
                        <span className="text-[#51590E] font-bold text-lg">
                          {formatearMoneda(porVendedora)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};