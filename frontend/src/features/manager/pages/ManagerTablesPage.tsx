import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { fetchTables, updateTablePosition, tableUpdated } from '../../floor-plan/store/tableSlice';
import apiClient from '../../../services/apiClient';
import { io } from 'socket.io-client';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { useToast } from '../../../shared/components/ui/Toast';
import { Badge } from '../../../shared/components/ui/Badge';
import { motion } from 'framer-motion';
import { LayoutGrid, Users, Clock, Coffee, AlertTriangle, Filter } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ManagerTablesPage() {
  const toast = useToast();
  const dispatch = useAppDispatch();
  const { tables } = useAppSelector((state) => state.tables);

  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [draggedTable, setDraggedTable] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  useEffect(() => {
    const init = async () => {
      try {
        const res = await apiClient.get('/catalog/branches');
        const b = res.data.data.branches || [];
        setBranches(b);
        if (b.length > 0) setSelectedBranchId(b[0].id);
      } catch (err) {
        console.error('Failed to load branches', err);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!selectedBranchId) return;

    dispatch(fetchTables(selectedBranchId));

    const socket = io(API_BASE_URL, { withCredentials: true });
    socket.emit('join-branch', selectedBranchId);
    socket.on('table-updated', (data) => dispatch(tableUpdated(data)));

    return () => {
      socket.disconnect();
    };
  }, [selectedBranchId, dispatch]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTable(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedTable) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - 40; 
    const y = e.clientY - rect.top - 40;

    dispatch(updateTablePosition({ id: draggedTable, x, y }));
    setDraggedTable(null);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const getTableColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-emerald-500/20 border-emerald-500 text-emerald-400 hover:bg-emerald-500/30';
      case 'OCCUPIED': return 'bg-rose-500/20 border-rose-500 text-rose-400 hover:bg-rose-500/30';
      case 'RESERVED': return 'bg-amber-500/20 border-amber-500 text-amber-400 hover:bg-amber-500/30';
      case 'CLEANING': return 'bg-sky-500/20 border-sky-500 text-sky-400 hover:bg-sky-500/30';
      default: return 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700';
    }
  };

  const handleUpdateStatus = async (tableId: string, status: string) => {
    try {
      await apiClient.patch(`/tables/${tableId}/status`, { status });
      toast.success(`Table status updated to ${status}`);
      dispatch(fetchTables(selectedBranchId)); // Refresh
    } catch (err) {
      toast.error('Failed to update table status');
    }
  };

  const filteredTables = activeFilter === 'ALL' ? tables : tables.filter(t => t.status === activeFilter);

  return (
    <div className="flex flex-col h-full space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold font-display text-white tracking-tight">Floor Plan Manager</h1>
          <p className="text-sm text-slate-400 mt-1">Drag and drop to arrange. Click to manage assignments.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-border/30 rounded-xl px-4 py-2">
            <span className="text-slate-400 text-xs">Branch:</span>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-200 focus:outline-none cursor-pointer appearance-none"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id} className="bg-slate-900 text-white">{b.name}</option>
              ))}
            </select>
          </div>
          <Button onClick={() => dispatch(fetchTables(selectedBranchId))} className="bg-slate-800 hover:bg-slate-700 text-white border border-border/30 rounded-xl h-9">
            Refresh Map
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 flex-1 min-h-[600px]">
        
        {/* Floor Plan Canvas */}
        <div className="xl:col-span-3 flex flex-col bg-slate-900/40 rounded-2xl border border-border/20 overflow-hidden relative">
          
          {/* Top Status Bar */}
          <div className="p-4 border-b border-border/20 bg-slate-900/80 backdrop-blur-md flex items-center justify-between z-10 shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveFilter('ALL')}>
                <div className={`w-3 h-3 rounded-full ${activeFilter === 'ALL' ? 'bg-primary' : 'bg-slate-600'}`} />
                <span className="text-xs font-semibold text-slate-300">All</span>
              </div>
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveFilter('AVAILABLE')}>
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-slate-300">Available</span>
              </div>
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveFilter('OCCUPIED')}>
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-xs font-semibold text-slate-300">Occupied</span>
              </div>
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveFilter('RESERVED')}>
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-xs font-semibold text-slate-300">Reserved</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Filter size={14} /> View: {activeFilter}
            </div>
          </div>

          {/* Interactive Canvas */}
          <div
            className="flex-1 relative bg-[#0f172a] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black overflow-hidden"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {/* Grid Pattern */}
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.2 }} />

            {filteredTables.map((table) => (
              <motion.div
                key={table.id}
                draggable
                onDragStart={(e: any) => handleDragStart(e, table.id)}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ left: table.x, top: table.y }}
                className={`absolute w-20 h-20 rounded-full flex flex-col items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.5)] border-2 text-sm font-bold transition-colors z-20 ${getTableColor(table.status)}`}
              >
                <span className="font-display tracking-widest">{table.number.replace('T-', '')}</span>
                <span className="text-[10px] font-normal mt-0.5 opacity-80 flex items-center gap-1"><Users size={10} /> {table.capacity}</span>
              </motion.div>
            ))}

            {tables.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 z-0">
                <LayoutGrid size={48} className="mb-4 opacity-50" />
                <p>No tables configured for this floor.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Status List */}
        <div className="xl:col-span-1 bg-slate-900/40 rounded-2xl border border-border/20 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border/20 bg-slate-900/80 backdrop-blur-md shrink-0">
            <h3 className="font-bold text-white tracking-wide text-sm">Table List & Actions</h3>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
            {filteredTables.map(table => (
              <Card key={`list-${table.id}`} className="bg-slate-950/60 border-border/10 p-3 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-200">{table.number}</h4>
                    <p className="text-[10px] text-slate-500">Capacity: {table.capacity} Persons</p>
                  </div>
                  <Badge variant={
                    table.status === 'AVAILABLE' ? 'success' :
                    table.status === 'OCCUPIED' ? 'danger' :
                    table.status === 'RESERVED' ? 'warning' : 'neutral'
                  } className="text-[9px]">
                    {table.status}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-border/5">
                  {table.status === 'AVAILABLE' && (
                    <Button onClick={() => handleUpdateStatus(table.id, 'OCCUPIED')} size="sm" className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] h-7">
                      Seat Guest
                    </Button>
                  )}
                  {table.status === 'OCCUPIED' && (
                    <Button onClick={() => handleUpdateStatus(table.id, 'CLEANING')} size="sm" className="flex-1 bg-sky-600/20 text-sky-400 hover:bg-sky-600/30 border border-sky-500/30 text-[10px] h-7">
                      Mark Cleaning
                    </Button>
                  )}
                  {table.status === 'CLEANING' && (
                    <Button onClick={() => handleUpdateStatus(table.id, 'AVAILABLE')} size="sm" className="flex-1 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 text-[10px] h-7">
                      Cleaned & Ready
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
