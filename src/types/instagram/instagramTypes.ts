export interface InstagramPost {
    id: string;
    postId: string;
    cuenta: string;
    fechaPublicacion: string;
    url: string;
    imageUrl: string;
    content?: string;
    likes: number;
    comments: number;
    shares: number;
    interactions: number;
    engagement: number;
    impressions: number;
    reach: number;
    saved: number;
    videoViews: number;
    clicks: number;
    businessId: string;
    createdAt: string;
  }
  
  export interface InstagramStory {
    id: string;
    postId: string;
    cuenta: string;
    fechaPublicacion: string;
    mediaUrl?: string;
    thumbnailUrl: string;
    permalink: string;
    content?: string;
    impressions: number;
    reach: number;
    replies: number;
    tapsForward: number;
    tapsBack: number;
    exits: number;
    businessId: string;
    createdAt: string;
  }
  
  export interface InstagramReel {
    id: string;
    reelId: string;
    cuenta: string;
    fechaPublicacion: string;
    url: string;
    imageUrl: string;
    contenido: string;
    likes: number;
    comentarios: number;
    views: number;
    reach: number;
    engagement: number;
    interacciones: number;
    videoViews: number;
    guardados: number;
    compartidos: number;
    businessId: string;
    createdAt: string;
  }
  
  export interface FollowerDayData {
    date: string;
    value: number;
    cuenta?: string;
  }
  
  // API Request/Response types
  export interface InstagramApiParams {
    account: string;
    from: string;
    to: string;
    ordenarPor?: string;
  }
  
  export interface SyncResponse {
    message: string;
    success?: boolean;
    exception?: string;
  }
  
  export interface ApiError {
    message: string;
    exception?: string;
    success?: boolean;
  }
  
  // UI State types
  export interface InstagramFilters {
    account: string;
    dateFrom: Date;
    dateTo: Date;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    searchTerm: string;
  }
  
  export interface PaginationState {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  }
  
  export interface InstagramDashboardState {
    filters: InstagramFilters;
    posts: {
      data: InstagramPost[];
      loading: boolean;
      error: string | null;
      pagination: PaginationState;
    };
    stories: {
      data: InstagramStory[];
      loading: boolean;
      error: string | null;
      pagination: PaginationState;
    };
    reels: {
      data: InstagramReel[];
      loading: boolean;
      error: string | null;
      pagination: PaginationState;
    };
    followers: {
      data: FollowerDayData[];
      loading: boolean;
      error: string | null;
    };
  }
  
  // Content types for unified handling
  export type InstagramContent = InstagramPost | InstagramStory | InstagramReel;
  
  export type ContentType = 'posts' | 'stories' | 'reels';
  
  export type SortableMetric = 
    | 'likes' 
    | 'comments' 
    | 'shares' 
    | 'engagement' 
    | 'reach' 
    | 'impressions'
    | 'views'
    | 'interactions'
    | 'saved'
    | 'replies'
    | 'tapsForward'
    | 'tapsBack'
    | 'exits';
  
  // Account configuration
  export interface InstagramAccount {
    name: string;
    displayName: string;
    businessId: string;
    isActive: boolean;
  }
  
  export const INSTAGRAM_ACCOUNTS: InstagramAccount[] = [
    { name: 'Montella', displayName: 'Montella', businessId: '', isActive: true },
    { name: 'Alenka', displayName: 'Alenka', businessId: '', isActive: true },
    { name: 'Kids', displayName: 'Kids', businessId: '', isActive: true }
  ];
  
  // Metrics summary types
  export interface ContentMetrics {
    totalPosts: number;
    totalStories: number;
    totalReels: number;
    avgEngagement: number;
    totalLikes: number;
    totalComments: number;
    totalViews: number;
    totalReach: number;
    totalImpressions: number;
  }
  
  export interface FollowerMetrics {
    currentFollowers: number;
    followersGrowth: number;
    growthPercentage: number;
    periodStart: number;
    periodEnd: number;
  }