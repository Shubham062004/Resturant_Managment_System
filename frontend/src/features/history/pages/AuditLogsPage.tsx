import { format } from 'date-fns';
import { Download, Search, Shield, ShieldAlert, Key, ActivitySquare } from 'lucide-react';
import React, { useState, useMemo } from 'react';

import { useHistoryQuery } from '../../../api/hooks/useHistory';
import { Badge } from '../../../shared/components/ui/Badge';
import { Card, CardContent, CardHeader } from '../../../shared/components/ui/Card';
import { StatCard } from '../../../shared/components/ui/StatCard';

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const { data: response, isLoading } = useHistoryQuery('audit', { limit: 1000 });
  const records = useMemo(() => response?.data || [], [response]);

  // Derived KPIs
  const stats = useMemo(() => {
    if (!records.length) return { total: 0, logins: 0, modifications: 0, securityEvents: 0 };
    
    let logins = 0;
    let modifications = 0;
    let securityEvents = 0;

    records.forEach((r: any) => {
      const act = r.action || '';
      if (act === 'LOGIN' || act === 'LOGOUT') logins++;
      if (act === 'UPDATE' || act === 'DELETE' || act === 'CREATE') modifications++;
      if (act === 'REJECT' || act.includes('FAILED')) securityEvents++;
    });

    return {
      total: records.length,
      logins,
      modifications,
      securityEvents
    };
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((r: any) => {
      const matchSearch = r.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.entity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.ipAddress?.includes(searchTerm);
      const matchAction = actionFilter ? r.action === actionFilter : true;
      return matchSearch && matchAction;
    });
  }, [records, searchTerm, actionFilter]);

  const getActionColor = (action: string) => {
    switch(action) {
      case 'CREATE': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'UPDATE': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'DELETE': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'LOGIN': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'APPROVE': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'REJECT': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="flex flex-col space-y-6 h-full overflow-y-auto pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-display text-white tracking-tight">Audit & Security Logs</h1>
          <p className="text-sm text-slate-400 mt-1">Immutable ledger of user actions, modifications, and authentications.</p>
        </div>
        <button className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm transition-colors border border-slate-700">
          <Download size={16} />
          <span>Export Audit Trail</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Events Recorded" value={stats.total.toLocaleString()} trend={0} icon={Shield} loading={isLoading} />
        <StatCard title="Authentication Events" value={stats.logins.toLocaleString()} trend={5.2} icon={Key} loading={isLoading} />
        <StatCard title="Data Modifications" value={stats.modifications.toLocaleString()} trend={2.1} icon={ActivitySquare} loading={isLoading} />
        <StatCard title="Security Warnings" value={stats.securityEvents} trend={-1.4} icon={ShieldAlert} loading={isLoading} />
      </div>

      <Card className="bg-slate-900/40 border-border/20 flex-1 min-h-[500px]">
        <CardHeader className="border-b border-border/10 bg-slate-900/50">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white">Security Trail</h3>
            <div className="flex items-center space-x-3">
               <div className="relative w-64">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                 <input 
                   type="text" 
                   placeholder="Search user, entity, IP..." 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full bg-slate-950 border border-slate-800 text-white rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50" 
                  />
               </div>
               <select 
                 value={actionFilter}
                 onChange={(e) => setActionFilter(e.target.value)}
                 className="bg-slate-950 border border-slate-800 text-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
               >
                 <option value="">All Actions</option>
                 <option value="LOGIN">Login</option>
                 <option value="CREATE">Create</option>
                 <option value="UPDATE">Update</option>
                 <option value="DELETE">Delete</option>
                 <option value="APPROVE">Approve</option>
               </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
             <div className="h-64 flex items-center justify-center">
               <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
             </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 sticky top-0 border-b border-border/10">
                <tr>
                  <th className="px-6 py-4 font-medium">Timestamp</th>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Action</th>
                  <th className="px-6 py-4 font-medium">Module / Entity</th>
                  <th className="px-6 py-4 font-medium">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {filteredRecords.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-500">No audit logs found.</td></tr>
                ) : (
                  filteredRecords.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors font-mono">
                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {format(new Date(row.timestamp), 'dd MMM yyyy, HH:mm:ss')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white font-sans">{row.user ? `${row.user.firstName} ${row.user.lastName}` : 'System'}</div>
                        <div className="text-xs text-slate-500 font-sans">{row.user?.role || 'SYSTEM_DAEMON'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getActionColor(row.action)}>{row.action}</Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-sans">
                        {row.entity} <span className="text-slate-600 text-xs ml-2">({row.entityId?.substring(0,8)})</span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs">{row.ipAddress}</td>
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
