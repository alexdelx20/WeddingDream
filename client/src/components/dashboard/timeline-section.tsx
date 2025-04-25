import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TimelineEvent } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/dateUtils";

const timelineEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.string().optional(),
  monthsBefore: z.coerce.number().optional(),
  completed: z.boolean().default(false),
});

type TimelineFormValues = z.infer<typeof timelineEventSchema>;

export function TimelineSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Fetch timeline events
  const { data: events, isLoading } = useQuery<TimelineEvent[]>({
    queryKey: ["/api/timeline"],
  });
  
  // Fetch wedding settings to get wedding date
  const { data: settings } = useQuery({
    queryKey: ["/api/wedding-settings"],
  });
  
  // Create timeline event mutation
  const createEventMutation = useMutation({
    mutationFn: async (data: TimelineFormValues) => {
      const response = await apiRequest("POST", "/api/timeline", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timeline"] });
      setIsDialogOpen(false);
      toast({
        title: "Timeline event added",
        description: "Your timeline event has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding timeline event",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Toggle event completion
  const toggleEventMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number, completed: boolean }) => {
      const response = await apiRequest("PATCH", `/api/timeline/${id}`, { completed });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timeline"] });
    },
  });
  
  // Form setup
  const form = useForm<TimelineFormValues>({
    resolver: zodResolver(timelineEventSchema),
    defaultValues: {
      title: "",
      description: "",
      completed: false,
    },
  });
  
  const onSubmit = (data: TimelineFormValues) => {
    createEventMutation.mutate(data);
  };
  
  // Sort events by date if available, or months before if available
  const sortedEvents = events ? [...events].sort((a, b) => {
    if (a.date && b.date) {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    if (a.monthsBefore && b.monthsBefore) {
      return b.monthsBefore - a.monthsBefore; // Higher months before comes first
    }
    if (a.monthsBefore) return -1;
    if (b.monthsBefore) return 1;
    return 0;
  }) : [];
  
  // Format month text
  const formatMonthText = (months: number | null | undefined): string => {
    if (!months) return "";
    return months === 1 ? "1 month before" : `${months} months before`;
  };
  
  return (
    <div className="col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-heading text-xl">Wedding Timeline</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Timeline Event</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter event title" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter event description" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specific Date (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="monthsBefore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Months Before Wedding (Optional)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="1" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="completed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-1">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Mark as Completed</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createEventMutation.isPending}
                >
                  {createEventMutation.isPending ? "Adding..." : "Add Event"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="px-6 py-5">
        <div className="relative pb-5">
          {/* Timeline Line */}
          <div className="timeline-line"></div>
          
          {isLoading ? (
            // Skeleton loading state
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="relative pl-8 pb-6">
                  <div className="timeline-dot">
                    <div className="timeline-dot-inner"></div>
                  </div>
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-5 w-48 mb-1" />
                  <Skeleton className="h-4 w-64" />
                </div>
              ))}
            </>
          ) : sortedEvents.length > 0 ? (
            // Display timeline events
            <>
              {sortedEvents.slice(0, 4).map((event) => (
                <div key={event.id} className="relative pl-8 pb-6">
                  <div 
                    className={`timeline-dot ${event.completed ? 'bg-primary' : 'bg-accent'}`}
                    onClick={() => {
                      toggleEventMutation.mutate({
                        id: event.id,
                        completed: !event.completed,
                      });
                    }}
                  >
                    <div className="timeline-dot-inner"></div>
                  </div>
                  <div className="font-body text-sm text-muted-foreground mb-1">
                    {event.date ? formatDate(event.date) : formatMonthText(event.monthsBefore)}
                  </div>
                  <h4 className="font-body font-medium mb-1">{event.title}</h4>
                  <p className="text-muted-foreground text-sm">{event.description}</p>
                </div>
              ))}
            </>
          ) : (
            // Empty state
            <div className="text-center py-8 text-muted-foreground">
              No timeline events yet. Add your first event!
            </div>
          )}
        </div>
        <Button 
          variant="link" 
          className="w-full text-primary-foreground"
        >
          View full timeline
        </Button>
      </div>
    </div>
  );
}
