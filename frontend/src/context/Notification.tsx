import { createContext, useContext, useEffect, useState } from "react";

interface NotificationContextType {
  showNotification: (
    message: string,
    type: "success" | "error" | "info"
  ) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within an NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [message, setMessage] = useState<string>("");
  const [type, setType] = useState<"success" | "error" | "info">("info");

  const colors = {
    success: "bg-emerald-100 text-emerald-800 border-emerald-300",
    error: "bg-red-100 text-red-800 border-red-300",
    info: "bg-blue-100 text-blue-800 border-blue-300",
  };
  const color = colors[type];

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    if (message) {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        setMessage("");
      }, 3000);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [message]);

  const showNotification = (
    message: string = "",
    type: "success" | "error" | "info"
  ) => {
    if (!message) return;
    setMessage(message);
    setType(type);
  };

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
      }}
    >
      {children}

      <div
        className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg border shadow-lg flex items-center gap-2 ${color} min-w-sm cursor-pointer ${message ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
        role="alert"
        onClick={() => setMessage("")}
      >
        <span className="mx-auto font-semibold">{message}</span>
      </div>
    </NotificationContext.Provider>
  );
};
