/**
 * Export data array to CSV file download
 */
export function exportToCSV(
  headers: string[],
  rows: (string | number)[][],
  filename: string
) {
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Export data array to Excel-compatible TSV file
 */
export function exportToExcel(
  headers: string[],
  rows: (string | number)[][],
  filename: string
) {
  const tsvContent = [
    headers.join('\t'),
    ...rows.map((row) => row.join('\t')),
  ].join('\n');

  const blob = new Blob([tsvContent], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.xls`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export type DatePreset =
  | 'today'
  | '7d'
  | '30d'
  | '90d'
  | '6m'
  | '12m'
  | 'custom';

export const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '6m', label: 'Last 6 Months' },
  { value: '12m', label: 'Last 12 Months' },
  { value: 'custom', label: 'Custom Range' },
];
