import React, { useState, useMemo } from 'react';
import { Lease } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface LeaseManagerProps {
  leases: Lease[];
  expiringThreshold: number;
  showRenewalAlerts: boolean;
  onLeaseClick?: (lease: Lease) => void;
  onStatusChange?: (leaseId: string, newStatus: string) => void;
  onRenewalInitiated?: (leaseId: string) => void;
}

const LeaseManager: React.FC<LeaseManagerProps> = ({
  leases,
  expiringThreshold,
  showRenewalAlerts,
  onLeaseClick,
  onStatusChange,
  onRenewalInitiated
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('endDate');

  const filteredAndSortedLeases = useMemo(() => {
    let filtered = leases.filter(lease => {
      const matchesSearch = lease.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lease.tenantName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || lease.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Sort by selected field
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'endDate':
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        case 'rent':
          return b.rent - a.rent;
        case 'propertyName':
          return a.propertyName.localeCompare(b.propertyName);
        case 'tenantName':
          return a.tenantName.localeCompare(b.tenantName);
        default:
          return 0;
      }
    });

    return filtered;
  }, [leases, searchTerm, statusFilter, sortBy]);

  const isExpiringSoon = (endDate: string) => {
    const daysUntilExpiry = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= expiringThreshold && daysUntilExpiry > 0;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expiring': return 'bg-orange-100 text-orange-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'renewed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRenewalStatusColor = (renewalStatus?: string) => {
    switch (renewalStatus) {
      case 'Signed': return 'bg-green-100 text-green-800';
      case 'Negotiating': return 'bg-yellow-100 text-yellow-800';
      case 'Sent': return 'bg-blue-100 text-blue-800';
      case 'Draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysUntilExpiry = (endDate: string) => {
    const days = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Expires today';
    if (days === 1) return 'Expires tomorrow';
    return `${days} days`;
  };

  const LeaseCard = ({ lease }: { lease: Lease }) => {
    const expiringSoon = isExpiringSoon(lease.endDate);
    
    return (
      <div 
        className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4"
        onClick={() => onLeaseClick?.(lease)}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{lease.propertyName}</h4>
            <p className="text-sm text-gray-600">{lease.tenantName}</p>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <Badge className={`text-xs ${getStatusColor(lease.status)}`}>
              {lease.status}
            </Badge>
            {expiringSoon && showRenewalAlerts && (
              <Badge className="text-xs bg-orange-500 text-white">
                ⚠️ Expiring Soon
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
          <div>
            <span className="text-gray-500">Monthly Rent:</span>
            <p className="font-semibold">${lease.rent.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-gray-500">Lease Period:</span>
            <p className="text-xs">
              {formatDate(lease.startDate)} - {formatDate(lease.endDate)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {getDaysUntilExpiry(lease.endDate)}
          </div>
          
          <div className="flex items-center space-x-2">
            {lease.renewalStatus && lease.renewalStatus !== 'None' && (
              <Badge className={`text-xs ${getRenewalStatusColor(lease.renewalStatus)}`}>
                {lease.renewalStatus}
              </Badge>
            )}
            
            {lease.status === 'expiring' && onRenewalInitiated && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onRenewalInitiated(lease.id);
                }}
              >
                Initiate Renewal
              </Button>
            )}
          </div>
        </div>

        {lease.securityDeposit && (
          <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
            Security Deposit: ${lease.securityDeposit.toLocaleString()}
          </div>
        )}
      </div>
    );
  };

  const stats = useMemo(() => {
    const active = leases.filter(l => l.status === 'active').length;
    const expiring = leases.filter(l => l.status === 'expiring').length;
    const expired = leases.filter(l => l.status === 'expired').length;
    const renewed = leases.filter(l => l.status === 'renewed').length;
    
    return { active, expiring, expired, renewed, total: leases.length };
  }, [leases]);

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Lease Manager</h2>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Leases</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-gray-600">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.expiring}</div>
              <div className="text-sm text-gray-600">Expiring</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
              <div className="text-sm text-gray-600">Expired</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.renewed}</div>
              <div className="text-sm text-gray-600">Renewed</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Search leases..."
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expiring">Expiring</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="renewed">Renewed</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="endDate">End Date</SelectItem>
              <SelectItem value="rent">Rent Amount</SelectItem>
              <SelectItem value="propertyName">Property</SelectItem>
              <SelectItem value="tenantName">Tenant</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lease Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSortedLeases.map(lease => (
          <LeaseCard key={lease.id} lease={lease} />
        ))}
      </div>

      {filteredAndSortedLeases.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No leases found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default LeaseManager;