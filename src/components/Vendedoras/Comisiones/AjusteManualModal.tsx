import React, { useState, useEffect, useRef } from 'react';
import { X, User, DollarSign, Loader2, Save, Info, CheckCircle2, AlertOctagon, ChevronDown, Search, Check } from 'lucide-react';
import { comisionesVendedorasService } from '@/services/vendedoras/comisionesVendedorasService';
import { toast } from 'react-toastify';
import type { CrearAjusteManualRequest } from '@/types/vendedoras/comisionTypes';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    fecha: string;
    sucursalNombre: string;
    turno: 'Mañana' | 'Tarde';
    vendedoras: string[];
}

export const AjusteManualModal: React.FC<Props> = ({
    isOpen,
    onClose,
    onSuccess,
    fecha,
    sucursalNombre,
    turno,
    vendedoras
}) => {
    const [vendedorNombre, setVendedorNombre] = useState('');
    const [montoAjuste, setMontoAjuste] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [touched, setTouched] = useState({ vendedor: false, monto: false });

    // Estado para el Dropdown Personalizado
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setVendedorNombre('');
            setMontoAjuste('');
            setSearchTerm('');
            setIsDropdownOpen(false);
            setTouched({ vendedor: false, monto: false });
        }
    }, [isOpen]);

    // Click outside para cerrar el dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
                setTouched(prev => ({ ...prev, vendedor: true }));
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            // Focus en el input de búsqueda al abrir
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    if (!isOpen) return null;

    const montoNum = parseFloat(montoAjuste);
    const isValidMonto = !isNaN(montoNum);
    const isNegative = isValidMonto && montoNum < 0;

    // Filtrar vendedoras para el buscador
    const vendedorasFiltradas = vendedoras.filter(v =>
        v.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectVendedora = (nombre: string) => {
        setVendedorNombre(nombre);
        setIsDropdownOpen(false);
        setSearchTerm('');
        setTouched(prev => ({ ...prev, vendedor: true }));
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!vendedorNombre) {
            setTouched(prev => ({ ...prev, vendedor: true }));
            toast.error('Debe seleccionar una vendedora');
            return;
        }

        if (!isValidMonto) {
            setTouched(prev => ({ ...prev, monto: true }));
            toast.error('Debe ingresar un monto válido');
            return;
        }

        try {
            setIsSubmitting(true);
            const request: CrearAjusteManualRequest = {
                fecha,
                sucursalNombre,
                turno,
                vendedorNombre,
                montoAjuste: montoNum
            };

            await comisionesVendedorasService.crearAjusteManual(request);
            toast.success('Ajuste manual creado correctamente');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error al crear ajuste manual:', error);
            toast.error('Error al crear el ajuste manual');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-visible border border-slate-100 animate-in zoom-in-95 duration-300 flex flex-col relative">

                {/* Header Premium */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-slate-50 to-white rounded-t-2xl">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-indigo-600 mb-1">
                            <div className="p-1.5 bg-indigo-50 rounded-lg">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold tracking-wider uppercase opacity-80">Ajuste Financiero</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Añadir Ajuste Manual</h3>
                        <p className="text-sm text-slate-500">
                            {sucursalNombre} • Turno {turno} • {new Date(fecha).toLocaleDateString('es-AR')}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="group p-2 rounded-full hover:bg-slate-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    >
                        <X className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">

                    {/* Information Banner */}
                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex gap-4 text-indigo-900 text-sm leading-relaxed">
                        <Info className="w-5 h-5 shrink-0 text-indigo-500 mt-0.5" />
                        <p>
                            Este ajuste impactará directamente en la liquidación final. <br />
                            <span className="text-indigo-600/80 text-xs mt-1 block font-medium">
                                * Utilice valores negativos (ej: -500) para descuentos o deducciones.
                            </span>
                        </p>
                    </div>

                    <div className="space-y-5">
                        {/* Custom Dropdown Vendedora */}
                        <div className="space-y-2 relative" ref={dropdownRef}>
                            <label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-slate-400" /> Vendedora
                                </span>
                                {touched.vendedor && !vendedorNombre && (
                                    <span className="text-xs text-rose-500 font-medium animate-pulse">Requerido</span>
                                )}
                            </label>

                            <div className="relative">
                                {/* Trigger Button */}
                                <button
                                    type="button"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className={`w-full h-12 pl-4 pr-10 rounded-xl border-2 bg-white text-left font-medium outline-none transition-all duration-200 flex items-center gap-3
                                        ${touched.vendedor && !vendedorNombre
                                            ? 'border-rose-200 hover:border-rose-300 ring-rose-500/10'
                                            : isDropdownOpen
                                                ? 'border-indigo-500 ring-4 ring-indigo-500/10'
                                                : 'border-slate-100 hover:border-slate-300'
                                        }`}
                                >
                                    {vendedorNombre ? (
                                        <>
                                            <div className="w-7 h-7 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">
                                                {getInitials(vendedorNombre)}
                                            </div>
                                            <span className="text-slate-900">{vendedorNombre}</span>
                                        </>
                                    ) : (
                                        <span className="text-slate-400 font-normal">Seleccionar responsable...</span>
                                    )}

                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                    </div>
                                </button>

                                {/* Dropdown Menu */}
                                {isDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top">
                                        {/* Search Box */}
                                        <div className="p-2 border-b border-slate-50 sticky top-0 bg-white">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    ref={searchInputRef}
                                                    type="text"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    placeholder="Buscar vendedora..."
                                                    className="w-full h-9 pl-9 pr-3 rounded-lg bg-slate-50 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-medium placeholder:font-normal"
                                                />
                                            </div>
                                        </div>

                                        {/* Options List */}
                                        <div
                                            className="max-h-60 overflow-y-auto custom-scrollbar p-1.5 space-y-0.5"
                                            onWheel={(e) => e.stopPropagation()}
                                        >
                                            {vendedorasFiltradas.length > 0 ? (
                                                vendedorasFiltradas.map((nombre) => (
                                                    <button
                                                        key={nombre}
                                                        type="button"
                                                        onClick={() => handleSelectVendedora(nombre)}
                                                        className={`w-full px-3 py-2.5 rounded-lg flex items-center justify-between text-left transition-colors duration-150 group
                                                            ${vendedorNombre === nombre
                                                                ? 'bg-indigo-50 text-indigo-900'
                                                                : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                                                                ${vendedorNombre === nombre
                                                                    ? 'bg-indigo-200 text-indigo-700'
                                                                    : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                                                                }`}>
                                                                {getInitials(nombre)}
                                                            </div>
                                                            <span className="font-medium text-sm">{nombre}</span>
                                                        </div>
                                                        {vendedorNombre === nombre && (
                                                            <Check className="w-4 h-4 text-indigo-600" />
                                                        )}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-4 py-8 text-center text-slate-400 text-sm">
                                                    No se encontraron resultados
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Input Monto */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-slate-400" /> Monto del Ajuste
                                </span>
                                {isValidMonto && (
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isNegative ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                        {isNegative ? 'Descuento' : 'Bonificación'}
                                    </span>
                                )}
                            </label>
                            <div className="relative">
                                <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold transition-colors duration-200 
                                    ${isValidMonto ? (isNegative ? 'text-rose-500' : 'text-emerald-500') : 'text-slate-400'}`}>
                                    $
                                </span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={montoAjuste}
                                    onChange={(e) => setMontoAjuste(e.target.value)}
                                    //onBlur={() => setTouched(prev => ({ ...prev, monto: true }))}
                                    placeholder="0.00"
                                    className={`w-full h-12 pl-8 pr-4 rounded-xl border-2 bg-white font-bold text-lg outline-none transition-all duration-200 placeholder:font-normal
                                        ${isValidMonto
                                            ? (isNegative
                                                ? 'border-rose-100 text-rose-600 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                                                : 'border-emerald-100 text-emerald-600 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10')
                                            : 'border-slate-100 text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                                        }`}
                                    required
                                />
                                {isValidMonto && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 animate-in fade-in zoom-in duration-200">
                                        {isNegative ? (
                                            <AlertOctagon className="w-5 h-5 text-rose-500" />
                                        ) : (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-4 pt-4 border-t border-slate-50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-12 rounded-xl border-2 border-slate-100 text-slate-600 font-semibold hover:bg-slate-50 hover:border-slate-200 hover:text-slate-800 transition-all duration-200 focus:ring-4 focus:ring-slate-100 outline-none"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !vendedorNombre || !montoAjuste}
                            className={`flex-[2] h-12 rounded-xl text-white font-bold shadow-lg transition-all duration-200 flex items-center justify-center gap-2 outline-none focus:ring-4 focus:ring-indigo-500/20
                                ${isSubmitting || !vendedorNombre || !montoAjuste
                                    ? 'bg-slate-300 shadow-none cursor-not-allowed opacity-80'
                                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 hover:-translate-y-0.5 active:translate-y-0'
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Guardando...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>Confirmar Ajuste</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
