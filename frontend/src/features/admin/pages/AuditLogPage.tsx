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
  Database
} from 'lucide-react';
import { motion } from 'framer-motion';

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

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/audit-logs');
      setLogs(res.data.data);
    } catch (err: any) {
      toast.error('Failed to query remote security event log.');
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

  return (
    <div className="space-y-8 p-6 text-white bg-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-display tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Audit & Security Logs
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time telemetry of administrative operations, security breaches, database events, and login history.
          </p>
        </div>
        <Button
          onClick={loadData}
          variant="outline"
          className="flex items-center gap-2 border-border bg-slate-900 text-slate-100 hover:bg-slate-800"
        >
          <RefreshCw size={16} /> Refresh Audit Trail
        </Button>
      </div>

      {/* Main Logs Table */}
      <Card className="border-border/40 bg-slate-900/40 backdrop-blur-md rounded-2xl p-6">
        <CardHeader className="border-none p-0 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold font-display text-white">System Events Ledger</h3>
            <p className="text-xs text-slate-400">Verifiably immutable operation logs</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-border/20 text-xs w-64">
              <Search size={14} className="text-slate-500" />
              <input
                type="text"
                placeholder="Search user, action, target..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-white focus:outline-none w-full"
              />
            </div>

            {/* Action Type Filter */}
            <div className="flex items-center space-x-2 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-border/20 text-xs">
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
          <div className="flex flex-col items-center justify-center py-16">
            <RefreshCw className="animate-spin text-primary w-10 h-10 mb-4" />
            <p className="text-xs text-slate-400 font-display">Reading Mongo Audit Collections...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No security events logged.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans text-left">
              <thead>
                <tr className="border-b border-border/40 text-slate-400 font-semibold text-xs pb-3">
                  <th className="pb-3 pr-2">Action Type</th>
                  <th className="pb-3 pr-2">Actor (User)</th>
                  <th className="pb-3 pr-2">Target Entity</th>
                  <th className="pb-3 pr-2">Details / Changes</th>
                  <th className="pb-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {filteredLogs.map((log, index) => (
                  <tr key={log.id || log._id || index} className="hover:bg-slate-900/20 transition-colors">
                    <td className="py-3 font-semibold text-slate-200">
                      <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-mono">
                        {log.actionType}
                      </span>
                    </td>
                    <td className="py-3 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <User size={14} className="text-slate-500" />
                        <span>{log.userId}</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-400 text-xs font-medium">{log.targetId}</td>
                    <td className="py-3 text-slate-400 text-xs">
                      {log.changes ? (
                        <pre className="font-mono bg-slate-950 p-2 rounded-lg border border-border/10 max-w-xs overflow-x-auto">
                          {JSON.stringify(log.changes, null, 2)}
                        </pre>
                      ) : (
                        <span className="italic text-slate-600">No modifications logged</span>
                      )}
                    </td>
                    <td className="py-3 text-right text-slate-400 font-medium text-xs">
                      <div className="flex items-center justify-end gap-1.5">
                        <Clock size={12} className="text-slate-500" />
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
