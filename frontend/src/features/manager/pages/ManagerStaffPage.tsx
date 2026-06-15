import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Clock,
  Star,
  ShieldCheck,
  Search,
  CheckCircle,
  XCircle,
  MoreVertical,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '../../../app/store';
import apiClient from '../../../services/apiClient';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';
import { fetchAllStaff } from '../../admin/store/staffSlice';

export default function ManagerStaffPage() {
  const dispatch = useAppDispatch();
  const { list: staffList, status } = useAppSelector((state) => state.staff);

  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

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
    dispatch(fetchAllStaff());
  }, [dispatch]);

  // Client-side filtering for demonstration.
  // Ideally, the backend should only return staff for `selectedBranchId`.
  const filteredStaff = staffList.filter((s: any) => {
    // Assuming staff object has branchId or organizationId linking to branch.
    // If not, we just show staff related to the search for now.
    const nameMatch = `${s.firstName} ${s.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const emailMatch = s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const roleMatch = s.role.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || emailMatch || roleMatch;
  });

  const getRoleBadge = (role: string) => {
    if (role.includes('MANAGER')) return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    if (role.includes('KITCHEN') || role.includes('CHEF'))
      return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
    if (role.includes('DELIVERY')) return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold font-display text-white tracking-tight">
            Staff Roster
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage branch employees, track attendance and performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-border/30 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-900 border border-border/30 rounded-xl px-4 py-2">
            <span className="text-slate-400 text-xs">Branch:</span>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-200 focus:outline-none cursor-pointer appearance-none"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
        {status === 'loading' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-40 bg-slate-900/50 animate-pulse rounded-2xl border border-border/10"
              />
            ))}
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-slate-900/40 rounded-2xl border border-border/20 text-slate-500">
            <Users size={48} className="mb-4 opacity-50 text-slate-600" />
            <p className="text-sm font-semibold">No staff found matching criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {filteredStaff.map((staff: any, idx: number) => (
                <motion.div
                  key={staff.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-border/20 p-5 shadow-lg flex flex-col group hover:border-indigo-500/40 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                        <span className="text-sm font-bold text-slate-300">
                          {staff.firstName[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white tracking-wide truncate max-w-[120px]">
                          {staff.firstName} {staff.lastName}
                        </h3>
                        <Badge
                          className={`mt-1 text-[9px] px-1.5 py-0 border ${getRoleBadge(staff.role)}`}
                        >
                          {staff.role.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <button className="text-slate-500 hover:text-slate-300">
                      <MoreVertical size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-slate-950/50 rounded-xl border border-border/10">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                        Attendance
                      </p>
                      <p className="text-sm text-slate-200 flex items-center gap-1 font-mono">
                        <Clock size={12} className="text-emerald-500" />
                        {staff.attendanceCount || 0} / 30
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                        Rating
                      </p>
                      <p className="text-sm text-slate-200 flex items-center gap-1 font-mono">
                        <Star size={12} className="text-amber-500" />
                        {staff.performanceScore || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto pt-3 border-t border-border/10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      {staff.isActive ? (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <CheckCircle size={12} /> Active Shift
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-500">
                          <XCircle size={12} /> Off Duty
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[10px] h-7 px-3 border-border/20 bg-slate-900 hover:bg-slate-800 text-slate-300"
                    >
                      View Profile
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
