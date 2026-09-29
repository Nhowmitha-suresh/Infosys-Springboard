import React, { useState } from 'react';
import { MediUtils } from '../services/utils';
import { MediToast } from './Toast';

export interface Column<T> {
  key: string;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  searchPlaceholder?: string;
  pageSize?: number;
  exportFilename?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  searchPlaceholder = 'Search table...',
  pageSize = 10,
  exportFilename = 'medisphere_export.csv'
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  // Filtering
  let filtered = [...data];
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(row => {
      return columns.some(col => {
        const val = row[col.key];
        return val && val.toString().toLowerCase().includes(q);
      });
    });
  }

  // Sorting
  if (sortColumn) {
    filtered.sort((a, b) => {
      let valA = a[sortColumn] || '';
      let valB = b[sortColumn] || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const activePage = currentPage > totalPages ? totalPages : currentPage;
  const startIdx = (activePage - 1) * pageSize;
  const pageData = filtered.slice(startIdx, startIdx + pageSize);

  const handleExport = () => {
    MediUtils.exportToCSV(exportFilename, filtered);
    MediToast.success(`Exported ${filtered.length} records to ${exportFilename}`);
  };

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortColumn(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="table-wrapper">
      <div className="table-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {title && <h3 style={{ fontSize: '1.1rem', color: '#FFFFFF', margin: 0 }}>{title}</h3>}
          <span className="badge badge-info">{filtered.length} Total</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="table-search">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
            />
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleExport}>
            Export CSV
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  style={{ cursor: 'pointer' }}
                >
                  {col.label} {sortColumn === col.key ? (sortAsc ? '▲' : '▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', color: '#9CA3AF', padding: '24px' }}>
                  No records found.
                </td>
              </tr>
            ) : (
              pageData.map((row, rowIdx) => (
                <tr key={row.id || rowIdx}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? 'N/A')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="table-pagination">
          <div>
            Showing {pageData.length ? startIdx + 1 : 0} to {Math.min(startIdx + pageSize, filtered.length)} of {filtered.length} records
          </div>
          <div className="pagination-controls">
            <button
              className="page-btn"
              disabled={activePage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            >
              Prev
            </button>
            <span style={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontWeight: 600, color: '#FFFFFF' }}>
              {activePage} / {totalPages}
            </span>
            <button
              className="page-btn"
              disabled={activePage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
