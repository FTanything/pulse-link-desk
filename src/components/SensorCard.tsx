import { LucideIcon } from "lucide-react";

interface SensorCardProps {
  icon: LucideIcon;
  value: number;
  unit: string;
  label: string;
}

export const SensorCard = ({ icon: Icon, value, unit, label }: SensorCardProps) => {
  return (
    <div className="glass-card rounded-3xl p-6 flex flex-col items-center justify-center gap-4 hover:scale-105 transition-transform duration-300">
      <div className="w-16 h-16 rounded-full gradient-icon flex items-center justify-center">
        <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-foreground">
          {value} <span className="text-xl">{unit}</span>
        </div>
        <div className="text-sm text-muted-foreground mt-1">{label}</div>
      </div>
    </div>
  );
};
