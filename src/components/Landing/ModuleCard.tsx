import React from "react";
import { ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ModuleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color?: string;
  to?: string;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  title,
  description,
  icon: Icon,
  color = "#B695BF",
  to,
}) => {
  const CardWrapper = to ? 'a' : 'div';
  
  return (
    <CardWrapper
      href={to}
      className="group relative block"
    >
      {/* Main card */}
      <div className="relative h-full p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-[1.02] hover:-translate-y-1 overflow-hidden">
        
        {/* Background gradient on hover */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${color}20 0%, transparent 100%)`
          }}
        />
        
        {/* Glow effect */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl blur-xl"
          style={{
            background: `linear-gradient(135deg, ${color} 0%, transparent 100%)`
          }}
        />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div 
              className="flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 group-hover:scale-110"
              style={{
                background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
                border: `1px solid ${color}30`
              }}
            >
              <Icon 
                className="w-6 h-6 transition-all duration-300 group-hover:scale-110" 
                style={{ color: color }}
              />
            </div>
            
            {to && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
                <ArrowUpRight className="w-5 h-5 text-white/40" />
              </div>
            )}
          </div>
          
          {/* Title */}
          <h3 className="text-lg font-bold text-white mb-3 group-hover:text-white transition-colors">
            {title}
          </h3>
          
          {/* Description */}
          <p className="text-sm text-white/60 group-hover:text-white/80 transition-colors leading-relaxed flex-grow">
            {description}
          </p>
          
          {/* Status indicator */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
            <div 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors">
              {to ? 'Disponible' : 'Próximamente'}
            </span>
          </div>
        </div>
      </div>
    </CardWrapper>
  );
};