import type { ReactNode } from "react";
import { Spinner } from "./spinner";

interface Column<T> {
  key: string;
  title: ReactNode;
  render: (record: T, index: number) => ReactNode;
  width?: string | number;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (record: T) => string | number;
  loading?: boolean;
  emptyText?: ReactNode;
}

export function Table<T>({
  columns,
  data,
  rowKey,
  loading = false,
  emptyText = "No data",
}: TableProps<T>) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-neutral-200">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left font-medium text-neutral-600"
                  style={{ width: col.width }}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {data.length === 0 && !loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-neutral-500"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((record, index) => (
                <tr
                  key={rowKey(record)}
                  className="bg-white transition-colors hover:bg-neutral-50"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-4 py-3 text-neutral-900"
                      style={{ width: col.width }}
                    >
                      {col.render(record, index)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60">
          <Spinner size="lg" />
        </div>
      )}
    </div>
  );
}
