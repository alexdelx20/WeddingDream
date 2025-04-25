import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Guest } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const guestSchema = z.object({
  name: z.string().min(1, "Guest name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  rsvpStatus: z.enum(["pending", "confirmed", "declined"]).default("pending"),
  mealPreference: z.string().optional(),
  plusOne: z.boolean().default(false),
  plusOneName: z.string().optional(),
  notes: z.string().optional(),
});

type GuestFormValues = z.infer<typeof guestSchema>;

export function GuestListCard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Fetch guests
  const { data: guests, isLoading } = useQuery<Guest[]>({
    queryKey: ["/api/guests"],
  });
  
  // Create guest mutation
  const createGuestMutation = useMutation({
    mutationFn: async (data: GuestFormValues) => {
      const response = await apiRequest("POST", "/api/guests", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guests"] });
      setIsDialogOpen(false);
      toast({
        title: "Guest added",
        description: "Your guest has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding guest",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Form setup
  const form = useForm<GuestFormValues>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      rsvpStatus: "pending",
      mealPreference: "",
      plusOne: false,
      plusOneName: "",
      notes: "",
    },
  });
  
  const onSubmit = (data: GuestFormValues) => {
    createGuestMutation.mutate(data);
  };
  
  // Watch plus one checkbox to conditionally show plus one name field
  const watchPlusOne = form.watch("plusOne");
  
  // Calculate guest stats
  const totalGuests = guests?.length || 0;
  const confirmedGuests = guests?.filter(guest => guest.rsvpStatus === "confirmed").length || 0;
  const pendingGuests = guests?.filter(guest => guest.rsvpStatus === "pending").length || 0;
  
  return (
    <div className="dashboard-card bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100">
        <h3 className="font-heading text-xl">Guest List</h3>
      </div>
      <div className="px-6 py-4">
        <div className="flex justify-between items-center mb-4">
          <div className="text-muted-foreground font-body">
            <span className="font-medium text-foreground">{totalGuests}</span> guests total
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:text-primary hover:bg-transparent">
                <Plus size={18} />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Guest</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guest Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter guest name" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter guest email" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter guest phone" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="rsvpStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RSVP Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select RSVP status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="declined">Declined</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="mealPreference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meal Preference (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g. Vegetarian, Vegan, etc." {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="plusOne"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-1">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Plus One</FormLabel>
                          <FormDescription>
                            Allow this guest to bring a plus one
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  {watchPlusOne && (
                    <FormField
                      control={form.control}
                      name="plusOneName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plus One Name (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter plus one name" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Any additional notes about this guest" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createGuestMutation.isPending}
                  >
                    {createGuestMutation.isPending ? "Adding..." : "Add Guest"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-accent rounded-lg p-3 text-center">
            <div className="font-heading text-xl">{confirmedGuests}</div>
            <div className="font-body text-sm text-muted-foreground">Confirmed</div>
          </div>
          <div className="bg-accent rounded-lg p-3 text-center">
            <div className="font-heading text-xl">{pendingGuests}</div>
            <div className="font-body text-sm text-muted-foreground">Pending</div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center py-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        ) : guests && guests.length > 0 ? (
          <div className="space-y-2">
            {guests.slice(0, 3).map((guest) => (
              <div key={guest.id} className="flex justify-between items-center py-1">
                <div className="font-body">{guest.name}</div>
                <div className={`text-sm ${
                  guest.rsvpStatus === 'confirmed' ? 'text-success' : 
                  guest.rsvpStatus === 'declined' ? 'text-error' : 
                  'text-warning'
                }`}>
                  {guest.rsvpStatus.charAt(0).toUpperCase() + guest.rsvpStatus.slice(1)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No guests yet. Add your first guest!
          </div>
        )}
        
        <Button 
          variant="link" 
          className="w-full mt-4 text-primary-foreground"
        >
          Manage guest list
        </Button>
      </div>
    </div>
  );
}
