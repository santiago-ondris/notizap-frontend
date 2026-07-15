import React from 'react';

interface Column<T> {
  key: string;
  header: React.ReactNode;
  render: (row: T) => React.ReactNode;
  align?: 'left' | 'right';
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  emptyText?: string;
}

export function TablaSimple<T>({ columns, data, emptyText = 'Sin datos' }: Props<T>) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
      <table className="w-full">
        <thead className="border-b border-white/10 bg-white/5">
          <tr>
            {columns.map(column => (
              <th
                key={column.key}
                className={`px-4 py-3 text-${column.align ?? 'left'} text-xs font-medium uppercase tracking-wide text-white/50`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-white/50">{emptyText}</td>
            </tr>
          ) : data.map((row, index) => (
            <tr key={index} className="border-b border-white/5 last:border-0 hover:bg-white/5">
              {columns.map(column => (
                <td key={column.key} className={`px-4 py-3 text-${column.align ?? 'left'} text-sm text-white/75`}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
