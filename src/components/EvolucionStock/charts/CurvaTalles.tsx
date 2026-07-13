import React from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { chartTheme } from './ChartTheme';
import type { CurvaTalle } from '@/types/evolucionStock/evolucionStockTypes';

interface Props {
  data: CurvaTalle[];
}

export const CurvaTalles: React.FC<Props> = ({ data }) => {
  if (data.length === 0) return null;

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke={chartTheme.grid} />
          <XAxis dataKey="talle" stroke={chartTheme.axis} tick={{ fill: chartTheme.axis, fontSize: 12 }} />
          <YAxis stroke={chartTheme.axis} tick={{ fill: chartTheme.axis, fontSize: 12 }} />
          <Tooltip contentStyle={chartTheme.tooltip} />
          <Legend />
          <Bar dataKey="comprado" name="Comprado" fill={chartTheme.compra} radius={[4, 4, 0, 0]} />
          <Bar dataKey="vendido" name="Vendido" fill={chartTheme.venta} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
