import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Task, TaskStatus, EntityAuditTrail, PendingOperation, ConflictResolution } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface TaskState {
  tasks: Task[];
  auditTrail: EntityAuditTrail[];
  pendingOperations: PendingOperation[];
  conflicts: ConflictResolution[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'version'>) => Promise<string>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateTaskStatus: (id: string, newStatus: TaskStatus) => Promise<void>;
  bulkUpdateTasks: (ids: string[], updates: Partial<Task>) => Promise<void>;
  
  // Dependencies
  addTaskDependency: (taskId: string, dependencyId: string) => Promise<void>;
  removeTaskDependency: (taskId: string, dependencyId: string) => Promise<void>;
  
  // Real-time sync
  syncTasks: (tasks: Task[]) => void;
  resolveConflict: (conflictId: string, resolution: 'keep_local' | 'accept_remote' | 'manual_merge') => void;
  
  // Utility
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTasksByWorkflow: (workflowId: string) => Task[];
  getTaskById: (id: string) => Task | undefined;
  getBlockedTasks: () => Task[];
}

const TASK_STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  todo: ['in_progress', 'completed'],
  in_progress: ['blocked', 'completed', 'todo'],
  blocked: ['in_progress', 'todo'],
  completed: ['todo', 'in_progress'] // Allow reopening
};

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      auditTrail: [],
      pendingOperations: [],
      conflicts: [],
      isLoading: false,
      error: null,

      createTask: async (taskData) => {
        set({ isLoading: true, error: null });
        
        try {
          const now = new Date().toISOString();
          const task: Task = {
            ...taskData,
            id: uuidv4(),
            createdAt: now,
            updatedAt: now,
            createdBy: 'current-user',
            version: 1,
            dependencies: taskData.dependencies || []
          };

          // Optimistic update
          set(state => ({
            tasks: [...state.tasks, task],
            auditTrail: [...state.auditTrail, {
              id: uuidv4(),
              entityType: 'task',
              entityId: task.id,
              timestamp: now,
              userId: task.createdBy,
              operation: 'create',
              newValue: task
            }]
          }));

          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 300));
          
          return task.id;
        } catch (error) {
          set({ error: 'Failed to create task' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateTask: async (id, updates) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentState = get();
          const existingTask = currentState.tasks.find(t => t.id === id);
          
          if (!existingTask) {
            throw new Error('Task not found');
          }

          // Check for conflicts
          if (updates.version && existingTask.version !== updates.version) {
            const conflict: ConflictResolution = {
              entityType: 'task',
              entityId: id,
              localVersion: existingTask,
              remoteVersion: updates,
              timestamp: new Date().toISOString()
            };
            
            set(state => ({
              conflicts: [...state.conflicts, conflict],
              error: 'Conflict detected. Please resolve the conflict.'
            }));
            return;
          }

          const updatedTask: Task = {
            ...existingTask,
            ...updates,
            updatedAt: new Date().toISOString(),
            version: existingTask.version + 1
          };

          // Optimistic update
          set(state => ({
            tasks: state.tasks.map(t => t.id === id ? updatedTask : t),
            auditTrail: [...state.auditTrail, {
              id: uuidv4(),
              entityType: 'task',
              entityId: id,
              timestamp: updatedTask.updatedAt,
              userId: 'current-user',
              operation: 'update',
              oldValue: existingTask,
              newValue: updatedTask
            }]
          }));

          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          set({ error: 'Failed to update task' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteTask: async (id) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentState = get();
          const existingTask = currentState.tasks.find(t => t.id === id);
          
          if (!existingTask) {
            throw new Error('Task not found');
          }

          // Check if task is referenced as a dependency
          const dependentTasks = currentState.tasks.filter(t => 
            t.dependencies.includes(id)
          );
          
          if (dependentTasks.length > 0) {
            set({ 
              error: `Cannot delete task. It is referenced as a dependency by ${dependentTasks.length} other task(s).`
            });
            return;
          }

          // Optimistic update
          set(state => ({
            tasks: state.tasks.filter(t => t.id !== id),
            auditTrail: [...state.auditTrail, {
              id: uuidv4(),
              entityType: 'task',
              entityId: id,
              timestamp: new Date().toISOString(),
              userId: 'current-user',
              operation: 'delete',
              oldValue: existingTask
            }]
          }));

          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          set({ error: 'Failed to delete task' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateTaskStatus: async (id, newStatus) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentState = get();
          const existingTask = currentState.tasks.find(t => t.id === id);
          
          if (!existingTask) {
            throw new Error('Task not found');
          }

          // Validate status transition
          const validTransitions = TASK_STATUS_TRANSITIONS[existingTask.status];
          if (!validTransitions.includes(newStatus)) {
            set({ 
              error: `Cannot transition from ${existingTask.status} to ${newStatus}. Valid transitions: ${validTransitions.join(', ')}`
            });
            return;
          }

          // Special validation: Cannot complete blocked tasks
          if (newStatus === 'completed' && existingTask.status === 'blocked') {
            set({ error: 'Cannot complete task while it is blocked. Remove the blocker first.' });
            return;
          }

          await get().updateTask(id, { status: newStatus });
        } catch (error) {
          set({ error: 'Failed to update task status' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      bulkUpdateTasks: async (ids, updates) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentState = get();
          const updatedTasks: Task[] = [];
          const auditEntries: EntityAuditTrail[] = [];

          for (const id of ids) {
            const existingTask = currentState.tasks.find(t => t.id === id);
            if (!existingTask) continue;

            const updatedTask: Task = {
              ...existingTask,
              ...updates,
              updatedAt: new Date().toISOString(),
              version: existingTask.version + 1
            };

            updatedTasks.push(updatedTask);
            
            auditEntries.push({
              id: uuidv4(),
              entityType: 'task',
              entityId: id,
              timestamp: updatedTask.updatedAt,
              userId: 'current-user',
              operation: 'update',
              oldValue: existingTask,
              newValue: updatedTask
            });
          }

          // Optimistic update
          set(state => ({
            tasks: state.tasks.map(t => {
              const updated = updatedTasks.find(ut => ut.id === t.id);
              return updated || t;
            }),
            auditTrail: [...state.auditTrail, ...auditEntries]
          }));

          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          set({ error: 'Failed to bulk update tasks' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      addTaskDependency: async (taskId, dependencyId) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentState = get();
          const task = currentState.tasks.find(t => t.id === taskId);
          
          if (!task) {
            throw new Error('Task not found');
          }

          if (task.dependencies.includes(dependencyId)) {
            set({ error: 'Dependency already exists' });
            return;
          }

          // Check for circular dependencies
          const wouldCreateCycle = (checkTaskId: string, targetId: string): boolean => {
            const checkTask = currentState.tasks.find(t => t.id === checkTaskId);
            if (!checkTask) return false;
            
            if (checkTask.dependencies.includes(targetId)) return true;
            
            return checkTask.dependencies.some(depId => wouldCreateCycle(depId, targetId));
          };

          if (wouldCreateCycle(dependencyId, taskId)) {
            set({ error: 'Cannot add dependency: would create circular dependency' });
            return;
          }

          await get().updateTask(taskId, {
            dependencies: [...task.dependencies, dependencyId]
          });
        } catch (error) {
          set({ error: 'Failed to add task dependency' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      removeTaskDependency: async (taskId, dependencyId) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentState = get();
          const task = currentState.tasks.find(t => t.id === taskId);
          
          if (!task) {
            throw new Error('Task not found');
          }

          if (!task.dependencies.includes(dependencyId)) {
            set({ error: 'Dependency does not exist' });
            return;
          }

          await get().updateTask(taskId, {
            dependencies: task.dependencies.filter(id => id !== dependencyId)
          });
        } catch (error) {
          set({ error: 'Failed to remove task dependency' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      syncTasks: (tasks) => {
        set(state => {
          const mergedTasks = [...state.tasks];
          const newConflicts: ConflictResolution[] = [];

          tasks.forEach(remoteTask => {
            const localIndex = mergedTasks.findIndex(t => t.id === remoteTask.id);
            
            if (localIndex >= 0) {
              const localTask = mergedTasks[localIndex];
              
              if (localTask.version !== remoteTask.version && 
                  localTask.updatedAt !== remoteTask.updatedAt) {
                // Conflict detected
                newConflicts.push({
                  entityType: 'task',
                  entityId: remoteTask.id,
                  localVersion: localTask,
                  remoteVersion: remoteTask,
                  timestamp: new Date().toISOString()
                });
              } else {
                // Update local version
                mergedTasks[localIndex] = remoteTask;
              }
            } else {
              // Add new task
              mergedTasks.push(remoteTask);
            }
          });

          return {
            tasks: mergedTasks,
            conflicts: [...state.conflicts, ...newConflicts]
          };
        });
      },

      resolveConflict: (conflictId, resolution) => {
        set(state => {
          const conflict = state.conflicts.find(c => c.id === conflictId);
          if (!conflict) return state;

          let updatedTasks = [...state.tasks];
          
          switch (resolution) {
            case 'keep_local':
              // Keep local version, no change needed
              break;
            case 'accept_remote':
              updatedTasks = updatedTasks.map(t => 
                t.id === conflict.entityId ? conflict.remoteVersion : t
              );
              break;
            case 'manual_merge':
              // TODO: Implement manual merge UI
              break;
          }

          return {
            tasks: updatedTasks,
            conflicts: state.conflicts.filter(c => c.id !== conflictId)
          };
        });
      },

      getTasksByStatus: (status) => {
        return get().tasks.filter(t => t.status === status);
      },

      getTasksByWorkflow: (workflowId) => {
        return get().tasks.filter(t => t.parentWorkflowId === workflowId);
      },

      getTaskById: (id) => {
        return get().tasks.find(t => t.id === id);
      },

      getBlockedTasks: () => {
        return get().tasks.filter(t => t.status === 'blocked');
      }
    }),
    {
      name: 'task-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tasks: state.tasks,
        auditTrail: state.auditTrail,
        pendingOperations: state.pendingOperations
      })
    }
  )
);
