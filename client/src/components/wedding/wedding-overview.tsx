import { useQuery } from "@tanstack/react-query";
import { WeddingSettings } from "@shared/schema";
import { calculateDaysRemaining, formatDate, calculateProgress } from "@/lib/dateUtils";
import { Skeleton } from "@/components/ui/skeleton";

export function WeddingOverview() {
  const { data: settings, isLoading } = useQuery<WeddingSettings>({
    queryKey: ["/api/wedding-settings"],
  });
  
  const { data: tasks, isLoading: isTasksLoading } = useQuery<any[]>({
    queryKey: ["/api/tasks"],
  });
  
  // Calculate days remaining
  const daysRemaining = settings?.weddingDate ? calculateDaysRemaining(settings.weddingDate) : 0;
  
  // Calculate progress
  const completedTasks = tasks?.filter(task => task.completed).length || 0;
  const totalTasks = tasks?.length || 0;
  const progressPercentage = calculateProgress(totalTasks, completedTasks);
  
  if (isLoading) {
    return (
      <section className="bg-white py-10 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <Skeleton className="h-8 w-64 mb-3" />
              <Skeleton className="h-5 w-48 mb-2" />
              <Skeleton className="h-5 w-64" />
            </div>
            
            <div className="text-center">
              <Skeleton className="h-16 w-20 mb-2 mx-auto" />
              <Skeleton className="h-5 w-32 mx-auto" />
            </div>
            
            <div className="mt-6 md:mt-0">
              <div className="bg-accent rounded-xl px-6 py-4 text-center">
                <Skeleton className="h-6 w-40 mb-2 mx-auto" />
                <div className="progress-bar mb-3">
                  <div className="progress-bar-fill" style={{ width: '0%' }}></div>
                </div>
                <Skeleton className="h-5 w-48 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="bg-white py-10 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0">
            <h2 className="font-heading text-3xl mb-3 text-foreground">
              {settings?.partner1Name && settings?.partner2Name
                ? `${settings.partner1Name} & ${settings.partner2Name}`
                : "Your Wedding"}
            </h2>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <i className="far fa-calendar-alt"></i>
              <span className="font-body">
                {settings?.weddingDate 
                  ? formatDate(settings.weddingDate) 
                  : "Wedding date not set"}
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-2 text-muted-foreground">
              <i className="fas fa-map-marker-alt"></i>
              <span className="font-body">
                {settings?.venueName 
                  ? `${settings.venueName}${settings.venueAddress ? `, ${settings.venueAddress}` : ''}` 
                  : "Venue not set"}
              </span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-5xl font-heading text-primary-foreground mb-2">
              {daysRemaining}
            </div>
            <div className="text-muted-foreground font-body">days remaining</div>
          </div>
          
          <div className="mt-6 md:mt-0">
            <div className="bg-accent rounded-xl px-6 py-4 text-center">
              <h3 className="font-heading text-xl mb-2">Wedding Progress</h3>
              <div className="progress-bar mb-3">
                <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }}></div>
              </div>
              <div className="font-body text-muted-foreground">
                {progressPercentage}% of planning complete
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
