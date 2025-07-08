import React, { useState, useEffect, useMemo } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { 
  Instagram, 
  RefreshCw, 
  Download,
  BarChart3,
  Users,
  Calendar,
  AlertCircle,
  Play
} from "lucide-react";
import { toast } from "react-toastify";

// Components
import AccountSelector from "@/components/Instagram/AccountSelector";
import DateRangePicker from "@/components/Instagram/DateRangePicker";
import { FollowersMetricCard, EngagementMetricCard, ContentMetricCard } from "@/components/Instagram/MetricsCard";
import PostsSection from "@/components/Instagram/PostsSection";
import StoriesSection from "@/components/Instagram/StoriesSection";
import ReelsSection from "@/components/Instagram/ReelsSection";
import FollowersSection from "@/components/Instagram/FollowersSection";

// Services and utils
import instagramService from "@/services/instagram/instagramService";
import { calculateContentMetrics, calculateFollowerMetrics } from "@/utils/instagram/instagramUtils";
import type { 
  InstagramPost, 
  InstagramStory, 
  InstagramReel, 
  FollowerDayData,
  ContentMetrics,
  FollowerMetrics
} from "@/types/instagram/instagramTypes";

const InstagramDashboardPage: React.FC = () => {
  // Main state
  const [selectedAccount, setSelectedAccount] = useState("Montella");
  const [activeTab, setActiveTab] = useState("overview");
  
  // Date range state - Default to previous month
  const [dateRange, setDateRange] = useState(() => {
    const { from, to } = instagramService.getPreviousMonthRange();
    return { from, to };
  });

  // Data state
  const [data, setData] = useState<{
    posts: InstagramPost[];
    stories: InstagramStory[];
    reels: InstagramReel[];
    followers: FollowerDayData[];
  }>({
    posts: [],
    stories: [],
    reels: [],
    followers: []
  });

  // Loading and error states
  const [loading, setLoading] = useState({
    posts: false,
    stories: false,
    reels: false,
    followers: false,
    all: false
  });
  
  const [errors, setErrors] = useState<{
    posts: string | null;
    stories: string | null;
    reels: string | null;
    followers: string | null;
  }>({
    posts: null,
    stories: null,
    reels: null,
    followers: null
  });

  // Calculated metrics
  const contentMetrics: ContentMetrics = useMemo(() => {
    return calculateContentMetrics(data.posts, data.stories, data.reels);
  }, [data.posts, data.stories, data.reels]);

  const followerMetrics: FollowerMetrics = useMemo(() => {
    return calculateFollowerMetrics(data.followers);
  }, [data.followers]);

  // Load all dashboard data
  const loadDashboardData = async (account: string, from: Date, to: Date) => {
    try {
      setLoading(prev => ({ ...prev, all: true }));
      setErrors({ posts: null, stories: null, reels: null, followers: null });

      const accounts = account === "TODOS" ? ["Montella", "Alenka", "Kids"] : [account];
      
      const allData = {
        posts: [] as InstagramPost[],
        stories: [] as InstagramStory[],
        reels: [] as InstagramReel[],
        followers: [] as FollowerDayData[]
      };

      // Load data for each account
      for (const acc of accounts) {
        try {
          const accountData = await instagramService.getDashboardData(acc, from, to);
          
          allData.posts.push(...accountData.posts);
          allData.stories.push(...accountData.stories);
          allData.reels.push(...accountData.reels);
          allData.followers.push(...accountData.followers);
        } catch (error) {
          console.error(`Error loading data for ${acc}:`, error);
          toast.error(`Error cargando datos de ${acc}`);
        }
      }

      setData(allData);
      toast.success("Datos cargados correctamente");
      
    } catch (error: any) {
      console.error("Error loading dashboard data:", error);
      toast.error("Error cargando los datos del dashboard");
    } finally {
      setLoading(prev => ({ ...prev, all: false }));
    }
  };

  // Load individual section data
  const loadSectionData = async (
    section: 'posts' | 'stories' | 'reels' | 'followers',
    account: string,
    from: Date,
    to: Date
  ) => {
    try {
      setLoading(prev => ({ ...prev, [section]: true }));
      setErrors(prev => ({ ...prev, [section]: null }));

      const accounts = account === "TODOS" ? ["Montella", "Alenka", "Kids"] : [account];
      let sectionData: any[] = [];

      for (const acc of accounts) {
        try {
          let accountData: any[] = [];
          
          switch (section) {
            case 'posts':
              accountData = await instagramService.getTopPosts(acc, from, to);
              break;
            case 'stories':
              accountData = await instagramService.getTopStories(acc, from, to);
              break;
            case 'reels':
              accountData = await instagramService.getAllReels(acc, from, to);
              break;
            case 'followers':
              accountData = await instagramService.getFollowersMetrics(acc, from, to);
              break;
          }
          
          sectionData.push(...accountData);
        } catch (error) {
          console.error(`Error loading ${section} for ${acc}:`, error);
        }
      }

      setData(prev => ({ ...prev, [section]: sectionData }));
      
    } catch (error: any) {
      const errorMessage = error.message || `Error cargando ${section}`;
      setErrors(prev => ({ ...prev, [section]: errorMessage }));
      toast.error(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, [section]: false }));
    }
  };

  // Handle account change
  const handleAccountChange = (account: string) => {
    setSelectedAccount(account);
    loadDashboardData(account, dateRange.from, dateRange.to);
  };

  // Handle date range change
  const handleDateFromChange = (date: Date) => {
    const newRange = { ...dateRange, from: date };
    setDateRange(newRange);
    loadDashboardData(selectedAccount, newRange.from, newRange.to);
  };

  const handleDateToChange = (date: Date) => {
    const newRange = { ...dateRange, to: date };
    setDateRange(newRange);
    loadDashboardData(selectedAccount, newRange.from, newRange.to);
  };

  // Handle refresh
  const handleRefresh = () => {
    if (activeTab === "overview") {
      loadDashboardData(selectedAccount, dateRange.from, dateRange.to);
    } else {
      loadSectionData(activeTab as any, selectedAccount, dateRange.from, dateRange.to);
    }
  };

  // Handle sync data (admin only)
  const handleSyncData = async () => {
    try {
      setLoading(prev => ({ ...prev, all: true }));
      
      const accounts = selectedAccount === "TODOS" ? ["Montella", "Alenka", "Kids"] : [selectedAccount];
      
      for (const account of accounts) {
        await instagramService.syncAllContent(account, dateRange.from, dateRange.to);
      }
      
      toast.success("Datos sincronizados correctamente");
      handleRefresh();
      
    } catch (error: any) {
      console.error("Error syncing data:", error);
      toast.error("Error sincronizando datos");
    } finally {
      setLoading(prev => ({ ...prev, all: false }));
    }
  };

  // Initial load
  useEffect(() => {
    loadDashboardData(selectedAccount, dateRange.from, dateRange.to);
  }, []);

  const isLoading = Object.values(loading).some(Boolean);
  const hasErrors = Object.values(errors).some(Boolean);

  return (
    <div className="min-h-screen bg-[#1A1A20] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white/90 flex items-center gap-3">
              <div className="p-2 bg-[#e327c4]/20 rounded-xl">
                <Instagram className="h-8 w-8 text-[#e327c4]" />
              </div>
              📱 Dashboard de Instagram
            </h1>
            <p className="text-white/60 mt-2 text-lg">
              VALORES UNICAMENTE ORGANICOS, NO INCLUIDOS LOS PROVENIENTES DE LA #PAUTA
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-3 bg-[#B695BF]/20 hover:bg-[#B695BF]/30 border border-[#B695BF]/30 hover:border-[#B695BF]/50 text-[#B695BF] rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            
            <button
              onClick={handleSyncData}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-3 bg-[#51590E]/20 hover:bg-[#51590E]/30 border border-[#51590E]/30 hover:border-[#51590E]/50 text-[#51590E] rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              Sincronizar
            </button>
          </div>
        </div>

{/* Filters lado a lado */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Tarjeta: Selector de cuenta */}
  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
    <div className="flex items-center mb-4">
      <Calendar className="h-5 w-5 text-white/70 mr-2" />
      <h2 className="text-lg font-medium text-white">📱 Cuenta de Instagram</h2>
    </div>
    <AccountSelector
      selectedAccount={selectedAccount}
      onAccountChange={handleAccountChange}
      disabled={isLoading}
      className="w-full"
    />
  </div>

  {/* Tarjeta: Rango de fechas */}
  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
    <div className="flex items-center mb-4">
      <Calendar className="h-5 w-5 text-white/70 mr-2" />
      <h2 className="text-lg font-medium text-white">📅 Rango de fechas</h2>
    </div>
    <DateRangePicker
      dateFrom={dateRange.from}
      dateTo={dateRange.to}
      onDateFromChange={handleDateFromChange}
      onDateToChange={handleDateToChange}
      disabled={isLoading}
    />
  </div>
</div>

        {/* Error Alert */}
        {hasErrors && (
          <div className="p-4 bg-[#D94854]/20 backdrop-blur-sm border border-[#D94854]/30 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-[#D94854]" />
              <span className="text-[#D94854] font-medium">
                ⚠️ Algunos datos no pudieron cargarse correctamente
              </span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tabs Navigation */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-2">
            <Tabs.List className="grid w-full grid-cols-5 gap-2">
              <Tabs.Trigger 
                value="overview" 
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white/90 hover:bg-white/10 data-[state=active]:bg-[#51590E]/30 data-[state=active]:text-[#51590E] data-[state=active]:border data-[state=active]:border-[#51590E]/50 transition-all"
              >
                <BarChart3 className="h-4 w-4" />
                📊 Resumen
              </Tabs.Trigger>
              
              <Tabs.Trigger 
                value="followers"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white/90 hover:bg-white/10 data-[state=active]:bg-[#B695BF]/30 data-[state=active]:text-[#B695BF] data-[state=active]:border data-[state=active]:border-[#B695BF]/50 transition-all"
              >
                <Users className="h-4 w-4" />
                👥 Seguidores
              </Tabs.Trigger>
              
              <Tabs.Trigger 
                value="posts"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white/90 hover:bg-white/10 data-[state=active]:bg-[#D94854]/30 data-[state=active]:text-[#D94854] data-[state=active]:border data-[state=active]:border-[#D94854]/50 transition-all"
              >
                <Instagram className="h-4 w-4" />
                📦 Posts
              </Tabs.Trigger>
              
              <Tabs.Trigger 
                value="reels"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white/90 hover:bg-white/10 data-[state=active]:bg-[#D94854]/30 data-[state=active]:text-[#D94854] data-[state=active]:border data-[state=active]:border-[#D94854]/50 transition-all"
              >
                <Play className="h-4 w-4" />
                🎬 Reels
              </Tabs.Trigger>
              
              <Tabs.Trigger 
                value="stories"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white/90 hover:bg-white/10 data-[state=active]:bg-[#e327c4]/30 data-[state=active]:text-[#e327c4] data-[state=active]:border data-[state=active]:border-[#e327c4]/50 transition-all"
              >
                <BarChart3 className="h-4 w-4" />
                📊 Stories
              </Tabs.Trigger>
            </Tabs.List>
          </div>

          {/* Overview Tab */}
          <Tabs.Content value="overview" className="space-y-6">
            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FollowersMetricCard
                current={followerMetrics.currentFollowers}
                growth={followerMetrics.followersGrowth}
                growthPercentage={followerMetrics.growthPercentage}
                loading={loading.all || loading.followers}
              />
              
              <EngagementMetricCard
                value={contentMetrics.avgEngagement}
                loading={loading.all}
              />
              
              <ContentMetricCard
                posts={contentMetrics.totalPosts}
                stories={contentMetrics.totalStories}
                reels={contentMetrics.totalReels}
                loading={loading.all}
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center hover:bg-white/15 transition-all duration-300">
                <div className="text-2xl font-bold text-[#D94854] mb-2">
                  {contentMetrics.totalLikes.toLocaleString()}
                </div>
                <div className="text-sm text-white/60">❤️ Total Likes</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center hover:bg-white/15 transition-all duration-300">
                <div className="text-2xl font-bold text-[#51590E] mb-2">
                  {contentMetrics.totalViews.toLocaleString()}
                </div>
                <div className="text-sm text-white/60">👀 Total Views</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center hover:bg-white/15 transition-all duration-300">
                <div className="text-2xl font-bold text-[#B695BF] mb-2">
                  {contentMetrics.totalReach.toLocaleString()}
                </div>
                <div className="text-sm text-white/60">📈 Total Alcance</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center hover:bg-white/15 transition-all duration-300">
                <div className="text-2xl font-bold text-[#e327c4] mb-2">
                  {contentMetrics.totalComments.toLocaleString()}
                </div>
                <div className="text-sm text-white/60">💬 Total Comentarios</div>
              </div>
            </div>
          </Tabs.Content>

          {/* Followers Tab */}
          <Tabs.Content value="followers">
            <FollowersSection
              followersData={data.followers}
              loading={loading.followers || loading.all}
              error={errors.followers}
            />
          </Tabs.Content>

          {/* Posts Tab */}
          <Tabs.Content value="posts">
            <PostsSection
              posts={data.posts}
              loading={loading.posts || loading.all}
              error={errors.posts}
            />
          </Tabs.Content>

          {/* Reels Tab */}
          <Tabs.Content value="reels">
            <ReelsSection
              reels={data.reels}
              loading={loading.reels || loading.all}
              error={errors.reels}
            />
          </Tabs.Content>

          {/* Stories Tab */}
          <Tabs.Content value="stories">
            <StoriesSection
              stories={data.stories}
              loading={loading.stories || loading.all}
              error={errors.stories}
            />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
};

export default InstagramDashboardPage;