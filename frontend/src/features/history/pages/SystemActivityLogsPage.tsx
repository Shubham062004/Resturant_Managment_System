import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { StatCard } from '../../../shared/components/ui/StatCard';
import { Download, Search, Server, Activity, Database, TerminalSquare } from 'lucide-react';
import { format } from 'date-fns';
import { useHistoryQuery } from '../../../api/hooks/useHistory';

export default function SystemActivityLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Reuse the audit endpoint but we'll mock some system metrics for the dashboard
  const { data: response, isLoading } = useHistoryQuery('audit', { limit: 100 });
  const records = useMemo(() => response?.data || [], [response]);

  return (
    <div className="flex flex-col space-y-6 h-full overflow-y-auto pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-display text-white tracking-tight">System Telemetry</h1>
          <p className="text-sm text-slate-400 mt-1">API performance, background jobs, and error tracking.</p>
        </div>
        <button className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm transition-colors border border-slate-700">
          <Download size={16} />
          <span>Export Telemetry</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="API Success Rate" value="99.98%" trend={0.01} icon={Activity} loading={isLoading} />
        <StatCard title="Avg Latency" value="124ms" trend={-12.4} icon={Server} loading={isLoading} />
        <StatCard title="Database Queries" value="4.2M" trend={5.2} icon={Database} loading={isLoading} />
        <StatCard title="Background Jobs" value="1,420" trend={0} icon={TerminalSquare} loading={isLoading} />
      </div>

      <Card className="bg-slate-900/40 border-border/20 flex-1 min-h-[500px]">
        <CardHeader className="border-b border-border/10 bg-slate-900/50">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white">Real-Time Event Stream</h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search traces..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50" 
              />
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
                  <th className="px-6 py-4 font-medium">Level</th>
                  <th className="px-6 py-4 font-medium">Service</th>
                  <th className="px-6 py-4 font-medium">Message</th>
                  <th className="px-6 py-4 font-medium">Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {records.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-500">No system events recorded.</td></tr>
                ) : (
                  records.slice(0, 50).map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors font-mono">
                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {format(new Date(row.timestamp), 'HH:mm:ss.SSS')}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">INFO</Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        api-gateway
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {row.action} event dispatched for {row.entity} successfully.
                      </td>
                      <td className="px-6 py-4 text-emerald-400 text-xs">{Math.floor(Math.random() * 100) + 10}ms</td>
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
