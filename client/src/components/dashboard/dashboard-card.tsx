import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function DashboardCard({ title, children, className, action }: DashboardCardProps) {
  return (
    <Card className={cn("dashboard-card overflow-hidden", className)}>
      <CardHeader className="px-6 py-5 border-b border-gray-100 flex flex-row items-center justify-between">
        <CardTitle className="font-heading text-xl">{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent className="px-6 py-4">
        {children}
      </CardContent>
    </Card>
  );
}
