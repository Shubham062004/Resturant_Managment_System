import React from 'react';
import { Card } from '../../../shared/components/ui/Card';
import { MapPin, Navigation } from 'lucide-react';

interface DeliveryTrackingMapProps {
  driverLocation?: { latitude: number; longitude: number };
  destination?: { latitude: number; longitude: number };
}

export const DeliveryTrackingMap: React.FC<DeliveryTrackingMapProps> = ({
  driverLocation,
  destination,
}) => {
  return (
    <Card className="bg-surface/50 border-border/50 p-0 overflow-hidden relative min-h-[300px] flex items-center justify-center">
      {/* Mock Map Background */}
      <div
        className="absolute inset-0 bg-[#1e293b] opacity-80"
        style={{
          backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative z-10 text-center space-y-4">
        <div className="flex items-center justify-center gap-8">
          {driverLocation && (
            <div className="flex flex-col items-center animate-bounce">
              <div className="bg-primary/20 p-3 rounded-full">
                <Navigation className="text-primary w-8 h-8" />
              </div>
              <span className="text-xs text-muted-foreground mt-2 font-semibold">Driver</span>
            </div>
          )}

          {driverLocation && destination && <div className="w-24 h-0.5 bg-dashed bg-border/50" />}

          {destination && (
            <div className="flex flex-col items-center">
              <div className="bg-success/20 p-3 rounded-full">
                <MapPin className="text-success w-8 h-8" />
              </div>
              <span className="text-xs text-muted-foreground mt-2 font-semibold">Destination</span>
            </div>
          )}
        </div>
        {!driverLocation && !destination && (
          <p className="text-muted-foreground text-sm font-medium">GPS Tracking Unavailable</p>
        )}
      </div>
    </Card>
  );
};

export default DeliveryTrackingMap;
