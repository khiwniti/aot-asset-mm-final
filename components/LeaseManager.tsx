import React, { useState, useEffect } from 'react';
import { useLeaseStore, EnhancedLease, LeaseStatus } from '../services/stores/leaseStore';
import { format, addDays, differenceInDays } from 'date-fns';
import { Calendar, User, DollarSign, AlertTriangle, RefreshCw, Plus, Edit, Trash2, Send, FileCheck } from 'lucide-react';

interface LeaseCardProps {
  lease: EnhancedLease;
  onEdit: (lease: EnhancedLease) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: LeaseStatus) => void;
  onInitiateRenewal: (leaseId: string) => void;
}

const LeaseCard: React.FC<LeaseCardProps> = ({ lease, onEdit, onDelete, onStatusChange, onInitiateRenewal }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getStatusColor = (status: LeaseStatus) => {
    switch (status) {
      case 'draft': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'expiring': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'expired': return 'bg-red-100 text-red-700 border-red-200';
      case 'renewed': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRenewalBadge = (status: string | undefined) => {
    switch(status) {
      case 'Sent': return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
          <Send size={10} /> Notice Sent
        </span>
      );
      case 'Draft': return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
          Drafted
        </span>
      );
      case 'Negotiating': return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
          Negotiating
        </span>
      );
      case 'Signed': return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
          <FileCheck size={10} /> Signed
        </span>
      );
      default: return null;
    }
  };

  const daysUntilExpiry = lease.endDate ? differenceInDays(new Date(lease.endDate), new Date()) : null;
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 60 && daysUntilExpiry > 0;
  const isExpired = daysUntilExpiry !== null && daysUntilExpiry <= 0;

  return (
    <div className={`bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all group ${
      isExpiringSoon ? 'border-amber-300 bg-amber-50' : isExpired ? 'border-red-300 bg-red-50' : ''
    }`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-slate-800">{lease.propertyName}</h3>
            <span className={`text-xs font-medium px-2 py-0.5 rounded border ${getStatusColor(lease.status)}`}>
              {lease.status}
            </span>
            {isExpiringSoon && <AlertTriangle size={14} className="text-amber-500" />}
            {isExpired && <AlertTriangle size={14} className="text-red-500" />}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <User size={14} />
              <span>{lease.tenant}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign size={14} />
              <span className="font-medium">${lease.rent.toLocaleString()}/mo</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 rounded"
          >
            <Edit size={14} className="text-slate-500" />
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
              <button
                onClick={() => { onEdit(lease); setIsMenuOpen(false); }}
                className="w-full px-3 py-1.5 text-left text-xs hover:bg-slate-50 text-slate-700"
              >
                Edit
              </button>
              <button
                onClick={() => { onDelete(lease.id); setIsMenuOpen(false); }}
                className="w-full px-3 py-1.5 text-left text-xs hover:bg-slate-50 text-red-600"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500">
          <div className="flex items-center gap-1 mb-1">
            <Calendar size={12} />
            <span>{format(new Date(lease.startDate), 'MMM d, yyyy')} - {format(new Date(lease.endDate), 'MMM d, yyyy')}</span>
          </div>
          {daysUntilExpiry !== null && (
            <div className={`font-medium ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-amber-600' : 'text-slate-600'}`}>
              {isExpired ? `Expired ${Math.abs(daysUntilExpiry)} days ago` : 
               isExpiringSoon ? `Expires in ${daysUntilExpiry} days` : 
               `${daysUntilExpiry} days remaining`}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {getRenewalBadge(lease.renewalStatus)}
          
          {lease.status === 'expiring' && lease.renewalStatus !== 'Sent' && lease.renewalStatus !== 'Signed' && (
            <button
              onClick={() => onInitiateRenewal(lease.id)}
              className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center gap-1"
            >
              <RefreshCw size={10} />
              Renew
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface LeaseModalProps {
  lease?: EnhancedLease;
  isOpen: boolean;
  onClose: () => void;
  onSave: (lease: Omit<EnhancedLease, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'version'>) => void;
}

const LeaseModal: React.FC<LeaseModalProps> = ({ lease, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    propertyId: '',
    propertyName: '',
    tenantId: '',
    tenant: '',
    startDate: '',
    endDate: '',
    rent: '',
    status: 'draft' as LeaseStatus,
    renewalStatus: 'None' as EnhancedLease['renewalStatus'],
    renewalTerms: '',
    securityDeposit: '',
    workflowId: ''
  });

  useEffect(() => {
    if (lease) {
      setFormData({
        propertyId: lease.propertyId,
        propertyName: lease.propertyName,
        tenantId: lease.tenantId,
        tenant: lease.tenant,
        startDate: lease.startDate,
        endDate: lease.endDate,
        rent: lease.rent.toString(),
        status: lease.status,
        renewalStatus: lease.renewalStatus || 'None',
        renewalTerms: lease.renewalTerms || '',
        securityDeposit: lease.securityDeposit.toString(),
        workflowId: lease.workflowId || ''
      });
    }
  }, [lease]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      rent: parseFloat(formData.rent),
      securityDeposit: parseFloat(formData.securityDeposit)
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          {lease ? 'Edit Lease' : 'Create New Lease'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Property Name</label>
              <input
                type="text"
                required
                value={formData.propertyName}
                onChange={(e) => setFormData(prev => ({ ...prev, propertyName: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Property ID</label>
              <input
                type="text"
                value={formData.propertyId}
                onChange={(e) => setFormData(prev => ({ ...prev, propertyId: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tenant Name</label>
              <input
                type="text"
                required
                value={formData.tenant}
                onChange={(e) => setFormData(prev => ({ ...prev, tenant: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tenant ID</label>
              <input
                type="text"
                value={formData.tenantId}
                onChange={(e) => setFormData(prev => ({ ...prev, tenantId: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Rent</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.rent}
                onChange={(e) => setFormData(prev => ({ ...prev, rent: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Security Deposit</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.securityDeposit}
                onChange={(e) => setFormData(prev => ({ ...prev, securityDeposit: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as LeaseStatus }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="expiring">Expiring</option>
                <option value="expired">Expired</option>
                <option value="renewed">Renewed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Renewal Status</label>
              <select
                value={formData.renewalStatus}
                onChange={(e) => setFormData(prev => ({ ...prev, renewalStatus: e.target.value as EnhancedLease['renewalStatus'] }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="None">None</option>
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Negotiating">Negotiating</option>
                <option value="Signed">Signed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Renewal Terms</label>
            <textarea
              value={formData.renewalTerms}
              onChange={(e) => setFormData(prev => ({ ...prev, renewalTerms: e.target.value }))}
              rows={2}
              placeholder="Optional renewal terms and conditions"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              {lease ? 'Update' : 'Create'} Lease
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg hover:bg-slate-300 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const LeaseManager: React.FC = () => {
  const { 
    leases, 
    createLease, 
    updateLease, 
    deleteLease, 
    updateLeaseStatus, 
    initiateRenewal,
    getLeasesByStatus,
    getLeasesExpiringWithin,
    isLoading, 
    error 
  } = useLeaseStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLease, setEditingLease] = useState<EnhancedLease | undefined>();
  const [filterStatus, setFilterStatus] = useState<LeaseStatus | 'all'>('all');
  const [showExpiringOnly, setShowExpiringOnly] = useState(false);

  // Auto-check for expiring leases
  useEffect(() => {
    const checkInterval = setInterval(() => {
      // This would typically be called by a backend job
      // For demo purposes, we'll check periodically
      console.log('Checking for expiring leases...');
    }, 24 * 60 * 60 * 1000); // Daily

    return () => clearInterval(checkInterval);
  }, []);

  const filteredLeases = React.useMemo(() => {
    let filtered = leases;
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(lease => lease.status === filterStatus);
    }
    
    if (showExpiringOnly) {
      filtered = getLeasesExpiringWithin(60);
    }
    
    return filtered.sort((a, b) => {
      // Sort by expiry date (expiring leases first)
      const aDays = differenceInDays(new Date(a.endDate), new Date());
      const bDays = differenceInDays(new Date(b.endDate), new Date());
      return aDays - bDays;
    });
  }, [leases, filterStatus, showExpiringOnly, getLeasesExpiringWithin]);

  const handleCreateLease = async (leaseData: Omit<EnhancedLease, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'version'>) => {
    try {
      await createLease(leaseData);
    } catch (error) {
      console.error('Failed to create lease:', error);
    }
  };

  const handleEditLease = (lease: EnhancedLease) => {
    setEditingLease(lease);
    setIsModalOpen(true);
  };

  const handleDeleteLease = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this lease?')) {
      try {
        await deleteLease(id);
      } catch (error) {
        console.error('Failed to delete lease:', error);
      }
    }
  };

  const handleSaveLease = async (leaseData: Omit<EnhancedLease, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'version'>) => {
    try {
      if (editingLease) {
        await updateLease(editingLease.id, leaseData);
      } else {
        await createLease(leaseData);
      }
      setEditingLease(undefined);
    } catch (error) {
      console.error('Failed to save lease:', error);
    }
  };

  const handleInitiateRenewal = async (leaseId: string) => {
    try {
      await initiateRenewal(leaseId);
      alert('Renewal workflow initiated successfully!');
    } catch (error) {
      console.error('Failed to initiate renewal:', error);
    }
  };

  const stats = {
    total: leases.length,
    active: getLeasesByStatus('active').length,
    expiring: getLeasesExpiringWithin(60).length,
    expired: getLeasesByStatus('expired').length
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Lease Management</h2>
        <button
          onClick={() => { setEditingLease(undefined); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
        >
          <Plus size={16} />
          New Lease
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          <p className="text-xs text-slate-500 uppercase font-bold">Total Leases</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          <p className="text-xs text-slate-500 uppercase font-bold">Active</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-2xl font-bold text-amber-600">{stats.expiring}</p>
          <p className="text-xs text-slate-500 uppercase font-bold">Expiring (60d)</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
          <p className="text-xs text-slate-500 uppercase font-bold">Expired</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as LeaseStatus | 'all')}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="expiring">Expiring</option>
              <option value="expired">Expired</option>
              <option value="renewed">Renewed</option>
            </select>
          </div>
          
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showExpiringOnly}
              onChange={(e) => setShowExpiringOnly(e.target.checked)}
              className="rounded"
            />
            Show only expiring (60 days)
          </label>
        </div>
      </div>

      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-700">Loading leases...</p>
        </div>
      )}

      {/* Lease List */}
      <div className="space-y-4">
        {filteredLeases.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <p className="text-slate-500">No leases found matching current filters.</p>
          </div>
        ) : (
          filteredLeases.map(lease => (
            <LeaseCard
              key={lease.id}
              lease={lease}
              onEdit={handleEditLease}
              onDelete={handleDeleteLease}
              onStatusChange={updateLeaseStatus}
              onInitiateRenewal={handleInitiateRenewal}
            />
          ))
        )}
      </div>

      <LeaseModal
        lease={editingLease}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingLease(undefined); }}
        onSave={handleSaveLease}
      />
    </div>
  );
};

export default LeaseManager;
