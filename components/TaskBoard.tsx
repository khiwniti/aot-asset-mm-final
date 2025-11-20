import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
// Note: react-beautiful-dnd is deprecated, using placeholder implementation
// In production, replace with @dnd-kit or similar modern library
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface TaskBoardProps {
  tasks: Task[];
  columns: { id: string; title: string; taskIds: string[] }[];
  allowBulkOperations: boolean;
  onStatusChange?: (taskId: string, newStatus: string) => void;
  onTaskClick?: (task: Task) => void;
  onBulkSelect?: (taskIds: string[]) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  columns,
  allowBulkOperations,
  onStatusChange,
  onTaskClick,
  onBulkSelect
}) => {
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [groupedTasks, setGroupedTasks] = useState<Record<string, Task[]>>({});

  useEffect(() => {
    const grouped = columns.reduce((acc, column) => {
      acc[column.id] = column.taskIds
        .map(taskId => tasks.find(t => t.id === taskId))
        .filter(Boolean) as Task[];
      return acc;
    }, {} as Record<string, Task[]>);
    setGroupedTasks(grouped);
  }, [tasks, columns]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    const newStatus = destination.droppableId;
    const taskId = draggableId;

    if (source.droppableId !== newStatus) {
      onStatusChange?.(taskId, newStatus);
    }
  };

  // Placeholder drag and drop handlers (react-beautiful-dnd is deprecated)
  const DragDropContext = ({ children }: any) => <>{children}</>;
  const Droppable = ({ children, droppableId }: any) => (
    <div data-droppable-id={droppableId}>{children}</div>
  );
  const Draggable = ({ children, draggableId, index }: any) => (
    <div data-draggable-id={draggableId} data-index={index}>{children}</div>
  );

  const handleTaskSelection = (taskId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const newSelection = new Set(selectedTasks);
    if (newSelection.has(taskId)) {
      newSelection.delete(taskId);
    } else {
      newSelection.add(taskId);
    }
    setSelectedTasks(newSelection);
    onBulkSelect?.(Array.from(newSelection));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'todo': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const TaskCard = ({ task, index }: { task: Task; index: number }) => (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-3 bg-white rounded-lg border shadow-sm cursor-pointer transition-all hover:shadow-md ${
            snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-400' : ''
          } ${selectedTasks.has(task.id) ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => onTaskClick?.(task)}
        >
          {allowBulkOperations && (
            <div className="p-2 border-b border-gray-100">
              <input
                type="checkbox"
                checked={selectedTasks.has(task.id)}
                onChange={(e) => handleTaskSelection(task.id, e as any)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
          )}
          
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-gray-900 text-sm flex-1 mr-2">{task.title}</h4>
              <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </Badge>
            </div>
            
            {task.description && (
              <p className="text-gray-600 text-xs mb-3 line-clamp-2">{task.description}</p>
            )}
            
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center space-x-2">
                {task.assignee && (
                  <span className="text-gray-500">👤 {task.assignee}</span>
                )}
                {task.estimatedHours && (
                  <span className="text-gray-500">⏱️ {task.estimatedHours}h</span>
                )}
              </div>
              <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                {task.status.replace('_', ' ')}
              </Badge>
            </div>

            {task.dueDate && (
              <div className="text-xs text-gray-500 mb-2">
                📅 Due: {formatDate(task.dueDate)}
              </div>
            )}
            
            {task.blockerReason && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                🚫 {task.blockerReason}
              </div>
            )}
            
            {task.parentWorkflowId && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  📋 Part of workflow {task.parentWorkflowId}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );

  const TaskColumn = ({ column, columnTasks }: { column: any; columnTasks: Task[] }) => (
    <div className="flex-1 min-w-0">
      <div className="bg-gray-50 rounded-t-lg p-3 border border-b-0">
        <h3 className="font-semibold text-sm flex items-center justify-between">
          {column.title}
          <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
            {columnTasks.length}
          </span>
        </h3>
      </div>
      
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`bg-white rounded-b-lg border p-3 min-h-[400px] ${
              snapshot.isDraggingOver ? 'bg-blue-50 border-blue-300' : ''
            }`}
          >
            {columnTasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Task Board</h2>
        <div className="flex items-center space-x-4">
          {allowBulkOperations && selectedTasks.size > 0 && (
            <div className="text-sm text-blue-600">
              {selectedTasks.size} task{selectedTasks.size !== 1 ? 's' : ''} selected
            </div>
          )}
          <div className="text-sm text-gray-500">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} total
          </div>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {columns.map(column => (
            <TaskColumn
              key={column.id}
              column={column}
              columnTasks={groupedTasks[column.id] || []}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default TaskBoard;