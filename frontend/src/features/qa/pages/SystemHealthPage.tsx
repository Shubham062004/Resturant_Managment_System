import React from 'react';
import { useAppSelector } from '../../../app/store';
import { ShieldCheck, Activity, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../../shared/components/ui/Card';

export default function SystemHealthPage() {
  const { systemHealth, coverage, lastBuildStatus, testResults } = useAppSelector(state => state.qa);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-3">
        <Activity size={32} className="text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-white">System Health & QA</h1>
          <p className="text-muted-foreground">Test coverage, build status, and monitoring</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-surface/50 border-border/50">
          <CardContent className="p-6">
            <h3 className="text-sm text-muted-foreground font-bold mb-2">System Status</h3>
            <div className="flex items-center gap-2">
              {systemHealth === 'HEALTHY' ? <CheckCircle className="text-success" /> : <AlertTriangle className="text-danger" />}
              <span className={`text-2xl font-bold ${systemHealth === 'HEALTHY' ? 'text-success' : 'text-danger'}`}>
                {systemHealth}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface/50 border-border/50">
          <CardContent className="p-6">
            <h3 className="text-sm text-muted-foreground font-bold mb-2">Build Status</h3>
            <div className="flex items-center gap-2">
              {lastBuildStatus === 'SUCCESS' ? <ShieldCheck className="text-success" /> : <AlertTriangle className="text-danger" />}
              <span className="text-2xl font-bold text-white">{lastBuildStatus}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-surface/50 border-border/50">
          <CardContent className="p-6">
            <h3 className="text-sm text-muted-foreground font-bold mb-2">Test Coverage</h3>
            <span className="text-2xl font-bold text-primary">{coverage.lines}%</span>
            <p className="text-xs text-muted-foreground mt-1">Goal: &gt;90%</p>
          </CardContent>
        </Card>

        <Card className="bg-surface/50 border-border/50">
          <CardContent className="p-6">
            <h3 className="text-sm text-muted-foreground font-bold mb-2">Tests Passed</h3>
            <span className="text-2xl font-bold text-success">{testResults.passed} / {testResults.total}</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
