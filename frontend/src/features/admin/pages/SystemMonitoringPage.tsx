import {
  Server,
  Database,
  Activity,
  AlertCircle,
  Cpu,
  Layers,
  Terminal,
  RefreshCw,
  Clock,
  Wifi,
  HardDrive,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Button } from '../../../shared/components/ui/Button';
import {
  Card,
  CardContent,
  CardHeader,
} from '../../../shared/components/ui/Card';
import ComingSoonBanner from '../../../shared/components/ui/ComingSoonBanner';
import { useToast } from '../../../shared/components/ui/Toast';

export default function SystemMonitoringPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const generateLogs = () => {
    const actions = [
      'GET /api/admin/analytics/owner-dashboard 200 OK - 45ms',
      'POST /api/inventory/purchase-orders 201 Created - 120ms',
      'PATCH /api/orders/status 200 OK - 60ms',
      'POST /api/auth/login 200 OK - 85ms',
      'GET /api/catalog/products 200 OK - 30ms',
      'Prisma client connected to public schema - neon-db',
      'MongoDB analytics event stream dispatched - pos_cart_activity',
      'Upstash Redis socket connection initialized successfully',
      'Garbage collector triggered - 14.2MB heap reclaimed',
    ];
    const newLogs = [];
    for (let i = 0; i < 5; i++) {
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      newLogs.push(
        `[${new Date(Date.now() - i * 60000).toLocaleTimeString()}] System: ${randomAction}`
      );
    }
    setLogs(newLogs);
  };

  const fetchHealth = () => {
    setLoading(true);
    setTimeout(() => {
      setHealth({
        api: 'OPERATIONAL',
        database: 'CONNECTED',
        uptime: '99.998%',
        lastDeploy: 'June 09, 2026',
        redis: 'HEALTHY',
        cpuUsage: '14.2%',
        memoryUsage: '342MB / 1024MB',
        latency: '34ms',
        activeConnections: '24',
      });
      generateLogs();
      setLoading(false);
      toast.success('System health registers synchronized.');
    }, 400);
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="space-y-8 p-6 text-[#F8FAFC] bg-[#0F172A] min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20">
              <Server size={18} />
            </span>
            <h1 className="text-4xl font-bold font-display tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Systems Control Room
            </h1>
          </div>
          <p className="text-slate-400 text-sm mt-1 ml-9">
            NOC environment monitoring, database query latencies, CPU core
            loads, and real-time execution log streams.
          </p>
        </div>
        <Button
          onClick={fetchHealth}
          variant="outline"
          disabled={loading}
          className="flex items-center gap-2 border-slate-800 bg-[#111827] text-slate-100 hover:bg-slate-800 text-xs px-4 py-2"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />{' '}
          Synchronize Telemetry
        </Button>
      </div>

      {/* Coming Soon Banner */}
      <ComingSoonBanner featureName="System Monitoring" />

      {/* Primary Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#111827] border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Activity className="text-[#16A34A] w-4 h-4" />
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">
              REST API Gateway
            </h3>
          </CardHeader>
          <CardContent className="mt-2">
            <p className="text-2xl font-extrabold text-[#16A34A] font-display">
              {health?.api || 'CHECKING...'}
            </p>
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
              <div>
                <span className="text-[10px] text-slate-500 block">
                  Gateway Latency
                </span>
                <span className="font-bold text-slate-200 mt-0.5 block">
                  {health?.latency}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">
                  Service Uptime
                </span>
                <span className="font-bold text-slate-200 mt-0.5 block">
                  {health?.uptime}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-bl-full pointer-events-none" />
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Database className="text-[#2563EB] w-4 h-4" />
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">
              Neon PG & MongoDB
            </h3>
          </CardHeader>
          <CardContent className="mt-2">
            <p className="text-2xl font-extrabold text-[#16A34A] font-display">
              {health?.database || 'CHECKING...'}
            </p>
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
              <div>
                <span className="text-[10px] text-slate-500 block">
                  Active Pools
                </span>
                <span className="font-bold text-slate-200 mt-0.5 block">
                  {health?.activeConnections} Sessions
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">
                  Read/Write Uptime
                </span>
                <span className="font-bold text-slate-200 mt-0.5 block">
                  100% Operational
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/5 rounded-bl-full pointer-events-none" />
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <AlertCircle className="text-[#06B6D4] w-4 h-4" />
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">
              Upstash Redis Stream
            </h3>
          </CardHeader>
          <CardContent className="mt-2">
            <p className="text-2xl font-extrabold text-[#16A34A] font-display">
              {health?.redis || 'CHECKING...'}
            </p>
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
              <div>
                <span className="text-[10px] text-slate-500 block">
                  Websocket Pipeline
                </span>
                <span className="font-bold text-slate-200 mt-0.5 block">
                  Active Hook
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">
                  Queue Capacity
                </span>
                <span className="font-bold text-slate-200 mt-0.5 block">
                  0 Pending Tasks
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Hardware & Resource Loads (left) */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-[#111827] border-slate-800 shadow-xl p-6">
            <h3 className="text-base font-bold font-display text-white mb-4">
              Core Virtual Machine Health
            </h3>

            <div className="space-y-4 font-sans text-xs">
              <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-slate-450">
                  <span className="flex items-center gap-1.5">
                    <Cpu size={13} /> CPU Load Allocation
                  </span>
                  <span className="font-bold text-white">
                    {health?.cpuUsage}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: '14.2%' }}
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-slate-450">
                  <span className="flex items-center gap-1.5">
                    <HardDrive size={13} /> RAM Usage
                  </span>
                  <span className="font-bold text-white">
                    {health?.memoryUsage}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: '33.4%' }}
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-slate-450">
                  <span className="flex items-center gap-1.5">
                    <Wifi size={13} /> Network Node
                  </span>
                  <span className="font-bold text-[#16A34A]">ONLINE</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                  <span>Data Inbound: 1.2MB/s</span>
                  <span>Data Outbound: 0.8MB/s</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-[#111827] border-slate-800 shadow-xl p-6 space-y-3">
            <h3 className="text-base font-bold font-display text-white">
              Environment Configuration
            </h3>
            <div className="space-y-2 text-xs font-mono text-slate-350">
              <div className="flex justify-between py-1 border-b border-slate-850">
                <span className="text-slate-500">NODE_ENV:</span>
                <span className="text-slate-200">production</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-850">
                <span className="text-slate-500">PORT:</span>
                <span className="text-slate-200">5000</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-850">
                <span className="text-slate-500">PRISMA_ENGINE:</span>
                <span className="text-slate-200">library</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">LAST_BUILD:</span>
                <span className="text-slate-200">{health?.lastDeploy}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Live System Log stream (right) */}
        <div className="lg:col-span-2">
          <Card className="bg-[#111827] border-slate-800 shadow-xl p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Terminal size={16} className="text-[#2563EB]" />
                  <h3 className="text-base font-bold font-display text-white">
                    Event Log Stream
                  </h3>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold bg-slate-950 px-2 py-0.5 rounded-full border border-slate-850">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-ping" />
                  Live Listener
                </span>
              </div>

              <div className="mt-5 space-y-3 font-mono text-[11px] bg-slate-950 p-4 rounded-xl border border-slate-900 max-h-[300px] overflow-y-auto text-slate-300">
                {logs.map((log, idx) => (
                  <div
                    key={idx}
                    className="hover:bg-slate-900/40 py-1 px-1.5 rounded transition-colors break-words"
                  >
                    {log}
                  </div>
                ))}
                {logs.length === 0 && (
                  <p className="text-slate-500 text-center py-12 italic">
                    Log stream currently empty.
                  </p>
                )}
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800 flex justify-between items-center">
              <span className="text-[10px] text-slate-500">
                Logs synchronized continuously via Websocket.
              </span>
              <Button
                onClick={() => {
                  generateLogs();
                  toast.success('Logs flushed and repopulated.');
                }}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs px-3 py-1.5 text-slate-350"
              >
                Clear Buffer
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
