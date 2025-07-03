import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";

import DashboardVentas from "@/components/Ventas/Dashboard/DashboardVentas";
import TablaVentasUnificada from "@/components/Ventas/Dashboard/TablaVentasUnificada";

import VentasAdmin from "@/components/Ventas/Admin/VentasAdmin";

// Componentes de controles
import SelectorPeriodo from "@/components/Ventas/Controles/SelectorPeriodo";
import BotonModoAdmin from "@/components/Ventas/Controles/BotonModoAdmin";

import { obtenerPeriodoActual, esPeriodoValido, obtenerPeriodoAnterior } from "@/utils/ventas/ventasUtils";

export default function VentasOnlinePage() {
  // Contexto de autenticación
  const { role: userRole } = useAuth();

  // Estados principales
  const periodoAnterior = obtenerPeriodoAnterior(obtenerPeriodoActual().mes, obtenerPeriodoActual().año);
  const [mesSeleccionado, setMesSeleccionado] = useState(periodoAnterior.mes);
  const [añoSeleccionado, setAñoSeleccionado] = useState(periodoAnterior.año);
  const [modoAdmin, setModoAdmin] = useState(false);
  const [vistaActual, setVistaActual] = useState<'dashboard' | 'tabla'>('dashboard');

  // Permisos
  const puedeAdmin = userRole === 'admin' || userRole === 'superadmin';

  // Handlers
  const cambiarPeriodo = (mes: number, año: number) => {
    if (!esPeriodoValido(mes, año)) {
      toast.error("Período inválido seleccionado");
      return;
    }
    setMesSeleccionado(mes);
    setAñoSeleccionado(año);
  };

  const cambiarModoAdmin = (nuevoModo: boolean) => {
    if (nuevoModo && !puedeAdmin) {
      toast.error("No tienes permisos para acceder al modo administración");
      return;
    }
    setModoAdmin(nuevoModo);
    
    // Mostrar toast informativo
    if (nuevoModo) {
      toast.success("🔧 Modo administración activado");
    } else {
      toast.info("👁️ Modo vista básica activado");
    }
  };

  // Efecto para resetear modo admin si el usuario pierde permisos
  useEffect(() => {
    if (modoAdmin && !puedeAdmin) {
      setModoAdmin(false);
    }
  }, [userRole, puedeAdmin, modoAdmin]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A20] via-[#1A1A20] to-[#212026] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header principal */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#51590E]/20 rounded-2xl">
              <span className="text-3xl">💰</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Módulo de Ventas</h1>
              <p className="text-white/60 text-lg">
                Dashboard consolidado • WooCommerce + MercadoLibre
              </p>
            </div>
          </div>

          {/* Controles principales */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Selector de período */}
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

            {/* Botón modo admin */}
            {puedeAdmin && (
              <BotonModoAdmin
                modoAdmin={modoAdmin}
                onCambiarModo={cambiarModoAdmin}
                userRole={userRole}
                variant="default"
                mostrarTooltip={true}
              />
            )}
          </div>
        </div>

        {/* Navegación de vistas (solo en modo básico) */}
        {!modoAdmin && (
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-2">
            <button
              onClick={() => setVistaActual('dashboard')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                vistaActual === 'dashboard'
                  ? 'bg-[#4A8C8C]/20 text-[white]'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setVistaActual('tabla')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                vistaActual === 'tabla'
                  ? 'bg-[#D94854]/20 text-[#D94854] border border-[#D94854]/30'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              📋 Tabla Anual
            </button>
          </div>
        )}

        {/* Contenido principal */}
        <div className="space-y-8">
          {modoAdmin ? (
            /* Modo administración */
            <VentasAdmin
              mesSeleccionado={mesSeleccionado}
              añoSeleccionado={añoSeleccionado}
              onCambiarPeriodo={cambiarPeriodo}
            />
          ) : (
            /* Modo vista básica */
            <>
              {vistaActual === 'dashboard' && (
                <div className="space-y-8">
                  {/* Dashboard principal */}
                  <DashboardVentas
                    mes={mesSeleccionado}
                    año={añoSeleccionado}
                    mostrarComparacion={true}
                  />
                </div>
              )}

              {vistaActual === 'tabla' && (
                <div className="space-y-8">
                  {/* Tabla anual */}
                  <TablaVentasUnificada
                    año={añoSeleccionado}
                    mostrarVariaciones={true}
                  />

                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}