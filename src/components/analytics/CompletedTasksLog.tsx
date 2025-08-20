import React from 'react';
import { Task } from '@/hooks/useTasks';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle } from 'lucide-react';

interface CompletedTasksLogProps {
  tasks: Task[];
}

const CompletedTasksLog: React.FC<CompletedTasksLogProps> = ({ tasks }) => {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 pr-4">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p>No tasks completed yet.</p>
            <p>Go crush some goals!</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="flex items-start space-x-3 p-3 bg-background rounded-md">
              <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
              <div className="flex-grow">
                <p className="font-medium text-white">{task.title}</p>
                {task.completedAt && (
                  <p className="text-sm text-muted-foreground">
                    Completed {formatDistanceToNow(new Date(task.completedAt), { addSuffix: true })}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
};

export default CompletedTasksLog;
