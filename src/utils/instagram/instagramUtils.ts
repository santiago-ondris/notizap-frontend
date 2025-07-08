import type {
    InstagramPost,
    InstagramStory,
    InstagramReel,
    FollowerDayData,
    ContentMetrics,
    FollowerMetrics,
    InstagramContent
  } from "@/types/instagram/instagramTypes";
  
  export const formatDateForDisplay = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };
  
  export const formatDateTimeForDisplay = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  export const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}T00:00:00`;
  };
  
  export const getLocalDateRange = (startDate: Date, endDate: Date) => {
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59);
    
    return {
      from: start,
      to: end
    };
  };
  
  export const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString('es-AR');
  };
  
  export const formatPercentage = (num: number, decimals: number = 1): string => {
    return `${num.toFixed(decimals)}%`;
  };
  
  export const formatEngagementRate = (interactions: number, reach: number): string => {
    if (reach === 0) return '0%';
    const rate = (interactions / reach) * 100;
    return formatPercentage(rate);
  };
  
  export const calculateEngagementRate = (interactions: number, reach: number): number => {
    if (reach === 0) return 0;
    return (interactions / reach) * 100;
  };
  
  export const calculateGrowthPercentage = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };
  
  export const calculateContentMetrics = (
    posts: InstagramPost[],
    stories: InstagramStory[],
    reels: InstagramReel[]
  ): ContentMetrics => {
    const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0) + 
                      reels.reduce((sum, reel) => sum + reel.likes, 0);
    
    const totalComments = posts.reduce((sum, post) => sum + post.comments, 0) + 
                         reels.reduce((sum, reel) => sum + reel.comentarios, 0);
    
    const totalViews = posts.reduce((sum, post) => sum + post.videoViews, 0) + 
                      reels.reduce((sum, reel) => sum + reel.views, 0);
    
    const totalReach = posts.reduce((sum, post) => sum + post.reach, 0) + 
                      stories.reduce((sum, story) => sum + story.reach, 0) + 
                      reels.reduce((sum, reel) => sum + reel.reach, 0);
    
    const totalImpressions = posts.reduce((sum, post) => sum + post.impressions, 0) + 
                            stories.reduce((sum, story) => sum + story.impressions, 0);
    
    const totalInteractions = posts.reduce((sum, post) => sum + post.interactions, 0) + 
                             reels.reduce((sum, reel) => sum + reel.interacciones, 0) + 
                             stories.reduce((sum, story) => sum + story.replies, 0);
    
    const avgEngagement = totalReach > 0 ? (totalInteractions / totalReach) * 100 : 0;
  
    return {
      totalPosts: posts.length,
      totalStories: stories.length,
      totalReels: reels.length,
      avgEngagement,
      totalLikes,
      totalComments,
      totalViews,
      totalReach,
      totalImpressions
    };
  };
  
  export const calculateFollowerMetrics = (followerData: FollowerDayData[]): FollowerMetrics => {
    if (followerData.length === 0) {
      return {
        currentFollowers: 0,
        followersGrowth: 0,
        growthPercentage: 0,
        periodStart: 0,
        periodEnd: 0
      };
    }
  
    const sortedData = [...followerData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  
    const periodStart = sortedData[0].value;
    const periodEnd = sortedData[sortedData.length - 1].value;
    const followersGrowth = periodEnd - periodStart;
    const growthPercentage = calculateGrowthPercentage(periodEnd, periodStart);
  
    return {
      currentFollowers: periodEnd,
      followersGrowth,
      growthPercentage,
      periodStart,
      periodEnd
    };
  };
  
  export const sortPostsByMetric = (posts: InstagramPost[], metric: string, ascending: boolean = false): InstagramPost[] => {
    return [...posts].sort((a, b) => {
      let valueA: number;
      let valueB: number;
  
      switch (metric) {
        case 'likes':
          valueA = a.likes;
          valueB = b.likes;
          break;
        case 'comments':
          valueA = a.comments;
          valueB = b.comments;
          break;
        case 'engagement':
          valueA = a.engagement;
          valueB = b.engagement;
          break;
        case 'reach':
          valueA = a.reach;
          valueB = b.reach;
          break;
        case 'impressions':
          valueA = a.impressions;
          valueB = b.impressions;
          break;
        case 'date':
          valueA = new Date(a.fechaPublicacion).getTime();
          valueB = new Date(b.fechaPublicacion).getTime();
          break;
        default:
          valueA = a.likes;
          valueB = b.likes;
      }
  
      return ascending ? valueA - valueB : valueB - valueA;
    });
  };
  
  export const sortReelsByMetric = (reels: InstagramReel[], metric: string, ascending: boolean = false): InstagramReel[] => {
    return [...reels].sort((a, b) => {
      let valueA: number;
      let valueB: number;
  
      switch (metric) {
        case 'views':
          valueA = a.views;
          valueB = b.views;
          break;
        case 'likes':
          valueA = a.likes;
          valueB = b.likes;
          break;
        case 'comments':
          valueA = a.comentarios;
          valueB = b.comentarios;
          break;
        case 'engagement':
          valueA = a.engagement;
          valueB = b.engagement;
          break;
        case 'reach':
          valueA = a.reach;
          valueB = b.reach;
          break;
        case 'date':
          valueA = new Date(a.fechaPublicacion).getTime();
          valueB = new Date(b.fechaPublicacion).getTime();
          break;
        default:
          valueA = a.views;
          valueB = b.views;
      }
  
      return ascending ? valueA - valueB : valueB - valueA;
    });
  };
  
  export const sortStoriesByMetric = (stories: InstagramStory[], metric: string, ascending: boolean = false): InstagramStory[] => {
    return [...stories].sort((a, b) => {
      let valueA: number;
      let valueB: number;
  
      switch (metric) {
        case 'impressions':
          valueA = a.impressions;
          valueB = b.impressions;
          break;
        case 'reach':
          valueA = a.reach;
          valueB = b.reach;
          break;
        case 'replies':
          valueA = a.replies;
          valueB = b.replies;
          break;
        case 'tapsForward':
          valueA = a.tapsForward;
          valueB = b.tapsForward;
          break;
        case 'date':
          valueA = new Date(a.fechaPublicacion).getTime();
          valueB = new Date(b.fechaPublicacion).getTime();
          break;
        default:
          valueA = a.impressions;
          valueB = b.impressions;
      }
  
      return ascending ? valueA - valueB : valueB - valueA;
    });
  };
  
  export const getTopPerformingContent = <T extends InstagramContent>(
    content: T[],
    metric: string,
    limit: number = 5
  ): T[] => {
    if (!content.length) return [];
    
    let sorted: T[];
    
    if ('views' in content[0]) {
      sorted = sortReelsByMetric(content as InstagramReel[], metric) as T[];
    } else if ('impressions' in content[0] && 'replies' in content[0]) {
      sorted = sortStoriesByMetric(content as InstagramStory[], metric) as T[];
    } else {
      sorted = sortPostsByMetric(content as InstagramPost[], metric) as T[];
    }
    
    return sorted.slice(0, limit);
  };
  
  export const isDateInRange = (date: string | Date, from: Date, to: Date): boolean => {
    const checkDate = new Date(date);
    const fromDate = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    const toDate = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59);
    
    return checkDate >= fromDate && checkDate <= toDate;
  };
  
  export const classifyPerformance = (engagement: number): 'excellent' | 'good' | 'average' | 'poor' => {
    if (engagement >= 5) return 'excellent';
    if (engagement >= 3) return 'good';
    if (engagement >= 1) return 'average';
    return 'poor';
  };
  
  export const getPerformanceColor = (performance: string): string => {
    switch (performance) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'average': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };
  
  export const getPerformanceBadgeColor = (performance: string): string => {
    switch (performance) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'average': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };