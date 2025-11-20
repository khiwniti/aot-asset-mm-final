import React, { useState, useMemo } from 'react';
import { MaintenanceRequest } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface MaintenanceTrackerProps {
  requests: MaintenanceRequest[];
  sortBy: 'priority' | 'date' | 'status';
  showCostOverrunAlerts: boolean;
  onRequestClick?: (request: MaintenanceRequest) => void;
  onStatusChange?: (requestId: string, newStatus: string, actualCost?: number) => void;
}

const MaintenanceTracker: React.FC<MaintenanceTrackerProps> = ({
  requests,
  sortBy,
  showCostOverrunAlerts,
  onRequestClick,
  onStatusChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [currentSortBy, setCurrentSortBy] = useState(sortBy);

  const filteredAndSortedRequests = useMemo(() => {
    let filtered = requests.filter(request => {
      const matchesSearch = request.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });

    // Sort by selected field
    filtered.sort((a, b) => {
      switch (currentSortBy) {
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return filtered;
  }, [requests, searchTerm, statusFilter, priorityFilter, currentSortBy]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'submitted': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const hasCostOverrun = (request: MaintenanceRequest) => {
    return showCostOverrunAlerts && 
           request.costEstimate && 
           request.actualCost && 
           request.actualCost > request.costEstimate * 1.2;
  };

  const getCostOverrunPercentage = (request: MaintenanceRequest) => {
    if (!request.costEstimate || !request.actualCost) return 0;
    return Math.round(((request.actualCost - request.costEstimate) / request.costEstimate) * 100);
  };

  const MaintenanceCard = ({ request }: { request: MaintenanceRequest }) => {
    const costOverrun = hasCostOverrun(request);
    const overrunPercentage = getCostOverrunPercentage(request);
    
    return (
      <div 
        className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4 ${
          costOverrun ? 'border-red-300 bg-red-50' : ''
        }`}
        onClick={() => onRequestClick?.(request)}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{getPriorityIcon(request.priority)}</span>
              <h4 className="font-semibold text-gray-900">{request.propertyName}</h4>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{request.description}</p>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <Badge className={`text-xs ${getPriorityColor(request.priority)}`}>
              {request.priority}
            </Badge>
            <Badge className={`text-xs ${getStatusColor(request.status)}`}>
              {request.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
          <div>
            <span className="text-gray-500">Category:</span>
            <p className="font-medium">{request.category}</p>
          </div>
          <div>
            <span className="text-gray-500">Created:</span>
            <p className="text-xs">{formatDate(request.createdAt)}</p>
          </div>
        </div>

        {/* Cost Information */}
        {(request.costEstimate || request.actualCost) && (
          <div className="mb-3 p-3 bg-gray-50 rounded border">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {request.costEstimate && (
                <div>
                  <span className="text-gray-500">Estimate:</span>
                  <p className="font-semibold">${request.costEstimate.toLocaleString()}</p>
                </div>
              )}
              {request.actualCost && (
                <div>
                  <span className="text-gray-500">Actual:</span>
                  <p className={`font-semibold ${costOverrun ? 'text-red-600' : 'text-green-600'}`}>
                    ${request.actualCost.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
            
            {costOverrun && (
              <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700">
                ⚠️ Cost overrun: +{overrunPercentage}% (${request.actualCost! - request.costEstimate!})
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
            {request.assignee && (
              <span>👤 {request.assignee}</span>
            )}
            {request.scheduledDate && (
              <span>📅 {formatDate(request.scheduledDate)}</span>
            )}
            {request.completionDate && (
              <span>✅ {formatDate(request.completionDate)}</span>
            )}
          </div>
          
          {request.status === 'submitted' && onStatusChange && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(request.id, 'assigned');
              }}
            >
              Assign
            </Button>
          )}
          
          {request.status === 'assigned' && onStatusChange && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(request.id, 'in_progress');
              }}
            >
              Start Work
            </Button>
          )}
          
          {request.status === 'in_progress' && onStatusChange && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(request.id, 'completed');
              }}
            >
              Complete
            </Button>
          )}
        </div>
      </div>
    );
  };

  const stats = useMemo(() => {
    const submitted = requests.filter(r => r.status === 'submitted').length;
    const assigned = requests.filter(r => r.status === 'assigned').length;
    const inProgress = requests.filter(r => r.status === 'in_progress').length;
    const completed = requests.filter(r => r.status === 'completed').length;
    const urgent = requests.filter(r => r.priority === 'urgent').length;
    const costOverruns = requests.filter(r => hasCostOverrun(r)).length;
    
    return { 
      submitted, 
      assigned, 
      inProgress, 
      completed, 
      urgent, 
      costOverruns, 
      total: requests.length 
    };
  }, [requests, showCostOverrunAlerts]);

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Tracker</h2>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.submitted}</div>
              <div className="text-sm text-gray-600">Submitted</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.assigned}</div>
              <div className="text-sm text-gray-600">Assigned</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.inProgress}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
              <div className="text-sm text-gray-600">Urgent</div>
            </CardContent>
          </Card>
        </div>

        {showCostOverrunAlerts && stats.costOverruns > 0 && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-lg mr-2">⚠️</span>
              <div>
                <h4 className="font-semibold text-red-800">Cost Overrun Alert</h4>
                <p className="text-sm text-red-700">
                  {stats.costOverruns} maintenance request{stats.costOverruns !== 1 ? 's' : ''} have cost overruns exceeding 20% of estimates.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={currentSortBy} onValueChange={setCurrentSortBy}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Maintenance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSortedRequests.map(request => (
          <MaintenanceCard key={request.id} request={request} />
        ))}
      </div>

      {filteredAndSortedRequests.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No maintenance requests found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default MaintenanceTracker;