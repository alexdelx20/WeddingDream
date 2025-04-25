import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { PlusIcon } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function TaskList() {
  const { toast } = useToast();
  const [showCompleted, setShowCompleted] = useState(false);

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      await apiRequest("PATCH", `/api/tasks/${id}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update task: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleToggleTask = (task: Task) => {
    toggleTaskMutation.mutate({
      id: task.id,
      completed: !task.completed,
    });
  };

  // Filter tasks for display
  const filteredTasks = tasks.filter(task => showCompleted || !task.completed);
  const completedCount = tasks.filter(task => task.completed).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-muted-foreground font-body">
          <span className="font-medium text-foreground">{completedCount}</span> of {tasks.length} tasks completed
        </div>
        <Link href="/tasks">
          <Button size="icon" variant="ghost" className="text-primary-dark hover:text-primary transition duration-200">
            <PlusIcon className="h-5 w-5" />
          </Button>
        </Link>
      </div>
      
      <div className="space-y-3">
        {filteredTasks.slice(0, 3).map((task) => (
          <div 
            key={task.id}
            className="task-item flex items-center py-2 px-3 rounded-lg"
          >
            <input 
              type="checkbox" 
              className="custom-checkbox mr-3"
              checked={task.completed}
              onChange={() => handleToggleTask(task)}
            />
            <span className={`font-body ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
              {task.title}
            </span>
          </div>
        ))}
        
        {filteredTasks.length === 0 && (
          <div className="text-center py-3 text-muted-foreground">
            No tasks to display
          </div>
        )}
      </div>
      
      <Link href="/tasks">
        <a className="block text-center text-primary-dark hover:text-primary transition duration-200 mt-4 font-body">
          View all tasks
        </a>
      </Link>
    </div>
  );
}
