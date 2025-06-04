import api from "@/api/api";

// Reportes Manuales
export const getManualReports = () => api.get("/api/v1/mercadolibre");
export const getManualReportById = (id: number) => api.get(`/api/v1/mercadolibre/${id}`);
export const createManualReport = (data: any) => api.post("/api/v1/mercadolibre", data);
export const updateManualReport = (id: number, data: any) => api.put(`/api/v1/mercadolibre/${id}`, data);
export const deleteManualReport = (id: number) => api.delete(`/api/v1/mercadolibre/${id}`);

// Ventas diarias simuladas
export const getDailyStats = (year: number, month: number) => api.get(`/api/v1/mercadolibre/daily`, { params: { year, month } });

// Publicidad
export const getAllAds = () => api.get("/api/v1/mercadolibre/ads");
export const createProductAd = (data: any) => api.post("/api/v1/mercadolibre/ads/product", data);
export const createBrandAd = (data: any) => api.post("/api/v1/mercadolibre/ads/brand", data);
export const createDisplayAd = (data: any) => api.post("/api/v1/mercadolibre/ads/display", data);

// Excel
export const processExcel = (file: File, top: number = 10) => {
  const formData = new FormData();
  formData.append("archivo", file);
  return api.post("/api/v1/mercadolibre/excel/top-productos?top=" + top, formData, { headers: { "Content-Type": "multipart/form-data" } });
};
export const saveExcelAnalysis = (file: File, year: number, month: number) => {
  const formData = new FormData();
  formData.append("archivo", file);
  formData.append("year", String(year));
  formData.append("month", String(month));
  return api.post("/api/v1/mercadolibre/excel/persistir", formData, { headers: { "Content-Type": "multipart/form-data" } });
};
export const getExcelAnalysisByMonth = (year: number, month: number) =>
  api.get("/api/v1/mercadolibre/excel/analisis", { params: { year, month } });
export const getExcelAnalysisHistory = () =>
  api.get("/api/v1/mercadolibre/excel/historico");
