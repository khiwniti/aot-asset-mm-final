import { useState, useEffect, useRef } from 'react';
import { 
  List, 
  Grid, 
  Map as MapIcon, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight, 
  Search,
  ArrowRight,
  TrendingUp,
  MapPin,
  AlertCircle,
  Filter
} from 'lucide-react';
import Header from '../components/Header';
import AIAssistButton from '../components/AIAssistButton';
import { PROPERTIES } from '../services/mockData';
import { Link, useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';

// Set Mapbox Access Token
const MAPBOX_TOKEN = 'pk.eyJ1Ijoia2hpd25pdGkiLCJhIjoiY205eDFwMzl0MHY1YzJscjB3bm4xcnh5ZyJ9.ANGVE0tiA9NslBn8ft_9fQ';

interface MapboxMapProps {
  center: [number, number];
  zoom: number;
  markers: Array<{
    id: string;
    lat: number;
    lng: number;
    title: string;
    subtitle?: string;
    price?: string;
  }>;
}

const MapboxMap = ({ center, zoom, markers }: MapboxMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;
    
    let isMounted = true;

    const initializeMap = async () => {
        try {
            mapboxgl.accessToken = MAPBOX_TOKEN;

            // FIX: Manually load worker via Blob to prevent "blocked by CORS" or "URL scheme" errors in strict environments
            // Also check if workerUrl is already a blob to prevent re-initialization loop
            if (!mapboxgl.workerUrl || (typeof mapboxgl.workerUrl === 'string' && mapboxgl.workerUrl.indexOf('blob:') !== 0)) {
                try {
                    const workerUrl = "https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl-csp-worker.js";
                    const response = await fetch(workerUrl);
                    const workerScript = await response.text();
                    const blob = new Blob([workerScript], { type: 'application/javascript' });
                    // @ts-ignore
                    mapboxgl.workerUrl = window.URL.createObjectURL(blob);
                } catch (workerError) {
                    console.warn("Failed to load Mapbox worker via Blob, falling back to default (may fail in sandbox).", workerError);
                }
            }

            if (!isMounted) return;

            map.current = new mapboxgl.Map({
                container: mapContainer.current!,
                style: 'mapbox://styles/mapbox/streets-v12',
                center: [center[1], center[0]], // Mapbox uses [lng, lat]
                zoom: zoom,
                attributionControl: false, // Disable attribution to avoid iframe access issues (Location.href)
            });

            map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

            // Add markers
            markers.forEach((marker) => {
                const popupNode = document.createElement('div');
                popupNode.className = 'min-w-[150px]';
                popupNode.innerHTML = `
                    <div class="text-sm font-bold text-slate-800">${marker.title}</div>
                    <div class="text-xs text-slate-500 mb-1">${marker.subtitle || ''}</div>
                    <div class="text-xs font-bold text-blue-600">${marker.price || ''}</div>
                    <button id="btn-${marker.id}" class="text-[10px] text-blue-500 hover:underline block mt-2 cursor-pointer">
                    View Details
                    </button>
                `;

                const popup = new mapboxgl.Popup({ offset: 25 }).setDOMContent(popupNode);
                
                popup.on('open', () => {
                    const btn = document.getElementById(`btn-${marker.id}`);
                    if (btn) {
                        btn.addEventListener('click', () => {
                            window.location.hash = `#/properties/${marker.id}`;
                        });
                    }
                });

                new mapboxgl.Marker()
                    .setLngLat([marker.lng, marker.lat])
                    .setPopup(popup)
                    .addTo(map.current!);
            });

            map.current.on('error', (e) => {
               // Suppress known benign errors in sandboxed environments
               const errorMsg = e.error?.message || '';
               if (
                   errorMsg.toLowerCase().includes('worker') || 
                   errorMsg.includes('href') || 
                   errorMsg.includes('Location')
               ) {
                   console.warn("Mapbox warning (suppressed):", errorMsg);
                   return;
               }
               console.error("Mapbox runtime error:", e);
            });

        } catch (error: any) {
            console.error("Mapbox initialization error:", error);
            // Don't show full error UI for minor initialization glitches unless it's critical
            // if(isMounted) setMapError(error.message || "Map could not be loaded.");
        }
    };

    initializeMap();

    return () => {
      isMounted = false;
      try {
         map.current?.remove();
      } catch(e) {
         console.warn("Mapbox cleanup error", e);
      }
    };
  }, [center, zoom, markers]);

  if (mapError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-slate-200 text-slate-400 p-6 text-center">
         <AlertCircle size={32} className="mb-2 text-slate-300" />
         <p className="text-sm font-medium text-slate-500">Map visualization unavailable</p>
         <p className="text-xs mt-1 text-slate-400 max-w-[250px]">{mapError}</p>
      </div>
    );
  }

  return <div ref={mapContainer} className="w-full h-full" />;
};

const PropertyListing = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('list');
  const [activeTab, setActiveTab] = useState('Property listing');
  
  // Filters
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState('Bangkok - BKK');

  // Derived Data
  const uniqueCities = ['All', ...Array.from(new Set(PROPERTIES.map(p => p.city)))];
  const uniqueTypes = ['All', ...Array.from(new Set(PROPERTIES.map(p => p.type)))];

  const filteredProperties = PROPERTIES.filter(p => {
    const matchType = selectedType === 'All' || p.type === selectedType;
    const matchCity = selectedCity === 'All' || p.city === selectedCity;
    return matchType && matchCity;
  });

  const regions = ['Bangkok - BKK', 'Bangkok - DMK', 'Phuket - HKT', 'Hat Yai - HDY', 'Chiang Mai - CNX', 'Chiang Rai - CEI'];

  const regionProperties = [
    { id: 'P001', name: '612/21 Suvarnabhumi residence', district: 'Bang sao thong', lat: 13.6900, lng: 100.7501, price: '12,000', status: 'Active' },
    { id: 'P002', name: '613/21 Airport side apartment', district: 'Samut Prakan', lat: 13.6950, lng: 100.7550, price: '15,000', status: 'Pending' },
    { id: 'P003', name: '632/21 Airport side apartment', district: 'Samut Prakan', lat: 13.6850, lng: 100.7450, price: '14,500', status: 'Active' },
    { id: 'P004', name: '632/21 Suvarnabhumi residence', district: 'Bang sao thong', lat: 13.6920, lng: 100.7520, price: '12,500', status: 'Maintenance' },
    { id: 'P005', name: '632/21 Suvarnabhumi residence', district: 'Bang sao thong', lat: 13.6880, lng: 100.7480, price: '12,000', status: 'Active' },
    { id: 'P006', name: '632/21 Suvarnabhumi residence', district: 'Bang sao thong', lat: 13.6930, lng: 100.7580, price: '13,000', status: 'Active' },
  ];

  const propertyMarkers = filteredProperties.map((p, idx) => ({
    id: p.id,
    title: p.name,
    subtitle: p.address,
    price: `฿${p.monthlyRent.toLocaleString()}/mo`,
    lat: 13.7563 + (idx * 0.02 - 0.05),
    lng: 100.5018 + (idx * 0.02 - 0.05)
  }));

  const opportunities = [
    {
      type: 'Rent increase',
      title: '+23% Rent Upside Identified',
      value: '24,600 THB/month',
      prevValue: '20,000',
      desc: 'Our AI has identified a strong rent growth signal driven by high occupancy and rising district demand.',
      location: '615/21 Sriracha View',
      subLocation: 'Bang Sao Thong District'
    },
    {
      type: 'Renovation ROI',
      title: 'Kitchen Upgrade ROI - Increase Rent Value',
      value: '+15-25%',
      desc: 'Renovating the kitchen could significantly lift both rental rates and long-term property value.',
      location: '632/21 Suvarnabhumi residence',
      subLocation: 'Bang Sao Thong District'
    },
    {
      type: 'Risk alert',
      title: '2 months payment overdue.',
      value: 'Unpaid balance: 50,000 THB',
      desc: 'Tenant has missed rent for 2 months in a row.',
      location: '623/21 Urban Bang Phli',
      subLocation: 'Bang Sao Thong District',
      trend: 'neutral'
    }
  ];

  const threats = [
    {
      type: 'Risk alert',
      title: '2 months payment overdue.',
      value: 'Unpaid balance: 50,000 THB',
      desc: 'Tenant has missed rent for 2 months in a row.',
      location: '623/21 Urban Bang Phli',
      subLocation: 'Bang Sao Thong District',
      trend: 'neutral'
    }
  ];

  const renderPropertyView = () => {
    if (filteredProperties.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
           <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Search className="text-slate-400" size={32} />
           </div>
           <h3 className="text-lg font-bold text-slate-800">No properties found</h3>
           <p className="text-slate-500 mt-1">Try adjusting your filters to see more results.</p>
           <button 
             onClick={() => { setSelectedType('All'); setSelectedCity('All'); }}
             className="mt-4 text-blue-600 font-medium hover:underline"
           >
             Clear all filters
           </button>
        </div>
      );
    }

    switch (viewMode) {
      case 'map':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-[600px] animate-in fade-in z-0 relative overflow-hidden">
             <MapboxMap 
                center={[13.7563, 100.5018]} 
                zoom={10} 
                markers={propertyMarkers} 
             />
          </div>
        );
      case 'grid':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
            {filteredProperties.map((property) => (
              <Link to={`/properties/${property.id}`} key={property.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all group">
                <div className="h-48 overflow-hidden relative">
                  <img src={property.image} alt={property.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm
                        ${property.status === 'Active' ? 'bg-white/90 text-green-700 backdrop-blur-sm' : 
                          'bg-white/90 text-yellow-700 backdrop-blur-sm'}`}>
                        {property.status}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">{property.name}</h3>
                      <p className="text-sm text-slate-500">{property.city}</p>
                    </div>
                    <div className="text-right">
                       <div className="text-lg font-bold text-slate-800">฿{property.monthlyRent.toLocaleString()}</div>
                       <div className="text-[10px] text-slate-400 uppercase">Per Month</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4 py-4 border-t border-slate-100">
                     <div>
                        <span className="text-xs text-slate-400 block">Total Value</span>
                        <span className="font-medium text-slate-700">฿{(property.value / 1000000).toFixed(1)}M</span>
                     </div>
                     <div>
                        <span className="text-xs text-slate-400 block">Occupancy</span>
                        <span className="font-medium text-slate-700">{property.occupancyRate}%</span>
                     </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        );
      case 'list':
      default:
        return (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 w-10"><input type="checkbox" className="rounded border-slate-300" /></th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Property Name</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Region</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Rent</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4"><input type="checkbox" className="rounded border-slate-300" /></td>
                    <td className="p-4">
                      <Link to={`/properties/${property.id}`} className="block">
                        <div className="font-medium text-slate-800 group-hover:text-blue-600 transition-colors">{property.name}</div>
                        <div className="text-xs text-slate-400">{property.address}</div>
                      </Link>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{property.city}</td>
                    <td className="p-4 text-sm font-medium text-slate-800">฿{property.monthlyRent.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${property.status === 'Active' ? 'bg-green-100 text-green-800' : 
                          property.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                        {property.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-slate-400 hover:text-slate-600 p-1">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
             <div className="p-4 border-t border-slate-200 flex items-center justify-between">
                <button className="px-3 py-1 border border-slate-200 rounded-md text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-1">
                  <ChevronLeft size={14} /> Previous
                </button>
                <div className="flex gap-1">
                   <button className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-md text-sm">1</button>
                   <button className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-md text-sm">2</button>
                   <button className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-md text-sm">3</button>
                </div>
                <button className="px-3 py-1 border border-slate-200 rounded-md text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-1">
                  Next <ChevronRight size={14} />
                </button>
             </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <Header 
        title="Property Listing" 
        subtitle={activeTab === 'Region listing' ? 'Overview of district performance and opportunities.' : "Manage your portfolio, view details, and track occupancy."}
      />

      <main className="p-8 max-w-[1600px] mx-auto">
        {/* Controls & Filters */}
        <div className={`${activeTab === 'Region listing' ? 'mb-6' : 'bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6'}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg self-start">
              {['Property listing', 'Region listing', 'Tenant list'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    if (tab !== 'Property listing' && viewMode === 'map') setViewMode('list');
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Filters - Only visible in Property Listing */}
            {activeTab === 'Property listing' && (
              <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0">
                {/* Property Type Filter */}
                <div className="relative">
                  <select 
                      className="appearance-none bg-white border border-slate-200 hover:border-blue-400 text-slate-700 text-sm rounded-lg px-4 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer min-w-[160px]"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                  >
                    {uniqueTypes.map(type => (
                      <option key={type} value={type}>{type === 'All' ? 'All Types' : type}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                    <Filter size={14} />
                  </div>
                </div>

                {/* City Filter */}
                <div className="relative">
                  <select 
                    className="appearance-none bg-white border border-slate-200 hover:border-blue-400 text-slate-700 text-sm rounded-lg px-4 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer min-w-[160px]"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                  >
                    {uniqueCities.map(city => (
                      <option key={city} value={city}>{city === 'All' ? 'All Cities' : city}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                    <MapPin size={14} />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Secondary Toolbar with Toggle Buttons */}
          {activeTab === 'Property listing' && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
              <div className="text-sm text-slate-500 flex items-center gap-2">
                <span>Showing <span className="font-bold text-slate-800">{filteredProperties.length}</span> properties</span>
                <AIAssistButton prompt="Filter these properties to show only those with occupancy below 80%." tooltip="Ask AI to filter" />
              </div>
              
              {/* VIEW TOGGLE BUTTONS */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  title="List View"
                >
                  <List size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  title="Grid View"
                >
                  <Grid size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('map')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'map' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  title="Map View"
                >
                  <MapIcon size={18} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CONTENT RENDERER */}
        {activeTab === 'Property listing' ? renderPropertyView() : null}

        {/* Region Listing Content */}
        {activeTab === 'Region listing' && (
          <div className="space-y-8 animate-in fade-in">
             <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {regions.map(region => (
                   <button
                      key={region}
                      onClick={() => setSelectedRegion(region)}
                      className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${
                         selectedRegion === region 
                         ? 'bg-blue-600 text-white border-blue-600' 
                         : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                   >
                      {region}
                   </button>
                ))}
             </div>

             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="font-bold text-lg text-slate-800">District : Suvarnabhumi Airport | BKK</h3>
                   <AIAssistButton prompt="Analyze this district's map data. Where are the growth hotspots?" />
                </div>
                <div className="flex flex-col lg:flex-row gap-6">
                   <div className="lg:flex-1 bg-white rounded-xl h-[500px] border border-slate-200 relative overflow-hidden shadow-sm z-0">
                      {/* Region Map View */}
                      <MapboxMap 
                          center={[13.6900, 100.7501]}
                          zoom={13}
                          markers={regionProperties.map(p => ({
                              id: p.id,
                              lat: p.lat,
                              lng: p.lng,
                              title: p.name,
                              subtitle: p.district,
                              price: `฿${p.price}/mo`
                          }))}
                      />
                   </div>

                   <div className="w-full lg:w-[380px] shrink-0 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                         <h4 className="font-bold text-slate-800">All properties</h4>
                         <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                            <MapIcon size={16} />
                         </button>
                      </div>
                      <div className="relative mb-4">
                         <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                         <input 
                            type="text" 
                            placeholder="Search location" 
                            className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                         />
                      </div>
                      <div className="flex justify-between text-xs font-semibold text-slate-500 border-b border-slate-100 pb-2 mb-2">
                         <span>Name</span>
                         <span>District</span>
                      </div>
                      <div className="flex-1 overflow-y-auto pr-2 max-h-[400px] space-y-1 custom-scrollbar">
                         {regionProperties.map((prop, i) => (
                            <div key={i} className="flex justify-between items-center py-3 px-2 hover:bg-slate-50 rounded cursor-pointer group transition-colors border-b border-slate-50">
                               <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 truncate max-w-[200px]">{prop.name}</span>
                               <span className="text-xs text-slate-500">{prop.district}</span>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                   <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                         <h3 className="font-bold text-lg text-slate-800">Potential opportunities</h3>
                         <AIAssistButton prompt="Analyze these opportunities. Which one offers the highest ROI?" />
                      </div>
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                         <TrendingUp size={16} />
                      </div>
                   </div>
                   <div className="space-y-6">
                      {opportunities.map((opp, i) => (
                         <div key={i} className="border-b border-slate-50 last:border-0 pb-6 last:pb-0">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-2
                               ${opp.type === 'Rent increase' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                               {opp.type}
                            </span>
                            <h4 className="font-bold text-slate-800 text-sm mb-1">{opp.title}</h4>
                            <p className="text-xs text-slate-500 mb-3">{opp.desc}</p>
                            <div className="flex items-end justify-between">
                               <div>
                                  <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                                     {opp.prevValue && <span className="text-slate-400 font-normal line-through decoration-slate-400">{opp.prevValue}</span>} 
                                     {opp.prevValue && <ArrowRight size={12} className="text-slate-400" />}
                                     {opp.value}
                                  </div>
                                  <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                     <MapPin size={10} /> {opp.location}
                                  </div>
                                  <div className="text-[10px] text-slate-400 ml-3.5">{opp.subLocation}</div>
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                   <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                         <h3 className="font-bold text-lg text-slate-800">Potential threats</h3>
                         <AIAssistButton prompt="How should I mitigate these threats? Draft a response plan." />
                      </div>
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                         <TrendingUp size={16} />
                      </div>
                   </div>
                   <div className="space-y-6">
                      {threats.map((threat, i) => (
                         <div key={i} className="border-b border-slate-50 last:border-0 pb-6 last:pb-0">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-2 bg-red-100 text-red-700">
                               {threat.type}
                            </span>
                            <h4 className="font-bold text-slate-800 text-sm mb-1">{threat.title}</h4>
                            <p className="text-xs text-slate-500 mb-3">{threat.desc}</p>
                            <div className="flex items-end justify-between">
                               <div className="w-full">
                                  <div className={`text-xs font-bold ${threat.trend === 'down' ? 'text-red-600' : 'text-slate-800'} flex justify-between items-center`}>
                                     {threat.value}
                                     {threat.trend === 'down' && <TrendingUp size={12} className="rotate-180 text-red-500" />}
                                  </div>
                                  <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                     <MapPin size={10} /> {threat.location}
                                  </div>
                                  <div className="text-[10px] text-slate-400 ml-3.5">{threat.subLocation}</div>
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'Tenant list' && (
           <div className="bg-white p-10 rounded-xl border border-slate-200 text-center text-slate-400 animate-in fade-in">
              <p>Tenant list view is currently under development.</p>
              <button className="mt-4 text-blue-600 font-medium text-sm hover:underline" onClick={() => setActiveTab('Property listing')}>Go back to properties</button>
           </div>
        )}
      </main>
    </div>
  );
};

export default PropertyListing;