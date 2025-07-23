import { steps } from "@/data/content";

const HowItWorks: React.FC = () => {
  return (
    <section
      id="how-it-works"
      className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Our simple 3-step process makes disease prediction accessible and
            straightforward.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="flex flex-col md:flex-row items-center mb-12 last:mb-0"
            >
              <div className="md:w-1/3 flex justify-center md:justify-end mb-6 md:mb-0">
                <div className="relative">
                  <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center shadow-md z-10 relative">
                    <step.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-20 left-1/2 transform -translate-x-1/2 w-1 h-24 bg-blue-200"></div>
                  )}
                </div>
              </div>
              <div className="md:w-2/3 md:pl-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-700">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
