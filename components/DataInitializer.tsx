import { useEffect } from 'react';
import { useWorkflowStore } from '../services/stores/workflowStore';
import { useTaskStore } from '../services/stores/taskStore';
import { useLeaseStore } from '../services/stores/leaseStore';
import { useMaintenanceStore } from '../services/stores/maintenanceStore';
import { SAMPLE_WORKFLOWS, SAMPLE_TASKS, SAMPLE_LEASES, SAMPLE_MAINTENANCE } from '../services/initialData';

const DataInitializer: React.FC = () => {
  const { createWorkflow, syncWorkflows } = useWorkflowStore();
  const { createTask, syncTasks } = useTaskStore();
  const { createLease, syncLeases } = useLeaseStore();
  const { createMaintenanceRequest, syncRequests } = useMaintenanceStore();

  useEffect(() => {
    // Initialize stores with sample data if they're empty
    const initializeData = async () => {
      try {
        // Initialize workflows
        const currentWorkflows = useWorkflowStore.getState().workflows;
        if (currentWorkflows.length === 0) {
          console.log('Initializing workflows with sample data...');
          for (const workflow of SAMPLE_WORKFLOWS) {
            await createWorkflow(workflow);
          }
        }

        // Initialize tasks
        const currentTasks = useTaskStore.getState().tasks;
        if (currentTasks.length === 0) {
          console.log('Initializing tasks with sample data...');
          for (const task of SAMPLE_TASKS) {
            await createTask(task);
          }
        }

        // Initialize leases
        const currentLeases = useLeaseStore.getState().leases;
        if (currentLeases.length === 0) {
          console.log('Initializing leases with sample data...');
          for (const lease of SAMPLE_LEASES) {
            await createLease(lease);
          }
        }

        // Initialize maintenance requests
        const currentMaintenance = useMaintenanceStore.getState().requests;
        if (currentMaintenance.length === 0) {
          console.log('Initializing maintenance requests with sample data...');
          for (const request of SAMPLE_MAINTENANCE) {
            await createMaintenanceRequest(request);
          }
        }
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };

    // Delay initialization to ensure stores are ready
    const timer = setTimeout(initializeData, 1000);

    return () => clearTimeout(timer);
  }, [createWorkflow, createTask, createLease, createMaintenanceRequest]);

  // This component doesn't render anything
  return null;
};

export default DataInitializer;
