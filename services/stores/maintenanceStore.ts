import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MaintenanceRequest, MaintenanceStatus, Priority, EntityAuditTrail, PendingOperation, ConflictResolution } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface MaintenanceState {
  requests: MaintenanceRequest[];
  auditTrail: EntityAuditTrail[];
  pendingOperations: PendingOperation[];
  conflicts: ConflictResolution[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createMaintenanceRequest: (request: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'version'>) => Promise<string>;
  updateMaintenanceRequest: (id: string, updates: Partial<MaintenanceRequest>) => Promise<void>;
  deleteMaintenanceRequest: (id: string) => Promise<void>;
  updateMaintenanceStatus: (id: string, newStatus: MaintenanceStatus) => Promise<void>;
  bulkUpdateRequests: (ids: string[], updates: Partial<MaintenanceRequest>) => Promise<void>;
  
  // Cost management
  updateCost: (id: string, costType: 'estimate' | 'actual', amount: number) => Promise<void>;
  checkCostOverruns: () => MaintenanceRequest[];
  
  // Real-time sync
  syncRequests: (requests: MaintenanceRequest[]) => void;
  resolveConflict: (conflictId: string, resolution: 'keep_local' | 'accept_remote' | 'manual_merge') => void;
  
  // Utility
  getRequestsByStatus: (status: MaintenanceStatus) => MaintenanceRequest[];
  getRequestsByPriority: (priority: Priority) => MaintenanceRequest[];
  getRequestsByProperty: (propertyId: string) => MaintenanceRequest[];
  getRequestById: (id: string) => MaintenanceRequest | undefined;
  getOverdueRequests: () => MaintenanceRequest[];
}

const MAINTENANCE_STATUS_TRANSITIONS: Record<MaintenanceStatus, MaintenanceStatus[]> = {
  submitted: ['assigned', 'cancelled'],
  assigned: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [], // Terminal state
  cancelled: [] // Terminal state
};

const PRIORITY_ORDER: Record<Priority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1
};

export const useMaintenanceStore = create<MaintenanceState>()(
  persist(
    (set, get) => ({
      requests: [],
      auditTrail: [],
      pendingOperations: [],
      conflicts: [],
      isLoading: false,
      error: null,

      createMaintenanceRequest: async (requestData) => {
        set({ isLoading: true, error: null });
        
        try {
          const now = new Date().toISOString();
          const request: MaintenanceRequest = {
            ...requestData,
            id: uuidv4(),
            createdAt: now,
            updatedAt: now,
            createdBy: 'current-user',
            version: 1,
            status: requestData.status || 'submitted'
          };

          // Optimistic update
          set(state => ({
            requests: [...state.requests, request],
            auditTrail: [...state.auditTrail, {
              id: uuidv4(),
              entityType: 'maintenance',
              entityId: request.id,
              timestamp: now,
              userId: request.createdBy,
              operation: 'create',
              newValue: request
            }]
          }));

          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 300));
          
          return request.id;
        } catch (error) {
          set({ error: 'Failed to create maintenance request' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateMaintenanceRequest: async (id, updates) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentState = get();
          const existingRequest = currentState.requests.find(r => r.id === id);
          
          if (!existingRequest) {
            throw new Error('Maintenance request not found');
          }

          // Check for conflicts
          if (updates.version && existingRequest.version !== updates.version) {
            const conflict: ConflictResolution = {
              entityType: 'maintenance',
              entityId: id,
              localVersion: existingRequest,
              remoteVersion: updates,
              timestamp: new Date().toISOString()
            };
            
            set(state => ({
              conflicts: [...state.conflicts, conflict],
              error: 'Conflict detected. Please resolve the conflict.'
            }));
            return;
          }

          const updatedRequest: MaintenanceRequest = {
            ...existingRequest,
            ...updates,
            updatedAt: new Date().toISOString(),
            version: existingRequest.version + 1
          };

          // Optimistic update
          set(state => ({
            requests: state.requests.map(r => r.id === id ? updatedRequest : r),
            auditTrail: [...state.auditTrail, {
              id: uuidv4(),
              entityType: 'maintenance',
              entityId: id,
              timestamp: updatedRequest.updatedAt,
              userId: 'current-user',
              operation: 'update',
              oldValue: existingRequest,
              newValue: updatedRequest
            }]
          }));

          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          set({ error: 'Failed to update maintenance request' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteMaintenanceRequest: async (id) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentState = get();
          const existingRequest = currentState.requests.find(r => r.id === id);
          
          if (!existingRequest) {
            throw new Error('Maintenance request not found');
          }

          // Check if request is in progress
          if (existingRequest.status === 'in_progress') {
            set({ error: 'Cannot delete maintenance request that is in progress' });
            return;
          }

          // Optimistic update
          set(state => ({
            requests: state.requests.filter(r => r.id !== id),
            auditTrail: [...state.auditTrail, {
              id: uuidv4(),
              entityType: 'maintenance',
              entityId: id,
              timestamp: new Date().toISOString(),
              userId: 'current-user',
              operation: 'delete',
              oldValue: existingRequest
            }]
          }));

          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          set({ error: 'Failed to delete maintenance request' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateMaintenanceStatus: async (id, newStatus) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentState = get();
          const existingRequest = currentState.requests.find(r => r.id === id);
          
          if (!existingRequest) {
            throw new Error('Maintenance request not found');
          }

          // Validate status transition
          const validTransitions = MAINTENANCE_STATUS_TRANSITIONS[existingRequest.status];
          if (!validTransitions.includes(newStatus)) {
            set({ 
              error: `Cannot transition from ${existingRequest.status} to ${newStatus}. Valid transitions: ${validTransitions.join(', ')}`
            });
            return;
          }

          // Special handling for completion
          if (newStatus === 'completed') {
            await get().updateMaintenanceRequest(id, {
              status: newStatus,
              completionDate: new Date().toISOString()
            });
          } else {
            await get().updateMaintenanceRequest(id, { status: newStatus });
          }
        } catch (error) {
          set({ error: 'Failed to update maintenance status' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      bulkUpdateRequests: async (ids, updates) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentState = get();
          const updatedRequests: MaintenanceRequest[] = [];
          const auditEntries: EntityAuditTrail[] = [];

          for (const id of ids) {
            const existingRequest = currentState.requests.find(r => r.id === id);
            if (!existingRequest) continue;

            const updatedRequest: MaintenanceRequest = {
              ...existingRequest,
              ...updates,
              updatedAt: new Date().toISOString(),
              version: existingRequest.version + 1
            };

            updatedRequests.push(updatedRequest);
            
            auditEntries.push({
              id: uuidv4(),
              entityType: 'maintenance',
              entityId: id,
              timestamp: updatedRequest.updatedAt,
              userId: 'current-user',
              operation: 'update',
              oldValue: existingRequest,
              newValue: updatedRequest
            });
          }

          // Optimistic update
          set(state => ({
            requests: state.requests.map(r => {
              const updated = updatedRequests.find(ur => ur.id === r.id);
              return updated || r;
            }),
            auditTrail: [...state.auditTrail, ...auditEntries]
          }));

          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          set({ error: 'Failed to bulk update maintenance requests' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateCost: async (id, costType, amount) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentState = get();
          const existingRequest = currentState.requests.find(r => r.id === id);
          
          if (!existingRequest) {
            throw new Error('Maintenance request not found');
          }

          const updateData = costType === 'estimate' 
            ? { costEstimate: amount }
            : { actualCost: amount };

          await get().updateMaintenanceRequest(id, updateData);

          // Check for cost overrun
          if (costType === 'actual' && existingRequest.costEstimate) {
            const overrunPercentage = ((amount - existingRequest.costEstimate) / existingRequest.costEstimate) * 100;
            
            if (overrunPercentage > 20) {
              // TODO: Trigger cost overrun notification
              console.warn(`Cost overrun detected for request ${id}: ${overrunPercentage.toFixed(1)}%`);
            }
          }
        } catch (error) {
          set({ error: 'Failed to update maintenance cost' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      checkCostOverruns: () => {
        const currentState = get();
        
        return currentState.requests.filter(request => {
          if (!request.costEstimate || !request.actualCost) return false;
          
          const overrunPercentage = ((request.actualCost - request.costEstimate) / request.costEstimate) * 100;
          return overrunPercentage > 20;
        });
      },

      syncRequests: (requests) => {
        set(state => {
          const mergedRequests = [...state.requests];
          const newConflicts: ConflictResolution[] = [];

          requests.forEach(remoteRequest => {
            const localIndex = mergedRequests.findIndex(r => r.id === remoteRequest.id);
            
            if (localIndex >= 0) {
              const localRequest = mergedRequests[localIndex];
              
              if (localRequest.version !== remoteRequest.version && 
                  localRequest.updatedAt !== remoteRequest.updatedAt) {
                // Conflict detected
                newConflicts.push({
                  entityType: 'maintenance',
                  entityId: remoteRequest.id,
                  localVersion: localRequest,
                  remoteVersion: remoteRequest,
                  timestamp: new Date().toISOString()
                });
              } else {
                // Update local version
                mergedRequests[localIndex] = remoteRequest;
              }
            } else {
              // Add new request
              mergedRequests.push(remoteRequest);
            }
          });

          return {
            requests: mergedRequests,
            conflicts: [...state.conflicts, ...newConflicts]
          };
        });
      },

      resolveConflict: (conflictId, resolution) => {
        set(state => {
          const conflict = state.conflicts.find(c => c.id === conflictId);
          if (!conflict) return state;

          let updatedRequests = [...state.requests];
          
          switch (resolution) {
            case 'keep_local':
              // Keep local version, no change needed
              break;
            case 'accept_remote':
              updatedRequests = updatedRequests.map(r => 
                r.id === conflict.entityId ? conflict.remoteVersion : r
              );
              break;
            case 'manual_merge':
              // TODO: Implement manual merge UI
              break;
          }

          return {
            requests: updatedRequests,
            conflicts: state.conflicts.filter(c => c.id !== conflictId)
          };
        });
      },

      getRequestsByStatus: (status) => {
        return get().requests.filter(r => r.status === status);
      },

      getRequestsByPriority: (priority) => {
        return get().requests.filter(r => r.priority === priority);
      },

      getRequestsByProperty: (propertyId) => {
        return get().requests.filter(r => r.propertyId === propertyId);
      },

      getRequestById: (id) => {
        return get().requests.find(r => r.id === id);
      },

      getOverdueRequests: () => {
        const now = new Date();
        
        return get().requests.filter(request => {
          if (!request.scheduledDate || request.status === 'completed' || request.status === 'cancelled') {
            return false;
          }
          
          const scheduledDate = new Date(request.scheduledDate);
          return scheduledDate < now;
        }).sort((a, b) => {
          // Sort by priority first, then by scheduled date
          const priorityDiff = PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
          if (priorityDiff !== 0) return priorityDiff;
          
          return new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime();
        });
      }
    }),
    {
      name: 'maintenance-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        requests: state.requests,
        auditTrail: state.auditTrail,
        pendingOperations: state.pendingOperations
      })
    }
  )
);
