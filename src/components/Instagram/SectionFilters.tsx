import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  ArrowUpDown
} from "lucide-react";
import { ITEMS_PER_PAGE_OPTIONS } from "@/utils/instagram/instagramFilters";

interface SortOption {
  value: string;
  label: string;
}

interface SectionFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  sortOptions: SortOption[];
  onSortChange: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  itemsPerPage: number;
  onItemsPerPageChange: (value: string) => void;
  themeColor: string;
  sectionIcon: string;
  sectionName: string;
  disabled?: boolean;
  filteredCount: number;
  totalCount: number;
}

export const SectionFilters: React.FC<SectionFiltersProps> = ({
  searchTerm,
  onSearchChange,
  sortBy,
  sortOptions,
  onSortChange,
  sortOrder,
  itemsPerPage,
  onItemsPerPageChange,
  themeColor,
  sectionIcon,
  sectionName,
  disabled = false,
  filteredCount,
  totalCount
}) => {
  const getSortLabel = (sortKey: string) => {
    const option = sortOptions.find(opt => opt.value === sortKey);
    return option?.label || sortKey;
  };

  return (
    <div className="p-6 border-b border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 bg-[${themeColor}]/20 rounded-lg`}>
            {/* Icon will be passed as prop or handled by parent */}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white/90">
              {sectionIcon} {sectionName}
            </h2>
            {!disabled && (
              <div className={`inline-flex items-center gap-1 mt-1 px-2 py-1 bg-[${themeColor}]/20 text-[${themeColor}] text-xs rounded-lg`}>
                {filteredCount} de {totalCount} {sectionName.toLowerCase()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-white/50" />
          <input
            type="text"
            placeholder="🔍 Buscar en contenido..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            disabled={disabled}
            className={`w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white/90 placeholder-white/50 hover:bg-white/15 focus:bg-white/15 focus:border-[${themeColor}]/50 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
          />
        </div>

        {/* Sort Select */}
        <Select value={sortBy} onValueChange={onSortChange} disabled={disabled}>
          <SelectTrigger className={`px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white/80 hover:bg-white/15 focus:bg-white/15 focus:border-[${themeColor}]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}>
            <div className="flex items-center gap-2">
              <ArrowUpDown className={`h-4 w-4 text-[${themeColor}]`} />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-[#212026] border-white/20">
            {sortOptions.map(option => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="text-red-400 hover:bg-white/10 focus:bg-white/10 focus:text-red-300"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Items Per Page Select */}
        <Select 
          value={itemsPerPage.toString()} 
          onValueChange={onItemsPerPageChange}
          disabled={disabled}
        >
          <SelectTrigger className={`px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white hover:bg-white/15 focus:bg-white/15 focus:border-[${themeColor}]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#212026] border-white/20">
            {ITEMS_PER_PAGE_OPTIONS.map(option => (
              <SelectItem 
                key={option} 
                value={option.toString()}
                className="text-red-400 hover:bg-white/10 focus:bg-white/10 focus:text-red-300"
              >
                {option} por página
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort Indicator */}
      {sortBy && (
        <div className="flex items-center gap-2 mt-4 p-3 bg-white/5 rounded-lg">
          <Filter className={`h-4 w-4 text-[${themeColor}]`} />
          <span className="text-sm text-white/70">
            {sectionIcon} Ordenado por{" "}
            <span className={`text-[${themeColor}] font-medium`}>
              {getSortLabel(sortBy)}
            </span>{" "}
            ({sortOrder === 'desc' ? 'mayor a menor' : 'menor a mayor'})
          </span>
        </div>
      )}
    </div>
  );
};

export default SectionFilters;