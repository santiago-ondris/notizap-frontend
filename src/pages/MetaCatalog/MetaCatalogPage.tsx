import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, RefreshCw, AlertCircle, Megaphone, Pencil, Trash2, Image, Play, Loader2, History, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import metaCatalogService from '@/services/metaCatalog/metaCatalogService';
import type { MetaCampaignDto, MetaCampaignExecutionDto } from '@/types/metaCatalog/metaCatalogTypes';
import { FILTER_FIELD_LABELS, EXECUTION_STATUS_COLORS } from '@/types/metaCatalog/metaCatalogTypes';
import MetaCampaignFormDialog from '@/components/MetaCatalog/MetaCampaignFormDialog';

const MetaCatalogPage: React.FC = () => {
    const [campaigns, setCampaigns] = useState<MetaCampaignDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<MetaCampaignDto | null>(null);

    // Execution tracking
    const [executingIds, setExecutingIds] = useState<Set<number>>(new Set());
    const [activeExecutions, setActiveExecutions] = useState<Record<number, MetaCampaignExecutionDto>>({});
    const [executionHistory, setExecutionHistory] = useState<Record<number, MetaCampaignExecutionDto[]>>({});
    const [showHistoryFor, setShowHistoryFor] = useState<number | null>(null);
    const pollingRef = useRef<Record<number, NodeJS.Timeout>>({});

    const loadCampaigns = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await metaCatalogService.obtenerTodas();
            setCampaigns(data);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Error al cargar conjuntos';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCampaigns();
        return () => {
            // Cleanup polling intervals
            Object.values(pollingRef.current).forEach(clearInterval);
        };
    }, []);

    const handleCreate = () => {
        setEditingCampaign(null);
        setDialogOpen(true);
    };

    const handleEdit = (campaign: MetaCampaignDto) => {
        setEditingCampaign(campaign);
        setDialogOpen(true);
    };

    const handleDelete = async (campaign: MetaCampaignDto) => {
        if (!window.confirm(`¿Eliminar el conjunto "${campaign.name}"? Esta acción no se puede deshacer.`)) {
            return;
        }
        try {
            await metaCatalogService.eliminar(campaign.id);
            toast.success('Conjunto eliminado');
            loadCampaigns();
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Error al eliminar';
            toast.error(msg);
        }
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setEditingCampaign(null);
    };

    const handleSaved = () => {
        handleDialogClose();
        loadCampaigns();
    };

    const startPolling = useCallback((campaignId: number, executionId: number) => {
        // Clear existing polling for this campaign
        if (pollingRef.current[campaignId]) {
            clearInterval(pollingRef.current[campaignId]);
        }

        pollingRef.current[campaignId] = setInterval(async () => {
            try {
                const execution = await metaCatalogService.obtenerEjecucion(executionId);
                setActiveExecutions(prev => ({ ...prev, [campaignId]: execution }));

                if (execution.status === 'Completed' || execution.status === 'Failed') {
                    clearInterval(pollingRef.current[campaignId]);
                    delete pollingRef.current[campaignId];
                    setExecutingIds(prev => {
                        const next = new Set(prev);
                        next.delete(campaignId);
                        return next;
                    });

                    if (execution.status === 'Completed') {
                        toast.success(`Conjunto procesado: ${execution.processedProducts} productos`);
                    } else {
                        toast.error(`Error en ejecución: ${execution.errorMessage}`);
                    }
                }
            } catch {
                // Silent fail on polling
            }
        }, 3000);
    }, []);

    const handleExecute = async (campaign: MetaCampaignDto) => {
        if (executingIds.has(campaign.id)) return;

        try {
            setExecutingIds(prev => new Set(prev).add(campaign.id));
            const executionId = await metaCatalogService.ejecutar(campaign.id);
            toast.info(`Ejecución iniciada para "${campaign.name}"`);

            // Start polling for this execution
            const execution: MetaCampaignExecutionDto = {
                id: executionId,
                campaignId: campaign.id,
                status: 'Pending',
                totalProducts: 0,
                processedProducts: 0,
                errorMessage: null,
                startedAt: new Date().toISOString(),
                completedAt: null,
            };
            setActiveExecutions(prev => ({ ...prev, [campaign.id]: execution }));
            startPolling(campaign.id, executionId);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Error al ejecutar';
            toast.error(msg);
            setExecutingIds(prev => {
                const next = new Set(prev);
                next.delete(campaign.id);
                return next;
            });
        }
    };

    const loadHistory = async (campaignId: number) => {
        if (showHistoryFor === campaignId) {
            setShowHistoryFor(null);
            return;
        }
        try {
            const executions = await metaCatalogService.obtenerEjecuciones(campaignId);
            setExecutionHistory(prev => ({ ...prev, [campaignId]: executions }));
            setShowHistoryFor(campaignId);
        } catch {
            toast.error('Error al cargar historial');
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const formatDateTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getProgressPercent = (exec: MetaCampaignExecutionDto) => {
        if (exec.totalProducts === 0) return 0;
        return Math.round((exec.processedProducts / exec.totalProducts) * 100);
    };

    return (
        <div className="min-h-screen bg-[#1A1A20] p-6">
            <div className="max-w-none xl:max-w-screen-2xl mx-auto space-y-6 px-4">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#6366F1]/20 border border-[#6366F1]/30 rounded-lg">
                            <Megaphone className="w-6 h-6 text-[#6366F1]" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">
                                📢 Meta Catalog
                            </h1>
                            <p className="text-white/60 text-sm">
                                Configurá conjuntos para procesar productos del catálogo de Meta con plantillas de diseño
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={loadCampaigns}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-white/80 transition-all disabled:opacity-50"
                            title="Actualizar"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">Actualizar</span>
                        </button>

                        <Link
                            to="/meta-catalog/help"
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-white/80 transition-all"
                            title="Ayuda"
                        >
                            <HelpCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">Ayuda</span>
                        </Link>

                        <button
                            onClick={handleCreate}
                            className="flex items-center gap-2 px-6 py-2 bg-[#6366F1]/20 hover:bg-[#6366F1]/30 border border-[#6366F1]/30 rounded-lg text-white transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Nuevo Conjunto</span>
                        </button>
                    </div>
                </div>

                {/* Error state */}
                {error && (
                    <div className="flex flex-col items-center justify-center py-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
                        <AlertCircle className="w-8 h-8 text-[#D94854] mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">Error al cargar datos</h3>
                        <p className="text-white/60 text-sm mb-4 text-center max-w-md">{error}</p>
                        <button
                            onClick={loadCampaigns}
                            className="px-4 py-2 bg-[#D94854]/20 hover:bg-[#D94854]/30 border border-[#D94854]/30 rounded-lg text-[#D94854] transition-all"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {/* Loading skeleton */}
                {loading && campaigns.length === 0 && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 animate-pulse">
                                <div className="h-5 bg-white/10 rounded w-2/3 mb-4" />
                                <div className="h-4 bg-white/10 rounded w-1/2 mb-2" />
                                <div className="h-4 bg-white/10 rounded w-3/4" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && campaigns.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
                        <Megaphone className="w-12 h-12 text-white/30 mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">No hay conjuntos</h3>
                        <p className="text-white/60 text-sm mb-6 text-center max-w-md">
                            Creá tu primer conjunto para empezar a procesar productos del catálogo de Meta con plantillas de diseño.
                        </p>
                        <button
                            onClick={handleCreate}
                            className="flex items-center gap-2 px-6 py-2 bg-[#6366F1]/20 hover:bg-[#6366F1]/30 border border-[#6366F1]/30 rounded-lg text-white transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Crear Conjunto</span>
                        </button>
                    </div>
                )}

                {/* Campaign cards */}
                {!error && campaigns.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {campaigns.map((campaign) => {
                            const isExecuting = executingIds.has(campaign.id);
                            const activeExec = activeExecutions[campaign.id];
                            const progress = activeExec ? getProgressPercent(activeExec) : 0;

                            return (
                                <div
                                    key={campaign.id}
                                    className={`bg-white/5 backdrop-blur-sm border rounded-xl p-6 transition-all hover:bg-white/[0.07] ${campaign.isActive ? 'border-white/10' : 'border-white/5 opacity-60'
                                        }`}
                                >
                                    {/* Campaign name + status */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-white truncate">
                                                {campaign.name}
                                            </h3>
                                            <span
                                                className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${campaign.isActive
                                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                    : 'bg-white/10 text-white/50 border border-white/10'
                                                    }`}
                                            >
                                                {campaign.isActive ? 'Activa' : 'Inactiva'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Active execution progress */}
                                    {activeExec && (activeExec.status === 'Pending' || activeExec.status === 'Running') && (
                                        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                                                    <span className="text-xs font-medium text-blue-400">
                                                        {activeExec.status === 'Pending' ? 'Iniciando...' : 'Procesando... esto puede demorar unos minutos'}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-blue-400/70">
                                                    {activeExec.processedProducts}/{activeExec.totalProducts}
                                                </span>
                                            </div>
                                            <div className="w-full bg-blue-500/20 rounded-full h-1.5">
                                                <div
                                                    className="bg-blue-400 h-1.5 rounded-full transition-all duration-500"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                            {progress > 0 && (
                                                <p className="text-xs text-blue-400/60 mt-1 text-right">{progress}%</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Completed/Failed execution result */}
                                    {activeExec && activeExec.status === 'Completed' && (
                                        <div className="mb-4 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                            <span className="text-xs text-emerald-400">
                                                Completada — {activeExec.processedProducts} productos procesados
                                            </span>
                                        </div>
                                    )}

                                    {activeExec && activeExec.status === 'Failed' && (
                                        <div className="mb-4 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
                                            <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                            <span className="text-xs text-red-400 truncate">
                                                Error: {activeExec.errorMessage}
                                            </span>
                                        </div>
                                    )}

                                    {/* Template preview */}
                                    {campaign.templateUrl && (
                                        <div className="mb-4 rounded-lg overflow-hidden border border-white/10 bg-white/5">
                                            <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/10">
                                                <Image className="w-3 h-3 text-white/40" />
                                                <span className="text-xs text-white/40">Plantilla</span>
                                            </div>
                                            <div className="p-2 flex justify-center">
                                                <img
                                                    src={campaign.templateUrl}
                                                    alt={`Plantilla ${campaign.name}`}
                                                    className="max-h-32 object-contain rounded"
                                                    loading="lazy"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Filters */}
                                    <div className="space-y-2 mb-4">
                                        {Object.entries(campaign.filters).map(([key, values]) => {
                                            if (!values || values.length === 0) return null;
                                            const label = FILTER_FIELD_LABELS[key as keyof typeof FILTER_FIELD_LABELS] || key;
                                            return (
                                                <div key={key}>
                                                    <span className="text-xs text-white/40 uppercase tracking-wider">{label}</span>
                                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                                        {values.map((val: string) => (
                                                            <span
                                                                key={val}
                                                                className="px-2 py-0.5 bg-[#6366F1]/15 border border-[#6366F1]/25 rounded-full text-xs text-[#A5B4FC]"
                                                            >
                                                                {val}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Footer: date + actions */}
                                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                                        <span className="text-xs text-white/40">
                                            Creada {formatDate(campaign.createdAt)}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleExecute(campaign)}
                                                disabled={isExecuting || !campaign.isActive}
                                                className={`p-1.5 rounded-lg transition-colors ${isExecuting
                                                    ? 'text-blue-400 bg-blue-500/10 cursor-not-allowed'
                                                    : campaign.isActive
                                                        ? 'hover:bg-emerald-500/20 text-white/60 hover:text-emerald-400'
                                                        : 'text-white/20 cursor-not-allowed'
                                                    }`}
                                                title={isExecuting ? 'Ejecutando...' : 'Ejecutar conjunto'}
                                            >
                                                {isExecuting
                                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                                    : <Play className="w-4 h-4" />
                                                }
                                            </button>
                                            <button
                                                onClick={() => loadHistory(campaign.id)}
                                                className={`p-1.5 rounded-lg transition-colors ${showHistoryFor === campaign.id
                                                    ? 'bg-white/10 text-white'
                                                    : 'hover:bg-white/10 text-white/60 hover:text-white'
                                                    }`}
                                                title="Historial de ejecuciones"
                                            >
                                                <History className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(campaign)}
                                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                                                title="Editar"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(campaign)}
                                                className="p-1.5 hover:bg-[#D94854]/20 rounded-lg transition-colors text-white/60 hover:text-[#D94854]"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Execution history dropdown */}
                                    {showHistoryFor === campaign.id && executionHistory[campaign.id] && (
                                        <div className="mt-3 pt-3 border-t border-white/10">
                                            <h4 className="text-xs text-white/50 font-medium uppercase tracking-wider mb-2">
                                                Últimas ejecuciones
                                            </h4>
                                            {executionHistory[campaign.id].length === 0 ? (
                                                <p className="text-xs text-white/30 italic">Sin ejecuciones previas</p>
                                            ) : (
                                                <div className="space-y-1.5">
                                                    {executionHistory[campaign.id].slice(0, 5).map((exec) => {
                                                        const colors = EXECUTION_STATUS_COLORS[exec.status] || EXECUTION_STATUS_COLORS.Pending;
                                                        return (
                                                            <div key={exec.id} className="flex items-center justify-between text-xs">
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`px-1.5 py-0.5 rounded ${colors.bg} ${colors.text} border ${colors.border}`}>
                                                                        {exec.status}
                                                                    </span>
                                                                    <span className="text-white/40">
                                                                        {formatDateTime(exec.startedAt)}
                                                                    </span>
                                                                </div>
                                                                <span className="text-white/50">
                                                                    {exec.processedProducts}/{exec.totalProducts}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Form dialog */}
            <MetaCampaignFormDialog
                isOpen={dialogOpen}
                onClose={handleDialogClose}
                onSaved={handleSaved}
                campaign={editingCampaign}
            />
        </div>
    );
};

export default MetaCatalogPage;
