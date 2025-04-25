import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Building, ExternalLink, Globe, Mail, Phone, PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { insertVendorSchema, type Vendor } from "@shared/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const vendorSchema = insertVendorSchema.extend({});

type VendorFormValues = z.infer<typeof vendorSchema>;

const VENDOR_CATEGORIES = [
  "Venue",
  "Catering",
  "Photography",
  "Videography",
  "Music/DJ",
  "Florist",
  "Wedding Planner",
  "Attire",
  "Cake/Desserts",
  "Transportation",
  "Invitations",
  "Decorations",
  "Beauty",
  "Officiant",
  "Other"
];

export default function VendorsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingVendor, setIsAddingVendor] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  
  // Default vendors for weddings by category
  const defaultVendors = [
    { 
      name: "Sample Venue Vendor", 
      category: "Venue", 
      contactName: "", 
      email: "", 
      phone: "", 
      website: "", 
      notes: "Wedding venue and reception location provider", 
      userId: 0 
    },
    { 
      name: "Sample Catering Vendor", 
      category: "Catering", 
      contactName: "", 
      email: "", 
      phone: "", 
      website: "", 
      notes: "Catering service for wedding and reception", 
      userId: 0 
    },
    { 
      name: "Sample Photography Vendor", 
      category: "Photography", 
      contactName: "", 
      email: "", 
      phone: "", 
      website: "", 
      notes: "Wedding photography service", 
      userId: 0 
    },
    { 
      name: "Sample Florist Vendor", 
      category: "Florist", 
      contactName: "", 
      email: "", 
      phone: "", 
      website: "", 
      notes: "Floral arrangements for ceremony and reception", 
      userId: 0 
    },
    { 
      name: "Sample Music/DJ Vendor", 
      category: "Music/DJ", 
      contactName: "", 
      email: "", 
      phone: "", 
      website: "", 
      notes: "Music and entertainment for ceremony and reception", 
      userId: 0 
    }
  ];
  
  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: "",
      category: "",
      email: "",
      phone: "",
      website: "",
      contactName: "",
      notes: "",
      contractLink: "",
    },
  });
  
  // Fetch vendors from API
  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ["/api/vendors"],
    queryFn: async () => {
      const response = await fetch("/api/vendors");
      if (!response.ok) {
        throw new Error("Failed to fetch vendors");
      }
      return response.json() as Promise<Vendor[]>;
    },
  });
  
  // Create vendor mutation
  const createVendor = useMutation({
    mutationFn: async (data: VendorFormValues) => {
      const res = await apiRequest("POST", "/api/vendors", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      toast({
        title: "Success",
        description: "Vendor added successfully",
      });
      setIsAddingVendor(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add vendor",
        variant: "destructive",
      });
    },
  });
  
  // Delete vendor mutation
  const deleteVendor = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/vendors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      toast({
        title: "Success",
        description: "Vendor removed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove vendor",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: VendorFormValues) => {
    createVendor.mutate(data);
  };
  
  const handleDeleteVendor = (id: number) => {
    if (confirm("Are you sure you want to delete this vendor?")) {
      deleteVendor.mutate(id);
    }
  };
  
  // Function to add a single default vendor
  const addSingleDefaultVendor = async (vendor: typeof defaultVendors[0]) => {
    try {
      // Make a direct fetch request to avoid issues with the vendor's type
      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vendor),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add default vendor');
      }
      
      return await response.json();
    } catch (error) {
      console.error("Failed to add default vendor:", error);
      throw error;
    }
  };
  
  // Handle adding all default vendors
  const handleAddDefaultVendors = () => {
    // Show loading toast
    toast({
      title: "Adding Default Vendors",
      description: "Adding standard wedding vendor categories...",
    });
    
    // Add all default vendors one by one
    Promise.all(defaultVendors.map(vendor => addSingleDefaultVendor(vendor)))
      .then(() => {
        // All vendors added successfully
        toast({
          title: "Default Vendors Added",
          description: "We've added standard wedding vendor categories to help you get started.",
        });
      })
      .catch(error => {
        console.error("Error adding default vendors:", error);
        toast({
          title: "Error",
          description: "Something went wrong adding default vendors. Please try again.",
          variant: "destructive",
        });
      });
  };
  
  // Filter vendors by category
  const filteredVendors = activeCategory === "all" 
    ? vendors 
    : vendors.filter(vendor => vendor.category === activeCategory);
  
  // Get unique categories from vendors
  const uniqueCategories = Array.from(new Set(vendors.map(vendor => vendor.category)));
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading">Wedding Vendors</h1>
        <Button 
          onClick={() => setIsAddingVendor(!isAddingVendor)}
          className="bg-primary hover:bg-primary/90"
        >
          {isAddingVendor ? "Cancel" : (
            <>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Vendor
            </>
          )}
        </Button>
      </div>
      
      {isAddingVendor && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Vendor</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vendor/Business Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter vendor name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {VENDOR_CATEGORIES.map(category => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person</FormLabel>
                        <FormControl>
                          <Input placeholder="Name of your contact" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Contact email" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Contact phone number" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="contractLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Link (Google Drive, Dropbox, etc.)</FormLabel>
                      <FormControl>
                        <Input placeholder="Link to contract document" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional notes, pricing information, etc."
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={createVendor.isPending}>
                    {createVendor.isPending ? "Saving..." : "Add Vendor"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
      
      <Tabs defaultValue="all" onValueChange={setActiveCategory}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Vendors</TabsTrigger>
          {uniqueCategories.map(category => (
            <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value={activeCategory}>
          <div className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="p-8 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </CardContent>
              </Card>
            ) : filteredVendors.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    {activeCategory === "all" 
                      ? "No vendors added yet. Add your first vendor." 
                      : `No vendors in the "${activeCategory}" category.`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredVendors.map((vendor) => (
                  <Card key={vendor.id} className="overflow-hidden hover:shadow-md transition-all">
                    <CardHeader className="bg-primary/10 pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{vendor.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{vendor.category}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteVendor(vendor.id)}
                          className="text-red-500 hover:text-red-700 h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        {vendor.contactName && (
                          <div className="flex items-center text-sm">
                            <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>Contact: {vendor.contactName}</span>
                          </div>
                        )}
                        
                        {vendor.email && (
                          <div className="flex items-center text-sm">
                            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                            <a href={`mailto:${vendor.email}`} className="text-primary hover:underline">
                              {vendor.email}
                            </a>
                          </div>
                        )}
                        
                        {vendor.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                            <a href={`tel:${vendor.phone}`} className="hover:underline">
                              {vendor.phone}
                            </a>
                          </div>
                        )}
                        
                        {vendor.website && (
                          <div className="flex items-center text-sm">
                            <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                            <a 
                              href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Visit Website
                            </a>
                          </div>
                        )}
                        
                        {vendor.contractLink && (
                          <div className="flex items-center text-sm">
                            <ExternalLink className="h-4 w-4 mr-2 text-muted-foreground" />
                            <a 
                              href={vendor.contractLink.startsWith('http') ? vendor.contractLink : `https://${vendor.contractLink}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              View Contract
                            </a>
                          </div>
                        )}
                        
                        {vendor.notes && (
                          <div className="mt-3 pt-3 border-t text-sm">
                            <p className="text-muted-foreground">{vendor.notes}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}