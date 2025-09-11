import React from 'react';
import { 
  Truck, 
  Package, 
  Store, 
  ShoppingCart,
  Users,
  BarChart3,
  Loader2
} from 'lucide-react';
import { type EnvioResumenMensual, TIPOS_ENVIO } from '@/types/envios/enviosTypes';

interface EnviosResumenProps {
  resumen: EnvioResumenMensual | null;
  cargando?: boolean;
}

interface CardResumenProps {
  titulo: string;
  valor: number;
  icono: React.ReactNode;
  color: string;
  descripcion?: string;
  cargando?: boolean;
}

/**
 * Componente individual para cada card de resumen
 */
const CardResumen: React.FC<CardResumenProps> = ({ 
  titulo, 
  valor, 
  icono, 
  color, 
  descripcion,
  cargando = false 
}) => {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-lg border"
            style={{ 
              backgroundColor: `${color}20`, 
              borderColor: `${color}30` 
            }}
          >
            {icono}
          </div>
          <div>
            <h3 className="font-medium text-white/80 text-sm">
              {titulo}
            </h3>
            {descripcion && (
              <p className="text-xs text-white/50 mt-1">
                {descripcion}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {cargando ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-white/60" />
            <span className="text-white/60 text-sm">Cargando...</span>
          </div>
        ) : (
          <>
            <span 
              className="text-2xl font-bold"
              style={{ color }}
            >
              {valor.toLocaleString()}
            </span>
            <span className="text-white/60 text-sm">
              envíos
            </span>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * Componente principal que muestra el resumen mensual en cards
 */
export const EnviosResumen: React.FC<EnviosResumenProps> = ({ 
  resumen, 
  cargando = false 
}) => {
  // Si no hay datos y no está cargando, mostrar estado vacío
  if (!resumen && !cargando) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
        <div className="text-center">
          <Package className="w-8 h-8 text-white/40 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white/60 mb-2">
            Sin datos de resumen
          </h3>
          <p className="text-white/50 text-sm">
            No hay registros de envíos para el período seleccionado
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Título de la sección */}
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-[#B695BF]" />
        <h2 className="text-xl font-semibold text-white">
          📊 Resumen Mensual
        </h2>
      </div>

      {/* Grid de cards principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card de Total General */}
        <CardResumen
          titulo="Total General"
          valor={resumen?.totalGeneral || 0}
          icono={<Package className="w-5 h-5" style={{ color: TIPOS_ENVIO.mercadoLibre.color }} />}
          color={TIPOS_ENVIO.mercadoLibre.color}
          descripcion="Todos los envíos del mes"
          cargando={cargando}
        />

        {/* Card de OCA */}
        <CardResumen
          titulo={TIPOS_ENVIO.oca.label}
          valor={resumen?.totalOca || 0}
          icono={<Truck className="w-5 h-5" style={{ color: TIPOS_ENVIO.oca.color }} />}
          color={TIPOS_ENVIO.oca.color}
          descripcion="Envíos por OCA"
          cargando={cargando}
        />

        {/* Card de Andreani */}
        <CardResumen
          titulo={TIPOS_ENVIO.andreani.label}
          valor={resumen?.totalAndreani || 0}
          icono={<Truck className="w-5 h-5" style={{ color: TIPOS_ENVIO.andreani.color }} />}
          color={TIPOS_ENVIO.andreani.color}
          descripcion="Envíos por Andreani"
          cargando={cargando}
        />

        {/* Card de Mercado Libre */}
        <CardResumen
          titulo={TIPOS_ENVIO.mercadoLibre.label}
          valor={resumen?.totalMercadoLibre || 0}
          icono={<ShoppingCart className="w-5 h-5" style={{ color: TIPOS_ENVIO.mercadoLibre.color }} />}
          color={TIPOS_ENVIO.mercadoLibre.color}
          descripcion="Envíos ML"
          cargando={cargando}
        />
      </div>

      {/* Grid de cards secundarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card de Retiros en Sucursal */}
        <CardResumen
          titulo={TIPOS_ENVIO.retirosSucursal.label}
          valor={resumen?.totalRetirosSucursal || 0}
          icono={<Store className="w-5 h-5" style={{ color: TIPOS_ENVIO.retirosSucursal.color }} />}
          color={TIPOS_ENVIO.retirosSucursal.color}
          descripcion="Retiros en sucursal"
          cargando={cargando}
        />

        <CardResumen
          titulo={TIPOS_ENVIO.caddy.label}
          valor={resumen?.totalCaddy || 0}
          icono={<Users className="w-5 h-5" style={{ color: TIPOS_ENVIO.caddy.color }} />}
          color={TIPOS_ENVIO.caddy.color}
          descripcion="Envíos con Caddy"
          cargando={cargando}
        />
      </div>

      {/* Card especial para Caddy */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Información adicional */}
        <div className="md:col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#51590E]/20 border border-[#51590E]/30 rounded-lg">
              <BarChart3 className="w-5 h-5 text-[#51590E]" />
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-white">📈 Estadísticas del período</h4>
              <div className="text-sm text-white/70 space-y-1">
                {resumen && !cargando ? (
                  <>
                    <p>• <strong>Promedio diario:</strong> ~{Math.round((resumen.totalGeneral || 0) / 30)} envíos</p>
                    <p>• <strong>Principal método:</strong> {
                      resumen.totalOca > resumen.totalAndreani ? 'OCA' : 'Andreani'
                    } ({Math.max(resumen.totalOca || 0, resumen.totalAndreani || 0)} envíos)</p>
                    <p>• <strong>Envíos locales:</strong> {((resumen.totalCordobaCapital + resumen.totalRetirosSucursal) || 0)} envíos</p>
                  </>
                ) : (
                  <p>Selecciona un período para ver estadísticas detalladas</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnviosResumen;