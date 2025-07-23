import {
  Activity,
  Wind as Lungs,
  Heart,
  Droplet,
  Stethoscope,
  Bell as Cells,
} from "lucide-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/disease-selection")({
  component: RouteComponent,
});

const diseases = [
  {
    id: "liver",
    name: "Liver Disease",
    icon: Droplet,
    color: "from-amber-500 to-orange-600",
  },
  {
    id: "lung",
    name: "Lung Disease",
    icon: Lungs,
    color: "from-blue-500 to-cyan-600",
  },
  {
    id: "diabetes",
    name: "Diabetes",
    icon: Activity,
    color: "from-purple-500 to-pink-600",
  },
  {
    id: "parkinsons",
    name: "Parkinsons",
    icon: Cells,
    color: "from-red-500 to-rose-600",
  },
  {
    id: "heart",
    name: "Heart Disease",
    icon: Heart,
    color: "from-emerald-500 to-green-600",
  },
];

function RouteComponent() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 pt-12 md:pt-4">
      <div className="max-w-7xl w-full">
        <div className="text-center my-12 md:mt-0">
          <Stethoscope className="h-16 w-16 text-emerald-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4">
            Select Disease Category
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Choose a disease category for AI-powered prediction and personalized
            health recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
          {diseases.map(({ id, name, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => navigate({ to: `/disease-form/${id}` })}
              className="group relative bg-gray-800 rounded-2xl p-6
                       transition-all duration-300 hover:scale-105
                       border border-gray-700 hover:border-emerald-500/50"
            >
              <div
                className={`
                absolute inset-0 bg-gradient-to-br ${color}
                opacity-0 group-hover:opacity-10 transition-opacity duration-300
                rounded-2xl
              `}
              ></div>

              <div
                className={`
                w-16 h-16 mx-auto rounded-xl bg-gradient-to-br ${color}
                flex items-center justify-center mb-4
                transition-transform duration-300 group-hover:scale-110
              `}
              >
                <Icon className="h-8 w-8 text-white" />
              </div>

              <h3 className="text-lg font-semibold text-white text-center">
                {name}
              </h3>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
