'use client';

import { useState, useEffect } from 'react';
import { useCarbonStore } from '@/store/useCarbonStore';
import { 
  Users, 
  Trophy, 
  TreePine, 
  Zap, 
  MapPin, 
  Compass, 
  Globe 
} from 'lucide-react';

interface GreenLocation {
  id: string;
  name: string;
  type: 'ev_station' | 'recycling' | 'compost' | 'organic_farm';
  address: string;
  distance: string;
  lat: number;
  lng: number;
}

const GREEN_LOCATIONS: GreenLocation[] = [
  { id: 'loc-1', name: 'Supercharger Hub - Google Campus', type: 'ev_station', address: '1600 Amphitheatre Pkwy, Mountain View, CA', distance: '0.4 miles', lat: 37.422, lng: -122.084 },
  { id: 'loc-2', name: 'Mountain View Organic Recycling', type: 'recycling', address: '2310 Shoreline Blvd, Mountain View, CA', distance: '1.2 miles', lat: 37.430, lng: -122.091 },
  { id: 'loc-3', name: 'Community Composting Fields', type: 'compost', address: '1200 Shoreline Blvd, Mountain View, CA', distance: '0.8 miles', lat: 37.425, lng: -122.088 },
  { id: 'loc-4', name: 'Silicon Valley Eco Farm Co-op', type: 'organic_farm', address: '855 Cuesta Dr, Mountain View, CA', distance: '2.5 miles', lat: 37.382, lng: -122.072 },
  { id: 'loc-5', name: 'City Hall Recycling Station', type: 'recycling', address: '500 Castro St, Mountain View, CA', distance: '1.8 miles', lat: 37.390, lng: -122.081 },
];

export default function CommunityPage() {
  const { user } = useCarbonStore();
  const [mounted, setMounted] = useState(false);
  const [searchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<GreenLocation | null>(GREEN_LOCATIONS[0]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'ev_station' | 'recycling' | 'compost' | 'organic_farm'>('all');

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  // Filter locations
  const filteredLocations = GREEN_LOCATIONS.filter((loc) => {
    const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          loc.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || loc.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // Dynamic leaderboard values synced with user carbon savings
  const userSavedVal = Math.round((124 + user.totalCarbonSaved) * 10) / 10;
  
  const leaderboard = [
    { rank: 1, name: 'Sarah J.', saved: 145.2, level: 'Eco Master', isUser: false },
    { rank: 2, name: `${user.name} (You)`, saved: userSavedVal, level: `Level ${user.ecoLevel}`, isUser: true },
    { rank: 3, name: 'Marcus T.', saved: 98.6, level: 'Sprout Hero', isUser: false },
    { rank: 4, name: 'Clara K.', saved: 82.4, level: 'Seedling Extra', isUser: false },
  ];

  // Sort Leaderboard dynamically
  leaderboard.sort((a, b) => b.saved - a.saved);
  // Re-rank items after sorting
  const rankedLeaderboard = leaderboard.map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));

  // Group metrics
  const totalTreesSaved = Math.round(12840 + user.totalCarbonSaved * 0.45);
  const totalMWhSaved = Math.round((45.2 + user.totalCarbonSaved * 0.005) * 10) / 10;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Community Impact</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Compare carbon reduction scores and locate sustainability infrastructure near your coordinates.
          </p>
        </div>
        <div className="bg-emerald-500/10 text-emerald-400 px-4 py-2.5 rounded-xl font-bold border border-emerald-500/15 flex items-center gap-2 text-sm">
          <Users className="w-4 h-4" />
          <span>14,205 Active Workspace Members</span>
        </div>
      </header>

      {/* DYNAMIC SUMMARIES ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl"></div>
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <TreePine className="w-4 h-4 text-emerald-500" /> Collective Trees Saved
          </h3>
          <p className="text-3xl font-black">{totalTreesSaved.toLocaleString()}</p>
          <p className="text-xs text-zinc-500 leading-relaxed font-semibold">Equivalent to planting a small urban forest this quarter.</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl"></div>
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-blue-500" /> Energy Conserved
          </h3>
          <p className="text-3xl font-black">{totalMWhSaved} MWh</p>
          <p className="text-xs text-zinc-500 leading-relaxed font-semibold">Enough to power 40 residential homes for a month.</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl"></div>
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500" /> Coal Offloaded
          </h3>
          <p className="text-3xl font-black">8.5 Tons</p>
          <p className="text-xs text-zinc-500 leading-relaxed font-semibold">Estimated carbon-equivalent coal reserves left in-ground.</p>
        </div>
      </div>

      {/* TWO COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEADERBOARD VIEW */}
        <section className="lg:col-span-5 bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl space-y-6">
          <div>
            <h2 className="text-lg font-bold">Workspace Leaderboard</h2>
            <p className="text-xs text-zinc-500 mt-1 font-semibold uppercase tracking-wider">Top contributors this week</p>
          </div>

          <div className="space-y-3">
            {rankedLeaderboard.map((usr) => (
              <div 
                key={usr.name} 
                className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
                  usr.isUser 
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/5' 
                    : 'bg-zinc-950 border-zinc-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                    usr.rank === 1 
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' 
                      : usr.rank === 2 
                        ? 'bg-zinc-700/40 text-zinc-300' 
                        : 'bg-zinc-850 text-zinc-500'
                  }`}>
                    {usr.rank}
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${usr.isUser ? 'text-emerald-400' : 'text-zinc-200'}`}>
                      {usr.name}
                    </p>
                    <span className="text-[10px] uppercase font-black text-zinc-500 block mt-0.5">{usr.level}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-extrabold text-sm ${usr.isUser ? 'text-emerald-400' : 'text-emerald-500'}`}>
                    -{usr.saved} kg CO₂
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* GOOGLE MAPS LOCATOR */}
        <section aria-label="Eco-friendly locations near you" className="lg:col-span-7 bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl space-y-6 flex flex-col min-h-[580px]">
          <div>
            <h2 id="map-heading" className="text-lg font-bold flex items-center gap-1.5">
              <Globe className="w-5 h-5 text-emerald-500 animate-pulse" /> Eco-Locator Map
            </h2>
            <p id="map-description" className="sr-only">
              Interactive map showing eco-friendly businesses, green spaces, and sustainability points of interest in your area. Use arrow keys to navigate the map.
            </p>
          </div>

          {/* Map and Pins List Split */}
          <div
            role="application"
            aria-labelledby="map-heading"
            aria-describedby="map-description"
            className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden"
          >
            {/* Left lists */}
            <div className="w-full md:w-52 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {/* Filter */}
              <select
                aria-label="Filter locations by type"
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value as 'all' | 'ev_station' | 'recycling' | 'compost' | 'organic_farm')}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs outline-none text-zinc-400 font-semibold mb-2"
              >
                <option value="all">All Eco Hubs</option>
                <option value="ev_station">EV Chargers</option>
                <option value="recycling">Recycling Hubs</option>
                <option value="compost">Compost Centers</option>
                <option value="organic_farm">Organic Co-ops</option>
              </select>

              {filteredLocations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => setSelectedLocation(loc)}
                  className={`w-full text-left p-3 rounded-lg border flex flex-col gap-1 transition-all ${
                    selectedLocation?.id === loc.id
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <span className="font-bold text-xs truncate">{loc.name}</span>
                  <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {loc.distance}
                  </span>
                </button>
              ))}

              {filteredLocations.length === 0 && (
                <p className="text-xs text-zinc-500 text-center py-4">No eco hubs found.</p>
              )}
            </div>

            {/* Right Map Canvas Mockup */}
            <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl relative overflow-hidden flex items-center justify-center min-h-[200px]">
              
              {/* Google Maps Visual mock background pattern */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
              
              {/* Compass overlay */}
              <div className="absolute top-3 right-3 text-zinc-500 p-1 bg-zinc-900 border border-zinc-800 rounded-lg">
                <Compass className="w-4 h-4 animate-spin-slow" />
              </div>

              {/* Selected point markers visualizer */}
              {selectedLocation && (
                <div className="text-center space-y-4 z-10 p-6 max-w-xs animate-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/35 flex items-center justify-center mx-auto text-emerald-400">
                    <MapPin className="w-6 h-6 animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-sm">{selectedLocation.name}</h3>
                    <p className="text-xs text-zinc-400 font-semibold">{selectedLocation.address}</p>
                    <div className="flex gap-2 justify-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest pt-2">
                      <span>Lat: {selectedLocation.lat}</span>
                      <span>Lng: {selectedLocation.lng}</span>
                    </div>
                  </div>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(selectedLocation.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all shadow-md mt-2"
                  >
                    Open Directions
                  </a>
                </div>
              )}

              {!selectedLocation && (
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Select a facility to pin coordinates</p>
              )}
            </div>
          </div>

          {/* Accessible list fallback */}
          <details className="mt-4 border-t border-zinc-800/80 pt-4">
            <summary className="text-xs font-bold text-emerald-500 cursor-pointer outline-none hover:underline">
              View locations as list
            </summary>
            <ul aria-label="Eco-friendly locations list" className="mt-2 space-y-2 text-xs text-zinc-400">
              {filteredLocations.map(loc => (
                <li key={loc.id} className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg">
                  <strong className="block text-zinc-200">{loc.name}</strong>
                  <span>{loc.address}</span> | <span className="capitalize">{loc.type.replace('_', ' ')}</span>
                </li>
              ))}
            </ul>
          </details>
        </section>

      </div>

    </div>
  );
}
