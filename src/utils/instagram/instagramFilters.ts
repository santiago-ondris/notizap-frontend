import type {
    InstagramPost,
    InstagramStory,
    InstagramReel,
    InstagramContent,
    PaginationState,
    InstagramFilters
  } from "@/types/instagram/instagramTypes";
  import { isDateInRange } from "./instagramUtils";
  
  export const paginateArray = <T>(
    array: T[],
    currentPage: number,
    itemsPerPage: number
  ): {
    paginatedData: T[];
    pagination: PaginationState;
  } => {
    const totalItems = array.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    const paginatedData = array.slice(startIndex, endIndex);
    
    const pagination: PaginationState = {
      currentPage: Math.max(1, Math.min(currentPage, totalPages || 1)),
      itemsPerPage,
      totalItems,
      totalPages: totalPages || 1
    };
  
    return { paginatedData, pagination };
  };
  
  export const filterContentBySearch = <T extends InstagramContent>(
    content: T[],
    searchTerm: string
  ): T[] => {
    if (!searchTerm.trim()) return content;
    
    const term = searchTerm.toLowerCase().trim();
    
    return content.filter(item => {
      const contentText = 'content' in item ? item.content : 
                         'contenido' in item ? item.contenido : '';
      
      if (contentText && contentText.toLowerCase().includes(term)) {
        return true;
      }
      
      if (item.cuenta.toLowerCase().includes(term)) {
        return true;
      }
      
      const id = 'postId' in item ? item.postId : 
                'reelId' in item ? item.reelId : '';
      
      if (id && id.toLowerCase().includes(term)) {
        return true;
      }
      
      return false;
    });
  };
  
  export const filterContentByDateRange = <T extends InstagramContent>(
    content: T[],
    from: Date,
    to: Date
  ): T[] => {
    return content.filter(item => 
      isDateInRange(item.fechaPublicacion, from, to)
    );
  };
  
  export const filterContentByAccount = <T extends InstagramContent>(
    content: T[],
    account: string
  ): T[] => {
    if (!account || account === 'TODOS' || account === 'all') {
      return content;
    }
    
    return content.filter(item => 
      item.cuenta.toLowerCase() === account.toLowerCase()
    );
  };
  
  export const filterPosts = (
    posts: InstagramPost[],
    filters: Partial<InstagramFilters> & { 
      minLikes?: number;
      minComments?: number;
      minEngagement?: number;
      hasVideo?: boolean;
    }
  ): InstagramPost[] => {
    let filtered = [...posts];
    
    if (filters.account) {
      filtered = filterContentByAccount(filtered, filters.account);
    }
    
    if (filters.dateFrom && filters.dateTo) {
      filtered = filterContentByDateRange(filtered, filters.dateFrom, filters.dateTo);
    }
    
    if (filters.searchTerm) {
      filtered = filterContentBySearch(filtered, filters.searchTerm);
    }
    
    if (filters.minLikes !== undefined) {
      filtered = filtered.filter(post => post.likes >= filters.minLikes!);
    }
    
    if (filters.minComments !== undefined) {
      filtered = filtered.filter(post => post.comments >= filters.minComments!);
    }
    
    if (filters.minEngagement !== undefined) {
      filtered = filtered.filter(post => post.engagement >= filters.minEngagement!);
    }
    
    if (filters.hasVideo !== undefined) {
      if (filters.hasVideo) {
        filtered = filtered.filter(post => post.videoViews > 0);
      } else {
        filtered = filtered.filter(post => post.videoViews === 0);
      }
    }
    
    return filtered;
  };
  
  export const filterStories = (
    stories: InstagramStory[],
    filters: Partial<InstagramFilters> & { 
      minImpressions?: number;
      minReach?: number;
      minReplies?: number;
    }
  ): InstagramStory[] => {
    let filtered = [...stories];
    
    if (filters.account) {
      filtered = filterContentByAccount(filtered, filters.account);
    }
    
    if (filters.dateFrom && filters.dateTo) {
      filtered = filterContentByDateRange(filtered, filters.dateFrom, filters.dateTo);
    }
    
    if (filters.searchTerm) {
      filtered = filterContentBySearch(filtered, filters.searchTerm);
    }
    
    if (filters.minImpressions !== undefined) {
      filtered = filtered.filter(story => story.impressions >= filters.minImpressions!);
    }
    
    if (filters.minReach !== undefined) {
      filtered = filtered.filter(story => story.reach >= filters.minReach!);
    }
    
    if (filters.minReplies !== undefined) {
      filtered = filtered.filter(story => story.replies >= filters.minReplies!);
    }
    
    return filtered;
  };
  
  export const filterReels = (
    reels: InstagramReel[],
    filters: Partial<InstagramFilters> & { 
      minViews?: number;
      minLikes?: number;
      minComments?: number;
      minEngagement?: number;
      minShares?: number;
    }
  ): InstagramReel[] => {
    let filtered = [...reels];
    
    if (filters.account) {
      filtered = filterContentByAccount(filtered, filters.account);
    }
    
    if (filters.dateFrom && filters.dateTo) {
      filtered = filterContentByDateRange(filtered, filters.dateFrom, filters.dateTo);
    }
    
    if (filters.searchTerm) {
      filtered = filterContentBySearch(filtered, filters.searchTerm);
    }
    
    if (filters.minViews !== undefined) {
      filtered = filtered.filter(reel => reel.views >= filters.minViews!);
    }
    
    if (filters.minLikes !== undefined) {
      filtered = filtered.filter(reel => reel.likes >= filters.minLikes!);
    }
    
    if (filters.minComments !== undefined) {
      filtered = filtered.filter(reel => reel.comentarios >= filters.minComments!);
    }
    
    if (filters.minEngagement !== undefined) {
      filtered = filtered.filter(reel => reel.engagement >= filters.minEngagement!);
    }
    
    if (filters.minShares !== undefined) {
      filtered = filtered.filter(reel => reel.compartidos >= filters.minShares!);
    }
    
    return filtered;
  };
  
  export interface AdvancedFilters {
    accounts: string[];
    dateRange: { from: Date; to: Date };
    searchTerm: string;
    performanceLevel: 'all' | 'excellent' | 'good' | 'average' | 'poor';
    contentType: 'all' | 'with-video' | 'without-video' | 'carousel' | 'single-image';
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    minMetricValues: {
      likes?: number;
      comments?: number;
      views?: number;
      reach?: number;
      impressions?: number;
      engagement?: number;
    };
  }
  
  export const applyAdvancedFilters = <T extends InstagramContent>(
    content: T[],
    filters: Partial<AdvancedFilters>
  ): T[] => {
    let filtered = [...content];
    
    if (filters.accounts && filters.accounts.length > 0 && !filters.accounts.includes('all')) {
      filtered = filtered.filter(item => 
        filters.accounts!.some(account => 
          item.cuenta.toLowerCase() === account.toLowerCase()
        )
      );
    }
    
    if (filters.dateRange) {
      filtered = filterContentByDateRange(filtered, filters.dateRange.from, filters.dateRange.to);
    }
    
    if (filters.searchTerm) {
      filtered = filterContentBySearch(filtered, filters.searchTerm);
    }
    
    if (filters.performanceLevel && filters.performanceLevel !== 'all') {
      filtered = filtered.filter(item => {
        const engagement = 'engagement' in item ? item.engagement : 0;
        
        switch (filters.performanceLevel) {
          case 'excellent': return engagement >= 5;
          case 'good': return engagement >= 3 && engagement < 5;
          case 'average': return engagement >= 1 && engagement < 3;
          case 'poor': return engagement < 1;
          default: return true;
        }
      });
    }
    
    if (filters.contentType && filters.contentType !== 'all') {
      filtered = filtered.filter(item => {
        if ('videoViews' in item) {
          switch (filters.contentType) {
            case 'with-video': return item.videoViews > 0;
            case 'without-video': return item.videoViews === 0;
            default: return true;
          }
        }
        return true;
      });
    }
    
    if (filters.minMetricValues) {
      const { minMetricValues } = filters;
      
      filtered = filtered.filter(item => {
        if (minMetricValues.likes !== undefined) {
          const likes = 'likes' in item ? item.likes : 0;
          if (likes < minMetricValues.likes) return false;
        }
        
        if (minMetricValues.comments !== undefined) {
          const comments = 'comments' in item ? item.comments : 
                          'comentarios' in item ? item.comentarios : 0;
          if (comments < minMetricValues.comments) return false;
        }
        
        if (minMetricValues.views !== undefined && 'views' in item) {
          if (item.views < minMetricValues.views) return false;
        }
        
        if (minMetricValues.reach !== undefined && 'reach' in item) {
          if (item.reach < minMetricValues.reach) return false;
        }
        
        if (minMetricValues.impressions !== undefined && 'impressions' in item) {
          if (item.impressions < minMetricValues.impressions) return false;
        }
        
        if (minMetricValues.engagement !== undefined && 'engagement' in item) {
          if (item.engagement < minMetricValues.engagement) return false;
        }
        
        return true;
      });
    }
    
    return filtered;
  };
  
  export const getQuickFilterPresets = () => ({
    topPerformers: {
      sortBy: 'engagement',
      sortOrder: 'desc' as const,
      minMetricValues: { engagement: 3 }
    },
    recentContent: {
      sortBy: 'date',
      sortOrder: 'desc' as const,
      dateRange: {
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 
        to: new Date()
      }
    },
    viralContent: {
      sortBy: 'views',
      sortOrder: 'desc' as const,
      minMetricValues: { likes: 100, views: 1000 }
    },
    lowPerformance: {
      sortBy: 'engagement',
      sortOrder: 'asc' as const,
      performanceLevel: 'poor' as const
    }
  });
  
  export const getPaginationInfo = (pagination: PaginationState) => ({
    showingFrom: (pagination.currentPage - 1) * pagination.itemsPerPage + 1,
    showingTo: Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems),
    hasNextPage: pagination.currentPage < pagination.totalPages,
    hasPreviousPage: pagination.currentPage > 1,
    pageNumbers: Array.from(
      { length: pagination.totalPages }, 
      (_, i) => i + 1
    ).filter(page => 
      page === 1 || 
      page === pagination.totalPages || 
      Math.abs(page - pagination.currentPage) <= 2
    )
  });
  
  export const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50, 100] as const;
  
  export const DEFAULT_PAGINATION = {
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,
    totalPages: 1
  } as const;