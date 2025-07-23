import { useState } from "react";
import { testimonials } from "@/data/content";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const Testimonials: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevTestimonial = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What People Say
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Hear from healthcare professionals and patients who have experienced
            the benefits of our service.
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative">
          <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 relative">
            <Quote className="absolute top-8 left-8 h-12 w-12 text-blue-100" />

            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/3 mb-6 md:mb-0 flex justify-center">
                <img
                  src={testimonials[activeIndex].avatar}
                  alt={testimonials[activeIndex].name}
                  className="w-24 h-24 object-cover rounded-full border-4 border-blue-50"
                />
              </div>
              <div className="md:w-2/3">
                <p className="text-gray-700 italic mb-6">
                  {testimonials[activeIndex].content}
                </p>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">
                    {testimonials[activeIndex].name}
                  </h4>
                  <p className="text-blue-600">
                    {testimonials[activeIndex].role}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-8 space-x-4">
            <button
              onClick={prevTestimonial}
              className="w-10 h-10 rounded-full bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors duration-300"
            >
              <ChevronLeft className="h-5 w-5 text-blue-600" />
            </button>
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    index === activeIndex
                      ? "bg-blue-600"
                      : "bg-blue-200 hover:bg-blue-300"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            <button
              onClick={nextTestimonial}
              className="w-10 h-10 rounded-full bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors duration-300"
            >
              <ChevronRight className="h-5 w-5 text-blue-600" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
