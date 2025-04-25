import { useQuery } from "@tanstack/react-query";
import { BudgetItem, WeddingSettings } from "@shared/schema";
import { Link } from "wouter";

export function BudgetOverview() {
  const { data: settings } = useQuery<WeddingSettings>({
    queryKey: ["/api/wedding-settings"],
  });

  const { data: budgetItems = [] } = useQuery<BudgetItem[]>({
    queryKey: ["/api/budget"],
  });

  // Calculate budget totals
  const totalBudget = settings?.budget ? parseFloat(settings.budget.toString()) : 0;
  const totalSpent = budgetItems.reduce((sum, item) => {
    return sum + (item.actualCost ? parseFloat(item.actualCost.toString()) : 0);
  }, 0);
  const remaining = totalBudget - totalSpent;
  const percentSpent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Group budget items by category for display
  const categoriesMap = budgetItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = 0;
    }
    acc[item.category] += item.actualCost ? parseFloat(item.actualCost.toString()) : 0;
    return acc;
  }, {} as Record<string, number>);

  // Convert to array for display
  const categories = Object.entries(categoriesMap)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  return (
    <div>
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="text-muted-foreground font-body">Total Budget</div>
          <div className="font-body font-medium">${totalBudget.toLocaleString()}</div>
        </div>
        <div className="flex justify-between items-center mb-1">
          <div className="text-muted-foreground font-body">Spent So Far</div>
          <div className="font-body text-destructive">${totalSpent.toLocaleString()}</div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-muted-foreground font-body">Remaining</div>
          <div className="font-body text-success">${remaining.toLocaleString()}</div>
        </div>
      </div>
      
      <div className="progress-bar mb-4">
        <div className="progress-bar-fill" style={{ width: `${percentSpent}%` }}></div>
      </div>
      
      <div className="space-y-2 mb-4">
        {categories.map((category) => (
          <div key={category.name} className="flex justify-between items-center py-1">
            <div className="font-body text-sm">{category.name}</div>
            <div className="font-body text-sm">${category.amount.toLocaleString()}</div>
          </div>
        ))}
        
        {categories.length === 0 && (
          <div className="text-center py-2 text-muted-foreground text-sm">
            No budget items yet
          </div>
        )}
      </div>
      
      <Link href="/budget">
        <a className="block text-center text-primary-dark hover:text-primary transition duration-200 font-body">
          Manage budget
        </a>
      </Link>
    </div>
  );
}
