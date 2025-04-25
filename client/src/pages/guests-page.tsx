import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, PlusCircle, Search, UserPlus, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { insertGuestSchema, type Guest } from "@shared/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const guestSchema = insertGuestSchema.extend({
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  rsvpStatus: z.enum(["pending", "confirmed", "declined"]).nullable().optional(),
  mealPreference: z.string().nullable().optional(),
  plusOne: z.boolean().nullable().optional(),
  plusOneName: z.string().nullable().optional(),
});

type GuestFormValues = z.infer<typeof guestSchema>;

export default function GuestsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingGuest, setIsAddingGuest] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const form = useForm<GuestFormValues>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      notes: "",
      rsvpStatus: "pending",
      mealPreference: "",
      plusOne: false,
      plusOneName: "",
    },
  });
  
  // Fetch guests from API
  const { data: guests = [], isLoading } = useQuery({
    queryKey: ["/api/guests"],
    queryFn: async () => {
      const response = await fetch("/api/guests");
      if (!response.ok) {
        throw new Error("Failed to fetch guests");
      }
      return response.json() as Promise<Guest[]>;
    },
  });
  
  // Create guest mutation
  const createGuest = useMutation({
    mutationFn: async (data: GuestFormValues) => {
      const res = await apiRequest("POST", "/api/guests", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guests"] });
      toast({
        title: "Success",
        description: "Guest added successfully",
      });
      setIsAddingGuest(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add guest",
        variant: "destructive",
      });
    },
  });
  
  // Delete guest mutation
  const deleteGuest = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/guests/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guests"] });
      toast({
        title: "Success",
        description: "Guest removed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove guest",
        variant: "destructive",
      });
    },
  });
  
  // Update guest mutation
  const updateGuest = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<GuestFormValues> }) => {
      const res = await apiRequest("PATCH", `/api/guests/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guests"] });
      toast({
        title: "Success",
        description: "Guest updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update guest",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: GuestFormValues) => {
    createGuest.mutate(data);
  };
  
  const handleUpdateRsvpStatus = (id: number, rsvpStatus: "pending" | "confirmed" | "declined") => {
    updateGuest.mutate({
      id,
      data: { rsvpStatus },
    });
  };
  
  const handleRemoveGuest = (id: number) => {
    if (confirm("Are you sure you want to remove this guest?")) {
      deleteGuest.mutate(id);
    }
  };
  
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "declined":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };
  
  const filteredGuests = guests.filter(guest => 
    guest.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (guest.email && guest.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const confirmedGuests = guests.filter(guest => guest.rsvpStatus === "confirmed").length;
  const declinedGuests = guests.filter(guest => guest.rsvpStatus === "declined").length;
  const pendingGuests = guests.filter(guest => guest.rsvpStatus === "pending").length;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading">Guest List</h1>
        <Button 
          onClick={() => setIsAddingGuest(!isAddingGuest)}
          className="bg-primary hover:bg-primary/90"
        >
          {isAddingGuest ? "Cancel" : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Guest
            </>
          )}
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Guests</p>
              <p className="text-3xl font-bold">{guests.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">Confirmed</p>
              <p className="text-3xl font-bold text-green-600">{confirmedGuests}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{pendingGuests}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {isAddingGuest && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Guest</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter guest name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter email" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="rsvpStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RSVP Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value || "pending"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="declined">Declined</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="mealPreference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meal Preference</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g., Vegetarian, Vegan, etc." {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="plusOne"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Plus One</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Guest is allowed to bring a companion
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
                
                {form.watch("plusOne") && (
                  <FormField
                    control={form.control}
                    name="plusOneName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plus One Name (if known)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter plus one's name" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional information"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={createGuest.isPending}>
                    {createGuest.isPending ? "Saving..." : "Add Guest"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
      
      <div className="relative">
        <Input
          placeholder="Search guests by name or email..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
      </div>
      
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </CardContent>
          </Card>
        ) : filteredGuests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                {searchTerm ? "No guests match your search" : "No guests yet. Add your first guest."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredGuests.map((guest) => (
            <Card key={guest.id} className="overflow-hidden hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <h3 className="font-medium text-lg">{guest.name}</h3>
                      {guest.plusOne && (
                        <Badge variant="outline" className="ml-2">+1</Badge>
                      )}
                    </div>
                    
                    {guest.plusOneName && (
                      <p className="text-sm text-muted-foreground">
                        Plus One: {guest.plusOneName}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      {guest.email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          <span>{guest.email}</span>
                        </div>
                      )}
                      
                      {guest.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          <span>{guest.phone}</span>
                        </div>
                      )}
                    </div>
                    
                    {guest.mealPreference && (
                      <p className="text-sm">
                        <span className="font-medium">Meal:</span> {guest.mealPreference}
                      </p>
                    )}
                    
                    {guest.notes && (
                      <p className="text-sm text-muted-foreground">
                        {guest.notes}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-2 items-start md:items-center">
                    <div className="flex space-x-2">
                      <Select
                        value={guest.rsvpStatus || "pending"}
                        onValueChange={(value) => handleUpdateRsvpStatus(
                          guest.id, 
                          value as "pending" | "confirmed" | "declined"
                        )}
                      >
                        <SelectTrigger className={`w-32 text-xs ${getStatusColor(guest.rsvpStatus)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="declined">Declined</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveGuest(guest.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}