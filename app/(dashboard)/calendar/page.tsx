import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const EVENT_COLORS: Record<string, string> = {
  launch: "bg-indigo-100 text-indigo-700 border-indigo-200",
  email: "bg-violet-100 text-violet-700 border-violet-200",
  paid: "bg-amber-100 text-amber-700 border-amber-200",
  content: "bg-emerald-100 text-emerald-700 border-emerald-200",
  event: "bg-blue-100 text-blue-700 border-blue-200",
};

const mockEvents = [
  { id: "1", title: "Q3 Product Launch", type: "launch", start: 1, end: 3, week: 3 },
  { id: "2", title: "Welcome Email Series", type: "email", start: 2, end: 2, week: 3 },
  { id: "3", title: "Meta Campaign Live", type: "paid", start: 3, end: 5, week: 3 },
  { id: "4", title: "Blog: 10 Best Practices", type: "content", start: 1, end: 1, week: 4 },
  { id: "5", title: "Google Ads A/B Test", type: "paid", start: 4, end: 6, week: 4 },
  { id: "6", title: "Partner Webinar", type: "event", start: 2, end: 2, week: 5 },
  { id: "7", title: "Nurture Email #2", type: "email", start: 5, end: 5, week: 4 },
  { id: "8", title: "Case Study Publish", type: "content", start: 3, end: 3, week: 5 },
];

// Build a 5-week July 2026 grid (Jul 1 = Wednesday = col 3)
const JULY_START_COL = 3; // Wednesday
const WEEKS = 5;

function buildCalendar() {
  const weeks: { day: number | null; col: number }[][] = [];
  let day = 1;
  for (let w = 0; w < WEEKS; w++) {
    const week: { day: number | null; col: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const globalCol = w * 7 + d;
      const firstDayCol = JULY_START_COL;
      if (globalCol < firstDayCol || day > 31) {
        week.push({ day: null, col: d });
      } else {
        week.push({ day: day++, col: d });
      }
    }
    weeks.push(week);
  }
  return weeks;
}

export default function CalendarPage() {
  const weeks = buildCalendar();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Marketing Calendar</h1>
          <p className="text-sm text-slate-500 mt-1">
            Campaign schedule and launch timeline
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg">
            <button className="p-2 hover:bg-slate-50 rounded-l-lg transition-colors">
              <ChevronLeft className="w-4 h-4 text-slate-500" />
            </button>
            <span className="px-3 text-sm font-medium text-slate-700">
              July 2026
            </span>
            <button className="p-2 hover:bg-slate-50 rounded-r-lg transition-colors">
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>
          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        {Object.entries(EVENT_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className={cn("w-2.5 h-2.5 rounded-sm border", color)} />
            <span className="text-xs text-slate-500 capitalize">{type}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-slate-100">
          {DAYS.map((d) => (
            <div
              key={d}
              className="py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, wi) => (
          <div
            key={wi}
            className="grid grid-cols-7 border-b border-slate-50 last:border-0"
          >
            {week.map(({ day, col }) => {
              const eventsThisCell = mockEvents.filter(
                (e) => e.week === wi + 1 && e.start === col
              );
              const isToday = day === 22;

              return (
                <div
                  key={col}
                  className={cn(
                    "min-h-24 p-2 border-r border-slate-50 last:border-0",
                    !day && "bg-slate-50/50"
                  )}
                >
                  {day && (
                    <>
                      <span
                        className={cn(
                          "inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full mb-1",
                          isToday
                            ? "bg-indigo-600 text-white"
                            : "text-slate-400"
                        )}
                      >
                        {day}
                      </span>
                      <div className="space-y-0.5">
                        {eventsThisCell.map((ev) => (
                          <div
                            key={ev.id}
                            className={cn(
                              "text-xs px-1.5 py-0.5 rounded border font-medium truncate cursor-pointer hover:opacity-80 transition-opacity",
                              EVENT_COLORS[ev.type] ??
                                "bg-slate-100 text-slate-600 border-slate-200"
                            )}
                            style={{
                              gridColumn: `span ${Math.max(1, ev.end - ev.start + 1)}`,
                            }}
                          >
                            {ev.title}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
