import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { fetchBranchReservations, fetchWaitlist, updateReservationStatus, updateWaitlistStatus, reservationCreated, reservationUpdated, waitlistUpdated } from '../store/reservationSlice';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { io } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ReservationsPage() {
  const dispatch = useAppDispatch();
  const { reservations, waitlist } = useAppSelector((state) => state.reservations);
  // Default branch for testing
  const branchId = 'default-branch-id';

  useEffect(() => {
    dispatch(fetchBranchReservations(branchId));
    dispatch(fetchWaitlist(branchId));

    const socket = io(API_BASE_URL, { withCredentials: true });
    socket.emit('join-branch', branchId);

    socket.on('reservation-created', (data) => dispatch(reservationCreated(data)));
    socket.on('reservation-confirmed', (data) => dispatch(reservationUpdated(data)));
    socket.on('waitlist-updated', (data) => dispatch(waitlistUpdated(data)));

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  const handleCheckIn = (id: string, tableId?: string) => {
    dispatch(updateReservationStatus({ id, status: 'CHECKED_IN', tableId }));
  };

  const handleSeatWaitlist = (id: string) => {
    dispatch(updateWaitlistStatus({ id, status: 'SEATED' }));
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Reservations & Waitlist</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold text-slate-800">Upcoming Reservations</h2>
          {reservations.map((res) => (
            <Card key={res.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-lg">{res.customer?.firstName} {res.customer?.lastName}</p>
                <p className="text-sm text-slate-500">{res.reservationDate} at {res.reservationTime}</p>
                <p className="text-sm text-slate-500">Guests: {res.guestCount}</p>
              </div>
              <div className="text-right">
                <Badge variant={res.status === 'PENDING' ? 'warning' : res.status === 'CONFIRMED' ? 'success' : 'default'} className="mb-2 block">
                  {res.status}
                </Badge>
                {res.status === 'CONFIRMED' && (
                  <Button variant="primary" size="sm" onClick={() => handleCheckIn(res.id)}>Check In</Button>
                )}
              </div>
            </Card>
          ))}
          {reservations.length === 0 && <p className="text-slate-500 italic">No upcoming reservations.</p>}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Waitlist Queue</h2>
          {waitlist.map((entry) => (
            <Card key={entry.id} className="p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold">{entry.customer?.firstName}</p>
                <Badge variant={entry.status === 'WAITING' ? 'warning' : 'success'}>{entry.status}</Badge>
              </div>
              <p className="text-sm text-slate-500">Guests: {entry.guestCount}</p>
              <p className="text-sm text-slate-500">Est. Wait: {entry.estimatedWaitTime} mins</p>
              {entry.status === 'WAITING' && (
                <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => handleSeatWaitlist(entry.id)}>Seat Guest</Button>
              )}
            </Card>
          ))}
          {waitlist.length === 0 && <p className="text-slate-500 italic">Waitlist is empty.</p>}
        </div>
      </div>
    </div>
  );
}
