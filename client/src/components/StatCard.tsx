import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  color?: "teal" | "blue" | "rose" | "indigo";
}

export function StatCard({ title, value, description, icon: Icon, color = "teal" }: StatCardProps) {
  const colorStyles = {
    teal: "bg-teal-50 text-teal-700 border-teal-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
  };

  const iconStyles = {
    teal: "bg-teal-100 text-teal-600",
    blue: "bg-blue-100 text-blue-600",
    rose: "bg-rose-100 text-rose-600",
    indigo: "bg-indigo-100 text-indigo-600",
  };

  return (
    <Card className={cn("border shadow-sm hover:shadow-md transition-shadow", colorStyles[color])}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-80 mb-1">{title}</p>
            <h3 className="text-2xl font-bold font-serif">{value}</h3>
            {description && (
              <p className="text-xs mt-1 opacity-70">{description}</p>
            )}
          </div>
          <div className={cn("p-3 rounded-xl", iconStyles[color])}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
