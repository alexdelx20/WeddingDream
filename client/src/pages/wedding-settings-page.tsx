import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/language-context";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { WeddingSettings } from "@shared/schema";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/ui/date-picker";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { Loader2, Save, Upload } from "lucide-react";

const settingsSchema = z.object({
  partner1Name: z.string().min(1, "Partner 1 name is required"),
  partner2Name: z.string().min(1, "Partner 2 name is required"),
  weddingDate: z.date({
    required_error: "Wedding date is required",
  }),
  venueName: z.string().optional(),
  venueAddress: z.string().optional(),
  theme: z.string().optional(),
  notes: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function WeddingSettingsPage() {
  const { toast } = useToast();
  const [isEditMode, setIsEditMode] = useState(true);
  
  // Fetch existing wedding settings
  const { data: settings, isLoading } = useQuery<WeddingSettings>({
    queryKey: ["/api/wedding-settings"],
  });
  
  // Update wedding settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: SettingsFormValues) => {
      const response = await apiRequest("POST", "/api/wedding-settings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wedding-settings"] });
      toast({
        title: "Settings saved",
        description: "Your wedding settings have been saved successfully.",
      });
      setIsEditMode(false);
    },
    onError: (error) => {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // State for profile image
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  
  // Form setup
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      partner1Name: "",
      partner2Name: "",
      weddingDate: new Date(),
      venueName: "",
      venueAddress: "",
      theme: "",
      notes: "",
    },
  });
  
  // Update form when settings are loaded
  useEffect(() => {
    if (settings) {
      form.reset({
        partner1Name: settings.partner1Name || "",
        partner2Name: settings.partner2Name || "",
        weddingDate: settings.weddingDate ? new Date(settings.weddingDate) : new Date(),
        venueName: settings.venueName || "",
        venueAddress: settings.venueAddress || "",
        theme: settings.theme || "",
        notes: settings.notes || "",
      });
    }
  }, [settings, form]);
  
  // Effect to handle profile image loading from settings
  useEffect(() => {
    if (settings?.profileImageUrl) {
      setProfileImageUrl(settings.profileImageUrl);
    }
  }, [settings]);

  // Function to upload image to server
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('image', file);
      
      // Upload the image
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };
  
  // Handle form submission
  const onSubmit = async (data: SettingsFormValues) => {
    // If there's a new profile image, upload it first
    let imageUrl = profileImageUrl;
    
    if (profileImage) {
      const uploadedUrl = await uploadImage(profileImage);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
        setProfileImageUrl(uploadedUrl);
      }
    }
    
    // Merge the image URL with the form data
    const settingsData = {
      ...data,
      profileImageUrl: imageUrl
    };
    
    // Update settings
    updateSettingsMutation.mutate(settingsData);
  };
  
  // Get translation function from language context
  const { translate } = useLanguage();
  
  return (
    <div className="w-full py-10 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-heading text-foreground">{translate("Wedding Settings")}</h1>
          {!isEditMode && (
            <Button 
              onClick={() => setIsEditMode(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {translate("Edit Settings")}
            </Button>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Wedding Details</CardTitle>
              <CardDescription>
                Update your wedding information to personalize your planning experience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="mb-8">
                    <FormLabel className="mb-2 block">{translate("Profile Image")}</FormLabel>
                    <FileUpload
                      onFileChange={setProfileImage}
                      disabled={!isEditMode}
                      previewUrl={profileImageUrl || undefined}
                    />
                    <FormDescription className="mt-1">
                      {translate("Upload a photo of you as a couple")}
                    </FormDescription>
                  </div>
                
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="partner1Name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{translate("Partner 1 Name")}</FormLabel>
                          <FormControl>
                            <Input disabled={!isEditMode} placeholder={translate("Enter name")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="partner2Name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{translate("Partner 2 Name")}</FormLabel>
                          <FormControl>
                            <Input disabled={!isEditMode} placeholder={translate("Enter name")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="weddingDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>{translate("Wedding Date")}</FormLabel>
                        <FormControl>
                          <DatePicker
                            disabled={!isEditMode}
                            date={field.value}
                            onSelect={(date: Date | undefined) => field.onChange(date)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="venueName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{translate("Venue Name")}</FormLabel>
                          <FormControl>
                            <Input disabled={!isEditMode} placeholder={translate("Enter venue name")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="venueAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{translate("Venue Address")}</FormLabel>
                          <FormControl>
                            <Input disabled={!isEditMode} placeholder={translate("Enter venue address")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="theme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{translate("Wedding Theme")}</FormLabel>
                        <FormControl>
                          <Input disabled={!isEditMode} placeholder={translate("E.g. Rustic, Bohemian, Classic")} {...field} />
                        </FormControl>
                        <FormDescription>
                          {translate("Describe the theme or style of your wedding")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{translate("Additional Notes")}</FormLabel>
                        <FormControl>
                          <Textarea 
                            disabled={!isEditMode}
                            placeholder={translate("Enter any additional details about your wedding")} 
                            className="min-h-32"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {isEditMode && (
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={updateSettingsMutation.isPending}
                    >
                      {updateSettingsMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {translate("Saving...")}
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          {translate("Save Settings")}
                        </>
                      )}
                    </Button>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
