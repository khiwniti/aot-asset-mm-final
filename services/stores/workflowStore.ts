import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Workflow, WorkflowStatus, EntityAuditTrail, PendingOperation, ConflictResolution } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface WorkflowState {
  workflows: Workflow[];
  auditTrail: EntityAuditTrail[];
  pendingOperations: PendingOperation[];
  conflicts: ConflictResolution[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createWorkflow: (workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'version'>) => Promise<string>;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => Promise<void>;
  deleteWorkflow: (id: string) => Promise<void>;
  updateWorkflowStatus: (id: string, newStatus: WorkflowStatus) => Promise<void>;
  
  // Real-time sync
  syncWorkflows: (workflows: Workflow[]) => void;
  resolveConflict: (conflictId: string, resolution: 'keep_local' | 'accept_remote' | 'manual_merge') => void;
  
  // Utility
  getWorkflowsByStatus: (status: WorkflowStatus) => Workflow[];
  getWorkflowById: (id: string) => Workflow | undefined;
}

const WORKFLOW_STATUS_TRANSITIONS: Record<WorkflowStatus, WorkflowStatus[]> = {
  draft: ['active', 'archived'],
  active: ['paused', 'completed', 'archived'],
  paused: ['active', 'archived'],
  completed: ['archived'],
  archived: [] // No transitions from archived
};

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set, get) => ({
      workflows: [],
      auditTrail: [],
      pendingOperations: [],
      conflicts: [],
      isLoading: false,
      error: null,

      createWorkflow: async (workflowData) => {
        set({ isLoading: true, error: null });
        
        try {
          const now = new Date().toISOString();
          const workflow: Workflow = {
            ...workflowData,
            id: uuidv4(),
            createdAt: now,
            updatedAt: now,
            createdBy: 'current-user', // TODO: Get from auth context
            version: 1
          };

          // Optimistic update
          set(state => ({
            workflows: [...state.workflows, workflow],
            auditTrail: [...state.auditTrail, {
              id: uuidv4(),
              entityType: 'workflow',
              entityId: workflow.id,
              timestamp: now,
              userId: workflow.createdBy,
              operation: 'create',
              newValue: workflow
            }]
          }));

          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 300));
          
          return workflow.id;
        } catch (error) {
          set({ error: 'Failed to create workflow' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateWorkflow: async (id, updates) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentState = get();
          const existingWorkflow = currentState.workflows.find(w => w.id === id);
          
          if (!existingWorkflow) {
            throw new Error('Workflow not found');
          }

          // Check for conflicts
          if (existingWorkflow.version !== updates.version) {
            const conflict: ConflictResolution = {
              entityType: 'workflow',
              entityId: id,
              localVersion: existingWorkflow,
              remoteVersion: updates,
              timestamp: new Date().toISOString()
            };
            
            set(state => ({
              conflicts: [...state.conflicts, conflict],
              error: 'Conflict detected. Please resolve the conflict.'
            }));
            return;
          }

          const updatedWorkflow: Workflow = {
            ...existingWorkflow,
            ...updates,
            updatedAt: new Date().toISOString(),
            version: existingWorkflow.version + 1
          };

          // Optimistic update
          set(state => ({
            workflows: state.workflows.map(w => w.id === id ? updatedWorkflow : w),
            auditTrail: [...state.auditTrail, {
              id: uuidv4(),
              entityType: 'workflow',
              entityId: id,
              timestamp: updatedWorkflow.updatedAt,
              userId: 'current-user',
              operation: 'update',
              oldValue: existingWorkflow,
              newValue: updatedWorkflow
            }]
          }));

          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          set({ error: 'Failed to update workflow' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteWorkflow: async (id) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentState = get();
          const existingWorkflow = currentState.workflows.find(w => w.id === id);
          
          if (!existingWorkflow) {
            throw new Error('Workflow not found');
          }

          // Check for dependencies (tasks, etc.)
          const hasDependencies = false; // TODO: Check for dependent tasks
          
          if (hasDependencies) {
            set({ error: 'Cannot delete workflow with active tasks' });
            return;
          }

          // Optimistic update
          set(state => ({
            workflows: state.workflows.filter(w => w.id !== id),
            auditTrail: [...state.auditTrail, {
              id: uuidv4(),
              entityType: 'workflow',
              entityId: id,
              timestamp: new Date().toISOString(),
              userId: 'current-user',
              operation: 'delete',
              oldValue: existingWorkflow
            }]
          }));

          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          set({ error: 'Failed to delete workflow' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateWorkflowStatus: async (id, newStatus) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentState = get();
          const existingWorkflow = currentState.workflows.find(w => w.id === id);
          
          if (!existingWorkflow) {
            throw new Error('Workflow not found');
          }

          // Validate status transition
          const validTransitions = WORKFLOW_STATUS_TRANSITIONS[existingWorkflow.status];
          if (!validTransitions.includes(newStatus)) {
            set({ 
              error: `Cannot transition from ${existingWorkflow.status} to ${newStatus}. Valid transitions: ${validTransitions.join(', ')}`
            });
            return;
          }

          await get().updateWorkflow(id, { status: newStatus });
        } catch (error) {
          set({ error: 'Failed to update workflow status' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      syncWorkflows: (workflows) => {
        set(state => {
          const mergedWorkflows = [...state.workflows];
          const newConflicts: ConflictResolution[] = [];

          workflows.forEach(remoteWorkflow => {
            const localIndex = mergedWorkflows.findIndex(w => w.id === remoteWorkflow.id);
            
            if (localIndex >= 0) {
              const localWorkflow = mergedWorkflows[localIndex];
              
              if (localWorkflow.version !== remoteWorkflow.version && 
                  localWorkflow.updatedAt !== remoteWorkflow.updatedAt) {
                // Conflict detected
                newConflicts.push({
                  entityType: 'workflow',
                  entityId: remoteWorkflow.id,
                  localVersion: localWorkflow,
                  remoteVersion: remoteWorkflow,
                  timestamp: new Date().toISOString()
                });
              } else {
                // Update local version
                mergedWorkflows[localIndex] = remoteWorkflow;
              }
            } else {
              // Add new workflow
              mergedWorkflows.push(remoteWorkflow);
            }
          });

          return {
            workflows: mergedWorkflows,
            conflicts: [...state.conflicts, ...newConflicts]
          };
        });
      },

      resolveConflict: (conflictId, resolution) => {
        set(state => {
          const conflict = state.conflicts.find(c => c.id === conflictId);
          if (!conflict) return state;

          let updatedWorkflows = [...state.workflows];
          
          switch (resolution) {
            case 'keep_local':
              // Keep local version, no change needed
              break;
            case 'accept_remote':
              updatedWorkflows = updatedWorkflows.map(w => 
                w.id === conflict.entityId ? conflict.remoteVersion : w
              );
              break;
            case 'manual_merge':
              // TODO: Implement manual merge UI
              break;
          }

          return {
            workflows: updatedWorkflows,
            conflicts: state.conflicts.filter(c => c.id !== conflictId)
          };
        });
      },

      getWorkflowsByStatus: (status) => {
        return get().workflows.filter(w => w.status === status);
      },

      getWorkflowById: (id) => {
        return get().workflows.find(w => w.id === id);
      }
    }),
    {
      name: 'workflow-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        workflows: state.workflows,
        auditTrail: state.auditTrail,
        pendingOperations: state.pendingOperations
      })
    }
  )
);
