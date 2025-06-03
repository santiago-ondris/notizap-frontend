import {
    getSimpleStats,
    getTopProducts,
    getMonthlyStats,
    getMonthlyReport,
    getAllMonthlyReports,
    saveMonthlyReport,
    editMonthlyReport,
    deleteMonthlyReport,
  } from "@/api/WooCommerce/woocommerceApi";
  
  import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
  import type {
    SalesStats,
    ProductStats,
    WooMonthlyReport,
    EditWooMonthlyReportDto,
  } from "@/api/types/woocommerceTypes";
  
  type Store = "Montella" | "Alenka";
  
  // 1. Resumen simple de ventas
  export function useSimpleStatsQuery(params: { from: string; to: string; store: Store }) {
    return useQuery<SalesStats>({
      queryKey: ["woo", "simple-stats", params],
      queryFn: () => getSimpleStats(params),
      enabled: !!params.from && !!params.to && !!params.store,
    });
  }
  
  // 2. Top productos vendidos
  export function useTopProductsQuery(params: { from: string; to: string; store: Store }) {
    return useQuery<ProductStats[]>({
      queryKey: ["woo", "top-products", params],
      queryFn: () => getTopProducts(params),
      enabled: !!params.from && !!params.to && !!params.store,
    });
  }
  
  // 3. Estadisticas simples de un mes (para gráfico/resumen)
  export function useMonthlyStatsQuery(params: { year: number; month: number; store: Store }) {
    return useQuery<SalesStats>({
      queryKey: ["woo", "monthly-stats", params],
      queryFn: () => getMonthlyStats(params),
      enabled: !!params.year && !!params.month && !!params.store,
    });
  }
  
  // 4. Detalle de reporte mensual proveniente de la DB
  export function useMonthlyReportQuery(params: { year: number; month: number; store: Store }) {
    return useQuery<WooMonthlyReport | null>({
      queryKey: ["woo", "monthly-report", params],
      queryFn: () => getMonthlyReport(params),
      enabled: !!params.year && !!params.month && !!params.store,
    });
  }
  
  // 5. Todos los reportes mensuales de una tienda
  export function useAllMonthlyReportsQuery(store: Store) {
    return useQuery<WooMonthlyReport[]>({
      queryKey: ["woo", "all-monthly-reports", store],
      queryFn: () => getAllMonthlyReports(store),
      enabled: !!store,
    });
  }
  
  // ------ MUTATIONS (acciones admin/superadmin) ------
  
  export function useSaveMonthlyReportMutation() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: saveMonthlyReport,
      onSuccess: () => {
        // Actualiza la cache de todos los reportes
        queryClient.invalidateQueries({ queryKey: ["woo", "all-monthly-reports"] });
      },
    });
  }
  
  export function useEditMonthlyReportMutation() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, dto }: { id: number; dto: EditWooMonthlyReportDto }) =>
        editMonthlyReport(id, dto),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["woo", "all-monthly-reports"] });
      },
    });
  }
  
  export function useDeleteMonthlyReportMutation() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: number) => deleteMonthlyReport(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["woo", "all-monthly-reports"] });
      },
    });
  }
  