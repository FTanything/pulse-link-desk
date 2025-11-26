import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import getTasks from "@/lib/getTasks";
import deleteTask from "@/lib/deleteTask";
import { Task } from "interface";

interface TaskListProps {
  activeTaskId?: string | null;
  refreshKey?: number;
}

export const TaskList = ({ activeTaskId, refreshKey }: TaskListProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async() => {
      try {
        const res = await getTasks();
        setTasks(res.data);
      } catch (err) {
        console.log("Error fetching tasks:", err);
      }
    };
    fetchTasks();
  }, [refreshKey]);

  const handleDelete = async(id:string) => {
    try{
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch(err){
      console.log("Error deleting task:", err);
    }
  }

  return (
    <div className="glass-card rounded-3xl p-6 space-y-4">
      <h2 className="text-xl font-semibold text-foreground mb-2">Upcoming Tasks</h2>
      <div className="max-h-80 overflow-y-auto pr-2 space-y-3">
        {tasks.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No tasks yet. Create one below!
          </p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`glass-card rounded-2xl p-4 hover:shadow-xl transition-all duration-300 ${
                activeTaskId === task.id ? "ring-2 ring-primary" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">{task.title}</h3>

                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(task.date), "MMM dd, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{format(new Date(task.date), "HH:mm")}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-muted-foreground bg-muted/30 px-3 py-1 rounded-full whitespace-nowrap">
                    {task.title.length}/40
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(task.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
