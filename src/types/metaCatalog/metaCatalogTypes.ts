export interface MetaCampaignFilters {
    brand?: string[];
    nameContains?: string[];
    nameNotContains?: string[];
}

export interface CreateMetaCampaignDto {
    name: string;
    templateUrl: string;
    filters: MetaCampaignFilters;
    frequencyHours: number;
}

export interface UpdateMetaCampaignDto {
    name: string;
    templateUrl: string;
    filters: MetaCampaignFilters;
    isActive: boolean;
    frequencyHours: number;
}

export interface MetaCampaignDto {
    id: number;
    name: string;
    templateUrl: string;
    filters: MetaCampaignFilters;
    isActive: boolean;
    frequencyHours: number;
    createdAt: string;
    updatedAt: string;
}

export const FILTER_FIELD_LABELS: Record<keyof MetaCampaignFilters, string> = {
    brand: 'Marca',
    nameContains: 'Nombre contiene',
    nameNotContains: 'Nombre NO contiene',
};

export interface MetaCampaignExecutionDto {
    id: number;
    campaignId: number;
    status: 'Pending' | 'Running' | 'Completed' | 'Failed';
    totalProducts: number;
    processedProducts: number;
    addedProducts: number;
    deletedProducts: number;
    skippedProducts: number;
    errorMessage: string | null;
    startedAt: string;
    completedAt: string | null;
}

export const EXECUTION_STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    Pending: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30' },
    Running: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
    Completed: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    Failed: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
};
