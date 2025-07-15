import React, { useState } from "react";
import { 
  Heart, 
  MessageCircle, 
  Eye, 
  Users, 
  BarChart3,
  ExternalLink,
  Play,
  Image as ImageIcon
} from "lucide-react";
import { 
  formatNumber, 
  formatDateForDisplay, 
  formatEngagementRate,
} from "@/utils/instagram/instagramUtils";
import type { InstagramPost, InstagramStory, InstagramReel, ContentType } from "@/types/instagram/instagramTypes";

interface ContentCardProps {
  content: InstagramPost | InstagramStory | InstagramReel;
  contentType: ContentType;
  className?: string;
  showAccountBadge?: boolean;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  content,
  contentType,
  className = "",
  showAccountBadge = true
}) => {
  const isPost = contentType === 'posts';
  const isStory = contentType === 'stories';
  const isReel = contentType === 'reels';
  
  // Solo necesitamos imageLoading para stories
  const [imageLoading, setImageLoading] = useState(true);

  const getContentText = () => {
    if (isPost) return (content as InstagramPost).content;
    if (isStory) return (content as InstagramStory).content;
    if (isReel) return (content as InstagramReel).contenido;
    return '';
  };

  const getReach = () => {
    if ('reach' in content) return content.reach;
    return 0;
  };

  const contentText = getContentText();
  const truncatedText = contentText && contentText.length > 1000 
    ? contentText.substring(0, 1000) + '...' 
    : contentText;

  const getContentUrl = () => {
    if (isStory) return (content as InstagramStory).permalink;
    if (isPost) return (content as InstagramPost).url;
    return (content as InstagramReel).url;
  };

  return (
    <div className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden hover:bg-white/15 hover:border-white/30 transition-all duration-300 ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {showAccountBadge && (
              <div className={`px-3 py-1 rounded-lg text-xs font-medium ${getAccountBadgeStyle(content.cuenta)}`}>
                {content.cuenta}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-white/60">
            {isPost && <ImageIcon className="h-3 w-3 text-[#B695BF]" />}
            {isReel && <Play className="h-3 w-3 text-[#D94854]" />}
            {isStory && <BarChart3 className="h-3 w-3 text-[#e327c4]" />}
            <span>📅 {formatDateForDisplay(content.fechaPublicacion)}</span>
          </div>
        </div>

        {/* IMAGEN - Solo para stories */}
        {isStory && (
          <div className="relative mb-4 group">
            {/* Skeleton loader mientras carga */}
            {imageLoading && (
              <div className="w-full h-48 bg-white/5 animate-pulse rounded-xl border border-white/10 flex items-center justify-center">
                <div className="text-white/40 text-sm">Cargando imagen...</div>
              </div>
            )}

            {/* LA IMAGEN REAL - solo para stories */}
            <img
              src={(content as InstagramStory).thumbnailUrl}
              alt="Story de Instagram"
              className={`w-full h-48 object-cover rounded-xl border border-white/10 transition-opacity duration-300 ${
                imageLoading ? 'opacity-0 absolute' : 'opacity-100'
              }`}
              loading="lazy"
              onLoad={() => setImageLoading(false)}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                setImageLoading(false);
                target.src = '/api/placeholder/400/300';
              }}
            />

            {/* Overlay hover */}
            {!imageLoading && (
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
            )}
          </div>
        )}

        {/* Content Text */}
        {truncatedText && (
          <div className="mb-4 p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
            <p className="text-sm text-white/80 leading-relaxed">
              {truncatedText}
            </p>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-3">
            {(isPost || isReel) && (
              <div className="flex items-center gap-3 text-sm">
                <div className="p-1.5 bg-[#D94854]/20 rounded-lg">
                  <Heart className="h-4 w-4 text-[#D94854]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-white/90">{formatNumber((content as InstagramPost | InstagramReel).likes)}</span>
                  <span className="text-xs text-white/60">likes</span>
                </div>
              </div>
            )}
            
            {isPost && (
              <div className="flex items-center gap-3 text-sm">
                <div className="p-1.5 bg-[#B695BF]/20 rounded-lg">
                  <MessageCircle className="h-4 w-4 text-[#B695BF]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-white/90">{formatNumber((content as InstagramPost).comments)}</span>
                  <span className="text-xs text-white/60">comentarios</span>
                </div>
              </div>
            )}

            {isReel && (
              <div className="flex items-center gap-3 text-sm">
                <div className="p-1.5 bg-[#51590E]/20 rounded-lg">
                  <Eye className="h-4 w-4 text-[#51590E]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-white/90">{formatNumber((content as InstagramReel).views)}</span>
                  <span className="text-xs text-white/60">views</span>
                </div>
              </div>
            )}

            {isStory && (
              <div className="flex items-center gap-3 text-sm">
                <div className="p-1.5 bg-[#e327c4]/20 rounded-lg">
                  <BarChart3 className="h-4 w-4 text-[#e327c4]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-white/90">{formatNumber((content as InstagramStory).impressions)}</span>
                  <span className="text-xs text-white/60">impresiones</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {getReach() > 0 && (
              <div className="flex items-center gap-3 text-sm">
                <div className="p-1.5 bg-[#B695BF]/20 rounded-lg">
                  <Users className="h-4 w-4 text-[#B695BF]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-white/90">{formatNumber(getReach())}</span>
                  <span className="text-xs text-white/60">alcance</span>
                </div>
              </div>
            )}

            {(isPost || isReel) && (
              <div className="flex items-center gap-3 text-sm">
                <div className="p-1.5 bg-[#51590E]/20 rounded-lg">
                  <BarChart3 className="h-4 w-4 text-[#51590E]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-white/90">{formatEngagementRate(
                    'interactions' in content ? (content as InstagramPost).interactions : 0 ||
                    (content as InstagramPost | InstagramReel).likes,
                    getReach()
                  )}</span>
                  <span className="text-xs text-white/60">engagement</span>
                </div>
              </div>
            )}

            {isStory && (
              <div className="flex items-center gap-3 text-sm">
                <div className="p-1.5 bg-[#B695BF]/20 rounded-lg">
                  <MessageCircle className="h-4 w-4 text-[#B695BF]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-white/90">{formatNumber((content as InstagramStory).replies)}</span>
                  <span className="text-xs text-white/60">respuestas</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center pt-2 border-t border-white/10">
          <button
            onClick={() => window.open(getContentUrl(), '_blank')}
            className="flex items-center gap-2 px-4 py-2 bg-[#22c55e]/10 hover:bg-[#22c55e]/20 border border-[#22c55e]/20 hover:border-[#22c55e]/30 text-[#22c55e] rounded-lg text-sm font-medium transition-all duration-200"
          >
            <ExternalLink className="h-3 w-3" />
            Ver en Instagram
          </button>
        </div>
      </div>
    </div>
  );
};

const getAccountBadgeStyle = (account: string): string => {
  switch (account) {
    case 'Montella':
      return 'bg-[#D94854]/20 text-[#D94854] border border-[#D94854]/30';
    case 'Alenka':
      return 'bg-[#e327c4]/20 text-[#e327c4] border border-[#e327c4]/30';
    case 'Kids':
      return 'bg-[#51590E]/20 text-[#51590E] border border-[#51590E]/30';
    default:
      return 'bg-[#B695BF]/20 text-[#B695BF] border border-[#B695BF]/30';
  }
};

export default ContentCard;