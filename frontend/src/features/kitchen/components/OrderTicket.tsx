import { Clock, AlertCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface OrderTicketProps {
  order: any;
  onDragStart: (e: React.DragEvent, orderId: string) => void;
}

export const OrderTicket: React.FC<OrderTicketProps> = ({
  order,
  onDragStart,
}) => {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const start = new Date(order.createdAt).getTime();
      const now = new Date().getTime();
      const diff = Math.floor((now - start) / 1000 / 60); // minutes
      setElapsed(`${diff}m`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [order.createdAt]);

  const priorityColors = {
    LOW: 'bg-green-500/20 text-green-400 border-green-500/50',
    MEDIUM: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    URGENT: 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse',
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, order.id)}
      className={`p-4 rounded-xl border bg-card/80 backdrop-blur-sm cursor-grab active:cursor-grabbing shadow-lg hover:shadow-xl transition-all ${
        priorityColors[order.priority as keyof typeof priorityColors] ||
        priorityColors.MEDIUM
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-white text-lg">
            #{order.order.orderNumber.substring(0, 8)}
          </h3>
          <span className="text-xs uppercase tracking-wider font-semibold opacity-80">
            {order.order.orderType}
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-md">
          <Clock size={14} />
          <span className="text-sm font-bold">{elapsed}</span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {order.tasks.map((task: any) => (
          <div
            key={task.id}
            className="flex justify-between text-sm items-start gap-2"
          >
            <span className="text-white/90">
              <span className="font-bold text-white mr-2">
                {task.quantity}x
              </span>
              {task.product?.name || 'Item'}
            </span>
            {task.notes && (
              <span className="text-xs bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded flex-shrink-0">
                Note
              </span>
            )}
          </div>
        ))}
      </div>

      {order.order.notes && (
        <div className="mt-3 text-xs bg-black/30 p-2 rounded-md flex items-start gap-2 text-white/80">
          <AlertCircle
            size={14}
            className="flex-shrink-0 text-yellow-400 mt-0.5"
          />
          <p>{order.order.notes}</p>
        </div>
      )}
    </div>
  );
};

export default OrderTicket;
