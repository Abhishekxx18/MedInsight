import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import PredictionHistory from "@/components/PredictionHistory";
import api from "@/lib/api";
import type { diseaseInputs } from "@/data/diseaseInputs";
import { useNotification } from "@/context/Notification";

export interface Predictions {
  session_id: string;
  disease: keyof typeof diseaseInputs;
  updated_at: string;
  prediction: string;
}

export default function Profile() {
  const { user, logout } = useAuth();
  const { showNotification } = useNotification();

  const [history, setHistory] = useState<Predictions[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/api/prediction_history`);
        setHistory(response.data.history || []);
      } catch (e) {
        console.error(e);
        showNotification("Error fetching history", "error");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchHistory();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto mt-16 p-8 bg-white rounded-2xl shadow text-center">
        <h2 className="text-2xl font-bold mb-4">
          Please log in to view your profile.
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-white rounded-2xl shadow">
      <div className="flex items-center mb-8">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt="avatar"
            className="w-16 h-16 rounded-full mr-6 bg-emerald-100"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-3xl font-bold text-emerald-600 mr-6">
            {user.name?.[0]}
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
          <button
            onClick={logout}
            className="mt-2 text-emerald-600 hover:underline"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Prediction History</h3>
        {loading ? (
          <div className="text-gray-500">Loading History...</div>
        ) : (
          <div
            className="max-h-[500px] overflow-y-auto"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "gray transparent",
              scrollbarGutter: "stable",
              scrollBehavior: "smooth",
            }}
          >
            <PredictionHistory history={history} />
          </div>
        )}
      </div>
    </div>
  );
}
