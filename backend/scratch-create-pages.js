const fs = require('fs');
const path = require('path');

const pages = [
  'OrderHistoryPage',
  'StaffHistoryPage',
  'InventoryHistoryPage',
  'IngredientHistoryPage',
  'SupplierHistoryPage',
  'BranchHistoryPage',
  'CustomerActivityHistoryPage',
  'FinanceHistoryPage',
  'AttendanceHistoryPage',
  'SalaryBonusHistoryPage',
  'AuditLogsPage',
  'SystemActivityLogsPage',
];

const dir = path.join(__dirname, '../frontend/src/features/history/pages');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

pages.forEach((page) => {
  const content = `import React from 'react';
import { Card, CardContent, CardHeader } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';

export default function ${page}() {
  return (
    <div className="flex flex-col space-y-6 h-full">
      <div>
        <h1 className="text-3xl font-bold font-display text-white tracking-tight">
          ${page
            .replace('Page', '')
            .replace(/([A-Z])/g, ' $1')
            .trim()}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Historical records and advanced data tables for ${page.replace('Page', '')}.
        </p>
      </div>

      <Card className="bg-slate-900/40 border-border/20 flex-1">
        <CardHeader className="border-b border-border/10">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white">Records Table</h3>
            <Badge className="bg-primary/20 text-primary border-none">Coming Soon</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-border/20 rounded-xl bg-slate-950/50">
            <span className="text-4xl mb-4">📊</span>
            <p className="text-slate-400 font-medium text-center max-w-md">
              The data grid for ${page
                .replace('Page', '')
                .replace(/([A-Z])/g, ' $1')
                .trim()} is currently under construction.
              It will feature filtering, sorting, and export capabilities.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
`;
  fs.writeFileSync(path.join(dir, `${page}.tsx`), content);
});

console.log('Successfully generated 12 History Pages in ' + dir);
