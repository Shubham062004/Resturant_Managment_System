import {
  Download,
  FileSpreadsheet,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  LucideIcon,
} from 'lucide-react';
import React from 'react';

import {
  Card,
  CardContent,
  CardHeader,
} from '../../../shared/components/ui/Card';
import { StatCard } from '../../../shared/components/ui/StatCard';
import {
  exportToCSV,
  exportToExcel,
  DATE_PRESETS,
} from '../../../shared/utils/exportData';
import type { DatePreset } from '../../../shared/utils/exportData';

interface StatItem {
  title: string;
  value: string | number;
  trend?: number;
  icon?: LucideIcon;
}

interface HistoryPageLayoutProps {
  title: string;
  subtitle: string;
  stats: StatItem[];
  isLoading?: boolean;
  searchTerm: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  datePreset: DatePreset;
  onDatePresetChange: (v: DatePreset) => void;
  customStartDate?: string;
  customEndDate?: string;
  onCustomStartChange?: (v: string) => void;
  onCustomEndChange?: (v: string) => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (p: number) => void;
  exportHeaders?: string[];
  exportRows?: (string | number)[][];
  exportFilename?: string;
  children: React.ReactNode;
  filters?: React.ReactNode;
  chartSection?: React.ReactNode;
}

export default function HistoryPageLayout({
  title,
  subtitle,
  stats,
  isLoading = false,
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  datePreset,
  onDatePresetChange,
  customStartDate = '',
  customEndDate = '',
  onCustomStartChange,
  onCustomEndChange,
  page = 1,
  totalPages = 1,
  onPageChange,
  exportHeaders = [],
  exportRows = [],
  exportFilename = 'history-export',
  children,
  filters,
  chartSection,
}: HistoryPageLayoutProps) {
  return (
    <div className="flex flex-col space-y-6 h-full overflow-y-auto pb-10 px-1">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-white tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {exportHeaders.length > 0 && exportRows.length > 0 && (
            <>
              <button
                onClick={() =>
                  exportToCSV(exportHeaders, exportRows, exportFilename)
                }
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm transition-colors border border-slate-700"
              >
                <Download size={16} />
                Export CSV
              </button>
              <button
                onClick={() =>
                  exportToExcel(exportHeaders, exportRows, exportFilename)
                }
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm transition-colors border border-slate-700"
              >
                <FileSpreadsheet size={16} />
                Export Excel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="bg-slate-900/60 border-border/20">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
              />
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <Calendar size={16} className="text-slate-400" />
              {DATE_PRESETS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => onDatePresetChange(p.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    datePreset === p.value
                      ? 'bg-primary text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {datePreset === 'custom' && (
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => onCustomStartChange?.(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm"
                />
                <span className="text-slate-500">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => onCustomEndChange?.(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm"
                />
              </div>
            )}

            {filters}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            trend={stat.trend}
            icon={stat.icon}
            loading={isLoading}
          />
        ))}
      </div>

      {/* Charts */}
      {chartSection}

      {/* Data Table / Content */}
      <Card className="bg-slate-900/40 border-border/20 flex-1">
        <CardHeader className="border-b border-border/10 bg-slate-900/50 py-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white text-sm">Records</h3>
            {totalPages > 1 && onPageChange && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <button
                  onClick={() => onPageChange(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">{children}</CardContent>
      </Card>
    </div>
  );
}

export type { DatePreset };
