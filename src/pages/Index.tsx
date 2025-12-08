import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { format, parseISO, isValid, parse } from "date-fns";
import { TimeWidget } from "@/components/TimeWidget";
import { SensorCard } from "@/components/SensorCard";
import { TaskList } from "@/components/TaskList";
import { AddTaskForm } from "@/components/AddTaskForm";
import { Thermometer, Sun, Droplet, Cloud } from "lucide-react";
import backgroundImage from "@/assets/background.png";
import getTasks from "@/lib/getTasks";
import { Task as TaskRecord } from "interface";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
const SHADOW_DATA_URL = import.meta.env.VITE_SHADOW_DATA_URL;
const SHADOW_AUTHORIZATION = import.meta.env.VITE_SHADOW_AUTHORIZATION;
const SENSOR_REFRESH_INTERVAL_MS = 10_000;

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

  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [dueTask, setDueTask] = useState<TaskRecord | null>(null);
  const notifiedTasksRef = useRef<Map<string, string>>(new Map());

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

  const refreshTasksFromApi = useCallback(async () => {
    try {
      const response = await getTasks();
      setTasks(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    }
  }, []);

  useEffect(() => {
    refreshTasksFromApi();
  }, [refreshTasksFromApi, refreshKey]);

  useEffect(() => {
    const intervalId = window.setInterval(refreshTasksFromApi, 60000);

    return () => window.clearInterval(intervalId);
  }, [refreshTasksFromApi]);

  const getDueKey = useCallback((dateString: string | undefined) => {
    if (!dateString) {
      return null;
    }
    const raw = dateString.trim();

    const parseCandidates = [
      () => parseISO(raw),
      () => parse(raw, "yyyy-MM-dd HH:mm:ss", new Date()),
      () => parse(raw, "yyyy-MM-dd HH:mm", new Date()),
      () => new Date(raw.replace(" ", "T")),
      () => new Date(raw),
    ];

    let parsedDate: Date | undefined;

    for (const attempt of parseCandidates) {
      const result = attempt();
      if (isValid(result)) {
        parsedDate = result;
        break;
      }
    }

    if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    return {
      date: parsedDate,
      key: format(parsedDate, "yyyy-MM-dd HH:mm"),
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (!tasks.length) {
        return;
      }

      const now = new Date();
      const nowKey = format(now, "yyyy-MM-dd HH:mm");

      tasks.forEach((task) => {
        const parsed = getDueKey(task.date);

        if (!parsed) {
          return;
        }

        const { date: dueDate, key: dueKey } = parsed;
        const diffMs = now.getTime() - dueDate.getTime();
        const minutesDiff = Math.floor(diffMs / 60000);
        const lastNotifiedKey = notifiedTasksRef.current.get(task.id);

        if (dueDate.getTime() > now.getTime() && lastNotifiedKey && lastNotifiedKey !== dueKey) {
          notifiedTasksRef.current.delete(task.id);
        }

        if (dueKey === nowKey && lastNotifiedKey !== dueKey) {
          notifiedTasksRef.current.set(task.id, dueKey);
          setActiveTaskId(task.id);
          setDueTask((current) => (current?.id === task.id ? current : task));

          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification("⏰ Task Alert", {
              body: task.title,
              icon: "/newicon.png",
              tag: task.id,
              requireInteraction: true,
            });
          }

          toast.info(`⏰ Task Alert: ${task.title}`, {
            description: "It's time for your task!",
            duration: 10000,
          });
        }

        if (minutesDiff > 0 && minutesDiff < 5) {
          setActiveTaskId((current) => (current === task.id ? null : current));
          setDueTask((current) => (current?.id === task.id ? null : current));
        }

        if (minutesDiff >= 5) {
          notifiedTasksRef.current.delete(task.id);
          setActiveTaskId((current) => (current === task.id ? null : current));
          setDueTask((current) => (current?.id === task.id ? null : current));
        }
      });
    }, 30000);

    return () => window.clearInterval(interval);
  }, [tasks, getDueKey]);

  useEffect(() => {
    const knownIds = new Set(tasks.map((task) => task.id));
    notifiedTasksRef.current.forEach((_, taskId) => {
      if (!knownIds.has(taskId)) {
        notifiedTasksRef.current.delete(taskId);
      }
    });
    setDueTask((current) =>
      current && !knownIds.has(current.id) ? null : current,
    );
  }, [tasks]);

  const refreshTasks = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleDismissReminder = useCallback(() => {
    setDueTask(null);
  }, []);

  const dueTaskSchedule = dueTask ? getDueKey(dueTask.date) : null;

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
              <AddTaskForm onRefresh={refreshTasks}/>
            </div>
          </div>

          <div className="space-y-6">
            <TaskList
              activeTaskId={activeTaskId}
              refreshKey={refreshKey}
              tasks={tasks}
              onTaskDeleted={refreshTasks}
            />

            <div className="hidden lg:block">
              <AddTaskForm onRefresh={refreshTasks}/>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={Boolean(dueTask)}
        onOpenChange={(open) => {
          if (!open) {
            handleDismissReminder();
          }
        }}
      >
        <DialogContent className="border-primary/40">
          <DialogHeader>
            <DialogTitle>Task Reminder</DialogTitle>
            <DialogDescription>
              {dueTask ? `It's time for "${dueTask.title}"` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              {dueTask
                ? `Scheduled for ${dueTaskSchedule
                    ? format(dueTaskSchedule.date, "dd MMM yyyy HH:mm")
                    : dueTask.date}`
                : ""}
            </p>
          </div>
          <DialogFooter>
            <Button onClick={handleDismissReminder} className="w-full sm:w-auto">
              Dismiss
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
