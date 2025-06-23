import { 
    type MercadoLibreManualReport, 
    type ReadAdDto, 
    type ExcelTopProductoDto, 
    type AnalysisMetrics, 
    type ChartDataPoint, 
    type CampaignROI,
    type TopProduct
  } from "@/types/mercadolibre/ml";
  
  export class MercadoLibreAnalysisService {
    
    /**
     * Calcula métricas generales de análisis
     */
    static calculateMetrics(
      reports: MercadoLibreManualReport[], 
      adsReports: ReadAdDto[]
    ): AnalysisMetrics {
      const totalVentas = reports.reduce((sum, r) => sum + r.revenue, 0);
      const totalUnidades = reports.reduce((sum, r) => sum + r.unitsSold, 0);
      const totalInversion = adsReports.reduce((sum, r) => sum + r.inversion, 0);
      
      const roi = totalInversion > 0 ? ((totalVentas - totalInversion) / totalInversion) * 100 : 0;
      const ticketPromedio = totalUnidades > 0 ? totalVentas / totalUnidades : 0;
      
      // Mejor mes (mayor facturación)
      const mejorReporte = reports.reduce((mejor, actual) => 
        actual.revenue > mejor.revenue ? actual : mejor, reports[0] || { revenue: 0, month: 1, year: 2024 }
      );
      
      // Crecimiento mensual promedio
      const sortedReports = [...reports].sort((a, b) => 
        a.year !== b.year ? a.year - b.year : a.month - b.month
      );
      
      let crecimientoMensual = 0;
      if (sortedReports.length > 1) {
        const crecimientos = [];
        for (let i = 1; i < sortedReports.length; i++) {
          const anterior = sortedReports[i - 1].revenue;
          const actual = sortedReports[i].revenue;
          if (anterior > 0) {
            crecimientos.push(((actual - anterior) / anterior) * 100);
          }
        }
        crecimientoMensual = crecimientos.length > 0 
          ? crecimientos.reduce((sum, c) => sum + c, 0) / crecimientos.length 
          : 0;
      }
  
      return {
        totalVentas,
        totalInversion,
        roi,
        ticketPromedio,
        mejorMes: `${mejorReporte.month}/${mejorReporte.year}`,
        crecimientoMensual
      };
    }
  
    /**
     * Prepara datos para gráfico de evolución temporal
     */
    static prepareChartData(
      reports: MercadoLibreManualReport[], 
      adsReports: ReadAdDto[]
    ): ChartDataPoint[] {
      // Crear un mapa de inversión por período
      const inversionPorPeriodo = new Map<string, number>();
      adsReports.forEach(ad => {
        const key = `${ad.year}-${ad.month.toString().padStart(2, '0')}`;
        inversionPorPeriodo.set(key, (inversionPorPeriodo.get(key) || 0) + ad.inversion);
      });
  
      // Combinar con datos de ventas
      return reports
        .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)
        .map(report => {
          const key = `${report.year}-${report.month.toString().padStart(2, '0')}`;
          const inversion = inversionPorPeriodo.get(key) || 0;
          const roi = inversion > 0 ? ((report.revenue - inversion) / inversion) * 100 : 0;
          
          return {
            periodo: `${report.month.toString().padStart(2, '0')}/${report.year}`,
            ventas: report.revenue,
            inversion,
            roi,
            unidades: report.unitsSold
          };
        });
    }
  
    /**
     * Analiza ROI por tipo de campaña
     */
    static analyzeCampaignROI(adsReports: ReadAdDto[]): CampaignROI[] {
      const roiPorTipo = new Map<string, {
        totalInversion: number;
        totalIngresos: number;
        campanias: number;
      }>();
  
      adsReports.forEach(ad => {
        const current = roiPorTipo.get(ad.tipo) || { 
          totalInversion: 0, 
          totalIngresos: 0, 
          campanias: 0 
        };
        
        current.totalInversion += ad.inversion;
        current.campanias += 1;
        
        // Extraer ingresos según el tipo de detalle
        if (ad.detalles) {
          const detalles = ad.detalles as any;
          if (detalles.ingresos !== undefined) {
            current.totalIngresos += detalles.ingresos;
          }
        }
        
        roiPorTipo.set(ad.tipo, current);
      });
  
      return Array.from(roiPorTipo.entries()).map(([tipo, data]) => ({
        tipo,
        totalInversion: data.totalInversion,
        totalIngresos: data.totalIngresos,
        roi: data.totalInversion > 0 
          ? ((data.totalIngresos - data.totalInversion) / data.totalInversion) * 100 
          : 0,
        campanias: data.campanias
      }));
    }
  
    /**
     * Procesa top productos de análisis Excel
     */
    static processTopProducts(excelData: ExcelTopProductoDto[]): TopProduct[] {
      const productosPorModelo = new Map<string, {
        totalVentas: number;
        meses: Array<{ periodo: string; cantidad: number; }>;
      }>();
  
      excelData.forEach(item => {
        // Extraer modelo (sin color) - asumimos formato "Modelo Color"
        const palabras = item.modeloColor.split(' ');
        const modelo = palabras.slice(0, -1).join(' ') || item.modeloColor;
        
        const current = productosPorModelo.get(modelo) || { 
          totalVentas: 0, 
          meses: [] 
        };
        
        current.totalVentas += item.cantidad;
        
        if (item.year && item.month) {
          const periodo = `${item.month.toString().padStart(2, '0')}/${item.year}`;
          const mesExistente = current.meses.find(m => m.periodo === periodo);
          
          if (mesExistente) {
            mesExistente.cantidad += item.cantidad;
          } else {
            current.meses.push({ periodo, cantidad: item.cantidad });
          }
        }
        
        productosPorModelo.set(modelo, current);
      });
  
      return Array.from(productosPorModelo.entries())
        .map(([modelo, data]) => ({
          modelo,
          totalVentas: data.totalVentas,
          meses: data.meses.sort((a, b) => a.periodo.localeCompare(b.periodo))
        }))
        .sort((a, b) => b.totalVentas - a.totalVentas)
        .slice(0, 10); // Top 10
    }
  
    /**
     * Calcula distribución de inversión publicitaria
     */
    static calculateInvestmentDistribution(adsReports: ReadAdDto[]) {
      const distribucion = new Map<string, number>();
      
      adsReports.forEach(ad => {
        distribucion.set(ad.tipo, (distribucion.get(ad.tipo) || 0) + ad.inversion);
      });
  
      const total = Array.from(distribucion.values()).reduce((sum, val) => sum + val, 0);
      
      return Array.from(distribucion.entries()).map(([tipo, inversion]) => ({
        tipo,
        inversion,
        porcentaje: total > 0 ? (inversion / total) * 100 : 0
      }));
    }
  
    /**
     * Encuentra tendencias y patrones
     */
    static findTrends(reports: MercadoLibreManualReport[]) {
      const sortedReports = [...reports].sort((a, b) => 
        a.year !== b.year ? a.year - b.year : a.month - b.month
      );
  
      const trends = {
        ventasEnCrecimiento: false,
        mesMasFuerte: '',
        estacionalidad: [] as string[]
      };
  
      if (sortedReports.length >= 3) {
        const ultimos3 = sortedReports.slice(-3);
        const crecimiento = ultimos3.every((report, idx) => 
          idx === 0 || report.revenue > ultimos3[idx - 1].revenue
        );
        
        trends.ventasEnCrecimiento = crecimiento;
      }
  
      // Mes más fuerte históricamente
      const ventasPorMes = new Map<number, number>();
      reports.forEach(r => {
        ventasPorMes.set(r.month, (ventasPorMes.get(r.month) || 0) + r.revenue);
      });
      
      const mejorMes = Array.from(ventasPorMes.entries())
        .sort((a, b) => b[1] - a[1])[0];
      
      if (mejorMes) {
        const meses = [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        trends.mesMasFuerte = meses[mejorMes[0] - 1];
      }
  
      return trends;
    }
  }