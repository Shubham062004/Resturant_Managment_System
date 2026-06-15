import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarCheck,
  Clock,
  Users,
  Phone,
  MessageSquare,
  CheckCircle,
  XCircle,
  Filter,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '../../../app/store';
import apiClient from '../../../services/apiClient';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';
import { useToast } from '../../../shared/components/ui/Toast';
import {
  fetchBranchReservations,
  updateReservationStatus,
} from '../../reservations/store/reservationSlice';

export default function ManagerReservationsPage() {
  const toast = useToast();
  const dispatch = useAppDispatch();
  const { reservations, status: resStatus } = useAppSelector((state) => state.reservations);

  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<'TODAY' | 'UPCOMING'>('TODAY');

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
    if (selectedBranchId) {
      dispatch(fetchBranchReservations(selectedBranchId));
    }
  }, [selectedBranchId, dispatch]);

  const handleUpdateStatus = (resId: string, status: string) => {
    dispatch(updateReservationStatus({ id: resId, status }))
      .unwrap()
      .then(() => toast.success(`Reservation marked as ${status}`))
      .catch((err) => toast.error(err.message || 'Update failed'));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      case 'CONFIRMED':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'CHECKED_IN':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'CANCELLED':
        return 'bg-rose-500/20 text-rose-500 border-rose-500/30';
      case 'NO_SHOW':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredReservations = reservations
    .filter((res) => {
      const isToday = res.reservationDate === todayStr;
      return dateFilter === 'TODAY' ? isToday : !isToday;
    })
    .sort(
      (a, b) =>
        new Date(`${a.reservationDate}T${a.reservationTime}`).getTime() -
        new Date(`${b.reservationDate}T${b.reservationTime}`).getTime(),
    );

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold font-display text-white tracking-tight">
            Reservations Desk
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage incoming table bookings and guest check-ins.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-900 border border-border/20 rounded-xl p-1">
            <button
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${dateFilter === 'TODAY' ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-200'}`}
              onClick={() => setDateFilter('TODAY')}
            >
              Today
            </button>
            <button
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${dateFilter === 'UPCOMING' ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-200'}`}
              onClick={() => setDateFilter('UPCOMING')}
            >
              Upcoming
            </button>
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

      {/* Main Content Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
        {resStatus === 'loading' ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-slate-900/40 rounded-2xl border border-border/20 text-slate-500">
            <CalendarCheck size={48} className="mb-4 opacity-50 text-slate-600" />
            <p className="text-sm font-semibold">
              No reservations found for {dateFilter.toLowerCase()}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredReservations.map((res: any, idx: number) => (
                <motion.div
                  key={res.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-border/20 p-5 shadow-lg flex flex-col group hover:border-primary/40 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-wide">
                        {res.customer?.firstName} {res.customer?.lastName}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                        <Phone size={12} /> {res.customer?.phone || 'No phone provided'}
                      </p>
                    </div>
                    <Badge
                      className={`text-[10px] font-bold px-2 py-0.5 border ${getStatusBadge(res.status)}`}
                    >
                      {res.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-slate-950/50 rounded-xl border border-border/10">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Time & Date
                      </p>
                      <p className="text-sm text-slate-200 flex items-center gap-1.5 font-medium">
                        <Clock size={14} className="text-primary" />
                        {res.reservationTime}{' '}
                        <span className="text-xs text-slate-500 ml-1">({res.reservationDate})</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Party Size
                      </p>
                      <p className="text-sm text-slate-200 flex items-center gap-1.5 font-medium">
                        <Users size={14} className="text-sky-500" />
                        {res.guestCount} Guests
                      </p>
                    </div>
                  </div>

                  {res.specialRequests && (
                    <div className="mb-4 p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-xs text-indigo-200">
                      <p className="flex items-center gap-1.5 font-semibold text-indigo-300 mb-1">
                        <MessageSquare size={12} /> Special Request:
                      </p>
                      <p>{res.specialRequests}</p>
                    </div>
                  )}

                  <div className="mt-auto pt-4 border-t border-border/10 flex flex-wrap gap-2">
                    {res.status === 'PENDING' && (
                      <>
                        <Button
                          onClick={() => handleUpdateStatus(res.id, 'CONFIRMED')}
                          size="sm"
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 text-xs font-bold"
                        >
                          <CheckCircle size={14} className="inline mr-1" /> Confirm
                        </Button>
                        <Button
                          onClick={() => handleUpdateStatus(res.id, 'CANCELLED')}
                          size="sm"
                          className="flex-1 bg-rose-500/20 text-rose-500 border border-rose-500/30 hover:bg-rose-500/30 py-1.5 text-xs font-bold"
                        >
                          <XCircle size={14} className="inline mr-1" /> Reject
                        </Button>
                      </>
                    )}
                    {res.status === 'CONFIRMED' && (
                      <>
                        <Button
                          onClick={() => handleUpdateStatus(res.id, 'CHECKED_IN')}
                          size="sm"
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 text-xs font-bold"
                        >
                          Check In Guest
                        </Button>
                        <Button
                          onClick={() => handleUpdateStatus(res.id, 'NO_SHOW')}
                          size="sm"
                          className="bg-slate-800 text-slate-400 hover:text-white border border-border/20 py-1.5 text-xs font-bold"
                        >
                          No Show
                        </Button>
                      </>
                    )}
                    {res.status === 'CHECKED_IN' && (
                      <div className="w-full text-center text-xs font-bold text-emerald-500 p-2 bg-emerald-500/10 rounded-lg">
                        Guest is currently seated.
                      </div>
                    )}
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
