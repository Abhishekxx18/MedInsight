import { Link } from "@tanstack/react-router";
import type { Predictions } from "./Profile";
import { emojis } from "@/data/emojis";

export default function PredictionHistory({
  history,
}: {
  history: Predictions[];
}) {
  if (!history || history.length === 0) {
    return <div className="text-gray-500">No prediction history found.</div>;
  }

  return (
    <ul className="space-y-4">
      {history.map((item, idx) => (
        <Link
          key={idx}
          to="/disease-form/$disease"
          params={{ disease: item.disease }}
          search={{ session_id: item.session_id }}
          className="hover:bg-green-200 bg-green-100 rounded-lg p-4 flex w-full items-center justify-between"
        >
          <div>
            <div className="font-semibold text-emerald-700">
              {emojis[item.disease]} {item.disease}
            </div>
            <div className="text-xs text-gray-700 mb-2">
              {new Date(item.updated_at).toLocaleString()}
            </div>
          </div>
          <div
            className={`text-sm font-bold ${
              item.prediction?.toLowerCase() === "negative"
                ? "text-green-600"
                : "text-red-500"
            }`}
          >
            {item.prediction || "(No details)"}
          </div>
        </Link>
      ))}
    </ul>
  );
}
