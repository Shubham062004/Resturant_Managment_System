export interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  distance?: number; // in miles (for location matching simulation)
  coords: { lat: number; lng: number };
  openingHours: string;
  phone: string;
  active: boolean;
}

export const mockBranches: Branch[] = [
  {
    id: 'br_midtown',
    name: 'ABC - Midtown Manhattan',
    address: '456 5th Ave, New York, NY 10018',
    city: 'New York',
    distance: 1.2,
    coords: { lat: 40.7527, lng: -73.9818 },
    openingHours: '08:00 AM - 11:00 PM',
    phone: '+1 (212) 555-0199',
    active: true,
  },
  {
    id: 'br_brooklyn',
    name: 'ABC - Brooklyn Heights',
    address: '78 Montague St, Brooklyn, NY 11201',
    city: 'New York',
    distance: 4.8,
    coords: { lat: 40.6942, lng: -73.9936 },
    openingHours: '09:00 AM - 10:00 PM',
    phone: '+1 (718) 555-0145',
    active: true,
  },
  {
    id: 'br_queens',
    name: 'ABC - Astoria Queens',
    address: '31-15 30th Ave, Astoria, NY 11102',
    city: 'New York',
    distance: 6.5,
    coords: { lat: 40.7675, lng: -73.9213 },
    openingHours: '10:00 AM - 11:00 PM',
    phone: '+1 (347) 555-0182',
    active: true,
  },
  {
    id: 'br_jersey',
    name: 'ABC - Jersey City',
    address: '210 Hudson St, Jersey City, NJ 07311',
    city: 'Jersey City',
    distance: 5.4,
    coords: { lat: 40.7186, lng: -74.0321 },
    openingHours: '08:00 AM - 10:00 PM',
    phone: '+1 (201) 555-0123',
    active: true,
  },
];

export default mockBranches;
