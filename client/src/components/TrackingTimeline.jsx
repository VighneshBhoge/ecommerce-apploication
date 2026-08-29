import { formatPrice } from "../utils/format.js";

const STEPS = ["PENDING", "PAID", "SHIPPED", "DELIVERED"];

export default function TrackingTimeline({ status }) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-full px-4 py-2">
        <span className="w-2 h-2 rounded-full bg-red-600" /> Order cancelled
      </div>
    );
  }

  const idx = STEPS.indexOf(status);

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2">
      {STEPS.map((step, i) => {
        const done = i <= idx;
        const active = i === idx;
        return (
          <div key={step} className="flex items-center gap-2 shrink-0">
            <div
              className={`w-8 h-8 rounded-full grid place-items-center text-xs font-bold border ${
                done ? "bg-accent border-ink text-ink" : "bg-paper border-line text-muted"
              } ${active ? "ring-2 ring-ink ring-offset-2" : ""}`}
            >
              {done ? "✓" : i + 1}
            </div>
            <span className={`text-xs font-medium ${done ? "text-ink" : "text-muted"}`}>{step}</span>
            {i < STEPS.length - 1 && <span className={`w-6 h-0.5 ${i < idx ? "bg-accent" : "bg-line"}`} />}
          </div>
        );
      })}
    </div>
  );
}
