import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../../app/store';
import { selectBranch } from '../store/customerSlice';
import SEO from '../../../shared/components/SEO';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import Card, { CardContent } from '../../../shared/components/ui/Card';
import Badge from '../../../shared/components/ui/Badge';
import { useToast } from '../../../shared/components/ui/Toast';
import {
  MapPin,
  Phone,
  Clock,
  Search,
  Compass,
  ChevronRight,
  Navigation
} from 'lucide-react';
import mockBranches, { Branch } from '../../../shared/data/branches';

export const BranchesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { selectedBranch } = useAppSelector((state) => state.customer);

  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [branches, setBranches] = useState<Branch[]>(mockBranches);
  const [isDetecting, setIsDetecting] = useState(false);
  const [activeBranchDetail, setActiveBranchDetail] = useState<Branch | null>(selectedBranch || mockBranches[0]);

  // Extract unique cities
  const cities = ['All', ...Array.from(new Set(mockBranches.map((b) => b.city)))];

  // Calculate distance in miles using basic Pythagorean approximation for Manhattan/Jersey City scale
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const p = 0.017453292519943295; // Math.PI / 180
    const c = Math.cos;
    const a = 0.5 - c((lat2 - lat1) * p)/2 + 
            c(lat1 * p) * c(lat2 * p) * 
            (1 - c((lon2 - lon1) * p))/2;
    const km = 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
    return km * 0.621371; // Return miles
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

        // Update branch distances based on location
        const updated = mockBranches.map((b) => {
          const dist = calculateDistance(latitude, longitude, b.coords.lat, b.coords.lng);
          return {
            ...b,
            distance: parseFloat(dist.toFixed(1)),
          };
        }).sort((a, b) => (a.distance || 0) - (b.distance || 0));

        setBranches(updated);
        setIsDetecting(false);
        toast.success('Successfully detected location. Outposts sorted by distance.');
      },
      (_error) => {
        setIsDetecting(false);
        toast.error('Failed to retrieve location. Check browser permissions.');
      }
    );
  };

  // Filter outposts
  const filteredBranches = branches.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = cityFilter === 'All' || b.city === cityFilter;
    return matchesSearch && matchesCity;
  });

  const handleSelectBranch = (branch: Branch) => {
    dispatch(selectBranch(branch));
    toast.success(`Active outpost set to: ${branch.name}`);
  };

  return (
    <>
      <SEO
        title="Find Outposts & Kitchen Branches"
        description="Search active Oven Xpress restaurant branches, check store hours, compute closest location metrics, and set your current dining outpost."
        keywords="Oven Xpress branches, pizza locations near me, outpost tracking map, smart kitchen locations"
      />

      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16 space-y-10">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border/40 pb-8">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight text-white">Select Dispatch Outpost</h1>
            <p className="text-muted-foreground text-sm font-sans max-w-lg">
              Set your target location to access local fire-baked pizza and gourmet burger menus.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            isLoading={isDetecting}
            onClick={handleDetectLocation}
            className="border-border/60 text-white flex items-center gap-1.5 hover:bg-secondary/40 font-semibold text-xs"
          >
            <Compass size={14} className="animate-spin-slow" />
            <span>Detect Closest Branch</span>
          </Button>
        </div>

        {/* Filters bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:flex-grow">
            <Input
              type="text"
              placeholder="Search branch name, street address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefixIcon={<Search size={16} />}
              className="bg-card border-border/80 text-xs py-2.5 text-white"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setCityFilter(city)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg font-display transition-colors border select-none ${
                  cityFilter === city
                    ? 'bg-primary text-white border-primary shadow-sm shadow-primary/10'
                    : 'bg-card border-border/60 text-muted-foreground hover:text-white hover:bg-secondary/40'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Master-Detail Split Pane */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Branches list */}
          <div className="lg:col-span-7 space-y-4">
            {filteredBranches.length === 0 ? (
              <div className="text-center py-16 bg-card/45 border border-border/40 rounded-xl space-y-4">
                <MapPin className="mx-auto text-muted-foreground/60" size={36} />
                <p className="text-muted-foreground text-sm font-sans">No outposts found matching your filter criteria.</p>
              </div>
            ) : (
              filteredBranches.map((branch) => {
                const isActiveSelection = selectedBranch?.id === branch.id;
                const isFocused = activeBranchDetail?.id === branch.id;

                return (
                  <Card
                    key={branch.id}
                    className={`bg-card/45 border transition-all duration-200 cursor-pointer ${
                      isFocused ? 'border-primary/50 bg-card/85 shadow-md' : 'border-border/60 hover:border-border'
                    }`}
                    onClick={() => setActiveBranchDetail(branch)}
                  >
                    <CardContent className="p-5 flex items-start justify-between gap-4 select-none">
                      <div className="space-y-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display font-bold text-sm md:text-base text-white tracking-tight leading-tight">
                            {branch.name}
                          </h3>
                          {isActiveSelection && (
                            <Badge variant="success" className="text-[9px] uppercase px-2 py-0.5 font-bold tracking-wider">
                              Active Outpost
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed font-sans">{branch.address}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground font-sans">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {branch.openingHours}
                          </span>
                          {branch.distance !== undefined && (
                            <span className="flex items-center gap-1 text-primary">
                              <Navigation size={10} />
                              {branch.distance} miles away
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between h-full gap-6">
                        <Button
                          variant={isActiveSelection ? 'success' : 'outline'}
                          size="xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectBranch(branch);
                          }}
                          className="font-bold text-[10px] uppercase shadow-sm tracking-wider"
                        >
                          {isActiveSelection ? 'Active' : 'Select'}
                        </Button>
                        <ChevronRight size={16} className="text-muted-foreground/50" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Branch detail view / placeholder */}
          <div className="lg:col-span-5 sticky top-24">
            {activeBranchDetail ? (
              <div className="glass-panel p-6 rounded-2xl border border-border/80 bg-card/90 shadow-xl space-y-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary font-display">Branch Details</span>
                  <h2 className="font-display font-extrabold text-lg text-white leading-tight">{activeBranchDetail.name}</h2>
                  <p className="text-xs text-muted-foreground leading-relaxed font-sans">{activeBranchDetail.address}</p>
                </div>

                <div className="border-t border-border/40 pt-4 space-y-3.5 text-xs font-sans">
                  <div className="flex items-center gap-2 text-foreground/80">
                    <Clock size={14} className="text-primary flex-shrink-0" />
                    <span>Open Daily: {activeBranchDetail.openingHours}</span>
                  </div>

                  <div className="flex items-center gap-2 text-foreground/80">
                    <Phone size={14} className="text-primary flex-shrink-0" />
                    <span>Hotline: {activeBranchDetail.phone}</span>
                  </div>
                </div>

                {/* Map/Integration Mock */}
                <div className="aspect-video rounded-xl bg-secondary/85 border border-border/80 flex flex-col items-center justify-center p-4 text-center text-muted-foreground space-y-2 relative overflow-hidden select-none">
                  {/* Decorative background grid map simulation */}
                  <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
                  <MapPin size={28} className="text-primary z-10 animate-bounce" />
                  <span className="text-xs font-bold text-white z-10">Smart Map Interface</span>
                  <span className="text-[10px] text-muted-foreground/80 max-w-xs z-10 font-sans">
                    GPS Coordinates: {activeBranchDetail.coords.lat}, {activeBranchDetail.coords.lng}
                  </span>
                </div>

                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full text-xs font-bold shadow-md"
                    onClick={() => handleSelectBranch(activeBranchDetail)}
                  >
                    Set as Selected Delivery Outpost
                  </Button>
                </div>
              </div>
            ) : (
              <div className="glass-panel p-6 rounded-2xl border border-border/80 bg-card/90 shadow-xl text-center text-muted-foreground py-16">
                <MapPin className="mx-auto mb-2 text-muted-foreground/50" size={32} />
                <p className="text-xs font-sans">Select a dispatch outpost from the list to view operations detail.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default BranchesPage;
