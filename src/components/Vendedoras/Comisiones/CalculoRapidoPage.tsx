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
    Square,
    AlertTriangle,
    X,
    Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { comisionesBatchService, batchHelpers } from '@/services/vendedoras/comisionesBatchService';
import { comisionPreview, comisionFechas } from '@/utils/vendedoras/comisionHelpers';
import { ShadcnDatePicker } from '@/components/ui/ShadcnDatePicker';
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
    const [fechaInicio, setFechaInicio] = useState(batchHelpers.obtenerPrimerDiaMesActual());
    const [fechaFin, setFechaFin] = useState(batchHelpers.obtenerAyer());
    const [loading, setLoading] = useState(false);
    const [calculando, setCalculando] = useState(false);
    const [datos, setDatos] = useState<TurnosPendientesBatch | null>(null);
    const [turnosExpandidos, setTurnosExpandidos] = useState<Set<string>>(new Set());
    const [turnosSeleccionados, setTurnosSeleccionados] = useState<Map<string, TurnoPendiente>>(new Map());
    const [porcentajeGlobal, setPorcentajeGlobal] = useState<number>(1);
    const [modoGlobal, setModoGlobal] = useState<import('@/types/vendedoras/comisionTypes').ModoCalculoComision>('Compartido');

    // Estado para UX
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [turnosConfirmar, setTurnosConfirmar] = useState<TurnoParaCalcular[]>([]);
    const [totalEstimadoConfirmacion, setTotalEstimadoConfirmacion] = useState(0);
    const [resultadosBatch, setResultadosBatch] = useState<any>(null);

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
            (resultado.porSucursal || []).forEach(sucursal => {
                (sucursal.turnos || []).forEach(turno => {
                    const key = generarKeyTurno(turno);
                    // Pre-seleccionar solo vendedoras con ventas
                    const vendedorasConVentas = (turno.vendedoras || []).filter(v => v.tieneVentasEnElDia);
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

        // mostramos validación
        setTurnosConfirmar(turnosParaCalcular);
        setTotalEstimadoConfirmacion(estimacionSeleccionada);
        setMostrarConfirmacion(true);
    };

    const ejecutarCalculoBatch = async () => {
        try {
            setMostrarConfirmacion(false);
            setCalculando(true);
            setResultadosBatch(null);
            const resultado = await comisionesBatchService.calcularBatch({ turnos: turnosConfirmar });

            setResultadosBatch(resultado);

            if (resultado.turnosConError === 0) {
                toast.success('Cálculo finalizado exitosamente');
            } else {
                toast.warning('El cálculo finalizó con algunas advertencias');
            }

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
        porSucursal: (datos.porSucursal || [])
            .filter(s => !filtroSucursal || s.sucursalNombre === filtroSucursal)
            .map(s => ({
                ...s,
                turnos: (s.turnos || []).filter(t => !filtroTurno || t.turno === filtroTurno)
            }))
            .filter(s => (s.turnos || []).length > 0)
    } : null;

    const turnosFiltradosCount = datosFiltrados?.porSucursal.reduce((acc, s) => acc + s.turnos.length, 0) || 0;

    // Calcular estadística sobre turnos seleccionados Y visibles
    let turnosSeleccionadosVisibles = 0;
    let estimacionSeleccionada = 0;
    let turnosOcultosPeroSeleccionados = 0;

    (datos?.porSucursal || []).forEach(s => {
        (s.turnos || []).forEach(t => {
            const key = generarKeyTurno(t);
            const st = turnosSeleccionados.get(key);

            if (st?.seleccionado) {
                const esVisible = (!filtroSucursal || t.sucursalNombre === filtroSucursal) &&
                    (!filtroTurno || t.turno === filtroTurno);

                if (esVisible) {
                    turnosSeleccionadosVisibles++;

                    // Solo sumar vendedoras seleccionadas reales
                    const c = comisionPreview.previewComisionTotal(
                        t.montoFacturado,
                        st.porcentajeComision || porcentajeGlobal
                    );
                    estimacionSeleccionada += c;
                } else {
                    turnosOcultosPeroSeleccionados++;
                }
            }
        });
    });

    const totalTurnos = turnosSeleccionados.size;

    return (
        <div className="space-y-6">
            {/* Header con selector de fechas */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-white/60 mb-1">Fecha inicio</label>
                            <ShadcnDatePicker
                                value={fechaInicio ? new Date(fechaInicio + 'T12:00:00') : null}
                                onChange={(date) => setFechaInicio(date ? comisionFechas.formatearParaApi(date) : '')}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white"
                                disabled={loading || calculando}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-white/60 mb-1">Fecha fin</label>
                            <ShadcnDatePicker
                                value={fechaFin ? new Date(fechaFin + 'T12:00:00') : null}
                                onChange={(date) => setFechaFin(date ? comisionFechas.formatearParaApi(date) : '')}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white"
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

            {/* Panel de Resultados Batch */}
            {resultadosBatch && (
                <div className={cn(
                    "border rounded-xl p-4 animate-in fade-in slide-in-from-top-4",
                    resultadosBatch.turnosConError === 0
                        ? "bg-green-500/10 border-green-500/20"
                        : "bg-yellow-500/10 border-yellow-500/20"
                )}>
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                {resultadosBatch.turnosConError === 0 ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                                ) : (
                                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                                )}
                                <h3 className={cn("font-medium", resultadosBatch.turnosConError === 0 ? "text-green-300" : "text-yellow-300")}>
                                    {resultadosBatch.mensaje}
                                </h3>
                            </div>

                            {(resultadosBatch.errores?.length > 0) && (
                                <div className="mt-3 space-y-1">
                                    <div className="text-sm font-medium text-white/80 mb-2">Errores específicos ({resultadosBatch.turnosConError}):</div>
                                    <ul className="text-sm text-yellow-200/80 list-disc list-inside space-y-1">
                                        {resultadosBatch.errores.map((err: string, idx: number) => (
                                            <li key={idx}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setResultadosBatch(null)}
                            className="text-white/40 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

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
                            {(datos.porSucursal || []).map(sucursal => (
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
                                    {(sucursal.turnos || []).map(turno => {
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
                                                            <span className="text-white/80">{batchHelpers.formatearFechaDisplay(turno.fecha)}</span>
                                                        </div>
                                                        <div className="text-white/60">{turno.turno}</div>
                                                        <div className="text-white/80">{batchHelpers.formatearMoneda(turno.montoFacturado)}</div>
                                                        <div className="flex items-center gap-1 text-white/60">
                                                            <Users className="w-4 h-4" />
                                                            <span>{vendedorasSeleccionadas.length} / {(turno.vendedoras || []).filter(v => v.tieneVentasEnElDia).length}</span>
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
                                                                    {(turno.vendedoras || []).map(vendedora => {
                                                                        const seleccionada = vendedorasSeleccionadas.some(v => v.id === vendedora.id);
                                                                        const modoActual = turnoSeleccionado?.modoCalculo || modoGlobal;
                                                                        const advertenciaSinVentas = modoActual === 'Individual' && seleccionada && !vendedora.tieneVentasEnElDia;
                                                                        const advertenciaQuitadaConVentas = modoActual === 'Individual' && !seleccionada && vendedora.tieneVentasEnElDia;

                                                                        return (
                                                                            <div key={vendedora.id} className="relative group flex items-center">
                                                                                <button
                                                                                    onClick={() => toggleVendedora(key, vendedora)}
                                                                                    disabled={calculando}
                                                                                    className={cn(
                                                                                        "px-2 py-1 text-xs rounded border transition-colors flex items-center gap-1",
                                                                                        seleccionada
                                                                                            ? (advertenciaSinVentas ? "bg-red-500/10 border-red-500/40 text-red-300" : "bg-green-500/20 border-green-500/40 text-green-300")
                                                                                            : "bg-white/5 border-white/20 text-white/60 hover:bg-white/10",
                                                                                        vendedora.tieneVentasEnElDia && !seleccionada && !advertenciaQuitadaConVentas && "border-blue-500/40",
                                                                                        advertenciaQuitadaConVentas && "border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/10"
                                                                                    )}
                                                                                >
                                                                                    {advertenciaQuitadaConVentas && <AlertTriangle className="w-3 h-3" />}
                                                                                    {vendedora.nombre}
                                                                                    {vendedora.tieneVentasEnElDia && !advertenciaQuitadaConVentas && (
                                                                                        <span className="text-blue-300">•</span>
                                                                                    )}
                                                                                </button>

                                                                                {/* Tooltip de error/advertencia */}
                                                                                {(advertenciaSinVentas || advertenciaQuitadaConVentas) && (
                                                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-[#1A1A20] border border-white/10 text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 flex items-center shadow-lg">
                                                                                        {advertenciaQuitadaConVentas ? (
                                                                                            <span className="text-yellow-300">⚠️ Tiene ventas, no recibirá comisión</span>
                                                                                        ) : (
                                                                                            <span className="text-red-300">Sin ventas — se calculará $0</span>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </div>
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
                    <div className="sticky bottom-0 bg-[#1A1A20] border-t border-white/10 p-4 flex flex-col md:flex-row items-center justify-between gap-4 z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                        <div className="flex flex-col">
                            <div className="text-sm text-white/80 font-medium">
                                {turnosSeleccionadosVisibles} turnos seleccionados
                            </div>

                            <div className="text-lg font-bold text-green-400">
                                ~{batchHelpers.formatearMoneda(estimacionSeleccionada)} <span className="text-xs font-normal text-white/40 ml-1">(estimación)</span>
                            </div>

                            {turnosOcultosPeroSeleccionados > 0 && (
                                <div className="flex items-center gap-1.5 text-xs text-yellow-400/80 mt-1">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    No se calcularán {turnosOcultosPeroSeleccionados} turnos ocultos por los filtros activos.
                                </div>
                            )}
                        </div>

                        <button
                            onClick={calcularBatch}
                            disabled={calculando || turnosSeleccionadosVisibles === 0}
                            className="px-6 py-3 bg-green-500 text-white font-medium rounded-lg flex items-center gap-2 hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/20"
                        >
                            {calculando ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Calculator className="w-5 h-5" />
                            )}
                            Calcular ({turnosSeleccionadosVisibles})
                        </button>
                    </div>

                    {mostrarConfirmacion && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                            <div className="bg-[#1A1A20] border border-white/10 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
                                <div className="p-6 border-b border-white/10">
                                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                        <Calculator className="w-6 h-6 text-green-400" />
                                        Confirmar Cálculo Rápido
                                    </h2>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                                        <p className="text-white/60 mb-1">Total estimado a generar</p>
                                        <p className="text-4xl font-bold text-green-400">
                                            {batchHelpers.formatearMoneda(totalEstimadoConfirmacion)}
                                        </p>
                                    </div>
                                    <div className="space-y-2 text-white/80 bg-white/5 rounded-lg p-4">
                                        <div className="flex justify-between items-center pb-2 border-b border-white/10">
                                            <span className="text-white/60">Turnos a calcular:</span>
                                            <span className="font-semibold">{turnosConfirmar.length}</span>
                                        </div>
                                        {/* Agrupación rápida por sucursal */}
                                        {Array.from(new Set(turnosConfirmar.map(t => t.sucursalNombre))).map(sucursal => {
                                            const turnos = turnosConfirmar.filter(t => t.sucursalNombre === sucursal).length;
                                            return (
                                                <div key={sucursal} className="flex justify-between items-center text-sm">
                                                    <span className="text-white/60 truncate mr-4">{sucursal}</span>
                                                    <span>{turnos}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <p className="text-sm text-yellow-300 flex items-start gap-2 bg-yellow-400/10 p-3 rounded">
                                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        Esta acción generará registros definitivos de liquidación para los turnos y vendedoras seleccionados.
                                    </p>
                                </div>
                                <div className="p-4 border-t border-white/10 flex items-center justify-end gap-3 bg-black/20">
                                    <button
                                        onClick={() => setMostrarConfirmacion(false)}
                                        disabled={calculando}
                                        className="px-4 py-2 text-white/60 hover:text-white transition-colors disabled:opacity-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={ejecutarCalculoBatch}
                                        disabled={calculando}
                                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 font-medium disabled:opacity-50"
                                    >
                                        {calculando ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                        Sí, Confirmar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
