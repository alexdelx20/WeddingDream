import { useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { Link } from "wouter";
import { differenceInMonths } from "date-fns";

interface TimelineEvent {
  id: number;
  title: string;
  description: string;
  date: Date;
  timeframe: string;
  completed: boolean;
}

export function Timeline() {
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: settings } = useQuery({
    queryKey: ["/api/wedding-settings"],
  });

  // Create timeline events from tasks with due dates
  let timelineEvents: TimelineEvent[] = [];
  
  if (settings?.weddingDate && tasks.length > 0) {
    const weddingDate = new Date(settings.weddingDate);
    
    timelineEvents = tasks
      .filter(task => task.dueDate)
      .map(task => {
        const dueDate = new Date(task.dueDate!);
        const monthsBeforeWedding = differenceInMonths(weddingDate, dueDate);
        
        let timeframe = "";
        if (monthsBeforeWedding === 0) {
          timeframe = "Wedding month";
        } else if (monthsBeforeWedding === 1) {
          timeframe = "1 month before";
        } else {
          timeframe = `${monthsBeforeWedding} months before`;
        }
        
        return {
          id: task.id,
          title: task.title,
          description: task.description || "",
          date: dueDate,
          timeframe,
          completed: task.completed,
        };
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  return (
    <div className="px-6 py-5">
      <div className="relative pb-5">
        {/* Timeline Line */}
        <div className="absolute top-0 bottom-0 left-[11px] w-[2px] bg-primary-light"></div>
        
        {timelineEvents.map((event) => (
          <div key={event.id} className="relative pl-8 pb-6">
            <div className={`absolute top-0 left-0 w-6 h-6 rounded-full ${event.completed ? 'bg-primary' : 'bg-primary-light'} flex items-center justify-center`}>
              <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
            <div className="font-body text-sm text-muted-foreground mb-1">{event.timeframe}</div>
            <h4 className="font-body font-medium mb-1">{event.title}</h4>
            <p className="text-muted-foreground text-sm">{event.description}</p>
          </div>
        ))}
        
        {timelineEvents.length === 0 && (
          <div className="pl-8 py-6 text-muted-foreground">
            No timeline events yet. Add tasks with due dates to see your wedding timeline.
          </div>
        )}
      </div>
      <Link href="/tasks">
        <a className="block text-center text-primary-dark hover:text-primary transition duration-200 font-body">
          View full timeline
        </a>
      </Link>
    </div>
  );
}
