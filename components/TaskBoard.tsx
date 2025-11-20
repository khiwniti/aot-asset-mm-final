import React, { useState } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, 
         closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useTaskStore, Task, TaskStatus } from '../services/stores/taskStore';
import { format } from 'date-fns';
import { Calendar, User, Clock, AlertTriangle, MoreHorizontal, Plus, CheckCircle, PlayCircle, PauseCircle, XCircle } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: string, newStatus: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange, onEdit, onDelete }) => {
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

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'todo': return <div className="w-4 h-4 rounded-full border-2 border-slate-300" />;
      case 'in_progress': return <PlayCircle size={16} className="text-blue-500" />;
      case 'blocked': return <AlertTriangle size={16} className="text-red-500" />;
      case 'completed': return <CheckCircle size={16} className="text-green-500" />;
      default: return null;
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all cursor-move group">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon(task.status)}
          <h4 className="font-semibold text-slate-800 text-sm leading-tight">{task.title}</h4>
        </div>
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
                onClick={() => { onEdit(task); setIsMenuOpen(false); }}
                className="w-full px-3 py-1.5 text-left text-xs hover:bg-slate-50 text-slate-700"
              >
                Edit
              </button>
              <button
                onClick={() => { onDelete(task.id); setIsMenuOpen(false); }}
                className="w-full px-3 py-1.5 text-left text-xs hover:bg-slate-50 text-red-600"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-600 mb-3 line-clamp-2">{task.description}</p>

      <div className="flex items-center gap-2 mb-3">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        {task.blockerReason && (
          <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded flex items-center gap-1">
            <AlertTriangle size={10} />
            Blocked
          </span>
        )}
        {task.dependencies.length > 0 && (
          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
            {task.dependencies.length} dep(s)
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <User size={12} />
          <span>{task.assignee}</span>
        </div>
        
        {task.dueDate && (
          <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 font-medium' : ''}`}>
            <Calendar size={12} />
            <span>{format(new Date(task.dueDate), 'MMM d')}</span>
            {isOverdue && <AlertTriangle size={10} />}
          </div>
        )}
      </div>

      {(task.estimatedHours || task.actualHours) && (
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-500">
          {task.estimatedHours && (
            <div className="flex items-center gap-1">
              <Clock size={10} />
              <span>Est: {task.estimatedHours}h</span>
            </div>
          )}
          {task.actualHours && (
            <div className="flex items-center gap-1">
              <CheckCircle size={10} />
              <span>Actual: {task.actualHours}h</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface TaskColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onStatusChange: (id: string, newStatus: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onCreateNew: (status: TaskStatus) => void;
}

const TaskColumn: React.FC<TaskColumnProps> = ({ 
  title, status, tasks, onStatusChange, onEdit, onDelete, onCreateNew 
}) => {
  const getColumnColor = (status: TaskStatus) => {
    switch (status) {
      case 'todo': return 'border-slate-200 bg-slate-50';
      case 'in_progress': return 'border-blue-200 bg-blue-50';
      case 'blocked': return 'border-red-200 bg-red-50';
      case 'completed': return 'border-green-200 bg-green-50';
      default: return 'border-slate-200 bg-slate-50';
    }
  };

  const getColumnIcon = (status: TaskStatus) => {
    switch (status) {
      case 'todo': return <div className="w-4 h-4 rounded-full border-2 border-slate-400" />;
      case 'in_progress': return <PlayCircle size={16} className="text-blue-600" />;
      case 'blocked': return <AlertTriangle size={16} className="text-red-600" />;
      case 'completed': return <CheckCircle size={16} className="text-green-600" />;
      default: return null;
    }
  };

  return (
    <div className={`flex-1 min-w-[280px] rounded-xl border-2 ${getColumnColor(status)} p-4`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {getColumnIcon(status)}
          <h3 className="font-semibold text-slate-800">{title}</h3>
        </div>
        <span className="bg-white px-2 py-1 rounded text-xs font-medium text-slate-600">
          {tasks.length}
        </span>
      </div>

      <div className="space-y-3 min-h-[400px]">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onStatusChange={onStatusChange}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
        
        {status === 'todo' && (
          <button
            onClick={() => onCreateNew(status)}
            className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-400 hover:border-slate-400 hover:text-slate-500 text-sm font-medium flex items-center justify-center gap-2 transition-colors bg-white"
          >
            <Plus size={16} />
            New Task
          </button>
        )}
      </div>
    </div>
  );
};

interface TaskModalProps {
  task?: Task;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'version'>) => void;
  availableTasks: Task[];
}

const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, onClose, onSave, availableTasks }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo' as TaskStatus,
    assignee: '',
    dueDate: '',
    priority: 'medium' as Task['priority'],
    parentWorkflowId: '',
    blockerReason: '',
    estimatedHours: '',
    actualHours: '',
    dependencies: [] as string[]
  });

  React.useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        assignee: task.assignee,
        dueDate: task.dueDate || '',
        priority: task.priority,
        parentWorkflowId: task.parentWorkflowId || '',
        blockerReason: task.blockerReason || '',
        estimatedHours: task.estimatedHours?.toString() || '',
        actualHours: task.actualHours?.toString() || '',
        dependencies: task.dependencies
      });
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
      actualHours: formData.actualHours ? parseFloat(formData.actualHours) : undefined
    });
    onClose();
  };

  const toggleDependency = (taskId: string) => {
    setFormData(prev => ({
      ...prev,
      dependencies: prev.dependencies.includes(taskId)
        ? prev.dependencies.filter(id => id !== taskId)
        : [...prev.dependencies, taskId]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          {task ? 'Edit Task' : 'Create New Task'}
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
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
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
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as TaskStatus }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="blocked">Blocked</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Hours</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formData.estimatedHours}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Actual Hours</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formData.actualHours}
                onChange={(e) => setFormData(prev => ({ ...prev, actualHours: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {formData.status === 'blocked' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Blocker Reason</label>
              <textarea
                value={formData.blockerReason}
                onChange={(e) => setFormData(prev => ({ ...prev, blockerReason: e.target.value }))}
                rows={2}
                placeholder="Why is this task blocked?"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Dependencies</label>
            <div className="border border-slate-200 rounded-lg p-3 max-h-32 overflow-y-auto">
              {availableTasks.length === 0 ? (
                <p className="text-xs text-slate-500">No other tasks available for dependencies</p>
              ) : (
                <div className="space-y-2">
                  {availableTasks.map(availableTask => (
                    <label key={availableTask.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.dependencies.includes(availableTask.id)}
                        onChange={() => toggleDependency(availableTask.id)}
                        disabled={availableTask.id === task?.id}
                        className="rounded"
                      />
                      <span className={availableTask.id === task?.id ? 'text-slate-400' : ''}>
                        {availableTask.title}
                        {availableTask.id === task?.id && ' (current task)'}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              {task ? 'Update' : 'Create'} Task
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

const TaskBoard: React.FC = () => {
  const { tasks, createTask, updateTask, deleteTask, updateTaskStatus, getTasksByStatus, isLoading, error } = useTaskStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const statusColumns = [
    { title: 'To Do', status: 'todo' as TaskStatus },
    { title: 'In Progress', status: 'in_progress' as TaskStatus },
    { title: 'Blocked', status: 'blocked' as TaskStatus },
    { title: 'Completed', status: 'completed' as TaskStatus }
  ];

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    setDraggedTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !draggedTask) return;

    const newStatus = over.id as TaskStatus;
    
    if (newStatus !== draggedTask.status) {
      try {
        await updateTaskStatus(draggedTask.id, newStatus);
      } catch (error) {
        console.error('Failed to update task status:', error);
      }
    }
    
    setDraggedTask(null);
  };

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'version'>) => {
    try {
      await createTask(taskData);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'version'>) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, taskData);
      } else {
        await createTask(taskData);
      }
      setEditingTask(undefined);
    } catch (error) {
      console.error('Failed to save task:', error);
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
        <h2 className="text-2xl font-bold text-slate-800">Task Board</h2>
        <button
          onClick={() => { setEditingTask(undefined); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
        >
          <Plus size={16} />
          New Task
        </button>
      </div>

      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-700">Loading tasks...</p>
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
                items={getTasksByStatus(column.status).map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <TaskColumn
                  title={column.title}
                  status={column.status}
                  tasks={getTasksByStatus(column.status)}
                  onStatusChange={updateTaskStatus}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onCreateNew={() => { setEditingTask(undefined); setIsModalOpen(true); }}
                />
              </SortableContext>
            </div>
          ))}
        </div>
      </DndContext>

      <TaskModal
        task={editingTask}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTask(undefined); }}
        onSave={handleSaveTask}
        availableTasks={tasks.filter(t => t.id !== editingTask?.id)}
      />
    </div>
  );
};

export default TaskBoard;
