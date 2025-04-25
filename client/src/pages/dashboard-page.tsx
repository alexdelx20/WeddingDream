import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { calculateDaysRemaining, formatDate } from "@/lib/dateUtils";
import { 
  Calendar, 
  Check, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Heart, 
  ListChecks, 
  Mail, 
  MapPin, 
  Users
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { WeddingSettings, Task, Guest, BudgetCategory } from "@shared/schema";
import { Link } from "wouter";

export default function DashboardPage() {
  // Fetch wedding settings
  const { data: weddingSettings } = useQuery<WeddingSettings>({
    queryKey: ['/api/wedding-settings'],
  });
  
  // Fetch tasks
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });
  
  // Fetch guests
  const { data: guests = [] } = useQuery<Guest[]>({
    queryKey: ['/api/guests'],
  });
  
  // Fetch budget
  const { data: budgetCategories = [] } = useQuery<BudgetCategory[]>({
    queryKey: ['/api/budget'],
  });
  
  // Calculate days remaining
  const daysRemaining = weddingSettings?.weddingDate 
    ? calculateDaysRemaining(weddingSettings.weddingDate) 
    : 0;
  
  // Calculate task completion progress
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  // Calculate rsvp progress
  const confirmedGuests = guests.filter(guest => guest.rsvpStatus === "confirmed").length;
  const pendingGuests = guests.filter(guest => guest.rsvpStatus === "pending").length;
  const declinedGuests = guests.filter(guest => guest.rsvpStatus === "declined").length;
  const totalGuests = guests.length;
  const rsvpProgress = totalGuests > 0 ? (confirmedGuests + declinedGuests) / totalGuests * 100 : 0;
  
  // Calculate budget progress
  const totalBudget = budgetCategories.reduce((sum, category) => sum + (category.estimatedCost || 0), 0);
  const spentBudget = budgetCategories.reduce((sum, category) => sum + (category.actualCost || 0), 0);
  const budgetProgress = totalBudget > 0 ? (spentBudget / totalBudget) * 100 : 0;
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };
  
  // Recent tasks (5 most recent incomplete tasks)
  const recentTasks = [...tasks]
    .filter(task => !task.completed)
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 5);
  
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="relative overflow-hidden bg-gradient-to-r from-primary/20 to-primary/10 border-none shadow-md">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left mb-6 md:mb-0">
              <h1 className="text-4xl font-heading font-bold mb-2">
                {weddingSettings ? (
                  <>
                    {weddingSettings.partner1Name} & {weddingSettings.partner2Name}
                  </>
                ) : "Your Wedding Day"}
              </h1>
              
              {weddingSettings?.weddingDate ? (
                <div className="flex flex-col space-y-2">
                  <p className="text-2xl font-heading text-muted-foreground">
                    {formatDate(weddingSettings.weddingDate)}
                  </p>
                  {weddingSettings.venueName && (
                    <div className="flex items-center justify-center md:justify-start text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{weddingSettings.venueName}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Set your wedding date in Wedding Settings
                </p>
              )}
            </div>
            
            {weddingSettings?.weddingDate && (
              <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-8 py-6 text-center">
                <h2 className="text-5xl font-bold text-primary mb-2">{daysRemaining}</h2>
                <p className="font-medium text-muted-foreground">Days Remaining</p>
              </div>
            )}
          </div>
        </CardContent>
        
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <Heart className="h-32 w-32 text-primary" />
        </div>
      </Card>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard 
          icon={<ListChecks className="h-5 w-5 text-primary" />}
          title="Task Progress"
          value={`${completedTasks}/${totalTasks} Tasks`}
          progress={taskProgress}
          link="/tasks"
          linkText="View Tasks"
        />
        
        <StatsCard 
          icon={<Users className="h-5 w-5 text-primary" />}
          title="RSVP Progress" 
          value={`${confirmedGuests} Confirmed, ${pendingGuests} Pending`}
          progress={rsvpProgress}
          link="/guests"
          linkText="Manage Guest List"
        />
        
        <StatsCard 
          icon={<DollarSign className="h-5 w-5 text-primary" />}
          title="Budget" 
          value={`${formatCurrency(spentBudget)} of ${formatCurrency(totalBudget)}`}
          progress={budgetProgress}
          link="/budget"
          linkText="Manage Budget"
        />
      </div>
      
      {/* Next Tasks */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-heading font-semibold">Upcoming Tasks</h2>
            <Link href="/tasks">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          
          <div className="space-y-3">
            {recentTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 mx-auto text-primary opacity-50 mb-2" />
                <p className="text-muted-foreground">All tasks are completed!</p>
                <Link href="/tasks">
                  <Button variant="link">Add more tasks</Button>
                </Link>
              </div>
            ) : (
              recentTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-start p-3 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="mr-3 mt-0.5">
                    {task.completed ? (
                      <Check className="h-5 w-5 text-primary" />
                    ) : (
                      <div className={`h-5 w-5 rounded-full border-2 ${
                        task.priority === 'high' ? 'border-red-500' :
                        task.priority === 'medium' ? 'border-orange-500' : 'border-green-500'
                      }`} />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <p className="font-medium">{task.title}</p>
                      {task.dueDate && (
                        <div className="flex items-center text-xs text-muted-foreground ml-2">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{formatDate(task.dueDate, 'MMM d')}</span>
                        </div>
                      )}
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <QuickLink 
          icon={<Calendar className="h-6 w-6" />} 
          title="Timeline"
          description="Manage your wedding day schedule"
          href="/tasks"
        />
        <QuickLink 
          icon={<Users className="h-6 w-6" />} 
          title="Guest List"
          description="Track RSVPs and manage guests"
          href="/guests"
        />
        <QuickLink 
          icon={<DollarSign className="h-6 w-6" />} 
          title="Budget"
          description="Track expenses and budget"
          href="/budget"
        />
        <QuickLink 
          icon={<Mail className="h-6 w-6" />} 
          title="Help Center"
          description="Get support and tips"
          href="/help-center"
        />
      </div>
    </div>
  );
}

interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  progress: number;
  link: string;
  linkText: string;
}

function StatsCard({ icon, title, value, progress, link, linkText }: StatsCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center mb-2">
          <div className="p-2 rounded-md bg-primary/10 mr-3">
            {icon}
          </div>
          <h3 className="font-medium">{title}</h3>
        </div>
        
        <p className="text-2xl font-bold mb-2">{value}</p>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
        
        <div className="mt-4 text-right">
          <Link href={link}>
            <Button variant="link" className="h-auto p-0 text-primary">{linkText}</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

interface QuickLinkProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}

function QuickLink({ icon, title, description, href }: QuickLinkProps) {
  return (
    <Link href={href}>
      <Card className="overflow-hidden hover:shadow-md transition-all cursor-pointer h-full">
        <CardContent className="p-6 flex flex-col items-center text-center">
          <div className="p-3 rounded-full bg-primary/10 mb-3">
            <div className="text-primary">{icon}</div>
          </div>
          <h3 className="font-medium mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}