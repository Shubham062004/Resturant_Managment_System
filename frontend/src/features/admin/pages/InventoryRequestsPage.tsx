import React, { useEffect, useState } from 'react';
import { Card, CardHeader } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Box, Check, X, Eye, Package, Truck, CheckCircle2 } from 'lucide-react';
import apiClient from '../../../services/apiClient';
import { useToast } from '../../../shared/components/ui/Toast';


interface InventoryRequestItem {
  id: string;
  ingredient: { name: string; unit: string };
  requestedQuantity: number;
  approvedQuantity: number | null;
}

interface InventoryRequest {
  id: string;
  branch: { name: string };
  requestedBy: { firstName: string; lastName: string };
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PACKED' | 'DISPATCHED' | 'DELIVERED';
  notes: string;
  createdAt: string;
  items: InventoryRequestItem[];
}

export default function InventoryRequestsPage() {
  const toast = useToast();
  const [requests, setRequests] = useState<InventoryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<InventoryRequest | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/inventory/requests');
      setRequests(res.data.data || []);
    } catch (err: any) {
      toast.error('Failed to load inventory requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await apiClient.patch(`/inventory/requests/${id}/approve`, { status });
      toast.success(`Request ${status.toLowerCase()}`);
      setSelectedRequest(null);
      loadRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Error processing request');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await apiClient.patch(`/inventory/requests/${id}/status`, { status });
      toast.success(`Status updated to ${status}`);
      loadRequests();
    } catch (err: any) {
      toast.error('Failed to update status');
    }
  };

  const totalPages = Math.ceil(requests.length / itemsPerPage);
  const paginatedRequests = requests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusBadge = (status: string) => {
    const styles: any = {
      PENDING: 'bg-amber-900/40 text-amber-400 border-amber-800',
      APPROVED: 'bg-emerald-900/40 text-emerald-400 border-emerald-800',
      REJECTED: 'bg-rose-900/40 text-rose-400 border-rose-800',
      PACKED: 'bg-blue-900/40 text-blue-400 border-blue-800',
      DISPATCHED: 'bg-purple-900/40 text-purple-400 border-purple-800',
      DELIVERED: 'bg-slate-800 text-slate-300 border-slate-700',
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-8 p-6 text-[#F8FAFC] bg-[#0F172A] min-h-screen font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-display tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Inventory Requests
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage branch stock replenishment requests and track dispatch status.
          </p>
        </div>
      </div>

      <Card className="bg-[#111827] border-slate-800/80 shadow-2xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-900/50 border-b border-slate-800/80 px-6 py-5">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Box size={18} className="text-indigo-400" />
              All Requests
            </h2>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-800/80 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Branch</th>
                <th className="px-6 py-4 font-medium">Requested By</th>
                <th className="px-6 py-4 font-medium">Items</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {paginatedRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    {loading ? 'Loading requests...' : 'No inventory requests found.'}
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                      {new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(req.createdAt))}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-200">
                      {req.branch.name}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {req.requestedBy.firstName} {req.requestedBy.lastName}
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-mono">
                      {req.items.length} items
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => setSelectedRequest(req)}
                          size="sm"
                          className="bg-slate-800 hover:bg-slate-700 text-white"
                        >
                          <Eye size={14} className="mr-2" />
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {requests.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/50">
            <div className="flex items-center text-sm text-slate-400">
              <span className="mr-3">Showing</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="ml-3">
                out of <strong className="text-white">{requests.length}</strong> entries
              </span>
            </div>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50"
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-8 h-8 rounded-lg border text-sm font-medium ${
                    currentPage === idx + 1
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50"
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
              <h2 className="text-xl font-bold font-display">Request Details</h2>
              <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                  <p className="text-slate-500">Branch</p>
                  <p className="font-semibold text-lg">{selectedRequest.branch.name}</p>
                </div>
                <div>
                  <p className="text-slate-500">Date</p>
                  <p className="font-semibold text-lg">{new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(selectedRequest.createdAt))}</p>
                </div>
                <div>
                  <p className="text-slate-500">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
                <div>
                  <p className="text-slate-500">Requested By</p>
                  <p className="font-medium text-slate-300">
                    {selectedRequest.requestedBy.firstName} {selectedRequest.requestedBy.lastName}
                  </p>
                </div>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden mb-6">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-4 py-3 text-slate-400 font-medium">Ingredient</th>
                      <th className="px-4 py-3 text-slate-400 font-medium text-right">Requested Qty</th>
                      <th className="px-4 py-3 text-slate-400 font-medium text-right">Approved Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {selectedRequest.items.map(item => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 font-medium">{item.ingredient.name}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-300">{item.requestedQuantity} {item.ingredient.unit}</td>
                        <td className="px-4 py-3 text-right font-mono text-emerald-400">
                          {item.approvedQuantity !== null ? item.approvedQuantity : '-'} {item.ingredient.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedRequest.notes && (
                <div className="mb-6 bg-slate-900/30 p-4 rounded-xl border border-slate-800">
                  <p className="text-slate-400 text-xs uppercase font-semibold mb-1">Notes</p>
                  <p className="text-slate-300 text-sm">{selectedRequest.notes}</p>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
                {selectedRequest.status === 'PENDING' && (
                  <>
                    <Button onClick={() => handleApprove(selectedRequest.id, 'REJECTED')} variant="outline" className="text-rose-400 border-rose-900/50 hover:bg-rose-950/40">
                      <X size={16} className="mr-2" /> Reject
                    </Button>
                    <Button onClick={() => handleApprove(selectedRequest.id, 'APPROVED')} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                      <Check size={16} className="mr-2" /> Approve Request
                    </Button>
                  </>
                )}
                {selectedRequest.status === 'APPROVED' && (
                  <Button onClick={() => handleUpdateStatus(selectedRequest.id, 'PACKED')} className="bg-blue-600 hover:bg-blue-500">
                    <Package size={16} className="mr-2" /> Mark as Packed
                  </Button>
                )}
                {selectedRequest.status === 'PACKED' && (
                  <Button onClick={() => handleUpdateStatus(selectedRequest.id, 'DISPATCHED')} className="bg-purple-600 hover:bg-purple-500">
                    <Truck size={16} className="mr-2" /> Mark as Dispatched
                  </Button>
                )}
                {selectedRequest.status === 'DISPATCHED' && (
                  <Button onClick={() => handleUpdateStatus(selectedRequest.id, 'DELIVERED')} className="bg-slate-700 hover:bg-slate-600 text-white">
                    <CheckCircle2 size={16} className="mr-2" /> Confirm Delivery
                  </Button>
                )}
                <Button onClick={() => setSelectedRequest(null)} variant="outline" className="border-slate-700 text-slate-300">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
