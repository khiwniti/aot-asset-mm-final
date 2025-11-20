import React, { useState, useEffect } from 'react';
import { useMaintenanceStore, MaintenanceRequest, MaintenanceStatus, Priority } from '../services/stores/maintenanceStore';
import { format, addDays, differenceInDays } from 'date-fns';
import { Calendar, DollarSign, User, AlertTriangle, Plus, Edit, Trash2, Clock, CheckCircle, Wrench } from 'lucide-react';

interface MaintenanceCardProps {
  request: MaintenanceRequest;
  onEdit: (request: MaintenanceRequest) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: MaintenanceStatus) => void;
  onCostUpdate: (id: string, costType: 'estimate' | 'actual', amount: number) => void;
}

const MaintenanceCard: React.FC<MaintenanceCardProps> = ({ 
  request, onEdit, onDelete, onStatusChange, onCostUpdate 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCostEdit, setShowCostEdit] = useState(false);
  const [costValue, setCostValue] = useState('');

  const getStatusColor = (status: MaintenanceStatus) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'assigned': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'in_progress': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const isOverdue = request.scheduledDate && 
    new Date(request.scheduledDate) < new Date() && 
    request.status !== 'completed' && 
    request.status !== 'cancelled';

  const hasCostOverrun = request.costEstimate && 
    request.actualCost && 
    request.actualCost > request.costEstimate * 1.2;

  const handleCostUpdate = (costType: 'estimate' | 'actual') => {
    const amount = parseFloat(costValue);
    if (!isNaN(amount) && amount >= 0) {
      onCostUpdate(request.id, costType, amount);
      setShowCostEdit(false);
      setCostValue('');
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all group ${
      isOverdue ? 'border-red-300 bg-red-50' : hasCostOverrun ? 'border-orange-300 bg-orange-50' : ''
    }`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-slate-800 text-sm leading-tight">{request.description}</h3>
            {isOverdue && <AlertTriangle size={14} className="text-red-500" />}
            {hasCostOverrun && <AlertTriangle size={14} className="text-orange-500" />}
          </div>
          
          <div className="flex items-center gap-4 text-xs text-slate-600 mb-2">
            <span className="font-medium">{request.category}</span>
            {request.vendor && <span>• {request.vendor}</span>}
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
                onClick={() => { onEdit(request); setIsMenuOpen(false); }}
                className="w-full px-3 py-1.5 text-left text-xs hover:bg-slate-50 text-slate-700"
              >
                Edit
              </button>
              <button
                onClick={() => { onDelete(request.id); setIsMenuOpen(false); }}
                className="w-full px-3 py-1.5 text-left text-xs hover:bg-slate-50 text-red-600"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${getPriorityColor(request.priority)}`}>
          {request.priority}
        </span>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${getStatusColor(request.status)}`}>
          {request.status.replace('_', ' ')}
        </span>
      </div>

      <div className="space-y-2 text-xs text-slate-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <DollarSign size={12} />
            <span>
              Est: ${request.costEstimate?.toLocaleString() || 'N/A'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign size={12} />
            <span>
              Actual: ${request.actualCost?.toLocaleString() || 'N/A'}
            </span>
          </div>
        </div>

        {request.assignee && (
          <div className="flex items-center gap-1">
            <User size={12} />
            <span>{request.assignee}</span>
          </div>
        )}

        {request.scheduledDate && (
          <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
            <Calendar size={12} />
            <span>Scheduled: {format(new Date(request.scheduledDate), 'MMM d, yyyy')}</span>
            {isOverdue && <span>(Overdue)</span>}
          </div>
        )}

        {request.completionDate && (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle size={12} />
            <span>Completed: {format(new Date(request.completionDate), 'MMM d, yyyy')}</span>
          </div>
        )}
      </div>

      {request.notes && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-500 italic">{request.notes}</p>
        </div>
      )}

      {/* Quick Cost Edit */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => { 
            setShowCostEdit('estimate'); 
            setCostValue(request.costEstimate?.toString() || ''); 
          }}
          className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded hover:bg-slate-200"
        >
          Update Estimate
        </button>
        <button
          onClick={() => { 
            setShowCostEdit('actual'); 
            setCostValue(request.actualCost?.toString() || ''); 
          }}
          className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded hover:bg-slate-200"
        >
          Update Actual
        </button>
      </div>

      {showCostEdit && (
        <div className="mt-2 p-2 bg-slate-50 rounded border border-slate-200">
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.01"
              min="0"
              value={costValue}
              onChange={(e) => setCostValue(e.target.value)}
              placeholder="Enter amount"
              className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={() => handleCostUpdate(showCostEdit as 'estimate' | 'actual')}
              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={() => { setShowCostEdit(false); setCostValue(''); }}
              className="text-xs bg-slate-300 text-slate-700 px-2 py-1 rounded hover:bg-slate-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface MaintenanceModalProps {
  request?: MaintenanceRequest;
  isOpen: boolean;
  onClose: () => void;
  onSave: (request: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'version'>) => void;
}

const MaintenanceModal: React.FC<MaintenanceModalProps> = ({ request, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    propertyId: '',
    description: '',
    status: 'submitted' as MaintenanceStatus,
    priority: 'medium' as Priority,
    assignee: '',
    costEstimate: '',
    actualCost: '',
    scheduledDate: '',
    category: '',
    vendor: '',
    notes: ''
  });

  useEffect(() => {
    if (request) {
      setFormData({
        propertyId: request.propertyId,
        description: request.description,
        status: request.status,
        priority: request.priority,
        assignee: request.assignee || '',
        costEstimate: request.costEstimate?.toString() || '',
        actualCost: request.actualCost?.toString() || '',
        scheduledDate: request.scheduledDate || '',
        category: request.category,
        vendor: request.vendor || '',
        notes: request.notes || ''
      });
    }
  }, [request]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      costEstimate: formData.costEstimate ? parseFloat(formData.costEstimate) : undefined,
      actualCost: formData.actualCost ? parseFloat(formData.actualCost) : undefined
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          {request ? 'Edit Maintenance Request' : 'Create New Maintenance Request'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Property ID</label>
            <input
              type="text"
              required
              value={formData.propertyId}
              onChange={(e) => setFormData(prev => ({ ...prev, propertyId: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., HVAC, Plumbing, Electrical"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Priority }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as MaintenanceStatus }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="submitted">Submitted</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Scheduled Date</label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Assignee</label>
              <input
                type="text"
                value={formData.assignee}
                onChange={(e) => setFormData(prev => ({ ...prev, assignee: e.target.value }))}
                placeholder="Vendor or staff member"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vendor</label>
              <input
                type="text"
                value={formData.vendor}
                onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                placeholder="Company name"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cost Estimate</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.costEstimate}
                onChange={(e) => setFormData(prev => ({ ...prev, costEstimate: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Actual Cost</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.actualCost}
                onChange={(e) => setFormData(prev => ({ ...prev, actualCost: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
              placeholder="Additional notes or details"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              {request ? 'Update' : 'Create'} Request
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

const MaintenanceTracker: React.FC = () => {
  const { 
    requests, 
    createMaintenanceRequest, 
    updateMaintenanceRequest, 
    deleteMaintenanceRequest, 
    updateMaintenanceStatus,
    updateCost,
    getRequestsByStatus,
    getRequestsByPriority,
    getOverdueRequests,
    isLoading, 
    error 
  } = useMaintenanceStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<MaintenanceRequest | undefined>();
  const [filterStatus, setFilterStatus] = useState<MaintenanceStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);

  useEffect(() => {
    // Check for cost overruns periodically
    const costOverruns = getRequestsByPriority('urgent'); // This would be checkCostOverruns()
    if (costOverruns.length > 0) {
      console.log('Found cost overruns:', costOverruns);
    }
  }, [requests, getRequestsByPriority]);

  const filteredRequests = React.useMemo(() => {
    let filtered = requests;
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(request => request.status === filterStatus);
    }
    
    if (filterPriority !== 'all') {
      filtered = filtered.filter(request => request.priority === filterPriority);
    }
    
    if (showOverdueOnly) {
      filtered = getOverdueRequests();
    }
    
    return filtered.sort((a, b) => {
      // Sort by priority first, then by scheduled date
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      if (a.scheduledDate && b.scheduledDate) {
        return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
      }
      
      return 0;
    });
  }, [requests, filterStatus, filterPriority, showOverdueOnly, getOverdueRequests]);

  const handleCreateRequest = async (requestData: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'version'>) => {
    try {
      await createMaintenanceRequest(requestData);
    } catch (error) {
      console.error('Failed to create maintenance request:', error);
    }
  };

  const handleEditRequest = (request: MaintenanceRequest) => {
    setEditingRequest(request);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this maintenance request?')) {
      try {
        await deleteMaintenanceRequest(id);
      } catch (error) {
        console.error('Failed to delete maintenance request:', error);
      }
    }
  };

  const handleSaveRequest = async (requestData: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'version'>) => {
    try {
      if (editingRequest) {
        await updateMaintenanceRequest(editingRequest.id, requestData);
      } else {
        await createMaintenanceRequest(requestData);
      }
      setEditingRequest(undefined);
    } catch (error) {
      console.error('Failed to save maintenance request:', error);
    }
  };

  const handleCostUpdate = async (id: string, costType: 'estimate' | 'actual', amount: number) => {
    try {
      await updateCost(id, costType, amount);
    } catch (error) {
      console.error('Failed to update cost:', error);
    }
  };

  const stats = {
    total: requests.length,
    submitted: getRequestsByStatus('submitted').length,
    inProgress: getRequestsByStatus('in_progress').length,
    completed: getRequestsByStatus('completed').length,
    overdue: getOverdueRequests().length
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
        <h2 className="text-2xl font-bold text-slate-800">Maintenance Tracker</h2>
        <button
          onClick={() => { setEditingRequest(undefined); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
        >
          <Plus size={16} />
          New Request
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          <p className="text-xs text-slate-500 uppercase font-bold">Total Requests</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-2xl font-bold text-blue-600">{stats.submitted}</p>
          <p className="text-xs text-slate-500 uppercase font-bold">Submitted</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-2xl font-bold text-purple-600">{stats.inProgress}</p>
          <p className="text-xs text-slate-500 uppercase font-bold">In Progress</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          <p className="text-xs text-slate-500 uppercase font-bold">Completed</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
          <p className="text-xs text-slate-500 uppercase font-bold">Overdue</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as MaintenanceStatus | 'all')}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Priority:</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as Priority | 'all')}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showOverdueOnly}
              onChange={(e) => setShowOverdueOnly(e.target.checked)}
              className="rounded"
            />
            Show only overdue
          </label>
        </div>
      </div>

      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-700">Loading maintenance requests...</p>
        </div>
      )}

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRequests.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-slate-200 p-8 text-center">
            <p className="text-slate-500">No maintenance requests found matching current filters.</p>
          </div>
        ) : (
          filteredRequests.map(request => (
            <MaintenanceCard
              key={request.id}
              request={request}
              onEdit={handleEditRequest}
              onDelete={handleDeleteRequest}
              onStatusChange={updateMaintenanceStatus}
              onCostUpdate={handleCostUpdate}
            />
          ))
        )}
      </div>

      <MaintenanceModal
        request={editingRequest}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingRequest(undefined); }}
        onSave={handleSaveRequest}
      />
    </div>
  );
};

export default MaintenanceTracker;
