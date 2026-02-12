import api from '@/api/api';
import type {
    MetaCampaignDto,
    CreateMetaCampaignDto,
    UpdateMetaCampaignDto,
    MetaCampaignExecutionDto,
} from '@/types/metaCatalog/metaCatalogTypes';

class MetaCatalogService {
    private readonly baseUrl = '/api/v1/metacampaign';

    async obtenerTodas(): Promise<MetaCampaignDto[]> {
        try {
            const response = await api.get<MetaCampaignDto[]>(this.baseUrl);
            return response.data;
        } catch (error) {
            console.error('❌ [MetaCatalogService] Error al obtener campañas:', error);
            throw new Error('Error al cargar las campañas');
        }
    }

    async obtenerPorId(id: number): Promise<MetaCampaignDto> {
        try {
            const response = await api.get<MetaCampaignDto>(`${this.baseUrl}/${id}`);
            return response.data;
        } catch (error) {
            console.error('❌ [MetaCatalogService] Error al obtener campaña:', error);
            throw new Error('Error al cargar la campaña');
        }
    }

    async crear(dto: CreateMetaCampaignDto): Promise<number> {
        try {
            const response = await api.post<number>(this.baseUrl, dto);
            return response.data;
        } catch (error) {
            console.error('❌ [MetaCatalogService] Error al crear campaña:', error);
            throw new Error('Error al crear la campaña');
        }
    }

    async actualizar(id: number, dto: UpdateMetaCampaignDto): Promise<void> {
        try {
            await api.put(`${this.baseUrl}/${id}`, dto);
        } catch (error) {
            console.error('❌ [MetaCatalogService] Error al actualizar campaña:', error);
            throw new Error('Error al actualizar la campaña');
        }
    }

    async eliminar(id: number): Promise<void> {
        try {
            await api.delete(`${this.baseUrl}/${id}`);
        } catch (error) {
            console.error('❌ [MetaCatalogService] Error al eliminar campaña:', error);
            throw new Error('Error al eliminar la campaña');
        }
    }

    async uploadTemplate(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await api.post<{ url: string }>(`${this.baseUrl}/upload-template`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data.url;
        } catch (error) {
            console.error('❌ [MetaCatalogService] Error al subir plantilla:', error);
            throw new Error('Error al subir la plantilla');
        }
    }

    async ejecutar(campaignId: number): Promise<number> {
        try {
            const response = await api.post<number>(`${this.baseUrl}/${campaignId}/ejecutar`);
            return response.data;
        } catch (error) {
            console.error('❌ [MetaCatalogService] Error al ejecutar campaña:', error);
            throw new Error('Error al ejecutar la campaña');
        }
    }

    async obtenerEjecuciones(campaignId: number): Promise<MetaCampaignExecutionDto[]> {
        try {
            const response = await api.get<MetaCampaignExecutionDto[]>(`${this.baseUrl}/${campaignId}/ejecuciones`);
            return response.data;
        } catch (error) {
            console.error('❌ [MetaCatalogService] Error al obtener ejecuciones:', error);
            throw new Error('Error al cargar las ejecuciones');
        }
    }

    async obtenerEjecucion(executionId: number): Promise<MetaCampaignExecutionDto> {
        try {
            const response = await api.get<MetaCampaignExecutionDto>(`${this.baseUrl}/ejecuciones/${executionId}`);
            return response.data;
        } catch (error) {
            console.error('❌ [MetaCatalogService] Error al obtener ejecución:', error);
            throw new Error('Error al cargar la ejecución');
        }
    }
}

const metaCatalogService = new MetaCatalogService();
export default metaCatalogService;
