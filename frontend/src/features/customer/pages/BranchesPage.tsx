import React, { useState, useEffect, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../../../app/store';
import { selectBranch } from '../store/customerSlice';
import SEO from '../../../shared/components/SEO';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { useToast } from '../../../shared/components/ui/Toast';
import BranchCard from '../components/BranchCard';
import SkeletonCard from '../../../shared/components/ui/SkeletonCard';
import { MapPin, Search, Compass, Navigation, Clock, Phone } from 'lucide-react';
import { Branch } from '../../../shared/data/branches';
import { useBranches } from '../store/catalogQueries';

export const BranchesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { selectedBranch } = useAppSelector((state) => state.customer);

  const { data: branchesResponse, isLoading } = useBranches({ page: 1, limit: 100 });
  const apiBranches = branchesResponse?.data ?? [];

  const mappedBranches: Branch[] = apiBranches.map((b) => ({
    id: b.id,
    name: b.name,
    address: b.address,
    city: b.city,
    coords: { lat: b.latitude, lng: b.longitude },
    openingHours: `${b.openingTime} - ${b.closingTime}`,
    phone: '',
    active: b.isActive,
    distance: undefined,
  }));

  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [isDetecting, setIsDetecting] = useState(false);
  const [activeBranchDetail, setActiveBranchDetail] = useState<Branch | null>(null);
  const [branchesWithDistance, setBranchesWithDistance] = useState<Branch[]>([]);

  const cities = ['All', ...Array.from(new Set(mappedBranches.map((b) => b.city)))];

  useEffect(() => {
    setBranchesWithDistance(mappedBranches);
  }, [apiBranches.length]);

  const filteredBranches = useMemo(() => {
    const source = branchesWithDistance.length ? branchesWithDistance : mappedBranches;
    return source.filter((branch) => {
      const matchesSearch =
        !searchTerm ||
        branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = cityFilter === 'All' || branch.city === cityFilter;
      return matchesSearch && matchesCity;
    });
  }, [branchesWithDistance, mappedBranches, searchTerm, cityFilter]);

  useEffect(() => {
    if (!activeBranchDetail && filteredBranches.length > 0) {
      setActiveBranchDetail(selectedBranch || filteredBranches[0]);
    }
  }, [filteredBranches, selectedBranch, activeBranchDetail]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const p = 0.017453292519943295;
    const c = Math.cos;
    const a =
      0.5 - c((lat2 - lat1) * p) / 2 + (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;
    const km = 12742 * Math.asin(Math.sqrt(a));
    return km * 0.621371;
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const updated = mappedBranches
          .map((b) => ({
            ...b,
            distance: parseFloat(calculateDistance(latitude, longitude, b.coords.lat, b.coords.lng).toFixed(1)),
          }))
          .sort((a, b) => (a.distance || 0) - (b.distance || 0));

        setBranchesWithDistance(updated);
        setIsDetecting(false);
        toast.success('Location detected! Showing nearest branches first.');

        // Auto-select nearest branch
        if (updated.length > 0 && !selectedBranch) {
          dispatch(selectBranch(updated[0]));
          setActiveBranchDetail(updated[0]);
        }
      },
      () => {
        setIsDetecting(false);
        toast.error('Failed to get location. Please check browser permissions.');
      },
    );
  };

  const handleSelectBranch = (branch: Branch) => {
    dispatch(selectBranch(branch));
    toast.success(`Delivering from: ${branch.name}`);
  };

  const nearestBranch = branchesWithDistance.find((b) => b.distance !== undefined);

  return (
    <>
      <SEO
        title="Find Your Nearest Branch — ABC Restaurant"
        description="Select your nearest ABC restaurant branch for the fastest delivery. Auto-detect your location or browse all available branches."
        keywords="ABC branches, restaurant near me, food delivery location, nearest restaurant"
      />

      <div className="min-h-screen bg-[#08070F] pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6 space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b border-white/5">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Find Your Nearest Branch
              </h1>
              <p className="text-neutral-400 text-sm">
                Select a branch to browse its menu and get fast delivery
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              isLoading={isDetecting}
              onClick={handleDetectLocation}
              className="flex items-center gap-2 shadow-lg shadow-primary/20 font-semibold"
            >
              <Compass size={16} className={isDetecting ? 'animate-spin' : ''} />
              <span>Detect My Location</span>
            </Button>
          </div>

          {/* Nearest branch highlight */}
          {nearestBranch && nearestBranch.distance !== undefined && (
            <div className="rounded-2xl bg-gradient-to-r from-primary/10 to-emerald-500/5 border border-primary/20 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Navigation size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-white font-semibold">{nearestBranch.name}</p>
                  <p className="text-neutral-400 text-xs">
                    {nearestBranch.distance} mi away · ~{Math.max(15, Math.round(nearestBranch.distance * 8))} min delivery
                  </p>
                </div>
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-emerald-500/20">
                Nearest to you
              </span>
            </div>
          )}

          {/* Search & City filter */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative w-full sm:flex-grow">
              <Input
                type="text"
                placeholder="Search by branch name or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                prefixIcon={<Search size={16} />}
                className="bg-white/[0.04] border-white/10 text-sm text-white"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto w-full sm:w-auto scrollbar-hide">
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => setCityFilter(city)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all border whitespace-nowrap select-none ${
                    cityFilter === city
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/10'
                      : 'bg-white/[0.03] border-white/[0.06] text-neutral-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Branch list + detail split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Branch list */}
            <div className="lg:col-span-7 space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <SkeletonCard key={i} variant="branch" />
                  ))}
                </div>
              ) : filteredBranches.length === 0 ? (
                <div className="text-center py-20 rounded-2xl border border-white/5 bg-white/[0.02]">
                  <MapPin className="mx-auto text-neutral-600 mb-3" size={40} />
                  <p className="text-white font-semibold mb-1">No branches found</p>
                  <p className="text-neutral-500 text-sm">Try a different search or city filter</p>
                </div>
              ) : (
                filteredBranches.map((branch) => (
                  <BranchCard
                    key={branch.id}
                    branch={branch}
                    isSelected={selectedBranch?.id === branch.id}
                    isFocused={activeBranchDetail?.id === branch.id}
                    onSelect={handleSelectBranch}
                    onFocus={setActiveBranchDetail}
                  />
                ))
              )}
            </div>

            {/* Detail panel */}
            <div className="lg:col-span-5 sticky top-24">
              {activeBranchDetail ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl space-y-5">
                  <div>
                    <span className="text-primary text-[10px] font-bold uppercase tracking-widest">Branch Details</span>
                    <h2 className="text-xl font-bold text-white mt-1">{activeBranchDetail.name}</h2>
                    <p className="text-sm text-neutral-400 mt-1">{activeBranchDetail.address}</p>
                  </div>

                  <div className="border-t border-white/5 pt-4 space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-neutral-300">
                      <Clock size={16} className="text-primary flex-shrink-0" />
                      <span>{activeBranchDetail.openingHours}</span>
                    </div>
                    {activeBranchDetail.phone && (
                      <div className="flex items-center gap-2 text-neutral-300">
                        <Phone size={16} className="text-primary flex-shrink-0" />
                        <span>{activeBranchDetail.phone}</span>
                      </div>
                    )}
                    {activeBranchDetail.distance !== undefined && (
                      <div className="flex items-center gap-2 text-primary font-medium">
                        <Navigation size={16} className="flex-shrink-0" />
                        <span>{activeBranchDetail.distance} mi away · ~{Math.max(15, Math.round(activeBranchDetail.distance * 8))} min delivery</span>
                      </div>
                    )}
                  </div>

                  {/* Map placeholder */}
                  <div className="aspect-video rounded-xl bg-neutral-900 border border-white/5 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
                    <MapPin size={28} className="text-primary z-10 animate-bounce" />
                    <p className="text-xs text-white font-semibold mt-2 z-10">{activeBranchDetail.name}</p>
                    <p className="text-[10px] text-neutral-500 z-10 mt-1">
                      {activeBranchDetail.coords.lat.toFixed(4)}, {activeBranchDetail.coords.lng.toFixed(4)}
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    className="w-full font-semibold shadow-lg shadow-primary/20"
                    onClick={() => handleSelectBranch(activeBranchDetail)}
                  >
                    {selectedBranch?.id === activeBranchDetail.id ? '✓ Currently Selected' : 'Select This Branch'}
                  </Button>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center">
                  <MapPin className="mx-auto text-neutral-600 mb-3" size={36} />
                  <p className="text-neutral-400 text-sm">Select a branch to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BranchesPage;
