import React from "react";
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
}) => (
  <a
    href={to}
    className="group flex flex-col items-center justify-center gap-2 p-6 rounded-2xl bg-white/10 hover:bg-white/20 shadow-md transition-all duration-300 border border-white/20 hover:-translate-y-2 hover:scale-105"
    style={{ color }}
  >
    <Icon className="w-10 h-10 mb-2 transition-all duration-300 group-hover:scale-110" />
    <h3 className="font-bold text-lg text-white">{title}</h3>
    <p className="text-sm text-white/80">{description}</p>
  </a>
);
