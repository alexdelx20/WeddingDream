import { useQuery } from "@tanstack/react-query";
import { WeddingSettings } from "@shared/schema";
import { format, differenceInDays } from "date-fns";
import { CalendarDays, MapPin } from "lucide-react";

export function WeddingOverview() {
  const { data: settings } = useQuery<WeddingSettings>({
    queryKey: ["/api/wedding-settings"],
  });

  // Calculate days remaining
  const weddingDate = settings?.weddingDate ? new Date(settings.weddingDate) : null;
  const daysRemaining = weddingDate ? differenceInDays(weddingDate, new Date()) : null;
  
  // Calculate progress (a simple placeholder implementation)
  const progress = 62; // This would be calculated based on tasks completed, etc.

  return (
    <section className="bg-white py-10 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0">
            <h2 className="font-heading text-3xl mb-3 text-foreground">
              {settings?.partnerName1 && settings?.partnerName2
                ? `${settings.partnerName1} & ${settings.partnerName2}`
                : "Plan Your Wedding"}
            </h2>
            {weddingDate && (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                <span className="font-body">{format(weddingDate, "MMMM d, yyyy")}</span>
              </div>
            )}
            {settings?.venue && (
              <div className="flex items-center space-x-2 mt-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="font-body">
                  {settings.venue}
                  {settings.venueAddress && `, ${settings.venueAddress}`}
                </span>
              </div>
            )}
          </div>
          
          {daysRemaining !== null && daysRemaining > 0 && (
            <div className="text-center">
              <div className="text-5xl font-heading text-primary-dark mb-2">{daysRemaining}</div>
              <div className="text-muted-foreground font-body">days remaining</div>
            </div>
          )}
          
          <div className="mt-6 md:mt-0">
            <div className="bg-primary-light rounded-xl px-6 py-4 text-center">
              <h3 className="font-heading text-xl mb-2">Wedding Progress</h3>
              <div className="progress-bar mb-3">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="font-body text-muted-foreground">{progress}% of planning complete</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
