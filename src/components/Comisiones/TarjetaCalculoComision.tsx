import { Calculator, Users, TrendingUp, Minus } from "lucide-react";
import { formatearMoneda } from "@/services/woocommerce/comisionService";
import type { CalculoComision } from "@/types/woocommerce/comisionTypes";

interface TarjetaCalculoComisionProps {
  calculo: CalculoComision | null;
  mes: number;
  año: number;
  mostrarDetalle?: boolean;
}

export default function TarjetaCalculoComision({
  calculo,
  mes,
  año,
  mostrarDetalle = true
}: TarjetaCalculoComisionProps) {

  if (!calculo) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">🧮</span>
          <div>
            <h3 className="text-lg font-bold text-white">Resultado del Cálculo</h3>
            <p className="text-sm text-white/60">Los resultados aparecerán aquí después del cálculo</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 py-8">
          <Calculator className="w-8 h-8 text-white/40" />
          <div className="text-center">
            <p className="text-white/60 text-sm mb-2">🧮 Completa el formulario y presiona "Calcular"</p>
            <p className="text-white/50 text-xs">Se mostrarán aquí todos los pasos del cálculo de comisiones</p>
          </div>
        </div>
      </div>
    );
  }

  const pasos = [
    {
      numero: 1,
      titulo: "Facturación Total sin NC",
      valor: calculo.totalSinNC,
      descripcion: "Monto base ingresado manualmente",
      color: "orange",
      emoji: "💰"
    },
    {
      numero: 2,
      titulo: "Total Gastado en Envíos",
      valor: calculo.totalEnvios,
      descripcion: "Suma: Andreani + OCA + Caddy",
      color: "#D94854",
      emoji: "📦",
      operacion: "resta"
    },
    {
      numero: 3,
      titulo: "Base de Cálculo",
      valor: calculo.baseCalculo,
      descripcion: "Facturación - Envíos",
      color: "#B695BF",
      emoji: "📊"
    },
    {
      numero: 4,
      titulo: "Base sin IVA (21%)",
      valor: calculo.baseCalculoSinIVA,
      descripcion: "Base × 0.79 (se resta 21%)",
      color: "#FFD700",
      emoji: "📉",
      operacion: "resta"
    },
    {
      numero: 5,
      titulo: "Comisión Bruta (0.5%)",
      valor: calculo.comisionBruta,
      descripcion: "Base sin IVA × 0.005",
      color: "#4A8C8C",
      emoji: "💸"
    }
  ];

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">🧮</span>
        <div>
          <h3 className="text-lg font-bold text-white">Resultado del Cálculo</h3>
          <p className="text-sm text-white/60">
            Cálculo de comisiones para {String(mes).padStart(2, '0')}/{año}
          </p>
        </div>
      </div>

      {/* Resultado principal */}
      <div className="bg-gradient-to-r from-[#51590E]/20 to-[#4A8C8C]/20 backdrop-blur-sm border border-[#51590E]/30 rounded-2xl p-6 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="w-6 h-6 text-[#51590E]" />
            <h4 className="text-xl font-bold text-white">Comisión por Persona</h4>
          </div>
          <p className="text-4xl font-bold text-[white] mb-2">
            {formatearMoneda(calculo.comisionPorPersona)}
          </p>
          <p className="text-sm text-white/70">
            👥 Dividido entre 6 personas • Total: {formatearMoneda(calculo.comisionBruta)}
          </p>
        </div>
      </div>

      {/* Detalle de cálculo paso a paso */}
      {mostrarDetalle && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="w-5 h-5 text-white/80" />
            <h4 className="text-base font-semibold text-white/80">Detalle del Cálculo</h4>
          </div>

          {pasos.map((paso, index) => (
            <div key={paso.numero} className="relative">
              {/* Línea conectora */}
              {index < pasos.length - 1 && (
                <div className="absolute left-6 top-12 w-px h-6 bg-white/20" />
              )}

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Número del paso */}
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ backgroundColor: `${paso.color}30`, color: paso.color }}
                    >
                      {paso.numero}
                    </div>

                    {/* Información del paso */}
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{paso.emoji}</span>
                      <div>
                        <h5 className="text-sm font-semibold text-white">{paso.titulo}</h5>
                        <p className="text-xs text-white/60">{paso.descripcion}</p>
                      </div>
                    </div>
                  </div>

                  {/* Valor y operación */}
                  <div className="flex items-center gap-3">
                    {paso.operacion && (
                      <div className="flex items-center gap-1">
                        {paso.operacion === 'resta' ? (
                          <Minus className="w-4 h-4 text-[#D94854]" />
                        ) : (
                          <TrendingUp className="w-4 h-4 text-[#51590E]" />
                        )}
                      </div>
                    )}
                    <p 
                      className="text-lg font-bold"
                      style={{ color: paso.color }}
                    >
                      {formatearMoneda(paso.valor)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Línea final hacia resultado */}
          <div className="flex items-center justify-center py-4">
            <div className="w-px h-8 bg-white/20" />
          </div>

          {/* División final */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-[black]/30 text-[white] rounded-full flex items-center justify-center text-sm font-bold">
                  ÷6
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">👥</span>
                  <div>
                    <h5 className="text-sm font-semibold text-white">División entre 6 personas</h5>
                    <p className="text-xs text-white/60">Resultado final por comisionista</p>
                  </div>
                </div>
              </div>
              <p className="text-xl font-bold text-[white]">
                {formatearMoneda(calculo.comisionPorPersona)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}