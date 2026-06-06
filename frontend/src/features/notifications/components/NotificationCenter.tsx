import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { fetchNotifications, markNotificationRead, addRealtimeNotification } from '../store/notificationSlice';
import { Bell, X } from 'lucide-react';
import { io } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function NotificationCenter() {
  const dispatch = useAppDispatch();
  const { list, unreadCount } = useAppSelector((state) => state.notifications);
  const { user } = useAppSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    if (!user) return undefined;
    const token = localStorage.getItem('token');
    const newSocket = io(API_BASE_URL, { auth: { token }, withCredentials: true });

    newSocket.on('notification-created', (notification: any) => {
      dispatch(addRealtimeNotification(notification));
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user, dispatch]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleMarkRead = (id: string) => {
    dispatch(markNotificationRead(id));
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-full hover:bg-slate-700 transition"
      >
        <Bell size={24} className="text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-slate-900">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-800 rounded-lg shadow-xl border border-slate-700 z-50 overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-900">
            <h3 className="font-bold text-white">Notifications</h3>
            <button onClick={toggleDropdown} className="text-slate-400 hover:text-white">
              <X size={18} />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {list.length === 0 ? (
              <div className="p-6 text-center text-slate-500">No recent notifications</div>
            ) : (
              list.map((notif: any) => (
                <div
                  key={notif.id}
                  className={`p-4 border-b border-slate-700/50 hover:bg-slate-700 cursor-pointer ${notif.status !== 'READ' ? 'bg-slate-700/30' : ''}`}
                  onClick={() => handleMarkRead(notif.id)}
                >
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-semibold text-white">{notif.title}</span>
                    {notif.status !== 'READ' && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{notif.message}</p>
                </div>
              ))
            )}
          </div>

          <div className="p-2 bg-slate-900 text-center border-t border-slate-700">
            <button className="text-xs text-blue-400 hover:text-blue-300 font-medium">
              View All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
