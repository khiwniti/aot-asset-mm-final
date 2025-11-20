import { Workflow, Task, Lease, MaintenanceRequest, EntityAuditTrail, PendingOperation } from '../types';

// In-memory storage for demo purposes
// In production, this would connect to a real database
class EntitySyncService {
  private listeners: Set<() => void> = new Set();
  private entities: {
    workflows: Workflow[];
    tasks: Task[];
    leases: Lease[];
    maintenanceRequests: MaintenanceRequest[];
    auditTrail: EntityAuditTrail[];
    pendingOperations: PendingOperation[];
  };

  constructor() {
    this.entities = {
      workflows: [],
      tasks: [],
      leases: [],
      maintenanceRequests: [],
      auditTrail: [],
      pendingOperations: []
    };

    // Setup cross-tab sync via localStorage
    this.setupCrossTabSync();
  }

  // Subscribe to entity changes
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Notify all listeners of changes
  private notify() {
    this.listeners.forEach(listener => listener());
  }

  // Cross-tab synchronization using localStorage events
  private setupCrossTabSync() {
    if (typeof window === 'undefined') return;

    // Listen for changes from other tabs
    window.addEventListener('storage', (e) => {
      if (e.key === 'entity_sync_update') {
        const data = JSON.parse(e.newValue || '{}');
        this.mergeUpdates(data);
        this.notify();
      }
    });

    // Listen for custom events from same tab
    window.addEventListener('entity_sync_local', (e: any) => {
      this.mergeUpdates(e.detail);
      this.notify();
    });
  }

  // Broadcast changes to all tabs
  private broadcastChange(type: string, data: any) {
    if (typeof window === 'undefined') return;

    // Update local state immediately
    this.mergeUpdates({ [type]: data });

    // Broadcast to other tabs via localStorage
    const updateData = { [type]: data, timestamp: Date.now() };
    localStorage.setItem('entity_sync_update', JSON.stringify(updateData));

    // Broadcast to same tab via custom event
    window.dispatchEvent(new CustomEvent('entity_sync_local', { detail: updateData }));
  }

  // Merge updates from other tabs
  private mergeUpdates(updates: any) {
    Object.keys(updates).forEach(key => {
      if (key === 'timestamp') return;
      if (key in this.entities) {
        (this.entities as any)[key] = updates[key];
      }
    });
  }

  // Workflow Management
  getWorkflows(): Workflow[] {
    return this.entities.workflows;
  }

  updateWorkflow(workflowId: string, updates: Partial<Workflow>): Promise<Workflow> {
    return new Promise((resolve, reject) => {
      try {
        const index = this.entities.workflows.findIndex(w => w.id === workflowId);
        if (index === -1) {
          reject(new Error(`Workflow ${workflowId} not found`));
          return;
        }

        const oldWorkflow = this.entities.workflows[index];
        const updatedWorkflow = { ...oldWorkflow, ...updates, updatedAt: new Date().toISOString() };
        
        this.entities.workflows[index] = updatedWorkflow;

        // Add to audit trail
        this.addAuditEntry({
          entityType: 'workflow',
          entityId: workflowId,
          operation: 'update',
          oldValue: oldWorkflow,
          newValue: updatedWorkflow
        });

        this.broadcastChange('workflows', this.entities.workflows);
        resolve(updatedWorkflow);
      } catch (error) {
        reject(error);
      }
    });
  }

  createWorkflow(workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workflow> {
    return new Promise((resolve) => {
      const newWorkflow: Workflow = {
        ...workflow,
        id: `wf-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.entities.workflows.push(newWorkflow);

      // Add to audit trail
      this.addAuditEntry({
        entityType: 'workflow',
        entityId: newWorkflow.id,
        operation: 'create',
        newValue: newWorkflow
      });

      this.broadcastChange('workflows', this.entities.workflows);
      resolve(newWorkflow);
    });
  }

  // Task Management
  getTasks(): Task[] {
    return this.entities.tasks;
  }

  updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    return new Promise((resolve, reject) => {
      try {
        const index = this.entities.tasks.findIndex(t => t.id === taskId);
        if (index === -1) {
          reject(new Error(`Task ${taskId} not found`));
          return;
        }

        const oldTask = this.entities.tasks[index];
        const updatedTask = { ...oldTask, ...updates, updatedAt: new Date().toISOString() };
        
        this.entities.tasks[index] = updatedTask;

        // Add to audit trail
        this.addAuditEntry({
          entityType: 'task',
          entityId: taskId,
          operation: 'update',
          oldValue: oldTask,
          newValue: updatedTask
        });

        this.broadcastChange('tasks', this.entities.tasks);
        resolve(updatedTask);
      } catch (error) {
        reject(error);
      }
    });
  }

  createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    return new Promise((resolve) => {
      const newTask: Task = {
        ...task,
        id: `t-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.entities.tasks.push(newTask);

      // Add to audit trail
      this.addAuditEntry({
        entityType: 'task',
        entityId: newTask.id,
        operation: 'create',
        newValue: newTask
      });

      this.broadcastChange('tasks', this.entities.tasks);
      resolve(newTask);
    });
  }

  // Lease Management
  getLeases(): Lease[] {
    return this.entities.leases;
  }

  updateLease(leaseId: string, updates: Partial<Lease>): Promise<Lease> {
    return new Promise((resolve, reject) => {
      try {
        const index = this.entities.leases.findIndex(l => l.id === leaseId);
        if (index === -1) {
          reject(new Error(`Lease ${leaseId} not found`));
          return;
        }

        const oldLease = this.entities.leases[index];
        const updatedLease = { ...oldLease, ...updates, updatedAt: new Date().toISOString() };
        
        this.entities.leases[index] = updatedLease;

        // Add to audit trail
        this.addAuditEntry({
          entityType: 'lease',
          entityId: leaseId,
          operation: 'update',
          oldValue: oldLease,
          newValue: updatedLease
        });

        this.broadcastChange('leases', this.entities.leases);
        resolve(updatedLease);
      } catch (error) {
        reject(error);
      }
    });
  }

  createLease(lease: Omit<Lease, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lease> {
    return new Promise((resolve) => {
      const newLease: Lease = {
        ...lease,
        id: `l-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.entities.leases.push(newLease);

      // Add to audit trail
      this.addAuditEntry({
        entityType: 'lease',
        entityId: newLease.id,
        operation: 'create',
        newValue: newLease
      });

      this.broadcastChange('leases', this.entities.leases);
      resolve(newLease);
    });
  }

  // Maintenance Request Management
  getMaintenanceRequests(): MaintenanceRequest[] {
    return this.entities.maintenanceRequests;
  }

  updateMaintenanceRequest(requestId: string, updates: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> {
    return new Promise((resolve, reject) => {
      try {
        const index = this.entities.maintenanceRequests.findIndex(m => m.id === requestId);
        if (index === -1) {
          reject(new Error(`Maintenance request ${requestId} not found`));
          return;
        }

        const oldRequest = this.entities.maintenanceRequests[index];
        const updatedRequest = { ...oldRequest, ...updates, updatedAt: new Date().toISOString() };
        
        this.entities.maintenanceRequests[index] = updatedRequest;

        // Add to audit trail
        this.addAuditEntry({
          entityType: 'maintenance_request',
          entityId: requestId,
          operation: 'update',
          oldValue: oldRequest,
          newValue: updatedRequest
        });

        this.broadcastChange('maintenanceRequests', this.entities.maintenanceRequests);
        resolve(updatedRequest);
      } catch (error) {
        reject(error);
      }
    });
  }

  createMaintenanceRequest(request: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceRequest> {
    return new Promise((resolve) => {
      const newRequest: MaintenanceRequest = {
        ...request,
        id: `mr-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.entities.maintenanceRequests.push(newRequest);

      // Add to audit trail
      this.addAuditEntry({
        entityType: 'maintenance_request',
        entityId: newRequest.id,
        operation: 'create',
        newValue: newRequest
      });

      this.broadcastChange('maintenanceRequests', this.entities.maintenanceRequests);
      resolve(newRequest);
    });
  }

  // Audit Trail Management
  private addAuditEntry(entry: Omit<EntityAuditTrail, 'id' | 'timestamp' | 'userId'>) {
    const auditEntry: EntityAuditTrail = {
      ...entry,
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: 'current-user' // In production, get actual user ID
    };

    this.entities.auditTrail.push(auditEntry);
  }

  getAuditTrail(entityType?: string, entityId?: string): EntityAuditTrail[] {
    let trail = this.entities.auditTrail;
    
    if (entityType) {
      trail = trail.filter(entry => entry.entityType === entityType);
    }
    
    if (entityId) {
      trail = trail.filter(entry => entry.entityId === entityId);
    }

    return trail.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Conflict Detection and Resolution
  detectConflicts(entityType: string, entityId: string, clientVersion: number): boolean {
    // Simplified conflict detection based on timestamp
    // In production, this would use version numbers or etags
    const entity = (this.entities as any)[entityType]?.find((e: any) => e.id === entityId);
    if (!entity) return false;

    const serverVersion = new Date(entity.updatedAt).getTime();
    return clientVersion < serverVersion;
  }

  // Optimistic Updates with Rollback
  async optimisticUpdate<T>(
    entityType: string,
    entityId: string,
    updates: Partial<T>,
    operation: () => Promise<T>
  ): Promise<T> {
    try {
      // Apply optimistic update immediately
      const result = await operation();
      
      // Add to pending operations for retry if needed
      const pendingOp: PendingOperation = {
        id: `op-${Date.now()}`,
        entityType: entityType as any,
        entityId,
        operationType: 'update',
        operationData: updates,
        status: 'success',
        retryCount: 0,
        createdTimestamp: new Date().toISOString()
      };

      this.entities.pendingOperations.push(pendingOp);
      
      return result;
    } catch (error) {
      // Add failed operation for retry
      const pendingOp: PendingOperation = {
        id: `op-${Date.now()}`,
        entityType: entityType as any,
        entityId,
        operationType: 'update',
        operationData: updates,
        status: 'failed',
        retryCount: 1,
        createdTimestamp: new Date().toISOString(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };

      this.entities.pendingOperations.push(pendingOp);
      throw error;
    }
  }

  // Retry failed operations
  async retryFailedOperations(): Promise<void> {
    const failedOps = this.entities.pendingOperations.filter(op => op.status === 'failed');
    
    for (const op of failedOps) {
      try {
        // Retry logic would depend on operation type
        // For now, just mark as retried
        op.retryCount++;
        op.status = 'pending';
      } catch (error) {
        op.retryCount++;
        if (op.retryCount >= 3) {
          op.status = 'failed';
          op.errorMessage = 'Max retries exceeded';
        }
      }
    }

    this.broadcastChange('pendingOperations', this.entities.pendingOperations);
  }
}

// Singleton instance
export const entitySyncService = new EntitySyncService();