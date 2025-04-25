import { useQuery } from "@tanstack/react-query";
import { Guest } from "@shared/schema";
import { Link } from "wouter";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GuestListOverview() {
  const { data: guests = [] } = useQuery<Guest[]>({
    queryKey: ["/api/guests"],
  });

  // Count stats
  const totalGuests = guests.length;
  const confirmedGuests = guests.filter(guest => guest.rsvpStatus === "confirmed").length;
  const pendingGuests = guests.filter(guest => guest.rsvpStatus === "pending").length;

  // Get recent guests for display
  const recentGuests = [...guests]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-muted-foreground font-body">
          <span className="font-medium text-foreground">{totalGuests}</span> guests total
        </div>
        <Link href="/guests">
          <Button size="icon" variant="ghost" className="text-primary-dark hover:text-primary transition duration-200">
            <PlusIcon className="h-5 w-5" />
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-primary-light rounded-lg p-3 text-center">
          <div className="font-heading text-xl">{confirmedGuests}</div>
          <div className="font-body text-sm text-muted-foreground">Confirmed</div>
        </div>
        <div className="bg-primary-light rounded-lg p-3 text-center">
          <div className="font-heading text-xl">{pendingGuests}</div>
          <div className="font-body text-sm text-muted-foreground">Pending</div>
        </div>
      </div>
      
      <div className="space-y-2">
        {recentGuests.map((guest) => (
          <div key={guest.id} className="flex justify-between items-center py-1">
            <div className="font-body">{guest.name}</div>
            <div className={`text-sm ${
              guest.rsvpStatus === 'confirmed' ? 'text-success' : 
              guest.rsvpStatus === 'declined' ? 'text-destructive' : 'text-warning'
            }`}>
              {guest.rsvpStatus.charAt(0).toUpperCase() + guest.rsvpStatus.slice(1)}
            </div>
          </div>
        ))}
        
        {recentGuests.length === 0 && (
          <div className="text-center py-2 text-muted-foreground">
            No guests added yet
          </div>
        )}
      </div>
      
      <Link href="/guests">
        <a className="block text-center text-primary-dark hover:text-primary transition duration-200 mt-4 font-body">
          Manage guest list
        </a>
      </Link>
    </div>
  );
}
