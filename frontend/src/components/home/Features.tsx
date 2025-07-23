import { features } from "@/data/content";

const Features: React.FC = () => {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Advanced Features
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Our platform combines cutting-edge AI technology to deliver health predictions and insights.
          </p>
        </div>

        <div className="gap-8 flex flex-col lg:flex-row justify-center">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="bg-blue-50 rounded-xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1"
            >
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-700">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
