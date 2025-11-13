import { useEffect, useState } from "react";
import { format } from "date-fns";

export const TimeWidget = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="glass-card rounded-[2rem] p-6 md:p-8 gradient-pink-blue">
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
        <div className="text-white">
          <div className="text-5xl md:text-6xl font-bold tracking-tight">
            {format(currentTime, "HH:mm")}
          </div>
        </div>
        <div className="hidden md:block w-[2px] h-16 bg-white/30" />
        <div className="text-white text-center md:text-left">
          <div className="text-2xl md:text-3xl font-semibold">
            {format(currentTime, "EEEE")}
          </div>
          <div className="text-lg md:text-xl opacity-90">
            {format(currentTime, "MMM dd, yyyy")}
          </div>
        </div>
      </div>
    </div>
  );
};
