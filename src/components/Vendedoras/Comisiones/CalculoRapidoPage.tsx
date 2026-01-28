import React, { useState } from 'react';
import {
    Zap,
    Calendar,
    ChevronDown,
    ChevronUp,
    CheckCircle2,
    Circle,
    Loader2,
    Calculator,
    Building2,
    Users,
    Search,
    CheckSquare,
    Square
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { comisionesBatchService, batchHelpers } from '@/services/vendedoras/comisionesBatchService';
import { toast } from 'react-toastify';
import type {
    TurnosPendientesBatch,
    TurnoPendiente,
    TurnoParaCalcular,
    VendedoraDisponible
} from '@/types/vendedoras/comisionTypes';

interface Props {
    onCalculoExitoso?: () => void;
}

export const CalculoRapidoPage: React.FC<Props> = ({ onCalculoExitoso }) => {
    const [fechaInicio, setFechaInicio] = useState(batchHelpers.obtenerFechaInicioDefault());
    const [fechaFin, setFechaFin] = useState(batchHelpers.obtenerFechaFinDefault());
    const [loading, setLoading] = useState(false);
    const [calculando, setCalculando] = useState(false);
    const [datos, setDatos] = useState<TurnosPendientesBatch | null>(null);
    const [turnosExpandidos, setTurnosExpandidos] = useState<Set<string>>(new Set());
    const [turnosSeleccionados, setTurnosSeleccionados] = useState<Map<string, TurnoPendiente>>(new Map());
    const [porcentajeGlobal, setPorcentajeGlobal] = useState<number>(1);
    const [modoGlobal, setModoGlobal] = useState<import('@/types/vendedoras/comisionTypes').ModoCalculoComision>('Compartido');

    // Filtros de visualización
    const [filtroSucursal, setFiltroSucursal] = useState<string | null>(null);
    const [filtroTurno, setFiltroTurno] = useState<'Mañana' | 'Tarde' | null>(null);

    const generarKeyTurno = (turno: TurnoPendiente): string => {
        return `${turno.fecha}_${turno.sucursalNombre}_${turno.turno}`;
    };

    const cargarTurnosPendientes = async () => {
        try {
            setLoading(true);
            const resultado = await comisionesBatchService.obtenerTurnosPendientes(fechaInicio, fechaFin);
            setDatos(resultado);

            // Pre-seleccionar todos los turnos con vendedoras por defecto
            const nuevaSeleccion = new Map<string, TurnoPendiente>();
            resultado.porSucursal.forEach(sucursal => {
                sucursal.turnos.forEach(turno => {
                    const key = generarKeyTurno(turno);
                    // Pre-seleccionar solo vendedoras con ventas
                    const vendedorasConVentas = turno.vendedoras.filter(v => v.tieneVentasEnElDia);
                    nuevaSeleccion.set(key, {
                        ...turno,
                        seleccionado: true,
                        modificado: false,
                        vendedorasSeleccionadas: vendedorasConVentas,
                        porcentajeComision: porcentajeGlobal,
                        modoCalculo: modoGlobal
                    });
                });
            });
            setTurnosSeleccionados(nuevaSeleccion);
            setTurnosExpandidos(new Set());

        } catch (err: any) {
            console.error('Error cargando turnos:', err);
            toast.error(err.response?.data?.message || 'Error al cargar turnos pendientes');
        } finally {
            setLoading(false);
        }
    };

    const toggleExpandirTurno = (key: string) => {
        setTurnosExpandidos(prev => {
            const nuevo = new Set(prev);
            if (nuevo.has(key)) {
                nuevo.delete(key);
            } else {
                nuevo.add(key);
            }
            return nuevo;
        });
    };

    const toggleSeleccionTurno = (turno: TurnoPendiente) => {
        const key = generarKeyTurno(turno);
        setTurnosSeleccionados(prev => {
            const nuevo = new Map(prev);
            const actual = nuevo.get(key);
            if (actual) {
                nuevo.set(key, { ...actual, seleccionado: !actual.seleccionado });
            }
            return nuevo;
        });
    };

    const toggleSeleccionarTodos = () => {
        const todosSeleccionados = Array.from(turnosSeleccionados.values()).every(t => t.seleccionado);
        setTurnosSeleccionados(prev => {
            const nuevo = new Map(prev);
            nuevo.forEach((turno, key) => {
                nuevo.set(key, { ...turno, seleccionado: !todosSeleccionados });
            });
            return nuevo;
        });
    };

    const actualizarVendedorasTurno = (key: string, vendedoras: VendedoraDisponible[]) => {
        setTurnosSeleccionados(prev => {
            const nuevo = new Map(prev);
            const turno = nuevo.get(key);
            if (turno) {
                nuevo.set(key, {
                    ...turno,
                    vendedorasSeleccionadas: vendedoras,
                    modificado: true
                });
            }
            return nuevo;
        });
    };

    const actualizarPorcentajeTurno = (key: string, porcentaje: number) => {
        setTurnosSeleccionados(prev => {
            const nuevo = new Map(prev);
            const turno = nuevo.get(key);
            if (turno) {
                nuevo.set(key, {
                    ...turno,
                    porcentajeComision: porcentaje,
                    modificado: porcentaje !== porcentajeGlobal
                });
            }
            return nuevo;
        });
    };

    const actualizarModoTurno = (key: string, modo: import('@/types/vendedoras/comisionTypes').ModoCalculoComision) => {
        setTurnosSeleccionados(prev => {
            const nuevo = new Map(prev);
            const turno = nuevo.get(key);
            if (turno) {
                nuevo.set(key, {
                    ...turno,
                    modoCalculo: modo,
                    modificado: modo !== modoGlobal
                });
            }
            return nuevo;
        });
    };

    const toggleVendedora = (key: string, vendedora: VendedoraDisponible) => {
        const turno = turnosSeleccionados.get(key);
        if (!turno) return;

        const vendedorasActuales = turno.vendedorasSeleccionadas || [];
        const existe = vendedorasActuales.find(v => v.id === vendedora.id);

        if (existe) {
            actualizarVendedorasTurno(key, vendedorasActuales.filter(v => v.id !== vendedora.id));
        } else {
            actualizarVendedorasTurno(key, [...vendedorasActuales, vendedora]);
        }
    };

    const calcularBatch = async () => {
        const turnosParaCalcular: TurnoParaCalcular[] = [];

        turnosSeleccionados.forEach(turno => {
            if (!turno.seleccionado) return;

            // Respetar filtros visuales activos
            if (filtroSucursal && turno.sucursalNombre !== filtroSucursal) return;
            if (filtroTurno && turno.turno !== filtroTurno) return;

            if (!turno.vendedorasSeleccionadas || turno.vendedorasSeleccionadas.length === 0) return;

            turnosParaCalcular.push({
                fecha: turno.fecha,
                sucursalNombre: turno.sucursalNombre,
                turno: turno.turno,
                vendedorasNombres: turno.vendedorasSeleccionadas.map(v => v.nombre),
                porcentajeComision: turno.porcentajeComision || porcentajeGlobal,
                modoCalculo: turno.modoCalculo || modoGlobal
            });
        });

        if (turnosParaCalcular.length === 0) {
            toast.warning('No hay turnos seleccionados para calcular');
            return;
        }

        try {
            setCalculando(true);
            const resultado = await comisionesBatchService.calcularBatch({ turnos: turnosParaCalcular });

            if (resultado.turnosConError === 0) {
                toast.success(resultado.mensaje);
            } else {
                toast.warning(resultado.mensaje);
            }

            // Recargar para ver los turnos restantes
            await cargarTurnosPendientes();
            onCalculoExitoso?.();

        } catch (err: any) {
            console.error('Error calculando batch:', err);
            toast.error(err.response?.data?.message || 'Error al calcular comisiones');
        } finally {
            setCalculando(false);
        }
    };

    // Filtrar datos según filtros activos
    const datosFiltrados = datos ? {
        ...datos,
        porSucursal: datos.porSucursal
            .filter(s => !filtroSucursal || s.sucursalNombre === filtroSucursal)
            .map(s => ({
                ...s,
                turnos: s.turnos.filter(t => !filtroTurno || t.turno === filtroTurno)
            }))
            .filter(s => s.turnos.length > 0)
    } : null;

    const turnosFiltradosCount = datosFiltrados?.porSucursal.reduce((acc, s) => acc + s.turnos.length, 0) || 0;
    const turnosSeleccionadosVisibles = datosFiltrados?.porSucursal.reduce((acc, s) => {
        return acc + s.turnos.filter(t => turnosSeleccionados.get(generarKeyTurno(t))?.seleccionado).length;
    }, 0) || 0;
    const totalTurnos = turnosSeleccionados.size;

    return (
        <div className="space-y-6">
            {/* Header con selector de fechas */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-white/60 mb-1">Fecha inicio</label>
                            <input
                                type="date"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                                disabled={loading || calculando}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-white/60 mb-1">Fecha fin</label>
                            <input
                                type="date"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                                disabled={loading || calculando}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div>
                            <label className="block text-sm text-white/60 mb-1">Modo Global</label>
                            <select
                                value={modoGlobal}
                                onChange={(e) => setModoGlobal(e.target.value as any)}
                                className="w-32 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none"
                                disabled={loading || calculando}
                            >
                                <option value="Compartido">Compartido</option>
                                <option value="Individual">Individual</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-white/60 mb-1">% Global</label>
                            <input
                                type="number"
                                min="0.1"
                                step="0.1"
                                value={porcentajeGlobal}
                                onChange={(e) => setPorcentajeGlobal(parseFloat(e.target.value) || 1)}
                                className="w-24 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                                disabled={loading || calculando}
                            />
                        </div>
                    </div>

                    <button
                        onClick={cargarTurnosPendientes}
                        disabled={loading || calculando}
                        className="px-6 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        Buscar
                    </button>
                </div>
            </div>

            {/* Estado inicial */}
            {!datos && !loading && (
                <div className="text-center py-12 text-white/60">
                    <Zap className="w-12 h-12 mx-auto mb-4 text-yellow-400/50" />
                    <p>Selecciona un rango de fechas y haz clic en "Buscar" para ver los turnos pendientes</p>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                    <span className="ml-3 text-white/60">Cargando turnos pendientes...</span>
                </div>
            )}

            {/* Sin resultados */}
            {datos && datos.totalTurnos === 0 && (
                <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-400" />
                    <p className="text-white">¡Todo calculado!</p>
                    <p className="text-white/60 text-sm mt-1">No hay turnos pendientes en el rango seleccionado</p>
                </div>
            )}

            {/* Lista de turnos por sucursal */}
            {datos && datos.totalTurnos > 0 && (
                <>
                    {/* Toolbar con filtros de visualización */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-3">
                        {/* Fila principal */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={toggleSeleccionarTodos}
                                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                            >
                                {turnosSeleccionadosVisibles === turnosFiltradosCount ? (
                                    <CheckSquare className="w-5 h-5 text-green-400" />
                                ) : (
                                    <Square className="w-5 h-5" />
                                )}
                                <span className="text-sm">
                                    {turnosSeleccionadosVisibles}/{turnosFiltradosCount} visibles seleccionados
                                    {(filtroSucursal || filtroTurno) && (
                                        <span className="text-white/40 ml-1">({totalTurnos} total)</span>
                                    )}
                                </span>
                            </button>

                            <div className="flex items-center gap-2">
                                {(filtroSucursal || filtroTurno) && (
                                    <button
                                        onClick={() => {
                                            setFiltroSucursal(null);
                                            setFiltroTurno(null);
                                        }}
                                        className="px-2 py-1 text-xs bg-red-500/20 border border-red-500/40 text-red-300 rounded hover:bg-red-500/30 transition-colors"
                                    >
                                        Limpiar filtros
                                    </button>
                                )}
                                <div className="text-sm text-white/60">
                                    Total: {batchHelpers.formatearMoneda(datos.montoTotalFacturado)}
                                </div>
                            </div>
                        </div>

                        {/* Filtros por sucursal */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                            <span className="text-xs text-white/40 mr-1">Filtrar sucursal:</span>
                            {datos.porSucursal.map(sucursal => (
                                <button
                                    key={sucursal.sucursalNombre}
                                    onClick={() => setFiltroSucursal(
                                        filtroSucursal === sucursal.sucursalNombre ? null : sucursal.sucursalNombre
                                    )}
                                    className={cn(
                                        "px-2 py-1 text-xs rounded border transition-colors",
                                        filtroSucursal === sucursal.sucursalNombre
                                            ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                                            : "bg-white/5 border-white/20 text-white/60 hover:bg-white/10"
                                    )}
                                >
                                    {sucursal.sucursalNombre}
                                </button>
                            ))}
                        </div>

                        {/* Filtros por turno */}
                        <div className="flex flex-wrap gap-2">
                            <span className="text-xs text-white/40 mr-1">Filtrar turno:</span>
                            {(['Mañana', 'Tarde'] as const).map(turnoNombre => (
                                <button
                                    key={turnoNombre}
                                    onClick={() => setFiltroTurno(
                                        filtroTurno === turnoNombre ? null : turnoNombre
                                    )}
                                    className={cn(
                                        "px-2 py-1 text-xs rounded border transition-colors",
                                        filtroTurno === turnoNombre
                                            ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
                                            : "bg-white/5 border-white/20 text-white/60 hover:bg-white/10"
                                    )}
                                >
                                    {turnoNombre}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sucursales filtradas */}
                    <div className="space-y-4">
                        {datosFiltrados?.porSucursal.map(sucursal => (
                            <div key={sucursal.sucursalNombre} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                                {/* Header sucursal */}
                                <div className="flex items-center justify-between p-4 border-b border-white/10">
                                    <div className="flex items-center gap-3">
                                        <Building2 className="w-5 h-5 text-purple-400" />
                                        <span className="font-medium text-white">{sucursal.sucursalNombre}</span>
                                        <span className="text-sm text-white/60">({sucursal.totalTurnos} turnos)</span>
                                    </div>
                                    <span className="text-sm text-white/40">
                                        {batchHelpers.formatearMoneda(sucursal.montoTotalFacturado)}
                                    </span>
                                </div>

                                {/* Turnos */}
                                <div className="divide-y divide-white/5">
                                    {sucursal.turnos.map(turno => {
                                        const key = generarKeyTurno(turno);
                                        const turnoSeleccionado = turnosSeleccionados.get(key);
                                        const expandido = turnosExpandidos.has(key);
                                        const vendedorasSeleccionadas = turnoSeleccionado?.vendedorasSeleccionadas || [];

                                        return (
                                            <div key={key}>
                                                {/* Fila del turno */}
                                                <div className="flex items-center gap-4 p-3 hover:bg-white/5 transition-colors">
                                                    {/* Checkbox */}
                                                    <button
                                                        onClick={() => toggleSeleccionTurno(turno)}
                                                        className="flex-shrink-0"
                                                        disabled={calculando}
                                                    >
                                                        {turnoSeleccionado?.seleccionado ? (
                                                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                                                        ) : (
                                                            <Circle className="w-5 h-5 text-white/40" />
                                                        )}
                                                    </button>

                                                    {/* Info del turno */}
                                                    <div className="flex-1 grid grid-cols-4 gap-2 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 text-white/40" />
                                                            <span className="text-white/80">{batchHelpers.formatearFecha(turno.fecha)}</span>
                                                        </div>
                                                        <div className="text-white/60">{turno.turno}</div>
                                                        <div className="text-white/80">{batchHelpers.formatearMoneda(turno.montoFacturado)}</div>
                                                        <div className="flex items-center gap-1 text-white/60">
                                                            <Users className="w-4 h-4" />
                                                            <span>{vendedorasSeleccionadas.length} / {turno.vendedoras.filter(v => v.tieneVentasEnElDia).length}</span>
                                                            {turnoSeleccionado?.modificado && (
                                                                <span className="text-yellow-400 text-xs ml-1">✏️</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Botón expandir */}
                                                    <button
                                                        onClick={() => toggleExpandirTurno(key)}
                                                        className="p-1 hover:bg-white/10 rounded transition-colors"
                                                    >
                                                        {expandido ? (
                                                            <ChevronUp className="w-5 h-5 text-white/40" />
                                                        ) : (
                                                            <ChevronDown className="w-5 h-5 text-white/40" />
                                                        )}
                                                    </button>
                                                </div>

                                                {/* Panel expandido */}
                                                {expandido && (
                                                    <div className="p-4 bg-black/20 border-t border-white/5">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {/* Porcentaje y Modo */}
                                                            <div>
                                                                <div className="mb-4">
                                                                    <label className="block text-sm text-white/60 mb-1">% Comisión</label>
                                                                    <input
                                                                        type="number"
                                                                        min="0.1"
                                                                        step="0.1"
                                                                        value={turnoSeleccionado?.porcentajeComision || porcentajeGlobal}
                                                                        onChange={(e) => actualizarPorcentajeTurno(key, parseFloat(e.target.value) || 1)}
                                                                        className="w-24 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                                                                        disabled={calculando}
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="block text-sm text-white/60 mb-1">Modo Cálculo</label>
                                                                    <select
                                                                        value={turnoSeleccionado?.modoCalculo || modoGlobal}
                                                                        onChange={(e) => actualizarModoTurno(key, e.target.value as any)}
                                                                        className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none"
                                                                        disabled={calculando}
                                                                    >
                                                                        <option value="Compartido">Compartido</option>
                                                                        <option value="Individual">Individual</option>
                                                                    </select>
                                                                </div>
                                                            </div>

                                                            {/* Vendedoras */}
                                                            <div>
                                                                <label className="block text-sm text-white/60 mb-1">Vendedoras</label>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {turno.vendedoras.map(vendedora => {
                                                                        const seleccionada = vendedorasSeleccionadas.some(v => v.id === vendedora.id);
                                                                        return (
                                                                            <button
                                                                                key={vendedora.id}
                                                                                onClick={() => toggleVendedora(key, vendedora)}
                                                                                disabled={calculando}
                                                                                className={cn(
                                                                                    "px-2 py-1 text-xs rounded border transition-colors",
                                                                                    seleccionada
                                                                                        ? "bg-green-500/20 border-green-500/40 text-green-300"
                                                                                        : "bg-white/5 border-white/20 text-white/60 hover:bg-white/10",
                                                                                    vendedora.tieneVentasEnElDia && !seleccionada && "border-blue-500/40"
                                                                                )}
                                                                            >
                                                                                {vendedora.nombre}
                                                                                {vendedora.tieneVentasEnElDia && (
                                                                                    <span className="ml-1 text-blue-300">•</span>
                                                                                )}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer con botón calcular */}
                    <div className="sticky bottom-0 bg-[#1A1A20] border-t border-white/10 p-4 flex items-center justify-between">
                        <div className="text-sm text-white/60">
                            {turnosSeleccionadosVisibles} turnos pendientes de calcular
                        </div>

                        <button
                            onClick={calcularBatch}
                            disabled={calculando || turnosSeleccionadosVisibles === 0}
                            className="px-6 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 text-green-300 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            {calculando ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Calculator className="w-4 h-4" />
                            )}
                            Calcular Selección
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
