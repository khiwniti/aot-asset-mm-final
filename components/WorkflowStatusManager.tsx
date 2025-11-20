import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, 
         closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useWorkflowStore, Workflow, WorkflowStatus } from '../services/stores/workflowStore';
import { format } from 'date-fns';
import { Calendar, User, Tag, MoreHorizontal, Plus, Clock, AlertCircle } from 'lucide-react';

interface WorkflowCardProps {
  workflow: Workflow;
  onStatusChange: (id: string, newStatus: WorkflowStatus) => void;
  onEdit: (workflow: Workflow) => void;
  onDelete: (id: string) => void;
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({ workflow, onStatusChange, onEdit, onDelete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const isOverdue = workflow.dueDate && new Date(workflow.dueDate) < new Date();

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all cursor-move group">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-slate-800 text-sm leading-tight">{workflow.title}</h3>
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 rounded"
          >
            <MoreHorizontal size={14} className="text-slate-500" />
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
              <button
                onClick={() => { onEdit(workflow); setIsMenuOpen(false); }}
                className="w-full px-3 py-1.5 text-left text-xs hover:bg-slate-50 text-slate-700"
              >
                Edit
              </button>
              <button
                onClick={() => { onDelete(workflow.id); setIsMenuOpen(false); }}
                className="w-full px-3 py-1.5 text-left text-xs hover:bg-slate-50 text-red-600"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-600 mb-3 line-clamp-2">{workflow.description}</p>

      <div className="flex items-center gap-2 mb-3">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${getPriorityColor(workflow.priority)}`}>
          {workflow.priority}
        </span>
        {workflow.tags.map(tag => (
          <span key={tag} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <User size={12} />
          <span>{workflow.assignee}</span>
        </div>
        
        {workflow.dueDate && (
          <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-500' : ''}`}>
            <Calendar size={12} />
            <span>{format(new Date(workflow.dueDate), 'MMM d')}</span>
            {isOverdue && <AlertCircle size={10} />}
          </div>
        )}
      </div>
    </div>
  );
};

interface StatusColumnProps {
  title: string;
  status: WorkflowStatus;
  workflows: Workflow[];
  onStatusChange: (id: string, newStatus: WorkflowStatus) => void;
  onEdit: (workflow: Workflow) => void;
  onDelete: (id: string) => void;
  onCreateNew: (status: WorkflowStatus) => void;
}

const StatusColumn: React.FC<StatusColumnProps> = ({ 
  title, status, workflows, onStatusChange, onEdit, onDelete, onCreateNew 
}) => {
  const getColumnColor = (status: WorkflowStatus) => {
    switch (status) {
      case 'draft': return 'border-blue-200 bg-blue-50';
      case 'active': return 'border-green-200 bg-green-50';
      case 'paused': return 'border-amber-200 bg-amber-50';
      case 'completed': return 'border-purple-200 bg-purple-50';
      case 'archived': return 'border-slate-200 bg-slate-50';
      default: return 'border-slate-200 bg-slate-50';
    }
  };

  return (
    <div className={`flex-1 min-w-[280px] rounded-xl border-2 ${getColumnColor(status)} p-4`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800">{title}</h3>
        <span className="bg-white px-2 py-1 rounded text-xs font-medium text-slate-600">
          {workflows.length}
        </span>
      </div>

      <div className="space-y-3 min-h-[400px]">
        {workflows.map(workflow => (
          <WorkflowCard
            key={workflow.id}
            workflow={workflow}
            onStatusChange={onStatusChange}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
        
        {status === 'draft' && (
          <button
            onClick={() => onCreateNew(status)}
            className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-400 hover:border-slate-400 hover:text-slate-500 text-sm font-medium flex items-center justify-center gap-2 transition-colors bg-white"
          >
            <Plus size={16} />
            New Workflow
          </button>
        )}
      </div>
    </div>
  );
};

interface WorkflowModalProps {
  workflow?: Workflow;
  isOpen: boolean;
  onClose: () => void;
  onSave: (workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'version'>) => void;
}

const WorkflowModal: React.FC<WorkflowModalProps> = ({ workflow, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'draft' as WorkflowStatus,
    assignee: '',
    dueDate: '',
    priority: 'medium' as Workflow['priority'],
    propertyId: '',
    parentWorkflowId: '',
    tags: [] as string[]
  });

  useEffect(() => {
    if (workflow) {
      setFormData({
        title: workflow.title,
        description: workflow.description,
        status: workflow.status,
        assignee: workflow.assignee,
        dueDate: workflow.dueDate || '',
        priority: workflow.priority,
        propertyId: workflow.propertyId || '',
        parentWorkflowId: workflow.parentWorkflowId || '',
        tags: workflow.tags
      });
    }
  }, [workflow]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag.trim()] }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          {workflow ? 'Edit Workflow' : 'Create New Workflow'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Assignee</label>
              <input
                type="text"
                required
                value={formData.assignee}
                onChange={(e) => setFormData(prev => ({ ...prev, assignee: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Workflow['priority'] }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as WorkflowStatus }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add tag and press Enter"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              {workflow ? 'Update' : 'Create'} Workflow
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

const WorkflowStatusManager: React.FC = () => {
  const { workflows, createWorkflow, updateWorkflow, deleteWorkflow, updateWorkflowStatus, getWorkflowsByStatus, isLoading, error } = useWorkflowStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | undefined>();
  const [draggedWorkflow, setDraggedWorkflow] = useState<Workflow | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const statusColumns = [
    { title: 'Draft', status: 'draft' as WorkflowStatus },
    { title: 'Active', status: 'active' as WorkflowStatus },
    { title: 'Paused', status: 'paused' as WorkflowStatus },
    { title: 'Completed', status: 'completed' as WorkflowStatus },
    { title: 'Archived', status: 'archived' as WorkflowStatus }
  ];

  const handleDragStart = (event: DragStartEvent) => {
    const workflow = workflows.find(w => w.id === event.active.id);
    setDraggedWorkflow(workflow || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !draggedWorkflow) return;

    const newStatus = over.id as WorkflowStatus;
    
    if (newStatus !== draggedWorkflow.status) {
      try {
        await updateWorkflowStatus(draggedWorkflow.id, newStatus);
      } catch (error) {
        console.error('Failed to update workflow status:', error);
      }
    }
    
    setDraggedWorkflow(null);
  };

  const handleCreateWorkflow = async (workflowData: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'version'>) => {
    try {
      await createWorkflow(workflowData);
    } catch (error) {
      console.error('Failed to create workflow:', error);
    }
  };

  const handleEditWorkflow = (workflow: Workflow) => {
    setEditingWorkflow(workflow);
    setIsModalOpen(true);
  };

  const handleDeleteWorkflow = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      try {
        await deleteWorkflow(id);
      } catch (error) {
        console.error('Failed to delete workflow:', error);
      }
    }
  };

  const handleSaveWorkflow = async (workflowData: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'version'>) => {
    try {
      if (editingWorkflow) {
        await updateWorkflow(editingWorkflow.id, workflowData);
      } else {
        await createWorkflow(workflowData);
      }
      setEditingWorkflow(undefined);
    } catch (error) {
      console.error('Failed to save workflow:', error);
    }
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
        <h2 className="text-2xl font-bold text-slate-800">Workflow Management</h2>
        <button
          onClick={() => { setEditingWorkflow(undefined); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
        >
          <Plus size={16} />
          New Workflow
        </button>
      </div>

      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-700">Loading workflows...</p>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-4">
          {statusColumns.map(column => (
            <div key={column.status} className="flex-1 min-w-[280px]">
              <SortableContext
                items={getWorkflowsByStatus(column.status).map(w => w.id)}
                strategy={verticalListSortingStrategy}
              >
                <StatusColumn
                  title={column.title}
                  status={column.status}
                  workflows={getWorkflowsByStatus(column.status)}
                  onStatusChange={updateWorkflowStatus}
                  onEdit={handleEditWorkflow}
                  onDelete={handleDeleteWorkflow}
                  onCreateNew={() => { setEditingWorkflow(undefined); setIsModalOpen(true); }}
                />
              </SortableContext>
            </div>
          ))}
        </div>
      </DndContext>

      <WorkflowModal
        workflow={editingWorkflow}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingWorkflow(undefined); }}
        onSave={handleSaveWorkflow}
      />
    </div>
  );
};

export default WorkflowStatusManager;
