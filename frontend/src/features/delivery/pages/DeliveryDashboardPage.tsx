import React, { useEffect, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import {
  fetchAssignedOrders,
  acceptOrder,
  pickupOrder,
  deliverOrder,
  fetchEarnings,
  updateLocation,
  socketAssignmentUpdate,
  DeliveryAssignment,
} from '../store/deliverySlice';
import { io } from 'socket.io-client';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { Textarea } from '../../../shared/components/ui/Textarea';
import { Alert } from '../../../shared/components/ui/Alert';
import {
  Package,
  Navigation,
  CheckCircle2,
  DollarSign,
  Camera,
  Activity,
  Award
} from 'lucide-react';
import { DeliveryTrackingMap } from '../components/DeliveryTrackingMap';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function DeliveryDashboardPage() {
  const dispatch = useAppDispatch();
  const { assignments, earnings, status } = useAppSelector((state) => state.delivery);
  const { user } = useAppSelector((state) => state.auth);

  // Local statuses
  const [driverStatus, setDriverStatus] = useState<'ONLINE' | 'BUSY' | 'OFFLINE'>('ONLINE');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Simulated GPS Coordinates
  const [gpsPercent, setGpsPercent] = useState<number>(0);
  const [gpsActive, setGpsActive] = useState<boolean>(false);

  // Proof of delivery states
  const [podNotes, setPodNotes] = useState('');
  const [photoFile, setPhotoFile] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  // Signature drawing canvas references
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    dispatch(fetchAssignedOrders());
    dispatch(fetchEarnings());
  }, [dispatch]);

  // Handle Socket Events
  useEffect(() => {
    if (!user) return undefined;

    const token = localStorage.getItem('token');
    const newSocket = io(API_BASE_URL, { auth: { token }, withCredentials: true });

    newSocket.on('new_assignment', (assignment: DeliveryAssignment) => {
      dispatch(socketAssignmentUpdate(assignment));
      setAlertMsg({ type: 'success', text: `New delivery assignment received: Order #${assignment.order?.orderNumber}` });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user, dispatch]);

  // Simulated Driver Location / GPS Movement Loop
  useEffect(() => {
    if (gpsActive && selectedOrderId) {
      const interval = setInterval(() => {
        setGpsPercent((prev) => {
          const next = prev + 5;
          
          // Calculate incremental coordinates between main kitchen and customer dropoff
          // Center restaurant coordinate: (12.9716, 77.5946)
          // Mock dropoff location: (12.9816, 77.6046)
          const startLat = 12.9716;
          const startLng = 77.5946;
          const endLat = 12.9816;
          const endLng = 77.6046;

          const currentLat = startLat + (endLat - startLat) * (next / 100);
          const currentLng = startLng + (endLng - startLng) * (next / 100);

          // Push location telemetry to backend MongoDB
          dispatch(
            updateLocation({
              orderId: selectedOrderId,
              latitude: currentLat,
              longitude: currentLng,
              heading: 45,
              speed: 35,
            })
          );

          if (next >= 100) {
            setGpsActive(false);
            setAlertMsg({ type: 'success', text: 'You have arrived at the customer location!' });
            return 100;
          }
          return next;
        });
      }, 4000);

      return () => clearInterval(interval);
    }
    return undefined;
  }, [gpsActive, selectedOrderId, dispatch]);

  const handleAction = async (assignment: DeliveryAssignment) => {
    try {
      if (assignment.status === 'ASSIGNED') {
        await dispatch(acceptOrder(assignment.orderId)).unwrap();
        setAlertMsg({ type: 'success', text: 'Order assignment accepted. Proceed to restaurant.' });
        setSelectedOrderId(assignment.orderId);
      } else if (assignment.status === 'ACCEPTED' || assignment.status === 'AT_RESTAURANT') {
        await dispatch(pickupOrder(assignment.orderId)).unwrap();
        setAlertMsg({ type: 'success', text: 'Order picked up. Starting live GPS navigation.' });
        setGpsPercent(0);
        setGpsActive(true);
      }
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.message || 'Action failed.' });
    }
  };

  const handlePhotoUploadSimulation = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress upload bar
    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setPhotoFile('https://images.unsplash.com/photo-1540189549336-e6e99c3679fe'); // valid url format for zod validator
          return 100;
        }
        return p + 20;
      });
    }, 200);
  };

  // Canvas Drawing Methods
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#312e81';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const submitProofAndDeliver = async () => {
    if (!selectedOrderId) return;
    try {
      // Send mock valid HTTP URLs for signature & image to bypass Zod validator constraints
      const proof = {
        imageUrl: photoFile || 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe',
        signatureUrl: 'https://res.cloudinary.com/demo/image/upload/signature.png',
        notes: podNotes || 'Delivered safely.',
      };

      await dispatch(deliverOrder({ orderId: selectedOrderId, proof })).unwrap();
      setAlertMsg({ type: 'success', text: 'Delivery recorded successfully! Earnings balance updated.' });
      
      // Cleanup States
      setSelectedOrderId(null);
      setPodNotes('');
      setPhotoFile(null);
      setGpsPercent(0);
      setGpsActive(false);
      clearCanvas();

      // Refresh Data
      dispatch(fetchAssignedOrders());
      dispatch(fetchEarnings());
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.message || 'Failed to submit proof of delivery.' });
    }
  };

  const getButtonProps = (status: string) => {
    switch (status) {
      case 'ASSIGNED':
        return { label: 'Accept Order', icon: CheckCircle2, variant: 'primary' as const };
      case 'ACCEPTED':
      case 'AT_RESTAURANT':
        return { label: 'Pick Up order', icon: Package, variant: 'outline' as const };
      default:
        return { label: 'Active Delivery', icon: Navigation, variant: 'secondary' as const };
    }
  };

  const activeAssignment = assignments.find((a) => a.orderId === selectedOrderId) || assignments.find((a) => !['DELIVERED', 'FAILED'].includes(a.status));

  // Auto select active order if exists
  useEffect(() => {
    if (activeAssignment && !selectedOrderId) {
      setSelectedOrderId(activeAssignment.orderId);
    }
  }, [activeAssignment, selectedOrderId]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 text-slate-100">
      
      {/* Dashboard Top bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Delivery Command Console</h1>
          <p className="text-slate-400 mt-1">Accept dispatches, track target destinations, and upload proof-of-delivery receipts.</p>
        </div>
        
        {/* Availability Toggle */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-lg gap-2 text-xs">
          <span className="pl-2.5 pr-1 text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-400" /> Driver Status:
          </span>
          {(['ONLINE', 'BUSY', 'OFFLINE'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setDriverStatus(st)}
              className={`px-3 py-1.5 rounded font-extrabold transition uppercase text-[10px] tracking-wider ${
                driverStatus === st
                  ? st === 'ONLINE'
                    ? 'bg-emerald-600 text-white'
                    : st === 'BUSY'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {alertMsg && (
        <div className="relative">
          <Alert
            variant={alertMsg.type === 'success' ? 'success' : 'error'}
            className="mb-2 pr-10"
          >
            {alertMsg.text}
          </Alert>
          <button
            onClick={() => setAlertMsg(null)}
            className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Driver Earnings & Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-slate-800 p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Shift Earnings</span>
            <p className="text-3xl font-extrabold text-white mt-1.5">${(earnings?.totalEarnings || 0).toFixed(2)}</p>
          </div>
          <div className="bg-emerald-500/10 p-3 rounded-full border border-emerald-500/20 text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dispatches Completed</span>
            <p className="text-3xl font-extrabold text-white mt-1.5">{earnings?.history?.length || 0} orders</p>
          </div>
          <div className="bg-indigo-500/10 p-3 rounded-full border border-indigo-500/20 text-indigo-400">
            <Package className="w-6 h-6" />
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ratings Bonus Meter</span>
            <p className="text-3xl font-extrabold text-white mt-1.5">+$15.00 Base</p>
          </div>
          <div className="bg-amber-500/10 p-3 rounded-full border border-amber-500/20 text-amber-400">
            <Award className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Multi-split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Section: Active/Past Assignment Lists */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Active Assignments Queue</h2>
            
            {status === 'loading' && assignments.length === 0 ? (
              <p className="text-slate-400 animate-pulse">Loading cargo dispatches...</p>
            ) : assignments.length === 0 ? (
              <Card className="bg-slate-950/40 border-slate-800 p-12 text-center border-dashed flex flex-col items-center justify-center">
                <Package className="w-12 h-12 text-slate-600 mb-3" />
                <h3 className="text-base font-bold text-white">All Clear! No Active Dispatches</h3>
                <p className="text-xs text-slate-400 mt-1">Waiting for dispatcher auto-assignment...</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {assignments
                  .filter((a) => !['DELIVERED', 'FAILED'].includes(a.status))
                  .map((assignment) => {
                    const btnProps = getButtonProps(assignment.status);
                    const BtnIcon = btnProps.icon;
                    const isSelected = selectedOrderId === assignment.orderId;
                    
                    return (
                      <Card
                        key={assignment.id}
                        onClick={() => setSelectedOrderId(assignment.orderId)}
                        className={`bg-slate-900 border-slate-800 p-5 flex flex-col md:flex-row gap-5 justify-between items-start md:items-center cursor-pointer transition ${
                          isSelected ? 'border-indigo-500 ring-1 ring-indigo-500' : 'hover:border-slate-755'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-extrabold text-white text-base">
                              Order #{assignment.order?.orderNumber || '0000'}
                            </h3>
                            <Badge variant="info" className="text-xs uppercase tracking-wider font-extrabold">
                              {assignment.status.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            <span className="font-semibold text-slate-300">Hub:</span>{' '}
                            {assignment.order?.restaurant?.name || 'ABC Kitchen'}
                          </p>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            <span className="font-semibold text-slate-300">Dropoff Address:</span>{' '}
                            {assignment.order?.address?.addressLine1}, {assignment.order?.address?.city}
                          </p>
                        </div>

                        {assignment.status !== 'PICKED_UP' && assignment.status !== 'OUT_FOR_DELIVERY' ? (
                          <Button
                            variant={btnProps.variant}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAction(assignment);
                            }}
                            className="w-full md:w-auto shrink-0 shadow-lg text-xs font-bold"
                          >
                            <BtnIcon className="w-4 h-4 mr-2" />
                            {btnProps.label}
                          </Button>
                        ) : (
                          <Badge variant="success" className="text-xs font-extrabold uppercase">
                            Out For Delivery (Arriving...)
                          </Badge>
                        )}
                      </Card>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Earnings logs history */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Shift Delivery Log Sheet</h2>
            <Card className="bg-slate-950/40 border-slate-800 p-4">
              <div className="space-y-3">
                {earnings?.history?.map((e: any, idx: number) => (
                  <div key={e.id || idx} className="flex justify-between items-center text-xs font-mono border-b border-slate-850 pb-2 last:border-0 last:pb-0">
                    <div className="space-y-0.5">
                      <div className="text-white font-semibold">Order #{e.order?.orderNumber || '0000'}</div>
                      <div className="text-slate-500 text-[10px]">{new Date(e.createdAt).toLocaleTimeString()}</div>
                    </div>
                    <div className="text-emerald-400 font-bold">+${parseFloat(e.earnings).toFixed(2)}</div>
                  </div>
                ))}
                {(!earnings?.history || earnings.history.length === 0) && (
                  <div className="text-slate-500 text-center py-4 text-xs font-medium">No completed runs recorded in this shift.</div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Right Section: GPS Maps & Proof Of Delivery canvas */}
        <div className="space-y-6">
          
          {/* Navigation Map Panel */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">GPS Cargo Route Tracker</h2>
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-lg">
              <DeliveryTrackingMap
                driverLocation={gpsPercent > 0 ? { latitude: 12.9716 + (12.9816 - 12.9716) * (gpsPercent / 100), longitude: 77.5946 + (77.6046 - 77.5946) * (gpsPercent / 100) } : undefined}
                destination={selectedOrderId ? { latitude: 12.9816, longitude: 77.6046 } : undefined}
              />
              {gpsActive && (
                <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 border border-slate-800 p-3 rounded-lg flex items-center justify-between text-xs z-25 backdrop-blur-sm">
                  <span className="font-semibold text-slate-300 font-mono animate-pulse">Navigating: {gpsPercent}% completed</span>
                  <span className="text-indigo-400 font-bold font-mono">ETA: 4 mins</span>
                </div>
              )}
            </div>
          </div>

          {/* Proof Of Delivery Panel */}
          {selectedOrderId && (assignments.find((a) => a.orderId === selectedOrderId)?.status === 'PICKED_UP' || assignments.find((a) => a.orderId === selectedOrderId)?.status === 'OUT_FOR_DELIVERY') && (
            <Card className="bg-slate-900 border-slate-850 p-5 space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2 uppercase tracking-wider flex items-center gap-2">
                <span>📝</span> Proof Of Delivery (POD)
              </h3>

              <div className="space-y-3">
                {/* Photo Simulation */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Simulate Cargo Photo Upload</label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950 p-4 rounded-lg cursor-pointer transition text-xs text-slate-400">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUploadSimulation}
                        disabled={isUploading}
                      />
                      <Camera className="w-4 h-4 mr-2 text-indigo-400" />
                      {photoFile ? 'Photo Captured ✓' : 'Click to Upload photo'}
                    </label>
                  </div>
                  {isUploading && (
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Uploading snapshot...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1 rounded overflow-hidden">
                        <div className="bg-indigo-500 h-1 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Canvas Signature Pad */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Customer Verification Signature</label>
                  <div className="bg-white rounded-lg p-1.5 border border-slate-800 relative">
                    <canvas
                      ref={canvasRef}
                      width={280}
                      height={120}
                      className="w-full bg-slate-50 rounded cursor-crosshair"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                    <button
                      onClick={clearCanvas}
                      className="absolute bottom-3 right-3 text-[10px] font-bold bg-slate-900 text-white px-2 py-1 rounded border border-slate-750 hover:bg-slate-800 transition"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Receipt Notes</label>
                  <Textarea
                    id="pod-notes"
                    placeholder="E.g. Handed directly to customer at door..."
                    value={podNotes}
                    onChange={(e) => setPodNotes(e.target.value)}
                    className="w-full h-16 bg-slate-950 border-slate-800 text-xs text-slate-100"
                  />
                </div>

                {/* Action button */}
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-lg font-bold text-xs h-10 uppercase tracking-wider mt-2"
                  onClick={submitProofAndDeliver}
                  disabled={isUploading}
                >
                  Confirm Dropoff Receipt
                </Button>
              </div>
            </Card>
          )}

        </div>

      </div>
    </div>
  );
}
