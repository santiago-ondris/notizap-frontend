import React, { useState, useMemo } from "react";
import { 
  ChevronLeft, 
  ChevronRight,
  ImageIcon,
  Loader2
} from "lucide-react";
import SectionFilters from "./SectionFilters";
import ContentCard from "./ContentCard";
import { 
  filterPosts, 
  paginateArray, 
  getPaginationInfo 
} from "@/utils/instagram/instagramFilters";
import { sortPostsByMetric } from "@/utils/instagram/instagramUtils";
import type { InstagramPost } from "@/types/instagram/instagramTypes";

interface PostsSectionProps {
  posts: InstagramPost[];
  loading?: boolean;
  error?: string | null;
  className?: string;
}

export const PostsSection: React.FC<PostsSectionProps> = ({
  posts,
  loading = false,
  error = null,
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("likes");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const filteredPosts = useMemo(() => {
    let filtered = filterPosts(posts, { searchTerm });
    filtered = sortPostsByMetric(filtered, sortBy, sortOrder === 'asc');
    return filtered;
  }, [posts, searchTerm, sortBy, sortOrder]);

  const { paginatedData, pagination } = useMemo(() => {
    return paginateArray(filteredPosts, currentPage, itemsPerPage);
  }, [filteredPosts, currentPage, itemsPerPage]);

  const paginationInfo = getPaginationInfo(pagination);

  const handleSortChange = (newSortBy: string) => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };
  
  const handleItemsPerPageChange = (newItemsPerPage: string) => {
    setItemsPerPage(parseInt(newItemsPerPage));
    setCurrentPage(1);
  };

  if (error) {
    return (
      <div className={`p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl ${className}`}>
        <div className="text-center">
          <p className="text-[#D94854] font-medium">⚠️ Error al cargar posts: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl ${className}`}>
      <SectionFilters
        searchTerm={searchTerm}
        onSearchChange={(value) => {
          setSearchTerm(value);
          setCurrentPage(1);
        }}
        sortBy={sortBy}
        sortOptions={[
          { value: 'likes', label: 'Likes' },
          { value: 'comments', label: 'Comentarios' },
          { value: 'engagement', label: 'Engagement' },
          { value: 'reach', label: 'Alcance' },
          { value: 'impressions', label: 'Impresiones' },
          { value: 'date', label: 'Fecha' }
        ]}
        onSortChange={handleSortChange}
        sortOrder={sortOrder}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={handleItemsPerPageChange}
        themeColor="#D94854"
        sectionIcon="📦"
        sectionName="Posts de Instagram"
        disabled={loading}
        filteredCount={filteredPosts.length}
        totalCount={posts.length}
      />

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#D94854] mx-auto mb-3" />
              <span className="text-white/70">Cargando posts...</span>
            </div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-6 bg-white/5 rounded-2xl mb-4 inline-block">
              <ImageIcon className="h-12 w-12 text-white/40 mx-auto" />
            </div>
            <p className="text-white/60">
              {posts.length === 0 
                ? "📭 No hay posts disponibles en este período"
                : "🔍 No se encontraron posts con los filtros aplicados"
              }
            </p>
          </div>
        ) : (
          <>
            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
              {paginatedData.map((post) => (
                <ContentCard
                  key={post.id}
                  content={post}
                  contentType="posts"
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <div className="text-sm text-white/60">
                  📊 Mostrando {paginationInfo.showingFrom} - {paginationInfo.showingTo} de {pagination.totalItems} posts
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!paginationInfo.hasPreviousPage}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 text-white/80 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </button>

                  <div className="flex items-center gap-1">
                    {paginationInfo.pageNumbers.map((pageNum, index) => {
                      const isGap = index > 0 && pageNum > paginationInfo.pageNumbers[index - 1] + 1;
                      
                      return (
                        <React.Fragment key={pageNum}>
                          {isGap && <span className="text-white/40 px-2">...</span>}
                          <button
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 ${
                              pageNum === currentPage 
                                ? 'bg-[#D94854]/30 border border-[#D94854]/50 text-[#D94854]' 
                                : 'bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 text-white/80'
                            }`}
                          >
                            {pageNum}
                          </button>
                        </React.Fragment>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!paginationInfo.hasNextPage}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 text-white/80 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PostsSection;