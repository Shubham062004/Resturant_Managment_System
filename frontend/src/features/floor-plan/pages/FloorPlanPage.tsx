import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { fetchTables, updateTablePosition, tableUpdated } from '../store/tableSlice';
import { io } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://resturant-managment-system-qkow.onrender.com';

export default function FloorPlanPage() {
  const dispatch = useAppDispatch();
  const { tables } = useAppSelector((state) => state.tables);
  const branchId = 'default-branch-id';

  const [draggedTable, setDraggedTable] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchTables(branchId));

    const socket = io(API_BASE_URL, { withCredentials: true });
    socket.emit('join-branch', branchId);

    socket.on('table-updated', (data) => dispatch(tableUpdated(data)));

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTable(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedTable) return;

    // Simplistic drag handling mapping window coords to relative canvas coords
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - 40; // 40 is roughly half the table width
    const y = e.clientY - rect.top - 40;

    dispatch(updateTablePosition({ id: draggedTable, x, y }));
    setDraggedTable(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Interactive Floor Plan</h1>

      <div
        className="w-full h-[600px] bg-white border border-slate-200 rounded-xl relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {tables.map((table) => (
          <div
            key={table.id}
            draggable
            onDragStart={(e) => handleDragStart(e, table.id)}
            style={{ left: table.x, top: table.y }}
            className={`absolute w-20 h-20 rounded-full flex flex-col items-center justify-center cursor-move shadow-lg border-4 text-sm font-bold transition-colors ${
              table.status === 'AVAILABLE'
                ? 'bg-green-100 border-green-500 text-green-700'
                : table.status === 'OCCUPIED'
                  ? 'bg-red-100 border-red-500 text-red-700'
                  : table.status === 'RESERVED'
                    ? 'bg-orange-100 border-orange-500 text-orange-700'
                    : 'bg-slate-100 border-slate-500 text-slate-700'
            }`}
          >
            <span>T{table.number}</span>
            <span className="text-xs font-normal opacity-70">{table.capacity} pax</span>
          </div>
        ))}
        {tables.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400">
            No tables defined for this branch yet.
          </div>
        )}
      </div>
    </div>
  );
}
