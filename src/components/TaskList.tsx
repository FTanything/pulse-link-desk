import { format } from "date-fns";
import { Calendar, Clock } from "lucide-react";

interface Task {
  id: string;
  name: string;
  date: Date;
  time: string;
}

interface TaskListProps {
  tasks: Task[];
}

export const TaskList = ({ tasks }: TaskListProps) => {
  return (
    <div className="glass-card rounded-3xl p-6 space-y-4">
      <h2 className="text-xl font-semibold text-foreground mb-4">Upcoming Tasks</h2>
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No tasks yet. Create one below!</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="glass-card rounded-2xl p-4 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">{task.name}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{format(task.date, "MMM dd, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{task.time}</span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground bg-muted/30 px-3 py-1 rounded-full whitespace-nowrap">
                  {task.name.length}/40
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
