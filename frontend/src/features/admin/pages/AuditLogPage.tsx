import React, { useEffect, useState } from 'react';
import apiClient from '../../../services/apiClient';
import { Card, CardHeader } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { useToast } from '../../../shared/components/ui/Toast';
import {
  Shield,
  Search,
  Filter,
  RefreshCw,
  User,
  Clock,
  Database,
  ShieldAlert,
  Key,
  Terminal,
  Activity,
  AlertTriangle,
  FileCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuditLog {
  id?: string;
  _id?: string;
  actionType: string;
  userId: string;
  targetId: string;
  changes?: any;
  createdAt: string;
}

export default function AuditLogPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/audit-logs');
      setLogs(res.data.data || []);
    } catch (err: any) {
      toast.error('Failed to query security event log.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const actionTypes = Array.from(new Set(logs.map(log => log.actionType)));

  const filteredLogs = logs
    .filter(log => actionFilter === 'ALL' || log.actionType === actionFilter)
    .filter(log =>
      log.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetId.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getSeverityStyle = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('DELETE') || act.includes('REMOVE') || act.includes('BREACH') || act.includes('DROP')) {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
    if (act.includes('UPDATE') || act.includes('PATCH') || act.includes('EDIT') || act.includes('MODIFY')) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
    if (act.includes('CREATE') || act.includes('ADD') || act.includes('SAVE')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
    return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  };

  // Metrics calculations
  const totalEvents = logs.length;
  const criticalEvents = logs.filter(log => {
    const act = log.actionType.toUpperCase();
    return act.includes('DELETE') || act.includes('REMOVE') || act.includes('BREACH');
  }).length;
  const uniqueActors = new Set(logs.map(log => log.userId)).size;

  return (
    <div className="space-y-8 p-6 text-[#F8FAFC] bg-[#0F172A] min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Shield size={18} />
            </span>
            <h1 className="text-4xl font-bold font-display tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Security & Audit Trail
            </h1>
          </div>
          <p className="text-slate-400 text-sm mt-1 ml-9">
            Cryptographically logged administrator actions, permission escalations, core catalog adjustments, and security state telemetry.
          </p>
        </div>
        <Button
          onClick={loadData}
          variant="outline"
          className="flex items-center gap-2 border-slate-800 bg-[#111827] text-slate-150 hover:bg-slate-800 text-xs px-4 py-2"
        >
          <RefreshCw size={14} /> Refresh Audit Trail
        </Button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-[#111827] border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Operations Logged</p>
            <Activity className="text-blue-400 w-4 h-4" />
          </div>
          <p className="text-3xl font-extrabold font-display mt-2 text-white">{totalEvents} Events</p>
          <span className="text-[10px] text-slate-500 mt-1 block">Immutable append-only ledger</span>
        </Card>

        <Card className="p-6 bg-[#111827] border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Critical Outflows / Deletions</p>
            <ShieldAlert className="text-rose-400 w-4 h-4" />
          </div>
          <p className="text-3xl font-extrabold font-display mt-2 text-rose-400">{criticalEvents} Incidents</p>
          <span className="text-[10px] text-slate-500 mt-1 block">Requires manual audit verification</span>
        </Card>

        <Card className="p-6 bg-[#111827] border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active System Operators</p>
            <Key className="text-emerald-400 w-4 h-4" />
          </div>
          <p className="text-3xl font-extrabold font-display mt-2 text-white">{uniqueActors} Accounts</p>
          <span className="text-[10px] text-slate-500 mt-1 block">Unique credentials verified</span>
        </Card>
      </div>

      {/* Search and Main Table Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Logs Explorer Table (left) */}
        <div className="lg:col-span-2">
          <Card className="border-slate-800 bg-[#111827] rounded-2xl p-6 shadow-xl">
            <CardHeader className="border-none p-0 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold font-display text-white">System Events Explorer</h3>
                <p className="text-xs text-slate-400">Filter and audit secure action logs</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search Input */}
                <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs w-60">
                  <Search size={14} className="text-slate-500" />
                  <input
                    type="text"
                    placeholder="Filter trail..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent text-white focus:outline-none w-full"
                  />
                </div>

                {/* Action Type Filter */}
                <div className="flex items-center space-x-2 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                  <Filter size={14} className="text-slate-500" />
                  <select
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                    className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="ALL" className="bg-slate-900">All Event Types</option>
                    {actionTypes.map(type => (
                      <option key={type} value={type} className="bg-slate-900">{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <RefreshCw className="animate-spin text-[#2563EB] w-10 h-10 mb-4" />
                <p className="text-xs text-slate-400">Parsing security registers...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-16">No matching security events logged.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400">
                      <th className="py-3 px-4">Action Event</th>
                      <th className="py-3 px-4">Operator</th>
                      <th className="py-3 px-4">Target Entity</th>
                      <th className="py-3 px-4 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-xs text-slate-300">
                    {filteredLogs.map((log, index) => {
                      const logId = log.id || log._id || index.toString();
                      const isSelected = selectedLog?.id === log.id || selectedLog?._id === log._id;

                      return (
                        <tr
                          key={logId}
                          onClick={() => setSelectedLog(log)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-slate-900' : 'hover:bg-slate-900/40'
                          }`}
                        >
                          <td className="py-3.5 px-4 font-bold text-white">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${getSeverityStyle(log.actionType)}`}>
                              {log.actionType}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-200">
                            <div className="flex items-center gap-1.5 font-medium">
                              <User size={13} className="text-slate-500" />
                              <span>{log.userId}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 font-mono text-[10px]">
                            {log.targetId.length > 20 ? `${log.targetId.slice(0, 18)}...` : log.targetId}
                          </td>
                          <td className="py-3.5 px-4 text-right text-slate-400 font-medium">
                            <div className="flex items-center justify-end gap-1.5">
                              <Clock size={12} className="text-slate-500" />
                              <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Change Detail Viewer (right) */}
        <div className="lg:col-span-1">
          <Card className="border-slate-800 bg-[#111827] rounded-2xl p-6 shadow-xl h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
                <Terminal size={16} className="text-indigo-400" />
                <h3 className="text-base font-bold font-display text-white">Payload Inspector</h3>
              </div>

              {selectedLog ? (
                <div className="mt-5 space-y-5 font-sans text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-500 font-semibold uppercase text-[9px] block">Event ID</span>
                    <span className="text-slate-200 font-mono">{selectedLog.id || selectedLog._id}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-slate-500 font-semibold uppercase text-[9px] block">Operator</span>
                      <span className="text-slate-200 font-medium">{selectedLog.userId}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 font-semibold uppercase text-[9px] block">Action Date</span>
                      <span className="text-slate-200 font-medium">
                        {new Date(selectedLog.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 font-semibold uppercase text-[9px] block">Full Target Resource Path</span>
                    <span className="text-slate-300 font-mono break-all">{selectedLog.targetId}</span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-slate-500 font-semibold uppercase text-[9px] block">Data Payload Diff</span>
                    {selectedLog.changes ? (
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto max-h-[300px] font-mono text-[11px] text-emerald-400">
                        <pre>{JSON.stringify(selectedLog.changes, null, 2)}</pre>
                      </div>
                    ) : (
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-center text-slate-500 italic">
                        No state modification parameters logged.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center text-slate-500">
                  <FileCode size={36} className="text-slate-600 mb-3" />
                  <p className="text-xs font-semibold">Select a security event row from the explorer table to inspect its payload properties.</p>
                </div>
              )}
            </div>

            {selectedLog && (
              <div className="pt-6 mt-6 border-t border-slate-800 flex justify-end">
                <Button
                  onClick={() => setSelectedLog(null)}
                  variant="outline"
                  className="bg-slate-900 border-slate-800 hover:bg-slate-800 text-xs px-3 py-1.5 text-slate-300"
                >
                  Clear Selection
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
