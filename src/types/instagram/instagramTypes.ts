export type InstagramAccount = "montella" | "alenka" | "kids";

export interface ReelDto {
  id: string;
  reelId: string;
  cuenta: InstagramAccount;
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

export interface PostDto {
  id: string;
  postId: string;
  cuenta: InstagramAccount;
  fechaPublicacion: string;
  url: string;
  imageUrl: string;
  content: string;
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

export interface StoryDto {
  id: string;
  postId: string;
  cuenta: InstagramAccount;
  fechaPublicacion: string;
  mediaUrl: string;
  thumbnailUrl: string;
  permalink: string;
  content: string;
  impressions: number;
  reach: number;
  replies: number;
  tapsForward: number;
  tapsBack: number;
  exits: number;
  businessId: string;
  createdAt: string;
}

export interface FollowerDto {
  date: string;
  value: number;
}