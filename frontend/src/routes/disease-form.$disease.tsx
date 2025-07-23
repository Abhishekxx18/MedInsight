import { useEffect, useRef, useState } from "react";
import { Loader2, MessageCircle, X } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import api from "@/lib/api";
import { diseaseInputs, type DiseaseInputs } from "@/data/diseaseInputs";
import { AxiosError } from "axios";
import generateUUID from "@/utils/uuid";
import { emojis } from "@/data/emojis";
import { useNotification } from "@/context/Notification";

export const Route = createFileRoute("/disease-form/$disease")({
  component: RouteComponent,
  beforeLoad: async ({ params, search }) => {
    const { disease } = params;
    const { session_id } = search as { session_id: string };
    if (session_id) {
      const {
        data: { history },
      } = await api.get(
        `/api/session_history?session_id=${session_id}&disease=${disease}`
      );
      return {
        history,
      };
    }
  },
});

interface FormData {
  [key: string]: string;
}

type UserChat = {
  user: Boolean;
  message: string;
  loading?: Boolean;
};

function RouteComponent() {
  const { disease } = Route.useParams() as { disease: keyof DiseaseInputs };
  const { session_id } = Route.useSearch() as {
    session_id: string | undefined;
  };
  const { history } = Route.useRouteContext() as {
    history: {
      prediction: string;
      recommendation: string;
      messages: UserChat[];
      input_data: FormData;
    } | null;
  };

  const { showNotification } = useNotification();

  const chatInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState<FormData>(history?.input_data || {});
  const [clickedButton, setClickedButton] = useState<"predict" | "recommend">(
    "predict"
  );
  const [prediction, setPrediction] = useState<string>(
    history?.prediction || ""
  );
  const [recommendation, setRecommendation] = useState<string>(
    history?.recommendation || ""
  );
  const [isPredicting, setIsPredicting] = useState(false);
  const [isRecommending, setIsRecommending] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const defaultMessage = [
    {
      user: false,
      message: "Hello! I'm your health assistant. How can I help you today?",
    },
  ];
  const [chats, setChats] = useState<UserChat[]>(
    history?.messages || defaultMessage
  );

  useEffect(() => {
    if (!session_id) {
      const sessionId = generateUUID();
      localStorage.setItem("sessionId", sessionId);
    } else {
      localStorage.setItem("sessionId", session_id);
    }
  }, [session_id]);

  useEffect(() => {
    // scroll to bottom of the chat every time chats change
    scrollToElement("chat-bottom");
  }, [chats]);

  useEffect(() => {
    // scroll down window to prediction box whenever prediction changes
    if (prediction) scrollToElement("prediction");
  }, [prediction]);

  useEffect(() => {
    // scroll down window to recommendation box whenever recommendation changes
    scrollToElement("recommendation");
  }, [recommendation]);

  const scrollToElement = (targetElementId: string) => {
    const targetElement = document.getElementById(
      targetElementId
    ) as HTMLDivElement;
    targetElement?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrediction = async (formbody: FormData) => {
    setIsPredicting(true);
    try {
      const response = await api.post(`/api/predict/${disease}`, formbody);
      const data = response.data;
      setPrediction(data.prediction);
    } catch (error) {
      setPrediction(
        ((error as AxiosError).response?.data as { error: string })?.error ||
          (error as AxiosError).message
      );
      showNotification("Error predicting disease", "error");
    } finally {
      setIsPredicting(false);
    }
  };

  const handleRecommendation = async (formbody: FormData) => {
    setIsRecommending(true);
    try {
      const {
        data: { prediction },
      } = await api.post(`/api/predict/${disease}`, formbody); // first get the prediction from this api route
      const response = await api.post(`/api/recommend/${disease}`, {
        ...formbody,
        prediction, // use the prediction as request payload
      });
      const data = response.data;
      setRecommendation(data.recommendations);
    } catch (error) {
      setRecommendation(
        ((error as AxiosError).response?.data as { error: string })?.error ||
          (error as AxiosError).message
      );
      showNotification("Error generating recommendations", "error");
    } finally {
      setIsRecommending(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const body = diseaseInputs[disease].map((obj) => {
      const input = formData[obj.name];
      const isNumber = obj.type == "number";
      return [obj.name, !isNumber && !input ? "0" : input];
    });
    const formBody: FormData = Object.fromEntries(body);

    if (clickedButton == "predict") handlePrediction(formBody);
    else handleRecommendation(formBody);
  };

  const handleSend = async () => {
    if (chats.find((obj) => obj.loading)) return; // return if ai is responding

    const input = chatInputRef.current as HTMLInputElement;
    const message = input.value.trim();

    if (!message) return; // return if it's an empty message

    input.value = "";
    setChats((prev) => [
      ...prev,
      { user: true, message },
      { user: false, message: "", loading: true },
    ]);

    try {
      const body = localStorage.getItem("sessionId")
        ? { message }
        : { messages: [...chats, { user: true, message }] };
      const { data } = await api.post(`/api/chat/${disease}`, {
        ...body,
        form_data: formData,
        prediction: prediction,
        recommendation: recommendation,
      });
      // find and replace the loading message with ai response
      setChats((prev) =>
        prev.map((obj) =>
          obj.loading ? { ...obj, loading: false, message: data.message } : obj
        )
      );
    } catch (error) {
      const errorMessage =
        ((error as AxiosError).response?.data as { error: string })?.error ||
        (error as AxiosError).message;
      // find and replace the loading message with error response
      setChats((prev) => prev.filter((obj) => !obj.loading));
      showNotification(errorMessage, "error");
    }
  };

  if (!disease || !diseaseInputs[disease]) {
    return <div>Invalid disease selected: {disease}</div>;
  }

  const renderInput = (input: any) => {
    const Icon = input.icon;
    const baseInputClasses =
      "w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200";
    const labelClasses = "block text-lg font-medium text-gray-700 mb-2";
    const inputGroupClasses =
      "bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 relative h-full";

    switch (input.type) {
      case "switch":
        return (
          <div className={inputGroupClasses}>
            <label className="flex items-center justify-between">
              <span className={labelClasses}>{input.label}</span>
              <div className="relative cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData[input.name] === "1"}
                  onChange={(e) =>
                    handleInputChange(input.name, e.target.checked ? "1" : "0")
                  }
                  className="sr-only"
                />
                <div
                  className={`w-14 h-7 rounded-full peer ${
                    formData[input.name] == "1" ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-all duration-200 ${
                      formData[input.name] === "1" ? "translate-x-7" : ""
                    }`}
                  ></div>
                </div>
              </div>
            </label>
          </div>
        );

      case "checkbox":
        return (
          <div className={inputGroupClasses}>
            <label className="flex items-center justify-between">
              <span className={labelClasses}>{input.label}</span>
              <input
                type="checkbox"
                checked={formData[input.name] === "1"}
                onChange={(e) =>
                  handleInputChange(input.name, e.target.checked ? "1" : "0")
                }
                className="w-6 h-6 text-blue-600 rounded-lg border-2 border-gray-300 focus:ring-blue-500"
              />
            </label>
          </div>
        );

      default:
        return (
          <div className={inputGroupClasses}>
            <label className={labelClasses}>{input.label}</label>
            <div className="relative">
              <Icon className="h-6 w-6 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={input.type}
                min={input.min}
                max={input.max}
                step={input.step}
                value={formData[input.name] || ""}
                onChange={(e) => handleInputChange(input.name, e.target.value)}
                className={`${baseInputClasses} ps-11 pr-12`}
                placeholder={`Enter ${input.label.toLowerCase()}`}
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                {input.unit && (
                  <span className="ml-1 text-gray-500 text-sm">
                    {input.unit}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  const formColors = {
    liver: "from-amber-50 to-orange-50",
    lung: "from-blue-50 to-cyan-50",
    diabetes: "from-purple-50 to-pink-50",
    parkinsons: "from-red-50 to-rose-50",
    heart: "from-emerald-50 to-green-50",
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${formColors[disease]} py-12 px-4 sm:px-6 lg:px-8`}
    >
      <form
        onSubmit={handleFormSubmit}
        className={`max-w-6xl mx-auto transition-all duration-300 ${isChatOpen ? "lg:mr-[500px]" : ""}`}
      >
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-8">
          <span className="text-3xl relative bottom-1 right-1">
            {emojis[disease]}
          </span>
          {disease.charAt(0).toUpperCase() + disease.slice(1)} Disease
          Prediction 
        </h2>

        <div
          className={`grid grid-cols-1 ${isChatOpen ? "md:px-4" : "md:grid-cols-2"} gap-6`}
        >
          {diseaseInputs[disease].map((input) => (
            <div key={input.name}>{renderInput(input)}</div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-6 mt-12">
          <button
            type="submit"
            disabled={isPredicting}
            onClick={() => setClickedButton("predict")}
            className="w-full max-w-md bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isPredicting ? (
              <>
                <Loader2 className="animate-spin mr-3 h-6 w-6" />
                Analyzing...
              </>
            ) : (
              "Get Prediction"
            )}
          </button>

          {prediction && (
            <div
              id="prediction"
              className="w-full bg-white rounded-xl p-8 shadow-lg"
            >
              <h3 className="text-2xl font-semibold mb-4">
                Prediction Results
              </h3>
              <div className="prose max-w-none capitalize">
                <span className="font-medium mr-1.5">{disease} disease:</span>
                <span
                  className={`${prediction === "Positive" ? "text-red-500" : "text-green-500"} font-bold`}
                >
                  {prediction}
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isRecommending}
            onClick={() => setClickedButton("recommend")}
            className="w-full max-w-md bg-emerald-600 text-white px-8 py-4 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isRecommending ? (
              <>
                <Loader2 className="animate-spin mr-3 h-6 w-6" />
                Generating Recommendations...
              </>
            ) : (
              "Get Recommendations"
            )}
          </button>
        </div>

        {recommendation && (
          <div
            id="recommendation"
            className="mt-8 bg-white rounded-xl p-8 shadow-lg"
          >
            <h3 className="text-2xl font-semibold mb-4">Recommendations</h3>
            <div className="prose max-w-none">
              <ReactMarkdown>{recommendation}</ReactMarkdown>
            </div>
          </div>
        )}
      </form>

      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      <div
        className={`
        fixed top-0 right-0 z-40 w-full lg:w-[500px] h-full bg-white shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${isChatOpen ? "translate-x-0" : "translate-x-full"}
      `}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 py-3.5 border-b flex justify-between items-center bg-blue-600 text-white">
            <h3 className="text-lg font-semibold">Health Assistant</h3>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto hide-scrollbar p-4 bg-gray-50">
            {chats.map((obj, i) => (
              <div
                key={i}
                className={`bg-white rounded-lg p-3 shadow-sm mb-4 w-max ${obj.user ? "max-w-8/12 ml-auto" : "max-w-10/12"}`}
              >
                {obj.loading ? (
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 bg-gray-500/80 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-500/90 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-500/70 rounded-full animate-bounce"
                      style={{ animationDelay: "600ms" }}
                    ></div>
                  </div>
                ) : (
                  <div className="prose max-w-none">
                    <ReactMarkdown>{obj.message}</ReactMarkdown>
                  </div>
                )}
              </div>
            ))}
            <div id="chat-bottom"></div>
          </div>

          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <input
                ref={chatInputRef}
                type="text"
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSend();
                  }
                }}
              />
              <button
                onClick={handleSend}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {chats.find((obj) => obj.loading) ? (
                  <Loader2 className="animate-spin mx-auto h-6 w-6" />
                ) : (
                  "Send"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
