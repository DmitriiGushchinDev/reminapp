import { formatTime12h } from "@/lib/utils";

export function Timeline() {
  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM
  const currentHour = new Date().getHours();

  return (
    <div className="py-6">
      {hours.map((hour) => {
        const isCurrentHour = hour === currentHour;
        const timeString = formatTime12h(`${hour.toString().padStart(2, '0')}:00`);
        
        return (
          <div
            key={hour}
            className={`
              flex items-center justify-end pr-4 h-16 text-sm border-b border-timeline-border
              ${isCurrentHour ? 'text-timeline-current font-medium' : 'text-muted-foreground'}
            `}
          >
            <time className="select-none">
              {timeString}
            </time>
          </div>
        );
      })}
    </div>
  );
}