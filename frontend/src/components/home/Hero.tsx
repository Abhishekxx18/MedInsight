import { ArrowRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export default function Hero() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate({ to: "/disease-selection" });
  };

  return (
    <div
      className="relative min-h-screen bg-center bg-cover flex items-center justify-center"
      style={{
        backgroundImage:
          'url("https://www.shutterstock.com/image-photo/medical-technology-futuristic-conceptdigital-healthcare-600nw-2296404985.jpg")',
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
            <span className="block">Predict Health Issues</span>
            <span className="block text-emerald-400">Before They Happen</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8">
            Our AI-powered disease prediction service helps identify potential
            health risks early, giving you and your healthcare providers the
            insights needed for preventive care.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-md font-medium transition-colors duration-300 flex items-center justify-center"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-md font-medium transition-colors duration-300">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
