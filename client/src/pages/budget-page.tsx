import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PlusCircle, DollarSign, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { insertBudgetCategorySchema, type BudgetCategory } from "@shared/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

const budgetCategorySchema = insertBudgetCategorySchema.extend({});

type BudgetFormValues = z.infer<typeof budgetCategorySchema>;

export default function BudgetPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetCategorySchema),
    defaultValues: {
      name: "",
      estimatedCost: 0,
      actualCost: 0,
      notes: "",
    },
  });
  
  // Fetch budget categories from API
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["/api/budget"],
    queryFn: async () => {
      const response = await fetch("/api/budget");
      if (!response.ok) {
        throw new Error("Failed to fetch budget categories");
      }
      return response.json() as Promise<BudgetCategory[]>;
    },
  });
  
  // Create budget category mutation
  const createCategory = useMutation({
    mutationFn: async (data: BudgetFormValues) => {
      const res = await apiRequest("POST", "/api/budget", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budget"] });
      toast({
        title: "Success",
        description: "Budget category added successfully",
      });
      setIsAddingCategory(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add budget category",
        variant: "destructive",
      });
    },
  });
  
  // Delete budget category mutation
  const deleteCategory = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/budget/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budget"] });
      toast({
        title: "Success",
        description: "Budget category removed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove budget category",
        variant: "destructive",
      });
    },
  });
  
  // Update budget category mutation
  const updateCategory = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<BudgetFormValues> }) => {
      const res = await apiRequest("PATCH", `/api/budget/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budget"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update budget category",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: BudgetFormValues) => {
    // Convert string inputs to numbers
    const formattedData = {
      ...data,
      estimatedCost: Number(data.estimatedCost),
      actualCost: Number(data.actualCost),
    };
    
    createCategory.mutate(formattedData);
  };
  
  const handleDeleteCategory = (id: number) => {
    if (confirm("Are you sure you want to delete this budget category?")) {
      deleteCategory.mutate(id);
    }
  };
  
  const handleUpdateActualCost = (id: number, value: string) => {
    const actualCost = Number(value);
    if (!isNaN(actualCost)) {
      updateCategory.mutate({
        id,
        data: { actualCost },
      });
    }
  };
  
  // Calculate totals
  const totalEstimated = categories.reduce((sum, category) => sum + (category.estimatedCost || 0), 0);
  const totalActual = categories.reduce((sum, category) => sum + (category.actualCost || 0), 0);
  const totalRemaining = totalEstimated - totalActual;
  const budgetProgress = totalEstimated > 0 ? (totalActual / totalEstimated) * 100 : 0;
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading">Wedding Budget</h1>
        <Button 
          onClick={() => setIsAddingCategory(!isAddingCategory)}
          className="bg-primary hover:bg-primary/90"
        >
          {isAddingCategory ? "Cancel" : (
            <>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Category
            </>
          )}
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Budget</p>
              <p className="text-3xl font-bold">{formatCurrency(totalEstimated)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">Spent So Far</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(totalActual)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">Remaining</p>
              <p className={`text-3xl font-bold ${totalRemaining < 0 ? 'text-red-500' : 'text-green-500'}`}>
                {formatCurrency(totalRemaining)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm font-medium text-muted-foreground mb-2">Budget Progress</p>
          <Progress value={budgetProgress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2 text-right">
            {budgetProgress.toFixed(1)}% of budget spent
          </p>
        </CardContent>
      </Card>
      
      {isAddingCategory && (
        <Card>
          <CardHeader>
            <CardTitle>Add Budget Category</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g., Venue, Catering, Photography" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="estimatedCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Cost</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              type="number" 
                              className="pl-9" 
                              placeholder="0.00" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.valueAsNumber)}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="actualCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Actual Cost (if paid)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              type="number" 
                              className="pl-9" 
                              placeholder="0.00" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.valueAsNumber)}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Any details about this expense"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={createCategory.isPending}>
                    {createCategory.isPending ? "Saving..." : "Add Category"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
      
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </CardContent>
          </Card>
        ) : categories.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No budget categories yet. Add your first category.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 font-medium">Category</th>
                      <th className="text-right py-3 font-medium">Estimated</th>
                      <th className="text-right py-3 font-medium">Actual</th>
                      <th className="text-right py-3 font-medium">Remaining</th>
                      <th className="text-right py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => {
                      const estimated = category.estimatedCost || 0;
                      const actual = category.actualCost || 0;
                      const remaining = estimated - actual;
                      const progress = estimated > 0 ? (actual / estimated) * 100 : 0;
                      
                      return (
                        <tr key={category.id} className="border-b last:border-b-0 hover:bg-muted/20">
                          <td className="py-4">
                            <div>
                              <p className="font-medium">{category.name}</p>
                              {category.notes && (
                                <p className="text-sm text-muted-foreground mt-1">{category.notes}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-4 text-right font-medium">
                            {formatCurrency(estimated)}
                          </td>
                          <td className="py-4 text-right">
                            <div className="relative w-[120px] ml-auto">
                              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="number"
                                className="pl-9 text-right"
                                value={actual}
                                onChange={(e) => handleUpdateActualCost(category.id, e.target.value)}
                              />
                            </div>
                          </td>
                          <td className={`py-4 text-right font-medium ${remaining < 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {formatCurrency(remaining)}
                          </td>
                          <td className="py-4 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCategory(category.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t">
                      <td className="py-4 font-bold">Total</td>
                      <td className="py-4 text-right font-bold">{formatCurrency(totalEstimated)}</td>
                      <td className="py-4 text-right font-bold">{formatCurrency(totalActual)}</td>
                      <td className="py-4 text-right font-bold">{formatCurrency(totalRemaining)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}