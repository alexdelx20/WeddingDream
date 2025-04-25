import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { BudgetCategory } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const budgetCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  estimatedCost: z.coerce.number().min(0, "Must be a positive number"),
  actualCost: z.coerce.number().min(0, "Must be a positive number").optional(),
  notes: z.string().optional(),
});

type BudgetFormValues = z.infer<typeof budgetCategorySchema>;

export function BudgetCard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Fetch budget categories
  const { data: categories, isLoading } = useQuery<BudgetCategory[]>({
    queryKey: ["/api/budget"],
  });
  
  // Create budget category mutation
  const createBudgetMutation = useMutation({
    mutationFn: async (data: BudgetFormValues) => {
      const response = await apiRequest("POST", "/api/budget", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budget"] });
      setIsDialogOpen(false);
      toast({
        title: "Budget category created",
        description: "Your budget category has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating budget category",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Form setup
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetCategorySchema),
    defaultValues: {
      name: "",
      estimatedCost: 0,
      actualCost: 0,
      notes: "",
    },
  });
  
  const onSubmit = (data: BudgetFormValues) => {
    createBudgetMutation.mutate(data);
  };
  
  // Calculate budget totals
  const totalBudget = categories?.reduce((sum, cat) => sum + (cat.estimatedCost || 0), 0) || 0;
  const totalSpent = categories?.reduce((sum, cat) => sum + (cat.actualCost || 0), 0) || 0;
  const remaining = totalBudget - totalSpent;
  const spentPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  
  return (
    <div className="dashboard-card bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100">
        <h3 className="font-heading text-xl">Budget</h3>
      </div>
      <div className="px-6 py-4">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-muted-foreground font-body">Total Budget</div>
            <div className="font-body font-medium">${totalBudget.toLocaleString()}</div>
          </div>
          <div className="flex justify-between items-center mb-1">
            <div className="text-muted-foreground font-body">Spent So Far</div>
            <div className="font-body text-error">${totalSpent.toLocaleString()}</div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-muted-foreground font-body">Remaining</div>
            <div className="font-body text-success">${remaining.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="progress-bar mb-4">
          <div className="progress-bar-fill" style={{ width: `${spentPercentage}%` }}></div>
        </div>
        
        <div className="flex justify-between items-center mb-2">
          <div className="text-foreground font-body font-medium">Budget Categories</div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:text-primary hover:bg-transparent">
                <Plus size={18} />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Budget Category</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Venue & Catering" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="estimatedCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Cost ($)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="1" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="actualCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Actual Cost ($) (Optional)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="1" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Any additional notes about this budget item" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createBudgetMutation.isPending}
                  >
                    {createBudgetMutation.isPending ? "Adding..." : "Add Category"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        
        {isLoading ? (
          <div className="space-y-2 mb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center py-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="space-y-2 mb-4">
            {categories.slice(0, 3).map((category) => (
              <div key={category.id} className="flex justify-between items-center py-1">
                <div className="font-body text-sm">{category.name}</div>
                <div className="font-body text-sm">
                  ${category.actualCost ? category.actualCost.toLocaleString() : (category.estimatedCost || 0).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground mb-4">
            No budget categories yet. Add your first category!
          </div>
        )}
        
        <Button 
          variant="link" 
          className="w-full text-primary-foreground"
        >
          Manage budget
        </Button>
      </div>
    </div>
  );
}
