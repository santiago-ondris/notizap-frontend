import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Upload } from 'lucide-react';
import { toast } from 'react-toastify';
import metaCatalogService from '@/services/metaCatalog/metaCatalogService';
import type {
    MetaCampaignDto,
    MetaCampaignFilters,
    CreateMetaCampaignDto,
    UpdateMetaCampaignDto,
} from '@/types/metaCatalog/metaCatalogTypes';
import { FILTER_FIELD_LABELS } from '@/types/metaCatalog/metaCatalogTypes';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    campaign: MetaCampaignDto | null;
}

type FilterKey = keyof MetaCampaignFilters;

const FILTER_KEYS: FilterKey[] = ['brand', 'category', 'nameContains'];

const MetaCampaignFormDialog: React.FC<Props> = ({ isOpen, onClose, onSaved, campaign }) => {
    const [name, setName] = useState('');
    const [templateUrl, setTemplateUrl] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [filters, setFilters] = useState<MetaCampaignFilters>({});
    const [filterInputs, setFilterInputs] = useState<Record<FilterKey, string>>({
        brand: '',
        category: '',
        nameContains: '',
    });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [templatePreview, setTemplatePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isEditing = campaign !== null;

    useEffect(() => {
        if (isOpen) {
            if (campaign) {
                setName(campaign.name);
                setTemplateUrl(campaign.templateUrl);
                setIsActive(campaign.isActive);
                setFilters({ ...campaign.filters });
                setTemplatePreview(campaign.templateUrl || null);
            } else {
                setName('');
                setTemplateUrl('');
                setIsActive(true);
                setFilters({});
                setTemplatePreview(null);
            }
            setFilterInputs({ brand: '', category: '', nameContains: '' });
        }
    }, [isOpen, campaign]);

    const handleAddFilter = (key: FilterKey) => {
        const value = filterInputs[key].trim();
        if (!value) return;

        const current = filters[key] || [];
        if (current.includes(value)) {
            toast.warning(`"${value}" ya existe en ${FILTER_FIELD_LABELS[key]}`);
            return;
        }

        setFilters((prev) => ({
            ...prev,
            [key]: [...(prev[key] || []), value],
        }));
        setFilterInputs((prev) => ({ ...prev, [key]: '' }));
    };

    const handleRemoveFilter = (key: FilterKey, value: string) => {
        setFilters((prev) => ({
            ...prev,
            [key]: (prev[key] || []).filter((v) => v !== value),
        }));
    };

    const handleKeyDown = (e: React.KeyboardEvent, key: FilterKey) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddFilter(key);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Solo se permiten archivos de imagen');
            return;
        }

        // Show preview immediately
        const reader = new FileReader();
        reader.onload = () => {
            setTemplatePreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to Cloudinary
        setUploading(true);
        try {
            const url = await metaCatalogService.uploadTemplate(file);
            setTemplateUrl(url);
            toast.success('Plantilla subida correctamente');
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Error al subir';
            toast.error(msg);
            setTemplatePreview(null);
            setTemplateUrl('');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast.error('El nombre de la campaña es obligatorio');
            return;
        }

        // Check at least one filter is set
        const hasFilters = Object.values(filters).some((v) => v && v.length > 0);
        if (!hasFilters) {
            toast.error('Debés definir al menos un filtro');
            return;
        }

        setSaving(true);
        try {
            if (isEditing && campaign) {
                const dto: UpdateMetaCampaignDto = {
                    name: name.trim(),
                    templateUrl,
                    filters,
                    isActive,
                };
                await metaCatalogService.actualizar(campaign.id, dto);
                toast.success('Campaña actualizada');
            } else {
                const dto: CreateMetaCampaignDto = {
                    name: name.trim(),
                    templateUrl,
                    filters,
                };
                await metaCatalogService.crear(dto);
                toast.success('Campaña creada');
            }
            onSaved();
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Error al guardar';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Dialog */}
            <div className="relative w-full max-w-lg max-h-[85vh] bg-[#1E1E26] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <h2 className="text-xl font-semibold text-white">
                        {isEditing ? 'Editar Campaña' : 'Nueva Campaña'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div
                    className="flex-1 overflow-y-auto px-6 py-5 space-y-5 custom-scrollbar"
                    onWheel={(e) => { e.stopPropagation(); }}
                >
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-1.5">
                            Nombre de la campaña
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="ej: hot-sale-kids"
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/15 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#6366F1]/50 focus:ring-1 focus:ring-[#6366F1]/30 transition-all"
                        />
                    </div>

                    {/* Template upload */}
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-1.5">
                            Plantilla (PNG 1080×1080)
                        </label>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 rounded-lg text-white/70 hover:text-white transition-all"
                            >
                                <Upload className="w-4 h-4" />
                                {uploading ? 'Subiendo...' : templatePreview ? 'Cambiar' : 'Subir plantilla'}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            {templatePreview && (
                                <div className="relative group">
                                    <img
                                        src={templatePreview}
                                        alt="Preview"
                                        className="h-16 w-16 object-contain rounded-lg border border-white/10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setTemplatePreview(null);
                                            setTemplateUrl('');
                                        }}
                                        className="absolute -top-1.5 -right-1.5 p-0.5 bg-[#D94854] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3 text-white" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Active toggle (only when editing) */}
                    {isEditing && (
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-white/70">Campaña activa</label>
                            <button
                                type="button"
                                onClick={() => setIsActive(!isActive)}
                                className={`relative w-11 h-6 rounded-full transition-colors ${isActive ? 'bg-emerald-500' : 'bg-white/20'
                                    }`}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                />
                            </button>
                        </div>
                    )}

                    {/* Filters */}
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-3">
                            Filtros de productos
                        </label>
                        <p className="text-xs text-white/40 mb-3">
                            Si agregás valores en distintos campos, el producto debe cumplir todos. Dentro de un mismo campo, alcanza con que coincida con al menos uno.
                        </p>

                        <div className="space-y-4">
                            {FILTER_KEYS.map((key) => (
                                <div key={key} className="space-y-1.5">
                                    <label className="text-xs text-white/50 uppercase tracking-wider">
                                        {FILTER_FIELD_LABELS[key]}
                                    </label>

                                    {/* Existing chips */}
                                    {filters[key] && filters[key]!.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {filters[key]!.map((val) => (
                                                <span
                                                    key={val}
                                                    className="flex items-center gap-1 px-2.5 py-1 bg-[#6366F1]/15 border border-[#6366F1]/25 rounded-full text-xs text-[#A5B4FC]"
                                                >
                                                    {val}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveFilter(key, val)}
                                                        className="hover:text-[#D94854] transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Add input */}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={filterInputs[key]}
                                            onChange={(e) =>
                                                setFilterInputs((prev) => ({ ...prev, [key]: e.target.value }))
                                            }
                                            onKeyDown={(e) => handleKeyDown(e, key)}
                                            placeholder={`Agregar ${FILTER_FIELD_LABELS[key].toLowerCase()}...`}
                                            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#6366F1]/40 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleAddFilter(key)}
                                            disabled={!filterInputs[key].trim()}
                                            className="px-3 py-2 bg-[#6366F1]/15 hover:bg-[#6366F1]/25 border border-[#6366F1]/25 rounded-lg text-[#A5B4FC] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
                    <button
                        onClick={onClose}
                        disabled={saving || uploading}
                        className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 rounded-lg text-white/70 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="px-5 py-2.5 bg-[#6366F1] hover:bg-[#5558E3] rounded-lg text-white font-medium transition-all disabled:opacity-50"
                    >
                        {saving ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Campaña'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MetaCampaignFormDialog;
