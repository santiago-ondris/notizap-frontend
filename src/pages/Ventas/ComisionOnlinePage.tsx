import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import { Calculator, ArrowLeft, Loader2, AlertTriangle } from "lucide-react";

import TarjetaVentasPeriodo from "@/components/Comisiones/TarjetaVentasPeriodo";
import FormularioComision from "@/components/Comisiones/FormularioComision";
import TarjetaCalculoComision from "@/components/Comisiones/TarjetaCalculoComision";
import BotonGuardarComision from "@/components/Comisiones/BotonGuardarComision";

import SelectorPeriodo from "@/components/Ventas/Controles/SelectorPeriodo";

import { 
  getComisionByPeriodo,
  createComision,
  updateComision,
  existeComision,
  parsearMonto
} from "@/services/woocommerce/comisionService";
import { getTotalesByPeriodo } from "@/services/woocommerce/wooService";
import { getManualReports } from "@/services/mercadolibre/mercadolibreService";

import { obtenerPeriodoAnterior, esPeriodoValido } from "@/utils/ventas/ventasUtils";

import type { 
  ComisionOnline,
  FormularioComision as FormularioComisionType,
  CalculoComision,
  DatosVentasPeriodo,
  EstadosCarga
} from "@/types/woocommerce/comisionTypes";

interface ComisionOnlinePageProps {
  onVolver?: () => void;
}

export default function ComisionOnlinePage({ onVolver }: ComisionOnlinePageProps) {
  const { role: userRole } = useAuth();

  // Estados principales
  const periodoAnterior = obtenerPeriodoAnterior(new Date().getMonth() + 1, new Date().getFullYear());
  const [mesSeleccionado, setMesSeleccionado] = useState(periodoAnterior.mes);
  const [añoSeleccionado, setAñoSeleccionado] = useState(periodoAnterior.año);

  // Estados de datos
  const [comisionActual, setComisionActual] = useState<ComisionOnline | null>(null);
  const [calculoActual, setCalculoActual] = useState<CalculoComision | null>(null);
  const [datosVentas, setDatosVentas] = useState<DatosVentasPeriodo | null>(null);
  const [existeComisionActual, setExisteComisionActual] = useState(false);

  // Estados de carga
  const [estadosCarga, setEstadosCarga] = useState<EstadosCarga>({
    guardando: false,
    calculando: false,
    cargandoVentas: false,
    cargandoComision: false
  });

  // Estados de error
  const [errorVentas, setErrorVentas] = useState<string | null>(null);
  const [, setErrorComision] = useState<string | null>(null);

  // Permisos
  const puedeAcceder = userRole === 'admin' || userRole === 'superadmin';

  // Cargar datos cuando cambie el período
  useEffect(() => {
    if (puedeAcceder) {
      cargarDatosPeriodo();
    }
  }, [mesSeleccionado, añoSeleccionado, puedeAcceder]);

  const cargarDatosPeriodo = async () => {
    if (!esPeriodoValido(mesSeleccionado, añoSeleccionado)) {
      toast.error("Período inválido seleccionado");
      return;
    }

    setEstadosCarga(prev => ({ 
      ...prev, 
      cargandoVentas: true, 
      cargandoComision: true 
    }));
    setErrorVentas(null);
    setErrorComision(null);
    setCalculoActual(null);

    try {
      // Cargar datos de ventas y comisión en paralelo
      const [ventasWoo, reportesML, comisionExistente, existeComisionCheck] = await Promise.all([
        getTotalesByPeriodo(mesSeleccionado, añoSeleccionado).catch(() => null),
        getManualReports().catch(() => ({ data: [] })),
        getComisionByPeriodo(mesSeleccionado, añoSeleccionado).catch(() => null),
        existeComision(mesSeleccionado, añoSeleccionado).catch(() => false)
      ]);

      // Procesar datos de ventas
      if (ventasWoo) {
        const reporteML = reportesML?.data?.find((r: { month: number; year: number; }) => 
          r.month === mesSeleccionado && r.year === añoSeleccionado
        );

        const montella = ventasWoo.ventasPorTienda.find(t => 
          t.tienda.toUpperCase().includes('MONTELLA')
        )?.montoFacturado || 0;

        const alenka = ventasWoo.ventasPorTienda.find(t => 
          t.tienda.toUpperCase().includes('ALENKA')
        )?.montoFacturado || 0;

        const mercadoLibre = reporteML?.revenue || 0;

        setDatosVentas({
          montella,
          alenka,
          mercadoLibre,
          total: montella + alenka + mercadoLibre
        });
      } else {
        setDatosVentas(null);
        setErrorVentas("No se encontraron datos de ventas para este período");
      }

      setEstadosCarga(prev => ({ ...prev, cargandoVentas: false }));

      // Procesar comisión existente
      setComisionActual(comisionExistente);
      setExisteComisionActual(existeComisionCheck);

      // Si existe comisión, calcular automáticamente
      if (comisionExistente) {
        // Cálculo local de comisión existente
        const totalEnvios = comisionExistente.montoAndreani + comisionExistente.montoOCA + comisionExistente.montoCaddy;
        const baseCalculo = comisionExistente.totalSinNC - totalEnvios;
        const baseCalculoSinIVA = baseCalculo * 0.79;
        const comisionBruta = baseCalculoSinIVA * 0.005;
        const comisionPorPersona = comisionBruta / 6;

        const calculoExistente: CalculoComision = {
          totalSinNC: comisionExistente.totalSinNC,
          totalEnvios,
          baseCalculo,
          baseCalculoSinIVA,
          comisionBruta,
          comisionPorPersona,
          detalleEnvios: [
            { empresa: "ANDREANI", monto: comisionExistente.montoAndreani },
            { empresa: "OCA", monto: comisionExistente.montoOCA },
            { empresa: "CADDY", monto: comisionExistente.montoCaddy }
          ]
        };
        
        setCalculoActual(calculoExistente);
      }

      setEstadosCarga(prev => ({ ...prev, cargandoComision: false }));

    } catch (error: any) {
      console.error('Error al cargar datos del período:', error);
      setErrorVentas("Error al cargar datos de ventas");
      setErrorComision("Error al cargar datos de comisión");
      setEstadosCarga({
        guardando: false,
        calculando: false,
        cargandoVentas: false,
        cargandoComision: false
      });
    }
  };

  const cambiarPeriodo = (mes: number, año: number) => {
    if (!esPeriodoValido(mes, año)) {
      toast.error("Período inválido seleccionado");
      return;
    }
    setMesSeleccionado(mes);
    setAñoSeleccionado(año);
  };

  const manejarCalcular = (formulario: FormularioComisionType) => {
    setEstadosCarga(prev => ({ ...prev, calculando: true }));

    try {
      // Parsear valores
      const totalSinNC = parsearMonto(formulario.totalSinNC);
      const montoAndreani = parsearMonto(formulario.montoAndreani);
      const montoOCA = parsearMonto(formulario.montoOCA);
      const montoCaddy = parsearMonto(formulario.montoCaddy);

      // Cálculo local paso a paso
      const totalEnvios = montoAndreani + montoOCA + montoCaddy;
      const baseCalculo = totalSinNC - totalEnvios;
      const baseCalculoSinIVA = baseCalculo * 0.79; // Se resta el 21%
      const comisionBruta = baseCalculoSinIVA * 0.005; // 0.5%
      const comisionPorPersona = comisionBruta / 6;

      const calculo: CalculoComision = {
        totalSinNC,
        totalEnvios,
        baseCalculo,
        baseCalculoSinIVA,
        comisionBruta,
        comisionPorPersona,
        detalleEnvios: [
          { empresa: "ANDREANI", monto: montoAndreani },
          { empresa: "OCA", monto: montoOCA },
          { empresa: "CADDY", monto: montoCaddy }
        ]
      };

      setCalculoActual(calculo);
      toast.success("🧮 Cálculo realizado correctamente");

    } catch (error: any) {
      console.error('Error al calcular comisión:', error);
      toast.error("Error al realizar el cálculo");
    } finally {
      setEstadosCarga(prev => ({ ...prev, calculando: false }));
    }
  };

  const manejarGuardar = async (formulario: FormularioComisionType) => {
    if (!calculoActual) {
      toast.error("Primero debes realizar el cálculo");
      return;
    }

    setEstadosCarga(prev => ({ ...prev, guardando: true }));

    try {
      const datosGuardar = {
        mes: mesSeleccionado,
        año: añoSeleccionado,
        totalSinNC: parsearMonto(formulario.totalSinNC),
        montoAndreani: parsearMonto(formulario.montoAndreani),
        montoOCA: parsearMonto(formulario.montoOCA),
        montoCaddy: parsearMonto(formulario.montoCaddy)
      };

      let comisionGuardada;
      if (comisionActual) {
        // Actualizar existente
        comisionGuardada = await updateComision({
          ...datosGuardar,
          id: comisionActual.id
        });
        toast.success("🔄 Datos de comisión actualizados correctamente");
      } else {
        // Crear nueva
        comisionGuardada = await createComision(datosGuardar);
        toast.success("💾 Datos de comisión guardados correctamente");
      }

      setComisionActual(comisionGuardada);
      setExisteComisionActual(true);

    } catch (error: any) {
      console.error('Error al guardar comisión:', error);
      toast.error(error.response?.data?.message || "Error al guardar los datos");
    } finally {
      setEstadosCarga(prev => ({ ...prev, guardando: false }));
    }
  };

  const recargarDatosVentas = () => {
    cargarDatosPeriodo();
  };

  // Control de acceso
  if (!puedeAcceder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A1A20] via-[#1A1A20] to-[#212026] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <AlertTriangle className="w-8 h-8 text-[#D94854]" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Acceso Restringido</h3>
                <p className="text-white/60 text-sm mb-4">
                  No tienes permisos para acceder al módulo de comisiones online
                </p>
                {onVolver && (
                  <button
                    onClick={onVolver}
                    className="px-4 py-2 bg-[#D94854]/20 hover:bg-[#D94854]/30 border border-[#D94854]/30 text-[#D94854] rounded-lg text-sm font-medium transition-all"
                  >
                    ← Volver
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const datosFormulario: FormularioComisionType | undefined = comisionActual ? {
    totalSinNC: comisionActual.totalSinNC.toString(),
    montoAndreani: comisionActual.montoAndreani.toString(),
    montoOCA: comisionActual.montoOCA.toString(),
    montoCaddy: comisionActual.montoCaddy.toString()
  } : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A20] via-[#1A1A20] to-[#212026] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header principal */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {onVolver && (
              <button
                onClick={onVolver}
                className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-white/80" />
              </button>
            )}
            
            <div className="p-3 bg-[#51590E]/20 rounded-2xl">
              <Calculator className="w-8 h-8 text-[#51590E]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Comisiones Online</h1>
              <p className="text-white/60 text-lg">
                Cálculo de comisiones por ventas online
              </p>
            </div>
          </div>

          {/* Controles principales */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-white/80">📅 Período:</span>
              <SelectorPeriodo
                mesSeleccionado={mesSeleccionado}
                añoSeleccionado={añoSeleccionado}
                onCambiarPeriodo={cambiarPeriodo}
                mostrarNavegacion={true}
                size="md"
              />
            </div>
          </div>
        </div>

        {/* Estado de carga general */}
        {(estadosCarga.cargandoVentas || estadosCarga.cargandoComision) && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-white/60 animate-spin" />
              <p className="text-white/70 text-sm">🧮 Cargando datos del período...</p>
            </div>
          </div>
        )}

        {/* Contenido principal */}
        {!(estadosCarga.cargandoVentas || estadosCarga.cargandoComision) && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            
            {/* Columna izquierda */}
            <div className="space-y-8">
              {/* Datos de ventas del período */}
              <TarjetaVentasPeriodo
                mes={mesSeleccionado}
                año={añoSeleccionado}
                datosVentas={datosVentas}
                loading={estadosCarga.cargandoVentas}
                error={errorVentas}
                onRecargar={recargarDatosVentas}
              />

              {/* Formulario de comisión */}
              <FormularioComision
                mes={mesSeleccionado}
                año={añoSeleccionado}
                datosIniciales={datosFormulario}
                onCalcular={manejarCalcular}
                onGuardar={manejarGuardar}
                calculoActual={calculoActual}
                loading={estadosCarga.cargandoComision}
                guardando={estadosCarga.guardando}
                calculando={estadosCarga.calculando}
                mostrarGuardar={false}
              />
            </div>

            {/* Columna derecha */}
            <div className="space-y-8">
              {/* Resultado del cálculo */}
              <TarjetaCalculoComision
                calculo={calculoActual}
                mes={mesSeleccionado}
                año={añoSeleccionado}
                mostrarDetalle={true}
              />

              {/* Botón de guardar */}
              {calculoActual && (
                <BotonGuardarComision
                  onGuardar={() => {
                    if (datosFormulario) {
                      manejarGuardar(datosFormulario);
                    }
                  }}
                  calculoActual={calculoActual}
                  mes={mesSeleccionado}
                  año={añoSeleccionado}
                  loading={estadosCarga.guardando}
                  existeComision={existeComisionActual}
                  variant="prominent"
                  mostrarResumen={true}
                />
              )}
            </div>
          </div>
        )}

        {/* Footer informativo */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span>💡</span>
            <span>
              Cálculo: (Total sin NC - Total Envíos - IVA 21%) × 0.5% ÷ 6 personas
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}