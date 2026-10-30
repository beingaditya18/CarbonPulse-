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
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-[#065f46] border border-emerald-200 mb-2">
            Regional Environmental Commons
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Community Impact</h1>
          <p className="text-slate-600 dark:text-zinc-400 mt-1 text-sm font-medium">
            Compare verified carbon reductions and locate sustainability infrastructure near your coordinates.
          </p>
        </div>
        <div className="bg-emerald-50 text-[#065f46] dark:bg-emerald-950/40 dark:text-emerald-300 px-4 py-2.5 rounded-xl font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-sm shadow-xs self-start sm:self-auto">
          <Users className="w-4 h-4 text-[#047857]" />
          <span>14,205 Active Workspace Members</span>
        </div>
      </header>

      {/* DYNAMIC SUMMARIES ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 p-6 rounded-2xl shadow-xs space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl"></div>
          <h3 className="text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <TreePine className="w-4 h-4 text-[#047857]" /> Collective Trees Saved
          </h3>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{totalTreesSaved.toLocaleString()}</p>
          <p className="text-xs text-slate-600 dark:text-zinc-500 leading-relaxed font-medium">Equivalent to planting a small urban forest this quarter.</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 p-6 rounded-2xl shadow-xs space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl"></div>
          <h3 className="text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-blue-600" /> Energy Conserved
          </h3>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{totalMWhSaved} MWh</p>
          <p className="text-xs text-slate-600 dark:text-zinc-500 leading-relaxed font-medium">Enough to power 40 residential homes for a month.</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 p-6 rounded-2xl shadow-xs space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl"></div>
          <h3 className="text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-600" /> Coal Offloaded
          </h3>
          <p className="text-3xl font-black text-slate-900 dark:text-white">8.5 Tons</p>
          <p className="text-xs text-slate-600 dark:text-zinc-500 leading-relaxed font-medium">Estimated carbon-equivalent coal reserves left in-ground.</p>
        </div>
      </div>

      {/* TWO COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* LEADERBOARD VIEW */}
        <section className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 p-6 rounded-2xl shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Workspace Leaderboard</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1 font-medium uppercase tracking-wider">Top contributors this week</p>
          </div>

          <div className="space-y-3">
            {rankedLeaderboard.map((usr) => (
              <div
                key={usr.name}
                className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${usr.isUser
                    ? 'bg-emerald-50 border-emerald-300 text-slate-900 shadow-xs dark:bg-emerald-500/10 dark:border-emerald-500 dark:text-emerald-400'
                    : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800/80'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${usr.rank === 1
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : usr.rank === 2
                        ? 'bg-slate-200 text-slate-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                    {usr.rank}
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${usr.isUser ? 'text-[#047857] dark:text-emerald-400' : 'text-slate-800 dark:text-zinc-200'}`}>
                      {usr.name}
                    </p>
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500 block mt-0.5">{usr.level}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-black text-sm ${usr.isUser ? 'text-[#047857] dark:text-emerald-400' : 'text-[#065f46] dark:text-emerald-500'}`}>
                    -{usr.saved} kg CO₂
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* GOOGLE MAPS LOCATOR */}
        <section aria-label="Eco-friendly locations near you" className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 p-6 rounded-2xl shadow-xs space-y-6 flex flex-col min-h-[580px]">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h2 id="map-heading" className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#047857] dark:text-emerald-500 animate-pulse" /> Eco-Locator Map
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
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg p-2 text-xs outline-none text-slate-700 dark:text-zinc-400 font-semibold mb-2 focus:border-[#047857]"
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
                  className={`w-full text-left p-3 rounded-lg border flex flex-col gap-1 transition-all cursor-pointer ${selectedLocation?.id === loc.id
                      ? 'bg-emerald-50 border-emerald-300 text-slate-900 shadow-xs dark:bg-emerald-500/10 dark:border-emerald-500 dark:text-emerald-400'
                      : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 text-slate-700 dark:text-zinc-300'
                    }`}
                >
                  <span className="font-bold text-xs truncate">{loc.name}</span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-500 flex items-center gap-1 font-medium">
                    <MapPin className="w-3 h-3 text-[#047857]" /> {loc.distance}
                  </span>
                </button>
              ))}

              {filteredLocations.length === 0 && (
                <p className="text-xs text-slate-500 dark:text-zinc-500 text-center py-4 font-medium">No eco hubs found.</p>
              )}
            </div>

            {/* Right Map Canvas Mockup */}
            <div className="flex-1 bg-slate-100/70 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl relative overflow-hidden flex items-center justify-center min-h-[200px]">

              {/* Google Maps Visual mock background pattern */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#047857_1px,transparent_1px)] [background-size:16px_16px]"></div>

              {/* Compass overlay */}
              <div className="absolute top-3 right-3 text-slate-600 dark:text-zinc-500 p-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg shadow-xs">
                <Compass className="w-4 h-4 animate-spin-slow text-[#047857]" />
              </div>

              {/* Selected point markers visualizer */}
              {selectedLocation && (
                <div className="text-center space-y-4 z-10 p-6 max-w-xs animate-in zoom-in-95 duration-200 bg-white/95 dark:bg-zinc-900/95 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-lg backdrop-blur-xs">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-[#047857]">
                    <MapPin className="w-6 h-6 animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{selectedLocation.name}</h3>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">{selectedLocation.address}</p>
                    <div className="flex gap-2 justify-center text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest pt-2">
                      <span>Lat: {selectedLocation.lat}</span>
                      <span>Lng: {selectedLocation.lng}</span>
                    </div>
                  </div>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(selectedLocation.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-[#047857] hover:bg-[#065f46] text-white font-bold text-xs px-4 py-2 rounded-lg transition-all shadow-xs mt-2"
                  >
                    Open Directions
                  </a>
                </div>
              )}

              {!selectedLocation && (
                <p className="text-xs text-slate-500 dark:text-zinc-500 font-bold uppercase tracking-wider">Select a facility to pin coordinates</p>
              )}
            </div>
          </div>

          {/* Accessible list fallback */}
          <details className="mt-4 border-t border-slate-100 dark:border-zinc-800/80 pt-4">
            <summary className="text-xs font-bold text-[#047857] dark:text-emerald-500 cursor-pointer outline-none hover:underline">
              View locations as list
            </summary>
            <ul aria-label="Eco-friendly locations list" className="mt-2 space-y-2 text-xs text-slate-600 dark:text-zinc-400">
              {filteredLocations.map(loc => (
                <li key={loc.id} className="p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg">
                  <strong className="block text-slate-900 dark:text-zinc-200">{loc.name}</strong>
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
