import { useState } from "react";
import { Plus, Settings, FileText, Edit, Eye, EyeOff } from "lucide-react";
import FormularioVentaWooCommerce from "./FormularioVentaWooCommerce";
import ListaVentasWooCommerce from "./ListaVentasWooCommerce";
import type { VentaWooCommerce } from "@/types/woocommerce/wooTypes";

type VistaAdmin = 'lista' | 'crear' | 'editar';

interface VentasAdminProps {
  mesSeleccionado: number;
  añoSeleccionado: number;
  onCambiarPeriodo?: (mes: number, año: number) => void;
}

export default function VentasAdmin({ 
  mesSeleccionado, 
  añoSeleccionado,
}: VentasAdminProps) {
  const [vista, setVista] = useState<VistaAdmin>('lista');
  const [ventaEditando, setVentaEditando] = useState<VentaWooCommerce | null>(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Handlers para cambiar vistas
  const irACrear = () => {
    setVentaEditando(null);
    setVista('crear');
  };

  const irAEditar = (venta: VentaWooCommerce) => {
    setVentaEditando(venta);
    setVista('editar');
  };

  const irALista = () => {
    setVista('lista');
    setVentaEditando(null);
  };

  // Handler para refrescar la lista después de operaciones CRUD
  const onOperacionExitosa = () => {
    setRefreshKey(prev => prev + 1);
    irALista();
  };

  const estadisticasRapidas = {
    totalFormularios: vista === 'lista' ? 'Listado completo' : vista === 'crear' ? 'Nuevo registro' : 'Editando registro',
    periodoActual: `${String(mesSeleccionado).padStart(2, '0')}/${añoSeleccionado}`,
    accion: vista === 'crear' ? 'Creando' : vista === 'editar' ? 'Editando' : 'Gestionando'
  };

  return (
    <div className="space-y-6">
      {/* Header del panel admin */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#D94854]/20 rounded-lg">
              <Settings className="w-6 h-6 text-[#D94854]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">🛠️ Panel de Administración</h2>
              <p className="text-sm text-white/60">
                {estadisticasRapidas.accion} ventas WooCommerce • Período: {estadisticasRapidas.periodoActual}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle detalles */}
            <button
              onClick={() => setMostrarDetalles(!mostrarDetalles)}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white/80 text-sm font-medium transition-all flex items-center gap-2"
            >
              {mostrarDetalles ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {mostrarDetalles ? 'Ocultar detalles' : 'Mostrar detalles'}
            </button>

            {/* Botón crear (solo visible en vista lista) */}
            {vista === 'lista' && (
              <button
                onClick={irACrear}
                className="px-4 py-2 bg-[#51590E]/20 hover:bg-[#51590E]/30 border border-[#51590E]/30 text-[#51590E] rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nueva Venta
              </button>
            )}

            {/* Botón volver (visible en vistas crear/editar) */}
            {(vista === 'crear' || vista === 'editar') && (
              <button
                onClick={irALista}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Volver a Lista
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas (solo si mostrarDetalles está activado) */}
      {mostrarDetalles && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[#51590E]" />
              <div>
                <h3 className="text-sm font-medium text-white/80">Estado Actual</h3>
                <p className="text-lg font-bold text-white">{estadisticasRapidas.totalFormularios}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-[#B695BF]" />
              <div>
                <h3 className="text-sm font-medium text-white/80">Modo</h3>
                <p className="text-lg font-bold text-[#B695BF]">Administración</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Edit className="w-5 h-5 text-[#D94854]" />
              <div>
                <h3 className="text-sm font-medium text-white/80">Acción</h3>
                <p className="text-lg font-bold text-[#D94854]">{estadisticasRapidas.accion}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal según la vista */}
      <div className="min-h-[400px]">
        {vista === 'lista' && (
          <ListaVentasWooCommerce
            refreshKey={refreshKey}
            onEditar={irAEditar}
            mostrarDetalles={mostrarDetalles}
            mesSeleccionado={mesSeleccionado}
            añoSeleccionado={añoSeleccionado}
          />
        )}

        {vista === 'crear' && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Plus className="w-6 h-6 text-[#51590E]" />
              <div>
                <h3 className="text-lg font-bold text-white">➕ Crear Nueva Venta WooCommerce</h3>
                <p className="text-sm text-white/60">
                  Registra los datos de ventas para una tienda y período específico
                </p>
              </div>
            </div>
            
            <FormularioVentaWooCommerce
              modo="crear"
              mesInicial={mesSeleccionado}
              añoInicial={añoSeleccionado}
              onExito={onOperacionExitosa}
              onCancelar={irALista}
            />
          </div>
        )}

        {vista === 'editar' && ventaEditando && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Edit className="w-6 h-6 text-[#D94854]" />
              <div>
                <h3 className="text-lg font-bold text-white">✏️ Editar Venta WooCommerce</h3>
                <p className="text-sm text-white/60">
                  Modificando: {ventaEditando.tienda} - {ventaEditando.periodoCompleto}
                </p>
              </div>
            </div>
            
            <FormularioVentaWooCommerce
              modo="editar"
              ventaExistente={ventaEditando}
              onExito={onOperacionExitosa}
              onCancelar={irALista}
            />
          </div>
        )}
      </div>
    </div>
  );
}