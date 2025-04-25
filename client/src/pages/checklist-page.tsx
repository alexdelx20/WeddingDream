import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarIcon, Plus, CheckSquare, X, Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent} from "@/components/ui/calendar";
import { format } from "date-fns";
import { Task } from "@shared/schema";
import { formatDate } from "@/lib/dateUtils";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function ChecklistPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: null as Date | null,
    completed: false,
    userId: 0 // Will be set on the server from authenticated user session
  });
  
  // Fetch tasks
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });
  
  // Add task mutation
  const addTaskMutation = useMutation({
    mutationFn: async (taskData: Omit<Task, "id" | "createdAt" | "userId">) => {
      const task = {
        ...taskData,
        userId: 0, // This will be set by the server based on the authenticated user
        dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null,
      };
      
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add task');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      resetForm();
      setIsDialogOpen(false);
    },
  });
  
  // Update task mutation (for marking as complete)
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, changes }: { id: number; changes: Partial<Task> }) => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(changes),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
  });
  
  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
  });
  
  const resetForm = () => {
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      dueDate: null,
      completed: false,
      userId: 0
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert Date object to ISO string format for the API
    const taskData = {
      ...newTask,
      dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : null,
    };
    addTaskMutation.mutate(taskData as any);
  };
  
  const handleToggleComplete = (task: Task) => {
    updateTaskMutation.mutate({
      id: task.id,
      changes: { completed: !task.completed }
    });
  };
  
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(id);
    }
  };
  
  const handleDateSelect = (date: Date | undefined) => {
    setNewTask({ ...newTask, dueDate: date || null });
  };
  
  // Filter tasks based on active tab
  const filteredTasks = tasks.filter(task => {
    if (activeTab === "all") return true;
    if (activeTab === "completed") return task.completed;
    if (activeTab === "pending") return !task.completed;
    
    // Filter by priority
    return task.priority === activeTab;
  });
  
  // Sort tasks by due date, with nulls at the end
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold">Wedding Checklist</h1>
          <p className="mt-1 text-muted-foreground">
            Keep track of everything you need to do for your perfect day
          </p>
        </div>
        
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus size={18} />
          <span>Add New Task</span>
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Tasks</CardTitle>
            
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="high">High Priority</TabsTrigger>
                <TabsTrigger value="medium">Medium Priority</TabsTrigger>
                <TabsTrigger value="low">Low Priority</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <CardDescription>
            {tasks.length} total tasks, {tasks.filter(t => t.completed).length} completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : sortedTasks.length === 0 ? (
            <div className="text-center py-10">
              <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
              <p className="text-muted-foreground">No tasks found</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsDialogOpen(true)}
              >
                Add your first task
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedTasks.map((task) => (
                <div 
                  key={task.id}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-lg hover:bg-secondary/30 transition-colors",
                    task.completed && "bg-secondary/20 text-muted-foreground"
                  )}
                >
                  <Checkbox 
                    checked={task.completed === true}
                    onCheckedChange={() => handleToggleComplete(task)}
                    className={cn(
                      "mt-1",
                      task.priority === "high" ? "data-[state=unchecked]:border-red-500" :
                      task.priority === "medium" ? "data-[state=unchecked]:border-orange-500" :
                      "data-[state=unchecked]:border-green-500"
                    )}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={cn(
                          "font-medium",
                          task.completed && "line-through"
                        )}>
                          {task.title}
                        </p>
                        
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {task.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {task.dueDate && (
                          <div className="flex items-center text-xs bg-secondary/30 px-2 py-1 rounded">
                            <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span>{formatDate(task.dueDate, 'MMM d, yyyy')}</span>
                          </div>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive/80"
                          onClick={() => handleDelete(task.id)}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add Task Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid gap-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Task Title
                </label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Enter task title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Add details about this task"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Due Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newTask.dueDate ? (
                          format(newTask.dueDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={newTask.dueDate || undefined}
                        onSelect={handleDateSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Priority
                  </label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button 
                type="submit" 
                disabled={addTaskMutation.isPending || !newTask.title}
              >
                {addTaskMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : "Save Task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}