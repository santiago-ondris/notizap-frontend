import React from 'react';
import { Edit, Trash2, Calendar, DollarSign, User, CreditCard, Repeat, Star } from 'lucide-react';
import type { Gasto } from '../../types/gastos';
import { CATEGORIA_CONFIG } from '../../types/gastos';
import { GastoService } from '../../services/gastos/gastoService';

interface GastoCardProps {
  gasto: Gasto;
  onEdit?: (gasto: Gasto) => void;
  onDelete?: (id: number) => void;
  isLoading?: boolean;
  userRole?: 'viewer' | 'admin' | 'superadmin';
}

export const GastoCard: React.FC<GastoCardProps> = ({
  gasto,
  onEdit,
  onDelete,
  isLoading = false,
  userRole = 'viewer'
}) => {
  
  // Obtener configuración de la categoría
  const categoriaConfig = CATEGORIA_CONFIG[gasto.categoria as keyof typeof CATEGORIA_CONFIG] || CATEGORIA_CONFIG['Otros'];
  
  // Verificar si el usuario puede editar/eliminar
  const canEdit = userRole === 'admin' || userRole === 'superadmin';

  // Handlers
  const handleEdit = () => {
    if (canEdit && onEdit) {
      onEdit(gasto);
    }
  };

  const handleDelete = () => {
    if (canEdit && onDelete && window.confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
      onDelete(gasto.id);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all group">
      
      {/* Header con título y acciones */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          {/* Emoji de categoría */}
          <span className="text-2xl">{categoriaConfig.emoji}</span>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white truncate">
                {gasto.nombre}
              </h3>
              
              {/* Badges */}
              {gasto.esImportante && (
                <div className="flex items-center gap-1 bg-yellow-500/20 border border-yellow-500/30 rounded-md px-2 py-1">
                  <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
                  <span className="text-xs text-yellow-400 font-medium">Importante</span>
                </div>
              )}
              
              {gasto.esRecurrente && (
                <div className="flex items-center gap-1 bg-blue-500/20 border border-blue-500/30 rounded-md px-2 py-1">
                  <Repeat className="w-3 h-3 text-blue-400" />
                  <span className="text-xs text-blue-400 font-medium">{gasto.frecuenciaRecurrencia}</span>
                </div>
              )}
            </div>
            
            {/* Categoría */}
            <div className="flex items-center gap-1 mt-1">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: categoriaConfig.color }}
              />
              <span className="text-sm text-white/70">{gasto.categoria}</span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        {canEdit && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleEdit}
              disabled={isLoading}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Editar gasto"
            >
              <Edit className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="p-2 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Eliminar gasto"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Descripción */}
      {gasto.descripcion && (
        <p className="text-white/70 text-sm mb-3 line-clamp-2">
          {gasto.descripcion}
        </p>
      )}

      {/* Información detallada */}
      <div className="space-y-2">
        {/* Monto principal */}
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-400" />
          <span className="text-xl font-bold text-green-400">
            {GastoService.formatearMonto(gasto.monto)}
          </span>
        </div>

        {/* Fecha */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-white/60" />
          <span className="text-sm text-white/70">
            {GastoService.formatearFecha(gasto.fecha)}
          </span>
        </div>

        {/* Proveedor (si existe) */}
        {gasto.proveedor && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-white/60" />
            <span className="text-sm text-white/70">{gasto.proveedor}</span>
          </div>
        )}

        {/* Método de pago (si existe) */}
        {gasto.metodoPago && (
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-white/60" />
            <span className="text-sm text-white/70">{gasto.metodoPago}</span>
          </div>
        )}
      </div>

      {/* Footer con fecha de creación */}
      <div className="mt-3 pt-3 border-t border-white/10">
        <span className="text-xs text-white/50">
          Registrado el {GastoService.formatearFecha(gasto.fechaCreacion)}
        </span>
      </div>
    </div>
  );
};