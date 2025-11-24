import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { toast } from "sonner";

interface AddTaskFormProps {
  onAddTask: (task: { name: string; date: Date; time: string }) => void;
}

export const AddTaskForm = ({ onAddTask }: AddTaskFormProps) => {
  const [taskName, setTaskName] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskName.trim()) {
      toast.error("Please enter a task name");
      return;
    }

    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    if (!selectedTime) {
      toast.error("Please select a time");
      return;
    }

    onAddTask({
      name: taskName,
      date: selectedDate,
      time: selectedTime,
    });

    setTaskName("");
    setSelectedDate(undefined);
    setSelectedTime("");

    toast.success("Task created successfully!");
  };

  const handleClear = () => {
    setTaskName("");
    setSelectedDate(undefined);
    setSelectedTime("");
  };

  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <CalendarIcon className="w-6 h-6 text-accent" />
        <h2 className="text-xl font-semibold text-foreground">Add New Task</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            placeholder="Task Name"
            value={taskName}
            onChange={(e) => {
              if (e.target.value.length <= 40) {
                setTaskName(e.target.value);
              }
            }}
            maxLength={40}
            className="glass-card border-glass-border/30 text-foreground placeholder:text-muted-foreground"
          />
          <div className="text-xs text-muted-foreground mt-1 text-right">
            {taskName.length}/40 characters
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="glass-card border-glass-border/30 justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate
                  ? format(selectedDate, "dd/MM/yyyy")
                  : "Select Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 glass-card" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Input
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="glass-card border-glass-border/30"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            className="flex-1 glass-card border-2 border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            Clear
          </Button>
          <Button
            type="submit"
            className="flex-1 gradient-pink-blue text-white hover:opacity-90 transition-opacity"
          >
            Create
          </Button>
        </div>
      </form>
    </div>
  );
};
