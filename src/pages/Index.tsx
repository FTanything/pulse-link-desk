import { useState, useEffect } from "react";
import { toast } from "sonner";
import { TimeWidget } from "@/components/TimeWidget";
import { SensorCard } from "@/components/SensorCard";
import { TaskList } from "@/components/TaskList";
import { AddTaskForm } from "@/components/AddTaskForm";
import { Thermometer, Sun, Droplet, Cloud } from "lucide-react";
import backgroundImage from "@/assets/background.png";
const SHADOW_DATA_URL = import.meta.env.VITE_SHADOW_DATA_URL;
const SHADOW_AUTHORIZATION = import.meta.env.VITE_SHADOW_AUTHORIZATION;
const SENSOR_REFRESH_INTERVAL_MS = 10_000;

interface Task {
  id: string;
  name: string;
  date: Date;
  time: string;
}

interface SensorData {
  temperature: number;
  lumen: number;
  humidity: number;
  pm25: number;
}

interface ShadowResponse {
  data?: {
    temperature?: unknown;
    humidity?: unknown;
    lumen?: unknown;
    light?: unknown;
    "pm2.5"?: unknown;
    pm25?: unknown;
  };
}

const Index = () => {
  const [sensorData, setSensorData] = useState<SensorData>({
    temperature: 0,
    lumen: 0,
    humidity: 0,
    pm25: 0,
  });

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      name: "First Task",
      date: new Date(),
      time: "23:00",
    },
  ]);

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const toNumber = (value: unknown): number => {
      if (typeof value === "number") {
        return value;
      }

      if (typeof value === "string") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
      }

      return 0;
    };

    const fetchSensorReadings = async () => {
      try {
        const response = await fetch(SHADOW_DATA_URL, {
          headers: {
            Authorization: SHADOW_AUTHORIZATION,
          },
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload: ShadowResponse = await response.json();
        const readings = (payload?.data ?? {}) as NonNullable<
          ShadowResponse["data"]
        >;

        if (!isMounted) {
          return;
        }

        setSensorData({
          temperature: toNumber(readings.temperature),
          lumen: toNumber(readings.lumen ?? readings.light),
          humidity: toNumber(readings.humidity),
          pm25: toNumber(readings["pm2.5"] ?? readings.pm25),
        });
      } catch (error) {
        if (isMounted) {
          console.error("Failed to fetch sensor data", error);
          toast.error("Unable to refresh sensor readings");
        }
      }
    };

    fetchSensorReadings();
    const intervalId = window.setInterval(
      fetchSensorReadings,
      SENSOR_REFRESH_INTERVAL_MS
    );

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          toast.success("Notifications enabled for task alerts");
        }
      });
    }
  }, []);

  const handleAddTask = (taskData: {
    name: string;
    date: Date;
    time: string;
  }) => {
    const newTask: Task = {
      id: Date.now().toString(),
      ...taskData,
    };
    setTasks([...tasks, newTask]);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
    toast.success("Task deleted");
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;
      const currentDate = now.toDateString();

      tasks.forEach((task) => {
        const taskDate = task.date.toDateString();
        const taskDateTime = new Date(`${taskDate} ${task.time}`);
        const timeDiff = now.getTime() - taskDateTime.getTime();
        const minutesDiff = Math.floor(timeDiff / 60000);

        if (
          taskDate === currentDate &&
          task.time === currentTime &&
          minutesDiff === 0
        ) {
          setActiveTaskId(task.id);

          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification("⏰ Task Alert", {
              body: task.name,
              icon: "/newicon.png",
              tag: task.id,
              requireInteraction: true,
            });
          }

          toast.info(`⏰ Task Alert: ${task.name}`, {
            description: "It's time for your task!",
            duration: 10000,
          });
        }

        if (minutesDiff > 0 && minutesDiff < 5 && activeTaskId === task.id) {
          setActiveTaskId(null);
        }

        if (minutesDiff >= 5) {
          setTasks((prev) => prev.filter((t) => t.id !== task.id));
          toast("Task auto-deleted (5 minutes past)", {
            description: task.name,
          });
        }
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [tasks, activeTaskId]);

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-fixed p-4 md:p-8"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <TimeWidget />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                value={sensorData.humidity}
                unit="%"
                label="humidity"
              />
              <SensorCard
                icon={Cloud}
                value={sensorData.pm25}
                unit="mg"
                label="PM 2.5"
              />
            </div>

            <div className="lg:hidden">
              <AddTaskForm onAddTask={handleAddTask} />
            </div>
          </div>

          <div className="space-y-6">
            <TaskList
              tasks={tasks}
              onDeleteTask={handleDeleteTask}
              activeTaskId={activeTaskId}
            />

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
