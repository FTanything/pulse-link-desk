import { useState, useEffect } from "react";
import { toast } from "sonner";
import { TimeWidget } from "@/components/TimeWidget";
import { SensorCard } from "@/components/SensorCard";
import { TaskList } from "@/components/TaskList";
import { AddTaskForm } from "@/components/AddTaskForm";
import { Thermometer, Sun, Droplet, Cloud } from "lucide-react";
import backgroundImage from "@/assets/background.png";

interface Task {
  id: string;
  name: string;
  date: Date;
  time: string;
}

const Index = () => {
  // Mock sensor data - in production, this would come from API
  const sensorData = {
    temperature: 25,
    lumen: 25,
    moisture: 25,
    pm25: 25,
  };

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      name: "First Task",
      date: new Date(),
      time: "23:00",
    },
  ]);
  
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          toast.success("Notifications enabled for task alerts");
        }
      });
    }
  }, []);

  const handleAddTask = (taskData: { name: string; date: Date; time: string }) => {
    const newTask: Task = {
      id: Date.now().toString(),
      ...taskData,
    };
    setTasks([...tasks, newTask]);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
    toast.success("Task deleted");
  };

  // Check for task alerts and auto-delete
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const currentDate = now.toDateString();

      tasks.forEach(task => {
        const taskDate = task.date.toDateString();
        const taskDateTime = new Date(`${taskDate} ${task.time}`);
        const timeDiff = now.getTime() - taskDateTime.getTime();
        const minutesDiff = Math.floor(timeDiff / 60000);

        // Alert when it's time for the task (within the same minute)
        if (taskDate === currentDate && task.time === currentTime && minutesDiff === 0) {
          setActiveTaskId(task.id);
          
          // Show browser notification
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("⏰ Task Alert", {
              body: task.name,
              icon: "/favicon.ico",
              tag: task.id,
              requireInteraction: true,
            });
          }
          
          // Also show in-app toast
          toast.info(`⏰ Task Alert: ${task.name}`, {
            description: "It's time for your task!",
            duration: 10000,
          });
        }
        
        // Clear highlight if task time has passed but not yet 5 minutes
        if (minutesDiff > 0 && minutesDiff < 5 && activeTaskId === task.id) {
          setActiveTaskId(null);
        }

        // Auto-delete if 5+ minutes past
        if (minutesDiff >= 5) {
          setTasks(prev => prev.filter(t => t.id !== task.id));
          toast("Task auto-deleted (5 minutes past)", {
            description: task.name,
          });
        }
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [tasks]);

  return (
    <div 
      className="min-h-screen w-full bg-cover bg-center bg-fixed p-4 md:p-8"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Time Widget - Full Width */}
        <TimeWidget />

        {/* Two Column Layout for Tablet and Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Sensors */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <SensorCard
                icon={Thermometer}
                value={sensorData.temperature}
                unit="°C"
                label="Temperature"
              />
              <SensorCard
                icon={Sun}
                value={sensorData.lumen}
                unit="lumen"
                label="Light"
              />
              <SensorCard
                icon={Droplet}
                value={sensorData.moisture}
                unit="%"
                label="Moisture"
              />
              <SensorCard
                icon={Cloud}
                value={sensorData.pm25}
                unit="mg"
                label="PM 2.5"
              />
            </div>
            
            {/* Add Task Form - Show on mobile in left column */}
            <div className="lg:hidden">
              <AddTaskForm onAddTask={handleAddTask} />
            </div>
          </div>

          {/* Right Column - Tasks */}
          <div className="space-y-6">
            <TaskList tasks={tasks} onDeleteTask={handleDeleteTask} activeTaskId={activeTaskId} />
            
            {/* Add Task Form - Show on desktop in right column */}
            <div className="hidden lg:block">
              <AddTaskForm onAddTask={handleAddTask} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
