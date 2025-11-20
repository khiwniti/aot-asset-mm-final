import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PROPERTIES, LEASES } from '../services/mockData';
import Header from '../components/Header';
import AIAssistButton from '../components/AIAssistButton';
import { 
  MapPin, 
  Users, 
  TrendingUp, 
  ArrowUp,
  ArrowRight, 
  AlertTriangle, 
  DollarSign,
  Wrench,
} from 'lucide-react';

const PropertyDetail = () => {
  const { id } = useParams();
  const property = PROPERTIES.find(p => p.id === id) || PROPERTIES[0];
  const [activeTab, setActiveTab] = useState('overview');
  
  const propertyLeases = LEASES.filter(l => l.propertyId === property.id);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'financial', label: 'Financial' },
    { id: 'leasing', label: 'Leasing' },
    { id: 'maintenance', label: 'Maintenance' },
  ];

  const OverviewContent = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Potential Opportunities */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
             <h3 className="font-bold text-lg text-slate-800">Potential Opportunities</h3>
             <AIAssistButton prompt={`Identify value-add opportunities for ${property.name}.`} />
          </div>
          <TrendingUp className="text-blue-500" />
        </div>
        <div className="space-y-6">
          <div className="p-4 rounded-lg border border-green-100 bg-green-50/50 relative group">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <AIAssistButton prompt="Calculate the ROI for this rent increase opportunity." size={14} />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 rounded text-[10px] font-bold bg-green-200 text-green-800 uppercase">Rent Increase</span>
              <span className="text-xs text-green-700 font-medium">+23% Rent Upside Identified</span>
            </div>
            <p className="text-sm text-slate-600 mb-3 leading-relaxed">
              Our AI has identified strong rent growth signal driven by high occupancy and rising district demand.
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Current: <span className="font-bold text-slate-800">THB {property.monthlyRent.toLocaleString()}</span></span>
              <ArrowRight size={16} className="text-slate-400 mx-2" />
              <span className="text-green-600 font-bold">Target: THB {(property.monthlyRent * 1.23).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Potential Threats */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-slate-800">Potential Threats</h3>
              <AIAssistButton prompt={`Assess the risk level for ${property.name} based on current threats.`} />
          </div>
          <AlertTriangle className="text-amber-500" />
        </div>
        <div className="space-y-6">
          <div className="p-4 rounded-lg border border-red-100 bg-red-50/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 rounded text-[10px] font-bold bg-red-200 text-red-800 uppercase">Risk Alert</span>
              <span className="text-xs text-red-700 font-medium">2 months payment overdue</span>
            </div>
            <p className="text-sm text-slate-600 mb-2">Tenant in Unit 302 has missed rent for 2 months in a row.</p>
            <div className="text-right">
              <span className="text-xs text-red-600 font-bold">Unpaid balance: THB {(property.monthlyRent * 2).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Details Panel */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
               <h3 className="font-bold text-slate-800 mb-4">Property Details</h3>
               <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                     <span className="text-slate-500">Address</span>
                     <span className="font-medium text-slate-800">{property.address}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                     <span className="text-slate-500">City/Region</span>
                     <span className="font-medium text-slate-800">{property.city}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                     <span className="text-slate-500">Type</span>
                     <span className="font-medium text-slate-800">{property.type}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                     <span className="text-slate-500">Year Renovated</span>
                     <span className="font-medium text-slate-800">{property.lastRenovated}</span>
                  </div>
               </div>
            </div>
            <div>
               <h3 className="font-bold text-slate-800 mb-4">Key Contacts</h3>
               <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                     <Users size={20} className="text-slate-500" />
                  </div>
                  <div>
                     <p className="font-medium text-slate-800">John Doe</p>
                     <p className="text-xs text-slate-500">Property Manager</p>
                     <p className="text-xs text-blue-600 mt-0.5">555-0123</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );

  const LeasingContent = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in fade-in">
      <div className="flex items-center justify-between mb-6">
         <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-800">Current Tenants</h3>
            <AIAssistButton prompt="Draft a lease renewal email for expiring tenants." />
         </div>
         <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Add New Lease
         </button>
      </div>
      {propertyLeases.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-3 text-xs font-bold text-slate-500 uppercase">Tenant</th>
                <th className="p-3 text-xs font-bold text-slate-500 uppercase">Unit</th>
                <th className="p-3 text-xs font-bold text-slate-500 uppercase">Lease End</th>
                <th className="p-3 text-xs font-bold text-slate-500 uppercase">Rent</th>
                <th className="p-3 text-xs font-bold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {propertyLeases.map(lease => (
                <tr key={lease.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="p-3 font-medium text-slate-800">{lease.tenant}</td>
                  <td className="p-3 text-slate-600">{lease.propertyName}</td>
                  <td className="p-3 text-slate-600">{lease.endDate}</td>
                  <td className="p-3 text-slate-800 font-medium">THB {lease.rent.toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      lease.status === 'Active' ? 'bg-green-100 text-green-700' :
                      lease.status === 'Expiring' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {lease.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10 text-slate-500">No lease data available for this property.</div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <Header title={property.name} subtitle={`${property.address}, ${property.city}`} />

      <main className="p-8 max-w-[1600px] mx-auto">
        {/* Top Summary Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/3">
              <div className="rounded-xl overflow-hidden h-64 w-full shadow-inner relative group">
                <img src={property.image} alt={property.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-slate-800 shadow-sm">
                   {property.type}
                </div>
              </div>
            </div>
            <div className="lg:w-2/3 flex flex-col justify-between">
               <div className="flex justify-end mb-2">
                   <AIAssistButton prompt={`Generate a 1-page executive summary for ${property.name}.`} tooltip="Generate Summary" />
               </div>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                     <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Total Value</div>
                     <div className="text-2xl font-bold text-slate-800">฿{(property.value/1000000).toFixed(1)}M</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                     <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Occupancy</div>
                     <div className={`text-2xl font-bold ${property.occupancyRate > 90 ? 'text-green-600' : 'text-slate-800'}`}>{property.occupancyRate}%</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                     <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Monthly Rent</div>
                     <div className="text-2xl font-bold text-slate-800">THB {property.monthlyRent.toLocaleString()}</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                     <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Tenants</div>
                     <div className="text-2xl font-bold text-slate-800">{property.tenantCount}</div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6 border-b border-slate-200">
           <div className="flex gap-6">
              {tabs.map(tab => (
                 <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 text-sm font-medium transition-all ${
                       activeTab === tab.id 
                       ? 'text-blue-600 border-b-2 border-blue-600' 
                       : 'text-slate-500 hover:text-slate-800'
                    }`}
                 >
                    {tab.label}
                 </button>
              ))}
           </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && <OverviewContent />}
        {activeTab === 'leasing' && <LeasingContent />}
        {activeTab === 'financial' && (
           <div className="bg-white p-10 rounded-xl text-center text-slate-400 border border-slate-200 border-dashed">
              <DollarSign className="mx-auto mb-2 opacity-50" size={32} />
              <p>Financial Details placeholder - See Financial Management page for full charts</p>
           </div>
        )}
        {activeTab === 'maintenance' && (
           <div className="bg-white p-10 rounded-xl text-center text-slate-400 border border-slate-200 border-dashed">
              <Wrench className="mx-auto mb-2 opacity-50" size={32} />
              <p>Maintenance history placeholder - See Maintenance page for full Kanban</p>
           </div>
        )}
      </main>
    </div>
  );
};

export default PropertyDetail;