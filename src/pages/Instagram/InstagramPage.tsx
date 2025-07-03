import React from 'react';
import MetricsCards from '@/components/Instagram/MetricsCards';
import FollowersChart from '@/components/Instagram/FollowersChart';
import ContentComparison from '@/components/Instagram/ContentComparison';
import TopPerformers from '@/components/Instagram/TopPerformers';
import BestTimes from '@/components/Instagram/BestTimes';
import TrendIndicator, { FollowersTrend, EngagementTrend, TrendGroup } from '@/components/Instagram/TrendIndicator';
import LoadingState from '@/components/Instagram/LoadingState';

// Mock data para testing
const mockMetricas = {
  seguidoresActuales: 15420,
  crecimientoSemanal: 245,
  porcentajeCrecimientoSemanal: 1.6,
  totalPublicacionesPeriodo: 28,
  engagementPromedio: 3.2,
  totalInteracciones: 8950,
  alcancePromedio: 4200
};

const mockEvolucionSeguidores = [
  { fecha: '2024-01-01', seguidores: 15000, crecimientoDiario: 25 },
  { fecha: '2024-01-02', seguidores: 15025, crecimientoDiario: 18 },
  { fecha: '2024-01-03', seguidores: 15043, crecimientoDiario: 32 },
  { fecha: '2024-01-04', seguidores: 15075, crecimientoDiario: 15 },
  { fecha: '2024-01-05', seguidores: 15090, crecimientoDiario: 28 },
  { fecha: '2024-01-06', seguidores: 15118, crecimientoDiario: 22 },
  { fecha: '2024-01-07', seguidores: 15140, crecimientoDiario: 35 },
  { fecha: '2024-01-08', seguidores: 15175, crecimientoDiario: 12 },
  { fecha: '2024-01-09', seguidores: 15187, crecimientoDiario: 29 },
  { fecha: '2024-01-10', seguidores: 15216, crecimientoDiario: 41 },
  { fecha: '2024-01-11', seguidores: 15257, crecimientoDiario: 38 },
  { fecha: '2024-01-12', seguidores: 15295, crecimientoDiario: 27 },
  { fecha: '2024-01-13', seguidores: 15322, crecimientoDiario: 33 },
  { fecha: '2024-01-14', seguidores: 15355, crecimientoDiario: 45 },
  { fecha: '2024-01-15', seguidores: 15420, crecimientoDiario: 52 }
];

const mockComparativaContenido = {
  reels: {
    totalPublicaciones: 12,
    engagementPromedio: 4.1,
    alcancePromedio: 5200,
    interaccionesPromedio: 320,
    mejorPerformance: 15600,
    tipoMetricaMejor: 'views'
  },
  posts: {
    totalPublicaciones: 14,
    engagementPromedio: 2.8,
    alcancePromedio: 3800,
    interaccionesPromedio: 185,
    mejorPerformance: 890,
    tipoMetricaMejor: 'likes'
  },
  stories: {
    totalPublicaciones: 32,
    engagementPromedio: 1.9,
    alcancePromedio: 2100,
    interaccionesPromedio: 45,
    mejorPerformance: 8200,
    tipoMetricaMejor: 'impressions'
  }
};

const mockTopPerformers = [
  {
    id: '1',
    tipoContenido: 'reel' as const,
    fechaPublicacion: '2024-01-10',
    imageUrl: 'https://picsum.photos/400/400?random=1',
    url: 'https://instagram.com/p/example1',
    contenido: 'Nueva colección primavera-verano 2024! 🌸 Looks frescos y cómodos para la temporada que viene',
    metricaPrincipal: 15600,
    nombreMetrica: 'views',
    engagementRate: 4.8,
    metricasAdicionales: {
      likes: 890,
      comentarios: 124,
      compartidos: 67,
      alcance: 5200
    }
  },
  {
    id: '2',
    tipoContenido: 'post' as const,
    fechaPublicacion: '2024-01-08',
    imageUrl: 'https://picsum.photos/400/400?random=2',
    url: 'https://instagram.com/p/example2',
    contenido: 'Behind the scenes del shooting de hoy ✨ Compartiendo el proceso creativo con ustedes',
    metricaPrincipal: 672,
    nombreMetrica: 'likes',
    engagementRate: 3.2,
    metricasAdicionales: {
      likes: 672,
      comentarios: 89,
      compartidos: 23,
      alcance: 3800
    }
  },
  {
    id: '3',
    tipoContenido: 'story' as const,
    fechaPublicacion: '2024-01-12',
    imageUrl: 'https://picsum.photos/400/400?random=3',
    url: 'https://instagram.com/stories/example3',
    contenido: 'Descuentos especiales por tiempo limitado! No se lo pierdan 🔥',
    metricaPrincipal: 8200,
    nombreMetrica: 'impressions',
    engagementRate: 2.1,
    metricasAdicionales: {
      respuestas: 45,
      taps_adelante: 234,
      salidas: 89
    }
  }
];

const mockHorarios = [
  { hora: 9, engagementPromedio: 4.2, totalPublicaciones: 5, rangoHorario: '09:00-10:00' },
  { hora: 14, engagementPromedio: 3.8, totalPublicaciones: 8, rangoHorario: '14:00-15:00' },
  { hora: 18, engagementPromedio: 4.5, totalPublicaciones: 6, rangoHorario: '18:00-19:00' },
  { hora: 20, engagementPromedio: 3.9, totalPublicaciones: 7, rangoHorario: '20:00-21:00' },
  { hora: 12, engagementPromedio: 3.1, totalPublicaciones: 4, rangoHorario: '12:00-13:00' },
  { hora: 16, engagementPromedio: 2.8, totalPublicaciones: 3, rangoHorario: '16:00-17:00' },
  { hora: 21, engagementPromedio: 3.4, totalPublicaciones: 5, rangoHorario: '21:00-22:00' }
];

const InstagramPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#1A1A20] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🧪 Instagram Components Test Page
          </h1>
          <p className="text-white/60">
            Página de prueba para todos los componentes de la FASE 1
          </p>
        </div>

        {/* Dashboard Principal - Versión simplificada para testing */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-white border-b border-white/20 pb-2">
            📊 Dashboard Principal (Simulado)
          </h2>
          
          {/* Métricas Cards */}
          <div>
            <h3 className="text-lg text-white/80 mb-4">Métricas Principales</h3>
            <MetricsCards metricas={mockMetricas} />
          </div>

          {/* Gráficos principales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FollowersChart 
              data={mockEvolucionSeguidores}
              variant="area"
              showGrowth={true}
            />
            <ContentComparison 
              data={mockComparativaContenido}
              variant="mixed"
              showEngagement={true}
            />
          </div>

          {/* Sección inferior */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopPerformers 
              data={mockTopPerformers}
              variant="grid"
              maxItems={3}
              showFilters={true}
            />
            <BestTimes 
              horarios={mockHorarios}
              variant="detailed"
              showRecommendations={true}
            />
          </div>
        </section>

        {/* Componentes individuales para testing */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-white border-b border-white/20 pb-2">
            🧩 Componentes Individuales
          </h2>

          {/* Trend Indicators */}
          <div className="space-y-4">
            <h3 className="text-lg text-white/80">Trend Indicators</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-sm text-white/70 mb-2">Simple</p>
                <TrendIndicator value={15420} previousValue={15175} />
              </div>
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-sm text-white/70 mb-2">Detailed</p>
                <TrendIndicator 
                  value={3.2} 
                  previousValue={2.8} 
                  variant="detailed"
                  label="Engagement"
                />
              </div>
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-sm text-white/70 mb-2">Compact</p>
                <TrendIndicator 
                  value={245} 
                  variant="compact"
                  showPercentage={false}
                />
              </div>
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-sm text-white/70 mb-2">Badge</p>
                <TrendIndicator 
                  value={1.6} 
                  previousValue={1.2}
                  variant="badge"
                />
              </div>
            </div>

            {/* Specialized trends */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-sm text-white/70 mb-2">Followers Trend</p>
                <FollowersTrend current={15420} previous={15175} />
              </div>
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-sm text-white/70 mb-2">Engagement Trend</p>
                <EngagementTrend current={3.2} previous={2.8} />
              </div>
            </div>

            {/* Trend Group */}
            <div className="p-4 bg-white/5 rounded-xl">
              <p className="text-sm text-white/70 mb-2">Trend Group</p>
              <TrendGroup
                trends={[
                  { label: 'Seguidores', current: 15420, previous: 15175 },
                  { label: 'Engagement', current: 3.2, previous: 2.8, format: 'percentage' },
                  { label: 'Posts', current: 28, previous: 24 }
                ]}
              />
            </div>
          </div>

          {/* Loading States */}
          <div className="space-y-4">
            <h3 className="text-lg text-white/80">Loading States</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-sm text-white/70 mb-2">Small Loading</p>
                <LoadingState size="small" variant="inline" />
              </div>
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-sm text-white/70 mb-2">Medium Loading</p>
                <LoadingState size="medium" />
              </div>
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-sm text-white/70 mb-2">Large Loading</p>
                <LoadingState size="large" />
              </div>
            </div>
          </div>

          {/* Variantes de componentes */}
          <div className="space-y-4">
            <h3 className="text-lg text-white/80">Variantes de Componentes</h3>
            
            {/* Content Comparison variants */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ContentComparison 
                data={mockComparativaContenido}
                variant="bar"
                className="h-fit"
              />
              <ContentComparison 
                data={mockComparativaContenido}
                variant="pie"
                className="h-fit"
              />
            </div>

            {/* Best Times variants */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <BestTimes 
                horarios={mockHorarios}
                variant="compact"
                showRecommendations={false}
              />
              <BestTimes 
                horarios={mockHorarios}
                variant="detailed"
                maxItems={3}
              />
            </div>

            {/* Top Performers variants */}
            <div className="space-y-4">
              <TopPerformers 
                data={mockTopPerformers}
                variant="list"
                showFilters={false}
              />
            </div>
          </div>
        </section>

        {/* Footer de testing */}
        <div className="text-center pt-8 border-t border-white/20">
          <p className="text-white/60 text-sm">
            🎯 Todos los componentes de la FASE 1 funcionando correctamente
          </p>
          <p className="text-white/40 text-xs mt-1">
            Datos de prueba - En producción se conectará al backend real
          </p>
        </div>
      </div>
    </div>
  );
};

export default InstagramPage;