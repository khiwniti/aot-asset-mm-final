import React, { useState, useEffect } from 'react';
import { Workflow } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
// Note: react-beautiful-dnd is deprecated, using placeholder implementation
// In production, replace with @dnd-kit or similar modern library
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface WorkflowStatusManagerProps {
  workflows: Workflow[];
  availableStatuses: string[];
  dragAndDropEnabled: boolean;
  onStatusChange?: (workflowId: string, newStatus: string) => void;
  onWorkflowClick?: (workflow: Workflow) => void;
}

const WorkflowStatusManager: React.FC<WorkflowStatusManagerProps> = ({
  workflows,
  availableStatuses,
  dragAndDropEnabled,
  onStatusChange,
  onWorkflowClick
}) => {
  const [groupedWorkflows, setGroupedWorkflows] = useState<Record<string, Workflow[]>>({});

  useEffect(() => {
    const grouped = availableStatuses.reduce((acc, status) => {
      acc[status] = workflows.filter(w => w.status === status);
      return acc;
    }, {} as Record<string, Workflow[]>);
    setGroupedWorkflows(grouped);
  }, [workflows, availableStatuses]);

  const handleDragEnd = (result: any) => {
    if (!result.destination || !dragAndDropEnabled) return;

    const { source, destination, draggableId } = result;
    const newStatus = destination.droppableId;
    const workflowId = draggableId;

    if (source.droppableId !== newStatus) {
      onStatusChange?.(workflowId, newStatus);
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
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const WorkflowCard = ({ workflow, index }: { workflow: Workflow; index: number }) => (
    <Draggable draggableId={workflow.id} index={index} isDragDisabled={!dragAndDropEnabled}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-3 p-4 bg-white rounded-lg border shadow-sm cursor-pointer transition-all hover:shadow-md ${
            snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-400' : ''
          }`}
          onClick={() => onWorkflowClick?.(workflow)}
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-gray-900 text-sm">{workflow.title}</h4>
            <Badge className={`text-xs ${getPriorityColor(workflow.priority)}`}>
              {workflow.priority}
            </Badge>
          </div>
          
          {workflow.description && (
            <p className="text-gray-600 text-xs mb-3 line-clamp-2">{workflow.description}</p>
          )}
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              {workflow.assignee && (
                <span className="text-gray-500">👤 {workflow.assignee}</span>
              )}
              {workflow.dueDate && (
                <span className="text-gray-500">📅 {formatDate(workflow.dueDate)}</span>
              )}
            </div>
            <Badge className={`text-xs ${getStatusColor(workflow.status)}`}>
              {workflow.status}
            </Badge>
          </div>
          
          {workflow.taskIds && workflow.taskIds.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                📋 {workflow.taskIds.length} task{workflow.taskIds.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );

  const StatusColumn = ({ status, workflows: columnWorkflows }: { status: string; workflows: Workflow[] }) => (
    <div className="flex-1 min-w-0">
      <div className="bg-gray-50 rounded-t-lg p-3 border border-b-0">
        <h3 className="font-semibold text-sm capitalize flex items-center justify-between">
          {status}
          <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
            {columnWorkflows.length}
          </span>
        </h3>
      </div>
      
      <Droppable droppableId={status} isDropDisabled={!dragAndDropEnabled}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`bg-white rounded-b-lg border p-3 min-h-[200px] ${
              snapshot.isDraggingOver ? 'bg-blue-50 border-blue-300' : ''
            }`}
          >
            {columnWorkflows.map((workflow, index) => (
              <WorkflowCard key={workflow.id} workflow={workflow} index={index} />
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
        <h2 className="text-lg font-semibold text-gray-900">Workflow Status Manager</h2>
        <div className="text-sm text-gray-500">
          {workflows.length} workflow{workflows.length !== 1 ? 's' : ''} total
        </div>
      </div>

      {dragAndDropEnabled ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {availableStatuses.map(status => (
              <StatusColumn
                key={status}
                status={status}
                workflows={groupedWorkflows[status] || []}
              />
            ))}
          </div>
        </DragDropContext>
      ) : (
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {availableStatuses.map(status => (
            <StatusColumn
              key={status}
              status={status}
              workflows={groupedWorkflows[status] || []}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkflowStatusManager;