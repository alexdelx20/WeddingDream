import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WeddingOverview } from "@/components/wedding/wedding-overview";
import { TasksCard } from "@/components/dashboard/tasks-card";
import { BudgetCard } from "@/components/dashboard/budget-card";
import { GuestListCard } from "@/components/dashboard/guest-list-card";
import { VendorsCard } from "@/components/dashboard/vendors-card";
import { TimelineSection } from "@/components/dashboard/timeline-section";
import { TodoSection } from "@/components/dashboard/todo-section";
import { InspirationSection } from "@/components/dashboard/inspiration-section";

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Wedding Overview */}
      <WeddingOverview />
      
      {/* Main Dashboard Content */}
      <main className="flex-grow py-8 px-4">
        <div className="container mx-auto">
          {/* Dashboard Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <TasksCard />
            <BudgetCard />
            <GuestListCard />
            <VendorsCard />
          </div>
          
          {/* Timeline and Todo Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            <TimelineSection />
            <TodoSection />
          </div>
          
          {/* Inspiration Section */}
          <InspirationSection />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
