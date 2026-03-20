import React, { useMemo, useState } from 'react';
import { CheckCheck, CheckCircle2, Circle, GripVertical, MoreVertical, Trash2 } from 'lucide-react';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';

import { GlassBadge, GlassButton, GlassCard } from '@/components/glass';
import { Task } from '@/hooks/useTasks';
import { cn } from '@/lib/utils';

interface TaskListProps {
  tasks: Task[];
  activeTaskId: string | null;
  onToggleComplete: (id: string) => void;
  onSetActive: (id: string) => void;
  onDelete: (id: string) => void;
  onClearCompleted: () => void;
  onReorderTasks: (tasks: Task[]) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  activeTaskId,
  onToggleComplete,
  onSetActive,
  onDelete,
  onClearCompleted,
  onReorderTasks,
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const completedTasks = useMemo(() => tasks.filter((task) => task.completed), [tasks]);
  const activeTasks = useMemo(() => tasks.filter((task) => !task.completed), [tasks]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.source.droppableId !== 'active-tasks' || result.destination.droppableId !== 'active-tasks') return;

    const reordered = Array.from(activeTasks);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    onReorderTasks([...reordered, ...completedTasks]);
  };

  if (tasks.length === 0) {
    return (
      <GlassCard variant="dense" className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">No tasks yet. Add the first item you want to finish this session.</p>
      </GlassCard>
    );
  }

  return (
    <div className="mt-6 space-y-6 animate-fade-in">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="active-tasks">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
              {activeTasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(draggableProvided, snapshot) => (
                    <div ref={draggableProvided.innerRef} {...draggableProvided.draggableProps}>
                      <GlassCard
                        variant={task.id === activeTaskId ? 'active' : 'default'}
                        className={cn(
                          'transition-all duration-200',
                          snapshot.isDragging && 'scale-[1.02] rotate-[1deg]',
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 flex-1 items-start gap-3">
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                onToggleComplete(task.id);
                              }}
                              className="mt-1 text-muted-foreground transition-colors hover:text-foreground"
                              aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                            >
                              {task.completed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                            </button>

                            <button
                              {...draggableProvided.dragHandleProps}
                              className="mt-1 text-muted-foreground transition-colors hover:text-foreground"
                              aria-label="Reorder task"
                            >
                              <GripVertical className="h-4 w-4" />
                            </button>

                            <button className="min-w-0 flex-1 text-left" onClick={() => onSetActive(task.id)}>
                              <p className="truncate text-base font-semibold text-foreground">{task.title}</p>
                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                <GlassBadge variant={task.id === activeTaskId ? 'default' : 'outline'}>
                                  {task.completedPomodoros}/{task.estimatedPomodoros} pomodoros
                                </GlassBadge>
                                {task.id === activeTaskId ? <GlassBadge variant="success">Active</GlassBadge> : null}
                              </div>
                            </button>
                          </div>

                          <div className="relative">
                            <GlassButton
                              onClick={() => setOpenMenuId((value) => (value === task.id ? null : task.id))}
                              variant="ghost"
                              size="icon"
                              icon={MoreVertical}
                              aria-label="Task options"
                            />

                            {openMenuId === task.id ? (
                              <div className="glass-panel glass-panel-dense absolute right-0 z-20 mt-2 min-w-40 rounded-[1.2rem] p-2">
                                <GlassButton
                                  onClick={() => {
                                    onDelete(task.id);
                                    setOpenMenuId(null);
                                  }}
                                  variant="danger"
                                  size="sm"
                                  icon={Trash2}
                                  className="w-full justify-start"
                                  aria-label="Delete task"
                                >
                                  Delete
                                </GlassButton>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </GlassCard>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {completedTasks.length > 0 ? (
        <GlassCard variant="dense" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Completed</p>
              <p className="mt-1 text-sm text-muted-foreground">{completedTasks.length} tasks finished in this list.</p>
            </div>
            <GlassButton onClick={onClearCompleted} variant="ghost" size="sm" icon={CheckCheck} aria-label="Clear all completed tasks">
              Clear all
            </GlassButton>
          </div>

          <div className="space-y-3">
            {completedTasks.map((task) => (
              <GlassCard key={task.id} variant="dense" className="rounded-[1.4rem]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      className="mt-1 text-emerald-500 transition-colors hover:text-emerald-400"
                      onClick={() => onToggleComplete(task.id)}
                      aria-label="Mark as incomplete"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </button>

                    <div>
                      <p className="font-medium text-foreground/70 line-through">{task.title}</p>
                      <div className="mt-2">
                        <GlassBadge variant="outline">{task.completedPomodoros}/{task.estimatedPomodoros} pomodoros</GlassBadge>
                      </div>
                    </div>
                  </div>

                  <GlassButton
                    onClick={() => onDelete(task.id)}
                    variant="ghost"
                    size="icon"
                    icon={Trash2}
                    aria-label="Delete task"
                  />
                </div>
              </GlassCard>
            ))}
          </div>
        </GlassCard>
      ) : null}
    </div>
  );
};

export default TaskList;
