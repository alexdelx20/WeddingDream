import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Mail, Phone, Check } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const helpMessageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type HelpMessageFormValues = z.infer<typeof helpMessageSchema>;

export default function HelpCenterPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Create help message mutation
  const createHelpMessageMutation = useMutation({
    mutationFn: async (data: HelpMessageFormValues) => {
      const response = await apiRequest("POST", "/api/help", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully. We'll get back to you soon.",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Form setup
  const form = useForm<HelpMessageFormValues>({
    resolver: zodResolver(helpMessageSchema),
    defaultValues: {
      name: user?.username || "",
      email: user?.email || "",
      subject: "",
      message: "",
    },
  });
  
  // Handle form submission
  const onSubmit = (data: HelpMessageFormValues) => {
    createHelpMessageMutation.mutate(data);
  };
  
  const successState = createHelpMessageMutation.isSuccess;
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow py-10 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-heading text-foreground mb-8 text-center">Help Center</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Find answers to common questions about using My Wedding Dream.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>How do I add tasks to my wedding plan?</AccordionTrigger>
                    <AccordionContent>
                      You can add tasks from your dashboard by clicking the "+" button in the Tasks card. 
                      Fill in the task details and click "Create Task" to add it to your list.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Can I export my guest list?</AccordionTrigger>
                    <AccordionContent>
                      Currently, we don't offer an export feature, but we're working on adding this 
                      functionality in a future update. You can view and manage your guest list in the 
                      Guest List section of your dashboard.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger>How do I update my wedding date?</AccordionTrigger>
                    <AccordionContent>
                      Go to the Wedding Settings page from the navigation menu. You can edit your wedding 
                      date and other details there. Make sure to save your changes after updating.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4">
                    <AccordionTrigger>Is there a mobile app available?</AccordionTrigger>
                    <AccordionContent>
                      While we don't have a dedicated mobile app yet, our website is fully responsive 
                      and works great on mobile devices. You can add it to your home screen for easy access.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-5">
                    <AccordionTrigger>How do I track my wedding budget?</AccordionTrigger>
                    <AccordionContent>
                      Use the Budget card on your dashboard to create budget categories and track estimated vs. 
                      actual costs. The progress bar will show you how much of your budget you've spent.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
            
            <div>
              <Card className="bg-white mb-6">
                <CardHeader>
                  <CardTitle>Contact Us</CardTitle>
                  <CardDescription>
                    Can't find what you're looking for? Send us a message and we'll get back to you.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-4">
                    <Mail className="h-5 w-5 mr-2 text-primary-foreground" />
                    <a href="mailto:info@myweddingdream.co" className="text-primary-foreground hover:underline">
                      info@myweddingdream.co
                    </a>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 mr-2 text-primary-foreground" />
                    <span>1-800-WEDDING</span>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-center">
                <div className="w-full max-w-xs text-center text-muted-foreground">
                  <p className="text-sm">
                    We're available Monday-Friday, 9AM-5PM EST. We typically respond to messages within 24 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Send a Message</CardTitle>
              <CardDescription>
                Have a specific question or need assistance with your wedding planning? Send us a message and our team will help you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {successState ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <Check className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Message Sent!</h3>
                  <p className="text-center text-muted-foreground mb-4">
                    Thank you for reaching out. We'll get back to you as soon as possible.
                  </p>
                  <Button
                    onClick={() => createHelpMessageMutation.reset()}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your name" {...field} />
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
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="What is your message about?" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="How can we help you?" 
                              className="min-h-32"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
                      disabled={createHelpMessageMutation.isPending}
                    >
                      {createHelpMessageMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Message"
                      )}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
