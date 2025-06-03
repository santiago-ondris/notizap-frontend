import api from "@/api/api";
import {
    type ReelDto,
    type InstagramAccount,
    type PostDto, 
    type StoryDto,
    type FollowerDto
 } from "@/types/instagram/instagramTypes";


// --------- REELS ---------

export async function getTopReelsByViews(account: InstagramAccount, from: string, to: string) {
  const { data } = await api.get<ReelDto[]>(`/api/v1/instagram/${account}/reels/top-views?from=${from}&to=${to}`);
  return data;
}

export async function getTopReelsByLikes(account: InstagramAccount, from: string, to: string) {
  const { data } = await api.get<ReelDto[]>(`/api/v1/instagram/${account}/reels/top-likes?from=${from}&to=${to}`);
  return data;
}

export async function getAllReels(account: InstagramAccount, from: string, to: string) {
  const { data } = await api.get<ReelDto[]>(`/api/v1/instagram/${account}/reels/all?from=${from}&to=${to}`);
  return data;
}

export async function syncReels(account: InstagramAccount, from: string, to: string) {
  const { data } = await api.post<{ message: string }>(`/api/v1/instagram/${account}/reels/sync?from=${from}&to=${to}`);
  return data;
}

// --------- POSTEOS ---------

export async function getTopPosts(account: InstagramAccount, from: string, to: string, ordenarPor: string = "likes") {
  const { data } = await api.get<PostDto[]>(
    `/api/v1/instagram/${account}/posts/top?ordenarPor=${ordenarPor}&from=${from}&to=${to}`
  );
  return data;
}

export async function syncPosts(account: InstagramAccount, from: string, to: string) {
  const { data } = await api.post<{ message: string }>(`/api/v1/instagram/${account}/posts/sync?from=${from}&to=${to}`);
  return data;
}

// --------- HISTORIAS ---------

export async function getTopStories(account: InstagramAccount, ordenarPor: string = "impressions", from: string, to: string) {
  const { data } = await api.get<StoryDto[]>(`/api/v1/instagram/${account}/stories/top?ordenarPor=${ordenarPor}?from=${from}&to=${to}`);
  return data;
}

export async function syncStories(account: InstagramAccount, from: string, to: string) {
  const { data } = await api.post<{ message: string }>(`/api/v1/instagram/${account}/stories/sync?from=${from}&to=${to}`);
  return data;
}

// --------- SEGUIDORES ---------

export async function getFollowers(account: InstagramAccount, from: string, to: string) {
  const { data } = await api.get<FollowerDto[]>(`/api/v1/instagram/${account}/followers?from=${from}&to=${to}`);
  return data;
}
