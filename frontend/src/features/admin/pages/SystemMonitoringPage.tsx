import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '../../../shared/components/ui/Card';
import { Server, Database, Activity, AlertCircle } from 'lucide-react';

export default function SystemMonitoringPage() {
  const [health, setHealth] = useState<any>(null);
  
  useEffect(() => {
    // In a real app, you would fetch this from your backend /api/health endpoint
    const fetchHealth = async () => {
      setHealth({
        api: 'OK',
        database: 'OK',
        uptime: '99.99%',
        lastDeploy: new Date().toLocaleDateString(),
        redis: 'OK'
      });
    };
    fetchHealth();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-3">
        <Server size={32} className="text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-white">System Monitoring</h1>
          <p className="text-muted-foreground">Production environment health status</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-surface/50 border-border/50">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Activity className="text-success" />
            <h3 className="font-bold text-white">API Health</h3>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">{health?.api || 'Checking...'}</p>
            <p className="text-sm text-muted-foreground mt-1">Uptime: {health?.uptime}</p>
          </CardContent>
        </Card>

        <Card className="bg-surface/50 border-border/50">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Database className="text-primary" />
            <h3 className="font-bold text-white">Database Status</h3>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">{health?.database || 'Checking...'}</p>
            <p className="text-sm text-muted-foreground mt-1">Neon Postgres & MongoDB</p>
          </CardContent>
        </Card>
        
        <Card className="bg-surface/50 border-border/50">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <AlertCircle className="text-warning" />
            <h3 className="font-bold text-white">Redis Queue</h3>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">{health?.redis || 'Checking...'}</p>
            <p className="text-sm text-muted-foreground mt-1">Upstash Redis active</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
