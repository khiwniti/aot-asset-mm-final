import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { EnhancedLease, LeaseStatus, EntityAuditTrail, PendingOperation, ConflictResolution } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { addDays, isAfter, isBefore, differenceInDays } from 'date-fns';

interface LeaseState {
  leases: EnhancedLease[];
  auditTrail: EntityAuditTrail[];
  pendingOperations: PendingOperation[];
  conflicts: ConflictResolution[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createLease: (lease: Omit<EnhancedLease, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'version'>) => Promise<string>;
  updateLease: (id: string, updates: Partial<EnhancedLease>) => Promise<void>;
  deleteLease: (id: string) => Promise<void>;
  updateLeaseStatus: (id: string, newStatus: LeaseStatus) => Promise<void>;
  
  // Lease lifecycle management
  checkAndUpdateExpiringLeases: () => Promise<void>;
  initiateRenewal: (leaseId: string, renewalTerms?: string) => Promise<string>; // Returns workflow ID
  
  // Real-time sync
  syncLeases: (leases: EnhancedLease[]) => void;
  resolveConflict: (conflictId: string, resolution: 'keep_local' | 'accept_remote' | 'manual_merge') => void;
  
  // Utility
  getLeasesByStatus: (status: LeaseStatus) => EnhancedLease[];
  getLeasesExpiringWithin: (days: number) => EnhancedLease[];
  getLeaseById: (id: string) => EnhancedLease | undefined;
  getLeasesByProperty: (propertyId: string) => EnhancedLease[];
}

const LEASE_STATUS_TRANSITIONS: Record<LeaseStatus, LeaseStatus[]> = {
  draft: ['active'],
  active: ['expiring', 'expired', 'renewed'],
  expiring: ['expired', 'renewed'],
  expired: ['renewed'],
  renewed: [] // Terminal state
};

export const useLeaseStore = create<LeaseState>()(
  persist(
    (set, get) => ({
      leases: [],
      auditTrail: [],
      pendingOperations: [],
      conflicts: [],
      isLoading: false,
      error: null,

      createLease: async (leaseData) => {
        set({ isLoading: true, error: null });
        
        try {
          const now = new Date().toISOString();
          const lease: EnhancedLease = {
            ...leaseData,
            id: uuidv4(),
            createdAt: now,
            updatedAt: now,
            createdBy: 'current-user',
            version: 1,
            status: leaseData.status || 'draft'
          };

          // Optimistic update
          set(state => ({
            leases: [...state.leases, lease],
            auditTrail: [...state.auditTrail, {
              id: uuidv4(),
              entityType: 'lease',
              entityId: lease.id,
              timestamp: now,
              userId: lease.createdBy,
              operation: 'create',
              newValue: lease
            }]
          }));

          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 300));
          
          return lease.id;
        } catch (error) {
          set({ error: 'Failed to create lease' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateLease: async (id, updates) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentState = get();
          const existingLease = currentState.leases.find(l => l.id === id);
          
          if (!existingLease) {
            throw new Error('Lease not found');
          }

          // Check for conflicts
          if (updates.version && existingLease.version !== updates.version) {
            const conflict: ConflictResolution = {
              entityType: 'lease',
              entityId: id,
              localVersion: existingLease,
              remoteVersion: updates,
              timestamp: new Date().toISOString()
            };
            
            set(state => ({
              conflicts: [...state.conflicts, conflict],
              error: 'Conflict detected. Please resolve the conflict.'
            }));
            return;
          }

          const updatedLease: EnhancedLease = {
            ...existingLease,
            ...updates,
            updatedAt: new Date().toISOString(),
            version: existingLease.version + 1
          };

          // Optimistic update
          set(state => ({
            leases: state.leases.map(l => l.id === id ? updatedLease : l),
            auditTrail: [...state.auditTrail, {
              id: uuidv4(),
              entityType: 'lease',
              entityId: id,
              timestamp: updatedLease.updatedAt,
              userId: 'current-user',
              operation: 'update',
              oldValue: existingLease,
              newValue: updatedLease
            }]
          }));

          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          set({ error: 'Failed to update lease' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteLease: async (id) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentState = get();
          const existingLease = currentState.leases.find(l => l.id === id);
          
          if (!existingLease) {
            throw new Error('Lease not found');
          }

          // Check if lease has active workflows
          const hasActiveWorkflows = false; // TODO: Check workflow store
          
          if (hasActiveWorkflows) {
            set({ error: 'Cannot delete lease with active workflows' });
            return;
          }

          // Optimistic update
          set(state => ({
            leases: state.leases.filter(l => l.id !== id),
            auditTrail: [...state.auditTrail, {
              id: uuidv4(),
              entityType: 'lease',
              entityId: id,
              timestamp: new Date().toISOString(),
              userId: 'current-user',
              operation: 'delete',
              oldValue: existingLease
            }]
          }));

          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          set({ error: 'Failed to delete lease' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateLeaseStatus: async (id, newStatus) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentState = get();
          const existingLease = currentState.leases.find(l => l.id === id);
          
          if (!existingLease) {
            throw new Error('Lease not found');
          }

          // Validate status transition
          const validTransitions = LEASE_STATUS_TRANSITIONS[existingLease.status];
          if (!validTransitions.includes(newStatus)) {
            set({ 
              error: `Cannot transition from ${existingLease.status} to ${newStatus}. Valid transitions: ${validTransitions.join(', ')}`
            });
            return;
          }

          await get().updateLease(id, { status: newStatus });
        } catch (error) {
          set({ error: 'Failed to update lease status' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      checkAndUpdateExpiringLeases: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const currentState = get();
          const now = new Date();
          const updates: Array<{ id: string; status: LeaseStatus }> = [];

          currentState.leases.forEach(lease => {
            if (lease.status === 'active') {
              const endDate = new Date(lease.endDate);
              const daysUntilExpiry = differenceInDays(endDate, now);

              if (daysUntilExpiry <= 0) {
                // Lease has expired
                updates.push({ id: lease.id, status: 'expired' });
              } else if (daysUntilExpiry <= 60) {
                // Lease is expiring within 60 days
                updates.push({ id: lease.id, status: 'expiring' });
              }
            }
          });

          // Apply updates
          for (const update of updates) {
            await get().updateLeaseStatus(update.id, update.status);
          }

        } catch (error) {
          set({ error: 'Failed to check expiring leases' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      initiateRenewal: async (leaseId, renewalTerms) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentState = get();
          const lease = currentState.leases.find(l => l.id === leaseId);
          
          if (!lease) {
            throw new Error('Lease not found');
          }

          // TODO: Create renewal workflow using workflow store
          const workflowId = uuidv4(); // Mock workflow ID

          // Update lease with workflow reference
          await get().updateLease(leaseId, {
            workflowId,
            renewalTerms
          });

          // Update renewal status
          await get().updateLease(leaseId, {
            renewalStatus: 'Draft'
          });

          return workflowId;
        } catch (error) {
          set({ error: 'Failed to initiate lease renewal' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      syncLeases: (leases) => {
        set(state => {
          const mergedLeases = [...state.leases];
          const newConflicts: ConflictResolution[] = [];

          leases.forEach(remoteLease => {
            const localIndex = mergedLeases.findIndex(l => l.id === remoteLease.id);
            
            if (localIndex >= 0) {
              const localLease = mergedLeases[localIndex];
              
              if (localLease.version !== remoteLease.version && 
                  localLease.updatedAt !== remoteLease.updatedAt) {
                // Conflict detected
                newConflicts.push({
                  entityType: 'lease',
                  entityId: remoteLease.id,
                  localVersion: localLease,
                  remoteVersion: remoteLease,
                  timestamp: new Date().toISOString()
                });
              } else {
                // Update local version
                mergedLeases[localIndex] = remoteLease;
              }
            } else {
              // Add new lease
              mergedLeases.push(remoteLease);
            }
          });

          return {
            leases: mergedLeases,
            conflicts: [...state.conflicts, ...newConflicts]
          };
        });
      },

      resolveConflict: (conflictId, resolution) => {
        set(state => {
          const conflict = state.conflicts.find(c => c.id === conflictId);
          if (!conflict) return state;

          let updatedLeases = [...state.leases];
          
          switch (resolution) {
            case 'keep_local':
              // Keep local version, no change needed
              break;
            case 'accept_remote':
              updatedLeases = updatedLeases.map(l => 
                l.id === conflict.entityId ? conflict.remoteVersion : l
              );
              break;
            case 'manual_merge':
              // TODO: Implement manual merge UI
              break;
          }

          return {
            leases: updatedLeases,
            conflicts: state.conflicts.filter(c => c.id !== conflictId)
          };
        });
      },

      getLeasesByStatus: (status) => {
        return get().leases.filter(l => l.status === status);
      },

      getLeasesExpiringWithin: (days) => {
        const now = new Date();
        const cutoffDate = addDays(now, days);
        
        return get().leases.filter(lease => {
          const endDate = new Date(lease.endDate);
          return isAfter(endDate, now) && isBefore(endDate, cutoffDate);
        });
      },

      getLeaseById: (id) => {
        return get().leases.find(l => l.id === id);
      },

      getLeasesByProperty: (propertyId) => {
        return get().leases.filter(l => l.propertyId === propertyId);
      }
    }),
    {
      name: 'lease-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        leases: state.leases,
        auditTrail: state.auditTrail,
        pendingOperations: state.pendingOperations
      })
    }
  )
);
