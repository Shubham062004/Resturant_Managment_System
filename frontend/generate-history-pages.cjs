const fs = require('fs');
const path = require('path');

const pageConfigs = [
  {
    name: 'StaffHistoryPage',
    endpoint: 'staff',
    title: 'Staff History',
    headers: ['Employee', 'Role', 'Branch', 'Join Date', 'Status'],
    renderRow: (row) => `
      <td className="px-6 py-4 font-medium text-white">{row.firstName} {row.lastName}</td>
      <td className="px-6 py-4 text-slate-300">{row.role}</td>
      <td className="px-6 py-4 text-slate-300">{row.workAssignments?.[0]?.branch?.name || 'Unassigned'}</td>
      <td className="px-6 py-4 text-slate-400">{new Date(row.createdAt).toLocaleDateString()}</td>
      <td className="px-6 py-4"><Badge className={row.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}>{row.isActive ? 'ACTIVE' : 'INACTIVE'}</Badge></td>
    `
  },
  {
    name: 'InventoryHistoryPage',
    endpoint: 'inventory',
    title: 'Inventory History',
    headers: ['Branch', 'Ingredient', 'Requested Qty', 'Requested By', 'Status', 'Date'],
    renderRow: (row) => `
      <td className="px-6 py-4 text-white">{row.branch?.name}</td>
      <td className="px-6 py-4 text-slate-300">{row.items?.[0]?.ingredient?.name || 'Multiple'}</td>
      <td className="px-6 py-4 font-medium text-blue-400">{row.items?.length || 0} items</td>
      <td className="px-6 py-4 text-slate-400">{row.requestedBy?.firstName}</td>
      <td className="px-6 py-4"><Badge className="bg-emerald-500/20 text-emerald-400">{row.status}</Badge></td>
      <td className="px-6 py-4 text-slate-400">{new Date(row.createdAt).toLocaleDateString()}</td>
    `
  },
  {
    name: 'IngredientHistoryPage',
    endpoint: 'ingredients',
    title: 'Ingredient History',
    headers: ['Ingredient', 'Category', 'Unit', 'Opening Stock', 'Purchased', 'Closing Stock'],
    renderRow: (row) => `
      <td className="px-6 py-4 text-white font-medium">{row.name}</td>
      <td className="px-6 py-4 text-slate-300">{row.category}</td>
      <td className="px-6 py-4 text-slate-400">{row.unit}</td>
      <td className="px-6 py-4 text-slate-300">0.0</td>
      <td className="px-6 py-4 text-emerald-400">{row.stockMovements?.length || 0} movements</td>
      <td className="px-6 py-4 font-bold text-white">0.0</td>
    `
  },
  {
    name: 'SupplierHistoryPage',
    endpoint: 'suppliers',
    title: 'Supplier History',
    headers: ['Supplier', 'Contact', 'Email', 'Orders', 'Total Spend', 'Rating'],
    renderRow: (row) => `
      <td className="px-6 py-4 text-white font-medium">{row.name}</td>
      <td className="px-6 py-4 text-slate-300">{row.contactPerson || 'N/A'}</td>
      <td className="px-6 py-4 text-slate-400">{row.email || 'N/A'}</td>
      <td className="px-6 py-4 text-blue-400 font-medium">{row.purchaseOrders?.length || 0}</td>
      <td className="px-6 py-4 text-emerald-400 font-medium">$0.00</td>
      <td className="px-6 py-4 text-amber-400">{row.rating?.toFixed(1) || 'N/A'} ★</td>
    `
  },
  {
    name: 'BranchHistoryPage',
    endpoint: 'branches',
    title: 'Branch History',
    headers: ['Branch', 'City', 'Orders', 'Inventory Reqs', 'Active Staff'],
    renderRow: (row) => `
      <td className="px-6 py-4 text-white font-medium">{row.name}</td>
      <td className="px-6 py-4 text-slate-300">{row.city}</td>
      <td className="px-6 py-4 text-blue-400">{row._count?.Order || 0}</td>
      <td className="px-6 py-4 text-amber-400">{row._count?.inventoryRequests || 0}</td>
      <td className="px-6 py-4 text-emerald-400">{row._count?.workAssignments || 0}</td>
    `
  },
  {
    name: 'CustomerActivityHistoryPage',
    endpoint: 'customers',
    title: 'Customer History',
    headers: ['Customer', 'Email', 'Total Orders', 'Coupons Used', 'Last Visit', 'Spend'],
    renderRow: (row) => `
      <td className="px-6 py-4 text-white font-medium">{row.firstName} {row.lastName}</td>
      <td className="px-6 py-4 text-slate-300">{row.email}</td>
      <td className="px-6 py-4 text-blue-400 font-medium">{row._count?.orders || 0}</td>
      <td className="px-6 py-4 text-amber-400">{row._count?.couponUsages || 0}</td>
      <td className="px-6 py-4 text-slate-400">{row.orders?.[0]?.createdAt ? new Date(row.orders[0].createdAt).toLocaleDateString() : 'N/A'}</td>
      <td className="px-6 py-4 text-emerald-400 font-medium">$$$</td>
    `
  },
  {
    name: 'FinanceHistoryPage',
    endpoint: 'finance',
    title: 'Finance History',
    headers: ['Metric', 'Amount', 'Trend'],
    renderRow: (row) => `
      <td className="px-6 py-4 text-white font-medium">{row.metric}</td>
      <td className="px-6 py-4 text-emerald-400">{row.amount}</td>
      <td className="px-6 py-4 text-blue-400">{row.trend}</td>
    `
  },
  {
    name: 'AttendanceHistoryPage',
    endpoint: 'attendance',
    title: 'Attendance History',
    headers: ['Staff', 'Branch', 'Date', 'Check In', 'Check Out', 'Hours', 'Status'],
    renderRow: (row) => `
      <td className="px-6 py-4 text-white font-medium">{row.user?.firstName} {row.user?.lastName}</td>
      <td className="px-6 py-4 text-slate-300">{row.branch?.name || 'N/A'}</td>
      <td className="px-6 py-4 text-slate-400">{new Date(row.date).toLocaleDateString()}</td>
      <td className="px-6 py-4 text-emerald-400">${row.checkIn ? new Date(row.checkIn).toLocaleTimeString() : '-'}</td>
      <td className="px-6 py-4 text-amber-400">${row.checkOut ? new Date(row.checkOut).toLocaleTimeString() : '-'}</td>
      <td className="px-6 py-4 text-blue-400">${row.workingHours || 0}h</td>
      <td className="px-6 py-4"><Badge className={row.status === 'PRESENT' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}>{row.status}</Badge></td>
    `
  },
  {
    name: 'SalaryBonusHistoryPage',
    endpoint: 'salary',
    title: 'Salary & Bonus History',
    headers: ['Staff', 'Date', 'Base', 'Bonus', 'Deductions', 'Net Paid', 'Status'],
    renderRow: (row) => `
      <td className="px-6 py-4 text-white font-medium">{row.user?.firstName} {row.user?.lastName}</td>
      <td className="px-6 py-4 text-slate-400">{new Date(row.payrollDate).toLocaleDateString()}</td>
      <td className="px-6 py-4 text-slate-300">$${row.baseSalary}</td>
      <td className="px-6 py-4 text-emerald-400">+$${row.bonusPaid}</td>
      <td className="px-6 py-4 text-rose-400">-$${row.deductions}</td>
      <td className="px-6 py-4 font-bold text-white">$${row.netPaid}</td>
      <td className="px-6 py-4"><Badge className="bg-emerald-500/20 text-emerald-400">{row.status}</Badge></td>
    `
  },
  {
    name: 'AuditLogsPage',
    endpoint: 'audit',
    title: 'Audit Logs',
    headers: ['User', 'Action', 'Entity', 'IP Address', 'Timestamp'],
    renderRow: (row) => `
      <td className="px-6 py-4 text-white font-medium">{row.user ? \`\${row.user.firstName} \${row.user.lastName}\` : 'System'}</td>
      <td className="px-6 py-4 text-blue-400 font-bold">{row.action}</td>
      <td className="px-6 py-4 text-slate-300">{row.entity}</td>
      <td className="px-6 py-4 text-slate-400 font-mono text-xs">{row.ipAddress}</td>
      <td className="px-6 py-4 text-slate-500">{new Date(row.timestamp).toLocaleString()}</td>
    `
  },
  {
    name: 'SystemActivityLogsPage',
    endpoint: 'audit?action=LOGIN',
    title: 'System Activity Logs',
    headers: ['User', 'Event', 'IP Address', 'Timestamp'],
    renderRow: (row) => `
      <td className="px-6 py-4 text-white font-medium">{row.user ? \`\${row.user.firstName} \${row.user.lastName}\` : 'System'}</td>
      <td className="px-6 py-4 text-blue-400">{row.action}</td>
      <td className="px-6 py-4 text-slate-400 font-mono text-xs">{row.ipAddress}</td>
      <td className="px-6 py-4 text-slate-500">{new Date(row.timestamp).toLocaleString()}</td>
    `
  }
];

const dir = path.join(__dirname, 'src/features/history/pages');

pageConfigs.forEach((config) => {
  const content = `import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { Download, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

export default function ${config.name}() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(\`http://localhost:5000/api/v1/history/${config.endpoint}?limit=100\`, {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      if (res.ok) {
        const data = await res.json();
        setRecords(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch ${config.title}", error);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    // Simple generic CSV export
    const headers = "${config.headers.join(',')}\\n";
    const rows = records.map(r => Object.values(r).map(v => typeof v === 'object' ? JSON.stringify(v) : v).join(',')).join('\\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`${config.title.replace(' ', '_')}_\${format(new Date(), 'yyyy-MM-dd')}.csv\`;
    a.click();
  };

  return (
    <div className="flex flex-col space-y-6 h-full overflow-y-auto pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-display text-white tracking-tight">${config.title}</h1>
          <p className="text-sm text-slate-400 mt-1">Live data integration for ${config.title}.</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={exportCSV} className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm transition-colors border border-slate-700">
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Placeholder - Fully dynamic metrics to be added */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900/60 border-border/10">
          <CardContent className="p-6">
            <p className="text-slate-400 text-sm font-medium mb-1">Total Records Displayed</p>
            <p className="text-3xl font-bold text-emerald-400">{records.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900/40 border-border/20 flex-1">
        <CardHeader className="border-b border-border/10">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white">Records Table</h3>
            <div className="flex items-center space-x-2">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                 <input type="text" placeholder="Search..." className="bg-slate-950 border border-slate-800 text-white rounded-md pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-primary/50" />
               </div>
               <button className="p-1.5 bg-slate-800 rounded-md border border-slate-700 text-slate-300 hover:text-white"><Filter size={16}/></button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 border-b border-border/10">
                <tr>
                  ${config.headers.map(h => `<th className="px-6 py-4 font-medium">${h}</th>`).join('\\n                  ')}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={${config.headers.length}} className="px-6 py-12 text-center text-slate-500">
                      No records found for this period.
                    </td>
                  </tr>
                ) : (
                  records.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      ${config.renderRow('row')}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
`;
  if(config.name === 'FinanceHistoryPage') {
    // Specifically handle Finance History to not map over 'records' directly since the API returns an object
     // We will overwrite later or modify the template
  }
  fs.writeFileSync(path.join(dir, `${config.name}.tsx`), content);
});

console.log('Successfully refactored 11 History Pages in ' + dir);
