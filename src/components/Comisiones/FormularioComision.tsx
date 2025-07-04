import { useState, useEffect } from "react";
import { Calculator, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import InputMonto from "./InputMonto";
import { 
  validarFormularioComision, 
  formatearParaInput,
  parsearMonto 
} from "@/services/woocommerce/comisionService";
import type { 
  FormularioComision as FormularioComisionType, 
  ValidacionFormulario,
  CalculoComision 
} from "@/types/woocommerce/comisionTypes";

interface FormularioComisionProps {
  mes: number;
  año: number;
  datosIniciales?: FormularioComisionType;
  onCalcular: (datos: FormularioComisionType) => void;
  onGuardar: (datos: FormularioComisionType) => void;
  calculoActual: CalculoComision | null;
  loading: boolean;
  guardando: boolean;
  calculando: boolean;
  disabled?: boolean;
  mostrarGuardar?: boolean;
}

export default function FormularioComision({
  mes,
  año,
  datosIniciales,
  onCalcular,
  onGuardar,
  calculoActual,
  guardando,
  calculando,
  disabled = false,
  mostrarGuardar = true
}: FormularioComisionProps) {
  const [formulario, setFormulario] = useState<FormularioComisionType>({
    totalSinNC: '',
    montoAndreani: '',
    montoOCA: '',
    montoCaddy: ''
  });

  const [errores, setErrores] = useState<ValidacionFormulario>({
    totalSinNC: null,
    montoAndreani: null,
    montoOCA: null,
    montoCaddy: null
  });

  const [calculoRealizado, setCalculoRealizado] = useState(false);

  // Cargar datos iniciales si existen
  useEffect(() => {
    if (datosIniciales) {
      setFormulario({
        totalSinNC: formatearParaInput(parsearMonto(datosIniciales.totalSinNC)),
        montoAndreani: formatearParaInput(parsearMonto(datosIniciales.montoAndreani)),
        montoOCA: formatearParaInput(parsearMonto(datosIniciales.montoOCA)),
        montoCaddy: formatearParaInput(parsearMonto(datosIniciales.montoCaddy))
      });
      setCalculoRealizado(true);
    }
  }, [datosIniciales]);

  // Resetear estado cuando cambie el período
  useEffect(() => {
    if (!datosIniciales) {
      setFormulario({
        totalSinNC: '',
        montoAndreani: '',
        montoOCA: '',
        montoCaddy: ''
      });
      setErrores({
        totalSinNC: null,
        montoAndreani: null,
        montoOCA: null,
        montoCaddy: null
      });
      setCalculoRealizado(false);
    }
  }, [mes, año]);

  const actualizarCampo = (campo: keyof FormularioComisionType, valor: string) => {
    setFormulario(prev => ({
      ...prev,
      [campo]: valor
    }));

    // Limpiar error del campo al modificarlo
    if (errores[campo]) {
      setErrores(prev => ({
        ...prev,
        [campo]: null
      }));
    }

    // Resetear estado de cálculo realizado
    setCalculoRealizado(false);
  };

  const validarYCalcular = () => {
    const validacion = validarFormularioComision(
      formulario.totalSinNC,
      formulario.montoAndreani,
      formulario.montoOCA,
      formulario.montoCaddy
    );

    setErrores({
      totalSinNC: validacion.errores.totalSinNC || null,
      montoAndreani: validacion.errores.montoAndreani || null,
      montoOCA: validacion.errores.montoOCA || null,
      montoCaddy: validacion.errores.montoCaddy || null
    });

    if (validacion.valido) {
      onCalcular(formulario);
      setCalculoRealizado(true);
    }
  };

  const manejarGuardar = () => {
    const validacion = validarFormularioComision(
      formulario.totalSinNC,
      formulario.montoAndreani,
      formulario.montoOCA,
      formulario.montoCaddy
    );

    if (validacion.valido && calculoActual) {
      onGuardar(formulario);
    }
  };

  const formularioCompleto = Object.values(formulario).every(valor => valor.trim() !== '');
  const tieneErrores = Object.values(errores).some(error => error !== null);
  const puedeCalcular = formularioCompleto && !tieneErrores && !calculando && !disabled;
  const puedeGuardar = calculoRealizado && calculoActual && !guardando && !disabled;

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">📝</span>
        <div>
          <h3 className="text-lg font-bold text-white">Datos para Cálculo de Comisiones</h3>
          <p className="text-sm text-white/60">Completa todos los campos para calcular las comisiones</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Paso 1: Total sin NC */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg bg-[#51590E]/20 text-[#51590E] w-6 h-6 rounded-full flex items-center justify-center font-bold">1</span>
            <h4 className="text-base font-semibold text-white">Total sin Notas de Crédito</h4>
          </div>
          
          <InputMonto
            label="Monto Total sin NC"
            value={formulario.totalSinNC}
            onChange={(valor) => actualizarCampo('totalSinNC', valor)}
            placeholder="Ej: 201637407"
            error={errores.totalSinNC}
            disabled={disabled}
            required
            colorTematico="#51590E"
            emoji="💰"
            descripcion="Valor que debe ingresar el usuario manualmente"
          />
        </div>

        {/* Paso 2: Montos de envíos */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg bg-[#D94854]/20 text-[#D94854] w-6 h-6 rounded-full flex items-center justify-center font-bold">2</span>
            <h4 className="text-base font-semibold text-white">Montos Pagados por Envíos</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Andreani */}
            <InputMonto
              label="Andreani"
              value={formulario.montoAndreani}
              onChange={(valor) => actualizarCampo('montoAndreani', valor)}
              placeholder="Ej: 1416094"
              error={errores.montoAndreani}
              disabled={disabled}
              required
              colorTematico="#D94854"
              emoji="🚚"
            />

            {/* OCA */}
            <InputMonto
              label="OCA"
              value={formulario.montoOCA}
              onChange={(valor) => actualizarCampo('montoOCA', valor)}
              placeholder="Ej: 3223902"
              error={errores.montoOCA}
              disabled={disabled}
              required
              colorTematico="#B695BF"
              emoji="📦"
            />

            {/* Caddy */}
            <InputMonto
              label="Caddy"
              value={formulario.montoCaddy}
              onChange={(valor) => actualizarCampo('montoCaddy', valor)}
              placeholder="Ej: 1045535"
              error={errores.montoCaddy}
              disabled={disabled}
              required
              colorTematico="#51590E"
              emoji="🛵"
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          {/* Botón Calcular */}
          <button
            onClick={validarYCalcular}
            disabled={!puedeCalcular}
            className={`
              flex-1 flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-200
              ${puedeCalcular
                ? 'bg-[#51590E]/20 hover:bg-[#51590E]/30 border border-[#51590E]/30 text-[#51590E] hover:scale-[1.02]'
                : 'bg-white/10 border border-white/20 text-white/40 cursor-not-allowed'
              }
            `}
          >
            {calculando ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Calculando...</span>
              </>
            ) : (
              <>
                <Calculator className="w-5 h-5" />
                <span>🧮 Calcular Comisiones</span>
              </>
            )}
          </button>

          {/* Botón Guardar */}
          {mostrarGuardar && (
            <button
              onClick={manejarGuardar}
              disabled={!puedeGuardar}
              className={`
                flex-1 flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-200
                ${puedeGuardar
                  ? 'bg-[#D94854]/20 hover:bg-[#D94854]/30 border border-[#D94854]/30 text-[#D94854] hover:scale-[1.02]'
                  : 'bg-white/10 border border-white/20 text-white/40 cursor-not-allowed'
                }
              `}
            >
              {guardando ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>💾 Guardar Datos</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Estados informativos */}
        {calculoRealizado && calculoActual && (
          <div className="flex items-center gap-2 p-3 bg-[#51590E]/20 border border-[#51590E]/30 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-[#51590E]" />
            <span className="text-sm text-[#51590E] font-medium">
              ✅ Cálculo realizado correctamente
            </span>
          </div>
        )}

        {tieneErrores && (
          <div className="flex items-center gap-2 p-3 bg-[#D94854]/20 border border-[#D94854]/30 rounded-lg">
            <AlertCircle className="w-4 h-4 text-[#D94854]" />
            <span className="text-sm text-[#D94854] font-medium">
              ⚠️ Por favor corrige los errores para continuar
            </span>
          </div>
        )}
      </div>
    </div>
  );
}