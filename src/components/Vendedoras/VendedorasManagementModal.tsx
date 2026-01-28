import React, { useState } from 'react';
import { X, Search, User, Check, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';

interface VendedorasManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

import { useVendedoresGestionQuery, useToggleVendedoraMutation } from '@/hooks/vendedoras/useVentasVendedoras';

export const VendedorasManagementModal: React.FC<VendedorasManagementModalProps> = ({
    isOpen,
    onClose,
    onUpdate
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const {
        data: vendedoras = [],
        isLoading: loading
    } = useVendedoresGestionQuery(isOpen);

    const toggleMutation = useToggleVendedoraMutation();

    const handleToggle = async (vendedora: import('@/types/vendedoras/ventaVendedoraTypes').VendedorGestion) => {
        toggleMutation.mutate(vendedora.id, {
            onSuccess: () => {
                toast.success(`Vendedora ${vendedora.activo ? 'desactivada' : 'activada'} correctamente`);
                onUpdate();
            },
            onError: (error) => {
                console.error('Error cambiando estado:', error);
                toast.error('Error al cambiar el estado de la vendedora');
            }
        });
    };

    const filteredVendedoras = vendedoras.filter(v =>
        v.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-[#1e1e24] border border-white/10 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Gestionar Vendedoras</h2>
                    <button
                        onClick={onClose}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white/70 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-6 pb-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            type="text"
                            placeholder="Buscar vendedora..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-violet-500/50 transition-all"
                        />
                    </div>
                </div>

                {/* List */}
                <div
                    className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar"
                    onWheel={(e) => e.stopPropagation()}
                >
                    {loading ? (
                        <div className="text-center py-8 text-white/50">Cargando...</div>
                    ) : filteredVendedoras.length === 0 ? (
                        <div className="text-center py-8 text-white/50">No se encontraron resultados</div>
                    ) : (
                        filteredVendedoras.map(vendedora => (
                            <div
                                key={vendedora.id}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${vendedora.activo
                                    ? 'bg-white/5 border-white/10'
                                    : 'bg-red-500/5 border-red-500/10'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${vendedora.activo ? 'bg-violet-500/20 text-violet-400' : 'bg-red-500/20 text-red-400'
                                        }`}>
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className={`font-medium ${vendedora.activo ? 'text-white' : 'text-white/60 line-through'}`}>
                                            {vendedora.nombre}
                                        </p>
                                        <p className="text-xs text-white/40">
                                            {vendedora.activo ? 'Activa' : 'Inactiva'}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleToggle(vendedora)}
                                    disabled={toggleMutation.isPending && toggleMutation.variables === vendedora.id}
                                    className={`p-2 rounded-lg transition-colors ${vendedora.activo
                                        ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                                        : 'bg-green-500/10 hover:bg-green-500/20 text-green-400'
                                        }`}
                                    title={vendedora.activo ? 'Desactivar' : 'Activar'}
                                >
                                    {toggleMutation.isPending && toggleMutation.variables === vendedora.id ? (
                                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    ) : vendedora.activo ? (
                                        <XCircle className="w-5 h-5" />
                                    ) : (
                                        <Check className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-white/5 rounded-b-2xl">
                    <p className="text-xs text-center text-white/40">
                        Las vendedoras desactivadas no aparecerán en los selectores de carga pero sus datos históricos se mantendrán.
                    </p>
                </div>
            </div>
        </div>
    );
};
