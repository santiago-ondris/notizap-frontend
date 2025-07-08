import api from "@/api/api";
import type {
  InstagramPost,
  InstagramStory,
  InstagramReel,
  FollowerDayData,
  InstagramApiParams,
  SyncResponse,
  ApiError
} from "@/types/instagram/instagramTypes";

// Base Instagram service class
class InstagramService {
  private readonly baseUrl = "/api/v1.0/instagram";

  // Helper method to format dates for API
  private formatDate(date: Date): string {
    return date.toISOString();
  }

  // Helper method to handle API errors
  private handleError(error: any): never {
    const apiError: ApiError = {
      message: error.response?.data?.message || "Error en la API de Instagram",
      exception: error.response?.data?.exception,
      success: false
    };
    throw apiError;
  }

  // Posts endpoints
  async getTopPosts(
    account: string,
    from: Date,
    to: Date,
    sortBy: string = "likes",
    limit: number = 50
  ): Promise<InstagramPost[]> {
    try {
      const params: InstagramApiParams = {
        account,
        from: this.formatDate(from),
        to: this.formatDate(to),
        ordenarPor: sortBy
      };

      const response = await api.get(`${this.baseUrl}/${account}/posts/top`, {
        params: {
          from: params.from,
          to: params.to,
          ordenarPor: params.ordenarPor,
          limit: limit
        }
      });

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async syncPosts(
    account: string,
    from: Date,
    to: Date
  ): Promise<SyncResponse> {
    try {
      const response = await api.post(
        `${this.baseUrl}/${account}/posts/sync`,
        {},
        {
          params: {
            from: this.formatDate(from),
            to: this.formatDate(to)
          }
        }
      );

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Stories endpoints
  async getTopStories(
    account: string,
    from: Date,
    to: Date,
    sortBy: string = "impressions",
    limit: number = 200
  ): Promise<InstagramStory[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${account}/stories/top`, {
        params: {
          from: this.formatDate(from),
          to: this.formatDate(to),
          ordenarPor: sortBy,
          limit: limit
        }
      });

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async syncStories(
    account: string,
    from: Date,
    to: Date
  ): Promise<SyncResponse> {
    try {
      const response = await api.post(
        `${this.baseUrl}/${account}/stories/sync`,
        {},
        {
          params: {
            from: this.formatDate(from),
            to: this.formatDate(to)
          }
        }
      );

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Reels endpoints
  async getTopReelsByViews(
    account: string,
    from: Date,
    to: Date
  ): Promise<InstagramReel[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${account}/reels/top-views`, {
        params: {
          from: this.formatDate(from),
          to: this.formatDate(to)
        }
      });

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getTopReelsByLikes(
    account: string,
    from: Date,
    to: Date
  ): Promise<InstagramReel[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${account}/reels/top-likes`, {
        params: {
          from: this.formatDate(from),
          to: this.formatDate(to)
        }
      });

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getAllReels(
    account: string,
    from: Date,
    to: Date
  ): Promise<InstagramReel[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${account}/reels/all`, {
        params: {
          from: this.formatDate(from),
          to: this.formatDate(to)
        }
      });

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async syncReels(
    account: string,
    from: Date,
    to: Date
  ): Promise<SyncResponse> {
    try {
      const response = await api.post(
        `${this.baseUrl}/${account}/reels/sync`,
        {},
        {
          params: {
            from: this.formatDate(from),
            to: this.formatDate(to)
          }
        }
      );

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Followers endpoints
  async getFollowersMetrics(
    account: string,
    from: Date,
    to: Date
  ): Promise<FollowerDayData[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${account}/followers`, {
        params: {
          from: this.formatDate(from),
          to: this.formatDate(to)
        }
      });

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Utility methods for common operations
  async getDashboardData(
    account: string,
    from: Date,
    to: Date
  ): Promise<{
    posts: InstagramPost[];
    stories: InstagramStory[];
    reels: InstagramReel[];
    followers: FollowerDayData[];
  }> {
    try {
      const [posts, stories, reels, followers] = await Promise.all([
        this.getTopPosts(account, from, to, "likes", 100), // Más posts para dashboard
        this.getTopStories(account, from, to, "impressions", 100), // Más stories para dashboard
        this.getAllReels(account, from, to),
        this.getFollowersMetrics(account, from, to)
      ]);

      return { posts, stories, reels, followers };
    } catch (error) {
      this.handleError(error);
    }
  }

  async syncAllContent(
    account: string,
    from: Date,
    to: Date
  ): Promise<{
    posts: SyncResponse;
    stories: SyncResponse;
    reels: SyncResponse;
  }> {
    try {
      const [posts, stories, reels] = await Promise.all([
        this.syncPosts(account, from, to),
        this.syncStories(account, from, to),
        this.syncReels(account, from, to)
      ]);

      return { posts, stories, reels };
    } catch (error) {
      this.handleError(error);
    }
  }

  // Date helpers for common use cases
  getPreviousMonthRange(): { from: Date; to: Date } {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    return {
      from: lastMonth,
      to: lastDayOfMonth
    };
  }

  getCurrentMonthRange(): { from: Date; to: Date } {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return {
      from: firstDay,
      to: now
    };
  }

  getDateRange(months: number): { from: Date; to: Date } {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - months, 1);
    
    return {
      from,
      to: now
    };
  }
}

// Export singleton instance
export const instagramService = new InstagramService();
export default instagramService;